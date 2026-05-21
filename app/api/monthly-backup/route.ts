import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const resend = new Resend(process.env.RESEND_API_KEY!)

  const { data: usersData, error: usersError } =
    await supabase.auth.admin.listUsers()

  if (usersError) {
    return NextResponse.json({ ok: false, error: usersError.message }, { status: 500 })
  }

  let sent = 0
  const errors: string[] = []

  for (const user of usersData.users) {
    if (!user.email) continue

    const { data: logs, error: logsError } = await supabase
      .from('procedures_log')
      .select('*')
      .eq('user_id', user.id)
      .order('procedure_date', { ascending: true })

    if (logsError) {
      errors.push(`${user.email}: ${logsError.message}`)
      continue
    }

    if (!logs || logs.length === 0) continue

    const residentName =
      logs[0]?.resident_name ||
      user.user_metadata?.full_name ||
      user.email

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    pdf.setFontSize(18)
    pdf.text('La Riffobitácora', 105, 18, { align: 'center' })

    pdf.setFontSize(10)
    pdf.text(`Residente: ${residentName}`, 14, 28)
    pdf.text(`Correo: ${user.email}`, 14, 34)
    pdf.text(`Respaldo generado: ${new Date().toLocaleDateString('es-CL')}`, 14, 40)

    autoTable(pdf, {
      startY: 48,
      head: [['Fecha', 'Procedimiento', 'Modalidad', 'Tutor', 'Comentarios']],
      body: logs.map((item: any) => [
        item.procedure_date || '',
        item.procedure_name || '',
        item.mode || '',
        item.tutor || '',
        item.comments || ''
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [15, 23, 42]
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 48 },
        2: { cellWidth: 24 },
        3: { cellWidth: 34 },
        4: { cellWidth: 58 }
      },
      margin: { left: 10, right: 10 }
    })

    const finalY = (pdf as any).lastAutoTable?.finalY || 250

    pdf.text('Firma docente a cargo:', 14, finalY + 16)
    pdf.line(14, finalY + 26, 95, finalY + 26)

    const pdfBase64 = Buffer.from(
      pdf.output('arraybuffer')
    ).toString('base64')

    const { error: emailError } = await resend.emails.send({
      from: 'La Riffobitácora <onboarding@resend.dev>',
      to: user.email,
      subject: 'Respaldo mensual de La Riffobitácora',
      html: `
        <p>Hola ${residentName},</p>
        <p>Adjuntamos tu respaldo mensual de procedimientos registrados en La Riffobitácora.</p>
        <p>Este correo fue generado automáticamente.</p>
      `,
      attachments: [
        {
          filename: 'La-Riffobitacora-respaldo-mensual.pdf',
          content: pdfBase64
        }
      ]
    })

    if (emailError) {
      errors.push(`${user.email}: ${emailError.message}`)
      continue
    }

    sent++
  }

  return NextResponse.json({
    ok: true,
    sent,
    errors
  })
}
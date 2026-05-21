import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const resend = new Resend(
    process.env.RESEND_API_KEY!
  )

  const { data, error } = await supabase
    .from('procedures_log')
    .select('*')
    .order('resident_name', { ascending: true })
    .order('procedure_date', { ascending: true })

  if (error) {
    return NextResponse.json({
      ok: false,
      error: error.message
    })
  }

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  pdf.setFontSize(20)

  pdf.text(
    'La Riffobitácora - Respaldo Global',
    148,
    18,
    { align: 'center' }
  )

  pdf.setFontSize(10)

  pdf.text(
    `Generado: ${new Date().toLocaleDateString('es-CL')}`,
    14,
    28
  )

  autoTable(pdf, {
    startY: 36,

    head: [[
      'Residente',
      'Fecha',
      'Procedimiento',
      'Modalidad',
      'Tutor',
      'Comentarios'
    ]],

    body: (data || []).map((item: any) => [
      item.resident_name || '',
      item.procedure_date || '',
      item.procedure_name || '',
      item.mode || '',
      item.tutor || '',
      item.comments || ''
    ]),

    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: 'linebreak'
    },

    headStyles: {
      fillColor: [15, 23, 42]
    },

    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 22 },
      2: { cellWidth: 50 },
      3: { cellWidth: 22 },
      4: { cellWidth: 35 },
      5: { cellWidth: 90 }
    },

    margin: {
      left: 10,
      right: 10
    }
  })

  const pdfBase64 = Buffer.from(
    pdf.output('arraybuffer')
  ).toString('base64')

  const { error: emailError } =
    await resend.emails.send({
      from: 'La Riffobitácora <onboarding@resend.dev>',

      to: 'isotoriquelme@gmail.com',

      subject:
        'Respaldo mensual global - La Riffobitácora',

      html: `
        <p>Adjuntamos respaldo global mensual de La Riffobitácora.</p>
      `,

      attachments: [
        {
          filename:
            'La-Riffobitacora-respaldo-global.pdf',

          content: pdfBase64
        }
      ]
    })

  if (emailError) {
    return NextResponse.json({
      ok: false,
      error: emailError.message
    })
  }

  return NextResponse.json({
    ok: true,
    total_procedures: data?.length || 0
  })
}
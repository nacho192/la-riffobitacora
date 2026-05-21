import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import * as XLSX from 'xlsx'

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

  const formatted = (data || []).map((item: any) => ({
    Residente: item.resident_name || '',
    Año: item.year || '',
    Rotación: item.rotation || '',
    Fecha: item.procedure_date || '',
    Categoría: item.category || '',
    Procedimiento: item.procedure_name || '',
    Modalidad: item.mode || '',
    Tutor: item.tutor || '',
    Comentarios: item.comments || '',
    'Notas privadas': item.private_notes || ''
  }))

  const workbook = XLSX.utils.book_new()

  const worksheet = XLSX.utils.json_to_sheet(
    formatted
  )

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Procedimientos'
  )

  const excelBuffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx'
  })

  const excelBase64 =
    Buffer.from(excelBuffer).toString('base64')

  const { error: emailError } =
    await resend.emails.send({
      from:
        'La Riffobitácora <onboarding@resend.dev>',

      to: 'isotoriquelme@gmail.com',

      subject:
        'Respaldo mensual global - La Riffobitácora',

      html: `
        <p>Adjuntamos respaldo global mensual en Excel.</p>
      `,

      attachments: [
        {
          filename:
            'La-Riffobitacora-respaldo-global.xlsx',

          content: excelBase64
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
    total_procedures:
      data?.length || 0
  })
}
'use client'

import { useRef, useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageOrientation,
  TableLayoutType
} from 'docx'

import { supabase } from '@/lib/supabase'

const TABLE_WIDTH = 14400

export default function ExportarPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const lastPress = useRef(0)

  async function getData() {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Debes iniciar sesión')
      window.location.href = '/login'
      return null
    }

    const { data, error } = await supabase
      .from('procedures_log')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: true })
      .order('procedure_date', { ascending: true })

    if (error) {
      alert(error.message)
      return null
    }

    return {
      data,
      user
    }
  }

  async function exportPDF() {
    setLoading(true)

    const result = await getData()

    if (!result) {
      setLoading(false)
      return
    }

    const { data, user } = result

    const residentName =
      data?.[0]?.resident_name ||
      user.user_metadata?.full_name ||
      user.email ||
      ''

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    doc.setFontSize(20)

    doc.text('La Riffobitácora', 105, 18, {
      align: 'center'
    })

    doc.setFontSize(11)

    doc.text(
      `Residente: ${residentName}`,
      14,
      28
    )

    const body = (data || []).map((item: any) => [
      item.procedure_date || '',
      item.procedure_name || '',
      item.mode || '',
      item.tutor || '',
      item.comments || ''
    ])

    autoTable(doc, {
      startY: 35,

      head: [[
        'Fecha',
        'Procedimiento',
        'Modalidad',
        'Tutor',
        'Comentarios'
      ]],

      body,

      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        valign: 'middle'
      },

      headStyles: {
        fillColor: [30, 41, 59]
      },

      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 45 },
        2: { cellWidth: 22 },
        3: { cellWidth: 35 },
        4: { cellWidth: 60 }
      },

      margin: {
        left: 10,
        right: 10
      }
    })

    const finalY =
      (doc as any).lastAutoTable.finalY || 200

    doc.text(
      'Firma docente a cargo:',
      14,
      finalY + 20
    )

    doc.line(
      14,
      finalY + 32,
      90,
      finalY + 32
    )

    doc.save('La-Riffobitacora.pdf')

    setStatus('PDF generado')
    setLoading(false)
  }

  async function exportWord() {
    setLoading(true)

    const result = await getData()

    if (!result) {
      setLoading(false)
      return
    }

    const { data, user } = result

    const residentName =
      data?.[0]?.resident_name ||
      user.user_metadata?.full_name ||
      user.email ||
      ''

    const children: any[] = []

    children.push(
      new Paragraph({
        text: 'La Riffobitácora',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER
      }),

      new Paragraph({
        text: 'Bitácora de procedimientos - Residencia de Fisiatría UDD',
        alignment: AlignmentType.CENTER
      }),

      new Paragraph({
        text: `Residente: ${residentName}`
      }),

      new Paragraph({ text: '' })
    )

    const rows = [
      new TableRow({
        children: [
          headerCell('Fecha', 1500),
          headerCell('Procedimiento', 3600),
          headerCell('Modalidad', 1500),
          headerCell('Tutor', 2600),
          headerCell('Comentarios', 5200)
        ]
      }),

      ...(data || []).map((item: any) =>
        new TableRow({
          children: [
            cell(item.procedure_date || '', 1500),
            cell(item.procedure_name || '', 3600),
            cell(item.mode || '', 1500),
            cell(item.tutor || '', 2600),
            cell(item.comments || '', 5200)
          ]
        })
      )
    ]

    children.push(
      new Table({
        layout: TableLayoutType.FIXED,

        width: {
          size: TABLE_WIDTH,
          type: WidthType.DXA
        },

        rows
      }),

      new Paragraph({ text: '' }),

      new Paragraph({
        text: 'Firma docente a cargo:'
      }),

      new Paragraph({ text: '' }),

      new Paragraph({
        text: '________________________________________'
      })
    )

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: PageOrientation.PORTRAIT
              },

              margin: {
                top: 700,
                right: 700,
                bottom: 700,
                left: 700
              }
            }
          },

          children
        }
      ]
    })

    const blob = await Packer.toBlob(doc)

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = url
    link.download = 'La-Riffobitacora.docx'

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)

    URL.revokeObjectURL(url)

    setStatus('Word generado')
    setLoading(false)
  }

  function safePress(
    fn: () => void | Promise<void>
  ) {
    const now = Date.now()

    if (now - lastPress.current < 1200) return

    lastPress.current = now

    fn()
  }

  return (
    <main className="min-h-screen pb-28 bg-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Exportar
            </h1>

            <p className="text-slate-700 mt-2">
              Exporta tu bitácora en Word o PDF.
            </p>
          </div>

          <button
            type="button"
            onClick={() => safePress(exportWord)}
            onTouchStart={() => safePress(exportWord)}
            className="w-full bg-slate-900 text-white rounded-2xl p-5 text-xl font-semibold"
          >
            Exportar Word
          </button>

          <button
            type="button"
            onClick={() => safePress(exportPDF)}
            onTouchStart={() => safePress(exportPDF)}
            className="w-full bg-red-700 text-white rounded-2xl p-5 text-xl font-semibold"
          >
            Exportar PDF
          </button>

          {status && (
            <p className="text-slate-700 text-sm">
              {status}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

function headerCell(text: string, width: number) {
  return new TableCell({
    width: {
      size: width,
      type: WidthType.DXA
    },

    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            size: 18
          })
        ]
      })
    ]
  })
}

function cell(text: string, width: number) {
  return new TableCell({
    width: {
      size: width,
      type: WidthType.DXA
    },

    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            size: 16
          })
        ]
      })
    ]
  })
}
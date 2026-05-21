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
  AlignmentType,
  PageOrientation,
  TableLayoutType,
  ImageRun
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

  async function loadLogo() {
    const response = await fetch('/logo.jpg')
    return await response.arrayBuffer()
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

    try {
      const logoResponse = await fetch('/logo.jpg')
      const logoBlob = await logoResponse.blob()

      const reader = new FileReader()

      reader.onloadend = () => {
        const base64data = reader.result as string

        doc.addImage(
          base64data,
          'JPEG',
          160,
          10,
          35,
          35
        )

        buildPdfContent(doc, data, residentName)
      }

      reader.readAsDataURL(logoBlob)
    } catch {
      buildPdfContent(doc, data, residentName)
    }
  }

  function buildPdfContent(
    doc: jsPDF,
    data: any[],
    residentName: string
  ) {
    doc.setFontSize(20)

    doc.text(
      'Bitácora de Procedimientos',
      14,
      20
    )

    doc.setFontSize(12)

    doc.text(
      'Medicina Física y Rehabilitación',
      14,
      28
    )

    doc.setFontSize(10)

    doc.text(
      `Residente: ${residentName}`,
      14,
      40
    )

    autoTable(doc, {
      startY: 48,

      head: [[
        'Fecha',
        'Procedimiento',
        'Modalidad',
        'Tutor',
        'Comentarios'
      ]],

      body: (data || []).map((item: any) => [
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

    doc.save('Bitacora-de-Procedimientos.pdf')

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

    const logoBuffer = await loadLogo()

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

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: PageOrientation.PORTRAIT
              }
            }
          },

          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Bitácora de Procedimientos',
                  bold: true,
                  size: 34
                })
              ]
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Medicina Física y Rehabilitación',
                  size: 24
                })
              ]
            }),

            new Paragraph({
              alignment: AlignmentType.RIGHT,

              children: [
              new ImageRun({
  type: 'jpg',
  data: logoBuffer,
  transformation: {
    width: 120,
    height: 120
  }
})

            new Paragraph({
              text: `Residente: ${residentName}`
            }),

            new Paragraph({ text: '' }),

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
          ]
        }
      ]
    })

    const blob = await Packer.toBlob(doc)

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = url
    link.download = 'Bitacora-de-Procedimientos.docx'

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
            className="w-full bg-slate-900 text-white rounded-2xl p-5 text-xl font-semibold"
          >
            Exportar Word
          </button>

          <button
            type="button"
            onClick={() => safePress(exportPDF)}
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
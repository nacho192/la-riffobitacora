'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
  HeadingLevel,
  ImageRun
} from 'docx'

export default function ExportarPage() {
  const [data, setData] = useState<any[]>([])
  const [residentName, setResidentName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    setResidentName(
      user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email ||
        ''
    )

    const { data, error } = await supabase
      .from('procedures_log')
      .select('*')
      .eq('user_id', user.id)
      .order('procedure_date', { ascending: false })

    if (error) {
      alert(error.message)
      return
    }

    setData(data || [])
    setLoading(false)
  }

  async function loadLogo() {
    try {
      const response = await fetch('/logo.jpg')
      return await response.arrayBuffer()
    } catch {
      return null
    }
  }

  async function exportWord() {
    const logoBuffer = await loadLogo()

    const doc = new Document({
      sections: [
        {
          children: [
            ...(logoBuffer
              ? [
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
                    ]
                  })
                ]
              : []),

            new Paragraph({
              alignment: AlignmentType.CENTER,
              heading: HeadingLevel.TITLE,
              children: [
                new TextRun({
                  text: 'Bitácora de Procedimientos',
                  bold: true,
                  size: 36
                })
              ]
            }),

            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Medicina Física y Rehabilitación',
                  italics: true,
                  size: 28
                })
              ]
            }),

            new Paragraph({
              text: `Residente: ${residentName}`
            }),

            new Paragraph({
              text: `Fecha de exportación: ${new Date().toLocaleDateString('es-CL')}`
            }),

            new Paragraph({
              text: ''
            }),

            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE
              },

              rows: [
                new TableRow({
                  children: [
                    'Fecha',
                    'Procedimiento',
                    'Categoría',
                    'Modalidad',
                    'Tutor',
                    'Rotación',
                    'Comentarios'
                  ].map(
                    (header) =>
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: header,
                                bold: true
                              })
                            ]
                          })
                        ]
                      })
                  )
                }),

                ...data.map(
                  (item) =>
                    new TableRow({
                      children: [
                        item.procedure_date || '',
                        item.procedure_name || '',
                        item.category || '',
                        item.mode || '',
                        item.tutor || '',
                        item.rotation || '',
                        item.comments || ''
                      ].map(
                        (value) =>
                          new TableCell({
                            children: [
                              new Paragraph(String(value))
                            ]
                          })
                      )
                    })
                )
              ]
            }),

            new Paragraph({
              text: ''
            }),

            new Paragraph({
              text: 'Firma docente a cargo:'
            }),

            new Paragraph({
              text: ''
            }),

            new Paragraph({
              text: '________________________________________'
            })
          ]
        }
      ]
    })

    const blob = await Packer.toBlob(doc)

    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'Bitacora-de-Procedimientos.docx'

    document.body.appendChild(a)
    a.click()

    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  async function exportPDF() {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    try {
      const response = await fetch('/logo.jpg')
      const blob = await response.blob()

      const reader = new FileReader()

      reader.onloadend = function () {
        const base64data = reader.result as string

        doc.addImage(
          base64data,
          'JPEG',
          160,
          10,
          30,
          30
        )

        finalizePdf(doc)
      }

      reader.readAsDataURL(blob)
    } catch {
      finalizePdf(doc)
    }
  }

  function finalizePdf(doc: jsPDF) {
    doc.setFontSize(20)

    doc.text(
      'Bitácora de Procedimientos',
      105,
      18,
      {
        align: 'center'
      }
    )

    doc.setFontSize(13)

    doc.text(
      'Medicina Física y Rehabilitación',
      105,
      26,
      {
        align: 'center'
      }
    )

    doc.setFontSize(11)

    doc.text(
      `Residente: ${residentName}`,
      14,
      40
    )

    doc.text(
      `Fecha de exportación: ${new Date().toLocaleDateString('es-CL')}`,
      14,
      46
    )

    autoTable(doc, {
      startY: 54,

      head: [[
        'Fecha',
        'Procedimiento',
        'Categoría',
        'Modalidad',
        'Tutor',
        'Rotación',
        'Comentarios'
      ]],

      body: data.map((item) => [
        item.procedure_date || '',
        item.procedure_name || '',
        item.category || '',
        item.mode || '',
        item.tutor || '',
        item.rotation || '',
        item.comments || ''
      ]),

      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        valign: 'top'
      },

      headStyles: {
        fillColor: [15, 23, 42]
      },

      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 32 },
        2: { cellWidth: 24 },
        3: { cellWidth: 16 },
        4: { cellWidth: 24 },
        5: { cellWidth: 24 },
        6: { cellWidth: 40 }
      },

      margin: {
        left: 8,
        right: 8
      }
    })

    const finalY = (doc as any).lastAutoTable?.finalY || 170

    doc.text(
      'Firma docente a cargo:',
      14,
      finalY + 16
    )

    doc.line(
      14,
      finalY + 26,
      95,
      finalY + 26
    )

    doc.save('Bitacora-de-Procedimientos.pdf')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <p className="text-slate-900 text-lg font-semibold">
          Cargando...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-28 bg-slate-100 p-6 font-[Aptos,Inter,-apple-system,BlinkMacSystemFont,Segoe_UI,sans-serif]">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-950">
            Exportar
          </h1>

          <p className="text-slate-700 text-lg">
            Descarga tu bitácora en Word o PDF.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <button
            type="button"
            onClick={exportWord}
            className="w-full bg-slate-900 text-white rounded-2xl p-5 text-xl font-semibold"
          >
            Exportar a Word
          </button>

          <button
            type="button"
            onClick={exportPDF}
            className="w-full bg-red-700 text-white rounded-2xl p-5 text-xl font-semibold"
          >
            Exportar a PDF
          </button>

          <p className="text-sm text-slate-700 text-center pt-2">
            Para mejor compatibilidad se recomienda abrir el documento en computador
            o exportarlo como PDF.
          </p>
        </div>
      </div>
    </main>
  )
}
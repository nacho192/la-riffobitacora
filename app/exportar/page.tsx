'use client'

import { useEffect, useMemo, useState } from 'react'
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

  const [selectedYear, setSelectedYear] = useState('Todos')
  const [selectedRotation, setSelectedRotation] = useState('Todas')

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

  const availableYears = useMemo(() => {
    const years = data
      .map((item) => item.year)
      .filter(Boolean)
      .map(String)

    return ['Todos', ...Array.from(new Set(years))]
  }, [data])

  const availableRotations = useMemo(() => {
    const rotations = data
      .map((item) => item.rotation)
      .filter(Boolean)

    return ['Todas', ...Array.from(new Set(rotations))]
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const yearOk =
        selectedYear === 'Todos' ||
        String(item.year) === selectedYear

      const rotationOk =
        selectedRotation === 'Todas' ||
        item.rotation === selectedRotation

      return yearOk && rotationOk
    })
  }, [data, selectedYear, selectedRotation])

  function filterLabel() {
    const yearText =
      selectedYear === 'Todos'
        ? 'Todos los años'
        : `Año ${selectedYear}`

    const rotationText =
      selectedRotation === 'Todas'
        ? 'Todas las rotaciones'
        : selectedRotation

    return `${yearText} · ${rotationText}`
  }

  async function loadLogo() {
    try {
      const response = await fetch('/logo.png')
      return await response.arrayBuffer()
    } catch {
      return null
    }
  }

  async function exportWord() {
    if (filteredData.length === 0) {
      alert('No hay procedimientos para exportar con los filtros seleccionados')
      return
    }

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
                        type: 'png',
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
              text: `Filtro: ${filterLabel()}`
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
                  ].map((header) =>
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

                ...filteredData.map((item) =>
                  new TableRow({
                    children: [
                      item.procedure_date || '',
                      item.procedure_name || '',
                      item.category || '',
                      item.mode || '',
                      item.tutor || '',
                      item.rotation || '',
                      item.comments || ''
                    ].map((value) =>
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
    if (filteredData.length === 0) {
      alert('No hay procedimientos para exportar con los filtros seleccionados')
      return
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    try {
      const response = await fetch('/logo.png')
      const blob = await response.blob()

      const reader = new FileReader()

      reader.onloadend = function () {
        const base64data = reader.result as string

        doc.addImage(
          base64data,
          'PNG',
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

    doc.setFontSize(10)

    doc.text(
      `Residente: ${residentName}`,
      14,
      40
    )

    doc.text(
      `Filtro: ${filterLabel()}`,
      14,
      46
    )

    doc.text(
      `Fecha de exportación: ${new Date().toLocaleDateString('es-CL')}`,
      14,
      52
    )

    autoTable(doc, {
      startY: 60,

      head: [[
        'Fecha',
        'Procedimiento',
        'Categoría',
        'Modalidad',
        'Tutor',
        'Rotación',
        'Comentarios'
      ]],

      body: filteredData.map((item) => [
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
            Descarga tu bitácora completa o filtrada por año y rotación.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div>
            <label className="block mb-2 font-semibold text-slate-900 text-lg">
              Año
            </label>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year === 'Todos' ? 'Todos los años' : `Año ${year}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-slate-900 text-lg">
              Rotación
            </label>

            <select
              value={selectedRotation}
              onChange={(e) => setSelectedRotation(e.target.value)}
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
            >
              {availableRotations.map((rotation) => (
                <option key={rotation} value={rotation}>
                  {rotation === 'Todas' ? 'Todas las rotaciones' : rotation}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <p className="text-slate-900 font-semibold">
              Procedimientos a exportar: {filteredData.length}
            </p>

            <p className="text-slate-700 text-sm mt-1">
              {filterLabel()}
            </p>
          </div>

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
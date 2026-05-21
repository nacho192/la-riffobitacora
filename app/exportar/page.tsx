'use client'

import { useRef, useState } from 'react'
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

  async function handlePress() {
    const now = Date.now()
    if (now - lastPress.current < 1200) return
    lastPress.current = now
    await exportWord()
  }

  async function exportWord() {
    setLoading(true)
    setStatus('Generando documento...')

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Debes iniciar sesión')
      window.location.href = '/login'
      return
    }

    const { data, error } = await supabase
      .from('procedures_log')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: true })
      .order('procedure_date', { ascending: true })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    if (!data || data.length === 0) {
      alert('No hay procedimientos')
      setLoading(false)
      return
    }

    const residentName =
      data[0]?.resident_name ||
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

    const groupedByYear = groupBy(data, 'year')

    Object.keys(groupedByYear).forEach((year) => {
      children.push(
        new Paragraph({
          text: `Año ${year}`,
          heading: HeadingLevel.HEADING_1
        })
      )

      const groupedByRotation = groupBy(groupedByYear[year], 'rotation')

      Object.keys(groupedByRotation).forEach((rotation) => {
        children.push(
          new Paragraph({
            text: rotation,
            heading: HeadingLevel.HEADING_2
          })
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

          ...groupedByRotation[rotation].map((item: any) =>
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
          new Paragraph({ text: 'Firma docente a cargo:' }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '________________________________________' }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' })
        )
      })
    })

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: PageOrientation.LANDSCAPE
              },
              margin: {
                top: 500,
                right: 500,
                bottom: 500,
                left: 500
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

    setStatus('Documento generado')
    setLoading(false)
  }

  return (
    <main className="min-h-screen pb-28 bg-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Exportar Word
            </h1>

            <p className="text-slate-700 mt-2">
              Genera un documento editable con tabla fija ajustada a hoja carta horizontal.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePress}
            onTouchStart={handlePress}
            onPointerDown={handlePress}
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-2xl p-5 text-xl font-semibold"
          >
            {loading ? 'Generando...' : 'Exportar Word'}
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

function groupBy(array: any[], key: string) {
  return array.reduce((acc: any, item: any) => {
    const value = item[key] || 'Sin información'
    if (!acc[value]) acc[value] = []
    acc[value].push(item)
    return acc
  }, {})
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
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
  HeadingLevel
} from 'docx'
import { supabase } from '@/lib/supabase'

export default function ExportarPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const lastPress = useRef(0)

  async function handlePress() {
    const now = Date.now()

    if (now - lastPress.current < 1200) return

    lastPress.current = now
    setStatus('Generando Word...')

    await exportWord()
  }

  async function exportWord() {
    if (loading) return

    setLoading(true)

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
      setStatus(error.message)
      alert(error.message)
      setLoading(false)
      return
    }

    if (!data || data.length === 0) {
      setStatus('No hay procedimientos registrados')
      alert('No hay procedimientos registrados')
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
        heading: HeadingLevel.TITLE
      }),
      new Paragraph({
        text: 'Bitácora de procedimientos - Residencia de Fisiatría UDD'
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
              headerCell('Fecha'),
              headerCell('Categoría'),
              headerCell('Procedimiento'),
              headerCell('Modalidad'),
              headerCell('Tutor'),
              headerCell('Comentarios')
            ]
          }),

          ...groupedByRotation[rotation].map((item: any) =>
            new TableRow({
              children: [
                cell(item.procedure_date || ''),
                cell(item.category || ''),
                cell(item.procedure_name || ''),
                cell(item.mode || ''),
                cell(item.tutor || ''),
                cell(item.comments || '')
              ]
            })
          )
        ]

        children.push(
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            },
            rows
          }),
          new Paragraph({ text: '' }),
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
          children
        }
      ]
    })

    const blob = await Packer.toBlob(doc)

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'La-Riffobitacora.docx'
    link.style.display = 'none'

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
              Genera un documento editable con tablas por año y rotación.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePress}
            onTouchStart={handlePress}
            onPointerDown={handlePress}
            disabled={loading}
            className="relative z-50 w-full bg-slate-900 text-white rounded-2xl p-5 text-xl font-semibold text-center touch-manipulation active:scale-95"
          >
            {loading ? 'Generando documento...' : 'Exportar documento Word'}
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

    if (!acc[value]) {
      acc[value] = []
    }

    acc[value].push(item)

    return acc
  }, {})
}

function headerCell(text: string) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true
          })
        ]
      })
    ]
  })
}

function cell(text: string) {
  return new TableCell({
    children: [
      new Paragraph({
        text
      })
    ]
  })
}
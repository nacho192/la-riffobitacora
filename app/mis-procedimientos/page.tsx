'use client'

import { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '@/lib/supabase'

export default function MisProcedimientosPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [section, setSection] = useState<'saved' | 'new'>('saved')
  const [search, setSearch] = useState('')
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    title: '',
    category: '',
    technique: '',
    dose: '',
    materials: '',
    tips: '',
    reference_notes: '',
    is_favorite: false,
    image_url: ''
  })

  useEffect(() => {
    loadItems()
  }, [])

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  async function getUser() {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return null
    }

    return user
  }

  async function loadItems() {
    const user = await getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('personal_procedures')
      .select('*')
      .eq('user_id', user.id)
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    setItems(data || [])
    setLoading(false)
  }

  async function uploadImage(userId: string) {
    if (!imageFile) return ''

    const extension = imageFile.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${extension}`

    const { error } = await supabase.storage
      .from('personal-procedure-images')
      .upload(fileName, imageFile)

    if (error) {
      alert(error.message)
      return ''
    }

    const { data } = supabase.storage
      .from('personal-procedure-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  async function saveItem() {
    if (!form.title) {
      alert('Ingresa el nombre del procedimiento')
      return
    }

    setSaving(true)

    const user = await getUser()

    if (!user) {
      setSaving(false)
      return
    }

    const imageUrl = await uploadImage(user.id)

    const payload = {
      ...form,
      image_url: imageUrl || '',
      user_id: user.id,
      resident_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email
    }

    const { error } = await supabase
      .from('personal_procedures')
      .insert([payload])

    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    setForm({
      title: '',
      category: '',
      technique: '',
      dose: '',
      materials: '',
      tips: '',
      reference_notes: '',
      is_favorite: false,
      image_url: ''
    })

    setImageFile(null)
    setSection('saved')
    loadItems()
  }

  async function saveEdit() {
    if (!editing) return

    const { error } = await supabase
      .from('personal_procedures')
      .update({
        title: editing.title,
        category: editing.category,
        technique: editing.technique,
        dose: editing.dose,
        materials: editing.materials,
        tips: editing.tips,
        reference_notes: editing.reference_notes,
        is_favorite: editing.is_favorite
      })
      .eq('id', editing.id)

    if (error) {
      alert(error.message)
      return
    }

    setEditing(null)
    loadItems()
  }

  async function toggleFavorite(item: any) {
    const { error } = await supabase
      .from('personal_procedures')
      .update({
        is_favorite: !item.is_favorite
      })
      .eq('id', item.id)

    if (error) {
      alert(error.message)
      return
    }

    loadItems()
  }

  async function deleteItem(id: string) {
    const ok = confirm('¿Seguro que quieres borrar este procedimiento?')

    if (!ok) return

    const { error } = await supabase
      .from('personal_procedures')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    loadItems()
  }

  function exportPersonalPdf() {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    doc.setFontSize(18)
    doc.text('Mis procedimientos', 105, 18, { align: 'center' })

    doc.setFontSize(10)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, 14, 28)

    autoTable(doc, {
      startY: 35,
      head: [[
        'Procedimiento',
        'Categoría',
        'Técnica',
        'Dosis',
        'Materiales',
        'Tips'
      ]],
      body: filteredItems.map((item) => [
        item.title || '',
        item.category || '',
        item.technique || '',
        item.dose || '',
        item.materials || '',
        item.tips || ''
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
        0: { cellWidth: 32 },
        1: { cellWidth: 25 },
        2: { cellWidth: 45 },
        3: { cellWidth: 25 },
        4: { cellWidth: 35 },
        5: { cellWidth: 35 }
      },
      margin: {
        left: 8,
        right: 8
      }
    })

    doc.save('Mis-procedimientos.pdf')
  }

  const filteredItems = items.filter((item) => {
    const text = `
      ${item.title || ''}
      ${item.category || ''}
      ${item.technique || ''}
      ${item.dose || ''}
      ${item.materials || ''}
      ${item.tips || ''}
      ${item.reference_notes || ''}
    `.toLowerCase()

    return text.includes(search.toLowerCase())
  })

  const groupedItems = filteredItems.reduce((acc: any, item: any) => {
    const category = item.category || 'Sin categoría'

    if (!acc[category]) {
      acc[category] = []
    }

    acc[category].push(item)

    return acc
  }, {})

  function toggleCategory(category: string) {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  return (
    <main className="min-h-screen pb-32 bg-slate-100 p-6 font-[Aptos,Inter,-apple-system,BlinkMacSystemFont,Segoe_UI,sans-serif]">
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-950">
            Mis procedimientos
          </h1>

          <p className="text-slate-700 text-lg">
            Biblioteca personal de técnicas, dosis, materiales, imágenes y tips.
          </p>
        </section>

        <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <label className="block mb-2 font-semibold text-slate-900 text-lg">
            Sección
          </label>

          <select
            value={section}
            onChange={(e) => setSection(e.target.value as 'saved' | 'new')}
            className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
          >
            <option value="saved">Mis procedimientos guardados</option>
            <option value="new">Agregar procedimiento</option>
          </select>
        </section>

        {section === 'new' && (
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-2xl font-bold text-slate-950 text-center">
              Agregar procedimiento personal
            </h2>

            <label className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <input
                type="checkbox"
                checked={form.is_favorite}
                onChange={(e) => updateField('is_favorite', e.target.checked)}
              />

              <span className="text-slate-900 font-semibold">
                Marcar como favorito ⭐
              </span>
            </label>

            <input
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Nombre del procedimiento"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <input
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              placeholder="Categoría"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <textarea
              value={form.technique}
              onChange={(e) => updateField('technique', e.target.value)}
              rows={4}
              placeholder="Técnica / pasos"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <textarea
              value={form.dose}
              onChange={(e) => updateField('dose', e.target.value)}
              rows={3}
              placeholder="Dosis"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <textarea
              value={form.materials}
              onChange={(e) => updateField('materials', e.target.value)}
              rows={3}
              placeholder="Materiales"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <textarea
              value={form.tips}
              onChange={(e) => updateField('tips', e.target.value)}
              rows={3}
              placeholder="Tips / consideraciones"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <textarea
              value={form.reference_notes}
              onChange={(e) => updateField('reference_notes', e.target.value)}
              rows={3}
              placeholder="Referencias / links / notas"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <div>
              <label className="block mb-2 font-semibold text-slate-900 text-lg">
                Imagen, ecografía o diagrama
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
              />
            </div>

            <button
              type="button"
              onClick={saveItem}
              disabled={saving}
              className="w-full bg-slate-900 text-white rounded-2xl p-5 text-xl font-semibold"
            >
              {saving ? 'Guardando...' : 'Guardar procedimiento'}
            </button>
          </section>
        )}

        {section === 'saved' && (
          <section className="space-y-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar procedimiento, técnica, material, dosis..."
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <button
              type="button"
              onClick={exportPersonalPdf}
              className="w-full bg-red-700 text-white rounded-2xl p-4 text-lg font-semibold"
            >
              Exportar mis procedimientos a PDF
            </button>

            {loading && (
              <p className="text-center text-slate-700">
                Cargando...
              </p>
            )}

            {!loading && filteredItems.length === 0 && (
              <p className="text-center text-slate-700">
                No hay procedimientos guardados que coincidan con la búsqueda.
              </p>
            )}

            {Object.keys(groupedItems).map((category) => {
              const isOpen = openCategories[category] ?? true

              return (
                <div
                  key={category}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="w-full flex justify-between items-center p-5 text-left"
                  >
                    <span className="text-xl font-bold text-slate-950">
                      {category}
                    </span>

                    <span className="text-slate-700">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 space-y-4">
                      {groupedItems[category].map((item: any) => (
                        <div
                          key={item.id}
                          className="rounded-3xl p-5 border border-slate-200 bg-slate-50 space-y-4"
                        >
                          <div className="flex justify-between gap-4">
                            <div>
                              <h3 className="text-2xl font-bold text-slate-950">
                                {item.is_favorite ? '⭐ ' : ''}
                                {item.title}
                              </h3>

                              {item.category && (
                                <p className="text-slate-700">
                                  {item.category}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleFavorite(item)}
                              className="text-2xl"
                            >
                              {item.is_favorite ? '⭐' : '☆'}
                            </button>
                          </div>

                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full rounded-2xl border border-slate-200"
                            />
                          )}

                          <Info title="Técnica" text={item.technique} />
                          <Info title="Dosis" text={item.dose} />
                          <Info title="Materiales" text={item.materials} />
                          <Info title="Tips" text={item.tips} />
                          <Info title="Referencias" text={item.reference_notes} />

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setEditing(item)}
                              className="bg-slate-200 text-slate-900 rounded-2xl p-3 font-semibold"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteItem(item.id)}
                              className="bg-red-100 text-red-800 rounded-2xl p-3 font-semibold"
                            >
                              Borrar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </section>
        )}

        {editing && (
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-2xl font-bold text-slate-950 text-center">
              Editar procedimiento
            </h2>

            <label className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <input
                type="checkbox"
                checked={editing.is_favorite || false}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    is_favorite: e.target.checked
                  })
                }
              />

              <span className="text-slate-900 font-semibold">
                Favorito ⭐
              </span>
            </label>

            <input
              value={editing.title || ''}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  title: e.target.value
                })
              }
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            />

            <input
              value={editing.category || ''}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  category: e.target.value
                })
              }
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            />

            <textarea
              value={editing.technique || ''}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  technique: e.target.value
                })
              }
              rows={4}
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            />

            <textarea
              value={editing.dose || ''}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  dose: e.target.value
                })
              }
              rows={3}
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            />

            <textarea
              value={editing.materials || ''}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  materials: e.target.value
                })
              }
              rows={3}
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            />

            <textarea
              value={editing.tips || ''}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  tips: e.target.value
                })
              }
              rows={3}
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            />

            <textarea
              value={editing.reference_notes || ''}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  reference_notes: e.target.value
                })
              }
              rows={3}
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={saveEdit}
                className="bg-slate-900 text-white rounded-2xl p-4 font-semibold"
              >
                Guardar
              </button>

              <button
                type="button"
                onClick={() => setEditing(null)}
                className="bg-slate-200 text-slate-900 rounded-2xl p-4 font-semibold"
              >
                Cancelar
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function Info({
  title,
  text
}: {
  title: string
  text?: string
}) {
  if (!text) return null

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200">
      <p className="text-sm font-bold text-slate-900 mb-1">
        {title}
      </p>

      <p className="text-slate-800 whitespace-pre-wrap">
        {text}
      </p>
    </div>
  )
}
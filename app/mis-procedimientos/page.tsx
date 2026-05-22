'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MisProcedimientosPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const [section, setSection] = useState<
    'saved' | 'new'
  >('saved')

  const [form, setForm] = useState({
    title: '',
    category: '',
    technique: '',
    dose: '',
    materials: '',
    tips: '',
    reference_notes: ''
  })

  useEffect(() => {
    loadItems()
  }, [])

  function updateField(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  async function loadItems() {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data, error } = await supabase
      .from('personal_procedures')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    setItems(data || [])
    setLoading(false)
  }

  async function saveItem() {
    if (!form.title) {
      alert('Ingresa el nombre del procedimiento')
      return
    }

    setSaving(true)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Debes iniciar sesión')
      setSaving(false)
      window.location.href = '/login'
      return
    }

    const payload = {
      ...form,
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
      reference_notes: ''
    })

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
        reference_notes: editing.reference_notes
      })
      .eq('id', editing.id)

    if (error) {
      alert(error.message)
      return
    }

    setEditing(null)
    loadItems()
  }

  async function deleteItem(id: string) {
    const ok = confirm(
      '¿Seguro que quieres borrar este procedimiento?'
    )

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

  return (
    <main className="min-h-screen pb-32 bg-slate-100 p-6 font-[Aptos,Inter,-apple-system,BlinkMacSystemFont,Segoe_UI,sans-serif]">
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-950">
            Mis procedimientos
          </h1>

          <p className="text-slate-700 text-lg">
            Biblioteca personal de técnicas, dosis y materiales.
          </p>
        </section>

        <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <label className="block mb-2 font-semibold text-slate-900 text-lg">
            Sección
          </label>

          <select
            value={section}
            onChange={(e) =>
              setSection(
                e.target.value as 'saved' | 'new'
              )
            }
            className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
          >
            <option value="saved">
              Mis procedimientos guardados
            </option>

            <option value="new">
              Agregar procedimiento
            </option>
          </select>
        </section>

        {section === 'new' && (
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-2xl font-bold text-slate-950 text-center">
              Agregar procedimiento personal
            </h2>

            <input
              value={form.title}
              onChange={(e) =>
                updateField('title', e.target.value)
              }
              placeholder="Nombre del procedimiento"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <input
              value={form.category}
              onChange={(e) =>
                updateField('category', e.target.value)
              }
              placeholder="Categoría"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <textarea
              value={form.technique}
              onChange={(e) =>
                updateField('technique', e.target.value)
              }
              rows={4}
              placeholder="Técnica / pasos"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <textarea
              value={form.dose}
              onChange={(e) =>
                updateField('dose', e.target.value)
              }
              rows={3}
              placeholder="Dosis"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <textarea
              value={form.materials}
              onChange={(e) =>
                updateField('materials', e.target.value)
              }
              rows={3}
              placeholder="Materiales"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <textarea
              value={form.tips}
              onChange={(e) =>
                updateField('tips', e.target.value)
              }
              rows={3}
              placeholder="Tips / consideraciones"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <textarea
              value={form.reference_notes}
              onChange={(e) =>
                updateField(
                  'reference_notes',
                  e.target.value
                )
              }
              rows={3}
              placeholder="Referencias / links / notas"
              className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-lg text-slate-950"
            />

            <button
              type="button"
              onClick={saveItem}
              disabled={saving}
              className="w-full bg-slate-900 text-white rounded-2xl p-5 text-xl font-semibold"
            >
              {saving
                ? 'Guardando...'
                : 'Guardar procedimiento'}
            </button>
          </section>
        )}

        {section === 'saved' && (
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-950 text-center">
              Procedimientos guardados
            </h2>

            {loading && (
              <p className="text-center text-slate-700">
                Cargando...
              </p>
            )}

            {!loading && items.length === 0 && (
              <p className="text-center text-slate-700">
                Aún no tienes procedimientos guardados.
              </p>
            )}

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4"
                >
                  <div>
                    <h3 className="text-2xl font-bold text-slate-950">
                      {item.title}
                    </h3>

                    {item.category && (
                      <p className="text-slate-700">
                        {item.category}
                      </p>
                    )}
                  </div>

                  <Info
                    title="Técnica"
                    text={item.technique}
                  />

                  <Info
                    title="Dosis"
                    text={item.dose}
                  />

                  <Info
                    title="Materiales"
                    text={item.materials}
                  />

                  <Info
                    title="Tips"
                    text={item.tips}
                  />

                  <Info
                    title="Referencias"
                    text={item.reference_notes}
                  />

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
                      onClick={() =>
                        deleteItem(item.id)
                      }
                      className="bg-red-100 text-red-800 rounded-2xl p-3 font-semibold"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {editing && (
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-2xl font-bold text-slate-950 text-center">
              Editar procedimiento
            </h2>

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
              value={
                editing.reference_notes || ''
              }
              onChange={(e) =>
                setEditing({
                  ...editing,
                  reference_notes:
                    e.target.value
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
                onClick={() =>
                  setEditing(null)
                }
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
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
      <p className="text-sm font-bold text-slate-900 mb-1">
        {title}
      </p>

      <p className="text-slate-800 whitespace-pre-wrap">
        {text}
      </p>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { procedures } from '@/lib/procedures'
import { rotations } from '@/lib/rotations'
import ProgressCard from '@/components/ProgressCard'

export default function DashboardPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [residentName, setResidentName] = useState('')
  const [editing, setEditing] = useState<any | null>(null)

  useEffect(() => {
    loadProcedures()
  }, [])

  async function loadProcedures() {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    setResidentName(
      user.user_metadata?.full_name ||
      user.email ||
      ''
    )

    const { data, error } = await supabase
      .from('procedures_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      alert(error.message)
      return
    }

    setLogs(data || [])
  }

  async function deleteProcedure(id: string) {
    const ok = confirm('¿Seguro que quieres borrar este procedimiento?')

    if (!ok) return

    const { error } = await supabase
      .from('procedures_log')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    loadProcedures()
  }

  async function saveEdit() {
    if (!editing) return

    const { error } = await supabase
      .from('procedures_log')
      .update({
        year: editing.year,
        rotation: editing.rotation,
        procedure_name: editing.procedure_name,
        category: editing.category,
        mode: editing.mode,
        procedure_date: editing.procedure_date,
        tutor: editing.tutor,
        comments: editing.comments
      })
      .eq('id', editing.id)

    if (error) {
      alert(error.message)
      return
    }

    setEditing(null)
    loadProcedures()
  }

  const logsSinAsiste = logs.filter((p) => p.mode !== 'Asiste')
  const total = logsSinAsiste.length
  const realizados = logsSinAsiste.filter((p) => p.mode === 'Realiza').length
  const observados = logsSinAsiste.filter((p) => p.mode === 'Observa').length

  return (
    <main className="min-h-screen pb-28 bg-slate-100 p-6 font-[Aptos,Inter,-apple-system,BlinkMacSystemFont,Segoe_UI,sans-serif]">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-slate-950">
            Estadísticas
          </h1>

          {residentName && (
            <p className="text-slate-700 mt-2">
              Residente: {residentName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Stat title="Total" value={total} />
          <Stat title="Realizados" value={realizados} />
          <Stat title="Observados" value={observados} />
        </div>

        {editing && (
          <div className="bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950 text-center">
              Editar procedimiento
            </h2>

            <select
              value={editing.year || 1}
              onChange={(e) =>
                setEditing({ ...editing, year: Number(e.target.value) })
              }
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            >
              <option value={1}>Primer año</option>
              <option value={2}>Segundo año</option>
              <option value={3}>Tercer año</option>
            </select>

            <select
              value={editing.rotation || ''}
              onChange={(e) =>
                setEditing({ ...editing, rotation: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            >
              <option value="">Seleccionar rotación</option>

              {rotations.map((rotation) => (
                <option key={rotation} value={rotation}>
                  {rotation}
                </option>
              ))}
            </select>

            <input
              value={editing.procedure_name || ''}
              onChange={(e) =>
                setEditing({ ...editing, procedure_name: e.target.value })
              }
              placeholder="Procedimiento"
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            />

            <input
              value={editing.category || ''}
              onChange={(e) =>
                setEditing({ ...editing, category: e.target.value })
              }
              placeholder="Categoría"
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            />

            <select
              value={editing.mode || 'Realiza'}
              onChange={(e) =>
                setEditing({ ...editing, mode: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            >
              <option>Realiza</option>
              <option>Observa</option>
            </select>

            <input
              type="date"
              value={editing.procedure_date || ''}
              onChange={(e) =>
                setEditing({ ...editing, procedure_date: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            />

            <input
              value={editing.tutor || ''}
              onChange={(e) =>
                setEditing({ ...editing, tutor: e.target.value })
              }
              placeholder="Tutor"
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            />

            <textarea
              value={editing.comments || ''}
              onChange={(e) =>
                setEditing({ ...editing, comments: e.target.value })
              }
              rows={3}
              placeholder="Comentarios"
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={saveEdit}
                className="bg-slate-900 text-white rounded-2xl p-4 font-semibold"
              >
                Guardar cambios
              </button>

              <button
                onClick={() => setEditing(null)}
                className="bg-slate-200 text-slate-900 rounded-2xl p-4 font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold mb-4 text-slate-950 text-center">
            Procedimientos recientes
          </h2>

          <div className="space-y-3">
            {logsSinAsiste.map((procedure) => (
              <div
                key={procedure.id}
                className="border border-slate-300 rounded-2xl p-4 space-y-3"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-950">
                      {procedure.procedure_name}
                    </h3>

                    <p className="text-slate-800">
                      {procedure.rotation}
                    </p>

                    <p className="text-slate-800 text-sm">
                      Tutor: {procedure.tutor}
                    </p>

                    <p className="text-slate-800 text-sm">
                      Fecha: {procedure.procedure_date}
                    </p>
                  </div>

                  <span className="bg-slate-100 text-slate-900 rounded-xl px-3 py-1 text-sm h-fit">
                    {procedure.mode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEditing(procedure)}
                    className="bg-slate-200 text-slate-900 rounded-2xl p-3 font-semibold"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => deleteProcedure(procedure.id)}
                    className="bg-red-100 text-red-800 rounded-2xl p-3 font-semibold"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}

            {logsSinAsiste.length === 0 && (
              <p className="text-slate-800 text-center">
                Aún no hay procedimientos registrados.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-950 text-center">
            Progreso por procedimiento
          </h2>

          {procedures.map((category) => (
            <div key={category.category} className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 text-center">
                {category.category}
              </h3>

              <div className="space-y-3">
                {category.items.map((item) => {
                  const performCurrent = logsSinAsiste.filter(
                    (p) =>
                      p.procedure_name === item.name &&
                      p.mode === 'Realiza'
                  ).length

                  const observeCurrent = logsSinAsiste.filter(
                    (p) =>
                      p.procedure_name === item.name &&
                      p.mode === 'Observa'
                  ).length

                  return (
                    <ProgressCard
                      key={item.name}
                      name={item.name}
                      performCurrent={performCurrent}
                      performRequired={item.min_perform}
                      observeCurrent={observeCurrent}
                      observeRequired={item.min_observe}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-center">
      <p className="text-slate-800 text-sm md:text-base">{title}</p>
      <h2 className="text-4xl font-bold text-slate-950">{value}</h2>
    </div>
  )
}
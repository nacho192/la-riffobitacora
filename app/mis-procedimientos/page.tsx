'use client'

import { useEffect, useState } from 'react'
import ProcedureForm from '@/components/ProcedureForm'
import { supabase } from '@/lib/supabase'

export default function MisProcedimientosPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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

    const { data, error } = await supabase
      .from('procedures_log')
      .select('*')
      .eq('user_id', user.id)
      .order('procedure_date', { ascending: false })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    setLogs(data || [])
    setLoading(false)
  }

  async function savePrivateNotes() {
    if (!editing) return

    const { error } = await supabase
      .from('procedures_log')
      .update({
        private_notes: editing.private_notes
      })
      .eq('id', editing.id)

    if (error) {
      alert(error.message)
      return
    }

    setEditing(null)
    loadProcedures()
  }

  return (
    <main className="min-h-screen pb-28 bg-slate-100 p-6 font-[Aptos,Inter,-apple-system,BlinkMacSystemFont,Segoe_UI,sans-serif]">
      <div className="max-w-3xl mx-auto space-y-8">
        <section className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-950">
            Mis procedimientos
          </h1>

          <p className="text-slate-700 text-lg">
            Registra procedimientos y guarda notas técnicas personales.
          </p>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-950 text-center mb-6">
            Registrar nuevo procedimiento
          </h2>

          <ProcedureForm />
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-2xl font-bold text-slate-950 text-center">
            Notas técnicas guardadas
          </h2>

          {loading && (
            <p className="text-center text-slate-700">
              Cargando...
            </p>
          )}

          {!loading && logs.length === 0 && (
            <p className="text-center text-slate-700">
              Aún no hay procedimientos registrados.
            </p>
          )}

          <div className="space-y-4">
            {logs.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200 p-5 space-y-3"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-950">
                    {item.procedure_name}
                  </h3>

                  <p className="text-slate-800">
                    {item.rotation} · {item.procedure_date}
                  </p>

                  <p className="text-slate-700 text-sm">
                    Tutor: {item.tutor} · Modalidad: {item.mode}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-900 mb-2">
                    Técnica, dosis, materiales o notas personales
                  </p>

                  <p className="text-slate-800 whitespace-pre-wrap">
                    {item.private_notes || 'Sin notas privadas registradas.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="w-full bg-slate-900 text-white rounded-2xl p-3 font-semibold"
                >
                  Editar notas
                </button>
              </div>
            ))}
          </div>
        </section>

        {editing && (
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-2xl font-bold text-slate-950 text-center">
              Editar notas técnicas
            </h2>

            <p className="text-slate-800 font-semibold">
              {editing.procedure_name}
            </p>

            <textarea
              value={editing.private_notes || ''}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  private_notes: e.target.value
                })
              }
              rows={8}
              placeholder="Ej: técnica, dosis, materiales, guía ecográfica, tips, complicaciones, pasos importantes..."
              className="w-full rounded-2xl border border-slate-500 p-4 text-lg text-slate-950"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={savePrivateNotes}
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
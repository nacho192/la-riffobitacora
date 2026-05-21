'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { procedures } from '@/lib/procedures'
import ProgressCard from '@/components/ProgressCard'

export default function DashboardPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [residentName, setResidentName] = useState('')

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
      user.user_metadata?.name ||
      user.email ||
      ''
    )

    const { data, error } = await supabase
      .from('procedures_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setLogs(data || [])
  }

  const total = logs.length
  const realizados = logs.filter((p) => p.mode === 'Realiza').length
  const observados = logs.filter((p) => p.mode === 'Observa').length
  const asistidos = logs.filter((p) => p.mode === 'Asiste').length

  return (
    <main className="min-h-screen pb-28 bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Dashboard
          </h1>

          {residentName && (
            <p className="text-slate-700 mt-2">
              Residente: {residentName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-6">
            <p className="text-slate-700">Total</p>
            <h2 className="text-4xl font-bold">{total}</h2>
          </div>

          <div className="bg-white rounded-3xl p-6">
            <p className="text-slate-700">Realizados</p>
            <h2 className="text-4xl font-bold">{realizados}</h2>
          </div>

          <div className="bg-white rounded-3xl p-6">
            <p className="text-slate-700">Observados</p>
            <h2 className="text-4xl font-bold">{observados}</h2>
          </div>

          <div className="bg-white rounded-3xl p-6">
            <p className="text-slate-700">Asistidos</p>
            <h2 className="text-4xl font-bold">{asistidos}</h2>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            Procedimientos recientes
          </h2>

          <div className="space-y-3">
            {logs.map((procedure) => (
              <div
                key={procedure.id}
                className="border border-slate-200 rounded-2xl p-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {procedure.procedure_name}
                    </h3>

                    <p className="text-slate-700">
                      {procedure.rotation}
                    </p>

                    <p className="text-slate-700 text-sm">
                      Tutor: {procedure.tutor}
                    </p>
                  </div>

                  <span className="bg-slate-100 rounded-xl px-3 py-1 text-sm whitespace-nowrap">
                    {procedure.mode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Progreso por procedimiento
          </h2>

          {procedures.map((category) => (
            <div key={category.category} className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-700">
                {category.category}
              </h3>

              <div className="space-y-3">
                {category.items.map((item) => {
                  const completed = logs.filter(
                    (p) =>
                      p.procedure_name === item.name &&
                      p.mode === 'Realiza'
                  ).length

                  return (
                    <ProgressCard
                      key={item.name}
                      name={item.name}
                      current={completed}
                      required={item.min_perform}
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
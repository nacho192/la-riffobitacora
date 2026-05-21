'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    setLoading(false)
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
    <main className="min-h-screen pb-28 bg-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-slate-900">
            La Riffobitácora
          </h1>

          <p className="text-slate-700 text-lg">
            Bitácora de procedimientos para residentes de fisiatría UDD
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            Bienvenido
          </h2>

          <p className="text-slate-700">
            Registra procedimientos, evalúa tu progreso y exporta tu bitácora clínica.
          </p>
        </div>
      </div>
    </main>
  )
}
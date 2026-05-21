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
    <main className="min-h-screen pb-28 bg-slate-100 p-6 font-[Aptos,Inter,-apple-system,BlinkMacSystemFont,Segoe_UI,sans-serif]">
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="text-center space-y-4 pt-6">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-950 leading-tight tracking-tight">
            Bitácora digital para Residentes de Fisiatría
          </h1>

          <p className="text-xl md:text-2xl text-slate-700 font-medium">
            Universidad del Desarrollo
          </p>

          <div className="flex justify-center pt-2">
            <img
              src="/riffobitacora-title.png"
              alt="La RiffoBitácora"
              className="w-full max-w-sm md:max-w-md"
            />
          </div>
        </section>

        <section className="bg-white rounded-3xl p-8 space-y-6 shadow-sm border border-slate-200">
          <h2 className="text-3xl font-semibold text-slate-950 text-center">
            Plataforma de registro clínico y seguimiento académico
          </h2>

          <div className="space-y-5 text-slate-800 text-lg leading-relaxed">
            <p>
              Esta plataforma permite registrar procedimientos realizados durante las distintas rotaciones clínicas de Medicina Física y Rehabilitación, facilitando el seguimiento longitudinal del progreso formativo de cada residente.
            </p>

            <p>
              Cada procedimiento puede documentarse según modalidad de participación, tutor responsable, fecha de realización, comentarios clínicos y notas privadas, permitiendo construir una bitácora organizada, editable y exportable.
            </p>

            <p>
              La aplicación incorpora visualización de estadísticas, seguimiento de objetivos mínimos por procedimiento, exportación en Word y PDF, edición de registros previos y respaldos automáticos mensuales.
            </p>

            <p>
              Su diseño está orientado específicamente a programas de formación en fisiatría, priorizando una experiencia simple, rápida y compatible con computador y dispositivos móviles.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
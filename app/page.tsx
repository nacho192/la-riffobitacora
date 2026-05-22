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
      <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-slate-900 text-lg font-semibold">
          Cargando...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-28 bg-slate-50 p-6 font-[Aptos,Inter,-apple-system,BlinkMacSystemFont,Segoe_UI,sans-serif]">
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
    src="/logo.png"
    alt="Logo"
    className="w-64 md:w-72 opacity-95 drop-shadow-sm"
  />
</div>
        </section>

        <section className="bg-white rounded-3xl p-8 space-y-6 shadow-sm border border-slate-200">
          <h2 className="text-3xl font-semibold text-slate-950 text-center">
            Plataforma de registro clínico y seguimiento académico
          </h2>

          <p className="text-slate-800 text-lg leading-relaxed text-center">
            Registra procedimientos clínicos, revisa tu progreso formativo y guarda notas técnicas personales de fácil acceso.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-950">
                Registrar
              </h3>

              <p className="text-slate-700 mt-2">
                Ingresa procedimientos por rotación, fecha, tutor, modalidad y comentarios clínicos.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-950">
                Notas técnicas
              </h3>

              <p className="text-slate-700 mt-2">
                Guarda técnica, dosis, materiales, tips y detalles privados asociados a cada procedimiento.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-950">
                Exportar
              </h3>

              <p className="text-slate-700 mt-2">
                Descarga informes en Word o PDF.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/nuevo'
            }}
            className="w-full bg-slate-900 text-white rounded-2xl p-5 text-xl font-semibold active:scale-95"
          >
            Registrar nuevo procedimiento
          </button>
        </section>
      </div>
    </main>
  )
}
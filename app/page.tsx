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
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
          <p className="text-muted-foreground text-sm font-medium tracking-wide">
            Cargando...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-2xl px-6 pt-12 md:pt-20">
        {/* Header Section */}
        <header className="mb-16 space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Universidad del Desarrollo
            </p>
            <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
              Bitacora digital para Residentes de Fisiatria
            </h1>
          </div>

          <img
            src="/riffobitacora-title.png"
            alt="La RiffoBitacora"
            className="w-full max-w-xs opacity-90"
          />
        </header>

        {/* Content Card */}
        <article className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm md:p-10">
          <h2 className="mb-8 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Plataforma de registro clinico y seguimiento academico
          </h2>

          <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
            <p>
              Esta plataforma permite registrar procedimientos realizados durante las distintas rotaciones clinicas de Medicina Fisica y Rehabilitacion, facilitando el seguimiento longitudinal del progreso formativo de cada residente.
            </p>

            <p>
              Cada procedimiento puede documentarse segun modalidad de participacion, tutor responsable, fecha de realizacion, comentarios clinicos y notas privadas, permitiendo construir una bitacora organizada, editable y exportable.
            </p>

            <p>
              La aplicacion incorpora visualizacion de estadisticas, seguimiento de objetivos minimos por procedimiento, exportacion en Word y PDF, edicion de registros previos y respaldos automaticos mensuales.
            </p>

            <p>
              Su diseno esta orientado especificamente a programas de formacion en fisiatria, priorizando una experiencia simple, rapida y compatible con computador y dispositivos moviles.
            </p>
          </div>
        </article>
      </div>
    </main>
  )
}
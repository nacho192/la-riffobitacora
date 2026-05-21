'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password) {
      setMessage('Ingresa correo y contraseña')
      return
    }

    setLoading(true)
    setMessage('Ingresando...')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 flex items-center">
      <div className="max-w-md mx-auto w-full">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-3xl p-8 space-y-5 shadow-sm border border-slate-200"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-950">
              La Riffobitácora
            </h1>

            <p className="text-slate-900 mt-2 text-lg font-medium">
              Iniciar sesión
            </p>
          </div>

          {message && (
            <div className="bg-slate-100 text-slate-950 rounded-2xl p-4 text-base font-medium">
              {message}
            </div>
          )}

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-slate-600 bg-white p-4 text-lg text-slate-950 placeholder:text-slate-700"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-slate-600 bg-white p-4 text-lg text-slate-950 placeholder:text-slate-700"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 text-white rounded-2xl p-4 text-lg font-semibold"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <Link
            href="/register"
            className="block w-full bg-slate-200 text-slate-950 rounded-2xl p-4 text-lg font-semibold text-center"
          >
            Crear cuenta
          </Link>
        </form>
      </div>
    </main>
  )
}
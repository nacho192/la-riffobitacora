'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const lastPress = useRef(0)

  async function handleRegister() {
    const now = Date.now()
    if (now - lastPress.current < 1000) return
    lastPress.current = now

    if (!name || !lastName || !email || !password) {
      setMessage('Ingresa nombre, apellido, correo y contraseña')
      return
    }

    setLoading(true)
    setMessage('Creando cuenta...')

    const fullName = `${name} ${lastName}`

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          last_name: lastName,
          full_name: fullName
        }
      }
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    if (data.user) {
      setMessage('Cuenta creada con éxito.')
      setName('')
      setLastName('')
      setEmail('')
      setPassword('')
      return
    }

    setMessage('No se pudo crear la cuenta. Intenta nuevamente.')
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 flex items-center">
      <div className="max-w-md mx-auto w-full">
        <div className="bg-white rounded-3xl p-8 space-y-5 shadow-sm border border-slate-200">
          <div>
            <h1 className="text-4xl font-bold text-slate-950">
              Crear cuenta
            </h1>

            <p className="text-slate-900 mt-2 text-lg font-medium">
              Residente de fisiatría UDD
            </p>
          </div>

          {message && (
            <div className="bg-slate-100 text-slate-950 rounded-2xl p-4 text-base font-medium">
              {message}
            </div>
          )}

          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-slate-600 bg-white p-4 text-lg text-slate-950 placeholder:text-slate-700"
          />

          <input
            type="text"
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-2xl border border-slate-600 bg-white p-4 text-lg text-slate-950 placeholder:text-slate-700"
          />

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
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
            type="button"
            disabled={loading}
            onClick={handleRegister}
            onTouchStart={handleRegister}
            onPointerDown={handleRegister}
            className="w-full bg-slate-950 text-white rounded-2xl p-4 text-lg font-semibold active:scale-95 touch-manipulation"
          >
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>

          <Link
            href="/login"
            className="block w-full bg-slate-200 text-slate-950 rounded-2xl p-4 text-lg font-semibold text-center"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  )
}
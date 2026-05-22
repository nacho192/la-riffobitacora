'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { rotations } from '@/lib/rotations'
import { procedures } from '@/lib/procedures'

export default function ProcedureForm() {
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProcedure, setSelectedProcedure] = useState('')
  const [customProcedure, setCustomProcedure] = useState('')

  const [form, setForm] = useState({
    year: 1,
    rotation: '',
    tutor: '',
    mode: 'Realiza',
    procedure_date: '',
    comments: ''
  })

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  function handleProcedureChange(value: string) {
    setSelectedProcedure(value)

    const foundCategory = procedures.find((category) =>
      category.items.some((item) => item.name === value)
    )

    if (foundCategory) {
      setSelectedCategory(foundCategory.category)
    }

    if (value === 'Otro procedimiento') {
      setSelectedCategory('Otros procedimientos')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const procedureToSave =
      selectedProcedure === 'Otro procedimiento'
        ? customProcedure
        : selectedProcedure

    if (
      !form.rotation ||
      !selectedCategory ||
      !procedureToSave ||
      !form.procedure_date ||
      !form.tutor
    ) {
      alert('Faltan campos obligatorios')
      return
    }

    setLoading(true)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Debes iniciar sesión')
      setLoading(false)
      window.location.href = '/login'
      return
    }

    const payload = {
      ...form,
      category: selectedCategory,
      procedure_name: procedureToSave,
      user_id: user.id,
      resident_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email
    }

    const { error } = await supabase
      .from('procedures_log')
      .insert([payload])

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Procedimiento guardado')

    setSelectedCategory('')
    setSelectedProcedure('')
    setCustomProcedure('')

    setForm({
      year: 1,
      rotation: '',
      tutor: '',
      mode: 'Realiza',
      procedure_date: '',
      comments: ''
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-40">
      <div>
        <label className="block mb-2 font-semibold text-slate-900 text-lg">
          Año
        </label>

        <select
          value={form.year}
          onChange={(e) => updateField('year', Number(e.target.value))}
          className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
        >
          <option value={1}>Primer año</option>
          <option value={2}>Segundo año</option>
          <option value={3}>Tercer año</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 font-semibold text-slate-900 text-lg">
          Rotación
        </label>

        <select
          value={form.rotation}
          onChange={(e) => updateField('rotation', e.target.value)}
          className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
        >
          <option value="">Seleccionar rotación</option>

          {rotations.map((rotation) => (
            <option key={rotation} value={rotation}>
              {rotation}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 font-semibold text-slate-900 text-lg">
          Procedimiento
        </label>

        <select
          value={selectedProcedure}
          onChange={(e) => handleProcedureChange(e.target.value)}
          className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
        >
          <option value="">Seleccionar procedimiento</option>

          {procedures.map((category) => (
            <optgroup key={category.category} label={category.category}>
              {category.items.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {selectedCategory && (
          <p className="mt-2 text-slate-700 text-sm">
            Categoría: {selectedCategory}
          </p>
        )}
      </div>

      {selectedProcedure === 'Otro procedimiento' && (
        <div>
          <label className="block mb-2 font-semibold text-slate-900 text-lg">
            Nombre del procedimiento
          </label>

          <input
            type="text"
            value={customProcedure}
            onChange={(e) => setCustomProcedure(e.target.value)}
            placeholder="Ej: procedimiento no listado"
            className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
          />
        </div>
      )}

      <div>
        <label className="block mb-2 font-semibold text-slate-900 text-lg">
          Modalidad
        </label>

        <select
          value={form.mode}
          onChange={(e) => updateField('mode', e.target.value)}
          className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
        >
          <option>Realiza</option>
          <option>Observa</option>
          <option>Asiste</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 font-semibold text-slate-900 text-lg">
          Fecha
        </label>

        <input
          type="date"
          value={form.procedure_date}
          onChange={(e) => updateField('procedure_date', e.target.value)}
          className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold text-slate-900 text-lg">
          Tutor responsable
        </label>

        <input
          type="text"
          value={form.tutor}
          onChange={(e) => updateField('tutor', e.target.value)}
          className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold text-slate-900 text-lg">
          Comentarios
        </label>

        <textarea
          value={form.comments}
          onChange={(e) => updateField('comments', e.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white rounded-2xl p-5 text-xl font-semibold"
      >
        {loading ? 'Guardando...' : 'Guardar procedimiento'}
      </button>
    </form>
  )
}
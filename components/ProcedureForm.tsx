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
    repeat_count: 1,
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

    const repeatCount = Math.max(1, Number(form.repeat_count || 1))

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

    const rows = Array.from({ length: repeatCount }, () => ({
      year: form.year,
      rotation: form.rotation,
      tutor: form.tutor,
      mode: form.mode,
      procedure_date: form.procedure_date,
      comments: form.comments,
      category: selectedCategory,
      procedure_name: procedureToSave,
      user_id: user.id,
      resident_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email
    }))

    const { error } = await supabase
      .from('procedures_log')
      .insert(rows)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert(
      repeatCount === 1
        ? 'Procedimiento guardado'
        : `${repeatCount} procedimientos guardados`
    )

    setSelectedCategory('')
    setSelectedProcedure('')
    setCustomProcedure('')

    setForm({
      year: 1,
      rotation: '',
      tutor: '',
      mode: 'Realiza',
      procedure_date: '',
      repeat_count: 1,
      comments: ''
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-40">
      <SelectBlock label="Año">
        <select
          value={form.year}
          onChange={(e) => updateField('year', Number(e.target.value))}
          className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
        >
          <option value={1}>Primer año</option>
          <option value={2}>Segundo año</option>
          <option value={3}>Tercer año</option>
        </select>
      </SelectBlock>

      <SelectBlock label="Rotación">
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
      </SelectBlock>

      <SelectBlock label="Procedimiento">
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
      </SelectBlock>

      {selectedProcedure === 'Otro procedimiento' && (
        <SelectBlock label="Nombre del procedimiento">
          <input
            type="text"
            value={customProcedure}
            onChange={(e) => setCustomProcedure(e.target.value)}
            placeholder="Ej: procedimiento no listado"
            className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
          />
        </SelectBlock>
      )}

      <SelectBlock label="Modalidad">
        <select
          value={form.mode}
          onChange={(e) => updateField('mode', e.target.value)}
          className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
        >
          <option>Realiza</option>
          <option>Observa</option>
        </select>
      </SelectBlock>

      <SelectBlock label="Fecha">
        <input
          type="date"
          value={form.procedure_date}
          onChange={(e) => updateField('procedure_date', e.target.value)}
          className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
        />
      </SelectBlock>

      <SelectBlock label="Tutor responsable">
        <input
          type="text"
          value={form.tutor}
          onChange={(e) => updateField('tutor', e.target.value)}
          className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
        />
      </SelectBlock>

      <SelectBlock label="Cantidad de veces">
        <input
          type="number"
          min={1}
          max={50}
          value={form.repeat_count}
          onChange={(e) =>
            updateField('repeat_count', Number(e.target.value))
          }
          className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
        />

        <p className="mt-2 text-sm text-slate-700">
          Usa este campo si realizaste u observaste el mismo procedimiento varias veces con el mismo tutor y fecha.
        </p>
      </SelectBlock>

      <SelectBlock label="Comentarios">
        <textarea
          value={form.comments}
          onChange={(e) => updateField('comments', e.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-slate-500 bg-white p-4 text-slate-900 text-lg"
        />
      </SelectBlock>

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

function SelectBlock({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block mb-2 font-semibold text-slate-900 text-lg">
        {label}
      </label>

      {children}
    </div>
  )
}
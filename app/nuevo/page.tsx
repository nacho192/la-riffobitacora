import ProcedureForm from '@/components/ProcedureForm'

export default function NuevoPage() {

  return (

    <main className="min-h-screen pb-28 bg-slate-100 p-6">

      <div className="max-w-3xl mx-auto space-y-6">

        <div>

          <h1 className="text-5xl font-bold text-slate-900">

            Nuevo procedimiento

          </h1>

          <p className="text-slate-500 mt-2">

            Registrar actividad clínica

          </p>

        </div>

        <div className="bg-white rounded-3xl p-6">

          <ProcedureForm />

        </div>

      </div>

    </main>
  )
}
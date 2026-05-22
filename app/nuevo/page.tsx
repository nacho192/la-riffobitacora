import ProcedureForm from '@/components/ProcedureForm'

export default function NuevoPage() {
  return (
    <main className="min-h-screen pb-28 bg-slate-100 p-6 font-[Aptos,Inter,-apple-system,BlinkMacSystemFont,Segoe_UI,sans-serif]">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-950">
            Registrar nuevo procedimiento
          </h1>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <ProcedureForm />
        </div>
      </div>
    </main>
  )
}
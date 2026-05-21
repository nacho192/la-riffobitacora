export default function ProgressCard({
  name,
  current,
  required
}: {
  name: string
  current: number
  required: number
}) {
  const percentage =
    required > 0
      ? Math.min((current / required) * 100, 100)
      : 0

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
      <div className="flex justify-between gap-4 mb-2">
        <p className="font-semibold text-slate-950">
          {name}
        </p>

        <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">
          {current}/{required}
        </p>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-slate-900 h-3 rounded-full"
          style={{
            width: `${percentage}%`
          }}
        />
      </div>
    </div>
  )
}
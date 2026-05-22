export default function ProgressCard({
  name,
  performCurrent,
  performRequired,
  observeCurrent,
  observeRequired
}: {
  name: string
  performCurrent: number
  performRequired: number
  observeCurrent: number
  observeRequired: number
}) {
  const performPercentage =
    performRequired > 0
      ? Math.min((performCurrent / performRequired) * 100, 100)
      : 100

  const observePercentage =
    observeRequired > 0
      ? Math.min((observeCurrent / observeRequired) * 100, 100)
      : 100

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
      <p className="font-semibold text-slate-950">
        {name}
      </p>

      <ProgressLine
        label="Realiza"
        current={performCurrent}
        required={performRequired}
        percentage={performPercentage}
      />

      <ProgressLine
        label="Observa"
        current={observeCurrent}
        required={observeRequired}
        percentage={observePercentage}
      />
    </div>
  )
}

function ProgressLine({
  label,
  current,
  required,
  percentage
}: {
  label: string
  current: number
  required: number
  percentage: number
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <p className="text-sm font-semibold text-slate-900">
          {label}
        </p>

        <p className="text-sm font-semibold text-slate-800">
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
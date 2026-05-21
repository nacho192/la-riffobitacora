type Props = {

  name: string

  current: number

  required: number
}

export default function ProgressCard({

  name,
  current,
  required

}:Props) {

  const percentage = Math.min(
    (current / required) * 100,
    100
  )

  return (

    <div className="bg-white rounded-3xl p-5 space-y-3">

      <div className="flex justify-between items-center">

        <h3 className="font-semibold text-lg">
          {name}
        </h3>

        <span className="text-sm text-slate-500">
          {current}/{required}
        </span>

      </div>

      <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">

        <div
          className={`
            h-full rounded-full transition-all

            ${percentage >= 100
              ? 'bg-green-500'
              : percentage >= 50
              ? 'bg-yellow-500'
              : 'bg-red-500'
            }
          `}
          style={{
            width: `${percentage}%`
          }}
        />

      </div>

      <p className="text-sm text-slate-500">

        {Math.round(percentage)}% completado

      </p>

    </div>
  )
}
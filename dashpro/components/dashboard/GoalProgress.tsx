interface GoalProgressProps {
  label: string
  current: number
  goal: number
  unit?: string
}

export function GoalProgress({ label, current, goal, unit = '' }: GoalProgressProps) {
  const pct = Math.min((current / goal) * 100, 100)
  const color =
    pct >= 100 ? 'bg-green-500' :
    pct >= 70  ? 'bg-blue-500' :
    pct >= 40  ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{current}{unit} / {goal}{unit}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% da meta</p>
    </div>
  )
}

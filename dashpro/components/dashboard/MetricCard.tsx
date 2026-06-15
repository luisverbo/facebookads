import clsx from 'clsx'

interface MetricCardProps {
  label: string
  value: string
  variation?: number
  prefix?: string
  suffix?: string
}

export function MetricCard({ label, value, variation, prefix = '', suffix = '' }: MetricCardProps) {
  const isPositive = variation !== undefined && variation < 0
  const isNegative = variation !== undefined && variation > 0

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">
        {prefix}{value}{suffix}
      </p>
      {variation !== undefined && (
        <p className={clsx(
          'text-xs mt-1 flex items-center gap-1',
          isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-gray-400'
        )}>
          {isPositive ? '↓' : isNegative ? '↑' : '→'}
          {' '}{Math.abs(variation).toFixed(1)}% vs período anterior
        </p>
      )}
    </div>
  )
}

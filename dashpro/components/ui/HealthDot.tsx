import clsx from 'clsx'
import type { HealthStatus } from '@/lib/supabase/types'

const colors: Record<HealthStatus, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
}

const labels: Record<HealthStatus, string> = {
  green: 'Saudável',
  yellow: 'Atenção',
  red: 'Crítico',
}

export function HealthDot({ status }: { status: HealthStatus }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={clsx('inline-block w-2.5 h-2.5 rounded-full', colors[status])} />
      <span className="text-xs text-gray-500">{labels[status]}</span>
    </span>
  )
}

import clsx from 'clsx'
import type { WorkspaceStatus } from '@/lib/supabase/types'

const styles: Record<WorkspaceStatus, string> = {
  trial: 'bg-amber-50 text-amber-700',
  active: 'bg-green-50 text-green-700',
  paused: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-600',
}

const labels: Record<WorkspaceStatus, string> = {
  trial: 'Trial',
  active: 'Ativo',
  paused: 'Pausado',
  cancelled: 'Cancelado',
}

export function StatusBadge({ status }: { status: WorkspaceStatus }) {
  return (
    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', styles[status])}>
      {labels[status]}
    </span>
  )
}

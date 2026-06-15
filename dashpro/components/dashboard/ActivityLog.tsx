import { format } from 'date-fns'
import type { ActivityLog as ActivityLogType } from '@/lib/supabase/types'

const labels: Record<string, string> = {
  meta_connected: 'Meta Ads conectado',
  metrics_synced: 'Métricas sincronizadas',
  report_viewed: 'Relatório visualizado',
}

export function ActivityLog({ logs }: { logs: ActivityLogType[] }) {
  if (!logs.length) {
    return <p className="text-sm text-gray-400">Nenhuma atividade ainda.</p>
  }

  return (
    <ul className="space-y-3">
      {logs.map(log => (
        <li key={log.id} className="flex items-start gap-3 text-sm">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
          <div>
            <p className="text-gray-700">{log.description || labels[log.event_type] || log.event_type}</p>
            <p className="text-xs text-gray-400">
              {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm")}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

import Link from 'next/link'
import { HealthDot } from '@/components/ui/HealthDot'
import { calcHealth } from '@/lib/health'
import type { Workspace, WorkspaceSummary } from '@/lib/supabase/types'

interface Props {
  workspace: Workspace
  summary: WorkspaceSummary
}

export function ClientCard({ workspace: ws, summary }: Props) {
  const health = calcHealth(ws, summary)
  const trialDaysLeft = ws.trial_ends_at
    ? Math.ceil((new Date(ws.trial_ends_at).getTime() - Date.now()) / 86400000)
    : null

  return (
    <Link href={`/clients/${ws.id}`}>
      <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{ws.client_name}</h3>
            {ws.status === 'trial' && trialDaysLeft !== null && (
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                Trial — {trialDaysLeft}d restantes
              </span>
            )}
          </div>
          <HealthDot status={health} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div>
            <p className="text-xs text-gray-400">Investido</p>
            <p className="text-sm font-medium">R${summary.totalSpend.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Leads</p>
            <p className="text-sm font-medium">{summary.totalLeads}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">CPL</p>
            <p className="text-sm font-medium">R${summary.avgCpl.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

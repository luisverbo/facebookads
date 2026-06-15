import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { format, subMonths } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { calcRealMetrics } from '@/lib/metrics/realCpl'
import { calcVariation } from '@/lib/health'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { GoalProgress } from '@/components/dashboard/GoalProgress'
import { RealCplCard } from '@/components/dashboard/RealCplCard'
import { ActivityLog } from '@/components/dashboard/ActivityLog'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SyncButton } from '@/components/dashboard/SyncButton'
import type { ActivityLog as ActivityLogType } from '@/lib/supabase/types'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ws } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!ws) notFound()

  const now = new Date()
  const currentMonth = format(now, 'yyyy-MM')
  const prevMonth = format(subMonths(now, 1), 'yyyy-MM')

  const [{ data: curr }, { data: prev }, { data: logs }, real] = await Promise.all([
    supabase.from('daily_metrics').select('spend,leads').eq('workspace_id', ws.id).like('date', `${currentMonth}%`),
    supabase.from('daily_metrics').select('spend,leads').eq('workspace_id', ws.id).like('date', `${prevMonth}%`),
    supabase.from('activity_logs').select('*').eq('workspace_id', ws.id).order('created_at', { ascending: false }).limit(10),
    calcRealMetrics(ws.id, now),
  ])

  const sum = (arr: { spend: number; leads: number }[] | null) => ({
    spend: arr?.reduce((s, r) => s + r.spend, 0) ?? 0,
    leads: arr?.reduce((s, r) => s + r.leads, 0) ?? 0,
  })
  const c = sum(curr)
  const p = sum(prev)
  const avgCpl = c.leads > 0 ? c.spend / c.leads : 0
  const prevAvgCpl = p.leads > 0 ? p.spend / p.leads : 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold text-gray-900">{ws.client_name}</h1>
            <StatusBadge status={ws.status} />
          </div>
          <p className="text-sm text-gray-400">PIN do relatório: <span className="font-mono">{ws.report_pin}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <SyncButton workspaceId={ws.id} />
          <Link
            href={`/clients/${ws.id}/connect`}
            className="bg-white border border-gray-200 text-sm text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Conectar Meta
          </Link>
          <Link
            href={`/clients/${ws.id}/settings`}
            className="bg-white border border-gray-200 text-sm text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Configurações
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard
          label="Investido"
          prefix="R$"
          value={c.spend.toFixed(2)}
          variation={calcVariation(c.spend, p.spend)}
        />
        <MetricCard
          label="Leads"
          value={String(c.leads)}
          variation={calcVariation(c.leads, p.leads) * -1}
        />
        <MetricCard
          label="Custo por lead"
          prefix="R$"
          value={avgCpl.toFixed(2)}
          variation={calcVariation(avgCpl, prevAvgCpl)}
        />
      </div>

      {(ws.monthly_goal_leads || ws.monthly_goal_cpl) && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Metas do mês</p>
          {ws.monthly_goal_leads && (
            <GoalProgress label="Leads" current={c.leads} goal={ws.monthly_goal_leads} />
          )}
          {ws.monthly_goal_cpl && (
            <GoalProgress label="CPL (R$)" current={Number(avgCpl.toFixed(2))} goal={Number(ws.monthly_goal_cpl)} unit="" />
          )}
        </div>
      )}

      <RealCplCard
        metaLeads={real.metaLeads}
        metaCpl={real.metaCpl}
        waContacts={real.waContacts}
        waContactRate={real.waContactRate}
        realCpl={real.realCpl}
        cplDifference={real.cplDifference}
      />

      {ws.notes && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-2">Anotações internas</p>
          <p className="text-sm text-amber-900 whitespace-pre-line">{ws.notes}</p>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Atividade recente</p>
          <Link href={`/report/${ws.report_slug}`} target="_blank" className="text-xs text-blue-600 hover:underline">
            Ver relatório público →
          </Link>
        </div>
        <ActivityLog logs={(logs as ActivityLogType[]) ?? []} />
      </div>
    </div>
  )
}

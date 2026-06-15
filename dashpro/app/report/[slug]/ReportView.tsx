'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ReportSummary } from '@/components/report/ReportSummary'
import { generateSummary } from '@/lib/report/summary'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { calcVariation } from '@/lib/health'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Workspace, WorkspaceSummary } from '@/lib/supabase/types'

export function ReportView({ workspaceId }: { workspaceId: string }) {
  const [ws, setWs] = useState<Workspace | null>(null)
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const now = new Date()
      const currentMonth = format(now, 'yyyy-MM')
      const prevMonth = format(subMonths(now, 1), 'yyyy-MM')

      const [{ data: workspace }, { data: curr }, { data: prev }] = await Promise.all([
        supabase.from('workspaces').select('*').eq('id', workspaceId).single(),
        supabase.from('daily_metrics').select('spend,leads').eq('workspace_id', workspaceId).like('date', `${currentMonth}%`),
        supabase.from('daily_metrics').select('spend,leads').eq('workspace_id', workspaceId).like('date', `${prevMonth}%`),
      ])

      if (!workspace) return
      setWs(workspace)

      const sum = (arr: { spend: number; leads: number }[] | null) => ({
        spend: arr?.reduce((s, r) => s + r.spend, 0) ?? 0,
        leads: arr?.reduce((s, r) => s + r.leads, 0) ?? 0,
      })
      const c = sum(curr)
      const p = sum(prev)

      setSummary({
        totalSpend: c.spend,
        totalLeads: c.leads,
        avgCpl: c.leads > 0 ? c.spend / c.leads : 0,
        prevTotalSpend: p.spend,
        prevTotalLeads: p.leads,
        prevAvgCpl: p.leads > 0 ? p.spend / p.leads : 0,
      })
    }
    load()
  }, [workspaceId])

  if (!ws || !summary) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Carregando...</div>
  }

  const periodLabel = `Em ${format(new Date(), 'MMMM', { locale: ptBR })}`
  const summaryText = generateSummary(ws, summary, periodLabel)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Relatório</p>
          <h1 className="text-2xl font-semibold text-gray-900">{ws.client_name}</h1>
          <p className="text-sm text-gray-400">{format(new Date(), 'MMMM yyyy', { locale: ptBR })}</p>
        </div>

        <ReportSummary text={summaryText} />

        <div className="grid grid-cols-3 gap-3 mt-6">
          <MetricCard
            label="Investido"
            prefix="R$"
            value={summary.totalSpend.toFixed(2)}
            variation={calcVariation(summary.totalSpend, summary.prevTotalSpend)}
          />
          <MetricCard
            label="Leads"
            value={String(summary.totalLeads)}
            variation={calcVariation(summary.totalLeads, summary.prevTotalLeads) * -1}
          />
          <MetricCard
            label="Custo por lead"
            prefix="R$"
            value={summary.avgCpl.toFixed(2)}
            variation={calcVariation(summary.avgCpl, summary.prevAvgCpl)}
          />
        </div>

        <p className="text-xs text-center text-gray-300 mt-12">
          Gerado por DashPro • {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
        </p>
      </div>
    </div>
  )
}

import { calcVariation } from '../health'
import type { WorkspaceSummary, Workspace } from '../supabase/types'

export function generateSummary(
  ws: Workspace,
  current: WorkspaceSummary,
  periodLabel: string
): string {
  const variation = calcVariation(current.avgCpl, current.prevAvgCpl)
  const variationText =
    variation < 0
      ? `${Math.abs(variation).toFixed(0)}% melhor que o período anterior`
      : variation > 0
      ? `${variation.toFixed(0)}% acima do período anterior`
      : 'igual ao período anterior'

  const goalText =
    ws.monthly_goal_leads && current.totalLeads >= ws.monthly_goal_leads
      ? ` A meta de ${ws.monthly_goal_leads} leads do mês foi atingida.`
      : ws.monthly_goal_leads
      ? ` A meta do mês é ${ws.monthly_goal_leads} leads — você está em ${current.totalLeads}.`
      : ''

  return (
    `${periodLabel}, foram investidos R$${current.totalSpend.toFixed(2).replace('.', ',')} ` +
    `e captados ${current.totalLeads} leads. ` +
    `O custo por lead ficou em R$${current.avgCpl.toFixed(2).replace('.', ',')} — ${variationText}.` +
    goalText
  )
}

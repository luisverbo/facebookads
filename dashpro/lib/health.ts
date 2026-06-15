import type { WorkspaceSummary, HealthStatus, Workspace } from './supabase/types'

export function calcHealth(
  ws: Workspace,
  summary: WorkspaceSummary
): HealthStatus {
  const issues: number[] = []

  if (ws.monthly_goal_cpl && summary.avgCpl > ws.monthly_goal_cpl * 1.2) {
    issues.push(2)
  } else if (ws.monthly_goal_cpl && summary.avgCpl > ws.monthly_goal_cpl * 1.05) {
    issues.push(1)
  }

  if (ws.monthly_goal_leads) {
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate()
    const daysPassed = new Date().getDate()
    const expectedPace = (ws.monthly_goal_leads / daysInMonth) * daysPassed
    if (summary.totalLeads < expectedPace * 0.6) issues.push(2)
    else if (summary.totalLeads < expectedPace * 0.85) issues.push(1)
  }

  const max = issues.length ? Math.max(...issues) : 0
  if (max >= 2) return 'red'
  if (max === 1) return 'yellow'
  return 'green'
}

export function calcVariation(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

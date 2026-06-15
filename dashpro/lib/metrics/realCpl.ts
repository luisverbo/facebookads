import { createClient } from '@/lib/supabase/server'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export interface RealMetrics {
  // Meta Ads
  metaLeads: number        // leads do formulário (Meta)
  metaSpend: number        // total investido
  metaCpl: number          // CPL do Meta (spend / leads formulário)

  // Huggy (contatos reais)
  waContacts: number       // contatos únicos que chegaram no WA
  waContactRate: number    // % dos leads do Meta que viraram contato WA

  // CPL real
  realCpl: number          // spend / contatos WA reais

  // Comparativo
  cplDifference: number    // diferença entre CPL Meta e CPL real (em %)
}

export async function calcRealMetrics(
  workspaceId: string,
  month?: Date
): Promise<RealMetrics> {
  const supabase = createClient()
  const ref = month || new Date()
  const monthStr = format(ref, 'yyyy-MM')

  const [{ data: metrics }, { count: waCount }] = await Promise.all([
    supabase
      .from('daily_metrics')
      .select('spend, leads')
      .eq('workspace_id', workspaceId)
      .like('date', `${monthStr}%`),
    supabase
      .from('whatsapp_contacts')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gte('first_contact_at', startOfMonth(ref).toISOString())
      .lte('first_contact_at', endOfMonth(ref).toISOString()),
  ])

  const metaSpend = metrics?.reduce((s, r) => s + r.spend, 0) ?? 0
  const metaLeads = metrics?.reduce((s, r) => s + r.leads, 0) ?? 0
  const waContacts = waCount ?? 0

  const metaCpl = metaLeads > 0 ? metaSpend / metaLeads : 0
  const realCpl = waContacts > 0 ? metaSpend / waContacts : 0
  const waContactRate = metaLeads > 0 ? (waContacts / metaLeads) * 100 : 0
  const cplDifference = metaCpl > 0 ? ((realCpl - metaCpl) / metaCpl) * 100 : 0

  return {
    metaLeads,
    metaSpend,
    metaCpl,
    waContacts,
    waContactRate,
    realCpl,
    cplDifference,
  }
}

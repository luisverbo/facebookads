import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdAccountInsights, extractLeads } from '@/lib/meta/api'
import { format, subDays } from 'date-fns'

export async function POST(req: NextRequest) {
  const { workspaceId } = await req.json()
  const supabase = createClient()

  const { data: conn } = await supabase
    .from('meta_connections')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single()

  if (!conn) {
    return NextResponse.json({ error: 'Meta não conectado' }, { status: 404 })
  }

  const until = format(new Date(), 'yyyy-MM-dd')
  const since = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  const insights = await getAdAccountInsights(
    conn.access_token,
    conn.ad_account_id,
    since,
    until
  )

  const rows = (insights.data || []).map((d: Record<string, unknown>) => ({
    workspace_id: workspaceId,
    date: d.date_start as string,
    spend: parseFloat(d.spend as string || '0'),
    impressions: parseInt(d.impressions as string || '0'),
    clicks: parseInt(d.clicks as string || '0'),
    reach: parseInt(d.reach as string || '0'),
    leads: extractLeads(d.actions as Array<{ action_type: string; value: string }>),
  }))

  if (rows.length > 0) {
    await supabase.from('daily_metrics').upsert(rows, { onConflict: 'workspace_id,date' })
  }

  await supabase.from('activity_logs').insert({
    workspace_id: workspaceId,
    event_type: 'metrics_synced',
    description: `${rows.length} dias sincronizados do Meta Ads`,
  })

  return NextResponse.json({ synced: rows.length })
}

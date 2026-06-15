import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { slug, pin } = await req.json()

  const { data: ws } = await supabase
    .from('workspaces')
    .select('id, report_pin, client_name')
    .eq('report_slug', slug)
    .single()

  if (!ws || ws.report_pin !== pin) {
    return NextResponse.json({ error: 'PIN incorreto' }, { status: 401 })
  }

  await supabase.from('activity_logs').insert({
    workspace_id: ws.id,
    event_type: 'report_viewed',
    description: 'Relatório visualizado pelo cliente',
  })

  return NextResponse.json({ ok: true, workspaceId: ws.id })
}

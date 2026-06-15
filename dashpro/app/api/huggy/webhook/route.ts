import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role pois é chamada externa (sem sessão de usuário)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // Validar token do Huggy
  const token = req.headers.get('x-huggy-token') || req.nextUrl.searchParams.get('token')

  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get('workspace_id')

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspace_id ausente na URL' }, { status: 400 })
  }

  // Validar que o workspace existe e tem token configurado
  const { data: ws } = await supabase
    .from('workspaces')
    .select('id, huggy_webhook_token')
    .eq('id', workspaceId)
    .single()

  if (!ws) {
    return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
  }

  if (ws.huggy_webhook_token && token !== ws.huggy_webhook_token) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  const body = await req.json()
  const eventType = body.event || body.type

  // Só processar eventos de mensagem recebida
  if (eventType !== 'receivedAllMessage') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const contact = body.contact || body.data?.contact
  if (!contact) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const huggyContactId = String(contact.id || contact.externalId || contact.phone)
  const phone = contact.phone || contact.number || null
  const name = contact.name || contact.fullName || null
  const department = body.department?.name || body.data?.department?.name || null
  const now = new Date().toISOString()

  // Tenta inserir o contato. Se já existe (mesmo workspace + huggy_contact_id),
  // o conflito é ignorado e nenhuma linha é retornada.
  const { data: inserted, error } = await supabase
    .from('whatsapp_contacts')
    .upsert({
      workspace_id: workspaceId,
      huggy_contact_id: huggyContactId,
      phone,
      name,
      department,
      first_contact_at: now,
      last_message_at: now,
      message_count: 1,
    }, {
      onConflict: 'workspace_id,huggy_contact_id',
      ignoreDuplicates: true,
    })
    .select('id')

  if (error) {
    console.error('Huggy webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Contato já existia: apenas atualiza last_message_at e incrementa o contador
  // (sem tocar no first_contact_at) via RPC.
  if (!inserted || inserted.length === 0) {
    const { error: rpcError } = await supabase.rpc('increment_message_count', {
      p_workspace_id: workspaceId,
      p_huggy_contact_id: huggyContactId,
      p_last_message_at: now,
    })

    if (rpcError) {
      console.error('Huggy webhook error:', rpcError)
      return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}

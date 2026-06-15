import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const workspaceId = searchParams.get('state')

  if (!code || !workspaceId) {
    return NextResponse.redirect('/dashboard?error=meta_auth_failed')
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback`

  const tokenRes = await fetch(
    `https://graph.facebook.com/v20.0/oauth/access_token?` +
    `client_id=${process.env.META_APP_ID}` +
    `&client_secret=${process.env.META_APP_SECRET}` +
    `&code=${code}` +
    `&redirect_uri=${redirectUri}`
  )
  const tokenData = await tokenRes.json()

  if (!tokenData.access_token) {
    return NextResponse.redirect('/dashboard?error=meta_token_failed')
  }

  const accountsRes = await fetch(
    `https://graph.facebook.com/v20.0/me/adaccounts?fields=id,name&access_token=${tokenData.access_token}`
  )
  const accountsData = await accountsRes.json()
  const adAccountId = accountsData.data?.[0]?.id?.replace('act_', '')

  if (!adAccountId) {
    return NextResponse.redirect('/dashboard?error=meta_no_account')
  }

  const supabase = createClient()
  await supabase.from('meta_connections').upsert({
    workspace_id: workspaceId,
    access_token: tokenData.access_token,
    ad_account_id: adAccountId,
    token_expires_at: tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null,
  }, { onConflict: 'workspace_id' })

  await supabase.from('activity_logs').insert({
    workspace_id: workspaceId,
    event_type: 'meta_connected',
    description: `Meta Ads conectado — conta ${adAccountId}`,
  })

  return NextResponse.redirect(`/clients/${workspaceId}?connected=true`)
}

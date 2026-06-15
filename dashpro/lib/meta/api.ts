const BASE = 'https://graph.facebook.com/v20.0'

export async function getAdAccountInsights(
  token: string,
  adAccountId: string,
  since: string,
  until: string
) {
  const fields = 'spend,impressions,clicks,reach,actions,date_start,date_stop'
  const url = `${BASE}/act_${adAccountId}/insights?fields=${fields}&time_range={"since":"${since}","until":"${until}"}&time_increment=1&level=account&access_token=${token}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Meta API error: ' + res.status)
  return res.json()
}

export function extractLeads(actions: Array<{ action_type: string; value: string }> = []) {
  return actions
    .filter(a => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped')
    .reduce((sum, a) => sum + Number(a.value), 0)
}

export function buildMetaOAuthUrl(redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_META_APP_ID!,
    redirect_uri: redirectUri,
    scope: 'ads_read,ads_management,business_management',
    response_type: 'code',
  })
  return `https://www.facebook.com/v20.0/dialog/oauth?${params}`
}

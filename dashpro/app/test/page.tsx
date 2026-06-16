import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

// Sempre dinâmico: nunca cacheia o resultado.
export const dynamic = 'force-dynamic'

export default async function TestPage() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  const allCookies = cookies().getAll()
  const cookieNames = allCookies.map(c => c.name)
  const authCookies = cookieNames.filter(
    n => n.startsWith('sb-') && n.includes('auth-token')
  )

  const result = {
    serverSeesUser: !!data.user,
    userId: data.user?.id ?? null,
    userEmail: data.user?.email ?? null,
    getUserError: error?.message ?? null,
    authCookiesPresent: authCookies.length > 0,
    authCookieNames: authCookies,
    allCookieNames: cookieNames,
  }

  return (
    <pre style={{ padding: 16, fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {JSON.stringify(result, null, 2)}
    </pre>
  )
}

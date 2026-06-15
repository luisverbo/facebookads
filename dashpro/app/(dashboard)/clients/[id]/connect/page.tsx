import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildMetaOAuthUrl } from '@/lib/meta/api'

export default async function ConnectPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback`
  // O workspaceId vai no parâmetro `state` do OAuth e volta no callback.
  const oauthUrl = `${buildMetaOAuthUrl(redirectUri)}&state=${params.id}`

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <Link href={`/clients/${params.id}`} className="text-sm text-blue-600 hover:underline">← Voltar</Link>
      <h1 className="text-2xl font-semibold text-gray-900 mt-3 mb-2">Conectar Meta Ads</h1>
      <p className="text-sm text-gray-500 mb-6">
        Autorize o acesso à conta de anúncios deste cliente para sincronizar as métricas
        de investimento, leads e alcance automaticamente.
      </p>
      <a
        href={oauthUrl}
        className="inline-block bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
      >
        Conectar com o Facebook
      </a>
    </div>
  )
}

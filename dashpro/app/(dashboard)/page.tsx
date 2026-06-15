import { createClient } from '@/lib/supabase/server'
import { ClientCard } from '@/components/dashboard/ClientCard'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getWorkspacesWithSummaries(managerId: string) {
  const supabase = createClient()
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .eq('manager_id', managerId)
    .order('created_at', { ascending: false })

  if (!workspaces) return []

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const prevMonth = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12`
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`

  return Promise.all(workspaces.map(async ws => {
    const [{ data: curr }, { data: prev }] = await Promise.all([
      supabase.from('daily_metrics').select('spend,leads').eq('workspace_id', ws.id).like('date', `${currentMonth}%`),
      supabase.from('daily_metrics').select('spend,leads').eq('workspace_id', ws.id).like('date', `${prevMonth}%`),
    ])

    const sum = (arr: { spend: number; leads: number }[] | null) => ({
      spend: arr?.reduce((s, r) => s + r.spend, 0) ?? 0,
      leads: arr?.reduce((s, r) => s + r.leads, 0) ?? 0,
    })

    const c = sum(curr)
    const p = sum(prev)

    return {
      workspace: ws,
      summary: {
        totalSpend: c.spend,
        totalLeads: c.leads,
        avgCpl: c.leads > 0 ? c.spend / c.leads : 0,
        prevTotalSpend: p.spend,
        prevTotalLeads: p.leads,
        prevAvgCpl: p.leads > 0 ? p.spend / p.leads : 0,
      },
    }
  }))
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const items = await getWorkspacesWithSummaries(user.id)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-400 mt-0.5">{items.length} workspace{items.length !== 1 ? 's' : ''} ativos</p>
        </div>
        <Link href="/clients/new">
          <button className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            + Novo cliente
          </button>
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Nenhum cliente ainda</p>
          <p className="text-sm mt-1">Cadastre seu primeiro cliente para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(({ workspace, summary }) => (
            <ClientCard key={workspace.id} workspace={workspace} summary={summary} />
          ))}
        </div>
      )}
    </div>
  )
}

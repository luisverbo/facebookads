'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function slugify(text: string) {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `${base || 'cliente'}-${Math.random().toString(36).slice(2, 7)}`
}

export default function NewClientPage() {
  const router = useRouter()
  const [clientName, setClientName] = useState('')
  const [goalLeads, setGoalLeads] = useState('')
  const [goalCpl, setGoalCpl] = useState('')
  const [huggyToken, setHuggyToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        manager_id: user.id,
        client_name: clientName,
        report_slug: slugify(clientName),
        monthly_goal_leads: goalLeads ? Number(goalLeads) : null,
        monthly_goal_cpl: goalCpl ? Number(goalCpl) : null,
        huggy_webhook_token: huggyToken || null,
      })
      .select('id')
      .single()

    if (error || !data) {
      setError(error?.message || 'Erro ao criar cliente.')
      setLoading(false)
      return
    }
    router.push(`/clients/${data.id}`)
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Novo cliente</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Nome do cliente</label>
          <input
            type="text"
            required
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Meta de leads/mês</label>
            <input
              type="number"
              min={0}
              value={goalLeads}
              onChange={e => setGoalLeads(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Meta de CPL (R$)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={goalCpl}
              onChange={e => setGoalCpl(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Token do Huggy (opcional)</label>
          <input
            type="text"
            value={huggyToken}
            onChange={e => setHuggyToken(e.target.value)}
            placeholder="Token do webhook do Huggy"
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {loading ? 'Criando...' : 'Criar cliente'}
        </button>
      </form>
    </div>
  )
}

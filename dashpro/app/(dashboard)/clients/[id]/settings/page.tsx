'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Workspace, WorkspaceStatus } from '@/lib/supabase/types'

export default function SettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [ws, setWs] = useState<Workspace | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('workspaces')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data }) => setWs(data))
  }, [params.id])

  if (!ws) {
    return <div className="px-6 py-8 text-gray-400">Carregando...</div>
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ws) return
    setSaving(true)
    setSaved(false)
    setError('')
    const supabase = createClient()
    const { error } = await supabase
      .from('workspaces')
      .update({
        client_name: ws.client_name,
        status: ws.status,
        report_pin: ws.report_pin,
        monthly_goal_leads: ws.monthly_goal_leads,
        monthly_goal_cpl: ws.monthly_goal_cpl,
        notes: ws.notes,
        huggy_webhook_token: ws.huggy_webhook_token ?? null,
      })
      .eq('id', ws.id)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setSaved(true)
    router.refresh()
  }

  const update = (patch: Partial<Workspace>) => setWs(prev => (prev ? { ...prev, ...patch } : prev))

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <Link href={`/clients/${ws.id}`} className="text-sm text-blue-600 hover:underline">← Voltar</Link>
      <h1 className="text-2xl font-semibold text-gray-900 mt-3 mb-6">Configurações</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Nome do cliente</label>
          <input
            type="text"
            value={ws.client_name}
            onChange={e => update({ client_name: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Status</label>
            <select
              value={ws.status}
              onChange={e => update({ status: e.target.value as WorkspaceStatus })}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            >
              <option value="trial">Trial</option>
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">PIN do relatório</label>
            <input
              type="text"
              maxLength={4}
              value={ws.report_pin}
              onChange={e => update({ report_pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Meta de leads/mês</label>
            <input
              type="number"
              min={0}
              value={ws.monthly_goal_leads ?? ''}
              onChange={e => update({ monthly_goal_leads: e.target.value ? Number(e.target.value) : null })}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Meta de CPL (R$)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={ws.monthly_goal_cpl ?? ''}
              onChange={e => update({ monthly_goal_cpl: e.target.value ? Number(e.target.value) : null })}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Token do Huggy</label>
          <input
            type="text"
            value={ws.huggy_webhook_token ?? ''}
            onChange={e => update({ huggy_webhook_token: e.target.value })}
            placeholder="Token do webhook do Huggy"
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Anotações internas</label>
          <textarea
            rows={3}
            value={ws.notes ?? ''}
            onChange={e => update({ notes: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {saved && <p className="text-sm text-green-600">Configurações salvas.</p>}
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}

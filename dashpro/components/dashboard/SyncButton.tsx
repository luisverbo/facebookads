'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import clsx from 'clsx'

export function SyncButton({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sync() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/meta/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Erro ao sincronizar.')
      return
    }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={sync}
        disabled={loading}
        className="flex items-center gap-2 bg-white border border-gray-200 text-sm text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors"
      >
        <RefreshCw size={15} className={clsx(loading && 'animate-spin')} />
        {loading ? 'Sincronizando...' : 'Sincronizar Meta'}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

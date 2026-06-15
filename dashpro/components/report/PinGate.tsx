'use client'
import { useState } from 'react'

interface PinGateProps {
  slug: string
  onUnlock: (workspaceId: string) => void
}

export function PinGate({ slug, onUnlock }: PinGateProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/report/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, pin }),
    })
    const data = await res.json()
    if (res.ok) {
      onUnlock(data.workspaceId)
    } else {
      setError('PIN incorreto. Verifique com seu gestor.')
      setPin('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 w-full max-w-sm text-center">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl">📊</span>
        </div>
        <h1 className="text-xl font-semibold mb-1 text-gray-900">Relatório</h1>
        <p className="text-sm text-gray-400 mb-8">Digite o PIN enviado pelo seu gestor</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="0000"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full text-center text-3xl font-mono tracking-widest border-2 border-gray-200 rounded-xl py-3 mb-4 focus:border-blue-400 focus:outline-none"
          />
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <button
            type="submit"
            disabled={pin.length < 4 || loading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Verificando...' : 'Acessar relatório'}
          </button>
        </form>
      </div>
    </div>
  )
}

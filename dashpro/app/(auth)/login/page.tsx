'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Probe de hidratação: só vira true se o JS do cliente rodar no navegador.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    console.log('[DashPro] login hidratado — JavaScript do cliente ativo')
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError('Configuração do Supabase ausente. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('E-mail ou senha incorretos.')
        return
      }
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-1 text-gray-900">Entrar no DashPro</h1>
        <p className="text-sm text-gray-400 mb-4">Acesse seu painel de gestor</p>
        <p
          className={`text-xs font-medium mb-6 ${hydrated ? 'text-green-600' : 'text-gray-300'}`}
          suppressHydrationWarning
        >
          {hydrated ? '✓ interativo' : '○ carregando JavaScript…'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
          />
          <input
            type="password"
            required
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-sm text-gray-400 mt-5 text-center">
          Não tem conta?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}

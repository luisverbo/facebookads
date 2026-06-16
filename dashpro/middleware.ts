import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Resposta base que carrega o request atual (cookies podem ser reescritos abaixo).
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Atualiza os cookies do request...
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // ...e recria a resposta para propagar os cookies ao navegador.
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: getUser() revalida e renova a sessão, gravando os cookies atualizados.
  // Não coloque código entre createServerClient e getUser para evitar logout aleatório.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api')
  const isAuthRoute = pathname === '/login' || pathname === '/register'
  const isPublicReport = pathname.startsWith('/report')

  // Mantém os cookies renovados ao redirecionar.
  const redirectTo = (to: string) => {
    const url = request.nextUrl.clone()
    url.pathname = to
    url.search = ''
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(cookie =>
      res.cookies.set(cookie.name, cookie.value, cookie)
    )
    return res
  }

  // Rota protegida sem sessão → login.
  if (!user && !isApi && !isAuthRoute && !isPublicReport) {
    return redirectTo('/login')
  }

  // Já autenticado tentando acessar login/register → painel.
  if (user && isAuthRoute) {
    return redirectTo('/')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Executa em todas as rotas, exceto:
     * - _next/static, _next/image (assets)
     * - favicon.ico e arquivos de imagem
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

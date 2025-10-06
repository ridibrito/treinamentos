import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Rotas públicas
  const publicRoutes = ['/login', '/cadastro', '/']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Se não tem variáveis de ambiente, redireciona tudo para login
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (isPublicRoute) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Verifica sessão
    const { data: { session } } = await supabase.auth.getSession()
    
    // Debug (remover depois)
    console.log('Path:', pathname, 'Has session:', !!session)

    // Página raiz - redireciona conforme autenticação
    if (pathname === '/') {
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Rotas públicas - redireciona para dashboard se já logado
    if (isPublicRoute && pathname !== '/') {
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return response
    }

    // Rotas protegidas - requer autenticação
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  } catch (error) {
    console.error('Erro no middleware:', error)
    
    if (isPublicRoute) {
      return NextResponse.next()
    }
    
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}


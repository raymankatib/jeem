import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if needed
  const { data: { user } } = await supabase.auth.getUser()

  const isAdmin = user?.user_metadata?.role === 'admin'

  // Redirect old admin auth routes to new unified login
  if (request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/admin/signup') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect admin routes (except auth pages)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Redirect to login if not authenticated
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user has admin role
    if (!isAdmin) {
      // Not an admin, redirect to user dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Protect user dashboard
  if (request.nextUrl.pathname === '/dashboard') {
    // Redirect to login if not authenticated
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If admin, redirect to admin dashboard
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // Handle login page when already logged in
  if (request.nextUrl.pathname === '/login') {
    if (user) {
      // Redirect based on role
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return response
}

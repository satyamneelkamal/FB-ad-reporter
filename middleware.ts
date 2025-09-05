import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page and API routes (except protected admin APIs)
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/setup') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/create-admin') ||
    pathname.startsWith('/api/test-facebook') ||
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/public/')
  ) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    // Redirect to login if no token
    console.log('❌ No token found for path:', pathname)
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify and decode token
    console.log('🎫 Verifying token for path:', pathname, 'Token:', token.substring(0, 50) + '...')
    const payload = verifyToken(token)
    console.log('✅ Token verified successfully, payload:', payload)
    const userRole = payload.role || 'admin' // Use role from JWT payload

    // Route protection based on role
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        // Non-admin trying to access admin routes
        const clientUrl = new URL('/client', request.url)
        return NextResponse.redirect(clientUrl)
      }
    }

    if (pathname.startsWith('/client')) {
      if (userRole !== 'client') {
        // Non-client trying to access client routes
        const adminUrl = new URL('/admin', request.url)
        return NextResponse.redirect(adminUrl)
      }
    }

    // Admin API routes protection
    if (pathname.startsWith('/api/admin') && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Client API routes protection
    if (pathname.startsWith('/api/client') && userRole !== 'client') {
      return NextResponse.json(
        { error: 'Client access required' },
        { status: 403 }
      )
    }

    return NextResponse.next()

  } catch (error) {
    // Invalid token - redirect to login
    console.error('Token verification failed:', error)
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
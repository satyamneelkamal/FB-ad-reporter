import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')

  if (!token) {
    // No authentication, redirect to login
    redirect('/login')
  }

  try {
    // Verify token and determine user role
    const payload = verifyToken(token.value)
    const userRole = payload.email.includes('@client.local') ? 'client' : 'admin'
    
    // Redirect to appropriate dashboard
    if (userRole === 'admin') {
      redirect('/admin')
    } else {
      redirect('/client')
    }
  } catch {
    // Invalid token, redirect to login
    redirect('/login')
  }
}

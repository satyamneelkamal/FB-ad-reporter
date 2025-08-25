import { NextRequest, NextResponse } from 'next/server'
import { loginAdmin, createAdmin, generateToken, getCookieOptions } from '@/lib/auth'
import { db, supabase } from '@/lib/supabase'
import { authLogger } from '@/lib/logger'

/**
 * Unified Authentication API
 * Handles both admin and client login in a single endpoint
 * 
 * POST /api/auth - Login (checks both admin and client tables)
 * PUT /api/auth - Create initial admin user
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    authLogger.info('Login attempt', { email })

    // First, try admin login
    const adminResult = await loginAdmin(email, password)
    if (adminResult) {
      authLogger.adminAction(email, 'admin_login_success')
      
      const response = NextResponse.json({
        success: true,
        user: {
          id: adminResult.admin.id,
          email: adminResult.admin.email,
          role: 'admin'
        },
        redirect: '/admin'
      })

      // Set secure HTTP-only cookie
      response.cookies.set('auth-token', adminResult.token, getCookieOptions())
      
      return response
    }

    // If admin login fails, try Supabase Auth login for users
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authData.user && !authError) {
        // Create auth object for JWT token generation
        const userAuth = {
          id: authData.user.id,
          email: authData.user.email!,
          password_hash: 'supabase-auth',
          created_at: authData.user.created_at
        }
        
        const userToken = generateToken(userAuth)
        
        authLogger.adminAction(email, 'user_login_success', { user_id: authData.user.id })
        
        const response = NextResponse.json({
          success: true,
          user: {
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata?.name || authData.user.email,
            role: 'client'
          },
          redirect: '/client'
        })

        response.cookies.set('auth-token', userToken, getCookieOptions())
        return response
      }
    } catch (userError) {
      authLogger.error('User login error', userError as Error, { email })
    }

    // Both admin and client login failed
    authLogger.warn('Login failed - invalid credentials', { email })
    
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )

  } catch (error) {
    authLogger.error('Authentication error', error as Error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { email, password, setupKey } = await request.json()

    if (!email || !password || !setupKey) {
      return NextResponse.json(
        { error: 'Email, password, and setup key are required' },
        { status: 400 }
      )
    }

    authLogger.info('Admin setup attempt', { email })

    // Create admin user
    const admin = await createAdmin(email, password, setupKey)
    authLogger.adminAction(email, 'admin_created', { admin_id: admin.id })

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: admin.id,
        email: admin.email,
        role: 'admin'
      }
    })

  } catch (error) {
    authLogger.error('Admin setup error', error as Error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create admin user'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    authLogger.info('Logout request')

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear the auth cookie
    response.cookies.set('auth-token', '', {
      ...getCookieOptions(),
      maxAge: 0
    })

    return response

  } catch (error) {
    authLogger.error('Logout error', error as Error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
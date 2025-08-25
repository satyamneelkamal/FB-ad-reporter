import { NextRequest, NextResponse } from 'next/server'
import { createAdmin } from '@/lib/auth'

/**
 * Setup API - Create initial admin user
 * This should only be used once to create the first admin
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

    // Use the setup key from environment
    const setupKey = process.env.ADMIN_SETUP_KEY || 'admin-setup-123'

    console.log('Creating admin with:', { email, setupKey })

    // Create admin user
    const admin = await createAdmin(email, password, setupKey)

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        id: admin.id,
        email: admin.email
      }
    })

  } catch (error) {
    console.error('Setup error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create admin user'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
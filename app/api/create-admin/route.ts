import { NextRequest, NextResponse } from 'next/server'
import { createAdmin } from '@/lib/auth'

/**
 * Create Admin Endpoint - Uses proper bcrypt hashing
 */

export async function POST() {
  try {
    console.log('🔧 Creating admin account...')

    // Create admin using the proper auth function
    const admin = await createAdmin(
      'admin@fotoplane.com', 
      'Fotoplane@1', 
      'admin-setup-123'
    )

    console.log('✅ Admin created successfully:', {
      id: admin.id,
      email: admin.email
    })

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        email: admin.email
      }
    })

  } catch (error) {
    console.error('❌ Error creating admin:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { verifyPassword } from '@/lib/auth'

/**
 * Debug Authentication Endpoint
 * Helps troubleshoot authentication issues
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔍 Debug Auth - Input:', { email, password: '[REDACTED]' })

    // Check if admin exists
    const admin = await db.getAdminByEmail(email)
    console.log('🔍 Debug Auth - Admin found:', !!admin)
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        debug: {
          adminFound: false,
          message: 'No admin found with this email'
        }
      })
    }

    console.log('🔍 Debug Auth - Admin details:', {
      id: admin.id,
      email: admin.email,
      hasPasswordHash: !!admin.password_hash,
      hashLength: admin.password_hash?.length
    })

    // Test password verification
    const isValidPassword = await verifyPassword(password, admin.password_hash)
    console.log('🔍 Debug Auth - Password valid:', isValidPassword)

    return NextResponse.json({
      success: isValidPassword,
      debug: {
        adminFound: true,
        adminId: admin.id,
        adminEmail: admin.email,
        passwordValid: isValidPassword,
        hashLength: admin.password_hash?.length
      }
    })

  } catch (error) {
    console.error('🔍 Debug Auth - Error:', error)
    return NextResponse.json({
      success: false,
      debug: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    })
  }
}
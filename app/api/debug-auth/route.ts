import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { verifyPassword } from '@/lib/auth'

/**
 * Debug authentication step by step
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('🔍 Debug auth for:', email)
    
    // Step 1: Check if admin exists
    console.log('Step 1: Looking up admin...')
    const admin = await db.getAdminByEmail(email)
    console.log('Admin found:', admin ? 'YES' : 'NO')
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        step: 1,
        error: 'Admin not found in database',
        details: 'getAdminByEmail returned null'
      })
    }
    
    console.log('Admin details:', { id: admin.id, email: admin.email })
    
    // Step 2: Test password verification
    console.log('Step 2: Verifying password...')
    console.log('Stored hash:', admin.password_hash.substring(0, 10) + '...')
    
    const isValidPassword = await verifyPassword(password, admin.password_hash)
    console.log('Password valid:', isValidPassword)
    
    return NextResponse.json({
      success: isValidPassword,
      step: isValidPassword ? 3 : 2,
      admin: {
        id: admin.id,
        email: admin.email,
        hash_preview: admin.password_hash.substring(0, 20) + '...'
      },
      password_verification: isValidPassword,
      details: isValidPassword ? 'All steps passed' : 'Password verification failed'
    })

  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, verifyPassword } from '@/lib/auth'

/**
 * Test endpoint to generate password hash
 */

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    const hash = await hashPassword(password)
    
    return NextResponse.json({
      success: true,
      password,
      hash,
      // Test verification
      verified: await verifyPassword(password, hash)
    })

  } catch (error) {
    console.error('Hash test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
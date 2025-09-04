import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Admin API to fix client-user relationships
 * POST /api/admin/fix-client-user
 */

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed'
      }, { status: 401 })
    }

    console.log('🔗 Fixing client-user relationship for client ID 9...')

    // Get current client record
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', 9)
      .single()

    if (clientError || !client) {
      return NextResponse.json({
        success: false,
        error: 'Client ID 9 not found'
      }, { status: 404 })
    }

    console.log('📊 Current client record:', {
      id: client.id,
      name: client.name,
      slug: client.slug,
      user_id: client.user_id
    })

    // Update client with correct user_id
    const { data: updatedClient, error: updateError } = await supabaseAdmin
      .from('clients')
      .update({
        user_id: 'efd82a79-d304-4bdd-815a-8e73765bee1d'
      })
      .eq('id', 9)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating client:', updateError)
      return NextResponse.json({
        success: false,
        error: updateError.message
      }, { status: 500 })
    }

    console.log('✅ Client updated successfully')

    // Verify the relationship
    const { data: verifyClient, error: verifyError } = await supabaseAdmin
      .from('clients')
      .select('id, name, slug, status, user_id')
      .eq('user_id', 'efd82a79-d304-4bdd-815a-8e73765bee1d')
      .eq('status', 'active')
      .single()

    if (verifyError) {
      return NextResponse.json({
        success: false,
        error: 'Verification failed: ' + verifyError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Client-user relationship fixed successfully',
      client: verifyClient,
      changes: {
        before: client.user_id,
        after: updatedClient.user_id
      }
    })

  } catch (error) {
    console.error('Admin fix-client-user error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fix client-user relationship'
    }, { status: 500 })
  }
}
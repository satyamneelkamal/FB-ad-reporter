import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Admin Client Management API - Individual Client Operations
 * PUT /api/admin/clients/[id] - Update client
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const resolvedParams = await params
    const clientId = parseInt(resolvedParams.id)
    const body = await request.json()

    console.log(`🔧 Admin updating client ${clientId}:`, body)

    // Update client record
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .update(body)
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      console.error('Error updating client:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    console.log('✅ Client updated successfully:', client)

    return NextResponse.json({
      success: true,
      client
    })

  } catch (error) {
    console.error('Admin client update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update client'
    }, { status: 500 })
  }
}
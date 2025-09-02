import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { db } from '@/lib/supabase'
import { generateSlug, isValidFacebookAdAccountId } from '@/lib/utils'
import { adminLogger } from '@/lib/logger'

/**
 * Admin Clients Management API
 * Full CRUD operations for managing clients
 * 
 * GET /api/admin/clients - List all clients
 * POST /api/admin/clients - Create new client
 * PUT /api/admin/clients - Update existing client
 * DELETE /api/admin/clients - Delete client
 */

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    adminLogger.adminAction(admin.email, 'list_clients')

    // Get all clients with additional stats
    const clients = await db.getClients()
    
    // Get report counts for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const reports = await db.getReportsByClient(client.id)
        const latestReport = reports[0] // Most recent report
        
        return {
          ...client,
          report_count: reports.length,
          latest_report: latestReport ? {
            month_year: latestReport.month_year,
            scraped_at: latestReport.scraped_at,
            total_records: 0
          } : null
        }
      })
    )

    return NextResponse.json({
      success: true,
      clients: clientsWithStats,
      total_count: clients.length
    })

  } catch (error) {
    adminLogger.error('Failed to list clients', error as Error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve clients'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    const { name, fb_ad_account_id, slug } = await request.json()

    // Validation
    if (!name || !fb_ad_account_id) {
      return NextResponse.json({
        success: false,
        error: 'Name and Facebook Ad Account ID are required'
      }, { status: 400 })
    }

    if (!isValidFacebookAdAccountId(fb_ad_account_id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Facebook Ad Account ID format. Expected: act_123456789'
      }, { status: 400 })
    }

    // Generate slug if not provided
    const clientSlug = slug || generateSlug(name)

    // Check if slug already exists
    const existingClient = await db.getClientBySlug(clientSlug)
    if (existingClient) {
      return NextResponse.json({
        success: false,
        error: 'A client with this name/slug already exists'
      }, { status: 409 })
    }

    adminLogger.adminAction(admin.email, 'create_client', { name, slug: clientSlug })

    // Create client
    const newClient = await db.createClient({
      name,
      fb_ad_account_id,
      slug: clientSlug,
      status: 'active'
    })

    return NextResponse.json({
      success: true,
      message: 'Client created successfully',
      client: newClient
    })

  } catch (error) {
    adminLogger.error('Failed to create client', error as Error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create client'
    }, { status: 500 })
  }
}

// PUT /api/admin/clients?id={id} - Update client (for fixing user_id)
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('id')
    const body = await request.json()

    if (!clientId) {
      return NextResponse.json({
        success: false,
        error: 'Client ID is required'
      }, { status: 400 })
    }

    console.log(`🔧 Admin updating client ${clientId}:`, body)

    // Update client record directly with Supabase admin
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .update(body)
      .eq('id', parseInt(clientId))
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

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Client ID is required'
      }, { status: 400 })
    }

    adminLogger.adminAction(admin.email, 'delete_client', { id })

    // Delete client (this will cascade delete all reports due to foreign key constraint)
    await db.deleteClient(parseInt(id))

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    })

  } catch (error) {
    adminLogger.error('Failed to delete client', error as Error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete client'
    }, { status: 500 })
  }
}
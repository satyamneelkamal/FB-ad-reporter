import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { db } from '@/lib/supabase'
import { collectAndStoreClientData, batchCollectAndStore, getStoredClientData } from '@/lib/data-storage'

/**
 * Admin Test Scrape API
 * Allows manual triggering of data collection for testing and troubleshooting
 * 
 * POST /api/admin/test-scrape - Test data collection for specific client or all clients
 * GET /api/admin/test-scrape - Get recent scrape results and statistics
 */

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { 
      clientId, 
      clientSlug, 
      monthYear, 
      scrapeAll = false,
      options = {} 
    } = body

    console.log(`🔧 Admin ${admin.email} initiated test scrape`)

    if (scrapeAll) {
      // Batch scrape all active clients
      console.log('📊 Starting batch scrape for all clients...')
      
      const clients = await db.getClients()
      if (clients.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No active clients found'
        }, { status: 400 })
      }

      const batchResult = await batchCollectAndStore(clients, monthYear, {
        continueOnError: options.continueOnError ?? true,
        delayBetweenClients: options.delayBetweenClients ?? 5000
      })

      return NextResponse.json({
        success: batchResult.success,
        message: `Batch scrape completed for ${clients.length} clients`,
        batch_summary: batchResult.summary,
        results: batchResult.results.map(result => ({
          client_id: result.storage_summary.client_id,
          month_year: result.storage_summary.month_year,
          success: result.success,
          total_records: result.storage_summary.total_records,
          quality_score: result.quality_report?.overall_score,
          error: result.error,
          warnings: result.validation_result?.warnings?.length || 0
        })),
        admin_info: {
          initiated_by: admin.email,
          initiated_at: new Date().toISOString()
        }
      })
    }

    // Single client scrape
    let client
    if (clientId) {
      const clients = await db.getClients()
      client = clients.find(c => c.id === clientId)
    } else if (clientSlug) {
      client = await db.getClientBySlug(clientSlug)
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either clientId or clientSlug is required'
      }, { status: 400 })
    }

    if (!client) {
      return NextResponse.json({
        success: false,
        error: 'Client not found'
      }, { status: 404 })
    }

    console.log(`📊 Starting test scrape for client: ${client.name}`)
    
    const result = await collectAndStoreClientData(client, monthYear)

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Data collection completed for ${client.name}`
        : `Data collection failed for ${client.name}`,
      client_info: {
        id: client.id,
        name: client.name,
        slug: client.slug,
        ad_account_id: client.fb_ad_account_id
      },
      collection_summary: result.storage_summary,
      validation_result: result.validation_result,
      quality_report: result.quality_report,
      transformations: result.transformations,
      report_id: result.report?.id,
      error: result.error,
      admin_info: {
        initiated_by: admin.email,
        initiated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Admin test scrape error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during data collection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const clientSlug = searchParams.get('clientSlug')
    const monthYear = searchParams.get('monthYear')

    if (clientSlug && monthYear) {
      // Get specific report data
      const result = await getStoredClientData(clientSlug, monthYear)
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        client: result.client,
        report: {
          id: result.report!.id,
          month_year: result.report!.month_year,
          scraped_at: result.report!.scraped_at,
          data_summary: {
            campaigns_count: result.report!.report_data.campaigns?.length || 0,
            demographics_count: result.report!.report_data.demographics?.length || 0,
            regional_count: result.report!.report_data.regional?.length || 0,
            devices_count: result.report!.report_data.devices?.length || 0,
            platforms_count: result.report!.report_data.platforms?.length || 0,
            hourly_count: result.report!.report_data.hourly?.length || 0,
            adLevel_count: result.report!.report_data.adLevel?.length || 0,
            total_records: (result.report!.report_data as any).collection_summary?.total_records || 0,
            successful_endpoints: (result.report!.report_data as any).collection_summary?.successful_endpoints || 0,
            failed_endpoints: (result.report!.report_data as any).collection_summary?.failed_endpoints || []
          }
        },
        quality_summary: result.quality_summary
      })
    }

    // Get general scrape statistics
    const clients = await db.getClients()
    const stats = []

    for (const client of clients) {
      const reports = await db.getReportsByClient(client.id)
      const latestReport = reports[0] // Reports are ordered by month_year DESC
      
      stats.push({
        client: {
          id: client.id,
          name: client.name,
          slug: client.slug,
          status: client.status
        },
        latest_scrape: latestReport ? {
          month_year: latestReport.month_year,
          scraped_at: latestReport.scraped_at,
          total_records: (latestReport.report_data as any).collection_summary?.total_records || 0,
          successful_endpoints: (latestReport.report_data as any).collection_summary?.successful_endpoints || 0
        } : null,
        available_months: reports.length
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Scrape statistics retrieved',
      statistics: {
        total_clients: clients.length,
        active_clients: clients.filter(c => c.status === 'active').length,
        clients_with_data: stats.filter(s => s.available_months > 0).length,
        total_reports: stats.reduce((sum, s) => sum + s.available_months, 0)
      },
      client_details: stats,
      admin_info: {
        accessed_by: admin.email,
        accessed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Admin scrape stats error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve scrape statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
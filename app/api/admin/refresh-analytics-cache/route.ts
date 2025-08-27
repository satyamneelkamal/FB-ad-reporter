import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { FacebookAnalytics } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { clientId } = await request.json()

    console.log(`🔄 [Admin] Refreshing analytics cache for client ${clientId || 'all'}`)

    let clients = []
    
    if (clientId) {
      // Refresh specific client
      const { data: client, error: clientError } = await supabaseAdmin
        .from('clients')
        .select('id, name')
        .eq('id', clientId)
        .single()
      
      if (clientError || !client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        )
      }
      clients = [client]
    } else {
      // Refresh all clients
      const { data: allClients, error: clientsError } = await supabaseAdmin
        .from('clients')
        .select('id, name')
        .eq('status', 'active')
      
      if (clientsError) {
        console.error('❌ [Admin] Error fetching clients:', clientsError)
        return NextResponse.json(
          { error: 'Failed to fetch clients' },
          { status: 500 }
        )
      }
      clients = allClients || []
    }

    const results = []

    for (const client of clients) {
      try {
        console.log(`🔄 [Admin] Processing client: ${client.name} (ID: ${client.id})`)

        // Get the latest monthly report data
        const { data: reportData, error: reportError } = await supabaseAdmin
          .from('monthly_reports')
          .select('report_data, scraped_at')
          .eq('client_id', client.id)
          .order('scraped_at', { ascending: false })
          .limit(1)
          .single()

        if (reportError || !reportData?.report_data) {
          console.log(`⚠️ [Admin] No report data for client ${client.name}`)
          results.push({
            clientId: client.id,
            clientName: client.name,
            status: 'skipped',
            reason: 'No report data available'
          })
          continue
        }

        // Process the raw Facebook data into analytics
        const processedAnalytics = FacebookAnalytics.generateFullAnalytics(reportData.report_data)

        // Cache the processed data
        const { error: upsertError } = await supabaseAdmin
          .from('analytics_cache')
          .upsert({
            client_id: client.id,
            analytics_data: processedAnalytics,
            last_updated: new Date().toISOString(),
            data_source: 'facebook_api'
          })

        if (upsertError) {
          console.error(`❌ [Admin] Failed to cache data for client ${client.name}:`, upsertError)
          results.push({
            clientId: client.id,
            clientName: client.name,
            status: 'error',
            error: upsertError.message
          })
        } else {
          console.log(`✅ [Admin] Successfully cached data for client ${client.name}`)
          results.push({
            clientId: client.id,
            clientName: client.name,
            status: 'success',
            recordsProcessed: {
              campaigns: processedAnalytics.campaigns?.length || 0,
              campaignTypes: processedAnalytics.campaignTypes?.length || 0,
              hasRegional: processedAnalytics.regional?.available || false,
              hasDemographics: processedAnalytics.demographics?.available || false
            }
          })
        }

      } catch (clientError) {
        console.error(`❌ [Admin] Error processing client ${client.name}:`, clientError)
        results.push({
          clientId: client.id,
          clientName: client.name,
          status: 'error',
          error: clientError instanceof Error ? clientError.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length
    const skippedCount = results.filter(r => r.status === 'skipped').length

    console.log(`✅ [Admin] Cache refresh completed: ${successCount} success, ${errorCount} errors, ${skippedCount} skipped`)

    return NextResponse.json({
      success: true,
      message: `Cache refresh completed: ${successCount} success, ${errorCount} errors, ${skippedCount} skipped`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        errors: errorCount,
        skipped: skippedCount
      }
    })

  } catch (error) {
    console.error('❌ [Admin] Cache refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh analytics cache' },
      { status: 500 }
    )
  }
}
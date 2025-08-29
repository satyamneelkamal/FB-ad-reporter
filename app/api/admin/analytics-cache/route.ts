import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { batchRefreshAnalyticsCache, refreshAnalyticsCache } from '@/lib/analytics-cache'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Admin Analytics Cache Management API
 * 
 * GET /api/admin/analytics-cache - Get cache status for all clients
 * POST /api/admin/analytics-cache - Batch refresh analytics cache for all clients
 * POST /api/admin/analytics-cache?client_id={id} - Refresh cache for specific client
 */

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminResult = await getAdminFromRequest(request)
    if (!adminResult.success) {
      return NextResponse.json({
        success: false,
        error: adminResult.error
      }, { status: 401 })
    }

    // Get cache status for all clients
    const { data: cacheData, error: cacheError } = await supabaseAdmin
      .from('analytics_cache')
      .select(`
        client_id,
        last_updated,
        clients (
          name,
          slug,
          status
        )
      `)
      .order('last_updated', { ascending: false })

    if (cacheError) {
      throw cacheError
    }

    // Get all clients to show which ones don't have cache
    const { data: allClients, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, name, slug, status')
      .eq('status', 'active')

    if (clientError) {
      throw clientError
    }

    // Build cache status summary
    const cachedClientIds = new Set(cacheData?.map(c => c.client_id) || [])
    const uncachedClients = allClients?.filter(c => !cachedClientIds.has(c.id)) || []

    return NextResponse.json({
      success: true,
      summary: {
        total_clients: allClients?.length || 0,
        cached_clients: cacheData?.length || 0,
        uncached_clients: uncachedClients.length,
        last_global_update: cacheData?.[0]?.last_updated || null
      },
      cached_clients: cacheData?.map(cache => ({
        client_id: cache.client_id,
        client_name: cache.clients?.name,
        client_slug: cache.clients?.slug,
        last_updated: cache.last_updated,
        status: cache.clients?.status
      })) || [],
      uncached_clients: uncachedClients.map(client => ({
        client_id: client.id,
        client_name: client.name,
        client_slug: client.slug,
        status: client.status
      }))
    })

  } catch (error) {
    console.error('Admin analytics cache status error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get cache status'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminResult = await getAdminFromRequest(request)
    if (!adminResult.success) {
      return NextResponse.json({
        success: false,
        error: adminResult.error
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')

    if (clientId) {
      // Refresh cache for specific client
      const result = await refreshAnalyticsCache(parseInt(clientId))
      
      return NextResponse.json({
        success: result.success,
        client_id: clientId,
        error: result.error,
        refreshed: result.success ? 1 : 0
      })
    } else {
      // Batch refresh for all clients
      console.log('🔄 Starting batch analytics cache refresh (admin triggered)')
      
      const result = await batchRefreshAnalyticsCache()
      
      return NextResponse.json({
        success: result.success,
        summary: {
          total_processed: result.processed + result.errors,
          successful: result.processed,
          failed: result.errors
        },
        details: result.details
      })
    }

  } catch (error) {
    console.error('Admin analytics cache refresh error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh analytics cache'
    }, { status: 500 })
  }
}
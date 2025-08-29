import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsCache, refreshAnalyticsCache } from '@/lib/analytics-cache'
import { getClientFromRequest } from '@/lib/auth'

/**
 * Client Analytics API
 * Provides fast access to processed analytics data from cache
 * 
 * GET /api/client/analytics - Get analytics for authenticated client
 * POST /api/client/analytics - Refresh analytics cache for authenticated client
 */

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Client analytics API called')
    
    // Get authenticated client from JWT token
    const authResult = await getClientFromRequest(request)
    console.log('🔐 Auth result:', authResult)
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: authResult.error || 'Authentication required'
      }, { status: 401 })
    }

    const client = authResult.client!

    // Get analytics from cache
    const cacheResult = await getAnalyticsCache(client.id)
    
    if (!cacheResult.success) {
      // If no cache exists, try to refresh it from raw data
      console.log(`No analytics cache found for ${client.slug}, attempting to refresh...`)
      
      const refreshResult = await refreshAnalyticsCache(client.id)
      if (!refreshResult.success) {
        return NextResponse.json({
          success: false,
          error: `No analytics data available for ${client.name}. Please ensure data has been collected.`
        }, { status: 404 })
      }

      // Try to get cache again after refresh
      const retryResult = await getAnalyticsCache(client.id)
      if (!retryResult.success) {
        return NextResponse.json({
          success: false,
          error: 'Failed to generate analytics cache'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        client: {
          id: client.id,
          name: client.name,
          slug: client.slug
        },
        analytics: retryResult.data,
        cache_refreshed: true
      })
    }

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        slug: client.slug
      },
      analytics: cacheResult.data
    })

  } catch (error) {
    console.error('Client analytics API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve analytics data'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated client from JWT token
    const authResult = await getClientFromRequest(request)
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: authResult.error || 'Authentication required'
      }, { status: 401 })
    }

    const client = authResult.client!

    // Refresh analytics cache
    const refreshResult = await refreshAnalyticsCache(client.id)
    
    if (!refreshResult.success) {
      return NextResponse.json({
        success: false,
        error: refreshResult.error
      }, { status: 500 })
    }

    // Get the updated analytics
    const cacheResult = await getAnalyticsCache(client.id)
    
    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        slug: client.slug
      },
      analytics: cacheResult.success ? cacheResult.data : null,
      cache_refreshed: true
    })

  } catch (error) {
    console.error('Client analytics refresh API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh analytics data'
    }, { status: 500 })
  }
}
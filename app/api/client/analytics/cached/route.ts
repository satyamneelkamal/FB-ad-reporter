import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getClientFromToken } from '@/lib/auth'
import { FacebookAnalytics } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    // Get client from auth token
    const client = await getClientFromToken(request)
    if (!client) {
      return NextResponse.json(
        { error: 'Client authentication required' },
        { status: 401 }
      )
    }

    console.log(`🔍 [Analytics Cache] Fetching cached data for client ${client.id}`)

    // Try to get cached data first
    const { data: cachedData, error: cacheError } = await supabaseAdmin
      .from('analytics_cache')
      .select('analytics_data, last_updated')
      .eq('client_id', client.id)
      .single()

    if (cacheError && cacheError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ [Analytics Cache] Cache lookup error:', cacheError)
    }

    const now = new Date()
    const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

    // If we have fresh cached data, return it immediately
    if (cachedData && cachedData.last_updated) {
      const lastUpdated = new Date(cachedData.last_updated)
      const isStale = (now.getTime() - lastUpdated.getTime()) > CACHE_DURATION

      if (!isStale) {
        console.log(`✅ [Analytics Cache] Serving fresh cached data (${Math.round((now.getTime() - lastUpdated.getTime()) / 1000)}s old)`)
        // Return only the processed analytics structure, not raw hourly data
        const processedData = cachedData.analytics_data
        const {hourly, adLevel, ...cleanedData} = processedData
        
        return NextResponse.json({
          ...cleanedData,
          cached: true,
          lastUpdated: cachedData.last_updated,
          source: 'cache'
        })
      }
    }

    // If no cached data or it's stale, we need to refresh
    console.log(`🔄 [Analytics Cache] Cached data is stale or missing, refreshing...`)

    // Get the latest monthly report data
    const { data: reportData, error: reportError } = await supabaseAdmin
      .from('monthly_reports')
      .select('report_data, scraped_at')
      .eq('client_id', client.id)
      .order('scraped_at', { ascending: false })
      .limit(1)
      .single()

    if (reportError || !reportData?.report_data) {
      // If we have stale cached data, return it with a warning
      if (cachedData) {
        console.log(`⚠️ [Analytics Cache] No fresh report data, serving stale cache`)
        // Return only the processed analytics structure, not raw hourly data
        const staleData = cachedData.analytics_data
        const {hourly, adLevel, ...cleanedStaleData} = staleData
        
        return NextResponse.json({
          ...cleanedStaleData,
          cached: true,
          stale: true,
          lastUpdated: cachedData.last_updated,
          source: 'stale_cache',
          warning: 'Data may be outdated. Fresh data collection in progress.'
        })
      }

      return NextResponse.json(
        { error: 'No analytics data available. Please run data collection first.' },
        { status: 404 }
      )
    }

    // Process the raw Facebook data into analytics
    console.log(`🔄 [Analytics Cache] Processing fresh Facebook data...`)
    console.log(`📋 [Analytics Cache] Report data keys:`, Object.keys(reportData.report_data))
    const processedAnalytics = FacebookAnalytics.generateFullAnalytics(reportData.report_data)
    console.log(`✨ [Analytics Cache] Analytics processing completed`)

    // Cache the processed data
    const { error: upsertError } = await supabaseAdmin
      .from('analytics_cache')
      .upsert({
        client_id: client.id,
        analytics_data: processedAnalytics,
        last_updated: now.toISOString(),
        data_source: 'facebook_api'
      })

    if (upsertError) {
      console.error('❌ [Analytics Cache] Failed to cache data:', upsertError)
      // Continue anyway, just return uncached data
    } else {
      console.log(`✅ [Analytics Cache] Successfully cached fresh data`)
    }

    // Return only the processed analytics structure, not raw hourly data
    const {hourly, adLevel, ...cleanedAnalytics} = processedAnalytics
    
    return NextResponse.json({
      ...cleanedAnalytics,
      cached: false,
      lastUpdated: now.toISOString(),
      source: 'fresh_api'
    })

  } catch (error) {
    console.error('❌ [Analytics Cache] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
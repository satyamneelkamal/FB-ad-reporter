import { NextRequest, NextResponse } from 'next/server'
import { getClientFromRequest } from '@/lib/auth'
import { getFacebookDataSeparated } from '@/lib/data-storage-separated'
import { FacebookAnalytics } from '@/lib/analytics'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Client Analytics API
 * Provides analytics data directly from separated Facebook data tables
 * 
 * GET /api/client/analytics - Get analytics for authenticated client
 */

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Client analytics API called - reading from separated tables')
    
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

    // Find the most recent month with data for this client
    const { data: recentData, error: queryError } = await supabaseAdmin
      .from('fb_campaigns')
      .select('month_year, scraped_at')
      .eq('client_id', client.id)
      .order('scraped_at', { ascending: false })
      .limit(1)

    if (queryError) {
      console.error('Database query error:', queryError)
      return NextResponse.json({
        success: false,
        error: 'Failed to query Facebook data'
      }, { status: 500 })
    }

    if (!recentData || recentData.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No Facebook data found for ${client.name}. Please ensure data has been collected.`
      }, { status: 404 })
    }

    const latestMonthYear = recentData[0].month_year

    // Get all Facebook data from separated tables
    const facebookData = await getFacebookDataSeparated(client.id, latestMonthYear)
    
    if (!facebookData) {
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve Facebook data from tables'
      }, { status: 500 })
    }

    // Process the data using FacebookAnalytics
    const analytics = FacebookAnalytics.generateFullAnalytics(facebookData)

    // Calculate total audience from demographics if available
    let totalAudience = 0
    if (analytics.demographics.available && facebookData.demographics) {
      totalAudience = facebookData.demographics.reduce(
        (sum: number, demo: any) => sum + parseInt(demo.reach || '0'), 0
      )
    }

    // Add total audience to demographics
    const enhancedAnalytics = {
      ...analytics,
      demographics: {
        ...analytics.demographics,
        totalAudience: totalAudience > 0 ? totalAudience : undefined
      }
    }

    console.log(`✅ Analytics generated from separated tables:
    - Total Spend: $${analytics.overview?.totalSpend?.toFixed(2) || '0.00'}
    - Active Campaigns: ${analytics.overview?.activeCampaigns || 0}
    - Data Types Available: ${Object.keys(analytics.dataAvailability || {}).length}
    - ROI Available: ${analytics.roi?.available ? 'YES' : 'NO'}
    - ROI Campaigns: ${analytics.roi?.campaignROI?.length || 0}`)
    
    // Debug: Log ROI data structure
    console.log('🔍 ROI Debug:', {
      roiAvailable: analytics.roi?.available,
      campaignROICount: analytics.roi?.campaignROI?.length,
      overallROAS: analytics.roi?.overallROAS,
      totalConversions: analytics.roi?.totalConversions
    })

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        slug: client.slug
      },
      analytics: enhancedAnalytics,
      data_source: 'separated_tables',
      month_year: latestMonthYear
    })

  } catch (error) {
    console.error('Client analytics API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve analytics data'
    }, { status: 500 })
  }
}


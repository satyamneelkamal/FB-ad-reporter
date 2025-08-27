import { NextRequest, NextResponse } from 'next/server'
import { getClientIdFromToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { FacebookAnalytics } from '@/lib/analytics'

/**
 * Client Analytics API
 * 
 * Provides comprehensive Facebook Ads analytics for authenticated clients
 * Processes data into 8 major sections matching stats.md format:
 * - Overview, Campaigns, Demographics, Regional, Engagement, 
 *   Campaign Types, Devices & Platforms, Ad Level
 */

export async function GET(request: NextRequest) {
  try {
    // Extract client ID from JWT token
    const clientId = await getClientIdFromToken(request)
    
    // Get the most recent report for this client
    const { data: reports, error: reportError } = await supabase
      .from('monthly_reports')
      .select('report_data, month_year, scraped_at')
      .eq('client_id', clientId)
      .order('scraped_at', { ascending: false })
      .limit(1)
      
    if (reportError) {
      console.error('Database error:', reportError)
      return NextResponse.json(
        { error: 'Failed to fetch report data' },
        { status: 500 }
      )
    }
    
    if (!reports || reports.length === 0) {
      return NextResponse.json(
        { 
          error: 'No report data found',
          message: 'No Facebook Ads data has been collected for this client yet'
        },
        { status: 404 }
      )
    }
    
    const latestReport = reports[0]
    const reportData = latestReport.report_data
    
    if (!reportData) {
      return NextResponse.json(
        { 
          error: 'Invalid report data',
          message: 'Report data is missing or corrupted'
        },
        { status: 400 }
      )
    }
    
    // Generate comprehensive analytics using the FacebookAnalytics class
    const analytics = FacebookAnalytics.generateFullAnalytics(reportData)
    
    // Add metadata about the report
    const response = {
      ...analytics,
      metadata: {
        clientId,
        monthYear: latestReport.month_year,
        scrapedAt: latestReport.scraped_at,
        generatedAt: new Date().toISOString(),
        dataQuality: {
          totalDataTypes: Object.keys(reportData).length,
          availableDataTypes: Object.keys(analytics.dataAvailability).filter(
            key => analytics.dataAvailability[key as keyof typeof analytics.dataAvailability]
          )
        }
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Analytics API error:', error)
    
    // Handle specific authentication errors
    if (error instanceof Error) {
      if (error.message.includes('authentication') || error.message.includes('token')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      if (error.message.includes('Client not found')) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}

/**
 * Get analytics for a specific month/year
 */
export async function POST(request: NextRequest) {
  try {
    const clientId = await getClientIdFromToken(request)
    const { monthYear } = await request.json()
    
    if (!monthYear) {
      return NextResponse.json(
        { error: 'monthYear parameter is required' },
        { status: 400 }
      )
    }
    
    // Get specific month's report
    const { data: reports, error } = await supabase
      .from('monthly_reports')
      .select('report_data, month_year, scraped_at')
      .eq('client_id', clientId)
      .eq('month_year', monthYear)
      .single()
      
    if (error || !reports) {
      return NextResponse.json(
        { error: `No data found for ${monthYear}` },
        { status: 404 }
      )
    }
    
    // Generate analytics for the specific month
    const analytics = FacebookAnalytics.generateFullAnalytics(reports.report_data)
    
    const response = {
      ...analytics,
      metadata: {
        clientId,
        monthYear: reports.month_year,
        scrapedAt: reports.scraped_at,
        generatedAt: new Date().toISOString()
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Monthly analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to generate monthly analytics' },
      { status: 500 }
    )
  }
}
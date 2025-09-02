import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getFacebookDataSeparated } from '@/lib/data-storage-separated'

/**
 * Admin Debug API - Get raw database data for comparison
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

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id') || '9'

    // Get raw monthly_reports data
    const { data: monthlyReport, error: reportError } = await supabaseAdmin
      .from('monthly_reports')
      .select('*')
      .eq('client_id', parseInt(clientId))
      .order('scraped_at', { ascending: false })
      .limit(1)
      .single()

    if (reportError) {
      return NextResponse.json({
        success: false,
        error: 'No monthly report found: ' + reportError.message
      }, { status: 404 })
    }

    // Get separated table data
    const separatedData = await getFacebookDataSeparated(parseInt(clientId), monthlyReport.month_year)
    const separatedDataExists = !!separatedData

    // Calculate totals from raw data
    const rawData = monthlyReport.report_data
    const rawAnalysis = {
      campaigns_count: rawData.campaigns?.length || 0,
      demographics_count: rawData.demographics?.length || 0,
      ad_level_count: rawData.adLevel?.length || 0,
      hourly_count: rawData.hourly?.length || 0,
      
      // Calculate spend from demographics (where Facebook actually puts the spend data)
      demographics_total_spend: rawData.demographics?.reduce((sum: number, demo: any) => 
        sum + parseFloat(demo.spend || '0'), 0) || 0,
      
      // Calculate total impressions from demographics
      demographics_total_impressions: rawData.demographics?.reduce((sum: number, demo: any) => 
        sum + parseInt(demo.impressions || '0'), 0) || 0,
      
      // Calculate total reach from demographics  
      demographics_total_reach: rawData.demographics?.reduce((sum: number, demo: any) => 
        sum + parseInt(demo.reach || '0'), 0) || 0,
      
      // Sample records
      sample_campaign: rawData.campaigns?.[0] || null,
      sample_demographic: rawData.demographics?.[0] || null,
      sample_hourly: rawData.hourly?.[0] || null
    }

    return NextResponse.json({
      success: true,
      client_id: clientId,
      monthly_report: {
        id: monthlyReport.id,
        month_year: monthlyReport.month_year,
        scraped_at: monthlyReport.scraped_at,
        raw_analysis: rawAnalysis
      },
      separated_tables: {
        exists: separatedDataExists,
        campaigns_count: separatedData?.campaigns?.length || 0,
        demographics_count: separatedData?.demographics?.length || 0,
        regional_count: separatedData?.regional?.length || 0,
        devices_count: separatedData?.devices?.length || 0,
        platforms_count: separatedData?.platforms?.length || 0,
        ad_level_count: separatedData?.adLevel?.length || 0,
        month_identifier: separatedData?.month_identifier || null
      }
    })

  } catch (error) {
    console.error('Admin debug raw data error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get raw data'
    }, { status: 500 })
  }
}
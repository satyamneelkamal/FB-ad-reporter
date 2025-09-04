import { NextRequest, NextResponse } from 'next/server'
import { collectAllFacebookData, getDateRange } from '@/lib/facebook-api'

/**
 * Test Facebook API Connectivity
 * GET /api/test-facebook - Test basic connectivity and environment validation
 * POST /api/test-facebook - Test full data collection with optional ad account ID
 */

export async function GET() {
  try {
    console.log('🧪 Testing Facebook API connectivity...')

    // Check environment variables
    const requiredEnvVars = {
      FACEBOOK_ACCESS_TOKEN: !!process.env.FACEBOOK_ACCESS_TOKEN,
      FACEBOOK_AD_ACCOUNT_ID: !!process.env.FACEBOOK_AD_ACCOUNT_ID,
      FACEBOOK_API_VERSION: process.env.FACEBOOK_API_VERSION || 'v20.0'
    }

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => key !== 'FACEBOOK_API_VERSION' && !value)
      .map(([key]) => key)

    if (missingEnvVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        missing_vars: missingEnvVars,
        env_check: requiredEnvVars
      }, { status: 400 })
    }

    // Test basic API connectivity with a simple request
    const testUrl = `https://graph.facebook.com/${requiredEnvVars.FACEBOOK_API_VERSION}/me?access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`
    
    const response = await fetch(testUrl)
    const testData = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Facebook API authentication failed',
        facebook_error: testData.error,
        env_check: requiredEnvVars
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: 'Facebook API connectivity test passed',
      user_info: {
        id: testData.id,
        name: testData.name
      },
      env_check: requiredEnvVars,
      api_version: requiredEnvVars.FACEBOOK_API_VERSION,
      ad_account_id: process.env.FACEBOOK_AD_ACCOUNT_ID
    })

  } catch (error) {
    console.error('Facebook API test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Facebook API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { adAccountId, testEndpoint } = body

    console.log('🧪 Testing Facebook data collection...')

    if (testEndpoint) {
      // Test specific endpoint only
      return NextResponse.json({
        success: false,
        error: 'Single endpoint testing not implemented yet',
        available_endpoints: [
          'campaigns', 'demographics', 'regional', 
          'devices', 'platforms', 'hourly', 'adLevel'
        ]
      }, { status: 501 })
    }

    // Test full data collection
    const startTime = Date.now()
    const testAdAccountId = adAccountId || process.env.FACEBOOK_AD_ACCOUNT_ID!
    const dateRange = getDateRange()
    const result = await collectAllFacebookData(testAdAccountId, dateRange)
    const endTime = Date.now()
    const duration = endTime - startTime

    return NextResponse.json({
      success: true,
      message: 'Facebook data collection test completed',
      duration_ms: duration,
      collection_summary: result.collection_summary,
      date_range: result.date_range,
      month_identifier: result.month_identifier,
      sample_data: {
        campaigns_count: result.campaigns.length,
        demographics_count: result.demographics.length,
        regional_count: result.regional.length,
        devices_count: result.devices.length,
        platforms_count: result.platforms.length,
        // hourly_count: removed from API,
        adLevel_count: result.adLevel.length
      },
      // Include first record from each category for verification (without sensitive data)
      samples: {
        campaign: result.campaigns[0] ? {
          campaign_name: result.campaigns[0].campaign_name,
          objective: result.campaigns[0].objective,
          has_spend_data: !!result.campaigns[0].spend
        } : null,
        demographic: result.demographics[0] ? {
          age: result.demographics[0].age,
          gender: result.demographics[0].gender,
          has_spend_data: !!result.demographics[0].spend
        } : null,
        regional: result.regional[0] ? {
          region: result.regional[0].region,
          has_spend_data: !!result.regional[0].spend
        } : null
      }
    })

  } catch (error) {
    console.error('Facebook data collection test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Facebook data collection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
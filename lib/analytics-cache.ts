/**
 * Analytics Cache Management System
 * 
 * Processes raw Facebook data from separated tables into clean, consistent analytics
 * for fast dashboard queries. Eliminates data display issues by pre-processing
 * all calculations and storing them in analytics_cache table.
 * 
 * Updated to work with separated table structure instead of JSONB monthly_reports
 */

import { supabaseAdmin } from './supabase'
import { FacebookAnalytics } from './analytics'
import { getFacebookDataSeparated } from './data-storage-separated'
import type { Client, MonthlyReport } from './supabase'

export interface AnalyticsCacheData {
  // Overview metrics
  overview: {
    totalSpend: number
    activeCampaigns: number
    totalCampaigns: number
    totalAds: number
    totalPurchases?: number
    revenue?: number
    roas?: number
    totalReach?: number
    totalImpressions?: number
  }

  // Campaign analysis with distributed spend
  campaigns: Array<{
    id: string
    name: string
    spend: number
    objective: string
    buyingType: string
    optimizationGoal: string
    status: 'Active' | 'Inactive'
    dateStart: string
    dateStop: string
    duration?: number
  }>

  // Demographics data
  demographics: {
    available: boolean
    ageGroups?: { [key: string]: number }
    genders?: { [key: string]: number }
    topPerformingAges?: Array<{
      ageGroup: string
      spend: number
      percentage: number
    }>
    totalAudience?: number
  }

  // Regional analysis  
  regional: {
    available: boolean
    regions?: Array<{
      region: string
      spend: number
      clicks: number
      ctr: number
      cpc: number
      reach: number
      cpm: number
      percentage: number
    }>
    topRegion?: string
    activeRegions?: number
  }

  // Engagement metrics
  engagement: {
    totalClicks: number
    totalImpressions: number
    ctr: number
    avgCpc: number
    totalEngagement?: number
    engagementRate?: number
    socialActions?: number
  }

  // Campaign types analysis
  campaignTypes: Array<{
    objective: string
    campaigns: any[]
    totalSpend: number
    count: number
    avgSpend: number
    percentage: number
    status: 'Active' | 'Mixed' | 'Inactive'
  }>

  // Devices and platforms
  devicesAndPlatforms: {
    available: boolean
    devices?: Array<{
      device: string
      spend: number
      percentage: number
    }>
    platforms?: Array<{
      platform: string
      spend: number
      percentage: number
    }>
  }

  // Audience Profile analysis
  audienceProfile: any

  // Additional data for completeness
  adLevel: any[]
  
  // Data availability flags
  dataAvailability: {
    campaigns: boolean
    adLevel: boolean
    demographics: boolean
    regional: boolean
    devices: boolean
    platforms: boolean
  }

  // Metadata
  monthYear: string
  processedAt: string
  sourceDataId: number
}

/**
 * Process Facebook data from separated tables into clean analytics cache format
 */
export async function processSeparatedDataToCache(
  clientId: number,
  facebookData: any
): Promise<AnalyticsCacheData> {
  console.log(`📊 Processing separated data to analytics cache for client ${clientId}, month ${facebookData.month_identifier}`)

  try {
    // Generate full analytics using existing FacebookAnalytics class
    const analytics = FacebookAnalytics.generateFullAnalytics(facebookData)
    
    // Calculate total audience from demographics if available
    let totalAudience = 0
    if (analytics.demographics.available && facebookData.demographics) {
      totalAudience = facebookData.demographics.reduce(
        (sum: number, demo: any) => sum + parseInt(demo.reach || '0'), 0
      )
    }

    // Build clean analytics cache data structure
    const cacheData: AnalyticsCacheData = {
      overview: analytics.overview,
      campaigns: analytics.campaigns,
      demographics: {
        ...analytics.demographics,
        totalAudience: totalAudience > 0 ? totalAudience : undefined
      },
      regional: analytics.regional,
      engagement: analytics.engagement,
      campaignTypes: analytics.campaignTypes,
      devicesAndPlatforms: analytics.devicesAndPlatforms,
      audienceProfile: analytics.audienceProfile,
      adLevel: analytics.adLevel || [],
      dataAvailability: analytics.dataAvailability,
      monthYear: facebookData.month_identifier,
      processedAt: new Date().toISOString(),
      sourceDataId: 0 // No longer using single monthly_reports ID
    }

    console.log(`✅ Separated data analytics cache processed successfully:
    - Total Spend: $${cacheData.overview.totalSpend?.toFixed(2) || '0.00'}
    - Active Campaigns: ${cacheData.overview.activeCampaigns || 0}
    - Total Audience: ${totalAudience || 'N/A'}`)

    return cacheData

  } catch (error) {
    console.error('❌ Error processing separated data analytics cache:', error)
    throw error
  }
}

/**
 * Process raw monthly report data into clean analytics cache format
 * @deprecated - Use processSeparatedDataToCache for new separated table structure
 */
export async function processReportToCache(
  clientId: number,
  monthlyReport: MonthlyReport
): Promise<AnalyticsCacheData> {
  console.log(`📊 Processing analytics cache for client ${clientId}, month ${monthlyReport.month_year} [LEGACY]`)

  try {
    // Generate full analytics using existing FacebookAnalytics class
    const analytics = FacebookAnalytics.generateFullAnalytics(monthlyReport.report_data)
    
    // Calculate total audience from demographics if available
    let totalAudience = 0
    if (analytics.demographics.available && monthlyReport.report_data.demographics) {
      totalAudience = monthlyReport.report_data.demographics.reduce(
        (sum: number, demo: any) => sum + parseInt(demo.reach || '0'), 0
      )
    }

    // Build clean analytics cache data structure
    const cacheData: AnalyticsCacheData = {
      overview: analytics.overview,
      campaigns: analytics.campaigns,
      demographics: {
        ...analytics.demographics,
        totalAudience: totalAudience > 0 ? totalAudience : undefined
      },
      regional: analytics.regional,
      engagement: analytics.engagement,
      campaignTypes: analytics.campaignTypes,
      devicesAndPlatforms: analytics.devicesAndPlatforms,
      audienceProfile: analytics.audienceProfile,
      adLevel: analytics.adLevel || [],
      dataAvailability: analytics.dataAvailability,
      monthYear: monthlyReport.month_year,
      processedAt: new Date().toISOString(),
      sourceDataId: monthlyReport.id
    }

    console.log(`✅ Legacy analytics cache processed successfully:
    - Total Spend: $${cacheData.overview.totalSpend.toFixed(2)}
    - Active Campaigns: ${cacheData.overview.activeCampaigns}
    - Total Audience: ${totalAudience || 'N/A'}`)

    return cacheData

  } catch (error) {
    console.error('❌ Error processing legacy analytics cache:', error)
    throw error
  }
}

/**
 * Save processed analytics to cache table
 */
export async function saveAnalyticsCache(
  clientId: number,
  analyticsData: AnalyticsCacheData
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`💾 Saving analytics cache for client ${clientId}`)

    // Upsert analytics cache data
    const { error } = await supabaseAdmin
      .from('analytics_cache')
      .upsert({
        client_id: clientId,
        analytics_data: analyticsData,
        last_updated: new Date().toISOString(),
        data_source: 'facebook_api'
      }, {
        onConflict: 'client_id'
      })

    if (error) {
      console.error('❌ Failed to save analytics cache:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Analytics cache saved successfully for client ${clientId}`)
    return { success: true }

  } catch (error) {
    console.error('❌ Error saving analytics cache:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get analytics data from cache
 */
export async function getAnalyticsCache(
  clientId: number
): Promise<{ success: boolean; data?: AnalyticsCacheData; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('analytics_cache')
      .select('analytics_data, last_updated')
      .eq('client_id', clientId)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'No analytics cache found for client' }
    }

    return {
      success: true,
      data: data.analytics_data as AnalyticsCacheData
    }

  } catch (error) {
    console.error('❌ Error retrieving analytics cache:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Process Facebook data from separated tables into analytics cache
 * This should be called whenever new data is collected
 */
export async function refreshAnalyticsCache(
  clientId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🔄 Refreshing analytics cache for client ${clientId}`)

    // Find the most recent month with data in separated tables
    const { data: recentCampaigns, error: campaignsError } = await supabaseAdmin
      .from('fb_campaigns')
      .select('month_year, scraped_at')
      .eq('client_id', clientId)
      .order('scraped_at', { ascending: false })
      .limit(1)

    if (campaignsError) {
      return { success: false, error: campaignsError.message }
    }

    if (!recentCampaigns || recentCampaigns.length === 0) {
      return { success: false, error: 'No Facebook data found in separated tables for client' }
    }

    const latestMonthYear = recentCampaigns[0].month_year

    // Get all Facebook data from separated tables for the latest month
    const facebookData = await getFacebookDataSeparated(clientId, latestMonthYear)
    
    if (!facebookData) {
      return { success: false, error: 'Failed to retrieve Facebook data from separated tables' }
    }

    // Process the separated data into analytics cache format
    const analyticsData = await processSeparatedDataToCache(clientId, facebookData)

    // Save to cache
    const saveResult = await saveAnalyticsCache(clientId, analyticsData)
    if (!saveResult.success) {
      return saveResult
    }

    console.log(`✅ Analytics cache refreshed for client ${clientId}`)
    return { success: true }

  } catch (error) {
    console.error('❌ Error refreshing analytics cache:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Batch refresh analytics cache for all clients with data
 */
export async function batchRefreshAnalyticsCache(): Promise<{
  success: boolean
  processed: number
  errors: number
  details: Array<{ clientId: number; success: boolean; error?: string }>
}> {
  try {
    console.log('🔄 Starting batch analytics cache refresh...')

    // Get all clients with monthly reports
    const { data: clients, error } = await supabaseAdmin
      .from('monthly_reports')
      .select('client_id')
      .order('client_id')

    if (error) {
      throw error
    }

    if (!clients || clients.length === 0) {
      console.log('ℹ️  No clients with data found')
      return { success: true, processed: 0, errors: 0, details: [] }
    }

    // Get unique client IDs
    const uniqueClientIds = [...new Set(clients.map(c => c.client_id))]
    
    console.log(`📊 Processing analytics cache for ${uniqueClientIds.length} clients`)

    const details: Array<{ clientId: number; success: boolean; error?: string }> = []
    let processed = 0
    let errors = 0

    // Process each client
    for (const clientId of uniqueClientIds) {
      const result = await refreshAnalyticsCache(clientId)
      
      if (result.success) {
        processed++
      } else {
        errors++
      }

      details.push({
        clientId,
        success: result.success,
        error: result.error
      })

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`✅ Batch analytics cache refresh complete:
    - Processed: ${processed}
    - Errors: ${errors}
    - Total: ${uniqueClientIds.length}`)

    return {
      success: errors === 0,
      processed,
      errors,
      details
    }

  } catch (error) {
    console.error('❌ Error in batch analytics cache refresh:', error)
    return {
      success: false,
      processed: 0,
      errors: 1,
      details: []
    }
  }
}
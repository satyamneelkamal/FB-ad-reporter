/**
 * Data Storage Functions for Separate Facebook Data Tables
 * 
 * Handles storing Facebook API data into normalized separate tables
 * instead of the old JSONB approach
 */

import { supabaseAdmin } from '@/lib/supabase'

export interface FacebookDataCollectionSeparated {
  campaigns: any[];
  demographics: any[];
  regional: any[];
  devices: any[];
  platforms: any[];
  adLevel: any[];
  scraped_at: string;
  date_range: {
    since: string;
    until: string;
  };
  month_identifier: string;
  collection_summary: {
    total_records: number;
    successful_endpoints: number;
    failed_endpoints: string[];
    warnings: string[];
  };
}

/**
 * Store Facebook data in separate normalized tables
 */
export async function storeFacebookDataSeparated(
  clientId: number,
  monthYear: string,
  reportData: FacebookDataCollectionSeparated
): Promise<{ success: boolean; errors: string[]; recordsInserted: number }> {
  const errors: string[] = []
  let totalRecordsInserted = 0

  try {
    // Helper function to convert string values to appropriate types
    const convertValue = (value: any): any => {
      if (value === null || value === undefined || value === '') return null
      if (typeof value === 'string' && !isNaN(Number(value))) {
        return parseFloat(value)
      }
      return value
    }

    // Helper function to convert date strings
    const convertDate = (dateStr: string): string | null => {
      if (!dateStr) return null
      try {
        return new Date(dateStr).toISOString().split('T')[0]
      } catch {
        return null
      }
    }

    // 1. Store Campaigns Data
    if (reportData.campaigns && reportData.campaigns.length > 0) {
      const campaignInserts = reportData.campaigns.map(campaign => ({
        client_id: clientId,
        month_year: monthYear,
        campaign_id: campaign.campaign_id,
        campaign_name: campaign.campaign_name,
        adset_id: campaign.adset_id,
        adset_name: campaign.adset_name,
        objective: campaign.objective,
        optimization_goal: campaign.optimization_goal,
        buying_type: campaign.buying_type,
        attribution_setting: campaign.attribution_setting,
        impressions: convertValue(campaign.impressions),
        reach: convertValue(campaign.reach),
        frequency: convertValue(campaign.frequency),
        clicks: convertValue(campaign.clicks),
        unique_clicks: convertValue(campaign.unique_clicks),
        cpm: convertValue(campaign.cpm),
        cpc: convertValue(campaign.cpc),
        cpp: convertValue(campaign.cpp),
        ctr: convertValue(campaign.ctr),
        unique_ctr: convertValue(campaign.unique_ctr),
        cost_per_unique_click: convertValue(campaign.cost_per_unique_click),
        spend: convertValue(campaign.spend),
        inline_link_clicks: convertValue(campaign.inline_link_clicks),
        inline_link_click_ctr: convertValue(campaign.inline_link_click_ctr),
        outbound_clicks: campaign.outbound_clicks || null,
        outbound_clicks_ctr: campaign.outbound_clicks_ctr || null,
        actions: campaign.actions || null,
        action_values: campaign.action_values || null,
        conversions: campaign.conversions || null,
        conversion_values: campaign.conversion_values || null,
        cost_per_conversion: campaign.cost_per_conversion || null,
        cost_per_action_type: campaign.cost_per_action_type || null,
        purchase_roas: campaign.purchase_roas || null,
        website_purchase_roas: campaign.website_purchase_roas || null,
        mobile_app_purchase_roas: campaign.mobile_app_purchase_roas || null,
        unique_inline_link_clicks: convertValue(campaign.unique_inline_link_clicks),
        unique_inline_link_click_ctr: convertValue(campaign.unique_inline_link_click_ctr),
        unique_outbound_clicks: campaign.unique_outbound_clicks || null,
        unique_outbound_clicks_ctr: campaign.unique_outbound_clicks_ctr || null,
        cost_per_unique_outbound_click: campaign.cost_per_unique_outbound_click || null,
        cost_per_unique_inline_link_click: convertValue(campaign.cost_per_unique_inline_link_click),
        date_start: convertDate(campaign.date_start),
        date_stop: convertDate(campaign.date_stop),
        scraped_at: reportData.scraped_at
      }))

      const { error: campaignError, count } = await supabaseAdmin
        .from('fb_campaigns')
        .upsert(campaignInserts, { 
          onConflict: 'client_id,month_year,campaign_id',
          count: 'exact'
        })

      if (campaignError) {
        errors.push(`Campaigns: ${campaignError.message}`)
      } else {
        totalRecordsInserted += count || 0
        console.log(`✅ Stored ${count} campaign records`)
      }
    }

    // 2. Store Demographics Data
    if (reportData.demographics && reportData.demographics.length > 0) {
      const demographicsInserts = reportData.demographics.map(demo => ({
        client_id: clientId,
        month_year: monthYear,
        age: demo.age,
        gender: demo.gender,
        impressions: convertValue(demo.impressions),
        reach: convertValue(demo.reach),
        frequency: convertValue(demo.frequency),
        clicks: convertValue(demo.clicks),
        unique_clicks: convertValue(demo.unique_clicks),
        cpm: convertValue(demo.cpm),
        cpc: convertValue(demo.cpc),
        cpp: convertValue(demo.cpp),
        ctr: convertValue(demo.ctr),
        unique_ctr: convertValue(demo.unique_ctr),
        cost_per_unique_click: convertValue(demo.cost_per_unique_click),
        spend: convertValue(demo.spend),
        inline_link_clicks: convertValue(demo.inline_link_clicks),
        inline_link_click_ctr: convertValue(demo.inline_link_click_ctr),
        outbound_clicks: demo.outbound_clicks || null,
        outbound_clicks_ctr: demo.outbound_clicks_ctr || null,
        actions: demo.actions || null,
        action_values: demo.action_values || null,
        conversions: demo.conversions || null,
        conversion_values: demo.conversion_values || null,
        cost_per_conversion: demo.cost_per_conversion || null,
        cost_per_action_type: demo.cost_per_action_type || null,
        purchase_roas: demo.purchase_roas || null,
        website_purchase_roas: demo.website_purchase_roas || null,
        mobile_app_purchase_roas: demo.mobile_app_purchase_roas || null,
        unique_inline_link_clicks: convertValue(demo.unique_inline_link_clicks),
        unique_inline_link_click_ctr: convertValue(demo.unique_inline_link_click_ctr),
        unique_outbound_clicks: demo.unique_outbound_clicks || null,
        unique_outbound_clicks_ctr: demo.unique_outbound_clicks_ctr || null,
        cost_per_unique_outbound_click: demo.cost_per_unique_outbound_click || null,
        cost_per_unique_inline_link_click: convertValue(demo.cost_per_unique_inline_link_click),
        date_start: convertDate(demo.date_start),
        date_stop: convertDate(demo.date_stop),
        scraped_at: reportData.scraped_at
      }))

      const { error: demographicsError, count } = await supabaseAdmin
        .from('fb_demographics')
        .upsert(demographicsInserts, {
          onConflict: 'client_id,month_year,age,gender',
          count: 'exact'
        })

      if (demographicsError) {
        errors.push(`Demographics: ${demographicsError.message}`)
      } else {
        totalRecordsInserted += count || 0
        console.log(`✅ Stored ${count} demographics records`)
      }
    }

    // 3. Store Regional Data
    if (reportData.regional && reportData.regional.length > 0) {
      const regionalInserts = reportData.regional.map(regional => ({
        client_id: clientId,
        month_year: monthYear,
        region: regional.region,
        account_id: regional.account_id,
        account_name: regional.account_name,
        objective: regional.objective,
        optimization_goal: regional.optimization_goal,
        buying_type: regional.buying_type,
        attribution_setting: regional.attribution_setting,
        impressions: convertValue(regional.impressions),
        reach: convertValue(regional.reach),
        frequency: convertValue(regional.frequency),
        clicks: convertValue(regional.clicks),
        unique_clicks: convertValue(regional.unique_clicks),
        cpm: convertValue(regional.cpm),
        cpc: convertValue(regional.cpc),
        cpp: convertValue(regional.cpp),
        ctr: convertValue(regional.ctr),
        unique_ctr: convertValue(regional.unique_ctr),
        cost_per_unique_click: convertValue(regional.cost_per_unique_click),
        spend: convertValue(regional.spend),
        inline_link_clicks: convertValue(regional.inline_link_clicks),
        inline_link_click_ctr: convertValue(regional.inline_link_click_ctr),
        outbound_clicks: regional.outbound_clicks || null,
        outbound_clicks_ctr: regional.outbound_clicks_ctr || null,
        actions: regional.actions || null,
        action_values: regional.action_values || null,
        conversions: regional.conversions || null,
        conversion_values: regional.conversion_values || null,
        cost_per_conversion: regional.cost_per_conversion || null,
        cost_per_action_type: regional.cost_per_action_type || null,
        purchase_roas: regional.purchase_roas || null,
        website_purchase_roas: regional.website_purchase_roas || null,
        mobile_app_purchase_roas: regional.mobile_app_purchase_roas || null,
        unique_inline_link_clicks: convertValue(regional.unique_inline_link_clicks),
        unique_inline_link_click_ctr: convertValue(regional.unique_inline_link_click_ctr),
        unique_outbound_clicks: regional.unique_outbound_clicks || null,
        unique_outbound_clicks_ctr: regional.unique_outbound_clicks_ctr || null,
        cost_per_unique_outbound_click: regional.cost_per_unique_outbound_click || null,
        cost_per_unique_inline_link_click: convertValue(regional.cost_per_unique_inline_link_click),
        date_start: convertDate(regional.date_start),
        date_stop: convertDate(regional.date_stop),
        scraped_at: reportData.scraped_at
      }))

      const { error: regionalError, count } = await supabaseAdmin
        .from('fb_regional')
        .upsert(regionalInserts, {
          onConflict: 'client_id,month_year,region',
          count: 'exact'
        })

      if (regionalError) {
        errors.push(`Regional: ${regionalError.message}`)
      } else {
        totalRecordsInserted += count || 0
        console.log(`✅ Stored ${count} regional records`)
      }
    }

    // 4. Store Device Data
    if (reportData.devices && reportData.devices.length > 0) {
      const deviceInserts = reportData.devices.map(device => ({
        client_id: clientId,
        month_year: monthYear,
        device_platform: device.device_platform,
        impressions: convertValue(device.impressions),
        reach: convertValue(device.reach),
        frequency: convertValue(device.frequency),
        clicks: convertValue(device.clicks),
        unique_clicks: convertValue(device.unique_clicks),
        cpm: convertValue(device.cpm),
        cpc: convertValue(device.cpc),
        cpp: convertValue(device.cpp),
        ctr: convertValue(device.ctr),
        unique_ctr: convertValue(device.unique_ctr),
        cost_per_unique_click: convertValue(device.cost_per_unique_click),
        spend: convertValue(device.spend),
        inline_link_clicks: convertValue(device.inline_link_clicks),
        inline_link_click_ctr: convertValue(device.inline_link_click_ctr),
        outbound_clicks: device.outbound_clicks || null,
        outbound_clicks_ctr: device.outbound_clicks_ctr || null,
        actions: device.actions || null,
        action_values: device.action_values || null,
        conversions: device.conversions || null,
        conversion_values: device.conversion_values || null,
        cost_per_conversion: device.cost_per_conversion || null,
        cost_per_action_type: device.cost_per_action_type || null,
        purchase_roas: device.purchase_roas || null,
        website_purchase_roas: device.website_purchase_roas || null,
        mobile_app_purchase_roas: device.mobile_app_purchase_roas || null,
        unique_inline_link_clicks: convertValue(device.unique_inline_link_clicks),
        unique_inline_link_click_ctr: convertValue(device.unique_inline_link_click_ctr),
        unique_outbound_clicks: device.unique_outbound_clicks || null,
        unique_outbound_clicks_ctr: device.unique_outbound_clicks_ctr || null,
        cost_per_unique_outbound_click: device.cost_per_unique_outbound_click || null,
        cost_per_unique_inline_link_click: convertValue(device.cost_per_unique_inline_link_click),
        date_start: convertDate(device.date_start),
        date_stop: convertDate(device.date_stop),
        scraped_at: reportData.scraped_at
      }))

      const { error: deviceError, count } = await supabaseAdmin
        .from('fb_devices')
        .upsert(deviceInserts, {
          onConflict: 'client_id,month_year,device_platform',
          count: 'exact'
        })

      if (deviceError) {
        errors.push(`Devices: ${deviceError.message}`)
      } else {
        totalRecordsInserted += count || 0
        console.log(`✅ Stored ${count} device records`)
      }
    }

    // 5. Store Platform Data
    if (reportData.platforms && reportData.platforms.length > 0) {
      const platformInserts = reportData.platforms.map(platform => ({
        client_id: clientId,
        month_year: monthYear,
        publisher_platform: platform.publisher_platform,
        platform_position: platform.platform_position,
        impressions: convertValue(platform.impressions),
        reach: convertValue(platform.reach),
        frequency: convertValue(platform.frequency),
        clicks: convertValue(platform.clicks),
        unique_clicks: convertValue(platform.unique_clicks),
        cpm: convertValue(platform.cpm),
        cpc: convertValue(platform.cpc),
        cpp: convertValue(platform.cpp),
        ctr: convertValue(platform.ctr),
        unique_ctr: convertValue(platform.unique_ctr),
        cost_per_unique_click: convertValue(platform.cost_per_unique_click),
        spend: convertValue(platform.spend),
        inline_link_clicks: convertValue(platform.inline_link_clicks),
        inline_link_click_ctr: convertValue(platform.inline_link_click_ctr),
        outbound_clicks: platform.outbound_clicks || null,
        outbound_clicks_ctr: platform.outbound_clicks_ctr || null,
        actions: platform.actions || null,
        action_values: platform.action_values || null,
        conversions: platform.conversions || null,
        conversion_values: platform.conversion_values || null,
        cost_per_conversion: platform.cost_per_conversion || null,
        cost_per_action_type: platform.cost_per_action_type || null,
        purchase_roas: platform.purchase_roas || null,
        website_purchase_roas: platform.website_purchase_roas || null,
        mobile_app_purchase_roas: platform.mobile_app_purchase_roas || null,
        unique_inline_link_clicks: convertValue(platform.unique_inline_link_clicks),
        unique_inline_link_click_ctr: convertValue(platform.unique_inline_link_click_ctr),
        unique_outbound_clicks: platform.unique_outbound_clicks || null,
        unique_outbound_clicks_ctr: platform.unique_outbound_clicks_ctr || null,
        cost_per_unique_outbound_click: platform.cost_per_unique_outbound_click || null,
        cost_per_unique_inline_link_click: convertValue(platform.cost_per_unique_inline_link_click),
        date_start: convertDate(platform.date_start),
        date_stop: convertDate(platform.date_stop),
        scraped_at: reportData.scraped_at
      }))

      const { error: platformError, count } = await supabaseAdmin
        .from('fb_platforms')
        .upsert(platformInserts, {
          onConflict: 'client_id,month_year,publisher_platform,platform_position',
          count: 'exact'
        })

      if (platformError) {
        errors.push(`Platforms: ${platformError.message}`)
      } else {
        totalRecordsInserted += count || 0
        console.log(`✅ Stored ${count} platform records`)
      }
    }

    // 6. Store Ad Level Data
    if (reportData.adLevel && reportData.adLevel.length > 0) {
      const adLevelInserts = reportData.adLevel.map(ad => ({
        client_id: clientId,
        month_year: monthYear,
        campaign_id: ad.campaign_id,
        campaign_name: ad.campaign_name,
        adset_id: ad.adset_id,
        adset_name: ad.adset_name,
        ad_id: ad.ad_id,
        ad_name: ad.ad_name,
        objective: ad.objective,
        optimization_goal: ad.optimization_goal,
        buying_type: ad.buying_type,
        attribution_setting: ad.attribution_setting,
        impressions: convertValue(ad.impressions),
        reach: convertValue(ad.reach),
        frequency: convertValue(ad.frequency),
        clicks: convertValue(ad.clicks),
        unique_clicks: convertValue(ad.unique_clicks),
        cpm: convertValue(ad.cpm),
        cpc: convertValue(ad.cpc),
        cpp: convertValue(ad.cpp),
        ctr: convertValue(ad.ctr),
        unique_ctr: convertValue(ad.unique_ctr),
        cost_per_unique_click: convertValue(ad.cost_per_unique_click),
        spend: convertValue(ad.spend),
        inline_link_clicks: convertValue(ad.inline_link_clicks),
        inline_link_click_ctr: convertValue(ad.inline_link_click_ctr),
        outbound_clicks: ad.outbound_clicks || null,
        outbound_clicks_ctr: ad.outbound_clicks_ctr || null,
        actions: ad.actions || null,
        action_values: ad.action_values || null,
        conversions: ad.conversions || null,
        conversion_values: ad.conversion_values || null,
        cost_per_conversion: ad.cost_per_conversion || null,
        cost_per_action_type: ad.cost_per_action_type || null,
        purchase_roas: ad.purchase_roas || null,
        website_purchase_roas: ad.website_purchase_roas || null,
        mobile_app_purchase_roas: ad.mobile_app_purchase_roas || null,
        unique_inline_link_clicks: convertValue(ad.unique_inline_link_clicks),
        unique_inline_link_click_ctr: convertValue(ad.unique_inline_link_click_ctr),
        unique_outbound_clicks: ad.unique_outbound_clicks || null,
        unique_outbound_clicks_ctr: ad.unique_outbound_clicks_ctr || null,
        cost_per_unique_outbound_click: ad.cost_per_unique_outbound_click || null,
        cost_per_unique_inline_link_click: convertValue(ad.cost_per_unique_inline_link_click),
        date_start: convertDate(ad.date_start),
        date_stop: convertDate(ad.date_stop),
        scraped_at: reportData.scraped_at
      }))

      const { error: adLevelError, count } = await supabaseAdmin
        .from('fb_ad_level')
        .upsert(adLevelInserts, {
          onConflict: 'client_id,month_year,ad_id',
          count: 'exact'
        })

      if (adLevelError) {
        errors.push(`Ad Level: ${adLevelError.message}`)
      } else {
        totalRecordsInserted += count || 0
        console.log(`✅ Stored ${count} ad level records`)
      }
    }

    console.log(`🎉 Total records inserted across all tables: ${totalRecordsInserted}`)

    return {
      success: errors.length === 0,
      errors,
      recordsInserted: totalRecordsInserted
    }

  } catch (error) {
    console.error('Error storing Facebook data:', error)
    return {
      success: false,
      errors: [`Storage error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      recordsInserted: totalRecordsInserted
    }
  }
}

/**
 * Retrieve Facebook data from separate tables for analytics processing
 */
export async function getFacebookDataSeparated(
  clientId: number,
  monthYear: string
): Promise<FacebookDataCollectionSeparated | null> {
  try {
    console.log(`📊 Fetching separated Facebook data for client ${clientId}, month ${monthYear}`)

    // Fetch data from all separate tables in parallel
    const [
      campaignsResult,
      demographicsResult,
      regionalResult,
      devicesResult,
      platformsResult,
      adLevelResult
    ] = await Promise.all([
      supabaseAdmin.from('fb_campaigns').select('*').eq('client_id', clientId).eq('month_year', monthYear),
      supabaseAdmin.from('fb_demographics').select('*').eq('client_id', clientId).eq('month_year', monthYear),
      supabaseAdmin.from('fb_regional').select('*').eq('client_id', clientId).eq('month_year', monthYear),
      supabaseAdmin.from('fb_devices').select('*').eq('client_id', clientId).eq('month_year', monthYear),
      supabaseAdmin.from('fb_platforms').select('*').eq('client_id', clientId).eq('month_year', monthYear),
      supabaseAdmin.from('fb_ad_level').select('*').eq('client_id', clientId).eq('month_year', monthYear)
    ])

    // Check for errors
    const errors = [
      campaignsResult.error,
      demographicsResult.error,
      regionalResult.error,
      devicesResult.error,
      platformsResult.error,
      adLevelResult.error
    ].filter(Boolean)

    if (errors.length > 0) {
      console.error('Errors fetching separated data:', errors)
      return null
    }

    const campaigns = campaignsResult.data || []
    const demographics = demographicsResult.data || []
    const regional = regionalResult.data || []
    const devices = devicesResult.data || []
    const platforms = platformsResult.data || []
    const adLevel = adLevelResult.data || []

    if (campaigns.length === 0 && demographics.length === 0 && regional.length === 0 && 
        devices.length === 0 && platforms.length === 0 && adLevel.length === 0) {
      console.log('No data found in separate tables')
      return null
    }

    // Get scraped_at from first available record
    const scrapedAt = campaigns[0]?.scraped_at || 
                     demographics[0]?.scraped_at || 
                     regional[0]?.scraped_at || 
                     devices[0]?.scraped_at || 
                     platforms[0]?.scraped_at || 
                     adLevel[0]?.scraped_at || 
                     new Date().toISOString()

    // Calculate date range from available data
    const dates = [...campaigns, ...demographics, ...regional, ...devices, ...platforms, ...adLevel]
      .map(record => ({ start: record.date_start, stop: record.date_stop }))
      .filter(d => d.start && d.stop)

    let dateRange = {
      since: monthYear + '-01',
      until: monthYear + '-31'
    }

    if (dates.length > 0) {
      const sortedStartDates = dates.map(d => d.start).sort()
      const sortedEndDates = dates.map(d => d.stop).sort()
      dateRange = {
        since: sortedStartDates[0],
        until: sortedEndDates[sortedEndDates.length - 1]
      }
    }

    const totalRecords = campaigns.length + demographics.length + regional.length + 
                        devices.length + platforms.length + adLevel.length

    console.log(`✅ Retrieved ${totalRecords} records from separate tables`)

    return {
      campaigns,
      demographics,
      regional,
      devices,
      platforms,
      adLevel,
      scraped_at: scrapedAt,
      date_range: dateRange,
      month_identifier: monthYear,
      collection_summary: {
        total_records: totalRecords,
        successful_endpoints: 6, // All 6 data types
        failed_endpoints: [],
        warnings: []
      }
    }

  } catch (error) {
    console.error('Error retrieving separated Facebook data:', error)
    return null
  }
}
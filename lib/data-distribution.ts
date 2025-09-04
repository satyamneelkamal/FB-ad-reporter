/**
 * Data Distribution System
 * 
 * Takes data from monthly_reports JSONB and distributes it to separated tables
 * for better performance and easier querying
 */

import { supabaseAdmin } from '@/lib/supabase'

interface MonthlyReportData {
  client_id: number;
  month_year: string;
  report_data: {
    campaigns: any[];
    demographics: any[];
    regional: any[];
    devices: any[];
    platforms: any[];
    adLevel: any[];
    scraped_at: string;
    collection_summary?: {
      total_records: number;
    };
  };
}

export interface DistributionResult {
  success: boolean;
  errors: string[];
  recordsDistributed: number;
  tablesUpdated: string[];
}

/**
 * Distribute data from monthly_reports to separated tables
 */
export async function distributeReportData(
  clientId: number,
  monthYear: string
): Promise<DistributionResult> {
  const errors: string[] = [];
  const tablesUpdated: string[] = [];
  let totalRecordsDistributed = 0;

  try {
    console.log(`📊 Starting data distribution for client ${clientId}, month ${monthYear}`);

    // Get the report data from monthly_reports
    const { data: report, error: fetchError } = await supabaseAdmin
      .from('monthly_reports')
      .select('client_id, month_year, report_data, scraped_at')
      .eq('client_id', clientId)
      .eq('month_year', monthYear)
      .single();

    if (fetchError || !report) {
      return {
        success: false,
        errors: [`Failed to fetch report data: ${fetchError?.message || 'Report not found'}`],
        recordsDistributed: 0,
        tablesUpdated: []
      };
    }

    const reportData = report.report_data;
    const scrapedAt = reportData.scraped_at || report.scraped_at;

    // Helper function to convert values
    const convertValue = (value: any): any => {
      if (value === null || value === undefined || value === '') return null;
      if (typeof value === 'string' && !isNaN(Number(value))) {
        return parseFloat(value);
      }
      return value;
    };

    const convertDate = (dateStr: string): string | null => {
      if (!dateStr) return null;
      try {
        return new Date(dateStr).toISOString().split('T')[0];
      } catch {
        return null;
      }
    };

    // 1. Distribute Campaigns Data
    if (reportData.campaigns && reportData.campaigns.length > 0) {
      console.log(`📈 Distributing ${reportData.campaigns.length} campaign records...`);
      
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
        scraped_at: scrapedAt
      }));

      const { error: campaignError, count } = await supabaseAdmin
        .from('fb_campaigns')
        .upsert(campaignInserts, { 
          onConflict: 'client_id,month_year,campaign_id',
          count: 'exact'
        });

      if (campaignError) {
        errors.push(`Campaigns: ${campaignError.message}`);
      } else {
        totalRecordsDistributed += count || 0;
        tablesUpdated.push('fb_campaigns');
        console.log(`✅ Distributed ${count} campaign records`);
      }
    }

    // 2. Distribute Demographics Data
    if (reportData.demographics && reportData.demographics.length > 0) {
      console.log(`👥 Distributing ${reportData.demographics.length} demographics records...`);
      
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
        scraped_at: scrapedAt
      }));

      const { error: demographicsError, count } = await supabaseAdmin
        .from('fb_demographics')
        .upsert(demographicsInserts, {
          onConflict: 'client_id,month_year,age,gender',
          count: 'exact'
        });

      if (demographicsError) {
        errors.push(`Demographics: ${demographicsError.message}`);
      } else {
        totalRecordsDistributed += count || 0;
        tablesUpdated.push('fb_demographics');
        console.log(`✅ Distributed ${count} demographics records`);
      }
    }

    // 3. Distribute Regional Data
    if (reportData.regional && reportData.regional.length > 0) {
      console.log(`🌍 Distributing ${reportData.regional.length} regional records...`);
      
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
        scraped_at: scrapedAt
      }));

      const { error: regionalError, count } = await supabaseAdmin
        .from('fb_regional')
        .upsert(regionalInserts, {
          onConflict: 'client_id,month_year,region',
          count: 'exact'
        });

      if (regionalError) {
        errors.push(`Regional: ${regionalError.message}`);
      } else {
        totalRecordsDistributed += count || 0;
        tablesUpdated.push('fb_regional');
        console.log(`✅ Distributed ${count} regional records`);
      }
    }

    // 4. Distribute Device Data
    if (reportData.devices && reportData.devices.length > 0) {
      console.log(`📱 Distributing ${reportData.devices.length} device records...`);
      
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
        scraped_at: scrapedAt
      }));

      const { error: deviceError, count } = await supabaseAdmin
        .from('fb_devices')
        .upsert(deviceInserts, {
          onConflict: 'client_id,month_year,device_platform',
          count: 'exact'
        });

      if (deviceError) {
        errors.push(`Devices: ${deviceError.message}`);
      } else {
        totalRecordsDistributed += count || 0;
        tablesUpdated.push('fb_devices');
        console.log(`✅ Distributed ${count} device records`);
      }
    }

    // 5. Distribute Platform Data
    if (reportData.platforms && reportData.platforms.length > 0) {
      console.log(`🖥️ Distributing ${reportData.platforms.length} platform records...`);
      
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
        scraped_at: scrapedAt
      }));

      const { error: platformError, count } = await supabaseAdmin
        .from('fb_platforms')
        .upsert(platformInserts, {
          onConflict: 'client_id,month_year,publisher_platform,platform_position',
          count: 'exact'
        });

      if (platformError) {
        errors.push(`Platforms: ${platformError.message}`);
      } else {
        totalRecordsDistributed += count || 0;
        tablesUpdated.push('fb_platforms');
        console.log(`✅ Distributed ${count} platform records`);
      }
    }

    // 6. Distribute Ad Level Data
    if (reportData.adLevel && reportData.adLevel.length > 0) {
      console.log(`🎯 Distributing ${reportData.adLevel.length} ad level records...`);
      
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
        scraped_at: scrapedAt
      }));

      const { error: adLevelError, count } = await supabaseAdmin
        .from('fb_ad_level')
        .upsert(adLevelInserts, {
          onConflict: 'client_id,month_year,ad_id',
          count: 'exact'
        });

      if (adLevelError) {
        errors.push(`Ad Level: ${adLevelError.message}`);
      } else {
        totalRecordsDistributed += count || 0;
        tablesUpdated.push('fb_ad_level');
        console.log(`✅ Distributed ${count} ad level records`);
      }
    }

    console.log(`🎉 Data distribution completed!`);
    console.log(`📊 Total records distributed: ${totalRecordsDistributed}`);
    console.log(`📋 Tables updated: ${tablesUpdated.join(', ')}`);

    return {
      success: errors.length === 0,
      errors,
      recordsDistributed: totalRecordsDistributed,
      tablesUpdated
    };

  } catch (error) {
    console.error('❌ Data distribution error:', error);
    return {
      success: false,
      errors: [`Distribution error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      recordsDistributed: totalRecordsDistributed,
      tablesUpdated
    };
  }
}

/**
 * Distribute data for all reports in monthly_reports that haven't been distributed yet
 */
export async function distributeAllReports(): Promise<DistributionResult> {
  const allErrors: string[] = [];
  const allTablesUpdated = new Set<string>();
  let totalRecordsDistributed = 0;

  try {
    // Get all reports from monthly_reports
    const { data: reports, error: fetchError } = await supabaseAdmin
      .from('monthly_reports')
      .select('client_id, month_year');

    if (fetchError) {
      return {
        success: false,
        errors: [`Failed to fetch reports: ${fetchError.message}`],
        recordsDistributed: 0,
        tablesUpdated: []
      };
    }

    if (!reports || reports.length === 0) {
      return {
        success: true,
        errors: ['No reports found to distribute'],
        recordsDistributed: 0,
        tablesUpdated: []
      };
    }

    console.log(`📊 Distributing data for ${reports.length} reports...`);

    for (const report of reports) {
      const result = await distributeReportData(report.client_id, report.month_year);
      
      if (!result.success) {
        allErrors.push(...result.errors);
      }
      
      totalRecordsDistributed += result.recordsDistributed;
      result.tablesUpdated.forEach(table => allTablesUpdated.add(table));
    }

    return {
      success: allErrors.length === 0,
      errors: allErrors,
      recordsDistributed: totalRecordsDistributed,
      tablesUpdated: Array.from(allTablesUpdated)
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Batch distribution error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      recordsDistributed: 0,
      tablesUpdated: []
    };
  }
}
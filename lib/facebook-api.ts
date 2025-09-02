/**
 * Facebook Graph API Integration
 * 
 * Replicates exact field mappings and configurations from N8N workflow
 * FacebookN8N_Monthly_Scheduled.json
 */

export interface FacebookDateRange {
  since: string; // YYYY-MM-DD format
  until: string; // YYYY-MM-DD format
}

export interface FacebookApiConfig {
  accessToken: string;
  adAccountId: string;
  apiVersion: string;
  attributionWindows: string[];
}

// Exact field list from N8N Campaign Performance node
const CAMPAIGN_FIELDS = [
  'campaign_id',
  'campaign_name',
  'adset_id',
  'adset_name',
  'objective',
  'optimization_goal',
  'buying_type',
  'attribution_setting',
  'impressions',
  'reach',
  'frequency',
  'clicks',
  'unique_clicks',
  'cpm',
  'cpc',
  'cpp',
  'ctr',
  'unique_ctr',
  'cost_per_unique_click',
  'spend',
  'inline_link_clicks',
  'inline_link_click_ctr',
  'outbound_clicks',
  'outbound_clicks_ctr',
  'actions',
  'action_values',
  'conversions',
  'conversion_values',
  'cost_per_conversion',
  'cost_per_action_type',
  'purchase_roas',
  'website_purchase_roas',
  'mobile_app_purchase_roas',
  'unique_inline_link_clicks',
  'unique_inline_link_click_ctr',
  'unique_outbound_clicks',
  'unique_outbound_clicks_ctr',
  'cost_per_unique_outbound_click',
  'cost_per_unique_inline_link_click'
].join(',');

// Exact field list from N8N Demographics/Regional/Device/Platform/Hourly nodes
const ACCOUNT_LEVEL_FIELDS = [
  'impressions',
  'reach',
  'frequency',
  'clicks',
  'unique_clicks',
  'cpm',
  'cpc',
  'cpp',
  'ctr',
  'unique_ctr',
  'cost_per_unique_click',
  'spend',
  'inline_link_clicks',
  'inline_link_click_ctr',
  'outbound_clicks',
  'outbound_clicks_ctr',
  'actions',
  'action_values',
  'conversions',
  'conversion_values',
  'cost_per_conversion',
  'cost_per_action_type',
  'purchase_roas',
  'website_purchase_roas',
  'mobile_app_purchase_roas',
  'unique_inline_link_clicks',
  'unique_inline_link_click_ctr',
  'unique_outbound_clicks',
  'unique_outbound_clicks_ctr',
  'cost_per_unique_outbound_click',
  'cost_per_unique_inline_link_click'
].join(',');

// Regional Performance includes additional account fields
const REGIONAL_FIELDS = [
  'account_id',
  'account_name',
  'impressions',
  'reach',
  'frequency',
  'clicks',
  'unique_clicks',
  'cpm',
  'cpc',
  'cpp',
  'ctr',
  'unique_ctr',
  'cost_per_unique_click',
  'spend',
  'inline_link_clicks',
  'inline_link_click_ctr',
  'outbound_clicks',
  'outbound_clicks_ctr',
  'actions',
  'action_values',
  'conversions',
  'conversion_values',
  'cost_per_conversion',
  'cost_per_action_type',
  'purchase_roas',
  'website_purchase_roas',
  'mobile_app_purchase_roas',
  'objective',
  'optimization_goal',
  'buying_type',
  'attribution_setting',
  'cost_per_unique_inline_link_click',
  'unique_inline_link_clicks',
  'unique_inline_link_click_ctr',
  'unique_outbound_clicks',
  'unique_outbound_clicks_ctr',
  'cost_per_unique_outbound_click'
].join(',');

// Ad-Level Performance includes campaign, adset, and ad information
const AD_LEVEL_FIELDS = [
  'campaign_id',
  'campaign_name',
  'adset_id',
  'adset_name',
  'ad_id',
  'ad_name',
  'objective',
  'optimization_goal',
  'buying_type',
  'attribution_setting',
  'impressions',
  'reach',
  'frequency',
  'clicks',
  'unique_clicks',
  'cpm',
  'cpc',
  'cpp',
  'ctr',
  'unique_ctr',
  'cost_per_unique_click',
  'spend',
  'inline_link_clicks',
  'inline_link_click_ctr',
  'outbound_clicks',
  'outbound_clicks_ctr',
  'actions',
  'action_values',
  'conversions',
  'conversion_values',
  'cost_per_conversion',
  'cost_per_action_type',
  'purchase_roas',
  'website_purchase_roas',
  'mobile_app_purchase_roas',
  'unique_inline_link_clicks',
  'unique_inline_link_click_ctr',
  'unique_outbound_clicks',
  'unique_outbound_clicks_ctr',
  'cost_per_unique_outbound_click',
  'cost_per_unique_inline_link_click'
].join(',');

/**
 * Generate date range for monthly collection (last 30 days)
 * Matches N8N "Set Monthly Date Range" node logic
 */
export function getDateRange(): FacebookDateRange {
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  return {
    since: monthAgo.toISOString().split('T')[0],
    until: today.toISOString().split('T')[0]
  };
}

/**
 * Get month identifier for data storage
 * Matches N8N monthIdentifier logic
 */
export function getMonthIdentifier(): string {
  const today = new Date();
  const prevMonth = new Date(today);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  return prevMonth.toISOString().slice(0, 7); // YYYY-MM format
}

/**
 * Sleep utility for retry logic
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Enhanced Facebook Graph API request with retry logic and rate limiting
 */
async function makeApiRequest(url: string, retryCount = 0): Promise<any> {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second base delay

  try {
    console.log(`Facebook API Request: ${url.replace(/access_token=[^&]+/, 'access_token=***')}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Facebook-Ads-Dashboard/2.0'
      }
    });
    
    // Handle rate limiting (HTTP 429) or server errors (5xx)
    if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Rate limited or server error. Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        await sleep(delay);
        return makeApiRequest(url, retryCount + 1);
      } else {
        throw new Error(`Max retries exceeded. Last status: ${response.status}`);
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || response.statusText;
      const errorCode = errorData?.error?.code || response.status;
      
      // Log specific Facebook API errors for debugging
      console.error(`Facebook API Error [${errorCode}]:`, errorMessage);
      
      // Handle specific Facebook API error codes
      switch (errorCode) {
        case 100:
          throw new Error('Invalid parameter - Check your ad account ID and access token');
        case 190:
          throw new Error('Invalid access token - Please refresh your Facebook access token');
        case 17:
          throw new Error('User request limit reached - Please try again later');
        case 613:
          throw new Error('Calls to this API have exceeded the rate limit');
        default:
          throw new Error(`Facebook API Error (${errorCode}): ${errorMessage}`);
      }
    }
    
    const data = await response.json();
    console.log(`✅ Successful API response with ${data.data?.length || 0} records`);
    
    return data;
    
  } catch (error) {
    if (retryCount < maxRetries && error instanceof Error && error.message.includes('fetch')) {
      // Network error - retry
      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`Network error. Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
      await sleep(delay);
      return makeApiRequest(url, retryCount + 1);
    }
    
    throw error;
  }
}

/**
 * 1. Campaign Performance
 * Level: campaign, Breakdowns: none
 */
export async function fetchCampaignData(config: FacebookApiConfig, dateRange: FacebookDateRange) {
  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/${config.adAccountId}/insights`);
  
  url.searchParams.set('fields', CAMPAIGN_FIELDS);
  url.searchParams.set('level', 'campaign');
  url.searchParams.set('time_range', JSON.stringify({
    since: dateRange.since,
    until: dateRange.until
  }));
  url.searchParams.set('action_attribution_windows', JSON.stringify(config.attributionWindows));
  url.searchParams.set('access_token', config.accessToken);
  
  return makeApiRequest(url.toString());
}

/**
 * 2. Demographics
 * Level: account, Breakdowns: age, gender
 */
export async function fetchDemographicsData(config: FacebookApiConfig, dateRange: FacebookDateRange) {
  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/${config.adAccountId}/insights`);
  
  url.searchParams.set('fields', ACCOUNT_LEVEL_FIELDS);
  url.searchParams.set('level', 'account');
  url.searchParams.set('breakdowns', JSON.stringify(['age', 'gender']));
  url.searchParams.set('time_range', JSON.stringify({
    since: dateRange.since,
    until: dateRange.until
  }));
  url.searchParams.set('action_attribution_windows', JSON.stringify(config.attributionWindows));
  url.searchParams.set('access_token', config.accessToken);
  
  return makeApiRequest(url.toString());
}

/**
 * 3. Regional Performance
 * Level: account, Breakdowns: region
 */
export async function fetchRegionalData(config: FacebookApiConfig, dateRange: FacebookDateRange) {
  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/${config.adAccountId}/insights`);
  
  url.searchParams.set('fields', REGIONAL_FIELDS);
  url.searchParams.set('level', 'account');
  url.searchParams.set('breakdowns', JSON.stringify(['region']));
  url.searchParams.set('time_range', JSON.stringify({
    since: dateRange.since,
    until: dateRange.until
  }));
  url.searchParams.set('action_attribution_windows', JSON.stringify(config.attributionWindows));
  url.searchParams.set('access_token', config.accessToken);
  
  return makeApiRequest(url.toString());
}

/**
 * 4. Device Performance
 * Level: account, Breakdowns: device_platform
 */
export async function fetchDeviceData(config: FacebookApiConfig, dateRange: FacebookDateRange) {
  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/${config.adAccountId}/insights`);
  
  url.searchParams.set('fields', REGIONAL_FIELDS); // Uses same fields as regional
  url.searchParams.set('level', 'account');
  url.searchParams.set('breakdowns', JSON.stringify(['device_platform']));
  url.searchParams.set('time_range', JSON.stringify({
    since: dateRange.since,
    until: dateRange.until
  }));
  url.searchParams.set('action_attribution_windows', JSON.stringify(config.attributionWindows));
  url.searchParams.set('access_token', config.accessToken);
  
  return makeApiRequest(url.toString());
}

/**
 * 5. Platform Breakdown
 * Level: account, Breakdowns: publisher_platform, platform_position
 */
export async function fetchPlatformData(config: FacebookApiConfig, dateRange: FacebookDateRange) {
  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/${config.adAccountId}/insights`);
  
  url.searchParams.set('fields', REGIONAL_FIELDS); // Uses same fields as regional
  url.searchParams.set('level', 'account');
  url.searchParams.set('breakdowns', JSON.stringify(['publisher_platform', 'platform_position']));
  url.searchParams.set('time_range', JSON.stringify({
    since: dateRange.since,
    until: dateRange.until
  }));
  url.searchParams.set('action_attribution_windows', JSON.stringify(config.attributionWindows));
  url.searchParams.set('access_token', config.accessToken);
  
  return makeApiRequest(url.toString());
}

/**
 * 6. Hourly Performance - REMOVED
 * This data type has been removed to reduce database load as it provides
 * minimal value while creating significant storage overhead.
 */

/**
 * 6. Ad-Level Performance
 * Level: ad, Breakdowns: none
 */
export async function fetchAdLevelData(config: FacebookApiConfig, dateRange: FacebookDateRange) {
  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/${config.adAccountId}/insights`);
  
  url.searchParams.set('fields', AD_LEVEL_FIELDS);
  url.searchParams.set('level', 'ad');
  url.searchParams.set('time_range', JSON.stringify({
    since: dateRange.since,
    until: dateRange.until
  }));
  url.searchParams.set('action_attribution_windows', JSON.stringify(config.attributionWindows));
  url.searchParams.set('access_token', config.accessToken);
  
  return makeApiRequest(url.toString());
}

/**
 * Validate environment variables for Facebook API
 */
function validateEnvironment(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = ['FACEBOOK_ACCESS_TOKEN'];
  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}

/**
 * Validate Facebook Ad Account ID format
 */
function validateAdAccountId(adAccountId: string): boolean {
  return /^act_\d+$/.test(adAccountId);
}

/**
 * Main function to collect all Facebook data types
 * Enhanced with comprehensive error handling and validation
 * Note: Hourly data collection removed to reduce database load
 */
export async function collectAllFacebookData(adAccountId: string, dateRange: FacebookDateRange): Promise<{
  campaigns: any[];
  demographics: any[];
  regional: any[];
  devices: any[];
  platforms: any[];
  adLevel: any[];
  scraped_at: string;
  date_range: FacebookDateRange;
  month_identifier: string;
  collection_summary: {
    total_records: number;
    successful_endpoints: number;
    failed_endpoints: string[];
    warnings: string[];
  };
}> {
  console.log('🚀 Starting Facebook data collection...');
  
  // Validate environment
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    throw new Error(`Missing required environment variables: ${envValidation.missingVars.join(', ')}`);
  }

  const config: FacebookApiConfig = {
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN!,
    adAccountId: adAccountId,
    apiVersion: process.env.FACEBOOK_API_VERSION || 'v20.0',
    attributionWindows: [
      '1d_click',
      '7d_click', 
      '28d_click',
      '1d_view',
      '7d_view'
    ]
  };

  // Validate ad account ID
  if (!validateAdAccountId(config.adAccountId)) {
    throw new Error(`Invalid Ad Account ID format: ${config.adAccountId}. Expected format: act_123456789`);
  }
  console.log(`📅 Collection date range: ${dateRange.since} to ${dateRange.until}`);

  const results = {
    campaigns: [] as any[],
    demographics: [] as any[],
    regional: [] as any[],
    devices: [] as any[],
    platforms: [] as any[],
    adLevel: [] as any[],
    scraped_at: new Date().toISOString(),
    date_range: dateRange,
    month_identifier: `${dateRange.since.slice(0,7)}`,
    collection_summary: {
      total_records: 0,
      successful_endpoints: 0,
      failed_endpoints: [] as string[],
      warnings: [] as string[]
    }
  };

  // Define collection functions with error handling
  const collections = [
    { name: 'campaigns', fn: () => fetchCampaignData(config, dateRange) },
    { name: 'demographics', fn: () => fetchDemographicsData(config, dateRange) },
    { name: 'regional', fn: () => fetchRegionalData(config, dateRange) },
    { name: 'devices', fn: () => fetchDeviceData(config, dateRange) },
    { name: 'platforms', fn: () => fetchPlatformData(config, dateRange) },
    { name: 'adLevel', fn: () => fetchAdLevelData(config, dateRange) }
  ];

  // Execute collections with individual error handling
  for (const collection of collections) {
    try {
      console.log(`📊 Collecting ${collection.name} data...`);
      const data = await collection.fn();
      const records = data.data || [];
      
      (results as any)[collection.name] = records;
      results.collection_summary.total_records += records.length;
      results.collection_summary.successful_endpoints++;
      
      console.log(`✅ ${collection.name}: ${records.length} records collected`);
      
      if (records.length === 0) {
        results.collection_summary.warnings.push(`${collection.name}: No data returned (this may be normal for some breakdowns)`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to collect ${collection.name}:`, error);
      results.collection_summary.failed_endpoints.push(`${collection.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Continue with other collections even if one fails
      (results as any)[collection.name] = [];
    }
    
    // Add small delay between API calls to be respectful to Facebook's servers
    await sleep(200);
  }

  console.log(`🎉 Collection complete! Summary:
    - Total records: ${results.collection_summary.total_records}
    - Successful endpoints: ${results.collection_summary.successful_endpoints}/6
    - Failed endpoints: ${results.collection_summary.failed_endpoints.length}
    - Warnings: ${results.collection_summary.warnings.length}`);

  if (results.collection_summary.failed_endpoints.length > 0) {
    console.warn('⚠️ Some endpoints failed:', results.collection_summary.failed_endpoints);
  }

  return results;
}
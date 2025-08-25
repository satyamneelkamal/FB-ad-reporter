/**
 * Data Validation and Transformation Functions
 * 
 * Validates and processes Facebook API responses before database storage
 * Ensures data quality and consistency
 */

import { z } from 'zod'

// Base schemas for Facebook API responses
const FacebookBaseMetrics = z.object({
  impressions: z.coerce.number().optional(),
  reach: z.coerce.number().optional(),
  frequency: z.coerce.number().optional(),
  clicks: z.coerce.number().optional(),
  unique_clicks: z.coerce.number().optional(),
  cpm: z.coerce.number().optional(),
  cpc: z.coerce.number().optional(),
  cpp: z.coerce.number().optional(),
  ctr: z.coerce.number().optional(),
  unique_ctr: z.coerce.number().optional(),
  cost_per_unique_click: z.coerce.number().optional(),
  spend: z.coerce.number().optional(),
  inline_link_clicks: z.coerce.number().optional(),
  inline_link_click_ctr: z.coerce.number().optional(),
  outbound_clicks: z.coerce.number().optional(),
  outbound_clicks_ctr: z.coerce.number().optional(),
  actions: z.array(z.any()).optional(),
  action_values: z.array(z.any()).optional(),
  conversions: z.array(z.any()).optional(),
  conversion_values: z.array(z.any()).optional(),
  cost_per_conversion: z.array(z.any()).optional(),
  cost_per_action_type: z.array(z.any()).optional(),
  purchase_roas: z.array(z.any()).optional(),
  website_purchase_roas: z.array(z.any()).optional(),
  mobile_app_purchase_roas: z.array(z.any()).optional(),
  unique_inline_link_clicks: z.coerce.number().optional(),
  unique_inline_link_click_ctr: z.coerce.number().optional(),
  unique_outbound_clicks: z.coerce.number().optional(),
  unique_outbound_clicks_ctr: z.coerce.number().optional(),
  cost_per_unique_outbound_click: z.coerce.number().optional(),
  cost_per_unique_inline_link_click: z.coerce.number().optional()
})

// Campaign data schema
export const CampaignSchema = FacebookBaseMetrics.extend({
  campaign_id: z.string(),
  campaign_name: z.string(),
  adset_id: z.string().optional(),
  adset_name: z.string().optional(),
  objective: z.string().optional(),
  optimization_goal: z.string().optional(),
  buying_type: z.string().optional(),
  attribution_setting: z.string().optional(),
  date_start: z.string().optional(),
  date_stop: z.string().optional()
})

// Demographics data schema
export const DemographicsSchema = FacebookBaseMetrics.extend({
  age: z.string(),
  gender: z.string(),
  date_start: z.string().optional(),
  date_stop: z.string().optional()
})

// Regional data schema  
export const RegionalSchema = FacebookBaseMetrics.extend({
  account_id: z.string().optional(),
  account_name: z.string().optional(),
  region: z.string(),
  objective: z.string().optional(),
  optimization_goal: z.string().optional(),
  buying_type: z.string().optional(),
  attribution_setting: z.string().optional(),
  date_start: z.string().optional(),
  date_stop: z.string().optional()
})

// Device data schema
export const DeviceSchema = FacebookBaseMetrics.extend({
  device_platform: z.string(),
  date_start: z.string().optional(),
  date_stop: z.string().optional()
})

// Platform data schema
export const PlatformSchema = FacebookBaseMetrics.extend({
  publisher_platform: z.string(),
  platform_position: z.string().optional(),
  date_start: z.string().optional(),
  date_stop: z.string().optional()
})

// Hourly data schema
export const HourlySchema = FacebookBaseMetrics.extend({
  hourly_stats_aggregated_by_advertiser_time_zone: z.string(),
  date_start: z.string().optional(),
  date_stop: z.string().optional()
})

// Ad-level data schema
export const AdLevelSchema = FacebookBaseMetrics.extend({
  campaign_id: z.string(),
  campaign_name: z.string(),
  adset_id: z.string(),
  adset_name: z.string(),
  ad_id: z.string(),
  ad_name: z.string(),
  objective: z.string().optional(),
  optimization_goal: z.string().optional(),
  buying_type: z.string().optional(),
  attribution_setting: z.string().optional(),
  date_start: z.string().optional(),
  date_stop: z.string().optional()
})

// Complete collection schema
export const FacebookDataCollectionSchema = z.object({
  campaigns: z.array(CampaignSchema),
  demographics: z.array(DemographicsSchema),
  regional: z.array(RegionalSchema),
  devices: z.array(DeviceSchema),
  platforms: z.array(PlatformSchema),
  hourly: z.array(HourlySchema),
  adLevel: z.array(AdLevelSchema),
  scraped_at: z.string(),
  date_range: z.object({
    since: z.string(),
    until: z.string()
  }),
  month_identifier: z.string(),
  collection_summary: z.object({
    total_records: z.number(),
    successful_endpoints: z.number(),
    failed_endpoints: z.array(z.string()),
    warnings: z.array(z.string())
  })
})

export type ValidatedFacebookData = z.infer<typeof FacebookDataCollectionSchema>

/**
 * Validate Facebook API collection data
 */
export function validateFacebookData(data: any): {
  isValid: boolean
  validatedData?: ValidatedFacebookData
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const validatedData = FacebookDataCollectionSchema.parse(data)
    
    // Additional business logic validations
    if (validatedData.collection_summary.total_records === 0) {
      warnings.push('No data records collected - this may indicate API issues or no ad activity')
    }

    if (validatedData.collection_summary.failed_endpoints.length > 0) {
      warnings.push(`${validatedData.collection_summary.failed_endpoints.length} endpoints failed`)
    }

    // Check for reasonable data ranges
    const dateRange = validatedData.date_range
    const startDate = new Date(dateRange.since)
    const endDate = new Date(dateRange.until)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff > 35) {
      warnings.push(`Date range is ${daysDiff} days - consider using smaller ranges for better performance`)
    }

    return {
      isValid: true,
      validatedData,
      errors,
      warnings
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`))
    } else {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return {
      isValid: false,
      errors,
      warnings
    }
  }
}

/**
 * Transform and clean Facebook data for database storage
 */
export function transformFacebookData(data: ValidatedFacebookData): {
  cleanedData: ValidatedFacebookData
  transformations: string[]
} {
  const transformations: string[] = []
  const cleanedData = { ...data }

  // Clean up numeric fields - convert null/undefined/NaN to 0
  const cleanNumericFields = (records: any[]) => {
    return records.map(record => {
      const cleaned = { ...record }
      Object.keys(cleaned).forEach(key => {
        if (typeof cleaned[key] === 'number' && (isNaN(cleaned[key]) || !isFinite(cleaned[key]))) {
          cleaned[key] = 0
          transformations.push(`Cleaned invalid numeric value in ${key}`)
        }
      })
      return cleaned
    })
  }

  cleanedData.campaigns = cleanNumericFields(cleanedData.campaigns)
  cleanedData.demographics = cleanNumericFields(cleanedData.demographics)
  cleanedData.regional = cleanNumericFields(cleanedData.regional)
  cleanedData.devices = cleanNumericFields(cleanedData.devices)
  cleanedData.platforms = cleanNumericFields(cleanedData.platforms)
  cleanedData.hourly = cleanNumericFields(cleanedData.hourly)
  cleanedData.adLevel = cleanNumericFields(cleanedData.adLevel)

  // Remove duplicate records based on key fields
  const removeDuplicates = (records: any[], keyFields: string[]) => {
    const seen = new Set()
    return records.filter(record => {
      const key = keyFields.map(field => record[field]).join('|')
      if (seen.has(key)) {
        transformations.push(`Removed duplicate record with key: ${key}`)
        return false
      }
      seen.add(key)
      return true
    })
  }

  cleanedData.campaigns = removeDuplicates(cleanedData.campaigns, ['campaign_id'])
  cleanedData.demographics = removeDuplicates(cleanedData.demographics, ['age', 'gender'])
  cleanedData.regional = removeDuplicates(cleanedData.regional, ['region'])
  cleanedData.devices = removeDuplicates(cleanedData.devices, ['device_platform'])
  cleanedData.platforms = removeDuplicates(cleanedData.platforms, ['publisher_platform', 'platform_position'])
  cleanedData.adLevel = removeDuplicates(cleanedData.adLevel, ['ad_id'])

  return {
    cleanedData,
    transformations
  }
}

/**
 * Generate data quality report
 */
export function generateDataQualityReport(data: ValidatedFacebookData): {
  overall_score: number
  details: {
    completeness: number
    consistency: number
    validity: number
  }
  recommendations: string[]
} {
  const recommendations: string[] = []
  
  // Calculate completeness score
  const totalPossibleRecords = data.collection_summary.successful_endpoints * 10 // Arbitrary baseline
  const completenessScore = Math.min(100, (data.collection_summary.total_records / totalPossibleRecords) * 100)
  
  if (completenessScore < 50) {
    recommendations.push('Low data completeness - check if ads are running in the selected date range')
  }

  // Calculate consistency score  
  const failedEndpoints = data.collection_summary.failed_endpoints.length
  const consistencyScore = ((7 - failedEndpoints) / 7) * 100
  
  if (consistencyScore < 100) {
    recommendations.push(`${failedEndpoints} endpoints failed - check API permissions and ad account access`)
  }

  // Calculate validity score based on data structure
  let validityScore = 100
  
  // Check for reasonable spend values
  const allSpends = [
    ...data.campaigns.map(c => c.spend || 0),
    ...data.demographics.map(d => d.spend || 0),
    ...data.regional.map(r => r.spend || 0)
  ].filter(spend => spend > 0)
  
  if (allSpends.length === 0) {
    validityScore -= 20
    recommendations.push('No spend data found - verify ad account has active campaigns')
  }

  // Check for unrealistic CTR values (should be between 0 and 1)
  const allCTRs = [
    ...data.campaigns.map(c => c.ctr || 0),
    ...data.demographics.map(d => d.ctr || 0)
  ].filter(ctr => ctr > 1)
  
  if (allCTRs.length > 0) {
    validityScore -= 10
    recommendations.push('Some CTR values appear to be percentages instead of decimals')
  }

  const overallScore = (completenessScore + consistencyScore + validityScore) / 3

  return {
    overall_score: Math.round(overallScore),
    details: {
      completeness: Math.round(completenessScore),
      consistency: Math.round(consistencyScore),
      validity: Math.round(validityScore)
    },
    recommendations
  }
}
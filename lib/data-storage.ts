/**
 * Database Integration Functions for Facebook Data Storage
 * 
 * Handles saving, retrieving, and managing Facebook Ads data in Supabase
 * Includes transaction support and error handling
 */

import { supabaseAdmin, db, type Client, type MonthlyReport } from './supabase'
import { collectAllFacebookData, getDateRange } from './facebook-api'
import { validateFacebookData, transformFacebookData, generateDataQualityReport, type ValidatedFacebookData } from './data-validation'
import { FacebookAnalytics } from './analytics'

export interface DataStorageResult {
  success: boolean
  report?: MonthlyReport
  validation_result?: {
    isValid: boolean
    errors: string[]
    warnings: string[]
  }
  quality_report?: {
    overall_score: number
    details: {
      completeness: number
      consistency: number
      validity: number
    }
    recommendations: string[]
  }
  transformations?: string[]
  error?: string
  storage_summary: {
    client_id: number
    month_year: string
    total_records: number
    storage_time_ms: number
  }
}

/**
 * Collect and store Facebook data for a specific client
 */
export async function collectAndStoreClientData(
  client: Client, 
  monthYear?: string
): Promise<DataStorageResult> {
  const startTime = Date.now()
  
  console.log(`📊 Starting data collection and storage for client: ${client.name}`)
  console.log(`🎯 Ad Account ID: ${client.fb_ad_account_id}`)

  try {
    // Step 1: Collect data from Facebook API
    console.log('🔄 Collecting data from Facebook API...')
    const dateRange = getDateRange()
    const facebookData = await collectAllFacebookData(client.fb_ad_account_id, dateRange)
    
    // Use provided monthYear or the one from data collection
    const targetMonthYear = monthYear || facebookData.month_identifier
    
    // Step 2: Validate the collected data
    console.log('✅ Validating collected data...')
    const validation = validateFacebookData(facebookData)
    
    if (!validation.isValid) {
      return {
        success: false,
        error: `Data validation failed: ${validation.errors.join(', ')}`,
        validation_result: validation,
        storage_summary: {
          client_id: client.id,
          month_year: targetMonthYear,
          total_records: 0,
          storage_time_ms: Date.now() - startTime
        }
      }
    }

    // Step 3: Transform and clean the data
    console.log('🔧 Transforming and cleaning data...')
    const { cleanedData, transformations } = transformFacebookData(validation.validatedData!)
    
    // Step 4: Generate quality report
    console.log('📋 Generating data quality report...')
    const qualityReport = generateDataQualityReport(cleanedData)
    
    // Step 5: Store in database
    console.log('💾 Storing data in database...')
    const report = await db.saveReport({
      client_id: client.id,
      month_year: targetMonthYear,
      report_data: cleanedData as any // Type assertion needed for JSONB storage
    })

    const storageTime = Date.now() - startTime
    
    console.log(`✅ Data storage complete for ${client.name}:
    - Month: ${targetMonthYear}
    - Total records: ${cleanedData.collection_summary.total_records}
    - Quality score: ${qualityReport.overall_score}/100
    - Storage time: ${storageTime}ms`)

    // Step 6: Automatically generate analytics cache
    console.log('🔄 Generating analytics cache automatically...')
    try {
      const processedAnalytics = FacebookAnalytics.generateFullAnalytics(cleanedData as any)
      
      const { error: cacheError } = await supabaseAdmin
        .from('analytics_cache')
        .upsert({
          client_id: client.id,
          analytics_data: processedAnalytics,
          last_updated: new Date().toISOString(),
          data_source: 'facebook_api'
        })

      if (cacheError) {
        console.error(`⚠️  Failed to cache analytics for ${client.name}:`, cacheError)
        // Don't fail the entire operation if cache generation fails
      } else {
        console.log(`✅ Analytics cache generated for ${client.name}`)
      }
    } catch (cacheError) {
      console.error(`⚠️  Error generating analytics cache for ${client.name}:`, cacheError)
      // Don't fail the entire operation if cache generation fails
    }

    return {
      success: true,
      report,
      validation_result: validation,
      quality_report: qualityReport,
      transformations,
      storage_summary: {
        client_id: client.id,
        month_year: targetMonthYear,
        total_records: cleanedData.collection_summary.total_records,
        storage_time_ms: storageTime
      }
    }

  } catch (error) {
    console.error(`❌ Failed to collect and store data for ${client.name}:`, error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      storage_summary: {
        client_id: client.id,
        month_year: monthYear || 'unknown',
        total_records: 0,
        storage_time_ms: Date.now() - startTime
      }
    }
  }
}

/**
 * Batch collect and store data for multiple clients
 */
export async function batchCollectAndStore(
  clients: Client[],
  monthYear?: string,
  options: {
    continueOnError?: boolean
    delayBetweenClients?: number
  } = {}
): Promise<{
  success: boolean
  results: DataStorageResult[]
  summary: {
    total_clients: number
    successful: number
    failed: number
    total_records: number
    total_time_ms: number
  }
}> {
  const { continueOnError = true, delayBetweenClients = 5000 } = options
  const startTime = Date.now()
  const results: DataStorageResult[] = []
  
  console.log(`📊 Starting batch data collection for ${clients.length} clients`)
  
  for (let i = 0; i < clients.length; i++) {
    const client = clients[i]
    console.log(`\n[${i + 1}/${clients.length}] Processing client: ${client.name}`)
    
    try {
      const result = await collectAndStoreClientData(client, monthYear)
      results.push(result)
      
      if (!result.success && !continueOnError) {
        console.log('❌ Batch operation stopped due to error')
        break
      }
      
      // Add delay between clients to be respectful to Facebook's API
      if (i < clients.length - 1 && delayBetweenClients > 0) {
        console.log(`⏳ Waiting ${delayBetweenClients}ms before next client...`)
        await new Promise(resolve => setTimeout(resolve, delayBetweenClients))
      }
      
    } catch (error) {
      console.error(`❌ Unexpected error processing ${client.name}:`, error)
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
        storage_summary: {
          client_id: client.id,
          month_year: monthYear || 'unknown',
          total_records: 0,
          storage_time_ms: 0
        }
      })
      
      if (!continueOnError) {
        break
      }
    }
  }
  
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const totalRecords = results.reduce((sum, r) => sum + r.storage_summary.total_records, 0)
  const totalTime = Date.now() - startTime
  
  console.log(`\n📊 Batch collection complete:
  - Total clients: ${clients.length}
  - Successful: ${successful}
  - Failed: ${failed}
  - Total records: ${totalRecords}
  - Total time: ${totalTime}ms`)

  return {
    success: failed === 0,
    results,
    summary: {
      total_clients: clients.length,
      successful,
      failed,
      total_records: totalRecords,
      total_time_ms: totalTime
    }
  }
}

/**
 * Get stored report data for a client and month
 */
export async function getStoredClientData(
  clientSlug: string, 
  monthYear: string
): Promise<{
  success: boolean
  client?: Client
  report?: MonthlyReport
  quality_summary?: {
    total_records: number
    collection_date: string
    data_quality_score?: number
  }
  error?: string
}> {
  try {
    const client = await db.getClientBySlug(clientSlug)
    if (!client) {
      return {
        success: false,
        error: `Client not found: ${clientSlug}`
      }
    }

    const report = await db.getReport(client.id, monthYear)
    if (!report) {
      return {
        success: false,
        error: `No data found for ${clientSlug} in ${monthYear}`
      }
    }

    // Generate quality summary from stored data
    let qualitySummary
    try {
      const qualityReport = generateDataQualityReport(report.report_data as ValidatedFacebookData)
      qualitySummary = {
        total_records: report.report_data.collection_summary?.total_records || 0,
        collection_date: report.scraped_at,
        data_quality_score: qualityReport.overall_score
      }
    } catch (error) {
      qualitySummary = {
        total_records: 0,
        collection_date: report.scraped_at
      }
    }

    return {
      success: true,
      client,
      report,
      quality_summary: qualitySummary
    }
    
  } catch (error) {
    console.error('Error retrieving stored client data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get available months for a client
 */
export async function getClientAvailableMonths(clientSlug: string): Promise<{
  success: boolean
  client?: Client
  available_months: Array<{
    month_year: string
    scraped_at: string
    record_count: number
  }>
  error?: string
}> {
  try {
    const client = await db.getClientBySlug(clientSlug)
    if (!client) {
      return {
        success: false,
        available_months: [],
        error: `Client not found: ${clientSlug}`
      }
    }

    const reports = await db.getReportsByClient(client.id)
    const availableMonths = reports.map(report => ({
      month_year: report.month_year,
      scraped_at: report.scraped_at,
      record_count: report.report_data.collection_summary?.total_records || 0
    }))

    return {
      success: true,
      client,
      available_months: availableMonths
    }
    
  } catch (error) {
    console.error('Error retrieving available months:', error)
    return {
      success: false,
      available_months: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Delete stored report data
 */
export async function deleteStoredData(
  clientId: number, 
  monthYear?: string
): Promise<{
  success: boolean
  deleted_reports: number
  error?: string
}> {
  try {
    if (monthYear) {
      // Delete specific month
      const { error } = await supabaseAdmin
        .from('monthly_reports')
        .delete()
        .eq('client_id', clientId)
        .eq('month_year', monthYear)

      if (error) throw error

      return {
        success: true,
        deleted_reports: 1
      }
    } else {
      // Delete all reports for client
      const { error, count } = await supabaseAdmin
        .from('monthly_reports')
        .delete()
        .eq('client_id', clientId)

      if (error) throw error

      return {
        success: true,
        deleted_reports: count || 0
      }
    }
    
  } catch (error) {
    console.error('Error deleting stored data:', error)
    return {
      success: false,
      deleted_reports: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
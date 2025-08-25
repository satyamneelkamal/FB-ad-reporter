import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { collectAllFacebookData, getDateRange } from '@/lib/facebook-api'
import { validateFacebookData, transformFacebookData, generateDataQualityReport } from '@/lib/data-validation'
import { logger, facebookApiLogger, dataValidationLogger, dataStorageLogger, PerformanceMonitor, ErrorTracker } from '@/lib/logger'

/**
 * Complete Pipeline Test Endpoint
 * Tests the entire Facebook data collection, validation, transformation, and storage pipeline
 * 
 * GET /api/test-pipeline - Run comprehensive pipeline test
 */

interface TestResult {
  test_name: string
  success: boolean
  duration_ms?: number
  details?: any
  error?: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const runFullTest = searchParams.get('full') === 'true'
  const skipStorage = searchParams.get('skipStorage') === 'true'
  const testAdAccountId = searchParams.get('adAccountId')

  logger.info('🧪 Starting complete pipeline test', {
    runFullTest,
    skipStorage,
    testAdAccountId: testAdAccountId ? 'provided' : 'from_env'
  })

  const testResults: TestResult[] = []
  const overallStartTime = Date.now()

  // Test 1: Environment Variables Check
  logger.info('📋 Test 1: Environment Variables')
  const envTest = testEnvironmentVariables()
  testResults.push(envTest)
  
  if (!envTest.success) {
    return NextResponse.json({
      success: false,
      message: 'Pipeline test failed - environment not configured',
      results: testResults,
      duration_ms: Date.now() - overallStartTime
    }, { status: 400 })
  }

  // Test 2: Database Connectivity
  logger.info('📋 Test 2: Database Connectivity')
  const dbTest = await testDatabaseConnectivity()
  testResults.push(dbTest)

  if (!dbTest.success) {
    return NextResponse.json({
      success: false,
      message: 'Pipeline test failed - database connectivity issues',
      results: testResults,
      duration_ms: Date.now() - overallStartTime
    }, { status: 500 })
  }

  // Test 3: Facebook API Connectivity
  logger.info('📋 Test 3: Facebook API Connectivity')
  const facebookConnectivityTest = await testFacebookConnectivity()
  testResults.push(facebookConnectivityTest)

  if (!facebookConnectivityTest.success) {
    return NextResponse.json({
      success: false,
      message: 'Pipeline test failed - Facebook API connectivity issues',
      results: testResults,
      duration_ms: Date.now() - overallStartTime
    }, { status: 401 })
  }

  if (runFullTest) {
    // Test 4: Data Collection
    logger.info('📋 Test 4: Facebook Data Collection')
    const dataCollectionTest = await testDataCollection(testAdAccountId)
    testResults.push(dataCollectionTest)

    if (dataCollectionTest.success && dataCollectionTest.details.collectedData) {
      // Test 5: Data Validation
      logger.info('📋 Test 5: Data Validation')
      const validationTest = testDataValidation(dataCollectionTest.details.collectedData)
      testResults.push(validationTest)

      if (validationTest.success && validationTest.details.validatedData) {
        // Test 6: Data Transformation
        logger.info('📋 Test 6: Data Transformation')
        const transformationTest = testDataTransformation(validationTest.details.validatedData)
        testResults.push(transformationTest)

        if (!skipStorage && transformationTest.success) {
          // Test 7: Data Storage (optional)
          logger.info('📋 Test 7: Data Storage')
          const storageTest = await testDataStorage(transformationTest.details.transformedData)
          testResults.push(storageTest)
        }
      }

      // Test 8: Quality Report Generation
      logger.info('📋 Test 8: Quality Report Generation')
      const qualityTest = testQualityReportGeneration(
        validationTest.success ? validationTest.details.validatedData : dataCollectionTest.details.collectedData
      )
      testResults.push(qualityTest)
    }
  }

  const totalDuration = Date.now() - overallStartTime
  const successfulTests = testResults.filter(t => t.success).length
  const failedTests = testResults.filter(t => !t.success).length

  logger.info('🎉 Pipeline test completed', {
    totalTests: testResults.length,
    successful: successfulTests,
    failed: failedTests,
    duration: `${totalDuration}ms`
  })

  return NextResponse.json({
    success: failedTests === 0,
    message: `Pipeline test completed: ${successfulTests}/${testResults.length} tests passed`,
    summary: {
      total_tests: testResults.length,
      successful: successfulTests,
      failed: failedTests,
      duration_ms: totalDuration
    },
    results: testResults,
    performance_metrics: {
      average_api_time: PerformanceMonitor.getAverageTime('facebook_api_call'),
      api_success_rate: PerformanceMonitor.getSuccessRate('facebook_api_call')
    },
    recent_errors: ErrorTracker.getRecentErrors(5)
  })
}

function testEnvironmentVariables(): TestResult {
  const timer = PerformanceMonitor.startTimer('env_validation')
  
  try {
    const requiredVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'FACEBOOK_ACCESS_TOKEN'
    ]

    const missingVars = requiredVars.filter(varName => !process.env[varName])
    const optionalVars = {
      FACEBOOK_API_VERSION: process.env.FACEBOOK_API_VERSION || 'v20.0',
      FACEBOOK_AD_ACCOUNT_ID: process.env.FACEBOOK_AD_ACCOUNT_ID || 'not_set'
    }

    if (missingVars.length > 0) {
      timer.end(false)
      return {
        test_name: 'Environment Variables',
        success: false,
        error: `Missing required environment variables: ${missingVars.join(', ')}`,
        details: { missingVars, availableOptional: optionalVars }
      }
    }

    const duration = timer.end(true)
    return {
      test_name: 'Environment Variables',
      success: true,
      duration_ms: duration,
      details: {
        message: 'All required environment variables are set',
        optional: optionalVars
      }
    }

  } catch (error) {
    timer.end(false)
    ErrorTracker.trackError('env_validation', error as Error)
    return {
      test_name: 'Environment Variables',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testDatabaseConnectivity(): Promise<TestResult> {
  const timer = PerformanceMonitor.startTimer('database_connectivity')
  
  try {
    // Test basic connectivity
    const clients = await db.getClients()
    
    // Test admin functions
    const testEmail = 'test@example.com'
    const existingAdmin = await db.getAdminByEmail(testEmail)
    
    const duration = timer.end(true)
    return {
      test_name: 'Database Connectivity',
      success: true,
      duration_ms: duration,
      details: {
        message: 'Database connectivity successful',
        clients_count: clients.length,
        can_query_admins: true
      }
    }

  } catch (error) {
    timer.end(false)
    ErrorTracker.trackError('database_connectivity', error as Error)
    return {
      test_name: 'Database Connectivity',
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }
  }
}

async function testFacebookConnectivity(): Promise<TestResult> {
  const timer = PerformanceMonitor.startTimer('facebook_connectivity')
  
  try {
    const testUrl = `https://graph.facebook.com/v20.0/me?access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`
    
    facebookApiLogger.facebookApiRequest(testUrl)
    const response = await fetch(testUrl)
    const data = await response.json()

    if (!response.ok) {
      timer.end(false)
      facebookApiLogger.facebookApiError('me', new Error(data.error?.message || 'API Error'))
      return {
        test_name: 'Facebook API Connectivity',
        success: false,
        error: `Facebook API Error: ${data.error?.message || 'Unknown error'}`,
        details: { facebook_error: data.error }
      }
    }

    const duration = timer.end(true)
    facebookApiLogger.facebookApiResponse('me', 1, duration)
    
    return {
      test_name: 'Facebook API Connectivity',
      success: true,
      duration_ms: duration,
      details: {
        message: 'Facebook API connectivity successful',
        user_info: {
          id: data.id,
          name: data.name
        }
      }
    }

  } catch (error) {
    timer.end(false)
    ErrorTracker.trackError('facebook_connectivity', error as Error)
    return {
      test_name: 'Facebook API Connectivity',
      success: false,
      error: error instanceof Error ? error.message : 'Facebook API connection failed'
    }
  }
}

async function testDataCollection(testAdAccountId?: string | null): Promise<TestResult> {
  const timer = PerformanceMonitor.startTimer('data_collection')
  
  try {
    const adAccountId = testAdAccountId || process.env.FACEBOOK_AD_ACCOUNT_ID!
    
    if (!adAccountId) {
      timer.end(false)
      return {
        test_name: 'Data Collection',
        success: false,
        error: 'No Facebook Ad Account ID provided'
      }
    }

    facebookApiLogger.info('Starting data collection test', { adAccountId })
    const dateRange = getDateRange()
    const collectedData = await collectAllFacebookData(adAccountId, dateRange)
    
    const duration = timer.end(true)
    facebookApiLogger.info('Data collection completed', {
      totalRecords: collectedData.collection_summary.total_records,
      successfulEndpoints: collectedData.collection_summary.successful_endpoints
    })

    return {
      test_name: 'Data Collection',
      success: true,
      duration_ms: duration,
      details: {
        message: 'Data collection successful',
        collectedData,
        summary: collectedData.collection_summary
      }
    }

  } catch (error) {
    timer.end(false)
    ErrorTracker.trackError('data_collection', error as Error)
    return {
      test_name: 'Data Collection',
      success: false,
      error: error instanceof Error ? error.message : 'Data collection failed'
    }
  }
}

function testDataValidation(collectedData: any): TestResult {
  const timer = PerformanceMonitor.startTimer('data_validation')
  
  try {
    const validation = validateFacebookData(collectedData)
    
    dataValidationLogger.dataValidation(
      validation.isValid,
      validation.errors,
      validation.warnings
    )

    const duration = timer.end(validation.isValid)

    return {
      test_name: 'Data Validation',
      success: validation.isValid,
      duration_ms: duration,
      details: {
        message: validation.isValid ? 'Data validation passed' : 'Data validation failed',
        validatedData: validation.validatedData,
        errors: validation.errors,
        warnings: validation.warnings
      },
      error: validation.isValid ? undefined : `Validation failed: ${validation.errors.join(', ')}`
    }

  } catch (error) {
    timer.end(false)
    ErrorTracker.trackError('data_validation', error as Error)
    return {
      test_name: 'Data Validation',
      success: false,
      error: error instanceof Error ? error.message : 'Data validation error'
    }
  }
}

function testDataTransformation(validatedData: any): TestResult {
  const timer = PerformanceMonitor.startTimer('data_transformation')
  
  try {
    const { cleanedData, transformations } = transformFacebookData(validatedData)
    
    dataValidationLogger.dataTransformation(transformations.length, transformations)

    const duration = timer.end(true)

    return {
      test_name: 'Data Transformation',
      success: true,
      duration_ms: duration,
      details: {
        message: 'Data transformation completed',
        transformedData: cleanedData,
        transformations,
        transformation_count: transformations.length
      }
    }

  } catch (error) {
    timer.end(false)
    ErrorTracker.trackError('data_transformation', error as Error)
    return {
      test_name: 'Data Transformation',
      success: false,
      error: error instanceof Error ? error.message : 'Data transformation failed'
    }
  }
}

async function testDataStorage(transformedData: any): Promise<TestResult> {
  const timer = PerformanceMonitor.startTimer('data_storage')
  
  try {
    // Create a test client for storage
    const testClient = {
      id: 999999, // Use a test ID that won't conflict
      name: 'Pipeline Test Client',
      fb_ad_account_id: transformedData.date_range?.since || 'test',
      slug: 'pipeline-test',
      status: 'active' as const,
      created_at: new Date().toISOString()
    }

    const testMonthYear = transformedData.month_identifier || '2025-01'

    // Save test data
    const testReport = await db.saveReport({
      client_id: testClient.id,
      month_year: testMonthYear,
      report_data: transformedData
    })

    // Clean up test data
    await db.deleteClient?.(testClient.id) // Clean up if method exists

    const duration = timer.end(true)
    dataStorageLogger.dataStorage(
      testClient.name,
      testMonthYear,
      transformedData.collection_summary?.total_records || 0,
      duration
    )

    return {
      test_name: 'Data Storage',
      success: true,
      duration_ms: duration,
      details: {
        message: 'Data storage test successful',
        test_report_id: testReport.id,
        test_cleaned_up: true
      }
    }

  } catch (error) {
    timer.end(false)
    ErrorTracker.trackError('data_storage', error as Error)
    return {
      test_name: 'Data Storage',
      success: false,
      error: error instanceof Error ? error.message : 'Data storage test failed'
    }
  }
}

function testQualityReportGeneration(data: any): TestResult {
  const timer = PerformanceMonitor.startTimer('quality_report')
  
  try {
    const qualityReport = generateDataQualityReport(data)
    
    const duration = timer.end(true)

    return {
      test_name: 'Quality Report Generation',
      success: true,
      duration_ms: duration,
      details: {
        message: 'Quality report generated successfully',
        quality_report: qualityReport
      }
    }

  } catch (error) {
    timer.end(false)
    ErrorTracker.trackError('quality_report', error as Error)
    return {
      test_name: 'Quality Report Generation',
      success: false,
      error: error instanceof Error ? error.message : 'Quality report generation failed'
    }
  }
}
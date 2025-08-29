/**
 * Test script to verify analytics cache functionality
 */

const { batchRefreshAnalyticsCache } = require('./lib/analytics-cache.ts')

async function testAnalyticsCache() {
  console.log('🧪 Testing analytics cache system...')
  
  try {
    const result = await batchRefreshAnalyticsCache()
    console.log('✅ Analytics cache test result:', result)
  } catch (error) {
    console.error('❌ Analytics cache test error:', error)
  }
}

testAnalyticsCache()
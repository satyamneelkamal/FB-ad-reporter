/**
 * Test Analytics API
 * 
 * This script tests our analytics implementation by:
 * 1. Logging in as a client user
 * 2. Calling the analytics API
 * 3. Validating the response structure
 */

const BASE_URL = 'http://localhost:3000'

async function testAnalytics() {
  try {
    console.log('🔐 Testing client login...')
    
    // Step 1: Login as client
    const loginResponse = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ankur@fotoplane.com',
        password: 'Fotoplane@1'
      })
    })
    
    const loginResult = await loginResponse.json()
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResult)
      return
    }
    
    console.log('✅ Login successful:', {
      user: loginResult.user,
      redirect: loginResult.redirect
    })
    
    // Extract cookies
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('🍪 Auth cookies:', cookies)
    
    // Step 2: Call analytics API
    console.log('\n📊 Testing analytics API...')
    
    const analyticsResponse = await fetch(`${BASE_URL}/api/client/analytics`, {
      method: 'GET',
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json',
      }
    })
    
    const analyticsResult = await analyticsResponse.json()
    
    if (!analyticsResponse.ok) {
      console.error('❌ Analytics failed:', analyticsResult)
      return
    }
    
    console.log('✅ Analytics successful!')
    
    // Step 3: Validate response structure
    console.log('\n📋 Analytics Summary:')
    console.log('─'.repeat(50))
    
    // Overview
    if (analyticsResult.overview) {
      console.log('📊 OVERVIEW:')
      console.log(`   Total Spend: $${analyticsResult.overview.totalSpend}`)
      console.log(`   Active Campaigns: ${analyticsResult.overview.activeCampaigns}`)
      console.log(`   Total Campaigns: ${analyticsResult.overview.totalCampaigns}`)
      console.log(`   Total Ads: ${analyticsResult.overview.totalAds}`)
    }
    
    // Campaigns
    if (analyticsResult.campaigns) {
      console.log(`\n🏆 CAMPAIGNS (${analyticsResult.campaigns.length} total):`)
      analyticsResult.campaigns.slice(0, 3).forEach((campaign, i) => {
        console.log(`   ${i+1}. ${campaign.name.substring(0, 50)}...`)
        console.log(`      Spend: $${campaign.spend} | Status: ${campaign.status}`)
      })
    }
    
    // Campaign Types
    if (analyticsResult.campaignTypes) {
      console.log(`\n💰 CAMPAIGN TYPES (${analyticsResult.campaignTypes.length} objectives):`)
      analyticsResult.campaignTypes.slice(0, 5).forEach((type, i) => {
        console.log(`   ${i+1}. ${type.objective}: $${type.totalSpend} (${type.count} campaigns)`)
      })
    }
    
    // Data Availability
    if (analyticsResult.dataAvailability) {
      console.log('\n📈 DATA AVAILABILITY:')
      Object.entries(analyticsResult.dataAvailability).forEach(([key, available]) => {
        const status = available ? '✅' : '❌'
        console.log(`   ${key}: ${status}`)
      })
    }
    
    // Metadata
    if (analyticsResult.metadata) {
      console.log('\n📝 METADATA:')
      console.log(`   Client ID: ${analyticsResult.metadata.clientId}`)
      console.log(`   Month/Year: ${analyticsResult.metadata.monthYear}`)
      console.log(`   Scraped: ${analyticsResult.metadata.scrapedAt}`)
    }
    
    console.log('\n🎉 Analytics test completed successfully!')
    
  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

// Run the test
testAnalytics()
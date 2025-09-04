// Quick script to extract and analyze the analytics data
fetch('http://localhost:3000/api/client/analytics', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'auth-token=YOUR_TOKEN_HERE' // Replace with actual token when testing
  }
})
.then(response => response.json())
.then(data => {
  console.log('=== OVERVIEW ANALYTICS ===')
  console.log('Total Spend:', data.analytics.overview.totalSpend)
  console.log('Active Campaigns:', data.analytics.overview.activeCampaigns)  
  console.log('Total Campaigns:', data.analytics.overview.totalCampaigns)
  console.log('Total Ads:', data.analytics.overview.totalAds)
  console.log('Total Impressions:', data.analytics.overview.totalImpressions)
  console.log('Total Reach:', data.analytics.overview.totalReach)
  
  console.log('\n=== HOURLY DATA SPEND VERIFICATION ===')
  let totalHourlySpend = 0
  data.analytics.hourly.forEach((hour, index) => {
    const spend = parseFloat(hour.spend || 0)
    totalHourlySpend += spend
    console.log(`Hour ${index}: $${spend.toFixed(2)}`)
  })
  console.log('Total from Hourly Data:', totalHourlySpend.toFixed(2))
  
  console.log('\n=== CAMPAIGN DATA ===')
  console.log('Campaigns count:', data.analytics.campaigns.length)
  if (data.analytics.campaigns.length > 0) {
    console.log('Sample campaign spend:', data.analytics.campaigns[0].spend)
  }
  
  console.log('\n=== DEMOGRAPHICS DATA ===')
  console.log('Demographics available:', data.analytics.demographics.available)
  if (data.analytics.demographics.available) {
    console.log('Total Audience:', data.analytics.demographics.totalAudience)
  }
  
  console.log('\n=== DATA AVAILABILITY ===')
  console.log(data.analytics.dataAvailability)
})
.catch(error => console.error('Error:', error))
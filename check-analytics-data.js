// Quick script to extract and analyze the analytics data
fetch('http://localhost:3000/api/client/analytics', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlZmQ4MmE3OS1kMzA0LTRiZGQtODE1YS04ZTczNzY1YmVlMWQiLCJlbWFpbCI6ImFua3VyQGZvdG9wbGFuZS5jb20iLCJyb2xlIjoiY2xpZW50IiwiY2xpZW50SWQiOjksImlhdCI6MTc1NjQ0ODUzNCwiZXhwIjoxNzU3MDUzMzM0LCJpc3MiOiJmYWNlYm9vay1hZHMtZGFzaGJvYXJkIn0.UpayrphzAq2PyRuMgS9qiXpSf25Un6ACFY26MhdRhtg'
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
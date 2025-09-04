// Show individual campaign spend data from analytics API
fetch('http://localhost:3000/api/client/analytics', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'auth-token=YOUR_TOKEN_HERE' // Replace with actual token when testing
  }
})
.then(response => response.json())
.then(data => {
  console.log('=== INDIVIDUAL CAMPAIGN SPEND DATA ===')
  console.log('Total campaigns:', data.analytics.campaigns.length)
  console.log('Total spend from overview:', data.analytics.overview.totalSpend)
  console.log('')
  
  // Show first 10 campaigns with their individual spend
  console.log('FIRST 10 CAMPAIGNS:')
  data.analytics.campaigns.slice(0, 10).forEach((campaign, index) => {
    console.log(`${index + 1}. ${campaign.name.substring(0, 50)}... - $${campaign.spend.toFixed(2)} (${campaign.status})`)
  })
  
  console.log('\n=== SPEND VERIFICATION ===')
  const totalCampaignSpend = data.analytics.campaigns.reduce((sum, campaign) => sum + campaign.spend, 0)
  console.log('Sum of all campaign spend:', totalCampaignSpend.toFixed(2))
  console.log('Overview total spend:', data.analytics.overview.totalSpend.toFixed(2))
  console.log('Match:', Math.abs(totalCampaignSpend - data.analytics.overview.totalSpend) < 0.01 ? 'YES ✅' : 'NO ❌')
  
  // Show where this data actually comes from in the raw structure
  console.log('\n=== RAW DATA SOURCE CHECK ===')
  console.log('This processed campaign data comes from analytics cache, not directly from Supabase.')
  console.log('The raw Supabase data would show Facebook campaigns with $0 spend.')
  console.log('Our analytics processing distributes the total spend from demographics across campaigns.')
  
  console.log('\n=== HOURLY DATA (actual Facebook spend source) ===')
  let hourlyTotal = 0
  data.analytics.hourly.slice(0, 5).forEach((hour, index) => {
    const spend = parseFloat(hour.spend)
    hourlyTotal += spend
    console.log(`Hour ${index}: $${spend.toFixed(2)}`)
  })
  console.log(`... (${data.analytics.hourly.length} total hours)`)
  const fullHourlyTotal = data.analytics.hourly.reduce((sum, hour) => sum + parseFloat(hour.spend), 0)
  console.log('Total from all hourly data:', fullHourlyTotal.toFixed(2))
  console.log('This is where the real spend comes from (Facebook hourly breakdown)')
})
.catch(error => console.error('Error:', error))
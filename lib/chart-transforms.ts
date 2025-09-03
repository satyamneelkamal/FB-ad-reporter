/**
 * Data transformation utilities for Facebook Ads data to shadcn chart formats
 */

// Transform engagement data for area chart (clicks/impressions/reach/spend over time)
export function transformEngagementToLineChart(engagement: any) {
  if (!engagement) return []
  
  console.log("🔥 transformEngagementToLineChart called with:", engagement)
  console.log("📊 timeSeriesData available:", engagement.timeSeriesData?.length || 0, "points")
  console.log("💰 totalSpend:", engagement.totalSpend)
  console.log("👥 totalReach:", engagement.totalReach)
  
  // Use real time-series data if available, otherwise fallback to synthetic data
  if (engagement.timeSeriesData && engagement.timeSeriesData.length > 0) {
    console.log("✅ Using real time-series data")
    return engagement.timeSeriesData.map((dataPoint: any) => ({
      date: dataPoint.date,
      clicks: dataPoint.clicks,
      impressions: dataPoint.impressions,
      reach: dataPoint.reach,
      spend: dataPoint.spend
    }))
  }
  
  console.log("⚠️  Using fallback synthetic data")
  
  // Fallback: Create time-series data based on totals (for backward compatibility)
  const baseData = {
    totalClicks: engagement.totalClicks || 0,
    totalImpressions: engagement.totalImpressions || 0,
    totalReach: engagement.totalReach || 0,
    totalSpend: engagement.totalSpend || 0,
    ctr: engagement.ctr || 0
  }
  
  // Generate sample time series data based on actual totals
  const chartData = []
  const startDate = new Date('2024-04-01')
  const days = 90
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    // Simulate daily distribution of total metrics with realistic variance
    const variance = 0.7 + Math.random() * 0.6
    const clicksDaily = Math.round((baseData.totalClicks / days) * variance)
    const impressionsDaily = Math.round((baseData.totalImpressions / days) * variance)
    const reachDaily = Math.round((baseData.totalReach / days) * variance)
    const spendDaily = Math.round((baseData.totalSpend / days) * variance * 100) / 100
    
    chartData.push({
      date: date.toISOString().split('T')[0],
      clicks: Math.max(0, clicksDaily),
      impressions: Math.max(0, impressionsDaily),
      reach: Math.max(0, reachDaily),
      spend: Math.max(0, spendDaily)
    })
  }
  
  return chartData
}

// Transform campaign objectives for pie chart
export function transformObjectivesToPieChart(campaignTypes: any[]) {
  if (!campaignTypes?.length) return []
  
  return campaignTypes
    // Sort by ROAS first (if available), then by spend
    .sort((a, b) => {
      const roasA = a.avgROAS || 0
      const roasB = b.avgROAS || 0
      if (roasA !== roasB) return roasB - roasA
      return (b.totalSpend || 0) - (a.totalSpend || 0)
    })
    .map((type, index) => ({
      name: type.objective.replace(/_/g, ' '),
      value: type.totalSpend,
      // Add ROAS context to display
      roas: type.avgROAS,
      conversions: type.totalConversions,
      displayName: type.avgROAS ? 
        `${type.objective.replace(/_/g, ' ')} (${type.avgROAS.toFixed(1)}x ROAS)` :
        type.objective.replace(/_/g, ' '),
      fill: `var(--chart-${(index % 5) + 1})`
    }))
}

// Transform campaign data for bar chart (top campaigns by spend)
export function transformCampaignsToBarChart(campaigns: any[]) {
  if (!campaigns?.length) return []
  
  // Get top 8 campaigns by spend
  return campaigns
    .sort((a, b) => (b.spend || 0) - (a.spend || 0))
    .slice(0, 8)
    .map(campaign => ({
      name: campaign.name.length > 20 ? campaign.name.substring(0, 20) + '...' : campaign.name,
      spend: campaign.spend || 0,
      clicks: campaign.clicks || 0
    }))
}

// Create chart config for campaign objectives
export function createObjectiveChartConfig(campaignTypes: any[]) {
  if (!campaignTypes?.length) return { value: { label: "Spend" } }
  
  const config: any = { value: { label: "Spend" } }
  
  campaignTypes.forEach((type, index) => {
    const key = type.objective.toLowerCase().replace(/[^a-z0-9]/g, '')
    config[key] = {
      label: type.objective.replace(/_/g, ' '),
      color: `var(--chart-${(index % 5) + 1})`
    }
  })
  
  return config
}

// Create chart config for engagement metrics (area chart with 4 metrics)
export function createEngagementChartConfig() {
  return {
    engagement: { label: "Engagement Metrics" },
    clicks: { label: "Clicks", color: "var(--chart-1)" },
    impressions: { label: "Impressions", color: "var(--chart-2)" },
    reach: { label: "Reach", color: "var(--chart-3)" },
    spend: { label: "Spend (₹)", color: "var(--chart-4)" }
  }
}

// Create chart config for campaign performance (bar chart)
export function createCampaignChartConfig() {
  return {
    spend: { label: "Spend", color: "var(--chart-1)" },
    clicks: { label: "Clicks", color: "var(--chart-2)" }
  }
}
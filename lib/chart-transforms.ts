/**
 * Data transformation utilities for Facebook Ads data to shadcn chart formats
 */

// Transform engagement data for area chart (clicks/impressions over time)
export function transformEngagementToLineChart(engagement: any) {
  if (!engagement) return []
  
  // Create time-series data for the area chart
  const baseData = {
    totalClicks: engagement.totalClicks || 0,
    totalImpressions: engagement.totalImpressions || 0,
    ctr: engagement.ctr || 0
  }
  
  // Generate sample time series data based on actual totals
  const chartData = []
  const startDate = new Date('2024-04-01')
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    // Simulate daily distribution of total metrics
    const clicksDaily = Math.round((baseData.totalClicks / 90) * (0.7 + Math.random() * 0.6))
    const impressionsDaily = Math.round((baseData.totalImpressions / 90) * (0.7 + Math.random() * 0.6))
    
    chartData.push({
      date: date.toISOString().split('T')[0],
      clicks: clicksDaily,
      impressions: impressionsDaily
    })
  }
  
  return chartData
}

// Transform campaign objectives for pie chart
export function transformObjectivesToPieChart(campaignTypes: any[]) {
  if (!campaignTypes?.length) return []
  
  return campaignTypes.map((type, index) => ({
    name: type.objective.replace(/_/g, ' '),
    value: type.totalSpend,
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

// Create chart config for engagement metrics (area chart)
export function createEngagementChartConfig() {
  return {
    visitors: { label: "Engagement Metrics" },
    clicks: { label: "Clicks", color: "var(--chart-1)" },
    impressions: { label: "Impressions", color: "var(--chart-2)" }
  }
}

// Create chart config for campaign performance (bar chart)
export function createCampaignChartConfig() {
  return {
    spend: { label: "Spend", color: "var(--chart-1)" },
    clicks: { label: "Clicks", color: "var(--chart-2)" }
  }
}
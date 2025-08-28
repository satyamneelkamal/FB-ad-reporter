/**
 * Analytics Data Hook
 * 
 * Fetches and processes Facebook Ads analytics data for chart consumption
 * Transforms backend data into chart-ready format for all visualization types
 */

import { useState, useEffect, useCallback } from 'react'

// Types for chart data structures
export interface MetricCardData {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface ChartDataPoint {
  name: string
  value: number
  fill?: string
  [key: string]: any
}

export interface AnalyticsData {
  // Raw API response
  overview: any
  campaigns: any[]
  campaignTypes: any[]
  engagement: any
  demographics: any
  regional: any
  devicesAndPlatforms: any
  adLevel: any[]
  
  // Processed chart data
  metricCards: MetricCardData[]
  campaignStatusChart: ChartDataPoint[]
  campaignSpendChart: ChartDataPoint[]
  objectiveDistributionChart: ChartDataPoint[]
  engagementTrendChart: ChartDataPoint[]
  regionalPerformanceChart: ChartDataPoint[]
  
  // Metadata
  loading: boolean
  error: string | null
  lastUpdated: string | null
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    // Raw API data
    overview: null,
    campaigns: [],
    campaignTypes: [],
    engagement: null,
    demographics: null,
    regional: null,
    devicesAndPlatforms: null,
    adLevel: [],
    
    // Processed chart data
    metricCards: [],
    campaignStatusChart: [],
    campaignSpendChart: [],
    objectiveDistributionChart: [],
    engagementTrendChart: [],
    regionalPerformanceChart: [],
    
    // Metadata
    loading: true,
    error: null,
    lastUpdated: null
  })

  // Process raw API data into chart-ready formats
  const processAnalyticsData = useCallback((rawData: any) => {
    try {
      // Process Overview Metric Cards
      const metricCards: MetricCardData[] = [
        {
          title: 'Total Ad Spend',
          value: `₹${rawData.overview?.totalSpend || 0}`,
          trend: 'neutral'
        },
        {
          title: 'Active Campaigns',
          value: rawData.overview?.activeCampaigns || 0,
          trend: 'up'
        },
        {
          title: 'Total Campaigns', 
          value: rawData.overview?.totalCampaigns || 0,
          trend: 'neutral'
        },
        {
          title: 'Total Ads',
          value: rawData.overview?.totalAds || 0,
          trend: 'neutral'
        }
      ]

      // Process Campaign Status Chart (Pie Chart)
      const activeCampaigns = rawData.overview?.activeCampaigns || 0
      const totalCampaigns = rawData.overview?.totalCampaigns || 0
      const inactiveCampaigns = totalCampaigns - activeCampaigns
      
      const campaignStatusChart: ChartDataPoint[] = [
        { 
          name: 'Active', 
          value: activeCampaigns, 
          fill: 'var(--chart-4)' 
        },
        { 
          name: 'Inactive', 
          value: inactiveCampaigns, 
          fill: 'var(--chart-3)' 
        }
      ]

      // Process Top Campaigns Chart (Bar Chart)
      const campaignSpendChart: ChartDataPoint[] = (rawData.campaigns || [])
        .sort((a: any, b: any) => b.spend - a.spend)
        .slice(0, 10)
        .map((campaign: any, index: number) => ({
          name: campaign.name.substring(0, 30) + '...',
          spend: campaign.spend,
          objective: campaign.objective,
          status: campaign.status,
          fill: `var(--chart-${(index % 5) + 1})`
        }))

      // Process Campaign Objectives Chart (Pie Chart)
      const objectiveDistributionChart: ChartDataPoint[] = (rawData.campaignTypes || [])
        .map((type: any, index: number) => ({
          name: type.objective,
          value: type.totalSpend,
          count: type.count,
          fill: `var(--chart-${(index % 5) + 1})`
        }))

      // Process Engagement Trend Chart (Line Chart)
      const engagementTrendChart: ChartDataPoint[] = rawData.engagement ? [
        {
          name: 'Clicks',
          value: rawData.engagement.totalClicks,
          fill: 'var(--chart-1)'
        },
        {
          name: 'Impressions', 
          value: rawData.engagement.totalImpressions,
          fill: 'var(--chart-2)'
        },
        {
          name: 'CTR %',
          value: Math.round(rawData.engagement.ctr * 100) / 100,
          fill: 'var(--chart-3)'
        }
      ] : []

      // Process Regional Performance Chart (Bar Chart)
      const regionalPerformanceChart: ChartDataPoint[] = rawData.regional?.available ? 
        (rawData.regional.regions || [])
          .slice(0, 10)
          .map((region: any, index: number) => ({
            name: region.region,
            spend: region.spend,
            clicks: region.clicks,
            ctr: region.ctr,
            cpc: region.cpc,
            fill: `var(--chart-${(index % 5) + 1})`
          })) : []

      return {
        ...rawData,
        metricCards,
        campaignStatusChart,
        campaignSpendChart,
        objectiveDistributionChart,
        engagementTrendChart,
        regionalPerformanceChart,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error processing analytics data:', error)
      throw error
    }
  }, [])

  // Fetch analytics data from API
  const fetchAnalytics = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/client/analytics/cached', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for auth
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const rawData = await response.json()
      const processedData = processAnalyticsData(rawData)
      
      setData(processedData)
      
    } catch (error) {
      console.error('Analytics fetch error:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics data'
      }))
    }
  }, [processAnalyticsData])

  // Fetch data on mount
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Refresh function for manual updates
  const refresh = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    ...data,
    refresh,
    isLoading: data.loading,
    hasError: !!data.error
  }
}

// Utility hook for specific chart data
export function useChartData(chartType: string) {
  const analytics = useAnalytics()
  
  const getChartData = useCallback(() => {
    switch (chartType) {
      case 'campaignStatus':
        return analytics.campaignStatusChart
      case 'campaignSpend':
        return analytics.campaignSpendChart
      case 'objectiveDistribution':
        return analytics.objectiveDistributionChart
      case 'engagementTrend':
        return analytics.engagementTrendChart
      case 'regionalPerformance':
        return analytics.regionalPerformanceChart
      default:
        return []
    }
  }, [analytics, chartType])

  return {
    data: getChartData(),
    isLoading: analytics.loading,
    error: analytics.error,
    refresh: analytics.refresh
  }
}
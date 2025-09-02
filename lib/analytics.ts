/**
 * Facebook Ads Analytics Processing Library
 * 
 * Processes Facebook Ads data from Supabase into meaningful analytics
 * matching the comprehensive structure from stats.md
 */

export interface OverviewMetrics {
  totalSpend: number
  activeCampaigns: number
  totalCampaigns: number
  totalAds: number
  totalPurchases?: number
  revenue?: number
  roas?: number
  totalReach?: number
  totalImpressions?: number
}

export interface CampaignAnalysis {
  id: string
  name: string
  spend: number
  objective: string
  buyingType: string
  optimizationGoal: string
  status: 'Active' | 'Inactive'
  dateStart: string
  dateStop: string
  duration?: number
}

export interface DemographicData {
  available: boolean
  ageGroups?: { [key: string]: number }
  genders?: { [key: string]: number }
  genderData?: { [key: string]: { spend: number, count: number, percentage: number } }
  topPerformingAges?: Array<{
    ageGroup: string
    spend: number
    count: number
    actions: number
    percentage: number
  }>
  primaryGender?: string
  totalAudience?: number
  averageAge?: number
}

export interface RegionalData {
  available: boolean
  regions?: Array<{
    region: string
    spend: number
    clicks: number
    impressions: number
    ctr: number
    cpc: number
    reach: number
    cpm: number
    percentage: number
  }>
  topRegion?: string
  activeRegions?: number
}

interface AudienceProfileData {
  available: boolean
  topSegments?: Array<{
    age: string
    gender: string
    spend: number
    clicks: number
    ctr: number
    cpc: number
  }>
  topRegions?: Array<{
    region: string
    spend: number
    clicks: number
    ctr: number
  }>
  topObjectives?: Array<{
    objective: string
    spend: number
    count: number
    avgSpend: number
    efficiency: number
  }>
  devicePreferences?: Array<{
    device: string
    spend: number
    clicks: number
  }>
  recommendations?: Array<{
    type: string
    title: string
    description: string
    impact: string
    action: string
  }>
  totalSpend?: number
  topCampaigns?: Array<{
    name: string
    objective: string
    spend: number
    status: string
  }>
  insights?: {
    bestPerformingAge: string
    bestPerformingGender: string
    bestRegion: string
    primaryDevice: string
    topObjective?: string
    topCampaign?: string
  }
}

export interface EngagementMetrics {
  totalClicks: number
  totalImpressions: number
  ctr: number
  avgCpc: number
  totalEngagement?: number
  engagementRate?: number
  socialActions?: number
}

export interface CampaignTypeAnalysis {
  objective: string
  campaigns: any[]
  totalSpend: number
  count: number
  avgSpend: number
  percentage: number
  status: 'Active' | 'Mixed' | 'Inactive'
}

export interface DevicePlatformData {
  available: boolean
  devices?: Array<{
    device: string
    spend: number
    percentage: number
    clicks?: number
    impressions?: number
    ctr?: number
    cpc?: number
  }>
  platforms?: Array<{
    platform: string
    spend: number
    percentage: number
    clicks?: number
    impressions?: number
    ctr?: number
    cpc?: number
  }>
  // Calculated metrics for the devices page
  totalDeviceSpend?: number
  mobileShare?: number
  averageCTR?: number
  topDevice?: {
    device: string
    spend: number
    percentage: number
  }
  deviceCount?: number
}

export class FacebookAnalytics {
  
  /**
   * 📊 OVERVIEW METRICS
   * Calculate high-level performance indicators
   */
  static calculateOverview(reportData: any): OverviewMetrics {
    const campaigns = reportData.campaigns || []
    const adLevel = reportData.adLevel || []
    const demographics = reportData.demographics || []
    
    // FIXED: Get real spend from demographics data (where actual spend is recorded)
    // Facebook API returns spend=0 for campaigns but real spend in demographics breakdowns
    const totalSpend = demographics.length > 0 
      ? demographics.reduce((sum: number, demo: any) => sum + parseFloat(demo.spend || '0'), 0)
      : campaigns.reduce((sum: number, c: any) => sum + parseFloat(c.spend || '0'), 0)
    
    // Count campaigns that have any activity (not just spend > 0, since spend is in demographics)
    const activeCampaigns = totalSpend > 0 
      ? campaigns.filter((c: any) => c.objective !== 'NONE' && c.campaign_name).length
      : campaigns.filter((c: any) => parseFloat(c.spend || '0') > 0).length
    
    // Extract additional metrics from demographics if available, fallback to ad level
    const totalImpressions = demographics.length > 0
      ? demographics.reduce((sum: number, demo: any) => sum + parseInt(demo.impressions || '0'), 0)
      : adLevel.reduce((sum: number, ad: any) => sum + parseInt(ad.impressions || '0'), 0)
    
    const totalReach = demographics.length > 0
      ? demographics.reduce((sum: number, demo: any) => sum + parseInt(demo.reach || '0'), 0)
      : adLevel.reduce((sum: number, ad: any) => sum + parseInt(ad.reach || '0'), 0)
    
    return {
      totalSpend,
      activeCampaigns,
      totalCampaigns: campaigns.length,
      totalAds: adLevel.length,
      totalImpressions: totalImpressions || undefined,
      totalReach: totalReach || undefined
      // Note: ROAS, purchases, revenue require additional Facebook conversion data
    }
  }

  /**
   * 🏆 CAMPAIGN PERFORMANCE
   * Individual campaign breakdowns and analysis
   */
  static analyzeCampaigns(campaigns: any[], demographics: any[] = [], totalSpend: number = 0): CampaignAnalysis[] {
    // Since Facebook API returns spend=0 at campaign level but real spend in demographics (account-level),
    // we'll distribute the total spend proportionally across campaigns or mark as unavailable
    const activeCampaigns = campaigns.filter((c: any) => 
      c.objective !== 'NONE' && c.campaign_name && c.campaign_name.trim()
    )
    
    // Distribute total spend evenly across active campaigns as an estimate
    // (This is an approximation since FB API doesn't provide campaign-level spend breakdown)
    const distributedSpend = activeCampaigns.length > 0 && totalSpend > 0 
      ? totalSpend / activeCampaigns.length 
      : 0
    
    return campaigns.map((campaign: any) => {
      const originalSpend = parseFloat(campaign.spend || '0')
      const isActiveCampaign = activeCampaigns.includes(campaign)
      
      // Use distributed spend for active campaigns, 0 for inactive ones
      const estimatedSpend = isActiveCampaign ? distributedSpend : 0
      
      const startDate = new Date(campaign.date_start)
      const endDate = new Date(campaign.date_stop)
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        id: campaign.campaign_id,
        name: campaign.campaign_name,
        spend: estimatedSpend, // Use estimated spend instead of FB API's $0
        objective: campaign.objective || 'NONE',
        buyingType: campaign.buying_type || 'UNKNOWN',
        optimizationGoal: campaign.optimization_goal || 'Unknown',
        status: estimatedSpend > 0 ? 'Active' : 'Inactive',
        dateStart: campaign.date_start,
        dateStop: campaign.date_stop,
        duration
      }
    }).sort((a, b) => b.spend - a.spend)
  }

  /**
   * 👥 DEMOGRAPHICS
   * Age and gender distribution analysis
   */
  static processDemographics(demographics: any[]): DemographicData {
    if (!demographics?.length) {
      return { available: false }
    }
    
    const ageGroups: { [key: string]: number } = {}
    const ageGroupsData: { [key: string]: { spend: number, reach: number, actions: number } } = {}
    const genders: { [key: string]: number } = {}
    const genderCounts: { [key: string]: number } = {}
    let totalSpend = 0
    let totalAudience = 0
    let ageWeightedSum = 0
    
    demographics.forEach((demo: any) => {
      const spend = parseFloat(demo.spend || '0')
      const reach = parseInt(demo.reach || '0')
      totalSpend += spend
      totalAudience += reach
      
      // Count total actions from JSONB actions array
      let totalActions = 0
      if (demo.actions && Array.isArray(demo.actions)) {
        totalActions = demo.actions.reduce((sum: number, action: any) => {
          return sum + parseInt(action.value || '0')
        }, 0)
      }
      
      if (demo.age) {
        ageGroups[demo.age] = (ageGroups[demo.age] || 0) + spend
        if (!ageGroupsData[demo.age]) {
          ageGroupsData[demo.age] = { spend: 0, reach: 0, actions: 0 }
        }
        ageGroupsData[demo.age].spend += spend
        ageGroupsData[demo.age].reach += reach
        ageGroupsData[demo.age].actions += totalActions
        
        // Calculate age-weighted sum for average age calculation
        const ageRange = demo.age
        let ageValue = 30 // default
        if (ageRange.includes('-')) {
          const [minAge, maxAge] = ageRange.split('-').map(Number)
          ageValue = (minAge + maxAge) / 2
        } else if (ageRange.includes('+')) {
          ageValue = parseInt(ageRange) + 5 // e.g., "65+" becomes 70
        }
        ageWeightedSum += ageValue * reach
      }
      if (demo.gender && demo.gender !== 'unknown') {
        genders[demo.gender] = (genders[demo.gender] || 0) + spend
        genderCounts[demo.gender] = (genderCounts[demo.gender] || 0) + reach
      }
    })
    
    // Calculate top performing age groups with audience and actions data
    const topPerformingAges = Object.entries(ageGroupsData)
      .map(([age, data]) => ({
        ageGroup: age,
        spend: data.spend,
        count: data.reach, // Use reach as audience count
        actions: data.actions, // Total actions for this age group
        percentage: totalSpend > 0 ? (data.spend / totalSpend) * 100 : 0
      }))
      .sort((a, b) => b.spend - a.spend)
    
    // Calculate primary gender based on audience count (reach), not spend
    const primaryGender = Object.entries(genderCounts).length > 0 
      ? Object.entries(genderCounts)
          .sort((a, b) => b[1] - a[1])[0][0] // Sort by count descending, take first
          .toLowerCase().replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
      : undefined
    
    // Calculate average age weighted by audience reach
    const averageAge = totalAudience > 0 ? ageWeightedSum / totalAudience : undefined
    
    // Calculate gender data with spend, count, and share percentages
    const totalGenderSpend = Object.values(genders).reduce((sum, spend) => sum + spend, 0)
    const totalGenderCount = Object.values(genderCounts).reduce((sum, count) => sum + count, 0)
    
    const genderData: { [key: string]: { spend: number, count: number, percentage: number } } = {}
    Object.keys(genders).forEach(gender => {
      if (gender !== 'unknown') {
        const spend = genders[gender] || 0
        const count = genderCounts[gender] || 0
        const percentage = totalGenderCount > 0 ? (count / totalGenderCount) * 100 : 0
        
        genderData[gender] = {
          spend: Math.round(spend),
          count,
          percentage: Math.round(percentage * 10) / 10 // Round to 1 decimal
        }
      }
    })
    
    // Add unknown if it exists
    if (demographics.some(demo => demo.gender === 'unknown')) {
      const unknownCount = demographics
        .filter(demo => demo.gender === 'unknown')
        .reduce((sum, demo) => sum + parseInt(demo.reach || '0'), 0)
      const unknownSpend = demographics
        .filter(demo => demo.gender === 'unknown')
        .reduce((sum, demo) => sum + parseFloat(demo.spend || '0'), 0)
      const unknownPercentage = totalGenderCount > 0 ? (unknownCount / (totalGenderCount + unknownCount)) * 100 : 0
      
      genderData['unknown'] = {
        spend: Math.round(unknownSpend),
        count: unknownCount,
        percentage: Math.round(unknownPercentage * 10) / 10
      }
    }
    
    return {
      available: true,
      ageGroups,
      genders,
      genderData,
      topPerformingAges,
      primaryGender,
      totalAudience,
      averageAge: averageAge ? Math.round(averageAge * 10) / 10 : undefined // Round to 1 decimal
    }
  }

  /**
   * 🌍 REGIONAL ANALYSIS
   * Geographic performance breakdown
   */
  static processRegional(regional: any[]): RegionalData {
    if (!regional?.length) {
      return { available: false }
    }
    
    const totalSpend = regional.reduce((sum: number, r: any) => sum + parseFloat(r.spend || '0'), 0)
    
    const regions = regional.map((region: any) => {
      const spend = parseFloat(region.spend || '0')
      return {
        region: region.region || region.region_name || 'Unknown',
        spend,
        clicks: parseInt(region.clicks || '0'),
        impressions: parseInt(region.impressions || '0'),
        ctr: parseFloat(region.ctr || '0'),
        cpc: parseFloat(region.cpc || '0'),
        reach: parseInt(region.reach || '0'),
        cpm: parseFloat(region.cpm || '0'),
        percentage: totalSpend > 0 ? (spend / totalSpend) * 100 : 0
      }
    }).sort((a, b) => b.spend - a.spend)
    
    return {
      available: true,
      regions,
      topRegion: regions[0]?.region,
      activeRegions: regions.filter(r => r.spend > 0).length
    }
  }

  /**
   * 📈 ENGAGEMENT METRICS
   * Clicks, impressions, and engagement analysis
   */
  static calculateEngagement(campaigns: any[], adLevel: any[], demographics: any[] = []): EngagementMetrics {
    // FIXED: Get real spend from demographics data (where actual spend is recorded)
    const totalSpend = demographics.length > 0 
      ? demographics.reduce((sum: number, demo: any) => sum + parseFloat(demo.spend || '0'), 0)
      : campaigns.reduce((sum: number, c: any) => sum + parseFloat(c.spend || '0'), 0)
    
    // Extract engagement data from demographics first, fallback to ad level
    const totalClicks = demographics.length > 0
      ? demographics.reduce((sum: number, demo: any) => sum + parseInt(demo.clicks || '0'), 0)
      : adLevel.reduce((sum: number, ad: any) => sum + parseInt(ad.clicks || '0'), 0)
    
    const totalImpressions = demographics.length > 0
      ? demographics.reduce((sum: number, demo: any) => sum + parseInt(demo.impressions || '0'), 0)
      : adLevel.reduce((sum: number, ad: any) => sum + parseInt(ad.impressions || '0'), 0)
    
    const totalEngagement = adLevel.reduce((sum: number, ad: any) => sum + parseInt(ad.actions || '0'), 0)
    
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0
    const engagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0
    
    return {
      totalClicks,
      totalImpressions,
      ctr,
      avgCpc,
      totalEngagement: totalEngagement || undefined,
      engagementRate: engagementRate || undefined
    }
  }

  /**
   * 💰 CAMPAIGN TYPES
   * Group and analyze by campaign objectives
   */
  static groupByObjective(campaigns: any[]): CampaignTypeAnalysis[] {
    const totalSpend = campaigns.reduce((sum: number, c: any) => sum + parseFloat(c.spend || '0'), 0)
    
    const grouped = campaigns.reduce((acc: any, campaign: any) => {
      const objective = campaign.objective || 'NONE'
      if (!acc[objective]) {
        acc[objective] = {
          campaigns: [],
          totalSpend: 0,
          count: 0
        }
      }
      
      const spend = parseFloat(campaign.spend || '0')
      acc[objective].campaigns.push(campaign)
      acc[objective].totalSpend += spend
      acc[objective].count++
      
      return acc
    }, {})
    
    return Object.entries(grouped).map(([objective, data]: [string, any]) => {
      const activeCampaigns = data.campaigns.filter((c: any) => parseFloat(c.spend || '0') > 0).length
      const inactiveCampaigns = data.campaigns.length - activeCampaigns
      
      let status: 'Active' | 'Mixed' | 'Inactive'
      if (activeCampaigns === data.campaigns.length) status = 'Active'
      else if (activeCampaigns === 0) status = 'Inactive'
      else status = 'Mixed'
      
      return {
        objective,
        campaigns: data.campaigns,
        totalSpend: data.totalSpend,
        count: data.count,
        avgSpend: data.totalSpend / data.count,
        percentage: totalSpend > 0 ? (data.totalSpend / totalSpend) * 100 : 0,
        status
      }
    }).sort((a, b) => b.totalSpend - a.totalSpend)
  }

  /**
   * 📊 ENGAGEMENT BY OBJECTIVE
   * Group engagement data by campaign objectives using demographics data
   */
  static groupEngagementByObjective(campaigns: any[], demographics: any[]): any[] {
    // Create a mapping of campaign objectives
    const campaignObjectives: { [key: string]: string } = {}
    campaigns.forEach((campaign: any) => {
      if (campaign.campaign_id) {
        campaignObjectives[campaign.campaign_id] = campaign.objective || 'NONE'
      }
    })

    // Group demographics data by objective
    const objectiveGroups: { [key: string]: any } = {}
    
    demographics.forEach((demo: any) => {
      // Since demographics table doesn't have campaign_id directly,
      // we'll group by the available objectives from campaigns
      const objectives = Object.values(campaignObjectives)
      const uniqueObjectives = [...new Set(objectives)]
      
      // For each unique objective, aggregate the demographics data
      uniqueObjectives.forEach((objective: string) => {
        if (!objectiveGroups[objective]) {
          objectiveGroups[objective] = {
            objective,
            totalClicks: 0,
            totalImpressions: 0,
            totalSpend: 0,
            count: 0
          }
        }
      })
    })

    // Since we can't directly link demographics to campaigns by campaign_id,
    // we'll distribute the demographics data proportionally across objectives
    // based on the number of campaigns per objective
    const objectiveCounts: { [key: string]: number } = {}
    campaigns.forEach((campaign: any) => {
      const objective = campaign.objective || 'NONE'
      objectiveCounts[objective] = (objectiveCounts[objective] || 0) + 1
    })

    const totalCampaigns = campaigns.length
    const totalDemoClicks = demographics.reduce((sum: number, d: any) => sum + parseInt(d.clicks || '0'), 0)
    const totalDemoImpressions = demographics.reduce((sum: number, d: any) => sum + parseInt(d.impressions || '0'), 0)
    const totalDemoSpend = demographics.reduce((sum: number, d: any) => sum + parseFloat(d.spend || '0'), 0)

    // Distribute engagement data proportionally by campaign count per objective
    return Object.entries(objectiveCounts).map(([objective, campaignCount]) => {
      const proportion = totalCampaigns > 0 ? campaignCount / totalCampaigns : 0
      const totalClicks = Math.round(totalDemoClicks * proportion)
      const totalImpressions = Math.round(totalDemoImpressions * proportion)
      const totalSpend = totalDemoSpend * proportion
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
      const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0

      return {
        objective,
        totalClicks,
        totalImpressions,
        totalSpend,
        ctr,
        cpc,
        campaignCount
      }
    }).sort((a, b) => b.totalSpend - a.totalSpend)
  }

  /**
   * 📱 DEVICES & PLATFORMS
   * Device and platform performance breakdown
   */
  static processDevices(devices: any[], platforms: any[]): DevicePlatformData {
    const deviceData = devices?.length ? this.processDeviceArray(devices) : null
    const platformData = platforms?.length ? this.processPlatformArray(platforms) : null
    
    // Calculate additional metrics for the devices page
    const totalDeviceSpend = deviceData ? deviceData.reduce((sum, d) => sum + d.spend, 0) : 0
    const deviceCount = deviceData ? deviceData.length : 0
    
    // Calculate mobile share based on actual device data
    const mobileDevice = deviceData?.find(d => 
      d.device.toLowerCase().includes('mobile') || 
      d.device.toLowerCase().includes('mobile_app') ||
      d.device.toLowerCase().includes('mobile_web')
    )
    const mobileShare = mobileDevice ? mobileDevice.percentage : 0
    
    // Calculate average CTR across all devices and platforms
    const allDevicesWithCTR = [
      ...(deviceData?.filter(d => d.ctr && d.ctr > 0) || []),
      ...(platformData?.filter(p => p.ctr && p.ctr > 0) || [])
    ]
    const averageCTR = allDevicesWithCTR.length > 0 
      ? allDevicesWithCTR.reduce((sum, item) => sum + item.ctr, 0) / allDevicesWithCTR.length
      : 0
    
    // Find top device by spend
    const topDevice = deviceData?.length > 0 ? 
      [...deviceData].sort((a, b) => b.spend - a.spend)[0] : undefined
    
    return {
      available: !!(deviceData || platformData),
      devices: deviceData || undefined,
      platforms: platformData || undefined,
      totalDeviceSpend,
      mobileShare,
      averageCTR,
      topDevice,
      deviceCount
    }
  }

  private static processDeviceArray(devices: any[]) {
    const totalSpend = devices.reduce((sum: number, d: any) => sum + parseFloat(d.spend || '0'), 0)
    
    return devices.map((device: any) => {
      const spend = parseFloat(device.spend || '0')
      const clicks = parseInt(device.clicks || '0')
      const impressions = parseInt(device.impressions || '0')
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
      const cpc = clicks > 0 ? spend / clicks : 0
      
      return {
        device: device.device_platform || device.device_type || device.device || 'Unknown',
        spend,
        percentage: totalSpend > 0 ? (spend / totalSpend) * 100 : 0,
        clicks,
        impressions,
        ctr,
        cpc
      }
    }).sort((a, b) => b.spend - a.spend)
  }

  private static processPlatformArray(platforms: any[]) {
    const totalSpend = platforms.reduce((sum: number, p: any) => sum + parseFloat(p.spend || '0'), 0)
    
    return platforms.map((platform: any) => {
      const spend = parseFloat(platform.spend || '0')
      const clicks = parseInt(platform.clicks || '0')
      const impressions = parseInt(platform.impressions || '0')
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
      const cpc = clicks > 0 ? spend / clicks : 0
      
      // Create descriptive platform name combining publisher and position
      const publisherPlatform = platform.publisher_platform || 'Unknown'
      const platformPosition = platform.platform_position || ''
      
      let platformName = publisherPlatform
      if (platformPosition && platformPosition !== 'unknown' && platformPosition !== publisherPlatform) {
        // Create readable platform names
        const readablePosition = platformPosition
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
          .replace('Facebook ', '')  // Remove redundant platform prefix
          .replace('Instagram ', '') // Remove redundant platform prefix
          
        platformName = `${publisherPlatform.charAt(0).toUpperCase() + publisherPlatform.slice(1)} ${readablePosition}`
      }
      
      return {
        platform: platformName,
        spend,
        percentage: totalSpend > 0 ? (spend / totalSpend) * 100 : 0,
        clicks,
        impressions,
        ctr,
        cpc
      }
    }).sort((a, b) => b.spend - a.spend)
  }

  /**
   * 🎯 SMART AUDIENCE PROFILER
   * Cross-analyze demographics, regional, and campaign data for audience insights
   */
  static processAudienceProfile(demographics: any[], regional: any[], campaigns: any[], devices: any[]): AudienceProfileData {
    console.log("🎯 Processing audience profile:", { 
      demographics: demographics?.length, 
      regional: regional?.length, 
      campaigns: campaigns?.length,
      devices: devices?.length 
    })
    
    if (!demographics?.length && !regional?.length && !campaigns?.length) {
      console.log("❌ No demographics, regional, or campaign data available")
      return { available: false }
    }
    
    // If we only have campaigns, create a campaign-focused analysis
    if (!demographics?.length && !regional?.length && campaigns?.length) {
      console.log("📊 Creating campaign-only audience analysis")
      return this.createCampaignOnlyProfile(campaigns, devices)
    }

    // Calculate total spend for percentages
    const totalSpend = demographics?.length 
      ? demographics.reduce((sum: number, demo: any) => sum + parseFloat(demo.spend || '0'), 0)
      : campaigns?.reduce((sum: number, c: any) => sum + parseFloat(c.spend || '0'), 0) || 0
    
    // Create audience segments by combining demographics and regional data
    const audienceSegments = demographics?.length ? demographics.map((demo: any) => ({
      age: demo.age || 'Unknown',
      gender: demo.gender || 'Unknown',
      spend: parseFloat(demo.spend || '0'),
      clicks: parseInt(demo.clicks || '0'),
      ctr: parseFloat(demo.ctr || '0'),
      cpc: parseFloat(demo.cpc || '0')
    })) : []

    // Find top performing segments (by CTR and spend combination)
    const topSegments = audienceSegments
      .filter(segment => segment.spend > 0 && segment.ctr > 0)
      .sort((a, b) => {
        // Score based on CTR and spend volume
        const scoreA = a.ctr * Math.log(a.spend + 1)
        const scoreB = b.ctr * Math.log(b.spend + 1)
        return scoreB - scoreA
      })
      .slice(0, 5)

    // Regional performance insights
    const topRegions = regional?.length ? regional
      .map((region: any) => ({
        region: region.region || 'Unknown',
        spend: parseFloat(region.spend || '0'),
        clicks: parseInt(region.clicks || '0'),
        ctr: parseFloat(region.ctr || '0')
      }))
      .sort((a, b) => b.ctr - a.ctr)
      .slice(0, 3) : []

    // Campaign objective insights
    const objectivePerformance = campaigns
      .reduce((acc: any, campaign: any) => {
        const objective = campaign.objective || 'NONE'
        const spend = parseFloat(campaign.spend || '0')
        
        if (!acc[objective]) {
          acc[objective] = { spend: 0, count: 0, avgSpend: 0 }
        }
        
        acc[objective].spend += spend
        acc[objective].count += 1
        acc[objective].avgSpend = acc[objective].spend / acc[objective].count
        
        return acc
      }, {})

    const topObjectives = Object.entries(objectivePerformance)
      .map(([objective, data]: [string, any]) => ({
        objective,
        ...data,
        efficiency: data.spend > 0 ? data.count / data.spend * 1000 : 0 // campaigns per 1000 spent
      }))
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 3)

    // Device preferences
    const devicePreferences = devices?.length ? devices
      .map((device: any) => ({
        device: device.device_platform || device.device || 'Unknown',
        spend: parseFloat(device.spend || '0'),
        clicks: parseInt(device.clicks || '0')
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 2) : []

    // Generate actionable recommendations
    const recommendations = []
    
    if (topSegments.length > 0) {
      const bestSegment = topSegments[0]
      recommendations.push({
        type: 'scale',
        title: `Scale ${bestSegment.age} ${bestSegment.gender} segment`,
        description: `High CTR (${bestSegment.ctr.toFixed(2)}%) with good volume`,
        impact: 'High',
        action: 'Increase budget allocation'
      })
    }
    
    if (topRegions.length > 0) {
      const bestRegion = topRegions[0]
      recommendations.push({
        type: 'geographic',
        title: `Focus on ${bestRegion.region}`,
        description: `Best regional CTR at ${bestRegion.ctr.toFixed(2)}%`,
        impact: 'Medium',
        action: 'Expand regional targeting'
      })
    }

    if (devicePreferences.length > 0) {
      const primaryDevice = devicePreferences[0]
      recommendations.push({
        type: 'device',
        title: `Optimize for ${primaryDevice.device}`,
        description: `${((primaryDevice.spend / totalSpend) * 100).toFixed(1)}% of spend`,
        impact: 'Medium', 
        action: 'Create device-specific creatives'
      })
    }

    return {
      available: true,
      topSegments,
      topRegions,
      topObjectives,
      devicePreferences,
      recommendations,
      totalSpend,
      insights: {
        bestPerformingAge: topSegments[0]?.age || 'Unknown',
        bestPerformingGender: topSegments[0]?.gender || 'Unknown',
        bestRegion: topRegions[0]?.region || 'Unknown',
        primaryDevice: devicePreferences[0]?.device || 'Unknown'
      }
    }
  }

  /**
   * 🎯 CAMPAIGN-ONLY AUDIENCE PROFILE
   * Create audience insights using only campaign data when demographics/regional unavailable
   */
  static createCampaignOnlyProfile(campaigns: any[], devices: any[]): AudienceProfileData {
    const totalSpend = campaigns.reduce((sum: number, c: any) => sum + parseFloat(c.spend || '0'), 0)
    
    // Group campaigns by objective
    const objectiveGroups = campaigns.reduce((acc: any, campaign: any) => {
      const objective = campaign.objective || 'NONE'
      if (!acc[objective]) {
        acc[objective] = { campaigns: [], totalSpend: 0, count: 0 }
      }
      const spend = parseFloat(campaign.spend || '0')
      acc[objective].campaigns.push(campaign)
      acc[objective].totalSpend += spend
      acc[objective].count++
      return acc
    }, {})

    const topObjectives = Object.entries(objectiveGroups)
      .map(([objective, data]: [string, any]) => ({
        objective,
        spend: data.totalSpend,
        count: data.count,
        avgSpend: data.totalSpend / data.count,
        efficiency: data.totalSpend > 0 ? data.count / data.totalSpend * 1000 : 0
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5)

    // Top performing campaigns (by spend)
    const topCampaigns = campaigns
      .filter(c => parseFloat(c.spend || '0') > 0)
      .sort((a, b) => parseFloat(b.spend || '0') - parseFloat(a.spend || '0'))
      .slice(0, 5)
      .map(campaign => ({
        name: campaign.name,
        objective: campaign.objective,
        spend: parseFloat(campaign.spend || '0'),
        status: campaign.status || 'Unknown'
      }))

    // Device preferences (if available)
    const devicePreferences = devices?.length ? devices
      .map((device: any) => ({
        device: device.device_platform || device.device || 'Unknown',
        spend: parseFloat(device.spend || '0'),
        clicks: parseInt(device.clicks || '0')
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 3) : []

    // Generate campaign-focused recommendations
    const recommendations = []
    
    if (topObjectives.length > 0) {
      const bestObjective = topObjectives[0]
      recommendations.push({
        type: 'objective',
        title: `Focus on ${bestObjective.objective.replace(/_/g, ' ')} campaigns`,
        description: `Your highest spending objective with ₹${Math.round(bestObjective.spend)} total`,
        impact: 'High',
        action: 'Analyze and replicate successful elements'
      })
    }

    if (topCampaigns.length > 0) {
      const topCampaign = topCampaigns[0]
      recommendations.push({
        type: 'campaign',
        title: `Scale "${topCampaign.name.substring(0, 30)}..."`,
        description: `Your top campaign with ₹${Math.round(topCampaign.spend)} spend`,
        impact: 'High',
        action: 'Increase budget or duplicate strategy'
      })
    }

    if (devicePreferences.length > 0) {
      const primaryDevice = devicePreferences[0]
      recommendations.push({
        type: 'device',
        title: `Optimize for ${primaryDevice.device}`,
        description: `Primary device with ₹${Math.round(primaryDevice.spend)} spend`,
        impact: 'Medium',
        action: 'Create device-specific ad formats'
      })
    }

    return {
      available: true,
      topSegments: [], // No demographic data available
      topRegions: [], // No regional data available
      topObjectives,
      topCampaigns, // Add this new field
      devicePreferences,
      recommendations,
      totalSpend,
      insights: {
        bestPerformingAge: 'Data not available',
        bestPerformingGender: 'Data not available', 
        bestRegion: 'Data not available',
        primaryDevice: devicePreferences[0]?.device || 'Unknown',
        topObjective: topObjectives[0]?.objective.replace(/_/g, ' ') || 'Unknown',
        topCampaign: topCampaigns[0]?.name.substring(0, 30) || 'Unknown'
      }
    }
  }

  /**
   * COMPREHENSIVE ANALYTICS
   * Generate all analytics sections at once
   */
  static generateFullAnalytics(reportData: any) {
    const campaigns = reportData.campaigns || []
    const adLevel = reportData.adLevel || []
    const demographics = reportData.demographics || []
    const regional = reportData.regional || []
    const devices = reportData.devices || []
    const platforms = reportData.platforms || []
    
    // Calculate total spend for campaign distribution
    const totalSpend = demographics.length > 0 
      ? demographics.reduce((sum: number, demo: any) => sum + parseFloat(demo.spend || '0'), 0)
      : campaigns.reduce((sum: number, c: any) => sum + parseFloat(c.spend || '0'), 0)

    // Get campaigns with distributed spend for consistent data across all analytics
    const campaignsWithSpend = this.analyzeCampaigns(campaigns, demographics, totalSpend)

    const audienceProfile = this.processAudienceProfile(demographics, regional, campaignsWithSpend, devices)
    console.log("🔥 Generated audienceProfile:", audienceProfile)
    
    return {
      overview: this.calculateOverview(reportData),
      campaigns: campaignsWithSpend,
      demographics: this.processDemographics(demographics),
      regional: this.processRegional(regional),
      engagement: this.calculateEngagement(campaigns, adLevel, demographics),
      campaignTypes: this.groupByObjective(campaignsWithSpend), // Use campaigns with distributed spend
      engagementByObjective: this.groupEngagementByObjective(campaigns, demographics), // NEW: Engagement data by objective
      devicesAndPlatforms: this.processDevices(devices, platforms),
      audienceProfile,
      adLevel: adLevel,
      dataAvailability: {
        campaigns: campaigns.length > 0,
        adLevel: adLevel.length > 0,
        demographics: demographics.length > 0,
        regional: regional.length > 0,
        devices: devices.length > 0,
        platforms: platforms.length > 0
      }
    }
  }
}
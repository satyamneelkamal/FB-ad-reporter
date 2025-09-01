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
  topPerformingAges?: Array<{
    ageGroup: string
    spend: number
    percentage: number
  }>
}

export interface RegionalData {
  available: boolean
  regions?: Array<{
    region: string
    spend: number
    clicks: number
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
  }>
  platforms?: Array<{
    platform: string
    spend: number
    percentage: number
  }>
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
    const genders: { [key: string]: number } = {}
    let totalSpend = 0
    
    demographics.forEach((demo: any) => {
      const spend = parseFloat(demo.spend || '0')
      totalSpend += spend
      
      if (demo.age) {
        ageGroups[demo.age] = (ageGroups[demo.age] || 0) + spend
      }
      if (demo.gender) {
        genders[demo.gender] = (genders[demo.gender] || 0) + spend
      }
    })
    
    // Calculate top performing age groups
    const topPerformingAges = Object.entries(ageGroups)
      .map(([age, spend]) => ({
        ageGroup: age,
        spend: spend as number,
        percentage: totalSpend > 0 ? ((spend as number) / totalSpend) * 100 : 0
      }))
      .sort((a, b) => b.spend - a.spend)
    
    return {
      available: true,
      ageGroups,
      genders,
      topPerformingAges
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
   * 📱 DEVICES & PLATFORMS
   * Device and platform performance breakdown
   */
  static processDevices(devices: any[], platforms: any[]): DevicePlatformData {
    const deviceData = devices?.length ? this.processDeviceArray(devices) : null
    const platformData = platforms?.length ? this.processPlatformArray(platforms) : null
    
    return {
      available: !!(deviceData || platformData),
      devices: deviceData || undefined,
      platforms: platformData || undefined
    }
  }

  private static processDeviceArray(devices: any[]) {
    const totalSpend = devices.reduce((sum: number, d: any) => sum + parseFloat(d.spend || '0'), 0)
    
    return devices.map((device: any) => {
      const spend = parseFloat(device.spend || '0')
      return {
        device: device.device_type || device.device || 'Unknown',
        spend,
        percentage: totalSpend > 0 ? (spend / totalSpend) * 100 : 0
      }
    }).sort((a, b) => b.spend - a.spend)
  }

  private static processPlatformArray(platforms: any[]) {
    const totalSpend = platforms.reduce((sum: number, p: any) => sum + parseFloat(p.spend || '0'), 0)
    
    return platforms.map((platform: any) => {
      const spend = parseFloat(platform.spend || '0')
      return {
        platform: platform.platform_position || platform.platform || 'Unknown',
        spend,
        percentage: totalSpend > 0 ? (spend / totalSpend) * 100 : 0
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
    const hourly = reportData.hourly || []
    
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
      devicesAndPlatforms: this.processDevices(devices, platforms),
      audienceProfile,
      adLevel: adLevel,
      hourly: hourly,
      dataAvailability: {
        campaigns: campaigns.length > 0,
        adLevel: adLevel.length > 0,
        demographics: demographics.length > 0,
        regional: regional.length > 0,
        devices: devices.length > 0,
        platforms: platforms.length > 0,
        hourly: hourly.length > 0
      }
    }
  }
}
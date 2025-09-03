'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, MapPin, Smartphone, Target, Lightbulb, ArrowUpRight } from "lucide-react"
import { AudienceMatrix } from "./AudienceMatrix"

interface AudienceProfileData {
  available: boolean
  topSegments?: Array<{
    age: string
    gender: string
    spend: number
    clicks: number
    ctr: number
    cpc: number
    conversions?: number
    roas?: number
    conversionRate?: number
  }>
  topRegions?: Array<{
    region: string
    spend: number
    clicks: number
    ctr: number
    conversions?: number
    roas?: number
    conversionValue?: number
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

interface SmartAudienceProfilerProps {
  audienceData?: AudienceProfileData
}

export function SmartAudienceProfiler({ audienceData }: SmartAudienceProfilerProps) {
  // Debug logging
  console.log("🎯 SmartAudienceProfiler received data:", audienceData)
  console.log("📊 Available?", audienceData?.available)
  
  if (!audienceData?.available) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Smart Audience Profiler
          </CardTitle>
          <CardDescription>
            Cross-platform audience intelligence and optimization insights
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Audience Analysis Loading</h3>
          <p className="text-muted-foreground">
            Audience insights will appear once demographic and regional data is processed
          </p>
        </CardContent>
      </Card>
    )
  }

  const { topSegments, topRegions, topObjectives, topCampaigns, devicePreferences, recommendations, insights } = audienceData

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Smart Audience Profiler
          </CardTitle>
          <CardDescription>
            AI-powered audience intelligence combining demographics, geography, and behavior data
          </CardDescription>
        </CardHeader>
        
        {/* Key Insights Summary */}
        {insights && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {/* Show demographic data if available, otherwise campaign data */}
              {insights.bestPerformingAge !== 'Data not available' ? (
                <>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">Best Age Group</div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{insights.bestPerformingAge}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">Top Gender</div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">{insights.bestPerformingGender}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">Best Region</div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{insights.bestRegion}</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">Primary Device</div>
                    <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{insights.primaryDevice}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">Top Objective</div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{insights.topObjective}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">Best Campaign</div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300 truncate" title={insights.topCampaign}>
                      {insights.topCampaign}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Campaigns</div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{topCampaigns?.length || 0}</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">Primary Device</div>
                    <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{insights.primaryDevice}</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performing Segments OR Top Campaigns */}
        {topSegments && topSegments.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-4 w-4" />
                Top Performing Segments
              </CardTitle>
              <CardDescription>
                Best audience demographics by conversion performance and ROI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topSegments.slice(0, 3).map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{segment.age} {segment.gender}</div>
                      <div className="text-sm text-muted-foreground">
                        {segment.roas ? (
                          <>ROAS: {segment.roas.toFixed(2)}x • {segment.conversions || 0} conversions</>
                        ) : (
                          <>CTR: {segment.ctr.toFixed(2)}% • CPC: ₹{segment.cpc.toFixed(2)}</>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {segment.roas && segment.roas >= 2 ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ₹{Math.round(segment.spend)}
                        </Badge>
                      ) : segment.roas && segment.roas >= 1 ? (
                        <Badge variant="secondary">₹{Math.round(segment.spend)}</Badge>
                      ) : segment.roas ? (
                        <Badge variant="outline" className="border-orange-200 text-orange-600">
                          ₹{Math.round(segment.spend)}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">₹{Math.round(segment.spend)}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : topCampaigns && topCampaigns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-4 w-4" />
                Top Performing Campaigns
              </CardTitle>
              <CardDescription>
                Campaigns with highest spend and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCampaigns.slice(0, 3).map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium truncate" title={campaign.name}>
                        {campaign.name.length > 25 ? campaign.name.substring(0, 25) + '...' : campaign.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {campaign.objective.replace(/_/g, ' ')} • {campaign.status}
                      </div>
                    </div>
                    <Badge variant="secondary">₹{Math.round(campaign.spend)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Regions */}
        {topRegions && topRegions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                High-Performance Regions
              </CardTitle>
              <CardDescription>
                Geographic areas with best conversion performance and ROI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topRegions.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{region.region}</div>
                      <div className="text-sm text-muted-foreground">
                        {region.roas ? (
                          <>ROAS: {region.roas.toFixed(2)}x • ₹{Math.round(region.conversionValue || 0)} revenue</>
                        ) : (
                          <>{region.clicks.toLocaleString()} clicks • {region.ctr.toFixed(2)}% CTR</>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {region.roas && region.roas >= 2 ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ₹{Math.round(region.spend)}
                        </Badge>
                      ) : region.roas && region.roas >= 1 ? (
                        <Badge variant="secondary">₹{Math.round(region.spend)}</Badge>
                      ) : region.roas ? (
                        <Badge variant="outline" className="border-orange-200 text-orange-600">
                          ₹{Math.round(region.spend)}
                        </Badge>
                      ) : (
                        <Badge variant="outline">₹{Math.round(region.spend)}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaign Objective Performance */}
        {topObjectives && topObjectives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Campaign Objectives
              </CardTitle>
              <CardDescription>
                Most efficient campaign objectives by spend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topObjectives.map((objective, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{objective.objective.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-muted-foreground">
                        {objective.count} campaigns • ₹{Math.round(objective.avgSpend)} avg
                      </div>
                    </div>
                    <Badge variant="secondary">₹{Math.round(objective.spend)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Device Preferences */}
        {devicePreferences && devicePreferences.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Device Performance
              </CardTitle>
              <CardDescription>
                Platform preferences and spending distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {devicePreferences.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{device.device}</div>
                      <div className="text-sm text-muted-foreground">
                        {device.clicks.toLocaleString()} clicks
                      </div>
                    </div>
                    <Badge variant="outline">₹{Math.round(device.spend)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Interactive Audience Matrix */}
      <AudienceMatrix 
        segments={topSegments} 
        regions={topRegions} 
      />

      {/* AI-Powered Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI-Powered Recommendations
            </CardTitle>
            <CardDescription>
              Actionable insights to optimize your audience targeting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <Badge 
                      variant={rec.impact === 'High' ? 'destructive' : rec.impact === 'Medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {rec.impact}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{rec.description}</p>
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <span>{rec.action}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
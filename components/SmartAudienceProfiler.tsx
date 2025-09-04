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
    avgROAS?: number
    totalConversions?: number
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
            ROI-focused audience intelligence highlighting profitable segments and revenue opportunities
          </CardDescription>
        </CardHeader>
        
        {/* ROAS-Focused Key Insights Summary */}
        {insights && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {/* Show ROAS-focused insights if demographic/regional data available */}
              {insights.bestPerformingAge !== 'Data not available' ? (
                <>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">🎯 ROAS Champion</div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">{insights.bestPerformingAge}</div>
                    <div className="text-xs text-muted-foreground mt-1">Best performing segment</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">💰 Revenue Leader</div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{insights.bestRegion}</div>
                    <div className="text-xs text-muted-foreground mt-1">Top revenue region</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">📈 Efficiency Star</div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{insights.bestPerformingGender}</div>
                    <div className="text-xs text-muted-foreground mt-1">Lowest cost per conversion</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">📱 Device Leader</div>
                    <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{insights.primaryDevice}</div>
                    <div className="text-xs text-muted-foreground mt-1">Best ROI platform</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">🚀 Top Campaign</div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300 truncate" title={insights.topCampaign}>
                      {insights.topCampaign}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Highest ROAS</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">🎯 Best Objective</div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{insights.topObjective}</div>
                    <div className="text-xs text-muted-foreground mt-1">Most profitable</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">📊 Active Campaigns</div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{topCampaigns?.length || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total running</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="text-sm text-muted-foreground">📱 Device Leader</div>
                    <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{insights.primaryDevice}</div>
                    <div className="text-xs text-muted-foreground mt-1">Best ROI platform</div>
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
                🎯 ROAS Champions
              </CardTitle>
              <CardDescription>
                Highest-performing audience segments ranked by profitability and revenue impact
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
                          <>💰 ROAS: {segment.roas.toFixed(2)}x • ₹{Math.round((segment.conversions || 0) * (segment.roas || 0) * segment.spend / (segment.conversions || 1))} revenue</>
                        ) : (
                          <>📈 CTR: {segment.ctr.toFixed(2)}% • {segment.clicks} clicks</>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-right space-y-1">
                        {segment.roas && segment.roas >= 3 ? (
                          <>
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              🎯 {segment.roas.toFixed(1)}x ROAS
                            </Badge>
                            <div className="text-xs text-muted-foreground">₹{Math.round(segment.spend)} spend</div>
                          </>
                        ) : segment.roas && segment.roas >= 2 ? (
                          <>
                            <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              📈 {segment.roas.toFixed(1)}x ROAS
                            </Badge>
                            <div className="text-xs text-muted-foreground">₹{Math.round(segment.spend)} spend</div>
                          </>
                        ) : segment.roas && segment.roas >= 1 ? (
                          <>
                            <Badge variant="secondary">
                              🔄 {segment.roas.toFixed(1)}x ROAS
                            </Badge>
                            <div className="text-xs text-muted-foreground">₹{Math.round(segment.spend)} spend</div>
                          </>
                        ) : segment.roas ? (
                          <>
                            <Badge variant="outline" className="border-orange-200 text-orange-600">
                              ⚠️ {segment.roas.toFixed(1)}x ROAS
                            </Badge>
                            <div className="text-xs text-muted-foreground">₹{Math.round(segment.spend)} spend</div>
                          </>
                        ) : (
                          <Badge variant="secondary">₹{Math.round(segment.spend)}</Badge>
                        )}
                      </div>
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
                💰 Revenue Powerhouses
              </CardTitle>
              <CardDescription>
                Top regions by profitability and revenue generation
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
                          <>🚀 {region.roas.toFixed(2)}x ROAS • ₹{Math.round(region.conversionValue || 0).toLocaleString()} revenue</>
                        ) : (
                          <>📈 {region.clicks.toLocaleString()} clicks • {region.ctr.toFixed(2)}% CTR</>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-right space-y-1">
                        {region.roas && region.roas >= 3 ? (
                          <>
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              🏆 {region.roas.toFixed(1)}x ROAS
                            </Badge>
                            <div className="text-xs text-muted-foreground">₹{Math.round(region.spend).toLocaleString()} spend</div>
                          </>
                        ) : region.roas && region.roas >= 2 ? (
                          <>
                            <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              🚀 {region.roas.toFixed(1)}x ROAS
                            </Badge>
                            <div className="text-xs text-muted-foreground">₹{Math.round(region.spend).toLocaleString()} spend</div>
                          </>
                        ) : region.roas && region.roas >= 1 ? (
                          <>
                            <Badge variant="secondary">
                              🔄 {region.roas.toFixed(1)}x ROAS
                            </Badge>
                            <div className="text-xs text-muted-foreground">₹{Math.round(region.spend).toLocaleString()} spend</div>
                          </>
                        ) : region.roas ? (
                          <>
                            <Badge variant="outline" className="border-orange-200 text-orange-600">
                              ⚠️ {region.roas.toFixed(1)}x ROAS
                            </Badge>
                            <div className="text-xs text-muted-foreground">₹{Math.round(region.spend).toLocaleString()} spend</div>
                          </>
                        ) : (
                          <Badge variant="outline">₹{Math.round(region.spend).toLocaleString()}</Badge>
                        )}
                      </div>
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
                🎯 Objective Performance
              </CardTitle>
              <CardDescription>
                Campaign objectives ranked by ROI efficiency and profitability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topObjectives.map((objective, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">
                        {objective.objective.replace(/_/g, ' ')}
                        {objective.avgROAS && objective.avgROAS >= 2 ? ' 🏆' : objective.avgROAS && objective.avgROAS >= 1 ? ' 🚀' : objective.avgROAS ? ' 📈' : ''}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {objective.avgROAS ? (
                          <>{objective.avgROAS.toFixed(1)}x ROAS • {objective.count} campaigns</>
                        ) : (
                          <>{objective.count} campaigns • ₹{Math.round(objective.avgSpend)} avg</>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      {objective.avgROAS && objective.avgROAS >= 2 ? (
                        <>
                          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            💰 Profitable
                          </Badge>
                          <div className="text-xs text-muted-foreground">₹{Math.round(objective.spend).toLocaleString()}</div>
                        </>
                      ) : objective.avgROAS && objective.avgROAS >= 1 ? (
                        <>
                          <Badge variant="secondary">
                            🔄 Break-even
                          </Badge>
                          <div className="text-xs text-muted-foreground">₹{Math.round(objective.spend).toLocaleString()}</div>
                        </>
                      ) : objective.avgROAS ? (
                        <>
                          <Badge variant="outline" className="border-orange-200 text-orange-600">
                            ⚠️ Needs optimization
                          </Badge>
                          <div className="text-xs text-muted-foreground">₹{Math.round(objective.spend).toLocaleString()}</div>
                        </>
                      ) : (
                        <Badge variant="secondary">₹{Math.round(objective.spend).toLocaleString()}</Badge>
                      )}
                    </div>
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
              🤖 ROAS Optimization Insights
            </CardTitle>
            <CardDescription>
              AI-powered recommendations to maximize profitability and revenue growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <Badge 
                      variant={rec.impact === 'High' ? 'default' : rec.impact === 'Medium' ? 'secondary' : 'outline'}
                      className={`text-xs ${
                        rec.impact === 'High' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        rec.impact === 'Medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }`}
                    >
                      {rec.impact === 'High' ? '🚀 High ROI' : rec.impact === 'Medium' ? '📈 Medium ROI' : '🗓️ Planning'} {rec.impact}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{rec.description}</p>
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                    <span>🎯 {rec.action}</span>
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
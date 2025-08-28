/**
 * Regional Performance Dashboard
 * 
 * Geographic analysis with Bar, Pie, and Line charts
 */

'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, AlertCircle, MapPin, Globe, TrendingUp, Users } from "lucide-react"

export default function RegionalAnalysisPage() {
  const analytics = useAnalytics()

  if (analytics.error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Regional Data
            </CardTitle>
            <CardDescription>
              {analytics.error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={analytics.refresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate regional insights from available data
  const regionalData = analytics.regional?.regions || []
  const totalRegionalSpend = regionalData.reduce((sum, r) => sum + r.spend, 0)
  const topPerformingRegion = regionalData.length > 0 ? 
    [...regionalData].sort((a, b) => b.spend - a.spend)[0] : null
  const bestCTRRegion = regionalData.length > 0 ? 
    [...regionalData].sort((a, b) => b.ctr - a.ctr)[0] : null
  const totalRegions = regionalData.length

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regional Performance</h1>
          <p className="text-muted-foreground mt-2">
            Geographic distribution and regional advertising performance analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          {analytics.lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date(analytics.lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <Button 
            onClick={analytics.refresh} 
            variant="outline" 
            size="sm"
            disabled={analytics.loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${analytics.loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Regional Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Regions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegions}</div>
            <p className="text-xs text-muted-foreground">
              Geographic markets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regional Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRegionalSpend}</div>
            <p className="text-xs text-muted-foreground">
              Across all regions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Region</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{topPerformingRegion?.spend || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {topPerformingRegion?.region || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best CTR</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bestCTRRegion?.ctr.toFixed(2) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {bestCTRRegion?.region || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance Cards */}
      {regionalData && regionalData.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Regional Performance Breakdown</h2>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {regionalData
              .sort((a, b) => b.spend - a.spend)
              .map((region, index) => (
                <Card key={region.region}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}
                      />
                      {region.region}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Spend</span>
                        <span className="font-semibold">₹{Math.round(region.spend).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Clicks</span>
                        <span className="font-semibold">{region.clicks?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Impressions</span>
                        <span className="font-semibold">{region.impressions?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">CTR</span>
                        <span className="font-semibold">{region.ctr?.toFixed(2) || '0.00'}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Share</span>
                        <span className="font-semibold">{region.percentage?.toFixed(1) || '0.0'}%</span>
                      </div>
                      {region.cpc && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">CPC</span>
                          <span className="font-semibold">₹{region.cpc.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Performance Insights */}
      <Card>
            <CardHeader>
              <CardTitle>Regional Insights</CardTitle>
              <CardDescription>
                Key observations from your regional advertising performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!analytics.loading && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-foreground">Market Distribution</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {topPerformingRegion ? (
                        <>
                          <strong>{topPerformingRegion.region}</strong> is your largest market, 
                          accounting for <strong>₹{topPerformingRegion.spend}</strong> in spend
                          {totalRegionalSpend > 0 && (
                            <> ({((topPerformingRegion.spend / totalRegionalSpend) * 100).toFixed(1)}% of total)</>
                          )}
                        </>
                      ) : (
                        <>
                          Regional performance data will be calculated once geographic 
                          targeting data is available from your campaigns.
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Engagement Patterns</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {bestCTRRegion ? (
                        <>
                          <strong>{bestCTRRegion.region}</strong> shows the highest engagement 
                          with a <strong>{bestCTRRegion.ctr.toFixed(2)}% CTR</strong>, indicating 
                          strong audience resonance in this market.
                        </>
                      ) : (
                        <>
                          Engagement metrics by region will be available once sufficient 
                          campaign data with geographic breakdown is collected.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {analytics.loading && (
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              )}
            </CardContent>
          </Card>


      {/* Performance Recommendations */}
      {!analytics.loading && totalRegions > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              Regional Optimization Recommendations
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Strategies to improve regional performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              {topPerformingRegion && (
                <p>• Focus budget allocation on high-performing regions like {topPerformingRegion.region}</p>
              )}
              {bestCTRRegion && (
                <p>• Analyze creative strategies from {bestCTRRegion.region} for use in other markets</p>
              )}
              <p>• Test localized ad copy and creative content for regional relevance</p>
              <p>• Consider regional timing adjustments based on local user behavior patterns</p>
              <p>• Evaluate cost efficiency differences between regions for budget optimization</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!analytics.loading && totalRegions === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Regional Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Regional performance data will appear here once campaigns with geographic 
              targeting are collected and processed.
            </p>
            <Button onClick={analytics.refresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Updates
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
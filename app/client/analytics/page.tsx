/**
 * Client Analytics Overview Dashboard
 * 
 * Main analytics page with metric cards and overview summary
 */

'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, TrendingUp, Users, Target, DollarSign } from "lucide-react"
import { ChartAreaInteractive } from "@/components/charts/area-chart" 
import { ChartPieSeparatorNone } from "@/components/charts/pie-chart"
import { ChartBarLabelCustom } from "@/components/charts/bar-chart"
import { CampaignROIChart } from "@/components/charts/roi-chart"
import { SmartAudienceProfiler } from "@/components/SmartAudienceProfiler"
import { 
  transformEngagementToLineChart, 
  transformObjectivesToPieChart, 
  transformCampaignsToBarChart,
  createEngagementChartConfig,
  createObjectiveChartConfig,
  createCampaignChartConfig
} from '@/lib/chart-transforms'

export default function AnalyticsDashboard() {
  const analytics = useAnalytics()

  if (analytics.error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Analytics
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

  return (
    <div className="container mx-auto px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
          <p className="text-muted-foreground mt-2">
            Facebook Ads performance insights and key metrics
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

      {/* Key Metrics Cards */}
      <div className={`grid gap-4 ${
        analytics.overview?.totalConversions ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'
      }`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{analytics.overview?.totalSpend ? Math.round(analytics.overview.totalSpend).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.campaigns.length} campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.engagement?.totalClicks?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.engagement?.totalImpressions?.toLocaleString() || '0'} impressions
            </p>
          </CardContent>
        </Card>

        {/* ROI Metrics - Only show if conversion data is available */}
        {analytics.overview?.totalConversions && analytics.overview.totalConversions > 0 && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{analytics.overview?.totalConversionValue ? Math.round(analytics.overview.totalConversionValue).toLocaleString() : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview.totalConversions} conversions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average ROAS</CardTitle>
                <TrendingUp className={`h-4 w-4 ${
                  analytics.overview?.averageROAS ? 
                    analytics.overview.averageROAS >= 2 ? 'text-green-600' : 
                    analytics.overview.averageROAS >= 1 ? 'text-blue-600' : 'text-orange-600'
                  : 'text-muted-foreground'
                }`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.overview?.averageROAS ? analytics.overview.averageROAS.toFixed(2) : '0.00'}x
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview?.costPerConversion ? 
                    `₹${Math.round(analytics.overview.costPerConversion)} cost per conversion` :
                    'Return on ad spend'
                  }
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Section */}
      {!analytics.loading && (
        <div className="space-y-4">
          {/* Main Charts Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Trend Chart */}
            <div className="col-span-full md:col-span-2">
              <ChartAreaInteractive 
                data={transformEngagementToLineChart(analytics.engagement)}
                config={createEngagementChartConfig()}
                title="Engagement Performance"
                description="Facebook Ads clicks, impressions, reach, and spend trends over time with dual Y-axis"
              />
            </div>

            {/* Campaign Objectives Pie Chart */}
            <ChartPieSeparatorNone 
              data={transformObjectivesToPieChart(analytics.campaignTypes)}
              config={createObjectiveChartConfig(analytics.campaignTypes)}
              title="Campaign Objectives"
              description="Spend distribution by objective type"
            />

            {/* Top Campaigns Bar Chart */}
            <ChartBarLabelCustom 
              data={analytics.regional?.regions || []}
              title="Top Regional Performance"
              description="Regions with highest click engagement"
            />
          </div>

          {/* ROI Charts - Only show if ROI data is available */}
          {analytics.roi?.available && analytics.roi.campaignROI && analytics.roi.campaignROI.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <CampaignROIChart data={analytics.roi.campaignROI} />
              {analytics.roi.objectiveROI && analytics.roi.objectiveROI.length > 0 && (
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        ROI Summary
                      </CardTitle>
                      <CardDescription>Quick ROI performance overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Overall ROAS</span>
                          <span className="text-lg font-semibold">
                            {analytics.roi.overallROAS?.toFixed(2) || '0.00'}x
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Revenue</span>
                          <span className="text-lg font-semibold">
                            ₹{Math.round(analytics.roi.totalConversionValue || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Conversions</span>
                          <span className="text-lg font-semibold">
                            {analytics.roi.totalConversions || 0}
                          </span>
                        </div>
                        {analytics.roi.insights?.bestPerformingCampaign && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground">Best Campaign:</p>
                            <p className="text-sm font-medium truncate">
                              {analytics.roi.insights.bestPerformingCampaign}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Smart Audience Profiler */}
      <SmartAudienceProfiler audienceData={analytics.audienceProfile} />

      {/* Data Availability Status */}
      {!analytics.loading && (
        <Card>
          <CardHeader>
            <CardTitle>Data Availability</CardTitle>
            <CardDescription>
              Current status of different data types from Facebook Ads API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.dataAvailability && Object.entries(analytics.dataAvailability).map(([key, available]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    available ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="capitalize text-sm">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {available ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Summary */}
      {!analytics.loading && analytics.overview && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Summary</CardTitle>
            <CardDescription>
              Key insights from your Facebook Ads data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-foreground">Campaign Distribution</div>
                <div className="text-muted-foreground mt-1">
                  {analytics.overview.activeCampaigns} active out of {analytics.overview.totalCampaigns} total campaigns
                  {analytics.overview?.totalConversions && (
                    <> • {analytics.overview.totalConversions} total conversions</>
                  )}
                </div>
              </div>
              <div>
                <div className="font-medium text-foreground">ROI Performance</div>
                <div className="text-muted-foreground mt-1">
                  {analytics.overview?.averageROAS ? (
                    <>
                      {analytics.overview.averageROAS >= 2 ? (
                        <span className="text-green-600">Excellent ROAS: {analytics.overview.averageROAS.toFixed(2)}x</span>
                      ) : analytics.overview.averageROAS >= 1 ? (
                        <span className="text-blue-600">Good ROAS: {analytics.overview.averageROAS.toFixed(2)}x</span>
                      ) : (
                        <span className="text-orange-600">Low ROAS: {analytics.overview.averageROAS.toFixed(2)}x</span>
                      )}
                    </>
                  ) : (
                    `${analytics.overview.totalAds} ads across all campaigns`
                  )}
                </div>
              </div>
              <div>
                <div className="font-medium text-foreground">Revenue Potential</div>
                <div className="text-muted-foreground mt-1">
                  {analytics.overview?.totalConversionValue ? (
                    <>₹{Math.round(analytics.overview.totalConversionValue).toLocaleString()} monthly conversion value</>
                  ) : (
                    `${analytics.campaignTypes.length} different campaign objectives`
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
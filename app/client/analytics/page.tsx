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
import { ChartBarMultiple } from "@/components/charts/bar-chart"
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview?.activeCampaigns || 0} active
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
              Total interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.engagement?.totalImpressions?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {!analytics.loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Performance Trend Chart */}
          <div className="col-span-full md:col-span-2">
            <ChartAreaInteractive 
              data={transformEngagementToLineChart(analytics.engagement)}
              config={createEngagementChartConfig()}
              title="Engagement Performance"
              description="Facebook Ads clicks and impressions trends"
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
          <ChartBarMultiple 
            data={transformCampaignsToBarChart(analytics.campaigns)}
            config={createCampaignChartConfig()}
            title="Campaign Performance"
            description="Top campaigns spend and performance trends"
          />
        </div>
      )}

      {/* Top Campaigns Summary */}
      {analytics.campaigns && analytics.campaigns.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Top Campaigns Overview</h2>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {analytics.campaigns
              .sort((a, b) => b.spend - a.spend)
              .slice(0, 6)
              .map((campaign, index) => (
                <Card key={campaign.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">
                      <div className="truncate" title={campaign.name}>
                        {campaign.name}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Spend</span>
                        <span className="font-semibold">₹{Math.round(campaign.spend).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Objective</span>
                        <span className="font-semibold text-xs">{campaign.objective.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className={`font-semibold text-xs ${campaign.status === 'Active' ? 'text-green-600' : 'text-gray-600'}`}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

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
                </div>
              </div>
              <div>
                <div className="font-medium text-foreground">Ad Volume</div>
                <div className="text-muted-foreground mt-1">
                  {analytics.overview.totalAds} ads across all campaigns
                </div>
              </div>
              <div>
                <div className="font-medium text-foreground">Objectives</div>
                <div className="text-muted-foreground mt-1">
                  {analytics.campaignTypes.length} different campaign objectives
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
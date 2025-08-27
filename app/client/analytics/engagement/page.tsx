/**
 * Engagement Metrics Dashboard
 * 
 * Line, Area, and Radar charts for engagement analysis
 */

'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { 
  CTRPerformanceLine,
  EngagementVolumeArea,
  EngagementRadar,
  CampaignEngagementComparison
} from '@/components/analytics/engagement-charts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, MousePointer, Eye, Heart, TrendingUp } from "lucide-react"

export default function EngagementMetricsPage() {
  const analytics = useAnalytics()

  if (analytics.error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Engagement Data
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

  const engagement = analytics.engagement || {
    totalClicks: 0,
    totalImpressions: 0,
    ctr: 0,
    avgCpc: 0
  }

  // Calculate additional metrics
  const engagementRate = engagement.totalImpressions > 0 ? 
    (engagement.totalClicks / engagement.totalImpressions) * 100 : 0
  const totalSpend = analytics.campaigns.reduce((sum, c) => sum + c.spend, 0)
  const costPerImpression = engagement.totalImpressions > 0 ? 
    (totalSpend / engagement.totalImpressions) * 1000 : 0 // CPM

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engagement Metrics</h1>
          <p className="text-muted-foreground mt-2">
            Click-through rates, engagement patterns, and interaction analysis
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

      {/* Key Engagement Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagement.totalClicks?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagement.totalImpressions?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total ad views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagement.ctr.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Click-through rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CPC</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${engagement.avgCpc.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cost per click
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagementRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Clicks / Impressions ratio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${costPerImpression.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cost per 1,000 impressions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSpend}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* CTR Performance Line Chart - spans 2 columns */}
        <div className="lg:col-span-2">
          <CTRPerformanceLine 
            loading={analytics.loading}
          />
        </div>

        {/* Engagement Volume Area Chart */}
        <EngagementVolumeArea 
          loading={analytics.loading}
        />

        {/* Engagement Radar Chart */}
        <EngagementRadar 
          loading={analytics.loading}
        />

        {/* Campaign Engagement Comparison - spans 2 columns */}
        <div className="lg:col-span-2">
          <CampaignEngagementComparison 
            loading={analytics.loading}
          />
        </div>
      </div>

      {/* Engagement Insights */}
      {!analytics.loading && (
        <Card>
          <CardHeader>
            <CardTitle>Engagement Insights</CardTitle>
            <CardDescription>
              Key observations from your engagement performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-foreground">Click Performance</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {engagement.totalClicks > 0 ? (
                    <>
                      Your campaigns generated <strong>{engagement.totalClicks?.toLocaleString() || '0'} clicks</strong> 
                      from <strong>{engagement.totalImpressions?.toLocaleString() || '0'} impressions</strong>, 
                      resulting in a {engagement.ctr.toFixed(2)}% click-through rate.
                    </>
                  ) : (
                    <>
                      No click data available yet. This could indicate campaigns are still running 
                      or there may be a delay in data collection.
                    </>
                  )}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Cost Efficiency</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {engagement.avgCpc > 0 ? (
                    <>
                      Your average cost per click is <strong>${engagement.avgCpc.toFixed(2)}</strong>, 
                      with a cost per thousand impressions (CPM) of <strong>${costPerImpression.toFixed(2)}</strong>.
                    </>
                  ) : (
                    <>
                      Cost metrics will be calculated once engagement data is available from your campaigns.
                    </>
                  )}
                </p>
              </div>
            </div>

            {analytics.campaigns.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground">Campaign Distribution</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  You have <strong>{analytics.campaigns.length} campaigns</strong> across{' '}
                  <strong>{analytics.campaignTypes.length} different objectives</strong>. The most 
                  common objectives are{' '}
                  {analytics.campaignTypes.slice(0, 3).map(type => type.objective).join(', ')}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Recommendations */}
      {!analytics.loading && engagement.ctr < 1.0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">
              Performance Recommendations
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              Tips to improve your engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p>• Consider testing different ad creatives to improve click-through rates</p>
              <p>• Review your audience targeting to ensure ads are reaching interested users</p>
              <p>• Test different call-to-action buttons and ad copy variations</p>
              <p>• Monitor performance by time of day and adjust scheduling accordingly</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
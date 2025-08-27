/**
 * Client Analytics Overview Dashboard
 * 
 * Main analytics page with metric cards and overview charts
 */

'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { MetricCardsGrid } from '@/components/analytics/metric-cards'
import { 
  CampaignStatusChart,
  TopCampaignsChart,
  AccountHealthChart,
  SpendOverviewChart
} from '@/components/analytics/overview-charts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"

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

      {/* Metric Cards */}
      <MetricCardsGrid 
        cards={analytics.metricCards}
        loading={analytics.loading}
      />

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Campaign Status Pie Chart */}
        <CampaignStatusChart 
          data={analytics.campaignStatusChart}
          loading={analytics.loading}
        />

        {/* Account Health Radial Chart */}
        <AccountHealthChart 
          data={analytics.campaignStatusChart}
          loading={analytics.loading}
        />

        {/* Top Campaigns Bar Chart - spans 2 columns */}
        <div className="md:col-span-2 lg:col-span-3">
          <TopCampaignsChart 
            data={analytics.campaignSpendChart}
            loading={analytics.loading}
          />
        </div>

        {/* Spend Overview Area Chart - spans 2 columns */}
        <div className="md:col-span-2 lg:col-span-3">
          <SpendOverviewChart 
            loading={analytics.loading}
          />
        </div>
      </div>

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
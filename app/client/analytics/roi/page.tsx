/**
 * ROI & ROAS Analysis Dashboard
 * 
 * Comprehensive ROI analysis with conversion tracking and ROAS metrics
 */

'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, AlertCircle, ArrowUpDown, TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import { AnalyticsLoading } from "@/components/analytics-loading"
import { useState } from 'react'
import { CampaignROIChart, ObjectiveROIChart } from "@/components/charts/roi-chart"

export default function ROIAnalysisPage() {
  const analytics = useAnalytics()
  const [sortBy, setSortBy] = useState<'roas' | 'conversions' | 'conversionValue' | 'costPerConversion'>('roas')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const roiData = analytics.roi

  const handleSort = (field: 'roas' | 'conversions' | 'conversionValue' | 'costPerConversion') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortedCampaignROI = roiData?.campaignROI ? [...roiData.campaignROI].sort((a, b) => {
    const aVal = sortBy === 'roas' ? a.roas : 
                 sortBy === 'conversions' ? a.conversions :
                 sortBy === 'conversionValue' ? a.conversionValue : a.costPerConversion
    const bVal = sortBy === 'roas' ? b.roas : 
                 sortBy === 'conversions' ? b.conversions :
                 sortBy === 'conversionValue' ? b.conversionValue : b.costPerConversion
    
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
  }) : []

  if (analytics.loading) {
    return <AnalyticsLoading cardCount={4} />
  }

  if (analytics.error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading ROI Data
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

  if (!roiData?.available) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ROI & ROAS Analysis</h1>
            <p className="text-muted-foreground mt-2">
              Return on Investment and Return on Ad Spend analysis
            </p>
          </div>
        </div>

        {/* No ROI Data Available */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ROI Tracking Not Available
            </CardTitle>
            <CardDescription>
              Conversion tracking is not set up for your campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To see ROI and ROAS data, you need to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Set up Facebook Pixel on your website</li>
              <li>Configure conversion events (purchase, lead, etc.)</li>
              <li>Enable conversion tracking in your Facebook campaigns</li>
              <li>Wait for conversion data to be collected (usually 24-48 hours)</li>
            </ul>
            <div className="pt-4">
              <Button onClick={analytics.refresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ROI & ROAS Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Return on Investment and Return on Ad Spend performance analysis
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

      {/* ROI Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{roiData.totalConversionValue ? Math.round(roiData.totalConversionValue).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              From conversions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roiData.totalConversions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Purchase events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overall ROAS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roiData.overallROAS ? roiData.overallROAS.toFixed(2) : '0.00'}x
            </div>
            <p className="text-xs text-muted-foreground">
              Return on ad spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cost per Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{roiData.overallCostPerConversion ? Math.round(roiData.overallCostPerConversion).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average cost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI Insights */}
      {roiData.insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ROI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">Best Performing Campaign</h4>
                <p className="text-sm text-muted-foreground">
                  {roiData.insights.bestPerformingCampaign || 'No profitable campaigns identified'}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Top Objective</h4>
                <p className="text-sm text-muted-foreground">
                  {roiData.insights.bestObjective || 'No clear best objective'}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <h4 className="font-semibold mb-2">Recommended Action</h4>
              <p className="text-sm">
                {roiData.insights.recommendedAction}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROI Performance Charts */}
      {roiData.campaignROI && roiData.campaignROI.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <CampaignROIChart data={roiData.campaignROI} />
          {roiData.objectiveROI && roiData.objectiveROI.length > 0 && (
            <ObjectiveROIChart data={roiData.objectiveROI} />
          )}
        </div>
      )}

      {/* Objective ROI Performance */}
      {roiData.objectiveROI && roiData.objectiveROI.length > 0 && (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>ROI by Campaign Objective</CardTitle>
              <CardDescription>
                Performance breakdown by advertising objective
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roiData.objectiveROI.map((objective, index) => (
                  <Card key={objective.objective} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">
                        {objective.objective.replace(/_/g, ' ')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">ROAS</span>
                          <span className="font-semibold text-lg">
                            {objective.avgROAS.toFixed(2)}x
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Conversions</span>
                          <span className="font-semibold">{objective.totalConversions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Revenue</span>
                          <span className="font-semibold">₹{Math.round(objective.totalConversionValue).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Campaigns</span>
                          <span className="font-semibold">{objective.campaignCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign ROI Table */}
      {roiData.campaignROI && roiData.campaignROI.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign ROI Performance</CardTitle>
            <CardDescription>
              Individual campaign ROI and conversion performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('roas')}
                      className="h-auto p-0 font-medium flex items-center gap-1"
                    >
                      ROAS
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('conversions')}
                      className="h-auto p-0 font-medium flex items-center gap-1"
                    >
                      Conversions
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('conversionValue')}
                      className="h-auto p-0 font-medium flex items-center gap-1"
                    >
                      Revenue
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('costPerConversion')}
                      className="h-auto p-0 font-medium flex items-center gap-1"
                    >
                      Cost/Conv
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  sortedCampaignROI.map((campaign, index) => (
                    <TableRow key={campaign.campaignId || index}>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={campaign.campaignName}>
                          {campaign.campaignName}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-right">
                        <div className="flex items-center gap-1">
                          {campaign.roas > 2 ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : campaign.roas < 1 ? (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          ) : null}
                          {campaign.roas.toFixed(2)}x
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-right">
                        {campaign.conversions}
                      </TableCell>
                      <TableCell className="font-mono text-right">
                        ₹{Math.round(campaign.conversionValue).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-right">
                        ₹{Math.round(campaign.costPerConversion).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            campaign.roiStatus === 'Profitable' ? 'default' : 
                            campaign.roiStatus === 'Break-even' ? 'secondary' :
                            campaign.roiStatus === 'Loss' ? 'destructive' : 'outline'
                          }
                        >
                          {campaign.roiStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {!analytics.loading && sortedCampaignROI.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No ROI data available for campaigns
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Demographic ROI Analysis */}
      {roiData.demographicROI && roiData.demographicROI.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Demographic ROI Performance</CardTitle>
            <CardDescription>
              ROI performance by age and gender segments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roiData.demographicROI.map((demo, index) => (
                <Card key={demo.segment} className="border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">
                      {demo.segment}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">ROAS</span>
                        <span className="font-semibold text-lg">
                          {demo.roas.toFixed(2)}x
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Conversions</span>
                        <span className="font-semibold">{demo.conversions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Revenue</span>
                        <span className="font-semibold">₹{Math.round(demo.conversionValue).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
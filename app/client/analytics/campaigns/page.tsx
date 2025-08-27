/**
 * Campaign Performance Dashboard
 * 
 * Detailed campaign analysis with multiple chart types
 */

'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { 
  CampaignPerformanceBar,
  CampaignObjectivesLine,
  CampaignSpendArea,
  CampaignTimeline
} from '@/components/analytics/campaign-charts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, AlertCircle, ArrowUpDown } from "lucide-react"
import { useState } from 'react'

export default function CampaignPerformancePage() {
  const analytics = useAnalytics()
  const [sortBy, setSortBy] = useState<'spend' | 'name' | 'objective'>('spend')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: 'spend' | 'name' | 'objective') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortedCampaigns = [...analytics.campaigns].sort((a, b) => {
    const aVal = sortBy === 'spend' ? a.spend : sortBy === 'name' ? a.name : a.objective
    const bVal = sortBy === 'spend' ? b.spend : sortBy === 'name' ? b.name : b.objective
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    }
    
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
  })

  if (analytics.error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Campaign Data
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Performance</h1>
          <p className="text-muted-foreground mt-2">
            Detailed analysis of individual campaign performance and trends
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

      {/* Campaign Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview?.activeCampaigns || 0} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.overview?.totalSpend ? Math.round(analytics.overview.totalSpend).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.campaigns.length > 0 && analytics.overview?.totalSpend ? 
                Math.round(analytics.overview.totalSpend / analytics.campaigns.length).toLocaleString() : 
                '0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per campaign
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.campaignTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Different types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Campaign Performance Bar Chart - spans 2 columns */}
        <div className="lg:col-span-2">
          <CampaignPerformanceBar 
            data={analytics.campaignSpendChart}
            loading={analytics.loading}
          />
        </div>

        {/* Campaign Objectives Line Chart */}
        <CampaignObjectivesLine 
          data={analytics.campaignTypes}
          loading={analytics.loading}
        />

        {/* Cumulative Spend Area Chart */}
        <CampaignSpendArea 
          data={[]}
          loading={analytics.loading}
        />

        {/* Campaign Timeline - spans 2 columns */}
        <div className="lg:col-span-2">
          <CampaignTimeline 
            campaigns={analytics.campaigns}
            loading={analytics.loading}
          />
        </div>
      </div>

      {/* Detailed Campaign Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            Complete list of campaigns with detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-medium flex items-center gap-1"
                  >
                    Campaign Name
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('spend')}
                    className="h-auto p-0 font-medium flex items-center gap-1"
                  >
                    Spend
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('objective')}
                    className="h-auto p-0 font-medium flex items-center gap-1"
                  >
                    Objective
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Buying Type</TableHead>
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
                sortedCampaigns.map((campaign, index) => (
                  <TableRow key={campaign.id || index}>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={campaign.name}>
                        {campaign.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      ${campaign.spend}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {campaign.objective.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={campaign.status === 'Active' ? 'default' : 'secondary'}
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {campaign.duration ? `${campaign.duration} days` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {campaign.buyingType || 'N/A'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {!analytics.loading && sortedCampaigns.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No campaign data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
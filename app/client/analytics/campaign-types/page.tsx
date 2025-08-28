/**
 * Campaign Types Analysis Dashboard
 * 
 * Analysis of campaign objectives with Pie and Radial charts
 */

'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, AlertCircle, Target, TrendingUp, Users, BarChart3 } from "lucide-react"

export default function CampaignTypesPage() {
  const analytics = useAnalytics()

  if (analytics.error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Campaign Types Data
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

  // Calculate totals for insights
  const totalObjectives = analytics.campaignTypes.length
  const totalSpendAcrossObjectives = analytics.campaignTypes.reduce((sum, obj) => sum + obj.totalSpend, 0)
  const mostPopularObjective = analytics.campaignTypes.length > 0 ? 
    [...analytics.campaignTypes].sort((a, b) => b.count - a.count)[0] : null
  const highestSpendingObjective = analytics.campaignTypes.length > 0 ? 
    [...analytics.campaignTypes].sort((a, b) => b.totalSpend - a.totalSpend)[0] : null

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Types Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Analysis of campaign objectives and their performance distribution
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

      {/* Key Insights Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Objectives</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalObjectives}</div>
            <p className="text-xs text-muted-foreground">
              Different campaign types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalSpendAcrossObjectives > 0 ? Math.round(totalSpendAcrossObjectives).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all objectives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostPopularObjective?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostPopularObjective?.objective.replace(/_/g, ' ') || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Spender</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{highestSpendingObjective?.totalSpend > 0 ? Math.round(highestSpendingObjective.totalSpend).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {highestSpendingObjective?.objective.replace(/_/g, ' ') || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Objectives Summary Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {analytics.campaignTypes
          .sort((a, b) => b.totalSpend - a.totalSpend)
          .slice(0, 6)
          .map((objective, index) => (
            <Card key={objective.objective} className="relative">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}
                  />
                  {objective.objective.replace(/_/g, ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Spend</span>
                    <span className="font-semibold">₹{Math.round(objective.totalSpend).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Campaigns</span>
                    <span className="font-semibold">{objective.count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Spend</span>
                    <span className="font-semibold">₹{Math.round(objective.avgSpend).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Share</span>
                    <span className="font-semibold">
                      {totalSpendAcrossObjectives > 0 ? 
                        ((objective.totalSpend / totalSpendAcrossObjectives) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="pt-1">
                    <Badge 
                      variant={
                        objective.status === 'Active' ? 'default' : 
                        objective.status === 'Mixed' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {objective.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Detailed Objectives Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Objectives Breakdown</CardTitle>
          <CardDescription>
            Detailed analysis of each campaign objective type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Objective</TableHead>
                <TableHead className="text-right">Total Spend</TableHead>
                <TableHead className="text-right">Campaigns</TableHead>
                <TableHead className="text-right">Avg Spend</TableHead>
                <TableHead className="text-right">Share %</TableHead>
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
                analytics.campaignTypes
                  .sort((a, b) => b.totalSpend - a.totalSpend)
                  .map((objective, index) => {
                    const sharePercentage = totalSpendAcrossObjectives > 0 ? 
                      (objective.totalSpend / totalSpendAcrossObjectives) * 100 : 0
                    
                    return (
                      <TableRow key={objective.objective}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}
                            />
                            {objective.objective.replace(/_/g, ' ')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ₹{objective.totalSpend > 0 ? Math.round(objective.totalSpend).toLocaleString() : '0'}
                        </TableCell>
                        <TableCell className="text-right">
                          {objective.count}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ₹{objective.avgSpend > 0 ? Math.round(objective.avgSpend).toLocaleString() : '0'}
                        </TableCell>
                        <TableCell className="text-right">
                          {sharePercentage.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              objective.status === 'Active' ? 'default' : 
                              objective.status === 'Mixed' ? 'secondary' : 'outline'
                            }
                          >
                            {objective.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
              )}
            </TableBody>
          </Table>
          
          {!analytics.loading && analytics.campaignTypes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No campaign objective data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      {!analytics.loading && analytics.campaignTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>
              Analysis and observations from your campaign objective performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-foreground">Budget Distribution</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {highestSpendingObjective && (
                    <>
                      <strong>{highestSpendingObjective.objective.replace(/_/g, ' ')}</strong> campaigns 
                      account for the highest spend (₹{Math.round(highestSpendingObjective.totalSpend).toLocaleString()}), representing{' '}
                      {((highestSpendingObjective.totalSpend / totalSpendAcrossObjectives) * 100).toFixed(1)}% 
                      of your total budget.
                    </>
                  )}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Campaign Volume</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {mostPopularObjective && (
                    <>
                      <strong>{mostPopularObjective.objective.replace(/_/g, ' ')}</strong> is your most 
                      used objective with {mostPopularObjective.count} campaigns, suggesting this is a 
                      core strategy focus.
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
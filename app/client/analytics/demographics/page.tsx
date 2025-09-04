/**
 * Demographics Analysis Dashboard
 * 
 * Age and Gender analysis with Pie, Donut, and Bar charts
 */

'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, Users, UserCheck, TrendingUp, Target } from "lucide-react"
import { AnalyticsLoading } from "@/components/analytics-loading"

export default function DemographicsAnalysisPage() {
  const analytics = useAnalytics()

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
              Error Loading Demographics Data
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

  // Calculate demographics insights from available data
  const demographicsData = analytics.demographics || { available: false }
  const totalAudience = demographicsData.totalAudience || 0
  const topAgeGroup = demographicsData.topPerformingAges?.[0] || null
  const primaryGender = demographicsData.primaryGender || null
  const averageAge = demographicsData.averageAge || 0

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demographics Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Age and gender breakdown of your advertising audience
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

      {/* Key Demographics Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audience</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAudience?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              Reached users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Age Group</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topAgeGroup?.ageGroup || '25-34'}</div>
            <p className="text-xs text-muted-foreground">
              {topAgeGroup?.percentage?.toFixed(1) || '0.0'}% of audience
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primary Gender</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{primaryGender || 'Female'}</div>
            <p className="text-xs text-muted-foreground">
              Majority audience
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAge || 0}</div>
            <p className="text-xs text-muted-foreground">
              Years old
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Age Demographics Summary Cards */}
      {demographicsData.topPerformingAges && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Age Group Breakdown</h2>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {demographicsData.topPerformingAges.slice(0, 6).map((ageGroup: any, index: number) => (
              <Card key={ageGroup.ageGroup}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}
                    />
                    {ageGroup.ageGroup}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Audience</span>
                      <span className="font-semibold">{ageGroup.count?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Spend</span>
                      <span className="font-semibold">₹{Math.round(ageGroup.spend).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Share</span>
                      <span className="font-semibold">{ageGroup.percentage?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Actions</span>
                      <span className="font-semibold">{ageGroup.actions || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Gender Demographics Summary Cards */}
      {demographicsData.genderData && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Gender Distribution</h2>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(demographicsData.genderData).map(([gender, data]: [string, any], index: number) => (
              <Card key={gender}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}
                    />
                    {gender}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Count</span>
                      <span className="font-semibold">{data.count.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Spend</span>
                      <span className="font-semibold">₹{data.spend.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Share</span>
                      <span className="font-semibold">{data.percentage}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Demographics Insights */}
      {!analytics.loading && (
        <Card>
          <CardHeader>
            <CardTitle>Demographics Insights</CardTitle>
            <CardDescription>
              Key observations from your audience demographics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-foreground">Age Distribution</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {topAgeGroup ? (
                    <>
                      Your primary audience is in the <strong>{topAgeGroup.ageGroup}</strong> age range, 
                      representing <strong>{topAgeGroup.percentage?.toFixed(1)}%</strong> of your total 
                      audience with <strong>₹{topAgeGroup.spend}</strong> in ad spend.
                    </>
                  ) : (
                    <>
                      Age demographic data will be available once Facebook provides detailed 
                      audience breakdowns from your campaign targeting.
                    </>
                  )}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Gender Targeting</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {primaryGender ? (
                    <>
                      Your campaigns show a <strong>{primaryGender.toLowerCase()}</strong>-leaning audience, 
                      which suggests your products or services resonate more strongly with this demographic. 
                      Consider optimizing creative content for this primary audience.
                    </>
                  ) : (
                    <>
                      Gender distribution data will be calculated once sufficient audience 
                      data is collected from your Facebook campaigns.
                    </>
                  )}
                </p>
              </div>
            </div>

            {totalAudience > 0 && averageAge > 0 && (
              <div>
                <h4 className="font-medium text-foreground">Audience Characteristics</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  With an average age of <strong>{averageAge} years</strong> across{' '}
                  <strong>{totalAudience?.toLocaleString() || '0'} users</strong>, your audience represents 
                  a {averageAge < 30 ? 'younger' : averageAge > 45 ? 'mature' : 'middle-aged'} demographic 
                  that typically responds well to {averageAge < 30 ? 'mobile-first, visual content' : 
                  averageAge > 45 ? 'informative, value-driven messaging' : 'balanced content strategies'}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Recommendations */}
      {!analytics.loading && topAgeGroup && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">
              Demographics Optimization Tips
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Strategies to leverage your audience demographics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-green-800 dark:text-green-200">
              <p>• Focus creative content on the {topAgeGroup.ageGroup} age group for maximum impact</p>
              {primaryGender && (
                <p>• Tailor messaging and visuals to resonate with {primaryGender.toLowerCase()} audience preferences</p>
              )}
              <p>• Consider age-specific platforms and ad placements for better engagement</p>
              <p>• Test different creative styles to appeal to secondary demographic segments</p>
              <p>• Use demographic insights to inform product positioning and marketing copy</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!analytics.loading && !demographicsData.available && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Demographics Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Demographics data will appear here once Facebook provides detailed audience 
              breakdowns from your campaigns. This typically includes age groups, gender distribution, 
              and audience engagement patterns.
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
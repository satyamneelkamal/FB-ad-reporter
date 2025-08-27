/**
 * Engagement Metrics Charts
 * 
 * Line, Area, and Radar charts for engagement analysis
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { 
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"

// CTR Performance Line Chart
export interface CTRPerformanceLineProps {
  data?: Array<{
    period: string
    ctr: number
    avgCpc: number
    totalClicks: number
  }>
  loading?: boolean
}

export function CTRPerformanceLine({ data = [], loading }: CTRPerformanceLineProps) {
  // Mock data for demo purposes (would come from time-series analysis)
  const chartData = data.length > 0 ? data : [
    { period: "Week 1", ctr: 1.2, avgCpc: 2.5, totalClicks: 150 },
    { period: "Week 2", ctr: 1.8, avgCpc: 2.1, totalClicks: 220 },
    { period: "Week 3", ctr: 1.4, avgCpc: 2.8, totalClicks: 180 },
    { period: "Week 4", ctr: 2.1, avgCpc: 1.9, totalClicks: 310 },
    { period: "Week 5", ctr: 1.9, avgCpc: 2.3, totalClicks: 280 },
  ]

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>CTR Performance Trends</CardTitle>
          <CardDescription>Click-through rate and cost trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>CTR Performance Trends</CardTitle>
        <CardDescription>
          Click-through rate performance and cost efficiency over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[400px]">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="ctr" orientation="left" />
            <YAxis yAxisId="cpc" orientation="right" />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'ctr') return [`${value}%`, 'CTR']
                  if (name === 'avgCpc') return [`$${value}`, 'Avg CPC']
                  if (name === 'totalClicks') return [value, 'Total Clicks']
                  return [value, name]
                }}
              />} 
            />
            <Line 
              yAxisId="ctr"
              type="monotone" 
              dataKey="ctr" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={3}
              dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="cpc"
              type="monotone" 
              dataKey="avgCpc" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 3 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Engagement Volume Area Chart
export interface EngagementVolumeAreaProps {
  data?: Array<{
    period: string
    clicks: number
    impressions: number
    engagement: number
  }>
  loading?: boolean
}

export function EngagementVolumeArea({ data = [], loading }: EngagementVolumeAreaProps) {
  // Mock data for demo purposes
  const chartData = data.length > 0 ? data : [
    { period: "Week 1", clicks: 150, impressions: 12500, engagement: 200 },
    { period: "Week 2", clicks: 220, impressions: 15800, engagement: 310 },
    { period: "Week 3", clicks: 180, impressions: 14200, engagement: 250 },
    { period: "Week 4", clicks: 310, impressions: 18900, engagement: 420 },
    { period: "Week 5", clicks: 280, impressions: 16500, engagement: 380 },
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Volume</CardTitle>
          <CardDescription>Click and engagement volume trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Volume Trends</CardTitle>
        <CardDescription>
          Click volume and total engagements over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[300px]">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'clicks') return [value, 'Clicks']
                  if (name === 'impressions') return [value.toLocaleString(), 'Impressions']
                  if (name === 'engagement') return [value, 'Total Engagement']
                  return [value, name]
                }}
              />} 
            />
            <Area 
              type="monotone" 
              dataKey="impressions" 
              stackId="1"
              stroke="hsl(var(--chart-1))" 
              fill="hsl(var(--chart-1))"
              fillOpacity={0.1}
            />
            <Area 
              type="monotone" 
              dataKey="engagement" 
              stackId="2"
              stroke="hsl(var(--chart-3))" 
              fill="hsl(var(--chart-3))"
              fillOpacity={0.4}
            />
            <Area 
              type="monotone" 
              dataKey="clicks" 
              stackId="3"
              stroke="hsl(var(--chart-2))" 
              fill="hsl(var(--chart-2))"
              fillOpacity={0.8}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Multi-Dimensional Engagement Radar
export interface EngagementRadarProps {
  data?: Array<{
    metric: string
    value: number
    fullMark: number
  }>
  loading?: boolean
}

export function EngagementRadar({ data = [], loading }: EngagementRadarProps) {
  // Mock radar data based on engagement metrics
  const radarData = data.length > 0 ? data : [
    { metric: 'CTR', value: 65, fullMark: 100 },
    { metric: 'CPC Efficiency', value: 78, fullMark: 100 },
    { metric: 'Engagement Rate', value: 82, fullMark: 100 },
    { metric: 'Click Volume', value: 45, fullMark: 100 },
    { metric: 'Impression Share', value: 60, fullMark: 100 },
    { metric: 'Social Actions', value: 35, fullMark: 100 },
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Performance</CardTitle>
          <CardDescription>Multi-dimensional engagement analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Performance Radar</CardTitle>
        <CardDescription>
          Multi-dimensional view of engagement metrics performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[400px]">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
            />
            <Radar
              name="Performance"
              dataKey="value"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(var(--chart-1))" }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => [`${value}%`, 'Performance Score']}
                labelFormatter={(label) => `${label} Performance`}
              />} 
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Campaign Engagement Comparison
export interface CampaignEngagementComparisonProps {
  campaigns?: Array<{
    name: string
    ctr: number
    clicks: number
    impressions: number
    spend: number
  }>
  loading?: boolean
}

export function CampaignEngagementComparison({ campaigns = [], loading }: CampaignEngagementComparisonProps) {
  // Mock data based on top campaigns
  const comparisonData = campaigns.length > 0 ? campaigns.slice(0, 5) : [
    { name: "Campaign A", ctr: 2.1, clicks: 450, impressions: 21400, spend: 120 },
    { name: "Campaign B", ctr: 1.8, clicks: 320, impressions: 17800, spend: 95 },
    { name: "Campaign C", ctr: 2.5, clicks: 580, impressions: 23200, spend: 155 },
    { name: "Campaign D", ctr: 1.4, clicks: 280, impressions: 20000, spend: 85 },
    { name: "Campaign E", ctr: 1.9, clicks: 390, impressions: 20500, spend: 110 },
  ]

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Campaign Engagement</CardTitle>
          <CardDescription>Engagement comparison across campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Campaign Engagement Comparison</CardTitle>
        <CardDescription>
          CTR and engagement performance across top campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[300px]">
          <AreaChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis yAxisId="ctr" orientation="left" />
            <YAxis yAxisId="clicks" orientation="right" />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'ctr') return [`${value}%`, 'CTR']
                  if (name === 'clicks') return [value, 'Clicks']
                  return [value, name]
                }}
              />} 
            />
            <Area 
              yAxisId="clicks"
              type="monotone" 
              dataKey="clicks" 
              stroke="hsl(var(--chart-2))" 
              fill="hsl(var(--chart-2))"
              fillOpacity={0.3}
            />
            {/* Note: This would need LineChart instead of mixing with AreaChart */}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
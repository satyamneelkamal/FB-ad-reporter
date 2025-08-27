/**
 * Campaign Performance Charts
 * 
 * Detailed campaign analysis with Bar, Line, and Area charts
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer
} from "recharts"

// Campaign Performance Bar Chart
export interface CampaignPerformanceBarProps {
  data: Array<{
    name: string
    spend: number
    objective: string
    status: string
    duration?: number
    fill: string
  }>
  loading?: boolean
}

export function CampaignPerformanceBar({ data, loading }: CampaignPerformanceBarProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Spend by campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>No campaign data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No data to display
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
        <CardDescription>
          Top performing campaigns ranked by total spend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[400px]">
          <BarChart data={data} margin={{ left: 150, right: 30, top: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={140}
              tick={{ fontSize: 10 }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name, props) => [
                  `$${value}`,
                  'Spend'
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground">
                          <Badge variant="outline" className="mt-1">
                            {data.objective}
                          </Badge>
                          <Badge 
                            variant={data.status === 'Active' ? 'default' : 'secondary'}
                            className="mt-1 ml-2"
                          >
                            {data.status}
                          </Badge>
                          {data.duration && (
                            <div className="mt-1 text-xs">
                              Duration: {data.duration} days
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }
                  return label
                }}
              />} 
            />
            <Bar dataKey="spend" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Campaign Objectives Distribution (Line Chart)
export interface CampaignObjectivesLineProps {
  data: Array<{
    objective: string
    totalSpend: number
    count: number
    avgSpend: number
  }>
  loading?: boolean
}

export function CampaignObjectivesLine({ data, loading }: CampaignObjectivesLineProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Objectives Trend</CardTitle>
          <CardDescription>Performance by objective type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for line chart
  const lineData = data.map((item, index) => ({
    name: item.objective.replace('_', ' '),
    spend: item.totalSpend,
    campaigns: item.count,
    avgSpend: item.avgSpend
  }))

  if (!lineData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Objectives Trend</CardTitle>
          <CardDescription>No objective data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data to display
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objectives Performance</CardTitle>
        <CardDescription>
          Spend and campaign count by objective
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[300px]">
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis yAxisId="spend" orientation="left" />
            <YAxis yAxisId="campaigns" orientation="right" />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'spend') return [`$${value}`, 'Total Spend']
                  if (name === 'campaigns') return [value, 'Campaigns']
                  if (name === 'avgSpend') return [`$${value.toFixed(2)}`, 'Avg Spend']
                  return [value, name]
                }}
              />} 
            />
            <Line 
              yAxisId="spend"
              type="monotone" 
              dataKey="spend" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-1))" }}
            />
            <Line 
              yAxisId="campaigns"
              type="monotone" 
              dataKey="campaigns" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-2))" }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Cumulative Campaign Spend (Area Chart)
export interface CampaignSpendAreaProps {
  data: Array<{
    name: string
    spend: number
    cumulativeSpend: number
  }>
  loading?: boolean
}

export function CampaignSpendArea({ data, loading }: CampaignSpendAreaProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Spend</CardTitle>
          <CardDescription>Campaign spend accumulation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Generate cumulative data if not provided
  const processedData = data.length > 0 ? data : [
    { name: "Campaign 1", spend: 100, cumulativeSpend: 100 },
    { name: "Campaign 2", spend: 150, cumulativeSpend: 250 },
    { name: "Campaign 3", spend: 80, cumulativeSpend: 330 },
    { name: "Campaign 4", spend: 200, cumulativeSpend: 530 },
    { name: "Campaign 5", spend: 120, cumulativeSpend: 650 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Spend</CardTitle>
        <CardDescription>
          Accumulated spend across campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[300px]">
          <AreaChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'spend') return [`$${value}`, 'Campaign Spend']
                  if (name === 'cumulativeSpend') return [`$${value}`, 'Cumulative Spend']
                  return [value, name]
                }}
              />} 
            />
            <Area 
              type="monotone" 
              dataKey="cumulativeSpend" 
              stroke="hsl(var(--chart-1))" 
              fill="hsl(var(--chart-1))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="spend" 
              stroke="hsl(var(--chart-3))" 
              fill="hsl(var(--chart-3))"
              fillOpacity={0.6}
              strokeWidth={1}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Campaign Status Timeline (Area Chart)
export interface CampaignTimelineProps {
  campaigns: Array<{
    name: string
    dateStart: string
    dateStop: string
    spend: number
    status: string
  }>
  loading?: boolean
}

export function CampaignTimeline({ campaigns, loading }: CampaignTimelineProps) {
  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Campaign Timeline</CardTitle>
          <CardDescription>Campaign activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Process timeline data (mock implementation for now)
  const timelineData = [
    { period: "Jan 2025", activeCampaigns: 5, totalSpend: 1200 },
    { period: "Feb 2025", activeCampaigns: 8, totalSpend: 1800 },
    { period: "Mar 2025", activeCampaigns: 6, totalSpend: 1500 },
    { period: "Apr 2025", activeCampaigns: 10, totalSpend: 2200 },
  ]

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Campaign Activity Timeline</CardTitle>
        <CardDescription>
          Active campaigns and spend over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[300px]">
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="campaigns" orientation="left" />
            <YAxis yAxisId="spend" orientation="right" />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'activeCampaigns') return [value, 'Active Campaigns']
                  if (name === 'totalSpend') return [`$${value}`, 'Total Spend']
                  return [value, name]
                }}
              />} 
            />
            <Area 
              yAxisId="spend"
              type="monotone" 
              dataKey="totalSpend" 
              stroke="hsl(var(--chart-1))" 
              fill="hsl(var(--chart-1))"
              fillOpacity={0.3}
            />
            <Area 
              yAxisId="campaigns"
              type="monotone" 
              dataKey="activeCampaigns" 
              stroke="hsl(var(--chart-4))" 
              fill="hsl(var(--chart-4))"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
/**
 * Overview Analytics Charts
 * 
 * Chart components for the main overview dashboard
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer
} from "recharts"

// Chart configuration
const chartConfig = {
  active: {
    label: "Active",
    color: "hsl(var(--chart-4))"
  },
  inactive: {
    label: "Inactive", 
    color: "hsl(var(--chart-3))"
  },
  spend: {
    label: "Spend",
    color: "hsl(var(--chart-1))"
  },
  campaigns: {
    label: "Campaigns",
    color: "hsl(var(--chart-2))"
  }
}

// Campaign Status Distribution (Pie Chart)
export interface CampaignStatusChartProps {
  data: Array<{
    name: string
    value: number
    fill: string
  }>
  loading?: boolean
}

export function CampaignStatusChart({ data, loading }: CampaignStatusChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Status</CardTitle>
          <CardDescription>Active vs Inactive campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
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
          <CardTitle>Campaign Status</CardTitle>
          <CardDescription>Active vs Inactive campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No campaign data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Status</CardTitle>
        <CardDescription>Distribution of active vs inactive campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              nameKey="name"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Top Campaigns by Spend (Bar Chart)
export interface TopCampaignsChartProps {
  data: Array<{
    name: string
    spend: number
    objective: string
    status: string
    fill: string
  }>
  loading?: boolean
}

export function TopCampaignsChart({ data, loading }: TopCampaignsChartProps) {
  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Top Campaigns</CardTitle>
          <CardDescription>Highest spending campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Top Campaigns</CardTitle>
          <CardDescription>Highest spending campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No campaign data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Top Campaigns</CardTitle>
        <CardDescription>Campaigns ranked by total spend</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <BarChart data={data} layout="horizontal" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={120}
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
                    return `${payload[0].payload.objective} Campaign`
                  }
                  return label
                }}
              />} 
            />
            <Bar dataKey="spend" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Account Health Score (Radial Chart)
export interface AccountHealthChartProps {
  data: Array<{
    name: string
    value: number
    fill: string
  }>
  loading?: boolean
}

export function AccountHealthChart({ data, loading }: AccountHealthChartProps) {
  // Calculate health score based on available data
  const healthScore = data.length > 0 ? 75 : 0 // Mock health score for now
  
  const healthData = [
    {
      name: "Health Score",
      value: healthScore,
      fill: healthScore > 70 ? "hsl(var(--chart-4))" : 
            healthScore > 40 ? "hsl(var(--chart-5))" : "hsl(var(--destructive))"
    }
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Health</CardTitle>
          <CardDescription>Overall performance score</CardDescription>
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
        <CardTitle>Account Health</CardTitle>
        <CardDescription>Overall account performance score</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={healthData}>
            <RadialBar dataKey="value" cornerRadius={10} />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value) => [`${value}%`, 'Health Score']}
              />} 
            />
          </RadialBarChart>
        </ChartContainer>
        <div className="text-center mt-4">
          <div className="text-2xl font-bold">{healthScore}%</div>
          <div className="text-sm text-muted-foreground">
            {healthScore > 70 ? 'Excellent' : healthScore > 40 ? 'Good' : 'Needs Attention'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Spend Overview (Area Chart)
export interface SpendOverviewChartProps {
  data?: Array<{
    name: string
    spend: number
  }>
  loading?: boolean
}

export function SpendOverviewChart({ data = [], loading }: SpendOverviewChartProps) {
  // Mock data for spend trends (this would come from time-series data when available)
  const mockSpendData = [
    { name: "Week 1", spend: 120 },
    { name: "Week 2", spend: 180 },
    { name: "Week 3", spend: 150 },
    { name: "Week 4", spend: 220 },
  ]

  const chartData = data.length > 0 ? data : mockSpendData

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Spend Overview</CardTitle>
          <CardDescription>Spending trends over time</CardDescription>
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
        <CardTitle>Spend Overview</CardTitle>
        <CardDescription>Ad spend trends and patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value) => [`$${value}`, 'Spend']}
              />} 
            />
            <Area 
              type="monotone" 
              dataKey="spend" 
              stroke="hsl(var(--chart-1))" 
              fill="hsl(var(--chart-1))" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
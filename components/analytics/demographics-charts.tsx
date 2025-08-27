/**
 * Demographics Charts
 * 
 * Age and Gender analysis with Pie, Bar, and Donut visualizations
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { 
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"

// Age Demographics Pie Chart
export interface AgeDemographicsPieProps {
  data?: Array<{
    ageGroup: string
    count: number
    spend: number
    percentage: number
  }>
  loading?: boolean
}

export function AgeDemographicsPie({ data = [], loading }: AgeDemographicsPieProps) {
  // Mock data based on typical age targeting
  const chartData = data.length > 0 ? data : [
    { ageGroup: "18-24", count: 1250, spend: 2800, percentage: 28.5 },
    { ageGroup: "25-34", count: 2100, spend: 3200, percentage: 32.6 },
    { ageGroup: "35-44", count: 1680, spend: 2100, percentage: 21.4 },
    { ageGroup: "45-54", count: 950, spend: 1200, percentage: 12.2 },
    { ageGroup: "55-64", count: 420, spend: 380, percentage: 3.9 },
    { ageGroup: "65+", count: 180, spend: 140, percentage: 1.4 }
  ].map((item, index) => ({
    ...item,
    fill: `hsl(var(--chart-${(index % 6) + 1}))`
  }))

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Age Demographics</CardTitle>
          <CardDescription>Audience age distribution</CardDescription>
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
        <CardTitle>Age Demographics Distribution</CardTitle>
        <CardDescription>
          Audience breakdown by age groups
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[400px]">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="count"
              nameKey="ageGroup"
              label={({ ageGroup, percentage }) => `${ageGroup}: ${percentage.toFixed(1)}%`}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => [value, 'Audience Count']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>Spend: ${data.spend}</div>
                          <div>Share: {data.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    )
                  }
                  return label
                }}
              />} 
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Gender Demographics Donut Chart
export interface GenderDemographicsDonutProps {
  data?: Array<{
    gender: string
    count: number
    spend: number
    percentage: number
  }>
  loading?: boolean
}

export function GenderDemographicsDonut({ data = [], loading }: GenderDemographicsDonutProps) {
  // Mock data for gender demographics
  const chartData = data.length > 0 ? data : [
    { gender: "Female", count: 3680, spend: 5820, percentage: 59.2 },
    { gender: "Male", count: 2540, spend: 3900, percentage: 40.8 }
  ].map((item, index) => ({
    ...item,
    fill: index === 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-4))'
  }))

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gender Demographics</CardTitle>
          <CardDescription>Audience gender distribution</CardDescription>
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
        <CardTitle>Gender Demographics</CardTitle>
        <CardDescription>
          Audience breakdown by gender
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[400px]">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              dataKey="count"
              nameKey="gender"
              label={({ gender, percentage }) => `${gender}: ${percentage.toFixed(1)}%`}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => [value.toLocaleString(), 'Audience']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>Spend: ${data.spend}</div>
                          <div>Share: {data.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    )
                  }
                  return label
                }}
              />} 
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Age Performance Bar Chart
export interface AgePerformanceBarProps {
  data?: Array<{
    ageGroup: string
    spend: number
    clicks: number
    ctr: number
    cpc: number
  }>
  loading?: boolean
}

export function AgePerformanceBar({ data = [], loading }: AgePerformanceBarProps) {
  const chartData = data.length > 0 ? data : [
    { ageGroup: "18-24", spend: 2800, clicks: 1450, ctr: 1.8, cpc: 1.93 },
    { ageGroup: "25-34", spend: 3200, clicks: 1920, ctr: 2.1, cpc: 1.67 },
    { ageGroup: "35-44", spend: 2100, clicks: 1050, ctr: 1.6, cpc: 2.00 },
    { ageGroup: "45-54", spend: 1200, clicks: 480, ctr: 1.2, cpc: 2.50 },
    { ageGroup: "55-64", spend: 380, clicks: 140, ctr: 0.9, cpc: 2.71 },
    { ageGroup: "65+", spend: 140, clicks: 45, ctr: 0.7, cpc: 3.11 }
  ]

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Age Performance Analysis</CardTitle>
          <CardDescription>Performance metrics by age group</CardDescription>
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
        <CardTitle>Age Group Performance Analysis</CardTitle>
        <CardDescription>
          Spend, clicks, and engagement rates by age demographic
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[400px]">
          <BarChart data={chartData} margin={{ bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ageGroup" />
            <YAxis yAxisId="spend" orientation="left" />
            <YAxis yAxisId="ctr" orientation="right" />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'spend') return [`$${value}`, 'Total Spend']
                  if (name === 'clicks') return [value, 'Total Clicks']
                  if (name === 'ctr') return [`${value}%`, 'CTR']
                  return [value, name]
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div>
                        <div className="font-medium">Age Group: {label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>CPC: ${data.cpc}</div>
                        </div>
                      </div>
                    )
                  }
                  return label
                }}
              />} 
            />
            <Bar 
              yAxisId="spend"
              dataKey="spend" 
              fill="hsl(var(--chart-1))" 
              name="spend"
              radius={4}
            />
            <Bar 
              yAxisId="spend"
              dataKey="clicks" 
              fill="hsl(var(--chart-2))" 
              name="clicks"
              radius={4}
              opacity={0.7}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Demographics Summary Cards
export interface DemographicsSummaryProps {
  data?: {
    topAgeGroup?: { ageGroup: string; count: number; spend: number }
    topGender?: { gender: string; count: number; spend: number }
    totalAudience?: number
    averageAge?: number
  }
  loading?: boolean
}

export function DemographicsSummary({ data = {}, loading }: DemographicsSummaryProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const summaryData = {
    topAgeGroup: data.topAgeGroup || { ageGroup: "25-34", count: 2100, spend: 3200 },
    topGender: data.topGender || { gender: "Female", count: 3680, spend: 5820 },
    totalAudience: data.totalAudience || 6220,
    averageAge: data.averageAge || 32.5
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Top Age Group</span>
            <Badge variant="outline">{summaryData.topAgeGroup.ageGroup}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.topAgeGroup.count.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            ${summaryData.topAgeGroup.spend} spend
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Primary Gender</span>
            <Badge variant="outline">{summaryData.topGender.gender}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.topGender.count.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            ${summaryData.topGender.spend} spend
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Audience</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.totalAudience.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Reached users
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Age</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.averageAge}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Years old
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
/**
 * Campaign Types Analysis Charts
 * 
 * Pie and Radial charts for campaign objective analysis
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { 
  PieChart, 
  Pie, 
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from "recharts"

// Campaign Objective Distribution (Pie Chart)
export interface ObjectiveDistributionPieProps {
  data: Array<{
    objective: string
    totalSpend: number
    count: number
    percentage: number
  }>
  loading?: boolean
}

export function ObjectiveDistributionPie({ data, loading }: ObjectiveDistributionPieProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Objective Distribution</CardTitle>
          <CardDescription>Budget allocation by campaign objective</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const pieData = data.map((item, index) => ({
    name: item.objective.replace(/_/g, ' '),
    value: item.totalSpend,
    count: item.count,
    percentage: item.percentage || 0,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`
  }))

  if (!pieData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Objective Distribution</CardTitle>
          <CardDescription>No campaign objective data available</CardDescription>
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
    <Card>
      <CardHeader>
        <CardTitle>Campaign Objective Distribution</CardTitle>
        <CardDescription>
          Budget allocation across different campaign objectives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[400px]">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              nameKey="name"
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name, props) => [
                  `$${value}`,
                  'Total Spend'
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>Campaigns: {data.count}</div>
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

// Campaign Objective Performance (Radial Chart)
export interface ObjectivePerformanceRadialProps {
  data: Array<{
    objective: string
    totalSpend: number
    count: number
    avgSpend: number
    status: string
  }>
  loading?: boolean
}

export function ObjectivePerformanceRadial({ data, loading }: ObjectivePerformanceRadialProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Objective Performance</CardTitle>
          <CardDescription>Performance score by objective</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate performance score based on spend and campaign count
  const maxSpend = Math.max(...data.map(d => d.totalSpend))
  const radialData = data.map((item, index) => ({
    name: item.objective.replace(/_/g, ' '),
    value: maxSpend > 0 ? (item.totalSpend / maxSpend) * 100 : 0,
    actualSpend: item.totalSpend,
    campaigns: item.count,
    avgSpend: item.avgSpend,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`
  }))

  if (!radialData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Objective Performance</CardTitle>
          <CardDescription>No performance data available</CardDescription>
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
    <Card>
      <CardHeader>
        <CardTitle>Objective Performance Score</CardTitle>
        <CardDescription>
          Relative performance of each campaign objective
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[400px]">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="20%" 
            outerRadius="80%" 
            data={radialData}
          >
            <RadialBar 
              dataKey="value" 
              cornerRadius={4}
              label={{ position: 'insideStart', fill: 'white' }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name, props) => [
                  `${value.toFixed(1)}%`,
                  'Performance Score'
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>Total Spend: ${data.actualSpend}</div>
                          <div>Campaigns: {data.campaigns}</div>
                          <div>Avg Spend: ${data.avgSpend.toFixed(2)}</div>
                        </div>
                      </div>
                    )
                  }
                  return label
                }}
              />} 
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Objective Comparison (Bar Chart)
export interface ObjectiveComparisonBarProps {
  data: Array<{
    objective: string
    totalSpend: number
    count: number
    avgSpend: number
  }>
  loading?: boolean
}

export function ObjectiveComparisonBar({ data, loading }: ObjectiveComparisonBarProps) {
  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Objective Comparison</CardTitle>
          <CardDescription>Side-by-side objective analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const barData = data.map(item => ({
    name: item.objective.replace(/_/g, ' '),
    totalSpend: item.totalSpend,
    avgSpend: item.avgSpend,
    campaigns: item.count
  }))

  if (!barData.length) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Objective Comparison</CardTitle>
          <CardDescription>No comparison data available</CardDescription>
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
        <CardTitle>Campaign Objective Comparison</CardTitle>
        <CardDescription>
          Compare total spend, average spend, and campaign count by objective
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[400px]">
          <BarChart data={barData} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis yAxisId="spend" orientation="left" />
            <YAxis yAxisId="campaigns" orientation="right" />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'totalSpend') return [`$${value}`, 'Total Spend']
                  if (name === 'avgSpend') return [`$${value.toFixed(2)}`, 'Avg Spend']
                  if (name === 'campaigns') return [value, 'Campaigns']
                  return [value, name]
                }}
              />} 
            />
            <Bar 
              yAxisId="spend"
              dataKey="totalSpend" 
              fill="hsl(var(--chart-1))" 
              name="totalSpend"
              radius={4}
            />
            <Bar 
              yAxisId="spend"
              dataKey="avgSpend" 
              fill="hsl(var(--chart-2))" 
              name="avgSpend"
              radius={4}
            />
            <Bar 
              yAxisId="campaigns"
              dataKey="campaigns" 
              fill="hsl(var(--chart-4))" 
              name="campaigns"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Campaign Objective Summary Cards
export interface ObjectiveSummaryProps {
  data: Array<{
    objective: string
    totalSpend: number
    count: number
    avgSpend: number
    status: string
  }>
  loading?: boolean
}

export function ObjectiveSummary({ data, loading }: ObjectiveSummaryProps) {
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

  const topObjectives = [...data]
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 4)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {topObjectives.map((objective, index) => (
        <Card key={objective.objective}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{objective.objective.replace(/_/g, ' ')}</span>
              <Badge variant="outline">{objective.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${objective.totalSpend}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {objective.count} campaigns • Avg: ${objective.avgSpend.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
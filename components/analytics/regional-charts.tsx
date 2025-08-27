/**
 * Regional Performance Charts
 * 
 * Geographic analysis with Map, Bar, and Pie visualizations
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts"

// Regional Spend Distribution (Bar Chart)
export interface RegionalSpendBarProps {
  data?: Array<{
    region: string
    spend: number
    clicks: number
    reach: number
    ctr: number
    cpc: number
    cpm: number
    percentage: number
  }>
  loading?: boolean
}

export function RegionalSpendBar({ data = [], loading }: RegionalSpendBarProps) {
  // Mock data based on stats.md format
  const chartData = data.length > 0 ? data : [
    { region: "Uttar Pradesh", spend: 2850, clicks: 1450, reach: 145000, ctr: 1.0, cpc: 1.97, cpm: 19.66, percentage: 23.4 },
    { region: "Odisha", spend: 1980, clicks: 890, reach: 118000, ctr: 0.75, cpc: 2.22, cpm: 16.78, percentage: 16.3 },
    { region: "West Bengal", spend: 1750, clicks: 920, reach: 102000, ctr: 0.90, cpc: 1.90, cpm: 17.16, percentage: 14.4 },
    { region: "Bihar", spend: 1650, clicks: 780, reach: 95000, ctr: 0.82, cpc: 2.12, cpm: 17.37, percentage: 13.6 },
    { region: "Jharkhand", spend: 1420, clicks: 670, reach: 88000, ctr: 0.76, cpc: 2.12, cpm: 16.14, percentage: 11.7 },
    { region: "Madhya Pradesh", spend: 1380, clicks: 640, reach: 82000, ctr: 0.78, cpc: 2.16, cpm: 16.83, percentage: 11.3 },
    { region: "Rajasthan", spend: 1250, clicks: 580, reach: 76000, ctr: 0.76, cpc: 2.16, cpm: 16.45, percentage: 10.3 },
    { region: "Assam", spend: 980, clicks: 420, reach: 65000, ctr: 0.65, cpc: 2.33, cpm: 15.08, percentage: 8.1 },
  ]

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Regional Spend Distribution</CardTitle>
          <CardDescription>Ad spend by geographic region</CardDescription>
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
        <CardTitle>Regional Ad Spend Distribution</CardTitle>
        <CardDescription>
          Total advertising spend and performance by geographic region
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[400px]">
          <BarChart data={chartData} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="region" 
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis yAxisId="spend" orientation="left" />
            <YAxis yAxisId="clicks" orientation="right" />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'spend') return [`$${value}`, 'Total Spend']
                  if (name === 'clicks') return [value, 'Total Clicks']
                  return [value, name]
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>CTR: {data.ctr}% • CPC: ${data.cpc} • CPM: ${data.cpm}</div>
                          <div>Reach: {data.reach.toLocaleString()}</div>
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
              yAxisId="clicks"
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

// Regional Performance Pie Chart
export interface RegionalPerformancePieProps {
  data?: Array<{
    region: string
    spend: number
    percentage: number
  }>
  loading?: boolean
}

export function RegionalPerformancePie({ data = [], loading }: RegionalPerformancePieProps) {
  const totalSpend = data.reduce((sum, item) => sum + item.spend, 0)
  const pieData = data.length > 0 ? data : [
    { region: "Uttar Pradesh", spend: 2850, percentage: 23.4 },
    { region: "Odisha", spend: 1980, percentage: 16.3 },
    { region: "West Bengal", spend: 1750, percentage: 14.4 },
    { region: "Bihar", spend: 1650, percentage: 13.6 },
    { region: "Jharkhand", spend: 1420, percentage: 11.7 },
    { region: "Others", spend: 2500, percentage: 20.6 }
  ].map((item, index) => ({
    ...item,
    fill: `hsl(var(--chart-${(index % 6) + 1}))`
  }))

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regional Distribution</CardTitle>
          <CardDescription>Spend share by region</CardDescription>
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
        <CardTitle>Regional Spend Share</CardTitle>
        <CardDescription>
          Distribution of advertising budget across regions
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
              dataKey="spend"
              nameKey="region"
              label={({ region, percentage }) => `${region}: ${percentage}%`}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => [`$${value}`, 'Total Spend']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>Share: {data.percentage}%</div>
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

// Regional CTR Performance Line Chart
export interface RegionalCTRLineProps {
  data?: Array<{
    region: string
    ctr: number
    cpc: number
    reach: number
  }>
  loading?: boolean
}

export function RegionalCTRLine({ data = [], loading }: RegionalCTRLineProps) {
  const chartData = data.length > 0 ? data.slice(0, 8).map(d => ({
    region: d.region.length > 8 ? d.region.substring(0, 8) : d.region,
    ctr: d.ctr,
    cpc: d.cpc,
    reach: d.reach
  })) : [
    { region: "UP", ctr: 1.0, cpc: 1.97, reach: 145000 },
    { region: "Odisha", ctr: 0.75, cpc: 2.22, reach: 118000 },
    { region: "WB", ctr: 0.90, cpc: 1.90, reach: 102000 },
    { region: "Bihar", ctr: 0.82, cpc: 2.12, reach: 95000 },
    { region: "Jharkhand", ctr: 0.76, cpc: 2.12, reach: 88000 },
    { region: "MP", ctr: 0.78, cpc: 2.16, reach: 82000 },
    { region: "Rajasthan", ctr: 0.76, cpc: 2.16, reach: 76000 },
    { region: "Assam", ctr: 0.65, cpc: 2.33, reach: 65000 }
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regional CTR Performance</CardTitle>
          <CardDescription>Click-through rates by region</CardDescription>
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
        <CardTitle>Regional CTR Performance</CardTitle>
        <CardDescription>
          Click-through rates and cost efficiency by region
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[300px]">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis yAxisId="ctr" orientation="left" />
            <YAxis yAxisId="cpc" orientation="right" />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'ctr') return [`${value}%`, 'CTR']
                  if (name === 'cpc') return [`$${value}`, 'CPC']
                  return [value, name]
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>Reach: {data.reach.toLocaleString()}</div>
                        </div>
                      </div>
                    )
                  }
                  return label
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
              dataKey="cpc" 
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

// Regional Performance Table
export interface RegionalTableProps {
  data?: Array<{
    region: string
    spend: number
    clicks: number
    reach: number
    ctr: number
    cpc: number
    cpm: number
    percentage: number
  }>
  loading?: boolean
}

export function RegionalTable({ data = [], loading }: RegionalTableProps) {
  const tableData = data.length > 0 ? data : [
    { region: "Uttar Pradesh", spend: 2850, clicks: 1450, reach: 145000, ctr: 1.0, cpc: 1.97, cpm: 19.66, percentage: 23.4 },
    { region: "Odisha", spend: 1980, clicks: 890, reach: 118000, ctr: 0.75, cpc: 2.22, cpm: 16.78, percentage: 16.3 },
    { region: "West Bengal", spend: 1750, clicks: 920, reach: 102000, ctr: 0.90, cpc: 1.90, cpm: 17.16, percentage: 14.4 },
    { region: "Bihar", spend: 1650, clicks: 780, reach: 95000, ctr: 0.82, cpc: 2.12, cpm: 17.37, percentage: 13.6 },
    { region: "Jharkhand", spend: 1420, clicks: 670, reach: 88000, ctr: 0.76, cpc: 2.12, cpm: 16.14, percentage: 11.7 },
    { region: "Madhya Pradesh", spend: 1380, clicks: 640, reach: 82000, ctr: 0.78, cpc: 2.16, cpm: 16.83, percentage: 11.3 },
    { region: "Rajasthan", spend: 1250, clicks: 580, reach: 76000, ctr: 0.76, cpc: 2.16, cpm: 16.45, percentage: 10.3 },
    { region: "Assam", spend: 980, clicks: 420, reach: 65000, ctr: 0.65, cpc: 2.33, cpm: 15.08, percentage: 8.1 },
    { region: "Chhattisgarh", spend: 890, clicks: 380, reach: 58000, ctr: 0.66, cpc: 2.34, cpm: 15.34, percentage: 7.3 },
    { region: "Haryana", spend: 780, clicks: 340, reach: 52000, ctr: 0.65, cpc: 2.29, cpm: 15.00, percentage: 6.4 }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Performance Breakdown</CardTitle>
        <CardDescription>
          Detailed performance metrics for each geographic region
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Total Spend</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Reach</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">CPC</TableHead>
              <TableHead className="text-right">CPM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              tableData.map((region, index) => (
                <TableRow key={region.region}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: `hsl(var(--chart-${(index % 6) + 1}))` }}
                      />
                      {region.region}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${region.spend}
                  </TableCell>
                  <TableCell className="text-right">
                    {region.clicks.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {region.reach.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={region.ctr >= 1.0 ? "default" : region.ctr >= 0.8 ? "secondary" : "outline"}>
                      {region.ctr.toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${region.cpc.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${region.cpm.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {!loading && tableData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No regional performance data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
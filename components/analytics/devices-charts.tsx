/**
 * Device & Platform Performance Charts
 * 
 * Mobile, Desktop, and Platform analysis with Pie and Bar charts
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell
} from "recharts"

// Device Distribution Pie Chart
export interface DeviceDistributionPieProps {
  data?: Array<{
    device: string
    spend: number
    clicks: number
    impressions: number
    ctr: number
    percentage: number
  }>
  loading?: boolean
}

export function DeviceDistributionPie({ data = [], loading }: DeviceDistributionPieProps) {
  // Mock data based on typical device usage
  const chartData = data.length > 0 ? data : [
    { device: "Mobile", spend: 6450, clicks: 3280, impressions: 185000, ctr: 1.77, percentage: 65.8 },
    { device: "Desktop", spend: 2890, clicks: 1150, impressions: 95000, ctr: 1.21, percentage: 29.5 },
    { device: "Tablet", spend: 460, clicks: 180, impressions: 22000, ctr: 0.82, percentage: 4.7 }
  ].map((item, index) => ({
    ...item,
    fill: `hsl(var(--chart-${index + 1}))`
  }))

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Distribution</CardTitle>
          <CardDescription>Spend distribution by device type</CardDescription>
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
        <CardTitle>Device Performance Distribution</CardTitle>
        <CardDescription>
          Ad spend and engagement across device types
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
              dataKey="spend"
              nameKey="device"
              label={({ device, percentage }) => `${device}: ${percentage.toFixed(1)}%`}
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
                          <div>Clicks: {data.clicks.toLocaleString()}</div>
                          <div>CTR: {data.ctr}%</div>
                          <div>Impressions: {data.impressions.toLocaleString()}</div>
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

// Platform Performance Bar Chart
export interface PlatformPerformanceBarProps {
  data?: Array<{
    platform: string
    spend: number
    clicks: number
    ctr: number
    cpc: number
    impressions: number
  }>
  loading?: boolean
}

export function PlatformPerformanceBar({ data = [], loading }: PlatformPerformanceBarProps) {
  const chartData = data.length > 0 ? data : [
    { platform: "Facebook", spend: 5280, clicks: 2680, ctr: 1.8, cpc: 1.97, impressions: 148000 },
    { platform: "Instagram", spend: 3420, clicks: 1820, ctr: 2.1, cpc: 1.88, impressions: 87000 },
    { platform: "Messenger", spend: 890, clicks: 380, ctr: 1.4, cpc: 2.34, impressions: 27000 },
    { platform: "Audience Network", spend: 210, clicks: 85, ctr: 0.9, cpc: 2.47, impressions: 9500 }
  ]

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
          <CardDescription>Performance across Facebook platforms</CardDescription>
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
        <CardTitle>Platform Performance Comparison</CardTitle>
        <CardDescription>
          Spend and engagement metrics across Facebook advertising platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[400px]">
          <BarChart data={chartData} margin={{ bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="platform" 
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
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
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>CPC: ${data.cpc}</div>
                          <div>Impressions: {data.impressions.toLocaleString()}</div>
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

// Device Performance Table
export interface DevicePerformanceTableProps {
  data?: Array<{
    device: string
    spend: number
    clicks: number
    impressions: number
    ctr: number
    cpc: number
    cpm: number
    conversions?: number
  }>
  loading?: boolean
}

export function DevicePerformanceTable({ data = [], loading }: DevicePerformanceTableProps) {
  const tableData = data.length > 0 ? data : [
    { device: "Mobile", spend: 6450, clicks: 3280, impressions: 185000, ctr: 1.77, cpc: 1.97, cpm: 34.86, conversions: 156 },
    { device: "Desktop", spend: 2890, clicks: 1150, impressions: 95000, ctr: 1.21, cpc: 2.51, cpm: 30.42, conversions: 89 },
    { device: "Tablet", spend: 460, clicks: 180, impressions: 22000, ctr: 0.82, cpc: 2.56, cpm: 20.91, conversions: 12 }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Performance Breakdown</CardTitle>
        <CardDescription>
          Detailed performance metrics for each device type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">CPC</TableHead>
              <TableHead className="text-right">CPM</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              tableData.map((device, index) => (
                <TableRow key={device.device}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: `hsl(var(--chart-${index + 1}))` }}
                      />
                      {device.device}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${device.spend}
                  </TableCell>
                  <TableCell className="text-right">
                    {device.clicks.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {device.impressions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={device.ctr >= 1.5 ? "default" : device.ctr >= 1.0 ? "secondary" : "outline"}>
                      {device.ctr.toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${device.cpc.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${device.cpm.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {device.conversions || 0}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {!loading && tableData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No device performance data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Device Summary Cards
export interface DeviceSummaryProps {
  data?: {
    topDevice?: { device: string; spend: number; ctr: number }
    totalDevices?: number
    mobileShare?: number
    averageCTR?: number
  }
  loading?: boolean
}

export function DeviceSummary({ data = {}, loading }: DeviceSummaryProps) {
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
    topDevice: data.topDevice || { device: "Mobile", spend: 6450, ctr: 1.77 },
    totalDevices: data.totalDevices || 3,
    mobileShare: data.mobileShare || 65.8,
    averageCTR: data.averageCTR || 1.4
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Top Device</span>
            <Badge variant="outline">{summaryData.topDevice.device}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summaryData.topDevice.spend}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {summaryData.topDevice.ctr}% CTR
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Device Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.totalDevices}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Active devices
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Mobile Share</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.mobileShare.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            Of total spend
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.averageCTR.toFixed(2)}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            Across devices
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
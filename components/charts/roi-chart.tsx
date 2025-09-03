"use client"

import { TrendingUp, DollarSign } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A bar chart showing ROI performance by campaign or objective"

const chartConfig = {
  roas: {
    label: "ROAS",
    color: "var(--chart-1)",
  },
  conversions: {
    label: "Conversions",
    color: "var(--chart-2)",
  },
  conversionValue: {
    label: "Revenue (₹)",
    color: "var(--chart-3)",
  },
  spend: {
    label: "Spend (₹)",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

interface ROIChartData {
  name: string
  roas: number
  conversions: number
  conversionValue: number
  spend: number
  roiStatus?: 'Profitable' | 'Break-even' | 'Loss' | 'Unknown'
}

interface ROIChartProps {
  data?: ROIChartData[]
  title?: string
  description?: string
  metric?: 'roas' | 'conversions' | 'conversionValue'
}

// Color mapping for ROI status
const getBarColor = (roas: number, roiStatus?: string) => {
  if (roiStatus === 'Profitable' || roas > 2) return "hsl(142, 76%, 36%)" // Green
  if (roiStatus === 'Break-even' || (roas >= 1 && roas <= 2)) return "hsl(45, 93%, 47%)" // Yellow
  if (roiStatus === 'Loss' || roas < 1) return "hsl(0, 84%, 60%)" // Red
  return "var(--chart-1)" // Default
}

export function ROIBarChart({ 
  data = [], 
  title = "ROI Performance",
  description = "Return on Investment analysis",
  metric = 'roas'
}: ROIChartProps) {
  
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No ROI data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort data by the selected metric
  const sortedData = [...data].sort((a, b) => {
    const aVal = metric === 'roas' ? a.roas : 
                 metric === 'conversions' ? a.conversions : 
                 a.conversionValue
    const bVal = metric === 'roas' ? b.roas : 
                 metric === 'conversions' ? b.conversions : 
                 b.conversionValue
    return bVal - aVal
  }).slice(0, 10) // Show top 10

  const metricLabel = metric === 'roas' ? 'ROAS' : 
                     metric === 'conversions' ? 'Conversions' : 
                     'Revenue (₹)'

  const formatValue = (value: number) => {
    if (metric === 'roas') return `${value.toFixed(2)}x`
    if (metric === 'conversions') return value.toString()
    return `₹${Math.round(value).toLocaleString()}`
  }

  const bestPerformer = sortedData[0]
  const averageMetric = sortedData.reduce((sum, item) => {
    return sum + (metric === 'roas' ? item.roas : 
                  metric === 'conversions' ? item.conversions : 
                  item.conversionValue)
  }, 0) / sortedData.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={sortedData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
            height={300}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => {
                if (metric === 'roas') return `${value.toFixed(1)}x`
                if (metric === 'conversions') return value.toString()
                return `₹${Math.round(value / 1000)}K`
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'roas') return [`${Number(value).toFixed(2)}x`, 'ROAS']
                  if (name === 'conversions') return [value, 'Conversions']
                  if (name === 'conversionValue') return [`₹${Math.round(Number(value)).toLocaleString()}`, 'Revenue']
                  return [value, name]
                }}
                labelFormatter={(label) => `Campaign: ${label}`}
              />}
            />
            <Bar 
              dataKey={metric} 
              radius={4}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground text-xs"
                fontSize={10}
                formatter={(value: number) => formatValue(value)}
              />
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={metric === 'roas' ? getBarColor(entry.roas, entry.roiStatus) : `var(--chart-${(index % 4) + 1})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      {bestPerformer && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Best: {bestPerformer.name} 
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            {metricLabel}: {formatValue(
              metric === 'roas' ? bestPerformer.roas :
              metric === 'conversions' ? bestPerformer.conversions :
              bestPerformer.conversionValue
            )} • Average: {formatValue(averageMetric)}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

// Specific variant for Campaign ROI
export function CampaignROIChart({ data }: { data?: any[] }) {
  const roiData: ROIChartData[] = data?.map(campaign => ({
    name: campaign.campaignName?.slice(0, 20) + (campaign.campaignName?.length > 20 ? '...' : '') || 'Unnamed',
    roas: campaign.roas || 0,
    conversions: campaign.conversions || 0,
    conversionValue: campaign.conversionValue || 0,
    spend: campaign.spend || 0,
    roiStatus: campaign.roiStatus
  })) || []

  return (
    <ROIBarChart
      data={roiData}
      title="Campaign ROAS Performance"
      description="Top performing campaigns by Return on Ad Spend"
      metric="roas"
    />
  )
}

// Specific variant for Objective ROI
export function ObjectiveROIChart({ data }: { data?: any[] }) {
  const roiData: ROIChartData[] = data?.map(objective => ({
    name: objective.objective?.replace(/_/g, ' ') || 'Unknown',
    roas: objective.avgROAS || 0,
    conversions: objective.totalConversions || 0,
    conversionValue: objective.totalConversionValue || 0,
    spend: objective.totalSpend || 0
  })) || []

  return (
    <ROIBarChart
      data={roiData}
      title="Objective ROI Performance"
      description="ROI performance by campaign objective type"
      metric="roas"
    />
  )
}
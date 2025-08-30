"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

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

export const description = "A bar chart showing regional performance"

const chartConfig = {
  spend: {
    label: "Spend ($)",
    color: "var(--chart-1)",
  },
  clicks: {
    label: "Clicks",
    color: "var(--chart-2)",
  },
  impressions: {
    label: "Impressions (K)",
    color: "var(--chart-3)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig

interface RegionalChartProps {
  data?: Array<{
    region: string
    spend: number
    clicks: number
    ctr?: number
    cpc?: number
    reach?: number
    cpm?: number
    percentage?: number
  }>
  title?: string
  description?: string
}

export function ChartBarLabelCustom({ 
  data,
  title = "Regional Performance", 
  description = "Ad performance across geographic regions" 
}: RegionalChartProps = {}) {
  // Debug: Log the data being passed
  console.log("🔍 Regional Chart Data:", data)
  console.log("📊 Data length:", data?.length)
  console.log("✅ Has valid data:", data && data.length > 0)
  
  // Use provided data or fallback to sample data
  const chartData = data && data.length > 0 
    ? data.sort((a, b) => b.clicks - a.clicks).slice(0, 5) // Top 5 regions by clicks
    : [
        { region: "Sample: India", spend: 8500, clicks: 3450 },
        { region: "Sample: United States", spend: 12000, clicks: 3200 },
        { region: "Sample: Brazil", spend: 9800, clicks: 2980 },
        { region: "Sample: Indonesia", spend: 7200, clicks: 2650 },
        { region: "Sample: Germany", spend: 10500, clicks: 2400 },
      ]

  console.log("📈 Final chart data:", chartData)
  const topRegion = chartData[0]?.region || "No Data"
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="region"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis dataKey="clicks" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm">{data.payload.region}</span>
                        <span className="text-sm font-medium">{data.value} clicks</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="clicks"
              layout="vertical"
              fill="var(--color-clicks)"
              radius={4}
            >
              <LabelList
                dataKey="region"
                position="insideLeft"
                offset={8}
                className="fill-(--color-label)"
                fontSize={12}
              />
              <LabelList
                dataKey="clicks"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-center gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {topRegion} leads with highest clicks <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing click performance across all regions
        </div>
      </CardFooter>
    </Card>
  )
}

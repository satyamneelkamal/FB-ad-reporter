/**
 * Analytics Loading Skeleton
 * 
 * Consistent loading state component for all analytics pages
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsLoadingProps {
  showCharts?: boolean
  showMetricCards?: boolean
  cardCount?: number
  className?: string
}

export function AnalyticsLoading({ 
  showCharts = true, 
  showMetricCards = true, 
  cardCount = 4,
  className = ""
}: AnalyticsLoadingProps) {
  return (
    <div className={`container mx-auto px-4 lg:px-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Metric Cards */}
      {showMetricCards && (
        <div className={`grid gap-4 md:grid-cols-2 ${cardCount === 4 ? 'lg:grid-cols-4' : cardCount === 3 ? 'lg:grid-cols-3' : ''}`}>
          {Array.from({ length: cardCount }, (_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts Section */}
      {showCharts && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Main Chart */}
            <Card className="col-span-full">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>

            {/* Side Charts */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-52" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Additional Content */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
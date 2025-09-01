'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

interface AudienceMatrixProps {
  segments?: Array<{
    age: string
    gender: string
    spend: number
    clicks: number
    ctr: number
  }>
  regions?: Array<{
    region: string
    spend: number
    clicks: number
    ctr: number
  }>
}

export function AudienceMatrix({ segments = [], regions = [] }: AudienceMatrixProps) {
  const [selectedSegment, setSelectedSegment] = useState<any>(null)
  
  if (!segments.length || !regions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audience Performance Matrix</CardTitle>
          <CardDescription>Interactive grid showing performance intersections</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">
            Matrix will appear when sufficient demographic and regional data is available
          </p>
        </CardContent>
      </Card>
    )
  }

  const topSegments = segments.slice(0, 4)
  const topRegions = regions.slice(0, 3)
  
  // Create performance score for each combination
  const getPerformanceScore = (segment: any, region: any) => {
    // Combine CTR scores - this is simplified for demo
    const combinedScore = (segment.ctr + region.ctr) / 2
    return combinedScore
  }

  const getPerformanceColor = (score: number) => {
    if (score > 3) return 'bg-green-100 dark:bg-green-950 border-green-300 hover:bg-green-150'
    if (score > 2) return 'bg-yellow-100 dark:bg-yellow-950 border-yellow-300 hover:bg-yellow-150'
    if (score > 1) return 'bg-orange-100 dark:bg-orange-950 border-orange-300 hover:bg-orange-150'
    return 'bg-red-100 dark:bg-red-950 border-red-300 hover:bg-red-150'
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Audience Performance Matrix</CardTitle>
          <CardDescription>
            Click on cells to see detailed performance intersections • Green = High Performance • Red = Low Performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b font-medium text-sm">Segment</th>
                  {topRegions.map(region => (
                    <th key={region.region} className="text-center p-2 border-b font-medium text-sm">
                      {region.region}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topSegments.map(segment => (
                  <tr key={`${segment.age}-${segment.gender}`}>
                    <td className="p-2 border-b text-sm font-medium">
                      {segment.age} {segment.gender}
                    </td>
                    {topRegions.map(region => {
                      const score = getPerformanceScore(segment, region)
                      const colorClass = getPerformanceColor(score)
                      const isSelected = selectedSegment?.segment === segment && selectedSegment?.region === region
                      
                      return (
                        <td key={region.region} className="p-1 border-b">
                          <div
                            className={`
                              p-3 rounded-lg border cursor-pointer transition-colors text-center
                              ${colorClass}
                              ${isSelected ? 'ring-2 ring-blue-500' : ''}
                            `}
                            onClick={() => setSelectedSegment({ segment, region, score })}
                          >
                            <div className="text-xs font-medium">{score.toFixed(1)}%</div>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center mt-4 gap-6 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border-green-300"></div>
              <span>High (3.0%+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-100 border-yellow-300"></div>
              <span>Good (2.0%+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-100 border-orange-300"></div>
              <span>Fair (1.0%+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-100 border-red-300"></div>
              <span>Low (&lt;1.0%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Cell Details */}
      {selectedSegment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedSegment.segment.age} {selectedSegment.segment.gender} in {selectedSegment.region.region}
            </CardTitle>
            <CardDescription>Performance details for this audience segment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Demographic Performance</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>CTR:</span>
                    <span className="font-medium">{selectedSegment.segment.ctr.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spend:</span>
                    <span className="font-medium">₹{Math.round(selectedSegment.segment.spend)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clicks:</span>
                    <span className="font-medium">{selectedSegment.segment.clicks}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Regional Performance</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>CTR:</span>
                    <span className="font-medium">{selectedSegment.region.ctr.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spend:</span>
                    <span className="font-medium">₹{Math.round(selectedSegment.region.spend)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clicks:</span>
                    <span className="font-medium">{selectedSegment.region.clicks}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Combined Performance Score:</span>
                <Badge variant={selectedSegment.score > 2 ? 'default' : 'secondary'}>
                  {selectedSegment.score.toFixed(2)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedSegment.score > 3 
                  ? "🎯 High-value segment! Consider increasing budget allocation." 
                  : selectedSegment.score > 2 
                  ? "📈 Good performance. Monitor and optimize further." 
                  : "⚠️ Underperforming segment. Consider different targeting or creative."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
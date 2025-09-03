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
    conversions?: number
    roas?: number
    conversionRate?: number
  }>
  regions?: Array<{
    region: string
    spend: number
    clicks: number
    ctr: number
    conversions?: number
    roas?: number
    conversionValue?: number
  }>
}

export function AudienceMatrix({ segments = [], regions = [] }: AudienceMatrixProps) {
  const [selectedSegment, setSelectedSegment] = useState<any>(null)
  
  if (!segments.length || !regions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🎯 ROAS Performance Matrix</CardTitle>
          <CardDescription>Interactive grid showing profitability intersections by audience segment and region</CardDescription>
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
  
  // Create ROAS-based performance score for each combination
  const getROASScore = (segment: any, region: any) => {
    // If both have ROAS data, use weighted average based on spend
    if (segment.roas && region.roas) {
      const totalSpend = segment.spend + region.spend
      const weightedROAS = totalSpend > 0 
        ? (segment.roas * segment.spend + region.roas * region.spend) / totalSpend
        : (segment.roas + region.roas) / 2
      return weightedROAS
    }
    // Fall back to individual ROAS or estimated based on CTR
    if (segment.roas) return segment.roas
    if (region.roas) return region.roas
    
    // Fallback: estimate ROAS based on CTR performance (rough approximation)
    const combinedCTR = (segment.ctr + region.ctr) / 2
    return combinedCTR > 3 ? 2.5 : combinedCTR > 2 ? 1.8 : combinedCTR > 1 ? 1.2 : 0.8
  }

  const getROASColor = (roas: number) => {
    if (roas >= 3) return 'bg-green-100 dark:bg-green-950 border-green-300 hover:bg-green-200'
    if (roas >= 2) return 'bg-blue-100 dark:bg-blue-950 border-blue-300 hover:bg-blue-200'
    if (roas >= 1) return 'bg-yellow-100 dark:bg-yellow-950 border-yellow-300 hover:bg-yellow-200'
    return 'bg-red-100 dark:bg-red-950 border-red-300 hover:bg-red-200'
  }

  const getROASLabel = (roas: number) => {
    if (roas >= 3) return '🏆 Excellent'
    if (roas >= 2) return '🚀 Profitable'
    if (roas >= 1) return '🔄 Break-even'
    return '⚠️ Loss'
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Audience Performance Matrix</CardTitle>
          <CardDescription>
            Click on cells to see detailed ROAS intersections • Green = High ROAS (3.0x+) • Red = Loss (&lt;1.0x ROAS)
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
                      const roasScore = getROASScore(segment, region)
                      const colorClass = getROASColor(roasScore)
                      const roasLabel = getROASLabel(roasScore)
                      const isSelected = selectedSegment?.segment === segment && selectedSegment?.region === region
                      
                      return (
                        <td key={region.region} className="p-1 border-b">
                          <div
                            className={`
                              p-3 rounded-lg border cursor-pointer transition-colors text-center
                              ${colorClass}
                              ${isSelected ? 'ring-2 ring-blue-500' : ''}
                            `}
                            onClick={() => setSelectedSegment({ segment, region, roasScore, roasLabel })}
                          >
                            <div className="text-xs font-bold">{roasScore.toFixed(1)}x</div>
                            <div className="text-xs text-muted-foreground mt-1">{roasLabel.split(' ')[0]}</div>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* ROAS Legend */}
          <div className="flex justify-center mt-4 gap-6 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border-green-300"></div>
              <span>🏆 Excellent (3.0x+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-100 border-blue-300"></div>
              <span>🚀 Profitable (2.0x+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-100 border-yellow-300"></div>
              <span>🔄 Break-even (1.0x+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-100 border-red-300"></div>
              <span>⚠️ Loss (&lt;1.0x)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Cell Details */}
      {selectedSegment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedSegment.roasLabel} {selectedSegment.segment.age} {selectedSegment.segment.gender} in {selectedSegment.region.region}
            </CardTitle>
            <CardDescription>ROAS performance details for this profitable audience intersection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Demographic Performance</h4>
                <div className="space-y-1 text-sm">
                  {selectedSegment.segment.roas ? (
                    <>
                      <div className="flex justify-between">
                        <span>ROAS:</span>
                        <span className="font-medium text-green-600">{selectedSegment.segment.roas.toFixed(2)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversions:</span>
                        <span className="font-medium">{selectedSegment.segment.conversions || 0}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>CTR:</span>
                        <span className="font-medium">{selectedSegment.segment.ctr.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clicks:</span>
                        <span className="font-medium">{selectedSegment.segment.clicks}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Spend:</span>
                    <span className="font-medium">₹{Math.round(selectedSegment.segment.spend).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Regional Performance</h4>
                <div className="space-y-1 text-sm">
                  {selectedSegment.region.roas ? (
                    <>
                      <div className="flex justify-between">
                        <span>ROAS:</span>
                        <span className="font-medium text-blue-600">{selectedSegment.region.roas.toFixed(2)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-medium">₹{Math.round(selectedSegment.region.conversionValue || 0).toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>CTR:</span>
                        <span className="font-medium">{selectedSegment.region.ctr.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clicks:</span>
                        <span className="font-medium">{selectedSegment.region.clicks.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Spend:</span>
                    <span className="font-medium">₹{Math.round(selectedSegment.region.spend).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Combined ROAS Score:</span>
                <Badge variant={selectedSegment.roasScore >= 2 ? 'default' : selectedSegment.roasScore >= 1 ? 'secondary' : 'destructive'}>
                  {selectedSegment.roasScore.toFixed(2)}x ROAS
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedSegment.roasScore >= 3 
                  ? "🎯 Excellent profitability! Scale this winning combination immediately." 
                  : selectedSegment.roasScore >= 2 
                  ? "🚀 Strong profit margin. Consider increasing budget allocation." 
                  : selectedSegment.roasScore >= 1
                  ? "🔄 Breaking even. Optimize creative and targeting for better ROI."
                  : "⚠️ Losing money. Pause and analyze or pivot strategy for this segment."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
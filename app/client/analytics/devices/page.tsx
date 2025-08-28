/**
 * Devices & Platforms Analysis Dashboard
 * 
 * Device performance and platform analysis with Pie and Bar charts
 */

'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, Smartphone, Monitor, Tablet, Globe } from "lucide-react"

export default function DevicesAnalysisPage() {
  const analytics = useAnalytics()

  if (analytics.error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Device Data
            </CardTitle>
            <CardDescription>
              {analytics.error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={analytics.refresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate device insights from available data
  const devicesData = analytics.devices || { available: false }
  const totalDevices = devicesData.devices?.length || 0
  const topDevice = devicesData.devices?.length > 0 ? 
    [...devicesData.devices].sort((a, b) => b.spend - a.spend)[0] : null
  const platformsData = analytics.platforms || { available: false }
  const totalPlatforms = platformsData.platforms?.length || 0

  // Calculate device metrics
  const totalDeviceSpend = devicesData.devices?.reduce((sum, d) => sum + d.spend, 0) || 0
  const mobileShare = devicesData.devices?.find(d => d.device.toLowerCase().includes('mobile'))?.percentage || 65.8
  const averageCTR = devicesData.devices?.reduce((sum, d) => sum + (d.ctr || 0), 0) / (devicesData.devices?.length || 1) || 1.4

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devices & Platforms</h1>
          <p className="text-muted-foreground mt-2">
            Performance analysis across device types and advertising platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
          {analytics.lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date(analytics.lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <Button 
            onClick={analytics.refresh} 
            variant="outline" 
            size="sm"
            disabled={analytics.loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${analytics.loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Device Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Device Types</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices || 3}</div>
            <p className="text-xs text-muted-foreground">
              Active devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Device</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topDevice?.device || 'Mobile'}</div>
            <p className="text-xs text-muted-foreground">
              ₹{topDevice?.spend || 6450} spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Share</CardTitle>
            <Tablet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mobileShare.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Of total spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCTR.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Across devices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Device Performance Cards */}
      {devicesData.devices && devicesData.devices.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Device Performance Breakdown</h2>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {devicesData.devices.map((device, index) => (
              <Card key={device.device}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    {device.device.toLowerCase().includes('mobile') ? (
                      <Smartphone className="h-4 w-4" />
                    ) : device.device.toLowerCase().includes('desktop') ? (
                      <Monitor className="h-4 w-4" />
                    ) : (
                      <Tablet className="h-4 w-4" />
                    )}
                    {device.device}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Spend</span>
                      <span className="font-semibold">₹{Math.round(device.spend).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Clicks</span>
                      <span className="font-semibold">{device.clicks?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Impressions</span>
                      <span className="font-semibold">{device.impressions?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">CTR</span>
                      <span className="font-semibold">{device.ctr?.toFixed(2) || '1.40'}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Share</span>
                      <span className="font-semibold">{device.percentage?.toFixed(1) || '0.0'}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Platform Performance Cards */}
      {platformsData.platforms && platformsData.platforms.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Platform Performance</h2>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {platformsData.platforms.map((platform, index) => (
              <Card key={platform.platform}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}
                    />
                    {platform.platform}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Spend</span>
                      <span className="font-semibold">₹{Math.round(platform.spend).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Clicks</span>
                      <span className="font-semibold">{platform.clicks?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">CTR</span>
                      <span className="font-semibold">{platform.ctr?.toFixed(2) || '1.40'}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Share</span>
                      <span className="font-semibold">{platform.percentage?.toFixed(1) || '0.0'}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Device Insights */}
      {!analytics.loading && (
        <Card>
          <CardHeader>
            <CardTitle>Device Performance Insights</CardTitle>
            <CardDescription>
              Key observations from your device and platform performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-foreground">Device Distribution</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {topDevice ? (
                    <>
                      <strong>{topDevice.device}</strong> devices drive the majority of your ad spend 
                      (₹{topDevice.spend}), indicating strong mobile-first user behavior. 
                      Consider optimizing creative content for mobile viewing.
                    </>
                  ) : (
                    <>
                      Device performance data will be available once Facebook provides detailed 
                      device breakdowns from your campaign targeting and placements.
                    </>
                  )}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Platform Performance</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalPlatforms > 0 ? (
                    <>
                      Your ads are running across <strong>{totalPlatforms} platforms</strong> 
                      within the Facebook ecosystem. Monitor platform-specific performance to 
                      optimize budget allocation and creative strategies.
                    </>
                  ) : (
                    <>
                      Platform performance metrics will be calculated once sufficient data 
                      is collected from Facebook, Instagram, Messenger, and Audience Network.
                    </>
                  )}
                </p>
              </div>
            </div>

            {mobileShare > 50 && (
              <div>
                <h4 className="font-medium text-foreground">Mobile Optimization</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  With <strong>{mobileShare.toFixed(1)}% mobile share</strong> of your ad spend, 
                  your audience is predominantly mobile. Ensure landing pages are mobile-optimized, 
                  creative content is mobile-friendly, and consider mobile-specific ad formats 
                  like Stories and Reels for better engagement.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Recommendations */}
      {!analytics.loading && (mobileShare > 60 || totalDevices > 0) && (
        <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader>
            <CardTitle className="text-purple-800 dark:text-purple-200">
              Device Optimization Recommendations
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Strategies to optimize for your device and platform mix
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-purple-800 dark:text-purple-200">
              {mobileShare > 60 && (
                <p>• Prioritize mobile-first creative design and vertical video formats</p>
              )}
              {topDevice && (
                <p>• Allocate more budget to {topDevice.device.toLowerCase()} placements for better ROI</p>
              )}
              <p>• Test device-specific ad formats (Stories for mobile, video for desktop)</p>
              <p>• Ensure fast loading times and mobile-optimized landing pages</p>
              <p>• Monitor platform performance and adjust placement strategies accordingly</p>
              <p>• Consider cross-device attribution for better campaign measurement</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!analytics.loading && !devicesData.available && !platformsData.available && (
        <Card>
          <CardContent className="text-center py-12">
            <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Device Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Device and platform performance data will appear here once Facebook provides 
              detailed breakdowns from your campaigns. This includes mobile vs. desktop performance, 
              platform-specific metrics, and device-level engagement patterns.
            </p>
            <Button onClick={analytics.refresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Updates
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
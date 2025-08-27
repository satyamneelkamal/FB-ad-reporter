'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Loader2, Database, Calendar, CheckCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  slug: string;
  fb_ad_account_id: string;
  status: string;
}

interface Report {
  id: number;
  month_year: string;
  scraped_at: string;
  clients: {
    id: number;
    name: string;
    slug: string;
  };
}

interface ScrapeStats {
  totalReports: number;
  reportsThisMonth: number;
  lastScrapedAt: string | null;
}

// Admin navigation data - consistent with other admin pages
const adminNavigation = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0f172a&color=fff",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: "IconDashboard",
    },
    {
      title: "Clients",
      url: "/admin/clients",
      icon: "IconUsers",
    },
    {
      title: "Data Collection",
      url: "/admin/scrape",
      icon: "IconDatabase",
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: "IconSettings",
    },
  ],
}

export default function AdminScrapePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ScrapeStats | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [monthYear, setMonthYear] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cacheRefreshing, setCacheRefreshing] = useState(false);
  const [cacheResult, setCacheResult] = useState('');

  // Generate default month (current month)
  useEffect(() => {
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonthYear(defaultMonth);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchClients();
    fetchReports();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/scrape');
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setReports(data.reports || []);
      setStats(data.statistics);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleScrape = async () => {
    if (!selectedClient || !monthYear) {
      setError('Please select a client and month/year');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: parseInt(selectedClient),
          monthYear,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Scraping failed');
      }

      setSuccess(`Data collection completed! Collected: ${Object.entries(data.dataCollected || {})
        .map(([key, value]) => `${value} ${key}`)
        .join(', ')}`);
      
      // Refresh reports
      await fetchReports();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Scraping failed');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (client: Client) => {
    return client.status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" navigationData={adminNavigation} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Data Collection</h1>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">{stats.reportsThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Last Scraped</p>
                  <p className="text-sm font-medium">
                    {stats.lastScrapedAt ? formatDate(stats.lastScrapedAt) : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Scraping Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Data Collection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Select Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{client.name}</span>
                        {getStatusBadge(client)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month/Year</Label>
              <Input
                id="month"
                type="month"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleScrape}
            disabled={loading || !selectedClient || !monthYear}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Collecting Data...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Start Data Collection
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analytics Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Cache Management</CardTitle>
          <p className="text-sm text-gray-600">
            Refresh processed analytics data to speed up client dashboards
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={async () => {
                setCacheRefreshing(true)
                try {
                  const response = await fetch('/api/admin/refresh-analytics-cache', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                  })
                  const result = await response.json()
                  
                  if (result.success) {
                    setCacheResult(`✅ Cache refreshed: ${result.summary.success} clients updated`)
                  } else {
                    setCacheResult(`❌ Error: ${result.error}`)
                  }
                } catch (error) {
                  setCacheResult(`❌ Network error: ${error.message}`)
                } finally {
                  setCacheRefreshing(false)
                }
              }}
              disabled={cacheRefreshing}
              variant="outline"
              className="h-auto py-4"
            >
              {cacheRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing All Caches...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh All Client Caches
                </>
              )}
            </Button>

            <Button
              onClick={async () => {
                if (!selectedClient) {
                  setCacheResult('⚠️ Please select a client first')
                  return
                }
                
                setCacheRefreshing(true)
                try {
                  const response = await fetch('/api/admin/refresh-analytics-cache', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clientId: parseInt(selectedClient) })
                  })
                  const result = await response.json()
                  
                  if (result.success) {
                    const clientResult = result.results[0]
                    if (clientResult.status === 'success') {
                      setCacheResult(`✅ Cache refreshed for ${clientResult.clientName}`)
                    } else {
                      setCacheResult(`❌ ${clientResult.reason || clientResult.error}`)
                    }
                  } else {
                    setCacheResult(`❌ Error: ${result.error}`)
                  }
                } catch (error) {
                  setCacheResult(`❌ Network error: ${error.message}`)
                } finally {
                  setCacheRefreshing(false)
                }
              }}
              disabled={cacheRefreshing || !selectedClient}
              variant="default"
              className="h-auto py-4"
            >
              {cacheRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing Cache...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Refresh Selected Client
                </>
              )}
            </Button>
          </div>

          {cacheResult && (
            <div className={`p-3 rounded-md border ${
              cacheResult.startsWith('✅') ? 'bg-green-50 border-green-200 text-green-800' :
              cacheResult.startsWith('⚠️') ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
              'bg-red-50 border-red-200 text-red-800'
            }`}>
              <pre className="text-sm whitespace-pre-wrap">{cacheResult}</pre>
            </div>
          )}

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <p><strong>How it works:</strong></p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Processes raw Facebook data into chart-ready analytics</li>
              <li>Stores processed data in Supabase for instant loading</li>
              <li>Client dashboards load in &lt;1 second instead of 10+ seconds</li>
              <li>Cache automatically expires after 1 hour</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Scraping History */}
      <Card>
        <CardHeader>
          <CardTitle>Collection History</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No data collections yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Client</th>
                    <th className="text-left p-2">Month/Year</th>
                    <th className="text-left p-2">Collected At</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{report.clients.name}</td>
                      <td className="p-2">{report.month_year}</td>
                      <td className="p-2">{formatDate(report.scraped_at)}</td>
                      <td className="p-2">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
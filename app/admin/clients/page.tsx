"use client"

import { useState, useEffect } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react"

// Admin navigation data (same as in admin dashboard)
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
  documents: [
    {
      name: "Client Database",
      url: "/admin/clients",
      icon: "IconDatabase",
    },
  ],
}

interface Client {
  id: number
  name: string
  fb_ad_account_id: string
  slug: string
  status: 'active' | 'inactive'
  created_at: string
  report_count?: number
  latest_report?: {
    month_year: string
    scraped_at: string
    total_records: number
  } | null
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    fb_ad_account_id: '',
    slug: ''
  })

  // Load clients
  const loadClients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/clients')
      const data = await response.json()
      
      if (data.success) {
        setClients(data.clients)
      } else {
        setError(data.error || 'Failed to load clients')
      }
    } catch (error) {
      setError('Network error loading clients')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  // Create client
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Client created successfully')
        setIsDialogOpen(false)
        setFormData({ name: '', fb_ad_account_id: '', slug: '' })
        loadClients() // Refresh list
      } else {
        setError(data.error || 'Failed to create client')
      }
    } catch (error) {
      setError('Network error creating client')
    }
  }

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
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Client Management</h1>
              <p className="text-muted-foreground">
                Manage your Facebook Ads clients and their accounts
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateClient} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Client Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter client name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fb_ad_account_id">Facebook Ad Account ID</Label>
                    <Input
                      id="fb_ad_account_id"
                      value={formData.fb_ad_account_id}
                      onChange={(e) => setFormData({ ...formData, fb_ad_account_id: e.target.value })}
                      placeholder="act_123456789012345"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug (optional)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="client-slug (auto-generated if empty)"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Client
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Clients ({clients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading clients...</div>
              ) : clients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No clients found. Add your first client to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Ad Account ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Latest Report</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.slug}</TableCell>
                        <TableCell className="font-mono text-sm">{client.fb_ad_account_id}</TableCell>
                        <TableCell>
                          <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{client.report_count || 0}</TableCell>
                        <TableCell>
                          {client.latest_report ? (
                            <div className="text-sm">
                              <div>{client.latest_report.month_year}</div>
                              <div className="text-muted-foreground">
                                {client.latest_report.total_records} records
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No reports</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive">
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
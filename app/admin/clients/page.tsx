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
import { IconPlus, IconEdit, IconTrash, IconDownload, IconCheck, IconX } from "@tabler/icons-react"

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
  navClouds: [],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: "IconSettings",
    },
  ],
  documents: [],
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

interface FacebookAccount {
  facebook_id: string
  account_id: string
  name: string
  status: string
  currency: string
  business_name: string | null
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Import state
  const [fbAccounts, setFbAccounts] = useState<FacebookAccount[]>([])
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [isFetchingAccounts, setIsFetchingAccounts] = useState(false)
  
  // Edit/Delete state
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

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
    } catch {
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
    } catch {
      setError('Network error creating client')
    }
  }

  // Fetch Facebook accounts
  const fetchFacebookAccounts = async () => {
    setIsFetchingAccounts(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin/facebook-accounts')
      const data = await response.json()
      
      if (data.success) {
        setFbAccounts(data.accounts)
        setIsImportDialogOpen(true)
      } else {
        setError(data.error || 'Failed to fetch Facebook accounts')
      }
    } catch {
      setError('Network error fetching Facebook accounts')
    } finally {
      setIsFetchingAccounts(false)
    }
  }

  // Handle import
  const handleImportClients = async () => {
    setIsImporting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/import-clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedAccounts: selectedAccounts.length > 0 ? selectedAccounts : undefined,
          importAll: selectedAccounts.length === 0
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Import completed: ${data.results.imported} imported, ${data.results.skipped} skipped`)
        setIsImportDialogOpen(false)
        setSelectedAccounts([])
        loadClients() // Refresh list
      } else {
        setError(data.error || 'Import failed')
      }
    } catch (error) {
      setError('Network error during import')
    } finally {
      setIsImporting(false)
    }
  }

  // Toggle account selection
  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  // Select all accounts
  const selectAllAccounts = () => {
    setSelectedAccounts(fbAccounts.map(acc => acc.facebook_id))
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedAccounts([])
  }

  // Handle edit client
  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      fb_ad_account_id: client.fb_ad_account_id,
      slug: client.slug
    })
    setIsEditDialogOpen(true)
  }

  // Handle update client
  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClient) return

    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/clients', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingClient.id,
          ...formData
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Client updated successfully')
        setIsEditDialogOpen(false)
        setEditingClient(null)
        setFormData({ name: '', fb_ad_account_id: '', slug: '' })
        loadClients() // Refresh list
      } else {
        setError(data.error || 'Failed to update client')
      }
    } catch (error) {
      setError('Network error updating client')
    }
  }

  // Handle delete client
  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete "${client.name}"? This will also delete all associated reports.`)) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/clients?id=${client.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Client deleted successfully')
        loadClients() // Refresh list
      } else {
        setError(data.error || 'Failed to delete client')
      }
    } catch (error) {
      setError('Network error deleting client')
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
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={fetchFacebookAccounts}
                disabled={isFetchingAccounts}
              >
                {isFetchingAccounts ? (
                  <>Loading...</>
                ) : (
                  <>
                    <IconDownload className="mr-2 h-4 w-4" />
                    Import from Facebook
                  </>
                )}
              </Button>
              
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
          </div>

          {/* Import Dialog */}
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import Clients from Facebook</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Select Facebook ad accounts to import as clients. Found {fbAccounts.length} accessible accounts.
                </p>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={selectAllAccounts}
                    disabled={isImporting}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearSelection}
                    disabled={isImporting}
                  >
                    Clear Selection
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedAccounts.length} of {fbAccounts.length} selected
                  </span>
                </div>

                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Account ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Business</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fbAccounts.map((account) => (
                        <TableRow key={account.facebook_id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedAccounts.includes(account.facebook_id)}
                              onChange={() => toggleAccountSelection(account.facebook_id)}
                              disabled={isImporting}
                              className="h-4 w-4"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell className="font-mono text-sm">{account.facebook_id}</TableCell>
                          <TableCell>
                            <Badge variant={account.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {account.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{account.currency}</TableCell>
                          <TableCell>{account.business_name || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    {selectedAccounts.length === 0 
                      ? "All accounts will be imported" 
                      : `${selectedAccounts.length} accounts selected for import`
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsImportDialogOpen(false)}
                      disabled={isImporting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleImportClients}
                      disabled={isImporting}
                    >
                      {isImporting ? (
                        <>Importing...</>
                      ) : (
                        <>
                          <IconDownload className="mr-2 h-4 w-4" />
                          Import {selectedAccounts.length === 0 ? 'All' : selectedAccounts.length} Clients
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Client Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Client</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateClient} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Client Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter client name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-fb_ad_account_id">Facebook Ad Account ID</Label>
                  <Input
                    id="edit-fb_ad_account_id"
                    value={formData.fb_ad_account_id}
                    onChange={(e) => setFormData({ ...formData, fb_ad_account_id: e.target.value })}
                    placeholder="act_123456789012345"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-slug">Slug</Label>
                  <Input
                    id="edit-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="client-slug"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Client
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditClient(client)}
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => handleDeleteClient(client)}
                            >
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
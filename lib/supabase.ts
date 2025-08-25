/**
 * Supabase Database Connection Utilities
 * 
 * Provides both public (anon) and admin (service role) clients
 * for different access patterns in the application
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Public client for client-side operations (RLS enforced)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)

// Database Types (based on the schema from ROADMAP.md)
export interface Client {
  id: number
  name: string
  fb_ad_account_id: string
  slug: string
  status: 'active' | 'inactive'
  created_at: string
}

export interface MonthlyReport {
  id: number
  client_id: number
  month_year: string // Format: '2025-01', '2025-02', etc.
  report_data: {
    campaigns: any[]
    demographics: any[]
    regional: any[]
    devices: any[]
    platforms: any[]
    hourly: any[]
    adLevel: any[]
    scraped_at: string
    date_range: {
      since: string
      until: string
    }
    month_identifier: string
  }
  scraped_at: string
}

export interface Admin {
  id: number
  email: string
  password_hash: string
  created_at: string
}

// Database helper functions
export const db = {
  // Clients
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async getClientBySlug(slug: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  async createClient(client: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert(client)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateClient(id: number, updates: Partial<Client>): Promise<Client> {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteClient(id: number): Promise<void> {
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Monthly Reports
  async getReportsByClient(clientId: number): Promise<MonthlyReport[]> {
    const { data, error } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('client_id', clientId)
      .order('month_year', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getReport(clientId: number, monthYear: string): Promise<MonthlyReport | null> {
    const { data, error } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('client_id', clientId)
      .eq('month_year', monthYear)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  async saveReport(report: Omit<MonthlyReport, 'id' | 'scraped_at'>): Promise<MonthlyReport> {
    const { data, error } = await supabaseAdmin
      .from('monthly_reports')
      .upsert({
        ...report,
        scraped_at: new Date().toISOString()
      }, {
        onConflict: 'client_id,month_year'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Admins (service role only)
  async getAdminByEmail(email: string): Promise<Admin | null> {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  async createAdmin(admin: Omit<Admin, 'id' | 'created_at'>): Promise<Admin> {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .insert(admin)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Utility functions
  async getAvailableMonths(clientId: number): Promise<string[]> {
    const { data, error } = await supabase
      .from('monthly_reports')
      .select('month_year')
      .eq('client_id', clientId)
      .order('month_year', { ascending: false })
    
    if (error) throw error
    return data?.map(r => r.month_year) || []
  }
}
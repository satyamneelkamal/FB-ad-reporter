import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date range for display
 */
export function formatDateRange(since: string, until: string): string {
  const sinceDate = new Date(since)
  const untilDate = new Date(until)
  
  return `${sinceDate.toLocaleDateString()} - ${untilDate.toLocaleDateString()}`
}

/**
 * Format month year for display
 * Input: '2025-01' Output: 'January 2025'
 */
export function formatMonthYear(monthYear: string): string {
  const [year, month] = monthYear.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
}

/**
 * Generate slug from name (for client URLs)
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

/**
 * Format currency values
 */
export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '$0.00'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(num)
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0%'
  
  return `${(num * 100).toFixed(2)}%`
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatLargeNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  
  return num.toString()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate month options for dropdowns
 */
export function getMonthOptions(monthYears: string[]): Array<{ value: string; label: string }> {
  return monthYears.map(monthYear => ({
    value: monthYear,
    label: formatMonthYear(monthYear)
  }))
}

/**
 * Calculate CTR (Click-Through Rate)
 */
export function calculateCTR(clicks: number | string, impressions: number | string): number {
  const clicksNum = typeof clicks === 'string' ? parseFloat(clicks) : clicks
  const impressionsNum = typeof impressions === 'string' ? parseFloat(impressions) : impressions
  
  if (impressionsNum === 0) return 0
  return clicksNum / impressionsNum
}

/**
 * Calculate CPC (Cost Per Click)
 */
export function calculateCPC(spend: number | string, clicks: number | string): number {
  const spendNum = typeof spend === 'string' ? parseFloat(spend) : spend
  const clicksNum = typeof clicks === 'string' ? parseFloat(clicks) : clicks
  
  if (clicksNum === 0) return 0
  return spendNum / clicksNum
}

/**
 * Calculate CPM (Cost Per Mille/Thousand Impressions)
 */
export function calculateCPM(spend: number | string, impressions: number | string): number {
  const spendNum = typeof spend === 'string' ? parseFloat(spend) : spend
  const impressionsNum = typeof impressions === 'string' ? parseFloat(impressions) : impressions
  
  if (impressionsNum === 0) return 0
  return (spendNum / impressionsNum) * 1000
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Check if string is valid Facebook Ad Account ID format
 */
export function isValidFacebookAdAccountId(id: string): boolean {
  // Facebook Ad Account IDs typically start with 'act_' followed by digits
  return /^act_\d+$/.test(id)
}

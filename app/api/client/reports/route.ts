import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { db } from '@/lib/supabase'
import { getStoredClientData, getClientAvailableMonths } from '@/lib/data-storage'

/**
 * Client Reports API
 * Provides access to monthly reports for authenticated clients
 * 
 * GET /api/client/reports - Get available months for client
 * GET /api/client/reports?month={month} - Get specific monthly report
 */

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you'd extract client ID from JWT token
    // For now, we'll use a query parameter or default to first client
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const clientSlug = searchParams.get('client') || 'demo-client'

    if (!month) {
      // Return available months for the client
      const result = await getClientAvailableMonths(clientSlug)
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        client: result.client,
        available_months: result.available_months
      })
    }

    // Return specific monthly report
    const result = await getStoredClientData(clientSlug, month)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      client: result.client,
      report: result.report,
      quality_summary: result.quality_summary
    })

  } catch (error) {
    console.error('Client reports API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve client reports'
    }, { status: 500 })
  }
}
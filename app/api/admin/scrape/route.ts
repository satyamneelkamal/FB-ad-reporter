import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { collectAllFacebookData } from '@/lib/facebook-api';
import { storeFacebookDataSeparated } from '@/lib/data-storage-separated';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { clientId, monthYear } = await request.json();

    if (!clientId || !monthYear) {
      return NextResponse.json(
        { error: 'Client ID and month/year are required' },
        { status: 400 }
      );
    }

    // Get client details
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if data already exists in separate tables
    const { data: existingCampaigns } = await supabaseAdmin
      .from('fb_campaigns')
      .select('id')
      .eq('client_id', clientId)
      .eq('month_year', monthYear)
      .limit(1);

    if (existingCampaigns && existingCampaigns.length > 0) {
      return NextResponse.json(
        { error: 'Data already exists for this month' },
        { status: 400 }
      );
    }

    // Parse month/year to create date range
    const [year, month] = monthYear.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const dateRange = {
      since: startDate.toISOString().split('T')[0],
      until: endDate.toISOString().split('T')[0]
    };

    try {
      // Collect Facebook data
      const reportData = await collectAllFacebookData(
        client.fb_ad_account_id,
        dateRange
      );

      // Store in separate normalized tables
      const storageResult = await storeFacebookDataSeparated(clientId, monthYear, reportData);

      if (!storageResult.success) {
        console.error('Database storage errors:', storageResult.errors);
        return NextResponse.json(
          { 
            error: 'Failed to save Facebook data',
            details: storageResult.errors.join(', ')
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: `Data collection completed! Successfully stored ${storageResult.recordsInserted} records across 6 normalized tables.`,
        summary: {
          totalRecords: storageResult.recordsInserted,
          dataTypes: 6,
          monthYear: monthYear,
          storage: 'separated_tables'
        }
      });

    } catch (apiError) {
      console.error('Facebook API error:', apiError);
      return NextResponse.json(
        { 
          error: 'Failed to collect Facebook data',
          details: apiError instanceof Error ? apiError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Scrape endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let query = supabaseAdmin
      .from('monthly_reports')
      .select(`
        id,
        month_year,
        scraped_at,
        clients (
          id,
          name,
          slug
        )
      `)
      .order('scraped_at', { ascending: false });

    // Filter by client if provided
    if (clientId) {
      query = query.eq('client_id', parseInt(clientId));
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scraping history' },
        { status: 500 }
      );
    }

    // Get summary statistics
    const { data: stats } = await supabaseAdmin
      .from('monthly_reports')
      .select('scraped_at')
      .gte('scraped_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    return NextResponse.json({
      reports,
      statistics: {
        totalReports: reports?.length || 0,
        reportsThisMonth: stats?.length || 0,
        lastScrapedAt: reports?.[0]?.scraped_at || null
      }
    });

  } catch (error) {
    console.error('Scrape status endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
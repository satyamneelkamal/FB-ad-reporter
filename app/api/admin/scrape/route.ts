import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { collectAllFacebookData } from '@/lib/facebook-api';

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

    // Check if report already exists
    const { data: existingReport } = await supabaseAdmin
      .from('monthly_reports')
      .select('id')
      .eq('client_id', clientId)
      .eq('month_year', monthYear)
      .single();

    if (existingReport) {
      return NextResponse.json(
        { error: 'Report already exists for this month' },
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

      // Store in database
      const { data: report, error: insertError } = await supabaseAdmin
        .from('monthly_reports')
        .insert({
          client_id: clientId,
          month_year: monthYear,
          report_data: reportData
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to save report data' },
          { status: 500 }
        );
      }

      // Calculate total records collected across all data types
      const totalRecords = (reportData.campaigns?.length || 0) +
                          (reportData.demographics?.length || 0) +
                          (reportData.regional?.length || 0) +
                          (reportData.devices?.length || 0) +
                          (reportData.platforms?.length || 0) +
                          (reportData.adLevel?.length || 0);

      return NextResponse.json({
        message: `Data collection completed! Successfully collected ${totalRecords} records from Facebook Ads API.`,
        reportId: report.id,
        summary: {
          totalRecords,
          dataTypes: 6,
          monthYear: monthYear
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
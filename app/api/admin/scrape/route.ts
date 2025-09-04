import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { collectAndStoreClientData } from '@/lib/data-storage';
import { distributeReportData } from '@/lib/data-distribution';

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

    try {
      console.log(`🚀 Starting data collection for client ${client.name} (ID: ${client.id})`);
      console.log(`📅 Target month: ${monthYear}`);
      
      // Use the correct data collection and storage function
      const result = await collectAndStoreClientData(client, monthYear);
      
      console.log(`📊 Data collection result:`, {
        success: result.success,
        error: result.error,
        totalRecords: result.storage_summary?.total_records,
        monthYear: result.storage_summary?.month_year,
        qualityScore: result.quality_report?.overall_score
      });

      if (!result.success) {
        console.error(`❌ Data collection failed for ${client.name}:`, result.error);
        return NextResponse.json(
          { 
            error: 'Failed to collect and store Facebook data',
            details: result.error || 'Unknown error',
            debug: {
              client_id: client.id,
              client_name: client.name,
              month_year: monthYear,
              validation_result: result.validation_result,
              storage_summary: result.storage_summary
            }
          },
          { status: 500 }
        );
      }

      console.log(`✅ Data collection successful for ${client.name}`);
      
      // Step 2: Distribute data to separated tables
      console.log(`📊 Distributing data to separated tables...`);
      const distributionResult = await distributeReportData(client.id, result.storage_summary?.month_year || monthYear);
      
      if (!distributionResult.success) {
        console.warn(`⚠️ Data distribution had errors:`, distributionResult.errors);
        // Don't fail the whole operation, just log the warning
      } else {
        console.log(`✅ Data distributed to ${distributionResult.tablesUpdated.length} tables: ${distributionResult.tablesUpdated.join(', ')}`);
      }

      return NextResponse.json({
        message: `Data collection and distribution completed successfully for ${client.name}!`,
        summary: {
          totalRecords: result.storage_summary?.total_records || 0,
          monthYear: result.storage_summary?.month_year || monthYear,
          qualityScore: result.quality_report?.overall_score || 0,
          storageTime: result.storage_summary?.storage_time_ms || 0,
          storage: 'monthly_reports',
          distribution: {
            recordsDistributed: distributionResult.recordsDistributed,
            tablesUpdated: distributionResult.tablesUpdated,
            success: distributionResult.success
          }
        },
        debug: {
          client_id: client.id,
          validation_warnings: result.validation_result?.warnings?.length || 0,
          data_transformations: result.transformations || 'none',
          distribution_errors: distributionResult.errors
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
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.log('🔍 Testing database connection and permissions...');

    // Test 1: Check if we can read from monthly_reports
    const { data: existingReports, error: readError } = await supabaseAdmin
      .from('monthly_reports')
      .select('id, client_id, month_year, scraped_at')
      .limit(5);

    if (readError) {
      return NextResponse.json({
        success: false,
        error: 'Cannot read from monthly_reports table',
        details: readError.message
      });
    }

    // Test 2: Try to insert a test record
    const testReport = {
      client_id: 999, // Use a non-existent client ID for testing
      month_year: 'TEST-2024',
      report_data: {
        test: true,
        campaigns: [],
        demographics: [],
        collection_summary: { total_records: 0 }
      }
    };

    const { data: insertedReport, error: insertError } = await supabaseAdmin
      .from('monthly_reports')
      .upsert(testReport, { onConflict: 'client_id,month_year' })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Cannot insert into monthly_reports table',
        details: insertError.message,
        debug: { testReport }
      });
    }

    // Test 3: Clean up the test record
    const { error: deleteError } = await supabaseAdmin
      .from('monthly_reports')
      .delete()
      .eq('client_id', 999)
      .eq('month_year', 'TEST-2024');

    if (deleteError) {
      console.warn('Warning: Could not clean up test record:', deleteError);
    }

    // Test 4: Check clients table
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id, name, fb_ad_account_id')
      .limit(5);

    if (clientsError) {
      return NextResponse.json({
        success: false,
        error: 'Cannot read from clients table',
        details: clientsError.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection and permissions working correctly',
      debug: {
        existing_reports: existingReports?.length || 0,
        test_insert: 'SUCCESS',
        test_cleanup: deleteError ? 'FAILED' : 'SUCCESS',
        clients_found: clients?.length || 0,
        sample_clients: clients?.map(c => ({ id: c.id, name: c.name })) || []
      }
    });

  } catch (error) {
    console.error('🔍 Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
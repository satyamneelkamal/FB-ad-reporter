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

    // Get client details
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ 
        error: 'Client not found',
        debug: { clientError, clientId }
      }, { status: 404 });
    }

    console.log('🔍 DEBUG: Starting data collection test...');
    console.log('🔍 Client:', client);
    console.log('🔍 Month/Year:', monthYear);

    // Test Facebook API collection first
    const dateRange = {
      since: `${monthYear}-01`,
      until: `${monthYear}-31`
    };

    console.log('🔍 Testing Facebook API collection...');
    const reportData = await collectAllFacebookData(client.fb_ad_account_id, dateRange);
    
    console.log('🔍 Facebook API Response Summary:');
    console.log('🔍 - Campaigns:', reportData.campaigns?.length || 0);
    console.log('🔍 - Demographics:', reportData.demographics?.length || 0);
    console.log('🔍 - Regional:', reportData.regional?.length || 0);
    console.log('🔍 - Devices:', reportData.devices?.length || 0);
    console.log('🔍 - Platforms:', reportData.platforms?.length || 0);
    console.log('🔍 - Ad Level:', reportData.adLevel?.length || 0);
    console.log('🔍 - Total Records:', reportData.collection_summary?.total_records || 0);

    // Test direct database insertion
    console.log('🔍 Testing direct database insertion...');
    
    if (reportData.campaigns && reportData.campaigns.length > 0) {
      console.log('🔍 Testing campaign insertion...');
      const testCampaign = {
        client_id: clientId,
        month_year: monthYear,
        campaign_id: reportData.campaigns[0].campaign_id + '_debug_test',
        campaign_name: 'DEBUG TEST CAMPAIGN',
        spend: 1.00,
        scraped_at: new Date().toISOString()
      };

      const { error: insertError, count } = await supabaseAdmin
        .from('fb_campaigns')
        .upsert([testCampaign], { 
          onConflict: 'client_id,month_year,campaign_id',
          count: 'exact'
        });

      if (insertError) {
        console.error('🔍 Direct insertion failed:', insertError);
        return NextResponse.json({
          success: false,
          error: 'Database insertion test failed',
          details: insertError.message,
          debug: {
            testCampaign,
            insertError
          }
        });
      } else {
        console.log('🔍 Direct insertion succeeded, count:', count);
        
        // Clean up test record
        await supabaseAdmin
          .from('fb_campaigns')
          .delete()
          .eq('client_id', clientId)
          .eq('month_year', monthYear)
          .eq('campaign_id', testCampaign.campaign_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Debug test completed successfully',
      debug: {
        client: {
          id: client.id,
          name: client.name,
          fb_ad_account_id: client.fb_ad_account_id
        },
        facebook_api: {
          total_records: reportData.collection_summary?.total_records || 0,
          successful_endpoints: reportData.collection_summary?.successful_endpoints || 0,
          failed_endpoints: reportData.collection_summary?.failed_endpoints || [],
          campaigns: reportData.campaigns?.length || 0,
          demographics: reportData.demographics?.length || 0,
          regional: reportData.regional?.length || 0,
          devices: reportData.devices?.length || 0,
          platforms: reportData.platforms?.length || 0,
          adLevel: reportData.adLevel?.length || 0
        },
        database_test: 'Passed'
      }
    });

  } catch (error) {
    console.error('🔍 Debug test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      debug: { error }
    }, { status: 500 });
  }
}
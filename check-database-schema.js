/**
 * Database Schema Verification Script
 * 
 * Checks if the separated Facebook data tables exist in Supabase
 * and creates them if they don't exist
 */

const { createClient } = require('@supabase/supabase-js');

// Environment setup - REPLACE WITH YOUR ACTUAL VALUES
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

if (!supabaseUrl || !supabaseServiceKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.error('❌ Missing environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TABLE_SCHEMAS = {
  fb_campaigns: `
    CREATE TABLE IF NOT EXISTS fb_campaigns (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      month_year TEXT NOT NULL,
      campaign_id TEXT NOT NULL,
      campaign_name TEXT,
      adset_id TEXT,
      adset_name TEXT,
      objective TEXT,
      optimization_goal TEXT,
      buying_type TEXT,
      attribution_setting TEXT,
      impressions INTEGER,
      reach INTEGER,
      frequency DECIMAL(8,4),
      clicks INTEGER,
      unique_clicks INTEGER,
      cpm DECIMAL(8,4),
      cpc DECIMAL(8,4),
      cpp DECIMAL(8,4),
      ctr DECIMAL(8,6),
      unique_ctr DECIMAL(8,6),
      cost_per_unique_click DECIMAL(8,4),
      spend DECIMAL(10,2),
      inline_link_clicks INTEGER,
      inline_link_click_ctr DECIMAL(8,6),
      outbound_clicks INTEGER,
      outbound_clicks_ctr DECIMAL(8,6),
      actions JSONB,
      action_values JSONB,
      conversions JSONB,
      conversion_values JSONB,
      cost_per_conversion JSONB,
      cost_per_action_type JSONB,
      purchase_roas JSONB,
      website_purchase_roas JSONB,
      mobile_app_purchase_roas JSONB,
      unique_inline_link_clicks INTEGER,
      unique_inline_link_click_ctr DECIMAL(8,6),
      unique_outbound_clicks INTEGER,
      unique_outbound_clicks_ctr DECIMAL(8,6),
      cost_per_unique_outbound_click DECIMAL(8,4),
      cost_per_unique_inline_link_click DECIMAL(8,4),
      date_start DATE,
      date_stop DATE,
      scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(client_id, month_year, campaign_id)
    );
  `,

  fb_demographics: `
    CREATE TABLE IF NOT EXISTS fb_demographics (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      month_year TEXT NOT NULL,
      age TEXT,
      gender TEXT,
      impressions INTEGER,
      reach INTEGER,
      frequency DECIMAL(8,4),
      clicks INTEGER,
      unique_clicks INTEGER,
      cpm DECIMAL(8,4),
      cpc DECIMAL(8,4),
      cpp DECIMAL(8,4),
      ctr DECIMAL(8,6),
      unique_ctr DECIMAL(8,6),
      cost_per_unique_click DECIMAL(8,4),
      spend DECIMAL(10,2),
      inline_link_clicks INTEGER,
      inline_link_click_ctr DECIMAL(8,6),
      outbound_clicks INTEGER,
      outbound_clicks_ctr DECIMAL(8,6),
      actions JSONB,
      action_values JSONB,
      conversions JSONB,
      conversion_values JSONB,
      cost_per_conversion JSONB,
      cost_per_action_type JSONB,
      purchase_roas JSONB,
      website_purchase_roas JSONB,
      mobile_app_purchase_roas JSONB,
      unique_inline_link_clicks INTEGER,
      unique_inline_link_click_ctr DECIMAL(8,6),
      unique_outbound_clicks INTEGER,
      unique_outbound_clicks_ctr DECIMAL(8,6),
      cost_per_unique_outbound_click DECIMAL(8,4),
      cost_per_unique_inline_link_click DECIMAL(8,4),
      date_start DATE,
      date_stop DATE,
      scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(client_id, month_year, age, gender)
    );
  `,

  fb_regional: `
    CREATE TABLE IF NOT EXISTS fb_regional (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      month_year TEXT NOT NULL,
      region TEXT,
      account_id TEXT,
      account_name TEXT,
      objective TEXT,
      optimization_goal TEXT,
      buying_type TEXT,
      attribution_setting TEXT,
      impressions INTEGER,
      reach INTEGER,
      frequency DECIMAL(8,4),
      clicks INTEGER,
      unique_clicks INTEGER,
      cpm DECIMAL(8,4),
      cpc DECIMAL(8,4),
      cpp DECIMAL(8,4),
      ctr DECIMAL(8,6),
      unique_ctr DECIMAL(8,6),
      cost_per_unique_click DECIMAL(8,4),
      spend DECIMAL(10,2),
      inline_link_clicks INTEGER,
      inline_link_click_ctr DECIMAL(8,6),
      outbound_clicks INTEGER,
      outbound_clicks_ctr DECIMAL(8,6),
      actions JSONB,
      action_values JSONB,
      conversions JSONB,
      conversion_values JSONB,
      cost_per_conversion JSONB,
      cost_per_action_type JSONB,
      purchase_roas JSONB,
      website_purchase_roas JSONB,
      mobile_app_purchase_roas JSONB,
      unique_inline_link_clicks INTEGER,
      unique_inline_link_click_ctr DECIMAL(8,6),
      unique_outbound_clicks INTEGER,
      unique_outbound_clicks_ctr DECIMAL(8,6),
      cost_per_unique_outbound_click DECIMAL(8,4),
      cost_per_unique_inline_link_click DECIMAL(8,4),
      date_start DATE,
      date_stop DATE,
      scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(client_id, month_year, region)
    );
  `,

  fb_devices: `
    CREATE TABLE IF NOT EXISTS fb_devices (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      month_year TEXT NOT NULL,
      device_platform TEXT,
      impressions INTEGER,
      reach INTEGER,
      frequency DECIMAL(8,4),
      clicks INTEGER,
      unique_clicks INTEGER,
      cpm DECIMAL(8,4),
      cpc DECIMAL(8,4),
      cpp DECIMAL(8,4),
      ctr DECIMAL(8,6),
      unique_ctr DECIMAL(8,6),
      cost_per_unique_click DECIMAL(8,4),
      spend DECIMAL(10,2),
      inline_link_clicks INTEGER,
      inline_link_click_ctr DECIMAL(8,6),
      outbound_clicks INTEGER,
      outbound_clicks_ctr DECIMAL(8,6),
      actions JSONB,
      action_values JSONB,
      conversions JSONB,
      conversion_values JSONB,
      cost_per_conversion JSONB,
      cost_per_action_type JSONB,
      purchase_roas JSONB,
      website_purchase_roas JSONB,
      mobile_app_purchase_roas JSONB,
      unique_inline_link_clicks INTEGER,
      unique_inline_link_click_ctr DECIMAL(8,6),
      unique_outbound_clicks INTEGER,
      unique_outbound_clicks_ctr DECIMAL(8,6),
      cost_per_unique_outbound_click DECIMAL(8,4),
      cost_per_unique_inline_link_click DECIMAL(8,4),
      date_start DATE,
      date_stop DATE,
      scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(client_id, month_year, device_platform)
    );
  `,

  fb_platforms: `
    CREATE TABLE IF NOT EXISTS fb_platforms (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      month_year TEXT NOT NULL,
      publisher_platform TEXT,
      platform_position TEXT,
      impressions INTEGER,
      reach INTEGER,
      frequency DECIMAL(8,4),
      clicks INTEGER,
      unique_clicks INTEGER,
      cpm DECIMAL(8,4),
      cpc DECIMAL(8,4),
      cpp DECIMAL(8,4),
      ctr DECIMAL(8,6),
      unique_ctr DECIMAL(8,6),
      cost_per_unique_click DECIMAL(8,4),
      spend DECIMAL(10,2),
      inline_link_clicks INTEGER,
      inline_link_click_ctr DECIMAL(8,6),
      outbound_clicks INTEGER,
      outbound_clicks_ctr DECIMAL(8,6),
      actions JSONB,
      action_values JSONB,
      conversions JSONB,
      conversion_values JSONB,
      cost_per_conversion JSONB,
      cost_per_action_type JSONB,
      purchase_roas JSONB,
      website_purchase_roas JSONB,
      mobile_app_purchase_roas JSONB,
      unique_inline_link_clicks INTEGER,
      unique_inline_link_click_ctr DECIMAL(8,6),
      unique_outbound_clicks INTEGER,
      unique_outbound_clicks_ctr DECIMAL(8,6),
      cost_per_unique_outbound_click DECIMAL(8,4),
      cost_per_unique_inline_link_click DECIMAL(8,4),
      date_start DATE,
      date_stop DATE,
      scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(client_id, month_year, publisher_platform, platform_position)
    );
  `,

  fb_ad_level: `
    CREATE TABLE IF NOT EXISTS fb_ad_level (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      month_year TEXT NOT NULL,
      campaign_id TEXT,
      campaign_name TEXT,
      adset_id TEXT,
      adset_name TEXT,
      ad_id TEXT NOT NULL,
      ad_name TEXT,
      objective TEXT,
      optimization_goal TEXT,
      buying_type TEXT,
      attribution_setting TEXT,
      impressions INTEGER,
      reach INTEGER,
      frequency DECIMAL(8,4),
      clicks INTEGER,
      unique_clicks INTEGER,
      cpm DECIMAL(8,4),
      cpc DECIMAL(8,4),
      cpp DECIMAL(8,4),
      ctr DECIMAL(8,6),
      unique_ctr DECIMAL(8,6),
      cost_per_unique_click DECIMAL(8,4),
      spend DECIMAL(10,2),
      inline_link_clicks INTEGER,
      inline_link_click_ctr DECIMAL(8,6),
      outbound_clicks INTEGER,
      outbound_clicks_ctr DECIMAL(8,6),
      actions JSONB,
      action_values JSONB,
      conversions JSONB,
      conversion_values JSONB,
      cost_per_conversion JSONB,
      cost_per_action_type JSONB,
      purchase_roas JSONB,
      website_purchase_roas JSONB,
      mobile_app_purchase_roas JSONB,
      unique_inline_link_clicks INTEGER,
      unique_inline_link_click_ctr DECIMAL(8,6),
      unique_outbound_clicks INTEGER,
      unique_outbound_clicks_ctr DECIMAL(8,6),
      cost_per_unique_outbound_click DECIMAL(8,4),
      cost_per_unique_inline_link_click DECIMAL(8,4),
      date_start DATE,
      date_stop DATE,
      scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(client_id, month_year, ad_id)
    );
  `
};

async function checkAndCreateTables() {
  console.log('🔍 Checking Supabase database schema...');
  console.log('📊 Database URL:', supabaseUrl);
  
  const requiredTables = Object.keys(TABLE_SCHEMAS);
  const results = {};
  
  try {
    // First, check which tables exist by trying to query them
    console.log('\n1️⃣ Checking existing tables:');
    
    for (const tableName of requiredTables) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('id', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table ${tableName}: DOES NOT EXIST - ${error.message}`);
          results[tableName] = { exists: false, error: error.message };
        } else {
          console.log(`✅ Table ${tableName}: EXISTS (${count || 0} records)`);
          results[tableName] = { exists: true, recordCount: count || 0 };
        }
      } catch (err) {
        console.log(`❌ Table ${tableName}: ERROR - ${err.message}`);
        results[tableName] = { exists: false, error: err.message };
      }
    }

    // Check core tables too
    console.log('\n2️⃣ Checking core tables:');
    const coreTables = ['clients', 'monthly_reports', 'admins'];
    
    for (const tableName of coreTables) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('id', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Core table ${tableName}: ISSUE - ${error.message}`);
        } else {
          console.log(`✅ Core table ${tableName}: OK (${count || 0} records)`);
        }
      } catch (err) {
        console.log(`❌ Core table ${tableName}: ERROR - ${err.message}`);
      }
    }

    // Create missing tables
    console.log('\n3️⃣ Creating missing tables:');
    const missingTables = Object.entries(results)
      .filter(([_, info]) => !info.exists)
      .map(([tableName, _]) => tableName);

    if (missingTables.length === 0) {
      console.log('🎉 All separated tables already exist!');
    } else {
      console.log(`🚧 Creating ${missingTables.length} missing tables...`);
      
      for (const tableName of missingTables) {
        try {
          console.log(`Creating table: ${tableName}`);
          const { error } = await supabase.rpc('exec_sql', {
            sql: TABLE_SCHEMAS[tableName]
          });

          if (error) {
            console.log(`❌ Failed to create ${tableName}: ${error.message}`);
          } else {
            console.log(`✅ Successfully created ${tableName}`);
          }
        } catch (err) {
          console.log(`❌ Error creating ${tableName}: ${err.message}`);
          
          // Try alternative approach using direct SQL execution
          try {
            const { data, error: sqlError } = await supabase
              .from('_realtime_schema_migrations')
              .select('*')
              .limit(1);
            
            console.log(`ℹ️  Alternative SQL execution not available for ${tableName}`);
          } catch (altErr) {
            console.log(`ℹ️  Need manual table creation for ${tableName}`);
          }
        }
      }
    }

    // Final verification
    console.log('\n4️⃣ Final verification:');
    for (const tableName of requiredTables) {
      try {
        const { error, count } = await supabase
          .from(tableName)
          .select('id', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${tableName}: Still missing`);
        } else {
          console.log(`✅ ${tableName}: Ready (${count || 0} records)`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Still has issues`);
      }
    }

    // Check RLS policies
    console.log('\n5️⃣ Row Level Security (RLS) Check:');
    try {
      // Try to insert a test record with service role (should work if RLS allows it)
      const testClientId = 999999; // Non-existent client
      const testData = {
        client_id: testClientId,
        month_year: '2025-99',
        campaign_id: 'test_campaign',
        scraped_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('fb_campaigns')
        .insert(testData)
        .select()
        .single();

      if (insertError) {
        if (insertError.message.includes('foreign key')) {
          console.log('✅ RLS: Service role can insert (foreign key constraint as expected)');
        } else {
          console.log(`⚠️  RLS: Insert blocked - ${insertError.message}`);
        }
      } else {
        console.log('✅ RLS: Service role can insert successfully');
        // Clean up test record
        await supabase
          .from('fb_campaigns')
          .delete()
          .eq('client_id', testClientId)
          .eq('month_year', '2025-99');
      }
    } catch (rlsErr) {
      console.log(`❌ RLS Check failed: ${rlsErr.message}`);
    }

    console.log('\n📊 Summary:');
    console.log(`- Required tables: ${requiredTables.length}`);
    console.log(`- Existing tables: ${Object.values(results).filter(r => r.exists).length}`);
    console.log(`- Missing tables: ${Object.values(results).filter(r => !r.exists).length}`);
    console.log('\n✅ Database schema check complete!');

  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Run the check
checkAndCreateTables()
  .then(() => {
    console.log('\n🎯 Next steps:');
    console.log('1. If tables are missing, create them manually in Supabase Dashboard');
    console.log('2. Test data collection with admin panel');
    console.log('3. Check separated table data population');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
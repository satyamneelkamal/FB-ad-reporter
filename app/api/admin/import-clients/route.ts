import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { db } from '@/lib/supabase';

/**
 * Generate a URL-safe slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[-\s]+/g, '-') // Replace spaces and hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Ensure slug is unique by appending numbers if needed
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    // Check if slug exists by trying to get client by slug
    const existing = await db.getClientBySlug(slug);

    if (!existing) {
      return slug; // Slug is unique
    }

    // Try with a number suffix
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { selectedAccounts, importAll = false } = await request.json();

    // Fetch all accessible Facebook ad accounts using the same method as facebook-accounts endpoint
    console.log('Fetching all Facebook ad accounts for import...');
    
    let accountsToImport = [];
    
    try {
      const url = `https://graph.facebook.com/v20.0/me/adaccounts?access_token=${process.env.FACEBOOK_ACCESS_TOKEN}&fields=id,name&limit=100`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Successfully fetched ${data.data?.length || 0} accounts for import`);
        
        accountsToImport = data.data.map((account: any) => ({
          id: account.id,
          account_id: account.id.replace('act_', ''),
          name: account.name || `Account ${account.id.replace('act_', '')}`,
          account_status: 'ACTIVE',
          currency: 'USD',
          business: null
        }));
      } else {
        const errorData = await response.json();
        console.error('Facebook API error during import:', errorData.error?.message);
        return NextResponse.json({
          error: 'Failed to fetch Facebook ad accounts for import',
          details: errorData.error?.message || 'Unknown Facebook API error'
        }, { status: 500 });
      }
    } catch (error) {
      console.error('Error fetching Facebook accounts for import:', error);
      return NextResponse.json({
        error: 'Network error fetching Facebook accounts',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Filter accounts if specific ones were selected
    if (!importAll && selectedAccounts && selectedAccounts.length > 0) {
      accountsToImport = accountsToImport.filter((account: any) => 
        selectedAccounts.includes(account.id)
      );
    }

    const importResults = {
      imported: [] as any[],
      skipped: [] as any[],
      errors: [] as any[]
    };

    // Process each account
    for (const account of accountsToImport) {
      try {
        // Check if client already exists
        const clients = await db.getClients();
        const existingClient = clients.find(c => c.fb_ad_account_id === account.id);

        if (existingClient) {
          importResults.skipped.push({
            facebook_id: account.id,
            account_name: account.name,
            reason: 'Client already exists',
            existing_client: existingClient
          });
          continue; // Skip to next account
        }

        // Generate client name and slug
        const clientName = account.name || `Account ${account.account_id}`;
        let baseSlug = generateSlug(clientName);
        
        // Fallback slug if name generates empty slug
        if (!baseSlug) {
          baseSlug = `account-${account.account_id}`;
        }

        const uniqueSlug = await ensureUniqueSlug(baseSlug);

        // Create client record using db helper
        const newClient = await db.createClient({
          name: clientName,
          fb_ad_account_id: account.id,
          slug: uniqueSlug,
          status: account.account_status === 'ACTIVE' ? 'active' : 'inactive'
        });

        importResults.imported.push({
          facebook_id: account.id,
          account_name: account.name,
          client_id: newClient.id,
          client_name: newClient.name,
          slug: newClient.slug
        });

      } catch (error) {
        importResults.errors.push({
          facebook_id: account.id,
          account_name: account.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${importResults.imported.length} imported, ${importResults.skipped.length} skipped, ${importResults.errors.length} errors`,
      results: {
        total_processed: accountsToImport.length,
        imported: importResults.imported.length,
        skipped: importResults.skipped.length,
        errors: importResults.errors.length
      },
      details: importResults
    });

  } catch (error) {
    console.error('Import clients error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
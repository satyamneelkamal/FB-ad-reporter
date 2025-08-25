import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting facebook-accounts endpoint...');
    // Verify admin authentication
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.log('Admin authenticated successfully');

    // Try to fetch all accessible Facebook ad accounts first
    console.log('Attempting to fetch all Facebook ad accounts...');
    
    let accounts = [];
    
    try {
      const url = `https://graph.facebook.com/v20.0/me/adaccounts?access_token=${process.env.FACEBOOK_ACCESS_TOKEN}&fields=id,name&limit=100`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Successfully fetched ${data.data?.length || 0} accounts from Facebook API`);
        
        accounts = data.data.map((account: any) => ({
          facebook_id: account.id,
          account_id: account.id.replace('act_', ''),
          name: account.name || `Account ${account.id.replace('act_', '')}`,
          status: 'ACTIVE',
          currency: 'USD',
          business_name: null,
        }));
      } else {
        const errorData = await response.json();
        console.log('Facebook API error, falling back to known accounts:', errorData.error?.message);
        
        // Fallback to known accessible accounts
        const knownAccountIds = [
          'act_555167645017860', // From working N8N workflow
        ];
        
        const validatedAccounts = [];
        
        for (const accountId of knownAccountIds) {
          try {
            const accountUrl = `https://graph.facebook.com/v20.0/${accountId}?access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`;
            const accountResponse = await fetch(accountUrl);
            
            if (accountResponse.ok) {
              const accountData = await accountResponse.json();
              validatedAccounts.push({
                facebook_id: accountData.id,
                account_id: accountData.account_id || accountData.id.replace('act_', ''),
                name: `Account ${accountData.account_id || accountData.id.replace('act_', '')}`,
                status: 'ACTIVE',
                currency: 'USD',
                business_name: null,
              });
            }
          } catch (error) {
            console.error(`Error validating account ${accountId}:`, error);
          }
        }
        
        accounts = validatedAccounts;
      }
    } catch (error) {
      console.error('Error fetching Facebook accounts:', error);
      accounts = [];
    }

    return NextResponse.json({
      success: true,
      accounts,
      total: accounts.length,
      message: `Found ${accounts.length} accessible Facebook ad accounts`
    });

  } catch (error) {
    console.error('Facebook accounts fetch error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
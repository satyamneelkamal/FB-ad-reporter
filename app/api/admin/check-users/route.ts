import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Checking all users in Supabase Auth...');

    // List all Supabase Auth users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to list users',
        details: authError.message
      }, { status: 500 });
    }

    // Also check admin table
    const { data: admins, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('id, email, created_at');

    // And clients table
    const { data: clients, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, name, slug, status');

    return NextResponse.json({
      success: true,
      summary: {
        supabase_auth_users: authUsers?.users?.length || 0,
        admin_users: admins?.length || 0,
        clients: clients?.length || 0
      },
      users: {
        supabase_auth: authUsers?.users?.map(user => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          confirmed_at: user.confirmed_at,
          last_sign_in_at: user.last_sign_in_at
        })) || [],
        admins: admins?.map(admin => ({
          id: admin.id,
          email: admin.email,
          created_at: admin.created_at
        })) || [],
        clients: clients?.map(client => ({
          id: client.id,
          name: client.name,
          slug: client.slug,
          status: client.status
        })) || []
      }
    });

  } catch (error) {
    console.error('🔍 Check users error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (action === 'create') {
      if (!email || !password) {
        return NextResponse.json({
          error: 'Email and password are required'
        }, { status: 400 });
      }

      console.log(`🔧 Creating Supabase Auth user: ${email}`);

      // Create user in Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          role: 'client',
          created_by: 'admin'
        }
      });

      if (authError) {
        console.error('Failed to create auth user:', authError);
        return NextResponse.json({
          success: false,
          error: 'Failed to create user account',
          details: authError.message
        }, { status: 500 });
      }

      console.log(`✅ Created Supabase Auth user:`, {
        id: authUser.user?.id,
        email: authUser.user?.email,
        confirmed_at: authUser.user?.confirmed_at
      });

      return NextResponse.json({
        success: true,
        message: `Successfully created user account for ${email}`,
        user: {
          id: authUser.user?.id,
          email: authUser.user?.email,
          role: 'client'
        }
      });

    } else if (action === 'test-login') {
      if (!email || !password) {
        return NextResponse.json({
          error: 'Email and password are required'
        }, { status: 400 });
      }

      console.log(`🧪 Testing login for: ${email}`);

      // Test login with provided credentials
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        return NextResponse.json({
          success: false,
          error: 'Login test failed',
          details: authError?.message || 'No user returned'
        });
      }

      return NextResponse.json({
        success: true,
        message: `Login test successful for ${email}`,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          last_sign_in_at: authData.user.last_sign_in_at
        }
      });

    } else {
      return NextResponse.json({
        error: 'Invalid action. Use "create" or "test-login"'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('🔧 User management error:', error);
    return NextResponse.json({
      success: false,
      error: 'User management operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
/**
 * Create Raghvir User via Supabase Admin
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createRaghvirUser() {
  try {
    console.log('Creating Raghvir user...')
    
    // Create user via Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'raghvir@fotoplane.com',
      password: 'Fotoplane@1',
      email_confirm: true,
      user_metadata: {
        name: 'Raghvir Rara'
      }
    })
    
    if (error) {
      console.error('Error creating user:', error)
      return
    }
    
    console.log('✅ User created successfully:', {
      id: data.user.id,
      email: data.user.email,
      confirmed: data.user.email_confirmed_at
    })
    
    // Link to client record
    const { error: updateError } = await supabase
      .from('clients')
      .update({ user_id: data.user.id })
      .eq('id', 11)
    
    if (updateError) {
      console.error('Error linking client:', updateError)
      return
    }
    
    console.log('✅ User linked to client ID 11 (Raghvir Rara)')
    
  } catch (error) {
    console.error('Failed:', error.message)
  }
}

createRaghvirUser()
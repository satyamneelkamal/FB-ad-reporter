/**
 * Fix client-user relationship
 * Links the client record to the Supabase Auth user
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixClientUserLink() {
  console.log('🔗 Fixing client-user relationship...')
  
  try {
    // Get the client record for ID 9
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', 9)
      .single()

    if (clientError) {
      console.error('❌ Error getting client:', clientError)
      return
    }

    console.log('📊 Current client record:', {
      id: client.id,
      name: client.name,
      slug: client.slug,
      user_id: client.user_id
    })

    // Update the client record with the correct user_id
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update({
        user_id: 'efd82a79-d304-4bdd-815a-8e73765bee1d'
      })
      .eq('id', 9)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating client:', updateError)
      return
    }

    console.log('✅ Client updated successfully:', {
      id: updatedClient.id,
      name: updatedClient.name,
      slug: updatedClient.slug,
      user_id: updatedClient.user_id
    })

    // Verify the relationship
    const { data: verifyClient, error: verifyError } = await supabase
      .from('clients')
      .select('id, name, slug, status, user_id')
      .eq('user_id', 'efd82a79-d304-4bdd-815a-8e73765bee1d')
      .eq('status', 'active')
      .single()

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
      return
    }

    console.log('✅ Verification successful - client-user link established:', verifyClient)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

fixClientUserLink()
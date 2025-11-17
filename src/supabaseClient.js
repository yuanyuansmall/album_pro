import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Missing Supabase environment variables! Please ensure .env.local contains:\n' +
    'REACT_APP_SUPABASE_URL=<your-url>\n' +
    'REACT_APP_SUPABASE_ANON_KEY=<your-key>'
  )
  throw new Error('Supabase configuration is incomplete')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)



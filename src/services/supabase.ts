import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase = url && key ? createClient(url, key) : null
export async function ensureAnonymousSession() {
  if (!supabase) throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY')
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!data.session) {
    const signed = await supabase.auth.signInAnonymously()
    if (signed.error) throw signed.error
  }
  return supabase
}

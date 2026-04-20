import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://znvhaimqojdrmhggiwjw.supabase.co';
const supabaseAnonKey = 'sb_publishable_fTYUQjy8lgnevCA_Wqu7aQ_ZenfgB30';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: undefined,
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

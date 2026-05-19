import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://leuixjdpqlqqzsdfomoa.supabase.co';
const supabaseAnonKey = 'sb_publishable_eIIOHNndOD-ONir_SPFG3Q_ziPuZl0g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

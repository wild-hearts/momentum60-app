const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://ousyawhlmfktommyrrnw.supabase.co", "sb_publishable_TjOAeYtm5De9sqm0Dnh4Ew_mtVD-S47");

supabase.from('custom_rules').select('*').then(console.log).catch(console.error);

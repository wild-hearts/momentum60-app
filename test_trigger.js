const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://ousyawhlmfktommyrrnw.supabase.co", "sb_publishable_TjOAeYtm5De9sqm0Dnh4Ew_mtVD-S47");

// Since we only have the anon key, we can't query pg_trigger directly.
// But we can check if inserting to auth.users throws an error.
// We can't insert into auth.users directly.

// Wait, the error is caught by `signUp` try/catch block.
// Does gotrue-js hit PostgREST when you do `signUp`? No.
// But if there is a Postgres Function hooked to an Auth Hook, and that function fails, Auth returns the error!

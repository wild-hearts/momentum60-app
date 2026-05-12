const { GoTrueClient } = require('@supabase/gotrue-js');

const auth = new GoTrueClient({
  url: 'https://ousyawhlmfktommyrrnw.supabase.co/auth/v1',
  headers: {
    apikey: 'sb_publishable_TjOAeYtm5De9sqm0Dnh4Ew_mtVD-S47',
  },
});

auth.signUp({
  email: 'test@example.com',
  password: 'Password123!',
}).then(res => console.log('Success:', res)).catch(err => console.log('Error:', err.message));

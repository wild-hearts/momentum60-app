const url = "https://ousyawhlmfktommyrrnw.supabase.co/auth/v1/signup";
const key = "sb_publishable_TjOAeYtm5De9sqm0Dnh4Ew_mtVD-S47";

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "apikey": key,
  },
  body: JSON.stringify({
    email: "testuser123456789@example.com",
    password: "password123"
  })
}).then(res => res.json()).then(console.log).catch(console.error);

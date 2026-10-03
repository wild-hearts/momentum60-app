// Presence checks only. Never print credential values.
const required=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','STRIPE_SECRET_KEY','STRIPE_MONTHLY_PRICE_ID','STRIPE_WEBHOOK_SECRET','REVENUECAT_SECRET_KEY','REVENUECAT_PRODUCT_IDS','REVENUECAT_WEBHOOK_TOKEN','CRON_SECRET','VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY','VITE_REVENUECAT_IOS_KEY','VITE_REVENUECAT_ANDROID_KEY','VITE_API_ORIGIN'];
let failed=false;for(const key of required){const okay=Boolean(process.env[key]?.trim());console.log(`${okay?'PASS':'MISSING'} ${key}`);failed||=!okay;}
if(process.env.BILLING_ENV!=='production'){console.log('BLOCKED BILLING_ENV must be production for a public release');failed=true;}
if(process.env.STRIPE_SECRET_KEY&&!process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')){console.log('BLOCKED Stripe live key is required for a public release');failed=true;}
for(const [key,prefix] of [['VITE_REVENUECAT_IOS_KEY','appl_'],['VITE_REVENUECAT_ANDROID_KEY','goog_']]){if(process.env[key]&&!process.env[key].startsWith(prefix)){console.log(`BLOCKED ${key} must be a platform key, not a Test Store key`);failed=true;}}
console.log('Native review transactions: use RevenueCat-verified Apple/Play sandbox receipts; Test Store and promotional entitlements are rejected. Confirm RevenueCat sandbox access permits the review account.');
console.log('Manual gates: sandbox purchase/restore/refund, live migrations, physical devices, signed store builds, privacy declarations, legal pricing, content rights. Presence is not verification.');process.exitCode=failed?1:0;

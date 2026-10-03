// Input must come from RevenueCat's authenticated server API, never the client.
// Real store sandbox receipts are required for App Review and Play testing.
// RevenueCat Test Store and promotional entitlements are never accepted here.
const STORES = new Set(['app_store', 'play_store']);
export function nativeAccess(value, allowedProducts) {
 const entitlement = value?.subscriber?.entitlements?.momentum60;
 const product = entitlement?.product_identifier;
 const purchase = value?.subscriber?.subscriptions?.[product];
 if (!allowedProducts.includes(product) || !purchase || !STORES.has(purchase.store) || purchase.refunded_at) return null;
 const expires = entitlement.expires_date;
 return expires && Date.parse(expires) > Date.now() ? expires : null;
}
export function nativeBillingStores(value, allowedProducts) {
 return [...new Set(Object.entries(value?.subscriber?.subscriptions || {})
  .filter(([product, purchase]) => allowedProducts.includes(product) && STORES.has(purchase.store) && !purchase.refunded_at)
  .map(([, purchase]) => purchase.store))];
}
export async function reconcileNative(db,userId,attempt=0){
 if(!process.env.REVENUECAT_SECRET_KEY)throw Error('Native billing not configured');
 const created=await db.from('momentum_subscriptions').upsert({user_id:userId},{onConflict:'user_id',ignoreDuplicates:true});if(created.error)throw created.error;
 const owner=await db.from('momentum_subscriptions').select('native_reconciliation_version').eq('user_id',userId).single();if(owner.error)throw owner.error;
 const response=await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,{headers:{Authorization:`Bearer ${process.env.REVENUECAT_SECRET_KEY}`},signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Receipt service unavailable');
 const value=await response.json();const expires=nativeAccess(value,(process.env.REVENUECAT_PRODUCT_IDS||'').split(',').map(id=>id.trim()).filter(Boolean));
 const version=owner.data.native_reconciliation_version;const result=await db.from('momentum_subscriptions').update({native_paid_until:expires,native_billing_stores:nativeBillingStores(value,(process.env.REVENUECAT_PRODUCT_IDS||'').split(',').map(id=>id.trim()).filter(Boolean)),native_reconciliation_version:version+1}).eq('user_id',userId).eq('native_reconciliation_version',version).select('user_id');if(result.error)throw result.error;if(!result.data?.length){if(attempt>=3)throw Error('Concurrent receipt update');return reconcileNative(db,userId,attempt+1);}
}

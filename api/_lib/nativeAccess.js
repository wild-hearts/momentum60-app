export function nativeAccess(value,allowedProducts,sandboxAllowed=false){
 const entitlement=value.subscriber?.entitlements?.momentum60;
 const product=entitlement?.product_identifier,expires=entitlement?.expires_date;
 const purchase=value.subscriber?.subscriptions?.[product];
 if(!allowedProducts.includes(product)||!purchase||purchase.refunded_at||purchase.is_sandbox&&!sandboxAllowed)return null;
 return expires&&new Date(expires)>new Date()?expires:null;
}
export async function reconcileNative(db,userId,attempt=0){
 if(!process.env.REVENUECAT_SECRET_KEY)throw Error('Native billing not configured');
 const created=await db.from('momentum_subscriptions').upsert({user_id:userId},{onConflict:'user_id',ignoreDuplicates:true});if(created.error)throw created.error;
 const owner=await db.from('momentum_subscriptions').select('native_reconciliation_version').eq('user_id',userId).single();if(owner.error)throw owner.error;
 const response=await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,{headers:{Authorization:`Bearer ${process.env.REVENUECAT_SECRET_KEY}`}});if(!response.ok)throw Error('Receipt service unavailable');
 const value=await response.json();const expires=nativeAccess(value,(process.env.REVENUECAT_PRODUCT_IDS||'').split(',').filter(Boolean),process.env.BILLING_ENV==='sandbox');
 const version=owner.data.native_reconciliation_version;const result=await db.from('momentum_subscriptions').update({native_paid_until:expires,native_reconciliation_version:version+1}).eq('user_id',userId).eq('native_reconciliation_version',version).select('user_id');if(result.error)throw result.error;if(!result.data?.length){if(attempt>=3)throw Error('Concurrent receipt update');return reconcileNative(db,userId,attempt+1);}
}

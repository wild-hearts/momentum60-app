// Store purchases are verified directly with Apple and Google. Nothing here
// trusts a value merely because the app sent it: Apple transactions must carry
// Apple's signature, and Google purchase tokens are looked up with Google.
import {verifyAppleTransaction} from './appleStore.js';
import {fetchGoogleSubscription,googleConfigured} from './googlePlay.js';
export class PurchaseOwnedElsewhere extends Error {}
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GOOGLE_ENTITLED=new Set(['SUBSCRIPTION_STATE_ACTIVE','SUBSCRIPTION_STATE_CANCELED','SUBSCRIPTION_STATE_IN_GRACE_PERIOD']);
export const allowedProducts=()=>(process.env.NATIVE_PRODUCT_IDS||'').split(',').map(id=>id.trim()).filter(Boolean);
export const accountId=value=>typeof value==='string'&&UUID.test(value)?value.toLowerCase():null;

// `tx` is a transaction payload whose Apple signature has already been verified.
// Only Apple's server notices carry `graceUntilMs` (a billing grace period, while
// Apple retries a failed renewal) and the notice's own `signedMs`. Access runs to
// the later of the paid period and the grace period, so a card that needs
// updating does not lock out someone who has been paying.
export function applePurchase(tx,products,{graceUntilMs=null,signedMs=null}={}){
 if(!tx?.originalTransactionId||!products.includes(tx.productId)||tx.type!=='Auto-Renewable Subscription'||!tx.expiresDate)return null;
 const end=Math.max(tx.expiresDate,Number(graceUntilMs)||0);
 return {store:'app_store',purchase_id:String(tx.originalTransactionId),product:tx.productId,expires_at:new Date(end).toISOString(),entitled:!tx.revocationDate,account:accountId(tx.appAccountToken),signed_ms:Number(signedMs||tx.signedDate)||null,environment:tx.environment==='Sandbox'?'Sandbox':'Production'};
}
// `value` is Google's own answer for `token` from purchases.subscriptionsv2.get.
export function googlePurchase(token,value,products){
 const item=(value?.lineItems||[]).filter(line=>products.includes(line.productId)&&line.expiryTime).sort((a,b)=>Date.parse(b.expiryTime)-Date.parse(a.expiryTime))[0];
 if(!token||!item||Number.isNaN(Date.parse(item.expiryTime)))return null;
 return {store:'play_store',purchase_id:token,product:item.productId,expires_at:new Date(item.expiryTime).toISOString(),entitled:GOOGLE_ENTITLED.has(value.subscriptionState),account:accountId(value.externalAccountIdentifiers?.obfuscatedExternalAccountId),acknowledge:value.acknowledgementState==='ACKNOWLEDGEMENT_STATE_PENDING',signed_ms:null,environment:value.testPurchase?'Sandbox':'Production'};
}
// Sandbox policy. TestFlight, App Review and Google licence-tester purchases are
// test purchases, and a test subscription renews every few minutes for free. They
// count for everyone while ALLOW_SANDBOX_ACCESS is unset (so App Review can get
// in), and only for the emails in SANDBOX_ALLOWED_EMAILS once it is "false".
export function isSandboxAllowed(email,allowList=process.env.SANDBOX_ALLOWED_EMAILS,allowAll=process.env.ALLOW_SANDBOX_ACCESS){
 if(allowAll!=='false')return true;if(!email)return false;
 return (allowList||'').split(',').map(e=>e.trim().toLowerCase()).filter(Boolean).includes(String(email).trim().toLowerCase());
}
const counts=(row,sandboxOk)=>row.entitled&&(sandboxOk||row.environment!=='Sandbox');
export function nativeAccess(rows,now=Date.now(),sandboxOk=true){
 const ends=(rows||[]).filter(row=>counts(row,sandboxOk)&&Date.parse(row.expires_at)>now).map(row=>Date.parse(row.expires_at));
 return ends.length?new Date(Math.max(...ends)).toISOString():null;
}
export function nativeBillingStores(rows,sandboxOk=true){
 return [...new Set((rows||[]).filter(row=>counts(row,sandboxOk)).map(row=>row.store))].sort();
}
// Ordering. Apple stamps every record and notice with the moment it signed it.
// A record older than the newest one already applied is stale: replaying a
// receipt saved before a refund, or Apple redelivering an old notice after a
// REFUND, must not undo the newer truth. Equal is accepted so a retry is harmless.
export function shouldApply(lastSignedMs,incomingSignedMs){
 if(lastSignedMs==null)return true;if(incomingSignedMs==null)return false;
 return Number(incomingSignedMs)>=Number(lastSignedMs);
}
// The record the app sends (on launch, on Restore) carries only the paid period.
// During a billing grace period it looks expired, so for the same subscription a
// later end date already stored (from Apple's notice) is kept, unless this is a refund.
export function keptExpiry(existing,purchase){
 if(!existing?.entitled||!purchase.entitled||!existing.expires_at)return purchase.expires_at;
 return Date.parse(existing.expires_at)>Date.parse(purchase.expires_at)?existing.expires_at:purchase.expires_at;
}
// A purchase made for one account, or already claimed by one, never moves to another.
export function mayClaim(purchase,existingOwner,userId){
 return (!purchase.account||purchase.account===userId.toLowerCase())&&(!existingOwner||existingOwner===userId);
}

const TABLE='momentum_native_purchases';
export async function savePurchase(db,userId,purchase,retried=false){
 const found=await db.from(TABLE).select('user_id,expires_at,entitled,last_signed_ms').eq('store',purchase.store).eq('purchase_id',purchase.purchase_id).maybeSingle();if(found.error)throw found.error;
 if(!mayClaim(purchase,found.data?.user_id,userId))throw new PurchaseOwnedElsewhere();
 // Google records carry no signing time and are always Google's latest answer.
 if(found.data&&purchase.signed_ms!=null&&!shouldApply(found.data.last_signed_ms,purchase.signed_ms))return;
 const row={store:purchase.store,purchase_id:purchase.purchase_id,user_id:userId,product:purchase.product,expires_at:purchase.store==='app_store'?keptExpiry(found.data,purchase):purchase.expires_at,entitled:purchase.entitled,updated_at:new Date().toISOString(),last_signed_ms:purchase.signed_ms??found.data?.last_signed_ms??null,environment:purchase.environment||'Production'};
 const saved=found.data?await db.from(TABLE).update(row).eq('store',row.store).eq('purchase_id',row.purchase_id).eq('user_id',userId).select('user_id'):await db.from(TABLE).insert(row).select('user_id');
 // A unique violation means a concurrent request stored it first: look again to see whose it is.
 if(saved.error?.code==='23505'&&!retried)return savePurchase(db,userId,purchase,true);
 if(saved.error?.code==='23505'||(!saved.error&&!saved.data?.length))throw new PurchaseOwnedElsewhere();if(saved.error)throw saved.error;
}
export async function recordProof(db,userId,proof,products=allowedProducts()){
 if(typeof proof?.jws==='string'){const purchase=applePurchase(await verifyAppleTransaction(proof.jws),products);if(purchase)await savePurchase(db,userId,purchase);return;}
 if(typeof proof?.token==='string'&&proof.token.length<=2000){
  const recent=await db.from(TABLE).select('user_id,expires_at,updated_at').eq('store','play_store').eq('purchase_id',proof.token).maybeSingle();if(recent.error)throw recent.error;
  if(recent.data&&recent.data.user_id!==userId)throw new PurchaseOwnedElsewhere();
  // Google is asked again once the last answer is ten minutes old or the period is about to end.
  if(recent.data&&Date.now()-Date.parse(recent.data.updated_at)<600000&&Date.parse(recent.data.expires_at)-Date.now()>600000)return;
  const purchase=googlePurchase(proof.token,await fetchGoogleSubscription(proof.token),products);if(purchase){await savePurchase(db,userId,purchase);if(purchase.acknowledge&&purchase.entitled)await fetchGoogleSubscription(proof.token,purchase.product);}
 }
}
async function sandboxAllowedFor(db,userId,rows){
 if(isSandboxAllowed(null)||!rows.some(row=>row.environment==='Sandbox'))return true;
 const {data,error}=await db.auth.admin.getUserById(userId);if(error)throw error;
 return isSandboxAllowed(data?.user?.email);
}
export async function reconcileNative(db,userId,proofs=[],attempt=0){
 const created=await db.from('momentum_subscriptions').upsert({user_id:userId},{onConflict:'user_id',ignoreDuplicates:true});if(created.error)throw created.error;
 if(attempt===0)for(const proof of proofs.slice(0,10))await recordProof(db,userId,proof);
 const owner=await db.from('momentum_subscriptions').select('native_reconciliation_version').eq('user_id',userId).single();if(owner.error)throw owner.error;
 const rows=await db.from(TABLE).select('store,expires_at,entitled,environment').eq('user_id',userId);if(rows.error)throw rows.error;
 const sandboxOk=await sandboxAllowedFor(db,userId,rows.data||[]);
 const version=owner.data.native_reconciliation_version,expires=nativeAccess(rows.data,Date.now(),sandboxOk);
 const result=await db.from('momentum_subscriptions').update({native_paid_until:expires,native_billing_stores:nativeBillingStores(rows.data,sandboxOk),native_reconciliation_version:version+1}).eq('user_id',userId).eq('native_reconciliation_version',version).select('user_id');if(result.error)throw result.error;
 if(!result.data?.length){if(attempt>=3)throw Error('Concurrent receipt update');return reconcileNative(db,userId,[],attempt+1);}
 return Boolean(expires);
}
// Renewals, cancellations and refunds on Google Play are picked up by asking Google again.
export async function refreshGooglePurchases(db){
 if(!googleConfigured())return 0;let offset=0,count=0;const products=allowedProducts();
 for(;;){const {data,error}=await db.from(TABLE).select('purchase_id,user_id').eq('store','play_store').eq('entitled',true).order('purchase_id').range(offset,offset+99);if(error)throw error;
  for(const row of data){const purchase=googlePurchase(row.purchase_id,await fetchGoogleSubscription(row.purchase_id),products);
   const update=await db.from(TABLE).update(purchase?{expires_at:purchase.expires_at,entitled:purchase.entitled,environment:purchase.environment,updated_at:new Date().toISOString()}:{entitled:false,updated_at:new Date().toISOString()}).eq('store','play_store').eq('purchase_id',row.purchase_id);if(update.error)throw update.error;
   await reconcileNative(db,row.user_id);count++;}
  if(data.length<100)break;offset+=100;}
 return count;
}

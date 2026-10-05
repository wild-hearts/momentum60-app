import { Capacitor } from '@capacitor/core';
import { NativePurchases, PURCHASE_TYPE } from '@capgo/native-purchases';
import { supabase } from '../supabaseClient';
export async function billingRequest(path,body={}){
 const {data}=await supabase.auth.getSession();
 const base=Capacitor.isNativePlatform()?import.meta.env.VITE_API_ORIGIN:'';
 if(Capacitor.isNativePlatform()&&!base)throw Error('Billing connection is not configured.');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try {
  const response=await fetch(`${base || ''}/api/${path}`,{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session?.access_token || ''}`},body:JSON.stringify(body)});
  const value=await response.json();if(!response.ok)throw Error(value.error || 'Billing unavailable');return value;
 } catch(error) {if(error.name==='AbortError')throw Error('The connection took too long. Please retry.',{cause:error});throw error;} finally {clearTimeout(timer);}
}
// The same product identifier is used in App Store Connect and Google Play.
const productId=import.meta.env.VITE_NATIVE_PRODUCT_ID,androidPlan=import.meta.env.VITE_ANDROID_BASE_PLAN_ID;
const android=()=>Capacitor.getPlatform()==='android';
function requireStore(){
 if(!productId||(android()&&!androidPlan))throw Error('Store purchases are not configured yet.');
}
// What the server needs to verify a purchase itself: Apple's signed transaction, or Google's purchase token.
export function purchaseProof(transaction){
 if(transaction?.jwsRepresentation)return {jws:transaction.jwsRepresentation};
 if(transaction?.purchaseToken)return {token:transaction.purchaseToken};
 return null;
}
async function currentProofs(){
 const {purchases}=await NativePurchases.getPurchases({productType:PURCHASE_TYPE.SUBS,onlyCurrentEntitlements:true});
 return (purchases||[]).map(purchaseProof).filter(Boolean);
}
// Sends this device's current store purchases for verification and returns whether access is active.
export async function syncNative(extra=[]){
 const proofs=[...extra,...await currentProofs().catch(()=>[])];
 const {active}=await billingRequest('native-entitlement',{purchases:proofs});return active;
}
export async function nativeOffering(){
 requireStore();
 const {isBillingSupported}=await NativePurchases.isBillingSupported();
 if(!isBillingSupported)throw Error('Purchases are not available on this device.');
 const {products}=await NativePurchases.getProducts({productIdentifiers:[productId],productType:PURCHASE_TYPE.SUBS});
 const product=(products||[]).find(item=>item.identifier===productId&&(!android()||!item.planIdentifier||item.planIdentifier===androidPlan));
 if(!product)throw Error('The monthly subscription is not available in this store.');
 return product;
}
export async function purchaseNative(userId){
 await nativeOffering();
 // The account identifier travels with the purchase so the server can refuse it for any other account.
 const transaction=await NativePurchases.purchaseProduct({productIdentifier:productId,planIdentifier:android()?androidPlan:undefined,productType:PURCHASE_TYPE.SUBS,quantity:1,appAccountToken:userId});
 const proof=purchaseProof(transaction);
 if(!await syncNative(proof?[proof]:[]))throw Error('Your purchase is still being confirmed by the store. Use “Check access again” in a moment.');
}
export async function restoreNative(){
 requireStore();await NativePurchases.restorePurchases();
 if(!await syncNative())throw Error('No active subscription was found for this store account.');
}

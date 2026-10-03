import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { supabase } from '../supabaseClient';
export async function billingRequest(path,body={}){
 const {data}=await supabase.auth.getSession();
 const base=Capacitor.isNativePlatform()?import.meta.env.VITE_API_ORIGIN:'';
 if(Capacitor.isNativePlatform()&&!base)throw Error('Billing connection is not configured.');
 const response=await fetch(`${base || ''}/api/${path}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session?.access_token || ''}`},body:JSON.stringify(body)});
 const value=await response.json();if(!response.ok)throw Error(value.error || 'Billing unavailable');return value;
}
let configuredUser;
async function configureNative(userId){
 const key=Capacitor.getPlatform()==='ios'?import.meta.env.VITE_REVENUECAT_IOS_KEY:import.meta.env.VITE_REVENUECAT_ANDROID_KEY;
 if(!key)throw Error('Store purchases are not configured yet.');
 if(!configuredUser){await Purchases.configure({apiKey:key,appUserID:userId});configuredUser=userId;}
 else if(configuredUser!==userId){await Purchases.logIn({appUserID:userId});configuredUser=userId;}
}
export async function nativeOffering(userId){
 await configureNative(userId);
 const offerings=await Purchases.getOfferings();
 const monthly=offerings.current?.monthly;
 if(!monthly)throw Error('The monthly subscription is not available in this store.');
 return monthly;
}
export async function purchaseNative(userId){const pkg=await nativeOffering(userId);await Purchases.purchasePackage({aPackage:pkg});await billingRequest('native-entitlement');}
export async function restoreNative(userId){await configureNative(userId);await Purchases.restorePurchases();await billingRequest('native-entitlement');}

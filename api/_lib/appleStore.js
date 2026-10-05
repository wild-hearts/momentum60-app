// Verifies App Store signed data against Apple's root certificate. A transaction
// that is unsigned, signed by anyone else, for another app, or produced by
// Xcode's local test store is rejected before any of its contents are used.
import {SignedDataVerifier,Environment} from '@apple/app-store-server-library';
import {APPLE_ROOT_G3} from './appleRoot.js';
const bundleId=()=>process.env.APPLE_BUNDLE_ID||'com.themomentumrule.momentum60';
let cached;
function verifiers(){
 if(cached)return cached;const appId=Number(process.env.APPLE_APP_ID)||undefined;
 // App Review and TestFlight purchase in Apple's sandbox, so both are accepted.
 cached=[...(appId?[new SignedDataVerifier([APPLE_ROOT_G3],false,Environment.PRODUCTION,bundleId(),appId)]:[]),new SignedDataVerifier([APPLE_ROOT_G3],false,Environment.SANDBOX,bundleId())];
 return cached;
}
async function firstValid(method,signed){
 if(typeof signed!=='string'||signed.length>20000)throw Error('Invalid App Store data');let failure;
 for(const verifier of verifiers()){try{return await verifier[method](signed)}catch(error){failure=error}}
 throw Error('App Store signature rejected',{cause:failure});
}
export const verifyAppleTransaction=jws=>firstValid('verifyAndDecodeTransaction',jws);
export const verifyAppleNotification=payload=>firstValid('verifyAndDecodeNotification',payload);

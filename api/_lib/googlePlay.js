// Asks Google Play about a purchase token using the publisher's service account.
import {createSign} from 'node:crypto';
const packageName=()=>process.env.GOOGLE_PLAY_PACKAGE||'com.themomentumrule.momentum60';
export const googleConfigured=()=>Boolean(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON);
const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
let session;
async function accessToken(){
 if(session&&session.expires>Date.now()+60000)return session.token;
 if(!googleConfigured())throw Error('Google Play billing is not configured');
 const account=JSON.parse(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON),now=Math.floor(Date.now()/1000);
 const unsigned=`${encode({alg:'RS256',typ:'JWT'})}.${encode({iss:account.client_email,scope:'https://www.googleapis.com/auth/androidpublisher',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+600})}`;
 const assertion=`${unsigned}.${createSign('RSA-SHA256').update(unsigned).sign(account.private_key,'base64url')}`;
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Google Play sign-in failed');const value=await response.json();
 session={token:value.access_token,expires:Date.now()+value.expires_in*1000};return session.token;
}
// With `acknowledgeProduct`, confirms delivery so Google does not auto-refund after three days.
export async function fetchGoogleSubscription(token,acknowledgeProduct){
 const base=`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName())}/purchases`;
 const url=acknowledgeProduct?`${base}/subscriptions/${encodeURIComponent(acknowledgeProduct)}/tokens/${encodeURIComponent(token)}:acknowledge`:`${base}/subscriptionsv2/tokens/${encodeURIComponent(token)}`;
 const response=await fetch(url,{method:acknowledgeProduct?'POST':'GET',headers:{Authorization:`Bearer ${await accessToken()}`},signal:AbortSignal.timeout(15000)});
 // Google answers 400/404/410 for a token it does not recognise or has purged: that is "no purchase", not an outage.
 if([400,404,410].includes(response.status))return null;
 if(!response.ok)throw Error('Google Play is unavailable');
 return acknowledgeProduct?null:response.json();
}

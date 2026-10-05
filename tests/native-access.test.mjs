import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash,generateKeyPairSync,createSign} from 'node:crypto';
import {applePurchase,googlePurchase,nativeAccess,nativeBillingStores,mayClaim,savePurchase,reconcileNative,PurchaseOwnedElsewhere} from '../api/_lib/nativeAccess.js';
import {verifyAppleTransaction,verifyAppleNotification} from '../api/_lib/appleStore.js';
import {APPLE_ROOT_G3} from '../api/_lib/appleRoot.js';

const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
const future=Date.now()+86400000,past=Date.now()-86400000;
const tx={originalTransactionId:'1000001',productId:'monthly',type:'Auto-Renewable Subscription',expiresDate:future,appAccountToken:A,environment:'Production'};
const play={subscriptionState:'SUBSCRIPTION_STATE_ACTIVE',acknowledgementState:'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',externalAccountIdentifiers:{obfuscatedExternalAccountId:A},lineItems:[{productId:'monthly',expiryTime:new Date(future).toISOString()}]};

test('only approved store products become purchases',()=>{
 assert.equal(applePurchase(tx,['monthly']).purchase_id,'1000001');
 assert.equal(applePurchase(tx,[]),null);assert.equal(applePurchase(null,['monthly']),null);
 assert.equal(applePurchase({...tx,type:'Non-Consumable'},['monthly']),null);
 assert.equal(applePurchase({...tx,expiresDate:undefined},['monthly']),null);
 assert.equal(googlePurchase('token',play,['monthly']).product,'monthly');
 assert.equal(googlePurchase('token',play,['other']),null);assert.equal(googlePurchase('token',null,['monthly']),null);
});
test('Apple sandbox and Google test purchases unlock the review build',()=>{
 assert.ok(nativeAccess([applePurchase({...tx,environment:'Sandbox'},['monthly'])]));
 assert.ok(nativeAccess([googlePurchase('token',{...play,testPurchase:{}},['monthly'])]));
});
test('refunds, revocation, expiry, holds and pauses cannot unlock',()=>{
 assert.equal(nativeAccess([applePurchase({...tx,revocationDate:past},['monthly'])]),null);
 assert.equal(nativeAccess([applePurchase({...tx,expiresDate:past},['monthly'])]),null);
 for(const state of ['SUBSCRIPTION_STATE_EXPIRED','SUBSCRIPTION_STATE_ON_HOLD','SUBSCRIPTION_STATE_PAUSED','SUBSCRIPTION_STATE_PENDING','SUBSCRIPTION_STATE_UNSPECIFIED',undefined])
  assert.equal(nativeAccess([googlePurchase('token',{...play,subscriptionState:state},['monthly'])]),null,String(state));
 // A cancelled renewal keeps access until the paid period ends, and no longer.
 assert.ok(nativeAccess([googlePurchase('token',{...play,subscriptionState:'SUBSCRIPTION_STATE_CANCELED'},['monthly'])]));
 assert.equal(nativeAccess([googlePurchase('token',{...play,subscriptionState:'SUBSCRIPTION_STATE_CANCELED',lineItems:[{productId:'monthly',expiryTime:new Date(past).toISOString()}]},['monthly'])]),null);
 assert.equal(nativeAccess([]),null);assert.equal(nativeAccess(null),null);
});
test('access lasts until the latest verified period and billing owners come from purchase records',()=>{
 const later=new Date(future+86400000).toISOString();
 const rows=[{store:'app_store',entitled:true,expires_at:new Date(future).toISOString()},{store:'play_store',entitled:true,expires_at:later},{store:'play_store',entitled:false,expires_at:new Date(future+9e8).toISOString()}];
 assert.equal(nativeAccess(rows),later);
 assert.deepEqual(nativeBillingStores(rows),['app_store','play_store']);
 assert.deepEqual(nativeBillingStores([{store:'app_store',entitled:false}]),[]);
});
test('a purchase bought for or claimed by one account cannot unlock another',()=>{
 const purchase=applePurchase(tx,['monthly']);
 assert.equal(mayClaim(purchase,undefined,A),true);assert.equal(mayClaim(purchase,A,A),true);
 assert.equal(mayClaim(purchase,undefined,B),false);
 assert.equal(mayClaim({...purchase,account:null},A,B),false);
 assert.equal(mayClaim({...purchase,account:null},undefined,B),true);
 assert.equal(applePurchase({...tx,appAccountToken:'not-a-uuid'},['monthly']).account,null);
});

test('data without Apple’s signature is rejected before it is read',async()=>{
 assert.equal(createHash('sha256').update(APPLE_ROOT_G3).digest('hex'),'63343abfb89a6a03ebb57e9b3f5fa7be7c4f5c756f3017b3a8c488c3653e9179');
 const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
 const payload=encode({...tx,bundleId:'com.themomentumrule.momentum60',signedDate:Date.now()});
 const unsigned=`${encode({alg:'none'})}.${payload}.`;
 // Signed with a key the attacker controls while presenting Apple's real root in the chain.
 const {privateKey}=generateKeyPairSync('ec',{namedCurve:'P-256'}),root=APPLE_ROOT_G3.toString('base64');
 const head=encode({alg:'ES256',x5c:[root,root,root]});
 const forged=`${head}.${payload}.${createSign('SHA256').update(`${head}.${payload}`).sign({key:privateKey,dsaEncoding:'ieee-p1363'},'base64url')}`;
 for(const value of [unsigned,forged,'not.a.jws','',null,'x'.repeat(30000)]){
  await assert.rejects(verifyAppleTransaction(value),/rejected|Invalid/);
  await assert.rejects(verifyAppleNotification(value),/rejected|Invalid/);
 }
});

// The smallest stand-in for the database client that keeps the real uniqueness rules.
function fakeDb(){
 const tables={momentum_native_purchases:[],momentum_subscriptions:[]},keys={momentum_native_purchases:['store','purchase_id'],momentum_subscriptions:['user_id']};
 return {tables,from(name){const rows=tables[name],filters=[];let op='select',payload;
  const match=row=>filters.every(([k,v])=>row[k]===v),same=(a,b)=>keys[name].every(k=>a[k]===b[k]);
  const run=async()=>{
   if(op==='insert'||op==='upsert'){if(rows.some(row=>same(row,payload)))return op==='upsert'?{data:[],error:null}:{data:null,error:{code:'23505'}};
    rows.push(name==='momentum_subscriptions'?{native_reconciliation_version:0,native_paid_until:null,native_billing_stores:[],...payload}:{...payload});return {data:[payload],error:null};}
   const hit=rows.filter(match);if(op==='update')hit.forEach(row=>Object.assign(row,payload));return {data:hit.map(row=>({...row})),error:null};
  };
  const q={select:()=>q,eq:(k,v)=>(filters.push([k,v]),q),insert:row=>(op='insert',payload=row,q),update:row=>(op='update',payload=row,q),upsert:row=>(op='upsert',payload=row,q),
   maybeSingle:()=>run().then(r=>({...r,data:r.data?.[0]??null})),single:()=>run().then(r=>({...r,data:r.data?.[0]??null})),then:(ok,no)=>run().then(ok,no)};
  return q;}};
}
test('verified purchases grant access to one account, and a refund removes it',async()=>{
 const db=fakeDb(),purchase={...applePurchase(tx,['monthly']),account:null};
 await savePurchase(db,A,purchase);assert.equal(await reconcileNative(db,A),true);
 const owner=()=>db.tables.momentum_subscriptions.find(row=>row.user_id===A);
 assert.equal(owner().native_paid_until,purchase.expires_at);assert.deepEqual(owner().native_billing_stores,['app_store']);
 // The same store subscription presented by a second account is refused and grants nothing.
 await assert.rejects(savePurchase(db,B,purchase),PurchaseOwnedElsewhere);assert.equal(await reconcileNative(db,B),false);
 assert.equal(db.tables.momentum_native_purchases.length,1);assert.equal(db.tables.momentum_native_purchases[0].user_id,A);
 // A purchase made for account A is refused for account B even when B presents it first.
 await assert.rejects(savePurchase(db,B,{...purchase,purchase_id:'1000002',account:A}),PurchaseOwnedElsewhere);
 // Renewal extends; a later refund from the store ends access at once.
 const renewed=new Date(future+2592000000).toISOString();await savePurchase(db,A,{...purchase,expires_at:renewed});assert.equal(await reconcileNative(db,A),true);assert.equal(owner().native_paid_until,renewed);
 await savePurchase(db,A,{...purchase,expires_at:renewed,entitled:false});assert.equal(await reconcileNative(db,A),false);
 assert.equal(owner().native_paid_until,null);assert.deepEqual(owner().native_billing_stores,[]);assert.equal(owner().native_reconciliation_version,3);
});

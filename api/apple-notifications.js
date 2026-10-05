// App Store Server Notifications (version 2). Apple calls this when a
// subscription renews, expires, is refunded or is revoked. The request is
// authenticated by Apple's signature on the payload, not by a shared secret.
import {databaseService,requestBody} from './_lib/billing.js';
import {verifyAppleNotification,verifyAppleTransaction} from './_lib/appleStore.js';
import {applePurchase,allowedProducts,savePurchase,reconcileNative,PurchaseOwnedElsewhere} from './_lib/nativeAccess.js';
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).end();
 let notice;try{notice=await verifyAppleNotification(requestBody(req).signedPayload)}catch{return res.status(401).end()}
 try{
  const signed=notice.data?.signedTransactionInfo;if(!signed)return res.json({received:true});
  const purchase=applePurchase(await verifyAppleTransaction(signed),allowedProducts());if(!purchase)return res.json({received:true});
  const db=databaseService();
  const known=await db.from('momentum_native_purchases').select('user_id').eq('store','app_store').eq('purchase_id',purchase.purchase_id).maybeSingle();if(known.error)throw known.error;
  // An unknown purchase is attached only to the account it was bought for.
  const owner=known.data?.user_id||purchase.account;if(!owner)return res.json({received:true});
  if(!known.data){const exists=await db.auth.admin.getUserById(owner);if(exists.error||!exists.data?.user)return res.json({received:true});}
  await savePurchase(db,owner,purchase);await reconcileNative(db,owner);
  return res.json({received:true});
 }catch(error){
  if(error instanceof PurchaseOwnedElsewhere)return res.json({received:true});
  return res.status(503).json({error:'Reconciliation failed; retry required'});
 }
}

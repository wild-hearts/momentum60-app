import {databaseService,identity,allowClient,requestBody} from './_lib/billing.js';
import {reconcileNative,PurchaseOwnedElsewhere} from './_lib/nativeAccess.js';
export default async function handler(req,res){
 if(allowClient(req,res))return;if(req.method!=='POST')return res.status(405).end();
 try{
  const db=databaseService();const user=await identity(req,db);const proofs=requestBody(req).purchases;
  const active=await reconcileNative(db,user.id,Array.isArray(proofs)?proofs:[]);
  return res.json({reconciled:true,active});
 }catch(error){
  if(error instanceof PurchaseOwnedElsewhere)return res.status(409).json({error:'This store subscription is already linked to a different Momentum60 account. Sign in to that account to use it.'});
  return res.status(503).json({error:'Purchase verification is unavailable. Your store purchase can be restored when the connection returns.'});
 }
}

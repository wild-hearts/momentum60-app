import {databaseService,stripeService} from './_lib/billing.js';
import {reconcileCustomer} from './_lib/reconcileCustomer.js';
import {refreshGooglePurchases} from './_lib/nativeAccess.js';
export default async function handler(req,res){
 if(!process.env.CRON_SECRET||req.headers.authorization!==`Bearer ${process.env.CRON_SECRET}`)return res.status(401).end();
 try{
  const db=databaseService();const native=await refreshGooglePurchases(db);
  let offset=0,count=0;
  for(;;){const {data,error}=await db.from('momentum_subscriptions').select('stripe_customer').not('stripe_customer','is',null).order('user_id').range(offset,offset+99);if(error)throw error;
   if(data.length){const stripe=stripeService();for(const row of data){await reconcileCustomer(db,stripe,row.stripe_customer);count++;}}
   if(data.length<100)break;offset+=100;}
  return res.json({reconciled:count,native});
 }catch{return res.status(503).json({error:'Reconciliation incomplete; retry required'})}
}

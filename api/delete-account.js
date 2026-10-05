import {databaseService,stripeService,identity,allowClient} from './_lib/billing.js';
export default async function handler(req,res){
 if(allowClient(req,res))return;
 if(req.method!=='POST')return res.status(405).end();
 try{
  const db=databaseService();const user=await identity(req,db);
  const lock=await db.rpc('begin_momentum_billing',{owner_id:user.id,deleting_account:true});if(lock.error)throw lock.error;
  const {data:billing,error}=await db.from('momentum_subscriptions').select('stripe_customer').eq('user_id',user.id).maybeSingle();if(error)throw error;
  // Cancel web renewals before removing their account-to-customer mapping.
  if(billing?.stripe_customer){const stripe=stripeService();if(!process.env.STRIPE_MONTHLY_PRICE_ID)throw Error('Web product not configured');for await(const session of stripe.checkout.sessions.list({customer:billing.stripe_customer,status:'open',limit:100})){if(session.mode==='subscription')await stripe.checkout.sessions.expire(session.id);}
   for await(const sub of stripe.subscriptions.list({customer:billing.stripe_customer,status:'all',limit:100})){if(!['canceled','incomplete_expired'].includes(sub.status)&&sub.items.data.some(item=>item.price.id===process.env.STRIPE_MONTHLY_PRICE_ID))await stripe.subscriptions.cancel(sub.id);}}
  const result=await db.rpc('delete_momentum_account',{owner_id:user.id});if(result.error)throw result.error;
  return res.json({deleted:true});
 }catch{return res.status(503).json({error:'Account deletion could not be confirmed. Please retry.'});}
}

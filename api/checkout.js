import {allowClient} from './_lib/billing.js';
import {services,identity,siteOrigin} from './_lib/billing.js';
export const config={maxDuration:30};
export default async function handler(req,res){if(allowClient(req,res))return;
 if(req.method!=='POST')return res.status(405).end();
 let lockDb,lockUser,lockToken;
 try{
 const {db,stripe}=services(),user=await identity(req,db);
 const acquired=await db.rpc('begin_momentum_billing',{owner_id:user.id,deleting_account:false});if(acquired.error)throw acquired.error;lockDb=db;lockUser=user.id;lockToken=acquired.data;
 const price=await stripe.prices.retrieve(process.env.STRIPE_MONTHLY_PRICE_ID);
 if(price.unit_amount!==499 || price.currency!=='aud' || price.recurring?.interval!=='month' || price.recurring.interval_count!==1)throw Error('Monthly price configuration mismatch');
 const {data:existing,error}=await db.from('momentum_subscriptions').select('*').eq('user_id',user.id).maybeSingle();if(error)throw error;
 if(existing?.legacy_access || new Date(existing?.paid_until)>new Date() || new Date(existing?.native_paid_until)>new Date())return res.status(409).json({error:'You already have access. Manage your existing subscription in Settings.'});
 const customer=existing?.stripe_customer || (await stripe.customers.create({email:user.email,metadata:{user_id:user.id}},{idempotencyKey:`momentum-customer-${user.id}`})).id;
 const result=await db.from('momentum_subscriptions').upsert({user_id:user.id,stripe_customer:customer},{onConflict:'user_id'});if(result.error)throw result.error;
 const active=await stripe.subscriptions.list({customer,status:'all',limit:100});if(active.data.some(s=>['active','trialing','past_due','unpaid','incomplete'].includes(s.status)))return res.status(409).json({error:'An existing subscription needs review in billing settings.'});
 const {data:requestId,error:requestError}=await db.rpc('ensure_momentum_checkout',{owner_id:user.id});if(requestError||!requestId)throw Error();
 const created=await stripe.checkout.sessions.create({customer,mode:'subscription',line_items:[{price:price.id,quantity:1}],subscription_data:{metadata:{user_id:user.id}},success_url:`${siteOrigin()}/app?checkout=complete`,cancel_url:`${siteOrigin()}/subscribe`},{idempotencyKey:`momentum-checkout-${user.id}-${requestId}`});
 const session=await stripe.checkout.sessions.retrieve(created.id);
 if(session.status==='expired'){const cleared=await db.from('momentum_subscriptions').update({checkout_request_id:null}).eq('user_id',user.id).eq('checkout_request_id',requestId);if(cleared.error)throw cleared.error;return res.status(409).json({error:'That checkout expired. Please try again.'});}
 if(!session.url)return res.status(409).json({error:'Checkout has already completed. Check your access again.'});
 return res.status(200).json({url:session.url});
 }catch(e){return res.status(e.message==='Sign in required'?401:503).json({error:e.message==='Sign in required'?e.message:'Checkout is temporarily unavailable. No access has been granted.'})}finally{if(lockDb&&lockUser)await lockDb.from('momentum_subscriptions').update({checkout_token:null,checkout_expires_at:null}).eq('user_id',lockUser).eq('checkout_token',lockToken);}
}

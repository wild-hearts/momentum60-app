import {invoiceRevoked} from './invoiceAccess.js';
import {subscriptionState} from './subscriptionState.js';
export async function reconcileCustomer(db,stripe,customer,attempt=0){
 const {data:owner,error}=await db.from('momentum_subscriptions').select('user_id,last_paid_until,reconciliation_version').eq('stripe_customer',customer).maybeSingle();if(error)throw error;if(!owner)return;
 const all=[];for await(const sub of stripe.subscriptions.list({customer,status:'all',limit:100,expand:['data.latest_invoice']}))all.push(sub);
 const eligible=all.filter(sub=>sub.items.data.some(item=>item.price.id===process.env.STRIPE_MONTHLY_PRICE_ID));
 for(const sub of eligible){if(await invoiceRevoked(stripe,sub.latest_invoice))sub.status='revoked';}
 const states=eligible.map(sub=>({sub,...subscriptionState(sub,owner.last_paid_until)})).sort((a,b)=>(Date.parse(b.paid_until)||0)-(Date.parse(a.paid_until)||0));
 const best=states[0];const result=await db.from('momentum_subscriptions').update({stripe_subscription:best?.sub.id||null,status:best?.status||'inactive',paid_until:best?.paid_until||null,last_paid_until:best?.last_paid_until||owner.last_paid_until,reconciliation_version:owner.reconciliation_version+1,updated_at:new Date().toISOString()}).eq('user_id',owner.user_id).eq('reconciliation_version',owner.reconciliation_version).select('user_id');if(result.error)throw result.error;if(!result.data?.length){if(attempt>=3)throw Error('Concurrent billing change; retry reconciliation');return reconcileCustomer(db,stripe,customer,attempt+1);}
}

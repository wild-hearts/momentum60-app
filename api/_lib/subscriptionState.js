export function subscriptionState(subscription, previousPaidUntil=null) {
 const end=Math.max(0,...subscription.items.data.map(item=>item.current_period_end || 0));
 const paid=subscription.latest_invoice?.status==='paid';
 const lastPaidUntil=paid&&end?new Date(end*1000).toISOString():previousPaidUntil;
 let paidUntil=null;
 if(subscription.status==='active'&&paid)paidUntil=lastPaidUntil;
 else if(subscription.status==='past_due'&&lastPaidUntil)paidUntil=new Date(new Date(lastPaidUntil).getTime()+3*86400000).toISOString();
 return {status:subscription.status,paid_until:paidUntil,last_paid_until:lastPaidUntil};
}

// A paid invoice remains marked paid after refund. Inspect its settled charge.
export async function invoiceRevoked(stripe,invoice){
 if(!invoice?.id||invoice.status!=='paid')return false;
 for await(const payment of stripe.invoicePayments.list({invoice:invoice.id,limit:100})){
  if(payment.status!=='paid')continue;
  const p=payment.payment;let charge;
  if(p.type==='charge')charge=typeof p.charge==='string'?await stripe.charges.retrieve(p.charge):p.charge;
  if(p.type==='payment_intent'){
   const intent=typeof p.payment_intent==='string'?await stripe.paymentIntents.retrieve(p.payment_intent,{expand:['latest_charge']}):p.payment_intent;
   charge=typeof intent?.latest_charge==='string'?await stripe.charges.retrieve(intent.latest_charge):intent?.latest_charge;
  }
  if(charge?.refunded)return true;
  if(charge?.disputed){const disputes=await stripe.disputes.list({charge:charge.id,limit:100});if(disputes.data.some(d=>!['won','warning_closed'].includes(d.status)))return true;}
 }
 return false;
}

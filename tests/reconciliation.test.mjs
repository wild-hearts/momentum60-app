import {test} from 'node:test';import assert from 'node:assert/strict';import {reconcileCustomer}from'../api/_lib/reconcileCustomer.js';
test('a stale paid response cannot overwrite a newer revoked reconciliation',async()=>{
 process.env.STRIPE_MONTHLY_PRICE_ID='price_test';let row={user_id:'u',last_paid_until:null,reconciliation_version:0};let lists=0,conflicted=false;
 const db={from(){let patch,expected;const query={select(){if(patch){if(!conflicted){conflicted=true;row={...row,status:'revoked',paid_until:null,reconciliation_version:1};}if(expected!==row.reconciliation_version)return Promise.resolve({data:[],error:null});row={...row,...patch};return Promise.resolve({data:[{user_id:'u'}]});}return query},eq(k,v){if(k==='reconciliation_version')expected=v;return query},maybeSingle:async()=>({data:{...row}}),update(value){patch=value;return query}};return query}};
 const stripe={subscriptions:{list:async function*(){lists++;yield {id:'sub',status:lists===1?'active':'canceled',latest_invoice:{status:'paid'},items:{data:[{price:{id:'price_test'},current_period_end:1900000000}]}}}}};
 await reconcileCustomer(db,stripe,'cus');assert.equal(lists,2);assert.equal(row.paid_until,null);assert.equal(row.status,'canceled');assert.equal(row.reconciliation_version,2);
});

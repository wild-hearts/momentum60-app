import {test} from 'node:test';import assert from 'node:assert/strict';import {invoiceRevoked} from '../api/_lib/invoiceAccess.js';
function client(charge,status='needs_response'){return {invoicePayments:{list:async function*(){yield {status:'paid',payment:{type:'charge',charge}}}},disputes:{list:async()=>({data:[{status}]})}};}
test('full refunds revoke paid invoice access',async()=>{assert.equal(await invoiceRevoked(client({refunded:true}),{id:'in_1',status:'paid'}),true)});
test('open or lost disputes revoke access but won disputes restore it',async()=>{const charge={id:'ch_1',disputed:true};assert.equal(await invoiceRevoked(client(charge),{id:'in_1',status:'paid'}),true);assert.equal(await invoiceRevoked(client(charge,'won'),{id:'in_1',status:'paid'}),false)});

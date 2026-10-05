import {test} from 'node:test';
import assert from 'node:assert/strict';
import {subscriptionState} from '../api/_lib/subscriptionState.js';
const sub={status:'active',latest_invoice:{status:'paid'},items:{data:[{current_period_end:1800000000}]}};
test('access requires a paid invoice',()=>{assert.equal(subscriptionState({...sub,latest_invoice:{status:'open'}}).paid_until,null);assert.equal(subscriptionState(sub).paid_until,new Date(1800000000000).toISOString())});
test('past due grace is based on last paid period and does not repeatedly extend',()=>{const prior='2026-10-01T00:00:00.000Z';const a=subscriptionState({...sub,status:'past_due',latest_invoice:{status:'open'}},prior);assert.equal(a.paid_until,'2026-10-04T00:00:00.000Z');assert.deepEqual(subscriptionState({...sub,status:'past_due',latest_invoice:{status:'open'}},a.last_paid_until),a)});
test('failed first payment and cancelled subscription do not grant access',()=>{assert.equal(subscriptionState({...sub,status:'past_due',latest_invoice:{status:'open'}}).paid_until,null);assert.equal(subscriptionState({...sub,status:'canceled'}).paid_until,null)});

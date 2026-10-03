import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nativeAccess} from '../api/_lib/nativeAccess.js';
const value={subscriber:{entitlements:{momentum60:{product_identifier:'monthly',expires_date:'2099-01-01T00:00:00Z'}},subscriptions:{monthly:{is_sandbox:false}}}};
test('only allowed native products grant access',()=>{assert.equal(nativeAccess(value,['monthly']),'2099-01-01T00:00:00Z');assert.equal(nativeAccess(value,[]),null)});
test('production rejects sandbox and refund receipts',()=>{const copy=structuredClone(value);copy.subscriber.subscriptions.monthly.is_sandbox=true;assert.equal(nativeAccess(copy,['monthly']),null);assert.ok(nativeAccess(copy,['monthly'],true));copy.subscriber.subscriptions.monthly.refunded_at='2026-01-01';assert.equal(nativeAccess(copy,['monthly'],true),null)});

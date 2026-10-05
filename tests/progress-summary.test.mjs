import { test } from 'node:test';
import assert from 'node:assert/strict';
import { progressSummary } from '../src/lib/progressSummary.js';
const rules=[{id:'a'},{id:'b'}];
test('a gap does not hide subsequent actions',()=>{const r=progressSummary({1:{a:true},3:{b:true}},rules,4);assert.equal(r.actionDays,2);assert.equal(r.returning,false)});
test('a return invitation disappears after today action',()=>{assert.equal(progressSummary({},rules,3).returning,true);assert.equal(progressSummary({3:{a:true}},rules,3).returning,false)});
test('legacy earned passes remain distinct from real action days',()=>{const data=Object.fromEntries(Array.from({length:10},(_,i)=>[i+1,{a:true,b:true}]));const r=progressSummary(data,rules,12);assert.equal(r.actionDays,10);assert.equal(r.earnedPasses,1);assert.equal(r.returning,true)});
test('empty rule lists never create achievements',()=>{assert.equal(progressSummary({},[],20).earnedPasses,0)});

test('legacy sixty-day reward survives one consumed pass',()=>{const data=Object.fromEntries(Array.from({length:60},(_,i)=>[i+1,{a:true,b:true}]));delete data[11];const result=progressSummary(data,rules,60);assert.equal(result.actionDays,59);assert.equal(result.legacyRewardDays,60)});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../src/context/AuthContext.jsx',import.meta.url),'utf8');
const body=source.split('  const toggleDayItem = async (dayIndex, itemId) => {')[1].split('\n  // Containment')[0].replace(/\n  };\s*$/,'');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
function fixture(response){let state={},error=null,calls=0;const currentUserId={current:'a'},progressWrites={current:new Set()};const query={select:async()=>{calls++;return typeof response==='function'?response():response},match(){return this}};const supabase={from:()=>({insert:()=>query,delete:()=>query})};const run=new AsyncFunction('dayIndex','itemId','user','userData','supabase','progressWrites','currentUserId','setUserData','setSaveError',body);return {toggle:()=>run(1,'rule1',{id:'a'},state,supabase,progressWrites,currentUserId,x=>state=x(state),x=>error=x),state:()=>state,error:()=>error,calls:()=>calls,currentUserId};}
test('denied writes do not mark a day complete',async()=>{const f=fixture({error:{message:'denied'}});assert.equal((await f.toggle()).success,false);assert.deepEqual(f.state(),{});assert.match(f.error(),/could not be saved/)});
test('zero affected rows are not reported as saved',async()=>{const f=fixture({data:[]});assert.equal((await f.toggle()).success,false)});
test('confirmed writes toggle on and off',async()=>{const f=fixture({data:[{id:'x'}]});assert.equal((await f.toggle()).success,true);assert.equal(f.state()[1].rule1,true);await f.toggle();assert.equal(f.state()[1].rule1,false)});
test('rapid duplicate taps are blocked and account changes ignore old writes',async()=>{let finish;const f=fixture(()=>new Promise(r=>finish=r));const first=f.toggle();assert.equal((await f.toggle()).success,false);f.currentUserId.current='b';finish({data:[{id:'x'}]});assert.equal((await first).success,false);assert.deepEqual(f.state(),{});assert.equal(f.calls(),1)});
test('reset has no database deletion',()=>{const reset=source.split('  const resetProgress =')[1].split('  const startChallenge')[0];assert.doesNotMatch(reset,/supabase|\.delete\(/);assert.match(reset,/success: false/)});

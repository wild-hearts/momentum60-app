import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createJournalQueue } from '../src/lib/journalQueue.js';
test('newer text waits for old write and is sent last', async () => {
 const writes=[], statuses=[];let finish;
 const q=createJournalQueue({delay:10000,status:(k,s)=>statuses.push(s),write:async(k,v)=>{writes.push(v);if(v==='old')await new Promise(r=>finish=r)}});
 q.enqueue('1','old');const first=q.flush('1');q.enqueue('1','new');assert.deepEqual(writes,['old']);finish();await first;await new Promise(r=>setImmediate(r));assert.deepEqual(writes,['old','new']);assert.equal(statuses.at(-1),'saved');q.close();
});
test('a failed write stays retryable',async()=>{let fail=true;const states=[];const q=createJournalQueue({delay:10000,status:(k,s)=>states.push(s),write:async()=>{if(fail)throw Error()}});q.enqueue('1','draft');await q.flush('1');assert.equal(states.at(-1),'failed');fail=false;await q.flush('1');assert.equal(states.at(-1),'saved');q.close()});
test('closing cancels queued work and ignores late success',async()=>{let finish;const states=[];const q=createJournalQueue({delay:10000,status:(k,s)=>states.push(s),write:()=>new Promise(r=>finish=r)});q.enqueue('1','private');const pending=q.flush('1');q.close();finish();await pending;assert.equal(states.at(-1),'saving');q.enqueue('2','other');assert.equal(states.length,2)});

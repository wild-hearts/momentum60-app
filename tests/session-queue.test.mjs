import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSessionQueue} from '../src/lib/sessionQueue.js';
test('new login waits for device cleanup and old sign-out before creating its session',async()=>{
 const queue=createSessionQueue(),events=[];let finishCleanup;
 const cleanup=new Promise(resolve=>finishCleanup=resolve);
 const logout=queue.run(async()=>{events.push('cleanup');await cleanup;events.push('old logout')});
 const login=queue.run(async()=>events.push('new login'));
 await Promise.resolve();assert.deepEqual(events,['cleanup']);
 finishCleanup();await Promise.all([logout,login]);
 assert.deepEqual(events,['cleanup','old logout','new login']);
});
test('failed cleanup does not permanently prevent a later auth attempt',async()=>{
 const queue=createSessionQueue();await assert.rejects(queue.run(async()=>{throw Error('failed')}));
 assert.equal(await queue.run(async()=> 'signed in'),'signed in');
});

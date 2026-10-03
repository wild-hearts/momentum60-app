import {test} from 'node:test';
import assert from 'node:assert/strict';
import {clearAccountStorage} from '../src/lib/devicePrivacy.js';
test('sign-out/deletion removes every owned snapshot and draft without erasing another account', () => {
  const values = new Map([['m60:snapshot:a','private'],['momentum60:draft:a:old:1','old'],['momentum60:draft:a:new:2','new'],['m60:snapshot:ab','other'],['momentum60:draft:ab:old:1','other'],['momentum60:sounds','on']]);
  const storage = {get length(){return values.size},key:i=>[...values.keys()][i],removeItem:key=>values.delete(key)};
  clearAccountStorage(storage,'a');
  assert.deepEqual([...values.keys()],['m60:snapshot:ab','momentum60:draft:ab:old:1','momentum60:sounds']);
  clearAccountStorage(storage,'a');
  assert.equal(values.size,3);
});
test('storage cleanup failure is surfaced rather than claiming deletion succeeded', () => {
  assert.throws(()=>clearAccountStorage({length:1,key:()=> 'm60:snapshot:a',removeItem(){throw Error('Storage denied')}},'a'),/Storage denied/);
});

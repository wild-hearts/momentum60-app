import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanEmail, passwordChangeMessage } from '../src/lib/passwordMessages.js';
test('a trailing space from the keyboard is removed from the email',()=>{assert.equal(cleanEmail(' me@example.com '),'me@example.com');assert.equal(cleanEmail(undefined),'')});
test('the same password again is explained',()=>{assert.match(passwordChangeMessage({code:'same_password'}),/same as your current/);assert.match(passwordChangeMessage({message:'New password should be different from the old password.'}),/same as your current/)});
test('a weak password is explained',()=>{assert.match(passwordChangeMessage({code:'weak_password'}),/too easy to guess/)});
test('an old sign-in is explained',()=>{assert.match(passwordChangeMessage({code:'reauthentication_needed'}),/sign back in/);assert.match(passwordChangeMessage({message:'Auth session missing!'}),/run out/)});
test('anything else keeps the original reason',()=>{assert.equal(passwordChangeMessage({message:'Boom'}),'That did not save (Boom). Please try again.');assert.equal(passwordChangeMessage(null),'That did not save. Please try again.')});

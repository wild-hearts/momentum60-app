import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planReminders, reminderLine, allReminderIds, FIRST_ID } from '../src/lib/reminderPlan.js';
const morning=new Date(2026,9,23,9,0);
test('two weeks of nudges at the chosen time, each day with its own line',()=>{
 const plan=planReminders(morning,'18:30',{day:5,doneToday:false});
 assert.equal(plan.length,14);assert.equal(plan[0].id,FIRST_ID);assert.equal(plan[0].at.getHours(),18);assert.equal(plan[0].at.getMinutes(),30);
 assert.equal(plan[0].body,reminderLine(5));assert.notEqual(plan[0].body,plan[1].body);
});
test('no nudge today once today is recorded, and none for a time already passed',()=>{
 assert.equal(planReminders(morning,'18:00',{day:5,doneToday:true})[0].at.getDate(),24);
 assert.equal(planReminders(morning,'08:00',{day:5,doneToday:false})[0].at.getDate(),24);
});
test('nothing is booked after day sixty',()=>{
 const plan=planReminders(morning,'18:00',{day:58,doneToday:false});assert.equal(plan.length,3);
 assert.deepEqual(planReminders(morning,'18:00',{day:61,doneToday:false}),[]);
});
test('a broken time books nothing, and turning off clears the old single reminder too',()=>{
 assert.deepEqual(planReminders(morning,'25:00',{day:1,doneToday:false}),[]);
 assert.ok(allReminderIds().includes(1));assert.equal(allReminderIds().length,15);
});

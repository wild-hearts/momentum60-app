import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localDate, seasonCalendar } from '../src/lib/seasonCalendar.js';
test('Sydney DST uses local dates rather than elapsed hours',()=>{const before=localDate(new Date('2026-10-03T14:30:00Z'),'Australia/Sydney');const after=localDate(new Date('2026-10-04T13:30:00Z'),'Australia/Sydney');assert.equal(before,'2026-10-04');assert.equal(after,'2026-10-05');assert.equal(seasonCalendar({startDate:before,today:after}).day,2)});
test('overlapping pause and outage is counted once',()=>{assert.deepEqual(seasonCalendar({startDate:'2026-10-01',today:'2026-10-03',pausedDates:['2026-10-02'],outageDates:['2026-10-02']}),{day:2,elapsedDays:3,ended:false,suspended:false})});
test('leap day and programme end are distinct',()=>{assert.equal(seasonCalendar({startDate:'2024-02-28',today:'2024-03-01'}).day,3);assert.equal(seasonCalendar({startDate:'2026-01-01',today:'2026-03-01'}).ended,false);assert.equal(seasonCalendar({startDate:'2026-01-01',today:'2026-03-02'}).ended,true)});
test('invalid dates rejected and future starts not active',()=>{assert.throws(()=>seasonCalendar({startDate:'2026-02-30',today:'2026-03-02'}));assert.equal(seasonCalendar({startDate:'2026-10-04',today:'2026-10-03'}).day,0)});

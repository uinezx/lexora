import {test} from 'node:test';
import assert from 'node:assert/strict';
import {schedule,DAY,parseWords,streak,dateKey,normalize} from '../dist/engine.js';
test('SRS failure schedules one minute, resets repetitions and clamps ease',()=>{const c=schedule({reps:5,interval:30,ease:1.3},'again',1000);assert.equal(c.due,61000);assert.equal(c.reps,0);assert.equal(c.ease,1.3);});
test('SRS successive good answers expand the interval',()=>{let c={reps:0,interval:0,ease:2.5};c=schedule(c,'good',0);assert.equal(c.interval,1);c=schedule(c,'good',0);assert.equal(c.interval,4);c=schedule(c,'good',0);assert.equal(c.interval,10);assert.equal(c.due,10*DAY);});
test('import preserves multiword phrases and detects incomplete lines',()=>{const r=parseWords('take into account\thisobga olmoq\tWe take cost into account.\nresilient ; bardoshli\nbroken');assert.equal(r.rows.length,2);assert.equal(r.rows[0].word,'take into account');assert.deepEqual(r.errors,[3]);});
test('streak handles month boundary and yesterday activity',()=>{const now=new Date(2026,10,1,12),log={'2026-10-31':2,'2026-10-30':1};assert.equal(streak(log,now),2);assert.equal(dateKey(now),'2026-11-01');});
test('answer matching normalizes case, spaces and Uzbek apostrophes',()=>{assert.equal(normalize('  HELLO '),'hello');assert.equal(normalize('o‘qish'),normalize("o'qish"));});

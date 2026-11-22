import {test} from 'node:test';import assert from 'node:assert/strict';
import {testDuration} from '../dist/review-engine.js';
test('longer answers and multiword phrases receive more time; spelling receives extra time',()=>{
 assert.equal(testDuration('cat','write'),12);
 assert.ok(testDuration('opportunity','write')>testDuration('cat','write'));
 assert.ok(testDuration('take part','write')>testDuration('takepart','write'));
 assert.ok(testDuration('opportunity','write')>testDuration('opportunity','choice'));
});
test('timing handles normalized characters, optional extra time, limits and untimed mode',()=>{
 assert.equal(testDuration('café'),testDuration('cafe\u0301'));
 assert.equal(testDuration('hello','write',0),0);
 assert.ok(testDuration('hello','write',30)>testDuration('hello','write',15));
 assert.equal(testDuration('a'.repeat(500)),90);assert.equal(testDuration('a'.repeat(500),'write',30),120);
 assert.ok(Number.isFinite(testDuration(null)));assert.equal(testDuration('!!!'),8);
});

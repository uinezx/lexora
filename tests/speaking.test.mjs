import {speakingTopics} from '../dist/practice-library.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
function fixture(getUserMedia){
 const elements=new Map();for(const id of ['#speaking-area','#recorder-controls','#speaking-type','#record-start','#record-stop','#record-delete','#recording-clock'])elements.set(id,{innerHTML:'',addEventListener(){},disabled:false});
 const source=readFileSync(new URL('../dist/speaking.js',import.meta.url),'utf8').replace(/^import .*;$/gm,'').replaceAll('export function ','function ')+ '\n globalThis.testHooks={start,leaveSpeaking,status:()=>({phase,starting,error})};';
 class Recorder {static isTypeSupported(){return true;}constructor(){this.state='inactive';this.mimeType='audio/webm';}start(){this.state='recording';}stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['audio-fixture'])});this.onstop?.();}}
 const context={leaveGuide(){},topics:speakingTopics,createPronunciation:()=>({stop(){},speak(){}}),document:{querySelector:s=>elements.get(s)||null},navigator:{mediaDevices:{getUserMedia}},MediaRecorder:Recorder,Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setInterval:()=>1,clearInterval(){},console,window:{MediaRecorder:Recorder,addEventListener(){},confirm:()=>true}};
 vm.runInNewContext(source,context);return {hooks:context.testHooks,elements};
}
test('leaving during microphone permission closes a late stream and never records',async()=>{let resolve,stopped=0;const f=fixture(()=>new Promise(r=>resolve=r));const pending=f.hooks.start();assert.equal(f.hooks.status().starting,true);f.hooks.leaveSpeaking();resolve({getTracks:()=>[{stop(){stopped++;}}]});await pending;assert.equal(stopped,1);assert.equal(f.hooks.status().starting,false);assert.equal(f.hooks.status().phase,'idle');});
test('leaving while recording releases microphone tracks and retains local playback',async()=>{let stopped=0;const f=fixture(async()=>({getTracks:()=>[{stop(){stopped++;}}]}));await f.hooks.start();assert.equal(f.hooks.status().phase,'recording');f.hooks.leaveSpeaking();assert.ok(stopped>=1);assert.equal(f.hooks.status().phase,'ready');assert.match(f.elements.get('#recorder-controls').innerHTML,/<audio controls/);});
test('denied microphone permission gives a recoverable error',async()=>{const f=fixture(async()=>{throw Object.assign(new Error('denied'),{name:'NotAllowedError'});});await f.hooks.start();assert.equal(f.hooks.status().phase,'idle');assert.equal(f.hooks.status().starting,false);assert.match(f.hooks.status().error,/ruxsat berilmadi/);});

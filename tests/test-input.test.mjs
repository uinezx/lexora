import {test} from 'node:test';
import assert from 'node:assert/strict';
import {protectTestInput,watchTestExit} from '../dist/test-input.js';
class Field extends EventTarget {
 value='predct'; selectionStart=6; selectionEnd=6; attributes={};
 setAttribute(k,v){this.attributes[k]=v;}
 setSelectionRange(a,b){this.selectionStart=a;this.selectionEnd=b;}
 focus(){this.focused=true;}
}
function edit(target,type,extra={}){const ev=new Event(type,{cancelable:true});Object.assign(ev,extra);target.dispatchEvent(ev);return ev;}
test('test field focuses immediately and rejects a keyboard replacement silently',()=>{
 const f=new Field(),dispose=protectTestInput(f);
 assert.equal(f.focused,true);
 assert.equal(edit(f,'beforeinput',{inputType:'insertReplacementText',data:'predict'}).defaultPrevented,true);
 assert.equal(f.value,'predct');
 dispose();assert.equal(edit(f,'beforeinput',{inputType:'insertReplacementText'}).defaultPrevented,false);
});
test('noncancelable keyboard correction is reverted, normal typing and composition survive',()=>{
 const f=new Field();protectTestInput(f);
 f.value='predict';edit(f,'input',{inputType:'insertReplacementText'});assert.equal(f.value,'predct');
 edit(f,'beforeinput',{inputType:'insertText',data:'s'});f.value='predcts';edit(f,'input',{inputType:'insertText'});
 edit(f,'beforeinput',{inputType:'insertReplacementText'});f.value='predicts';edit(f,'input',{inputType:'insertReplacementText'});assert.equal(f.value,'predcts');
 edit(f,'compositionstart');f.value='salom';edit(f,'input',{inputType:'insertCompositionText',isComposing:true});edit(f,'compositionend');assert.equal(f.value,'salom');
});
test('only leaving the document counts, not keyboard focus; listeners clean up',()=>{
 const doc=new EventTarget(),win=new EventTarget();doc.hidden=false;let leaves=0;
 const dispose=watchTestExit(doc,win,()=>leaves++);
 edit(win,'blur');assert.equal(leaves,0);
 doc.hidden=true;edit(doc,'visibilitychange');edit(win,'pagehide');assert.equal(leaves,1);
 dispose();edit(win,'pagehide');assert.equal(leaves,1);
});

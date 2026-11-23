// Keyboard vendors expose corrections differently. Block explicit replacements
// before they land, and roll back noncancelable replacements after input.
// Do not guess from word length: that would break IME and accessibility input.
export function protectTestInput(input){
 if(!input)return ()=>{};
 for(const [key,value] of Object.entries({autocomplete:'off',autocorrect:'off',autocapitalize:'off',spellcheck:'false',writingsuggestions:'false',inputmode:'text',enterkeyhint:'done'}))input.setAttribute(key,value);
 let accepted=input.value,start=input.selectionStart,end=input.selectionEnd,composing=false;
 const remember=()=>{accepted=input.value;start=input.selectionStart;end=input.selectionEnd;};
 const restore=()=>{input.value=accepted;try{input.setSelectionRange(start,end);}catch{}};
 const replacement=ev=>ev.inputType==='insertReplacementText';
 const before=ev=>{if(replacement(ev)){if(ev.cancelable)ev.preventDefault();return;}remember();};
 const changed=ev=>{if(replacement(ev)&&!composing){restore();return;}remember();};
 const compositionStart=()=>{composing=true;};
 const compositionEnd=()=>{composing=false;remember();};
 input.addEventListener('beforeinput',before);input.addEventListener('input',changed);
 input.addEventListener('compositionstart',compositionStart);input.addEventListener('compositionend',compositionEnd);
 input.focus({preventScroll:true});
 return ()=>{input.removeEventListener('beforeinput',before);input.removeEventListener('input',changed);input.removeEventListener('compositionstart',compositionStart);input.removeEventListener('compositionend',compositionEnd);};
}
export function watchTestExit(doc,win,onLeave,onReturn=()=>{}){
 let left=false;
 const leave=()=>{if(left)return;left=true;onLeave();};
 const hidden=()=>{if(doc.hidden)leave();else if(left)onReturn();};
 doc.addEventListener('visibilitychange',hidden);win.addEventListener('pagehide',leave);
 return ()=>{doc.removeEventListener('visibilitychange',hidden);win.removeEventListener('pagehide',leave);};
}

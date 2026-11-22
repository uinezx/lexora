export function englishVoices(synth=globalThis.speechSynthesis){return (synth?.getVoices()||[]).filter(v=>/^en(?:-|_)/i.test(v.lang));}
export function chooseVoice(voices,prefs){const english=voices.filter(v=>/^en(?:-|_)/i.test(v.lang));return english.find(v=>v.voiceURI===prefs.voiceURI)||english.find(v=>v.lang.toLowerCase()===prefs.accent.toLowerCase()&&/natural|google|online/i.test(v.name))||english.find(v=>v.lang.toLowerCase()===prefs.accent.toLowerCase())||english[0]||null;}
function safeAudio(url){try{const u=new URL(url);return u.protocol==='https:'&&['api.dictionaryapi.dev','upload.wikimedia.org'].includes(u.hostname);}catch{return false;}}
export async function resolveRecording(text,accent,fetcher,signal){
 const response=await fetcher('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(text),{signal});if(!response.ok)throw Error('missing');const data=await response.json(),rows=(Array.isArray(data)?data:[data]).flatMap(entry=>entry.phonetics||[]).filter(p=>safeAudio(p.audio));
 const suffix=accent==='en-GB'?'-uk.':'-us.',chosen=rows.find(p=>p.audio.includes(suffix))||rows[0];if(!chosen)throw Error('missing');
 let result={audio:chosen.audio,source:chosen.sourceUrl,license:chosen.license,name:'Inglizcha talaffuz · Free Dictionary'};
 // Resolve the original Commons recording: old dictionary audio mirrors may return 404.
 try{const source=new URL(chosen.sourceUrl),page=source.searchParams.get('curid');if(source.hostname==='commons.wikimedia.org'&&/^\d+$/.test(page||'')){
  const response=await fetcher('https://commons.wikimedia.org/w/api.php?action=query&pageids='+page+'&prop=imageinfo&iiprop=url%7Cextmetadata&format=json&origin=*',{signal});if(response.ok){const data=await response.json(),info=data.query?.pages?.[page]?.imageinfo?.[0];if(info&&safeAudio(info.url)){const url=new URL(info.url);url.search='';const meta=info.extmetadata||{},artist=(meta.Artist?.value||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&');result={audio:url.href,source:info.descriptionurl||chosen.sourceUrl,license:{name:meta.LicenseShortName?.value||chosen.license?.name||'License',url:(meta.LicenseUrl?.value||chosen.license?.url||'').replace(/^http:/,'https:')},name:'Yozib olingan inglizcha talaffuz'+(artist?' · '+artist:'')};}}
 }}catch(err){if(signal?.aborted)throw err;}
 return result;
}
export function createPronunciation({getPreferences,onError=()=>{},onStatus=()=>{},onSource=()=>{},synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,fetcher=globalThis.fetch,AudioClass=globalThis.Audio}={}){
 let generation=0,current=null,watchdog=null,audio=null,controller=null;const recordings=new Map();
 function stop(){generation++;clearTimeout(watchdog);current=null;controller?.abort();controller=null;if(audio){audio.pause();audio.src='';audio=null;}synth?.cancel();onStatus(false);}
 async function recording(text,prefs,request){
  try{const key=prefs.accent+':'+text.toLowerCase();let result=recordings.get(key);if(!result){const pending=new AbortController();controller=pending;const timeout=setTimeout(()=>pending.abort(),8000);try{result=await resolveRecording(text,prefs.accent,fetcher,pending.signal);recordings.set(key,result);}finally{clearTimeout(timeout);if(controller===pending)controller=null;}}
   if(request!==generation)return false;if(!AudioClass)throw Error('unsupported');audio=new AudioClass(result.audio);audio.playbackRate=prefs.rate;
   audio.onended=()=>{if(request===generation)onStatus(false);};audio.onerror=()=>{if(request===generation){onStatus(false);onError('Talaffuz yozuvi yuklanmadi. Internetni tekshirib qayta bosing.');}};onSource(result);await audio.play();if(request===generation)onStatus(true);return true;
  }catch(err){if(request!==generation)return false;onStatus(false);onError(err.name==='NotAllowedError'?'Talaffuz tayyor. Eshitish uchun tugmani yana bosing.':err.message==='missing'?'Bu ibora uchun yozuv topilmadi. Iboralarni ham eshitish uchun qurilmada English ovozi bo‘lishi kerak.':'Talaffuz ijro etilmadi. Internetni tekshiring yoki sozlamada boshqa inglizcha ovoz tanlang.');return false;}
 }
 async function speak(text,override={}){stop();const request=generation;let voices=englishVoices(synth);
  if(synth&&!voices.length)await new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timeout);synth.removeEventListener?.('voiceschanged',changed);resolve();};const changed=()=>{if(englishVoices(synth).length)finish();};const timeout=setTimeout(finish,900);synth.addEventListener?.('voiceschanged',changed);changed();});
  if(request!==generation)return false;voices=englishVoices(synth);const prefs={...getPreferences(),...override},voice=chooseVoice(voices,prefs);
  if(!voice||!Utterance)return recording(String(text),prefs,request);
  onSource({name:voice.name+' · '+voice.lang});const utterance=new Utterance(String(text));current=utterance;utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=prefs.rate;utterance.pitch=1;utterance.volume=1;
  const finish=()=>{if(request!==generation)return;clearTimeout(watchdog);current=null;onStatus(false);};utterance.onstart=()=>{clearTimeout(watchdog);if(request===generation)onStatus(true);};utterance.onend=finish;
  utterance.onerror=ev=>{finish();if(request===generation&&!['interrupted','canceled'].includes(ev.error))recording(String(text),prefs,request);};
  synth.resume?.();watchdog=setTimeout(()=>{if(request===generation&&current===utterance){synth.cancel();current=null;recording(String(text),prefs,request);}},5000);synth.speak(utterance);return true;
 }
 return {speak,stop,voices:()=>englishVoices(synth)};
}

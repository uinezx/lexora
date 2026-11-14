const topics=[
 {type:'Qisqa javob · 60 soniya',seconds:60,title:'What do you enjoy about learning English?',points:['Give a clear answer.','Explain why.','Add one example from your own life.']},
 {type:'IELTS Part 2 · 120 soniya',seconds:120,title:'Describe a skill you would like to learn.',points:['What the skill is.','Why you want to learn it.','How you would start learning it.','Explain how it could help you in the future.']},
 {type:'IELTS Part 3 · 90 soniya',seconds:90,title:'How has technology changed the way people learn?',points:['State your view.','Compare the past and the present.','Support your answer with an example.']}
];
let selected=0,recorder=null,stream=null,timer=null,seconds=0,phase='idle',recordingUrl='',recordingType='',error='',starting=false,generation=0;
const $=s=>document.querySelector(s),clock=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
export function speakingView(){const t=topics[selected];return `<div class="page-heading"><div><span class="eyebrow">OG‘ZAKI MASHQ</span><h1>Speaking</h1><p>Javobingizni yozing. Tinglang. Keyingi urinishda yaxshilang.</p></div><span class="pill">Shaxsiy mashq</span></div><div class="speaking-layout"><section class="panel"><label>Mashq turi<select class="speaking-type" id="speaking-type" ${phase==='recording'||starting?'disabled':''}>${topics.map((x,i)=>`<option value="${i}" ${selected===i?'selected':''}>${x.type}</option>`).join('')}</select></label><div class="recording-stage" id="speaking-area"><span class="prompt-tag">YOUR QUESTION</span><h2>${t.title}</h2><div id="recorder-controls">${controls()}</div></div></section><aside><section class="panel"><span class="eyebrow">JAVOBNI TUZISH UCHUN</span><h2>Nimalarni aytish mumkin?</h2><ul class="prompt-help">${t.points.map(p=>`<li>${p}</li>`).join('')}</ul><div class="quiet-note">Javobni avval qisqa rejalashtiring. Tayyor matnni o‘qishdan ko‘ra, fikringizni o‘z so‘zlaringiz bilan aytishga harakat qiling.</div></section><div class="quiet-note"><b>Yozuv shu sessiyada qoladi.</b><br>Ovoz serverga yuborilmaydi. Saqlab qolish uchun audio faylni yuklab oling. Sahifani yopish yoki yangilash yozuvni yo‘qotadi.</div><div class="notice">Ustozga topshirish va avtomatik baholash hali ulanmagan. Bu mashq uchun XP yoki IELTS band bahosi berilmaydi.</div></aside></div>`;}
function controls(){return `<div class="recording-clock" id="recording-clock">${clock(seconds)}</div><p id="recording-status">${starting?'Mikrofonga ruxsat kutilmoqda…':phase==='recording'?'<span class="recording-light"></span>Ovoz yozilyapti':phase==='ready'?'Javobingizni tinglab, o‘zingiz baholang.':'Tayyor bo‘lgach yozishni boshlang.'}</p>${recordingUrl?`<audio controls src="${recordingUrl}"></audio>`:''}<div class="buttons">${phase==='recording'?'<button type="button" class="btn primary" id="record-stop">To‘xtatish</button>':`<button type="button" class="btn primary" id="record-start" ${starting?'disabled':''}>${recordingUrl?'Yangi urinish':'Ovoz yozish'}</button>`}${recordingUrl&&phase!=='recording'?`<a class="btn" href="${recordingUrl}" download="lexora-speaking.${recordingType.includes('mp4')?'m4a':recordingType.includes('ogg')?'ogg':'webm'}">Audioni saqlash ↓</a><button type="button" class="text-btn" id="record-delete">Yozuvni o‘chirish</button>`:''}</div><p class="error" id="recording-error">${error}</p>`;}
function update(){if(!$('#recorder-controls'))return;$('#recorder-controls').innerHTML=controls();bind();if($('#speaking-type'))$('#speaking-type').disabled=phase==='recording'||starting;}
function release(){clearInterval(timer);timer=null;stream?.getTracks().forEach(t=>t.stop());stream=null;}
function stop(){if(recorder?.state==='recording')recorder.stop();release();}
async function start(){if(starting||phase==='recording')return;if(recordingUrl&&!window.confirm('Yangi urinish oldingi yozuvni almashtiradi. Davom etasizmi?'))return;
 const attempt=++generation;starting=true;error='';update();
 try {
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw new Error('unsupported');
  const input=await navigator.mediaDevices.getUserMedia({audio:true});
  if(attempt!==generation||!$('#speaking-area')){input.getTracks().forEach(t=>t.stop());return;}
  stream=input;
  const mime=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(t=>MediaRecorder.isTypeSupported(t));
  recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);
  const chunks=[];
  recorder.ondataavailable=ev=>{if(ev.data.size)chunks.push(ev.data);};
  recorder.onstop=()=>{release();if(attempt!==generation)return;const blob=new Blob(chunks,{type:recorder.mimeType});if(recordingUrl)URL.revokeObjectURL(recordingUrl);recordingType=blob.type;recordingUrl=blob.size?URL.createObjectURL(blob):'';phase=recordingUrl?'ready':'idle';if(!blob.size)error='Ovoz yozilmadi. Mikrofonni tekshirib qayta urinib ko‘ring.';update();};
  recorder.onerror=()=>{error='Yozishda xato bo‘ldi. Mikrofonni tekshiring.';stop();};
  recorder.start();seconds=0;phase='recording';starting=false;update();const started=Date.now();
  timer=setInterval(()=>{seconds=Math.min(topics[selected].seconds,Math.floor((Date.now()-started)/1000));if($('#recording-clock'))$('#recording-clock').textContent=clock(seconds);if(seconds>=topics[selected].seconds)stop();},250);
 }catch(err){if(attempt!==generation)return;release();phase=recordingUrl?'ready':'idle';error=err.message==='unsupported'?'Bu brauzer ovoz yozishni qo‘llamaydi. Yangilangan Chrome, Edge yoki Safari’dan foydalaning.':err.name==='NotAllowedError'?'Mikrofonga ruxsat berilmadi. Brauzer sozlamasida ruxsatni yoqib, qayta urinib ko‘ring.':'Mikrofon topilmadi yoki boshqa dastur ishlatyapti.';}
 finally{if(attempt===generation){starting=false;update();}}
}
function bind(){$('#record-start')?.addEventListener('click',start);$('#record-stop')?.addEventListener('click',stop);$('#record-delete')?.addEventListener('click',()=>{if(recordingUrl)URL.revokeObjectURL(recordingUrl);recordingUrl='';phase='idle';seconds=0;error='';update();});}
export function mountSpeaking(){bind();$('#speaking-type').onchange=ev=>{if(recordingUrl){ev.target.value=String(selected);error='Boshqa mashqni tanlashdan oldin yozuvni saqlang yoki o‘chiring.';update();return;}selected=Number(ev.target.value);seconds=0;error='';const app=$('#app');app.innerHTML=speakingView();mountSpeaking();};}
export function leaveSpeaking(){if(starting){generation++;starting=false;}stop();}
window.addEventListener('pagehide',()=>{generation++;release();if(recorder?.state==='recording')recorder.stop();if(recordingUrl)URL.revokeObjectURL(recordingUrl);});

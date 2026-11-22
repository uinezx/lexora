// Bot chat onboarding. Only Telegram-authenticated private updates reach this handler.
import {classroom,APIError} from '../worker/classroom.js';
export async function botSecret(token){
 const e=new TextEncoder(),key=await crypto.subtle.importKey('raw',e.encode(token),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,e.encode('lexora-webhook-v1'))),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function telegramUpdate(update,env,origin){
 const m=update.message;
 if(!m||m.chat?.type!=='private'||!Number.isSafeInteger(m.from?.id)||m.from.is_bot||m.chat.id!==m.from.id)return {ok:true};
 const id='tg:'+m.from.id,db=env.DB,q=(sql,...a)=>db.prepare(sql).bind(...a),text=(m.text||'').trim();
 const reply=(text,reply_markup={remove_keyboard:true})=>({method:'sendMessage',chat_id:m.chat.id,text,reply_markup});
 const roles=()=>reply('Rolingizni tanlang:',{keyboard:[[{text:'O‘quvchi'},{text:'O‘qituvchi'}]],resize_keyboard:true,one_time_keyboard:true});
 const contact=()=>reply('Telefoningizni tasdiqlang. Bir raqam — bitta profil.',{keyboard:[[{text:'Raqamni ulashish',request_contact:true}]],resize_keyboard:true,one_time_keyboard:true});
 const open=(name,status)=>reply(`${name}, ${status==='pending'?'arizangiz admin tasdig‘ini kutmoqda.':'hisobingiz tayyor.'} Kabinetni ochishingiz mumkin.`,{inline_keyboard:[[{text:'Lexorani ochish',web_app:{url:origin}}]]});
 let account=await q('SELECT * FROM accounts WHERE id=?',id).first(),phone=await q('SELECT user_id FROM telegram_phones WHERE user_id=?',id).first();
 let state=await q('SELECT * FROM telegram_onboarding WHERE user_id=?',id).first();
 const save=async(step,role=state?.role||'',name=state?.name||'')=>{await q('INSERT INTO telegram_onboarding(user_id,step,role,name,updated) VALUES(?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET step=excluded.step,role=excluded.role,name=excluded.name,updated=excluded.updated',id,step,role,name,Date.now()).run();state={step,role,name};};
 if(account&&phone){
  const call=(path,body)=>classroom(new Request(origin+'/api/classroom'+path,{method:body===undefined?'GET':'POST',headers:{origin,'content-type':'application/json','oai-authenticated-user-id':id},body:body===undefined?undefined:JSON.stringify(body)}),env);
  if(account.role==='student'&&account.status==='active'){
   if(/^\/(tasks|vazifalar)(?:@\w+)?$/.test(text)||text==='Vazifalar'){
    const tasks=(await call('/assignments')).assignments;if(!tasks.length)return reply('Hozircha yangi vazifa yo‘q.');
    await save('task-list','',JSON.stringify(tasks.map(t=>t.id)));return reply('Vazifani tanlang:',{keyboard:tasks.slice(0,20).map((t,i)=>[{text:(i+1)+'. '+t.title.slice(0,45)}]),resize_keyboard:true,one_time_keyboard:true});
   }
   if(!text.startsWith('/')&&state?.step==='task-list'){
    const ids=JSON.parse(state.name),choice=Number(text.match(/^([0-9]+)\./)?.[1])-1,aid=ids[choice];if(!aid)return reply('Ro‘yxatdagi vazifani tanlang yoki /tasks yuboring.');
    await save('task:'+aid+':0','',JSON.stringify([]));const {task}=await call('/assignments/'+aid),question=task.questions[0];return reply(task.title+'\n\n'+question.prompt,question.type==='choice'?{keyboard:question.options.map((x,i)=>[{text:(i+1)+'. '+x.slice(0,100)}]),resize_keyboard:true,one_time_keyboard:true}:{remove_keyboard:true});
   }
   if(!text.startsWith('/')&&state?.step.startsWith('task:')){
    const [,aid,rawIndex]=state.step.split(':'),index=Number(rawIndex);let task;try{task=(await call('/assignments/'+aid)).task;}catch{return reply('Vazifa ochilmadi. /tasks orqali qayta tanlang.');}
    const question=task.questions[index],answers=JSON.parse(state.name);let answer=text;
    if(question.type==='choice'){const selected=Number(text.match(/^([0-9]+)(?:\.|$)/)?.[1])-1;if(!Number.isInteger(selected)||selected<0||selected>=question.options.length)return reply('Variant raqamini yuboring.');answer=String(selected);}
    if(!answer||answer.length>5000)return reply('Matnli javob yuboring (5000 belgigacha).');answers.push(answer);
    if(index+1===task.questions.length){const result=await call('/assignments/'+aid+'/submit',{answers});await q('DELETE FROM telegram_onboarding WHERE user_id=?',id).run();return reply(result.status==='graded'?'Vazifa topshirildi. Natija: '+result.score+'%.':'Javob yuborildi. Ustoz tekshirishi kutilmoqda. /tasks orqali boshqa vazifalarni ko‘ring.');}
    await save('task:'+aid+':'+(index+1),'',JSON.stringify(answers));const next=task.questions[index+1];return reply((index+2)+'. '+next.prompt,next.type==='choice'?{keyboard:next.options.map((x,i)=>[{text:(i+1)+'. '+x.slice(0,100)}]),resize_keyboard:true,one_time_keyboard:true}:{remove_keyboard:true});
   }
  }
  if(text.startsWith('/start'))await q('DELETE FROM telegram_onboarding WHERE user_id=?',id).run();
  return open(account.name,account.status);
 }
 if(/^\/start(?:@\w+)?(?:\s|$)/.test(text)||!state){await save(phone?'role':'phone');return phone?(account?open(account.name,account.status):roles()):contact();}
 if(state.step==='phone'){
  if(!m.contact||m.contact.user_id!==m.from.id)return contact();
  const number=String(m.contact.phone_number).replace(/^\+/, '');
  if(!/^[1-9]\d{6,14}$/.test(number))return contact();
  // Keep a keyed digest, never a raw phone number, in the database.
  const hash=await botSecret(env.TELEGRAM_BOT_TOKEN+':phone:'+number);
  const owner=await q('SELECT user_id FROM telegram_phones WHERE phone_hash=?',hash).first();
  if(owner&&owner.user_id!==id)return reply('Bu raqam boshqa Lexora hisobiga bog‘langan. Hisobni tiklash uchun administratorga murojaat qiling.');
  try{await q('INSERT INTO telegram_phones(user_id,phone_hash,verified) VALUES(?,?,?) ON CONFLICT(user_id) DO NOTHING',id,hash,Date.now()).run();}catch(e){if(String(e).includes('UNIQUE'))return reply('Bu raqam boshqa hisobga bog‘langan.');throw e;}
  if(account)return open(account.name,account.status);
  await save('role');return roles();
 }
 if(!phone){await save('phone');return contact();}
 if(state.step==='role'){
  const role=['O‘quvchi','Men o‘quvchiman'].includes(text)?'student':['O‘qituvchi','Men o‘qituvchiman'].includes(text)?'teacher':'';
  if(!role)return roles();await save('name',role);return reply('Ism va familiyangizni yozing.');
 }
 if(state.step==='name'){
  if(!text||text.length>80||text.startsWith('/'))return reply('Ism va familiyangizni 1–80 belgi bilan yozing.');
  await save(state.role==='student'?'group':'finish',state.role,text);
  if(state.role==='student')return reply('O‘qituvchingiz bergan 5 xonali guruh ID’sini yozing.');
 }
 if(state.step==='group'||state.step==='finish'){
  const request=new Request(origin+'/api/classroom/register',{method:'POST',headers:{origin,'content-type':'application/json','oai-authenticated-user-id':id},body:JSON.stringify({name:state.name,role:state.role,code:text})});
  try{await classroom(request,{...env,AUTH_PROVIDER:'telegram'});}catch(e){
   account=await q('SELECT * FROM accounts WHERE id=?',id).first();if(account)return open(account.name,account.status);
   if(e instanceof APIError)return reply(e.message);throw e;
  }
  await q('DELETE FROM telegram_onboarding WHERE user_id=?',id).run();
  return open(state.name,state.role==='teacher'?'pending':'active');
 }
 await save('role');return roles();
}

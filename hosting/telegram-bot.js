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
 const contact=()=>reply('Lexoraga xush kelibsiz!\n\nIngliz tilini lug‘at, speaking va videolar bilan mashq qiling.\n\nBoshlash uchun quyidagi tugma orqali o‘zingizning telefon raqamingizni tasdiqlang. Keyin rolingizni tanlaysiz. O‘quvchi bo‘lsangiz, ustozingiz bergan 5 xonali guruh kodi kerak bo‘ladi.\n\nYordam: /help',{keyboard:[[{text:'Raqamni ulashish',request_contact:true}]],resize_keyboard:true,one_time_keyboard:true});
 const open=async(name,status)=>{
  const link=await q("SELECT * FROM telegram_browser_links WHERE user_id=? AND status='pending' AND expires>? ORDER BY created DESC LIMIT 1",id,Date.now()).first();
  if(link)return reply(`Brauzerdagi Lexora hisobiga kirishni tasdiqlaysizmi?\n\nKod: ${link.id.slice(0,8).toUpperCase()}\nFaqat o‘zingiz ochgan sayt shu kodni ko‘rsatsa tasdiqlang. Tasdiqdan keyin o‘sha brauzerga qayting.`,{keyboard:[[{text:'Kirishni tasdiqlash '+link.id.slice(0,8).toUpperCase()}],[{text:'/cancel'}]],resize_keyboard:true,one_time_keyboard:true});
  return reply(`${name}, ${status==='pending'?'arizangiz admin tasdig‘ini kutmoqda.':'hisobingiz tayyor.'} Kabinetni ochishingiz mumkin.`,{inline_keyboard:[[{text:'Lexorani ochish',web_app:{url:origin}}]]});
 };
 let account=await q('SELECT * FROM accounts WHERE id=?',id).first(),phone=await q('SELECT user_id FROM telegram_phones WHERE user_id=?',id).first();
 let state=await q('SELECT * FROM telegram_onboarding WHERE user_id=?',id).first();
 if(/^\/help(?:@\w+)?$/.test(text))return reply('Lexora — foydalanish yo‘riqnomasi\n\n/start — boshlash yoki hisobingizga qaytish\n/open — o‘quv kabinetini ochish\n/tasks — ustozingiz bergan vazifalar\n/cancel — joriy jarayonni bekor qilish\n\nYangi o‘quvchi: telefoningizni tasdiqlang, rolingizni tanlang, ism-familiyangizni va guruh kodini kiriting. Guruh kodini ustozingizdan oling. O‘qituvchi hisobi administrator tasdig‘idan keyin faollashadi.\n\nBrauzerdan kirishda bot va sayt ko‘rsatgan kod bir xil ekanini tekshiring.\n\nGuruh yoki hisob bo‘yicha savol bo‘lsa, ustozingizga murojaat qiling.',{inline_keyboard:[[{text:'Saytni ko‘rish',url:origin}]]});
 if(/^\/open(?:@\w+)?$/.test(text))return account&&phone?open(account.name,account.status):reply('Kabinetni ochish uchun avval /start orqali ro‘yxatdan o‘ting.',{inline_keyboard:[[{text:'Lexora sayti',url:origin}]]});
 if(/^\/(tasks|vazifalar)(?:@\w+)?$/.test(text)&&account?.role==='teacher')return reply('Vazifalarni o‘qituvchi kabinetida yarating va guruhingizga bering.',{inline_keyboard:[[{text:'O‘qituvchi kabineti',web_app:{url:origin}}]]});
 const login=text.match(/^\/start(?:@\w+)? login_([a-f0-9]{32})$/);
 if(login){
  const linked=await q("UPDATE telegram_browser_links SET user_id=? WHERE id=? AND status='pending' AND expires>? AND (user_id IS NULL OR user_id=?)",id,login[1],Date.now(),id).run();
  if((linked.meta?.changes??linked.changes)!==1)return reply('Bu kirish havolasi eskirgan yoki ishlatilgan. Saytda qayta boshlang.');
 }
 if(/^\/cancel(?:@\w+)?$/.test(text)){
  await q("DELETE FROM telegram_browser_links WHERE user_id=? AND status='pending'",id).run();
  await q('DELETE FROM telegram_onboarding WHERE user_id=?',id).run();
  return reply('Joriy jarayon bekor qilindi. Hisobingiz va oldingi natijalaringiz saqlandi. Davom etish uchun /start yuboring.');
 }
 const confirmation=text.match(/^Kirishni tasdiqlash ([A-F0-9]{8})$/);
 if(confirmation&&account&&phone){
  const link=await q("SELECT * FROM telegram_browser_links WHERE user_id=? AND status='pending' AND expires>? AND substr(id,1,8)=? ORDER BY created DESC LIMIT 1",id,Date.now(),confirmation[1].toLowerCase()).first();
  if(!link)return reply('Tasdiqlash kodi eskirgan. Saytda kirishni qayta boshlang.');
  await q("UPDATE telegram_browser_links SET status='approved' WHERE id=? AND user_id=? AND status='pending'",link.id,id).run();
  return reply('Kirish tasdiqlandi. Avval ochgan brauzeringizga qayting — hisobingiz o‘sha yerda ochiladi.',{inline_keyboard:[[{text:'Telegram ichida ochish',web_app:{url:origin}}]]});
 }
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

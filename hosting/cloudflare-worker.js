// Direct Cloudflare hosting entry. Never trust incoming Sites identity headers here.
import {classroom,APIError} from '../worker/classroom.js';
import {telegramUpdate,botSecret} from './telegram-bot.js';
const encoder=new TextEncoder();
const hex=buffer=>Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('');
const digest=async s=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(s)));
async function hmac(key,data){const k=await crypto.subtle.importKey('raw',typeof key==='string'?encoder.encode(key):key,{name:'HMAC',hash:'SHA-256'},false,['sign']);return crypto.subtle.sign('HMAC',k,encoder.encode(data));}
export async function verifyMiniApp(raw,token,now=Math.floor(Date.now()/1000)){
 if(!token)throw new APIError(503,'Telegram kirishi hali sozlanmagan.');
 if(typeof raw!=='string'||raw.length>16384)throw new APIError(401,'Telegram ma’lumoti noto‘g‘ri.');
 const p=new URLSearchParams(raw),keys=[...p.keys()],signature=p.get('hash');if(new Set(keys).size!==keys.length||! /^[a-f0-9]{64}$/.test(signature||''))throw new APIError(401,'Telegram imzosi noto‘g‘ri.');
 p.delete('hash');const check=[...p].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>k+'='+v).join('\n'),secret=await hmac('WebAppData',token),expected=hex(await hmac(secret,check));
 let mismatch=0;for(let i=0;i<64;i++)mismatch|=signature.charCodeAt(i)^expected.charCodeAt(i);if(mismatch)throw new APIError(401,'Telegram imzosi noto‘g‘ri.');
 const date=Number(p.get('auth_date'));if(!Number.isInteger(date)||now-date>300||date>now+30)throw new APIError(401,'Botni qayta oching. Kirish muddati tugagan.');
 let user;try{user=JSON.parse(p.get('user'));}catch{}if(!user||!Number.isSafeInteger(user.id)||user.id<=0||typeof user.first_name!=='string'||user.is_bot)throw new APIError(401,'Telegram foydalanuvchisi noto‘g‘ri.');return {id:'tg:'+user.id,signature};
}
const json=(value,status=200,headers={})=>Response.json(value,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff',...headers}});
async function readBody(request){if(request.headers.get('origin')!==new URL(request.url).origin)throw new APIError(403,'So‘rov manbasi noto‘g‘ri.');if(!request.headers.get('content-type')?.startsWith('application/json'))throw new APIError(415,'JSON kerak.');const raw=await request.text();if(raw.length>20000)throw new APIError(413,'So‘rov juda katta.');try{return JSON.parse(raw);}catch{throw new APIError(400,'Ma’lumot formati noto‘g‘ri.');}}
const botOrigin='https://lexora-academy-4zo.pages.dev';
// Fixed, versioned identity bootstrap. No caller can supply a token, destination,
// text or photo. The existing encrypted deployment secret stays server-side.
export async function ensureBotProfile(env,send=fetch){
 const key='identity-v015';
 if(!env.TELEGRAM_BOT_TOKEN)return {ok:false};
 const saved=await env.DB.prepare('SELECT status,updated FROM telegram_bot_config WHERE id=?').bind(key).first();
 if(saved?.status==='ready')return {ok:true};
 if(saved&&Date.now()-saved.updated<60000)return {ok:false};
 const now=Date.now(),claim=await env.DB.prepare("INSERT INTO telegram_bot_config(id,status,updated) VALUES(?,'setting',?) ON CONFLICT(id) DO UPDATE SET status='setting',updated=excluded.updated WHERE status!='ready' AND updated<?").bind(key,now,now-60000).run();
 if(!claim.meta?.changes&&claim.changes!==1)return {ok:false};
 let step='getMe';
 const call=async(method,body)=>{
  step=method;
  const result=await(await send('https://api.telegram.org/bot'+env.TELEGRAM_BOT_TOKEN+'/'+method,{method:'POST',...(body instanceof FormData?{body}:{headers:{'content-type':'application/json'},body:JSON.stringify(body||{})}),signal:AbortSignal.timeout(12000)})).json();
  if(!result.ok)throw Error('Bot setup failed');return result.result;
 };
 try{
  const me=await call('getMe');if(me.username!=='lexora_academy_bot')throw Error('Unexpected bot');
  const short='Ingliz tilini har kuni mashq qiling. Lug‘at, speaking, videolar va ustozingizning vazifalari — bitta hisobda.';
  const description='Lexora — ingliz tilini amalda o‘rganish maydoni.\n\n• So‘zlarni eslab qoling va takrorlang.\n• Speaking mavzulari bilan mashq qiling.\n• Video orqali iboralarni kontekstda o‘rganing.\n• Ustozingiz bergan vazifalarni bajaring.\n\nBoshlash uchun /start bosing. O‘quvchilar guruh kodini ustozidan oladi.';
  for(const language_code of ['','uz']){
   await call('setMyName',{name:'Lexora | Ingliz tili',language_code});
   await call('setMyShortDescription',{short_description:short,language_code});
   await call('setMyDescription',{description,language_code});
   await call('setMyCommands',{scope:{type:'all_private_chats'},language_code,commands:[{command:'start',description:'Boshlash yoki hisobga qaytish'},{command:'open',description:'Lexora kabinetini ochish'},{command:'tasks',description:'Ustoz bergan vazifalar'},{command:'help',description:'Yordam va foydalanish yo‘riqnomasi'},{command:'cancel',description:'Joriy jarayonni bekor qilish'}]});
  }
  await call('setChatMenuButton',{menu_button:{type:'web_app',text:'Lexorani ochish',web_app:{url:botOrigin}}});
  step='photo';const photo=await env.ASSETS.fetch(new Request(botOrigin+'/assets/logo-bot.jpg'));
  if(!photo.ok||!photo.headers.get('content-type')?.startsWith('image/jpeg'))throw Error('Avatar unavailable');
  const form=new FormData();form.set('photo',JSON.stringify({type:'static',photo:'attach://avatar'}));form.set('avatar',await photo.blob(),'lexora.jpg');
  await call('setMyProfilePhoto',form);
  await env.DB.prepare('UPDATE telegram_bot_config SET status=?,updated=? WHERE id=?').bind('ready',Date.now(),key).run();return {ok:true};
 }catch{
  await env.DB.prepare('UPDATE telegram_bot_config SET status=?,updated=? WHERE id=?').bind('failed:'+step,Date.now(),key).run();return {ok:false};
 }
}
export async function ensureBotWebhook(env,send=fetch){
 if(!env.TELEGRAM_BOT_TOKEN)return {ok:false};
 const saved=await env.DB.prepare('SELECT status,updated FROM telegram_bot_config WHERE id=?').bind('webhook-v1').first();
 if(saved?.status==='ready')return {ok:true};
 if(saved&&Date.now()-saved.updated<60000)return {ok:false};
 // No caller-controlled destination: anonymous visits can only trigger this one-time
 // deployment bootstrap to our canonical production URL. Retry failed setup at most once/minute.
 const now=Date.now();
 const claim=await env.DB.prepare("INSERT INTO telegram_bot_config(id,status,updated) VALUES(?,'setting',?) ON CONFLICT(id) DO UPDATE SET status='setting',updated=excluded.updated WHERE status!='ready' AND updated<?").bind('webhook-v1',now,now-60000).run();
 if(!claim.meta?.changes&&claim.changes!==1)return {ok:false};
 try{
  const response=await send('https://api.telegram.org/bot'+env.TELEGRAM_BOT_TOKEN+'/setWebhook',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url:botOrigin+'/api/bot/webhook',secret_token:await botSecret(env.TELEGRAM_BOT_TOKEN),allowed_updates:['message'],max_connections:1})});
  const result=await response.json();
  await env.DB.prepare('UPDATE telegram_bot_config SET status=?,updated=? WHERE id=?').bind(result.ok?'ready':'failed',Date.now(),'webhook-v1').run();return {ok:!!result.ok};
 }catch{await env.DB.prepare("UPDATE telegram_bot_config SET status='failed',updated=? WHERE id=?").bind(Date.now(),'webhook-v1').run();return {ok:false};}
}
export default {async fetch(request,env){const path=new URL(request.url).pathname;
 try{
  if(!path.startsWith('/api/'))return env.ASSETS.fetch(request);
  if(!env.DB)throw new APIError(503,'Ma’lumotlar ombori ulanmagan.');
  if(path==='/api/classroom/me'&&request.method==='GET'&&new URL(request.url).origin===botOrigin)await ensureBotWebhook(env);
  if(path==='/api/bot/branding'&&request.method==='GET'&&new URL(request.url).origin===botOrigin){
   await ensureBotProfile(env);const config=await env.DB.prepare('SELECT status,updated FROM telegram_bot_config WHERE id=?').bind('identity-v015').first();
   return json({configured:config?.status==='ready',status:config?.status||'unconfigured'});
  }
  if(path==='/api/bot/webhook'&&request.method==='POST'){
   if(!env.TELEGRAM_BOT_TOKEN||request.headers.get('x-telegram-bot-api-secret-token')!==await botSecret(env.TELEGRAM_BOT_TOKEN))throw new APIError(403,'Webhook tasdiqlanmadi.');
   const raw=await request.text();if(raw.length>65536)throw new APIError(413,'Update too large');
   let update;try{update=JSON.parse(raw);}catch{throw new APIError(400,'Invalid JSON');}
   if(!Number.isSafeInteger(update.update_id))throw new APIError(400,'Invalid update');
   const previous=await env.DB.prepare('SELECT reply FROM telegram_updates WHERE id=?').bind(update.update_id).first();
   if(previous)return json({ok:true});
   const result=await telegramUpdate(update,env,new URL(request.url).origin);
   await env.DB.prepare('INSERT INTO telegram_updates VALUES(?,?,?) ON CONFLICT DO NOTHING').bind(update.update_id,JSON.stringify(result),Date.now()).run();
   await env.DB.prepare('DELETE FROM telegram_updates WHERE created<?').bind(Date.now()-7*86400000).run();
   return json(result);
  }
  const cookie=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('__Host-lexora='))?.slice(14)||'',hash=await digest(cookie);
  if(path==='/api/auth/browser/start'&&request.method==='POST'){
   await readBody(request);
   const now=Date.now(),id=hex(crypto.getRandomValues(new Uint8Array(16))),proof=hex(crypto.getRandomValues(new Uint8Array(32)));
   await env.DB.prepare('DELETE FROM telegram_browser_links WHERE expires<?').bind(now).run();
   await env.DB.prepare('INSERT INTO telegram_browser_links(id,browser_hash,expires,created) VALUES(?,?,?,?)').bind(id,await digest(proof),now+600000,now).run();
   return json({id,code:id.slice(0,8).toUpperCase(),expires:now+600000,url:'https://t.me/lexora_academy_bot?start=login_'+id},200,{'set-cookie':`__Host-lexora-pair=${proof}; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`});
  }
  if(path==='/api/auth/browser/status'&&request.method==='POST'){
   const body=await readBody(request),proof=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('__Host-lexora-pair='))?.slice('__Host-lexora-pair='.length)||'';
   if(!/^[a-f0-9]{32}$/.test(body.id||'')||!proof)throw new APIError(401,'Kirishni shu brauzerdan boshlang.');
   const link=await env.DB.prepare('SELECT * FROM telegram_browser_links WHERE id=? AND browser_hash=? AND expires>?').bind(body.id,await digest(proof),Date.now()).first();
   if(!link||link.status==='consumed')throw new APIError(410,'Kirish muddati tugagan. Qaytadan boshlang.');
   if(link.status!=='approved')return json({status:'pending'});
   const verified=await env.DB.prepare('SELECT a.id FROM accounts a JOIN telegram_phones p ON a.id=p.user_id WHERE a.id=?').bind(link.user_id).first();
   if(!verified)throw new APIError(403,'Avval botda ro‘yxatdan o‘ting.');
   const claim=await env.DB.prepare("UPDATE telegram_browser_links SET status='consumed' WHERE id=? AND status='approved'").bind(link.id).run();
   if((claim.meta?.changes??claim.changes)!==1)throw new APIError(410,'Kirish allaqachon ishlatilgan.');
   const token=hex(crypto.getRandomValues(new Uint8Array(32)));
   await env.DB.prepare('INSERT INTO telegram_sessions VALUES(?,?,?)').bind(await digest(token),link.user_id,Date.now()+86400000).run();
   return json({status:'approved'},200,{'set-cookie':`__Host-lexora=${token}; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`});
  }
  if(path==='/api/auth/telegram'&&request.method==='POST'){
   const body=await readBody(request),identity=await verifyMiniApp(body.initData,env.TELEGRAM_BOT_TOKEN);
   if(await env.DB.prepare('SELECT 1 FROM telegram_exchanges WHERE signature=?').bind(identity.signature).first())throw new APIError(401,'Bu kirish ishlatilgan. Botni qayta oching.');
   const token=hex(crypto.getRandomValues(new Uint8Array(32))),now=Date.now();
   await env.DB.batch([env.DB.prepare('DELETE FROM telegram_sessions WHERE expires<?').bind(now),env.DB.prepare('DELETE FROM telegram_exchanges WHERE expires<?').bind(now),env.DB.prepare('INSERT INTO telegram_exchanges VALUES(?,?)').bind(identity.signature,now+360000),env.DB.prepare('INSERT INTO telegram_sessions VALUES(?,?,?)').bind(await digest(token),identity.id,now+86400000)]);
   return json({ok:true},200,{'set-cookie':`__Host-lexora=${token}; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`});
  }
  if(path==='/api/auth/logout'&&request.method==='POST'){await readBody(request);await env.DB.prepare('DELETE FROM telegram_sessions WHERE token_hash=?').bind(hash).run();return json({ok:true},200,{'set-cookie':'__Host-lexora=; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'});}
  const session=cookie&&await env.DB.prepare('SELECT user_id FROM telegram_sessions WHERE token_hash=? AND expires>?').bind(hash,Date.now()).first();if(!session)return json({error:'Lexora botining Mini App oynasidan kiring.',provider:'telegram'},401);
  if(path==='/api/bot/setup'&&request.method==='POST'){
   await readBody(request);
   if(!env.ADMIN_TELEGRAM_ID||session.user_id!=='tg:'+env.ADMIN_TELEGRAM_ID)throw new APIError(403,'Faqat admin uchun.');
   if(!env.TELEGRAM_BOT_TOKEN)throw new APIError(503,'Bot tokeni ulanmagan.');
   const response=await fetch('https://api.telegram.org/bot'+env.TELEGRAM_BOT_TOKEN+'/setWebhook',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url:new URL(request.url).origin+'/api/bot/webhook',secret_token:await botSecret(env.TELEGRAM_BOT_TOKEN),allowed_updates:['message'],max_connections:1})});
   const result=await response.json();if(!result.ok)throw new APIError(502,'Telegram webhook ulanmadi. Bot tokenini tekshiring.');return json({ok:true});
  }
  if(path==='/api/classroom/register')throw new APIError(403,'Ro‘yxatdan o‘tish uchun bot chatida Start bosing.');
  const verifiedPhone=await env.DB.prepare('SELECT user_id FROM telegram_phones WHERE user_id=?').bind(session.user_id).first();
  if(!verifiedPhone&&path!=='/api/classroom/me')throw new APIError(403,'Bot chatida Start bosib, telefoningizni tasdiqlang.');
  // Strip spoofable caller headers and replace them ONLY with verified session identity.
  const headers=new Headers(request.headers);for(const key of [...headers.keys()])if(key.startsWith('oai-authenticated-'))headers.delete(key);
  headers.set('oai-authenticated-user-id',session.user_id);headers.set('oai-authenticated-user-email',env.ADMIN_TELEGRAM_ID&&session.user_id==='tg:'+env.ADMIN_TELEGRAM_ID?'admin@lexora.internal':'student@lexora.internal');
  const safeRequest=new Request(request,{headers});const result=await classroom(safeRequest,{...env,LEXORA_ADMIN_EMAIL:'admin@lexora.internal',AUTH_PROVIDER:'telegram'});if(path==='/api/classroom/me')result.phoneVerified=!!verifiedPhone;return json(result);
 }catch(error){if(!(error instanceof APIError))console.error('Cloudflare API failed',String(error));return json({error:error instanceof APIError?error.message:'Serverda xatolik. Qayta urinib ko‘ring.',provider:'telegram'},error instanceof APIError?error.status:500);}
}};

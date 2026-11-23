import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../hosting/cloudflare-worker.js';
import {telegramUpdate} from '../hosting/telegram-bot.js';
import {fixture} from './d1-fixture.mjs';
function setup(t){const DB=fixture();t.after(()=>DB.close());const env={DB,TELEGRAM_BOT_TOKEN:'test-only'},origin='https://lexora.test';
 const call=(path,body={},cookie='',source=origin)=>worker.fetch(new Request(origin+path,{method:'POST',headers:{origin:source,'content-type':'application/json',cookie},body:JSON.stringify(body)}),env);
 const send=(id,text,contact)=>telegramUpdate({message:{chat:{id,type:'private'},from:{id,first_name:'Test'},text,contact}},env,origin);
 return {DB,call,send};}
async function begin(call){const r=await call('/api/auth/browser/start'),body=await r.json();return {...body,cookie:r.headers.get('set-cookie').split(';')[0]};}
test('web login requires explicit bot approval and browser proof, then uses the same registered account once',async t=>{
 const {DB,call,send}=setup(t);DB.sqlite.exec("INSERT INTO accounts VALUES('tg:123','Teacher','teacher','active',1);INSERT INTO telegram_phones VALUES('tg:123','phone-test',1)");
 const link=await begin(call);assert.match(link.url,/\?start=login_[a-f0-9]{32}$/);assert.equal(link.url.includes('startapp'),false);
 assert.equal((await (await call('/api/auth/browser/status',{id:link.id},link.cookie)).json()).status,'pending');
 const prompt=await send(123,'/start login_'+link.id);assert.match(prompt.text,new RegExp(link.code));
 assert.equal((await (await call('/api/auth/browser/status',{id:link.id},link.cookie)).json()).status,'pending');
 await send(456,'Kirishni tasdiqlash '+link.code);
 assert.equal((await (await call('/api/auth/browser/status',{id:link.id},link.cookie)).json()).status,'pending');
 await send(123,'Kirishni tasdiqlash '+link.code);
 assert.equal((await call('/api/auth/browser/status',{id:link.id})).status,401);
 const other=await begin(call);assert.equal((await call('/api/auth/browser/status',{id:link.id},other.cookie)).status,410);
 const result=await call('/api/auth/browser/status',{id:link.id},link.cookie);assert.equal(result.status,200);assert.match(result.headers.get('set-cookie'),/Secure; HttpOnly; SameSite=Lax/);
 const cookie=result.headers.get('set-cookie').split(';')[0];const me=await worker.fetch(new Request('https://lexora.test/api/classroom/me',{headers:{cookie}}),{DB,TELEGRAM_BOT_TOKEN:'test-only'});assert.equal((await me.json()).user.id,'tg:123');
 assert.equal((await call('/api/auth/browser/status',{id:link.id},link.cookie)).status,410);
});
test('browser pairing survives new teacher onboarding, cannot skip phone, expires and cancels',async t=>{
 const {DB,call,send}=setup(t),link=await begin(call);
 await send(123,'/start login_'+link.id);await send(123,'Kirishni tasdiqlash '+link.code);
 assert.equal(DB.sqlite.prepare('SELECT status FROM telegram_browser_links').get().status,'pending');
 await send(123,'',{user_id:123,phone_number:'+998901234567'});await send(123,'O‘qituvchi');const ready=await send(123,'Test Teacher');assert.match(ready.text,/Brauzerdagi/);
 await send(123,'Kirishni tasdiqlash '+link.code);assert.equal((await call('/api/auth/browser/status',{id:link.id},link.cookie)).status,200);
 const expired=await begin(call);DB.sqlite.prepare('UPDATE telegram_browser_links SET expires=0 WHERE id=?').run(expired.id);assert.equal((await call('/api/auth/browser/status',{id:expired.id},expired.cookie)).status,410);
 const cancelled=await begin(call);await send(123,'/start login_'+cancelled.id);await send(123,'/cancel');assert.equal((await call('/api/auth/browser/status',{id:cancelled.id},cancelled.cookie)).status,410);
 assert.equal((await call('/api/auth/browser/start',{},'','https://evil.test')).status,403);
});

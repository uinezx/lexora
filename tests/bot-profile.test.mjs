import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ensureBotProfile} from '../hosting/cloudflare-worker.js';
import {telegramUpdate} from '../hosting/telegram-bot.js';
import {fixture} from './d1-fixture.mjs';

test('identity setup targets the expected bot, uploads the fixed avatar and runs once',async t=>{
 const DB=fixture();t.after(()=>DB.close());const calls=[];
 const env={DB,TELEGRAM_BOT_TOKEN:'test-only',ASSETS:{fetch:async request=>{assert.equal(request.url,'https://lexora-academy-4zo.pages.dev/assets/logo-bot.jpg');return new Response(new Uint8Array([255,216,255]),{headers:{'content-type':'image/jpeg'}});}}};
 const send=async(url,options)=>{
  const method=url.split('/').at(-1);calls.push(method);
  if(method==='setMyCommands'){const body=JSON.parse(options.body);assert.deepEqual(body.commands.map(c=>c.command),['start','open','tasks','help','cancel']);assert.equal(body.scope.type,'all_private_chats');}
  if(method==='setMyShortDescription')assert.ok(JSON.parse(options.body).short_description.length<=120);
  if(method==='setMyProfilePhoto'){assert.ok(options.body instanceof FormData);assert.equal(JSON.parse(options.body.get('photo')).photo,'attach://avatar');assert.equal(options.body.get('avatar').type,'image/jpeg');}
  return Response.json({ok:true,result:method==='getMe'?{username:'lexora_academy_bot'}:true});
 };
 assert.equal((await ensureBotProfile(env,send)).ok,true);const count=calls.length;
 assert.equal((await ensureBotProfile(env,send)).ok,true);assert.equal(calls.length,count);assert.equal(calls.at(-1),'setMyProfilePhoto');
 assert.equal(DB.sqlite.prepare('SELECT status FROM telegram_bot_config').get().status,'ready');
});

test('identity bootstrap never modifies a different bot and throttles failures',async t=>{
 const DB=fixture();t.after(()=>DB.close());let calls=0;
 const env={DB,TELEGRAM_BOT_TOKEN:'wrong-bot'};
 const send=async()=>{calls++;return Response.json({ok:true,result:{username:'another_bot'}});};
 assert.equal((await ensureBotProfile(env,send)).ok,false);await ensureBotProfile(env,send);assert.equal(calls,1);
 assert.equal(DB.sqlite.prepare('SELECT status FROM telegram_bot_config').get().status,'failed:getMe');
});

test('help and open preserve onboarding and never create an unverified account',async t=>{
 const DB=fixture();t.after(()=>DB.close());const env={DB,TELEGRAM_BOT_TOKEN:'test-only'};
 const send=text=>telegramUpdate({message:{chat:{id:123,type:'private'},from:{id:123},text}},env,'https://lexora.test');
 await send('/start');const state=DB.sqlite.prepare('SELECT * FROM telegram_onboarding').get();
 assert.match((await send('/help')).text,/guruh kodini/);assert.match((await send('/open')).text,/ro‘yxatdan/);
 assert.deepEqual(DB.sqlite.prepare('SELECT * FROM telegram_onboarding').get(),state);assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM accounts').get().n,0);
});

test('cancel stops unfinished work without removing the existing account',async t=>{
 const DB=fixture();t.after(()=>DB.close());DB.sqlite.exec("INSERT INTO accounts VALUES('tg:123','Learner','student','active',1);INSERT INTO telegram_phones VALUES('tg:123','hash',1);INSERT INTO telegram_onboarding VALUES('tg:123','task:x:0','','[]',1)");
 const env={DB,TELEGRAM_BOT_TOKEN:'test-only'},send=text=>telegramUpdate({message:{chat:{id:123,type:'private'},from:{id:123},text}},env,'https://lexora.test');
 assert.match((await send('/cancel@lexora_academy_bot')).text,/saqlandi/);assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM telegram_onboarding').get().n,0);
 assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM accounts').get().n,1);assert.equal((await send('/open')).reply_markup.inline_keyboard[0][0].web_app.url,'https://lexora.test');
});

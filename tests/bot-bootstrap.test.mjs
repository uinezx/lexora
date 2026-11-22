import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker,{ensureBotWebhook} from '../hosting/cloudflare-worker.js';
import {botSecret} from '../hosting/telegram-bot.js';
import {fixture} from './d1-fixture.mjs';
test('bootstrap sets only the fixed production webhook, with a secret, and runs once',async t=>{
 const DB=fixture();t.after(()=>DB.close());let calls=0;
 const env={DB,TELEGRAM_BOT_TOKEN:'test-token'};
 const send=async(url,options)=>{calls++;assert.equal(url,'https://api.telegram.org/bottest-token/setWebhook');const body=JSON.parse(options.body);assert.equal(body.url,'https://lexora-academy-4zo.pages.dev/api/bot/webhook');assert.equal(body.secret_token,await botSecret('test-token'));assert.equal(body.max_connections,1);return Response.json({ok:true});};
 assert.equal((await ensureBotWebhook(env,send)).ok,true);assert.equal((await ensureBotWebhook(env,send)).ok,true);assert.equal(calls,1);
});
test('failed setup is throttled and cannot mark the bot ready',async t=>{
 const DB=fixture();t.after(()=>DB.close());let calls=0;const env={DB,TELEGRAM_BOT_TOKEN:'invalid'},send=async()=>{calls++;return Response.json({ok:false});};
 assert.equal((await ensureBotWebhook(env,send)).ok,false);await ensureBotWebhook(env,send);assert.equal(calls,1);assert.equal(DB.sqlite.prepare('SELECT status FROM telegram_bot_config').get().status,'failed');
});
test('webhook rejects forged updates and handles a genuine Start once',async t=>{
 const DB=fixture();t.after(()=>DB.close());const env={DB,TELEGRAM_BOT_TOKEN:'test-token'},body={update_id:42,message:{chat:{id:123,type:'private'},from:{id:123},text:'/start'}};
 const request=secret=>new Request('https://lexora-academy-4zo.pages.dev/api/bot/webhook',{method:'POST',headers:{'content-type':'application/json','x-telegram-bot-api-secret-token':secret},body:JSON.stringify(body)});
 assert.equal((await worker.fetch(request('forged'),env)).status,403);
 const secret=await botSecret(env.TELEGRAM_BOT_TOKEN),response=await worker.fetch(request(secret),env),reply=await response.json();assert.equal(response.status,200);assert.equal(reply.method,'sendMessage');assert.equal(reply.reply_markup.keyboard[0][0].request_contact,true);
 assert.deepEqual(await(await worker.fetch(request(secret),env)).json(),{ok:true});assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM telegram_onboarding').get().n,1);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './d1-fixture.mjs';
import {telegramUpdate} from '../hosting/telegram-bot.js';
function setup(t){const DB=fixture();t.after(()=>DB.close());const env={DB,TELEGRAM_BOT_TOKEN:'test-token'},origin='https://lexora.test';let seq=0;return {DB,send:(id,text,contact)=>telegramUpdate({update_id:++seq,message:{chat:{id,type:'private'},from:{id,first_name:'Test'},text,contact}},env,origin)};}
test('bot registers a verified student in a group and repeated Start never creates another account',async t=>{
 const {DB,send}=setup(t);DB.sqlite.exec("INSERT INTO accounts VALUES('teacher','Teacher','teacher','active',1);INSERT INTO class_groups VALUES('g','teacher','IELTS','10089',1)");
 assert.ok((await send(123,'/start')).reply_markup.keyboard[0][0].request_contact);
 await send(123,'',{user_id:123,phone_number:'+998901234567'});
 await send(123,'Men o‘quvchiman');await send(123,'Student Name');
 assert.match((await send(123,'99999')).text,/topilmadi/);
 assert.match((await send(123,'10089')).text,/tayyor/);
 await send(123,'/start');assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM accounts WHERE id=?').get('tg:123').n,1);
 assert.equal(DB.sqlite.prepare('SELECT group_id FROM class_members WHERE student_id=?').get('tg:123').group_id,'g');
 assert.equal(DB.sqlite.prepare('SELECT phone_hash FROM telegram_phones').get().phone_hash.includes('99890'),false);
});
test('a forwarded contact or a number already owned by another Telegram user cannot register',async t=>{
 const {DB,send}=setup(t);await send(123,'/start');
 await send(123,'',{user_id:456,phone_number:'+998901234567'});assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM telegram_phones').get().n,0);
 await send(123,'',{user_id:123,phone_number:'+998901234567'});await send(456,'/start');
 assert.match((await send(456,'',{user_id:456,phone_number:'998901234567'})).text,/boshqa/);
 assert.equal(DB.sqlite.prepare('SELECT count(*) n FROM telegram_phones').get().n,1);
});
test('teacher signup in chat remains pending and existing accounts are preserved during phone verification',async t=>{
 const {DB,send}=setup(t);await send(123,'/start');await send(123,'',{user_id:123,phone_number:'+998901234567'});await send(123,'Men o‘qituvchiman');
 assert.match((await send(123,'Ustoz')).text,/tasdig/);assert.equal(DB.sqlite.prepare('SELECT status FROM accounts WHERE id=?').get('tg:123').status,'pending');
 DB.sqlite.exec("INSERT INTO accounts VALUES('tg:456','Existing','student','active',1)");await send(456,'/start');await send(456,'',{user_id:456,phone_number:'+998901234568'});
 assert.equal(DB.sqlite.prepare('SELECT name FROM accounts WHERE id=?').get('tg:456').name,'Existing');
});
test('a registered student completes choice and written assignment answers entirely in bot chat',async t=>{
 const {DB,send}=setup(t);DB.sqlite.exec("INSERT INTO accounts VALUES('teacher','Teacher','teacher','active',1);INSERT INTO accounts VALUES('tg:123','Student','student','active',1);INSERT INTO class_groups VALUES('g','teacher','G','10089',1);INSERT INTO class_members VALUES('g','tg:123',1);INSERT INTO telegram_phones VALUES('tg:123','hash',1)");
 DB.sqlite.prepare('INSERT INTO group_assignments VALUES(?,?,?,?,?,?,?,0)').run('task','g','Grammar','Answer',JSON.stringify([{type:'choice',prompt:'She __',options:['live','lives'],correct:1},{type:'text',prompt:'Explain'}]),Date.now()+3600000,Date.now());
 assert.match((await send(123,'/tasks')).text,/tanlang/);assert.match((await send(123,'1. Grammar')).text,/She/);assert.match((await send(123,'2. lives')).text,/Explain/);assert.match((await send(123,'Third person singular.')).text,/tekshirishi/);
 const s=DB.sqlite.prepare('SELECT * FROM assignment_submissions').get();assert.equal(s.status,'pending');assert.deepEqual(JSON.parse(s.answers),['1','Third person singular.']);
});

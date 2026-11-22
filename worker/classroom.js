// Shared classroom API. Identity is supplied by Sites; no browser-selected roles are trusted.
import {learningRoutes,studentStudyPlan} from './learning.js';
export class APIError extends Error {constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new APIError(status,message);};
const clean=(value,max=100)=>typeof value==='string'&&value.trim().length<=max?value.trim():'';
const norm=s=>String(s).normalize('NFKC').trim().toLowerCase().replace(/[‘’ʻʼ`]/g,"'").replace(/\s+/g,' ');
const dateOK=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const newId=()=>crypto.randomUUID();
export function scoreLesson(words,answers){
  if(!words.length)fail(400,'Bu darsda faol so‘z qolmagan. Ustozingizga murojaat qiling.');
  if(!Array.isArray(answers)||answers.length!==words.length*(words.length>1?2:1))fail(400,'Barcha so‘zlarning to‘liq testini topshiring.');
  const expected=new Map(words.map(w=>[w.id,w])),seen=new Set();let correct=0;
  for(const a of answers){if(!a||!expected.has(a.id)||!['choice','write'].includes(a.round)||typeof a.answer!=='string'||a.answer.length>500||words.length===1&&a.round!=='write')fail(400,'Test javobi noto‘g‘ri.');const key=a.id+':'+a.round;if(seen.has(key))fail(400,'Takroriy javob.');seen.add(key);if(!a.timeout&&norm(a.answer)===norm(expected.get(a.id).word))correct++;}
  const total=answers.length;return {correct,total,score:Math.floor(correct*100/total),passed:correct*100>=total*80};
}
export async function classroom(request,env){
  const db=env.DB,url=new URL(request.url),path=url.pathname,method=request.method;
  const q=(sql,...args)=>db.prepare(sql).bind(...args),one=(sql,...args)=>q(sql,...args).first(),all=async(sql,...args)=>(await q(sql,...args).all()).results;
  const id=request.headers.get('oai-authenticated-user-id');if(!id)fail(401,'Kirish kerak.');
  if(!db)fail(503,'Ma’lumotlar ombori ulanmagan.');
  let body={};if(method!=='GET'){
    if(method!=='POST')fail(405,'Amal qo‘llab-quvvatlanmaydi.');
    if(request.headers.get('origin')!==url.origin)fail(403,'So‘rov manbasi noto‘g‘ri.');
    if(!request.headers.get('content-type')?.startsWith('application/json'))fail(415,'JSON kerak.');
    const text=await request.text();if(text.length>(path.endsWith('/assignment-draft')?3000000:100000))fail(413,'Bir safar 200 tagacha so‘z yuboring.');
    try{body=JSON.parse(text);if(!body||Array.isArray(body)||typeof body!=='object')throw Error();}catch{fail(400,'Ma’lumot formati noto‘g‘ri.');}
    // D1-backed limit survives Worker instances. Codes are invitations, not authentication.
    const bucket=Math.floor(Date.now()/60000),key=id+':'+bucket;
    await q('INSERT INTO class_rate_limits(id,count,expires) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1',key,Date.now()+120000).run();
    if((await one('SELECT count FROM class_rate_limits WHERE id=?',key)).count>60)fail(429,'Birozdan keyin qayta urinib ko‘ring.');
    await q('DELETE FROM class_rate_limits WHERE expires<?',Date.now()).run();
  }
  const email=request.headers.get('oai-authenticated-user-email')||'';
  const isAdmin=!!env.LEXORA_ADMIN_EMAIL&&email.toLowerCase()===env.LEXORA_ADMIN_EMAIL.toLowerCase();
  let user=await one('SELECT * FROM accounts WHERE id=?',id);
  const admin=()=>{if(!isAdmin)fail(403,'Faqat admin uchun.');};
  const active=()=>{if(!user)fail(409,'Avval ro‘yxatdan o‘ting.');if(user.status!=='active')fail(403,'O‘qituvchi huquqi admin tasdig‘ini kutmoqda.');};
  const teacher=()=>{active();if(user.role!=='teacher')fail(403,'Faqat o‘qituvchi uchun.');};
  const student=()=>{active();if(user.role!=='student')fail(403,'Faqat o‘quvchi uchun.');};
  const group=async gid=>{active();const g=await one('SELECT * FROM class_groups WHERE id=?',gid);if(!g)fail(404,'Guruh topilmadi.');if(user.role==='teacher'){if(g.teacher_id!==id)fail(403,'Bu guruh sizga tegishli emas.');}else if(!await one('SELECT 1 FROM class_members WHERE group_id=? AND student_id=?',gid,id))fail(403,'Avval guruhga qo‘shiling.');return g;};
  const groups=()=>user?.role==='teacher'?all('SELECT g.*, (SELECT count(*) FROM class_members m WHERE m.group_id=g.id) AS memberCount FROM class_groups g WHERE teacher_id=? ORDER BY created DESC',id):all('SELECT g.id,g.name,g.created,a.name AS teacher FROM class_groups g JOIN class_members m ON m.group_id=g.id JOIN accounts a ON a.id=g.teacher_id WHERE m.student_id=? ORDER BY g.created DESC',id);
  if(path==='/api/classroom/me'&&method==='GET')return {user,isAdmin,groups:user?.status==='active'?await groups():[],provider:env.AUTH_PROVIDER||'chatgpt'};
  if(path==='/api/classroom/profile'&&method==='POST'){active();const name=clean(body.name,80);if(!name)fail(400,'Ismingizni kiriting.');await q('UPDATE accounts SET name=? WHERE id=?',name,id).run();return {ok:true};}
  if(path==='/api/classroom/register'&&method==='POST'){
    if(user)fail(409,'Siz ro‘yxatdan o‘tgansiz.');
    const name=clean(body.name,80),role=body.role;if(!name||!['student','teacher'].includes(role))fail(400,'Ism va rolingizni tanlang.');
    let g;if(role==='student'){if(!/^\d{5}$/.test(body.code||''))fail(400,'O‘qituvchingiz bergan 5 xonali IDni kiriting.');g=await one('SELECT * FROM class_groups WHERE code=?',body.code);if(!g)fail(404,'Bunday guruh IDsi topilmadi. O‘qituvchingizdan tekshiring.');}
    // Admin approval policy is unchanged, including when the owner selects teacher.
    const statements=[q('INSERT INTO accounts VALUES(?,?,?,?,?)',id,name,role,role==='teacher'?'pending':'active',Date.now())];
    if(g)statements.push(q('INSERT INTO class_members VALUES(?,?,?)',g.id,id,Date.now()));await db.batch(statements);
    return {ok:true};
  }
  if(path==='/api/classroom/admin/teachers'&&method==='GET'){admin();return {teachers:await all("SELECT id,name,created FROM accounts WHERE role='teacher' AND status='pending' ORDER BY created")};}
  if(path==='/api/classroom/admin/approve'&&method==='POST'){admin();const a=await one("SELECT id FROM accounts WHERE id=? AND role='teacher' AND status='pending'",clean(body.id,200));if(!a)fail(404,'Ariza topilmadi.');await q("UPDATE accounts SET status='active' WHERE id=?",a.id).run();return {ok:true};}
  if(path==='/api/classroom/groups'&&method==='POST'){
    teacher();const name=clean(body.name,80);if(!name)fail(400,'Guruh nomini kiriting.');
    for(let i=0;i<20;i++){const code=String(10000+crypto.getRandomValues(new Uint32Array(1))[0]%90000),gid=newId();try{await q('INSERT INTO class_groups VALUES(?,?,?,?,?)',gid,id,name,code,Date.now()).run();return {id:gid,code,name};}catch(err){if(!String(err).includes('class_groups.code'))throw err;}}fail(503,'Guruh IDsi yaratilmadi. Qayta urinib ko‘ring.');
  }
  if(path==='/api/classroom/join'&&method==='POST'){student();if(!/^\d{5}$/.test(body.code||''))fail(400,'5 xonali ID kiriting.');const g=await one('SELECT * FROM class_groups WHERE code=?',body.code);if(!g)fail(404,'Guruh IDsi topilmadi.');await q('INSERT INTO class_members VALUES(?,?,?) ON CONFLICT DO NOTHING',g.id,id,Date.now()).run();return {id:g.id,name:g.name};}
  const extension=await learningRoutes({db,id,user,path,method,body,teacher,student,group,fail,env});if(extension!==null)return extension;
  if(path==='/api/classroom/library'&&method==='GET'){
    student();const rows=await all(`SELECT w.*,l.group_id,l.deck_id,l.date,l.title,l.created AS lessonCreated,d.name AS deckName,g.name AS groupName,COALESCE(p.created,wp.created) AS passedAt
      FROM class_words w JOIN class_lessons l ON l.id=w.lesson_id JOIN class_decks d ON d.id=l.deck_id JOIN class_groups g ON g.id=l.group_id JOIN class_members m ON m.group_id=g.id AND m.student_id=? LEFT JOIN class_passes p ON p.lesson_id=l.id AND p.student_id=? LEFT JOIN word_passes wp ON wp.word_id=w.id AND wp.student_id=? ORDER BY l.date DESC,l.created DESC,w.rowid`,id,id,id);
    const archivedLessons=new Set((await all('SELECT id FROM class_lessons WHERE archived=1')).map(x=>x.id)),archivedWords=new Set((await all('SELECT id FROM class_words WHERE archived=1')).map(x=>x.id)),states=new Map((await all('SELECT * FROM word_review_state WHERE student_id=?',id)).map(s=>[s.word_id,s]));const controls=new Map();for(const gid of new Set(rows.map(w=>w.group_id)))controls.set(gid,await studentStudyPlan(db,id,gid));return {words:rows.filter(w=>!archivedLessons.has(w.lesson_id)&&!archivedWords.has(w.id)&&(w.passedAt||!controls.get(w.group_id).held.has(w.id))).map(w=>({...w,revisionState:states.get(w.id)||null,frozenUntil:controls.get(w.group_id).frozen?controls.get(w.group_id).plan.freeze_until:0}))};
  }
  const match=path.match(/^\/api\/classroom\/groups\/([^/]+)(?:\/(decks|lessons|attendance))?$/);
  if(match){const g=await group(match[1]),op=match[2];
    if(method==='GET'&&!op){const data={group:g,decks:await all('SELECT d.*, (SELECT count(*) FROM class_words w JOIN class_lessons l ON l.id=w.lesson_id WHERE l.deck_id=d.id) AS wordCount FROM class_decks d WHERE group_id=? ORDER BY created',g.id),lessons:await all('SELECT l.*,d.name AS deckName,(SELECT count(*) FROM class_words w WHERE w.lesson_id=l.id) AS wordCount FROM class_lessons l JOIN class_decks d ON d.id=l.deck_id WHERE l.group_id=? ORDER BY l.date DESC,l.created DESC',g.id)};
      if(user.role==='teacher'){data.students=await all('SELECT a.id,a.name,m.created FROM accounts a JOIN class_members m ON a.id=m.student_id WHERE m.group_id=? ORDER BY a.name',g.id);data.attempts=await all('SELECT t.* FROM class_attempts t JOIN class_lessons l ON l.id=t.lesson_id WHERE l.group_id=? ORDER BY t.created DESC',g.id);data.passes=await all('SELECT p.* FROM class_passes p JOIN class_lessons l ON l.id=p.lesson_id WHERE l.group_id=?',g.id);data.attendance=await all('SELECT * FROM class_attendance WHERE group_id=? ORDER BY date DESC',g.id);}
      else {delete data.group.code;data.passes=await all('SELECT p.* FROM class_passes p JOIN class_lessons l ON l.id=p.lesson_id WHERE l.group_id=? AND student_id=?',g.id,id);}
      if(user.role==='teacher')data.archivedLessons=data.lessons.filter(l=>l.archived);data.lessons=data.lessons.filter(l=>!l.archived);return data;
    }
    if(method==='POST'){teacher();
      if(op==='decks'){const name=clean(body.name,80);if(!name)fail(400,'Deck nomi kerak.');if(await one('SELECT id FROM class_decks WHERE group_id=? AND name=?',g.id,name))fail(409,'Bu nomli deck bor.');const did=newId();await q('INSERT INTO class_decks VALUES(?,?,?,?)',did,g.id,name,Date.now()).run();return {id:did};}
      if(op==='lessons'){
        const title=clean(body.title,100)||'Dars so‘zlari';if(!dateOK(body.date))fail(400,'Dars sanasi noto‘g‘ri.');
        if(!Array.isArray(body.words)||!body.words.length||body.words.length>200)fail(400,'1–200 ta so‘z kiriting.');
        const seen=new Set(),words=body.words.map(w=>{const word=clean(w?.word,120),translation=clean(w?.translation,500),example=clean(w?.example||'',1000);if(!word||!translation)fail(400,'Har so‘zning tarjimasi kerak.');if(seen.has(norm(word)))fail(400,'Bir dars ichida takroriy so‘z bor: '+word);seen.add(norm(word));return {word,translation,example};});
        const did=body.newDeck?newId():clean(body.deckId,100),newName=clean(body.newDeck,80),statements=[];
        if(body.newDeck){if(!newName)fail(400,'Deck nomi kerak.');if(await one('SELECT id FROM class_decks WHERE group_id=? AND name=?',g.id,newName))fail(409,'Bu deck mavjud. Ro‘yxatdan tanlang.');statements.push(q('INSERT INTO class_decks VALUES(?,?,?,?)',did,g.id,newName,Date.now()));}else if(!await one('SELECT id FROM class_decks WHERE id=? AND group_id=?',did,g.id))fail(400,'Shu guruhning deckini tanlang.');
        const lid=newId();statements.push(q('INSERT INTO class_lessons(id,group_id,deck_id,date,title,created) VALUES(?,?,?,?,?,?)',lid,g.id,did,body.date,title,Date.now()));
        // D1 permits 100 bound parameters per query; batches also count toward request limits.
        for(let i=0;i<words.length;i+=20){const chunk=words.slice(i,i+20);statements.push(q('INSERT INTO class_words(id,lesson_id,word,translation,example) VALUES '+chunk.map(()=>'(?,?,?,?,?)').join(','),...chunk.flatMap(w=>[newId(),lid,w.word,w.translation,w.example])));}
        await db.batch(statements);return {id:lid,count:words.length};
      }
      if(op==='attendance'){if(!dateOK(body.date)||!Array.isArray(body.records)||body.records.length>500)fail(400,'Yo‘qlama formati noto‘g‘ri.');const roster=new Set((await all('SELECT student_id FROM class_members WHERE group_id=?',g.id)).map(s=>s.student_id)),seen=new Set();const statements=body.records.map(r=>{if(!roster.has(r.studentId)||seen.has(r.studentId)||!['present','absent','late','excused'].includes(r.status))fail(400,'O‘quvchi yoki yo‘qlama holati noto‘g‘ri.');seen.add(r.studentId);return q('INSERT INTO class_attendance VALUES(?,?,?,?) ON CONFLICT(group_id,student_id,date) DO UPDATE SET status=excluded.status',g.id,r.studentId,body.date,r.status);});if(statements.length)await db.batch(statements);return {ok:true};}
    }
  }
  const lm=path.match(/^\/api\/classroom\/lessons\/([^/]+)(?:\/(submit))?$/);
  if(lm){const l=await one('SELECT * FROM class_lessons WHERE id=? AND archived=0',lm[1]);if(!l)fail(404,'Dars topilmadi.');await group(l.group_id);const words=await all('SELECT * FROM class_words WHERE lesson_id=? AND (archived=0 OR ?=1) ORDER BY rowid',l.id,user.role==='teacher'?1:0);
    const personal=user.role==='student'?await studentStudyPlan(db,id,l.group_id):null;let testWords=words;if(personal){if(personal.frozen)fail(403,'Revision tanaffusda.');const passed=new Set((await all('SELECT word_id FROM word_passes WHERE student_id=?',id)).map(w=>w.word_id));testWords=words.filter(w=>!personal.held.has(w.id)&&(!personal.backlog.has(w.id)||!passed.has(w.id)));}if(method==='GET'&&!lm[2])return {lesson:l,words:testWords};
    if(method==='POST'&&lm[2]==='submit'){student();const aid=clean(body.attemptId,100);if(!/^[a-zA-Z0-9-]{10,100}$/.test(aid))fail(400,'Test IDsi noto‘g‘ri.');const existing=await one('SELECT * FROM class_attempts WHERE id=?',aid);if(existing){if(existing.student_id!==id||existing.lesson_id!==l.id)fail(409,'Test IDsi band.');return {correct:existing.correct,total:existing.total,passed:!!existing.passed,score:Math.floor(existing.correct*100/existing.total),alreadySaved:true};}
      const result=scoreLesson(testWords,body.answers);const statements=[q('INSERT INTO class_attempts VALUES(?,?,?,?,?,?,?)',aid,l.id,id,result.correct,result.total,result.passed?1:0,Date.now())];if(result.passed){for(let i=0;i<testWords.length;i+=30){const chunk=testWords.slice(i,i+30);statements.push(q('INSERT INTO word_passes VALUES '+chunk.map(()=>'(?,?,?)').join(',')+' ON CONFLICT DO NOTHING',...chunk.flatMap(w=>[w.id,id,Date.now()])));}statements.push(q('INSERT INTO class_passes(lesson_id,student_id,attempt_id,created) SELECT ?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM class_words w WHERE w.lesson_id=? AND w.archived=0 AND NOT EXISTS (SELECT 1 FROM word_passes wp WHERE wp.word_id=w.id AND wp.student_id=?)) ON CONFLICT DO NOTHING',l.id,id,aid,Date.now(),l.id,id));}await db.batch(statements);return {...result,lessonCompleted:!!await one('SELECT 1 FROM class_passes WHERE lesson_id=? AND student_id=?',l.id,id)};
    }
  }
  fail(404,'Sahifa topilmadi.');
}

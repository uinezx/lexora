import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {randomUUID,randomInt,randomBytes,createHash} from 'node:crypto';
import {requireTeacher,requireGroupOwner,joinGroup,validateGroupName,approveTeacher} from './domain.js';
const hash=s=>createHash('sha256').update(s).digest('hex');
const actor=row=>row&&({id:row.id,role:row.role,status:row.status,name:row.display_name});
export function openDatabase(filename) {
  const db=new DatabaseSync(filename);db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
  db.exec('CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY)');
  if(!db.prepare('SELECT version FROM migrations WHERE version=1').get()) {
    db.exec('BEGIN IMMEDIATE');
    try{db.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));db.exec('INSERT INTO migrations VALUES(1); COMMIT');}catch(err){db.exec('ROLLBACK');db.close();throw err;}
  }
  db.exec(`CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS telegram_logins (digest TEXT PRIMARY KEY,expires INTEGER NOT NULL);`);
  return {
    close:()=>db.close(),
    login(identity,initData,adminTelegramId,now=Date.now()) {
      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare('DELETE FROM telegram_logins WHERE expires<?').run(now);
        // The same signed data can be URL-encoded or reordered differently.
        // Deduplicate the verified signature, not its transport representation.
        const digest=hash(new URLSearchParams(initData).get('hash')||initData);
        if(db.prepare('SELECT digest FROM telegram_logins WHERE digest=?').get(digest))throw new Error('Telegram login already used; reopen the Mini App');
        db.prepare('INSERT INTO telegram_logins VALUES(?,?)').run(digest,now+360000);
        let u=db.prepare('SELECT * FROM users WHERE telegram_id=?').get(identity.telegramId);
        if(!u){const role=adminTelegramId&&identity.telegramId===adminTelegramId?'admin':'student';db.prepare('INSERT INTO users(id,telegram_id,display_name,role,status) VALUES(?,?,?,?,?)').run(randomUUID(),identity.telegramId,identity.displayName,role,'active');u=db.prepare('SELECT * FROM users WHERE telegram_id=?').get(identity.telegramId);}
        if(u.status==='suspended')throw new Error('Account suspended');
        const token=randomBytes(32).toString('base64url');
        db.prepare('DELETE FROM sessions WHERE expires<?').run(now);
        db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token),u.id,now+86400000);
        db.exec('COMMIT');return {token,user:actor(u)};
      }catch(err){db.exec('ROLLBACK');throw err;}
    },
    session(token,now=Date.now()){return actor(db.prepare('SELECT u.* FROM sessions s JOIN users u ON s.user_id=u.id WHERE s.token_hash=? AND s.expires>? AND u.status<>?').get(hash(token||''),now,'suspended'));},
    logout(token){db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash(token||''));},
    requestTeacher(user){if(!user||user.role!=='student'||user.status!=='active')throw new Error('Active student required');db.prepare("UPDATE users SET role='teacher',status='pending' WHERE id=?").run(user.id);return actor(db.prepare('SELECT * FROM users WHERE id=?').get(user.id));},
    pendingTeachers(user){if(user?.role!=='admin'||user.status!=='active')throw new Error('Admin required');return db.prepare("SELECT id,display_name AS name FROM users WHERE role='teacher' AND status='pending'").all();},
    approve(user,id){const applicant=actor(db.prepare('SELECT * FROM users WHERE id=?').get(id));approveTeacher(user,applicant);db.prepare("UPDATE users SET status='active' WHERE id=?").run(id);},
    createGroup(user,name){requireTeacher(user);const clean=validateGroupName(name);for(let attempt=0;attempt<20;attempt++){const group={id:randomUUID(),teacherId:user.id,name:clean,joinCode:String(randomInt(10000,100000)),archived:false};try{db.prepare('INSERT INTO groups(id,teacher_id,name,join_code,created_at) VALUES(?,?,?,?,?)').run(group.id,user.id,clean,group.joinCode,Date.now());return group;}catch(err){if(!String(err.message).includes('groups.join_code'))throw err;}}throw new Error('Unable to allocate group code');},
    groups(user){if(!user||user.status!=='active')throw new Error('Active account required');return user.role==='teacher'?db.prepare('SELECT id,name,join_code AS joinCode FROM groups WHERE teacher_id=? AND archived=0').all(user.id):db.prepare("SELECT g.id,g.name FROM groups g JOIN memberships m ON g.id=m.group_id WHERE m.student_id=? AND m.status='active' AND g.archived=0").all(user.id);},
    join(user,code){const row=db.prepare('SELECT * FROM groups WHERE join_code=?').get(code);const group=row&&{id:row.id,teacherId:row.teacher_id,joinCode:row.join_code,archived:!!row.archived};const old=group&&db.prepare('SELECT group_id AS groupId,student_id AS studentId,status FROM memberships WHERE group_id=? AND student_id=?').get(group.id,user.id);const m=joinGroup(user,code,group,old);db.prepare("INSERT INTO memberships(group_id,student_id,status,joined_at) VALUES(?,?,'active',?) ON CONFLICT(group_id,student_id) DO UPDATE SET status='active'").run(m.groupId,m.studentId,Date.now());return {id:row.id,name:row.name};},
    addWord(user,groupId,word){const row=db.prepare('SELECT * FROM groups WHERE id=? AND archived=0').get(groupId);requireGroupOwner(user,row&&{teacherId:row.teacher_id});if(typeof word.english!=='string'||!word.english.trim()||word.english.length>120||typeof word.uzbek!=='string'||!word.uzbek.trim()||word.uzbek.length>500)throw new Error('Word and translation required');const id=randomUUID();db.prepare('INSERT INTO words VALUES(?,?,?,?,?,?)').run(id,groupId,user.id,word.english.trim(),word.uzbek.trim(),'{}');return {id};},
    words(user,groupId){const row=db.prepare('SELECT * FROM groups WHERE id=? AND archived=0').get(groupId);if(!row)throw new Error('Group unavailable');if(user?.role==='teacher')requireGroupOwner(user,{teacherId:row.teacher_id});else {const m=db.prepare("SELECT 1 FROM memberships WHERE group_id=? AND student_id=? AND status='active'").get(groupId,user?.id||'');if(!m||user?.status!=='active'||user.role!=='student')throw new Error('Group membership required');}return db.prepare('SELECT id,english,uzbek FROM words WHERE group_id=?').all(groupId);}
  };
}

import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
export function fixture(filename=':memory:'){
 const sqlite=new DatabaseSync(filename);sqlite.exec('PRAGMA foreign_keys=ON');
 sqlite.exec('CREATE TABLE IF NOT EXISTS qa_migrations(name TEXT PRIMARY KEY)');
 for(const name of readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())if(!sqlite.prepare('SELECT 1 FROM qa_migrations WHERE name=?').get(name)){sqlite.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));sqlite.prepare('INSERT INTO qa_migrations VALUES(?)').run(name);}
 const wrap=(sql,args=[])=>({bind(...values){return wrap(sql,values);},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){return sqlite.prepare(sql).run(...args);}});
 return {sqlite,prepare:sql=>wrap(sql),async batch(statements){sqlite.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sqlite.exec('COMMIT');return out;}catch(e){sqlite.exec('ROLLBACK');throw e;}},close:()=>sqlite.close()};
}

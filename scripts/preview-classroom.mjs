// Loopback-only development identities. This file is NEVER bundled into the Worker.
import http from 'node:http';import {mkdirSync} from 'node:fs';import {fixture} from '../tests/d1-fixture.mjs';
import worker from '../dist/server/index.js';
mkdirSync('.sites-local',{recursive:true});const DB=fixture('.sites-local/classroom-preview.sqlite');
const port=Number(process.env.LEXORA_PREVIEW_PORT)||4173,origin='http://127.0.0.1:'+port,env={DB,LEXORA_ADMIN_EMAIL:'owner@example.test'};
http.createServer(async(req,res)=>{try{
 const path=req.url,selection=path.match(/^\/__preview\/identity\/(teacher|student|student2|guest)$/);
 if(selection){res.writeHead(302,{'set-cookie':`qa_actor=${selection[1]}; Path=/; SameSite=Lax`,location:'/'});res.end();return;}
 const actor=(req.headers.cookie||'').match(/qa_actor=(teacher|student2|student|guest)/)?.[1]||'teacher';
 if(actor==='guest'&&path.startsWith('/api/')){res.writeHead(401,{'content-type':'application/json'});res.end(JSON.stringify({error:'Hisobga kiring.',provider:'telegram'}));return;}
 const chunks=[];for await(const c of req)chunks.push(c);const headers=new Headers(req.headers);headers.set('oai-authenticated-user-id','qa-'+actor);headers.set('oai-authenticated-user-email',actor==='teacher'?'owner@example.test':actor+'@example.test');
 const request=new Request(origin+path,{method:req.method,headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});const response=await worker.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch(err){console.error(err);res.writeHead(500);res.end('Local preview error');}}).listen(port,'127.0.0.1',()=>console.log('Classroom QA preview '+origin+' (local test identities only)'));

import http from 'node:http';
import {verifyTelegramInitData} from './telegram-auth.js';
export function createAPI({store,botToken,adminTelegramId,origin,secureCookies=true}) {
  const limits=new Map();
  return http.createServer(async(req,res)=>{
    const json=(code,value)=>{res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(value));};
    try {
      const url=new URL(req.url,origin),now=Date.now(),ip=req.socket.remoteAddress;
      for(const [k,v] of limits)if(v.until<now)limits.delete(k);
      const limit=limits.get(ip)||{n:0,until:now+60000};limit.n++;limits.set(ip,limit);
      if(limit.n>60||limits.size>10000)return json(429,{error:'Too many requests; try again later'});
      if(req.method==='GET'&&url.pathname==='/api/health')return json(200,{status:'ok',telegramConfigured:!!botToken});
      if(req.method==='POST'&&req.headers.origin!==origin)return json(403,{error:'Origin rejected'});
      const cookie=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('lexora_session='));
      const token=cookie?.slice('lexora_session='.length)||'',user=store.session(token);
      let body={};
      if(req.method==='POST'){
        if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'JSON required'});
        let bytes=0,chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>32768)return json(413,{error:'Request too large'});chunks.push(chunk);}
        try{body=JSON.parse(Buffer.concat(chunks).toString()||'{}');if(!body||Array.isArray(body)||typeof body!=='object')throw Error();}catch{return json(400,{error:'Invalid JSON'});}
      }
      if(req.method==='POST'&&url.pathname==='/api/auth/telegram'){
        if(!botToken)return json(503,{error:'Telegram login not configured'});
        let identity;try{identity=verifyTelegramInitData(body.initData,botToken);}catch{return json(401,{error:'Invalid or expired Telegram login'});}
        let login;try{login=store.login(identity,body.initData,adminTelegramId);}catch{return json(401,{error:'Login unavailable; reopen the Mini App'});}
        res.setHeader('Set-Cookie',`lexora_session=${login.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${secureCookies?'; Secure':''}`);
        return json(200,{user:login.user});
      }
      if(!user)return json(401,{error:'Sign in required'});
      if(req.method==='GET'&&url.pathname==='/api/me')return json(200,{user});
      if(req.method==='POST'&&url.pathname==='/api/logout'){store.logout(token);res.setHeader('Set-Cookie',`lexora_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureCookies?'; Secure':''}`);return json(200,{ok:true});}
      if(req.method==='POST'&&url.pathname==='/api/teacher/apply')return json(200,{user:store.requestTeacher(user)});
      if(req.method==='GET'&&url.pathname==='/api/admin/teachers')return json(200,{teachers:store.pendingTeachers(user)});
      if(req.method==='POST'&&/^\/api\/admin\/teachers\/[^/]+\/approve$/.test(url.pathname)){store.approve(user,url.pathname.split('/')[4]);return json(200,{ok:true});}
      if(req.method==='GET'&&url.pathname==='/api/groups')return json(200,{groups:store.groups(user)});
      if(req.method==='POST'&&url.pathname==='/api/groups')return json(201,{group:store.createGroup(user,body.name)});
      if(req.method==='POST'&&url.pathname==='/api/groups/join')return json(200,{group:store.join(user,body.code)});
      const match=url.pathname.match(/^\/api\/groups\/([^/]+)\/words$/);
      if(match&&req.method==='GET')return json(200,{words:store.words(user,match[1])});
      if(match&&req.method==='POST')return json(201,store.addWord(user,match[1],body));
      return json(404,{error:'Not found'});
    }catch{return json(403,{error:'Request not permitted or invalid data'});}
  });
}

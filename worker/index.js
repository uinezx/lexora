import {classroom,APIError} from './classroom.js';
import {assets} from './assets.js';
export default {async fetch(request,env){
 const path=new URL(request.url).pathname;
 if(path.startsWith('/api/classroom/')){
   try{return Response.json(await classroom(request,env),{headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});}
   catch(error){if(!(error instanceof APIError))console.error('Classroom request failed',String(error));return Response.json({error:error instanceof APIError?error.message:'Serverda xatolik. Birozdan keyin qayta urinib ko‘ring.'},{status:error instanceof APIError?error.status:500,headers:{'cache-control':'no-store'}});}
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const asset=assets[path==='/'?'/index.html':path];if(!asset)return new Response('Not found',{status:404});
 return new Response(request.method==='HEAD'?null:Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0)),{headers:{'content-type':asset.type,'cache-control':'no-cache','x-content-type-options':'nosniff'}});
}};

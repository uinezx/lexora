// Local canvas scene: words follow a three-dimensional torus. No remote assets.
export function mountWordScene(root,isPaused){
 const canvas=root.querySelector('#lx-word-canvas'),ctx=canvas?.getContext('2d');if(!ctx)return()=>{};
 let w=0,h=0,frame=0,phase=.45,last=0,inView=true,stopped=false,px=0,py=0,targetX=0,targetY=0,theme='';
 const hero=root.querySelector('.lx-hero'),control=new AbortController(),signal=control.signal;
 const tokens=['remember','discover','imagine','create','speak','learn','curiosity','understand','listen','grow','express','explore','believe','connect','begin','practice'];
 const dots=Array.from({length:1200},(_,i)=>({u:i/1200*Math.PI*2*23.618,v:i/1200*Math.PI*2}));
 function resize(){const box=canvas.getBoundingClientRect();w=box.width;h=box.height;const dpr=Math.min(devicePixelRatio||1,1.7);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
 function project(u,v,radius,rotation){const rr=radius*(1+.23*Math.cos(v));let x=rr*Math.cos(u),y=radius*.23*Math.sin(v),z=rr*Math.sin(u);const cy=Math.cos(rotation),sy=Math.sin(rotation),xx=x*cy-z*sy,zz=x*sy+z*cy;const tilt=.70+py*.10,yy=y*Math.cos(tilt)-zz*Math.sin(tilt),zzz=y*Math.sin(tilt)+zz*Math.cos(tilt);const scale=720/(720+zzz);return {x:w*.55+xx*scale,y:h*.50+yy*scale,z:zzz,scale};}
 function draw(){if(!w||!h)return;theme=document.documentElement.dataset.theme||'light';const dark=theme==='dark',ink=dark?'243,237,222':'42,48,48',accent=dark?'255,113,85':'198,66,39';ctx.clearRect(0,0,w,h);const radius=Math.min(w*.37,h*.43),rotation=phase+px*.15;
 const projected=dots.map(d=>project(d.u,d.v,radius,rotation)).sort((a,b)=>b.z-a.z);
 for(const p of projected){const front=p.z<0;ctx.fillStyle=`rgba(${front?accent:ink},${front?.28:.09})`;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.55,1.05*p.scale),0,Math.PI*2);ctx.fill();}
 for(let j=0;j<2;j++)for(let i=0;i<16;i++){const u=i/16*Math.PI*2+phase*.18+j*.13,v=j?Math.PI*.95:Math.PI*.12,p=project(u,v,radius,rotation);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-.12+Math.cos(u+rotation)*.13);ctx.font=`${j?500:600} ${(j?13:20)*p.scale}px "Plus Jakarta Sans", sans-serif`;ctx.textAlign='center';ctx.fillStyle=`rgba(${p.z<0?accent:ink},${p.z<0?.9:.24})`;ctx.fillText(tokens[(i+j*5)%tokens.length],0,0);ctx.restore();}
 }
 function tick(time){if(stopped)return;frame=requestAnimationFrame(tick);if(!root.isConnected){stop();return;}if(document.hidden||!inView)return;const currentTheme=document.documentElement.dataset.theme||'light';if(isPaused()){if(currentTheme!==theme)draw();last=time;return;}if(time-last<32)return;const delta=Math.min(60,time-last||32);last=time;phase+=delta*.000075;px+=(targetX-px)*.04;py+=(targetY-py)*.04;draw();}
 const ro=new ResizeObserver(resize);ro.observe(canvas);const io=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;},{rootMargin:'80px'});io.observe(hero);
 hero.addEventListener('pointermove',ev=>{if(ev.pointerType!=='mouse')return;const b=hero.getBoundingClientRect();targetX=(ev.clientX-b.left)/b.width-.5;targetY=(ev.clientY-b.top)/b.height-.5;},{passive:true,signal});hero.addEventListener('pointerleave',()=>{targetX=targetY=0;},{signal});
 function stop(){if(stopped)return;stopped=true;cancelAnimationFrame(frame);ro.disconnect();io.disconnect();control.abort();}
 resize();frame=requestAnimationFrame(tick);return stop;
}

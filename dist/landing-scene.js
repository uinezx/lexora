// Scroll choreography: a dimensional word orbit opens, then becomes a sentence.
// Geometry is local; the six final words remain real readable text in the markup.
export function mountWordScene(root,isPaused){
 const canvas=root.querySelector('#lx-word-canvas'),ctx=canvas?.getContext('2d');if(!ctx)return()=>{};
 const hero=root.querySelector('.lx-hero'),story=root.querySelector('.lx-hero-story'),sentence=root.querySelector('.lx-scroll-sentence'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),control=new AbortController(),signal=control.signal;
 const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
 const tokens=['I','remember','the','words','I','use.','discover','imagine','create','speak','learn','curiosity','understand','listen','grow','express','explore','believe','connect','begin','practice','discover','remember','imagine'];
 const dots=Array.from({length:880},(_,i)=>({u:i/880*Math.PI*2*23.618,v:i/880*Math.PI*2,seed:i/880}));
 let w=0,h=0,frame=0,phase=.45,last=0,inView=true,stopped=false,progress=0,targetProgress=0,px=0,py=0,targetX=0,targetY=0,theme='',dirty=true;
 function sampleProgress(){if(reduced.matches||!story){targetProgress=0;return;}const box=story.getBoundingClientRect();targetProgress=clamp(-box.top/Math.max(1,box.height-hero.offsetHeight));dirty=true;}
 function resize(){const box=canvas.getBoundingClientRect();w=box.width;h=box.height;const dpr=Math.min(devicePixelRatio||1,1.7);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);sampleProgress();draw();}
 function project(u,v,radius,rotation,p){
  const rr=radius*(1+.22*Math.cos(v));let x=rr*Math.cos(u),y=radius*.22*Math.sin(v),z=rr*Math.sin(u);
  const cy=Math.cos(rotation),sy=Math.sin(rotation),xx=x*cy-z*sy,zz=x*sy+z*cy,tilt=mix(.65,1.32,smooth(.18,.58,p))+py*.06;
  const yy=y*Math.cos(tilt)-zz*Math.sin(tilt),zzz=y*Math.sin(tilt)+zz*Math.cos(tilt),scale=900/(900+zzz);
  const mobile=w<760,cx=mix(mobile?w*.5:w*.72,w*.5,smooth(.1,.5,p)),cyy=mix(mobile?h*.47:h*.51,h*.48,smooth(.15,.52,p));
  return {x:cx+xx*scale,y:cyy+yy*scale,z:zzz,scale};
 }
 function sentenceTargets(){
  const size=Math.min(w<760?w*.105:w*.059,88),rows=[tokens.slice(0,2),tokens.slice(2,6)],result=[];ctx.font=`600 ${size}px "Plus Jakarta Sans", sans-serif`;
  rows.forEach((row,n)=>{const widths=row.map(t=>ctx.measureText(t).width),gap=size*.26,total=widths.reduce((a,b)=>a+b,0)+gap*(row.length-1);let x=(w-total)/2;row.forEach((word,i)=>{result.push({x:x+widths[i]/2,y:h*.45+n*size*1.4,size});x+=widths[i]+gap;});});return result;
 }
 function draw(){
  if(!w||!h)return;theme=document.documentElement.dataset.theme||'light';const p=progress,dark=theme==='dark',warm=p>.88,ink=warm?'25,48,40':dark?'241,237,222':'32,40,37',accent=warm?'97,53,35':dark?'247,137,98':'187,64,39',open=smooth(.1,.55,p),assemble=smooth(.48,.91,p),final=smooth(.82,.97,p),mobile=w<760;
  ctx.clearRect(0,0,w,h);
  const radius=Math.min(w*(mobile?.33:.245),h*.36)*(1+Math.sin(open*Math.PI)*.25),rotation=phase+px*.12+p*2.35;
  // Fine orbital rails make the camera movement legible, without a decorative grid.
  for(let band=0;band<3;band++){ctx.beginPath();for(let i=0;i<=150;i++){const q=project(i/150*Math.PI*2,band*Math.PI*.67,radius,rotation,p);const y=q.y+assemble*Math.sin(i*.07+band)*h*.12;if(i===0)ctx.moveTo(q.x,y);else ctx.lineTo(q.x,y);}ctx.strokeStyle=`rgba(${accent},${.12*(1-final)})`;ctx.lineWidth=.7;ctx.stroke();}
  const projected=dots.map(d=>{const q=project(d.u,d.v,radius,rotation,p);const spread=smooth(.48,.94,p);q.x=mix(q.x,w*(d.seed*1.3-.15),spread);q.y=mix(q.y,h*.49+Math.sin(d.seed*25+phase)*h*.32,spread);return q;}).sort((a,b)=>b.z-a.z);
  for(const q of projected){ctx.fillStyle=`rgba(${q.z<0?accent:ink},${(q.z<0?.31:.11)*(1-final)})`;ctx.beginPath();ctx.arc(q.x,q.y,Math.max(.5,1.05*q.scale),0,Math.PI*2);ctx.fill();}
  const targets=sentenceTargets(),entries=tokens.map((text,i)=>{const q=project(i/tokens.length*Math.PI*2+phase*.1,i%2?Math.PI*.92:Math.PI*.1,radius,rotation,p);return {...q,text,i};}).sort((a,b)=>b.z-a.z);
  for(const q of entries){const selected=q.i<6,t=selected?smooth(.42+q.i*.018,.84+q.i*.018,p):0,dest=targets[q.i],size=selected?mix((mobile?17:22)*q.scale,dest.size,t):(mobile?16:22)*q.scale;const x=selected?mix(q.x,dest.x,t):q.x+assemble*(q.x-w/2)*1.5,y=selected?mix(q.y,dest.y,t):q.y+assemble*(q.y-h/2)*1.5,alpha=selected?mix(q.z<0?.94:.3,1,t):(q.z<0?.84:.22)*(1-smooth(.36,.78,p));
   if(alpha<.01)continue;ctx.save();ctx.translate(x,y);ctx.rotate((-.1+Math.cos(q.i+rotation)*.13)*(1-t));ctx.scale(mix(1,.99,t),1);ctx.font=`${selected&&t>.3?600:500} ${size}px "Plus Jakarta Sans", sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
   const color=selected&&q.i===1?accent:((q.z<0&&t<.4)?accent:ink);
   // A restrained extruded edge gives foreground words a physical face.
   if(q.z<0&&t<.7){ctx.fillStyle=`rgba(${ink},${alpha*.1})`;ctx.fillText(q.text,1.5,3);}
   ctx.fillStyle=`rgba(${color},${alpha*(1-final)})`;ctx.fillText(q.text,0,0);ctx.restore();
  }
  root.style.setProperty('--lx-hero-title',String(1-smooth(.035,.26,p)));root.style.setProperty('--lx-core-opacity',String(1-smooth(.02,.22,p)));root.style.setProperty('--lx-sentence-opacity',String(final));root.style.setProperty('--lx-caption-opacity',String(smooth(.72,.92,p)));root.style.setProperty('--lx-scroll-progress',String(p));root.style.setProperty('--lx-hero-copy',String(1-smooth(.12,.4,p)));root.style.setProperty('--lx-sentence-size',targets[0].size+'px');root.style.setProperty('--lx-sentence-y',h*.45+'px');
  root.style.setProperty('--lx-wipe-radius',smooth(.78,.97,p)*150+'%');root.dataset.heroTone=warm?'warm':'base';root.dataset.heroBeat=p<.26?'orbit':p<.72?'unfold':'sentence';if(sentence)sentence.inert=final<.8;
 }
 function tick(time){if(stopped)return;frame=requestAnimationFrame(tick);if(!root.isConnected){stop();return;}if(document.hidden||!inView)return;
  const newTheme=document.documentElement.dataset.theme||'light';if(isPaused()||reduced.matches){if(newTheme!==theme||dirty){dirty=false;draw();}last=time;return;}
  if(time-last<15)return;const dt=Math.min(50,time-last||16);last=time;phase+=dt*.000075;progress+= (targetProgress-progress)*(1-Math.exp(-dt/75));if(Math.abs(targetProgress-progress)<.0001)progress=targetProgress;px+=(targetX-px)*.07;py+=(targetY-py)*.07;dirty=false;draw();
 }
 const ro=new ResizeObserver(resize);ro.observe(canvas);const io=new IntersectionObserver(e=>{inView=e[0].isIntersecting;},{rootMargin:'80px'});io.observe(hero);
 window.addEventListener('scroll',sampleProgress,{passive:true,signal});window.addEventListener('resize',sampleProgress,{passive:true,signal});
 hero.addEventListener('pointermove',ev=>{if(ev.pointerType!=='mouse')return;const b=hero.getBoundingClientRect();targetX=(ev.clientX-b.left)/b.width-.5;targetY=(ev.clientY-b.top)/b.height-.5;},{passive:true,signal});hero.addEventListener('pointerleave',()=>{targetX=targetY=0;},{signal});
 const observer=new MutationObserver(()=>{dirty=true;});observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 function stop(){if(stopped)return;stopped=true;cancelAnimationFrame(frame);ro.disconnect();io.disconnect();observer.disconnect();control.abort();}
 resize();frame=requestAnimationFrame(tick);return stop;
}

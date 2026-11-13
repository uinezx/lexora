export const DAY=86400000;
export function schedule(card,grade,now=Date.now()) {
  const ease=Math.max(1.3,(card.ease||2.5)+(grade==='easy'?.15:grade==='hard'?-.15:grade==='again'?-.2:0));
  const reps=grade==='again'?0:(card.reps||0)+1;
  const interval=grade==='again'?0:reps===1?(grade==='easy'?4:1):reps===2?(grade==='hard'?3:grade==='easy'?7:4):Math.max(1,Math.round((card.interval||1)*(grade==='hard'?1.2:grade==='easy'?ease*1.3:ease)));
  return {...card,ease,reps,interval,due:now+(grade==='again'?60000:interval*DAY),reviews:(card.reviews||0)+1};
}
export function parseWords(text,deck='Mening so‘zlarim') {
  const rows=[],errors=[];
  for(const [i,line] of text.split(/\r?\n/).entries()) {
    if(!line.trim())continue;
    const cells=line.split(/\t|;|\s+—\s+|\s+-\s+|\s*=\s*/).map(x=>x.trim());
    if(cells.length<2||!cells[0]||!cells[1]){errors.push(i+1);continue;}
    if(cells[0].length>120||cells[1].length>500){errors.push(i+1);continue;}
    rows.push({word:cells[0],translation:cells[1],example:cells[2]||'',deck,level:'B2'});
  }
  return {rows,errors};
}
export function normalize(s){return s.normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/[‘’ʻʼ]/g,"'");}
export function dateKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function streak(log,now=new Date()){
  const d=new Date(now);let n=0;
  if(!log[dateKey(d)])d.setDate(d.getDate()-1);
  while(log[dateKey(d)]>0){n++;d.setDate(d.getDate()-1);}return n;
}

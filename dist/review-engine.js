export const GRADES=['again','hard','good','easy'];
export const DEFAULT_KEYS={again:'ArrowDown',hard:'ArrowLeft',good:'ArrowRight',easy:'ArrowUp',flip:'Space'};
export function preferences(value={}){
 value=value&&typeof value==='object'?value:{};
 const keys=Object.fromEntries(Object.keys(DEFAULT_KEYS).map(k=>[k,value.keys?.[k]??DEFAULT_KEYS[k]]));
 if(Object.values(keys).some(k=>typeof k!=='string'||!k||k.length>30)||new Set(Object.values(keys)).size!==5)Object.assign(keys,DEFAULT_KEYS);
 return {keys,accent:value.accent==='en-GB'?'en-GB':'en-US',voiceURI:typeof value.voiceURI==='string'?value.voiceURI:'',rate:Number.isFinite(value.rate)?Math.min(1.2,Math.max(.6,value.rate)):1,autoAudio:value.autoAudio!==false,writeReview:!!value.writeReview,motion:value.motion!==false,testSeconds:[0,15,30].includes(value.testSeconds)?value.testSeconds:15};
}
export function swipeGrade(dx,dy,threshold=65){if(Math.max(Math.abs(dx),Math.abs(dy))<threshold)return null;return Math.abs(dx)>Math.abs(dy)?dx>0?'good':'hard':dy<0?'easy':'again';}
export function keyLabel(key){return ({ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',Space:'Space',Enter:'Enter'})[key]||key.replace(/^Key/,'').replace(/^Digit/,'');}
export function inputKey(event){return event.code==='Space'?'Space':event.key.length===1?event.key.toLowerCase():event.key;}
export function normalizeAnswer(value){return String(value).normalize('NFKC').trim().toLowerCase().replace(/[‘’ʻʼ`]/g,"'").replace(/\s+/g,' ');}
export function answerMatches(answer,word){return normalizeAnswer(answer)===normalizeAnswer(word);}
// Length is a predictable proxy for recall/typing effort, not a claimed CEFR difficulty.
export function testDuration(word,round='write',pace=15){
 if(pace===0)return 0;
 const text=String(word??'').normalize('NFKC').trim(),letters=[...text].filter(c=>/[\p{L}\p{N}]/u.test(c)).length;
 const extraWords=Math.max(0,(text.match(/\S+/g)||[]).length-1);
 const seconds=round==='choice'?6+letters*.55+extraWords:8+letters*1.1+extraWords*2;
 return Math.min(pace===30?120:90,Math.max(8,Math.ceil(seconds*(pace===30?1.5:1))));
}
export function revisionLabel(card,grade){
 if(grade==='again')return '1 daqiqa';
 if(card.phase!=='review'&&grade==='hard')return '6 daqiqa';
 if(card.phase!=='review'&&grade==='good'&&!card.step)return '10 daqiqa';
 const ease=Math.max(1.3,Number(card.ease||2.5)+(grade==='hard'?-.15:grade==='easy'?.15:0));
 return (card.interval?Math.max(1,Math.round(card.interval*(grade==='hard'?1.2:grade==='easy'?ease*1.3:ease))):grade==='easy'?4:1)+' kun';
}
export function newReview(cards,deck='',now=Date.now()) {return {version:2,ids:cards.map(c=>c.id),deck,index:0,done:0,seenIds:[],grades:{again:0,hard:0,good:0,easy:0},startedAt:now,phase:'review',test:null,testXpIds:[]};}
export function restoreReview(value,cards){
 if(!value||!Array.isArray(value.ids)||!Number.isInteger(value.index)||value.index<0||value.index>value.ids.length||new Set(value.ids).size!==value.ids.length)return null;
 const allowed=new Set(cards.map(c=>c.id));if(value.ids.some(id=>!allowed.has(id)))return null;
 const result={...newReview([]),...value,version:2,grades:{again:0,hard:0,good:0,easy:0,...value.grades},seenIds:Array.isArray(value.seenIds)?value.seenIds.filter(id=>value.ids.includes(id)):value.ids.slice(0,value.index),testXpIds:Array.isArray(value.testXpIds)?value.testXpIds.filter(id=>value.ids.includes(id)):[]};
 if(!['review','summary','test','result'].includes(result.phase))result.phase='review';
 if(result.phase==='review'&&result.index>=result.ids.length)result.phase='summary';
 if(['test','result'].includes(result.phase)&&(!result.test||!Array.isArray(result.test.ids)||!Array.isArray(result.test.answers)||result.test.ids.some(id=>!result.seenIds.includes(id))||result.test.answers.some(a=>!a||!result.test.ids.includes(a.id)||!['choice','write'].includes(a.round)||typeof a.correct!=='boolean'||typeof a.answer!=='string')))return null;
 if(result.phase==='test'&&result.test.checked&&!result.test.answers.some(a=>a.id===result.test.ids[result.test.index]&&a.round===result.test.round))return null;
 if(result.phase==='test'&&(!result.test||!Array.isArray(result.test.ids)||!result.test.ids.length||result.test.ids.some(id=>!result.seenIds.includes(id))||!['choice','write'].includes(result.test.round)||!Number.isInteger(result.test.index)||result.test.index<0||result.test.index>=result.test.ids.length||!Array.isArray(result.test.answers)))return null;
 return result;
}
export function recordReview(session,id,grade){if(!GRADES.includes(grade)||session.ids[session.index]!==id||session.phase!=='review')return false;session.grades[grade]++;if(!session.seenIds.includes(id))session.seenIds.push(id);session.index++;session.done++;if(session.index>=session.ids.length)session.phase='summary';return true;}
export function makeTest(session,retryIds){const ids=[...new Set(retryIds||session.seenIds)].filter(id=>session.seenIds.includes(id));if(!ids.length)return false;session.test={ids,round:'choice',index:0,answers:[],checked:false,deadline:0,attempt:(session.test?.attempt||0)+1};session.phase='test';return true;}
export function testChoices(card,cards){const distractors=[...new Set(cards.filter(c=>c.id!==card.id&&normalizeAnswer(c.word)!==normalizeAnswer(card.word)).map(c=>c.word))];for(let i=distractors.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[distractors[i],distractors[j]]=[distractors[j],distractors[i]];}const choices=[card.word,...distractors.slice(0,3)];for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}return choices;}

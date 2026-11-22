import {createHmac,timingSafeEqual} from 'node:crypto';
export function verifyTelegramInitData(raw,token,now=Math.floor(Date.now()/1000)) {
  if(!token)throw new Error('Telegram login is not configured');
  if(typeof raw!=='string'||raw.length>16384)throw new Error('Invalid Telegram data');
  const p=new URLSearchParams(raw),keys=[...p.keys()];
  if(new Set(keys).size!==keys.length)throw new Error('Duplicate Telegram fields');
  const hash=p.get('hash');
  if(!/^[a-f0-9]{64}$/.test(hash||''))throw new Error('Invalid Telegram signature');
  p.delete('hash');
  const data=[...p.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>`${k}=${v}`).join('\n');
  const secret=createHmac('sha256','WebAppData').update(token).digest();
  const expected=createHmac('sha256',secret).update(data).digest();
  if(!timingSafeEqual(expected,Buffer.from(hash,'hex')))throw new Error('Invalid Telegram signature');
  const date=Number(p.get('auth_date'));
  if(!Number.isInteger(date)||now-date>300||date>now+30)throw new Error('Expired Telegram data');
  const user=JSON.parse(p.get('user')||'null');
  if(!user||!Number.isSafeInteger(user.id)||user.id<=0||typeof user.first_name!=='string'||user.is_bot)throw new Error('Invalid Telegram user');
  return {telegramId:String(user.id),displayName:[user.first_name,user.last_name].filter(x=>typeof x==='string').join(' ').slice(0,120)};
}

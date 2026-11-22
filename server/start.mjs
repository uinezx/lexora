import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {openDatabase} from './database.js';
import {createAPI} from './api.js';
const port=Number(process.env.PORT||4174),origin=process.env.PUBLIC_ORIGIN||`http://127.0.0.1:${port}`;
const dbPath=path.resolve(process.env.LEXORA_DB||'data/lexora.sqlite');mkdirSync(path.dirname(dbPath),{recursive:true});
const store=openDatabase(dbPath);
const api=createAPI({store,origin,botToken:process.env.TELEGRAM_BOT_TOKEN,adminTelegramId:process.env.ADMIN_TELEGRAM_ID,secureCookies:new URL(origin).protocol==='https:'});
api.listen(port,'127.0.0.1',()=>console.log(`Lexora API listening on http://127.0.0.1:${port}; Telegram ${process.env.TELEGRAM_BOT_TOKEN?'configured':'not configured'}`));
function stop(){api.close(()=>{store.close();process.exit(0);});}
process.on('SIGINT',stop);process.on('SIGTERM',stop);

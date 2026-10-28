import {cadences,templates,demoRows} from './content.js';
import http from 'node:http';
import { encryption, digest, derivePassword, limit } from './security.js';
import { lessons, learningContent } from './learning.js';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, chmodSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.umask(0o077);
const root = path.dirname(fileURLToPath(import.meta.url));
const production = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
const origin = process.env.APP_ORIGIN || `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`;
if (production && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 14 || !process.env.APP_ORIGIN?.startsWith('https://'))) {
  throw new Error('Produção exige ADMIN_PASSWORD com 14+ caracteres e APP_ORIGIN HTTPS.');
}
if(new URL(origin).origin!==origin||new URL(origin).username||new URL(origin).password)throw Error('APP_ORIGIN deve ser uma origem exata, sem caminho ou credenciais.');
const dataDir = process.env.DATA_DIR || path.join(root, '.data');
mkdirSync(dataDir, { recursive: true, mode: 0o700 });
if(path.resolve(dataDir).startsWith(path.join(root,'public')))throw Error('O banco não pode ficar na pasta pública.');
const db = new DatabaseSync(path.join(dataDir, 'escala7.sqlite'));
chmodSync(path.join(dataDir,'escala7.sqlite'),0o600);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA secure_delete=ON;
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), csrf TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), name TEXT NOT NULL, company TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', segment TEXT NOT NULL, stage TEXT NOT NULL, channel TEXT NOT NULL, cadence TEXT NOT NULL, step INTEGER NOT NULL DEFAULT 0, next_date TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', permission TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS activities (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), lead_id INTEGER NOT NULL REFERENCES leads(id), kind TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL);`);
db.exec(`CREATE TABLE IF NOT EXISTS learning_progress (user_id INTEGER NOT NULL REFERENCES users(id), lesson_id TEXT NOT NULL, completed_at TEXT NOT NULL, PRIMARY KEY(user_id, lesson_id));`);
db.exec(`CREATE TABLE IF NOT EXISTS auth_sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), csrf TEXT NOT NULL, expires INTEGER NOT NULL, last_seen INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS security_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS security_audit (id INTEGER PRIMARY KEY, user_id INTEGER, event TEXT NOT NULL, created_at TEXT NOT NULL);
DROP TABLE IF EXISTS sessions;`);
if(!db.prepare('PRAGMA table_info(users)').all().some(c=>c.name==='is_demo'))db.exec('ALTER TABLE users ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0');
const vault=encryption(root,db,production);
function audit(uid,event){db.prepare('INSERT INTO security_audit(user_id,event,created_at) VALUES(?,?,?)').run(uid,event,new Date().toISOString());}
const email = (process.env.ADMIN_EMAIL || 'demo@escala7.local').toLowerCase();
if (!db.prepare('SELECT id FROM users WHERE email=?').get(email)) {
  const salt = randomBytes(16).toString('hex');
  const password = process.env.ADMIN_PASSWORD || randomBytes(18).toString('base64url');
  db.prepare('INSERT INTO users(email,name,salt,hash) VALUES(?,?,?,?)').run(email, 'Marina Costa', salt, (await derivePassword(password, salt, 64)).toString('hex'));
}
function dateOffset(days) { const d=new Date(); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
function seed(userId) {
  if(db.prepare('SELECT id FROM leads WHERE user_id=? LIMIT 1').get(userId)) return;

  const insert=db.prepare('INSERT INTO leads(user_id,name,company,email,segment,stage,channel,cadence,step,next_date,notes,permission,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)');
  for(const [name,company,segment,stage,channel,cadence,step,offset,notes,permission] of demoRows) insert.run(userId,vault.encode(userId,'name',name),vault.encode(userId,'company',company),vault.encode(userId,'email',''),vault.encode(userId,'segment',segment),stage,channel,cadence,step,dateOffset(offset),vault.encode(userId,'notes',notes),permission,new Date().toISOString());
}
const user = db.prepare('SELECT id FROM users WHERE email=?').get(email);
if(!production) seed(user.id);

const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
function json(res,status,data) { res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data)); }
async function body(req) {
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))throw Object.assign(new Error('Use conteúdo JSON.'),{status:415});
  let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>16384)throw Object.assign(new Error('Conteúdo muito grande.'),{status:413});}
  let parsed;try{parsed=JSON.parse(raw||'{}');}catch{throw Object.assign(new Error('JSON inválido.'),{status:400});}
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Object.assign(new Error('Informe um objeto JSON.'),{status:400});return parsed;
}
function text(value,max=200,required=false){if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw Object.assign(new Error('Revise os campos informados.'),{status:400});return value.trim();}
function session(req){
  const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('escala_session='))?.slice(15);
  if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
  const s=db.prepare('SELECT auth_sessions.*,users.name,users.email,users.is_demo FROM auth_sessions JOIN users ON users.id=auth_sessions.user_id WHERE token_hash=? AND expires>? AND last_seen>?').get(digest(token),Date.now(),Date.now()-30*60000);
  if(s)db.prepare('UPDATE auth_sessions SET last_seen=? WHERE token_hash=?').run(Date.now(),s.token_hash);return s;
}
function createSession(res,uid){const token=randomBytes(32).toString('hex'),csrf=randomBytes(24).toString('hex');db.prepare('DELETE FROM auth_sessions WHERE expires<? OR last_seen<?').run(Date.now(),Date.now()-30*60000);db.prepare('INSERT INTO auth_sessions VALUES(?,?,?,?,?)').run(digest(token),uid,csrf,Date.now()+8*3600000,Date.now());res.setHeader('Set-Cookie',`escala_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${production?'; Secure':''}`);return csrf;}
function activity(uid,id,kind,detail){db.prepare('INSERT INTO activities(user_id,lead_id,kind,detail,created_at) VALUES(?,?,?,?,?)').run(uid,id,kind,detail,new Date().toISOString());}
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','same-origin');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");res.setHeader('Cache-Control','no-store');if(production)res.setHeader('Strict-Transport-Security','max-age=31536000');
  try {
    const url=new URL(req.url,origin),p=url.pathname;
    if(!p.startsWith('/api/')) {if(req.method!=='GET')return json(res,405,{error:'Método não permitido.'});const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css'};if(!files[p])return json(res,404,{error:'Não encontrado.'});const file=files[p];res.writeHead(200,{'Content-Type':mime[path.extname(file)]});return res.end(readFileSync(path.join(root,'public',file)));}
    if(p==='/api/mode'&&req.method==='GET')return json(res,200,{demo:!production});
    if(p==='/api/health'&&req.method==='GET')return json(res,200,{status:'ok'});
    if(!['GET','HEAD'].includes(req.method)&&req.headers.origin!==origin)return json(res,403,{error:'Origem não autorizada.'});
    if(p==='/api/login'&&req.method==='POST') {
      const b=await body(req),loginEmail=text(b.email,254).toLowerCase();
      if(!limit(db,'login-ip:'+req.socket.remoteAddress,30)||!limit(db,'login-account:'+loginEmail,10)){res.setHeader('Retry-After','900');return json(res,429,{error:'Muitas tentativas. Aguarde 15 minutos.'});}
      const found=db.prepare('SELECT * FROM users WHERE email=? AND is_demo=0').get(loginEmail);const hash=await derivePassword(text(b.password,256),found?.salt||'invalid-salt',64);
      if(!found||!timingSafeEqual(hash,Buffer.from(found.hash,'hex'))){audit(null,'login_failed');return json(res,401,{error:'E-mail ou senha incorretos.'});}
      const csrf=createSession(res,found.id);audit(found.id,'login_success');return json(res,200,{csrf});
    }
    if(p==='/api/demo'&&req.method==='POST'&&!production){
      if(!limit(db,'demo:'+req.socket.remoteAddress,30))return json(res,429,{error:'Muitas demonstrações. Tente novamente mais tarde.'});
      const salt=randomBytes(16).toString('hex'),hash=randomBytes(64).toString('hex');
      const r=db.prepare('INSERT INTO users(email,name,salt,hash,is_demo) VALUES(?,?,?,?,1)').run(`demo-${randomBytes(16).toString('hex')}@escala7.local`,'Marina Costa',salt,hash);
      const uid=Number(r.lastInsertRowid);seed(uid);const csrf=createSession(res,uid);return json(res,200,{csrf});
    }
    const s=session(req);if(!s)return json(res,401,{error:'Entre na sua conta para continuar.'});
    if(!['GET','HEAD'].includes(req.method)&&req.headers['x-csrf-token']!==s.csrf)return json(res,403,{error:'Sessão inválida. Atualize a página.'});
    if(p==='/api/logout'&&req.method==='POST'){db.prepare('DELETE FROM auth_sessions WHERE token_hash=?').run(s.token_hash);res.setHeader('Set-Cookie','escala_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json(res,200,{ok:true});}
    if(p==='/api/bootstrap'&&req.method==='GET')return json(res,200,{user:{name:s.name,email:s.email},csrf:s.csrf,demo:!!s.is_demo,leads:db.prepare('SELECT * FROM leads WHERE user_id=? ORDER BY next_date,id').all(s.user_id).map(vault.decode),activities:db.prepare('SELECT activities.*,leads.name,leads.company FROM activities JOIN leads ON leads.id=activities.lead_id WHERE activities.user_id=? ORDER BY activities.id DESC LIMIT 30').all(s.user_id).map(row=>({...row,name:vault.decode({user_id:row.user_id,name:row.name}).name,company:vault.decode({user_id:row.user_id,company:row.company}).company})),cadences,templates,learning:learningContent(db,s.user_id)});
    if(p==='/api/account/password'&&req.method==='POST'){
      if(s.is_demo)return json(res,403,{error:'A demonstração não possui senha pessoal.'});
      if(!limit(db,'password:'+s.user_id,5))return json(res,429,{error:'Muitas tentativas. Aguarde 15 minutos.'});
      const b=await body(req),next=text(b.new_password,256,true),current=text(b.current_password,256,true);
      if(next.length<14||next===current)return json(res,400,{error:'Escolha uma nova senha com pelo menos 14 caracteres.'});
      const account=db.prepare('SELECT * FROM users WHERE id=?').get(s.user_id),hash=await derivePassword(current,account.salt,64);
      if(!timingSafeEqual(hash,Buffer.from(account.hash,'hex')))return json(res,403,{error:'Senha atual incorreta.'});
      const salt=randomBytes(16).toString('hex'),nextHash=await derivePassword(next,salt,64);
      db.prepare('UPDATE users SET salt=?,hash=? WHERE id=?').run(salt,nextHash.toString('hex'),s.user_id);
      db.prepare('DELETE FROM auth_sessions WHERE user_id=?').run(s.user_id);audit(s.user_id,'password_changed');
      const csrf=createSession(res,s.user_id);return json(res,200,{csrf});
    }
    const lessonMatch=p.match(/^\/api\/learning\/([a-z-]+)\/answer$/);
    if(lessonMatch&&req.method==='POST'){
      const lesson=lessons.find(l=>l.id===lessonMatch[1]);
      if(!lesson)return json(res,404,{error:'Módulo não encontrado.'});
      const b=await body(req);
      if(!b||!Number.isInteger(b.answer)||b.answer<0||b.answer>=lesson.quiz.options.length)return json(res,400,{error:'Escolha uma das alternativas.'});
      const correct=b.answer===lesson.quiz.answer;
      if(correct)db.prepare('INSERT INTO learning_progress(user_id,lesson_id,completed_at) VALUES(?,?,?) ON CONFLICT(user_id,lesson_id) DO NOTHING').run(s.user_id,lesson.id,new Date().toISOString());
      return json(res,200,{correct,explanation:lesson.quiz.explanation});
    }
    if(p==='/api/leads'&&req.method==='POST'){
      const b=await body(req);const name=text(b.name,100,true),company=text(b.company,100,true),leadEmail=text(b.email||'',254),segment=text(b.segment,100,true);if(leadEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail))return json(res,400,{error:'Informe um e-mail válido.'});if(!['E-mail','LinkedIn','WhatsApp','Telefone'].includes(b.channel)||!['A','B'].includes(b.cadence))return json(res,400,{error:'Canal ou cadência inválidos.'});const date=text(b.next_date,10,true);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)return json(res,400,{error:'Data inválida.'});const r=db.prepare('INSERT INTO leads(user_id,name,company,email,segment,stage,channel,cadence,next_date,notes,permission,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(s.user_id,vault.encode(s.user_id,'name',name),vault.encode(s.user_id,'company',company),vault.encode(s.user_id,'email',leadEmail),vault.encode(s.user_id,'segment',segment),'Novo lead',b.channel,b.cadence,date,vault.encode(s.user_id,'notes',text(b.notes||'',3000)),'pending',new Date().toISOString());activity(s.user_id,Number(r.lastInsertRowid),'created','Lead adicionado à carteira');return json(res,201,{id:Number(r.lastInsertRowid)});
    }
    const match=p.match(/^\/api\/leads\/(\d+)$/);
    if(match&&req.method==='PATCH'){
      const lead=db.prepare('SELECT * FROM leads WHERE id=? AND user_id=?').get(Number(match[1]),s.user_id);if(!lead)return json(res,404,{error:'Lead não encontrado.'});const b=await body(req);const action=b.action;
      if(action==='complete'){
        if(['blocked','paused'].includes(lead.permission)||lead.stage==='Pausado')return json(res,409,{error:'O contato está pausado ou bloqueado.'});
        if(lead.stage==='Cadência concluída')return json(res,409,{error:'Esta cadência já foi concluída.'});
        if(lead.permission!=='allowed')return json(res,409,{error:'Registre a permissão antes de concluir um contato.'});
        const c=cadences.find(c=>c.id===lead.cadence),step=lead.step+1;const finished=step>=c.steps.length;const nextDate=finished?lead.next_date:dateOffset(c.steps[step].day-c.steps[step-1].day);
        db.prepare('UPDATE leads SET step=?,next_date=?,channel=?,stage=? WHERE id=? AND user_id=?').run(Math.min(step,c.steps.length),nextDate,finished?lead.channel:c.steps[step].channel,finished?'Cadência concluída':lead.stage,lead.id,s.user_id);activity(s.user_id,lead.id,'contact',`Contato por ${lead.channel} registrado${finished?' · cadência concluída':''}`);
      }else if(action==='permission'){
        if(!['allowed','paused','blocked'].includes(b.permission))return json(res,400,{error:'Preferência inválida.'});
        db.prepare('UPDATE leads SET permission=?,stage=? WHERE id=? AND user_id=?').run(b.permission,b.permission==='allowed'?'Em conversa':'Pausado',lead.id,s.user_id);activity(s.user_id,lead.id,'preference',b.permission==='allowed'?'Permissão de contato registrada':b.permission==='blocked'?'Pedido de não contato registrado':'Contatos pausados');
      }else if(action==='note'){
        const note=text(b.notes,3000,true);db.prepare('UPDATE leads SET notes=? WHERE id=? AND user_id=?').run(vault.encode(s.user_id,'notes',note),lead.id,s.user_id);activity(s.user_id,lead.id,'note','Contexto da conversa atualizado');
      }else return json(res,400,{error:'Ação inválida.'});
      return json(res,200,{ok:true});
    }
    return json(res,404,{error:'Recurso não encontrado.'});
  }catch(e){if(!e.status)console.error('Falha interna ao processar requisição');return json(res,e.status||500,{error:e.status?e.message:'Não foi possível concluir a operação.'});}
});
server.requestTimeout=15000;server.headersTimeout=10000;server.keepAliveTimeout=5000;
server.listen(port,host,()=>console.log(`Escala 7 disponível em ${origin} (${production?'produção':'demonstração local — dados fictícios'})`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));

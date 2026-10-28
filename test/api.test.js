import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { digest, limit, encryption } from '../security.js';
const data=mkdtempSync(path.join(tmpdir(),'escala7-test-'));
const origin='http://127.0.0.1:3197';let proc,cookie,csrf;
async function request(route,method='GET',body,extra={}){const r=await fetch(origin+'/api'+route,{method,headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...extra},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,headers:r.headers,data:await r.json()};}
before(async()=>{
 proc=spawn(process.execPath,['server.js'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'3197',DATA_DIR:data,ADMIN_PASSWORD:'Test-only-password-123',NODE_ENV:'test',DATA_KEY_FILE:path.join(data,'test.key')},stdio:'pipe'});
 let ready=false;for(let n=0;n<50;n++){try{await request('/health');ready=true;break;}catch{await new Promise(r=>setTimeout(r,100));}}assert.ok(ready,'servidor iniciou');
});
after(async()=>{if(proc){proc.kill();await new Promise(r=>proc.once('exit',r));}rmSync(data,{recursive:true,force:true});});
test('autenticação, CSRF, persistência e limites de relacionamento',async()=>{
 assert.equal((await request('/bootstrap')).status,401);
 const invalid=await request('/login','POST',{email:'demo@escala7.local',password:'incorreta'});assert.equal(invalid.status,401);
 const login=await request('/login','POST',{email:'demo@escala7.local',password:'Test-only-password-123'});assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];csrf=login.data.csrf;assert.match(login.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
 const boot=await request('/bootstrap');assert.equal(boot.data.leads.length,8);assert.equal(boot.data.cadences.length,2);
 const lead={name:'Pessoa de teste',company:'Empresa de teste',email:'pessoa@example.com',segment:'Alimentos',channel:'E-mail',cadence:'A',next_date:'2026-10-28',notes:'Contexto autorizado'};
 assert.equal((await request('/leads','POST',lead,{'X-CSRF-Token':'inválido'})).status,403);
 assert.equal((await request('/leads','POST',lead,{Origin:'https://evil.example'})).status,403);
 assert.equal((await request('/leads','POST',{...lead,name:''})).status,400);
 const created=await request('/leads','POST',lead);assert.equal(created.status,201);const id=created.data.id;
 assert.equal((await request('/leads/'+id,'PATCH',{action:'complete'})).status,409,'não conclui sem permissão');
 assert.equal((await request('/leads/'+id,'PATCH',{action:'permission',permission:'allowed'})).status,200);
 assert.equal((await request('/leads/'+id,'PATCH',{action:'complete'})).status,200);
 let updated=(await request('/bootstrap')).data;assert.equal(updated.leads.find(l=>l.id===id).step,1);assert.ok(updated.activities.some(a=>a.lead_id===id&&a.kind==='contact'));
 await request('/leads/'+id,'PATCH',{action:'permission',permission:'paused'});assert.equal((await request('/leads/'+id,'PATCH',{action:'complete'})).status,409);
 await request('/leads/'+id,'PATCH',{action:'permission',permission:'blocked'});assert.equal((await request('/leads/'+id,'PATCH',{action:'complete'})).status,409);
 assert.equal((await request('/leads/999999','PATCH',{action:'note',notes:'x'})).status,404);
 await request('/logout','POST',{});assert.equal((await request('/bootstrap')).status,401);
});
test('proteções HTTP e ausência de acesso aos arquivos privados',async()=>{
 const res=await fetch(origin);assert.match(res.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.equal(res.headers.get('x-content-type-options'),'nosniff');assert.equal((await fetch(origin+'/.data/escala7.sqlite')).status,404);
});
test('aprendizagem: correção no servidor, progresso persistente e conclusão sem duplicação',async()=>{
 const {lessons}=await import('../learning.js');
 cookie=undefined;csrf=undefined;
 assert.equal((await request('/learning/proposito/answer','POST',{answer:1})).status,401);
 const login=await request('/login','POST',{email:'demo@escala7.local',password:'Test-only-password-123'});cookie=login.headers.get('set-cookie').split(';')[0];csrf=login.data.csrf;
 const initial=(await request('/bootstrap')).data.learning;
 assert.equal(initial.length,8);assert.ok(initial.every(l=>l.completed_at===null));
 assert.ok(initial.every(l=>!('answer' in l.quiz)&&!('explanation' in l.quiz)),'gabarito não é enviado no carregamento');
 const route='/learning/proposito/answer';
 assert.equal((await request(route,'POST',{answer:1},{'X-CSRF-Token':'invalid'})).status,403);
 assert.equal((await request(route,'POST',{answer:1},{Origin:'https://evil.example'})).status,403);
 for(const invalid of [-1,3,'1',null,1.5])assert.equal((await request(route,'POST',{answer:invalid})).status,400);
 assert.equal((await request('/learning/inexistente/answer','POST',{answer:1})).status,404);
 const wrong=await request(route,'POST',{answer:0});assert.equal(wrong.data.correct,false);assert.ok(wrong.data.explanation);
 assert.equal((await request('/bootstrap')).data.learning[0].completed_at,null);
 const correct=await request(route,'POST',{answer:1});assert.equal(correct.data.correct,true);
 const completedAt=(await request('/bootstrap')).data.learning[0].completed_at;assert.ok(completedAt);
 await request(route,'POST',{answer:1});await request(route,'POST',{answer:0});
 assert.equal((await request('/bootstrap')).data.learning[0].completed_at,completedAt,'revisão preserva conclusão e data');
 for(const lesson of lessons)assert.equal((await request('/learning/'+lesson.id+'/answer','POST',{answer:lesson.quiz.answer})).data.correct,true);
 assert.equal((await request('/bootstrap')).data.learning.filter(l=>l.completed_at).length,8);
 await request('/logout','POST',{});
 const relogin=await request('/login','POST',{email:'demo@escala7.local',password:'Test-only-password-123'});cookie=relogin.headers.get('set-cookie').split(';')[0];csrf=relogin.data.csrf;
 assert.equal((await request('/bootstrap')).data.learning.filter(l=>l.completed_at).length,8,'conclusões permanecem em nova sessão');
});
test('demonstrações separam leads, histórico e aprendizagem por visitante',async()=>{
 const demoA=await request('/demo','POST',{}),cookieA=demoA.headers.get('set-cookie').split(';')[0];
 const a=await request('/bootstrap','GET',undefined,{Cookie:cookieA});const leadA=a.data.leads[0];
 const demoB=await request('/demo','POST',{}),cookieB=demoB.headers.get('set-cookie').split(';')[0];
 const b=await request('/bootstrap','GET',undefined,{Cookie:cookieB});
 assert.notEqual(a.data.user.email,b.data.user.email);assert.equal(a.data.leads.length,8);assert.equal(b.data.leads.length,8);
 assert.ok(b.data.leads.every(l=>l.id!==leadA.id));
 assert.equal((await request('/leads/'+leadA.id,'PATCH',{action:'note',notes:'Não deve salvar'},{Cookie:cookieB,'X-CSRF-Token':b.data.csrf})).status,404);
 await request('/learning/proposito/answer','POST',{answer:1},{Cookie:cookieA,'X-CSRF-Token':a.data.csrf});
 assert.equal((await request('/bootstrap','GET',undefined,{Cookie:cookieB})).data.learning[0].completed_at,null);
 assert.equal((await request('/account/password','POST',{current_password:'qualquer',new_password:'Nova-senha-demo-123456'},{Cookie:cookieB,'X-CSRF-Token':b.data.csrf})).status,403);
});
test('campos de CRM criptografados e cookies ausentes do armazenamento de sessões',async()=>{
 const db=new DatabaseSync(path.join(data,'escala7.sqlite'));
 try{
  const row=db.prepare('SELECT * FROM leads LIMIT 1').get();for(const f of ['name','company','email','segment','notes'])assert.match(row[f],/^e7:v1:/);
  const token=cookie.split('=')[1],stored=db.prepare('SELECT * FROM auth_sessions WHERE token_hash=?').get(digest(token));
  assert.ok(stored);assert.notEqual(stored.token_hash,token);
  assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE name='sessions'").get(),undefined);
  db.prepare('UPDATE auth_sessions SET last_seen=? WHERE token_hash=?').run(Date.now()-31*60000,digest(token));
  assert.equal((await request('/bootstrap')).status,401,'sessão inativa expira');
 }finally{db.close();}
});
test('troca de senha exige senha atual e revoga outras sessões',async()=>{
 const login=await request('/login','POST',{email:'demo@escala7.local',password:'Test-only-password-123'});cookie=login.headers.get('set-cookie').split(';')[0];csrf=login.data.csrf;
 const other=await request('/login','POST',{email:'demo@escala7.local',password:'Test-only-password-123'}),oldCookie=other.headers.get('set-cookie').split(';')[0];
 const route='/account/password';
 assert.equal((await request(route,'POST',{current_password:'errada',new_password:'Nova-senha-segura-123456'})).status,403);
 assert.equal((await request(route,'POST',{current_password:'Test-only-password-123',new_password:'curta'})).status,400);
 const changed=await request(route,'POST',{current_password:'Test-only-password-123',new_password:'Nova-senha-segura-123456'});assert.equal(changed.status,200);
 assert.equal((await request('/bootstrap','GET',undefined,{Cookie:oldCookie})).status,401);
 assert.equal((await request('/bootstrap')).status,401,'cookie anterior também foi revogado');
 cookie=changed.headers.get('set-cookie').split(';')[0];csrf=changed.data.csrf;
 assert.equal((await request('/bootstrap')).status,200);
 assert.equal((await request('/login','POST',{email:'demo@escala7.local',password:'Test-only-password-123'})).status,401);
 assert.equal((await request('/login','POST',{email:'demo@escala7.local',password:'Nova-senha-segura-123456'})).status,200);
});
test('validação JSON e data inválida retornam erros controlados',async()=>{
 assert.equal((await request('/leads','POST',[],{})).status,400);
 assert.equal((await request('/leads','POST',{}, {'Content-Type':'text/plain'})).status,415);
 const invalid={name:'Teste',company:'Teste',segment:'Teste',channel:'E-mail',cadence:'A',next_date:'2026-02-31'};
 assert.equal((await request('/leads','POST',invalid)).status,400);
 assert.equal((await fetch(origin+'/.keys/data.key')).status,404);
});
test('limite de autenticação sobrevive à reabertura do banco',()=>{
 let db=new DatabaseSync(path.join(data,'escala7.sqlite'));const key='test-durable-limit';
 assert.equal(limit(db,key,1),true);db.close();
 db=new DatabaseSync(path.join(data,'escala7.sqlite'));try{assert.equal(limit(db,key,1),false);assert.equal(db.prepare('SELECT key FROM security_limits WHERE key=?').get(key),undefined);}finally{db.close();}
});
test('criptografia detecta alteração de dados e chave incorreta sem sobrescrever o banco',()=>{
 const key=path.join(data,'vault-test.key'),vaultDb=new DatabaseSync(':memory:');
 vaultDb.exec('CREATE TABLE leads(id INTEGER PRIMARY KEY,user_id INTEGER,name TEXT,company TEXT,email TEXT,segment TEXT,notes TEXT)');
 vaultDb.prepare('INSERT INTO leads VALUES(1,7,?,?,?,?,?)').run('Nome privado','Empresa privada','email@example.com','Segmento','Contexto privado');
 const old=process.env.DATA_KEY_FILE;process.env.DATA_KEY_FILE=key;
 try{
  const vault=encryption(data,vaultDb,false),row=vaultDb.prepare('SELECT * FROM leads').get();assert.equal(vault.decode(row).notes,'Contexto privado');
  assert.throws(()=>vault.decode({...row,user_id:8}),'dados não podem ser movidos para outra conta');
 }finally{process.env.DATA_KEY_FILE=old||key;}
 // Uma cópia de chave diferente nunca deve converter dados silenciosamente.
 const original=vaultDb.prepare('SELECT name FROM leads').get().name;
 process.env.DATA_KEY_FILE=path.join(data,'wrong.key');writeFileSync(process.env.DATA_KEY_FILE,Buffer.alloc(32,42));
 try{assert.throws(()=>encryption(data,vaultDb,false));assert.equal(vaultDb.prepare('SELECT name FROM leads').get().name,original);}finally{if(old===undefined)delete process.env.DATA_KEY_FILE;else process.env.DATA_KEY_FILE=old;vaultDb.close();}
});

import {mkdirSync,readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'preview');mkdirSync(output,{recursive:true});
let app=readFileSync(path.join(root,'public/app.js'),'utf8');
const start=app.indexOf('async function api('),end=app.indexOf('function toast(',start);
if(start<0||end<0)throw Error('Não foi possível encontrar o adaptador da API.');
app="import {demoApi} from './preview-api.js';\n"+app.slice(0,start)+'async function api(p,opts={}){return demoApi(p,opts);}\n'+app.slice(end);
app=app.replace("const h=await fetch('/api/mode');if(h.ok){const m=await h.json();$('#demo-area').hidden=!m.demo;}","const m=await demoApi('/mode');$('#demo-area').hidden=!m.demo;");
app=app.replace('Módulo concluído e salvo na sua conta.','Módulo concluído nesta aba. Recarregar a página apaga o progresso.');
app=app.replace('Resposta correta! Módulo concluído. ','Resposta correta! Progresso temporário nesta aba. ');
app=app.replace('Demonstração isolada para esta sessão.','Prévia estática · dados temporários nesta aba.');
app=app.replace('Os dados desta demonstração são separados dos demais visitantes. Não use informações reais. Ao sair e entrar em outra demonstração, você começa um novo espaço.','Esta prévia não possui login ou API. Os dados existem apenas na memória desta aba e são apagados ao recarregar. Não use dados reais.');
const integrationStart=app.indexOf('function integrationsPage(){'),integrationEnd=app.indexOf('function accountSecurity()',integrationStart);
if(integrationStart<0||integrationEnd<0)throw Error('Seção de integrações não encontrada.');
app=app.slice(0,integrationStart)+`function integrationsPage(){return heading('PRÉVIA ESTÁTICA','Integrações','Conheça o que será conectado na aplicação completa.',false)+'<div class="notice">Esta página não possui API, autenticação ou banco de dados. Não insira credenciais ou informações reais.</div><div class="cards-grid">'+['WhatsApp Business','E-mail','LinkedIn','API da plataforma'].map(name=>'<article class="panel integration-card"><h2>'+name+'</h2><span class="pill">Indisponível na prévia</span><p>A aplicação completa possui servidor próprio. Conexões externas exigem implementação e configuração segura na hospedagem.</p></article>').join('')+'</div>'; }\n`+app.slice(integrationEnd);
writeFileSync(path.join(output,'app.js'),app);
let html=readFileSync(path.join(root,'public/index.html'),'utf8')
 .replace('href="/style.css"','href="./style.css"').replace('src="/app.js" defer','src="./app.js" type="module"').replaceAll('href="/"','href="./"')
 .replace('<form id="auth-form">','<form id="auth-form" hidden>')
 .replace('Entre no seu espaço de relacionamento comercial.','Prévia interativa com dados fictícios. Explore sem criar conta.')
 .replace('◇ Sessão protegida · Seus relacionamentos em boas mãos','Prévia estática: sem login, banco de dados ou envio de mensagens.')
 .replace('<div class="page" id="page">','<div class="notice preview-notice">PRÉVIA PARA AVALIAÇÃO · Use apenas dados fictícios. Dados e progresso são temporários e desaparecem ao recarregar a página.</div><div class="page" id="page">');
const csp="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'";
html=html.replace('<meta charset="UTF-8">',`<meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="no-referrer">`);
writeFileSync(path.join(output,'index.html'),html);
copyFileSync(path.join(root,'public/style.css'),path.join(output,'style.css'));
for(const [source,target] of [['content.js','content.js'],['learning.js','lessons.js'],['scripts/preview-api.js','preview-api.js']]){
 let text=readFileSync(path.join(root,source),'utf8');
 if(source==='learning.js')text=text.slice(0,text.indexOf('export function learningContent'));
 writeFileSync(path.join(output,target),text);
}
writeFileSync(path.join(output,'.nojekyll'),'');
console.log('Prévia estática gerada em preview. Somente conteúdo público e dados fictícios; sem banco, chaves ou arquivos de configuração.');

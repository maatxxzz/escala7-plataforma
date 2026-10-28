// Somente prévia estática. Sem autenticação, backend, envios ou armazenamento persistente.
import {cadences,templates,demoRows} from './content.js';
import {lessons} from './lessons.js';
let memory=null;
const dateOffset=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10);};
function fresh(){return {user:{name:'Marina Costa',email:'visitante@example.invalid'},csrf:'static-preview',demo:true,cadences,templates,activities:[],learning:lessons.map(({quiz,...l})=>({...l,quiz:{question:quiz.question,options:quiz.options},completed_at:null})),leads:demoRows.map(([name,company,segment,stage,channel,cadence,step,offset,notes,permission],i)=>({id:i+1,name,company,segment,stage,channel,cadence,step,notes,permission,next_date:dateOffset(offset),email:''}))};}
export async function demoApi(route,opts={}){
 const b=opts.body?JSON.parse(opts.body):{};
 if(route==='/mode')return {demo:true};
 if(route==='/demo'){memory=fresh();return {csrf:memory.csrf};}
 if(route==='/login')throw Error('Esta prévia não aceita contas ou senhas reais. Use Explorar demonstração.');
 if(!memory)throw Error('Abra a demonstração para começar.');
 if(route==='/bootstrap')return structuredClone(memory);
 if(route==='/logout'){memory=null;return {ok:true};}
 if(route==='/leads'){
  const id=Math.max(0,...memory.leads.map(l=>l.id))+1;
  memory.leads.push({...b,id,step:0,stage:'Novo lead',permission:'pending'});return {id};
 }
 const match=route.match(/^\/leads\/(\d+)$/);
 if(match){const l=memory.leads.find(l=>l.id===Number(match[1]));if(!l)throw Error('Lead não encontrado.');
  if((opts.method||'GET')==='GET')return structuredClone({lead:l,history:memory.activities.filter(a=>a.lead_id===l.id)});
  if(b.action==='observation'){if(!b.notes?.trim())throw Error('Escreva uma observação.');}
  else if(b.action==='note')l.notes=b.notes;
  else if(b.action==='permission'){l.permission=b.permission;l.stage=b.permission==='allowed'?'Em conversa':'Pausado';}
  else if(b.action==='complete'){
   if(l.permission!=='allowed'||l.stage==='Pausado')throw Error('Respeite a preferência de contato antes de registrar.');
   const c=cadences.find(c=>c.id===l.cadence);if(l.step>=c.steps.length)throw Error('Cadência já concluída.');l.step++;
   if(l.step>=c.steps.length)l.stage='Cadência concluída';else{l.channel=c.steps[l.step].channel;l.next_date=dateOffset(c.steps[l.step].day-c.steps[l.step-1].day);}
  }else throw Error('Ação inválida.');
  memory.activities.unshift({id:memory.activities.length+1,lead_id:l.id,name:l.name,company:l.company,kind:b.action==='complete'?'contact':b.action,detail:b.action==='observation'?b.notes:b.action==='complete'?'Contato fictício registrado':b.action==='note'?'Contexto fictício atualizado':'Preferência fictícia atualizada',created_at:new Date().toISOString()});return {ok:true};
 }
 const learning=route.match(/^\/learning\/([a-z-]+)\/answer$/);
 if(learning){const lesson=lessons.find(l=>l.id===learning[1]);if(!lesson)throw Error('Módulo não encontrado.');const correct=b.answer===lesson.quiz.answer;if(correct)memory.learning.find(l=>l.id===lesson.id).completed_at ||= new Date().toISOString();return {correct,explanation:lesson.quiz.explanation};}
 throw Error('Recurso indisponível na prévia estática.');
}

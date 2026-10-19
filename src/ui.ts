// Review sessions are bound to one immutable selection and pack.
import {buildCitationRequest,buildReviewRequest,combineResults,estimatedCost,weakCriteria} from './core.ts';
import {callJev} from './client.ts';import type {ReviewPack,TextCandidate} from './types.ts';
import generic from '../packs/generic.json';import checkout from '../packs/checkout.json';
const packs:Record<string,ReviewPack>={generic:generic as ReviewPack,checkout:checkout as ReviewPack};
let nodes:TextCandidate[]=[],generation=0,pending:AbortController|null=null;
const $=<T extends HTMLElement>(s:string)=>document.querySelector(s) as T;
const status=$<HTMLElement>('#status'),results=$<HTMLElement>('#results'),run=$<HTMLButtonElement>('#run');
const escapeHtml=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function invalidate(){const active=pending!==null;generation++;pending?.abort();pending=null;results.replaceChildren();if(active)status.textContent='Sélection ou pack modifié : analyse annulée. / Selection or pack changed: review cancelled. / Selección o paquete cambiado: revisión cancelada.';run.disabled=!nodes.length;}
window.onmessage=e=>{if(e.data.pluginMessage?.type==='selection'){nodes=structuredClone(e.data.pluginMessage.nodes);invalidate();$('#selection').textContent=`${nodes.length} calques texte sélectionnés / text layers selected / capas de texto seleccionadas`;}};
$('#pack').onchange=invalidate;
run.onclick=async()=>{
 if(pending)return;
 const controller=new AbortController(),runId=++generation,selected=structuredClone(nodes);pending=controller;
 const current=()=>runId===generation&&!controller.signal.aborted;
 run.disabled=true;results.replaceChildren();
 try{
  const pack=packs[$<HTMLSelectElement>('#pack').value],apiKey=$<HTMLInputElement>('#key').value,endpoint=$<HTMLInputElement>('#endpoint').value||undefined;
  status.textContent='Évaluation des critères… / Scoring criteria… / Evaluando criterios…';
  const request=buildReviewRequest(selected,pack),options={apiKey,endpoint,signal:controller.signal};
  const first=await callJev(request,options);if(!current())return;
  const weak=weakCriteria(first,pack);
  status.textContent=weak.length?'Sélection des citations exactes… / Selecting exact citations… / Seleccionando citas exactas…':'Aucun critère faible. / No weak criterion. / Ningún criterio débil.';
  const second=weak.length?await callJev(buildCitationRequest(selected,weak),options):null;if(!current())return;
  const rows=combineResults(first,second,pack,selected);
  for(const row of rows){const card=document.createElement('button');card.className='result';card.innerHTML=`<span>${escapeHtml(row.criterion.label)}</span><strong>${Math.round(row.value*100)}</strong>${row.citation?`<small>${escapeHtml(row.citation.text.slice(0,100))}</small>`:'<small>Au-dessus du seuil faible / Above weak threshold / Por encima del umbral débil</small>'}`;if(row.citation)card.onclick=()=>parent.postMessage({pluginMessage:{type:'focus-node',nodeId:row.citation!.id}},'*');results.append(card);}
  const tokens=first.usage.input_tokens+(second?.usage.input_tokens??0);status.textContent=`${rows.length} critères / criteria / criterios · ${weak.length} citations / citas · $${estimatedCost(tokens).toFixed(8)} estimation / estimated / estimado`;
 }catch(error){if(current())status.textContent=error instanceof Error?error.message:String(error);}
 finally{if(runId===generation){pending=null;run.disabled=!nodes.length;}}
};

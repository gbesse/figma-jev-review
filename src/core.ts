// Purpose: Build auditable requests, validate typed answers, identify weak criteria, and map citations to exact Figma nodes.
import type { Criterion, JevAnswer, JevResponse, ReviewPack, ReviewResult, TextCandidate } from './types.ts';
export const MODEL='jev-1.13.0';
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
export function validatePack(pack:ReviewPack):ReviewPack{if(!pack?.id||!pack?.title||!Array.isArray(pack.criteria)||!pack.criteria.length)throw new TypeError('pack requires id, title and criteria');const ids=new Set<string>();for(const c of pack.criteria){if(!c.id||ids.has(c.id)||!c.label||!['noul','score'].includes(c.type)||!c.instructions)throw new TypeError('criterion requires a unique id, label, type and instructions');ids.add(c.id);if(!finite(c.weakBelow)||c.weakBelow<0||c.weakBelow>1)throw new TypeError(`${c.id}: weakBelow must be in [0,1]`);if(c.type==='score'&&(!Array.isArray(c.criteria)||c.criteria.length<2||c.criteria.length>10))throw new TypeError(`${c.id}: score requires 2 to 10 levels`)}return pack}
export function cleanCandidates(nodes:TextCandidate[]):TextCandidate[]{
 const error='Sélection de nœuds invalide ou trop grande / Invalid or oversized node selection / Selección de nodos no válida o excesiva';
 if(!Array.isArray(nodes)||nodes.length>10000)throw new TypeError(error);
 const selected:TextCandidate[]=[],seen=new Map<string,TextCandidate>();
 for(const node of nodes){
  if(!node||typeof node.id!=='string'||!node.id||typeof node.name!=='string'||typeof node.text!=='string')throw new TypeError(error);
  if(!node.text.trim())continue;
  const previous=seen.get(node.id);
  if(previous){if(previous.text!==node.text||previous.name!==node.name)throw new TypeError(error);continue;}
  const snapshot={...node};seen.set(node.id,snapshot);selected.push(snapshot);
 }
 if(selected.length>255)throw new TypeError(error);
 return selected;
}
export function buildReviewRequest(nodes:TextCandidate[],pack:ReviewPack){validatePack(pack);const selected=cleanCandidates(nodes);if(!selected.length)throw new Error('Select at least one non-empty text layer');return{model:MODEL,state:{selectedTextNodes:selected},questions:Object.fromEntries(pack.criteria.map(c=>[c.id,{type:c.type,instructions:c.instructions,...(c.criteria?{criteria:c.criteria}:{})}]))}}
export function normalized(answer:JevAnswer,criterion:Criterion):number{if(answer.type==='noul')return answer.noul;if(answer.type==='score')return answer.score/Math.max(1,(criterion.criteria?.length??1)-1);throw new TypeError('review answer must be noul or score')}
export function validateResponse(response:JevResponse,questions:Record<string,{type:string;criteria?:unknown}>):JevResponse{if(response?.model!==MODEL||!response.answers||!Number.isSafeInteger(response.usage?.input_tokens)||response.usage.input_tokens<0||!Number.isSafeInteger(response.usage?.output_tokens)||response.usage.output_tokens<0)throw new Error('Enveloppe Jev invalide / Invalid Jev response envelope / Respuesta Jev no válida');for(const[id,q]of Object.entries(questions)){const a=response.answers[id];if(!a||a.type!==q.type)throw new Error(`Missing or mismatched answer ${id}`);if(a.type==='noul'&&(!finite(a.noul)||a.noul<0||a.noul>1))throw new Error(`Invalid noul ${id}`);if(a.type==='score'&&(!finite(a.score)||a.score<0||a.score>(q.criteria as unknown[]).length-1))throw new Error(`Score invalide / Invalid score / Puntuación no válida: ${id}`);if(a.type==='choice'&&!(Object.hasOwn(q.criteria as Record<string,unknown>,a.choice)))throw new Error(`Invalid choice ${id}`)}return response}
export function weakCriteria(response:JevResponse,pack:ReviewPack):Criterion[]{return pack.criteria.filter(c=>normalized(response.answers[c.id],c)<c.weakBelow)}
export function buildCitationRequest(nodes:TextCandidate[],weak:Criterion[]){const selected=cleanCandidates(nodes),criteria=Object.fromEntries(selected.map(n=>[n.id,{name:n.name,text:n.text}]));return{model:MODEL,state:{selectedTextNodes:selected},questions:Object.fromEntries(weak.map(c=>[c.id,{type:'choice',instructions:`Which exact selected text node best illustrates this weakness: ${c.instructions}`,criteria}]))}}
export function combineResults(first:JevResponse,second:JevResponse|null,pack:ReviewPack,nodes:TextCandidate[]):ReviewResult[]{const byId=new Map(cleanCandidates(nodes).map(n=>[n.id,n]));return pack.criteria.map(criterion=>{const answer=first.answers[criterion.id],citationAnswer=second?.answers[criterion.id],citation=citationAnswer?.type==='choice'?byId.get(citationAnswer.choice):undefined;return{criterion,value:normalized(answer,criterion),answer,citation}})}
export function estimatedCost(inputTokens:number):number{return Math.round(inputTokens*.042/1e6*1e9)/1e9}

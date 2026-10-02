// Locate a synthetic weak checkout criterion in one exact selected TextNode.
import {readFile} from 'node:fs/promises';
import {buildReviewRequest, validateResponse, weakCriteria, buildCitationRequest, combineResults} from '../dist-test/core.js';

const pack = JSON.parse(await readFile(new URL('../packs/checkout.json', import.meta.url)));
const nodes = [
  {id: 'node_1', name: 'Total', text: 'Total today: $20'},
  {id: 'node_2', name: 'Renewal', text: 'Continue'},
];
const firstRequest = buildReviewRequest(nodes, pack);
const first = {model: 'jev-1.13.0', usage: {input_tokens: 20}, answers: {
  total: {type: 'noul', noul: 0.9}, renewal: {type: 'noul', noul: 0.2},
  cta: {type: 'score', score: 3}, recovery: {type: 'noul', noul: 0.9},
}};
validateResponse(first, firstRequest.questions);
const weak = weakCriteria(first, pack);
const secondRequest = buildCitationRequest(nodes, weak);
const second = {model: 'jev-1.13.0', usage: {input_tokens: 10}, answers: {renewal: {type: 'choice', choice: 'node_2'}}};
validateResponse(second, secondRequest.questions);
const citations = combineResults(first, second, pack, nodes).filter(result => result.citation).map(result => ({criterion: result.criterion.id, nodeId: result.citation.id, text: result.citation.text}));
if (citations.length !== 1 || citations[0].nodeId !== 'node_2') throw new Error('Synthetic citation mismatch');
console.log(JSON.stringify({source: 'synthetic answers; no Figma or Jev', citations}, null, 2));

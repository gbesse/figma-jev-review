// Purpose: Test pack validation, node fidelity, two-pass request shapes, strict responses, thresholds, and exact citations.
import test from'node:test';import assert from'node:assert/strict';import{buildCitationRequest,buildReviewRequest,combineResults,validateResponse,weakCriteria}from'../dist-test/core.js';
const pack={id:'x',title:'X',criteria:[{id:'clear',label:'Clear',type:'score',instructions:'Clear?',criteria:['No','Some','Yes'],weakBelow:.6},{id:'safe',label:'Safe',type:'noul',instructions:'Safe?',weakBelow:.5}]},nodes=[{id:'1:2',name:'Title',text:'  Start now  '},{id:'1:3',name:'Terms',text:'Renews monthly.'}];
test('review request preserves exact node identity and finite questions',()=>{const r=buildReviewRequest(nodes,pack);assert.equal(r.state.selectedTextNodes[0].id,'1:2');assert.equal(r.state.selectedTextNodes[0].text,'  Start now  ');assert.deepEqual(Object.keys(r.questions),['clear','safe'])});
test('strict response validation and weak thresholds',()=>{const r=buildReviewRequest(nodes,pack),response={model:'jev-1.13.0',answers:{clear:{type:'score',score:1,probabilities:{0:.1,1:.8,2:.1},legend:{0:'No',1:'Some',2:'Yes'},confidence:.8},safe:{type:'noul',noul:.8}},usage:{input_tokens:10,output_tokens:0}};assert.equal(validateResponse(response,r.questions),response);assert.deepEqual(weakCriteria(response,pack).map(x=>x.id),['clear']);assert.throws(()=>validateResponse({...response,model:'jev-latest'},r.questions),/envelope/)});
test('citation pass offers only exact nodes and maps choice back',()=>{const weak=[pack.criteria[0]],q=buildCitationRequest(nodes,weak);assert.deepEqual(Object.keys(q.questions.clear.criteria),['1:2','1:3']);const first={model:'jev-1.13.0',answers:{clear:{type:'score',score:0,probabilities:{0:1},legend:{0:'No'},confidence:1},safe:{type:'noul',noul:.8}},usage:{input_tokens:1,output_tokens:0}},second={model:'jev-1.13.0',answers:{clear:{type:'choice',choice:'1:3',probabilities:{'1:2':0,'1:3':1},confidence:1}},usage:{input_tokens:1,output_tokens:0}};assert.equal(combineResults(first,second,pack,nodes)[0].citation.text,'Renews monthly.')});

test('selection preserves raw copy deduplicates identical nodes and refuses conflicting IDs or silent truncation',()=>{
 const original={id:'one',name:'Name',text:'  exact copy  '};assert.equal(buildReviewRequest([original,{...original}],pack).state.selectedTextNodes.length,1);assert.equal(original.text,'  exact copy  ');
 assert.throws(()=>buildReviewRequest([original,{...original,text:'changed'}],pack),/Invalid/);
 const many=Array.from({length:256},(_,i)=>({...original,id:String(i)}));assert.throws(()=>buildReviewRequest(many,pack),/oversized/);
});
test('prototype names are not legitimate selected-node citations',()=>{
 const request=buildCitationRequest(nodes,[pack.criteria[0]]);
 const response={model:'jev-1.13.0',answers:{clear:{type:'choice',choice:'toString'}},usage:{input_tokens:1,output_tokens:0}};
 assert.throws(()=>validateResponse(response,request.questions),/Invalid choice/);
});


test('score is bounded by the last declared level rather than the number of levels',()=>{
 const request=buildReviewRequest(nodes,pack);const first={model:'jev-1.13.0',answers:{clear:{type:'score',score:2},safe:{type:'noul',noul:.8}},usage:{input_tokens:1,output_tokens:0}};
 assert.equal(validateResponse(first,request.questions),first);
 for(const score of [2.01,2.9,3,Infinity])assert.throws(()=>validateResponse({...first,answers:{...first.answers,clear:{type:'score',score}}},request.questions),/Invalid score/);
 for(const usage of [{input_tokens:-1,output_tokens:0},{input_tokens:1,output_tokens:-1},{input_tokens:1.5,output_tokens:0}])assert.throws(()=>validateResponse({...first,usage},request.questions),/envelope/);
});

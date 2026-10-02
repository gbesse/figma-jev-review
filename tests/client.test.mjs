// Purpose: Verify authentication, retry boundaries, timeout signals, redaction, and typed transport validation offline.
import test from'node:test';import assert from'node:assert/strict';import{callJev}from'../dist-test/client.js';
const request={model:'jev-1.13.0',state:{text:'Hello'},questions:{clear:{type:'noul'}}};
const payload={model:'jev-1.13.0',answers:{clear:{type:'noul',noul:.8}},usage:{input_tokens:3,output_tokens:0}};
const response=(body=payload,status=200)=>new Response(JSON.stringify(body),{status});
test('sends a typed request and validates its response',async()=>{let auth='';const result=await callJev(request,{apiKey:'test-secret',fetchImpl:async(_url,init)=>{auth=new Headers(init?.headers).get('authorization')??'';return response()}});assert.equal(result.answers.clear.type,'noul');assert.equal(auth,'Bearer test-secret')});
test('retries network TypeError but not typed response errors',async()=>{let calls=0;await callJev(request,{apiKey:'x',retries:2,fetchImpl:async()=>{calls++;if(calls<3)throw new TypeError('offline');return response()}});assert.equal(calls,3);await assert.rejects(()=>callJev(request,{apiKey:'x',retries:2,fetchImpl:async()=>response({...payload,model:'wrong'})}),/envelope/)});
test('redacts the key from HTTP errors',async()=>{await assert.rejects(()=>callJev(request,{apiKey:'do-not-leak',retries:0,fetchImpl:async()=>new Response('failure do-not-leak',{status:400})}),error=>error instanceof Error&&!error.message.includes('do-not-leak')&&error.message.includes('[redacted]'))});

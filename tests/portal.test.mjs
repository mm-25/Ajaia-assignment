import test from 'node:test';
import assert from 'node:assert/strict';
import {createPortal, navigation, navigate, switchRole, performAction} from '../portal.mjs';
import {createSubmission, transition} from '../workflow.mjs';
test('broker and assistant navigation are separate',()=>{
 assert.deepEqual(navigation('broker').map(x=>x.id),['submission','changes']);
 assert.deepEqual(navigation('assistant').map(x=>x.id),['submission','evidence']);
});
test('sidebar navigation cannot switch roles or open another role screen',()=>{
 const p=createPortal('broker');assert.deepEqual(navigate(p,'evidence'),p);
 assert.deepEqual(navigate(p,'changes'),{role:'broker',screen:'changes'});
});
test('submission and return keep the user in the broker portal',()=>{
 const p=createPortal('broker');const result=performAction(createSubmission(),p,'submit');
 assert.equal(result.submission.status,'review');assert.deepEqual(result.portal,p);
 let s=transition(createSubmission(),'submit');for(const id of ['limit','address'])s=transition(s,'confirm',{id});s=transition(s,'publish');s=transition(s,'correct',{id:'limit',method:'application'});
 const returned=performAction(s,{role:'broker',screen:'changes'},'return');assert.equal(returned.submission.status,'review');assert.equal(returned.portal.role,'broker');assert.equal(returned.portal.screen,'changes');
});
test('only explicit role switch changes portal identity',()=>{
 const s=transition(createSubmission(),'submit');
 assert.deepEqual(switchRole(createPortal('broker'),'assistant',s),{role:'assistant',screen:'evidence'});
 assert.deepEqual(switchRole(createPortal('assistant'),'broker',s),{role:'broker',screen:'submission'});
});
test('broker cannot confirm assistant findings or edit while under review',()=>{
 const s=transition(createSubmission(),'submit');const p=createPortal('broker');
 assert.deepEqual(performAction(s,p,'confirm',{id:'limit'}).submission,s);
 assert.deepEqual(performAction(s,p,'correct',{id:'limit',method:'application'}).submission,s);
});
test('assistant cannot alter broker values',()=>{
 let s=transition(createSubmission(),'submit');for(const id of ['limit','address'])s=transition(s,'confirm',{id});s=transition(s,'publish');
 assert.deepEqual(performAction(s,createPortal('assistant'),'correct',{id:'limit',method:'application'}).submission,s);
});

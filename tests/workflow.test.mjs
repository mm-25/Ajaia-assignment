import test from 'node:test';
import assert from 'node:assert/strict';
import { createSubmission, transition, canComplete, canPublish } from '../workflow.mjs';
test('possible flags cannot be published until a human reviews each one',()=>{
 let s=createSubmission(); s=transition(s,'submit'); assert.equal(canPublish(s),false);
 s=transition(s,'confirm',{id:'limit'}); assert.equal(canPublish(s),false);
 s=transition(s,'confirm',{id:'address'}); assert.equal(canPublish(s),true);
 s=transition(s,'publish'); assert.equal(s.status,'changes');
});
test('corrected documents stay pending until human verifies and checklist is done',()=>{
 let s=createSubmission(); s=transition(s,'submit');
 for(const id of ['limit','address'])s=transition(s,'confirm',{id});
 s=transition(s,'publish');s=transition(s,'correct',{id:'limit',method:'document'});s=transition(s,'correct',{id:'address',method:'application'});
 assert.equal(s.issues[0].status,'updated');assert.equal(canComplete(s),false);
 s=transition(s,'return');for(const id of ['limit','address'])s=transition(s,'verify',{id});
 assert.equal(canComplete(s),false);s=transition(s,'checklist');assert.equal(canComplete(s),true);
 s=transition(s,'complete');assert.equal(s.status,'complete');
});
test('requesting help preserves the discrepancy and stops completion',()=>{
 let s=createSubmission();s=transition(s,'submit');for(const id of ['limit','address'])s=transition(s,'confirm',{id});s=transition(s,'publish');s=transition(s,'help',{id:'limit',message:'Please clarify required limit.'});
 assert.equal(s.issues[0].status,'help');assert.equal(canComplete(s),false);assert.equal(s.issues[0].messages.length,1);
});
test('replacement after resolution reopens verification',()=>{
 let s=createSubmission();s=transition(s,'submit');for(const id of ['limit','address'])s=transition(s,'dismiss',{id});s=transition(s,'checklist');assert.equal(canComplete(s),true);
 s=transition(s,'replace',{id:'limit'});assert.equal(s.issues[0].status,'updated');assert.equal(canComplete(s),false);
});
test('broker correction before submission still needs human verification',()=>{
 let s=createSubmission();s=transition(s,'correct',{id:'limit',method:'document'});s=transition(s,'correct',{id:'address',method:'application'});s=transition(s,'submit');s=transition(s,'checklist');
 assert.equal(canComplete(s),false);for(const id of ['limit','address'])s=transition(s,'verify',{id});assert.equal(canComplete(s),true);
});
test('partial return can go back to broker for remaining corrections',()=>{
 let s=createSubmission();s=transition(s,'submit');for(const id of ['limit','address'])s=transition(s,'confirm',{id});s=transition(s,'publish');s=transition(s,'correct',{id:'limit',method:'document'});s=transition(s,'return');s=transition(s,'verify',{id:'limit'});s=transition(s,'resume');
 assert.equal(s.status,'changes');assert.equal(s.issues[1].status,'requested');
});
test('verified early correction does not block requesting the remaining issue',()=>{
 let s=createSubmission();s=transition(s,'correct',{id:'limit',method:'document'});s=transition(s,'submit');s=transition(s,'verify',{id:'limit'});s=transition(s,'confirm',{id:'address'});
 assert.equal(canPublish(s),true);s=transition(s,'publish');assert.equal(s.issues[0].status,'resolved');assert.equal(s.issues[1].status,'requested');
});
test('rejected partial correction is republished alongside an existing request',()=>{
 let s=createSubmission();s=transition(s,'submit');for(const id of ['limit','address'])s=transition(s,'confirm',{id});s=transition(s,'publish');s=transition(s,'correct',{id:'limit',method:'document'});s=transition(s,'return');s=transition(s,'reopen',{id:'limit'});s=transition(s,'confirm',{id:'limit'});
 assert.equal(canPublish(s),true);s=transition(s,'publish');assert.equal(s.issues[0].status,'requested');assert.equal(s.issues[1].status,'requested');assert.equal(s.issues[0].requestPublished,true);
});
test('early broker correction is not attributed to an assistant request',()=>{
 const s=transition(createSubmission(),'correct',{id:'limit',method:'application'});assert.equal(Boolean(s.issues[0].requestPublished),false);
});

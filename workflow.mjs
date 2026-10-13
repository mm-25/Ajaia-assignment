export function createSubmission(){return {
 status:'draft',checklist:false,activity:['Maya Patel created the submission.'],
 issues:[
 {id:'limit',title:'Coverage limit',field:'General liability · Each occurrence',application:'$2,000,000',document:'$1,000,000',original:'$1,000,000',source:'Certificate of insurance',page:'Page 1 · Coverage schedule',status:'possible',version:1,messages:[],instruction:'Please confirm the intended coverage limit and update the application or provide a corrected certificate.'},
 {id:'address',title:'Insured address',field:'Applicant details · Street address',application:'184 Maple Street',document:'148 Maple Street',original:'148 Maple Street',source:'Property schedule',page:'Page 2 · Insured premises',status:'possible',version:1,messages:[],instruction:'Please confirm the insured location and correct the application or property schedule.'}
 ]};}
export const canPublish=s=>s.status==='review'&&s.issues.every(i=>['confirmed','dismissed','resolved','requested','help'].includes(i.status))&&s.issues.some(i=>i.status==='confirmed');
export const canComplete=s=>s.status==='review'&&s.checklist&&s.issues.every(i=>['resolved','dismissed'].includes(i.status));
export function transition(input,action,p={}){
 const s=structuredClone(input),i=s.issues.find(i=>i.id===p.id);
 const log=m=>s.activity.unshift(m);
 switch(action){
 case 'submit': if(s.status==='draft'){s.status='review';log('Maya submitted the application. Anika can now review the evidence.');}break;
 case 'confirm':if(s.status==='review'&&i&&i.status==='possible'){i.status='confirmed';log(`Anika confirmed the ${i.title.toLowerCase()} discrepancy.`);}break;
 case 'dismiss':if(s.status==='review'&&i&&['possible','confirmed'].includes(i.status)){i.status='dismissed';i.reason=p.reason||'Source verified; no correction required.';log(`Anika dismissed the ${i.title.toLowerCase()} flag: ${i.reason}`);}break;
 case 'publish':if(canPublish(s)){s.status='changes';s.issues.forEach(i=>{if(i.status==='confirmed'){i.status='requested';i.requestPublished=true;i.instruction=p.instructions?.[i.id]||i.instruction;}});log('Anika published a correction request. Maya was notified to review the changes in the portal.');}break;
 case 'correct':if(i&&['draft','changes'].includes(s.status)&&['possible','requested','help','updated'].includes(i.status)){
 i.previousApplication=i.application;i.previousDocument=i.document;
 if(p.method==='document'){i.document=i.application;i.version++;}else{i.application=p.value===undefined?i.document:p.value;}
 i.status='updated';i.method=p.method;i.correctedEarly=s.status==='draft';
 
 log(`Maya ${p.method==='document'?'uploaded a corrected '+i.source.toLowerCase():'updated the application '+i.title.toLowerCase()}. ${s.status==='draft'?'Ready for assistant review.':'Awaiting assistant verification.'}`);
 }break;
 case 'help':if(i){if(!['resolved','dismissed','updated'].includes(i.status))i.status=s.status==='draft'?'possible':'help';i.messages.push({by:'Maya',text:p.message});log(`Maya asked for help with ${i.title.toLowerCase()}.`);}break;
 case 'reply':if(i){i.messages.push({by:'Anika',text:p.message});log(`Anika replied about ${i.title.toLowerCase()}.`);}break;
 case 'resume':if(s.status==='review'&&s.issues.some(i=>['requested','help'].includes(i.status))){s.status='changes';log('Anika returned the remaining open requests to Maya.');}break;
 case 'return':if(s.status==='changes'&&s.issues.some(i=>i.status==='updated'||i.status==='help')){s.status='review';log('Maya sent the updates for review. Outstanding issues remain open.');}break;
 case 'verify':if(s.status==='review'&&i&&['updated','dismissed'].includes(i.status)&&(i.status==='dismissed'||i.application===i.document)){i.status='resolved';log(`Anika verified the ${i.title.toLowerCase()} evidence.`);}break;
 case 'reopen':if(s.status==='review'&&i){i.status='possible';log(`Anika reopened ${i.title.toLowerCase()} for review.`);}break;
 case 'checklist':if(s.status==='review')s.checklist=!s.checklist;break;
 case 'complete':if(canComplete(s)){s.status='complete';log('Anika completed the submission review. Underwriting decision remains separate.');}break;
 case 'replace':if(i){i.version++;i.status='updated';s.status='review';s.checklist=false;log(`A new ${i.source.toLowerCase()} version arrived. Relevant checks reopened.`);}break;
 }
 return s;
}

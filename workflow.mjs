export const requiredDocuments=[{id:'limit',name:'Certificate of insurance',pages:2},{id:'address',name:'Property schedule',pages:3},{id:'loss',name:'Loss history',pages:4}];
export const hasRequiredDocuments=s=>requiredDocuments.every(d=>(s.documents||requiredDocuments).some(item=>item.id===d.id));
export function createSubmission(){return {
 status:'draft',reviewRound:'initial',documents:requiredDocuments.map(d=>({...d,version:1})),checklist:false,activity:['Maya Patel created the submission.'],
 issues:[
 {id:'limit',title:'Coverage limit',field:'General liability · Each occurrence',application:'$2,000,000',document:'$1,000,000',original:'$1,000,000',source:'Certificate of insurance',page:'Page 1 · Coverage schedule',status:'possible',version:1,messages:[],instruction:'Please confirm the intended coverage limit and update the application or provide a corrected certificate.'},
 {id:'address',title:'Insured address',field:'Applicant details · Street address',application:'184 Maple Street',document:'148 Maple Street',original:'148 Maple Street',source:'Property schedule',page:'Page 2 · Insured premises',status:'possible',version:1,messages:[],instruction:'Please confirm the insured location and correct the application or property schedule.'}
 ]};}
export const canPublish=s=>s.status==='review'&&s.issues.every(i=>['confirmed','dismissed','resolved','requested','help'].includes(i.status))&&s.issues.some(i=>i.status==='confirmed');
export const canComplete=s=>s.status==='review'&&hasRequiredDocuments(s)&&s.checklist&&s.issues.every(i=>['resolved','dismissed'].includes(i.status));
export function transition(input,action,p={}){
 const s=structuredClone(input),i=s.issues.find(i=>i.id===p.id);
 s.documents??=requiredDocuments.map(d=>({...d,version:1}));
 const log=m=>s.activity.unshift(m);
 switch(action){
 case 'submit': if(s.status==='draft'&&hasRequiredDocuments(s)){s.status='review';s.reviewRound='initial';log('Maya submitted the application. Anika can now review the evidence.');}break;
 case 'confirm':if(s.status==='review'&&i&&i.status==='possible'){i.status='confirmed';log(`Anika confirmed the ${i.title.toLowerCase()} discrepancy.`);}break;
 case 'dismiss':if(s.status==='review'&&i&&['possible','confirmed'].includes(i.status)){i.status='dismissed';i.reason=p.reason||'Source verified; no correction required.';log(`Anika dismissed the ${i.title.toLowerCase()} flag: ${i.reason}`);}break;
 case 'publish':if(canPublish(s)){s.status='changes';s.issues.forEach(i=>{if(i.status==='confirmed'){i.status='requested';i.requestPublished=true;i.instruction=p.instructions?.[i.id]||i.instruction;}});log('Anika published a correction request. Maya was notified to review the changes in the portal.');}break;
 case 'correct':if(i&&['draft','changes'].includes(s.status)&&['possible','requested','help','updated'].includes(i.status)){
 i.previousApplication=i.application;i.previousDocument=i.document;
 if(p.method==='document'){i.document=i.application;i.version++;i.missing=false;const d=s.documents.find(d=>d.id===i.id);if(d)d.version=i.version;else{s.documents.push({...requiredDocuments.find(d=>d.id===i.id),version:i.version});}}else{i.application=p.value===undefined?i.document:p.value;}
 i.status='updated';i.method=p.method;i.correctedEarly=s.status==='draft';
 
 log(`Maya ${p.method==='document'?'uploaded a corrected '+i.source.toLowerCase():'updated the application '+i.title.toLowerCase()}. ${s.status==='draft'?'Ready for assistant review.':'Awaiting assistant verification.'}`);
 }break;
 case 'help':if(i){if(!['resolved','dismissed','updated'].includes(i.status))i.status=s.status==='draft'?'possible':'help';i.messages.push({by:'Maya',text:p.message});log(`Maya asked for help with ${i.title.toLowerCase()}.`);}break;
 case 'reply':if(i){i.messages.push({by:'Anika',text:p.message});log(`Anika replied about ${i.title.toLowerCase()}.`);}break;
 case 'resume':if(s.status==='review'&&s.issues.some(i=>['requested','help'].includes(i.status))){s.status='changes';log('Anika returned the remaining open requests to Maya.');}break;
 case 'return':if(s.status==='changes'&&hasRequiredDocuments(s)&&s.issues.some(i=>i.status==='updated'||i.status==='help')){s.status='review';s.reviewRound='updates';log('Maya sent the updates for review. Outstanding issues remain open.');}break;
 case 'verify':if(s.status==='review'&&i&&['updated','dismissed'].includes(i.status)&&(i.status==='dismissed'||i.application===i.document)){i.status='resolved';log(`Anika verified the ${i.title.toLowerCase()} evidence.`);}break;
 case 'reopen':if(s.status==='review'&&i){i.status='possible';log(`Anika reopened ${i.title.toLowerCase()} for review.`);}break;
 case 'checklist':if(s.status==='review')s.checklist=!s.checklist;break;
 case 'complete':if(canComplete(s)){s.status='complete';log('Anika completed the submission review. Underwriting decision remains separate.');}break;
 case 'remove-document':if(['draft','changes'].includes(s.status)){s.documents=s.documents.filter(d=>d.id!==p.id);s.checklist=false;if(i){i.missing=true;i.status=s.status==='draft'?'possible':'requested';}log(`Maya removed ${requiredDocuments.find(d=>d.id===p.id)?.name||'a supporting document'}.`);}break;
 case 'upload-document':if(['draft','changes'].includes(s.status)){const existing=s.documents.find(d=>d.id===p.id),template=requiredDocuments.find(d=>d.id===p.id);if(existing)existing.version=(existing.version||1)+1;else if(template)s.documents.push({...template,version:1});if(i){i.previousDocument=i.document;i.document=i.application;i.version=(i.version||1)+1;i.missing=false;i.status='updated';i.method='document';}s.checklist=false;log(`Maya uploaded ${template?.name||existing?.name||'a document'}.`);}break;
 case 'add-document':if(['draft','changes'].includes(s.status)&&p.name){s.documents.push({id:`additional-${s.documents.length}-${s.activity.length}`,name:p.name,version:1,pages:1});s.checklist=false;log(`Maya added ${p.name}.`);}break;
 case 'replace':if(i){i.version++;i.status='updated';s.status='review';s.checklist=false;log(`A new ${i.source.toLowerCase()} version arrived. Relevant checks reopened.`);}break;
 }
 return s;
}

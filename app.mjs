import {createSubmission,transition,canPublish,canComplete,requiredDocuments,hasRequiredDocuments} from './workflow.mjs?v=20261013-3';
import {createPortal,navigation,navigate,switchRole,performAction,underwritingStage} from './portal.mjs?v=20261013-3';
const $=s=>document.querySelector(s), esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h5',check:'M5 12l4 4L19 6',arrow:'M4 12h16 M14 6l6 6-6 6',shield:'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-5',clock:'M12 8v4l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',mail:'M3 5h18v14H3z M3 5l9 7 9-7',upload:'M12 16V3 M7 8l5-5 5 5 M4 15v6h16v-6',warning:'M12 3L2 21h20z M12 9v5 M12 17h.01',chat:'M21 15a3 3 0 0 1-3 3H8l-5 4V5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z',close:'M6 6l12 12 M18 6L6 18',link:'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2 M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',rotate:'M3 11a9 9 0 1 1 2 7 M3 4v7h7',chevron:'M9 5l7 7-7 7'};
const icon=n=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[n]||paths.file}"/></svg>`;
let state;try{state=JSON.parse(localStorage.getItem('mc-demo-v1'))||createSubmission();if(!state.issues?.length)state=createSubmission();}catch{state=createSubmission();}
state.documents??=requiredDocuments.map(d=>({...d,version:1}));
let portal=createPortal(),selected='limit',timer;
try{const saved=JSON.parse(localStorage.getItem('mc-portal-v2'));if(saved&&['broker','assistant'].includes(saved.role))portal=navigate(createPortal(saved.role),saved.screen);}catch{}
const labels={possible:['Possible discrepancy','amber'],confirmed:['Confirmed','amber'],requested:['Awaiting broker','amber'],updated:['Updated · needs review','violet'],resolved:['Verified','green'],dismissed:['No correction needed','green'],help:['Help requested','violet']};
const statusNames={draft:'Draft submission',review:'Under review',changes:'Changes requested',complete:'Review complete'};
const badge=(text,type='')=>`<span class="badge ${type}"><span class="dot"></span>${esc(text)}</span>`;
const issueBadge=i=>{if(portal.role==='broker'){const brokerLabels={requested:['Action required','amber'],updated:[state.status==='changes'?'Update saved':'Under review','violet'],help:['Question sent','violet'],confirmed:['Under review','violet'],possible:['Under review','violet']};if(brokerLabels[i.status])return badge(...brokerLabels[i.status]);}return badge(...labels[i.status]);};
const btn=(text,action,type='',attrs='')=>`<button class="btn ${type}" data-action="${action}" ${attrs}>${text}</button>`;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
function save(){try{localStorage.setItem('mc-demo-v1',JSON.stringify(state));localStorage.setItem('mc-portal-v2',JSON.stringify(portal));}catch{}}
function act(action,p){const result=performAction(state,portal,action,p);state=result.submission;portal=result.portal;save();render();}
function setScreen(screen){portal=navigate(portal,screen);save();render();window.scrollTo({top:0,behavior:'instant'});}
function changeRole(role){portal=switchRole(portal,role,state);save();render();window.scrollTo({top:0,behavior:'instant'});}
function openDialog(html){$('#modal').innerHTML=html;$('#modal').showModal();}
function dialogHead(title){return `<div class="dialog-header"><h2>${title}</h2><button class="close" data-action="close" aria-label="Close dialog">${icon('close')}</button></div>`;}

function compare(i){const match=i.application===i.document;return `<div class="compare"><div class="source-card"><div class="source-top"><span>${icon('grid')} Application</span><span>Field ${i.id==='limit'?'12':'04'}</span></div><div class="source-body"><div class="source-label">${esc(i.field)}</div><div class="source-value ${match?'match':''}">${esc(i.application)}</div><div class="source-caption">${i.previousApplication&&i.previousApplication!==i.application?`Previously: ${esc(i.previousApplication)}<br>Updated by Maya Patel`:'Entered by Maya Patel'}<br>Northstar Studio LLC</div><div class="divider"></div><div class="source-label">Related details</div><div class="paper-row"><span>Coverage</span>General liability</div><div class="paper-row"><span>Policy period</span>Nov 2026 – Nov 2027</div><div class="paper-row"><span>Submission</span>MC-2048</div></div></div><div class="source-card"><div class="source-top"><span>${icon('file')} ${i.id==='limit'?'Certificate':'Property schedule'}</span><span>v${i.version}</span></div><div class="source-body"><div class="paper-head">${i.id==='limit'?'Certificate of Liability Insurance':'Schedule of Insured Premises'}</div><div class="paper-sub">ILLUSTRATIVE SOURCE DOCUMENT</div><div class="paper-row"><span>Named insured</span>Northstar Studio LLC</div><div class="paper-row"><span>Insurer</span>Harbor Mutual</div><div class="paper-highlight ${match?'match':''}"><small>${i.id==='limit'?'GENERAL LIABILITY · EACH OCCURRENCE':'LOCATION 01 · STREET ADDRESS'}</small><strong>${esc(i.document)}</strong></div><div class="source-caption">${esc(i.page)} · Source bookmark${i.version>1?`<br>Previous version: ${esc(i.original)}`:''}</div><div class="paper-lines"><i></i><i></i><i></i></div></div></div></div>`;}

const publishedIssues=()=>state.issues.filter(i=>i.requestPublished);
const brokerCanEdit=()=>portal.role==='broker'&&['draft','changes'].includes(state.status);
const pendingCount=()=>publishedIssues().filter(i=>!['resolved','dismissed'].includes(i.status)).length;

function steps(){
  if(portal.role==='assistant')return '';
  const current={draft:0,review:1,changes:2,complete:3}[state.status];
  const names=['Prepare & submit','Underwriting review','Correct & return','Review complete'];
  return `<div class="steps" aria-label="Submission progress">${names.map((name,index)=>`
    <div class="step ${index===current?'current':index<current?'done':''}" ${index===current?'aria-current="step"':''}>
      <span class="stepnum">${index<current?'✓':index+1}</span>${name}
    </div>`).join('')}</div>`;
}

function pageHead(title){
  return `<div class="pagehead"><div><div class="eyebrow">Submission MC-2048</div><h1>${title}</h1>
    <div class="meta">${title==='Northstar Studio LLC'?'':'<span>Insured<b>Northstar Studio LLC</b></span>'}<span>Product<b>Commercial package</b></span><span>Effective<b>Nov 01, 2026</b></span></div>
  </div></div>`;
}

function statusPanel(){
  const assistant=portal.role==='assistant';
  let title=statusNames[state.status],message='',tone=state.status==='changes'?'attention':state.status==='complete'?'success':state.status==='review'?'reviewing':'draft';
  let action='';
  if(state.status==='draft'){if(assistant)title='Submission not received';}
  if(state.status==='draft')message=assistant?'Awaiting submission from Maya Patel.':'Review the application and document checks before submitting.';
  if(state.status==='review')message=assistant?'Check the source evidence and decide which items need broker action.':publishedIssues().some(i=>i.status==='updated')?'Your updates have been sent to Anika Shah for verification.':'Anika Shah is reviewing your submission. No action is required from you.';
  if(state.status==='changes'){
    const needResponse=publishedIssues().filter(i=>['requested','help'].includes(i.status)).length;
    message=assistant?`Maya Patel has ${pendingCount()} outstanding correction${pendingCount()===1?'':'s'}.`:needResponse?`Anika Shah requested ${publishedIssues().length} corrections. ${needResponse} need your response.`:'All requested updates are saved. Send them for review.';
    if(!assistant&&portal.screen==='submission')action=btn('Review requested changes','screen','primary','data-screen="changes"');
  }
  if(state.status==='complete')message='Anika Shah completed the review. Ready for the underwriting decision.';
  if(assistant&&state.status==='changes'){title='Awaiting broker corrections';message='The correction request has been sent. Review resumes when Maya returns her updates.';}
  if(assistant&&state.status==='review'){const returning=underwritingStage(state)==='verify_updates';title=returning?'Broker updates received':'Submission received';message=returning?'Verify the returned application and documents before closing each issue.':'Review the source evidence and confirm which discrepancies require broker action.';}
  return `<section class="submission-status ${tone}" aria-label="Current submission status"><div class="status-symbol">${icon(state.status==='changes'?'warning':state.status==='complete'?'check':state.status==='review'?'clock':'file')}</div><div><div class="status-overline">Current status</div><h2>${title}</h2><p>${message}</p></div>${action?`<div class="status-action">${action}</div>`:''}</section>`;
}

function aside(){
  const assistant=portal.role==='assistant';
  const open=assistant?state.issues.filter(i=>!['resolved','dismissed'].includes(i.status)).length:state.status==='draft'?state.issues.filter(i=>i.application!==i.document).length:pendingCount();
  return `<aside><section class="panel"><div class="panelbody"><div class="side-heading">Submission details</div>
    <div class="summaryrow"><span>Broker</span><b>Maya Patel</b></div><div class="summaryrow"><span>Assigned to</span><b>Anika Shah</b></div>
    <div class="summaryrow"><span>Documents</span><b>${state.documents.length} ${portal.role==='assistant'?'received':'uploaded'}</b></div><div class="summaryrow"><span>${assistant?'Open review items':state.status==='draft'?'Document differences':'Requested changes'}</span><b>${open}</b></div>
  </div></section><section class="panel"><div class="panelbody"><div class="side-heading">Submission activity</div>
    ${state.activity.slice(0,5).map(message=>`<div class="activity">${esc(message)}</div>`).join('')}
    <button class="textbutton" data-action="activity">View all activity ${icon('arrow')}</button>
  </div></section></aside>`;
}

function demoFooter(){
  return `<div class="demo-footer"><span>Prototype controls · Sample data · Uploads, checks, and email are simulated.</span>
    <div class="preview-tabs"><button data-action="journey">View journey</button><button data-action="scenario" data-stage="review">Load review example</button><button data-action="scenario" data-stage="changes">Load correction example</button><button data-action="reset">Reset demo</button></div>
  </div>`;
}

function applicationPanel(){
  const draft=portal.role==='broker'&&state.status==='draft';
  return `<section class="panel"><div class="panelhead"><h2>Application details</h2><span class="small">${state.status==='draft'?'Draft saved':'Submitted application'}</span></div>
    <div class="panelbody"><div class="fields"><div class="field"><label for="company">Legal business name</label><input id="company" value="Northstar Studio LLC" readonly></div>
    <div class="field"><label for="type">Coverage type</label><input id="type" value="Commercial general liability" readonly></div>
    ${state.issues.map(i=>`<div class="field"><label for="${i.id}">${i.title}</label><input id="${i.id}" value="${esc(i.application)}" readonly ${draft&&i.application!==i.document?'class="flagged"':''}>
      ${draft&&i.missing?`<div class="hint">${icon('warning')} ${i.source} is missing</div>`:draft&&i.application!==i.document?`<div class="hint">${icon('warning')} Different value in ${i.source.toLowerCase()}</div>`:''}</div>`).join('')}
    </div></div></section>`;
}

function documents(){
  const missing=requiredDocuments.filter(required=>!state.documents.some(d=>d.id===required.id));
  return [...state.documents,...missing.map(d=>({...d,missing:true}))].map(doc=>{
    const issue=state.issues.find(i=>i.id===doc.id),editable=brokerCanEdit();
    return `<div class="docrow"><div class="docicon">${icon('file')}</div><div><div class="docname">${esc(doc.name)}${!doc.missing&&(issue?.version||doc.version)>1?` <span class="small">v${issue?.version||doc.version}</span>`:''}</div><div class="small">${doc.missing?'Required document missing':`Uploaded by Maya · PDF · ${doc.pages||1} pages`}</div></div>
    ${badge(doc.missing?'Missing':portal.role==='assistant'?'Received':'Uploaded',doc.missing?'amber':'green')}
    <div class="doc-actions">${!doc.missing?`<button class="textbutton" data-action="document" data-id="${doc.id}" aria-label="Preview ${esc(doc.name)}">Preview ${icon('eye')}</button>`:''}
    ${editable?`${btn(doc.missing?'Upload':'Replace','document-upload-dialog','',`data-id="${doc.id}" aria-label="${doc.missing?'Upload':'Replace'} ${esc(doc.name)}"`)}${!doc.missing?`<button class="textbutton" data-action="remove-document-dialog" data-id="${doc.id}" aria-label="Remove ${esc(doc.name)}">Remove</button>`:''}`:''}</div></div>`;
  }).join('');
}

function overview(){
  if(portal.role==='assistant')return assistantOverview();
  const assistant=portal.role==='assistant';
  let draftChecks='';
  if(!assistant&&state.status==='draft')draftChecks=`<section class="panel"><div class="panelhead"><h2>Document checks</h2>${badge(`${state.issues.filter(i=>i.application!==i.document).length} possible discrepancies`,'amber')}</div>
    ${state.issues.filter(i=>!i.missing).map(i=>`<div class="issue-inline"><div class="issue-top"><h3>${i.title}</h3>${i.application===i.document?badge('Updated · pending verification','violet'):badge('Possible discrepancy','amber')}</div>
      <div class="values"><span>Application: ${esc(i.application)}</span>${icon('arrow')}<span>Document: ${esc(i.document)}</span></div>
      ${i.application!==i.document?`<div class="buttons">${btn('Review difference','draft-evidence','',`data-id="${i.id}"`)}<button class="textbutton" data-action="help-dialog" data-id="${i.id}">${icon('chat')} Ask Anika</button></div>`:`<p class="small">Saved. The assistant will verify this update after submission.</p>`}${thread(i,false)}
    </div>`).join('')}</section>`;
  let action='';
  if(!assistant&&state.status==='draft')action=`<div class="footer-action"><span class="small">${hasRequiredDocuments(state)?'Unresolved differences can be submitted for underwriting review.':'Upload all three required documents to submit.'}</span>${btn(`Submit for review ${icon('arrow')}`,'submit','primary',hasRequiredDocuments(state)?'':'disabled')}</div>`;
  if(assistant&&state.status!=='draft')action=`<div class="footer-action"><span class="small">${state.issues.filter(i=>!['resolved','dismissed'].includes(i.status)).length} review items · Coverage checklist ${state.checklist?'completed':'not completed'}</span>${btn('Open evidence review','screen','primary','data-screen="evidence"')}</div>`;
  return pageHead('Northstar Studio LLC')+statusPanel()+steps()+`<div class="grid"><div>${applicationPanel()}
    <section class="panel"><div class="panelhead"><h2>Supporting documents</h2><span class="small">${requiredDocuments.filter(d=>state.documents.some(item=>item.id===d.id)).length} of 3 required uploaded</span></div>${documents()}
      ${!assistant&&state.status==='draft'?`<div class="dropzone">${icon('upload')}<p>Add supporting documents</p><button class="textbutton" data-action="upload">Upload new document</button></div>`:''}</section>${draftChecks}</div>${aside()}</div>`+action+demoFooter();
}

function issueList(issues,broker=false){
  return `<div class="issue-list"><div class="side-heading">${broker?'Requested changes':'Review items'} · ${issues.length}</div>${issues.map(i=>`
    <button class="issue-select ${i.id===selected?'active':''}" data-action="select" data-id="${i.id}" aria-pressed="${i.id===selected}"><h3>${i.title}</h3><div class="small">${i.source}</div>${issueBadge(i)}</button>`).join('')}</div>`;
}

function thread(i,assistant=false){
  if(!i.messages.length)return '';
  const canMessage=assistant&&state.status!=='complete'||!assistant&&brokerCanEdit();
  return `<div class="help-thread"><strong>Messages</strong>${i.messages.map(m=>`<p><b>${esc(m.by)}:</b> ${esc(m.text)}</p>`).join('')}
    ${canMessage?`<button class="textbutton" data-action="${assistant?'reply-dialog':'help-dialog'}" data-id="${i.id}">${icon('chat')} ${assistant?'Reply to Maya':'Add a message'}</button>`:''}</div>`;
}

function review(){
  if(state.status==='changes')return awaitingBroker();
  if(state.status==='draft')return assistantNotReceived();
  const i=state.issues.find(item=>item.id===selected)||state.issues[0];selected=i.id;
  let actions='',description='';
  if(state.status==='review'){
    if(i.status==='possible'){description='Compare both source values before confirming a discrepancy.';actions=btn('Confirm discrepancy','confirm','primary',`data-id="${i.id}"`)+btn('Dismiss flag','dismiss-dialog','',`data-id="${i.id}"`);}
    if(i.status==='confirmed'){description='Confirmed for broker correction. Publish the request to make it visible to Maya.';actions=btn('Undo confirmation','reopen','',`data-id="${i.id}"`);}
    if(i.status==='updated'){description=i.application===i.document?underwritingStage(state)==='verify_updates'?'Check the returned application or document before verifying this update.':'Check the uploaded application or document before verifying this information.':'The updated values still differ. Review the source and request another correction.';actions=btn('Verify update','verify','primary',`data-id="${i.id}" ${i.application!==i.document?'disabled':''}`)+btn(i.requestPublished?'Request another correction':'Flag for correction','reopen','',`data-id="${i.id}"`);}
    if(i.status==='dismissed'){description=`Flag dismissed: ${i.reason||'No correction needed.'}`;actions=btn('Reopen flag','reopen','',`data-id="${i.id}"`);}
  }
  if(i.status==='resolved')description='Verified by Anika Shah.';
  if(i.status==='requested')description='Correction requested. Waiting for Maya’s response.';
  if(i.status==='help')description='Maya has a question. Reply in the messages below.';
  const allFinalOrUpdated=state.issues.every(item=>['updated','resolved','dismissed'].includes(item.status));
  let footer='';
  if(state.status==='review'){
    let primary;
    if(canPublish(state))primary=btn('Review correction request','publish-dialog','primary');
    else if(state.issues.some(item=>['requested','help'].includes(item.status))&&!state.issues.some(item=>['possible','confirmed'].includes(item.status)))primary=btn('Return open requests to broker','resume','primary');
    else if(allFinalOrUpdated)primary=btn('Complete review','complete','primary',canComplete(state)?'':'disabled');
    else primary=btn('Review correction request','publish-dialog','primary','disabled');
    const guidance=canPublish(state)?'Review the instructions before publishing to the broker.':allFinalOrUpdated?'Verify returned updates and complete the coverage checklist.':'Review each item before publishing a correction request.';
    footer=`<div class="footer-action"><span class="small">${guidance}</span>${primary}</div>`;
  }
  return pageHead(underwritingStage(state)==='verify_updates'?'Verify broker updates':state.status==='complete'?'Review complete':'Evidence review')+statusPanel()+steps()+`<div class="review-layout">${issueList(state.issues)}<section class="review-main">
    <div class="review-title"><div><h2>${i.title}</h2><p class="small" style="margin:5px 0 0">${i.application===i.document?'Values match':'Values differ'}</p></div>${issueBadge(i)}</div>${compare(i)}
    <div class="review-decision"><p>${esc(description)}</p><div class="buttons">${actions}</div>${thread(i,true)}</div>
  </section></div><section class="panel"><div class="checklist"><input type="checkbox" id="checklist" ${state.checklist?'checked':''} ${state.status!=='review'?'disabled':''}>
    <label for="checklist"><strong>Coverage checklist complete</strong><br><span class="small">Application, certificate, property schedule, and loss history checked.</span></label></div></section>${footer}
    <section class="panel" style="margin-top:20px"><div class="panelbody"><div class="side-heading">Submission activity</div>${state.activity.slice(0,3).map(m=>`<div class="activity">${esc(m)}</div>`).join('')}<button class="textbutton" data-action="activity">View all activity</button></div></section>`+demoFooter();
}

function correctionActions(i){
  if(!brokerCanEdit()||!['requested','help','updated'].includes(i.status))return '';
  return `<div class="buttons">${btn('Update application','correct-dialog','primary',`data-id="${i.id}" data-method="application"`)}
    ${btn('Replace document','correct-dialog','',`data-id="${i.id}" data-method="document"`)}<button class="textbutton" data-action="help-dialog" data-id="${i.id}">${icon('chat')} Ask Anika</button></div>`;
}

function corrections(){
  const issues=publishedIssues();
  if(!issues.length)return pageHead('Requested changes')+statusPanel()+steps()+`<div class="grid"><section class="panel empty">${icon('check')}<h2>No changes requested</h2><p>Requests from Anika will appear here after the submission has been reviewed.</p></section>${aside()}</div>`+demoFooter();
  const i=issues.find(item=>item.id===selected)||issues[0];selected=i.id;
  const remaining=issues.filter(item=>['requested','help'].includes(item.status)).length;
  const updates=issues.filter(item=>item.status==='updated').length;
  let footer='';
  if(state.status==='changes')footer=`<div class="footer-action"><span class="small">${updates} update${updates===1?'':'s'} saved${remaining?` · ${remaining} item${remaining===1?'':'s'} still need a response`:''}</span>
    ${btn('Send updates for review','return','primary',!hasRequiredDocuments(state)||!state.issues.some(item=>['updated','help'].includes(item.status))?'disabled':'')}</div>`;
  return pageHead('Requested changes')+statusPanel()+steps()+`<div class="review-layout">${issueList(issues,true)}<section class="review-main">
    <div class="review-title"><div><h2>${i.title}</h2><p class="small" style="margin:5px 0 0">Requested by Anika Shah</p></div>${issueBadge(i)}</div>
    <div class="request-instruction"><h3>Requested correction</h3><p>${esc(i.instruction)}</p>${correctionActions(i)}</div>${compare(i)}
    <div class="review-decision">${i.status==='updated'?`<p>${state.status==='changes'?'Update saved. Send it for review when you’re ready.':'Update sent. Awaiting verification by Anika.'}</p>`:i.status==='resolved'?`<p>Anika verified this correction.</p>`:state.status==='review'?`<p>This issue is under review. Editing is paused until Anika responds.</p>`:''}
      ${thread(i,false)}</div>
  </section></div>${footer}<div class="correction-summary"><section class="panel"><div class="panelbody"><h2>Request summary</h2><div class="summaryrow"><span>Requested corrections</span><b>${issues.length}</b></div><div class="summaryrow"><span>Updates saved</span><b>${updates}</b></div><div class="summaryrow"><span>Verified</span><b>${issues.filter(item=>item.status==='resolved').length}</b></div></div></section>
    <section class="panel"><div class="panelbody"><div class="side-heading">Submission activity</div>${state.activity.slice(0,3).map(m=>`<div class="activity">${esc(m)}</div>`).join('')}<button class="textbutton" data-action="activity">View all activity</button></div></section></div>`+demoFooter();
}

function render(){
  const assistant=portal.role==='assistant';
  const content=portal.screen==='evidence'?review():portal.screen==='changes'?corrections():overview();
  $('#app').innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand"><div class="brandmark">${icon('grid')}</div><span>Marsh & Colby</span></div>
    <div class="workspace-label">${assistant?'Underwriting':'Broker'} workspace</div><nav aria-label="${assistant?'Underwriting':'Broker'} navigation">${navigation(portal.role).map(item=>`
      <button class="navitem ${portal.screen===item.id?'active':''}" data-action="screen" data-screen="${item.id}" aria-label="${item.title}" ${assistant&&state.status==='draft'&&item.id==='evidence'?'disabled':''} ${portal.screen===item.id?'aria-current="page"':''}>${icon(item.icon)}<span>${item.title}</span>
      ${item.id==='changes'&&pendingCount()?`<span class="count">${pendingCount()}</span>`:''}</button>`).join('')}</nav>
    <div class="profile"><div class="avatar">${assistant?'AS':'MP'}</div><div>${assistant?'Anika Shah':'Maya Patel'}<div class="small">${assistant?'Underwriting assistant':'Broker · Fieldstone Partners'}</div></div></div>
    </aside><main class="main"><header class="topbar"><div class="crumb"><span>Submissions</span>${icon('chevron')}<strong>Northstar Studio</strong></div>
      <div class="tools"><span class="demo-label">Preview as</span><div class="role-switch" aria-label="Prototype role switch"><button data-action="role" data-role="broker" aria-pressed="${!assistant}" class="${!assistant?'active':''}">Broker</button><button data-action="role" data-role="assistant" aria-pressed="${assistant}" class="${assistant?'active':''}">Underwriting</button></div><button class="textbutton" data-action="journey">${icon('link')} Journey</button></div>
    </header><div class="content">${content}</div></main></div>`;
}

function draftEvidence(id){
  const i=state.issues.find(item=>item.id===id);
  openDialog(dialogHead(i.title)+`<p>The application and ${i.source.toLowerCase()} contain different values.</p>${compare(i)}
    <div class="dialog-footer">${btn('Update application','correct-dialog','primary',`data-id="${id}" data-method="application"`)}${btn('Replace document','correct-dialog','',`data-id="${id}" data-method="document"`)}</div>`);
}

function correctDialog(id,method){
  if(!brokerCanEdit())return;
  const i=state.issues.find(item=>item.id===id);
  const application=method==='application';
  openDialog(dialogHead(application?`Update ${i.title.toLowerCase()}`:`Replace ${i.source.toLowerCase()}`)+`
    <div class="values"><span>Application: ${esc(i.application)}</span><span>Document: ${esc(i.document)}</span></div>
    ${application?`<div class="field"><label for="corrected-value">${i.title}</label><input id="corrected-value" value="${esc(i.document)}"></div><p class="small">The value above is taken from the document. Confirm it reflects the intended information before saving.</p>`:
      `<div class="upload-replacement">${icon('file')}<div><strong>${i.source} · v${i.version+1}</strong><p>Sample replacement contains ${esc(i.application)}.</p></div></div><p class="small">Use the corrected document from the issuer. This prototype supplies a sample file.</p>`}
    <div class="dialog-footer">${btn('Cancel','close')}${btn(application?'Save application change':'Upload replacement','save-correction','primary',`data-id="${id}" data-method="${method}"`)}</div>`);
}

function publishDialog(){
  if(portal.role!=='assistant'||!canPublish(state))return;
  openDialog(dialogHead('Publish correction request')+`<p>Review the instructions Maya will see in Requested changes.</p>
    ${state.issues.filter(i=>i.status==='confirmed').map(i=>`<label for="instruction-${i.id}"><strong>${i.title}</strong></label><textarea id="instruction-${i.id}" data-instruction="${i.id}">${esc(i.instruction)}</textarea>`).join('')}
    <div class="notification"><b>${icon('mail')} Broker notification</b>Your application has been reviewed and changes are requested. Open submission MC-2048 to review and respond.</div>
    <div class="dialog-footer">${btn('Cancel','close')}${btn('Publish & notify broker','publish','primary')}</div>`);
}

function messageDialog(id,reply=false){
  openDialog(dialogHead(reply?'Reply to Maya':'Ask Anika')+`<label for="message">Message</label><textarea id="message" placeholder="Write your message…"></textarea>
    <div class="dialog-footer">${btn('Cancel','close')}${btn(reply?'Send reply':'Send message',reply?'save-reply':'save-help','primary',`data-id="${id}"`)}</div>`);
}

function scenario(stage){
  state=createSubmission();
  if(stage!=='draft')state=transition(state,'submit');
  if(stage==='changes'){
    for(const i of state.issues)state=transition(state,'confirm',{id:i.id});
    state=transition(state,'publish');
  }
  const screen=portal.role==='assistant'?(stage==='draft'?'submission':'evidence'):(stage==='changes'?'changes':'submission');
  selected='limit';save();setScreen(screen);toast('Example loaded. Your preview role has not changed.');
}

function journey(){
  openDialog(dialogHead('Submission journey')+`
    ${[['Broker prepares the submission','The application and uploaded documents are checked for possible differences. Maya can update the application, replace a document, or ask Anika for help.'],['Broker submits for review','Maya stays in the broker portal. The submission is under review and editing is paused.'],['Assistant reviews the evidence','Anika has separate navigation. She inspects bookmarked source values, confirms discrepancies, and reviews the checklist.'],['Assistant publishes requested changes','Confirmed findings stay internal until Anika approves the instructions and publishes. Maya receives an email link to Requested changes.'],['Broker corrects and returns','Maya uses the comparison view to update the application or upload a replacement. Messages stay attached to the issue.'],['Assistant verifies updates','Anika checks the returned evidence before closing each issue. The completed review is handed off for an underwriting decision.']].map(([title,description],index)=>`<div class="journey-row"><span class="journey-number">${index+1}</span><div><strong>${title}</strong><p>${description}</p></div></div>`).join('')}
    <p class="small">The top role switch is a prototype control. In production, each person signs in to their own role.</p><div class="dialog-footer">${btn('Close','close','primary')}</div>`);
}

function documentDialog(id){
  const doc=state.documents.find(d=>d.id===id);
  const i=state.issues.find(item=>item.id===id);
  const document=i?`<div class="source-card"><div class="source-top"><span>${i.source}</span><span>v${i.version}</span></div><div class="source-body"><div class="paper-head">${i.id==='limit'?'Certificate of Liability Insurance':'Schedule of Insured Premises'}</div><div class="paper-sub">ILLUSTRATIVE SOURCE DOCUMENT</div><div class="paper-row"><span>Named insured</span>Northstar Studio LLC</div><div class="paper-row"><span>Insurer</span>Harbor Mutual</div><div class="paper-row"><span>${i.title}</span><strong>${esc(i.document)}</strong></div><p class="source-caption">${esc(i.page)}</p></div></div>`:`<div class="notification"><b>${esc(doc?.name||'Document')} · Northstar Studio LLC</b>${id==='loss'?'No reported claims in the sample period.':'Supporting document uploaded by Maya Patel.'}</div>`;
  openDialog(dialogHead(i?.source||doc?.name||'Document')+document+`<div class="dialog-footer">${btn('Close preview','close','primary')}</div>`);
}

function dispatchClick(el){
  const action=el.dataset.action,id=el.dataset.id;
  if(action==='document-upload-dialog'){
    const doc=state.documents.find(d=>d.id===id)||requiredDocuments.find(d=>d.id===id);
    return openDialog(dialogHead(`${state.documents.some(d=>d.id===id)?'Replace':'Upload'} ${doc.name.toLowerCase()}`)+`<div class="upload-replacement">${icon('file')}<div><strong>${esc(doc.name)}</strong><p>Upload a new version for this document.</p></div></div><p class="small">A sample file is supplied for this prototype.</p><div class="dialog-footer">${btn('Cancel','close')}${btn('Upload document','save-document-upload','primary',`data-id="${id}"`)}</div>`);
  }
  if(action==='save-document-upload'){$('#modal').close();act('upload-document',{id});return toast('Document uploaded.');}
  if(action==='remove-document-dialog'){
    const doc=state.documents.find(d=>d.id===id);
    return openDialog(dialogHead('Remove document?')+`<p>Remove ${esc(doc.name)} from this submission? You can upload it again in the same document slot.</p><div class="dialog-footer">${btn('Cancel','close')}${btn('Remove document','remove-document','primary',`data-id="${id}"`)}</div>`);
  }
  if(action==='remove-document'){$('#modal').close();act('remove-document',{id});return toast('Document removed.');}
  if(action==='add-document'){const name=$('#new-doc-name').value.trim();if(!name)return $('#new-doc-name').focus();$('#modal').close();act('add-document',{name});return toast('Document added.');}
  if(action==='request-detail')return requestDetail(id);
  if(action==='close')return $('#modal').close();
  if(action==='role')return changeRole(el.dataset.role);
  if(action==='screen')return setScreen(el.dataset.screen);
  if(action==='select'){selected=id;return render();}
  if(action==='draft-evidence')return draftEvidence(id);
  if(action==='correct-dialog')return correctDialog(id,el.dataset.method||'application');
  if(action==='save-correction'){
    const method=el.dataset.method,value=method==='application'?$('#corrected-value').value.trim():undefined;
    if(method==='application'&&!value)return $('#corrected-value').focus();
    $('#modal').close();act('correct',{id,method,value});return toast('Change saved. Send it for review when ready.');
  }
  if(action==='help-dialog'||action==='reply-dialog')return messageDialog(id,action==='reply-dialog');
  if(action==='save-help'||action==='save-reply'){
    const message=$('#message').value.trim();if(!message)return $('#message').focus();
    $('#modal').close();act(action==='save-help'?'help':'reply',{id,message});return toast('Message sent.');
  }
  if(action==='publish-dialog')return publishDialog();
  if(action==='publish'){
    const instructions={};document.querySelectorAll('[data-instruction]').forEach(field=>instructions[field.dataset.instruction]=field.value.trim());
    if(Object.values(instructions).some(value=>!value))return toast('Add an instruction for each requested correction.');
    $('#modal').close();act('publish',{instructions});window.scrollTo({top:0,behavior:'instant'});return toast('Changes published to Maya’s portal. Notification queued.');
  }
  if(action==='dismiss-dialog')return openDialog(dialogHead('Dismiss flag')+`<label for="reason">Reason no correction is required</label><textarea id="reason" placeholder="Record why the source difference is acceptable or incorrect…"></textarea><div class="dialog-footer">${btn('Cancel','close')}${btn('Dismiss flag','dismiss','primary',`data-id="${id}"`)}</div>`);
  if(action==='dismiss'){
    const reason=$('#reason').value.trim();if(!reason)return $('#reason').focus();
    $('#modal').close();act('dismiss',{id,reason});return toast('Flag dismissed. Reason recorded.');
  }
  if(action==='submit'){act('submit');setScreen('submission');return toast('Submission sent to Anika Shah for review.');}
  if(['confirm','verify','reopen'].includes(action)){
    act(action,{id});return toast(action==='confirm'?'Discrepancy confirmed. Publish a request to notify Maya.':action==='verify'?'Update verified.':'Issue reopened.');
  }
  if(action==='return'){act('return');setScreen('changes');return toast('Updates sent to Anika Shah.');}
  if(action==='resume'){act('resume');window.scrollTo({top:0,behavior:'instant'});return toast('Open requests returned to Maya.');}
  if(action==='complete'){act('complete');window.scrollTo({top:0,behavior:'instant'});return toast('Review completed.');}
  if(action==='journey')return journey();
  if(action==='document')return documentDialog(id);
  if(action==='scenario')return scenario(el.dataset.stage);
  if(action==='reset')return openDialog(dialogHead('Reset prototype?')+`<p>Reset the sample submission to its draft state. Your preview role stays the same.</p><div class="dialog-footer">${btn('Cancel','close')}${btn('Reset demo','reset-confirm','primary')}</div>`);
  if(action==='reset-confirm'){$('#modal').close();state=createSubmission();selected='limit';save();setScreen('submission');return toast('Sample submission reset.');}
  if(action==='activity')return openDialog(dialogHead('Submission activity')+state.activity.map(message=>`<div class="activity">${esc(message)}</div>`).join('')+`<div class="dialog-footer">${btn('Close','close','primary')}</div>`);
  if(action==='upload')return openDialog(dialogHead('Upload new document')+`<div class="field"><label for="new-doc-name">Document name</label><input id="new-doc-name" placeholder="Additional endorsement.pdf"></div><p class="small">This adds a sample file to the submission. Use Replace on an existing document to update it.</p><div class="dialog-footer">${btn('Cancel','close')}${btn('Add document','add-document','primary')}</div>`);
}

document.addEventListener('click',event=>{
  const element=event.target.closest('[data-action]');
  if(!element||element.disabled||element.matches('input'))return;
  if(['correct-dialog','draft-evidence','save-correction','help-dialog','save-help','submit','return','upload','document-upload-dialog','save-document-upload','remove-document-dialog','remove-document','add-document'].includes(element.dataset.action)&&portal.role!=='broker')return;
  if(['confirm','verify','reopen','publish-dialog','publish','dismiss-dialog','dismiss','reply-dialog','save-reply','resume','complete'].includes(element.dataset.action)&&portal.role!=='assistant')return;
  if(['correct-dialog','reply-dialog'].includes(element.dataset.action)&&$('#modal').open)$('#modal').close();
  dispatchClick(element);
});
document.addEventListener('change',event=>{if(event.target.matches('#checklist'))act('checklist');});
render();

function assistantNotReceived(){
 return `<div class="pagehead"><div><div class="eyebrow">Submission MC-2048</div><h1>Submission not received</h1></div></div>
 <section class="panel empty"><div class="status-symbol" style="margin:auto">${icon('clock')}</div><h2>Awaiting broker submission</h2><p>Maya Patel has not submitted the application yet.</p><p class="small">The application and documents will become available when submitted.</p></section>`+demoFooter();
}

function assistantOverview(){
 if(state.status==='draft')return assistantNotReceived();
 if(state.status==='changes')return awaitingBroker();
 const returned=underwritingStage(state)==='verify_updates';
 return pageHead(returned?'Returned submission':'Submission review')+statusPanel()+`<div class="grid"><div>
 <section class="panel"><div class="panelhead"><h2>${returned?'Broker updates':'Review summary'}</h2></div><div class="panelbody">
 <div class="summaryrow"><span>Review items</span><b>${state.issues.filter(i=>!['resolved','dismissed'].includes(i.status)).length} outstanding</b></div>
 <div class="summaryrow"><span>Coverage checklist</span><b>${state.checklist?'Complete':'Not complete'}</b></div>
 <div class="buttons" style="margin-top:20px">${btn(returned?'Verify returned updates':'Review submission','screen','primary','data-screen="evidence"')}</div></div></section>
 <section class="panel"><div class="panelhead"><h2>Received documents</h2><span class="small">${state.documents.length} documents</span></div>${documents()}</section></div>${aside()}</div>`+demoFooter();
}

function awaitingBroker(){
 const requests=publishedIssues();
 return pageHead('Awaiting broker corrections')+statusPanel()+`<div class="grid"><div><section class="panel"><div class="panelhead"><h2>Correction request sent</h2><span class="small">${requests.length} requested change${requests.length===1?'':'s'}</span></div>
 <div class="waiting-table"><div class="waiting-row waiting-header"><span>Requested change</span><span>Broker response</span><span></span></div>
 ${requests.map(i=>`<div class="waiting-row"><div><h3>${i.title}</h3><p class="small">${i.source}</p></div><div>${badge(i.status==='updated'?'Update saved · not returned':i.status==='help'?'Question received':i.status==='resolved'?'Already verified':'Awaiting correction',i.status==='updated'||i.status==='help'?'violet':i.status==='resolved'?'green':'amber')}</div><button class="textbutton" data-action="request-detail" data-id="${i.id}">View request ${icon('arrow')}</button></div>`).join('')}</div></section>
 <div class="notice neutral">${icon('clock')}<div><strong>Waiting for the broker to return updates</strong><p>Review and verification actions become available after Maya sends the submission back.</p></div></div></div>${aside()}</div>`+demoFooter();
}

function requestDetail(id){
 const i=state.issues.find(item=>item.id===id);
 openDialog(dialogHead(i.title)+`<p class="small">Published correction request · Maya Patel</p><p>${esc(i.instruction)}</p>${thread(i,true)}<div class="dialog-footer">${btn('Close','close')}${btn('Message Maya','reply-dialog','primary',`data-id="${id}"`)}</div>`);
}

import {transition} from './workflow.mjs?v=20261013-3';

export function createPortal(role='broker') {
  return {role, screen:'submission'};
}
export function navigation(role) {
  return role==='assistant'
    ? [{id:'submission',title:'Submission',icon:'file'},{id:'evidence',title:'Evidence review',icon:'shield'}]
    : [{id:'submission',title:'Submission',icon:'file'},{id:'changes',title:'Requested changes',icon:'chat'}];
}
export function navigate(portal, screen) {
  return navigation(portal.role).some(item=>item.id===screen) ? {...portal,screen} : portal;
}
export function switchRole(portal, role, submission) {
  if(!['broker','assistant'].includes(role)) return portal;
  const screen=role==='assistant'
    ? submission.status==='draft'?'submission':'evidence'
    : submission.status==='changes'?'changes':'submission';
  return {role,screen};
}
export function performAction(submission,portal,action,payload={}) {
  const brokerActions=['submit','correct','help','return','replace','remove-document','upload-document','add-document'];
  const assistantActions=['confirm','dismiss','publish','reply','resume','verify','reopen','checklist','complete'];
  const allowed=portal.role==='broker' ? brokerActions : assistantActions;
  if(!allowed.includes(action))return {submission,portal};
  if(portal.role==='broker' && ['correct','help','replace','remove-document','upload-document','add-document'].includes(action) && !['draft','changes'].includes(submission.status))return {submission,portal};
  return {submission:transition(submission,action,payload),portal};
}
export function underwritingStage(submission){
 if(submission.status==='draft')return 'not_received';
 if(submission.status==='changes')return 'awaiting_broker';
 if(submission.status==='complete')return 'complete';
 return submission.reviewRound==='updates'||submission.reviewRound===undefined&&submission.issues.some(i=>i.requestPublished&&i.status==='updated')?'verify_updates':'review';
}

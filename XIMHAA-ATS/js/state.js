function setSession(session){ localStorage.setItem('ximhaa.session', JSON.stringify(session)); }
function getSession(){ return JSON.parse(localStorage.getItem('ximhaa.session') || 'null'); }
function clearSession(){ localStorage.removeItem('ximhaa.session'); }

function keyDept(team, dept){ return `ximhaa.progress.${team}.${dept}`; }
function getDeptState(team, dept){
  const raw = localStorage.getItem(keyDept(team,dept));
  return raw ? JSON.parse(raw) : { selections:{}, locked:false };
}
function saveSelection(team, dept, roleId, candidateId, justification){
  const s = getDeptState(team,dept);
  s.selections[roleId] = { candidateId, justification, savedAt: Date.now() };
  localStorage.setItem(keyDept(team,dept), JSON.stringify(s));
}
function lockDept(team,dept){
  const s = getDeptState(team,dept);
  s.locked = true;
  localStorage.setItem(keyDept(team,dept), JSON.stringify(s));
}
window.XState = { setSession, getSession, clearSession, getDeptState, saveSelection, lockDept };

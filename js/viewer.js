let vDept, vRoleId, vCandId, vRoleMeta=null, vCandidate=null;

(async function initViewer(){
const q = new URLSearchParams(location.search);
vDept = q.get('dept') || 'finance';
vRoleId = q.get('role');
vCandId = q.get('candidate');

const titleEl = document.getElementById('viewer-title');
if (titleEl) titleEl.textContent = 'Resume Viewer';

// Load role meta
const roles = await XData.getRoles();
vRoleMeta = roles.find(r=>r.id===vRoleId);

// Load candidates and select target
const list = await XData.getCandidatesByRole(vRoleId);
vCandidate = list.find(c=>c.id===vCandId) || list;

renderResume();
renderAnalytics();
})();

function renderResume(){
const pane = document.getElementById('resume-pane');
if (!pane || !vCandidate) return;

const skills = (vCandidate.skills||[]).map(s=>'<span class="badge">'+s+'</span>').join('');
const strengths = (vCandidate.strengths||[]).map(s=>'<span class="badge">'+s+'</span>').join('');

pane.innerHTML = <h3>${vCandidate.name} <span class="pill ${vCandidate.seniority==='Senior'?'senior':'junior'}">${vCandidate.seniority||''}</span></h3> <div class="section"> <strong>Summary</strong> <p style="color:var(--muted)">${vCandidate.summary||''}</p> </div> <div class="section"> <strong>Skills</strong> <div>${skills}</div> </div> <div class="section"> <strong>Strengths</strong> <div>${strengths}</div> </div> ;
}

function renderAnalytics(){
if (!vCandidate || !vRoleMeta) return;

const mh = XAnalytics.computeMustHaveCoverage(vCandidate.skills, vRoleMeta.mustHave);
XAnalytics.renderMustHaveBadges('musthave-badges', vRoleMeta.mustHave, vCandidate.skills);

const seniorityMatch = vRoleMeta.seniority ? ((vCandidate.seniority||'').toLowerCase() === vRoleMeta.seniority.toLowerCase() ? 1 : 0.6) : 1;
const extrasPct = Math.min(100, (vCandidate.strengths||[]).length * 15);

const fit = XAnalytics.computeFitScore({ mustHavePct: mh.pct, seniorityMatch, extrasPct });
XAnalytics.animateGaugeTo(fit);

const labels = (vRoleMeta.mustHave||[]).map(x=>x.split(' '));
const values = labels.map(lbl=>{
const has = (vCandidate.skills||[]).some(s=>s.toLowerCase().includes(lbl.toLowerCase()));
return has ? 5 : 2;
});
XAnalytics.renderSkillRadar('skill-radar', labels, values);
}

function shortlistFromViewer(){
const txt = (document.getElementById('viewer-justif')?.value||'').trim();
if (txt.length < 15){ UI.toast('Please enter at least 15 characters.'); return; }
const session = XState.getSession() || { team:'Team 1', dept:vDept };
const state = XState.getDeptState(session.team, vDept);
state.selections[vRoleId] = { candidateId:vCandidate.id, justification:txt, savedAt: Date.now() };
localStorage.setItem('ximhaa.progress.' + session.team + '.' + vDept, JSON.stringify(state));
UI.toast('Selection saved from viewer.');
}

function backToRole(){
window.location.href = 'role.html?dept=' + encodeURIComponent(vDept) + '&role=' + encodeURIComponent(vRoleId);
}

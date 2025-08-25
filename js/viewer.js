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
vRoleMeta = roles.find(function(r){ return r.id === vRoleId; }) || null;

// Load candidates and pick target
const list = await XData.getCandidatesByRole(vRoleId);
vCandidate = Array.isArray(list) ? (list.find(function(c){ return c.id === vCandId; }) || list) : null;

renderResume();
renderAnalytics();
})();

function resolveResumePath(){
let num = 1;
const id = String(vCandidate && vCandidate.id ? vCandidate.id : '');
const m = id.match(/(\d{1,2})$/);
if (m) {
const n = parseInt(m, 10);
if (n >= 1 && n <= 5) num = n;
}
const folder = String(vRoleId || '').trim();
const path = 'resumes/' + folder + '/resume' + num + '.jpg';
console.log('RESUME PATH:', path);
return path;
}

function renderResume(){
const stage = document.getElementById('resume-stage');
const img = document.getElementById('resume-img');
if (!stage || !img || !vCandidate) return;

const resumePath = resolveResumePath();
img.src = resumePath;
img.onload = function(){ stage.classList.add('loaded'); };
img.onerror = function(){
console.warn('Resume image not found:', resumePath);
img.src = 'resumes/placeholder.jpg';
stage.classList.add('loaded');
};
}

// Export modal handlers globally for inline onclick
function openResumeModal(){
const modal = document.getElementById('resume-modal');
const full = document.getElementById('resume-full');
const small = document.getElementById('resume-img');
if (full && small) full.src = small.src;
if (modal) modal.classList.remove('hidden');
}
window.openResumeModal = openResumeModal;

function closeResumeModal(){
const modal = document.getElementById('resume-modal');
if (modal) modal.classList.add('hidden');
}
window.closeResumeModal = closeResumeModal;

function renderAnalytics(){
if (!vCandidate || !vRoleMeta) return;
if (!window.XAnalytics) { console.error('XAnalytics missing. Check script order.'); return; }

const mh = XAnalytics.computeMustHaveCoverage(vCandidate.skills, vRoleMeta.mustHave);
XAnalytics.renderMustHaveBadges('musthave-badges', vRoleMeta.mustHave, vCandidate.skills);

const seniorityMatch = vRoleMeta.seniority ? ((vCandidate.seniority||'').toLowerCase() === vRoleMeta.seniority.toLowerCase() ? 1 : 0.6) : 1;
const extrasPct = Math.min(100, (vCandidate.strengths||[]).length * 15);
const fit = XAnalytics.computeFitScore({ mustHavePct: mh.pct, seniorityMatch, extrasPct });
XAnalytics.animateGaugeTo(fit);

const labels = (vRoleMeta.mustHave||[]).map(function(x){ return String(x).split(' '); });
const values = labels.map(function(lbl){
const has = (vCandidate.skills||[]).some(function(s){ return String(s).toLowerCase().includes(lbl.toLowerCase()); });
return has ? 5 : 2;
});
XAnalytics.renderSkillRadar('skill-radar', labels, values);

if (XAnalytics.renderNiceBar) {
const niceList = (vRoleMeta.niceToHave || []);
const niceVals = niceList.map(function(n){
const has = (vCandidate.skills || []).some(function(s){ return String(s).toLowerCase().includes(String(n).toLowerCase().replace(/[()]/g,'')); });
return has ? 100 : 30;
});
XAnalytics.renderNiceBar('nice-bar', niceList, niceVals);
}
}

function shortlistFromViewer(){
const txtEl = document.getElementById('viewer-justif');
const txt = (txtEl && txtEl.value ? txtEl.value : '').trim();
if (txt.length < 15){ UI.toast('Please enter at least 15 characters.'); return; }
const session = XState.getSession() || { team:'Team 1', dept:vDept };
const state = XState.getDeptState(session.team, vDept);
state.selections[vRoleId] = { candidateId: vCandidate.id, justification: txt, savedAt: Date.now() };
localStorage.setItem('ximhaa.progress.' + session.team + '.' + vDept, JSON.stringify(state));
UI.toast('Selection saved from viewer.');
}


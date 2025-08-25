let vDept, vRoleId, vCandId, vRoleMeta = null, vCandidate = null;

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

// Populate role switch dropdown
try {
const allRoles = await XData.getRolesByDept(vDept);
populateRoleSwitchViewer(allRoles);
} catch(e) {
console.warn('Roles by dept failed:', e);
}

// Load candidates and pick target
const list = await XData.getCandidatesByRole(vRoleId);
vCandidate = Array.isArray(list) ? (list.find(function(c){ return c.id === vCandId; }) || list) : null;

renderResume();
renderAnalytics();
})();

function populateRoleSwitchViewer(roles){
const sel = document.getElementById('role-switch-viewer');
if (!sel) return;
sel.innerHTML = (roles || []).map(function(r){
return '<option value="'+r.id+'"' + (r.id===vRoleId?' selected':'') + '>' + r.title + '</option>';
}).join('');
sel.onchange = function(){
const newRole = sel.value;
window.location.href = 'role.html?dept=' + encodeURIComponent(vDept) + '&role=' + encodeURIComponent(newRole);
};
}

function renderResume(){
const stage = document.getElementById('resume-stage');
const pane = document.getElementById('resume-pane');
if (!stage || !pane || !vCandidate) return;

// Extract trailing number from id; clamp to 1..5
let num = 1;
const m = String(vCandidate.id || '').match(/(\d{1,2})$/);
if (m) {
const n = parseInt(m, 10);
if (n >= 1 && n <= 5) num = n;
}
const folder = String(vRoleId || '').trim();
const resumePath = 'resumes/' + folder + '/resume' + num + '.jpg';

pane.innerHTML = '<img class="resume-img" id="resume-img" src="' + resumePath + '" alt="Resume">';
const img = document.getElementById('resume-img');
img.onload = function(){ stage.classList.add('loaded'); };
img.onerror = function(){
console.warn('Resume image not found:', resumePath);
this.src = 'resumes/placeholder.jpg';
stage.classList.add('loaded');
};
}

function renderAnalytics(){
if (!vCandidate || !vRoleMeta) return;

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

function backToRole(){
window.location.href = 'role.html?dept=' + encodeURIComponent(vDept) + '&role=' + encodeURIComponent(vRoleId);
}

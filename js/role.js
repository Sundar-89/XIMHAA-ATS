let dept, roleId, roleMeta = null, candidates = [];

(async function initRole(){
const q = new URLSearchParams(location.search);
dept = q.get('dept') || 'finance';
roleId = q.get('role');

// Load role metadata
const roles = await XData.getRoles();
roleMeta = roles.find(r => r.id === roleId);
const titleEl = document.getElementById('role-title');
titleEl.textContent = roleMeta ? roleMeta.title : 'Role';

// Load candidates for this role
candidates = await XData.getCandidatesByRole(roleId);
renderCandidates();

// Start a soft timer (default 210s = 3.5 min). Change as needed.
XTimer.startTimer(210,
(t) => { const el = document.getElementById('timer'); if (el) el.textContent = 'Time left: ' + t + 's'; },
() => { softLock(); }
);
})();

function renderCandidates(){
const grid = document.getElementById('cand-grid');
if (!candidates || candidates.length === 0) {
grid.innerHTML = '<div class="card">No candidates configured for this role.</div>';
return;
}

const cards = candidates.map(c => {
const skills = (c.skills || []).slice(0, 6).map(s=>'<span class="tag">'+s+'</span>').join('');
const strengths = (c.strengths || []).slice(0, 4).map(s=>'<span class="tag neutral">'+s+'</span>').join('');
return <div class="cand-card"> <div class="cand-head"> <h3>${c.name}</h3> <span class="pill ${c.seniority==='Senior'?'senior':'junior'}">${c.seniority || ''}</span> </div> <p class="summary">${c.summary || ''}</p> <div class="tags">${skills}</div> <div class="tags">${strengths}</div> <div class="actions"> <button class="nb-btn" onclick="openCandidate('${c.id}')">View</button> <button class="nb-btn-outline" onclick="promptSelect('${c.id}')">Select</button> </div> </div> ;
}).join('');

grid.innerHTML = cards;
}

function openCandidate(id){
const url = 'viewer.html?dept=' + encodeURIComponent(dept) +
'&role=' + encodeURIComponent(roleId) +
'&candidate=' + encodeURIComponent(id);
window.location.href = url;
}

function promptSelect(id){
// Quick select without opening modal (asks prompt for justification)
const justif = prompt('Enter justification (min 15 chars):') || '';
if (justif.trim().length < 15) {
UI.toast('Please enter at least 15 characters.');
return;
}
saveSelection(id, justif.trim());
}

function confirmSelect(id){
const txt = document.getElementById('justif') ? document.getElementById('justif').value.trim() : '';
if (txt.length < 15) {
UI.toast('Please enter at least 15 characters.');
return;
}
saveSelection(id, txt);
UI.hideModal('cand-modal');
}

function saveSelection(candidateId, justification){
const session = XState.getSession() || { team:'Team 1', dept:dept };
const state = XState.getDeptState(session.team, dept);
// Enforce one selection per role
state.selections[roleId] = { candidateId, justification, savedAt: Date.now() };
localStorage.setItem('ximhaa.progress.' + session.team + '.' + dept, JSON.stringify(state));
UI.toast('Selection saved.');
}

function softLock(){
// Make all action buttons read-only when time’s up
document.querySelectorAll('.actions button').forEach(b => { b.disabled = true; b.style.opacity = .7; });
document.getElementById('timer').textContent = 'Time is up';

}


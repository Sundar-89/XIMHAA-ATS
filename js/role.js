let dept, roleId, roleMeta = null, candidates = [];

(async function initRole(){
const q = new URLSearchParams(location.search);
dept = q.get('dept') || 'finance';
roleId = q.get('role');

const roles = await XData.getRoles();
roleMeta = roles.find(r => r.id === roleId);

const titleEl = document.getElementById('role-title');
titleEl.textContent = roleMeta ? roleMeta.title : 'Role';

// ADD: populate role switch
const allRoles = await XData.getRolesByDept(dept);
populateRoleSwitch(allRoles);

candidates = await XData.getCandidatesByRole(roleId);
renderCandidates();
})();

function populateRoleSwitch(roles){
const sel = document.getElementById('role-switch');
if (!sel) return;
sel.innerHTML = roles.map(r => '<option value="'+r.id+'"' + (r.id===roleId?' selected':'') + '>' + r.title + '</option>').join('');
sel.onchange = function(){
const newRole = sel.value;
window.location.href = 'role.html?dept=' + encodeURIComponent(dept) + '&role=' + encodeURIComponent(newRole);
};
}

function renderCandidates(){
const grid = document.getElementById('cand-grid');
if (!grid) return;

if (!candidates || candidates.length === 0) {
grid.innerHTML = '<div class="card">No candidates configured for this role.</div>';
return;
}

let html = '';
for (let i = 0; i < candidates.length; i++) {
const c = candidates[i];
const skills = (c.skills || []).slice(0, 6).map(s => '<span class="tag">' + s + '</span>').join('');
const strengths = (c.strengths || []).slice(0, 4).map(s => '<span class="tag neutral">' + s + '</span>').join('');
const seniorClass = (c.seniority === 'Senior') ? 'senior' : 'junior';
html += '<div class="cand-card" data-id="' + c.id + '">' +
  '<div class="cand-head">' +
    '<h3>' + c.name + '</h3>' +
    '<span class="pill ' + seniorClass + '">' + (c.seniority || '') + '</span>' +
  '</div>' +
  '<p class="summary">' + (c.summary || '') + '</p>' +
  '<div class="tags">' + skills + '</div>' +
  '<div class="tags">' + strengths + '</div>' +
  '<div class="actions">' +
    '<button class="nb-btn js-view" data-id="' + c.id + '">View</button>' +
    '<button class="nb-btn-outline js-select" data-id="' + c.id + '">Select</button>' +
  '</div>' +
'</div>';
}

grid.innerHTML = html;

grid.addEventListener('click', function(e){
const btn = e.target.closest('button');
if (!btn) return;
const id = btn.getAttribute('data-id');
if (!id) return;
if (btn.classList.contains('js-view')) {
openCandidate(id);
} else if (btn.classList.contains('js-select')) {
promptSelect(id);
}
});
}

function openCandidate(id){
const url = 'viewer.html?dept=' + encodeURIComponent(dept) +
'&role=' + encodeURIComponent(roleId) +
'&candidate=' + encodeURIComponent(id);
window.location.assign(url);
}

function promptSelect(id){
const justif = prompt('Enter justification (min 15 chars):') || '';
if (justif.trim().length < 15) {
UI.toast('Please enter at least 15 characters.');
return;
}
saveSelection(id, justif.trim());
}

function saveSelection(candidateId, justification){
const session = XState.getSession() || { team:'Team 1', dept:dept };
const state = XState.getDeptState(session.team, dept);
state.selections[roleId] = { candidateId, justification, savedAt: Date.now() };
localStorage.setItem('ximhaa.progress.' + session.team + '.' + dept, JSON.stringify(state));
UI.toast('Selection saved.');
}

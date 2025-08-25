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
  vRoleMeta = roles.find(r => r.id === vRoleId);

  // Load candidates and select target
  const list = await XData.getCandidatesByRole(vRoleId);
  vCandidate = list.find(c => c.id === vCandId) || list[0];

  renderResume();
  renderAnalytics();
})();

function renderResume(){
const stage = document.getElementById('resume-stage');
const pane = document.getElementById('resume-pane');
if (!stage || !pane || !vCandidate) return;

// Map FIN-MGR-01 -> resume1.jpg, FIN-MGR-02 -> resume2.jpg, etc.
const index2 = String(vCandidate.id || '').slice(-2); // '01'...'05'
const num = parseInt(index2, 10) || 1;
const resumePath = 'resumes/' + vRoleId + '/resume' + num + '.jpg';

pane.innerHTML = '<img class="resume-img" id="resume-img" src="' + resumePath + '" alt="Resume">';
const img = document.getElementById('resume-img');
img.onload = function(){ stage.classList.add('loaded'); };
img.onerror = function(){ this.src = 'resumes/placeholder.jpg'; stage.classList.add('loaded'); };
}

function renderAnalytics(){
  if (!vCandidate || !vRoleMeta) return;

  const mh = XAnalytics.computeMustHaveCoverage(vCandidate.skills, vRoleMeta.mustHave);
  XAnalytics.renderMustHaveBadges('musthave-badges', vRoleMeta.mustHave, vCandidate.skills);

  const seniorityMatch = vRoleMeta.seniority ? 
    ((vCandidate.seniority || '').toLowerCase() === vRoleMeta.seniority.toLowerCase() ? 1 : 0.6) : 1;
  const extrasPct = Math.min(100, (vCandidate.strengths || []).length * 15);

  const fit = XAnalytics.computeFitScore({ mustHavePct: mh.pct, seniorityMatch, extrasPct });
  XAnalytics.animateGaugeTo(fit);

  const labels = (vRoleMeta.mustHave || []).map(x => x.split(' ')[0]);
  const values = labels.map(lbl => {
    const has = (vCandidate.skills || []).some(s => s.toLowerCase().includes(lbl.toLowerCase()));
    return has ? 5 : 2;
  });
  XAnalytics.renderSkillRadar('skill-radar', labels, values);
  
  const niceList = (vRoleMeta.niceToHave || []);
  const niceVals = niceList.map(n => {
	const has = (vCandidate.skills || []).some(s => s.toLowerCase().includes(n.toLowerCase().replace(/[()]/g,'')));
	return has ? 100 : 30;
  });
  XAnalytics.renderNiceBar('nice-bar', niceList, niceVals);
  const allRoles = await XData.getRolesByDept(vDept);
  populateRoleSwitchViewer(allRoles);
}

function populateRoleSwitchViewer(roles){
const sel = document.getElementById('role-switch-viewer');
if (!sel) return;
sel.innerHTML = roles.map(r => '<option value="'+r.id+'"' + (r.id===vRoleId?' selected':'') + '>' + r.title + '</option>').join('');
sel.onchange = function(){
const newRole = sel.value;
window.location.href = 'role.html?dept=' + encodeURIComponent(vDept) + '&role=' + encodeURIComponent(newRole);
};
}

function shortlistFromViewer(){
  const txt = (document.getElementById('viewer-justif')?.value || '').trim();
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

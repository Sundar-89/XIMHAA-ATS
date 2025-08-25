(function initDashboard(){
const session = (window.XState && XState.getSession) ? XState.getSession() : { user:'User', team:'Team 1' };
const slot = document.getElementById('user-slot');
if (slot) {
const deptLabel = session.dept ? session.dept.toUpperCase() : 'NO DEPARTMENT SELECTED';
slot.textContent = (session.user || 'User') + ' - ' + (session.team || 'Team 1') + ' - ' + deptLabel;
}
console.log('dashboard.js loaded');
})();

window.chooseDept = function(dept){
try {
if (!window.XState) throw new Error('XState not loaded');
const session = XState.getSession() || { team:'Team 1' };
session.dept = dept;
XState.setSession(session);
const key = 'ximhaa.progress.' + session.team + '.' + dept;
if (!localStorage.getItem(key)) {
  localStorage.setItem(key, JSON.stringify({ selections:{}, locked:false }));
}
window.location.href = 'department.html?dept=' + encodeURIComponent(dept);
} catch (e) {
console.error('chooseDept error:', e);
alert('Failed to choose department. Open console.');
}
};

window.logout = function(){
if (window.XState) XState.clearSession();
window.location.href = 'login.html';
};


(function initDashboard(){
const session = (window.XState && XState.getSession) ? XState.getSession() : null;
const slot = document.getElementById('user-slot');
if (slot && session) {
const deptLabel = session.dept ? session.dept.toUpperCase() : 'NO DEPARTMENT SELECTED';
// Either of the following lines is fine. Using concatenation to be safest:
slot.textContent = session.user + ' - ' + session.team + ' - ' + deptLabel;
// Or use template literal (requires backticks):
// slot.textContent = ${session.user} - ${session.team} - ${deptLabel};
}
console.log('dashboard.js loaded');
})();

window.chooseDept = function(dept){
try {
if (!window.XState) { throw new Error('XState not loaded'); }
const session = XState.getSession() || {};
session.dept = dept;
XState.setSession(session);
const key = 'ximhaa.progress.' + session.team + '.' + dept;
if (!localStorage.getItem(key)) {
  localStorage.setItem(key, JSON.stringify({ selections:{}, locked:false }));
}
window.location.href = 'department.html?dept=' + encodeURIComponent(dept);
} catch (e) {
console.error('chooseDept error:', e);
alert('Failed to choose department. Check console.');
}
};

window.logout = function(){
if (window.XState) { XState.clearSession(); }
window.location.href = 'login.html';
};
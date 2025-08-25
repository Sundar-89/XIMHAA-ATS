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
(function drawDashCharts(){
const deptEl = document.getElementById('dept-cands');
const trendEl = document.getElementById('roles-trend');
if (deptEl && window.Chart){
new Chart(deptEl, {
type:'bar',
data:{ labels:['Finance','Marketing','Operations'],
datasets:[{ data:, backgroundColor:['#eead0e','#0affff','#00ff41'] }] },
options:{ plugins:{legend:{display:false}}, scales:{ x:{ ticks:{color:'#cfd3e1'}}, y:{ ticks:{color:'#cfd3e1'}}}}
});
}
if (trendEl && window.Chart){
const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const vals = ;
new Chart(trendEl, {
type:'line',
data:{ labels, datasets:[{ data:vals, borderColor:'#ffffff', backgroundColor:'rgba(255,255,255,.08)', fill:true, tension:.3 }] },
options:{ plugins:{legend:{display:false}}, scales:{ x:{ ticks:{color:'#cfd3e1'}}, y:{ ticks:{color:'#cfd3e1'}}}}
});
}
})();

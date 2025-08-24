(async function initDepartment(){
const params = new URLSearchParams(location.search);
const dept = params.get('dept') || 'finance';

// Title
const titleEl = document.getElementById('dept-title');
titleEl.textContent = dept.toUpperCase() + ' - Roles';
// Or use template literal:
// titleEl.textContent = ${dept.toUpperCase()} - Roles;

// Load roles
try {
const roles = await XData.getRolesByDept(dept);
const grid = document.getElementById('role-grid');
if (!roles || roles.length === 0) {
  grid.innerHTML = '<div class="card">No roles configured for ' + dept + '.</div>';
  return;
}

grid.innerHTML = roles.map(r => {
  const tags = (r.mustHave || []).slice(0,3).map(t=>'<span class="tag">'+t+'</span>').join('');
  const seniority = r.seniority || 'Mixed';
  return `
    <div class="role-card">
      <h3>${r.title}</h3>
      <div class="pill">${seniority}</div>
      <div class="tags">${tags}</div>
      <button class="nb-btn" onclick="viewRole('${dept}','${r.id}')">View Candidates</button>
    </div>
  `;
}).join('');
} catch (e) {
console.error('Failed to load roles:', e);
document.getElementById('role-grid').innerHTML = '<div class="card">Error loading roles.</div>';
}
})();

function viewRole(dept, roleId){
window.location.href = 'role.html?dept=' + encodeURIComponent(dept) + '&role=' + encodeURIComponent(roleId);
}
async function fetchJSON(path){
  const res = await fetch(path, {cache:'no-store'});
  if(!res.ok) throw new Error('Failed to load '+path);
  return res.json();
}
async function getDepartments(){ return fetchJSON('data/departments.json'); }
async function getRoles(){ return fetchJSON('data/roles.json'); }
async function getRolesByDept(dept){
  const roles = await getRoles();
  return roles.filter(r=>r.dept===dept);
}
async function getCandidatesByRole(roleId){
  return fetchJSON(`data/candidates/${roleId}.json`);
}
window.XData = { getDepartments, getRoles, getRolesByDept, getCandidatesByRole };

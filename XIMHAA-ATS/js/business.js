(function(){
document.querySelectorAll('.nb-nav a[href^="#"]').forEach(a=>{
a.addEventListener('click', (e)=>{
e.preventDefault();
const id = a.getAttribute('href');
const el = document.querySelector(id);
if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
});
});
})();
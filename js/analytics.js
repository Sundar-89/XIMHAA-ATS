function computeMustHaveCoverage(candidateSkills, mustHave){
const cset = new Set((candidateSkills||[]).map(s=>s.toLowerCase()));
const m = (mustHave||[]).map(s=>s.toLowerCase().replace(/[()]/g,''));
let hits = 0;
m.forEach(req=>{ if (Array.from(cset).some(s=>s.includes(req))) hits++; });
const pct = m.length ? Math.round((hits/m.length)*100) : 0;
return { hits, total: m.length, pct };
}

function computeFitScore({ mustHavePct=0, seniorityMatch=1, extrasPct=0 }){
const score = Math.round((mustHavePct0.7) + (seniorityMatch1000.2) + (extrasPct0.1));
return Math.max(0, Math.min(100, score));
}

function rotateNeedle(deg){
const needle = document.getElementById('fit-needle');
if (needle) needle.style.transform = 'rotate(' + deg + 'deg)';
}

function animateGaugeTo(score){
const target = Math.round((score/100)*180);
let cur = 0;
const id = setInterval(()=>{
cur += 6;
rotateNeedle(cur);
const out = document.getElementById('fit-score');
if (out) out.textContent = Math.min(score, Math.round((cur/180)*100)) + '%';
if (cur >= target){ rotateNeedle(target); clearInterval(id); }
}, 16);
}

function renderMustHaveBadges(containerId, mustHave, candidateSkills){
const el = document.getElementById(containerId);
if (!el) return;
const cset = new Set((candidateSkills||[]).map(s=>s.toLowerCase()));
el.innerHTML = (mustHave||[]).map(req=>{
const norm = req.toLowerCase().replace(/[()]/g,'');
const ok = Array.from(cset).some(s=>s.includes(norm));
return '<span class="tag" style="border-color:'+ (ok?'#7dff9c':'#ff7d7d') +'">'+ req +'</span>';
}).join('');
}

function renderSkillRadar(canvasId, labels, values){
const ctx = document.getElementById(canvasId);
if (!ctx || !window.Chart) return;
const data = {
labels,
datasets: [{
label: 'Skill Weight',
data: values,
fill: true,
backgroundColor: 'rgba(0,255,255,0.12)',
borderColor: '#00ffff',
pointBackgroundColor: '#00ffff',
pointBorderColor: '#00ffff'
}]
};
new Chart(ctx, { type:'radar', data, options: { responsive:true, plugins:{legend:{display:false}}, scales:{ r:{ angleLines:{color:'rgba(255,255,255,.1)'}, grid:{color:'rgba(255,255,255,.08)'}, pointLabels:{color:'#cfd3e1'}, suggestedMin:0, suggestedMax:5 } } } );
}

window.XAnalytics = { computeMustHaveCoverage, computeFitScore, animateGaugeTo, renderMustHaveBadges, renderSkillRadar };

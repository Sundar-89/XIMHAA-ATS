function toast(msg, ms=1800){
  let el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#111626;border:1px solid rgba(255,255,255,.12);padding:10px 14px;border-radius:10px;z-index:9999;box-shadow:0 8px 20px rgba(0,0,0,.35)';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), ms);
}
function showModal(id){ document.getElementById(id).classList.remove('hidden'); }
function hideModal(id){ document.getElementById(id).classList.add('hidden'); }
window.UI = { toast, showModal, hideModal };

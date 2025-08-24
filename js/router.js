(function(){
  const publicPages = ['index.html','login.html','',null];
  const path = location.pathname.split('/').pop();
  if (!publicPages.includes(path)) {
    const session = JSON.parse(localStorage.getItem('ximhaa.session') || 'null');
    if (!session) location.href = 'login.html';
  }
})();

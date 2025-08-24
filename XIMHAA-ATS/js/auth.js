(function(){
// Optional overrides via query: ?team=Team%20Alpha&user=alpha@nutribite.com
const params = new URLSearchParams(location.search);
const teamName = params.get('team') || 'Team 1';
const userEmail = params.get('user') || 'team@nutribite.com';

// Make function global for onclick
window.enterATS = function(){
try {
const session = {
team: teamName,
user: userEmail,
dept: null, // chosen later on dashboard
ts: Date.now()
};
if (!window.XState || !XState.setSession) {
alert('Session module not loaded. Check js/state.js path.');
return;
}
XState.setSession(session);
// Navigate
window.location.href = 'dashboard.html';
} catch (e) {
console.error('Login error:', e);
alert('Login failed to initialize. Open console for details.');
}
};
})();
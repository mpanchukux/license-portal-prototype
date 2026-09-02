/* ============================================================================
   page-users.js — the user TABLE, and nothing else.
   ⚠️ Add / delete / log-in-as moved to shared.js when Users became a nested level
   in the profile menu: that menu is on every page, so its buttons cannot depend on
   a script that only users.html loads. They call refreshUsersSurfaces(), which
   updates whichever surfaces are actually mounted.
   ============================================================================ */

function renderUsersPage(){
  var b = $('#usersView tbody'); if(!b) return;
  var us = DATA().users.slice().sort(function(a, c){ return dateKey(c.created) - dateKey(a.created); });
  b.innerHTML = us.map(userRow).join('');
  var r = $('#usersView .pager .range');
  if(r) r.textContent = '1–' + us.length + ' of ' + us.length;
}
renderUsersPage();

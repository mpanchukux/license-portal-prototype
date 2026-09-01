/* ============================================================================
   page-users.js — the user table plus the three things you can do to a user:
   add one (modal), delete one (type-nothing confirm, but it names the email),
   and log in as them (impersonation banner, which persists across pages).
   Every change writes through Store.
   ============================================================================ */

function renderUsersPage(){
  var b = $('#usersView tbody'); if(!b) return;
  var us = DATA().users.slice().sort(function(a, c){ return dateKey(c.created) - dateKey(a.created); });
  b.innerHTML = us.map(userRow).join('');
  var r = $('#usersView .pager .range');
  if(r) r.textContent = '1–' + us.length + ' of ' + us.length;
}
renderUsersPage();

function openDeleteUser(email){
  openModal('Delete user', '<p>Delete <b>' + email + '</b>? They will lose access to this portal.</p>');
  var foot = $('#overlay .mf');
  var del = document.createElement('button');
  del.type = 'button'; del.className = 'btn ter'; del.id = 'delUserBtn'; del.textContent = 'Delete';
  foot.appendChild(del);
  $('#modalCloseBtn').textContent = 'Cancel';
  del.addEventListener('click', function(){
    storeDeleteUser(email);      // removed from every dataset, and persisted
    renderUsersPage();
    closeModal();
  });
  $('#modalCloseBtn').focus();
}
function impersonate(email){
  Store.set('impersonating', email);   // survives navigation
  $('#impEmail').textContent = email;
  $('#impBanner').hidden = false;
  document.body.classList.add('impersonating');
  /* An impersonation session is the one action here that most needs a trail:
     everything done inside it happens under someone else's name. Both ends are
     logged (see the Return handler in shared.js) — a start without an end leaves
     "how long did this last" unanswered. */
  logActivity({ kind:'user', entityType:'Session', entityName:email, action:'LOGIN_AS',
    txt:'Session was started as <b>' + esc(email) + '</b> by ' + PORTAL_ACTOR + '.' });
}
function openLoginAs(email){
  openModal('Log in as', '<p>Log in as <b>' + email + '</b>? You will see and manage the portal on their behalf until you return to your own account.</p>');
  var foot = $('#overlay .mf');
  var go = document.createElement('button');
  go.type = 'button'; go.className = 'btn'; go.id = 'loginAsBtn'; go.textContent = 'Log in';
  foot.appendChild(go);
  $('#modalCloseBtn').textContent = 'Cancel';
  go.addEventListener('click', function(){ impersonate(email); closeModal(); });
  $('#modalCloseBtn').focus();
}

document.addEventListener('click', function(e){
  var du = e.target.closest('[data-deluser]');
  if(du){ openDeleteUser(du.getAttribute('data-deluser')); return; }
  var la = e.target.closest('[data-loginas]');
  if(la){ openLoginAs(la.getAttribute('data-loginas')); return; }
});

/* ---------- add user ---------- */
(function(){
  var ov = $('#addUserOverlay'); if(!ov) return;
  var email = $('#auEmail'), addBtn = $('#auAdd');
  var auSeq = 1;
  function valid(){ return /.+@.+\..+/.test(email.value.trim()); }
  function refresh(){ addBtn.disabled = !valid(); }
  function showStep(n){
    $('#auStep1').hidden = n !== 1; $('#auFoot1').hidden = n !== 1;
    $('#auStep2').hidden = n !== 2; $('#auFoot2').hidden = n !== 2;
  }
  function open(){
    email.value = ''; $('#auFirst').value = ''; $('#auLast').value = ''; $('#auDesc').value = ''; $('#auMethod').value = 'link';
    refresh(); showStep(1); ov.hidden = false; email.focus();
  }
  function close(){ ov.hidden = true; }
  var trigger = $('#addUserBtn');
  if(trigger) trigger.addEventListener('click', open);
  email.addEventListener('input', refresh);
  $('#auClose').addEventListener('click', close);
  $('#auCancel').addEventListener('click', close);
  $('#auDone').addEventListener('click', close);
  ov.addEventListener('click', function(e){ if(e.target === ov) close(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !ov.hidden) close(); });
  addBtn.addEventListener('click', function(){
    if(addBtn.disabled) return;
    var em = email.value.trim();
    var name = ($('#auFirst').value.trim() + ' ' + $('#auLast').value.trim()).trim() || em;
    storeAddUser({ name:name, email:em, created:'Aug 19 2026' });   // persisted
    renderUsersPage();
    if($('#auMethod').value === 'link'){
      $('#auStep2').innerHTML = '<p class="nl-success-p" style="margin:0">Share this activation link with the user:</p>'
        + '<div class="nl-keybox" style="margin-top:2px"><code id="auLink">https://portal.thingsboard.io/activate?token=au-' + (1000 + auSeq++) + '-9f2c</code>'
        + '<button class="iconbtn ib tip" id="auCopy" data-tip="Copy" aria-label="Copy activation link"><svg class="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg></button></div>';
    } else {
      $('#auStep2').innerHTML = '<p class="nl-success-p" style="margin:0">Activation email sent to <b>' + em + '</b>.</p>';
    }
    showStep(2);
    $('#auDone').focus();
  });
  ov.addEventListener('click', function(e){
    var c = e.target.closest('#auCopy'); if(!c) return;
    var flash = function(){
      c.setAttribute('data-tip', 'Copied'); c.classList.add('show', 'copied');
      setTimeout(function(){ c.classList.remove('show', 'copied'); c.setAttribute('data-tip', 'Copy'); }, 1200);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText($('#auLink').textContent).then(flash, flash); } else { flash(); }
  });
})();
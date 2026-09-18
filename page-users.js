/* ============================================================================
   page-users.js — the Users page: two states, and the invite row that moves
   between them.
   ============================================================================
   SOLO (one user — you) and TABLE (two or more) are not two designs; they are the
   same page with the table taken away when it has nothing to say. The invite row
   is the constant: same markup, same controller, same position above whatever is
   below it. That is why inviting is not a modal any more — a list you can only add
   to from behind a screen hides its own next step.

   ⚠️ Every user-management action lives here now: `Log in as` and Delete are the
   two most destructive actions in the portal, and they used to sit one hover away
   inside a profile submenu that did not exist on touch. The handlers themselves are
   delegated from `document` in shared.js, so the rows need no wiring.
   ============================================================================ */

/* ---------- which state ---------- */
function usersSolo(){ return (DATA().users || []).length < 2; }

function renderUsersPage(){
  var solo = usersSolo();
  var soloV = $('#usersSolo'), tblV = $('#usersTable');
  if(soloV) soloV.hidden = !solo;
  if(tblV)  tblV.hidden  = solo;
  if(solo) return;                       // nothing below this exists in solo state

  var b = $('#usersTable tbody'); if(!b) return;
  var us = DATA().users.slice().sort(function(a, c){ return dateKey(c.created) - dateKey(a.created); });
  b.innerHTML = us.map(userRow).join('');
  var r = $('#usersTable .pager .range');
  if(r) r.textContent = '1–' + us.length + ' of ' + us.length;
}

/* ---------- the invite row, in both states ----------------------------------
   One controller, two mounts. The ids differ because the two states are two nodes
   in the page (hiding one and showing the other is what a state IS here), but
   every behaviour below is written once and bound to both.
   --------------------------------------------------------------------------- */
(function(){
  /* the same loose test the sign-up field uses: the prototype has no address book
     to check against, so "could this be an address" is as far as it can honestly go */
  var EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

  var MOUNTS = [
    { row:'#soloInvite', input:'#soloEmail', msg:'#soloMsg' },
    { row:'#tblInvite',  input:'#tblEmail',  msg:'#tblMsg'  }
  ];

  function parse(v){
    var seen = {}, bad = [], ok = [];
    v.split(/[,;\s]+/).forEach(function(raw){
      var e = raw.trim(); if(!e) return;
      if(!EMAIL_RE.test(e)){ bad.push(e); return; }
      if(seen[e.toLowerCase()]) return;              // typed twice is asked once
      seen[e.toLowerCase()] = 1; ok.push(e);
    });
    return { ok:ok, bad:bad };
  }
  /* Duplicate detection is against who ALREADY HAS ACCESS, not against who has been
     invited: an outstanding invitation is not access, and telling someone their
     colleague "already has access" because a link is in flight would be false. */
  function hasAccess(email){
    return (DATA().users || []).some(function(u){ return u.email.toLowerCase() === email.toLowerCase(); });
  }

  /* ⚠️ The slot never leaves the layout — `visibility`, not `hidden` — so showing or
     clearing a message cannot change the card's height. It carries PROBLEMS only now;
     confirmations went to the snackbar, which is outside the layout entirely. */
  function say(m, html){
    var el = $(m.msg); if(!el) return;
    el.innerHTML = html || '';
    el.classList.toggle('on', !!html);
  }

  /* ⚠️ `nameFromEmail` is gone. It derived a display name from the address so an
     invited person could render as an ordinary row; invited rows now show no name at
     all, which is the honest thing — nobody has told us one yet. */

  function invite(m){
    var input = $(m.input), p = parse(input.value);
    if(!p.ok.length && !p.bad.length){ say(m, null); return; }

    var dupes = p.ok.filter(hasAccess), fresh = p.ok.filter(function(e){ return !hasAccess(e); });
    if(!fresh.length){
      /* Inline, beside the field, before anything is sent — and kept to ONE line,
         because the slot that holds it is one line tall by design (see `say`). Two
         names are worth printing; five are a count. */
      say(m, dupesText(dupes));
      return;
    }

    fresh.forEach(function(em){
      mintInvite(em);                                     // single-use token, 7-day expiry
      /* ⚠️ The invited person becomes an ORDINARY ROW straight away. This reverses
         the earlier "an invitation is not access" rule, which kept them out of the
         list until they signed up — the table is asked to carry no pending state,
         so a row that appears only later would make Invite look like it did nothing. */
      /* ⚠️ `pending:true` and NO name. This supersedes the earlier "invited users are
         ordinary rows" rule: an invitation is not a person yet — there is no name, no
         join date, and nothing anyone should be able to do to them. The row says the
         one true thing (this address was invited) and waits. */
      storeAddUser({ email:em, pending:true, created:todayStr() });
    });
    refreshUsersSurfaces();

    input.value = '';
    /* ⚠️ The confirmation is a SNACKBAR now, not a line under the field. It reports a
       finished event whose result is already on screen — the new rows in the table —
       so it has no reason to stay, and no reason to occupy the card's height. It also
       no longer has to chase which mount is visible: crossing 1 → 2 users swaps the
       node on screen, and a message outside the layout does not care. */
    var sent = fresh.length === 1
      ? 'Invitation sent to ' + fresh[0]
      : 'Invitations sent to ' + fresh.length + ' people';
    Snack.show(sent + (dupes.length ? ' · ' + dupesPhrase(dupes) + ' already had access' : ''));
    /* whatever was not an address stays in the field, and the reason stays with it */
    if(p.bad.length){ input.value = p.bad.join(' '); say(m, badText(p.bad)); }
    else say(m, null);
  }
  /* one line, always — the slot reserved for it is one line tall */
  function dupesText(d){
    return d.length === 1
      ? '<b>' + esc(d[0]) + '</b> already has access.'
      : '<b>' + d.length + ' of these</b> already have access.';
  }
  function dupesPhrase(d){ return d.length === 1 ? d[0] : d.length; }
  function badText(b){
    return b.length === 1
      ? '<b>' + esc(b[0]) + '</b> is not an email address.'
      : '<b>' + b.length + ' entries</b> are not email addresses.';
  }

  /* ---- Copy invite link: one click, and that is the whole interaction ----------
     ⚠️ REVERSES the 2026-09-17 pass, which revealed the URL in a monospace block with
     "Single use · expires in 7 days · revocable" and a Revoke action beside it. None
     of that is surfaced any more: the link goes to the clipboard, the snackbar says so,
     and the lifecycle stays where a lifecycle belongs — behind the token.

     ⚠️ The MECHANISM is untouched. `mintInvite(null)` still writes a single-use record
     with a 7-day expiry, `inviteByToken` still refuses a spent, revoked or expired one,
     and the recipient still lands on sign-up with the email step. `updateInvite` — the
     revoke writer — now has no caller in the UI; it is kept because the record it edits
     is still real and a server would still use it. */
  function copyLink(m){
    var rec = mintInvite(null);                           // no address: an open single-use door
    var url = inviteURL(rec.token);
    var done = function(){ Snack.show('Invite link copied'); };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(done, done);
    } else { done(); }
    logActivity({ kind:'user', entityType:'Invitation', entityName:rec.token, action:'LINK_CREATED',
      txt:'A single-use invite link was created by ' + portalActor() + '.' });
  }

  MOUNTS.forEach(function(m){
    var row = $(m.row); if(!row) return;
    var input = $(m.input);
    row.addEventListener('click', function(e){
      if(e.target.closest('[data-invite]')){ invite(m); return; }
      if(e.target.closest('[data-invitelink]')){ copyLink(m); return; }
    });
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); invite(m); }
    });
    // typing again clears the previous answer: a stale "already has access" beside
    // a field you are editing is answering a question you stopped asking
    input.addEventListener('input', function(){ say(m, null); });

  });
})();

renderUsersPage();

/* ---------- search: name and email. Table state only — the solo state has one
     person and no toolbar to search from. ---------------------------------- */
wireSearch('#usersTable .searchbox input', {
  items: function(){ return $$('#usersTable tbody tr'); },
  text:  function(tr){ return stripText(tr.innerHTML); },
  host:  function(){ return $('#usersTable tbody'); },
  empty: function(q){ return '<tr><td colspan="4" class="noresults-cell">'
                            + noResultsHTML(q) + '</td></tr>'; }
});

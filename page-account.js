/* ============================================================================
   page-account.js — Account (profile + company). Two things beyond the form:
   the sticky page-level Save with its leave-guard, and the verify-then-switch
   email change, whose pending state is kept in the store so the dev action in
   the settings panel can confirm it from anywhere.
   ============================================================================ */

/* ---------- email change ---------- */
var EMAIL = (function(){
  var input = $('#profEmail'), pend = $('#emailPending'), txt = $('#emailPendingTxt');
  var help = $('#emailHelp');
  if(!input) return {};
  var stored = Store.get('pendingEmail');
  var confirmed = Store.get('emailConfirmed');
  if(confirmed){ input.value = confirmed; Store.set('emailConfirmed', null); }
  var current = input.value, pendingTo = stored ? stored.to : null, resendTimer = null;
  var VALID = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  function render(msg){
    input.value = current;
    if(pend) pend.hidden = !pendingTo;
    // the pending line explains the state on its own — the helper would repeat it
    if(help) help.hidden = !!pendingTo;
    if(txt && pendingTo) txt.textContent = msg || ('Pending: ' + pendingTo);
    var dev = $('#devConfirmEmail'); if(dev) dev.disabled = !pendingTo;
  }
  function onSave(){
    var v = input.value.trim();
    if(v && v !== current && VALID.test(v)){
      pendingTo = v;
      Store.set('pendingEmail', { from: current, to: v });   // the settings panel can confirm it later
    }
    render();   // the field always reverts to the address that is actually active
  }
  function confirm(){ if(!pendingTo) return; current = pendingTo; pendingTo = null; Store.set('pendingEmail', null); input.value = current; render(); }
  function cancel(){ pendingTo = null; Store.set('pendingEmail', null); render(); }
  function resend(){
    if(!pendingTo) return;
    render('Re-sent to ' + pendingTo + '…');
    clearTimeout(resendTimer);
    resendTimer = setTimeout(function(){ render(); }, 1600);
  }
  if(txt) txt.addEventListener('click', confirm);
  var rs = $('#emailResend'); if(rs) rs.addEventListener('click', resend);
  var cn = $('#emailCancel'); if(cn) cn.addEventListener('click', cancel);
  var dev = $('#devConfirmEmail'); if(dev) dev.addEventListener('click', confirm);
  render();
  return { onSave:onSave, confirm:confirm };
})();
var profSaveBtn = $('#profSaveBtn');
if(profSaveBtn) profSaveBtn.addEventListener('click', function(){ if(EMAIL.onSave) EMAIL.onSave(); });
wirePageSave('#profileView', '#profSaveBtn', null);   // no saved-note on Account by design
guardLinks();


/* Delete account — the page stays calm; this dialog carries the friction. */
function openDeleteConfirm(){
  openModal('Delete account',
    '<p>This permanently removes your profile and your access to this portal. '
    + 'Active licenses and billing history are not affected.</p>'
    + '<div class="field" style="margin-top:14px"><label for="delConfirm">Type <b>DELETE</b> to confirm</label>'
    + '<input id="delConfirm" type="text" autocomplete="off" placeholder="DELETE"></div>');
  $('#modalCloseBtn').textContent = 'Cancel';
  var foot = $('#overlay .mf');
  var del = document.createElement('button');
  del.type = 'button'; del.className = 'btn'; del.id = 'delConfirmBtn';
  del.textContent = 'Delete account'; del.disabled = true;
  foot.appendChild(del);
  var inp = $('#delConfirm');
  inp.addEventListener('input', function(){ del.disabled = inp.value.trim() !== 'DELETE'; });
  del.addEventListener('click', function(){ if(!del.disabled) closeModal(); }); // stub: no real deletion
  inp.focus();
}

var deleteAcctBtn = $('#deleteAcctBtn');
if(deleteAcctBtn) deleteAcctBtn.addEventListener('click', openDeleteConfirm);

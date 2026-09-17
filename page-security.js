/* ============================================================================
   page-security.js — the inner Account page: change password.
   ============================================================================
   ⚠️ NO PASSWORD IS EVER STORED. Not the current one, not the new one, not a hash —
   this is a prototype in localStorage, and the only honest amount to keep is none.
   What IS stored is the DATE it last changed, which is the part a security page
   should show anyway: it survives a reload, it is useful, and it gives away nothing.

   The form still validates, because refusing "new" and "confirm" that disagree is the
   one thing this page can check without an account behind it.
   ============================================================================ */

var SEC_MIN = 8;
var SEC_RULES = {
  current: function(v){ return v ? null : 'Enter your current password.'; },
  next:    function(v){
    if(!v) return 'Enter a new password.';
    if(v.length < SEC_MIN) return 'Use at least ' + SEC_MIN + ' characters — this has ' + v.length + '.';
    return null;
  },
  confirm: function(v){
    if(!v) return 'Repeat the new password.';
    return v === $('#sec-next').value ? null : 'This does not match the new password above.';
  }
};
function secPaint(k, msg){
  var slot = $('[data-secerr="' + k + '"]');
  if(slot){ slot.textContent = msg || ''; slot.hidden = !msg; }
  var f = $('#sec-' + k); f = f && f.closest('.field');
  if(f) f.classList.toggle('err', !!msg);
}
function secBad(){
  return Object.keys(SEC_RULES).filter(function(k){ return !!SEC_RULES[k]($('#sec-' + k).value); });
}
/* Same contract as the billing step: the primary is never disabled, so a rejected
   click answers — every failure at once, cursor in the first. */
function secValidate(){
  var bad = secBad();
  Object.keys(SEC_RULES).forEach(function(k){ secPaint(k, SEC_RULES[k]($('#sec-' + k).value)); });
  if(bad.length){
    var first = $('#sec-' + bad[0]);
    if(first){ first.focus(); if(first.scrollIntoView) first.scrollIntoView({ block:'center' }); }
    return false;
  }
  return true;
}
/* the one line this page keeps, and the one it can keep honestly */
function renderLastChanged(){
  var host = $('#secLastChanged'); if(!host) return;
  var when = Store.get('passwordChangedAt');
  host.textContent = when ? 'Last changed ' + fmtDate(when) : 'This password has not been changed yet.';
}
renderLastChanged();

wirePageSave('#securityView', '#secSaveBtn', {
  validate: secValidate,
  save: function(){
    Store.set('passwordChangedAt', 'Aug 19 2026');   // pinned "today", like every date here
    ['current', 'next', 'confirm'].forEach(function(k){ $('#sec-' + k).value = ''; secPaint(k, null); });
    renderLastChanged();
    logActivity({ kind:'user', entityType:'Account', entityName:PORTAL_ACTOR, action:'PASSWORD_CHANGED',
      txt:'The account password was changed by ' + PORTAL_ACTOR + '.' });
    return true;
  }
});
// blur answers; typing again withdraws the answer
$('#securityView').addEventListener('focusout', function(e){
  var f = e.target.closest('[data-field]'); if(!f) return;
  var k = f.getAttribute('data-field');
  if(SEC_RULES[k]) secPaint(k, SEC_RULES[k](f.value));
});
$('#securityView').addEventListener('input', function(e){
  var f = e.target.closest('[data-field]'); if(!f) return;
  var k = f.getAttribute('data-field');
  var slot = $('[data-secerr="' + k + '"]');
  if(slot && !slot.hidden) secPaint(k, null);
});

guardLinks();

var secBackBtn = $('#secBackBtn');
if(secBackBtn) secBackBtn.addEventListener('click', function(){ location.href = 'account.html'; });

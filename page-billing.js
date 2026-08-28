/* ============================================================================
   page-billing.js — Billing & payment: the same sticky Save as Account, plus the
   bespoke Update payment method modal (its own overlay, deliberately not the
   generic dialog).
   ============================================================================ */

wirePageSave('#billingView', '#billSaveBtn');
guardLinks();

/* ---------- update payment method ---------- */
// Update payment method — bespoke modal (own overlay; deliberately not the generic openModal)
(function(){
  var ov = $('#payOverlay'); if(!ov) return;
  var name = $('#payName'), num = $('#payNum'), exp = $('#payExp'), cvc = $('#payCvc'), upd = $('#payUpdate');
  var opener = null;
  function d(s){ return (s || '').replace(/\D/g, ''); }
  function valid(){ return !!name.value.trim() && d(num.value).length >= 12 && d(exp.value).length >= 4 && d(cvc.value).length >= 3; }
  function refresh(){ upd.disabled = !valid(); }
  function open(from){ opener = from || null; num.value = ''; exp.value = ''; cvc.value = ''; ov.hidden = false; refresh(); $('#payClose').focus(); }
  function close(){ ov.hidden = true; if(opener && opener.focus) opener.focus(); }
  var trigger = $('#payUpdateBtn');
  if(trigger) trigger.addEventListener('click', function(){ open(trigger); });
  $('#payClose').addEventListener('click', close);
  $('#payCancel').addEventListener('click', close);
  ov.addEventListener('click', function(e){ if(e.target === ov) close(); });
  ov.addEventListener('input', refresh);
  upd.addEventListener('click', close);   // stub: no real card update in the prototype
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !ov.hidden) close(); });
})();

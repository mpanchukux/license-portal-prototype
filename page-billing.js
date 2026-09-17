/* ============================================================================
   page-billing.js — Billing & payment: the same sticky Save as Account, plus the
   bespoke Update payment method modal (its own overlay, deliberately not the
   generic dialog).
   ============================================================================ */

/* The card block has TWO states, and it used to have one.
   ⚠️ The bug: this page rendered the saved Visa unconditionally, so an account with
   `billingData: 'none'` — which is every account the moment it signs up — was shown
   a card it had never entered, next to a button labelled "Update payment method".
   `billingSaved()` was right all along; nothing read it.
   The empty state stays INSIDE the same row rather than becoming a panel of its own:
   the block is one line, and a full empty state would be heavier than what it
   replaces. The trailing button changes verb with the state. */
function renderPayCard(){
  var card = $('#payCard'); if(!card) return;
  var btn = $('#payUpdateBtn', card);
  $$('.brandbadge, .pc-num, .pc-exp, .paycard-none', card).forEach(function(n){ n.remove(); });
  if(billingSaved()){
    card.insertAdjacentHTML('afterbegin', paymentMethodHTML());
    if(btn){ btn.className = 'iconbtn ib'; btn.innerHTML = PENCIL_SVG;
             btn.setAttribute('aria-label', 'Update payment method');
             btn.setAttribute('title', 'Update payment method'); }
  } else {
    card.insertAdjacentHTML('afterbegin',
      '<span class="paycard-none">No payment method yet — charges cannot be taken until one is added.</span>');
    if(btn){ btn.className = 'btn sec'; btn.textContent = 'Add payment method';
             btn.setAttribute('aria-label', 'Add payment method');
             btn.removeAttribute('title'); }
  }
}
var PENCIL_SVG = '<svg class="icon" viewBox="0 0 24 24"><path d="M12 20h9"/>'
  + '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
renderPayCard();

/* ⚠️ This address is READ — by the invoice documents (see invoiceParty in
   components.js). That is the whole reason it is stored: a form that claims to
   control what is printed on an invoice, and is connected to nothing, is the lie the
   flow audit caught. Saving here changes the next PDF and the next preview. */
applyFields('#billingView', Store.get('billingAddress'));
wirePageSave('#billingView', '#billSaveBtn', {
  save: function(){ Store.set('billingAddress', fieldsOf('#billingView')); return true; }
});
guardLinks();

/* ⚠️ The update-card modal MOVED to shared.js (see PayCard). It is no longer this
   page's modal: the payment-failed banner on a licence opens the same card over the
   licence it is about, and that banner exists on every page the details surface can
   be reached from — so the controller cannot live in the one script only
   billing.html loads. This page just triggers it. */
(function(){
  var trigger = $('#payUpdateBtn');
  if(trigger) trigger.addEventListener('click', function(){ PayCard.open(trigger); });
  /* the card block restates after a save: the card shown here is the card stored */
  if(window.PayCard) PayCard.onSaved(function(){ renderPayCard(); });
})();

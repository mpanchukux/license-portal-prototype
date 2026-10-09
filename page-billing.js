/* ============================================================================
   page-billing.js — Payment & Billing: the same sticky Save as Account, plus the
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
  /* ⚠️ THE STATE IS NAMED ON THE ROW (2026-09-30), so the stylesheet can dress the empty
     one without testing for the spelling of a child. See `.paycard.is-empty`. */
  card.classList.toggle('is-empty', !billingSaved());
  /* ⚠️ THE TINT COMES WITH A SURFACE, AND THE SURFACE IS DECLARED (2026-10-01, by
     request: the Add button must be white). `.is-empty` paints the row `--c-blue-50`, and
     a button standing on a tint used to need `.on-tint` — so the row said what
     ground it is rather than the stylesheet re-deriving it from the state class. Toggled
     with `is-empty`, never set alone: a filled card is white and its button is grey. */
  /* ⚠️⚠️ THE `.on-tint` TOGGLE IS GONE (2026-10-08). It turned the card's secondary white
     while nothing was saved, because the card is tinted then. The variant has no fill to
     correct any more, so this line had nothing left to do. */
  if(billingSaved()){
    card.insertAdjacentHTML('afterbegin', paymentMethodHTML());
    if(btn){ btn.className = 'btn btn--secondary btn--md btn--icon'; btn.innerHTML = PENCIL_SVG;
             btn.setAttribute('aria-label', 'Update payment method');
             btn.setAttribute('title', 'Update payment method'); }
  } else {
    card.insertAdjacentHTML('afterbegin',
      /* ⚠️ COPY, 2026-10-01, by request. The old sentence said the state twice — the
         card is visibly empty and the button says `Add payment method`, so "No payment
         method yet" was the heading of a card that is its own heading. What is left is
         the only thing the reader cannot see for themselves: the consequence. */
      '<span class="paycard-none">Charges cannot be taken until payment method is added.</span>');
    if(btn){ btn.className = 'btn btn--secondary btn--md'; btn.textContent = 'Add payment method';
             btn.setAttribute('aria-label', 'Add payment method');
             btn.removeAttribute('title'); }
  }
}
/* ⚠️⚠️ THE SECTION IS SHOWN ONLY ON A POSITIVE BALANCE (2026-09-29, by request), AND
   THAT REVERSES THE ARGUMENT THIS COMMENT USED TO MAKE. It said: "A zero balance still
   renders the block, saying it is empty and where credit comes from. Hiding it would
   mean the one place that explains what account credit IS only appears once you already
   have some — and the first time anyone has some is the moment after a downgrade, when
   they have already been told about it on a screen they left."
   The reversal is the decision, not an oversight: an empty state whose whole content is
   "you have none of this" is a section every account without credit — which is nearly all
   of them — scrolls past forever, to teach a word it will never need. Where credit IS
   explained stays what it was: the downgrade screen that creates it, and the section
   itself the moment there is a balance to head.
   ⚠️ The empty-state copy is DELETED, not left unreachable. A branch nothing can enter is
   the thing that looks alive in a grep and is not.
   ⚠️ `hidden` on the SECTION, not on the card: the heading and its hint are the half that
   would otherwise be left standing over nothing. Its divider goes too — see
   `#creditSec[hidden] + .setdiv` in the stylesheet. */
function renderCreditBlock(){
  var el = $('#creditCard'); if(!el) return;
  var c = accountCredit();
  var sec = $('#creditSec');
  if(sec) sec.hidden = !(c > 0);
  if(!(c > 0)) return;
  el.innerHTML = '<span class="credit-amt">' + fmtMoney(c) + '</span>'
    + '<span class="credit-note">Applied automatically to your next purchase.</span>';
}
renderCreditBlock();

var PENCIL_SVG = '<svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-pencil"></use></svg>';
renderPayCard();

/* ⚠️ This section is READ — by the invoice documents (see invoiceParty in
   components.js). That is the whole reason it is stored: a form that claims to
   control what is printed on an invoice, and is connected to nothing, is the lie the
   flow audit caught. Saving here changes the next PDF and the next preview.
   ⚠️ It now carries the COMPANY too (name, description, phone), consolidated off
   Account — so one Save writes everything the invoice prints, and there is no second
   form anywhere that can disagree with it. */
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

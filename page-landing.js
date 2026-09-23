/* ============================================================================
   page-landing.js — the signed-out front page
   ============================================================================
   Header (truncated, from shared.js) + the purchase wizard's plan picker, rendered
   on the page. The picker's markup, data and click-reading are all shared with the
   wizard (renderPlanPicker / planPickerClick); the only thing this page owns is
   what a Select MEANS here — you cannot buy without an account, so it opens
   sign-up and remembers what you chose.
   ============================================================================ */

/* The same selection object shape the wizard's `st` is. No `locked` and no
   `currentName`: nothing is locked on a public page, and a visitor with no account
   has no current plan. */
// the product is STATED here, and which one comes from arrival — see arrivedProduct()
/* `statedInHead` — this page names the product in its own H1, so the shared picker
   must not state it a second time above the tabs (see nlProductStatedHTML). */
var lsel = { product:arrivedProduct(), kind:'subscription', plan:null, statedInHead:true };

var lChoices = $('#landingChoices'), lPlans = $('#landingPlans'),
    lExtra = $('#landingExtra'), lBase = $('#landingBase');
/* The fourth argument is what makes this a SELLING surface rather than a step in a
   flow: the PE card on a multi-card set, the sizing note on a single one. Home's
   new-user screen passes its own node to the same renderer; the wizard passes none. */
/* The head is part of the render, not static markup: swapping the product changes the
   heading, the line and the link along with the cards. */
function renderLanding(){
  $('#landingHead').textContent = landingHeading(lsel);
  /* the sentence and its escape hatch are ONE line: the link follows the text with a
     normal word space, so it wraps with it rather than being positioned against it */
  $('#landingLead').innerHTML = esc(landingLead(lsel)) + ' ' + productSwapHTML(lsel);
  renderPlanPicker(lChoices, lPlans, lsel, lExtra, lBase);
}
renderLanding();

/* ⚠️ The swap link moved OUT of the picker and into the page head, so the picker's own
   delegated listener stopped seeing it — the link rendered, was clickable, and changed
   nothing. Its host listens for it now, through the same `planPickerClick` reading, so
   there is still one interpretation of "the product changed". */
$('#landingLead').addEventListener('click', function(e){
  if(planPickerClick(e, lsel) === 'changed') renderLanding();
});

/* One delegated listener on the whole picker — the cards are re-rendered on every
   product/billing switch, so nothing may be bound to them directly. */
$('#landingPicker').addEventListener('click', function(e){
  var what = planPickerClick(e, lsel);
  if(what === 'changed'){ renderLanding(); return; }
  if(what === 'picked'){
    /* The plan outlives this page: sign-up ends in a real navigation to Home, and
       the wizard that has to open there with this plan already chosen is on the
       other side of it. The store is how anything survives a navigation here, so
       the choice goes in the store and Home picks it up (see page-home.js). */
    Store.set('pendingPurchase', { product:lsel.product, kind:lsel.kind, plan:lsel.plan });
    Auth.open('signup');
  }
});

/* Keyboard: the plan cards are `.nl-select` with tabindex, and the wizard gives
   them Enter/Space through its own listener. This host needs its own. */
$('#landingPicker').addEventListener('keydown', function(e){
  if((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('nl-select')){
    e.preventDefault(); e.target.click();
  }
});

/* ---------- arriving on an invite link ---------------------------------------
   `landing.html?invite=<token>` is what "Copy invite link" hands out and what an
   invitation email would carry. The token is resolved here, not trusted: a spent,
   revoked or expired one resolves to nothing and the visitor simply gets the
   landing page, which is the honest answer — this link does not work.

   ⚠️ The session guard runs first and is right to: someone already signed in who
   opens an invite link is bounced to Home. They are in; the invitation is for
   whoever is not.
   ⚠️ The invited person may never see this page's pricing at all — the sign-up
   screen opens straight over it, because they were asked to join an account, not
   to choose a plan. */
(function(){
  var tok = new URLSearchParams(location.search).get('invite');
  if(!tok) return;
  var rec = inviteByToken(tok);
  if(!rec) return;
  Auth.open('signup', { invite:rec });
})();

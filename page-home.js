/* ============================================================================
   page-home.js — the dashboard. One page, five states: the settings panel picks
   which, and shared.js keeps that choice in the store.

     · populated A / B  → #dashView, read from the chosen dataset
     · new user         → #dashEmptyView, the plan picker
     · grant pending    → the new-user screen plus the status card
     · grant approved   → dataset G plus the one-time banner
   ============================================================================ */

var dashV = $('#dashView'), dashEmptyV = $('#dashEmptyView');
var state = dashState();

/* ---------- which surface is on screen ---------- */
dashV.hidden = !!state.empty;
dashEmptyV.hidden = !state.empty;
$('#grantPending').hidden = state.grant !== 'pending';
$('#grantBanner').hidden = !(Store.get('dash') === 'dashgrant' && !isDismissed('grantBanner'));

/* ---------- populated dashboard ---------- */
function dashLicList(){
  var ls = DATA().licenses.slice();
  if(dashVariant() === 'B'){
    ls.sort(function(a,b){ return attnRank(a)-attnRank(b) || dateKey(a.event)-dateKey(b.event); });
    return ls.slice(0, 5);
  }
  ls.sort(function(a,b){ return dateKey(b.created)-dateKey(a.created); });
  return ls;
}
function renderDashLicenses(){
  var head=$('#dashLicHead'), body=$('#dashLicBody'); if(!head||!body) return;
  head.innerHTML = headHtml();
  body.innerHTML = dashLicList().map(rowHtml).join('');
}
// a dataset may legitimately have no invoices (the grant is free) — say so
function renderDashInvoices(){
  var b=$('#dashInvBody'); if(!b) return;
  b.innerHTML = DATA().invoices.length ? DATA().invoices.slice(0, 3).map(invRow).join('') : invEmptyRow();
}
/* Home greeting follows the viewer's own clock — the one place the prototype
   reads real time (dataset dates stay pinned to Aug 19 2026).
   05:00–11:59 morning · 12:00–17:59 afternoon · 18:00–04:59 evening. */
function greetingFor(h){ return (h >= 5 && h < 12) ? 'Good morning' : (h >= 12 && h < 18) ? 'Good afternoon' : 'Good evening'; }
function renderGreeting(){
  var el = $('#dashGreeting'); if(!el) return;
  el.textContent = greetingFor(new Date().getHours()) + ', Mariia';
}
/* Home activity block: latest batch first, then it grows in place. The count is
   per page load — a different dashboard state starts a fresh feed. */
var DASH_FEED_BATCH = 5;
var dashFeedShown = DASH_FEED_BATCH;
function renderDashFeed(){
  var el = $('#dashFeed'); if(!el) return;
  var all = DATA().activity, list = all.slice(0, dashFeedShown);
  el.innerHTML = list.length
    ? list.map(function(a, i){ return feedItem(a, i); }).join('')
    : '<div class="emptybox">No activity yet.</div>';
  var more = $('#dashFeedMore'); if(more) more.hidden = all.length <= dashFeedShown;
}
function dashFeedLoadMore(){
  var all = DATA().activity;
  if(dashFeedShown >= all.length) return;
  dashFeedShown += DASH_FEED_BATCH;
  renderDashFeed();
}
function renderHome(){
  renderGreeting();
  renderDashLicenses();
  renderDashInvoices();
  renderDashFeed();
}
renderHome();

/* rows behave exactly as on the Licenses page; `home` tells the details page
   which section to highlight and where its back button goes */
wireLicenseRows('#dashLicTable', { from:'home', rerender: renderHome });
wireFeedAudit('#dashView');

/* Reaching the end of the feed appends the next batch; the button is the
   keyboard path and the fallback where IntersectionObserver is missing. */
(function(){
  var btn = $('#dashFeedMoreBtn'), sentinel = $('#dashFeedSentinel');
  if(btn) btn.addEventListener('click', dashFeedLoadMore);
  if(sentinel && window.IntersectionObserver){
    new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting) dashFeedLoadMore(); });
    }, { rootMargin:'80px' }).observe(sentinel);
  }
})();

/* one split button for both create flows */
(function(){
  var btn = $('#dashNewBtn'), menu = $('#dashNewMenu');
  if(!btn) return;
  function toggle(open){ menu.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  btn.addEventListener('click', function(e){ e.stopPropagation(); toggle(menu.hidden); });
  menu.addEventListener('click', function(e){ e.stopPropagation(); });
  document.addEventListener('click', function(){ if(!menu.hidden) toggle(false); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !menu.hidden){ toggle(false); btn.focus(); } });
  $$('button', menu).forEach(function(b){
    b.addEventListener('click', function(){ toggle(false); NL.open({ kind: b.getAttribute('data-new') }); });
  });
})();

/* the grant banner is one-time: dismissing it is remembered */
(function(){
  var view = $('#grantViewBtn'), dismissBtn = $('#grantDismissBtn'), learn = $('#grantLearnBtn');
  if(view) view.addEventListener('click', function(){
    var g = DATA().licenses.filter(function(l){ return l.grant; })[0];
    if(g) location.href = licenseHref(g, 'home');
  });
  if(dismissBtn) dismissBtn.addEventListener('click', function(){ dismiss('grantBanner'); $('#grantBanner').hidden = true; });
  if(learn) learn.addEventListener('click', function(){
    openModal('Community Grant', '<p>Placeholder — the Community Grant programme page is not part of this prototype.</p>');
  });
})();

/* ---------- new-user screen ---------- */

if(dashEmptyV && !dashEmptyV.hidden){
  var ecProduct = 'thingsboard', ecBilling = 'payg';
  function renderEcPlans(){
    var set = EC_PLANS[ecProduct + '|' + ecBilling], grid = $('#ecPlans'), note = $('#ecNote');
    grid.className = 'plangrid' + (set.single ? ' one' : '');
    grid.innerHTML = set.cards.map(planCard).join('');
    note.className = 'pc-note' + (set.single ? ' center' : '');
    note.textContent = set.single ? EC_SINGLE_NOTE : '';
    // inferred: same PE card as wizard step 2 — the shared "…include unlimited…"
    // note is the card's muted intro now, so nothing floats under the grid
    $('#ecPlanExtra').innerHTML = !set.single && ecProduct === 'thingsboard' ? peBlockHTML(PLANS_INCLUDE_NOTE) : '';
  }
  $$('input[name="ecProduct"]', dashEmptyV).forEach(function(r){
    r.addEventListener('change', function(){ if(r.checked){ ecProduct = r.value; renderEcPlans(); } });
  });
  $$('input[name="ecBilling"]', dashEmptyV).forEach(function(r){
    r.addEventListener('change', function(){ if(r.checked){ ecBilling = r.value; renderEcPlans(); } });
  });
  // cards are re-rendered on every switch, so delegate the entry-point action.
  // Get started opens the New license flow with product + plan preselected,
  // landing on Customize (steps 1–2 shown completed).
  dashEmptyV.addEventListener('click', function(e){
    var cta = e.target.closest('.pc-cta');
    if(!cta) return;
    NL.open({ kind: ecBilling === 'perpetual' ? 'perpetual' : 'subscription',
              product: ecProduct, plan: cta.getAttribute('data-plan'), startStep: 3 });
  });
  renderEcPlans();
}



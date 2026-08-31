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
  // no Edit label in the row menu here: this block is a summary, and renaming a
  // licence belongs on the Licenses page and its details, where it is the subject.
  // Explicit callback — rowHtml takes options second, and .map would pass the index.
  body.innerHTML = dashLicList().map(function(p){ return rowHtml(p, { noLabelEdit:true }); }).join('');
}
// a dataset may legitimately have no invoices (the grant is free) — say so
function renderDashInvoices(){
  var b=$('#dashInvBody'); if(!b) return;
  var inv = DATA().invoices;
  // bareProduct: in a three-row preview the licence only has to be named — the mark
  // and the label line belong to the Invoices page, where the table is the subject
  var opts = { bareProduct:true };
  b.innerHTML = inv.length
    ? inv.slice(0, 3).map(function(v){ return invRow(v, opts); }).join('')
    : invEmptyRow(opts);
}
/* Each block ends with the way out of it: one button naming how much is behind it.
   The count is everything in the section, which is what the block is a preview of —
   licences include cancelled ones, exactly as the block itself does. */
function renderBlockFooters(){
  var lic = $('#dashLicOpenAll'), inv = $('#dashInvOpenAll');
  if(lic) lic.textContent = 'Open all (' + DATA().licenses.length + ')';
  if(inv){
    inv.textContent = 'Open all (' + DATA().invoices.length + ')';
    inv.closest('.dblock-foot').hidden = !DATA().invoices.length;
  }
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
  renderBlockFooters();
  renderDashFeed();
}
renderHome();

/* rows behave exactly as on the Licenses page; `home` tells the details page
   which section to highlight and where its back button goes */
wireLicenseRows('#dashLicTable', { from:'home', rerender: renderHome });
// modal mode: a change made inside the details modal restates this page too
if(window.LicenseDetails) LicenseDetails.setRerender(renderHome);
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

/* one button for both create flows — the billing type is a switcher in step 1 */
(function(){
  var btn = $('#dashNewBtn');
  if(!btn) return;
  btn.addEventListener('click', function(){ NL.open({}); });
})();

/* The primary action never scrolls out of reach: as the hero button leaves the
   top of the scroll region, the same action fades into the top-bar band, and
   fades back out on the way up. One hand-off, driven by how far the hero's bottom
   edge still is from the top of #shellMain — so the two never both read as live.

   The copy in the bar takes the plain 31px .btn: the top bar is a control band,
   and --btnH is not negotiable there. Only the hero is oversized (.btn.xl).

   Not installed on the new-user or grant-pending screens: #dashView is hidden
   there, its button measures 0, and the bar would hold an action for a dashboard
   that is not on screen. */
(function(){
  var hero = $('#dashNewBtn'), slot = $('#topbarAction'), shell = $('#shellMain');
  if(!hero || !slot || !shell || dashV.hidden) return;
  /* Both labels ship; CSS picks one. On a phone the bar is tight (logo · action ·
     profile on one row), so the copy collapses to an icon plus "Buy". */
  slot.innerHTML = '<button class="btn" id="topbarNewBtn">'
    + '<svg class="icon tb-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
    + '<span class="tb-full">Buy a license</span><span class="tb-short">Buy</span></button>';
  $('#topbarNewBtn').addEventListener('click', function(){ NL.open({}); });
  var BAND = 48;                       // px the crossfade takes
  function syncStickyAction(){
    var d = hero.getBoundingClientRect().bottom - shell.getBoundingClientRect().top;
    var t = Math.max(0, Math.min(1, d / BAND));   // 1 = hero in place · 0 = handed over
    // opacity is driven here, so the CSS transition covers only the slide
    hero.style.opacity = t;
    hero.style.pointerEvents = t < 0.05 ? 'none' : '';
    slot.style.opacity = 1 - t;
    slot.classList.toggle('on', t < 0.5);
  }
  // a plain scroll listener: two style writes, and rAF does not fire in a hidden
  // tab or an embedded panel (the same trap the feed's fallback exists for)
  shell.addEventListener('scroll', syncStickyAction);
  window.addEventListener('resize', syncStickyAction);
  syncStickyAction();
})();

/* the grant banner is one-time: dismissing it is remembered */
(function(){
  var view = $('#grantViewBtn'), dismissBtn = $('#grantDismissBtn'), learn = $('#grantLearnBtn');
  if(view) view.addEventListener('click', function(){
    var g = DATA().licenses.filter(function(l){ return l.grant; })[0];
    if(!g) return;
    openLicenseDetails(g, 'home');
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
  // Get started preselects product, billing and plan, so the wizard skips its
  // chooser and opens on Customize (step 2 of 3).
  dashEmptyV.addEventListener('click', function(e){
    var cta = e.target.closest('.pc-cta');
    if(!cta) return;
    NL.open({ kind: ecBilling === 'perpetual' ? 'perpetual' : 'subscription',
              product: ecProduct, plan: cta.getAttribute('data-plan'), startStep: 2 });
  });
  renderEcPlans();
}



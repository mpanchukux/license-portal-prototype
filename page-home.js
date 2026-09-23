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
var stickyActionOn = false;          // the topbar hand-off installs once, see below

/* ---------- which surface is on screen ----------
   ⚠️ DERIVED from the licences that exist, not from a stored flag, AND RE-APPLIED
   on every render. Those are two separate fixes and only the first had been made.

   Round one killed the flag: `state.empty` was written once at sign-up and cleared by
   nobody, so the first purchase left this page on its first-run screen. dashIsEmpty()
   (shared.js) now asks the data instead.

   Round two — this one — kills the SNAPSHOT. The value was derived correctly and then
   frozen into two `.hidden` writes that ran once at load, while the re-render hook
   every mutating path already calls (renderHome, via LicenseDetails.setRerender)
   redrew only the CONTENTS. Measured after a first purchase made on this page:
   #dashLicBody held 1 row and #dashInvBody held 1 row — the populated dashboard was
   fully built and still `hidden`, behind the plan picker. The refresh was never the
   thing that was missing; the surface decision simply was not part of it.

   So the decision lives INSIDE the render. There is no path that adds a licence and
   does not render, which is what makes "the page and the data disagree" unreachable
   rather than merely fixed here. */
function syncDashSurface(){
  var empty = dashIsEmpty();
  state = dashState();               // the gear panel can move it under us
  dashV.hidden = empty;
  dashEmptyV.hidden = !empty;
  $('#grantPending').hidden = state.grant !== 'pending';
  /* ⚠️ ONE renderer for every Home banner now — the grant is condition 9 of nine in a
     stated priority order, not a special case with its own visibility rule. See
     renderHomeBanner in components.js. */
  renderHomeBanner();
  /* the hand-off measures #dashNewBtn, so it can only be wired once that button is on
     screen — which, for an account buying its first licence, is now, not at load */
  if(!empty) installStickyAction();
  return empty;
}

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
  var inv = invoicesSorted();          // same order as the Invoices page
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
  /* ⚠️ The new-user screen no longer greets: it carries the landing page's head now
     (see renderEcHead), because it is the same price list and should read as one. The
     populated dashboard still greets — that one IS the reader's own page. */
  var el = $('#dashGreeting'); if(!el) return;
  el.textContent = greetingFor(new Date().getHours()) + ', ' + portalFirstName();
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
  syncDashSurface();                 // surface first: the blocks below fill #dashView
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

   Not installed while the first-run screen is up: #dashView is hidden then, its
   button measures 0, and the bar would hold an action for a dashboard that is not
   on screen. */
/* ⚠️ Was an IIFE that ran once at load and bailed on `dashV.hidden`. That was right
   while the surface never changed after load — and wrong the moment it could: an
   account buying its first licence got the dashboard with no topbar hand-off until it
   reloaded. Now it is called from syncDashSurface() whenever the populated view is up,
   and guards itself so repeated renders do not stack scroll listeners. */
function installStickyAction(){
  if(stickyActionOn) return;
  var hero = $('#dashNewBtn'), slot = $('#topbarAction'), shell = $('#shellMain');
  if(!hero || !slot || !shell || dashV.hidden) return;
  stickyActionOn = true;
  /* Both labels ship; CSS picks one. On a phone the bar is tight (logo · action ·
     profile on one row), so the copy collapses to an icon plus "Buy". */
  slot.innerHTML = '<button class="btn" id="topbarNewBtn">'
    + '<svg class="ic tb-ic" aria-hidden="true"><use href="assets/icons.svg#ti-plus"></use></svg>'
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
}

/* ⚠️ The grant banner's own wiring is GONE: view / dismiss / learn were three
   listeners for one banner that is now built, actioned and dismissed by the shared
   Home-banner component (renderHomeBanner). `Learn more` went with it — it opened a
   placeholder modal for a programme page this prototype does not have, and the banner
   the brief specifies carries one action, not two.
   The grant's own `Learn more` on the pending CARD (#grantLearnBtn) is untouched. */
(function(){
  var learn = $('#grantLearnBtn');
  if(learn) learn.addEventListener('click', function(){
    openModal('Community Grant', '<p>Placeholder — the Community Grant programme page is not part of this prototype.</p>');
  });
})();

/* ---------- new-user screen ---------- */

/* The third host of the purchase wizard's step 1, after the wizard itself and the
   landing page. A visitor who signs up should not find that choosing a plan looks
   different on the other side of the door, so this screen renders the very same
   picker off the very same data — see renderPlanPicker in wizard.js. What it owns
   is only what a Select MEANS here: signed in with no licences, it can open the
   wizard straight away. */
if(dashEmptyV && !dashEmptyV.hidden){
  /* the selection object the shared picker reads. No `locked`, no `currentName`:
     nothing is locked on this screen and an account with no licences has no
     current plan — the same reason the landing page omits them. */
  // same starting point as the landing page: the product the session arrived for
  var esel = { product:arrivedProduct(), kind:'subscription', plan:null };
  /* ⚠️ `statedInHead` — the head below names the product, so the picker must not state
     it a second time above the tabs. Same flag, same reason as the landing page. */
  esel.statedInHead = true;
  /* The head is part of the render, not static markup: swapping the product changes the
     heading, the line and the link along with the cards. */
  function renderEcHead(){
    $('#ecHead').textContent = landingHeading(esel);
    $('#ecLead').textContent = landingLead(esel, { signedIn:true });
    $('#ecSwap').innerHTML = productSwapHTML(esel);
  }
  function renderEcPlans(){
    renderEcHead();
    renderPlanPicker($('#ecChoices'), $('#ecPlans'), esel, $('#ecPlanExtra'));
  }
  renderEcPlans();

  /* the swap link lives in the head, outside the picker, so it needs its own listener
     — the same split the landing page makes, read through the same function */
  $('#ecSwap').addEventListener('click', function(e){
    if(planPickerClick(e, esel) === 'changed') renderEcPlans();
  });

  /* One delegated listener on the whole picker — the cards are re-rendered on every
     product/billing switch, so nothing may be bound to them directly. */
  $('#ecPicker').addEventListener('click', function(e){
    var what = planPickerClick(e, esel);
    if(what === 'changed'){ renderEcPlans(); return; }
    if(what === 'picked'){
      /* `skipPicker` because step 1 was not skipped — it was COMPLETED, on this
         page, by the same cards the wizard would have shown. Counting it would
         promise a screen that never comes, and its Back would lead to a duplicate
         of the picker still sitting behind the modal. Same reasoning, same flow as
         a plan chosen on the landing page: "Step 1 of 3 · Customize". */
      NL.open({ product:esel.product, kind:esel.kind, plan:esel.plan,
                startStep:2, skipPicker:true });
    }
  });

  /* Keyboard: the plan cards are `.nl-select` with tabindex and the wizard gives
     them Enter/Space through its own listener. This host needs its own. */
  $('#ecPicker').addEventListener('keydown', function(e){
    if((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('nl-select')){
      e.preventDefault(); e.target.click();
    }
  });
}



/* ---------- arriving from the landing page ----------------------------------
   A plan picked while signed out is finished here: sign-up ended in a real
   navigation, and the store is the only thing that survives one. The wizard opens
   on Customize with the product, billing type and plan already set, and with the
   picker counted as done rather than skipped — see noPicker() in wizard.js.

   ⚠️ Consumed BEFORE the wizard opens, not after it commits. Left in the store it
   would survive a refresh, a close, or a change of mind, and reopen the wizard on
   a plan the visitor had already walked away from. */
(function(){
  var pending = Store.get('pendingPurchase');
  if(!pending || !pending.plan || !window.NL) return;
  Store.set('pendingPurchase', null);
  NL.open({ product:pending.product, kind:pending.kind, plan:pending.plan,
            startStep:2, skipPicker:true });
})();

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
/* ⚠️ VARIANT B TAKES FOUR ROWS, NOT THREE, and the fourth is the whole point: it is
   rendered in full and then faded out, so the block stops mid-row and says "there is
   more of this" by its shape. Three rows and a hard edge would read as a block that
   contains three things. */
var DASH_FADE_ROWS = 4;
function renderDashLicenses(){
  var head=$('#dashLicHead'), body=$('#dashLicBody'); if(!head||!body) return;
  head.innerHTML = licHeadHTML();
  var list = dashLicList();
  if(homeBlocks() === 'b') list = list.slice(0, DASH_FADE_ROWS);
  // no Edit label in the row menu here: this block is a summary, and renaming a
  // licence belongs on the Licenses page and its details, where it is the subject.
  // Explicit callback — rowHtml takes options second, and .map would pass the index.
  body.innerHTML = list.map(function(p){ return licRowHTML(p, { noLabelEdit:true }); }).join('');
  markFadeRow(body);
}
// a dataset may legitimately have no invoices (the grant is free) — say so
function renderDashInvoices(){
  var b=$('#dashInvBody'); if(!b) return;
  var inv = invoicesSorted();          // same order as the Invoices page
  // bareProduct: in a three-row preview the licence only has to be named — the mark
  // and the label line belong to the Invoices page, where the table is the subject
  var opts = { bareProduct:true };
  /* ⚠️ Three in A, four in B — and the block that shows three anyway still changes,
     because in B the third is no longer the last thing but the one before the fade. */
  var take = homeBlocks() === 'b' ? DASH_FADE_ROWS : 3;
  b.innerHTML = inv.length
    ? inv.slice(0, take).map(function(v){ return invRow(v, opts); }).join('')
    : invEmptyRow(opts);
  markFadeRow(b);
}
/* ⚠️ THE LAST ROW IS MARKED IN THE DOM, not chosen by `:last-child`, for the reason the
   grouped Instances table marks `.is-last`: a row hidden by a search would otherwise
   hand the fade to whatever row happened to be last, and the block would fade a row
   that is not the fourth. It is also only ever applied when there was something to cut
   — a block with three rows in total has nothing more behind it and must not pretend. */
function markFadeRow(body){
  $$('tr.is-fading', body).forEach(function(tr){ tr.classList.remove('is-fading'); });
  if(homeBlocks() !== 'b') return;
  var rows = $$('tr', body);
  if(rows.length < DASH_FADE_ROWS) return;
  rows[DASH_FADE_ROWS - 1].classList.add('is-fading');
}
/* Each block ends with the way out of it: one button naming how much is behind it.
   The count is everything in the section, which is what the block is a preview of —
   licences include cancelled ones, exactly as the block itself does. */
/* ⚠️ THE COUNT IS THE BUTTON NOW, and it sits in the heading (2026-09-25, from a
   reference). It was `Open all (17)` under the table — the number and the way through
   were one control, but it was at the far end of the block from the title that named
   what was being counted. Same control, moved to where the question is asked.
   ⚠️ Still `renderBlockFooters`, still one function: the count comes from the dataset,
   so a demo switch repaints it without either block knowing. */
function renderBlockFooters(){
  var lic = $('#dashLicCount'), inv = $('#dashInvCount');
  /* ⚠️ IN B THE HEADING BUTTON IS ARROW-ONLY. The count moved into `See all N` over the
     fade, and a block carrying the same number twice reads as two destinations. Dropping
     `label` is what makes `button()` build the icon-only form, so the size ladder and
     the square width come from the component rather than from a rule here. */
  var bare = homeBlocks() === 'b';
  var nL = DATA().licenses.length;
  if(lic) lic.innerHTML = button({ variant:'secondary', size:'sm',
    iconEnd: bare ? null : 'arrow-right', icon: bare ? 'arrow-right' : null,
    label: bare ? '' : String(nL), href:'licenses.html',
    ariaLabel:'Open all ' + nL + ' licenses' });
  if(inv){
    var n = DATA().invoices.length;
    /* an account with no invoices has nothing to open — the button goes, the heading stays */
    inv.innerHTML = n ? button({ variant:'secondary', size:'sm',
      iconEnd: bare ? null : 'arrow-right', icon: bare ? 'arrow-right' : null,
      label: bare ? '' : String(n), href:'invoices.html',
      ariaLabel:'Open all ' + n + ' invoices' }) : '';
  }
  renderBlockFades();
}
/* ---------- the fade and the button laid over it (variant B) --------------------
   ⚠️ THE OVERLAY IS APPENDED TO THE BLOCK, not to the scroller the table sits in.
   `.tablescroll` is `overflow-x:auto`, so a child positioned in it scrolls sideways
   with the columns — the button would drift off the block the moment a narrow window
   made the table scroll. `.dblock` is the box the reader sees.
   ⚠️ BUILT AND DESTROYED, not hidden: the blocks repaint on every demo switch, and a
   leftover overlay over a block that has gone back to variant A would cover a row the
   reader can otherwise click. */
function renderBlockFades(){
  $$('#dashView .blockmore').forEach(function(n){ n.remove(); });
  $$('#dashView .dblock').forEach(function(b){ b.classList.remove('has-fade'); });
  if(homeBlocks() !== 'b') return;
  [['#dashLicBody', 'licenses.html', DATA().licenses.length],
   ['#dashInvBody', 'invoices.html', DATA().invoices.length]].forEach(function(spec){
    var body = $(spec[0]); if(!body) return;
    var fading = $('tr.is-fading', body); if(!fading) return;   // nothing was cut
    var block = body.closest('.dblock'); if(!block) return;
    block.classList.add('has-fade');
    var wrap = document.createElement('div');
    wrap.className = 'blockmore';
    wrap.innerHTML = button({ variant:'secondary', size:'md', href:spec[1],
      label:'See all ' + spec[2], cls:'blockmore-go' });
    block.appendChild(wrap);
    /* ⚠️ MEASURED, not a constant. Licence rows are two and three lines tall depending
       on the table variant and on whether the licence has a label, so a fixed 96px
       would either clip a tall row or eat into the third. The overlay is exactly the
       fading row plus its own breathing room. */
    block.style.setProperty('--fadeH', (fading.getBoundingClientRect().height + 18) + 'px');
  });
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
    ? activityList(list, 'global', '')
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

/* ⚠️ The mesh layer's scroll and the bar's docking used to be wired HERE. They moved
   to `wireMeshHeader()` in shared.js when the landing page got the same gradient:
   two copies of one scroll handler is how two surfaces start behaving differently. */

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
  slot.innerHTML = '<button class="btn btn--primary btn--md" id="topbarNewBtn">'
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
    /* ⚠️ THE GREETING IS THE HEADING NOW (2026-09-28, by request) — see landingHeading.
       `#ecWelcome`, the separate line that used to sit above it, is gone from the markup
       with this change: it would have said `Welcome, …` directly above `Welcome, …`. */
    $('#ecHead').textContent = landingHeading(esel, { signedIn:true });
    $('#ecLead').textContent = landingLead(esel, { signedIn:true });
    $('#ecSwap').innerHTML = productSwapHTML(esel);
  }
  function renderEcPlans(){
    renderEcHead();
    renderPlanPicker($('#ecChoices'), $('#ecPlans'), esel, $('#ecPlanExtra'));
    /* the answers follow the product the same way the prices do */
    renderFAQ($('#ecFaq'), esel.product);
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


/* ============================================================================
   HOME'S PAGE STATES — the bottom bar (2026-09-28, by request)
   ============================================================================
   ⚠️ FOUR TABS, AND THEY ARE FOUR DIFFERENT QUESTIONS — which is why they are tabs and
   not one long row. `Dashboard` decides what the account HAS; `Payment` decides a fact
   about the account that two banners read; `Banner` decides which of the true
   conditions is the one on screen; `Shape` decides how much of it is shown. Only the
   first changes the data; the rest are the levers that let a real banner be looked at
   without arranging an account to produce it.
   ⚠️ `Dashboard state` MOVED HERE FROM THE ⚙ PANEL. It was always a fact about this one
   page, sitting in the panel every page opens — which is the split this bar exists to
   make. Same store key, so nothing about it changed except where it is set.
   ⚠️ EVERY OPTION CARRIES A LIVE COUNT OR A REASON, and the ones that cannot fire are
   DISABLED rather than hidden: "this banner cannot happen on this account" is the most
   useful thing the bar can tell you about it, and a hidden row says nothing. */
(function(){
  if(!window.PageStates) return;

  /* ---------- the card that makes `card_expiring` reachable at all ----------------
     ⚠️ Without this the condition CANNOT FIRE from a fresh demo, and that is a finding
     rather than a convenience: `cardExpiryDay` parses only a STORED card's `MMYY`, and
     the seeded `PAYMENT_METHOD` is display markup ("12 / 2028") with no parseable date.
     So `savedCard()` is null, the expiry is null, and the branch is dead.
     ⚠️⚠️ THE DATE IS DERIVED FROM THE NEXT CHARGE, NOT SET TO "SOON". First attempt was
     `TODAY + 20 days`, and it did not fire: a card dies at the END of its month, so
     `cardExpiryDay` rounded 20 days up to 34 — past the soonest renewal, which is the
     very comparison the condition makes. The card is dated one month BEFORE the month
     of the soonest renewal, so its end-of-life always lands before that charge, whatever
     the demo's dates have been shifted to. */
  function soonestRenewal(){
    var next = null;
    (DATA().licenses || []).forEach(function(l){
      if(l.status === 'canceled' || l.type !== 'Subscription' || !l.event) return;
      var d = dayOf(l.event);
      if(d != null && (next == null || d < next)) next = d;
    });
    return next;
  }
  function expiringCard(){
    var next = soonestRenewal(); if(next == null) return null;
    /* the month that CONTAINS the day before the charge, stepped back one: the card's
       first-of-next-month is then that month's first day, which is before the charge */
    var q = dayToDate(next - 1).split(' ');               // "Oct 06 2026"
    var m = MONN.indexOf(q[0]) + 1, y = +q[2];
    m -= 1; if(m < 1){ m = 12; y -= 1; }
    return { brand:'VISA', last4:'4242', num:'4242 4242 4242 4242',
             exp:('0' + m).slice(-2) + String(y).slice(-2),
             name:'Mariia Panchuk', country:'Germany' };
  }
  function payState(){
    if(!billingSaved() && !savedCard()) return 'none';
    var c = savedCard();
    return (c && cardExpiryDay() != null) ? 'expiring' : 'saved';
  }
  var PAY = [
    { v:'saved',    t:'Card on file' },
    { v:'none',     t:'No payment method', note:'fires no_card' },
    { v:'expiring', t:'Card expires soon', note:'fires card_expiring' }
  ];

  /* what each banner condition is called in the bar, in the order the code ranks them */
  var COND = [
    ['blocked',         'Blocked'],
    ['payment_failed',  'Payment failed'],
    ['no_card',         'No payment method'],
    ['card_expiring',   'Card expiring'],
    ['updates_expired', 'Updates ended'],
    ['updates_14',      'Updates end ≤14d'],
    ['updates_30',      'Updates end ≤30d'],
    ['grant',           'Grant ready']
  ];
  function live(){
    var m = {};
    attentionConditions().forEach(function(c){ m[c.state] = (m[c.state] || 0) + 1; });
    return m;
  }

  PageStates.define({
    id:'home',
    label:'Home',
    when:function(){ return document.body.getAttribute('data-page') === 'home'; },
    tabs:[
/* ⚠️⚠️ `Signed out` BELONGS IN THIS ROW (2026-09-29, by request), even though it is
   not a dashboard state and lives in a different store key (`auth`, not `dash`). The
   row answers "what does this surface look like right now", and signed out is one of
   the answers — the one where the surface is the landing page. Leaving it only in the
   ⚙ panel's Session group meant the one state that replaces Home entirely was the one
   state this row could not reach.
   ⚠️ IT NAVIGATES rather than reloading: signed out, the guard on `index.html` sends
   you to `landing.html` anyway, so a reload would be a redirect the reader watches
   happen. `setSession` is the same helper the ⚙ panel's Session group calls.
   ⚠️ IT IS LAST, not first. The five before it are the dashboard's own densities and
   they are what the row is mostly used for; this one leaves the page. */
      { id:'dash', label:'Dashboard',
        hint:'What the account owns. This is the only tab that changes the data — the other tabs only decide what is shown. `Signed out` leaves Home for the landing page; it is the same Session setting the settings panel carries.',
        get:function(){ return isSignedIn() ? Store.get('dash') : 'out'; },
        set:function(v){
          if(v === 'out'){ setSession('out'); return; }
          /* coming BACK from signed out: the session has to be restored too, or the
             guard bounces straight to the landing page again and the pick looks dead */
          if(!isSignedIn()) Store.set('auth', 'existing');
          Store.set('dash', v); location.reload();
        },
        options:function(){
          return Object.keys(DASH_STATES).map(function(k){
            var d = DASH_STATES[k];
            var n = ((DATASETS[d.variant] || {}).licenses || []).length;
            return { v:k, t:d.label.replace(/^Dashboard — /, ''), note:n + ' lic' };
          }).concat([{ v:'out', t:'Signed out (landing)', note:'no session' }]);
        } },

      { id:'pay', label:'Payment',
        hint:'A fact about the account that two banners read. `Card expires soon` writes a real card dated 20 days out, which is what makes card_expiring reachable at all.',
        get:payState,
        set:function(v){
          if(v === 'none'){ Store.set('billingData','none'); Store.set('paymentMethod', null); }
          else if(v === 'expiring'){
            var c = expiringCard(); if(!c) return;
            Store.set('billingData','saved'); Store.set('paymentMethod', c);
          }
          else { Store.set('billingData','saved'); Store.set('paymentMethod', null); }
          renderHomeBanner(); PageStates.sync();
        },
        /* ⚠️ `Card expires soon` needs a charge to expire BEFORE — an account with no
           renewing subscription (the empty and grant states) has nothing to compare
           against, so the option says why rather than doing nothing. */
        options:function(){
          var can = soonestRenewal() != null;
          return PAY.map(function(o){
            return o.v === 'expiring' && !can
              ? { v:o.v, t:o.t, note:'no renewal to precede', disabled:true } : o;
          });
        } },

/* ⚠️⚠️ `No banner` IS FIRST AND IS THE DEFAULT (2026-09-29, by request). It is the
   state every other page in the portal is in, and until now the bar could not express
   it — the row went straight to `Auto`, so a reviewer looking at Home's layout had a
   black band across it and no way to put it away. First in the row because it is where
   the page starts; see `bannerForce` for what changed in the store.
   ⚠️ `Auto` is now the opt-IN, and its note still counts what it WOULD show, so the
   row says what picking it costs before you pick it. */
      { id:'banner', label:'Banner',
        hint:'Which of the conditions that are TRUE right now is the one on screen. `No banner` is where the page starts — it is the state every other page is in. A condition the account cannot produce is disabled: the bar narrows what is real, it never invents one.',
        get:function(){ return bannerForce(); },
        set:function(v){ Store.set('bannerForce', v); renderHomeBanner(); PageStates.sync(); },
        options:function(){
          var m = live();
          var total = Object.keys(m).reduce(function(a,k){ return a + m[k]; }, 0);
          return [{ v:'none', t:'No banner', note:'default' },
                  { v:'auto', t:'Auto (most urgent)', note:total ? total + ' live' : 'none live', disabled:!total }]
            .concat(COND.map(function(c){
              return { v:c[0], t:c[1], note:m[c[0]] ? String(m[c[0]]) : '0', disabled:!m[c[0]] };
            }));
        },
/* ⚠️⚠️ SHAPE IS A DEPENDENT ROW OF BANNER, NOT A TAB (2026-09-29, by request). It
   only ever describes the banner chosen directly above it: as a fourth sibling tab it
   read as an independent question, and choosing a shape then moving to Banner to
   change the condition hid the shape you had just set. Under Banner, the condition and
   how it is drawn are one screen.
   ⚠️ Every option is disabled while the row above says `No banner`, and that is the
   honest state rather than a hidden row: there is nothing to shape, and the reader can
   see that the control exists and why it is not available. */
        sub:{
          label:'Shape',
          hint:'One alert gets the fact, what fixes it and its actions. Several get the fact and `and N more` only — deliberately poorer, because an action button beside a list acts on one of them while looking like it settles all.',
          get:bannerShape,
          set:function(v){ Store.set('bannerShape', v); renderHomeBanner(); PageStates.sync(); },
          options:function(){
            var n = homeBannerVisible().length;
            return [
              { v:'auto', t:'Auto', note:n ? n + ' live' : 'no banner', disabled:!n },
              { v:'one',  t:'Alone — full', disabled:!n },
              { v:'many', t:'With others — count', note:n > 1 ? 'and ' + (n-1) + ' more' : 'needs 2+', disabled:n < 2 }
            ];
          }
        } }
    ]
  });
  PageStates.sync();
})();

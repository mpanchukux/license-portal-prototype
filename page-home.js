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
/* ⚠️ SPLIT IN TWO (2026-09-29) so the cap and the ORDER are separate facts. The order is
   what both layouts share; the cap of five belongs to the table block alone, and the
   cards block needs to look past it (see dashCardList). Nothing about either changed. */
function dashLicSorted(){
  var ls = DATA().licenses.slice();
  if(dashVariant() === 'B'){
    ls.sort(function(a,b){ return attnRank(a)-attnRank(b) || dateKey(a.event)-dateKey(b.event); });
    return ls;
  }
  ls.sort(function(a,b){ return dateKey(b.created)-dateKey(a.created); });
  return ls;
}
function dashLicList(){
  var ls = dashLicSorted();
  return dashVariant() === 'B' ? ls.slice(0, 5) : ls;
}
/* ⚠️ VARIANT B TAKES FOUR ROWS, NOT THREE, and the fourth is the whole point: it is
   rendered in full and then faded out, so the block stops mid-row and says "there is
   more of this" by its shape. Three rows and a hard edge would read as a block that
   contains three things. */
var DASH_FADE_ROWS = 4;
function renderDashLicenses(){
  /* ⚠️ `#dashLicCols` IS THE `<thead>`; `#dashLicHead` is the block's own `Licenses →`
     heading and belongs to `renderBlockFooters`. They carried the SAME id until
     2026-10-01, so this line filled the heading div and the footer renderer then wrote
     over it — the column row simply never appeared. See the note in index.html. */
  var head=$('#dashLicCols'), body=$('#dashLicBody'); if(!head||!body) return;
  head.innerHTML = licHeadHTML();
  var list = dashLicList();
  /* ⚠️ ALWAYS FOUR (2026-10-01): `Home › Blocks` retired on `B — 3 rows, 4th fading`,
     so the block renders the fourth row in full and fades it. */
  list = list.slice(0, DASH_FADE_ROWS);
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
  /* ⚠️ Four, and the fourth is the one that fades — see `markFadeRow`. A showed three
     and stopped cleanly; that variant retired 2026-10-01. */
  var take = DASH_FADE_ROWS;
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
/* ⚠️ ONE BUILDER FOR BOTH LAYOUTS (2026-09-29, by request: the cards layout's headings
   must carry "the same button with the count and the arrow together"). It was a chip plus
   a separate bare arrow there and this control here — two answers to "how much is behind
   this block, and the way there", one per layout, which is exactly the fork a second
   layout is not allowed to introduce.
   ⚠️ `n === null` IS THE ICON-ONLY FORM, and it has two callers for two reasons: the
   table layout's variant B moves its number into `See all N` over the fade, and the
   activity block has no honest number at all. Same absence, same shape.
   ⚠️ `aria` IS PASSED, NOT DERIVED: variant B drops the number from the FACE and keeps it
   in the accessible name, so the two cannot be built from one string. */
/* ⚠️⚠️ THE WHOLE HEADING IS THE LINK, AND THE ARROW IS NO LONGER A CONTROL
   (2026-09-30, by request). It was an h2 beside a secondary button that carried the
   count and the arrow together; now the h2, the count and a 24px arrow sit INSIDE one
   anchor that fills the heading row, so the target is the line the reader was already
   looking at instead of a 26px square at the end of it.
   ⚠️ THIS RETIRES `blockGoHTML`, and with it the `n === null` fork that chose between
   the icon-only and the labelled button. The absence of a count is now the absence of
   a span — there is no second shape to choose.
   ⚠️ The arrow is `aria-hidden` and the anchor carries the name: the icon no longer
   stands for the destination on its own, the sentence does.
   ⚠️ ONE BUILDER FOR BOTH LAYOUTS still holds (the rule from 2026-09-29): layout B's
   `hcHeadHTML` calls straight through, so the two layouts cannot answer "how much is
   behind this, and how do I get there" with two different objects. */
function blockHeadHTML(n, title, href, aria){
  return '<a class="dbh-link" href="' + href + '" aria-label="' + esc(aria) + '">'
    + '<h2>' + title + '</h2>'
    + (n === null ? '' : '<span class="dbh-count">' + n + '</span>')
    + icon('arrow-right', { size:24, cls:'dbh-arrow' })
    + '</a>';
}
function renderBlockFooters(){
  var lic = $('#dashLicHead'), inv = $('#dashInvHead'), act = $('#dashActHead');
  /* ⚠️ THE HEADING CARRIES NO COUNT. It moved into `See all N` over the fade, and a
     block stating the same number twice reads as two destinations. (A kept the count in
     the heading because it had no `See all`; A retired 2026-10-01.) */
  var nL = DATA().licenses.length;
  if(lic) lic.innerHTML = blockHeadHTML(null, 'Licenses', 'licenses.html',
    'Open all ' + nL + ' licenses');
  if(inv){
    var n = DATA().invoices.length;
    /* an account with no invoices has nothing to open — the link goes, the heading stays */
    inv.innerHTML = n ? blockHeadHTML(null, 'Recent invoices', 'invoices.html',
      'Open all ' + n + ' invoices') : '<h2>Recent invoices</h2>';
  }
  /* ⚠️ NO NUMBER HERE, and the absence is the honest part — the feed is mostly derived
     check-ins, so a count would say "the machine reported a lot", not "you have a lot to
     read". Same heading, same link, no invented figure. */
  if(act) act.innerHTML = blockHeadHTML(null, 'Recent activity', 'activity.html',
    'Open all activity');
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
/* ============================================================================
   LAYOUT B — cards. A second form for the same three blocks (2026-09-29, by request);
   `homeLayout` in the ⚙ picks, and A is untouched so the comparison is honest.

   ⚠️ NOTHING ABOUT THE SELECTION MOVES. The licences are `dashLicList()` — the same
   list, in the same order, capped the same way — and the invoices are the same first
   three. The feed is not re-rendered at all: its nodes are MOVED here (see
   applyHomeLayout), so what it shows, how it grows and what it looks like are the feed's
   business exactly as before.
   ⚠️ `homeBlocks` B AND `licTable` DO NOT REACH THIS LAYOUT, and the ⚙ hides both groups
   while it is up: one is a fourth table ROW faded under a button, the other picks between
   sets of table COLUMNS. Neither has anything to act on in a grid of cards.
   ============================================================================ */

/* The section heading: the title, and beside it the same control layout A puts there —
   one button carrying the count and the arrow together.
   ⚠️⚠️ IT WAS A CHIP PLUS A BARE ARROW FOR ONE PASS, and that was the fork: the count is
   a fact and the arrow a control, so splitting them read defensibly on its own — but it
   made the two layouts answer "how much is behind this, and how do I get there" with two
   different objects. One layout may differ from another in FORM; it may not differ in
   what its controls are. `blockGoHTML` is now the single answer (2026-09-29, by request).
   ⚠️ `count === null` is the icon-only form, which is how the activity heading comes out
   without a number — see the note at its call. */
function hcHeadHTML(title, count, href, aria){
  return blockHeadHTML(count === undefined ? null : count, title, href, aria);
}
/* ⚠️⚠️ `lcardMenuHTML` AND `licCardHTML` MOVED TO `components.js` (2026-10-01, by
   request: "the Licenses page should use the same cards as Home"). They are now rendered
   by two surfaces — Home's card layout and the Licenses page's phone list — and the rule
   this file has always followed is that a renderer with a second reader lives in
   `components.js`. Nothing about them changed in the move; Home calls them exactly as it
   did, and the two surfaces cannot drift because there is one builder. */
/* One invoice, as a row of the card that holds them. ⚠️ A DIFFERENT SHAPE FROM `invRow`,
   not a restyling of it: the brief reorders the facts (when · what · how much · did it
   go through · act) and stacks two of them, and a `<td>` cannot be repoured into that.
   What is NOT rebuilt is any of the parts — the status is `invStatusMark`, the
   auto-charge glyph is `autoChargeIcon`, and the two actions come from `invActionsHTML`
   so this row cannot end up offering a different pair from the table's.
   ⚠️ The licence stays a LINK, as it is in every other invoice row: `data-invlic` is the
   contract the delegated interceptor reads, so the panel opens over Home here too. */
function invCardRowHTML(v){
  var lic = v.licId && licById(v.licId);
  return '<div class="hcinv">'
    + '<div class="hcinv-when">'
    +   '<div class="hcinv-date">' + fmtDate(v.date) + '</div>'
    +   '<div class="hcinv-num mono">' + esc(v.num) + '</div>'
    + '</div>'
    /* ⚠️⚠️ ONE LINE, THREE FACTS, MIDDOTS BETWEEN THEM (2026-10-01, by request): product ·
       purchase type · plan. It was the product and plan on one line with the TYPE on a
       second, quieter one — two lines saying one thing about one licence, and the second
       line was the shortest and least useful of the three. The middot is the separator
       this product already uses for exactly this (`ThingsBoard · Subscription` in every
       licence row), so nothing new is introduced.
       ⚠️ `title` CARRIES THE WHOLE RUN, because one line of three facts is the thing most
       likely to ellipse in a card. */
    + '<div class="hcinv-prod">' + (lic
        ? '<a class="hcinv-lic" data-invlic="' + esc(lic.id) + '" href="' + licenseHref(lic, 'invoices') + '">'
          + '<span class="hcinv-licname" title="' + esc([lic.product, lic.type, lic.name].filter(Boolean).join(' \u00b7 ')) + '">'
          + [lic.product, lic.type, lic.name].filter(Boolean).map(esc).join(' &middot; ')
          + '</span></a>'
        : '<span class="muted">&mdash;</span>') + '</div>'
    + '<div class="hcinv-amt">' + esc(v.amount) + '</div>'
    + '<div class="hcinv-status"><span class="statwrap">' + invStatusMark(v) + autoChargeIcon(v) + '</span></div>'
    + '<div class="hcinv-act"><span class="rowactions">' + invActionsHTML({ ghost:true }) + '</span></div>'
  + '</div>';
}
/* ⚠️ THE FEED IS MOVED, NOT COPIED. Both layouts live in the markup at once, so a second
   `#dashFeed` would put two nodes with one id in the document — and `$('#…')` takes the
   first, which is the defect already on record for the details modal opened over the
   details page. Moving keeps the ids, the IntersectionObserver on the sentinel and the
   batch count the feed has grown to, all without the feed knowing this happened. */
/* ⚠️⚠️ THE PHONE GETS THE CARDS, WHATEVER THE SETTING SAYS (2026-09-30, by request).
   The table layout's phone form was the table row re-poured by CSS — a different shape
   again, so the prototype had three answers for "a licence in a list" and the phone's
   was the only one nobody had designed. The cards ARE the phone's answer, so the axis
   stops at the desktop: `homeLayout` still picks between A and B where both exist.
   ⚠️ A `matchMedia` LISTENER, not a one-time read. `applyHomeLayout` runs from
   `renderHome`, which a resize does not trigger — so crossing the breakpoint with the
   setting on `table` would leave the phone showing the desktop table until something
   else repainted. The listener re-runs the whole render, which is also what moves the
   feed back to the host it belongs in. */
var PHONE_MQ = window.matchMedia('(max-width:600px)');
function onPhone(){ return PHONE_MQ.matches; }
PHONE_MQ.addEventListener('change', function(){ renderHome(); });
function applyHomeLayout(){
  var cards = homeLayout() === 'cards' || onPhone();
  var t = $('#homeTable'), c = $('#homeCards');
  if(!t || !c) return;
  t.hidden = cards;
  c.hidden = !cards;
  var host = $(cards ? '#hcActBody' : '#dashActBody');
  var feed = $('#dashFeed'), more = $('#dashFeedMore');
  if(host && feed && more && feed.parentNode !== host){
    host.appendChild(feed);
    host.appendChild(more);
    /* the sentinel has just changed which box clips it — see wireFeedSentinel */
    wireFeedSentinel();
  }
}
/* ---------- the feed's lazy load, and the box it is watched in --------------------
   ⚠️ AN OBSERVER WITH NO `root` WATCHES THE VIEWPORT, and the cards layout put the feed
   inside a 600px scroller — a target clipped by an ancestor never intersects the
   viewport, so that observer could not fire there. The root is given explicitly now.
   ⚠️⚠️ REASONED, NOT MEASURED, AND THE DIFFERENCE MATTERS HERE. I first wrote this up as
   a regression I had measured: the box scrolled to its end, the entry count stayed at 5.
   That measurement proves nothing — `IntersectionObserver` NEVER fires in the embedded
   browser panel, layout or no layout. Checked afterwards, in the table layout, with a
   viewport-rooted observer and the sentinel plainly on screen: the callback did not run
   once in 1.2s. Same family as the note above `syncStickyAction` about rAF in an embedded
   panel, and the same reason the `Load more` button exists. So this change is right by
   construction and is UNTESTED on the behaviour it fixes; the button is what works here.
   ⚠️ THE ROOT IS FOUND, NOT NAMED. Which box clips the sentinel depends on the layout,
   and the layout switches at runtime — a hard-coded `#hcActBody` would be wrong in the
   table layout and a hard-coded `#shellMain` wrong in the cards one. Walking up to the
   nearest scrollable ancestor answers it wherever the feed has been moved to.
   ⚠️ IT ALSO CORRECTS THE TABLE LAYOUT rather than leaving it alone: there the root
   becomes `#shellMain`, which is the box that actually scrolls that feed. `null` was only
   ever nearly-right there, because `#shellMain` happens to fill the viewport.
   ⚠️ DISCONNECTED BEFORE RE-OBSERVING: `applyHomeLayout` runs on every render, and a
   stack of observers on one sentinel would append a batch per layout switch. */
var feedObserver = null;
function scrollParentOf(el){
  for(var n = el && el.parentNode; n && n.nodeType === 1; n = n.parentNode){
    var o = getComputedStyle(n).overflowY;
    if(o === 'auto' || o === 'scroll') return n;
  }
  return null;
}
function wireFeedSentinel(){
  var sentinel = $('#dashFeedSentinel');
  if(!sentinel || !window.IntersectionObserver) return;
  if(feedObserver) feedObserver.disconnect();
  feedObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting) dashFeedLoadMore(); });
  }, { root: scrollParentOf(sentinel), rootMargin:'80px' });
  feedObserver.observe(sentinel);
}
/* ⚠️⚠️ THREE CARDS, AND WHICH THREE IS A DEMO DECISION (2026-09-29, by request) — it is
   the one place this layout departs from "the selection does not move", and it departs on
   purpose. The brief asks the block to SHOW the card's three label shapes side by side:
   a plain label, one that runs to two lines, and none at all. Attention-first order gives
   five licences that all happen to carry a short label, so the two other shapes would
   never appear on this page and the thing being reviewed could not be seen.
   Same kind of decision as the 2%% of hours `instanceChecks` leaves empty so a gap between
   runs is visible at all: demo data arranged so a state has somewhere to be.
   ⚠️ IT PICKS FROM THE WHOLE SORTED LIST, not from the table block's five — the cap of
   five is that block's, and looking past it is the whole reason the sort was split out.
   ⚠️ THE LONGEST LABEL IS THE PROXY FOR "WRAPS TO TWO LINES", because nothing in the data
   says how a string will break. Measured: B13 at 61 characters is the only seeded label
   that takes two lines at every column count, and it is the longest.
   ⚠️ IT DEGRADES RATHER THAN FAILS. An account with no unlabelled licence, or with three
   licences and nothing to choose between, falls through to the plain order — `forEach(add)`
   at the end is that fallback, and `add` refuses duplicates, so the first three of the
   sorted list fill whatever the shapes could not. */
var DASH_CARDS = 3;
function dashCardList(){
  var list = dashLicSorted();
  var lab = function(l){ return String((l && l.label) || '').trim(); };
  var pick = [];
  function add(l){ if(l && pick.indexOf(l) < 0) pick.push(l); }
  add(list[0]);
  add(list.slice().sort(function(a, b){ return lab(b).length - lab(a).length; })[0]);
  add(list.filter(function(l){ return !lab(l); })[0]);
  list.forEach(add);
  return pick.slice(0, DASH_CARDS);
}
function renderHomeCards(){
  var grid = $('#hcLicGrid'); if(!grid) return;
  var list = dashCardList();
  // explicit callback: .map would hand licCardHTML the index as its second argument
  grid.innerHTML = list.map(function(p){ return licCardHTML(p); }).join('');

  var inv = invoicesSorted();
  $('#hcInvList').innerHTML = inv.length
    ? inv.slice(0, 3).map(function(v){ return invCardRowHTML(v); }).join('')
    : '<div class="emptybox">' + (DATA().noInvoicesNote || 'No invoices yet.') + '</div>';

  var nL = DATA().licenses.length, nI = DATA().invoices.length;
  $('#hcLicHead').innerHTML = hcHeadHTML('Licenses', nL, 'licenses.html',
    'Open all ' + nL + ' licenses');
  /* an account with no invoices has nothing to count and nowhere to go — same rule the
     table layout's heading follows */
  $('#hcInvHead').innerHTML = nI
    ? hcHeadHTML('Recent invoices', nI, 'invoices.html', 'Open all ' + nI + ' invoices')
    : '<h2>Recent invoices</h2>';
  /* ⚠️ NO COUNT, AND IT IS THE ONE PART OF THE BRIEF THIS LAYOUT DOES NOT FOLLOW. The
     brief asks for `Recent activity 15 →`; the decision already on record for the table
     layout is that this block cannot honestly say how much is behind it — the page the
     arrow leads to renders the DERIVED check-ins folded (`activityFeed`), hundreds a
     day, while Home reads the seeded list. A chip saying 17 next to an arrow to a
     longer list is a number that means neither thing. Reported rather than overridden;
     it is one argument in `hcHeadHTML` the day the count is decided. */
  $('#hcActHead').innerHTML = hcHeadHTML('Recent activity', null, 'activity.html',
    'Open all activity');   /* null: the icon-only form, same as layout A's */
  /* ⚠️ `See all N` UNDER THE CARDS, AND ONLY THE PHONE SHOWS IT (2026-09-30, by
     request). The desktop already answers "how many are there" in the heading, where
     the count chip sits beside the arrow; on the phone the three cards fill the screen
     and the heading has scrolled away by the time the reader reaches the end of them,
     so the way out has to be at the end. Built here and hidden by CSS above 600 rather
     than branched in JS: it is the same markup either way, and a width is a CSS
     question.
     ⚠️ Same button the table layout's fade overlay uses (`blockmore-go`), so the two
     ways of saying "there are more" are one control wearing one label. */
  var more = $('#hcLicMore');
  if(more) more.innerHTML = nL > DASH_CARDS
    ? button({ variant:'secondary', size:'md', href:'licenses.html',
               label:'See all ' + nL, cls:'blockmore-go' })
    : '';
  syncHomeBuy();
}
/* ⚠️⚠️ `Buy a license` MOVES INTO THE LICENCES HEADING ON THE PHONE (2026-10-01, by
   request). On the desktop it stands beside the greeting, which is the page's own h1 and
   the right place for the page's primary. At 375 that puts a 48px full-width black button
   between the greeting and the banner carousel — two screens above the thing it buys —
   so it goes where its subject is: the right end of the `Licenses` heading row.
   ⚠️ THE NODE IS MOVED, NOT COPIED, and that is what keeps `installStickyAction` working:
   it captured this element at boot and measures its rect to hand the action to the top
   bar. A second button would leave the bar watching a hidden one.
   ⚠️ CALLED FROM `renderHomeCards`, AFTER the heading's `innerHTML` is written — the
   heading is rebuilt on every render, and anything appended before that is thrown away. */
function syncHomeBuy(){
  var buy = $('#dashNewBtn'), head = $('#hcLicHead'), home = $('.dwelcome');
  if(!buy || !head || !home) return;
  var host = onPhone() ? head : home;
  if(buy.parentNode !== host) host.appendChild(buy);
}
function renderHome(){
  syncDashSurface();                 // surface first: the blocks below fill #dashView
  renderGreeting();
  /* before the block renderers: `renderBlockFades` MEASURES a row, and a hidden block
     measures zero — so which host is on screen has to be settled first */
  applyHomeLayout();
  renderDashLicenses();
  renderDashInvoices();
  renderBlockFooters();
  renderHomeCards();
  renderDashFeed();
  /* ⚠️ LAST, AND IT HAS TO BE HERE RATHER THAN AT BOOT. `wireScrollables` runs when the
     chrome is injected, which is BEFORE these renderers fill the two tbodies — so the
     tables measured narrow and neither wrapper ever became a scroller except on the one
     width where something else re-triggered it. The measurement belongs after the rows
     exist, and after every re-render, because a dataset switch changes the widths. */
  if(window.syncScrollables) window.syncScrollables();
}
renderHome();

/* rows behave exactly as on the Licenses page; `home` tells the details page
   which section to highlight and where its back button goes */
wireLicenseRows('#dashLicTable', { from:'home', rerender: renderHome });
/* the cards carry the same five actions on a different element — one wiring, one
   contract (`data-licid`), so neither layout can drift from the other */
wireLicenseRows('#hcLicGrid', { from:'home', rerender: renderHome, rowSel:'.lcard' });
// modal mode: a change made inside the details modal restates this page too
if(window.LicenseDetails) LicenseDetails.setRerender(renderHome);

/* Reaching the end of the feed appends the next batch; the button is the
   keyboard path and the fallback where IntersectionObserver is missing.
   ⚠️ The observer itself lives in `wireFeedSentinel` now, because which box it has to
   watch depends on where the layout has put the feed. */
(function(){
  var btn = $('#dashFeedMoreBtn');
  if(btn) btn.addEventListener('click', dashFeedLoadMore);
  wireFeedSentinel();
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

  /* ⚠️⚠️ TWO TABS LEFT THIS SPEC (2026-09-30, by request) AND ONE ARGUMENT WENT WITH
     THEM. `Dashboard` and `Payment` were facts about the ACCOUNT, not about Home, and
     both had a second control in the ⚙ panel writing the same store key. They stand in
     the global `Data` group now, reachable from every page — see shared.js. What is
     left here is what is genuinely Home's: the shape of its blocks and its banner.
     ⚠️ `Signed out` WENT WITH `Dashboard` and is not replaced by anything here: the
     session is `Data › Session`, which owns `auth` alone now. The 2026-09-29 argument
     for putting it in this row ("the one state that replaces Home entirely was the one
     state this row could not reach") is answered by the merge instead — both rows are
     on screen together, so neither has to carry the other's question.
     ⚠️ EVERY OPTION CARRIES A LIVE COUNT OR A REASON, and the ones that cannot fire are
     DISABLED rather than hidden: "this banner cannot happen on this account" is the most
     useful thing the bar can tell you about it, and a hidden row says nothing. */

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
      /* ---- Home: the shape of the page itself ---- */
      { id:'homeLayout', group:'Home', label:'Layout',
        get:homeLayout,
        set:function(v){
          Store.set('homeLayout', v);
          if(window.renderHome) renderHome();
          /* ⚠️ THE BAR ITSELF CHANGES, and this is the only setter here that does:
             two tabs are scoped to the table layout (`Blocks`, and `Licenses › Table`)
             and one (`Everywhere › Table frame`) to there being a table at all, so
             switching to cards takes three tabs off the row. `render()` runs after every
             setter, so nothing extra is needed — this note exists so the next person does
             not go looking for the call that redraws it. */
        },
        options:[{ v:'table', t:'A — three tables' },
                 { v:'cards', t:'B — cards' }] },

      /* ⚠️ DISABLED, NOT HIDDEN, while the cards are up. It is a variant of the TABLE
         layout chosen directly above it, so it belongs beside the control it depends on
         and says why it cannot be used — a tab that vanished would look like a bug in
         the row rather than a consequence of the answer above. */
      /* ⚠️ `Blocks` IS RETIRED (2026-10-01, by request) with `B — 3 rows, 4th fading` as
         the answer. What A was: five licence rows and three invoice rows, stopping
         cleanly, with the count in the heading instead of in a `See all N` over a fade. */

/* ⚠️⚠️ `No banner` IS FIRST AND IS THE DEFAULT (2026-09-29, by request). It is the
   state every other page in the portal is in, and until now the bar could not express
   it — the row went straight to `Auto`, so a reviewer looking at Home's layout had a
   black band across it and no way to put it away. First in the row because it is where
   the page starts; see `bannerForce` for what changed in the store.
   ⚠️ `Auto` is now the opt-IN, and its note still counts what it WOULD show, so the
   row says what picking it costs before you pick it. */
      { id:'bannerCond', group:'Banner', label:'Condition',
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
/* ⚠️⚠️ SHAPE IS A DEPENDENT ROW OF CONDITION, NOT A TAB (2026-09-29, by request). It
   only ever describes the banner chosen directly above it: as a sibling tab it read as
   an independent question, and choosing a shape then moving to Condition to change the
   banner hid the shape you had just set.
   ⚠️ Every option is disabled while the row above says `No banner`, and that is the
   honest state rather than a hidden row: there is nothing to shape, and the reader can
   see that the control exists and why it is not available.
   ⚠️ SHAPE IS A PROPERTY OF THE STACKED FORM ONLY (2026-09-30). The separate layout
   gives every card the full form by definition — that is the whole reason it exists —
   so there is no "poorer shape" to choose. */
        sub:{
          label:'Shape',
          get:bannerShape,
          set:function(v){ Store.set('bannerShape', v); renderHomeBanner(); PageStates.sync(); },
          /* ⚠️ The `stacked only` guard went with the `Layout` axis (2026-10-01): there is
             one layout now, and it is the one Shape describes. */
          options:function(){
            var n = homeBannerVisible().length;
            return [
              { v:'auto', t:'Auto', note:n ? n + ' live' : 'no banner', disabled:!n },
              { v:'one',  t:'Alone — full', note:'', disabled:!n },
              { v:'many', t:'With others — count', note:n > 1 ? 'and ' + (n-1) + ' more' : 'needs 2+', disabled:n < 2 }
            ];
          }
        } },

      /* ⚠️ `Layout` IS RETIRED (2026-10-01, by request) with `Stacked — one band` as the
         answer. What `separate` was: one card per live condition, side by side with a
         pager — see the note where its builders stood in components.js. */
    ]
  });
  PageStates.sync();
})();

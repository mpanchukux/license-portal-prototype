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
function blockGoHTML(n, href, aria){
  return n === null
    ? button({ variant:'secondary', size:'sm', icon:'arrow-right', href:href, ariaLabel:aria })
    : button({ variant:'secondary', size:'sm', label:String(n), iconEnd:'arrow-right',
               href:href, ariaLabel:aria });
}
function renderBlockFooters(){
  var lic = $('#dashLicCount'), inv = $('#dashInvCount');
  /* ⚠️ IN B THE HEADING BUTTON IS ARROW-ONLY. The count moved into `See all N` over the
     fade, and a block carrying the same number twice reads as two destinations. Dropping
     `label` is what makes `button()` build the icon-only form, so the size ladder and
     the square width come from the component rather than from a rule here. */
  var bare = homeBlocks() === 'b';
  var nL = DATA().licenses.length;
  if(lic) lic.innerHTML = blockGoHTML(bare ? null : nL, 'licenses.html',
    'Open all ' + nL + ' licenses');
  if(inv){
    var n = DATA().invoices.length;
    /* an account with no invoices has nothing to open — the button goes, the heading stays */
    inv.innerHTML = n ? blockGoHTML(bare ? null : n, 'invoices.html',
      'Open all ' + n + ' invoices') : '';
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
  return '<h2>' + title + '</h2>'
    + '<span class="hc-go">' + blockGoHTML(count === undefined ? null : count, href, aria) + '</span>';
}
/* ⚠️ THE SAME RULE AS THE TABLE ROW: a grant carries no overflow menu, because it cannot
   be changed, cancelled or topped up. `actionsCell` decides that for layout A; repeating
   the decision rather than the markup is the point — the card splits the row's two
   actions across two zones (the kebab in the status row, copy in the key row), so there
   is no cell to reuse, only a rule. */
function lcardMenuHTML(p){
  if(p && p.grant) return '';
  return '<div class="lic-actions"><div class="menu">'
    + button({ variant:'menu', size:'md', icon:'dots-vertical', ariaLabel:'More actions',
               attrs:'aria-haspopup="true" aria-expanded="false"' })
    /* ⚠️ `noLabelEdit`, exactly as layout A's block passes it: renaming a licence belongs
       where the licence is the subject. The card's own label zone is a different thing —
       it NAMES an unnamed licence, which is what the brief asks the zone to offer. */
    + '<div class="pop" role="menu" hidden>' + menuItems(p, { noLabelEdit:true }) + '</div>'
    + '</div></div>';
}
/* Status · term, then product, then key, then the label zone under a divider.
   ⚠️ EVERY PART IS THE COMPONENT LAYOUT A USES — `statusMark` and `stateText` for the
   first line (so `Blocked · Over instance limit` reads the same here as in the table),
   `licenseMark` for the square, `licenseKeyFor`/`licenseKeyMask` for the key, and the
   details surface's own `+ Add label` chip for an unnamed licence. What the card owns is
   the arrangement.
   ⚠️ `data-licid` IS THE CONTRACT with `wireLicenseRows` — the element may be anything,
   as long as it carries the id (see `opts.rowSel` there). */
function licCardHTML(p){
  var label = (p.label || '').trim();
  var alive = p.status === 'canceled' ? 'Canceled' : 'Active';
  return '<div class="lcard' + (p.status === 'canceled' ? ' off' : '') + '"'
    + ' data-licid="' + esc(p.id || '') + '"'
    + ' data-goto="' + esc(p.goto || '') + '"'
    + ' data-product="' + esc(p.product || '') + '"'
    + ' tabindex="0" aria-label="' + esc((p.product ? p.product + ' ' : '') + p.name
        + ', status: ' + alive + '. Open details') + '">'
    + '<div class="lcard-top">'
    +   '<div class="lcard-state">' + statusMark(p)
    +     '<span class="lcard-dot" aria-hidden="true">&middot;</span>'
    +     '<span class="lcard-term">' + stateText(p) + '</span></div>'
    +   lcardMenuHTML(p)
    + '</div>'
    + '<div class="lcard-prod">'
    +   '<span class="lp-ic" aria-hidden="true">' + licenseMark(p) + '</span>'
    +   '<div class="lp-txt">'
    +     '<div class="lcard-kind">' + esc(p.type || '') + '</div>'
    +     '<div class="lcard-name">' + esc(p.product || '') + ' &middot; ' + esc(p.name || '') + '</div>'
    +   '</div>'
    + '</div>'
    + '<div class="lcard-key">'
    +   '<span class="mono lcard-keytxt">' + licenseKeyMask(licenseKeyFor(p)) + '</span>'
    +   button({ variant:'secondary', size:'md', icon:'copy', cls:'tip lic-copy',
                ariaLabel:'Copy license key', attrs:'data-tip="Copy license key"' })
    + '</div>'
    /* ⚠️ THE ZONE IS ALWAYS THERE, LABEL OR NOT, and that is what keeps a row of cards
       level: an unnamed licence shows the chip in the same band a name would occupy. The
       two-line label is absorbed by the zone's own min-height, not by the card growing
       past its neighbours — see `.lcard-label` in the stylesheet. */
    + '<div class="lcard-label">' + (label
        ? '<span class="lic-prodlabel lcard-labeltxt">' + esc(label) + '</span>'
        : '<button class="chip ghost lcard-add" data-editlabel>'
          + icon('pencil', { cls:'lcard-addic' }) + 'Add label</button>')
    + '</div>'
  + '</div>';
}
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
    + '<div class="hcinv-prod">' + (lic
        ? '<a class="hcinv-lic" data-invlic="' + esc(lic.id) + '" href="' + licenseHref(lic, 'invoices') + '">'
          /* the longest product name does not fit a half-width column beside two pill
             buttons; it ellipses and keeps its full text where a reader can get it */
          + '<span class="hcinv-licname" title="' + esc((lic.product || '') + ' \u00b7 ' + (lic.name || '')) + '">'
          + esc(lic.product || '') + ' &middot; ' + esc(lic.name || '') + '</span>'
          + '<span class="hcinv-licmodel">' + esc(lic.type || '') + '</span></a>'
        : '<span class="muted">&mdash;</span>') + '</div>'
    + '<div class="hcinv-amt">' + esc(v.amount) + '</div>'
    + '<div class="hcinv-status"><span class="statwrap">' + invStatusMark(v) + autoChargeIcon(v) + '</span></div>'
    + '<div class="hcinv-act"><span class="rowactions">' + invActionsHTML() + '</span></div>'
  + '</div>';
}
/* ⚠️ THE FEED IS MOVED, NOT COPIED. Both layouts live in the markup at once, so a second
   `#dashFeed` would put two nodes with one id in the document — and `$('#…')` takes the
   first, which is the defect already on record for the details modal opened over the
   details page. Moving keeps the ids, the IntersectionObserver on the sentinel and the
   batch count the feed has grown to, all without the feed knowing this happened. */
function applyHomeLayout(){
  var cards = homeLayout() === 'cards';
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

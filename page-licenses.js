/* ============================================================================
   page-licenses.js — the licence list: one product-first table rendered from the
   current dataset, a mutually-exclusive Type filter, the canceled toggle and the
   split "+ New license" button. Row behaviour is shared with the Home block.
   ⚠️ THE INSTANCES VIEW LEFT THIS FILE (2026-09-23). It was a second slicing of the
   same data behind a tablist that also stood in for the page title, and it had to hide
   half the shared toolbar to work. It is `instances.html` / `page-instances.js` now;
   the row builders stayed in components.js, where the licence panel also reads them.
   ============================================================================ */

/* Type filter: null = nothing selected = every licence shown. Shared by BOTH toolbars —
   they are two ways of asking one question, so they write one variable and a reader who
   switches between them keeps what they had set. */
var licType = null;
/* Status filter, and it is the same variable in both toolbars with one difference in
   what each can express. Toolbar A has a single `Needs attention` chip, so it holds only
   `null` or `'attention'`; toolbar B's dropdown holds any of the four (see
   LIC_STATUS_OPTS). `null` is All.
   ⚠️ SWITCHING BACK TO A CLEARS WHAT A CANNOT SHOW — see applyLicBar. Carrying
   `'canceled'` into a toolbar with no control for it would narrow the list with nothing
   on screen to say why, which is the exact fault this pass was asked to fix. */
var licStatus = null;
/* Cancelled licences are out of the way until asked for. The choice is a stored
   setting like the dashboard state, so it survives navigation and refresh.
   ⚠️ TOOLBAR A ONLY. Toolbar B does not read it at all, and that IS the proposal: its
   Status menu offers `Canceled` as one of four answers, so a switch that pre-hides those
   rows would both contradict the menu and make its `Canceled 1` count unreachable. */
/* ⚠️ `licShowCanceled` IS GONE (2026-10-01) with toolbar A's `Active only` switch — see
   the note where its controls stood. */
/* ⚠️⚠️ TOOLBAR C NEEDS A SECOND STATUS VARIABLE, and that is the whole reason it is a
   third toolbar rather than a tweak to B. `licStatus` holds ONE value, so in A and B
   "Needs attention" is chosen INSTEAD of a state — you cannot ask for blocked licences
   that also need attention, because the two answers occupy the same slot. C lifts
   attention onto its own switch, so it needs its own variable and the two combine.
   ⚠️ NOT stored. The type and status filters are not stored either; a filter that
   survives a reload is a list that is narrowed for reasons off screen. */
var licAttnOnly = false;
/* ⚠️ HAS THE READER ANSWERED THE STATUS QUESTION THEMSELVES? Toolbar C opens on
   `Active`, and "opens on" has to mean "until you say otherwise" — without this flag,
   picking `All statuses` in C would be undone by the next `applyLicBar`, which runs on
   every toolbar swap and on every settings change, and the menu item would look broken.
   Set by the pick handlers and by `?attention=1`; never reset. */
var licStatusTouched = false;
/* ⚠️ ONE URL parameter now, and it arrives from a Home banner rather than from a menu:
   `?attention=1` is where "3 other licenses need attention" lands. It exists so a
   banner can hand the reader a filtered surface instead of a list to search.
   ⚠️⚠️ IT NOW LANDS ON A CONTROL (2026-09-28, by request). It used to set a variable
   that nothing on screen reflected: the list narrowed, the title still said 17, and the
   only way back was the browser's Back button. The parameter sets `licStatus` now, which
   is drawn — as a pressed chip in toolbar A and as the trigger's own label in toolbar B
   — so the state says what it is and can be undone where it is shown.
   ⚠️ `?view=instances` WAS THE SECOND ONE and is gone with the view toggle — the
   blocked banner's route is `instances.html?lic=…` now. A stale link carrying the old
   parameter lands on a plain Licenses page, which is wrong but not broken. */
/* ⚠️ THE PAGER IS REAL HERE NOW (2026-09-28, by request), and it replaces
   `syncPagerUnpaged`. That call rendered every row, reported one page and hid the four
   arrows and the per-page select — honest about what it did, and the reason the product
   had THREE answers to "how does a list page": this, the Instances page (which really
   pages), and Activity (no footer at all). Same controller, same default size as
   Instances, so two of the three are now one.
   ⚠️ Activity stays unpaged, and that is the one named exception: the 09-28 decision
   there was that 315 sentences on an axis ARE what a log is, and a pager was what got
   removed to make it so. */
var licPage = { page:1, size:10, total:0 };
function licQuery(){
  /* ⚠️ THE VISIBLE TOOLBAR'S FIELD, whichever toolbar that is — NOT a list of ids.
     This read `#licBarA…, #licBarB…` until a third toolbar arrived (2026-09-29) and
     the omission would have been silent: C's search box would have typed into a query
     nobody read, and the list would simply not have filtered. Same lesson as
     `.periodhead,#periodSub,#periodPerp` — a rule that names its members falls behind
     the next member. `.lic-controls` is what all three already are. */
  var i = $('.lic-controls:not([hidden]) .searchbox input');
  return i ? i.value.trim() : '';
}
var licParams = new URLSearchParams(location.search);
if(licParams.get('attention') === '1'){ licStatus = 'attention'; licStatusTouched = true; }
/* ⚠️ `?open=<id>` OPENS A LICENCE AS A MODAL OVER THIS LIST (2026-09-29). Its one
   caller is the Presentation switch in the page-state bar: going from the full page
   back to the modal has to land somewhere the modal can sit ON, and that is the list.
   ⚠️ Deferred to the end of the file — `LicenseDetails` and the rendered rows both
   have to exist first. See the call site there. */
var licOpenId = licParams.get('open');
/* ⚠️ `licNeedsAttention` MOVED TO components.js (2026-09-28). Three surfaces read it
   now — both toolbars and the styleguide's specimen — and the predicate the Home banner
   and this list must agree on does not belong to one page's script. */

function currentProducts(){
  var all = DATA().licenses.slice();
  /* ⚠️ NEWEST FIRST, and it is the page's own order now (2026-10-01): B carried an
     attention-first sort of its own and went with the `Table` axis. */
  return all.sort(function(a, b){ return dateKey(b.created) - dateKey(a.created); });
}
/* ---------- one predicate, both toolbars --------------------------------------
   ⚠️ THE THIRD LINE IS THE ONLY DIFFERENCE BETWEEN THE TWO, and writing it as a
   condition rather than as a second copy of this function is what keeps them comparable:
   whatever else changes, both toolbars are filtering the same list the same way, and the
   proposal is exactly one clause wide. */
function licPasses(p){
  if(licType && p.type !== licType) return false;
  if(!licStatusMatch(p, licStatus)) return false;
  /* ⚠️ THE ATTENTION SWITCH IS AN AND, not another value of the status above it: a licence
     can be Blocked AND need attention, and asking both is what this toolbar is for. */
  if(licAttnOnly && !licNeedsAttention(p)) return false;
  return true;
}
/* ⚠️⚠️ THE PHONE IS A DIFFERENT PRESENTATION OF THE SAME LIST (2026-10-01, by request).
   `onLicPhone()` is the one question, asked in two places — which host gets filled, and
   which nodes search reads back — and a `matchMedia` LISTENER re-renders on the crossing,
   because nothing else repaints this page when the window changes. Same pattern Home
   already uses for its own layout switch (`PHONE_MQ` in page-home.js), deliberately: two
   pages answering "am I on a phone" two different ways is how they drift apart. */
var LIC_PHONE_MQ = window.matchMedia('(max-width:600px)');
function onLicPhone(){ return LIC_PHONE_MQ.matches; }
LIC_PHONE_MQ.addEventListener('change', function(){ licApply(); });

/* ⚠️⚠️ THE SEARCH SCOPE IS NOW STATED, NOT SCRAPED, AND THAT IS WHAT KEEPS IT THE SAME
   (2026-10-01). It used to be `stripText(tr.innerHTML)` — "whatever the row happens to
   print" — which was fine while there was one presentation. The phone's card prints five
   of those eight facts, so leaving the scrape in place would have SILENTLY NARROWED the
   search at 600px: the same query, fewer hits, no error, nothing on screen to say why.
   The eight fields below are exactly what variant A's row prints today; nothing is added
   and nothing is dropped, and both presentations now read the same list.
   ⚠️ IT IS THE RECORD, NOT THE NODE, so it also cannot be changed by a styling pass that
   moves a fact out of a cell. The cost is that it must be edited when a COLUMN gains a
   fact — which is the right place for that cost, because that is a decision someone makes
   on purpose.
   ⚠️ Variants B and C print fewer columns and used to search fewer; they share this scope
   now. Noted rather than hidden: it widens their search to what A has always had. */
function licSearchText(p){
  return [p.product, p.type, p.label, p.name,
          stripText(statusMark(p)), stripText(stateText(p)),
          licenseVersion(p), fmtDate(p.updated || p.created)]
    .filter(Boolean).join(' ').toLowerCase();
}
/* ⚠️⚠️ EVERY FILTER CHANGE GOES THROUGH THE SEARCH, NOT ROUND IT (2026-10-01). Changing
   a filter calls `renderProducts`, which redraws the rows — and `wireSearch` filters by
   HIDING rows already in the DOM, so a redraw hands back every row the filter allows,
   query or no query. The query simply stopped applying the moment any filter was touched:
   no error, a longer list, nothing on screen to say why. The brief's "search and the
   filters compose with AND" is what made it worth fixing rather than noting.
   ⚠️ THE VISIBLE TOOLBAR'S RUN, and only it. Each of the three fields has its own `run`
   over the same rows, and a hidden toolbar's field is empty — so running all three would
   end with an empty query un-hiding everything the visible one had just hidden. Which
   bar is on screen is the same question `licQuery` already asks.
   ⚠️ `run` CALLS `renderProducts` ITSELF (it is the `before` hook), so this replaces that
   call rather than preceding it. Before the fields are wired it falls back to the plain
   render — `applyLicBar` runs at boot, ahead of them. */
var licSearchRuns = [];
function licApply(){
  var hit = licSearchRuns.filter(function(r){ return r.bar && !r.bar.hidden; })[0];
  if(hit) hit.run(); else renderProducts();
}
/* what is on screen, in render order — the index `wireSearch` hands back indexes into */
var licRendered = [];
function renderProducts(){
  $('#prodHead').innerHTML = licHeadHTML();
  var matched = currentProducts().filter(licPasses);
  /* ⚠️ SEARCH AND PAGING CANNOT BOTH BE ON — `wireSearch` hides rows already in the DOM,
     so a query across page 1 of 2 would search ten rows and call the rest absent. While
     there is a query the page renders everything and the footer states one page. */
  var searching = !!licQuery();
  var shown = searching ? matched : pageSlice(matched, licPage);
  if(searching) licPage.total = matched.length;
  var vis = matched.length;
  var phone = onLicPhone();
  var cards = $('#prodCards'), wrap = $('#licensesList .tablescroll');
  if(cards) cards.hidden = !phone;
  if(wrap) wrap.hidden = phone;
  licRendered = shown;
  /* ⚠️ "Empty" here means the ACCOUNT owns nothing — not that a filter hid everything.
     A type chip that leaves no rows is the reader's own doing and keeps its toolbar,
     because the way out is to unset the filter they set. The empty state is for the
     account that has never bought anything. */
  var accountEmpty = currentProducts().length === 0;
  var EMPTY = { title:'No licenses yet.',
      line:'Buy a license to get a key for your ThingsBoard or TBMQ instance.',
      /* the ONE primary a new account gets, and it opens the same wizard the
         toolbar's "+ New license" does — one action, not a second way in */
      action:'<button class="btn btn--primary btn--md" id="licEmptyBuy">Buy a license</button>' };
  if(phone){
    /* ⚠️ THE SAME THREE STATES, in the shapes a div host can hold: `emptyStateHTML` and
       `noMatchHTML` are the builders the table wraps in a `<td colspan>`, so the words and
       the exits are identical and only the container differs. */
    cards.innerHTML = accountEmpty ? emptyStateHTML(EMPTY)
      : !vis ? licNoResultsHTML(licQuery())
      : shown.map(function(p){ return licCardHTML(p); }).join('');
  } else {
    if(accountEmpty){
      $('#prodBody').innerHTML = emptyStateRow(licColSpan(), EMPTY);   // the variant decides the span
    } else if(!vis){
      /* ⚠️ A FILTER THAT MATCHES NOTHING IS NOT AN EMPTY ACCOUNT — see the two empties
         named above. This one keeps the toolbar (the way out is to undo what you set) and
         says which kind of nothing it is. */
      $('#prodBody').innerHTML = '<tr><td colspan="' + licColSpan() + '" class="noresults-cell">'
        + licNoResultsHTML(licQuery()) + '</td></tr>';
    } else {
      $('#prodBody').innerHTML = shown.map(function(p){ return licRowHTML(p); }).join('');
    }
  }
  syncListEmpty(accountEmpty);
  /* ⚠️ THE ACCOUNT'S TOTAL, not the filtered count. The chip sits with the TITLE, and the
     title names the page rather than the current filter — a number beside it that fell to
     3 when a chip was pressed would be describing the toolbar, which already describes
     itself (every filter chip carries its own facet count). */
  var total = $('#licTotal');
  if(total) total.textContent = DATA().licenses.length;
  if(searching || !vis) syncPagerUnpaged('#licensesView .pager', vis);
  else syncPager('#licensesView .pager', licPage);
  syncLicChipCounts();
  syncLicApplied();
  renderLicMenus();
}
/* ---------- what each chip would show ------------------------------------------
   ⚠️ A FACET COUNT, not a total: each chip counts the rows it would leave if IT were
   the pressed one, with every OTHER filter still applied. So `Subscription 9` means
   nine subscriptions among what you are currently looking at, not nine in the account —
   which is the only reading that stays true while another filter is on.
   ⚠️ The chip's own group is excluded from its own count, because the type chips are
   mutually exclusive: counting `Perpetual` through the `Subscription` filter would
   always print 0 and the row of chips would read as an empty list. */
function syncLicChipCounts(){
  var base = currentProducts().filter(function(p){
    return licStatusMatch(p, licStatus);
  });
  /* ⚠️ THE COUNT IS A FACET, not a total: the chip stands BESIDE a status dropdown, so the
     honest answer is "how many of what the dropdown is showing need attention" — type and
     status both applied, only its own on/off excluded. Counting through itself would print
     the number already on screen, which is a count of the view rather than of the offer.
     ⚠️ Toolbar A read this chip the other way round (there `Needs attention` WAS the
     status, so the count had to exclude the status filter). A retired 2026-10-01 and the
     second reading went with it. */
  var attnC = $('#licBarC .chipcount');
  if(attnC) attnC.textContent = base.filter(licNeedsAttention).length;
}
renderProducts();
wireLicenseRows('#licensesView', { from:'licenses', rerender: renderProducts });
/* ⚠️ THE CARD HOST IS WIRED SEPARATELY, and it has to be: `wireLicenseRows` finds the
   licence through `closest(rowSel)`, and the card is `.lcard` while the table's row is
   `.lic-row`. Same call Home makes for its grid, with this page's `from` and rerender.
   ⚠️ TWO LISTENERS, NESTED, AND THEY DO NOT COLLIDE: `#prodCards` is inside
   `#licensesView`, so a click inside a card runs this one first. Every menu branch calls
   `stopPropagation`, and the one that does not — opening the licence — leaves the outer
   listener looking for a `.lic-row` that is not there, which is a no-op. */
wireLicenseRows('#prodCards', { from:'licenses', rerender: renderProducts, rowSel:'.lcard' });
// modal mode: a change made inside the details modal restates this page too
if(window.LicenseDetails) LicenseDetails.setRerender(renderProducts);

/* ============================================================================
   TOOLBAR B — the two-dropdown proposal (2026-09-28, by request)
   ============================================================================
   ⚠️ THE MENUS ARE BUILT FROM `LIC_TYPE_OPTS` / `LIC_STATUS_OPTS` in components.js, and
   the styleguide's specimen reads the same two lists. One declaration of what the
   filters offer; three places that draw it.
   ⚠️ THE COUNTS ARE OF THE ACCOUNT, NOT OF THE CURRENT VIEW — and this is the one place
   the two toolbars deliberately disagree. Toolbar A's chips carry a FACET count ("how
   many would be left if this were the pressed one"), which moves as other filters move;
   B's carry the whole account, because the brief's test for them is that they add up to
   the number in the page title. Both readings are defensible and they cannot both be
   true at once, so the difference is stated rather than smoothed over.
   ⚠️ `Needs attention` is the exception to the adding-up: it counts across the three
   states rather than beside them (B8 is Blocked AND needs attention), which is exactly
   why it sits under a rule. 15 + 1 + 1 = 17; attention is 5 of those 17. */
function licTypeCount(v){
  return DATA().licenses.filter(function(p){ return p.type === v; }).length;
}
function licStatusCount(v){
  return DATA().licenses.filter(function(p){ return licStatusMatch(p, v); }).length;
}
/* ⚠️ THE MENU BUILDER, THE LABEL AND THE WIRING MOVED TO `components.js` (2026-09-28,
   second pass) — the Invoices toolbar wanted the same control, and the choice at that
   point is one shared builder or a second copy that starts identical. What stays here
   is only what is about LICENCES: which lists, which counts, what a pick does. */
function renderLicMenus(){
  var total = DATA().licenses.length;
  var tm = $('#licTypeMenu'), sm = $('#licStatusMenu');
  if(tm) tm.innerHTML = filterMenuHTML('lictype', LIC_TYPE_OPTS, licType, 'All types', total, licTypeCount);
  if(sm) sm.innerHTML = filterMenuHTML('licstatus', LIC_STATUS_OPTS, licStatus, 'All statuses', total, licStatusCount);
  var tl = $('#licTypeLabel'), sl = $('#licStatusLabel');
  if(tl) tl.textContent = filterOptLabel(LIC_TYPE_OPTS, licType, 'All types');
  if(sl) sl.textContent = filterOptLabel(LIC_STATUS_OPTS, licStatus, 'All statuses');
  /* ⚠️ C's pair reads the SAME variables and the same counts — it is the same filter
     with a different list of answers (`LIC_STATUS_OPTS_C` drops `Needs attention`,
     which is C's switch). A reader switching between B and C keeps what they set. */
  var tmc = $('#licTypeMenuC'), smc = $('#licStatusMenuC');
  if(tmc) tmc.innerHTML = filterMenuHTML('lictypec', LIC_TYPE_OPTS, licType, 'All types', total, licTypeCount);
  if(smc) smc.innerHTML = filterMenuHTML('licstatusc', LIC_STATUS_OPTS_C, licStatus, 'All statuses', total, licStatusCount);
  /* ⚠️ C's TWO LABELS ARE WRITTEN BY `syncLicTriggersC`, not here: at phone width they
     say the answer and its size rather than the question, so they are the one pair in
     this function whose text depends on the WIDTH. One writer, so the two cannot
     disagree about what the trigger says. */
  syncLicTriggersC();
  syncAttnChipC();
}
/* ⚠️ C'S ATTENTION CONTROL IS A CHIP (2026-09-30, by request) — it was a `.switch`, and
   the reason it changed is the COUNT: a switch cannot say how many it would leave you.
   Same component as toolbar A's chip, different state behind it: A's chip IS the status
   (`licStatus === 'attention'`), C's is an independent AND on top of one
   (`licAttnOnly`). Same object, two readings, and that difference is the whole point of
   toolbar C — see `licVisible`. */
function syncAttnChipC(){
  var chip = $('#licAttnChipC'); if(!chip) return;
  chip.classList.toggle('is-on', licAttnOnly);
  chip.setAttribute('aria-pressed', licAttnOnly ? 'true' : 'false');
}
/* ============================================================================
   TOOLBAR C AT PHONE WIDTH (2026-10-01, by request)
   ============================================================================
   Three rows: the field, a sideways-scrolling row of filters, and the applied ones as
   chips. The layout half is in the stylesheet; what lives here is the three things CSS
   cannot do — what a trigger SAYS, what "applied" means, and what a bottom sheet counts.
   ⚠️⚠️ SCOPED TO C, by decision. The brief describes a row holding "the chip filter and
   the two dropdowns", which is C's composition and only C's: A is four chips and no
   dropdown, B is two dropdowns and no chip. A and B keep the phone treatment they have.
   ⚠️ THE DESKTOP IS UNTOUCHED. Every rule below either runs only while `onLicPhone()` or
   writes into a node the desktop hides. */

/* ⚠️⚠️ WHAT A TRIGGER SAYS AT THIS WIDTH: the ANSWER and its size, not the question.
   `Subscription 11`, and at rest `All 17` — by request. The desktop keeps `All types` /
   `All statuses`, which name the question, because there the two triggers sit side by
   side with room for both words.
   ⚠️ THE COST, NAMED: at rest the two triggers both read `All 17`, so the face no longer
   says which filter is which. What still does is the order (type, then status, as on the
   desktop) and `aria-label`, which keeps naming the filter for a screen reader. If the
   pair turns out to be unreadable, the fix is one word back in each default label.
   ⚠️ THE COUNT IS OF THE ACCOUNT, not of the current view — the reading B and C already
   use for these two controls, and the one that makes the numbers add up to the page
   title. See the note over `licTypeCount`. */
function syncLicTriggersC(){
  var phone = onLicPhone(), total = DATA().licenses.length;
  [['#licTypeLabelC', '#licTypeCountC', LIC_TYPE_OPTS, licType, 'All types', licTypeCount],
   ['#licStatusLabelC', '#licStatusCountC', LIC_STATUS_OPTS_C, licStatus, 'All statuses', licStatusCount]]
    .forEach(function(spec){
      var lab = $(spec[0]), cnt = $(spec[1]);
      if(!lab || !cnt) return;
      var v = spec[3];
      lab.textContent = phone ? (v ? filterOptLabel(spec[2], v, 'All') : 'All')
                              : filterOptLabel(spec[2], v, spec[4]);
      cnt.textContent = phone ? (v ? spec[5](v) : total) : '';
    });
}

/* ---------- what is applied, and how to take one off ----------------------------
   ⚠️ ONE LIST, READ BY BOTH THE CHIP ROW AND THE EMPTY STATE. "Is anything applied" is
   asked in two places and must not be two predicates — an empty state offering
   `Clear filters` while the chip row shows none is the pair disagreeing about the same
   fact. `clear` is carried with each entry so removing one chip cannot drift from what
   that chip claims to be.
   ⚠️ THE TOOLBAR'S THREE CONTROLS, and only those. */
function licAppliedList(){
  var out = [];
  if(licType) out.push({ k:'type', t:filterOptLabel(LIC_TYPE_OPTS, licType, ''),
    clear:function(){ licType = null; } });
  if(licStatus) out.push({ k:'status', t:filterOptLabel(LIC_STATUS_OPTS_C, licStatus, ''),
    clear:function(){ licStatus = null; licStatusTouched = true; } });
  if(licAttnOnly) out.push({ k:'attn', t:'Needs attention',
    clear:function(){ licAttnOnly = false; } });
  return out;
}
function licHasFilters(){ return licAppliedList().length > 0; }
/* ⚠️ THE ROW ITSELF IS `syncAppliedRow` / `wireAppliedRow` in components.js now
   (2026-10-01): four pages draw this row and only the LIST differs. What stays here is
   `licAppliedList` above — the licence page's own answer to "what is applied, and how do
   I take one off". The per-page `data-licunset` attribute went with the move; the shared
   row uses `data-unset`, scoped to its own host rather than to the document. */
function syncLicApplied(){ syncAppliedRow('#licAppliedC', licAppliedList); }
wireAppliedRow('#licAppliedC', licAppliedList, function(){
  licPage.page = 1;
  syncTypeChips(); syncAttnChip(); syncAttnChipC(); licApply();
});

/* ---------- the bottom sheets ---------------------------------------------------
   ⚠️⚠️ CAPTURE PHASE, and that is the whole trick. `wireFilterDrop` has already bound a
   click on this same trigger to open the inline menu, and it cannot be unbound. Catching
   the press on the way DOWN lets the phone take it and stop it before the menu handler
   ever runs; above 600 this listener declines and the desktop menu opens exactly as it
   always has. One control, two presentations, no second wiring to keep in step.
   ⚠️ `countWith` IS THE WHOLE PREDICATE with the pending answer swapped in — not a count
   of that answer on its own. `Show 11 licenses` has to mean what the list will actually
   hold, which is this filter AND the other two AND the query. Built by cloning the
   current state, moving one field and running `licPasses` over it. */
function licCountWith(field, v){
  var t = licType, st = licStatus;
  if(field === 'type') licType = v; else licStatus = v;
  var n = currentProducts().filter(licPasses).length;
  licType = t; licStatus = st;
  return n;
}
/* ⚠️ `wireLicSheet` IS GONE — it became `wireSheetTrigger` in components.js when three
   more pages wanted the same capture-phase trick (2026-10-01). The spec is handed over as
   a FUNCTION there rather than an object, so the counts are read at open time instead of
   at wiring time; that is the only call-site difference. */
function wireLicSheet(ctlSel, spec){
  wireSheetTrigger(ctlSel, function(){
    return {
      title: spec.title, opts: spec.opts, current: spec.get(), allLabel:'All',
      total: DATA().licenses.length, countOf: spec.countOf,
      countWith: function(v){ return licCountWith(spec.field, v); },
      noun:'license', nounPlural:'licenses',
      onApply: function(v){ spec.set(v); }
    };
  });
}
wireLicSheet('#licTypeCtlC', { title:'License type', field:'type', opts:LIC_TYPE_OPTS,
  get:function(){ return licType; }, countOf:licTypeCount,
  set:function(v){ licType = v; licPage.page = 1; syncTypeChips(); licApply(); } });
wireLicSheet('#licStatusCtlC', { title:'Status', field:'status', opts:LIC_STATUS_OPTS_C,
  get:function(){ return licStatus; }, countOf:licStatusCount,
  set:function(v){ licStatus = v; licStatusTouched = true; licPage.page = 1; syncAttnChip(); licApply(); } });

/* ⚠️ THE EMPTY STATE MOVED TO `components.js` as `constraintEmptyHTML` (2026-10-01):
   three more pages wanted the same three sentences and the same three exits, and the only
   thing that differed was the noun. What stays here is the licence page's own answer to
   "is anything applied" — see `licHasFilters`. */
function licNoResultsHTML(q){ return constraintEmptyHTML(q, licHasFilters(), 'licenses'); }

wireFilterDrop('#licTypeCtl', 'lictype', function(v){ licType = v; licPage.page = 1; syncTypeChips(); licApply(); });
wireFilterDrop('#licStatusCtl', 'licstatus', function(v){ licStatus = v; licStatusTouched = true; licPage.page = 1; syncAttnChip(); licApply(); });
wireFilterDrop('#licTypeCtlC', 'lictypec', function(v){ licType = v; licPage.page = 1; syncTypeChips(); licApply(); });
wireFilterDrop('#licStatusCtlC', 'licstatusc', function(v){ licStatus = v; licStatusTouched = true; licPage.page = 1; syncAttnChip(); licApply(); });
var licAttnChipC = $('#licAttnChipC');
if(licAttnChipC) licAttnChipC.addEventListener('click', function(){
  licAttnOnly = !licAttnOnly;
  licPage.page = 1;
  syncAttnChipC(); licApply();
});

/* ---------- the switch ------------------------------------------------------------
   ⚠️ NAMED ON `window` because the ⚙ panel calls it by name from shared.js, which loads
   before this file. Same contract `renderProducts` already has with the panel.
   ⚠️ IT DISPATCHES A `resize`. `wireStickyFrame` measures the toolbar's height into
   `--barH` — the offset the column row sticks at — and the two toolbars are not the same
   height. Without this the column row would stick at the height of whichever toolbar
   happened to be visible when the page loaded. */
/* ⚠️ ONE TOOLBAR SINCE 2026-10-01, so this no longer SWITCHES anything — what is left is
   the one decision that was never about the switch: the toolbar opens on `Active`.
   ⚠️ `attention` ARRIVES FROM OUTSIDE, so the translation stays: Home's banner links with
   `?attention=1`, which sets `licStatus`, and this toolbar asks that question with a chip
   of its own rather than as a fourth status. Without the line the trigger would read
   `All statuses` over a list of five. */
function applyLicBar(){
  if(licStatus === 'attention'){ licStatus = null; licAttnOnly = true; }
  if(licStatus === null && !licStatusTouched) licStatus = 'active';
  syncAttnChip(); licApply();
  /* the column row sticks under the toolbar, and `wireStickyFrame` measures that height
     into `--barH` — the measurement has to be re-taken after the bar is settled */
  window.dispatchEvent(new Event('resize'));
}
window.applyLicBar = applyLicBar;

/* ⚠️ `syncTypeChips` IS A NO-OP AND IS KEPT AS ONE (2026-10-01). The type CHIPS were
   toolbar A's; this toolbar asks the same question with a dropdown, which states its own
   answer. Every caller that sets `licType` still calls it, so the day a chip comes back
   there is one place to put it — and emptying the body is cheaper than deleting nine call
   sites and the `licType` contract with them. */
function syncTypeChips(){}
/* the chip IS the `?attention=1` state — see the note on licParams */
function syncAttnChip(){
  var chip = $('#licAttnChip'); if(!chip) return;
  var on = licStatus === 'attention';
  chip.classList.toggle('is-on', on);
  chip.setAttribute('aria-pressed', on ? 'true' : 'false');
  /* ⚠️⚠️ A PRESSED CHIP PULLS ITSELF INTO VIEW, and this is not polish. The phone's chip
     row scrolls sideways and this chip is the LAST thing in it — measured at 390 the row
     is 593px of chips in a 358px window, so `Needs attention` starts 235px past the right
     edge. Going looking for a filter you want is fine; arriving from the Home banner to
     find five rows and every VISIBLE control reading "off" is not. It moves only when it
     is on and only when it is actually out of view, so nothing jumps under the hand of
     someone who is scrolling the row themselves. */
  if(!on) return;
  var seg = chip.parentNode;
  if(!seg || seg.scrollWidth <= seg.clientWidth) return;
  var over = chip.getBoundingClientRect().right - seg.getBoundingClientRect().right;
  if(over > 0) seg.scrollLeft += over + 8;
}
var licAttnChip = $('#licAttnChip');
if(licAttnChip) licAttnChip.addEventListener('click', function(){
  licStatus = (licStatus === 'attention') ? null : 'attention';
  licStatusTouched = true;
  licPage.page = 1;
  syncAttnChip(); licApply();
});
$$('#licensesView .typechip').forEach(function(chip){
  chip.addEventListener('click', function(){
    var t = chip.getAttribute('data-type');
    licType = (licType === t) ? null : t;
    licPage.page = 1;
    syncTypeChips();
    licApply();
  });
});
/* ⚠️⚠️ `Active only` IS GONE (2026-10-01) — the switch, its phone chip, `licShowCanceled`,
   `syncCanceledControls` and `setShowCanceled`. It was toolbar A's, and the toolbar that
   won does not read it: its Status dropdown offers `Canceled` as one of four answers, and
   a switch that pre-hid those rows would both contradict the menu and make its own
   `Canceled 1` count unreachable. That was B's proposal and it is now the page.
   ⚠️ THE STORE KEY `showCanceled` IS LEFT, not migrated — the store is a demo, and an
   unread key costs nothing. `Reset demo data` drops it with everything else.
   ⚠️ CAUGHT BY THE PAGE FAILING TO LOAD, not by reading: `$('#licCanceled')` returned null
   the moment A's markup went, and `syncCanceledControls()` runs at boot. */

// + New license → the wizard; product and billing type are chosen on its step 1
/* ⚠️ EVERY toolbar carries one, and they are separate nodes rather than one moved
   between them: each toolbar is a whole layout, and a button that hopped hosts on every
   switch would be the one control whose position depended on history.
   ⚠️ Selected by CLASS, not by an id per toolbar — see licQuery for what an id list
   costs when a toolbar is added. */
$$('.lic-controls [id^="licNewBtn"]').forEach(function(b){
  b.addEventListener('click', function(){ NL.open({}); });
});
/* delegated: the empty state's button is rendered and destroyed with the table */
document.addEventListener('click', function(e){
  if(e.target.closest('#licEmptyBuy')) NL.open({});
  /* the way out of a filter that matches nothing — it clears what the reader set and
     nothing else, so a search query they also typed is left alone */
  if(e.target.closest('[data-clearfilters]')){
    licType = null; licStatus = null; licAttnOnly = false; licStatusTouched = true;
    licPage.page = 1;
    syncTypeChips(); syncAttnChip(); syncAttnChipC(); licApply();
  }
  /* ⚠️ THE ONLY CONTROL THAT CLEARS BOTH, and it exists because the empty state has to
     be able to offer it: with a query AND filters on, undoing one of them can still
     leave nothing, and a reader who has pressed `Clear search` to no effect has learnt
     only that the page is not listening. Clearing the field by hand rather than through
     `wireSearch` keeps this one branch — the re-render below covers both halves. */
  if(e.target.closest('[data-clearall]')){
    var f = $('.lic-controls:not([hidden]) .searchbox input');
    if(f) f.value = '';
    licType = null; licStatus = null; licAttnOnly = false; licStatusTouched = true;
    licPage.page = 1;
    syncTypeChips(); syncAttnChip(); syncAttnChipC(); licApply();
  }
});

/* ---------- search: plan name, product, type and label ----------------------
   ⚠️ WIRED TWICE, ONCE PER TOOLBAR, and not once against "the first search box on the
   page". `$()` returns the first match, so a single call would have bound toolbar A's
   field for ever and left B's inert — the kind of break that looks like "typing does
   nothing" rather than like an error. Each field filters the same rows; only one of the
   two is on screen at a time, so they cannot fight.
   ⚠️ THE QUERY DOES NOT SURVIVE THE SWITCH, and that is left as it is: the field is part
   of the toolbar being compared, and carrying text from one into the other would be this
   code deciding that the two search boxes are one control. Noted in the report. */
/* ⚠️⚠️ THE RE-RENDER IS NOW `wireSearch`'s `before` HOOK, NOT A SECOND LISTENER
   (2026-10-01). It was bound here, ahead of `wireSearch`, and the ORDER was the trick:
   this redraws the table and the hiding pass then runs over what was just drawn. The
   brief asks for a debounce, and two debounced listeners would be two timers racing for
   that order — so there is one timer now, and the redraw is a hook inside it. The order
   is a property of the function instead of a property of the binding order.
   ⚠️ 160ms: long enough that a word typed at speed redraws a list of seventeen once or
   twice rather than per letter, short enough that it does not read as lag. */
var LIC_SEARCH_DEBOUNCE = 160;
/* ⚠️ `wireSearch` takes a SELECTOR, not a node, and resolves it with `$` — so it has to
   be given one selector per field rather than one that matches them all. The ids are
   derived from the toolbars present in the markup instead of retyped. */
$$('.lic-controls').map(function(bar){ return '#' + bar.id + ' .searchbox input'; })
  .forEach(function(sel){
  var runFor = wireSearch(sel, {
    before: renderProducts,
    debounce: LIC_SEARCH_DEBOUNCE,
    /* ⚠️ THE HOST IS ASKED EACH RUN, not captured: the phone and the desktop keep their
       lists in two different boxes, and which one is live changes with the window. */
    items: function(){ return onLicPhone() ? $$('#prodCards > .lcard')
                                           : $$('#licensesView tbody tr.lic-row'); },
    /* ⚠️ THE RECORD, NOT THE NODE — see `licSearchText` for why, and for the eight fields
       it reads. `idx` is the position in `licRendered`, which `renderProducts` writes in
       the same order it draws, so the two cannot fall out of step. */
    text:  function(el, idx){ var p = licRendered[idx]; return p ? licSearchText(p) : ''; },
    host:  function(){ return onLicPhone() ? $('#prodCards') : $('#licensesView tbody'); },
    empty: function(q){
      return onLicPhone() ? licNoResultsHTML(q)
        : '<tr><td class="noresults-cell" colspan="' + licColSpan() + '">'
          + licNoResultsHTML(q) + '</td></tr>';
    }
  });
  /* the bar this field belongs to — `licApply` needs to know which run is the live one */
  var field = $(sel);
  licSearchRuns.push({ bar: field && field.closest('.lic-controls'), run: runFor });
});

/* ⚠️ LAST, and it is what puts the stored variant and `?attention=1` on screen. It
   re-renders, so the boot render above is the one that fills the table and this is the
   one that agrees with the controls. */
wirePager('#licensesView .pager', licPage, renderProducts);
applyLicBar();

/* ---------- arriving from the Presentation switch ------------------------------
   ⚠️ LAST IN THE FILE, and it has to be: the modal is mounted by `license-details.js`
   and the rows behind it by `renderProducts()` above, so anything earlier would open
   a surface over a list that is not drawn yet.
   ⚠️ It opens the modal DIRECTLY rather than through `openLicenseDetails`, which
   reads `licDetailsMode()` — and the mode has just been set to `modal`, so routing
   through it would work by luck. This route exists to show a modal; it says so. */
if(licOpenId && window.LicenseDetails){
  var licToOpen = licById(licOpenId);
  if(licToOpen) LicenseDetails.openModal(licToOpen);
}

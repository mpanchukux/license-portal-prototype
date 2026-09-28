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
var licShowCanceled = !!Store.get('showCanceled');
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
var licParams = new URLSearchParams(location.search);
if(licParams.get('attention') === '1') licStatus = 'attention';
/* ⚠️ `licNeedsAttention` MOVED TO components.js (2026-09-28). Three surfaces read it
   now — both toolbars and the styleguide's specimen — and the predicate the Home banner
   and this list must agree on does not belong to one page's script. */

function currentProducts(){
  var all = DATA().licenses.slice();
  /* ⚠️ THE SORT TRAVELS WITH THE VARIANT — see licSortB. A stays newest-first. */
  return licTable() === 'b' ? licSortB(all)
    : all.sort(function(a, b){ return dateKey(b.created) - dateKey(a.created); });
}
/* ---------- one predicate, both toolbars --------------------------------------
   ⚠️ THE THIRD LINE IS THE ONLY DIFFERENCE BETWEEN THE TWO, and writing it as a
   condition rather than as a second copy of this function is what keeps them comparable:
   whatever else changes, both toolbars are filtering the same list the same way, and the
   proposal is exactly one clause wide. */
function licPasses(p){
  if(licType && p.type !== licType) return false;
  if(!licStatusMatch(p, licStatus)) return false;
  if(licBar() === 'a' && !licShowCanceled && p.status === 'canceled') return false;
  return true;
}
function renderProducts(){
  $('#prodHead').innerHTML = licHeadHTML();
  var vis = 0, html = '';
  currentProducts().forEach(function(p){
    if(!licPasses(p)) return;
    vis++; html += licRowHTML(p);
  });
  /* ⚠️ "Empty" here means the ACCOUNT owns nothing — not that a filter hid everything.
     A type chip that leaves no rows is the reader's own doing and keeps its toolbar,
     because the way out is to unset the filter they set. The empty state is for the
     account that has never bought anything. */
  var accountEmpty = currentProducts().length === 0;
  if(accountEmpty){
    $('#prodBody').innerHTML = emptyStateRow(licColSpan(), {   // the variant decides the span
      title:'No licenses yet.',
      line:'Buy a license to get a key for your ThingsBoard or TBMQ instance.',
      /* the ONE primary a new account gets, and it opens the same wizard the
         toolbar's "+ New license" does — one action, not a second way in */
      action:'<button class="btn btn--primary btn--md" id="licEmptyBuy">Buy a license</button>'
    });
  } else if(!vis){
    /* ⚠️ A FILTER THAT MATCHES NOTHING IS NOT AN EMPTY ACCOUNT — see the two empties
       named above. This one keeps the toolbar (the way out is to undo what you set) and
       says which kind of nothing it is. `licColSpan()` because the two table variants
       are four columns and five. */
    $('#prodBody').innerHTML = '<tr><td colspan="' + licColSpan() + '" class="noresults-cell">'
      + noMatchHTML() + '</td></tr>';
  } else {
    $('#prodBody').innerHTML = html;
  }
  syncListEmpty(accountEmpty);
  /* ⚠️ THE ACCOUNT'S TOTAL, not the filtered count. The chip sits with the TITLE, and the
     title names the page rather than the current filter — a number beside it that fell to
     3 when a chip was pressed would be describing the toolbar, which already describes
     itself (every filter chip carries its own facet count). */
  var total = $('#licTotal');
  if(total) total.textContent = DATA().licenses.length;
  /* ⚠️ THROUGH THE SHARED FOOTER (2026-09-28), not a hand-written count. This list
     renders every row and pages nothing — see `syncPagerUnpaged` and the report — so it
     reports one page, which is both true and what hides the four arrows and the
     items-per-page select that nothing here has ever read. */
  syncPagerUnpaged('#licensesView .pager', vis);
  syncLicChipCounts();
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
    if(!licStatusMatch(p, licStatus)) return false;
    if(!licShowCanceled && p.status === 'canceled') return false;
    return true;
  });
  $$('#licBarA .chipcount').forEach(function(el){
    var k = el.getAttribute('data-count'), n;
    if(k === 'active') n = currentProducts().filter(function(p){ return p.status !== 'canceled'; }).length;
    /* ⚠️ The attention chip's own facet, on the same rule as the type chips: how many
       would be left if IT were the pressed one, with the type filter still applied and
       its OWN state excluded — counting through itself would always print the number
       already on screen, which is a count of the view rather than of the offer. */
    else if(k === 'attention') n = currentProducts().filter(function(p){
      return (!licType || p.type === licType)
        && (licShowCanceled || p.status !== 'canceled')
        && licNeedsAttention(p);
    }).length;
    else n = base.filter(function(p){ return p.type === k; }).length;
    el.textContent = n;
  });
}
renderProducts();
wireLicenseRows('#licensesView', { from:'licenses', rerender: renderProducts });
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
/* ⚠️ `All` IS AN OPTION, NOT AN ABSENCE. A menu whose only way back to everything is
   "click the selected one again" hides its own exit; the brief asks for both filters to
   start at All, so All has to be somewhere a reader can point at. */
function licMenuHTML(kind, opts, current, allLabel, countOf){
  var total = DATA().licenses.length;
  return '<button type="button" role="menuitemradio" class="dropcheck' + (current ? '' : ' is-on') + '"'
      + ' data-' + kind + '="" aria-checked="' + (current ? 'false' : 'true') + '">'
      + '<svg class="ic cc-check" aria-hidden="true"><use href="assets/icons.svg#ti-check"></use></svg>'
      + '<span>' + allLabel + '</span><span class="dropcount">' + total + '</span></button>'
    + opts.map(function(o){
        var on = current === o.v;
        return (o.sep ? '<div class="dropsep" role="separator"></div>' : '')
          + '<button type="button" role="menuitemradio" class="dropcheck' + (on ? ' is-on' : '') + '"'
          + ' data-' + kind + '="' + o.v + '" aria-checked="' + (on ? 'true' : 'false') + '">'
          + '<svg class="ic cc-check" aria-hidden="true"><use href="assets/icons.svg#ti-check"></use></svg>'
          + '<span>' + o.t + '</span><span class="dropcount">' + countOf(o.v) + '</span></button>';
      }).join('');
}
/* ⚠️ THE TRIGGER STATES THE ANSWER, so a narrowed list is readable without opening the
   menu — the same contract Activity's period and event-type triggers keep. */
function licOptLabel(opts, v, allLabel){
  if(!v) return allLabel;
  var hit = opts.filter(function(o){ return o.v === v; })[0];
  return hit ? hit.t : allLabel;
}
function renderLicMenus(){
  var tm = $('#licTypeMenu'), sm = $('#licStatusMenu');
  if(tm) tm.innerHTML = licMenuHTML('lictype', LIC_TYPE_OPTS, licType, 'All types', licTypeCount);
  if(sm) sm.innerHTML = licMenuHTML('licstatus', LIC_STATUS_OPTS, licStatus, 'All statuses', licStatusCount);
  var tl = $('#licTypeLabel'), sl = $('#licStatusLabel');
  if(tl) tl.textContent = licOptLabel(LIC_TYPE_OPTS, licType, 'All types');
  if(sl) sl.textContent = licOptLabel(LIC_STATUS_OPTS, licStatus, 'All statuses');
}
/* One wiring for both dropdowns: the trigger opens, the menu picks, a click outside
   closes. ⚠️ `closeAllMenus()` BEFORE the toggle, and `willOpen` read BEFORE the close —
   the same two lines `wirePeriod` needed once two dropdowns could be open at once. */
function wireLicDrop(ctlSel, attr, set){
  var ctl = $(ctlSel); if(!ctl) return;
  var btn = $('.perbtn', ctl), menu = $('.dropmenu', ctl);
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    var willOpen = menu.hidden;
    if(typeof closeAllMenus === 'function') closeAllMenus();
    menu.hidden = !willOpen;
    btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  });
  menu.addEventListener('click', function(e){
    var row = e.target.closest('[data-' + attr + ']'); if(!row) return;
    e.stopPropagation();
    /* ⚠️ Single-select, so the menu CLOSES on a pick — unlike Activity's event types,
       which is multi-select and has to stay open while two are ticked. Same component,
       different arity, and the arity is what decides. */
    set(row.getAttribute('data-' + attr) || null);
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('click', function(e){
    if(ctl.contains(e.target)) return;
    menu.hidden = true; btn.setAttribute('aria-expanded', 'false');
  });
}
wireLicDrop('#licTypeCtl', 'lictype', function(v){ licType = v; syncTypeChips(); renderProducts(); });
wireLicDrop('#licStatusCtl', 'licstatus', function(v){ licStatus = v; syncAttnChip(); renderProducts(); });

/* ---------- the switch ------------------------------------------------------------
   ⚠️ NAMED ON `window` because the ⚙ panel calls it by name from shared.js, which loads
   before this file. Same contract `renderProducts` already has with the panel.
   ⚠️ IT DISPATCHES A `resize`. `wireStickyFrame` measures the toolbar's height into
   `--barH` — the offset the column row sticks at — and the two toolbars are not the same
   height. Without this the column row would stick at the height of whichever toolbar
   happened to be visible when the page loaded. */
function applyLicBar(){
  var b = licBar() === 'b';
  var A = $('#licBarA'), B = $('#licBarB');
  if(A) A.hidden = b;
  if(B) B.hidden = !b;
  /* ⚠️ A CANNOT SHOW A STATE IT HAS NO CONTROL FOR. Its only status control is the
     attention chip, so any other value is dropped on the way back rather than left
     narrowing the list invisibly — the fault this whole pass exists to remove. */
  if(!b && licStatus && licStatus !== 'attention') licStatus = null;
  syncTypeChips(); syncAttnChip(); renderProducts();
  window.dispatchEvent(new Event('resize'));
}
window.applyLicBar = applyLicBar;

/* Type chips are mutually exclusive: pick one, switch to the other, or click the
   active one again to clear the filter and see everything. */
function syncTypeChips(){
  $$('#licBarA .typechip').forEach(function(c){
    var on = c.getAttribute('data-type') === licType;
    c.classList.toggle('is-on', on);
    c.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}
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
  syncAttnChip(); renderProducts();
});
$$('#licensesView .typechip').forEach(function(chip){
  chip.addEventListener('click', function(){
    var t = chip.getAttribute('data-type');
    licType = (licType === t) ? null : t;
    syncTypeChips();
    renderProducts();
  });
});
/* Two controls, one state: the desktop switch and the phone's Canceled chip. Both
   write through the same setter so whichever the viewer used, the other agrees the
   moment the breakpoint changes. */
/* ⚠️ THE CONTROL IS INVERTED, THE STATE IS NOT. The switch reads `Active only`, so it is
   CHECKED when canceled licences are hidden — `checked === !licShowCanceled`. The stored
   key keeps its old name and its old meaning on purpose: renaming it would have silently
   flipped what every existing stored value means, and the store is shared with nothing
   that could have told us. One inversion, in one place, at the edge. */
var licCanceledBox = $('#licCanceled'), licCanceledChip = $('#licCanceledChip');
function syncCanceledControls(){
  licCanceledBox.checked = !licShowCanceled;
  if(licCanceledChip){
    licCanceledChip.classList.toggle('is-on', !licShowCanceled);
    licCanceledChip.setAttribute('aria-pressed', !licShowCanceled ? 'true' : 'false');
  }
}
function setShowCanceled(v){
  licShowCanceled = !!v;
  Store.set('showCanceled', licShowCanceled);
  syncCanceledControls();
  renderProducts();
}
syncCanceledControls();                            // reflect the stored choice on load
licCanceledBox.addEventListener('change', function(){ setShowCanceled(!this.checked); });
if(licCanceledChip) licCanceledChip.addEventListener('click', function(){ setShowCanceled(!licShowCanceled); });

// + New license → the wizard; product and billing type are chosen on its step 1
/* ⚠️ BOTH toolbars carry one, and they are two nodes rather than one moved between
   them: each toolbar is a whole layout, and a button that hopped hosts on every switch
   would be the one control whose position depended on history. */
$$('#licNewBtn, #licNewBtnB').forEach(function(b){
  b.addEventListener('click', function(){ NL.open({}); });
});
/* delegated: the empty state's button is rendered and destroyed with the table */
document.addEventListener('click', function(e){
  if(e.target.closest('#licEmptyBuy')) NL.open({});
  /* the way out of a filter that matches nothing — it clears what the reader set and
     nothing else, so a search query they also typed is left alone */
  if(e.target.closest('[data-clearfilters]')){
    licType = null; licStatus = null;
    syncTypeChips(); syncAttnChip(); renderProducts();
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
['#licBarA .searchbox input', '#licBarB .searchbox input'].forEach(function(sel){
  wireSearch(sel, {
    items: function(){ return $$('#licensesView tbody tr.lic-row'); },
    // the row already carries every one of those as text, so the row IS the query
    text:  function(tr){ return stripText(tr.innerHTML); },
    host:  function(){ return $('#licensesView tbody'); },
    empty: function(q){ return '<tr><td class="noresults-cell" colspan="' + licColSpan() + '">'
                              + noResultsHTML(q) + '</td></tr>'; }
  });
});

/* ⚠️ LAST, and it is what puts the stored variant and `?attention=1` on screen. It
   re-renders, so the boot render above is the one that fills the table and this is the
   one that agrees with the controls. */
applyLicBar();

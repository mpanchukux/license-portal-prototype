/* ============================================================================
   page-licenses.js — the licence list: one product-first table rendered from the
   current dataset, a mutually-exclusive Type filter, the canceled toggle and the
   split "+ New license" button. Row behaviour is shared with the Home block.
   ⚠️ THE INSTANCES VIEW LEFT THIS FILE (2026-09-23). It was a second slicing of the
   same data behind a tablist that also stood in for the page title, and it had to hide
   half the shared toolbar to work. It is `instances.html` / `page-instances.js` now;
   the row builders stayed in components.js, where the licence panel also reads them.
   ============================================================================ */

/* Type filter: null = nothing selected = every licence shown. */
var licType = null;
/* Cancelled licences are out of the way until asked for. The choice is a stored
   setting like the dashboard state, so it survives navigation and refresh. */
var licShowCanceled = !!Store.get('showCanceled');
/* ⚠️ ONE URL parameter now, and it arrives from a Home banner rather than from a menu:
   `?attention=1` is where "3 other licenses need attention" lands. It exists so a
   banner can hand the reader a filtered surface instead of a list to search.
   ⚠️ `?view=instances` WAS THE SECOND ONE and is gone with the view toggle — the
   blocked banner's route is `instances.html?lic=…` now. A stale link carrying the old
   parameter lands on a plain Licenses page, which is wrong but not broken. */
var licParams = new URLSearchParams(location.search);
var licAttentionOnly = licParams.get('attention') === '1';
/* Does this licence have something wrong with it? One reading, shared with the Home
   banner's own count — see attentionConditions. */
function licNeedsAttention(l){
  return attentionConditions().some(function(c){
    return c.state !== 'grant' && c.lic && c.lic.id === l.id;
  });
}

function currentProducts(){
  return DATA().licenses.slice().sort(function(a, b){ return dateKey(b.created) - dateKey(a.created); });
}
function renderProducts(){
  $('#prodHead').innerHTML = headHtml();
  var vis = 0, html = '';
  currentProducts().forEach(function(p){
    if(licType && p.type !== licType) return;
    if(licAttentionOnly && !licNeedsAttention(p)) return;
    if(!licShowCanceled && p.status === 'canceled') return;
    vis++; html += rowHtml(p);
  });
  /* ⚠️ "Empty" here means the ACCOUNT owns nothing — not that a filter hid everything.
     A type chip that leaves no rows is the reader's own doing and keeps its toolbar,
     because the way out is to unset the filter they set. The empty state is for the
     account that has never bought anything. */
  var accountEmpty = currentProducts().length === 0;
  if(accountEmpty){
    $('#prodBody').innerHTML = emptyStateRow(6, {   // 6 columns since Product version joined
      title:'No licenses yet.',
      line:'Buy a license to get a key for your ThingsBoard or TBMQ instance.',
      /* the ONE primary a new account gets, and it opens the same wizard the
         toolbar's "+ New license" does — one action, not a second way in */
      action:'<button class="btn" id="licEmptyBuy">Buy a license</button>'
    });
  } else {
    $('#prodBody').innerHTML = html;
  }
  syncListEmpty(accountEmpty);
  $('#licRange').textContent = vis ? ('1–' + vis + ' of ' + vis) : '0 of 0';
}
renderProducts();
wireLicenseRows('#licensesView', { from:'licenses', rerender: renderProducts });
// modal mode: a change made inside the details modal restates this page too
if(window.LicenseDetails) LicenseDetails.setRerender(renderProducts);

/* Type chips are mutually exclusive: pick one, switch to the other, or click the
   active one again to clear the filter and see everything. */
$$('#licensesView .typechip').forEach(function(chip){
  chip.addEventListener('click', function(){
    var t = chip.getAttribute('data-type');
    licType = (licType === t) ? null : t;
    $$('#licensesView .typechip').forEach(function(c){
      var on = c.getAttribute('data-type') === licType;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    renderProducts();
  });
});
/* Two controls, one state: the desktop switch and the phone's Canceled chip. Both
   write through the same setter so whichever the viewer used, the other agrees the
   moment the breakpoint changes. */
var licCanceledBox = $('#licCanceled'), licCanceledChip = $('#licCanceledChip');
function syncCanceledControls(){
  licCanceledBox.checked = licShowCanceled;
  if(licCanceledChip){
    licCanceledChip.classList.toggle('is-on', licShowCanceled);
    licCanceledChip.setAttribute('aria-pressed', licShowCanceled ? 'true' : 'false');
  }
}
function setShowCanceled(v){
  licShowCanceled = !!v;
  Store.set('showCanceled', licShowCanceled);
  syncCanceledControls();
  renderProducts();
}
syncCanceledControls();                            // reflect the stored choice on load
licCanceledBox.addEventListener('change', function(){ setShowCanceled(this.checked); });
if(licCanceledChip) licCanceledChip.addEventListener('click', function(){ setShowCanceled(!licShowCanceled); });

// + New license → the wizard; product and billing type are chosen on its step 1
var licNewBtn = $('#licNewBtn');
if(licNewBtn) licNewBtn.addEventListener('click', function(){ NL.open({}); });
/* delegated: the empty state's button is rendered and destroyed with the table */
document.addEventListener('click', function(e){
  if(e.target.closest('#licEmptyBuy')) NL.open({});
});

/* ---------- search: plan name, product, type and label ---------------------- */
wireSearch('#licensesView .searchbox input', {
  items: function(){ return $$('#licensesView tbody tr.lic-row'); },
  // the row already carries every one of those as text, so the row IS the query
  text:  function(tr){ return stripText(tr.innerHTML); },
  host:  function(){ return $('#licensesView tbody'); },
  empty: function(q){ return '<tr><td colspan="6" class="noresults-cell">'
                            + noResultsHTML(q) + '</td></tr>'; }
});

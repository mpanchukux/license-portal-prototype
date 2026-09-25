/* ============================================================================
   page-instances.js — the account's deployments as their own destination.

   ⚠️ THIS WAS A VIEW TOGGLE ON THE LICENSES PAGE, and the note that lived there
   argued against exactly this move: "a typical customer runs two to five instances,
   and a top-level page for five rows costs more attention than it returns." That
   reasoning is now reversed by decision, not by accident — the demo account runs
   nineteen, the toggle had to borrow the Licenses toolbar and then hide half of it,
   and a slice that needs the host page's controls turned off is not a slice.

   The ROWS themselves are not this file's: `allInstances`, `instAllHeadHTML`,
   `instAllRow`, `instRowMenu` and `renderInstancesView` all stay in components.js,
   because the licence panel's own Instances tab renders the same instance row from
   the same builder. One builder, two surfaces — the split must not fork them.
   ============================================================================ */

/* ⚠️ `?lic=` IS THE BLOCKED BANNER'S ROUTE, and it is the reason this page reads a
   query parameter at all. It used to be `licenses.html?view=instances&lic=…`; the
   view is gone, so the parameter moved with the page rather than being dropped.
   Landing here unfiltered would hand the reader nineteen rows and the job of finding
   the two that belong to the blocked licence — a route that technically arrives and
   practically does not. */
var instParams = new URLSearchParams(location.search);
var instLicId = instParams.get('lic') || null;
/* null = no chip pressed = every status shown, the same reading the Licenses type
   filter uses for its own null. */
var instStatus = null;
/* the same pairing the Activity feed uses: a query renders everything and the pager
   stands down, because `wireSearch` can only filter rows that are in the DOM */
var instPage = { page:1, size:10, total:0 };
function instQuery(){
  var i = $('#instancesView .searchbox input');
  return i ? i.value.trim() : '';
}

function instMatchesStatus(r){
  if(!instStatus) return true;
  return (instStale(r.inst) ? 'Stale' : 'Healthy') === instStatus;
}

/* ---------- the grouped view (2026-09-25) ---------------------------------------
   ⚠️ THE ROWS ARE THE SAME ROWS. This builds headings and re-orders; it does not build a
   second kind of instance row, because `instAllRow` is shared with the licence panel's
   own Instances tab and a fork here would be a fork there. Everything that reads or acts
   on a row — the kebab, Deactivate, Copy ID, the licence link — keeps working untouched.
   ⚠️ Grouped BY PRODUCT, not by licence: a licence already names itself in every row's
   second column, so grouping by it would print the same string twice per row. The
   product is the one fact the rows share and none of them states on its own.
   ⚠️ Order inside a group is the order it arrived in — newest check-in first — so the
   flat view's question ("is anything not reporting") is still answerable inside each
   group rather than being replaced by an alphabet. */
function instGroupedHTML(rows){
  var order = [], by = {};
  rows.forEach(function(r){
    var k = r.lic.product || '—';
    if(!by[k]){ by[k] = []; order.push(k); }
    by[k].push(r);
  });
  return order.map(function(k){
    return '<tr class="instgroup"><td colspan="6">'
      + '<span class="ig-name">' + esc(k) + '</span>'
      + '<span class="ig-count">' + by[k].length + '</span></td></tr>'
      + by[k].map(instAllRow).join('');
  }).join('');
}

function renderInstancesPage(){
  var head = $('#instAllHead'), body = $('#instAllBody');
  if(!head || !body) return;
  head.innerHTML = instAllHeadHTML();
  var all = allInstances(instLicId);
  var rows = all.filter(instMatchesStatus);

  /* the licence filter states itself and carries its own way out — a list quietly
     showing a subset is a list the reader will misread as the whole */
  var note = $('#instFilter');
  if(note){
    var l = instLicId && licById(instLicId);
    note.hidden = !l;
    if(l) note.innerHTML = 'Showing instances of <b>' + esc(l.label || l.name) + '</b>.'
      + ' <a class="link" href="instances.html">Show all instances</a>';
  }

  if(rows.length){
    var searching = !!instQuery();
    var grouped = instView() === 'grouped';
    /* ⚠️ GROUPING AND PAGING CANNOT BOTH BE ON, and grouping wins. A page of ten rows
       cut out of the middle of a grouped list shows a product heading with two of its
       seven instances under it and the rest on a page you have to ask for — the heading
       then states a group it is not showing. Same pairing the search already makes:
       render everything, and the pager stands down (see the `hidden` line below). */
    var shown = (searching || grouped) ? rows : pageSlice(rows, instPage);
    if(searching || grouped) instPage.total = rows.length;
    body.innerHTML = grouped ? instGroupedHTML(shown) : shown.map(instAllRow).join('');
  } else if(all.length){
    /* ⚠️ A CHIP THAT LEAVES NOTHING IS THE READER'S OWN DOING, and it keeps the
       toolbar, because the way out is to unset the filter they set. Same split the
       Licenses page makes between a filtered empty and an empty account. */
    body.innerHTML = '<tr><td colspan="6" class="noresults-cell">'
      + '<div class="noresults">No instances with this status.</div></td></tr>';
  } else {
    /* ⚠️ NO ACTION. Every other empty state here offers the next step, and this one
       has none to offer: an instance is not something you create in the portal. It
       appears because a deployment somewhere activated itself with a key, so the only
       honest thing to say is how that happens. */
    body.innerHTML = emptyStateRow(6, {
      title:'No instances yet.',
      line:'Instances appear here automatically when a deployment is activated with one '
        + 'of your license keys.'
    });
  }
  /* ⚠️ Measured against the ACCOUNT, not against the filters: `list-empty` strips the
     toolbar and the pager, and doing that because a chip matched nothing would take
     away the control the reader needs to undo it. */
  syncListEmpty(!all.length);
  /* the same facet reading the Licenses chips use: each chip counts what it would show,
     and the status group is excluded from its own count because the chips are exclusive */
  $$('#instancesView .chipcount').forEach(function(el){
    var k = el.getAttribute('data-count');
    el.textContent = all.filter(function(r){
      return (instStale(r.inst) ? 'Stale' : 'Healthy') === k;
    }).length;
  });
  if(!rows.length) instPage.total = 0;
  var pg = $('#instancesView .pager');
  if(pg) pg.hidden = !!instQuery() || instView() === 'grouped' || !rows.length;
  syncPager('#instancesView .pager', instPage);
}
renderInstancesPage();

/* ⚠️ The row actions (Deactivate, Delete, Rename, Copy ID, Open license) are wired by
   DELEGATED listeners in components.js, and their callback calls `renderInstancesView`
   — which only exists to repaint the old toggle. It is still defined and still finds
   `#instAllHead` / `#instAllBody` on this page, so the actions repaint correctly; this
   hook is what keeps THIS page's filters applied when they do. */
var renderInstancesView = renderInstancesPage;   // one repaint entry point per surface

$$('#instancesView .inst-statusseg .typechip').forEach(function(chip){
  chip.addEventListener('click', function(){
    var v = chip.getAttribute('data-status');
    instStatus = instStatus === v ? null : v;    // pressing the pressed one clears it
    $$('#instancesView .inst-statusseg .typechip').forEach(function(c){
      var on = c.getAttribute('data-status') === instStatus;
      /* ⚠️ `is-on`, not `on`. `.typechip` is styled by `.typechip.is-on` — the class
         this page set was never in the stylesheet, so Healthy and Stale filtered the
         rows correctly and never LOOKED pressed. The same control on the Licenses page
         has always written `is-on`; this was one filter group disagreeing with the
         other about its own class name. */
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    renderInstancesPage();
  });
});

wirePager('#instancesView .pager', instPage, renderInstancesPage);
(function(){   // before wireSearch, so the rows exist by the time it filters them
  var i = $('#instancesView .searchbox input');
  if(i) i.addEventListener('input', renderInstancesPage);
})();

/* ---------- search: the deployment name, its id, and the licence it belongs to ---- */
wireSearch('#instancesView .searchbox input', {
  items: function(){ return $$('#instancesView #instAllBody tr').filter(function(tr){
                       return !tr.querySelector('.emptybox, .noresults'); }); },
  text:  function(tr){ return stripText(tr.innerHTML); },
  host:  function(){ return $('#instancesView #instAllBody'); },
  empty: function(q){ return '<tr><td colspan="6" class="noresults-cell">'
                            + noResultsHTML(q) + '</td></tr>'; }
});

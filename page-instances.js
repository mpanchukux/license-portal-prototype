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
   ⚠️⚠️ GROUPED BY LICENCE, AND THIS REVERSES THE PASS BEFORE IT. That pass grouped by
   PRODUCT and argued for it here: "a licence already names itself in every row's second
   column, so grouping by it would print the same string twice per row." The reversal is
   by correction — the brief was given wrong the first time — and the old argument is
   answered rather than ignored: the licence column is GONE from this view, so the name
   is printed once, in the heading, instead of once per row. Product grouping is not kept
   as a second option; two groupings would be two lists again.

   ⚠️ THE ROWS ARE THE SAME ROWS, built from the same cells as the flat list (see
   `instGroupRow` in components.js). Everything that reads or acts on a row — the kebab,
   Deactivate, Copy ID — keeps working untouched.
   ⚠️ Order inside a group is the order it arrived in — newest check-in first — so the
   flat view's question ("is anything not reporting") is still answerable inside each
   group rather than being replaced by an alphabet.

   ⚠️⚠️ THE FIRST GROUP OPENS, THE REST DO NOT (2026-09-25, by request). This replaces
   "all open", and the reason the earlier note gave for that — a view opening with every
   instance hidden answers "which licences do I have", which is the Licenses page's
   question — is answered rather than dropped: one group is open, so the view still
   opens showing instances and still says what a row looks like. What it no longer does
   is print nineteen rows under fourteen headings, which is the flat list with headings
   in it.
   ⚠️ UNTOUCHED, not "closed". `instOpen` holds only the groups the reader has actually
   toggled; everything else falls through to the index rule. That is what lets the first
   group be closed by hand and STAY closed while the second stays closed too — a boolean
   default would have re-opened it on the next repaint.
   ⚠️ NOT IN THE STORE. It is where a reader happens to be looking, not a setting; a
   collapsed group surviving a reload would be a licence quietly missing from the list
   with no sign of why. */
var instOpen = {};                          // licId -> true/false once the reader decides
function instGroupIsOpen(licId, index){
  /* ⚠️ A SEARCH FORCES EVERY GROUP OPEN. Rows are filtered in the DOM, so a hit inside a
     collapsed group would be filtered into a row that is not rendered — the search would
     report nothing and be right about the DOM and wrong about the account. */
  if(instQuery()) return true;
  if(instOpen[licId] === undefined) return index === 0;
  return instOpen[licId];
}
/* ⚠️ THE STRIPE IS EMITTED, NOT INFERRED (2026-09-27). `:nth-of-type` cannot see the
   groups: between two headings sit a variable number of instance rows and a spacer row,
   so "every other `<tr>`" counts the wrong things and the stripe changes whenever a
   group is opened or a filter hides a row. `n` is the group's own index, so the banding
   depends on the list of GROUPS and nothing else. */
function instGroupHeadRow(lic, n, open, idx){
  var id = esc(lic.id);
  return '<tr class="instgroup' + (open ? ' is-open' : '') + (idx % 2 ? ' is-alt' : '')
    + '" data-instgroupid="' + id + '"><td colspan="5">'
    + '<button type="button" class="ig-btn" data-instgroup="' + id + '"'
    +   ' aria-expanded="' + (open ? 'true' : 'false') + '">'
    +   '<span class="ig-chev" aria-hidden="true">'
    +     '<svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-down"></use></svg></span>'
    +   '<span class="ig-mark" aria-hidden="true">' + licenseMark(lic) + '</span>'
    +   '<span class="ig-name">' + esc(lic.label || lic.name) + '</span>'
    +   '<span class="ig-sub">' + esc(lic.product || '') + ' · ' + esc(lic.type || '') + '</span>'
    /* ⚠️ The count is the GROUP's size, not the number of rows currently shown: it is a
       fact about the licence, and it has to stay true while a status chip is filtering. */
    +   '<span class="ig-count">' + n + ' instance' + (n === 1 ? '' : 's') + '</span>'
    + '</button></td></tr>';
}
/* ⚠️ THE GROUP IS ONE OUTLINE AROUND SEVERAL `<tr>`s, and that is the whole of the
   layout problem. A table cannot be given a border per group, so the outline is drawn
   from the CELLS: sides on the first and last cell of every row, a top on the heading,
   a bottom and the two lower corners on the row marked `.is-last`. The classes below are
   the only thing the stylesheet has to go on, so they are emitted here rather than
   inferred with `:last-child` — a filtered-out last row would otherwise take the bottom
   of the box with it.
   ⚠️ THE SPACER IS A ROW. `margin` does nothing on a `<tr>`, and `border-spacing` is
   uniform — it would push the rows INSIDE a group apart by the same amount and undo the
   grouping. A spacer row is the one thing that separates groups without touching what is
   inside them, and it is only emitted BETWEEN groups, never after the last. */
function instGroupedHTML(rows){
  var order = [], by = {};
  rows.forEach(function(r){
    var k = r.lic.id;
    if(!by[k]){ by[k] = { lic:r.lic, rows:[] }; order.push(k); }
    by[k].rows.push(r);
  });
  /* ⚠️ A SPACER BEFORE THE FIRST GROUP TOO (2026-09-25, by request). The head is a
     filled band and the first group started flush against it, so the table read as a
     head with a heading glued to it. Same row, same 10px, emitted once at the top —
     rather than a margin somewhere, which a `<tr>` will not take. */
  var out = order.length ? '<tr class="instgap" aria-hidden="true"><td colspan="5"></td></tr>' : '';
  return out + order.map(function(k, n){
    var g = by[k], open = instGroupIsOpen(k, n);
    var last = g.rows.length - 1;
    return instGroupHeadRow(g.lic, g.rows.length, open, n)
      + (open ? g.rows.map(function(r, i){
          return instGroupRow(r, i === last ? 'is-last' : '');
        }).join('') : '')
      + (n < order.length - 1
          ? '<tr class="instgap" aria-hidden="true"><td colspan="5"></td></tr>' : '');
  }).join('');
}
/* ⚠️ Delegated and re-rendering, not a class toggle: the body is rebuilt by every
   filter, so a group whose rows were toggled in the DOM would spring open again on the
   next repaint. The state is the source, the markup is the output.
   ⚠️ The current state is read off the BUTTON, not recomputed: `instGroupIsOpen` needs
   the group's index to apply the first-one-open rule, and the rendered `aria-expanded`
   is that answer already — asking the DOM here is what keeps the two from disagreeing. */
document.addEventListener('click', function(e){
  var b = e.target.closest('[data-instgroup]');
  if(!b) return;
  instOpen[b.getAttribute('data-instgroup')] = b.getAttribute('aria-expanded') !== 'true';
  renderInstancesPage();
});

function renderInstancesPage(){
  var head = $('#instAllHead'), body = $('#instAllBody');
  if(!head || !body) return;
  var grouped = instView() === 'grouped';
  var cols = instColSpanFor(grouped);
  head.innerHTML = grouped ? instGroupHeadHTML() : instAllHeadHTML();
  /* ⚠️ ON THE TABLE, because `border-collapse` is a table-level property and rounded
     corners need `separate` — collapsed borders are shared between cells and a radius on
     one of them is ignored. The flat list keeps `collapse` and the hairlines it has
     always had. */
  var tbl = $('#instTable');
  if(tbl) tbl.classList.toggle('is-grouped', grouped);
  /* the view switcher is the page's own control now; keep it showing the stored answer
     after any repaint, including the first */
  var seg = $('#instancesView .viewseg input[value="' + (grouped ? 'grouped' : 'flat') + '"]');
  if(seg) seg.checked = true;
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
    body.innerHTML = '<tr><td colspan="' + cols + '" class="noresults-cell">'
      + '<div class="noresults">No instances with this status.</div></td></tr>';
  } else {
    /* ⚠️ NO ACTION. Every other empty state here offers the next step, and this one
       has none to offer: an instance is not something you create in the portal. It
       appears because a deployment somewhere activated itself with a key, so the only
       honest thing to say is how that happens. */
    body.innerHTML = emptyStateRow(cols, {
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
  /* ⚠️ THE FOOTER NO LONGER DISAPPEARS (2026-09-28). It used to be hidden outright while
     grouping or searching, on the correct observation that neither of those pages — and
     the frame then ended in nothing, with the control that says how long the list is
     gone exactly when the list is at its longest. The COUNT is true in all three modes;
     what changes is whether there is more than one page, and in these two modes there
     never is. `syncPagerUnpaged` states that, and the arrows and the per-page select
     take themselves off.
     ⚠️ An empty ACCOUNT still removes it, via `body.list-empty` — nothing to count. */
  if(instQuery() || grouped) syncPagerUnpaged('#instancesView .pager', rows.length);
  else syncPager('#instancesView .pager', instPage);
}
renderInstancesPage();

/* ⚠️ The row actions (Edit label, Copy ID, Open license, Deactivate, Delete) are wired by
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

/* ⚠️ The view is still a STORED setting (`instView`), so it survives a reload and resets
   with the demo — only the control moved out of the settings panel. */
$$('#instancesView .viewseg input').forEach(function(r){
  r.addEventListener('change', function(){
    if(!r.checked) return;
    Store.set('instView', r.value);
    /* ⚠️ Paging and grouping cannot both be on, so a switch back to the flat list must
       not land on page 4 of a list it never paged. */
    instPage.page = 1;
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
  items: function(){ return $$('#instancesView #instAllBody tr.inst-row'); },
  text:  function(tr){ return stripText(tr.innerHTML); },
  host:  function(){ return $('#instancesView #instAllBody'); },
  empty: function(q){ return '<tr><td colspan="' + instColSpanFor(instView() === 'grouped')
                            + '" class="noresults-cell">' + noResultsHTML(q) + '</td></tr>'; },
  /* ⚠️ A GROUP HEADING IS NOT A SEARCHABLE ROW, and it must not outlive its rows. It is
     excluded from `items` above (it has no `.inst-row`), so nothing hides it; this hides
     the ones whose every instance was filtered out, and leaves the rest. */
  after: function(){
    if(instView() !== 'grouped') return;
    $$('#instancesView #instAllBody tr.instgroup').forEach(function(g){
      var any = false, n = g.nextElementSibling;
      while(n && !n.classList.contains('instgroup')){
        if(!n.hidden) any = true;
        n = n.nextElementSibling;
      }
      g.hidden = !any;
    });
  }
});

/* ============================================================================
   page-invoices.js — the Invoices table plus its two row actions: View invoice
   opens a print-styled mock in a new tab, Download PDF builds a real (minimal)
   PDF at runtime. Both read the row they were clicked in.
   ============================================================================ */

/* Status filter: null = All = every invoice shown. Not stored — a filter is about the
   question you are asking right now, unlike the toolbar and table VARIANTS, which are
   settings about how the prototype presents itself. */
var invStatus = null;
/* ⚠️ THE PAGER IS REAL HERE NOW (2026-09-28, by request). It was `syncPagerUnpaged`:
   every row rendered, the footer reporting one page, and the four arrows and the
   per-page select taken off screen because they could not do anything. That was honest
   but it made this the THIRD answer in the product to "how does a list page" — beside
   the Instances page, which really pages, and Activity, which has no footer at all.
   Same controller, same default size as Instances. */
var invPage = { page:1, size:10, total:0 };
function invQuery(){
  var i = $('#invoicesView .searchbox input');
  return i ? i.value.trim() : '';
}
function invMatches(v){ return !invStatus || (v.status || 'Paid') === invStatus; }
/* ⚠️ COUNTS OF THE ACCOUNT, not of the current view — the same rule the Licenses
   dropdowns use, so the figures add up to the number of invoices there are. */
function invStatusCount(st){
  return (DATA().invoices || []).filter(function(v){ return (v.status || 'Paid') === st; }).length;
}
function renderInvStatusMenu(){
  var opts = invStatusOpts();
  var m = $('#invStatusMenu');
  if(m) m.innerHTML = filterMenuHTML('invstatus', opts, invStatus, 'All statuses',
                                     (DATA().invoices || []).length, invStatusCount);
  var l = $('#invStatusLabel');
  if(l) l.textContent = filterOptLabel(opts, invStatus, 'All statuses');
  /* ⚠️ A CONTROL WITH ONE ANSWER IS NOT A CONTROL. While every invoice shares a status
     the menu can only say what the column already says on every row, so the trigger
     stands down entirely — the same rule the pager footer follows when there is one
     page. It comes back on its own the day a charge fails. */
  var ctl = $('#invStatusCtl');
  if(ctl) ctl.hidden = opts.length < 2;
}
function renderInvoicesPage(){
  var b = $('#invoicesView tbody'); if(!b) return;
  var all = invoicesSorted();          // newest first, everywhere (see invoicesSorted)
  var inv = all.filter(invMatches);
  /* ⚠️ SEARCH AND PAGING CANNOT BOTH BE ON — `wireSearch` hides rows already in the DOM,
     so a query across page 1 of 3 would search ten rows and call the rest absent. While
     there is a query the page renders everything and the footer states one page. */
  var searching = !!invQuery();
  var shown = searching ? inv : pageSlice(inv, invPage);
  if(searching) invPage.total = inv.length;
  if(inv.length){
    /* ⚠️ `bareProduct`, the SAME cell Home's invoice block renders. The full product
       cell belongs to the Licenses table, where the licence is the subject of the row;
       here the subject is the invoice, and the licence is a reference. Carrying the
       mark placeholder and the licence label into this column made the reference look
       like an entry of its own — a grey square and a deployment name competing with
       the invoice number two columns to the left. Product, type, and a link to the
       licence: nothing else earns a place. */
    b.innerHTML = shown.map(function(v){ return invRow(v, { bareProduct:true }); }).join('');
  } else if(all.length){
    /* ⚠️ A FILTER THAT MATCHES NOTHING IS NOT AN EMPTY ACCOUNT — it keeps the toolbar,
       because the way out is to undo what the reader set. Same split the Licenses page
       makes, through the same builder. */
    b.innerHTML = '<tr><td colspan="6" class="noresults-cell">'
      + constraintEmptyHTML(invQ(), invApplied().length > 0, 'invoices') + '</td></tr>';
    invPage.total = 0;
  } else if(DATA().noInvoicesNote){
    /* ⚠️ A dataset can say WHY it has no invoices — the grant is free, and that is a
       fact about the account rather than a state waiting to be filled. It keeps the
       one-line form and gets no action, because there is nothing to do about it. */
    b.innerHTML = invEmptyRow();
    invPage.total = 0;
  } else {
    b.innerHTML = emptyStateRow(6, {
      title:'No invoices yet.',
      /* ⚠️ Only ever reached with zero invoices in the account, and a purchase now
         writes one — so this can no longer be read by someone who has just paid. */
      /* ⚠️⚠️ NO ACTION (2026-09-30, by request). `Go to Licenses` stood here as a quiet
         link, argued as "buying is one decision and it belongs to one page". The same
         argument finishes the other way: if the decision belongs to another page, this
         block does not need a second door to it — Licenses is one tap away in the
         navigation that is already on screen, and an empty state whose only offer is
         "go somewhere else" is a dead end dressed as a next step. The sentence says
         what will fill the page; nothing here has to be done. */
      line:'Your first invoice appears here as soon as a license is charged.'
    });
    invPage.total = 0;
  }
  /* ⚠️ Measured against the ACCOUNT, not against the filter: `list-empty` strips the
     toolbar, and doing that because a status matched nothing would take away the
     control the reader needs to undo it. */
  syncListEmpty(!all.length);
  /* ⚠️ THE ACCOUNT'S TOTAL, not the filtered count — the same reading the chip has on
     Licenses and Instances. The chip sits with the TITLE, and the title names the page
     rather than the current filter; the status control below carries its own facet
     counts and is what describes the filter. */
  var invTotal = $('#invTotal');
  if(invTotal) invTotal.textContent = all.length;
  syncAppliedRow('#invApplied', invApplied);
  if(searching || !inv.length) syncPagerUnpaged('#invoicesView .pager', inv.length);
  else syncPager('#invoicesView .pager', invPage);
  renderInvStatusMenu();
}
renderInvoicesPage();
function invQ(){ var i = $('#invoicesView .searchbox input'); return i ? i.value.trim() : ''; }
function invApplied(){
  return invStatus ? [{ k:'status', t:invStatus, clear:function(){ invStatus = null; } }] : [];
}
/* ⚠️ THE SAME `licApply` LESSON, and it is the reason this is not a bare render: changing
   a filter redraws the rows, and `wireSearch` filters by HIDING rows already in the DOM —
   so a redraw hands back every row the filter allows and the query silently stops
   applying. Every filter change goes through the search's own run. */
var invRun = null;
function invApply(){ invPage.page = 1; if(invRun) invRun(); else renderInvoicesPage(); }
wireFilterDrop('#invStatusCtl', 'invstatus', function(v){ invStatus = v; invApply(); });
/* the phone opens the same filter as a bottom sheet — see wireSheetTrigger */
wireSheetTrigger('#invStatusCtl', function(){
  /* ⚠️ `invStatusOpts` ALREADY RETURNS `{v,t}` — it was mapped again here and every row
     printed `[object Object]`. Caught by walking the sheet, not by reading it. */
  var opts = invStatusOpts();
  return {
    title:'Invoice status', opts:opts, current:invStatus, allLabel:'All',
    total:(DATA().invoices || []).length, countOf:invStatusCount,
    countWith:function(v){ var was = invStatus; invStatus = v;
      var n = invoicesSorted().filter(invMatches).length; invStatus = was; return n; },
    noun:'invoice', nounPlural:'invoices',
    onApply:function(v){ invStatus = v; invApply(); }
  };
});
wireAppliedRow('#invApplied', invApplied, invApply);
wirePager('#invoicesView .pager', invPage, renderInvoicesPage);
/* the way out of a filter that matches nothing — it clears the status and nothing else */
document.addEventListener('click', function(e){
  if(e.target.closest('#invoicesView [data-clearfilters]')){
    invStatus = null; invApply(); return;
  }
  /* the one control that clears BOTH, offered only when both are responsible */
  if(e.target.closest('#invoicesView [data-clearall]')){
    var f = $('#invoicesView .searchbox input'); if(f) f.value = '';
    invStatus = null; invApply();
  }
});

/* ---------- search: invoice number, the licence it is for, and the amount ---- */
/* ⚠️ THE RE-RENDER IS THE `before` HOOK, not a second listener bound ahead of this one:
   the brief's debounce would otherwise be two timers racing for the order the pair
   depends on. One timer, and the redraw happens inside it. */
invRun = wireSearch('#invoicesView .searchbox input', {
  before: renderInvoicesPage,
  debounce: 160,
  items: function(){ return $$('#invoicesView tbody tr').filter(function(tr){ return !tr.querySelector('.emptybox'); }); },
  text:  function(tr){ return stripText(tr.innerHTML); },
  host:  function(){ return $('#invoicesView tbody'); },
  empty: function(q){ return '<tr><td colspan="6" class="noresults-cell">'
                            + constraintEmptyHTML(q, invApplied().length > 0, 'invoices') + '</td></tr>'; }
});

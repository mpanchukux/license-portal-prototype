/* ============================================================================
   page-invoices.js — the Invoices table plus its two row actions: View invoice
   opens a print-styled mock in a new tab, Download PDF builds a real (minimal)
   PDF at runtime. Both read the row they were clicked in.
   ============================================================================ */

function renderInvoicesPage(){
  var b = $('#invoicesView tbody'); if(!b) return;
  var inv = DATA().invoices;
  if(inv.length){
    b.innerHTML = inv.map(function(v){ return invRow(v); }).join('');
  } else if(DATA().noInvoicesNote){
    /* ⚠️ A dataset can say WHY it has no invoices — the grant is free, and that is a
       fact about the account rather than a state waiting to be filled. It keeps the
       one-line form and gets no action, because there is nothing to do about it. */
    b.innerHTML = invEmptyRow();
  } else {
    b.innerHTML = emptyStateRow(6, {
      title:'No invoices yet.',
      /* ⚠️ Only ever reached with zero invoices in the account, and a purchase now
         writes one — so this can no longer be read by someone who has just paid. */
      line:'Your first invoice appears here as soon as a license is charged.',
      /* ⚠️ A quiet LINK, not a button. Buying is one decision and it belongs to one
         page; a primary here would be a second button for the same next step, phrased
         differently, on a page that fills itself as a side effect of it. */
      action:'<a class="link" href="licenses.html">Go to Licenses</a>'
    });
  }
  syncListEmpty(!inv.length);
  var r = $('#invoicesView .pager .range');
  if(r) r.textContent = inv.length ? ('1–' + inv.length + ' of ' + inv.length) : '0 of 0';
}
renderInvoicesPage();

/* ---------- search: invoice number, the licence it is for, and the amount ---- */
wireSearch('#invoicesView .searchbox input', {
  items: function(){ return $$('#invoicesView tbody tr').filter(function(tr){ return !tr.querySelector('.emptybox'); }); },
  text:  function(tr){ return stripText(tr.innerHTML); },
  host:  function(){ return $('#invoicesView tbody'); },
  empty: function(q){ return '<tr><td colspan="6" class="noresults-cell">'
                            + noResultsHTML(q) + '</td></tr>'; }
});

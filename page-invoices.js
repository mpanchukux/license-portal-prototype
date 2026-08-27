/* ============================================================================
   page-invoices.js — the Invoices table plus its two row actions: View invoice
   opens a print-styled mock in a new tab, Download PDF builds a real (minimal)
   PDF at runtime. Both read the row they were clicked in.
   ============================================================================ */

function renderInvoicesPage(){
  var b = $('#invoicesView tbody'); if(!b) return;
  var inv = DATA().invoices;
  b.innerHTML = inv.length ? inv.map(invRow).join('') : invEmptyRow();
  var r = $('#invoicesView .pager .range');
  if(r) r.textContent = inv.length ? ('1–' + inv.length + ' of ' + inv.length) : '0 of 0';
}
renderInvoicesPage();

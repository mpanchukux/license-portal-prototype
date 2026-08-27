/* ============================================================================
   page-licenses.js — the licence list: one product-first table rendered from the
   current dataset, a mutually-exclusive Type filter, the canceled toggle and the
   split "+ New license" button. Row behaviour is shared with the Home block.
   ============================================================================ */

/* Type filter: null = nothing selected = every licence shown. */
var licType = null;
/* Cancelled licences are out of the way until asked for. The choice is a stored
   setting like the dashboard state, so it survives navigation and refresh. */
var licShowCanceled = !!Store.get('showCanceled');

function currentProducts(){
  return DATA().licenses.slice().sort(function(a, b){ return dateKey(b.created) - dateKey(a.created); });
}
function renderProducts(){
  $('#prodHead').innerHTML = headHtml();
  var vis = 0, html = '';
  currentProducts().forEach(function(p){
    if(licType && p.type !== licType) return;
    if(!licShowCanceled && p.status === 'canceled') return;
    vis++; html += rowHtml(p);
  });
  $('#prodBody').innerHTML = html;
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
var licCanceledBox = $('#licCanceled');
licCanceledBox.checked = licShowCanceled;          // reflect the stored choice on load
licCanceledBox.addEventListener('change', function(){
  licShowCanceled = this.checked;
  Store.set('showCanceled', licShowCanceled);
  renderProducts();
});

// + New license → the wizard; product and billing type are chosen on its step 1
var licNewBtn = $('#licNewBtn');
if(licNewBtn) licNewBtn.addEventListener('click', function(){ NL.open({}); });

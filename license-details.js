/* ============================================================================
   license-details.js — the licence details surface, in ONE place.

   Two hosts present the same module:
     • page mode  (variant A) — license.html mounts it in the page shell
     • modal mode (variant B) — Home / Licenses open it in a large modal over
       the page they are on
   The markup, the render layer and every in-surface behaviour live here, so
   neither host owns a copy. Hosts only decide where it goes and how it closes:
     LicenseDetails.mountPage(hostSel, lic, { back:{href,label} })
     LicenseDetails.openModal(lic)
   ============================================================================ */

/* ---------- markup (mounted into whichever host is active) ---------- */
var DETAILS_HTML = ''
+ '<div class="app" id="appView">'
+ ''
+ ''
+ '  <!-- ============ MAIN ============ -->'
+ '  <div class="main">'
+ ''
+ '    <!-- content -->'
+ '    <div class="content">'
+ '      <div class="sheet">'
+ '        <!-- one-time banner after a purchase: the key lives on this page -->'
+ '        <div class="gbanner licnew" id="licNewBanner" role="status" hidden>'
+ '          <svg class="icon gb-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.4l2.4 2.4 4.6-5"/></svg>'
+ '          <span class="gb-txt">License created. Your license key is on this page — reveal and copy it below.</span>'
+ '          <span class="sp"></span>'
+ '          <button class="gb-act" data-stub="Installation instructions">Installation instructions</button>'
+ '          <button class="gb-x" id="licNewDismiss" aria-label="Dismiss">\u2715</button>'
+ '        </div>'
+ '        <!-- one-time banner after Manage add-ons: states what changed, right'
+ '             above the entitlements the change produced -->'
+ '        <div class="gbanner licnew" id="licChgBanner" role="status" hidden>'
+ '          <svg class="icon gb-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.4l2.4 2.4 4.6-5"/></svg>'
+ '          <span class="gb-txt" id="licChgTxt"></span>'
+ '          <span class="sp"></span>'
+ '          <button class="gb-x" id="licChgDismiss" aria-label="Dismiss">\u2715</button>'
+ '        </div>'
+ '        <div class="canvas">'
+ ''
+ '          <!-- header: back button in its own gutter, everything else in the content column -->'
+ '          <div class="head">'
+ '           <div class="headgrid">'
+ '            <button class="back" id="backBtn" aria-label="Back to Licenses" title="Back to Licenses">&larr;</button>'
+ '            <div class="headcol">'
+ '            <div class="top">'
+ '              <div class="idline">'
+ '                <div class="titleblock">'
+ '                  <div class="titlekicker" data-page="sub">Subscription plan</div>'
+ '                  <div class="titlekicker" data-page="perp">Perpetual license</div>'
+ '                  <div class="titlerow">'
+ '                    <h1 class="planname" data-page="sub" id="planName">Prototype</h1>'
+ '                    <h1 class="planname" data-page="perp" id="planNamePerp">ThingsBoard PE Perpetual License</h1>'
+ '                    <span id="statusSlot"><span class="chip status"><span class="sdot"></span>Active</span></span>'
+ '                  </div>'
+ '                </div>'
+ '              </div>'
+ '              <div class="headactions">'
+ '                <button class="btn sec" id="couponBtn">Apply coupon</button>'
+ '                <button class="btn" id="changePlanBtn" data-modal="change-plan" data-page="sub">Change plan</button>'
+ '                <button class="btn sec" id="renewBtn" data-page="sub" hidden>Renew subscription</button>'
+ '                <!-- inferred: a perpetual license does not renew and has nothing to'
+ '                     cancel, so Change plan and the ⋮ menu are dropped; the primary'
+ '                     action becomes a one-time capacity purchase. Confirm with team. -->'
+ '                <button class="btn" data-modal="add-capacity" data-page="perp">Add capacity</button>'
+ '                <div class="menu" data-page="sub" id="headKebabMenu">'
+ '                  <button class="btn sec kebab-btn" id="headKebabBtn" aria-haspopup="true" aria-expanded="false" aria-label="More actions">⋮</button>'
+ '                  <div class="pop" id="headKebabPop" role="menu" hidden>'
+ '                    <button role="menuitem" data-cancel-active>Cancel subscription</button>'
+ '                  </div>'
+ '                </div>'
+ '              </div>'
+ '            </div>'
+ ''
+ '            <!-- row 2: the label — a muted description line under the title -->'
+ '            <div class="metarow">'
+ '              <span id="labelSlot"><button class="chip ghost" id="addLabel">+ Add label</button></span>'
+ '            </div>'
+ ''
+ '            <div class="hairline"></div>'
+ ''
+ '            <!-- row 3: license key (left) / subscription period (right) -->'
+ '            <div class="keygrid">'
+ '              <div class="keycol">'
+ '                <h3 class="minihead">License key</h3>'
+ '                <div class="keyline">'
+ '                  <span class="mono" id="keyText" data-masked="••••••••••••3f2a" data-full="d41d-8cd9-8f00-b204-e980-3f2a">••••••••••••3f2a</span>'
+ '                  <button class="iconbtn ib" id="revealBtn" aria-pressed="false" aria-label="Reveal license key" title="Reveal">'
+ '                    <svg class="icon eye" viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>'
+ '                    <svg class="icon eyeoff" viewBox="0 0 24 24" hidden><path d="M10.6 6.1A9.6 9.6 0 0 1 12 6c6.5 0 10 6 10 6a16.9 16.9 0 0 1-2.4 3M6.5 6.6A16.8 16.8 0 0 0 2 12s3.5 6 10 6a9.5 9.5 0 0 0 3.9-.8"/><path d="M3 3l18 18"/></svg>'
+ '                  </button>'
+ '                  <button class="iconbtn ib tip" id="copyBtn" aria-label="Copy license key" data-tip="Copy">'
+ '                    <svg class="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>'
+ '                  </button>'
+ '                </div>'
+ '              </div>'
+ '              <div class="keycol right" data-page="sub">'
+ '                <h3 class="periodhead">Subscription period</h3>'
+ '                <div class="period" id="periodSub">Aug 13 2026 to Sep 13 2026</div>'
+ '              </div>'
+ '              <!-- the license itself never expires; what is dated here is the'
+ '                   software-updates term -->'
+ '              <div class="keycol right" data-page="perp">'
+ '                <h3 class="periodhead">Software updates</h3>'
+ '                <div class="period" id="periodPerp">1 year · until Aug 13 2027</div>'
+ '              </div>'
+ '            </div>'
+ ''
+ '            <!-- Conditional alert. Rendered ONLY when the subscription needs attention'
+ '                 (payment failed, card expiring, usage over limit). Healthy state shows nothing.'
+ '                 Demo hooks: window.showSubAlert(\'msg…\') / window.clearSubAlert() -->'
+ '            <div class="alert" id="subAlert" role="alert" hidden>'
+ '              <svg class="icon" viewBox="0 0 24 24"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17v.5"/></svg>'
+ '              <span class="atxt"></span>'
+ '            </div>'
+ '            </div><!-- /headcol -->'
+ '           </div><!-- /headgrid -->'
+ '          </div>'
+ ''
+ '          <!-- Plan & add-ons — always visible, above the tab bar -->'
+ '          <div class="section planblock">'
+ '              <div class="sh"><h3>Plan &amp; add-ons</h3><span class="spacer"></span>'
+ '                <button class="btn sec" data-modal="add-ons" data-page="sub">Manage add-ons</button>'
+ '                <!-- inferred: capacity is bought once, so this opens a one-time'
+ '                     purchase flow — not the recurring Manage add-ons flow, which'
+ '                     computes proration and a new monthly total. -->'
+ '                <button class="btn sec" data-modal="add-capacity" data-page="perp">Add capacity</button>'
+ '              </div>'
+ '              <table class="plantable">'
+ '                <thead>'
+ '                  <tr><th>Item</th><th>Usage</th><th class="num">Included</th><th class="num">Extra</th><th class="num">Limit</th></tr>'
+ '                </thead>'
+ '                <!-- quantified capacity only; rendered from the selected page\'s'
+ '                     entitlements (see PAGES in JS) -->'
+ '                <tbody id="planRows">'
+ '                </tbody>'
+ '              </table>'
+ ''
+ '              <!-- boolean entitlements live here instead of as empty table rows.'
+ '                   Demo hook: window.setFeature(\'edge\'|\'trendz\'|\'whitelabel\', true) -->'
+ '              <div class="featureblock" id="featureBlock">'
+ '                <div class="fhead">Features</div>'
+ '                <div class="features" id="featureChips"></div>'
+ '              </div>'
+ '          </div>'
+ ''
+ '          <!-- tab bar for the three data areas -->'
+ '          <div class="tabs" role="tablist" aria-label="Details areas">'
+ '            <button class="tab" role="tab" id="tab-invoices" aria-controls="panel-invoices" aria-selected="true" tabindex="0">Invoices</button>'
+ '            <button class="tab" role="tab" id="tab-prod" aria-controls="panel-prod" aria-selected="false" tabindex="-1">Instances</button>'
+ '            <button class="tab" role="tab" id="tab-logs" aria-controls="panel-audit" aria-selected="false" tabindex="-1">Activity</button>'
+ '          </div>'
+ ''
+ '          <!-- Invoices -->'
+ '          <div class="panel" id="panel-invoices" role="tabpanel" aria-labelledby="tab-invoices">'
+ '            <div class="section">'
+ '              <!-- recurring billing: subscription only -->'
+ '              <div class="billgrid" data-page="sub">'
+ '                <div class="billcard nextcharge">'
+ '                  <div class="nc-row">'
+ '                    <h4 class="billcard-h">Next charge</h4>'
+ '                    <!-- 16 days matches the 16-of-31-days remaining that the add-ons'
+ '                         flow prorates against (today ~Aug 14, cycle ends Aug 30). -->'
+ '                    <span class="nc-when" id="ncWhen">in 16 days · Aug 30 2026</span>'
+ '                  </div>'
+ '                  <div class="nc-amount"><span class="big" id="ncAmount">$39.00</span></div>'
+ '                  <div class="hairline"></div>'
+ '                  <!-- the payment method is account-level, so this routes to Billing'
+ '                       rather than pretending to be an inline edit -->'
+ '                  <div class="nc-row nc-foot">'
+ '                    <span class="nc-pay">Auto-pay · Visa ••4242</span>'
+ '                    <a class="link" href="billing.html">Billing &amp; payment &rarr;</a>'
+ '                  </div>'
+ '                </div>'
+ '              </div>'
+ '              <table class="invtable" style="margin-top:18px" data-page="sub">'
+ '                <thead>'
+ '                  <tr><th>Invoice #</th><th>Date</th><th class="num">Amount</th><th>Status</th><th aria-label="Invoice actions"></th></tr>'
+ '                </thead>'
+ '                <tbody>'
+ '                  <tr>'
+ '                    <td class="mono">INV-2026-07</td><td>2026-07-30</td><td class="num" id="invAmount">$39.00</td>'
+ '                    <td><span class="pill">Paid</span></td>'
+ '                    <td class="cellact"><span class="rowactions">'
+ '                      <button class="link" data-dlinv>Download PDF</button>'
+ '                      <a class="link" data-viewinv target="_blank" rel="noopener" href="#">View invoice</a>'
+ '                    </span></td>'
+ '                  </tr>'
+ '                </tbody>'
+ '              </table>'
+ '              <div class="pager" data-page="sub">'
+ '                <span class="spacer"></span>'
+ '                <span>Items per page<select aria-label="Items per page"><option>10</option><option>20</option><option>50</option><option>100</option></select></span>'
+ '                <span class="range">1 of 1</span>'
+ '                <span class="pagebtns">'
+ '                  <button disabled aria-label="First page">«</button>'
+ '                  <button disabled aria-label="Previous page">‹</button>'
+ '                  <button disabled aria-label="Next page">›</button>'
+ '                  <button disabled aria-label="Last page">»</button>'
+ '                </span>'
+ '              </div>'
+ ''
+ '              <!-- Perpetual: one-time purchases only — the initial license and any'
+ '                   Add capacity purchase. No upcoming row, no next charge, no auto-pay. -->'
+ '              <table class="invtable" data-page="perp">'
+ '                <thead>'
+ '                  <tr><th>Invoice #</th><th>Date</th><th class="num">Amount</th><th>Status</th><th aria-label="Invoice actions"></th></tr>'
+ '                </thead>'
+ '                <tbody>'
+ '                  <tr>'
+ '                    <!-- inferred date: a capacity purchase made after the licence was issued -->'
+ '                    <td class="mono">INV-2026-08</td><td>2026-08-20</td><td class="num">$1,999.00</td>'
+ '                    <td><span class="pill">Paid</span></td>'
+ '                    <td class="cellact"><span class="rowactions">'
+ '                      <button class="link" data-dlinv>Download PDF</button>'
+ '                      <a class="link" data-viewinv target="_blank" rel="noopener" href="#">View invoice</a>'
+ '                    </span></td>'
+ '                  </tr>'
+ '                  <tr>'
+ '                    <!-- the initial licence purchase: confirmed one-time price -->'
+ '                    <td class="mono">INV-2026-08A</td><td>2026-08-13</td><td class="num">$4,999.00</td>'
+ '                    <td><span class="pill">Paid</span></td>'
+ '                    <td class="cellact"><span class="rowactions">'
+ '                      <button class="link" data-dlinv>Download PDF</button>'
+ '                      <a class="link" data-viewinv target="_blank" rel="noopener" href="#">View invoice</a>'
+ '                    </span></td>'
+ '                  </tr>'
+ '                </tbody>'
+ '              </table>'
+ '              <div class="pager" data-page="perp">'
+ '                <span class="spacer"></span>'
+ '                <span>Items per page<select aria-label="Items per page"><option>10</option><option>20</option><option>50</option><option>100</option></select></span>'
+ '                <span class="range">1 of 1</span>'
+ '                <span class="pagebtns">'
+ '                  <button disabled aria-label="First page">«</button>'
+ '                  <button disabled aria-label="Previous page">‹</button>'
+ '                  <button disabled aria-label="Next page">›</button>'
+ '                  <button disabled aria-label="Last page">»</button>'
+ '                </span>'
+ '              </div>'
+ ''
+ '              <!-- inferred: a grant is free, so it has no invoices at all -->'
+ '              <div class="emptybox" id="grantInvEmpty" hidden>No invoices &mdash; the Community Grant is free.</div>'
+ '            </div>'
+ '          </div>'
+ ''
+ '          <!-- Instances -->'
+ '          <div class="panel" id="panel-prod" role="tabpanel" aria-labelledby="tab-prod" hidden>'
+ '            <div class="section">'
+ '              <!-- type switcher (same segmented style as the Licenses "Type" filter) + toolbar -->'
+ '              <div class="insttoolbar">'
+ '                <div class="searchbox"><svg class="icon searchglyph" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input type="text" placeholder="Search instances" aria-label="Search instances"></div>'
+ '                <div class="lic-typeseg" role="group" aria-label="Instance type">'
+ '                  <button class="typechip is-on" data-insttype="prod" aria-pressed="true">Production</button>'
+ '                  <button class="typechip" data-insttype="dev" aria-pressed="false">Development</button>'
+ '                </div>'
+ '                <span class="spacer"></span>'
+ '                <button class="iconbtn ib" data-refresh aria-label="Refresh" title="Refresh"><svg class="icon" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 4v5h-5"/></svg></button>'
+ '              </div>'
+ ''
+ '              <!-- PRODUCTION instances -->'
+ '              <div class="insttype" data-insttype="prod">'
+ '                <table class="insttable">'
+ '                  <thead>'
+ '                    <tr>'
+ '                      <th class="chk"><input type="checkbox" aria-label="Select all production instances"></th>'
+ '                      <th>Instance ID</th>'
+ '                      <th>Label</th>'
+ '                      <th>Status</th>'
+ '                      <th>Last activity time</th>'
+ '                      <th class="sortable" aria-sort="descending" tabindex="0">Created time <span class="arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span></th>'
+ '                    </tr>'
+ '                  </thead>'
+ '                  <tbody>'
+ '                    <tr>'
+ '                      <td class="chk"><input type="checkbox" aria-label="Select instance a1b2c3d4…e5f"></td>'
+ '                      <td class="mono">a1b2c3d4…e5f</td>'
+ '                      <td class="muted">—</td>'
+ '                      <td><span class="pill">Online</span></td>'
+ '                      <td>Aug 18 2026</td>'
+ '                      <td>Aug 14 2026</td>'
+ '                    </tr>'
+ '                    <tr>'
+ '                      <td class="chk"><input type="checkbox" aria-label="Select instance 7e5f9a2b…c3d"></td>'
+ '                      <td class="mono">7e5f9a2b…c3d</td>'
+ '                      <td class="muted">—</td>'
+ '                      <td><span class="pill soft">Offline</span></td>'
+ '                      <td>Aug 16 2026</td>'
+ '                      <td>Aug 13 2026</td>'
+ '                    </tr>'
+ '                  </tbody>'
+ '                </table>'
+ '                <div class="pager instpager">'
+ '                  <span class="spacer"></span>'
+ '                  <span>Items per page<select aria-label="Items per page"><option>10</option><option>20</option><option>50</option><option>100</option></select></span>'
+ '                  <span class="range">1–2 of 2</span>'
+ '                  <span class="pagebtns">'
+ '                    <button disabled aria-label="First page">«</button>'
+ '                    <button disabled aria-label="Previous page">‹</button>'
+ '                    <button disabled aria-label="Next page">›</button>'
+ '                    <button disabled aria-label="Last page">»</button>'
+ '                  </span>'
+ '                </div>'
+ '              </div>'
+ ''
+ '              <!-- DEVELOPMENT instances — seeded empty to show the empty-state -->'
+ '              <div class="insttype" data-insttype="dev" hidden>'
+ '                <div class="emptybox">No instances found · Instances appear automatically when a deployment is activated with the license.</div>'
+ '              </div>'
+ ''
+ '              <!-- Community Grant: nothing has connected with the new key yet, so the'
+ '                   whole tab is this one line (toolbar and tables hidden) -->'
+ '              <div class="emptybox" id="grantInstEmpty" hidden>An instance appears here after it connects using this license key.</div>'
+ '            </div>'
+ '          </div>'
+ ''
+ '          <!-- Logs -->'
+ '          <div class="panel" id="panel-audit" role="tabpanel" aria-labelledby="tab-logs" hidden>'
+ '            <div class="section">'
+ '              <div class="insttoolbar" data-feed="lic">'
+ '                <div class="searchbox"><svg class="icon searchglyph" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input type="text" placeholder="Search activity" aria-label="Search activity"></div>'
+ '                <div class="dropwrap perctl">'
+ '                  <button class="btn sec perbtn" aria-haspopup="true" aria-expanded="false" aria-label="Period"><b class="perlabel">All time</b> <span aria-hidden="true">&#9662;</span></button>'
+ '                  <div class="dropmenu permenu" hidden>'
+ '                    <button data-period="all">All time</button>'
+ '                    <button data-period="24h">Last 24 hours</button>'
+ '                    <button data-period="7d">Last 7 days</button>'
+ '                    <button data-period="30d">Last 30 days</button>'
+ '                    <button data-period="custom">Custom range&hellip;</button>'
+ '                    <div class="percustom">'
+ '                      <div class="perrow">'
+ '                        <input type="date" class="perfrom" aria-label="From date">'
+ '                        <span class="permid">to</span>'
+ '                        <input type="date" class="perto" aria-label="To date">'
+ '                      </div>'
+ '                      <button class="btn sec perapply">Apply</button>'
+ '                    </div>'
+ '                  </div>'
+ '                </div>'
+ '                <span class="spacer"></span>'
+ '                <button class="iconbtn ib" data-refresh aria-label="Refresh" title="Refresh"><svg class="icon" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 4v5h-5"/></svg></button>'
+ '              </div>'
+ '              <!-- this licence\'s events only — same feed cards as the Activity page -->'
+ '              <div class="feed" id="licFeed"></div>'
+ '            </div>'
+ '          </div>'
+ ''
+ '        </div><!-- /canvas -->'
+ '      </div>'
+ '    </div>'
+ '  </div>'
+ '</div>';

/* ---------- add label ----------
   Lives at top level because the render layer calls into it (renderLabelSlot →
   reset), and it resolves #labelSlot on call — the markup mounts after load. */
function labelSlot(){ return $('#labelSlot'); }
function bindAdd(){
  var slot = labelSlot(); if(!slot) return;
  var btn = $('#addLabel', slot);
  if(btn) btn.addEventListener('click', showInput);
}
function showInput(){
  var slot = labelSlot(); if(!slot) return;
  slot.innerHTML = '<input class="labelinput" id="labelInput" placeholder="Label…" aria-label="Label">';
  var inp = $('#labelInput', slot);
  inp.focus();
  inp.addEventListener('keydown', function(e){
    if(e.key==='Enter'){ commit(inp.value.trim()); }
    else if(e.key==='Escape'){ reset(); }
  });
  inp.addEventListener('blur', function(){ if(!inp.value.trim()) reset(); });
}
function commit(val){
  var slot = labelSlot(); if(!slot) return;
  if(!val){ reset(); return; }
  slot.innerHTML = '';
  // same muted description the row-driven render produces, plus a way back out
  var text = document.createElement('span');
  text.className = 'labeltext';
  text.textContent = val;
  var x = document.createElement('button');
  x.className = 'labelx'; x.setAttribute('aria-label','Remove label'); x.textContent='✕';
  x.addEventListener('click', reset);
  slot.appendChild(text);
  slot.appendChild(x);
}
function reset(){
  var slot = labelSlot(); if(!slot) return;
  slot.innerHTML = '<button class="chip ghost" id="addLabel">+ Add label</button>';
  bindAdd();
}

/* ---------- render layer ---------- */
// the licence the surface currently shows (set by whichever host mounted it)
var activeLicense = null;
function licFromNamed(key){
  var tier = NAMED_TIER[key] || 'prototype', spec = TIER_SPECS[tier];
  var lic = { tier:tier, product:'ThingsBoard', type: spec.perp ? 'Perpetual' : 'Subscription',
    name: spec.name, label:'', status:'active', created:'Aug 13 2026',
    event: spec.perp ? 'Jul 27 2027' : 'Sep 13 2026', price: spec.price, billing: spec.perp ? 'paid' : 'auto-pay' };
  if(key === 'perp') lic.name = 'ThingsBoard PE Perpetual License';
  if(key === 'prototypeaddons'){ lic.name='Prototype'; lic.price='$126.00'; lic.extras={prod:'2',ai:'2M'}; lic.edge=true; lic.trendz=true; }
  return lic;
}

// A grant and a perpetual licence share the details layout: nothing recurs, so
// no renewal, no next charge, no plan to change. One test, used by every caller.
function isPerpLike(lic){ return !!lic && (lic.type === 'Perpetual' || !!lic.grant); }
/* The status chip answers one question — is this licence alive? — with the same
   two values the tables use: Active or Canceled. Attention states (payment
   failed, updates expiring, no first check-in yet) are NOT statuses: they live
   in the banner above the content, with the date and the action that clears
   them (see renderLicenseAlert). A grant is Active like any other licence; that
   it costs nothing is a licence fact, so it rides in the kicker, not here. */
function statusChipHTML(lic){
  if(lic.status === 'canceled')
    return '<span class="chip status off">Canceled &middot; active until ' + fmtDate(lic.event) + '</span>';
  return '<span class="chip status"><span class="sdot"></span>Active</span>';
}
function renderEntitlements(entList, extras){
  extras = extras || {};
  var pr = $('#planRows'); if(!pr) return;
  pr.innerHTML = (entList || []).map(function(e){
    var label=e[0], inc=e[1], suffix=e[2]||'';
    var exKey = ENT_EXTRA_KEY[label], ex = exKey ? extras[exKey] : '';
    var lab = label + (suffix ? ' <span class="muted">'+suffix+'</span>' : '');
    return meterRow(lab, inc, ex);
  }).join('');
}
function renderLicenseFeatures(lic, spec){
  var wl = (lic.whitelabel != null ? lic.whitelabel : spec.wl);
  var active = [];
  if(wl) active.push('White labeling');
  if(lic.edge) active.push('Edge Computing');
  if(lic.trendz) active.push('Trendz Analytics');
  var chips = $('#featureChips'); if(!chips) return;
  chips.innerHTML = active.map(function(n){ return '<span class="fchip">'+FCHECK+n+'</span>'; }).join('');
  $('#featureBlock').hidden = active.length === 0;
}
function renderLicenseAlert(lic){
  var al = $('#subAlert'); if(!al) return;
  var t = $('.atxt', al), st = lic.status;
  if(st==='payment_failed'){ t.innerHTML = '<b>Payment failed.</b> Update your payment method before ' + fmtDate(lic.event) + ' to keep the subscription active. <button class="link" data-goto="billing" style="margin-left:6px">Update payment method &rarr;</button>'; al.hidden=false; }
  else if(st==='updates_expiring'){ t.innerHTML = '<b>Software updates expire ' + fmtDate(lic.event) + '.</b> Renew to keep receiving updates and support.'; al.hidden=false; }
  else if(st==='canceled'){ t.innerHTML = '<b>Subscription canceled.</b> It stays active until ' + fmtDate(lic.event) + '. After that its instances will stop.'; al.hidden=false; }
  // the key exists but nothing has used it yet — the one thing left to do is activate
  else if(st==='awaiting_checkin'){ t.innerHTML = '<b>No instance has checked in yet.</b> The license key was issued ' + fmtDate(lic.created) + ' — activate an instance with it and it appears here. <button class="link" data-stub="Installation instructions" style="margin-left:6px">Installation guide &rarr;</button>'; al.hidden=false; }
  else al.hidden = true;
}
function renderLicenseActions(lic){
  var canceled = lic.status==='canceled', isPerp = isPerpLike(lic);
  var coupon=$('#couponBtn'), change=$('#changePlanBtn'), kebab=$('#headKebabMenu'), renew=$('#renewBtn');
  if(!isPerp){
    if(coupon) coupon.hidden = canceled;
    if(change) change.hidden = canceled;
    if(kebab)  kebab.hidden  = canceled;
    if(renew)  renew.hidden  = !canceled;
  }
}
/* A label describes the deployment, so on details it reads as a muted sub-line
   under the title — not a chip. The "+ Add label" affordance stays for licences
   that have none. */
function renderLabelSlot(lic){
  var slot = labelSlot(); if(!slot) return;
  if(lic.label){ slot.innerHTML = '<span class="labeltext">' + esc(lic.label) + '</span>'; }
  else { reset(); }   // restores the interactive "+ Add label" affordance
}
/* A grant rides the perpetual details layout, with the few things that differ
   switched over: what the dated block means (nothing expires), no coupon or
   capacity purchase, no invoices, and no instance until the deployment checks
   in with the new key. Every non-grant licence restores the same nodes. */
function renderGrantChrome(lic){
  var isGrant = !!(lic && lic.grant);
  var kicker = $('#appView .titlekicker[data-page="perp"]');
  // 'Free' left the status slot when status became Active/Canceled only — the
  // kicker is where non-status licence facts live
  if(kicker) kicker.textContent = isGrant ? 'Grant license · Free' : 'Perpetual license';
  var ph = $('#appView .keycol[data-page="perp"] .periodhead');
  if(ph) ph.textContent = isGrant ? 'Expiry' : 'Software updates';
  var coupon = $('#couponBtn'); if(coupon) coupon.hidden = isGrant;
  // the data-page pass above already restored these for a perpetual licence,
  // so a grant only has to take them back out
  if(isGrant) $$('#appView [data-modal="add-capacity"]').forEach(function(b){ b.hidden = true; });
  var invEmpty = $('#grantInvEmpty'); if(invEmpty) invEmpty.hidden = !isGrant;
  if(isGrant) $$('#panel-invoices [data-page]').forEach(function(el){ el.hidden = true; });
  var instEmpty = $('#grantInstEmpty'); if(instEmpty) instEmpty.hidden = !isGrant;
  var instBar = $('#panel-prod .insttoolbar'); if(instBar) instBar.hidden = isGrant;
  var onChip = $('#panel-prod .typechip.is-on'), instType = onChip ? onChip.getAttribute('data-insttype') : 'prod';
  $$('#panel-prod .insttype').forEach(function(el){ el.hidden = isGrant || el.getAttribute('data-insttype') !== instType; });
}
function renderLicenseDetails(lic){
  if(!lic) return;
  var spec = TIER_SPECS[lic.tier] || {}, isPerp = isPerpLike(lic), pk = isPerp ? 'perp' : 'sub';
  $$('#appView [data-page]').forEach(function(el){ el.hidden = el.getAttribute('data-page') !== pk; });
  var nameEl = isPerp ? $('#planNamePerp') : $('#planName');
  if(nameEl) nameEl.textContent = lic.name;
  $('#statusSlot').innerHTML = statusChipHTML(lic);
  renderLabelSlot(lic);
  renderGrantChrome(lic);
  if(isPerp){
    var pp = $('#periodPerp');
    // a grant has no term at all — the dated block says so instead of a date
    if(pp && lic.grant) pp.innerHTML = '<span class="muted">No expiry</span>';
    else if(pp) pp.textContent = (lic.status==='updates_expiring' ? 'Expires ' : 'Until ') + fmtDate(lic.event);
  } else {
    var ps = $('#periodSub');
    if(ps) ps.textContent = (lic.status==='canceled' ? 'Active until ' : 'Renews ') + fmtDate(lic.event);
    var price = String(lic.price).replace(/\s*\/\s*mo/i,'');
    var nc=$('#ncAmount'), inv=$('#invAmount'), when=$('#ncWhen');
    if(lic.status==='canceled'){ if(nc) nc.textContent='—'; if(when) when.textContent='No upcoming charge · active until '+fmtDate(lic.event); }
    else { if(nc) nc.textContent=price; if(when) when.textContent='on '+fmtDate(lic.event); }
    if(inv) inv.textContent = price;
  }
  renderEntitlements(spec.ent, lic.extras);
  renderLicenseFeatures(lic, spec);
  renderLicenseAlert(lic);
  renderLicenseActions(lic);
  renderLicFeed(lic);
}

/* ---------- entitlement rows ---------- */

// entitlement amounts may carry a trailing "M" (AI) or thousands commas (devices)
function parseUnit(v){ v = String(v == null ? '0' : v); var m = /M$/i.test(v); var n = parseFloat(v.replace(/,/g, '').replace(/M$/i, '')) || 0; return { n:n, m:m }; }
function fmtUnit(n, m){ return m ? (n + 'M') : n.toLocaleString('en-US'); }
// usage stays a placeholder (0 used) under the limit. `extra` = purchased add-ons:
// it lifts the limit and fills the Extra column so the row shows what was bought.
function meterRow(item, included, extra){
  var inc = parseUnit(included), ex = parseUnit(extra || '0');
  var incDisp = fmtUnit(inc.n, inc.m), limitDisp = fmtUnit(inc.n + ex.n, inc.m || ex.m);
  var extraCell = ex.n > 0
    ? '<td class="num">+' + fmtUnit(ex.n, ex.m) + '</td>'
    : '<td class="num muted">0</td>';
  return '<tr><td>' + item + '</td>' +
    '<td><div class="usecell tip" tabindex="0" data-tip="0 used / ' + limitDisp + ' limit">' +
    '<span class="usetxt">0 / ' + limitDisp + '</span><div class="meter"><span style="width:0%"></span></div></div></td>' +
    '<td class="num">' + incDisp + '</td>' + extraCell + '<td class="num">' + limitDisp + '</td></tr>';
}

/* ---------- in-surface behaviours ----------
   Wired once, after the markup is mounted; the details are re-rendered per
   licence by renderLicenseDetails(). */
function wireDetailsOnce(){
  /* ---------- license key reveal / copy ---------- */
  var keyText = $('#keyText'), revealBtn = $('#revealBtn');
  var eyeIcon = $('.eye', revealBtn), eyeOff = $('.eyeoff', revealBtn);
  var revealed = false;
  revealBtn.addEventListener('click', function(){
    revealed = !revealed;
    keyText.textContent = revealed ? keyText.dataset.full : keyText.dataset.masked;
    // note: .hidden as a JS property is a no-op on SVG elements — toggle the attribute
    if(revealed){ eyeIcon.setAttribute('hidden',''); eyeOff.removeAttribute('hidden'); }
    else { eyeOff.setAttribute('hidden',''); eyeIcon.removeAttribute('hidden'); }
    revealBtn.setAttribute('aria-pressed', revealed?'true':'false');
    revealBtn.setAttribute('aria-label', revealed?'Hide license key':'Reveal license key');
    revealBtn.setAttribute('title', revealed?'Hide':'Reveal');
  });

  var copyBtn = $('#copyBtn');
  copyBtn.addEventListener('click', function(){
    var val = keyText.dataset.full;
    var flash = function(){
      // copy is icon-only now — surface "Copied" via the forced tooltip
      copyBtn.setAttribute('data-tip', 'Copied');
      copyBtn.classList.add('show', 'copied');
      setTimeout(function(){
        copyBtn.classList.remove('show', 'copied');
        copyBtn.setAttribute('data-tip', 'Copy');
      }, 1200);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(val).then(flash, flash);
    } else {
      flash();
    }
  });

  bindAdd();   // the label controller itself lives at top level (see below)

  /* ---------- coupon ---------- */
  (function(){
    var ov=$('#couponOverlay'), btn=$('#couponBtn'), input=$('#couponInput'), apply=$('#couponApply');
    if(!ov || !btn) return;
    function refresh(){ apply.disabled = !input.value.trim(); }
    function open(){ input.value=''; refresh(); ov.hidden=false; input.focus(); }
    function close(){ ov.hidden=true; btn.focus(); }
    btn.addEventListener('click', open);
    input.addEventListener('input', refresh);
    $('#couponClose').addEventListener('click', close);
    $('#couponCancel').addEventListener('click', close);
    apply.addEventListener('click', function(){ if(!apply.disabled) close(); });   // stub: no real redemption
    ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !ov.hidden) close(); });
  })();

  /* ---------- Instances tab: Production / Development switcher + select-all ---------- */
  var instPanel = $('#panel-prod');
  if(instPanel){
    $$('.insttoolbar .typechip', instPanel).forEach(function(chip){
      chip.addEventListener('click', function(){
        var type = chip.getAttribute('data-insttype');
        $$('.insttoolbar .typechip', instPanel).forEach(function(c){
          var on = c === chip;
          c.classList.toggle('is-on', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        $$('.insttype', instPanel).forEach(function(b){ b.hidden = b.getAttribute('data-insttype') !== type; });
      });
    });
    // header checkbox toggles every row checkbox in the same table
    $$('.insttable', instPanel).forEach(function(tbl){
      var all = tbl.querySelector('thead input[type=checkbox]');
      if(!all) return;
      all.addEventListener('change', function(){
        $$('tbody input[type=checkbox]', tbl).forEach(function(cb){ cb.checked = all.checked; });
      });
    });
  }

  var STUB = 'Placeholder — not part of this wireframe spec yet.';
  var MODALS = {
    'change-plan': function(){ if(activeLicense && activeLicense.type === 'Subscription'){ NL.openChange(activeLicense); } else { openModal('Change plan', '<p>Open a subscription first.</p>'); } },
    'add-ons': function(){ openManageAddons(activeLicense); },
    // inferred: perpetual capacity is bought once — no recurring billing, no proration
    'add-capacity': function(){ openModal('Add capacity', '<p>Placeholder — one-time purchase of extra devices, instances, or AI credits. Paid once, no renewal and no proration.</p>'); },
    'manage-payment': function(){ openModal('Manage payment', '<p>Payment method lives in account Billing.</p>'); }
  };
  $$('[data-modal]').forEach(function(el){
    el.addEventListener('click', function(){ var fn=MODALS[el.getAttribute('data-modal')]; if(fn) fn(); });
  });

  /* ---------- render ---------- */
  function refreshDetails(){ renderLicenseDetails(activeLicense); }
  refreshDetails();
  wireFeedAudit('#appView');
  wirePeriod('.perctl', licPeriod, function(){ renderLicFeed(activeLicense); });

  /* ---------- header actions ---------- */
  var cancelActiveBtn = $('[data-cancel-active]');
  if(cancelActiveBtn) cancelActiveBtn.addEventListener('click', function(e){
    e.stopPropagation();
    closeAllMenus();
    openCancelModal(activeLicense, function(){ LicenseDetails.afterChange(); });
  });
  var renewBtn = $('#renewBtn');
  if(renewBtn) renewBtn.addEventListener('click', function(){
    openModal('Renew subscription', '<p>Placeholder — reactivate this subscription and resume billing (TODO).</p>');
  });
}

/* ---------- demo hooks (console) ----------
   The markup is mounted by a host after this file loads, so these resolve their
   nodes on call. Healthy licences show no alert; these fake the states. */
window.showSubAlert = function(html){
  var al = $('#subAlert'); if(!al) return;
  $('.atxt', al).innerHTML = html || '<b>Payment failed.</b> We could not charge Visa \u2022\u20224242. Update your payment method to keep the subscription active.';
  al.hidden = false;
};
window.clearSubAlert = function(){ var al = $('#subAlert'); if(al) al.hidden = true; };
window.setFeature = function(key, on){
  if(!activeLicense) return;
  activeLicense[key === 'whitelabel' ? 'whitelabel' : key] = !!on;
  renderLicenseDetails(activeLicense);
};

/* ---------- the two hosts ----------------------------------------------------
   Page mode mounts the surface in the page shell and keeps the origin-aware
   back button. Modal mode mounts the same surface in a large modal over the
   page that opened it: close is the only exit (no back), the backdrop is inert
   because the details can host open editors, and Escape closes only when no
   nested flow (wizard, add-ons, coupon, confirm) is open above it. */
var LicenseDetails = (function(){
  var MODAL_HTML = ''
  + '<div class="fs-screen licmodal" id="licModal" role="dialog" aria-modal="true" aria-labelledby="licModalTitle" hidden>'
  + '  <div class="fs-box">'
  + '    <div class="fs-header">'
  + '      <h2 class="fs-maintitle" id="licModalTitle">License details</h2>'
  + '      <span class="spacer"></span>'
  + '      <div class="fs-headactions"><button class="fs-close" id="licModalClose" aria-label="Close">\u2715</button></div>'
  + '    </div>'
  + '    <div class="fs-body" id="licModalBody"></div>'
  + '  </div>'
  + '</div>';
  // #nlModal covers Manage add-ons too now — it is a mode of the same wizard
  var NESTED = ['#nlModal', '#couponOverlay', '#payOverlay', '#overlay', '#addUserOverlay'];
  var mountedIn = null, wired = false, modal = null, opener = null;
  // modal mode only: the page underneath keeps its rows on screen, so a change
  // made inside the modal has to be restated there too
  var hostRerender = null;

  function mount(host){
    if(mountedIn === host) return;
    host.innerHTML = DETAILS_HTML;
    mountedIn = host;
  }
  function show(lic){
    activeLicense = lic;
    renderLicenseDetails(lic);
    if(!wired){ wireDetailsOnce(); wired = true; }
    syncNewBanner(lic);
    syncChangedBanner(lic);
  }
  /* The wizard sets Store.justCreated to the new licence id and lands here, so
     the page states it once: the licence exists, its key is on this page, and
     where the installation instructions are. Dismissing clears the flag. */
  function syncNewBanner(lic){
    var b = $('#licNewBanner'); if(!b) return;
    var justId = Store.get('justCreated');
    b.hidden = !(lic && justId && lic.id === justId);
    if(b.hidden) return;
    var x = $('#licNewDismiss');
    if(x && !x.getAttribute('data-wired')){
      x.setAttribute('data-wired', '1');
      x.addEventListener('click', function(){ Store.set('justCreated', null); b.hidden = true; });
    }
  }
  /* Manage add-ons commits and lands here (no success modal, same as a purchase),
     so the page states the change once. Store.justChanged carries {id,text}; the
     ✕ clears it for good. */
  function syncChangedBanner(lic){
    var b = $('#licChgBanner'); if(!b) return;
    var c = Store.get('justChanged');
    b.hidden = !(lic && c && c.id === lic.id && c.text);
    if(b.hidden) return;
    $('#licChgTxt').textContent = 'License updated. ' + c.text;
    var x = $('#licChgDismiss');
    if(x && !x.getAttribute('data-wired')){
      x.setAttribute('data-wired', '1');
      x.addEventListener('click', function(){ Store.set('justChanged', null); b.hidden = true; });
    }
  }
  function nestedOpen(){
    return NESTED.some(function(sel){ var el = $(sel); return el && !el.hidden; });
  }
  function buildModal(){
    var d = document.createElement('div');
    d.innerHTML = MODAL_HTML;
    modal = d.firstChild;
    document.body.appendChild(modal);
    $('#licModalClose').addEventListener('click', close);
    // capture phase on purpose: a nested flow's own Escape handler runs in the
    // bubble phase, so by then it has already closed itself and we would read
    // "nothing nested" and close this modal too. Deciding first fixes that.
    document.addEventListener('keydown', function(e){
      if(e.key !== 'Escape' || !modal || modal.hidden) return;
      if(nestedOpen()) return;            // whatever sits above us owns Escape
      close();
    }, true);
    // no backdrop-to-close here: an open editor inside the details would lose work
  }
  /* The header names the kind of licence, nothing more. It used to repeat the
     licence name and its label, but both already stand in the content right
     below \u2014 so the header was a long duplicate of the first two lines under it.
     Wording matches the content kicker (.titlekicker), minus the grant's
     "\u00b7 Free": that is a price fact, and this is a title. */
  function titleFor(lic){
    if(lic.grant) return 'Grant license';
    return isPerpLike(lic) ? 'Perpetual license' : 'Subscription plan';
  }
  function openModal(lic){
    if(!lic) return;
    if(!modal) buildModal();
    opener = document.activeElement;
    mount($('#licModalBody'));
    show(lic);
    var back = $('#backBtn'); if(back) back.hidden = true;   // close is the only exit
    $('#licModalTitle').textContent = titleFor(lic);
    modal.hidden = false;
    document.body.classList.add('licmodal-open');            // the page behind stops scrolling
    $('#licModalClose').focus();
  }
  function close(){
    if(!modal) return;
    modal.hidden = true;
    document.body.classList.remove('licmodal-open');
    if(opener && opener.focus) opener.focus();
  }
  function mountPage(hostSel, lic, opts){
    var host = $(hostSel); if(!host) return;
    mount(host);
    show(lic);
    var b = $('#backBtn');
    if(b && opts && opts.back){
      b.setAttribute('aria-label', opts.back.label);
      b.setAttribute('title', opts.back.label);
      b.addEventListener('click', function(){ location.href = opts.back.href; });
    }
  }
  // a change made inside the surface: restate the details and the page behind
  function afterChange(){
    if(activeLicense) renderLicenseDetails(activeLicense);
    if(hostRerender) hostRerender();
  }
  return {
    mountPage: mountPage,
    openModal: openModal,
    close: close,
    setRerender: function(fn){ hostRerender = fn; },
    afterChange: afterChange,
    isOpen: function(){ return !!modal && !modal.hidden; },
    // a nested flow changed the licence: restate it without leaving the modal
    reopen: function(lic){
      if(!lic) return;
      show(lic);
      if(modal) $('#licModalTitle').textContent = titleFor(lic);
      if(hostRerender) hostRerender();
    },
    refresh: function(){ if(activeLicense) renderLicenseDetails(activeLicense); }
  };
})();

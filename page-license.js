/* ============================================================================
   page-license.js — licence details, driven by the URL:

     license.html?id=B3          a licence from the current dataset
     license.html?tier=maker     a synthesised plan page (settings panel only)
     &from=home                  which section to highlight and where back goes

   Everything on the page renders from the licence object: header, entitlements
   per tier, features, alert, actions, and a licence-scoped activity feed.
   ============================================================================ */

var params = new URLSearchParams(location.search);
var fromHome = params.get('from') === 'home';
var activeLicense = params.get('id') ? licById(params.get('id')) : null;
if(!activeLicense) activeLicense = licFromNamed(params.get('tier') || 'prototype');

// the details page belongs to the section it was opened from
document.body.setAttribute('data-nav', fromHome ? 'home' : 'licenses');
syncTopNav();

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
function statusChipHTML(lic){
  var st = lic.status;
  // a grant states what it is (free) and what it waits for — both quiet, no alarm
  if(lic.grant) return '<span class="chip">Free</span>'
    + (st==='awaiting_checkin' ? '<span class="chip">Waiting for first check-in</span>' : '');
  if(st==='payment_failed')   return '<span class="chip status attn">Payment failed</span>';
  if(st==='updates_expiring') return '<span class="chip status attn">Updates expiring</span>';
  if(st==='canceled')         return '<span class="chip status off">Canceled &middot; active until ' + fmtDate(lic.event) + '</span>';
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
  if(kicker) kicker.textContent = isGrant ? 'Grant license' : 'Perpetual license';
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

/* ---------- back ---------- */
(function(){
  var b = $('#backBtn'); if(!b) return;
  var href = fromHome ? 'index.html' : 'licenses.html';
  var lbl = fromHome ? 'Back to Home' : 'Back to Licenses';
  b.setAttribute('aria-label', lbl); b.setAttribute('title', lbl);
  b.addEventListener('click', function(){ location.href = href; });
})();

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

/* ---------- in-page behaviours ---------- */
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

/* ---------- add label ---------- */
var slot = $('#labelSlot');
function bindAdd(){
  var btn = $('#addLabel', slot);
  if(btn) btn.addEventListener('click', showInput);
}
function showInput(){
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
  slot.innerHTML = '<button class="chip ghost" id="addLabel">+ Add label</button>';
  bindAdd();
}
bindAdd();

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
  openCancelModal(activeLicense, refreshDetails);
});
var renewBtn = $('#renewBtn');
if(renewBtn) renewBtn.addEventListener('click', function(){
  openModal('Renew subscription', '<p>Placeholder — reactivate this subscription and resume billing (TODO).</p>');
});
var MODALS = {
  'change-plan': function(){
    if(activeLicense && activeLicense.type === 'Subscription'){ NL.openChange(activeLicense); }
    else { openModal('Change plan', '<p>Open a subscription first.</p>'); }
  },
  'add-ons': function(){ openManageAddons(activeLicense); },
  // inferred: perpetual capacity is bought once — no recurring billing, no proration
  'add-capacity': function(){ openModal('Add capacity', '<p>Placeholder — one-time purchase of extra devices, instances, or AI credits. Paid once, no renewal and no proration.</p>'); },
  'manage-payment': function(){ openModal('Manage payment', '<p>Payment method lives in account Billing.</p>'); }
};

/* ---------- demo hooks (console) ---------- */

/* ---------- conditional attention alert ----------
   Healthy subscription shows nothing. When it needs attention, render one alert row
   in the reserved slot. Demo hooks (a real app would drive this from subscription state): */
var subAlert = $('#subAlert'), subAlertTxt = subAlert ? $('.atxt', subAlert) : null;
window.showSubAlert = function(html){
  if(!subAlert) return;
  subAlertTxt.innerHTML = html || '<b>Payment failed.</b> We could not charge Visa ••4242. Update your payment method to keep the subscription active.';
  subAlert.hidden = false;
};
window.clearSubAlert = function(){ if(subAlert) subAlert.hidden = true; };

var dashAlert = $('#dashAlert');
window.showDashAlert = function(html){
  if(!dashAlert) return;
  $('.atxt', dashAlert).innerHTML = html || '';
  dashAlert.hidden = false;
};
window.clearDashAlert = function(){ if(dashAlert) dashAlert.hidden = true; };


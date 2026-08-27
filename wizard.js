/* ============================================================================
   wizard.js — the two big modals that create and change licences:
     · AMF  — Manage add-ons, seeded from the licence it was opened on
     · NL   — the new-licence wizard (subscription 4 steps, perpetual 3, and the
              same wizard in change-plan mode)
   Both ride the same .fs-screen / .fs-box chrome, injected here so no page has
   to carry a copy. Purchases and plan changes write through Store, then hand
   over with a real navigation.
   Loaded on the pages that can start a purchase: Home, Licenses, licence details.
   ============================================================================ */

/* ---------- markup, injected once per page ---------- */
var ADDONS_HTML = ''
+ '<div class="fs-screen" id="fsAddons" role="dialog" aria-modal="true" aria-label="Manage add-ons" hidden>'
+ '  <div class="fs-box">'
+ '  <div class="fs-header">'
+ '    <button class="fs-close fs-headback" id="fsBack" aria-label="Back" hidden>←</button>'
+ '    <h2 class="fs-maintitle" id="fsTitle">Manage ThingsBoard Professional edition · Prototype</h2>'
+ '    <span class="spacer"></span>'
+ '    <div class="fs-headactions">'
+ '      <button class="link" data-modal="change-plan">Change plan →</button>'
+ '      <button class="fs-close" id="fsCancel" aria-label="Close">✕</button>'
+ '    </div>'
+ '  </div>'
+ '  <div class="fs-body">'
+ '    <!-- STEP 1 — ADJUST -->'
+ '    <div id="fsStep1">'
+ '      <div class="fs-grid">'
+ '        <div class="fs-col">'
+ '          <div class="am-sec fs-panel">'
+ '            <div class="am-sechead"><h4>Plan</h4></div>'
+ '            <div class="am-capgrid">'
+ '              <div class="am-cell">'
+ '                <div class="fs-cellhead">'
+ '                  <div class="fs-celltext">'
+ '                    <div class="am-celltop">Devices</div>'
+ '                    <div class="fs-celldesc">Total number of IoT devices that will connect to your ThingsBoard platform.</div>'
+ '                  </div>'
+ '                  <input class="fs-devinput" type="text" value="50" disabled aria-label="Devices">'
+ '                </div>'
+ '                <div class="am-cardprice locked">fixed by Prototype Plan</div>'
+ '              </div>'
+ '              <div class="am-cell">'
+ '                <div class="fs-cellhead">'
+ '                  <div class="fs-celltext">'
+ '                    <div class="am-celltop">Production instances</div>'
+ '                    <div class="fs-celldesc">Production compute — 1 included. Enables clustering and HA.</div>'
+ '                  </div>'
+ '                  <div class="stepper" data-field="prod">'
+ '                    <button type="button" data-dir="-1" aria-label="Decrease production instances">−</button>'
+ '                    <span class="val" id="fsValProd" aria-live="polite">1</span>'
+ '                    <button type="button" data-dir="1" aria-label="Increase production instances">+</button>'
+ '                  </div>'
+ '                </div>'
+ '                <div class="am-cardprice">+$29.00 / mo each</div>'
+ '              </div>'
+ '              <div class="am-cell">'
+ '                <div class="fs-cellhead">'
+ '                  <div class="fs-celltext">'
+ '                    <div class="am-celltop">Development instances</div>'
+ '                    <div class="fs-celldesc">Dedicated instances for dev, test, and CI/CD — keeps production data clean.</div>'
+ '                  </div>'
+ '                  <div class="stepper" data-field="dev">'
+ '                    <button type="button" data-dir="-1" aria-label="Decrease development instances">−</button>'
+ '                    <span class="val" id="fsValDev" aria-live="polite">0</span>'
+ '                    <button type="button" data-dir="1" aria-label="Increase development instances">+</button>'
+ '                  </div>'
+ '                </div>'
+ '                <div class="am-cardprice">+$15.00 / mo each</div>'
+ '              </div>'
+ '              <div class="am-cell">'
+ '                <div class="fs-cellhead">'
+ '                  <div class="fs-celltext">'
+ '                    <div class="am-celltop">AI credits</div>'
+ '                    <div class="fs-celldesc">1 = 1,000,000 credits. Minimum matches your plan — increase to buy more.</div>'
+ '                  </div>'
+ '                  <div class="stepper" data-field="ai">'
+ '                    <button type="button" data-dir="-1" aria-label="Decrease AI credits">−</button>'
+ '                    <span class="val" id="fsValAi" aria-live="polite">2</span>'
+ '                    <button type="button" data-dir="1" aria-label="Increase AI credits">+</button>'
+ '                  </div>'
+ '                </div>'
+ '                <div class="am-cardprice">+$5.00 / mo per 1M AI credits</div>'
+ '              </div>'
+ '            </div>'
+ '            <div class="am-sechead am-sechead-sub"><h4>Add-ons</h4></div>'
+ '            <div class="am-cardgrid">'
+ '              <div class="am-card" id="fsCardEdge">'
+ '                <div class="am-cardtop">'
+ '                  <input type="checkbox" class="am-addcheck" id="fsEdge" data-addon="edge" aria-label="Add Edge Computing add-on">'
+ '                  <div>'
+ '                    <div class="am-cardname">Edge Computing</div>'
+ '                    <div class="am-carddesc">Edge instances at remote sites for offline processing and auto-sync.</div>'
+ '                  </div>'
+ '                </div>'
+ '                <div class="am-cardprice">+$7.00 /mo</div>'
+ '              </div>'
+ '              <div class="am-card" id="fsCardTrendz">'
+ '                <div class="am-cardtop">'
+ '                  <input type="checkbox" class="am-addcheck" id="fsTrendz" data-addon="trendz" aria-label="Add Trendz Analytics add-on">'
+ '                  <div>'
+ '                    <div class="am-cardname">Trendz Analytics</div>'
+ '                    <div class="am-carddesc">Advanced analytics, custom dashboards, and trend discovery.</div>'
+ '                  </div>'
+ '                </div>'
+ '                <div class="am-cardprice">+$12.00 /mo</div>'
+ '              </div>'
+ '            </div>'
+ '          </div>'
+ '        </div>'
+ '        <div class="am-sec fs-right">'
+ '          <div class="am-sechead"><h4>Calculation summary</h4></div>'
+ '          <div class="am-figures">'
+ '            <div class="am-sumlist" id="fsSumList"></div>'
+ '            <div class="am-sumrow am-total-row">'
+ '              <span>New monthly <span class="am-chgcount" id="fsChgCount">· no changes</span></span>'
+ '              <span id="fsNewMonthly">$39.00 / mo</span>'
+ '            </div>'
+ '          </div>'
+ '          <button class="btn fs-nextbtn" id="fsNext">Review →</button>'
+ '        </div>'
+ '      </div>'
+ '    </div>'
+ '    <!-- STEP 2 — REVIEW -->'
+ '    <div id="fsStep2" hidden>'
+ '      <div class="fs-review">'
+ '        <h4 class="am-h2">Review your changes</h4>'
+ '        <p class="am-sub2">Confirm what changes and what you\'ll be charged now.</p>'
+ '        <div class="am-order">'
+ '          <div class="am-orow am-planrow">'
+ '            <div id="fsPlanLine">Prototype · 50 dev · 1 prod · 2M AI credits · White labeling</div>'
+ '            <div>$39.00 / mo</div>'
+ '          </div>'
+ '          <div id="fsOrderLines"></div>'
+ '          <div class="am-orow am-newmonthly"><div>New monthly · from 2026-08-30</div><div id="fsRecMonthly">$39.00 / mo</div></div>'
+ '        </div>'
+ '        <div class="am-due">'
+ '          <div class="am-duerow">'
+ '            <div class="am-duelabel">Due today <span class="muted">— prorated change for the current cycle (16 of 31 days, to 2026-08-30)</span></div>'
+ '            <div class="am-dueval" id="fsDueVal">$0.00</div>'
+ '          </div>'
+ '          <div class="am-payrow">Charged to Visa ••4242 · auto-pay · <button class="link" data-modal="manage-payment">Manage payment →</button></div>'
+ '        </div>'
+ '        <div class="fs-reviewactions">'
+ '          <button class="btn fs-confirmbtn" id="fsConfirm">Approve &amp; pay</button>'
+ '        </div>'
+ '      </div>'
+ '    </div>'
+ '    <!-- SUCCESS (stub) -->'
+ '    <div id="fsSuccess" hidden>'
+ '      <div class="am-success" style="max-width:640px;margin:0 auto">'
+ '        <div class="am-checkbig">✓</div>'
+ '        <h4 class="am-h2">Changes applied</h4>'
+ '        <p class="am-sub2">Placeholder confirmation — no real charge was made. <span id="fsSuccessDue"></span></p>'
+ '        <div style="margin-top:18px"><button class="btn" id="fsDone">Done</button></div>'
+ '      </div>'
+ '    </div>'
+ '  </div>'
+ '  </div><!-- /fs-box -->'
+ '</div>';

var WIZARD_HTML = ''
+ '<div class="fs-screen" id="nlModal" role="dialog" aria-modal="true" aria-label="New license" hidden>'
+ '  <div class="fs-box">'
+ '    <div class="fs-header">'
+ '      <h2 class="fs-maintitle" id="nlTitle">New subscription</h2>'
+ '      <span class="spacer"></span>'
+ '      <div class="fs-headactions">'
+ '        <button class="fs-close" id="nlClose" aria-label="Close">✕</button>'
+ '      </div>'
+ '    </div>'
+ '    <!-- the one stepper: a thin progress line + "Step N of M · Label" -->'
+ '    <div class="nl-stepbar" id="nlStepbar"><div id="nlSteps"></div></div>'
+ '    <div class="fs-body" id="nlBody">'
+ '      <!-- STEP 1 — PRODUCT (click a card advances; no Continue on this step) -->'
+ '      <div id="nlStep1"><div class="nl-prodgrid" id="nlProdCards"></div><div id="nlProdExtra"></div></div>'
+ '      <!-- STEP 2 — PLAN / PACKAGE -->'
+ '      <div id="nlStep2" hidden>'
+ '        <div class="plangrid" id="nlPlanCards"></div>'
+ '        <!-- TODO: confirm with product that these PE features apply to Maker/Prototype -->'
+ '        <div id="nlPlanExtra"></div>'
+ '      </div>'
+ '      <!-- STEP 3 — CUSTOMIZE (manage add-ons content, seeded from the chosen plan) -->'
+ '      <div id="nlStep3" hidden></div>'
+ '      <!-- STEP 4 — REVIEW & PAY -->'
+ '      <div id="nlStep4" hidden></div>'
+ '    </div>'
+ '    <div class="nl-foot" id="nlFoot">'
+ '      <button class="btn sec" id="nlBack" hidden>Back</button>'
+ '      <span class="spacer"></span>'
+ '      <button class="btn" id="nlNext" disabled>Continue</button>'
+ '    </div>'
+ '  </div>'
+ '</div>';

var WIZARD_SUCCESS_HTML = ''
+ '<div class="payoverlay" id="nlSuccess" hidden>'
+ '  <div class="paymodal nl-success" role="dialog" aria-modal="true" aria-labelledby="nlSuccessTitle">'
+ '    <div class="nl-success-b">'
+ '      <div class="am-checkbig">✓</div>'
+ '      <h3 class="nl-success-h" id="nlSuccessTitle">Thank you for purchasing ThingsBoard Professional Edition subscription</h3>'
+ '      <p class="nl-success-p">Use this license key to activate your instance:</p>'
+ '      <div class="nl-keybox">'
+ '        <code id="nlKeyVal">a7c4-1f0e-9b2d-1001-77aa-3f2a</code>'
+ '        <button class="iconbtn ib tip" id="nlKeyCopy" data-tip="Copy" aria-label="Copy license key"><svg class="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg></button>'
+ '      </div>'
+ '      <p class="nl-success-p">Visit the <button class="link" data-stub="Installation instructions">installation page</button> for detailed instructions.</p>'
+ '      <div class="nl-success-f"><button class="btn" id="nlSuccessDone">Done</button></div>'
+ '    </div>'
+ '  </div>'
+ '</div>';


(function(){
  document.body.insertAdjacentHTML('beforeend', ADDONS_HTML + WIZARD_HTML + WIZARD_SUCCESS_HTML);
})();

/* ---------- Manage add-ons ---------- */
var AMF = (function(){
  var BASE = 39;                 // reseeded per licence in seed() — Prototype default
  var PRORATE = 16 / 31;         // 16 of 31 days remain in the cycle (to 2026-08-30)
  var INCL = { prod:1, dev:0, ai:2 };
  var MIN  = { prod:1, dev:0, ai:2 };
  var MAX  = { prod:20, dev:20, ai:99 };
  // per-tier bases/included for seeding the flow from a licence row
  var AMF_TIERS = { maker:{base:10,prod:1,ai:1}, prototype:{base:39,prod:1,ai:2}, pilot:{base:99,prod:1,ai:4},
                    startup:{base:299,prod:2,ai:8}, business:{base:499,prod:3,ai:16}, tbmqsub:{base:15,prod:1,ai:0} };
  var ADD  = { edge:7, trendz:12 };
  // PLACEHOLDER per-unit prices (prototype only): prod +$29/mo · dev +$15/mo · AI block +$5/mo per 1M
  var UNIT = { prod:29, dev:15, ai:5 };
  var s = { prod:1, dev:0, ai:2, edge:false, trendz:false };
  var scr = $('#fsAddons');
  var body = $('.fs-body', scr);
  var lastFocus = null;

  function money(n){ return '$' + n.toFixed(2); }
  function extras(){ return { prod:s.prod-INCL.prod, dev:s.dev-INCL.dev, ai:s.ai-INCL.ai }; }
  function addonMonthly(){ return (s.edge?ADD.edge:0) + (s.trendz?ADD.trendz:0); }
  function extrasMonthly(){ var e=extras(); return e.prod*UNIT.prod + e.dev*UNIT.dev + e.ai*UNIT.ai; }
  function deltaMonthly(){ return addonMonthly() + extrasMonthly(); }
  function newMonthly(){ return BASE + deltaMonthly(); }
  function dueToday(){ return deltaMonthly() * PRORATE; }

  function changes(){
    var out = [], e = extras();
    if(s.edge)   out.push({ t:'+ Edge Computing',   amt:ADD.edge });
    if(s.trendz) out.push({ t:'+ Trendz Analytics', amt:ADD.trendz });
    if(e.prod>0) out.push({ t:'+'+e.prod+' production instance'+(e.prod>1?'s':''), amt:e.prod*UNIT.prod, unit:UNIT.prod });
    if(e.dev>0)  out.push({ t:'+'+e.dev+' development instance'+(e.dev>1?'s':''),  amt:e.dev*UNIT.dev, unit:UNIT.dev });
    if(e.ai>0)   out.push({ t:'+'+e.ai+' AI block'+(e.ai>1?'s':'')+' (1M)',         amt:e.ai*UNIT.ai, unit:UNIT.ai });
    return out;
  }

  function render(){
    $('#fsValProd').textContent = s.prod;
    $('#fsValDev').textContent  = s.dev;
    $('#fsValAi').textContent   = s.ai;
    $('#fsEdge').checked   = s.edge;
    $('#fsTrendz').checked = s.trendz;
    $('#fsCardEdge').classList.toggle('on', s.edge);
    $('#fsCardTrendz').classList.toggle('on', s.trendz);
    $$('.stepper', scr).forEach(function(st){
      var f = st.getAttribute('data-field');
      st.querySelector('[data-dir="-1"]').disabled = s[f] <= MIN[f];
      st.querySelector('[data-dir="1"]').disabled  = s[f] >= MAX[f];
    });
    var ch = changes();
    $('#fsNewMonthly').textContent = money(newMonthly()) + ' / mo';
    $('#fsChgCount').textContent = ch.length ? ('· '+ch.length+' change'+(ch.length>1?'s':'')) : '· no changes';
    var html = '<div class="am-sumrow cur"><span>Current</span><span>'+money(BASE)+' / mo</span></div>';
    ch.forEach(function(c){ var left = c.unit ? (c.t + ' × ' + money(c.unit)) : c.t; html += '<div class="am-sumrow"><span>'+left+'</span><span>'+money(c.amt)+'</span></div>'; });
    $('#fsSumList').innerHTML = html;
  }

  function render2(){
    var ch = changes();
    var rows = '';
    ch.forEach(function(c){ var left = c.unit ? (c.t + ' × ' + money(c.unit)) : c.t; rows += '<div class="am-orow"><div>'+left+'</div><div>'+money(c.amt)+'</div></div>'; });
    $('#fsOrderLines').innerHTML = rows;
    $('#fsRecMonthly').textContent = money(newMonthly()) + ' / mo';
    $('#fsDueVal').textContent = money(dueToday());
    // the amount lives in the Due today block, so the button stays a plain label
    $('#fsSuccessDue').textContent = 'Prorated charge today: ' + money(dueToday()) + '.';
  }

  function goStep(n){
    $('#fsStep1').hidden = n!==1;
    $('#fsStep2').hidden = n!==2;
    $('#fsSuccess').hidden = true;
    $('#fsBack').hidden = n!==2;   // Back sits in the header, review step only
    if(n===2) render2();
    if(body) body.scrollTop = 0;
  }

  function showSuccess(){
    $('#fsStep1').hidden = true;
    $('#fsStep2').hidden = true;
    $('#fsSuccess').hidden = false;
    $('#fsBack').hidden = true;
    if(body) body.scrollTop = 0;
    $('#fsDone').focus();
  }

  // seed the whole flow from the licence it was opened for (details page or a
  // table row). Labels in the static markup stay ThingsBoard-worded — noted debt.
  function seed(lic){
    var t = lic && AMF_TIERS[lic.tier] ? lic.tier : 'prototype';
    var d = AMF_TIERS[t], spec = TIER_SPECS[t] || { ent:[] };
    BASE = d.base;
    INCL = { prod:d.prod, dev:0, ai:d.ai };
    MIN  = { prod:d.prod, dev:0, ai:d.ai };
    var xp = lic && lic.extras ? parseInt(lic.extras.prod || '0', 10) || 0 : 0;
    var xa = lic && lic.extras ? parseInt(String(lic.extras.ai || '0'), 10) || 0 : 0;
    s = { prod:d.prod + xp, dev:0, ai:d.ai + xa, edge:!!(lic && lic.edge), trendz:!!(lic && lic.trendz) };
    var name = (TIER_SPECS[t] && TIER_SPECS[t].name) || 'Prototype';
    $('#fsTitle').textContent = lic
      ? ('Manage ' + lic.product + ' ' + lic.name + (lic.label ? ' · ' + lic.label : ''))
      : 'Manage ThingsBoard Professional edition · Prototype';
    var devIn = $('#fsAddons .fs-devinput'); if(devIn && spec.ent[0]) devIn.value = spec.ent[0][1];
    var locked = $('#fsAddons .am-cardprice.locked'); if(locked) locked.textContent = 'fixed by ' + name + ' plan';
    var pl = $('#fsPlanLine');
    if(pl) pl.textContent = name + ' · ' + spec.ent.map(function(en){ return en[1] + ' ' + en[0].toLowerCase(); }).join(' · ');
  }
  function open(lic){ lastFocus = document.activeElement; seed(lic || null); render(); goStep(1); scr.hidden = false; $('#fsCancel').focus(); }
  function close(){ scr.hidden = true; if(lastFocus && lastFocus.focus) lastFocus.focus(); }

  $$('.stepper button', scr).forEach(function(btn){
    btn.addEventListener('click', function(){
      var st = btn.closest('.stepper'), f = st.getAttribute('data-field');
      s[f] = Math.max(MIN[f], Math.min(MAX[f], s[f] + parseInt(btn.getAttribute('data-dir'), 10)));
      render();
    });
  });
  $$('input[data-addon]', scr).forEach(function(cb){
    cb.addEventListener('change', function(){ s[cb.getAttribute('data-addon')] = cb.checked; render(); });
  });
  $('#fsNext').addEventListener('click', function(){ goStep(2); });
  $('#fsBack').addEventListener('click', function(){ goStep(1); });
  $('#fsConfirm').addEventListener('click', showSuccess);
  $('#fsDone').addEventListener('click', close);
  $('#fsCancel').addEventListener('click', close);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !scr.hidden && $('#overlay').hidden) close(); });

  return { open: open };
})();

function openManageAddons(lic){ AMF.open(lic); }


/* the PE feature card: one renderer, three surfaces (wizard step 2, the
   perpetual step, and the new-user plan screen) */
function peBlockHTML(intro){
  return '<div class="nl-pe">'
    + '<div class="nl-pe-h">What\u2019s included in Professional Edition</div>'
    + (intro ? '<p class="nl-pe-intro">' + intro + '</p>' : '')
    + '<div class="nl-pe-body">'
    + PE_FEATURES.map(function(f){ return '<div class="nl-pe-item"><b>' + f[0] + '</b> — ' + f[1] + '</div>'; }).join('')
    + '</div></div>';
}

/* ============ New license flow (NL) — stepped modal ============
   Subscription: 1 Product → 2 Plan → 3 Customize → 4 Review & pay.
   Perpetual:    1 Product → 2 Package → 3 Customize → 4 Review & pay.
   Completed steps are clickable back (selections preserved); future steps are
   not. Step 3 reuses the Manage plan & add-ons content, seeded from the chosen
   plan/package. Confirm appends the licence to the CURRENT dataset (DATA())
   and lands on the Licenses page so the new row is visible. Closing mid-flow
   with selections made asks the same unsaved-changes confirmation as the
   settings pages. */

/* ---------- new licence wizard ---------- */
/* ============ New license flow (NL) — stepped modal ============
   Subscription: 1 Product → 2 Plan → 3 Customize → 4 Review & pay.
   Perpetual:    1 Product → 2 Package → 3 Customize → 4 Review & pay.
   Completed steps are clickable back (selections preserved); future steps are
   not. Step 3 reuses the Manage plan & add-ons content, seeded from the chosen
   plan/package. Confirm appends the licence to the CURRENT dataset (DATA())
   and lands on the Licenses page so the new row is visible. Closing mid-flow
   with selections made asks the same unsaved-changes confirmation as the
   settings pages. */
var NL = (function(){
  var scr = $('#nlModal'), body = $('#nlBody');
  var lastFocus = null;
  var st = { kind:'subscription', product:null, plan:null, step:1, dirty:false };
  var cust = { prod:1, dev:0, ai:0, edge:false, trendz:false };
  var seededTier = null;

  var PRODUCT_CARDS = [
    { key:'thingsboard', name:'ThingsBoard',
      vline:'Build your IoT solution. On your terms.',
      sline:'The agile subscription for instant enterprise IoT — deploy anywhere, scale as you grow, pay only for what you need.',
      unlimited:'Customers · Users · Dashboards · Messages · API calls · Integrations' },
    { key:'tbmq', name:'TBMQ',
      vline:'Scale your messaging. On demand.',
      sline:'High-performance MQTT broker with a flexible, consumption-based licensing model.' }
  ];
  // included quantities per tier (production instances / AI blocks of 1M)
  var INCL = { maker:{prod:1,ai:1}, prototype:{prod:1,ai:2}, pilot:{prod:1,ai:4}, startup:{prod:2,ai:8}, business:{prod:3,ai:16},
               tbmqsub:{prod:1,ai:0}, tbperp:{prod:1,ai:5}, tbmqperp:{prod:1,ai:0} };
  var BASE = { maker:10, prototype:39, pilot:99, startup:299, business:499, tbmqsub:15, tbperp:4999, tbmqperp:2999 };
  // PLACEHOLDER unit prices (prototype only). Perpetual production instance is
  // anchored to the $1,999 Add-capacity invoice; the rest are inferred.
  var UNITS = { sub:{prod:29,dev:15,ai:5}, perpTB:{prod:1999,ai:500}, perpMQ:{prod:999,ai:0} };
  var ADD = { edge:7, trendz:12 };
  var NAME = { maker:'Maker', prototype:'Prototype', pilot:'Pilot', startup:'Startup', business:'Business',
               tbmqsub:'PE subscription', tbperp:'PE Perpetual License', tbmqperp:'PE license' };
  var MAXQ = { prod:20, dev:20, ai:99 };

  function money(n){ return '$' + n.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
  function isPerp(){ return st.kind === 'perpetual'; }
  function tier(){
    if(isPerp()) return st.product === 'tbmq' ? 'tbmqperp' : 'tbperp';
    return st.product === 'tbmq' ? 'tbmqsub' : String(st.plan || '').toLowerCase();
  }
  function units(){ return isPerp() ? (st.product === 'tbmq' ? UNITS.perpMQ : UNITS.perpTB) : UNITS.sub; }
  function isChange(){ return st.mode === 'change'; }
  function oldMonthly(){ return BASE[st.oldTier] || 0; }
  function confirmLabel(){ return isChange() ? 'Confirm change' : (isPerp() ? 'Buy license' : 'Subscribe'); }
  function currentCardName(){ return st.oldTier === 'tbmqsub' ? 'TBMQ PE subscription' : st.oldName; }
  function hasAddons(){ return !isPerp() && st.product === 'thingsboard'; }
  function hasDev(){ return !isPerp() && st.product === 'thingsboard'; }
  function hasAi(){ var i = INCL[tier()]; return !!(i && i.ai > 0); }
  function ecKey(){ return (st.product || 'thingsboard') + '|' + (isPerp() ? 'perpetual' : 'payg'); }
  function perSuffix(){ return isPerp() ? '' : ' / mo'; }

  function extras(){ var i = INCL[tier()] || { prod:1, ai:0 }; return { prod:Math.max(0, cust.prod - i.prod), dev:cust.dev, ai:Math.max(0, cust.ai - i.ai) }; }
  function deltas(){
    var u = units(), e = extras(), out = [];
    if(e.prod > 0) out.push({ t:'+' + e.prod + ' production instance' + (e.prod > 1 ? 's' : ''), amt:e.prod * u.prod, unit:u.prod });
    if(hasDev() && e.dev > 0) out.push({ t:'+' + e.dev + ' development instance' + (e.dev > 1 ? 's' : ''), amt:e.dev * u.dev, unit:u.dev });
    if(hasAi() && e.ai > 0) out.push({ t:'+' + e.ai + ' AI block' + (e.ai > 1 ? 's' : '') + ' (1M)', amt:e.ai * u.ai, unit:u.ai });
    if(hasAddons() && cust.edge)   out.push({ t:'+ Edge Computing',   amt:ADD.edge });
    if(hasAddons() && cust.trendz) out.push({ t:'+ Trendz Analytics', amt:ADD.trendz });
    return out;
  }
  function total(){ return (BASE[tier()] || 0) + deltas().reduce(function(a, c){ return a + c.amt; }, 0); }
  function entSummary(t){
    var spec = TIER_SPECS[t] || { ent:[] };
    return spec.ent.map(function(e){
      var lbl = e[0] === 'AI credits' ? 'AI credits' : e[0].toLowerCase();
      if(e[1] === '1') lbl = lbl.replace(/s$/, '');
      return e[1] + ' ' + lbl;
    }).join(' · ');
  }

  /* ---- step indicator: a thin progress line under the header, then one
     "Step N of M · Label" row. ---- */
  // perpetual path is 3 steps (each product has exactly one package)
  function stepLabels(){ return isPerp() ? ['Product & Plan', 'Customize', 'Review & pay'] : ['Product', 'Plan', 'Customize', 'Review & pay']; }
  function totalSteps(){ return isPerp() ? 3 : 4; }
  function panelFor(n){ return isPerp() ? (n === 1 ? 1 : n + 1) : n; }   // perp: 1→1, 2→3(customize), 3→4(review)
  function m0(n){ return '$' + n.toLocaleString('en-US'); }
  function renderSteps(){
    var labels = stepLabels();
    $('#nlSteps').innerHTML = '<div class="nl-progress">'
      + '<div class="nl-ptrack"><span class="nl-pfill" style="width:' + (st.step / totalSteps() * 100) + '%"></span></div>'
      + '<div class="nl-plabel">Step ' + st.step + ' of ' + totalSteps() + ' · <b>' + labels[st.step - 1] + '</b></div></div>';
  }
  function renderFooter(){
    // step 1 has no footer at all — clicking a product card advances
    $('#nlFoot').hidden = st.step === 1;
    $('#nlBack').hidden = st.step === 1;
    var next = $('#nlNext');
    next.textContent = st.step === totalSteps() ? confirmLabel() : 'Continue';
    next.disabled = (!isPerp() && st.step === 2 && !st.plan);
  }

  /* ---- step 1: large product cards; clicking advances (no Continue).
     Perpetual path merges Product & Plan: each card carries its full package. ---- */
  function renderStep1(){
    var grid = $('#nlProdCards'), extra = $('#nlProdExtra');
    if(isPerp()){
      grid.innerHTML = PRODUCT_CARDS.map(function(c){
        var card = EC_PLANS[c.key + '|perpetual'].cards[0];
        var on = st.product === c.key;
        var feats = card.feats.filter(function(f){ return !/^All /.test(f); });
        return '<div class="dblock plancard nl-prodcard nl-select' + (on ? ' on' : '') + '" data-product="' + c.key + '" role="button" tabindex="0" aria-pressed="' + on + '">'
          + '<div class="pc-head"><h2>' + card.name + '</h2></div>'
          + '<div class="nl-vline">' + c.vline + '</div>'
          + '<div class="pc-price">' + card.price + ' <span class="pc-per">' + card.per + '</span></div>'
          + '<div class="pc-term">' + card.term + '</div>'
          + '<div class="pc-feats">' + feats.map(function(f){ return '<div class="pc-feat">' + f + '</div>'; }).join('') + '</div>'
          + '</div>';
      }).join('');
      extra.innerHTML = peBlockHTML();
      return;
    }
    grid.innerHTML = PRODUCT_CARDS.map(function(c){
      return productCardHTML(c, st.product === c.key);   // shared with styleguide.html
    }).join('');
    extra.innerHTML = '';
  }

  /* ---- step 2 (subscription): plan cards with capacity + support tier + White
     labeling (Pilot+); the PE card below carries the shared included-in-all line ---- */
  function renderStep2(){
    var set = EC_PLANS[ecKey()];
    if(set.single && !st.plan && !isChange()) st.plan = set.cards[0].name;
    var grid = $('#nlPlanCards');
    grid.className = 'plangrid' + (set.single ? ' one' : '') + (isChange() ? ' withcur' : '');
    grid.innerHTML = set.cards.map(function(c){
      var current = isChange() && c.name === currentCardName();
      var on = !current && c.name === st.plan;
      // Current plan = a strip sitting on the card's top edge (see .pc-strip)
      var strip = current ? '<div class="pc-strip">Current plan</div>' : '';
      var badge = !current && c.badge ? '<span class="pill">' + c.badge + '</span>' : '';
      return '<div class="dblock plancard ' + (current ? 'nl-current' : 'nl-select') + (on ? ' on' : '') + '" data-plan="' + c.name + '" role="button" tabindex="0" aria-pressed="' + on + '"' + (current ? ' aria-disabled="true"' : '') + '>'
        + strip
        + '<div class="pc-head"><h2>' + c.name + '</h2>' + badge + '</div>'
        + '<div class="pc-price">' + c.price + ' <span class="pc-per">' + c.per + '</span></div>'
        + (c.term ? '<div class="pc-term">' + c.term + '</div>' : '')
        + '<div class="pc-feats">' + c.feats.map(function(f){ return '<div class="pc-feat">' + f + '</div>'; }).join('') + '</div>'
        + (c.foot ? '<div class="pc-note">' + c.foot + '</div>' : '')
        + '</div>';
    }).join('');
    // the full PE feature set, once — a self-contained card; the shared
    // "All plans include…" line is its muted intro (nothing floats between
    // the grid and the card).
    // inferred: listed features are ThingsBoard PE, so the card shows for the
    // ThingsBoard product only (both billing kinds); TBMQ gets none.
    var extra = $('#nlPlanExtra');
    extra.innerHTML = st.product === 'thingsboard'
      ? peBlockHTML(isPerp() ? '' : PLANS_INCLUDE_NOTE)
      : '';
  }

  /* ---- step 3: customize (manage add-ons content, seeded from the plan) ---- */
  function fixedCell(lbl, val, t){
    // the "fixed by" line sits in the description slot — same title-to-description
    // gap token as every other PLAN row (see .fs-celldesc)
    return '<div class="am-cell"><div class="fs-cellhead"><div class="fs-celltext">'
      + '<div class="am-celltop">' + lbl + '</div>'
      + '<div class="fs-celldesc"><span class="am-cardprice locked" style="margin:0">fixed by ' + (NAME[t] || 'plan') + (isPerp() ? '' : ' plan') + '</span></div></div>'
      + '<input class="fs-devinput" type="text" value="' + val + '" disabled aria-label="' + lbl + '"></div>'
      + '</div>';
  }
  function stepCell(field, label, desc, priceNote, val, min){
    var minus = val <= min ? ' disabled' : '', plus = val >= MAXQ[field] ? ' disabled' : '';
    return '<div class="am-cell"><div class="fs-cellhead"><div class="fs-celltext">'
      + '<div class="am-celltop">' + label + '</div>'
      + (desc ? '<div class="fs-celldesc">' + desc + '</div>' : '') + '</div>'
      + '<div class="stepper" data-nl-field="' + field + '">'
      + '<button type="button" data-dir="-1"' + minus + ' aria-label="Decrease ' + label + '">−</button>'
      + '<span class="val" aria-live="polite">' + val + '</span>'
      + '<button type="button" data-dir="1"' + plus + ' aria-label="Increase ' + label + '">+</button></div></div>'
      + '<div class="am-cardprice">' + priceNote + '</div></div>';
  }
  function addonCard(key, name, desc, price, on){
    return '<div class="am-card' + (on ? ' on' : '') + '"><div class="am-cardtop">'
      + '<input type="checkbox" class="am-addcheck" data-nl-addon="' + key + '"' + (on ? ' checked' : '') + ' aria-label="Add ' + name + ' add-on">'
      + '<div><div class="am-cardname">' + name + '</div><div class="am-carddesc">' + desc + '</div></div></div>'
      + '<div class="am-cardprice">+' + money(price) + ' /mo</div></div>';
  }
  function summaryHTML(){
    var html = '';
    if(isChange()) html += '<div class="am-sumrow cur"><span>Current · ' + st.oldName + '</span><span>' + money(oldMonthly()) + ' / mo</span></div>';
    html += '<div class="am-sumrow cur"><span>' + (NAME[tier()] || st.plan) + ' base</span><span>' + money(BASE[tier()] || 0) + perSuffix() + '</span></div>';
    deltas().forEach(function(c){
      var left = c.unit ? (c.t + ' × ' + money(c.unit)) : c.t;
      html += '<div class="am-sumrow"><span>' + left + '</span><span>' + money(c.amt) + '</span></div>';
    });
    return html;
  }
  function renderStep3(){
    var t = tier(), i = INCL[t] || { prod:1, ai:0 }, u = units(), spec = TIER_SPECS[t] || { ent:[] };
    if(seededTier !== t){ cust = { prod:i.prod, dev:0, ai:i.ai, edge:false, trendz:false }; seededTier = t; }
    var per = isPerp() ? ' one-time' : ' / mo';
    var cells = '';
    spec.ent.forEach(function(e){
      var lbl = e[0], val = e[1];
      if(lbl === 'Production instances'){
        cells += stepCell('prod', 'Production instances', 'Production compute — ' + i.prod + ' included. Enables clustering and HA.', '+' + money(u.prod) + per + ' each', cust.prod, i.prod);
      } else if(lbl === 'AI credits'){
        cells += stepCell('ai', 'AI credits', '1 = 1,000,000 credits. Minimum matches your plan — increase to buy more.', '+' + money(u.ai) + per + ' per 1M AI credits', cust.ai, i.ai);
      } else {
        cells += fixedCell(lbl, val, t);
      }
    });
    if(hasDev()) cells += stepCell('dev', 'Development instances', 'Dedicated instances for dev, test, and CI/CD — keeps production data clean.', '+' + money(u.dev) + per + ' each', cust.dev, 0);
    var addons = '';
    if(hasAddons()){
      addons = '<div class="am-sechead am-sechead-sub"><h4>Add-ons</h4></div><div class="am-cardgrid">'
        + addonCard('edge', 'Edge Computing', 'Edge instances at remote sites for offline processing and auto-sync.', ADD.edge, cust.edge)
        + addonCard('trendz', 'Trendz Analytics', 'Advanced analytics, custom dashboards, and trend discovery.', ADD.trendz, cust.trendz)
        + '</div>';
    }
    $('#nlStep3').innerHTML =
      '<div class="fs-grid">'
      + '<div class="fs-col"><div class="am-sec fs-panel">'
      +   '<div class="am-sechead"><h4>' + (isPerp() ? 'Package' : 'Plan') + '</h4><span class="am-cap">' + (isChange() ? (st.oldName + ' \u2192 ' + (NAME[t] || st.plan)) : (NAME[t] || st.plan)) + '</span></div>'
      +   '<div class="am-capgrid">' + cells + '</div>'
      +   addons
      + '</div></div>'
      + '<div class="am-sec fs-right">'
      +   '<div class="am-sechead"><h4>Calculation summary</h4></div>'
      +   '<div class="am-figures"><div class="am-sumlist">' + summaryHTML() + '</div>'
      +     '<div class="am-sumrow am-total-row"><span>' + (isPerp() ? 'One-time total' : 'New monthly') + '</span><span>' + money(total()) + perSuffix() + '</span></div>'
      +   '</div>'
      + '</div>'
      + '</div>';
  }

  /* ---- step 4: review & pay ---- */
  function renderStep4(){
    var t = tier();
    var rows = '';
    deltas().forEach(function(c){
      var left = c.unit ? (c.t + ' × ' + money(c.unit)) : c.t;
      rows += '<div class="am-orow"><div>' + left + '</div><div>' + money(c.amt) + '</div></div>';
    });
    $('#nlStep4').innerHTML =
      '<div class="fs-review">'
      + '<h4 class="am-h2">' + (isChange() ? 'Review change' : 'Review &amp; pay') + '</h4>'
      + '<p class="am-sub2">' + (isChange() ? 'Confirm the plan change and what you\u2019ll be charged now.' : (isPerp() ? 'One-time purchase — no renewal, no auto-pay.' : 'Billed monthly · auto-pay. Cancel anytime.')) + '</p>'
      + '<div class="am-order">'
      +   '<div class="am-orow am-planrow nl-mainline"><div>' + (st.product === 'tbmq' ? 'TBMQ' : 'ThingsBoard') + ' ' + (isChange() ? (st.oldName + ' \u2192 ' + (NAME[t] || st.plan)) : (NAME[t] || st.plan)) + '</div><div>' + money(BASE[t] || 0) + perSuffix() + '</div></div>'
      +   '<div class="am-orow nl-entline"><div>' + entSummary(t) + '</div><div></div></div>'
      +   rows
      +   '<div class="am-orow am-newmonthly"><div>' + (isChange() ? 'New monthly' : (isPerp() ? 'One-time total' : 'Monthly total')) + '</div><div>' + money(total()) + perSuffix() + '</div></div>'
      + '</div>'
      + '<div class="am-due">'
      +   (isChange()
          ? '<div class="am-duerow"><div class="am-duelabel">Due today <span class="muted">— prorated change for the current cycle (16 of 31 days, to 2026-08-30)</span></div><div class="am-dueval">' + money(Math.max(0, total() - oldMonthly()) * 16 / 31) + '</div></div>'
          : '<div class="am-duerow"><div class="am-duelabel">Due today</div><div class="am-dueval">' + money(total()) + '</div></div>')
      +   '<div class="am-payrow">' + (isPerp() ? 'Charged once to' : 'Charged to') + ' Visa ••4242' + (isPerp() ? '' : ' · auto-pay') + ' · <button class="link" id="nlPayChange">Change → Billing &amp; payment</button></div>'
      + '</div>'
      + '</div>';
  }

  function gotoStep(n){
    st.step = n;
    var panel = panelFor(n);
    if(panel === 1) renderStep1();
    if(panel === 2) renderStep2();
    if(panel === 3) renderStep3();
    if(panel === 4) renderStep4();
    [1, 2, 3, 4].forEach(function(i){ $('#nlStep' + i).hidden = i !== panel; });
    renderSteps(); renderFooter();
    if(body) body.scrollTop = 0;
  }

  /* ---- confirm: loading on the button (~1.5s), then a success modal with the
     licence key; Done lands on Licenses where the new row is visible ---- */
  function commitPurchase(){
    if(isChange()){ commitChange(); return; }
    var t = tier(), e = extras(), tot = total();
    var seq = storeNextSeq();          // persisted, so ids stay unique across reloads
    var lic = { id:'N' + seq, tier:t,
      product: st.product === 'tbmq' ? 'TBMQ' : 'ThingsBoard',
      type: isPerp() ? 'Perpetual' : 'Subscription',
      name: NAME[t] || st.plan,
      label:'', created:'Aug 19 2026', status:'active',
      event: isPerp() ? 'Aug 19 2027' : 'Sep 19 2026',
      price: isPerp() ? 'one-time' : (money(tot) + ' / mo'),
      billing: isPerp() ? 'paid' : 'auto-pay' };
    var x = {};
    if(e.prod > 0) x.prod = String(e.prod);
    if(hasDev() && e.dev > 0) x.dev = String(e.dev);
    if(hasAi() && e.ai > 0) x.ai = e.ai + 'M';
    if(Object.keys(x).length) lic.extras = x;
    if(hasAddons()){ lic.edge = cust.edge; lic.trendz = cust.trendz; }
    storeAddLicense(lic);              // straight into the mock backend
    st.dirty = false;
    scr.hidden = true;
    showSuccess(lic, seq);
  }
  function commitChange(){
    var lic = st.changeLic, t = tier(), e = extras();
    lic.tier = t;
    lic.name = NAME[t] || st.plan;
    lic.price = money(total()) + ' / mo';
    var x = {};
    if(e.prod > 0) x.prod = String(e.prod);
    if(hasDev() && e.dev > 0) x.dev = String(e.dev);
    if(hasAi() && e.ai > 0) x.ai = e.ai + 'M';
    if(Object.keys(x).length){ lic.extras = x; } else { delete lic.extras; }
    if(hasAddons()){ lic.edge = cust.edge; lic.trendz = cust.trendz; }
    Store.save();                      // the licence object was mutated in place
    st.dirty = false;
    scr.hidden = true;
    location.href = licenseHref(lic);  // land on the licence details, now on the new plan
  }
  function startPurchase(){
    var next = $('#nlNext');
    if(next.disabled) return;
    next.style.width = Math.ceil(next.getBoundingClientRect().width) + 'px';   // label keeps width
    next.disabled = true;
    next.innerHTML = '<span class="nl-spin" aria-hidden="true"></span>';
    setTimeout(function(){
      next.style.width = ''; next.disabled = false; next.textContent = confirmLabel();
      commitPurchase();
    }, 1500);
  }
  function showSuccess(lic, seq){
    var prod = lic.product === 'TBMQ' ? 'TBMQ' : 'ThingsBoard';
    $('#nlSuccessTitle').textContent = 'Thank you for purchasing ' + prod + ' Professional Edition '
      + (lic.type === 'Perpetual' ? 'perpetual license' : 'subscription');
    // deterministic mock key (no persistence; varies by sequence)
    $('#nlKeyVal').textContent = 'a7c4-1f0e-9b2d-' + String(1000 + (seq || 1)) + '-77aa-3f2a';
    $('#nlSuccess').hidden = false;
    $('#nlSuccessDone').focus();
  }
  function finishSuccess(){
    $('#nlSuccess').hidden = true;
    location.href = 'licenses.html';   // land where the new row is visible
  }

  /* ---- open / close (unsaved-changes guard on mid-flow close) ---- */
  function forceClose(){ st.dirty = false; scr.hidden = true; if(lastFocus && lastFocus.focus) lastFocus.focus(); }
  function attemptClose(afterFn){
    if(!st.dirty){ forceClose(); if(afterFn) afterFn(); return; }
    openModal('You have unsaved changes.',
      '<p>Your ' + (isChange() ? 'plan change' : 'new-license setup') + ' hasn’t been completed yet. If you leave now, your selections will be lost.</p>');
    var foot = $('#overlay .mf');
    var leave = document.createElement('button');
    leave.type = 'button'; leave.className = 'btn ter'; leave.id = 'nlLeaveBtn'; leave.textContent = 'Leave without saving';
    foot.insertBefore(leave, $('#modalCloseBtn'));
    $('#modalCloseBtn').textContent = 'Stay';
    leave.addEventListener('click', function(){ closeModal(); forceClose(); if(afterFn) afterFn(); });
    $('#modalCloseBtn').focus();
  }
  function open(opts){
    opts = opts || {};
    lastFocus = document.activeElement;
    st.mode = opts.mode === 'change' ? 'change' : 'new';
    st.changeLic = opts.license || null;
    st.kind = opts.kind === 'perpetual' ? 'perpetual' : 'subscription';
    st.product = opts.product || null;
    st.plan = opts.plan || null;
    st.dirty = !!(opts.product || opts.plan);   // preselected entry counts as selections made
    seededTier = null;
    cust = { prod:1, dev:0, ai:0, edge:false, trendz:false };
    if(st.mode === 'change' && st.changeLic){
      // change-plan mode: product locked to the licence, wizard starts at Plan
      var cl = st.changeLic;
      st.kind = 'subscription';
      st.product = cl.product === 'TBMQ' ? 'tbmq' : 'thingsboard';
      st.plan = null;
      st.oldTier = cl.tier; st.oldName = cl.name;
      st.dirty = false;
      $('#nlTitle').textContent = 'Change plan · ' + cl.name + (cl.label ? ' · ' + cl.label : '');
      gotoStep(2);
    } else {
      $('#nlTitle').textContent = isPerp() ? 'New perpetual license' : 'New subscription';
      gotoStep(opts.startStep && st.product && st.plan ? (isPerp() ? 2 : 3) : 1);   // preselected entry lands on Customize
    }
    scr.hidden = false;
    $('#nlClose').focus();
  }

  /* ---- events (step content re-renders, so everything is delegated) ---- */
  $('#nlBack').addEventListener('click', function(){ if(st.step > 1) gotoStep(st.step - 1); });
  $('#nlNext').addEventListener('click', function(){ if(st.step < totalSteps()){ gotoStep(st.step + 1); } else { startPurchase(); } });
  $('#nlSuccessDone').addEventListener('click', finishSuccess);
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !$('#nlSuccess').hidden && $('#overlay').hidden) finishSuccess(); });
  $('#nlKeyCopy').addEventListener('click', function(){
    var btn = $('#nlKeyCopy');
    var flash = function(){
      btn.setAttribute('data-tip', 'Copied'); btn.classList.add('show', 'copied');
      setTimeout(function(){ btn.classList.remove('show', 'copied'); btn.setAttribute('data-tip', 'Copy'); }, 1200);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText($('#nlKeyVal').textContent).then(flash, flash); } else { flash(); }
  });
  body.addEventListener('click', function(e){
    var pc = e.target.closest('#nlProdCards .nl-select');
    if(pc){
      var k = pc.getAttribute('data-product');
      if(st.product !== k){ st.product = k; st.plan = null; }
      if(isPerp()) st.plan = EC_PLANS[k + '|perpetual'].cards[0].name;   // merged Product & Plan
      st.dirty = true; gotoStep(2); return;
    }
    var pl = e.target.closest('#nlPlanCards .nl-select');
    if(pl){ st.plan = pl.getAttribute('data-plan'); st.dirty = true; renderStep2(); renderFooter(); return; }
    var sb = e.target.closest('#nlStep3 .stepper button');
    if(sb){
      var f = sb.closest('.stepper').getAttribute('data-nl-field');
      var min = f === 'dev' ? 0 : ((INCL[tier()] || {})[f] || 0);
      cust[f] = Math.max(min, Math.min(MAXQ[f], cust[f] + parseInt(sb.getAttribute('data-dir'), 10)));
      st.dirty = true; renderStep3(); return;
    }
    if(e.target.closest('#nlPayChange')){ attemptClose(function(){ location.href = 'billing.html'; }); }
  });
  body.addEventListener('change', function(e){
    var cb = e.target.closest('input[data-nl-addon]');
    if(cb){ cust[cb.getAttribute('data-nl-addon')] = cb.checked; st.dirty = true; renderStep3(); }
  });
  body.addEventListener('keydown', function(e){
    if((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('nl-select')){ e.preventDefault(); e.target.click(); }
  });
  $('#nlClose').addEventListener('click', function(){ attemptClose(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !scr.hidden && $('#overlay').hidden) attemptClose(); });

  return { open: open, openChange: function(lic){ open({ mode:'change', license: lic }); } };
})();


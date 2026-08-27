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
+ '          <!-- variant A fills and shows this card; variant B shows the Devices row -->'
+ '          <div class="fs-panel nl-plansum" id="fsPlanSum" hidden></div>'
+ '          <div class="am-sec fs-panel">'
+ '            <div class="am-sechead"><h4>Capacity</h4></div>'
+ '            <div class="am-capgrid">'
+ '              <div class="am-cell" id="fsDevCell">'
+ '                <div class="fs-cellhead">'
+ '                  <div class="fs-celltext">'
+ '                    <div class="am-celltop">Devices</div>'
+ '                  </div>'
+ '                  <span class="fs-lockfield">'
+ '                    <svg class="icon fs-lockic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
+ '                    <input class="fs-devinput locked" type="text" value="50" disabled aria-label="Devices — fixed by this plan">'
+ '                  </span>'
+ '                </div>'
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
+ '            <div class="am-capgrid">'
+ '              <div class="am-cell am-addon" id="fsCardEdge">'
+ '                <div class="fs-cellhead">'
+ '                  <div class="fs-celltext">'
+ '                    <div class="am-celltop">Edge Computing</div>'
+ '                    <div class="fs-celldesc">Edge instances at remote sites for offline processing and auto-sync.</div>'
+ '                    <div class="am-cardprice">+$7.00 /mo</div>'
+ '                  </div>'
+ '                  <label class="switch"><input type="checkbox" id="fsEdge" data-addon="edge" aria-label="Add Edge Computing add-on"><span class="track"></span></label>'
+ '                </div>'
+ '              </div>'
+ '              <div class="am-cell am-addon" id="fsCardTrendz">'
+ '                <div class="fs-cellhead">'
+ '                  <div class="fs-celltext">'
+ '                    <div class="am-celltop">Trendz Analytics</div>'
+ '                    <div class="fs-celldesc">Advanced analytics, custom dashboards, and trend discovery.</div>'
+ '                    <div class="am-cardprice">+$12.00 /mo</div>'
+ '                  </div>'
+ '                  <label class="switch"><input type="checkbox" id="fsTrendz" data-addon="trendz" aria-label="Add Trendz Analytics add-on"><span class="track"></span></label>'
+ '                </div>'
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
+ '      <!-- STEP 1 — CHOOSE YOUR PRODUCT AND PLAN: three stacked choices —'
+ '           product, billing type, then the offers for that pair. Each offer'
+ '           card carries its own action, so this step needs no footer. -->'
+ '      <div id="nlStep1">'
+ '        <div id="nlChoices"></div>'
+ '        <div class="nl-offerhead" id="nlOfferHead"></div>'
+ '        <div class="plangrid" id="nlPlanCards"></div>'
+ '      </div>'
+ '      <!-- STEP 2 — CUSTOMIZE (manage add-ons content, seeded from the chosen plan) -->'
+ '      <div id="nlStep2" hidden></div>'
+ '      <!-- STEP 3 — REVIEW (& PAY, when billing data already exists) -->'
+ '      <div id="nlStep3" hidden></div>'
+ '      <!-- STEP 4 — BILLING & PAYMENT (only when the account has no billing data) -->'
+ '      <div id="nlStep4" hidden></div>'
+ '    </div>'
+ '    <!-- no footer bar: every step commits from the card that carries its total -->'
+ '  </div>'
+ '</div>';

/* both modals are injected once per page, so no page carries a copy of them */
document.body.insertAdjacentHTML('beforeend', ADDONS_HTML + WIZARD_HTML);

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
  var lastFocus = null, lastSeedLic = null;

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
    lastSeedLic = lic || null;
    // A — the fixed entitlements move into a plan card above the controls;
    // B — they stay as the Devices row, locked inside its own input
    var variantA = custVariant() === 'a';
    var fixed = (spec.ent || []).filter(function(e){ return e[0] !== 'Production instances' && e[0] !== 'AI credits'; });
    var sum = $('#fsPlanSum'), cell = $('#fsDevCell');
    if(sum){
      sum.hidden = !variantA;
      var facts = fixed.map(function(e){ return e[1] + ' ' + e[0].toLowerCase(); });
      facts.push('fixed by this plan');
      var prod = lic ? lic.product : 'ThingsBoard';
      var typ = lic && lic.type ? lic.type : 'Subscription';
      sum.innerHTML = '<div class="nl-plansum-t">' + prod + ' ' + name + ' · ' + typ + '</div>'
        + '<div class="nl-plansum-f">' + facts.join(' · ') + '</div>';
    }
    if(cell) cell.hidden = variantA;
    var devIn = $('#fsAddons .fs-devinput'); if(devIn && fixed[0]) devIn.value = fixed[0][1];
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

  return { open: open,
           // the settings panel switches the Customize variant while it is open
           refresh: function(){ if(!scr.hidden){ seed(lastSeedLic); render(); } } };
})();

function openManageAddons(lic){ AMF.open(lic); }



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
  /* Product, billing type and plan are all chosen on step 1, so there is no
     separate product step. The tail depends on the account: with billing data
     saved the last step is Review & pay and commits there; without it, Review
     only reviews and a Billing & payment step is appended to collect the data
     and commit. Nothing hardcodes the count — the progress line reads it. */
  // a licence you can change already pays for itself, so change-plan never asks
  // for billing data — only a first purchase can land on the billing step
  function needsBilling(){ return !isChange() && !billingSaved(); }
  function stepLabels(){
    return needsBilling()
      ? ['Choose your product and plan', 'Customize', 'Review', 'Billing & payment']
      : ['Choose your product and plan', 'Customize', 'Review & pay'];
  }
  function totalSteps(){ return stepLabels().length; }
  function isLastStep(){ return st.step === totalSteps(); }
  function m0(n){ return '$' + n.toLocaleString('en-US'); }
  function renderSteps(){
    var labels = stepLabels();
    // Back is an icon button here, right before the step label — the footer no
    // longer carries it (and the Customize step has no footer at all)
    var back = st.step > 1
      ? '<button class="iconbtn ib nl-stepback" id="nlStepBack" aria-label="Back" title="Back">'
        + '<svg class="icon" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>'
      : '';
    $('#nlSteps').innerHTML = '<div class="nl-progress">'
      + '<div class="nl-ptrack"><span class="nl-pfill" style="width:' + (st.step / totalSteps() * 100) + '%"></span></div>'
      + '<div class="nl-plabel">' + back
      + '<span>Step ' + st.step + ' of ' + totalSteps() + ' · <b>' + labels[st.step - 1] + '</b></span></div></div>';
  }


  /* ---- step 1 — choose your product and plan ------------------------------
     Three stacked choices on one screen: product, then billing type, then the
     offers for that pair. The first two are selectable cards that only narrow
     what is offered below — they never advance the step, because two more
     choices follow. The offer cards carry their own always-visible action (no
     hover-reveal: there is no hover on touch, and it hides the action), so the
     step needs no footer. Change-plan mode renders the first two levels
     selected-and-locked and marks the current plan as non-selectable. ---- */
  function planCount(set){ var n = set.cards.length; return n + (n === 1 ? ' plan' : ' plans'); }
  var PRODUCT_CHOICES = [
    { v:'thingsboard', t:'ThingsBoard', d:'IoT platform — devices, dashboards, rule engine, integrations.' },
    { v:'tbmq', t:'TBMQ', d:'High-performance MQTT broker for reliable message streaming.' }
  ];
  var BILLING_CHOICES = [
    { v:'subscription', t:'Subscription',
      d:'Pay every month. Unlimited customers, dashboards, integrations, API calls, data points and messages, and you can change the plan any time.' },
    { v:'perpetual', t:'Perpetual',
      d:'Pay once, run it indefinitely. Includes 12 months of software updates, renewable.' }
  ];
  function choiceLevel(label, field, opts, active, locked){
    return '<div class="nl-level">'
      + '<span class="nl-flabel">' + label + '</span>'
      + '<div class="nl-choices" role="group" aria-label="' + label + '">'
      + opts.map(function(o){
          var on = o.v === active;
          return '<button type="button" class="nl-choice' + (on ? ' is-on' : '') + '"'
            + ' data-nl-' + field + '="' + o.v + '" aria-pressed="' + on + '"' + (locked ? ' disabled' : '') + '>'
            + '<span class="nl-choice-t">' + o.t + '</span>'
            + '<span class="nl-choice-d">' + o.d + '</span>'
            + '</button>';
        }).join('')
      + '</div></div>';
  }
  function planPickCard(c, set){
    var current = isChange() && c.name === currentCardName();
    var on = !current && c.name === st.plan;
    // Current plan = a strip sitting on the card's top edge (see .pc-strip)
    var strip = current ? '<div class="pc-strip">Current plan</div>' : '';
    var badge = !current && c.badge ? '<span class="pill">' + c.badge + '</span>' : '';
    // primary on the popular plan, or on the only card when the pair leaves one
    var primary = set.cards.length === 1 || c.badge === 'Popular';
    var cta = current ? ''
      : '<button class="btn' + (primary ? '' : ' sec') + ' pc-cta" data-nl-pick="' + c.name + '">Select</button>';
    return '<div class="dblock plancard ' + (current ? 'nl-current' : 'nl-select') + (on ? ' on' : '')
      + '" data-plan="' + c.name + '" role="button" tabindex="' + (current ? '-1' : '0') + '"'
      + ' aria-pressed="' + on + '"' + (current ? ' aria-disabled="true"' : '') + '>'
      + strip
      + '<div class="pc-head"><h2>' + c.name + '</h2>' + badge + '</div>'
      + '<div class="pc-price">' + c.price + ' <span class="pc-per">' + c.per + '</span></div>'
      + (c.term ? '<div class="pc-term">' + c.term + '</div>' : '')
      + '<div class="pc-feats">' + c.feats.map(function(f){ return '<div class="pc-feat">' + f + '</div>'; }).join('') + '</div>'
      + (c.foot ? '<div class="pc-note">' + c.foot + '</div>' : '')
      + cta
      + '</div>';
  }
  function renderStep1(){
    var set = EC_PLANS[ecKey()], locked = isChange();
    $('#nlChoices').innerHTML =
        choiceLevel('Product', 'product', PRODUCT_CHOICES, st.product, locked)
      + choiceLevel('Billing', 'billing', BILLING_CHOICES, isPerp() ? 'perpetual' : 'subscription', locked);
    // the count sits right-aligned above the offers it counts
    $('#nlOfferHead').innerHTML = '<span class="spacer"></span><span class="nl-fcount">' + planCount(set) + '</span>';
    var grid = $('#nlPlanCards');
    grid.className = 'plangrid' + (set.single ? ' one' : '') + (locked ? ' withcur' : '');
    grid.innerHTML = set.cards.map(function(c){ return planPickCard(c, set); }).join('');
    // No "What's included in Professional Edition" block here any more: the
    // Subscription card above already says what every plan includes. The block
    // still lives on the new-user screen (see page-home.js).
  }
  /* ---- step 2: customize -----------------------------------------------------
     Two variants, switched from the prototype settings panel:
       A — a plan card on top carries the fixed entitlements as read-only facts,
           and the controls list holds only what can actually change;
       B — the fixed entitlements stay as rows, with a lock inside the disabled
           input instead of a "fixed by …" helper under it.
     Both keep Continue inside the (sticky) summary card and Back in the step
     header, so this step has no bottom footer at all. ---- */
  var LOCKSVG = '<svg class="icon fs-lockic" viewBox="0 0 24 24" aria-hidden="true">'
    + '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  // entitlements the plan fixes — everything the controls below cannot change
  function fixedEnt(spec){ return (spec.ent || []).filter(function(e){ return e[0] !== 'Production instances' && e[0] !== 'AI credits'; }); }
  function planSummaryHTML(t, spec){
    var product = st.product === 'tbmq' ? 'TBMQ' : 'ThingsBoard';
    var facts = fixedEnt(spec).map(function(e){ return e[1] + ' ' + e[0].toLowerCase(); });
    facts.push('fixed by this plan');
    return '<div class="fs-panel nl-plansum">'
      + '<div class="nl-plansum-t">' + product + ' ' + (NAME[t] || st.plan) + ' · ' + (isPerp() ? 'Perpetual' : 'Subscription') + '</div>'
      + '<div class="nl-plansum-f">' + facts.join(' · ') + '</div>'
      + '</div>';
  }
  // variant B: same disabled styling, but the lock rides inside the field
  function lockedCell(lbl, val){
    return '<div class="am-cell"><div class="fs-cellhead"><div class="fs-celltext">'
      + '<div class="am-celltop">' + lbl + '</div></div>'
      + '<span class="fs-lockfield">' + LOCKSVG
      + '<input class="fs-devinput locked" type="text" value="' + val + '" disabled aria-label="' + lbl + ' — fixed by this plan"></span>'
      + '</div></div>';
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
  // add-ons sit in the same rows as the steppers: text left, control on the right edge
  function addonRow(key, name, desc, price, on){
    return '<div class="am-cell am-addon' + (on ? ' on' : '') + '"><div class="fs-cellhead"><div class="fs-celltext">'
      + '<div class="am-celltop">' + name + '</div>'
      + '<div class="fs-celldesc">' + desc + '</div>'
      + '<div class="am-cardprice">+' + money(price) + ' /mo</div></div>'
      + '<label class="switch"><input type="checkbox" data-nl-addon="' + key + '"' + (on ? ' checked' : '')
      + ' aria-label="Add ' + name + ' add-on"><span class="track"></span></label>'
      + '</div></div>';
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
  function renderStep2(){
    var t = tier(), i = INCL[t] || { prod:1, ai:0 }, u = units(), spec = TIER_SPECS[t] || { ent:[] };
    if(seededTier !== t){ cust = { prod:i.prod, dev:0, ai:i.ai, edge:false, trendz:false }; seededTier = t; }
    var per = isPerp() ? ' one-time' : ' / mo';
    var variantA = custVariant() === 'a';
    var cells = '';
    spec.ent.forEach(function(e){
      var lbl = e[0], val = e[1];
      if(lbl === 'Production instances'){
        cells += stepCell('prod', 'Production instances', 'Production compute — ' + i.prod + ' included. Enables clustering and HA.', '+' + money(u.prod) + per + ' each', cust.prod, i.prod);
      } else if(lbl === 'AI credits'){
        cells += stepCell('ai', 'AI credits', '1 = 1,000,000 credits. Minimum matches your plan — increase to buy more.', '+' + money(u.ai) + per + ' per 1M AI credits', cust.ai, i.ai);
      } else if(!variantA){
        cells += lockedCell(lbl, val);   // variant A shows these in the plan card instead
      }
    });
    if(hasDev()) cells += stepCell('dev', 'Development instances', 'Dedicated instances for dev, test, and CI/CD — keeps production data clean.', '+' + money(u.dev) + per + ' each', cust.dev, 0);
    var addons = '';
    if(hasAddons()){
      addons = '<div class="am-sechead am-sechead-sub"><h4>Add-ons</h4></div><div class="am-capgrid">'
        + addonRow('edge', 'Edge Computing', 'Edge instances at remote sites for offline processing and auto-sync.', ADD.edge, cust.edge)
        + addonRow('trendz', 'Trendz Analytics', 'Advanced analytics, custom dashboards, and trend discovery.', ADD.trendz, cust.trendz)
        + '</div>';
    }
    $('#nlStep2').innerHTML =
      '<div class="fs-grid">'
      + '<div class="fs-col">'
      +   (variantA ? planSummaryHTML(t, spec) : '')
      +   '<div class="am-sec fs-panel">'
      +     '<div class="am-sechead"><h4>Capacity</h4></div>'   // what you can buy more of; the plan is named in the card above
      +     '<div class="am-capgrid">' + cells + '</div>'
      +     addons
      +   '</div>'
      + '</div>'
      + '<div class="am-sec fs-right">'
      +   '<div class="am-sechead"><h4>Calculation summary</h4></div>'
      +   '<div class="am-figures"><div class="am-sumlist">' + summaryHTML() + '</div>'
      +     '<div class="am-sumrow am-total-row"><span>' + (isPerp() ? 'One-time total' : 'New monthly') + '</span><span>' + money(total()) + perSuffix() + '</span></div>'
      +   '</div>'
      +   '<button class="btn fs-nextbtn" id="nlSumNext">Review order</button>'
      + '</div>'
      + '</div>';
  }
  /* ---- step 3: review ---------------------------------------------------------
     No in-content heading: the step header already says where we are. The action
     sits inside the Due today card, under the amount — the same pattern as the
     summary card on step 2 — and it either commits (billing data saved) or leads
     to the billing step (none). Billing terms get their own quiet card below the
     Due today card: calmer than crowding the card that now carries the action. */
  function termsLine(){
    if(isPerp()) return 'One-time payment · includes 12 months of software updates.';
    return 'Billed monthly · auto-pay. Cancel anytime.';
  }
  function renderStep3(){
    var t = tier();
    var rows = '';
    deltas().forEach(function(c){
      var left = c.unit ? (c.t + ' × ' + money(c.unit)) : c.t;
      rows += '<div class="am-orow"><div>' + left + '</div><div>' + money(c.amt) + '</div></div>';
    });
    var due = isChange()
      ? '<div class="am-duerow"><div class="am-duelabel">Due today <span class="muted">— prorated change for the current cycle (16 of 31 days, to 2026-08-30)</span></div>'
        + '<div class="am-dueval">' + money(Math.max(0, total() - oldMonthly()) * 16 / 31) + '</div></div>'
      : '<div class="am-duerow"><div class="am-duelabel">Due today</div><div class="am-dueval">' + money(total()) + '</div></div>';
    // with a card on file the review commits; without one it leads to the billing step
    var last = isLastStep();
    var cta = last ? confirmLabel() : 'Continue to billing';
    var payline = billingSaved()
      ? '<div class="am-payrow">' + (isPerp() ? 'Charged once to' : 'Charged to') + ' Visa ••4242'
        + (isPerp() ? '' : ' · auto-pay') + ' · <button class="link" id="nlPayChange">Change → Billing &amp; payment</button></div>'
      : '<div class="am-payrow">You\u2019ll add billing and payment details on the next step.</div>';
    $('#nlStep3').innerHTML =
      '<div class="fs-review">'
      + '<div class="am-order">'
      +   '<div class="am-orow am-planrow nl-mainline"><div>' + (st.product === 'tbmq' ? 'TBMQ' : 'ThingsBoard') + ' '
      +     (isChange() ? (st.oldName + ' \u2192 ' + (NAME[t] || st.plan)) : (NAME[t] || st.plan))
      +     '</div><div>' + money(BASE[t] || 0) + perSuffix() + '</div></div>'
      +   '<div class="am-orow nl-entline"><div>' + entSummary(t) + '</div><div></div></div>'
      +   rows
      +   '<div class="am-orow am-newmonthly"><div>' + (isChange() ? 'New monthly' : (isPerp() ? 'One-time total' : 'Monthly total'))
      +     '</div><div>' + money(total()) + perSuffix() + '</div></div>'
      + '</div>'
      + '<div class="am-due nl-duecard">' + due + payline
      +   '<button class="btn fs-nextbtn" id="nlCommit">' + cta + '</button>'
      + '</div>'
      + '<div class="nl-terms">' + termsLine() + '</div>'
      + '</div>';
  }

  /* ---- step 4: billing & payment (no billing data on file) --------------------
     Our own monochrome form: billing information, then the payment method with the
     card composed inline (the same .paystripe field the Update-payment-method
     modal uses). The order recap stays visible on the right so what is being
     bought is on screen while the card details are typed, and it carries the
     commit — disabled until every required field is filled. ---- */
  var bill = { company:'', email:'', phone:'', country:'United States', city:'', state:'', zip:'',
               addr:'', addr2:'', cardName:'', cardCountry:'United States', num:'', exp:'', cvc:'' };
  var COUNTRIES = ['United States', 'Ukraine', 'Germany', 'United Kingdom'];
  function countryOptions(sel){
    return COUNTRIES.map(function(c){ return '<option' + (c === sel ? ' selected' : '') + '>' + c + '</option>'; }).join('');
  }
  function fld(name, label, req, opts){
    opts = opts || {};
    var val = String(bill[name] || '').replace(/"/g, '&quot;');
    return '<div class="field"><label for="nlb-' + name + '">' + label
      + (req ? ' <span class="req" aria-hidden="true">*</span>' : '') + '</label>'
      + (opts.select
        ? '<select id="nlb-' + name + '" data-nlb="' + name + '">' + countryOptions(bill[name]) + '</select>'
        : '<input id="nlb-' + name + '" data-nlb="' + name + '" type="' + (opts.type || 'text') + '" value="' + val + '"'
          + (opts.ph ? ' placeholder="' + opts.ph + '"' : '') + '>')
      + (opts.help ? '<div class="help">' + opts.help + '</div>' : '')
      + '</div>';
  }
  function billValid(){
    var mail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    var digits = function(s){ return String(s || '').replace(/\D/g, ''); };
    return !!bill.company.trim() && mail.test(bill.email.trim())
      && !!bill.country && !!bill.city.trim() && !!bill.zip.trim() && !!bill.addr.trim()
      && !!bill.cardName.trim() && !!bill.cardCountry
      && digits(bill.num).length >= 12 && digits(bill.exp).length >= 4 && digits(bill.cvc).length >= 3;
  }
  function syncPayBtn(){
    var b = $('#nlPayNow'); if(b) b.disabled = !billValid();
  }
  function renderStep4(){
    var t = tier();
    var rows = '';
    deltas().forEach(function(c){
      var left = c.unit ? (c.t + ' × ' + money(c.unit)) : c.t;
      rows += '<div class="am-sumrow"><span>' + left + '</span><span>' + money(c.amt) + '</span></div>';
    });
    $('#nlStep4').innerHTML =
      '<div class="fs-grid">'
      + '<div class="fs-col">'
      +   '<div class="am-sec fs-panel">'
      +     '<div class="am-sechead"><h4>Billing information</h4></div>'
      +     '<div class="field2">'
      +       fld('company', 'Company name', true)
      +       fld('email', 'Billing email', true, { type:'email', ph:'billing@company.com' })
      +     '</div>'
      +     fld('phone', 'Phone', false, { ph:'+14155550123', help:'E.164 format — country code, then the number.' })
      +     '<div class="field2">'
      +       fld('country', 'Country', true, { select:true })
      +       fld('city', 'City', true)
      +     '</div>'
      +     '<div class="field2">'
      +       fld('state', 'State / Province', false)
      +       fld('zip', 'ZIP / Postal code', true)
      +     '</div>'
      +     fld('addr', 'Address', true)
      +     fld('addr2', 'Address line 2', false)
      +   '</div>'
      +   '<div class="am-sec fs-panel">'
      +     '<div class="am-sechead"><h4>Payment method</h4></div>'
      +     '<div class="field2">'
      +       fld('cardName', 'Cardholder name', true)
      +       fld('cardCountry', 'Country', true, { select:true })
      +     '</div>'
      +     '<div class="field"><label for="nlb-num">Card number <span class="req" aria-hidden="true">*</span></label>'
      +       '<div class="paystripe">'
      +         '<svg class="icon paystripe-glyph" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>'
      +         '<input class="ps-num" id="nlb-num" data-nlb="num" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="Card number" aria-label="Card number" value="' + bill.num + '">'
      +         '<input class="ps-exp" data-nlb="exp" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / YY" aria-label="Expiry date" maxlength="7" value="' + bill.exp + '">'
      +         '<input class="ps-cvc" data-nlb="cvc" type="text" inputmode="numeric" autocomplete="cc-csc" placeholder="CVC" aria-label="Security code" maxlength="4" value="' + bill.cvc + '">'
      +       '</div></div>'
      +     '<div class="paystripe-note">Powered by <b>Stripe</b></div>'
      +   '</div>'
      + '</div>'
      + '<div class="am-sec fs-right">'
      +   '<div class="am-sechead"><h4>Order summary</h4></div>'
      +   '<div class="am-figures">'
      +     '<div class="am-sumrow cur"><span>' + (st.product === 'tbmq' ? 'TBMQ' : 'ThingsBoard') + ' ' + (NAME[t] || st.plan) + '</span><span>' + money(BASE[t] || 0) + perSuffix() + '</span></div>'
      +     rows
      +     '<div class="am-sumrow am-total-row"><span>Due today</span><span>' + money(total()) + '</span></div>'
      +   '</div>'
      +   '<div class="nl-terms nl-terms-tight">' + termsLine() + '</div>'
      +   '<button class="btn fs-nextbtn" id="nlPayNow" disabled>' + confirmLabel() + '</button>'
      + '</div>'
      + '</div>';
    syncPayBtn();
  }
  function gotoStep(n){
    st.step = n;
    if(n === 1) renderStep1();
    if(n === 2) renderStep2();
    if(n === 3) renderStep3();
    if(n === 4) renderStep4();
    [1, 2, 3, 4].forEach(function(i){ $('#nlStep' + i).hidden = i !== n; });
    renderSteps();
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
    // no success modal: the licence page is where the key lives, so go there and
    // let it show the one-time "created" banner (see license-details.js)
    Store.set('justCreated', lic.id);
    location.href = licenseHref(lic);
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
    // modal mode: the details are already open underneath — restate them there
    if(window.LicenseDetails && LicenseDetails.isOpen()){ LicenseDetails.reopen(lic); return; }
    location.href = licenseHref(lic);  // land on the licence details, now on the new plan
  }
  function startPurchase(btn){
    if(!btn || btn.disabled) return;
    btn.style.width = Math.ceil(btn.getBoundingClientRect().width) + 'px';   // label keeps width
    btn.disabled = true;
    btn.innerHTML = '<span class="nl-spin" aria-hidden="true"></span>';
    // no restore: committing navigates to the new licence page
    setTimeout(commitPurchase, 1500);
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
    st.product = opts.product || 'thingsboard';   // the filter bar always shows a selection
    st.plan = opts.plan || null;
    st.dirty = !!(opts.product || opts.plan);   // preselected entry counts as selections made
    seededTier = null;
    cust = { prod:1, dev:0, ai:0, edge:false, trendz:false };
    if(st.mode === 'change' && st.changeLic){
      // change-plan mode: Product and Billing are locked to the licence, and the
      // chooser opens with the current plan marked as such
      var cl = st.changeLic;
      st.kind = 'subscription';
      st.product = cl.product === 'TBMQ' ? 'tbmq' : 'thingsboard';
      st.plan = null;
      st.oldTier = cl.tier; st.oldName = cl.name;
      st.dirty = false;
      $('#nlTitle').textContent = 'Change plan · ' + cl.name + (cl.label ? ' · ' + cl.label : '');
      gotoStep(1);
    } else {
      // the billing type is chosen inside step 1 now, so the title stays neutral
      $('#nlTitle').textContent = 'New license';
      gotoStep(opts.startStep && st.plan ? 2 : 1);   // preselected entry lands on Customize
    }
    scr.hidden = false;
    $('#nlClose').focus();
  }

  /* ---- events (step content re-renders, so everything is delegated) ---- */
  // the step header is re-rendered on every step, so delegate its back button
  $('#nlStepbar').addEventListener('click', function(e){
    if(e.target.closest('#nlStepBack') && st.step > 1) gotoStep(st.step - 1);
  });

  body.addEventListener('click', function(e){
    // the two switchers only change what the grid offers — they select nothing
    var seg = e.target.closest('#nlChoices [data-nl-product], #nlChoices [data-nl-billing]');
    if(seg && !seg.disabled){
      if(seg.hasAttribute('data-nl-product')) st.product = seg.getAttribute('data-nl-product');
      else st.kind = seg.getAttribute('data-nl-billing') === 'perpetual' ? 'perpetual' : 'subscription';
      st.plan = null; seededTier = null;
      renderStep1(); return;
    }
    // every step acts from the card that carries its total
    if(e.target.closest('#nlSumNext')){ if(st.step < totalSteps()) gotoStep(st.step + 1); return; }
    var commit = e.target.closest('#nlCommit');
    if(commit){
      if(isLastStep()) startPurchase(commit);   // billing data on file: commit here
      else gotoStep(st.step + 1);               // otherwise the billing step is next
      return;
    }
    var payNow = e.target.closest('#nlPayNow');
    if(payNow){ if(billValid()) startPurchase(payNow); return; }
    // the whole card is the control, and so is its button — either advances
    var pick = e.target.closest('#nlPlanCards [data-nl-pick], #nlPlanCards .nl-select');
    if(pick){
      st.plan = pick.getAttribute('data-nl-pick') || pick.getAttribute('data-plan');
      st.dirty = true; gotoStep(2); return;
    }
    var sb = e.target.closest('#nlStep2 .stepper button');
    if(sb){
      var f = sb.closest('.stepper').getAttribute('data-nl-field');
      var min = f === 'dev' ? 0 : ((INCL[tier()] || {})[f] || 0);
      cust[f] = Math.max(min, Math.min(MAXQ[f], cust[f] + parseInt(sb.getAttribute('data-dir'), 10)));
      st.dirty = true; renderStep2(); return;
    }
    if(e.target.closest('#nlPayChange')){ attemptClose(function(){ location.href = 'billing.html'; }); }
  });
  body.addEventListener('change', function(e){
    var cb = e.target.closest('input[data-nl-addon]');
    if(cb){ cust[cb.getAttribute('data-nl-addon')] = cb.checked; st.dirty = true; renderStep2(); return; }
    var selField = e.target.closest('[data-nlb]');
    if(selField){ bill[selField.getAttribute('data-nlb')] = selField.value; st.dirty = true; syncPayBtn(); }
  });
  // billing inputs keep their values in `bill`, so stepping back and forward on the
  // billing step never loses what was typed; each keystroke only re-gates the commit
  body.addEventListener('input', function(e){
    var f = e.target.closest('[data-nlb]');
    if(!f) return;
    bill[f.getAttribute('data-nlb')] = f.value;
    st.dirty = true;
    syncPayBtn();
  });
  body.addEventListener('keydown', function(e){
    if((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('nl-select')){ e.preventDefault(); e.target.click(); }
  });
  $('#nlClose').addEventListener('click', function(){ attemptClose(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !scr.hidden && $('#overlay').hidden) attemptClose(); });

  return { open: open, openChange: function(lic){ open({ mode:'change', license: lic }); },
           // the settings panel switches the Customize variant while it is open
           refreshCustomize: function(){ if(!scr.hidden && st.step === 2) renderStep2(); },
           // the billing-data setting changes the step count under an open wizard
           refreshOpen: function(){
             if(scr.hidden) return;
             if(st.step > totalSteps()) st.step = totalSteps();
             gotoStep(st.step);
           } };
})();


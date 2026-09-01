/* ============================================================================
   wizard.js — ONE stepped modal (NL) in four modes:
     · new      — buy a licence (picker → Customize → Review [→ Billing])
     · change   — Change plan (same screens, product/billing locked)
     · addons   — Manage add-ons (no picker: opens on Customize, tier pinned)
   It rides the .fs-screen / .fs-box chrome, injected here so no page carries a
   copy. Every mode writes through Store, then hands over with a real navigation.
   Add-ons used to be a second modal (AMF) with its own static markup, constants
   and step machinery; it was folded into this one so the two cannot drift.
   Loaded on the pages that can start a purchase: Home, Licenses, licence details.
   ============================================================================ */

/* ---------- markup, injected once per page ---------- */
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
+ '      <!-- STEP 1 — CHOOSE YOUR PRODUCT AND PLAN: three levels, no boxes.'
+ '           #nlChoices holds the centred product pill and, under it, the heading'
+ '           row whose right end carries the billing toggle, then the offer grid.'
+ '           Each offer card carries its own action, so this step needs no footer. -->'
+ '      <div id="nlStep1">'
+ '        <div id="nlChoices"></div>'
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

/* one modal per page — Manage add-ons is a mode of this same wizard, not a
   second surface, so there is nothing else to inject */
document.body.insertAdjacentHTML('beforeend', WIZARD_HTML);

/* ---------- Manage add-ons ---------- */
/* Manage add-ons runs the purchase wizard in add-ons mode: same shell, header,
   progress line, Customize and Review steps, guards and success behaviour. The
   parallel AMF controller and its static markup are gone. */
function openManageAddons(lic){ NL.open({ mode:'addons', license:lic }); }



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
  var cust = { prod:1, dev:0, ai:0, edge:false, trendz:false, offline:false };
  var seededTier = null;


  // included quantities per tier (production instances / AI in blocks of 1M)
  var INCL = { maker:{prod:1,ai:1}, prototype:{prod:1,ai:2}, pilot:{prod:1,ai:4}, startup:{prod:2,ai:8}, business:{prod:3,ai:16},
               tbmqsub:{prod:1,ai:0}, tbperp:{prod:1,ai:5}, tbmqperp:{prod:1,ai:0} };
  var BASE = { maker:10, prototype:39, pilot:99, startup:299, business:499, tbmqsub:15, tbperp:4999, tbmqperp:2999 };
  // PLACEHOLDER unit prices (prototype only). Perpetual production instance is
  // anchored to the $1,999 Add-capacity invoice; the rest are inferred.
  var UNITS = { sub:{prod:29,dev:15,ai:5}, perpTB:{prod:1999,ai:500}, perpMQ:{prod:999,ai:0} };
  var ADD = { edge:7, trendz:12 };
  /* Copy that belongs to a capacity row rather than to a tooltip: the wizard has room
     for the sentence, so it reads as the row's description. */
  var DEVICES_DESC = 'Total number of IoT devices that will connect to your ThingsBoard platform.';
  var OFFLINE_DESC = 'Full functionality without internet.';
  /* ⚠️ Offline Mode has no price yet — TODO: confirm with product whether it is a
     one-time amount on top of the perpetual licence. Until it does, the toggle carries
     no figure and contributes nothing to the total; the review lists it without an
     amount rather than showing a made-up $0.00. */
  var NAME = { maker:'Maker', prototype:'Prototype', pilot:'Pilot', startup:'Startup', business:'Business',
               tbmqsub:'PE subscription', tbperp:'PE Perpetual License', tbmqperp:'PE license' };
  var MAXQ = { prod:20, dev:20, ai:99 };
  /* Business is the one plan whose device count is not fixed: extra devices are
     sold at $0.10 each. A stepper is the wrong control at this scale — you do not
     click your way from 1,000 to 4,500 — so devices are typed, and the field
     refuses anything below what the plan already includes. */
  var DEVICE_UNIT = 0.10;
  var DEVICE_TIERS = { business:1000 };
  function devicesIncluded(){ return DEVICE_TIERS[tier()] || 0; }
  function hasDevices(){ return !isPerp() && !!DEVICE_TIERS[tier()]; }

  /* AI is counted in blocks of 1,000,000 credits, and the product's unit is
     "{N}M AI credits" — so every figure for it carries the M. A bare "2" next to
     "Devices 1,000" would read as two credits. One suffix table, so the stepper,
     the change rows and the delta list cannot drift apart again. */
  var FIELD_SUFFIX = { ai:'M' };
  function qtyLabel(field, v){ return (v || 0).toLocaleString('en-US') + (FIELD_SUFFIX[field] || ''); }

  function money(n){ return '$' + n.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
  // a modification can lower the bill, so its rows carry an explicit sign
  function moneySigned(n){ return (n < 0 ? '\u2212' : '+') + money(Math.abs(n)); }
  function isPerp(){ return st.kind === 'perpetual'; }
  function tier(){
    if(st.fixedTier) return st.fixedTier;   // add-ons: the plan is not up for change
    if(isPerp()) return st.product === 'tbmq' ? 'tbmqperp' : 'tbperp';
    return st.product === 'tbmq' ? 'tbmqsub' : String(st.plan || '').toLowerCase();
  }
  function units(){ return isPerp() ? (st.product === 'tbmq' ? UNITS.perpMQ : UNITS.perpTB) : UNITS.sub; }
  function isChange(){ return st.mode === 'change'; }
  function isAddons(){ return st.mode === 'addons'; }
  // both modes edit an existing licence, so both prorate instead of charging full
  function isMod(){ return isChange() || isAddons(); }
  function extrasCostOf(c){
    var u = units(), i = INCL[tier()] || { prod:1, ai:0 };
    return Math.max(0, c.prod - i.prod) * u.prod
      + (hasDevices() ? Math.max(0, (c.devices || 0) - devicesIncluded()) * DEVICE_UNIT : 0)
      + (hasDev() ? c.dev * u.dev : 0)
      + (hasAi() ? Math.max(0, c.ai - (i.ai || 0)) * u.ai : 0)
      + (hasAddons() && c.edge ? ADD.edge : 0)
      + (hasAddons() && c.trendz ? ADD.trendz : 0);
  }
  /* what the licence costs before this flow's edits. Change-plan compares against
     the OLD plan's base; add-ons keeps the plan and compares against the
     configuration the licence arrived with (st.baseCust). */
  function oldMonthly(){
    if(isAddons()) return (BASE[tier()] || 0) + extrasCostOf(st.baseCust || cust);
    return BASE[st.oldTier] || 0;
  }
  function confirmLabel(){
    if(isAddons()) return 'Confirm changes';
    return isChange() ? 'Confirm change' : (isPerp() ? 'Buy license' : 'Subscribe');
  }
  function currentCardName(){ return st.oldTier === 'tbmqsub' ? 'TBMQ PE subscription' : st.oldName; }
  function hasAddons(){ return !isPerp() && st.product === 'thingsboard'; }
  /* Offline Mode is the perpetual counterpart of the add-ons block: a perpetual licence
     runs where there is no internet, which is exactly what it enables (inferred: offered
     for both perpetual products, since the option is a property of running offline, not
     of the product). */
  function hasOffline(){ return isPerp(); }
  function hasDev(){ return !isPerp() && st.product === 'thingsboard'; }
  function hasAi(){ var i = INCL[tier()]; return !!(i && i.ai > 0); }
  function ecKey(){ return (st.product || 'thingsboard') + '|' + (isPerp() ? 'perpetual' : 'payg'); }
  function perSuffix(){ return isPerp() ? '' : ' / mo'; }

  function extras(){
    var i = INCL[tier()] || { prod:1, ai:0 };
    return { prod:Math.max(0, cust.prod - i.prod), dev:cust.dev, ai:Math.max(0, cust.ai - i.ai),
             devices:hasDevices() ? Math.max(0, (cust.devices || 0) - devicesIncluded()) : 0 };
  }
  function deltas(){
    var u = units(), e = extras(), out = [];
    if(e.devices > 0) out.push({ t:'+' + e.devices.toLocaleString('en-US') + ' devices', amt:e.devices * DEVICE_UNIT, unit:DEVICE_UNIT });
    if(e.prod > 0) out.push({ t:'+' + e.prod + ' production instance' + (e.prod > 1 ? 's' : ''), amt:e.prod * u.prod, unit:u.prod });
    if(hasDev() && e.dev > 0) out.push({ t:'+' + e.dev + ' development instance' + (e.dev > 1 ? 's' : ''), amt:e.dev * u.dev, unit:u.dev });
    if(hasAi() && e.ai > 0) out.push({ t:'+' + e.ai + 'M AI credits', amt:e.ai * u.ai, unit:u.ai });
    if(hasAddons() && cust.edge)   out.push({ t:'+ Edge Computing',   amt:ADD.edge });
    if(hasAddons() && cust.trendz) out.push({ t:'+ Trendz Analytics', amt:ADD.trendz });
    if(hasOffline() && cust.offline) out.push({ t:'+ Offline Mode', amt:null });
    return out;
  }
  function total(){ return (BASE[tier()] || 0) + deltas().reduce(function(a, c){ return a + (c.amt || 0); }, 0); }
  /* Add-ons reviews a MODIFICATION, so its review states the delta against the
     configuration the licence arrived with — "from → to" for quantities, added /
     removed for the two add-ons. deltas() cannot do this: it lists everything
     above the plan's included amount, which is the whole extras bill rather than
     what this flow changed. */
  function changeRows(){
    var b = st.baseCust, u = units(), out = [];
    if(!b) return out;
    function qty(f, label, price, show){
      if(!show || cust[f] === b[f]) return;
      out.push({ t:label + ' ' + qtyLabel(f, b[f]) + ' \u2192 ' + qtyLabel(f, cust[f]),
                 amt:(cust[f] - b[f]) * price });
    }
    qty('devices', 'Devices', DEVICE_UNIT, hasDevices());
    qty('prod', 'Production instances', u.prod, true);
    qty('dev', 'Development instances', u.dev, hasDev());
    qty('ai', 'AI credits', u.ai, hasAi());
    if(hasAddons()){
      if(cust.edge !== b.edge) out.push({ t:(cust.edge ? 'Added' : 'Removed') + ' Edge Computing', amt:(cust.edge ? 1 : -1) * ADD.edge });
      if(cust.trendz !== b.trendz) out.push({ t:(cust.trendz ? 'Added' : 'Removed') + ' Trendz Analytics', amt:(cust.trendz ? 1 : -1) * ADD.trendz });
    }
    if(hasOffline()){
      if(cust.offline !== b.offline) out.push({ t:(cust.offline ? 'Added' : 'Removed') + ' Offline Mode', amt:null });
    }
    return out;
  }
  function changeSummary(){
    var r = changeRows();
    return r.length ? r.map(function(x){ return x.t; }).join(' \u00b7 ') + '.' : 'License updated.';
  }
  /* seed the flow from the licence it was opened on: current = the plan's included
     amounts plus whatever extras the licence already carries. seededTier is set
     here so renderStep2 does not reseed over it with the plan minimums. */
  function seedFromLicense(lic){
    var t = tier(), i = INCL[t] || { prod:1, ai:0 };
    var x = lic.extras || {};
    var n = function(v){ return parseInt(String(v || '0'), 10) || 0; };
    cust = { prod:i.prod + n(x.prod), dev:n(x.dev), ai:(i.ai || 0) + n(x.ai),
             devices:(DEVICE_TIERS[t] || 0) + n(x.devices),
             edge:!!lic.edge, trendz:!!lic.trendz, offline:!!lic.offline };
    st.baseCust = { prod:cust.prod, dev:cust.dev, ai:cust.ai, devices:cust.devices,
                    edge:cust.edge, trendz:cust.trendz, offline:cust.offline };
    seededTier = t;
  }
  function entSummary(t){
    var spec = TIER_SPECS[t] || { ent:[] };
    // same exclusion as the capacity list: Assets is out of the wizard (see skipEnt)
    return spec.ent.filter(function(e){ return !skipEnt(e[0]); }).map(function(e){
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
  /* Internal step ids stay 1..4 (1 picker · 2 Customize · 3 Review · 4 Billing) so
     one renderStepN serves every mode. Add-ons has no picker, so it starts at 2
     and the DISPLAYED index is offset by firstStep() — "Step 1 of 2 · Customize".
     Nothing hardcodes the count; the progress line reads stepLabels(). */
  function firstStep(){ return isAddons() ? 2 : 1; }
  function stepLabels(){
    var tail = needsBilling()
      ? ['Customize', 'Review', 'Billing & payment']
      : ['Customize', 'Review & pay'];
    return isAddons() ? tail : ['Choose your product and plan'].concat(tail);
  }
  function totalSteps(){ return stepLabels().length; }
  function lastStep(){ return firstStep() + totalSteps() - 1; }
  function isLastStep(){ return st.step === lastStep(); }
  function stepIndex(){ return st.step - firstStep() + 1; }
  function renderSteps(){
    var labels = stepLabels();
    // Back is an icon button here, right before the step label — the footer no
    // longer carries it (and the Customize step has no footer at all)
    var back = st.step > firstStep()
      ? '<button class="iconbtn ib nl-stepback" id="nlStepBack" aria-label="Back" title="Back">'
        + '<svg class="icon" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>'
      : '';
    var i = stepIndex();
    $('#nlSteps').innerHTML = '<div class="nl-progress">'
      + '<div class="nl-ptrack"><span class="nl-pfill" style="width:' + (i / totalSteps() * 100) + '%"></span></div>'
      + '<div class="nl-plabel">' + back
      + '<span>Step ' + i + ' of ' + totalSteps() + ' · <b>' + labels[i - 1] + '</b></span></div></div>';
  }


  /* ---- step 1 — choose your product and plan ------------------------------
     Three labeled groups stacked on one screen: Product, then Billing, then the
     Plans for that pair. Each group carries a plain section heading (no step
     numbers — the stepbar above already counts). The first two hold their two
     wide cards in a bordered container, and a short connector hangs under each,
     so the top-down dependency product → billing → plans reads visually; those
     two only narrow what is offered below and never advance the step, because
     two more choices follow. The plan row needs no container of its own — the
     offer cards are already the frames — and each carries its own always-visible
     action (no hover-reveal: there is no hover on touch, and it hides the
     action), so the step needs no footer. Change-plan mode renders the first two
     groups selected-and-locked and marks the current plan as non-selectable. */

  /* LEVEL 1 — product: one compact pill-shaped segmented control, centred. It is a
     picker, not a pitch, so the one-line product descriptions the old cards
     carried are gone from this step. Glyphs are 16px monochrome: a hub and spokes
     for the platform, a broadcast arc for the broker. */
  var PRODUCT_CHOICES = [
    { v:'thingsboard', t:'ThingsBoard', d:'IoT platform — devices, dashboards, rule engine',
      g:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="4" r="1.5"/><circle cx="12" cy="20" r="1.5"/>'
        + '<circle cx="4" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/>'
        + '<path d="M12 9V5.5M12 15v3.5M9 12H5.5M15 12h3.5"/>' },
    { v:'tbmq', t:'TBMQ', d:'MQTT broker for reliable message streaming',
      g:'<circle cx="7" cy="17" r="1.6"/><path d="M7 11.5A5.5 5.5 0 0 1 12.5 17"/>'
        + '<path d="M7 6A11 11 0 0 1 18 17"/>' }
  ];
  function productSegHTML(active, locked){
    return '<div class="nl-prodrow">'
      + '<div class="nl-prodseg" role="group" aria-label="Product">'
      + PRODUCT_CHOICES.map(function(o){
          var on = o.v === active;
          return '<button type="button" class="nl-prodopt' + (on ? ' is-on' : '') + '"'
            + ' data-nl-product="' + o.v + '" aria-pressed="' + on + '"' + (locked ? ' disabled' : '') + '>'
            + '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + o.g + '</svg>'
            + '<span class="nl-prodtxt"><span class="nl-prodname">' + o.t + '</span>'
            + '<span class="nl-proddesc">' + o.d + '</span></span></button>';
        }).join('')
      + '</div></div>';
  }

  /* LEVEL 2 — a heading that names what the grid below is showing, with the toggle
     that decides it on the same line at the right. The descriptions that used to
     fill the two billing cards now ride in the ⓘ tooltips, so the row stays one
     line. The switch is the real control (off = Subscription, on = Perpetual);
     the labels are text, as in the reference. */
  var BILLING_CHOICES = [
    { v:'subscription', t:'Subscription',
      d:'Pay every month. Unlimited customers, dashboards, integrations, API calls, data points and messages, and you can change the plan any time.' },
    { v:'perpetual', t:'Perpetual',
      d:'Pay once, run it indefinitely. Includes 12 months of software updates, renewable.' }
  ];
  var INFOSVG = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'
    + '<circle cx="12" cy="12" r="9"/><path d="M11.98 8h.04"/><path d="M12 11.5V16"/></svg>';
  function billRowHTML(locked){
    var perp = isPerp();
    function info(o){
      // .tip is the existing CSS-only tooltip; .wide lets this much copy wrap
      return '<span class="nl-info tip wide" data-tip="' + esc(o.d) + '" tabindex="0"'
        + ' role="note" aria-label="' + esc(o.t + '. ' + o.d) + '">' + INFOSVG + '</span>';
    }
    var sub = BILLING_CHOICES[0], pp = BILLING_CHOICES[1];
    return '<div class="nl-billrow">'
      + '<h3 class="nl-billhead">' + (perp ? 'Perpetual licenses' : 'Subscription plans') + '</h3>'
      + '<span class="spacer"></span>'
      + '<div class="nl-billtoggle">'
      +   '<span class="nl-blabel' + (perp ? '' : ' is-on') + '">' + sub.t + '</span>' + info(sub)
      +   '<label class="switch lg nl-billsw"><input type="checkbox" data-nl-billsw'
      +     (perp ? ' checked' : '') + (locked ? ' disabled' : '')
      +     ' aria-label="Perpetual billing"><span class="track"></span></label>'
      +   '<span class="nl-blabel' + (perp ? ' is-on' : '') + '">' + pp.t + '</span>' + info(pp)
      + '</div>'
      + '</div>';
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
    $('#nlChoices').innerHTML = productSegHTML(st.product, locked) + billRowHTML(locked);
    /* the count gets its OWN row under the heading: the heading row's right end
       belongs to the billing toggle, and the two would collide there */
    var grid = $('#nlPlanCards');
    /* ⚠️ `withcur` reserves a 24px lane above every card for the "Current plan"
       strip, so it may only go on when a card actually IS the current one. A licence
       on a plan that is no longer offered (Maker, Prototype — dropped 2026-09-01)
       matches nothing in the grid, and the class then held an empty gap open above
       three cards. Note this only removes the empty lane: such a licence still has
       NO anchor on this step saying where it is now — see the debt list. */
    var hasCur = locked && set.cards.some(function(c){ return c.name === currentCardName(); });
    grid.className = 'plangrid' + (set.single ? ' one' : '') + (hasCur ? ' withcur' : '');
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
  /* Entitlements the plan fixes — everything the controls below cannot change.
     ⚠️ Assets is dropped from the wizard entirely (not relevant any more). It still
     lives in TIER_SPECS, so the licence details page and the plan cards still list it;
     purging it there is a separate decision. */
  function skipEnt(label){ return label === 'Assets'; }
  function fixedEnt(spec){
    return (spec.ent || []).filter(function(e){
      return e[0] !== 'Production instances' && e[0] !== 'AI credits' && !skipEnt(e[0]);
    });
  }
  /* The anchor of the step: what is being bought, named once. Variant A also lists
     the entitlements the plan fixes, because A drops those rows from the controls;
     variant B keeps them as locked cards below, so its banner is the title alone. */
  function planSummaryHTML(t, spec, withFacts){
    var product = st.product === 'tbmq' ? 'TBMQ' : 'ThingsBoard';
    var facts = fixedEnt(spec).map(function(e){ return e[1] + ' ' + e[0].toLowerCase(); });
    facts.push('fixed by this plan');
    return '<div class="fs-panel nl-plansum">'
      + '<div class="nl-plansum-t">' + product + ' ' + (NAME[t] || st.plan) + ' · ' + (isPerp() ? 'Perpetual' : 'Subscription') + '</div>'
      + (withFacts ? '<div class="nl-plansum-f">' + facts.join(' · ') + '</div>' : '')
      + '</div>';
  }
  /* Variant B: same row as every other card in the stack — label left, control right.
     Same disabled styling as before, with the lock riding inside the field. `.am-locked`
     is only a hook for the field's width (see styles.css); nothing about the card's
     own layout differs from its neighbours. */
  function lockedCell(lbl, val, desc){
    return '<div class="am-cell am-locked"><div class="fs-cellhead"><div class="fs-celltext">'
      + '<div class="am-celltop">' + lbl + '</div>'
      + (desc ? '<div class="fs-celldesc">' + desc + '</div>' : '') + '</div>'
      + '<span class="fs-lockfield">' + LOCKSVG
      + '<input class="fs-devinput locked" type="text" value="' + val + '" disabled aria-label="' + lbl + ' — fixed by this plan"></span>'
      + '</div></div>';
  }
  /* Devices: typed, not stepped. The error lives under the field and the commit
     is held while the value is below the plan's own allowance — a licence cannot
     carry fewer devices than the plan it is on. */
  function numberCell(field, label, desc, priceNote, val, min){
    return '<div class="am-cell"><div class="fs-cellhead"><div class="fs-celltext">'
      + '<div class="am-celltop">' + label + '</div>'
      + (desc ? '<div class="fs-celldesc">' + desc + '</div>' : '') + '</div>'
      + '<input class="fs-devinput numfield" type="text" inputmode="numeric" autocomplete="off"'
      +   ' data-nl-num="' + field + '" data-nl-min="' + min + '" value="' + val.toLocaleString('en-US') + '"'
      +   ' aria-label="' + label + '"></div>'
      + '<div class="am-cardprice">' + priceNote + '</div>'
      + '<div class="numerr" data-nl-err="' + field + '" hidden>Minimum for this plan is '
      +   min.toLocaleString('en-US') + '.</div></div>';
  }
  function stepCell(field, label, desc, priceNote, val, min){
    var minus = val <= min ? ' disabled' : '', plus = val >= MAXQ[field] ? ' disabled' : '';
    return '<div class="am-cell"><div class="fs-cellhead"><div class="fs-celltext">'
      + '<div class="am-celltop">' + label + '</div>'
      + (desc ? '<div class="fs-celldesc">' + desc + '</div>' : '') + '</div>'
      + '<div class="stepper" data-nl-field="' + field + '">'
      + '<button type="button" data-dir="-1"' + minus + ' aria-label="Decrease ' + label + '">−</button>'
      + '<span class="val" aria-live="polite">' + qtyLabel(field, val) + '</span>'
      + '<button type="button" data-dir="1"' + plus + ' aria-label="Increase ' + label + '">+</button></div></div>'
      + '<div class="am-cardprice">' + priceNote + '</div></div>';
  }
  /* Add-ons sit in the same rows as the steppers: text left, control on the right
     edge. The whole block is the control, though — the element IS the <label> that
     owns the checkbox, so a click on the name, the description or the price toggles
     it natively, with no handler of its own. The switch stays right-aligned as the
     indicator; the hover state on the block says it is all clickable.
     ⚠️ The switch markup is a <span> here, not a <label>: a label inside a label is
     invalid, and it is the outer one that has to cover the whole block. */
  function addonRow(key, name, desc, price, on){
    return '<label class="am-cell am-addon' + (on ? ' on' : '') + '"><div class="fs-cellhead"><div class="fs-celltext">'
      + '<div class="am-celltop">' + name + '</div>'
      + '<div class="fs-celldesc">' + desc + '</div>'
      // price == null: not settled yet (Offline Mode) — the row simply has no figure
      + (price == null ? '' : '<div class="am-cardprice">+' + money(price) + ' /mo</div>') + '</div>'
      + '<span class="switch lg"><input type="checkbox" data-nl-addon="' + key + '"' + (on ? ' checked' : '')
      + ' aria-label="Add ' + name + ' add-on"><span class="track"></span></span>'
      + '</div></label>';
  }
  function summaryHTML(){
    var html = '';
    if(isChange()) html += '<div class="am-sumrow cur"><span>Current · ' + st.oldName + '</span><span>' + money(oldMonthly()) + ' / mo</span></div>';
    html += '<div class="am-sumrow cur"><span>' + (NAME[tier()] || st.plan) + ' base</span><span>' + money(BASE[tier()] || 0) + perSuffix() + '</span></div>';
    deltas().forEach(function(c){
      var left = c.unit ? (c.t + ' × ' + money(c.unit)) : c.t;
      // amt == null: a toggle whose price is not settled yet (see ADD / Offline Mode)
      html += '<div class="am-sumrow"><span>' + left + '</span><span>'
        + (c.amt == null ? '' : money(c.amt)) + '</span></div>';
    });
    return html;
  }
  /* Typing in the devices field must not re-render the step — that would throw the
     caret away mid-number — so only the summary card is repainted. */
  function refreshSummary(){
    var list = $('#nlStep2 .am-sumlist');
    if(!list) return;
    list.innerHTML = summaryHTML();
    var totalRow = $('#nlStep2 .am-total-row');
    if(totalRow) totalRow.innerHTML = '<span>' + (isPerp() ? 'One-time total' : 'New monthly')
      + '</span><span>' + money(total()) + perSuffix() + '</span>';
  }
  function renderStep2(){
    var t = tier(), i = INCL[t] || { prod:1, ai:0 }, u = units(), spec = TIER_SPECS[t] || { ent:[] };
    if(seededTier !== t){ cust = { prod:i.prod, dev:0, ai:i.ai, devices:DEVICE_TIERS[t] || 0, edge:false, trendz:false }; seededTier = t; }
    var per = isPerp() ? ' one-time' : ' / mo';
    var variantA = custVariant() === 'a';
    var cells = '';
    spec.ent.forEach(function(e){
      var lbl = e[0], val = e[1];
      if(skipEnt(lbl)) return;                       // Assets is out of the wizard
      if(lbl === 'Devices' && hasDevices()){
        cells += numberCell('devices', 'Devices', DEVICES_DESC + ' '
          + devicesIncluded().toLocaleString('en-US')
          + ' included with this plan — enter the total you need.',
          '+$0.10 / mo per extra device', cust.devices, devicesIncluded());
      } else if(lbl === 'Production instances'){
        cells += stepCell('prod', 'Production instances', 'Production compute — ' + i.prod + ' included. Enables clustering and HA.', '+' + money(u.prod) + per + ' each', cust.prod, i.prod);
      } else if(lbl === 'AI credits'){
        cells += stepCell('ai', 'AI credits', 'Monthly allowance, in blocks of 1M credits. Minimum matches your plan — increase to buy more.', '+' + money(u.ai) + per + ' per 1M AI credits', cust.ai, i.ai);
      } else if(!variantA){
        // variant A shows these in the plan card instead
        cells += lockedCell(lbl, val, lbl === 'Devices' ? DEVICES_DESC : '');
      }
    });
    if(hasDev()) cells += stepCell('dev', 'Development instances', 'Dedicated instances for dev, test, and CI/CD — keeps production data clean.', '+' + money(u.dev) + per + ' each', cust.dev, 0);
    var addonCells = '';
    if(hasAddons()){
      addonCells += addonRow('edge', 'Edge Computing', 'Edge instances at remote sites for offline processing and auto-sync.', ADD.edge, cust.edge)
        + addonRow('trendz', 'Trendz Analytics', 'Advanced analytics, custom dashboards, and trend discovery.', ADD.trendz, cust.trendz);
    }
    // a perpetual licence gets one add-on of its own: running without internet
    if(hasOffline()) addonCells += addonRow('offline', 'Offline Mode', OFFLINE_DESC, null, cust.offline);
    /* Variant A — one panel, two named sections inside it.
       Variant B — no section headers at all: the plan banner, then every item as its
       own card in a single vertical stack (capacity rows and add-ons alike), so each
       piece of information separates on its own edge instead of by a heading. */
    var left = variantA
      ? planSummaryHTML(t, spec, true)
        + '<div class="am-sec fs-panel">'
        +   '<div class="am-sechead"><h4>Capacity</h4></div>'   // what you can buy more of; the plan is named in the card above
        +   '<div class="am-capgrid">' + cells + '</div>'
        +   (addonCells ? '<div class="am-sechead am-sechead-sub"><h4>Add-ons</h4></div><div class="am-capgrid">' + addonCells + '</div>' : '')
        + '</div>'
      : planSummaryHTML(t, spec, false)
        + '<div class="am-sec nl-cardstack">' + cells + addonCells + '</div>';
    $('#nlStep2').innerHTML =
      '<div class="fs-grid">'
      + '<div class="fs-col">' + left + '</div>'
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
     Same two-column grid as step 2 — left column is what is being bought, right
     column is the sticky summary card that carries the action — so this reads as
     part of the wizard, not its own screen. No in-content heading: the step
     header already says where we are. On the left the plan block and the billing
     terms are one joined unit (see .nl-joined); on the right the commit sits
     inside the card, in the card's own padding, exactly like step 2's Calculation
     summary. The button either commits (billing data saved) or leads to the
     billing step (none). ---- */
  function termsLine(){
    if(isPerp()) return 'One-time payment · includes 12 months of software updates.';
    return 'Billed monthly · auto-pay. Cancel anytime.';
  }
  function renderStep3(){
    var t = tier();
    var rows = '';
    if(isAddons()){
      // what changed, signed — not the whole extras bill
      var chg = changeRows();
      if(!chg.length) rows = '<div class="am-orow"><div class="muted">No changes yet</div><div></div></div>';
      chg.forEach(function(c){
        rows += '<div class="am-orow"><div>' + c.t + '</div><div>'
          + (c.amt == null ? '' : moneySigned(c.amt)) + '</div></div>';
      });
    } else {
      deltas().forEach(function(c){
        var left = c.unit ? (c.t + ' × ' + money(c.unit)) : c.t;
        rows += '<div class="am-orow"><div>' + left + '</div><div>'
          + (c.amt == null ? '' : money(c.amt)) + '</div></div>';
      });
    }
    /* A modification is prorated over what is left of THIS licence's cycle, read
       from its own renewal date — not one hardcoded fraction for every licence.
       Without a renewal date to read (a grant) the parenthetical is dropped and
       the delta is charged whole. */
    var pr = isMod() ? prorate(st.changeLic && st.changeLic.event) : null;
    var dueLabel = !isMod() ? 'Due today'
      : 'Due today <span class="muted">— prorated change for the current cycle'
        + (pr ? ' (' + pr.left + ' of ' + pr.cycle + ' days, to ' + pr.end + ')' : '') + '</span>';
    var delta = Math.max(0, total() - oldMonthly());
    var dueVal = isMod() ? money(delta * (pr ? pr.fraction : 1)) : money(total());
    // with a card on file the review commits; without one it leads to the billing step
    var cta = isLastStep() ? confirmLabel() : 'Continue to billing';
    var payline = billingSaved()
      ? (isPerp() ? 'Charged once to' : 'Charged to') + ' Visa ••4242'
        + (isPerp() ? '' : ' · auto-pay') + ' · <button class="link" id="nlPayChange">Change → Billing &amp; payment</button>'
      : 'You’ll add billing and payment details on the next step.';
    $('#nlStep3').innerHTML =
      '<div class="fs-grid">'
      + '<div class="fs-col">'
      /* the plan block and the terms card are one joined unit: no gap between
         them and no radius where they meet, so a single line divides them */
      +   '<div class="nl-joined">'
      +     '<div class="am-order">'
      +       '<div class="am-orow am-planrow nl-mainline"><div>' + (st.product === 'tbmq' ? 'TBMQ' : 'ThingsBoard') + ' '
      +         (isChange() ? (st.oldName + ' → ' + (NAME[t] || st.plan)) : (NAME[t] || st.plan))
      +         '</div><div>' + money(BASE[t] || 0) + perSuffix() + '</div></div>'
      +       '<div class="am-orow nl-entline"><div>' + entSummary(t) + '</div><div></div></div>'
      +       rows
      +       '<div class="am-orow am-newmonthly"><div>' + (isMod() ? 'New monthly' : (isPerp() ? 'One-time total' : 'Monthly total'))
      +         '</div><div>' + money(total()) + perSuffix() + '</div></div>'
      +     '</div>'
      +     '<div class="nl-terms">' + termsLine() + '</div>'
      +   '</div>'
      + '</div>'
      /* right: Due today, the payment context, then the commit — all sitting in
         .fs-right's own padding, the same internal spacing step 2 uses */
      + '<div class="am-sec fs-right">'
      +   '<div class="nl-duerow"><div class="am-duelabel">' + dueLabel + '</div>'
      +     '<div class="am-dueval">' + dueVal + '</div></div>'
      +   '<div class="nl-payline">' + payline + '</div>'
      +   '<button class="btn fs-nextbtn" id="nlCommit">' + cta + '</button>'
      + '</div>'
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
      /* card number leads: it is the field the panel is about, and the name and
         country below it are the details that qualify it */
      +     '<div class="field"><label for="nlb-num">Card number <span class="req" aria-hidden="true">*</span></label>'
      +       '<div class="paystripe">'
      +         '<svg class="icon paystripe-glyph" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>'
      +         '<input class="ps-num" id="nlb-num" data-nlb="num" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="Card number" aria-label="Card number" value="' + bill.num + '">'
      +         '<input class="ps-exp" data-nlb="exp" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / YY" aria-label="Expiry date" maxlength="7" value="' + bill.exp + '">'
      +         '<input class="ps-cvc" data-nlb="cvc" type="text" inputmode="numeric" autocomplete="cc-csc" placeholder="CVC" aria-label="Security code" maxlength="4" value="' + bill.cvc + '">'
      +       '</div></div>'
      +     '<div class="field2">'
      +       fld('cardName', 'Cardholder name', true)
      +       fld('cardCountry', 'Country', true, { select:true })
      +     '</div>'
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
    if(isMod()){ commitChange(); return; }
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
    if(e.devices > 0) x.devices = String(e.devices);
    if(e.prod > 0) x.prod = String(e.prod);
    if(hasDev() && e.dev > 0) x.dev = String(e.dev);
    if(hasAi() && e.ai > 0) x.ai = e.ai + 'M';
    if(Object.keys(x).length) lic.extras = x;
    if(hasAddons()){ lic.edge = cust.edge; lic.trendz = cust.trendz; }
    if(hasOffline()) lic.offline = cust.offline;
    storeAddLicense(lic);              // straight into the mock backend
    st.dirty = false;
    scr.hidden = true;
    /* No success modal: the details surface is where the key lives, so open it and
       let it show the one-time "created" banner (see license-details.js). Modal is
       the default, so a purchase no longer leaves the page it was made from — the
       new licence opens over it, and the list underneath is restated. */
    Store.set('justCreated', lic.id);
    openLicenseDetails(lic, null, { refreshHost:true });
  }
  function commitChange(){
    var lic = st.changeLic, t = tier(), e = extras();
    // add-ons keeps the plan: only the entitlements and the price move
    var summary = isAddons() ? changeSummary() : null;
    lic.tier = t;
    lic.name = NAME[t] || st.plan;
    lic.price = money(total()) + ' / mo';
    var x = {};
    if(e.devices > 0) x.devices = String(e.devices);
    if(e.prod > 0) x.prod = String(e.prod);
    if(hasDev() && e.dev > 0) x.dev = String(e.dev);
    if(hasAi() && e.ai > 0) x.ai = e.ai + 'M';
    if(Object.keys(x).length){ lic.extras = x; } else { delete lic.extras; }
    if(hasAddons()){ lic.edge = cust.edge; lic.trendz = cust.trendz; }
    if(hasOffline()) lic.offline = cust.offline;
    Store.save();                      // the licence object was mutated in place
    /* Both modification modes land here, and they are different events: add-ons
       changed the capacity, change-plan moved the licence to another plan. */
    if(isAddons()){
      logActivity({ kind:'updated', entityType:'Add-on', entityName:lic.name, action:'UPDATED',
        txt:'Capacity was changed on <b>' + esc(lic.name) + '</b> by ' + PORTAL_ACTOR + '.',
        delta: summary });
    } else {
      logActivity({ kind:'updated', entityType:'Plan', entityName:lic.name, action:'UPDATED',
        txt:'Plan was changed from <b>' + esc(st.oldName) + '</b> to <b>' + esc(lic.name)
          + '</b> on <b>' + esc(lic.label || lic.name) + '</b> by ' + PORTAL_ACTOR + '.' });
    }
    st.dirty = false;
    scr.hidden = true;
    /* no success modal in either mode: the licence page is the destination. Add-ons
       leaves a one-time banner there saying what changed, next to the updated
       entitlements it produced (see syncChangedBanner in license-details.js). */
    if(summary) Store.set('justChanged', { id:lic.id, text:summary });
    // the details may already be open underneath (Change plan from inside them) —
    // restate them in place; otherwise open them the one way there is
    if(window.LicenseDetails && LicenseDetails.isOpen()){ LicenseDetails.reopen(lic); return; }
    openLicenseDetails(lic, null, { refreshHost:true });
  }
  function startPurchase(btn){
    if(!btn || btn.disabled) return;
    btn.style.width = Math.ceil(btn.getBoundingClientRect().width) + 'px';   // label keeps width
    btn.disabled = true;
    btn.innerHTML = '<span class="nl-spin" aria-hidden="true"></span>';
    // no restore: committing replaces this surface with the licence details
    setTimeout(commitPurchase, 1500);
  }

  /* ---- open / close (unsaved-changes guard on mid-flow close) ---- */
  function forceClose(){ st.dirty = false; scr.hidden = true; if(lastFocus && lastFocus.focus) lastFocus.focus(); }
  function attemptClose(afterFn){
    if(!st.dirty){ forceClose(); if(afterFn) afterFn(); return; }
    // a full sentence per mode: "add-on changes" is plural and will not agree
    // with a shared "hasn’t" tail
    var what = isAddons() ? 'Your add-on changes haven’t been completed yet.'
      : isChange() ? 'Your plan change hasn’t been completed yet.'
      : 'Your new-license setup hasn’t been completed yet.';
    openModal('You have unsaved changes.',
      '<p>' + what + ' If you leave now, your selections will be lost.</p>');
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
    st.mode = (opts.mode === 'change' || opts.mode === 'addons') ? opts.mode : 'new';
    st.changeLic = opts.license || null;
    st.fixedTier = null; st.baseCust = null;
    st.kind = opts.kind === 'perpetual' ? 'perpetual' : 'subscription';
    st.product = opts.product || 'thingsboard';   // the filter bar always shows a selection
    st.plan = opts.plan || null;
    st.dirty = !!(opts.product || opts.plan);   // preselected entry counts as selections made
    seededTier = null;
    cust = { prod:1, dev:0, ai:0, edge:false, trendz:false };
    if(st.mode === 'addons' && st.changeLic){
      /* Manage add-ons: the plan is settled, so there is no picker step — the flow
         opens on Customize, seeded from the licence, and the tier is pinned. */
      var al = st.changeLic;
      st.fixedTier = al.tier;
      st.kind = al.type === 'Perpetual' ? 'perpetual' : 'subscription';
      st.product = al.product === 'TBMQ' ? 'tbmq' : 'thingsboard';
      st.plan = al.name;
      st.oldTier = al.tier; st.oldName = al.name;
      st.dirty = false;
      seedFromLicense(al);
      $('#nlTitle').textContent = 'Manage add-ons · ' + al.product + ' ' + al.name
        + (al.label ? ' · ' + al.label : '');
      gotoStep(2);
    } else if(st.mode === 'change' && st.changeLic){
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
    if(e.target.closest('#nlStepBack') && st.step > firstStep()) gotoStep(st.step - 1);
  });

  body.addEventListener('click', function(e){
    // the product pill only changes what the grid offers — it selects nothing
    var seg = e.target.closest('#nlChoices [data-nl-product]');
    if(seg && !seg.disabled){
      st.product = seg.getAttribute('data-nl-product');
      st.plan = null; seededTier = null;
      renderStep1(); return;
    }
    // every step acts from the card that carries its total
    if(e.target.closest('#nlSumNext')){ if(st.step < lastStep()) gotoStep(st.step + 1); return; }
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
    // billing is a switch now, so it arrives as a change, not a click
    var bsw = e.target.closest('[data-nl-billsw]');
    if(bsw){
      st.kind = bsw.checked ? 'perpetual' : 'subscription';
      st.plan = null; seededTier = null;
      renderStep1(); return;
    }
    var cb = e.target.closest('input[data-nl-addon]');
    if(cb){ cust[cb.getAttribute('data-nl-addon')] = cb.checked; st.dirty = true; renderStep2(); return; }
    var selField = e.target.closest('[data-nlb]');
    if(selField){ bill[selField.getAttribute('data-nlb')] = selField.value; st.dirty = true; syncPayBtn(); }
  });
  // billing inputs keep their values in `bill`, so stepping back and forward on the
  // billing step never loses what was typed; each keystroke only re-gates the commit
  body.addEventListener('input', function(e){
    var num = e.target.closest('[data-nl-num]');
    if(num){
      var field = num.getAttribute('data-nl-num'), min = parseInt(num.getAttribute('data-nl-min'), 10) || 0;
      var raw = num.value.replace(/[^0-9]/g, '');
      var n = raw === '' ? NaN : parseInt(raw, 10);
      var bad = !(n >= min);
      var err = $('#nlStep2 [data-nl-err="' + field + '"]');
      if(err) err.hidden = !bad;
      num.classList.toggle('is-bad', bad);
      var next = $('#nlSumNext');
      if(next) next.disabled = bad;
      if(!bad){ cust[field] = n; st.dirty = true; refreshSummary(); }
      return;
    }
    var f = e.target.closest('[data-nlb]');
    if(!f) return;
    bill[f.getAttribute('data-nlb')] = f.value;
    st.dirty = true;
    syncPayBtn();
  });
  body.addEventListener('focusout', function(e){
    var num = e.target.closest('[data-nl-num]');
    if(!num) return;
    var min = parseInt(num.getAttribute('data-nl-min'), 10) || 0;
    var n = parseInt(num.value.replace(/[^0-9]/g, ''), 10);
    if(n >= min) num.value = n.toLocaleString('en-US');   // an invalid value stays put, with its error
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


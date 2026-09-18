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

/* The plan picker (product cards · billing tabs · plan cards · renderPlanPicker ·
   planPickerClick) MOVED to components.js. It has three hosts now — this wizard,
   the landing page and Home's new-user screen — plus the styleguide specimen, and
   styleguide.html cannot load wizard.js: NL's own IIFE binds to #nlModal, which
   that page does not have. Shared builders live in components.js; that is where a
   thing used by four surfaces belongs. wizard.js still USES them: it loads after.
   ============================================================================ */

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
  function ecKey(){ return planPickerKey(st); }
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
  /* ---- does this change take anything away? -------------------------------------
     Entitlement, not money: `total() < oldMonthly()` would also be true for a change
     that swaps an expensive add-on for more devices, which takes nothing away. What
     matters is whether any allowance the platform enforces goes DOWN — that is the
     thing that breaks a running instance if applied today. Plan tier counts too: a
     lower plan lowers the included amounts under everything above it. */
  var TIER_ORDER = ['maker','prototype','pilot','startup','business'];
  function shrinks(){
    var b = st.baseCust;
    if(!b) return false;
    // a lower plan is a shrink by itself, whatever the extras do
    if(isChange()){
      var from = TIER_ORDER.indexOf(seededTier), to = TIER_ORDER.indexOf(tier());
      if(from >= 0 && to >= 0 && to < from) return true;
    }
    if(cust.devices < b.devices || cust.prod < b.prod || cust.dev < b.dev || cust.ai < b.ai) return true;
    if(b.edge && !cust.edge) return true;
    if(b.trendz && !cust.trendz) return true;
    if(b.offline && !cust.offline) return true;
    return false;
  }
  /* what the licence will look like once it takes effect — stored on the schedule so
     applying it later needs no recomputation */
  function pendingApply(){
    var t = tier(), e = extras();
    /* ⚠️ Start from what the licence already has. `extras()` only reports the fields
       this flow actually shows — a tier with no devices stepper reports 0 devices —
       so building the target from it alone would silently delete purchased capacity
       the person never touched. Caught by reading a scheduled record that had lost
       `devices:'200'`. */
    var x = {};
    var had = (st.changeLic && st.changeLic.extras) || {};
    Object.keys(had).forEach(function(k){ x[k] = had[k]; });
    if(hasDevices()){ if(e.devices > 0) x.devices = String(e.devices); else delete x.devices; }
    if(e.prod > 0) x.prod = String(e.prod); else delete x.prod;
    if(hasDev()){ if(e.dev > 0) x.dev = String(e.dev); else delete x.dev; }
    if(hasAi()){ if(e.ai > 0) x.ai = e.ai + 'M'; else delete x.ai; }
    return { tier:t, name:NAME[t] || st.plan, price:money(total()) + ' / mo',
             extras:Object.keys(x).length ? x : null,
             edge:hasAddons() ? cust.edge : undefined,
             trendz:hasAddons() ? cust.trendz : undefined,
             offline:hasOffline() ? cust.offline : undefined };
  }
  function effectiveDate(){ return (st.changeLic && st.changeLic.event) || dayStr(30); }

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
  /* Two ways to arrive with the picker already answered, and they get the same
     shortened flow: Manage add-ons (the plan is settled by the licence) and a plan
     chosen on the public landing page before the account existed. In both, step 1
     is not "skipped" — it is COMPLETED elsewhere, so counting it would make the
     progress line promise a screen that is never coming. */
  function noPicker(){ return isAddons() || !!st.noPicker; }
  function firstStep(){ return noPicker() ? 2 : 1; }
  function stepLabels(){
    var tail = needsBilling()
      ? ['Customize', 'Review', 'Billing & payment']
      : ['Customize', 'Review & pay'];
    return noPicker() ? tail : ['Choose your product and plan'].concat(tail);
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

  /* `st` IS the selection object the shared picker reads — product, kind and plan
     are the field names it already used. The two extras say what this host adds:
     change-plan locks the first two groups and names the card you are on. */
  function renderStep1(){
    st.locked = isChange();
    st.currentName = isChange() ? currentCardName() : null;
    renderPlanPicker($('#nlChoices'), $('#nlPlanCards'), st);
    // No `extraEl` here, so no "What's included in Professional Edition" block and
    // no single-set note: the Subscription tab description above already says what
    // every plan includes, and the step's job is the choice itself. Both selling
    // surfaces DO pass one — the landing page and Home's new-user screen.
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
  /* The card that names what is being bought. ONE definition, rendered unchanged at
     the top of BOTH step 2 (Customize) and step 3 (Review) — same markup, same
     content, same styling. It used to exist twice: a `.nl-plansum` panel on step 2
     (with the facts line on variant A and without it on variant B) and, on step 3,
     a row inside the order table that also carried the base price. So the thing
     naming your purchase morphed three ways across two steps.
     ⚠️ No parameters. The `withFacts` flag is gone on purpose: a flag is how the two
     variants drifted apart in the first place. If a caller ever needs a quieter
     version, that is a second component, not an argument. */
  function planSummaryHTML(t, spec){
    var product = st.product === 'tbmq' ? 'TBMQ' : 'ThingsBoard';
    /* ⚠️ The second line is the PRODUCT DESCRIPTION, not the entitlement facts it
       used to list ("500 devices · fixed by this plan"). Those numbers are already
       on screen — step 2 shows every one of them as a control and step 3 lists them
       in the order breakdown — so repeating them said nothing, while what the
       product actually IS was said only on step 1 and then dropped.
       Same string the step-1 cards use (PRODUCT_CHOICES), so there is one source. */
    var desc = '', glyph = '';
    PRODUCT_CHOICES.forEach(function(o){ if(o.v === st.product){ desc = o.d; glyph = o.g; } });
    /* the same product glyph the step-1 radio cards lead with, so the card that
       names your purchase carries the same mark from step 1 through to review */
    return '<div class="fs-panel nl-plansum">'
      + '<span class="nl-plansum-ic" aria-hidden="true">'
      +   '<svg class="icon" viewBox="0 0 24 24">' + glyph + '</svg></span>'
      + '<span class="nl-plansum-tx">'
      +   '<span class="nl-plansum-t">' + product + ' ' + (NAME[t] || st.plan) + ' · ' + (isPerp() ? 'Perpetual' : 'Subscription') + '</span>'
      +   '<span class="nl-plansum-f">' + desc + '</span>'
      /* ⚠️ Included entitlements the plan carries but no control on this screen shows.
         White labeling is the case that cost a sale's worth of confidence: the buyer
         chose the plan FOR it, saw it on the card, then saw no mention of it on either
         Customize or Review, and only found it confirmed as a ticked chip after paying.
         It is not a paid option — it comes with the plan — so it is stated as included
         rather than offered. `wl` is the spec's own flag; nothing is invented here. */
      +   (spec.wl ? '<span class="nl-plansum-inc"><b>Included:</b> White labeling</span>' : '')
      + '</span>'
      + '</div>';
  }
  /* Variant B: same row as every other card in the stack — label left, control right.
     Same disabled styling as before, with the lock riding inside the field. `.am-locked`
     is only a hook for the field's width (see styles.css); nothing about the card's
     own layout differs from its neighbours. */
  /* ⚠️ A locked row now SAYS it is locked and why, in place. The padlock alone
     answered nothing: the participant clicked the field, then the padlock, and got no
     response of any kind while every other row on the screen adjusted. A disabled
     control that will not explain itself is the same fault as the disabled Subscribe
     button. ⚠️ The wording is true from the data, not decided here: only `DEVICE_TIERS`
     carries extra-device pricing, and today that is Business alone. */
  function lockedCell(lbl, val, desc){
    var why = lbl === 'Devices'
      ? 'The device limit is set by this plan. To change it, change the plan.'
      : 'Set by this plan. To change it, change the plan.';
    return '<div class="am-cell am-locked"><div class="fs-cellhead"><div class="fs-celltext">'
      + '<div class="am-celltop">' + lbl + '</div>'
      + (desc ? '<div class="fs-celldesc">' + desc + '</div>' : '') + '</div>'
      + '<span class="fs-lockfield">' + LOCKSVG
      + '<input class="fs-devinput locked" type="text" value="' + val + '" disabled aria-label="' + lbl + ' — ' + why + '"></span>'
      + '</div>'
      + '<div class="am-lockwhy">' + why + '</div>'
      + '</div>';
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
      ? planSummaryHTML(t, spec)
        + '<div class="am-sec fs-panel">'
        +   '<div class="am-sechead"><h4>Capacity</h4></div>'   // what you can buy more of; the plan is named in the card above
        +   '<div class="am-capgrid">' + cells + '</div>'
        +   (addonCells ? '<div class="am-sechead am-sechead-sub"><h4>Add-ons</h4></div><div class="am-capgrid">' + addonCells + '</div>' : '')
        + '</div>'
      : planSummaryHTML(t, spec)
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
    /* ⚠️ `Math.max(0, …)` is still here and is now CORRECT rather than a silent clamp.
       A shrinking change is not charged and not credited, because nothing changes
       today — it takes effect at the end of the period the person already paid for.
       What used to be wrong was showing "$0.00" with no explanation of why. */
    var willSchedule = isMod() && shrinks();
    var delta = Math.max(0, total() - oldMonthly());
    var dueVal = isMod() ? money(delta * (pr ? pr.fraction : 1)) : money(total());
    if(willSchedule){
      dueLabel = 'Due today <span class="muted">— nothing is charged now</span>';
      dueVal = money(0);
    }
    // with a card on file the review commits; without one it leads to the billing step
    var cta = isLastStep() ? confirmLabel() : 'Continue to billing';
    var payline = billingSaved()
      ? (isPerp() ? 'Charged once to' : 'Charged to') + ' Visa ••4242'
        + (isPerp() ? '' : ' · auto-pay') + ' · <button class="link" id="nlPayChange">Change → Billing &amp; payment</button>'
      : 'You’ll add billing and payment details on the next step.';
    $('#nlStep3').innerHTML =
      '<div class="fs-grid">'
      + '<div class="fs-col">'
      /* the SAME card step 2 opens with — see planSummaryHTML */
      +   planSummaryHTML(t, TIER_SPECS[t] || { ent:[] })
      /* the plan block and the terms card are one joined unit: no gap between
         them and no radius where they meet, so a single line divides them */
      /* The agreement itself: what shrinks, and the date it happens. It sits ABOVE the
         breakdown because it changes how every number under it should be read — the
         "New monthly" line is not what you pay next week, it is what you pay from the
         date named here. */
      +   (willSchedule
          ? '<div class="nl-sched"><b>This change takes effect ' + fmtDate(effectiveDate()) + '.</b> '
            + 'It lowers what this license includes, and the current allowances stay until then — '
            + 'nothing is removed from a period you have already paid for. '
            + 'From ' + fmtDate(effectiveDate()) + ' it is billed at ' + money(total()) + ' / mo.'
            + '<div class="nl-schedwhat">' + esc(changeSummary()) + '</div></div>'
          : '')
      +   '<div class="nl-joined">'
      +     '<div class="am-order">'
      /* ⚠️ This row no longer names the product: the card above does. It is the
         base-price line of the breakdown, so it carries the plan (and, in change
         mode, the transition) and the amount — nothing that the card repeats. */
      +       '<div class="am-orow am-planrow nl-mainline"><div>'
      +         (isChange() ? (st.oldName + ' → ' + (NAME[t] || st.plan)) : 'Plan')
      +         '</div><div>' + money(BASE[t] || 0) + perSuffix() + '</div></div>'
      +       '<div class="am-orow nl-entline"><div>' + entSummary(t) + '</div><div></div></div>'
      +       rows
      +       '<div class="am-orow am-newmonthly"><div>' + (isMod() ? 'New monthly' : (isPerp() ? 'One-time total' : 'Monthly total'))
      +         '</div><div>' + money(total()) + perSuffix() + '</div></div>'
      +     '</div>'
      +     '<div class="nl-terms">' + termsLine()
      +       '<span class="taxnote nl-taxline">' + TAX_NOTE + '</span></div>'
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
  /* ⚠️ A leading EMPTY option, and it is the point. Without it the select showed
     "United States" while `bill.country` was still '' — the field looked answered and
     the model said it was not, so `billValid()`'s country rule could never fire and
     the reader had no way to learn that the blank they never saw was the blocker.
     An unmade choice now looks unmade, on this step and in the card modal alike. */
  function countryOptions(sel){
    return '<option value=""' + (sel ? '' : ' selected') + '>Select a country</option>'
      + COUNTRIES.map(function(c){ return '<option' + (c === sel ? ' selected' : '') + '>' + c + '</option>'; }).join('');
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
      + '<div class="fielderr" data-nlb-err="' + name + '" hidden></div>'
      + '</div>';
  }
  /* ---- billing validation ------------------------------------------------------
     One rule per field, each returning the REASON it failed or null. The old
     `billValid()` was a single boolean feeding `nlPayNow.disabled`: eleven required
     fields collapsed into one dead button that never said which of them it meant.

     The contract now, and it is the same on the standalone card modal: the primary
     is ALWAYS enabled. A disabled control cannot explain itself — it cannot even be
     focused — so the button accepts the click and answers it. Fields also answer for
     themselves on blur, so the reader usually never reaches a rejected submit.

     ⚠️ Deliberately loose, because this is a wireframe: no Luhn, no BIN check, no
     real address lookup. A card number is "at least 12 digits" and a demo card of
     4242… passes. The one rule tightened is the expiry MONTH: the old test was
     "four digits", which accepted 99/99 — that is not leniency, it is a field that
     cannot be filled wrongly, which is a different kind of broken. */
  function digitsOf(s){ return String(s || '').replace(/\D/g, ''); }
  var BILL_RULES = {
    company:  function(v){ return v.trim() ? null : 'Enter the company name that should appear on the invoice.'; },
    email:    function(v){
      v = v.trim();
      if(!v) return 'Enter a billing email address.';
      return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? null
        : 'This does not look like an email address — check for a missing @ or domain.';
    },
    country:  function(v){ return v ? null : 'Choose the billing country.'; },
    city:     function(v){ return v.trim() ? null : 'Enter the city.'; },
    zip:      function(v){ return v.trim() ? null : 'Enter the ZIP or postal code.'; },
    addr:     function(v){ return v.trim() ? null : 'Enter the street address.'; },
    cardName: function(v){ return v.trim() ? null : 'Enter the name printed on the card.'; },
    cardCountry: function(v){ return v ? null : 'Choose the country the card was issued in.'; },
    num:      function(v){
      var d = digitsOf(v);
      if(!d) return 'Enter the card number.';
      return d.length >= 12 ? null
        : 'A card number is at least 12 digits — this one has ' + d.length + '.';
    },
    exp:      function(v){
      var d = digitsOf(v);
      if(!d) return 'Enter the expiry date.';
      if(d.length < 4) return 'Use MM / YY — for example 12 / 28.';
      var mm = parseInt(d.slice(0, 2), 10);
      if(!(mm >= 1 && mm <= 12)) return 'There is no month ' + d.slice(0, 2) + ' — the first two digits are the month.';
      return null;
    },
    cvc:      function(v){
      var d = digitsOf(v);
      if(!d) return 'Enter the security code.';
      return d.length >= 3 ? null : 'The security code is the 3 or 4 digits on the card.';
    }
  };
  /* phone, state and addr2 have no rule on purpose: they are optional, and a rule
     for an optional field is a rule that can only ever be silent. */
  /* what each field is called when the summary names it — the same words the labels
     use, so "Billing email" in the message points at "Billing email" on screen */
  var BILL_LABEL = {
    company:'Company name', email:'Billing email', country:'Country', city:'City',
    zip:'ZIP / Postal code', addr:'Address', cardName:'Cardholder name',
    cardCountry:'Card country', num:'Card number', exp:'Expiry date', cvc:'Security code'
  };
  function billError(name){
    var rule = BILL_RULES[name];
    return rule ? rule(bill[name] == null ? '' : String(bill[name])) : null;
  }
  function billErrors(){
    return Object.keys(BILL_RULES).filter(function(n){ return !!billError(n); });
  }
  function billValid(){ return billErrors().length === 0; }

  /* Show or clear ONE field's message. The card number, expiry and CVC share a
     single `.field` (they sit inside one `.paystripe`), so their messages live in
     their own slots under it and the box is marked as a whole. */
  function paintBillField(name, msg){
    var slot = $('#nlStep4 [data-nlb-err="' + name + '"]');
    if(slot){ slot.textContent = msg || ''; slot.hidden = !msg; }
    var input = $('#nlStep4 [data-nlb="' + name + '"]');
    var field = input && input.closest('.field');
    if(!field) return;
    /* the three card subfields share a field: it wears the error state while ANY of
       them is wrong, so clearing one must not clear the box for the other two */
    if(name === 'num' || name === 'exp' || name === 'cvc'){
      var anyBad = ['num', 'exp', 'cvc'].some(function(k){
        var sl = $('#nlStep4 [data-nlb-err="' + k + '"]');
        return sl && !sl.hidden;
      });
      field.classList.toggle('err', anyBad);
    } else {
      field.classList.toggle('err', !!msg);
    }
  }
  function clearBillErrors(){
    $$('#nlStep4 [data-nlb-err]').forEach(function(sl){ sl.hidden = true; sl.textContent = ''; });
    $$('#nlStep4 .field.err').forEach(function(f){ f.classList.remove('err'); });
    var sum = $('#nlBillFormErr'); if(sum){ sum.hidden = true; sum.textContent = ''; }
  }
  /* Called by the primary. Paints every failure at once — a form that reveals its
     problems one at a time makes the reader submit once per mistake — and puts the
     cursor in the first of them, so the fix starts where the reading stopped. */
  function showAllBillErrors(){
    var bad = billErrors();
    bad.forEach(function(n){ paintBillField(n, billError(n)); });
    var sum = $('#nlBillFormErr');
    if(sum){
      /* ⚠️ Only ever shown above zero. It used to render unconditionally, so the
         successful path printed "0 fields need attention before this order can be
         placed." at the exact moment the order went through — a validation error
         containing a zero, which the participant read as a rejection. */
      if(!bad.length){
        sum.hidden = true; sum.textContent = '';
      } else {
        /* and it names them: a count alone sends the reader hunting down a form for
           whichever fields are marked */
        sum.textContent = (bad.length === 1 ? 'One field needs attention: ' : bad.length + ' fields need attention: ')
          + bad.map(function(k){ return BILL_LABEL[k] || k; }).join(', ') + '.';
        sum.hidden = false;
      }
    }
    var first = bad.length && $('#nlStep4 [data-nlb="' + bad[0] + '"]');
    if(first){ first.focus(); if(first.scrollIntoView) first.scrollIntoView({ block:'center' }); }
    return bad.length === 0;
  }
  /* ⚠️ No longer gates the button — the button is always live. Kept as the hook the
     step calls after a re-render so an error already on screen is not left stale. */
  function syncPayBtn(){
    var b = $('#nlPayNow'); if(b) b.disabled = false;
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
      +         '<input class="ps-num" id="nlb-num" data-nlb="num" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" aria-label="Card number" maxlength="24" value="' + bill.num + '">'
      +         '<input class="ps-exp" data-nlb="exp" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / YY" aria-label="Expiry date" maxlength="7" inputmode="numeric" value="' + bill.exp + '">'
      +         '<input class="ps-cvc" data-nlb="cvc" type="text" inputmode="numeric" autocomplete="cc-csc" placeholder="CVC" aria-label="Security code" maxlength="4" value="' + bill.cvc + '">'
      +       '</div>'
      /* one slot per card subfield: they share a .field, so they cannot share a slot
         without the reader having to guess which of the three is meant */
      +       '<div class="fielderr" data-nlb-err="num" hidden></div>'
      +       '<div class="fielderr" data-nlb-err="exp" hidden></div>'
      +       '<div class="fielderr" data-nlb-err="cvc" hidden></div>'
      +       '</div>'
      +     '<div class="field2">'
      +       fld('cardName', 'Cardholder name', true)
      +       fld('cardCountry', 'Country', true, { select:true })
      +     '</div>'
      +     '<div class="paystripe-note">Powered by <b>Stripe</b></div>'
      +     '<p class="taxnote">' + TAX_NOTE + '</p>'
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
      /* the summary sits WITH the button it belongs to, not at the top of a form the
         reader has already scrolled past */
      +   '<div class="formerr" id="nlBillFormErr" role="alert" hidden></div>'
      +   '<button class="btn fs-nextbtn" id="nlPayNow">' + confirmLabel() + '</button>'
      + '</div>'
      + '</div>';
    syncPayBtn();
  }
  /* ---- the pinned summary on the phone ----------------------------------------
     Steps 2 and 4 ALWAYS pin their summary to the bottom of the viewport: the total
     and its commit are the point of those steps, and the content above them is a
     long list of controls or a billing form.
     Step 3 is CONDITIONAL, and it is a real measurement, not a guess about content
     length. The block is rendered inline first, un-pinned, and then asked one
     question: does its own bottom edge fall below the scroll container's bottom
     edge? If it does, "Due today" is off the first screen and gets pinned; if it
     fits, it stays inline exactly as the desktop has it.
     ⚠️ Measured ONCE, in the un-pinned state. Pinning takes the block out of flow,
     which shortens the content — so re-measuring afterwards would say "it fits now"
     and unpin it, then pin it again, forever.
     ⚠️ The content's bottom padding comes from the bar's MEASURED height (--pinH),
     not a constant: the bar is two rows on step 2, three on step 4, and a hardcoded
     value would hide the last row on one of them. */
  function syncPinnedSummary(){
    var phone = window.matchMedia('(max-width:600px)').matches;
    [2, 3, 4].forEach(function(n){
      var step = $('#nlStep' + n); if(!step) return;
      var right = $('.fs-right', step); if(!right) return;
      right.classList.remove('pinned');
      step.classList.remove('haspin');
      if(!phone || step.hidden) return;
      /* Three steps, three different rules — so this is a switch, not a boolean.
         ⚠️ Step 4 (Billing & payment) NEVER pins: this REVERSES the earlier
         instruction to pin it. Its content is a long form, and a bar carrying the
         total plus `Subscribe` over a keyboard-driven form competes with the field
         being typed in.
         ⚠️ `n !== 3` was the old test, and simply flipping it to `n === 2` was NOT
         enough: step 4 then fell into the measurement branch below and the
         measurement pinned it anyway. Each step has to say what it is. */
      var pin;
      if(n === 2)      pin = true;                    // always: the total is the point
      else if(n === 4) pin = false;                   // never: it is a form
      else {                                          // step 3: measured, once, un-pinned
        var box = body.getBoundingClientRect();
        pin = right.getBoundingClientRect().bottom > box.bottom + 1;
      }
      if(!pin) return;
      right.classList.add('pinned');
      step.classList.add('haspin');
      step.style.setProperty('--pinH', right.offsetHeight + 'px');
    });
  }
  window.addEventListener('resize', syncPinnedSummary);
  /* ⚠️ `resize` alone is not enough. The step-3 decision depends on the height of
     the scroll box, and that box can change without a window resize — an on-screen
     keyboard, a URL bar collapsing, or a devtools/harness viewport change that
     never dispatches the event (observed). A ResizeObserver on the box itself fires
     for all of them.
     No feedback loop: pinning takes the bar out of the CONTENT's flow, and #nlBody's
     own height comes from the sheet, so observing it cannot retrigger itself. */
  if(window.ResizeObserver && body){
    new ResizeObserver(function(){ syncPinnedSummary(); }).observe(body);
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
    /* after the step is visible and laid out — a hidden step measures as zero */
    syncPinnedSummary();
  }

  /* ---- confirm: loading on the button (~1.5s), then a success modal with the
     licence key; Done lands on Licenses where the new row is visible ---- */
  function commitPurchase(){
    if(isMod()){ commitChange(); return; }
    /* ⚠️ The card entered on the billing step is SAVED. It was not, and the result was
       a new account that had just paid for a licence and whose Billing page still said
       "No payment method yet" — the purchase and the page disagreed about a card the
       person had typed two screens earlier. Caught walking the new-user journey. */
    if(bill.num && !billingSaved()){
      storePaymentMethod({ num:bill.num, exp:bill.exp, name:bill.cardName, country:bill.cardCountry });
    }
    if(bill.addr && !Store.get('billingAddress')){
      /* the address too: it is what the invoice for this very purchase prints */
      Store.set('billingAddress', { email:bill.email, country:bill.country, state:bill.state,
                                    city:bill.city, zip:bill.zip, addr:bill.addr, addr2:bill.addr2 });
    }
    var t = tier(), e = extras(), tot = total();
    var seq = storeNextSeq();          // persisted, so ids stay unique across reloads
    var lic = { id:'N' + seq, tier:t,
      product: st.product === 'tbmq' ? 'TBMQ' : 'ThingsBoard',
      type: isPerp() ? 'Perpetual' : 'Subscription',
      name: NAME[t] || st.plan,
      label:'', created:todayStr(), status:'active',
      /* a perpetual's updates term runs a year; a subscription renews in a month */
      event: isPerp() ? dayStr(365) : dayStr(30),
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
    /* ⚠️ And the charge that paid for it. Without this the buyer had a licence, a
       "NEXT CHARGE" figure, and no evidence anywhere that the money had moved —
       which is the state the participant failed the task in. The amount is what the
       review step showed as due, so the receipt and the order agree. */
    storeAddInvoice(lic, money(tot), { payment:'Card', auto:!isPerp() });
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
    /* ⚠️ A shrinking change is RECORDED, not applied: the licence keeps everything it
       has until the end of the period it was paid for. See scheduleChange() and the
       rule above shrinks(). Growth still applies on the spot, prorated. */
    if(shrinks()){
      scheduleChange(lic, { kind:isAddons() ? 'addons' : 'plan',
                            summary:changeSummary(), effective:effectiveDate(),
                            apply:pendingApply() });
      st.dirty = false;
      scr.hidden = true;
      Store.set('justChanged', { id:lic.id,
        text:'Scheduled for ' + fmtDate(effectiveDate()) + ' · ' + changeSummary() });
      if(window.LicenseDetails && LicenseDetails.isOpen()){ LicenseDetails.reopen(lic); return; }
      openLicenseDetails(lic, null, { refreshHost:true });
      return;
    }
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
        txt:'Capacity was changed on <b>' + esc(lic.name) + '</b> by ' + portalActor() + '.',
        delta: summary });
    } else {
      logActivity({ kind:'updated', entityType:'Plan', entityName:lic.name, action:'UPDATED',
        txt:'Plan was changed from <b>' + esc(st.oldName) + '</b> to <b>' + esc(lic.name)
          + '</b> on <b>' + esc(lic.label || lic.name) + '</b> by ' + portalActor() + '.' });
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
    /* ⚠️ Reset on every open, not only when asked for. `st` outlives one flow — the
       controller is a singleton — so a wizard opened once from the landing hand-off
       would keep the shortened progress line for every later purchase from the
       "Buy a license" button, which DOES have a picker. */
    st.noPicker = !!(opts.skipPicker && opts.plan);
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
      /* ⚠️ NO label in the header line. It used to append `· <label>` and let
         `.fs-maintitle`'s ellipsis eat the result — so a licence with a real label
         ("Production — Central Europe manufacturing cluster, building 4") produced a
         truncated single line that named neither the flow nor the licence properly.
         DECISION: the label is DROPPED here, not moved to a second line. The header
         has to say which flow you are in and which licence it acts on; the label is
         the user's own note, and the identity block on the licence behind the modal
         already carries it. A second line would make every modal header two lines
         tall to serve the minority of licences that have one. */
      $('#nlTitle').textContent = 'Manage add-ons · ' + al.product + ' ' + al.name;
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
      // same rule as above: flow · licence, never the label
      $('#nlTitle').textContent = 'Change plan · ' + (cl.product || 'ThingsBoard') + ' ' + cl.name;
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
    /* the picker reads itself (shared with the landing page); this host decides what
       its two outcomes mean here — narrow the offer, or take the plan and advance */
    if(st.step === 1){
      var what = planPickerClick(e, st);
      if(what === 'changed'){ seededTier = null; renderStep1(); return; }
      if(what === 'picked'){ st.dirty = true; gotoStep(2); return; }
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
    /* ⚠️ The click is always accepted. It used to be gated by `disabled`, which meant
       a rejected order produced nothing at all — no message, no focus, no reason.
       Now the submit answers: either it starts, or it paints every failure and puts
       the cursor in the first one. */
    if(payNow){ if(showAllBillErrors()) startPurchase(payNow); return; }
    var sb = e.target.closest('#nlStep2 .stepper button');
    if(sb){
      var f = sb.closest('.stepper').getAttribute('data-nl-field');
      var min = f === 'dev' ? 0 : ((INCL[tier()] || {})[f] || 0);
      cust[f] = Math.max(min, Math.min(MAXQ[f], cust[f] + parseInt(sb.getAttribute('data-dir'), 10)));
      st.dirty = true; renderStep2(); syncPinnedSummary(); return;
    }
    if(e.target.closest('#nlPayChange')){ attemptClose(function(){ location.href = 'billing.html'; }); }
  });
  body.addEventListener('change', function(e){
    var cb = e.target.closest('input[data-nl-addon]');
    if(cb){ cust[cb.getAttribute('data-nl-addon')] = cb.checked; st.dirty = true; renderStep2(); syncPinnedSummary(); return; }
    var selField = e.target.closest('[data-nlb]');
    if(selField){
      var sn = selField.getAttribute('data-nlb');
      bill[sn] = selField.value; st.dirty = true;
      // a select answers the moment it changes: there is nothing half-typed about it
      if(BILL_RULES[sn]) paintBillField(sn, billError(sn));
      syncPayBtn();
    }
  });

  /* Validate on BLUR, not on every keystroke: telling someone their email is invalid
     while they are still typing the @ is correcting a sentence mid-word. Typing again
     clears the message — it was an answer to a value that no longer exists. */
  body.addEventListener('focusout', function(e){
    var f = e.target.closest('#nlStep4 [data-nlb]');
    if(!f) return;
    var n = f.getAttribute('data-nlb');
    if(BILL_RULES[n]) paintBillField(n, billError(n));
  });
  body.addEventListener('input', function(e){
    var f = e.target.closest('#nlStep4 [data-nlb]');
    if(!f) return;
    var n = f.getAttribute('data-nlb');
    var slot = $('#nlStep4 [data-nlb-err="' + n + '"]');
    if(slot && !slot.hidden) paintBillField(n, null);
    var sum = $('#nlBillFormErr');
    if(sum && !sum.hidden && billErrors().length === 0){ sum.hidden = true; sum.textContent = ''; }
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

  /* Demo shortcut for the ⚙ panel. Writes into `bill` — the same object the fields
     read on render — and repaints the step, so the values land through the normal
     path rather than being poked into the DOM. Clears any error already on screen,
     because every one of them has just been answered. */
  function fillDemoBilling(){
    var panel = $('#nlStep4');
    // "is the billing step on screen" — the same test the settings panel used to
    // decide whether to offer this at all, so the two cannot disagree
    if(scr.hidden || !panel || panel.hidden) return;
    bill.company = 'ThingsBoard, Inc.';
    bill.email   = 'billing@thingsboard.io';
    bill.phone   = '+14155550123';
    bill.country = 'United States';
    bill.city    = 'New York';
    bill.state   = 'New York';
    bill.zip     = '10001';
    bill.addr    = '500 7th Avenue';
    bill.addr2   = '';
    bill.cardName    = portalName();
    bill.cardCountry = 'United States';
    bill.num = '4242 4242 4242 4242';
    bill.exp = '12 / 28';
    bill.cvc = '123';
    st.dirty = true;
    renderStep4();
    clearBillErrors();
  }

  return { open: open, openChange: function(lic){ open({ mode:'change', license: lic }); },
           fillDemoBilling: fillDemoBilling,
           // the settings panel switches the Customize variant while it is open
           refreshCustomize: function(){ if(!scr.hidden && st.step === 2){ renderStep2(); syncPinnedSummary(); } },
           // the billing-data setting changes the step count under an open wizard
           refreshOpen: function(){
             if(scr.hidden) return;
             if(st.step > totalSteps()) st.step = totalSteps();
             gotoStep(st.step);
           } };
})();


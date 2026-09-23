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
+ '      <!-- ⚠️ THE STEPS ARE NAMED, NOT NUMBERED. Which of them a flow has depends on'
+ '           the flow — Customize is two steps, a free plan has neither of them nor a'
+ '           billing step, TBMQ has no add-ons — so the ids say what a step IS and the'
+ '           order lives in one place (see steps()). Numbered ids forced every call'
+ '           site to do arithmetic about a sequence it could not see. -->'
+ '      <!-- CHOOSE YOUR PLAN: the product is stated above the tabs, not chosen.'
+ '           #nlChoices holds that line plus the billing toggle, then the offer grid.'
+ '           Each offer card carries its own action, so this step needs no footer. -->'
+ '      <div id="nlStepPick">'
+ '        <div id="nlChoices"></div>'
+ '        <div class="plangrid" id="nlPlanCards"></div>'
+ '      </div>'
+ '      <!-- CAPACITY — what you can buy more of: devices, instances, AI credits -->'
+ '      <div id="nlStepCap" hidden></div>'
+ '      <!-- ADD-ONS — the switches, and the features the plan states -->'
+ '      <div id="nlStepAdd" hidden></div>'
+ '      <!-- REVIEW (& PAY, when billing data already exists) -->'
+ '      <div id="nlStepRev" hidden></div>'
+ '      <!-- PAYMENT & BILLING (only when the account has no billing data) -->'
+ '      <div id="nlStepBill" hidden></div>'
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
   ⚠️ THIS HEADER WAS STALE AND DUPLICATED — two copies of "1 Product → 2 Plan →
   3 Customize → 4 Review", a flow that stopped existing when product and plan merged
   into one step, and doubly wrong once Customize became two. One copy, and it names
   the rule rather than a fixed sequence, because the sequence is now computed.

   THE STEPS ARE A LIST, BUILT PER MODE — see steps(). The full set is
   Choose your plan · Capacity · Add-ons · Review · Payment & Billing, and steps drop
   out of it: a free plan has no Capacity, no Add-ons and no billing; a TBMQ
   subscription has no Add-ons; Manage add-ons has no plan step; an account with
   billing data on file has no billing step and commits from Review.
   Confirm appends the licence to the CURRENT dataset (DATA()) and opens its details.
   Closing mid-flow with selections made asks the same unsaved-changes confirmation as
   the settings pages. */

/* ---------- new licence wizard ---------- */


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
  var st = { kind:'subscription', product:null, plan:null, step:'pick', dirty:false };
  var cust = { prod:1, dev:0, ai:0, edge:false, trendz:false, offline:false };
  var seededTier = null;


  // included quantities per tier (production instances / AI in blocks of 1M)
  var INCL = { maker:{prod:1,ai:1}, prototype:{prod:1,ai:2}, pilot:{prod:1,ai:4}, startup:{prod:2,ai:8}, business:{prod:3,ai:16},
               tbmqsub:{prod:1,ai:0}, tbperp:{prod:1,ai:5}, tbmqperp:{prod:1,ai:0} };
  var BASE = TIER_BASE;          // one source, shared with everything outside this IIFE
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
  /* ---------- perpetual: devices and production instances are LINKED ----------
     ⚠️ Perpetual used to have no device control at all: `hasDevices()` excluded it
     outright, so Devices rendered as a locked row reading "The device limit is set by
     this plan" — which was simply untrue. Devices ARE addable on a perpetual; each
     production instance you buy brings 5,000 more.

     The model, in one line: the licence includes 5,000 devices per production
     instance, and anything typed above that is EXTRA and is carried along when the
     instance count changes. Type 5,050 on one instance and you have 5,000 included
     + 50 extra; press + and you have 10,050 — the extra survives, because it was a
     separate decision from how many instances you run. */
  var PERP_DEV_PER_INSTANCE = 5000;
  function isPerpTB(){ return isPerp() && st.product !== 'tbmq'; }   // TBMQ counts sessions, not devices
  /* what the CURRENT configuration includes without paying for loose devices */
  function devicesIncluded(){
    if(isPerpTB()) return PERP_DEV_PER_INSTANCE * (cust.prod || 1);
    return DEVICE_TIERS[tier()] || 0;
  }
  function hasDevices(){ return isPerp() ? isPerpTB() : !!DEVICE_TIERS[tier()]; }
  // devices typed on top of what the instances already include
  function extraDevices(){ return Math.max(0, (cust.devices || 0) - devicesIncluded()); }
  /* ⚠️ NO PRICE EXISTS for a loose device on a perpetual. The repository prices extra
     devices only on Business (`DEVICE_UNIT`, a monthly figure on a subscription), and
     nothing anywhere gives a one-time per-device rate. Rather than invent one, the
     line is listed WITHOUT an amount — the same treatment Offline Mode already gets
     for the same reason. Flagged in NOTES. */
  function perpDevicesPriced(){ return false; }

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
  /* ⚠️ Read from the SPEC, not from the price string or the plan name. `free:true` is the
     one fact three different behaviours hang off — no billing step, no total, and a
     Review that says nothing is charged — so it must not be re-derived three times. */
  function isFree(){ return !!(TIER_SPECS[tier()] || {}).free; }
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
      /* perpetual loose devices have no rate — see perpDevicesPriced() */
      + (hasDevices() && !isPerp() ? Math.max(0, (c.devices || 0) - devicesIncluded()) * DEVICE_UNIT : 0)
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
  /* What a MODIFICATION actually charges: the difference, never the whole licence.
     ⚠️ `total()` is BASE + extras, which is right for a first purchase and wrong for a
     capacity purchase on a licence you already own — step 1 of a perpetual add-on read
     `One-time total $6,998.00`, the $4,999 base of a licence already paid for plus the
     $1,999 being bought. Same figure, one name, used by the step-2 summary, the step-3
     total and Due today, so the screen cannot show two of them again. */
  function modDelta(){ return Math.max(0, total() - oldMonthly()); }
  /* the fraction of the current cycle a subscription change is charged for; a
     perpetual has no cycle, so its callers pass 1 (see the note above renderReview) */
  function prorateFraction(){
    var pr = (isMod() && !isPerp()) ? prorate(st.changeLic && st.changeLic.event) : null;
    return pr ? pr.fraction : 1;
  }
  /* ⚠️ A perpetual modification has no recurring figure at all, so "New monthly" is
     meaningless on it and the only honest total is what is being added today. */
  function perpMod(){ return isPerp() && isMod(); }
  function confirmLabel(){
    if(isAddons()) return 'Confirm changes';
    if(isChange()) return 'Confirm change';
    // nothing is bought and nothing is subscribed to — the licence is simply created
    if(isFree()) return 'Create license';
    return isPerp() ? 'Buy license' : 'Subscribe';
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
    if(e.devices > 0) out.push({ t:'+' + e.devices.toLocaleString('en-US') + ' devices',
      /* amt null = "no rate for this yet", rendered as a line with no figure rather
         than a made-up $0.00 (see the Offline Mode note) */
      amt: perpDevicesPriced() || !isPerp() ? e.devices * DEVICE_UNIT : null,
      unit: isPerp() ? null : DEVICE_UNIT });
    if(e.prod > 0) out.push({ t:'+' + e.prod + ' production instance' + (e.prod > 1 ? 's' : ''), amt:e.prod * u.prod, unit:u.prod });
    if(hasDev() && e.dev > 0) out.push({ t:'+' + e.dev + ' development instance' + (e.dev > 1 ? 's' : ''), amt:e.dev * u.dev, unit:u.dev });
    if(hasAi() && e.ai > 0) out.push({ t:'+' + e.ai + 'M AI credits', amt:e.ai * u.ai, unit:u.ai });
    if(hasAddons() && cust.edge)   out.push({ t:'+ Edge Computing',   amt:ADD.edge });
    if(hasAddons() && cust.trendz) out.push({ t:'+ Trendz Analytics', amt:ADD.trendz });
    if(hasOffline() && cust.offline) out.push({ t:'+ Offline Mode', amt:null });
    return out;
  }
  function total(){ return (BASE[tier()] || 0) + deltas().reduce(function(a, c){ return a + (c.amt || 0); }, 0); }
  /* ---- coupon ------------------------------------------------------------------
     ⚠️ THE RATE IS `inferred` AND THE RULE IS A STUB. Nothing in this repository
     defines a coupon, a code or a discount, so any code applies the same demo rate —
     enough to show the recalculation the brief asks for, and flagged so nobody reads
     20% as a decision. The redemption stub matches the one the licence surface has had
     since coupons existed there.
     ⚠️ `total()` stays the LIST figure and the discount is taken off separately: a
     discount that silently rewrote the subtotal would make the breakdown above it stop
     adding up, which is the one thing an order summary has to do. */
  var COUPON_RATE = 0.20;          // inferred
  /* ⚠️ THE RULE IS A STUB AND IT SAYS SO. Nothing in this repository defines a real
     coupon, so every code that LOOKS like one is accepted at the same demo rate. What is
     worth having in a prototype is the shape of a rejection, so one reserved code is
     always invalid and a malformed one is caught: that is enough to show where the error
     goes and what it looks like, without pretending there is a catalogue behind it. */
  function couponError(code){
    if(!code) return 'Enter a coupon code.';
    if(!/^[A-Za-z0-9-]{4,20}$/.test(code))
      return 'Coupon codes are 4–20 letters, numbers or hyphens.';
    if(code.toUpperCase() === 'EXPIRED') return 'This coupon has expired.';
    return null;
  }
  function couponBase(){ return isMod() ? modDelta() : total(); }
  function discount(){ return st.coupon ? couponBase() * st.coupon.rate : 0; }
  function payable(){ return Math.max(0, couponBase() - discount()); }
  /* Add-ons reviews a MODIFICATION, so its review states the delta against the
     configuration the licence arrived with — "from → to" for quantities, added /
     removed for the two add-ons. deltas() cannot do this: it lists everything
     above the plan's included amount, which is the whole extras bill rather than
     what this flow changed. */
  function changeRows(){
    var b = st.baseCust, u = units(), out = [];
    if(!b) return out;
    /* `price === null` means "this quantity has no rate" — the row is stated without a
       figure rather than priced at a rate borrowed from somewhere else. */
    function qty(f, label, price, show){
      if(!show || cust[f] === b[f]) return;
      out.push({ t:label + ' ' + qtyLabel(f, b[f]) + ' \u2192 ' + qtyLabel(f, cust[f]),
                 amt: price == null ? null : (cust[f] - b[f]) * price });
    }
    /* ⚠️ A perpetual's devices are NOT priced at DEVICE_UNIT. That is $0.10 PER MONTH
       on a Business subscription, and applying it here charged $505.00 for a one-time
       purchase — a figure that then did not appear in the total, so the breakdown and
       the sum disagreed on screen. Caught on the first perpetual Manage run. */
    qty('devices', 'Devices', isPerp() ? null : DEVICE_UNIT, hasDevices());
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
  /* the ladder a plan change is measured against — the two free tiers are its floor,
     so moving from any paid plan to one of them reads as the downgrade it is */
  var TIER_ORDER = ['free','noncomm','maker','prototype','pilot','startup','business'];
  function shrinks(){
    var b = st.baseCust;
    if(!b) return false;
    // a lower plan is a shrink by itself, whatever the extras do
    if(isChange()){
      /* ⚠️ `st.oldTier`, not `seededTier`: seededTier follows whatever is being
         configured, so once the reader picked the new plan it equalled the target and
         the comparison was always "no change". The licence's own tier is the only
         stable "from". */
      var from = TIER_ORDER.indexOf(st.oldTier), to = TIER_ORDER.indexOf(tier());
      if(from >= 0 && to >= 0 && to < from) return true;
    }
    if(cust.devices < b.devices || cust.prod < b.prod || cust.dev < b.dev || cust.ai < b.ai) return true;
    if(b.edge && !cust.edge) return true;
    if(b.trendz && !cust.trendz) return true;
    if(b.offline && !cust.offline) return true;
    return false;
  }
  /* ⚠️ `pendingApply()` and `effectiveDate()` ARE GONE with the schedule they existed
     for: one built the licence's future shape to be applied later, the other named the
     date it would happen. Changes apply now, so the future shape IS the current one and
     there is no date to compute. (`shrinks()` above survives — the Review step still has
     to say what is being given up, it just no longer defers it.) */
  function changeSummary(){
    var r = changeRows();
    return r.length ? r.map(function(x){ return x.t; }).join(' \u00b7 ') + '.' : 'License updated.';
  }
  /* seed the flow from the licence it was opened on: current = the plan's included
     amounts plus whatever extras the licence already carries. seededTier is set
     here so seedCust() does not reseed over it with the plan minimums. */
  /* What a licence's CURRENT configuration is, read against the tier it is on. Split
     out of seedFromLicense so change-plan can take a baseline from the OLD plan without
     also overwriting `cust`, which has to reseed to the NEW plan's minimums. */
  function licenseCust(lic, t){
    var i = INCL[t] || { prod:1, ai:0 };
    var x = lic.extras || {};
    var n = function(v){ return parseInt(String(v || '0'), 10) || 0; };
    var prod0 = i.prod + n(x.prod);
    var devBase = isPerp() ? (isPerpTB() ? PERP_DEV_PER_INSTANCE * prod0 : 0)
                           : (DEVICE_TIERS[t] || 0);
    return { prod:prod0, dev:n(x.dev), ai:(i.ai || 0) + n(x.ai),
             devices:devBase + n(x.devices),
             edge:!!lic.edge, trendz:!!lic.trendz, offline:!!lic.offline };
  }
  function seedFromLicense(lic){
    var t = tier(), i = INCL[t] || { prod:1, ai:0 };
    var x = lic.extras || {};
    var n = function(v){ return parseInt(String(v || '0'), 10) || 0; };
    var prod0 = i.prod + n(x.prod);
    /* ⚠️ Seeded from the INSTANCE COUNT on a perpetual, not from a fixed tier number:
       a licence already running 3 instances includes 15,000 devices, and seeding it
       with 5,000 would have shown the owner fewer devices than they have. */
    var devBase = isPerp() ? (isPerpTB() ? PERP_DEV_PER_INSTANCE * prod0 : 0)
                           : (DEVICE_TIERS[t] || 0);
    cust = { prod:prod0, dev:n(x.dev), ai:(i.ai || 0) + n(x.ai),
             devices:devBase + n(x.devices),
             edge:!!lic.edge, trendz:!!lic.trendz, offline:!!lic.offline };
    st.baseCust = { prod:cust.prod, dev:cust.dev, ai:cust.ai, devices:cust.devices,
                    edge:cust.edge, trendz:cust.trendz, offline:cust.offline };
    seededTier = t;
  }
  /* ⚠️ White labeling joins this line rather than sitting in the card above it. The
     line is what the plan gives you, item by item — a quantity is not a different
     KIND of fact from a capability, and splitting them put half the answer in the
     title block and half here. It is appended, not sorted in, because the quantities
     have an order the spec fixes and this has no number to sort by. */
  function entSummary(t){
    var spec = TIER_SPECS[t] || { ent:[] };
    // same exclusion as the capacity list: Assets is out of the wizard (see skipEnt)
    var parts = spec.ent.filter(function(e){ return !skipEnt(e[0]); }).map(function(e){
      var lbl = e[0] === 'AI credits' ? 'AI credits' : e[0].toLowerCase();
      if(e[1] === '1') lbl = lbl.replace(/s$/, '');
      return e[1] + ' ' + lbl;
    });
    if(whitelabelState(t)) parts.push('White labeling');
    return parts.join(' · ');
  }

  /* ---- step indicator: a thin progress line under the header, then one
     "Step N of M · Label" row. ---- */
  /* Product, billing type and plan are all chosen on step 1, so there is no
     separate product step. The tail depends on the account: with billing data
     saved the last step is Review & pay and commits there; without it, Review
     only reviews and a Payment & Billing step is appended to collect the data
     and commit. Nothing hardcodes the count — the progress line reads it. */
  // a licence you can change already pays for itself, so change-plan never asks
  // for billing data — only a first purchase can land on the billing step
  function needsBilling(){ return !isChange() && !billingSaved(); }
  /* ⚠️ THE NUMBERED-STEP NOTE THAT USED TO BE HERE IS GONE with the ids it described.
     Steps are keys and the list is computed (see steps()); Manage add-ons simply has no
     'pick' in its list rather than starting at an offset index. */
  /* Two ways to arrive with the picker already answered, and they get the same
     shortened flow: Manage add-ons (the plan is settled by the licence) and a plan
     chosen on the public landing page before the account existed. In both, step 1
     is not "skipped" — it is COMPLETED elsewhere, so counting it would make the
     progress line promise a screen that is never coming. */
  function noPicker(){ return isAddons() || !!st.noPicker; }

  /* ---- the step list -----------------------------------------------------------
     ⚠️ ONE PLACE DECIDES WHICH STEPS EXIST, and everything else reads it: the progress
     line, the back button, Continue, the commit. Fixed ids 1..4 could not express any
     of what this flow now needs — Customize is TWO steps, a free plan has neither of
     them and no billing step, TBMQ subscriptions have no add-ons to show — without
     arithmetic at every call site, and arithmetic is how a wizard ends up promising
     "Step 3 of 4" and then showing the last screen. */
  var STEP_NODE = { pick:'#nlStepPick', capacity:'#nlStepCap', addons:'#nlStepAdd',
                    review:'#nlStepRev', billing:'#nlStepBill' };
  /* The add-ons step exists when there is something to TOGGLE. White labeling rides
     along on it, but it is a stated fact and not a control, so it cannot justify a
     step of its own — on a tier with no toggles it stays at the end of Capacity. */
  function hasAddonStep(){ return !isFree() && (hasAddons() || hasOffline()); }
  function steps(){
    var s = [];
    if(!noPicker()) s.push('pick');
    /* ⚠️ A FREE PLAN HAS NO CAPACITY AND NO ADD-ONS STEP. This follows from the brief
       rather than extending it: a free plan cannot be added to without becoming a paid
       one, and the same brief says the flow shows no total and no card. Two steps whose
       every control would be inert are worse than no steps — they promise a decision
       and then refuse it. Reported, not assumed silently. */
    if(!isFree()) s.push('capacity');
    if(hasAddonStep()) s.push('addons');
    s.push('review');
    /* free = nothing to charge, so no billing step even on an account that has no
       billing data saved */
    if(needsBilling() && !isFree()) s.push('billing');
    return s;
  }
  function stepIdx(){ var i = steps().indexOf(st.step); return i < 0 ? 0 : i; }
  function totalSteps(){ return steps().length; }
  function isLastStep(){ return stepIdx() === totalSteps() - 1; }
  function isFirstStep(){ return stepIdx() === 0; }
  function stepAt(d){ return steps()[stepIdx() + d] || null; }
  /* ⚠️ "Choose your plan", not "Choose your product and plan": the product is STATED on
     this step now (see nlProductStatedHTML), so the label must not promise a choice the
     step no longer offers — the same reason Change plan says "Choose a plan". */
  function stepLabel(k){
    if(k === 'pick') return isChange() ? 'Choose a plan' : 'Choose your plan';
    if(k === 'capacity') return 'Capacity';
    if(k === 'addons') return 'Add-ons';
    if(k === 'review') return steps().indexOf('billing') < 0 ? reviewLabel() : 'Review';
    return 'Payment & Billing';
  }
  /* A free plan commits from the Review step and pays nothing, so the step must not be
     called "Review & pay" — there is no pay. */
  function reviewLabel(){ return isFree() ? 'Review' : 'Review & pay'; }
  function renderSteps(){
    // Back is an icon button here, right before the step label — the footer no
    // longer carries it (and the Customize steps have no footer at all)
    var back = !isFirstStep()
      ? '<button class="iconbtn ib nl-stepback" id="nlStepBack" aria-label="Back" title="Back">'
        + '<svg class="icon" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>'
      : '';
    var i = stepIdx() + 1, n = totalSteps();
    $('#nlSteps').innerHTML = '<div class="nl-progress">'
      + '<div class="nl-ptrack"><span class="nl-pfill" style="width:' + (i / n * 100) + '%"></span></div>'
      + '<div class="nl-plabel">' + back
      + '<span>Step ' + i + ' of ' + n + ' · <b>' + stepLabel(st.step) + '</b></span></div></div>';
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
  function renderStepPick(){
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
      /* ⚠️ `Included: White labeling` USED TO SIT HERE and has moved — to its own block
         at the foot of the capacity list on Customize (see featureRow) and into the
         entitlement line under the plan name on Review (see entSummary). The reason it
         had to be somewhere is unchanged: the buyer chooses the plan FOR it, sees it on
         the card, and used to find it confirmed only as a ticked chip after paying.
         The reason it is no longer HERE is that this card names the PURCHASE — product,
         plan, billing kind — and every other thing the plan carries is listed with the
         rest of the entitlements, not appended to the title block. One list, not two. */
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
  /* ⚠️ ONE description, not a description plus a separate `.am-lockwhy` line beneath.
     Devices carried both — "Total number of IoT devices that will connect to your
     ThingsBoard platform." and "The device limit is set by this plan. To change it,
     change the plan." — stacked as two blocks in two styles, which read as two
     unrelated remarks about the same row. They are one fact: what the number is, and
     why you cannot move it. Joined, they sit in `.fs-celldesc`, the same slot and the
     same style every other row's description uses.
     ⚠️ A locked row with no description of its own (Sessions, Messages / sec) is not
     left blank: the lock sentence becomes its description, so every row in the stack
     has exactly one, in exactly one place. */
  function lockedCell(lbl, val, desc){
    var why = lbl === 'Devices'
      ? 'The device limit is set by this plan. To change it, change the plan.'
      : 'Set by this plan. To change it, change the plan.';
    var full = desc ? desc + ' ' + why : why;
    return '<div class="am-cell am-locked"><div class="fs-cellhead"><div class="fs-celltext">'
      + '<div class="am-celltop">' + lbl + '</div>'
      + '<div class="fs-celldesc">' + full + '</div></div>'
      + '<span class="fs-lockfield">' + LOCKSVG
      + '<input class="fs-devinput locked" type="text" value="' + val + '" disabled aria-label="' + lbl + ' — ' + why + '"></span>'
      + '</div>'
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
  /* ⚠️ DESCRIPTIONS ARE BODY TEXT HERE, and the info icon lives on the PLAN PICKER
     instead. Both were tried: the icon was put on these Customize rows first, and it
     was the wrong surface for it. By the time you are on Customize you have chosen the
     plan and are setting quantities — the sentence explaining what a production
     instance IS belongs where you are still deciding, not where you are adjusting.
     `info` stays a parameter of stepCell so the choice is visible at the call sites
     rather than baked in, but nothing on this step passes it. */
  function stepCell(field, label, desc, priceNote, val, min, info){
    var minus = val <= min ? ' disabled' : '', plus = val >= MAXQ[field] ? ' disabled' : '';
    return '<div class="am-cell"><div class="fs-cellhead"><div class="fs-celltext">'
      + (info ? cellTopWithInfo(label, desc)
              : '<div class="am-celltop">' + label + '</div>'
                + (desc ? '<div class="fs-celldesc">' + desc + '</div>' : '')) + '</div>'
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
  /* ---- White labeling: stated, not offered -----------------------------------
     ⚠️ NOT a control, and that is the whole point of giving it its own shape. Every
     other block in this stack is something you can move — a stepper, a switch, a
     number. This one is a fact about the plan you picked, so it carries a word on the
     right where its neighbours carry a price or a control, and nothing to click.

     ⚠️ The DESCRIPTION is `inferred`: nothing in this repository describes what white
     labeling does — the plan cards list it as a feature name and the details surface
     shows it as a ticked chip, neither with a sentence. Written here so the row is not
     a bare name; confirm the wording with the team.

     ⚠️ `Enabled` vs `Included` comes from WHERE the flag is true, which is a real
     distinction the data already carries (renderLicenseFeatures reads the same pair):
     `lic.whitelabel` set on the licence itself means it is turned on for THIS licence
     — Enabled — while `spec.wl` means it arrives with the plan — Included. In the
     shipped datasets only the plan path occurs, so today this reads `Included`
     everywhere; the licence flag exists and is settable (window.setFeature), so the
     other word is reachable rather than decorative. */
  var WL_DESC = 'Your own logo, colours and product name in place of ThingsBoard branding.'; // inferred
  function whitelabelState(t){
    var lic = isMod() ? st.changeLic : null;
    if(lic && lic.whitelabel != null) return lic.whitelabel ? 'Enabled' : null;
    return (TIER_SPECS[t || tier()] || {}).wl ? 'Included' : null;
  }
  function featureRow(name, desc, state){
    return '<div class="am-cell am-feature"><div class="fs-cellhead"><div class="fs-celltext">'
      + '<div class="am-celltop">' + name + '</div>'
      + '<div class="fs-celldesc">' + desc + '</div></div>'
      + '<span class="pill soft am-featstate">' + state + '</span>'
      + '</div></div>';
  }
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
    /* ⚠️ The base-price row is DROPPED on a perpetual modification: you are not buying
       the licence again, and listing its price made the summary total include it. */
    if(!perpMod())
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
    var list = $('#nlStepCap .am-sumlist');
    if(!list) return;
    list.innerHTML = summaryHTML();
    var totalRow = $('#nlStepCap .am-total-row');
    if(totalRow) totalRow.innerHTML = '<span>' + (isPerp() ? 'One-time total' : 'New monthly')
      + '</span><span>' + money(perpMod() ? modDelta() : total()) + perSuffix() + '</span>';
  }
  /* The Devices description names every part the number is made of, and only the
     parts that exist. On a perpetual with 3 instances and nothing typed on top:
     "5,000 included + 10,000 from instances". Type 50 more and "+ 50 extra" joins it.
     ⚠️ Built from the same numbers the field is clamped to, so the sentence and the
     minimum can never describe different things. */
  function devicesDesc(){
    if(!isPerpTB()){
      return DEVICES_DESC + ' ' + devicesIncluded().toLocaleString('en-US')
        + ' included with this plan \u2014 enter the total you need.';
    }
    var fromInst = PERP_DEV_PER_INSTANCE * Math.max(0, (cust.prod || 1) - 1);
    var parts = [PERP_DEV_PER_INSTANCE.toLocaleString('en-US') + ' included'];
    if(fromInst > 0) parts.push(fromInst.toLocaleString('en-US') + ' from instances');
    var x = extraDevices();
    if(x > 0) parts.push(x.toLocaleString('en-US') + ' extra');
    return parts.join(' + ');
  }
  /* ⚠️ The subscription note is a PRICE ("+$0.10 / mo per extra device"). The perpetual
     has no per-device rate at all, so it must not pretend to one — it states where the
     number comes from instead, which is the thing the reader is actually working out. */
  function devicesPriceNote(){
    if(!isPerpTB()) return '+$0.10 / mo per extra device';
    return PERP_DEV_PER_INSTANCE.toLocaleString('en-US') + ' devices per production instance';
  }
  /* ⚠️ The seed lives HERE, not inside a render, because TWO steps now read `cust` and
     whichever of them paints first must not be the only one that can create it. */
  function seedCust(){
    var t = tier(), i = INCL[t] || { prod:1, ai:0 };
    if(seededTier === t) return;
    cust = { prod:i.prod, dev:0, ai:i.ai, devices:0, edge:false, trendz:false };
    // devicesIncluded() reads cust.prod, so the floor is set after prod exists
    cust.devices = devicesIncluded();
    seededTier = t;
  }
  /* ---- CAPACITY: everything measured in a number you can raise ---------------- */
  function capacityCellsHTML(){
    var t = tier(), i = INCL[t] || { prod:1, ai:0 }, u = units(), spec = TIER_SPECS[t] || { ent:[] };
    var per = isPerp() ? ' one-time' : ' / mo';
    var variantA = custVariant() === 'a';
    var cells = '';
    spec.ent.forEach(function(e){
      var lbl = e[0], val = e[1];
      if(skipEnt(lbl)) return;                       // Assets is out of the wizard
      if(lbl === 'Devices' && hasDevices()){
        cells += numberCell('devices', 'Devices', devicesDesc(),
          devicesPriceNote(), cust.devices, devicesIncluded());
      } else if(lbl === 'Production instances'){
        /* ⚠️ A perpetual instance is not just compute — it is 5,000 devices, and that
           is the fact the buyer needs before pressing +. The subscription sentence is
           unchanged; only the perpetual one names the linkage. */
        var prodDesc = isPerpTB()
          ? i.prod + ' included. Each purchased instance includes '
            + PERP_DEV_PER_INSTANCE.toLocaleString('en-US')
            + ' devices. Add more at any time to horizontally scale your solution.'
          : 'Production compute — ' + i.prod + ' included. Enables clustering and HA.';
        cells += stepCell('prod', 'Production instances', prodDesc,
          '+' + money(u.prod) + per + ' each', cust.prod, i.prod);
      } else if(lbl === 'AI credits'){
        cells += stepCell('ai', 'AI credits', 'Monthly allowance, in blocks of 1M credits. Minimum matches your plan — increase to buy more.', '+' + money(u.ai) + per + ' per 1M AI credits', cust.ai, i.ai);
      } else if(!variantA){
        // variant A shows these in the plan card instead
        cells += lockedCell(lbl, val, lbl === 'Devices' ? DEVICES_DESC : '');
      }
    });
    if(hasDev()) cells += stepCell('dev', 'Development instances', 'Dedicated instances for dev, test, and CI/CD — keeps production data clean.', '+' + money(u.dev) + per + ' each', cust.dev, 0);
    return cells;
  }
  /* ---- ADD-ONS: everything that is a switch, plus what the plan simply states ---- */
  function addonCellsHTML(){
    var cells = '';
    if(hasAddons()){
      cells += addonRow('edge', 'Edge Computing', 'Edge instances at remote sites for offline processing and auto-sync.', ADD.edge, cust.edge)
        + addonRow('trendz', 'Trendz Analytics', 'Advanced analytics, custom dashboards, and trend discovery.', ADD.trendz, cust.trendz);
    }
    // a perpetual licence gets one add-on of its own: running without internet
    if(hasOffline()) cells += addonRow('offline', 'Offline Mode', OFFLINE_DESC, cust.offline == null ? false : cust.offline);
    return cells;
  }
  /* last in the list: it is the one row you cannot act on, so it must not sit among —
     or above — the ones you can. See featureRow. */
  function featureCellsHTML(){
    var wlState = whitelabelState();
    return wlState ? featureRow('White labeling', WL_DESC, wlState) : '';
  }
  /* The two Customize steps are the same screen with different contents, so they are
     built by one function: a left column of rows and the Calculation summary on the
     right, carrying this step's own forward action. */
  function customizeShell(leftHTML, cta){
    return '<div class="fs-grid">'
      + '<div class="fs-col">' + leftHTML + '</div>'
      + '<div class="am-sec fs-right">'
      +   '<div class="am-sechead"><h4>Calculation summary</h4></div>'
      +   '<div class="am-figures"><div class="am-sumlist">' + summaryHTML() + '</div>'
      +     '<div class="am-sumrow am-total-row"><span>' + (isPerp() ? 'One-time total' : 'New monthly') + '</span><span>' + money(perpMod() ? modDelta() : total()) + perSuffix() + '</span></div>'
      +   '</div>'
      /* ⚠️ An ATTRIBUTE, not an id: two steps render this button now (Capacity and
         Add-ons), and both were emitting `id="nlSumNext"` — two nodes with one id, so
         `$('#nlSumNext')` answered with whichever came first in the document, which is
         the HIDDEN step. Caught by reading the wrong step's label back in a measurement. */
      +   '<button class="btn fs-nextbtn" data-nlnext>' + cta + '</button>'
      + '</div>'
      + '</div>';
  }
  /* ---- CUSTOMIZE, STEP ONE OF TWO: capacity ------------------------------------
     ⚠️ SPLIT FROM ONE STEP, and the reason is the add-ons, not the capacity. In one
     combined step the switches sat BELOW a long list of steppers, so on a phone the
     only things on the step you could turn on were the only things you never saw.
     Splitting puts each of them on a screen that fits.
     Two variants, switched from the prototype settings panel:
       A — a plan card on top carries the fixed entitlements as read-only facts,
           and the controls list holds only what can actually change;
       B — the fixed entitlements stay as rows, with a lock inside the disabled
           input instead of a "fixed by …" helper under it.
     ⚠️ The section HEADINGS inside the panel are gone with the split: the step bar
     already says "Capacity" / "Add-ons", and a heading repeating the step's own name
     is the kind of duplication that makes a screen look like it contains two things. */
  function renderCapacity(){
    seedCust();
    var t = tier(), spec = TIER_SPECS[t] || { ent:[] };
    var variantA = custVariant() === 'a';
    var cells = capacityCellsHTML();
    /* when a tier has no toggles at all there is no add-ons step, so the stated
       feature row has nowhere else to go and stays here */
    var tail = hasAddonStep() ? '' : featureCellsHTML();
    var left = variantA
      ? planSummaryHTML(t, spec)
        + '<div class="am-sec fs-panel"><div class="am-capgrid">' + cells + '</div>'
        + (tail ? '<div class="am-capgrid am-featgrid">' + tail + '</div>' : '')
        + '</div>'
      : planSummaryHTML(t, spec)
        + '<div class="am-sec nl-cardstack">' + cells + tail + '</div>';
    $('#nlStepCap').innerHTML = customizeShell(left, hasAddonStep() ? 'Continue' : 'Review order');
  }
  /* ---- CUSTOMIZE, STEP TWO OF TWO: add-ons -------------------------------------
     ⚠️ NO PLAN CARD HERE, deliberately. It is on the step before this one, where it
     carries the fixed entitlements variant A needs; repeating it would put the tallest
     block on the page above the four rows this step exists to show, which is the exact
     burial the split was made to undo. */
  function renderAddons(){
    seedCust();
    var variantA = custVariant() === 'a';
    var cells = addonCellsHTML() + featureCellsHTML();
    var left = variantA
      ? '<div class="am-sec fs-panel"><div class="am-capgrid">' + cells + '</div></div>'
      : '<div class="am-sec nl-cardstack">' + cells + '</div>';
    $('#nlStepAdd').innerHTML = customizeShell(left, 'Review order');
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
    // no billing terms where there is no billing
    if(isFree()) return 'Free plan · no billing. Upgrade at any time.';
    if(isPerp()) return 'One-time payment · includes 12 months of software updates.';
    return 'Billed monthly · auto-pay. Cancel anytime.';
  }
  /* ---- the coupon row: closed · open · applied ---------------------------------
     Three states in one row, and the row never moves: closed it offers, open it takes
     the code in place, applied it states what was applied and how to change or remove
     it. ⚠️ An invalid code is a FIELD ERROR on the input, not a snackbar: the snackbar
     is for results that are finished and elsewhere, and a rejected code is neither —
     it is a field that needs correcting, right where the cursor already is.
     ⚠️ Monochrome, not an error colour: the same departure reported for the alert icon.
     `.fielderr` is this system's error treatment — the border thickens to ink and the
     message is ink + bold against faint help text. Adding a hue is one token if that is
     being revisited. */
  function couponRowHTML(){
    /* ⚠️ OPEN IS CHECKED FIRST. With `st.coupon` tested before it, `Change` on an applied
       coupon set the open flag and then rendered the applied row anyway — the button
       existed, was clickable, and produced nothing. Same class of fault as the row menu
       that would not open: a state the code can enter and the view cannot show. */
    if(st.couponOpen) return couponOpenHTML();
    if(st.coupon){
      return '<div class="am-orow nl-couponrow is-applied"><div>'
        + 'Coupon <b>' + esc(st.coupon.code) + '</b> '
        + '<span class="muted">\u2212' + Math.round(st.coupon.rate * 100) + '%</span> '
        + '<button type="button" class="link nl-couponedit" data-couponopen>Change</button>'
        + '<button type="button" class="link nl-couponedit" data-couponremove>Remove</button>'
        + '</div><div>\u2212' + money(discount()) + '</div></div>';
    }
    return '<div class="am-orow nl-couponrow"><div>'
      + '<button type="button" class="link" data-couponopen>Apply coupon</button>'
      + '</div><div></div></div>';
  }
  function couponOpenHTML(){
    return '<div class="am-orow nl-couponrow is-open"><div class="nl-couponfield">'
        + '<div class="field' + (st.couponErr ? ' err' : '') + '">'
        +   '<input type="text" id="nlCouponInput" placeholder="Coupon code" autocomplete="off"'
        +     ' aria-label="Coupon code" value="' + esc(st.couponDraft || '') + '">'
        + '</div>'
        + '<button type="button" class="btn sec" data-couponapply>Apply</button>'
        + '<button type="button" class="link nl-couponedit" data-couponcancel>Cancel</button>'
      + (st.couponErr ? '<div class="fielderr nl-couponerr">' + esc(st.couponErr) + '</div>' : '')
      + '</div><div></div></div>';
  }
  /* ---- the legal confirmation ---------------------------------------------------
     ⚠️ IT SITS ON WHICHEVER STEP COMMITS, not on a fixed one. With billing data on file
     that is Review & pay; without it the flow ends on Payment & Billing, and a consent
     tick left behind on an earlier screen would be agreed to before the order was.
     ⚠️ IT FOLLOWS THE VALIDATION RULE THIS FLOW ALREADY HAS: the primary is never
     disabled. A disabled button cannot say why it is disabled — it cannot even take
     focus — so the button accepts the press and the answer appears under it.
     ⚠️ Monochrome, like every other error here: `.fielderr` is this system's error
     treatment. The brief asked for the error colour; see the report. */
  var LEGAL_TEXT = 'I have read and agree to the '
    + '<a class="link" href="license-agreement.html" target="_blank" rel="noopener">ThingsBoard License Agreement</a>. '
    + 'I confirm I am authorized to accept it on behalf of my organization.';
  function legalBlockHTML(){
    return '<label class="nl-legal' + (st.legalErr ? ' err' : '') + '">'
      + '<input type="checkbox" id="nlLegal"' + (st.legalOk ? ' checked' : '') + '>'
      + '<span class="nl-legaltxt">' + LEGAL_TEXT + '</span></label>'
      + (st.legalErr ? '<div class="fielderr nl-legalerr" role="alert">' + esc(st.legalErr) + '</div>' : '');
  }
  var LEGAL_ERR = 'Confirm the statement above to issue the license.';
  /* A modification does not issue a licence — it changes one that was already agreed to
     — so Change plan and Manage add-ons do not ask again. See the report. */
  function needsLegal(){ return !isMod(); }
  function legalBlocked(){
    if(!needsLegal() || st.legalOk) return false;
    st.legalErr = LEGAL_ERR;
    return true;
  }
  function renderReview(){
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
    /* ⚠️ A PERPETUAL IS NEVER PRORATED. Proration divides a recurring charge across the
       days left in a billing cycle — a perpetual has no cycle, and the date it does
       carry is its software-updates term, not a period anyone is billed for. Before
       this, buying capacity on a perpetual read "prorated change for the current cycle
       (31 of 31 days, to Aug 26, 2027)": a cycle invented out of the updates date.
       The word is now decided by the billing kind, not by the fact that this is a
       modification. */
    var prorates = isMod() && !isPerp();
    var pr = prorates ? prorate(st.changeLic && st.changeLic.event) : null;
    var dueLabel = !isMod() ? 'Due today'
      : !prorates ? 'Due today <span class="muted">— one-time, added to this license</span>'
      : 'Due today <span class="muted">— prorated change for the current cycle'
        + (pr ? ' (' + pr.left + ' of ' + pr.cycle + ' days, to ' + pr.end + ')' : '') + '</span>';
    /* ⚠️ A LOWERING CHANGE IS NO LONGER DEFERRED — it recalculates now, and this is the
       rule that replaced "it takes effect at the end of the period you paid for".
       `Math.max(0, …)` inside modDelta() therefore means something different: not "a
       shrink is not charged because nothing has happened yet", but "a lower bill is not
       a charge". What today's figure does NOT say is whether the difference is credited
       back — no policy for that exists in the repository, so the line states the charge
       and stops. */
    var lowers = isMod() && shrinks();
    var delta = modDelta();          // one definition, shared with the summary above
    // a perpetual modification charges the delta WHOLE — no fraction of a cycle
    var dueVal = isMod() ? money((delta - discount()) * (pr ? pr.fraction : 1)) : money(payable());
    if(lowers){
      dueLabel = 'Due today <span class="muted">— nothing to charge for a lower plan</span>';
      dueVal = money(0);
    }
    /* ⚠️ A FREE PLAN HAS NO MONEY ON THE SCREEN AT ALL: no due row, no card line, no
       total. Printing "$0.00" would be a figure where there is no transaction. */
    if(isFree()){ dueLabel = ''; dueVal = ''; }
    // with a card on file the review commits; without one it leads to the billing step
    var cta = isLastStep() ? confirmLabel() : 'Continue to billing';
    var payline = isFree()
      ? 'No payment method needed — this plan is free.'
      : billingSaved()
      ? (isPerp() ? 'Charged once to' : 'Charged to') + ' Visa ••4242'
        + (isPerp() ? '' : ' · auto-pay') + ' · <button class="link" id="nlPayChange">Change → Payment &amp; Billing</button>'
      : 'You’ll add billing and payment details on the next step.';
    $('#nlStepRev').innerHTML =
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
      /* ⚠️ THIS BOX USED TO SAY THE CHANGE WAS SCHEDULED. Downgrades recalculate
         immediately now, so the deferral, the future date and the "current allowances
         stay until then" promise are all gone — but the box is NOT. The step still has
         to say what is being given up, what the new price is, and when it starts, and
         "immediately" is a when, not a reason to go silent. The reader is lowering a
         licence that is running right now; that deserves a sentence whether the date is
         next month or this second. */
      +   (lowers
          ? '<div class="nl-effect"><b>This change takes effect immediately.</b> '
            + 'It lowers what this license includes, and the new allowances apply from now. '
            + 'It is billed at ' + money(total()) + ' / mo from today.'
            + '<div class="nl-effectwhat">' + esc(changeSummary()) + '</div></div>'
          : '')
      +   '<div class="nl-joined">'
      +     '<div class="am-order">'
      /* ⚠️ This row no longer names the product: the card above does. It is the
         base-price line of the breakdown, so it carries the plan (and, in change
         mode, the transition) and the amount — nothing that the card repeats. */
      /* ⚠️ `Startup base`, not `Plan` — the SAME words the Calculation summary on step 2
         uses for the same number. Two names for one line made the review read as a
         different document from the step that produced it, and the reader has to match
         them up before trusting the total. A change keeps its transition
         ("Business → Pilot"): that line is not a base-price line, it says what is
         being swapped. */
      /* ⚠️ On a perpetual modification the base row goes, and the total row goes with
         it: the licence is already owned, so the change rows plus "Due today" on the
         right are the whole truth about this purchase. Keeping them printed the same
         screen's second, larger figure — $6,998 above $1,999 — with nothing to say
         which one was being charged. */
      /* ⚠️ APPLY COUPON SITS ON THE BASE-PRICE ROW, which is where the portal already
         puts it on its Summary step — next to the figure it changes, not in a corner of
         the screen where the reader has to work out what it applies to. A free plan has
         no price row at all, so it has no coupon. */
      +       (perpMod() ? '' :
                '<div class="am-orow am-planrow nl-mainline"><div>'
              /* ⚠️ "Free base" was what the generic rule produced, against a value that
                 also read "Free" — a base-PRICE label on a row that has no price. A free
                 plan's row is just the plan. */
              +   (isChange() ? (st.oldName + ' \u2192 ' + (NAME[t] || st.plan))
                              : ((NAME[t] || st.plan) + (isFree() ? '' : ' base')))
              +   '</div><div>' + (isFree() ? 'Free' : (money(BASE[t] || 0) + perSuffix())) + '</div></div>')
      +       '<div class="am-orow nl-entline"><div>' + entSummary(t) + '</div><div></div></div>'
      +       rows
      /* `isMod()` used to win outright and printed "New monthly" on a PERPETUAL
         modification — a licence that is never billed monthly at all. */
      /* ⚠️ THE COUPON IS ITS OWN ROW, DIRECTLY ABOVE THE TOTAL — not an action hung off
         the base-price line. Hung there it read as a property of that one figure; it
         applies to the order, and it belongs next to the number it changes.
         It is also where the input opens, in place: a coupon is a two-second detour,
         and sending the reader to a dialog and back to find out what it did is longer
         than the thing itself. */
      +       (isFree() ? '' : couponRowHTML())
      +       (perpMod() || isFree() ? '' :
                '<div class="am-orow am-newmonthly"><div>' + (isPerp() ? 'One-time total' : (isMod() ? 'New monthly' : 'Monthly total'))
              /* ⚠️ BOTH FIGURES when a coupon is applied: the old price struck through and
                 the new one beside it. A single recalculated number is correct and says
                 nothing — the reader applied a coupon to find out what it did, and the
                 answer is the difference, not the result. */
              +   '</div><div>' + (st.coupon
                    ? '<span class="was">' + money(total()) + '</span> '
                      + money(Math.max(0, total() - discount()))
                    : money(total())) + perSuffix() + '</div></div>')
      /* ⚠️ THIS CLOSES `.am-order`, and losing it is what broke the Review layout:
         `.nl-terms` fell inside the order list, the remaining two closers went to
         `.am-order` and `.nl-joined`, and `.fs-col` was left open — so `.fs-right`
         (Due today, the pay line, the commit) nested INSIDE the left column and
         rendered underneath it instead of beside it. Dropped when the perpetual
         guards were added by rewriting this block by line range; a `</div>` on a
         line of its own is exactly what a range rewrite loses. */
      +     '</div>'
      +     '<div class="nl-terms">' + termsLine()
      +       (isFree() ? '' : '<span class="taxnote nl-taxline">' + TAX_NOTE + '</span>') + '</div>'
      +   '</div>'
      + '</div>'
      /* right: Due today, the payment context, then the commit — all sitting in
         .fs-right's own padding, the same internal spacing step 2 uses */
      + '<div class="am-sec fs-right">'
      +   (isFree()
            ? '<div class="nl-free"><b>Nothing will be charged.</b> This plan is free — '
              + 'there is no payment method to add and no invoice for it.</div>'
            : '<div class="nl-duerow"><div class="am-duelabel">' + dueLabel + '</div>'
              + '<div class="am-dueval">' + dueVal + '</div></div>')
      +   '<div class="nl-payline">' + payline + '</div>'
      +   (isLastStep() && needsLegal() ? legalBlockHTML() : '')
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
    var slot = $('#nlStepBill [data-nlb-err="' + name + '"]');
    if(slot){ slot.textContent = msg || ''; slot.hidden = !msg; }
    var input = $('#nlStepBill [data-nlb="' + name + '"]');
    var field = input && input.closest('.field');
    if(!field) return;
    /* the three card subfields share a field: it wears the error state while ANY of
       them is wrong, so clearing one must not clear the box for the other two */
    if(name === 'num' || name === 'exp' || name === 'cvc'){
      var anyBad = ['num', 'exp', 'cvc'].some(function(k){
        var sl = $('#nlStepBill [data-nlb-err="' + k + '"]');
        return sl && !sl.hidden;
      });
      field.classList.toggle('err', anyBad);
    } else {
      field.classList.toggle('err', !!msg);
    }
  }
  function clearBillErrors(){
    $$('#nlStepBill [data-nlb-err]').forEach(function(sl){ sl.hidden = true; sl.textContent = ''; });
    $$('#nlStepBill .field.err').forEach(function(f){ f.classList.remove('err'); });
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
    var first = bad.length && $('#nlStepBill [data-nlb="' + bad[0] + '"]');
    if(first){ first.focus(); if(first.scrollIntoView) first.scrollIntoView({ block:'center' }); }
    return bad.length === 0;
  }
  /* ⚠️ No longer gates the button — the button is always live. Kept as the hook the
     step calls after a re-render so an error already on screen is not left stale. */
  function syncPayBtn(){
    var b = $('#nlPayNow'); if(b) b.disabled = false;
  }
  function renderBilling(){
    var t = tier();
    var rows = '';
    deltas().forEach(function(c){
      var left = c.unit ? (c.t + ' × ' + money(c.unit)) : c.t;
      rows += '<div class="am-sumrow"><span>' + left + '</span><span>' + money(c.amt) + '</span></div>';
    });
    $('#nlStepBill').innerHTML =
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
      +   (needsLegal() ? legalBlockHTML() : '')
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
    ['capacity', 'addons', 'review', 'billing'].forEach(function(k){
      var step = $(STEP_NODE[k]); if(!step) return;
      var right = $('.fs-right', step); if(!right) return;
      right.classList.remove('pinned');
      step.classList.remove('haspin');
      if(!phone || step.hidden) return;
      /* Each step says what it is — a switch, not a boolean.
         ⚠️ Payment & Billing NEVER pins: this REVERSES the earlier instruction to pin
         it. Its content is a long form, and a bar carrying the total plus `Subscribe`
         over a keyboard-driven form competes with the field being typed in.
         ⚠️ Testing by position was the old bug (`n !== 3`, then `n === 2`, and billing
         still fell into the measurement branch and got pinned anyway). Keys cannot
         drift like that — a step is named, so its rule is named too. */
      var pin;
      if(k === 'capacity' || k === 'addons') pin = true;   // always: the total is the point
      else if(k === 'billing') pin = false;                // never: it is a form
      else {                                               // review: measured, once, un-pinned
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
  /* ⚠️ `resize` alone is not enough. The review-step decision depends on the height of
     the scroll box, and that box can change without a window resize — an on-screen
     keyboard, a URL bar collapsing, or a devtools/harness viewport change that
     never dispatches the event (observed). A ResizeObserver on the box itself fires
     for all of them.
     No feedback loop: pinning takes the bar out of the CONTENT's flow, and #nlBody's
     own height comes from the sheet, so observing it cannot retrigger itself. */
  if(window.ResizeObserver && body){
    new ResizeObserver(function(){ syncPinnedSummary(); }).observe(body);
  }

  /* ⚠️ Takes a KEY and validates it against the current list: a step that does not
     exist in this mode (billing on a free plan, add-ons on TBMQ) falls back to the
     first one rather than hiding every node and showing an empty modal. */
  function focusLegal(){
    var c = $('#nlLegal');
    if(c){ c.focus(); if(c.scrollIntoView) c.scrollIntoView({ block:'nearest' }); }
  }
  function gotoStep(k){
    var list = steps();
    if(list.indexOf(k) < 0) k = list[0];
    st.step = k;
    if(k === 'pick') renderStepPick();
    else if(k === 'capacity') renderCapacity();
    else if(k === 'addons') renderAddons();
    else if(k === 'review') renderReview();
    else if(k === 'billing') renderBilling();
    Object.keys(STEP_NODE).forEach(function(key){
      var el = $(STEP_NODE[key]); if(el) el.hidden = key !== k;
    });
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
      /* the address too: it is what the invoice for this very purchase prints.
         ⚠️ COMPANY AND PHONE ARE PART OF IT NOW. This step has always asked for a
         company name — it is a required field, and the label says it should appear on
         the invoice — and this write has always thrown it away. That was survivable
         only while the invoice read its company from Account's own form; once company
         details consolidated onto Billing (see billing.html), the discarded value
         became the printed one. Measured before the fix: an account that typed
         "Acme IoT" got an invoice billed to "ThingsBoard" at its own Austin address —
         the demo's fallback, under a real buyer's street. */
      Store.set('billingAddress', { company:bill.company, descr:'', email:bill.email,
                                    phone:bill.phone, country:bill.country, state:bill.state,
                                    city:bill.city, zip:bill.zip, addr:bill.addr, addr2:bill.addr2 });
    }
    var t = tier(), e = extras(), tot = Math.max(0, total() - discount());
    var seq = storeNextSeq();          // persisted, so ids stay unique across reloads
    var lic = { id:'N' + seq, tier:t,
      product: st.product === 'tbmq' ? 'TBMQ' : 'ThingsBoard',
      type: isPerp() ? 'Perpetual' : 'Subscription',
      name: NAME[t] || st.plan,
      label:'', created:todayStr(), status:'active',
      /* a perpetual's updates term runs a year; a subscription renews in a month */
      event: isPerp() ? dayStr(365) : dayStr(30),
      /* a free plan carries the word, not a figure: every surface that prints a price
         reads this string, and "$0.00 / mo" would put a transaction on all of them */
      price: isFree() ? 'Free' : (isPerp() ? 'one-time' : (money(tot) + ' / mo')),
      billing: isFree() ? 'none' : (isPerp() ? 'paid' : 'auto-pay') };
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
    /* ⚠️ …and NOT for a free plan. There is no charge, so an invoice for $0.00 would be
       a receipt for a payment that never happened — the opposite of the fix above. */
    if(!isFree()) storeAddInvoice(lic, money(tot), { payment:'Card', auto:!isPerp() });
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
    /* ⚠️ THE DEFERRAL BRANCH IS GONE. A shrinking change used to be RECORDED against a
       future date and applied later; it now takes effect here with everything else, and
       there is no second path through this function. What went with it: the scheduled
       record, the banner in the Plan block that stated it, and the action that cancelled
       it — a change that happens immediately cannot be cancelled, only changed again.
       Growth and shrink now differ in one place only: what is due today (see renderReview). */
    // add-ons keeps the plan: only the entitlements and the price move
    var summary = isAddons() ? changeSummary() : null;
    /* ⚠️ Captured BEFORE the licence is mutated: `modDelta()` reads `oldMonthly()`,
       which on an add-ons flow is computed from the licence's own current state. */
    var charged = modDelta() * (isPerp() ? 1 : prorateFraction());
    lic.tier = t;
    lic.name = NAME[t] || st.plan;
    /* ⚠️ A perpetual has no monthly price, and writing one made its row read
       "$6,998.00 / mo" after a capacity purchase. It keeps `one-time`. */
    if(!isPerp()) lic.price = money(total()) + ' / mo';
    var x = {};
    /* ⚠️ On a perpetual, devices bought THROUGH INSTANCES have to land in `extras` too,
       or the Plan table keeps showing the plan's own 5,000 while the confirmation
       banner says "Devices 5,000 → 10,000". `extras()` measures against what the
       CURRENT instance count includes, which is exactly the amount that disappears.
       Measured against the plan's base instead, the table and the banner agree. */
    if(isPerpTB()){
      var devBase = PERP_DEV_PER_INSTANCE;               // what the plan itself carries
      var devTotal = Math.max(devBase, cust.devices || 0);
      if(devTotal > devBase) x.devices = String(devTotal - devBase);
    }
    else if(e.devices > 0) x.devices = String(e.devices);
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
    /* ⚠️ EVERY CHARGE PRODUCES AN INVOICE, not just a first purchase. A $93.33
       proration on an upgrade and a $1,999 one-time capacity purchase both went
       through with no document anywhere — the Invoices count did not move. The rule
       is now the charge, not the kind of flow that made it: if money is taken, there
       is a receipt, on the Invoices page and on this licence's own Invoices tab.
       ⚠️ Zero is not a charge, and that case is now REACHED rather than returned early:
       a lowering change used to be deferred and left this function before here. It
       applies immediately now, falls through to this line, and writes no invoice —
       which is right, because nothing was taken. Whether the difference is owed BACK is
       a policy question the repository does not answer; see NOTES. */
    if(charged > 0) storeAddInvoice(lic, money(charged), { payment:'Card', auto:false });
    st.dirty = false;
    scr.hidden = true;
    /* ⚠️ No success modal and NO PANEL BANNER either: what just happened is an action
       result, so it goes to the snackbar. It used to write `justChanged` and render a
       bar inside the licence panel, which meant one action could put a message there
       AND leave the state banner below the header — two messages, two places, one
       event. The panel keeps state; results leave on their own. */
    /* ⚠️ The two modes need different sentences. Add-ons changed quantities, so it
       names them; change-plan moved the licence between plans, and `changeSummary()`
       there falls back to its own "License updated." — prefixing that produced
       "License updated. License updated." Measured, not theorised. */
    Snack.show(isAddons()
      ? ('License updated. ' + (summary || changeSummary()))
      : ('Plan changed from ' + st.oldName + ' to ' + (NAME[t] || st.plan)));
    // the details may already be open underneath (Change plan from inside them) —
    // restate them in place; otherwise open them the one way there is
    if(window.LicenseDetails && LicenseDetails.isOpen()){ LicenseDetails.reopen(lic); return; }
    openLicenseDetails(lic, null, { refreshHost:true });
  }
  /* ⚠️ The two halves are separate spans so the PREFIX can be dropped, not the name.
     `.fs-maintitle` ellipsizes at the end, so `Manage add-ons · ThingsBoard PE
     Perpetual License` came out as `Manage add-ons · ThingsBoar…` on a phone — the
     flow name survived in full and the licence being edited, the one thing you cannot
     work out from anywhere else on the screen, was the part that got cut.
     The flow is already named by the step line ("Step 1 of 2 · Customize") and by the
     commit button, so it is the half that can afford to go. */
  function setWizardTitle(flow, product, licName){
    var el = $('#nlTitle'); if(!el) return;
    el.innerHTML = licName
      ? '<span class="nl-titleflow">' + esc(flow) + ' &middot; </span>'
        + '<span class="nl-titleprod">' + esc(product) + ' </span>'
        + '<span class="nl-titlelic">' + esc(licName) + '</span>'
      : esc(flow);
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
    /* the host may hand a product in (a card picked on the landing page carries one);
       otherwise the flow opens on the product the session arrived for */
    st.product = opts.product || arrivedProduct();
    st.plan = opts.plan || null;
    /* ⚠️ Reset on every open, not only when asked for. `st` outlives one flow — the
       controller is a singleton — so a wizard opened once from the landing hand-off
       would keep the shortened progress line for every later purchase from the
       "Buy a license" button, which DOES have a picker. */
    st.noPicker = !!(opts.skipPicker && opts.plan);
    /* the coupon belongs to ONE order — `st` outlives a flow, so a code applied to a
       previous purchase must not be sitting on the next one's Review step */
    st.coupon = null; st.couponOpen = false; st.couponErr = null; st.couponDraft = '';
    /* consent belongs to ONE order: `st` outlives a flow, and a box ticked for a
       previous purchase must not arrive pre-agreed on the next one */
    st.legalOk = false; st.legalErr = null;
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
      setWizardTitle('Manage add-ons', al.product, al.name);
      /* ⚠️ `gotoStep(2)` here was left behind by the move to step KEYS and would have
         opened an empty modal: 2 is not in the list, so every node hid itself. Add-ons
         has no picker, so its first step is simply the first of its own list. */
      gotoStep(steps()[0]);
    } else if(st.mode === 'change' && st.changeLic){
      // change-plan mode: Product and Billing are locked to the licence, and the
      // chooser opens with the current plan marked as such
      var cl = st.changeLic;
      st.kind = 'subscription';
      st.product = cl.product === 'TBMQ' ? 'tbmq' : 'thingsboard';
      st.plan = null;
      st.oldTier = cl.tier; st.oldName = cl.name;
      /* ⚠️ THE BASELINE WAS NEVER CAPTURED HERE — only Manage add-ons set it, so
         `shrinks()` returned false for every plan change and the Review step said
         nothing at all about a downgrade. Invisible while a downgrade was silently
         deferred; not invisible now that the step has to state what is being given up. */
      st.baseCust = licenseCust(cl, cl.tier);
      st.dirty = false;
      // same rule as above: flow · licence, never the label
      setWizardTitle('Change plan', cl.product || 'ThingsBoard', cl.name);
      gotoStep('pick');
    } else {
      // the billing type is chosen inside step 1 now, so the title stays neutral
      setWizardTitle('New license', '', '');
      // a preselected plan (picked on the landing page) skips the picker it already answered
      gotoStep(opts.startStep && st.plan ? (steps()[0] === 'pick' ? steps()[1] : steps()[0]) : 'pick');
    }
    scr.hidden = false;
    $('#nlClose').focus();
  }

  /* ---- events (step content re-renders, so everything is delegated) ---- */
  // the step header is re-rendered on every step, so delegate its back button
  $('#nlStepbar').addEventListener('click', function(e){
    if(e.target.closest('#nlStepBack') && !isFirstStep()) gotoStep(stepAt(-1));
  });

  body.addEventListener('click', function(e){
    /* the picker reads itself (shared with the landing page); this host decides what
       its two outcomes mean here — narrow the offer, or take the plan and advance */
    if(st.step === 'pick'){
      var what = planPickerClick(e, st);
      if(what === 'changed'){ seededTier = null; renderStepPick(); return; }
      /* ⚠️ `stepAt(1)` and not a fixed step: a paid plan lands on Capacity, a free one
         has no Capacity step and lands on Review. */
      if(what === 'picked'){ st.dirty = true; gotoStep(stepAt(1)); return; }
    }
    // every step acts from the card that carries its total
    if(e.target.closest('[data-nlnext]')){ if(!isLastStep()) gotoStep(stepAt(1)); return; }
    var commit = e.target.closest('#nlCommit');
    if(commit){
      if(!isLastStep()){ gotoStep(stepAt(1)); return; }   // the billing step is next
      if(legalBlocked()){ renderReview(); focusLegal(); return; }
      startPurchase(commit);                              // billing data on file: commit here
      return;
    }
    var payNow = e.target.closest('#nlPayNow');
    /* ⚠️ The click is always accepted. It used to be gated by `disabled`, which meant
       a rejected order produced nothing at all — no message, no focus, no reason.
       Now the submit answers: either it starts, or it paints every failure and puts
       the cursor in the first one. */
    if(payNow){
      /* ⚠️ Both answers at once, not one and then the other: a reader who has neither
         ticked the box nor filled the form should not fix the form, press again, and
         only then learn about the box. */
      var legalBad = legalBlocked();
      var billOk = showAllBillErrors();
      if(legalBad){ renderBilling(); focusLegal(); return; }
      if(billOk) startPurchase(payNow);
      return;
    }
    var sb = e.target.closest('#nlStepCap .stepper button');
    if(sb){
      var f = sb.closest('.stepper').getAttribute('data-nl-field');
      var min = f === 'dev' ? 0 : ((INCL[tier()] || {})[f] || 0);
      var was = cust[f];
      cust[f] = Math.max(min, Math.min(MAXQ[f], cust[f] + parseInt(sb.getAttribute('data-dir'), 10)));
      /* ⚠️ THE LINKAGE. On a perpetual each production instance carries 5,000 devices,
         so moving the stepper moves the device total with it — by the SAME delta, which
         is what preserves anything typed on top. Add an instance to a licence set to
         5,050 and you get 10,050, not 10,000: the 50 extra was a separate decision and
         is not silently dropped. Clamped at the floor so the total can never fall below
         what the remaining instances include. */
      if(isPerpTB() && f === 'prod' && cust[f] !== was){
        cust.devices = Math.max(devicesIncluded(),
          (cust.devices || 0) + PERP_DEV_PER_INSTANCE * (cust[f] - was));
      }
      st.dirty = true; renderCapacity(); syncPinnedSummary(); return;
    }
    /* ---- coupon: open · apply · cancel · remove, all on the one row ----
       ⚠️ The shared `Coupon` DIALOG is no longer used here. It still serves the licence
       surface, where a coupon is applied against a licence rather than inside an order
       being read — there the dialog is the whole interaction, here it would interrupt
       one. One row, three states (see couponRowHTML). */
    if(e.target.closest('[data-couponopen]')){
      st.couponOpen = true; st.couponErr = null;
      st.couponDraft = st.coupon ? st.coupon.code : '';
      renderReview();
      var inp = $('#nlCouponInput'); if(inp){ inp.focus(); inp.select(); }
      return;
    }
    if(e.target.closest('[data-couponcancel]')){
      st.couponOpen = false; st.couponErr = null; renderReview(); return;
    }
    if(e.target.closest('[data-couponremove]')){
      var was = st.coupon && st.coupon.code;
      st.coupon = null; st.couponOpen = false; st.couponErr = null;
      st.dirty = true; renderReview();
      Snack.show('Coupon ' + (was || '') + ' removed');
      return;
    }
    if(e.target.closest('[data-couponapply]')){
      var field = $('#nlCouponInput');
      var code = String(field ? field.value : '').trim();
      st.couponDraft = code;
      var err = couponError(code);
      if(err){
        /* the error lands ON the field and the row stays open — nothing is announced
           elsewhere, because nothing has finished happening */
        st.couponErr = err; renderReview();
        var bad = $('#nlCouponInput'); if(bad) bad.focus();
        return;
      }
      var changing = !!st.coupon;
      st.coupon = { code:code.toUpperCase(), rate:COUPON_RATE };
      st.couponOpen = false; st.couponErr = null; st.dirty = true;
      renderReview();
      Snack.show('Coupon ' + st.coupon.code + (changing ? ' applied instead' : ' applied'));
      return;
    }
    if(e.target.closest('#nlPayChange')){ attemptClose(function(){ location.href = 'billing.html'; }); }
  });
  body.addEventListener('change', function(e){
    var legal = e.target.closest('#nlLegal');
    if(legal){
      st.legalOk = legal.checked;
      /* the error answers the moment it is answered — it does not wait for another
         press to clear itself */
      if(st.legalOk && st.legalErr){
        st.legalErr = null;
        if(st.step === 'billing') renderBilling(); else renderReview();
      }
      return;
    }
    var cb = e.target.closest('input[data-nl-addon]');
    if(cb){ cust[cb.getAttribute('data-nl-addon')] = cb.checked; st.dirty = true; renderAddons(); syncPinnedSummary(); return; }
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
    var f = e.target.closest('#nlStepBill [data-nlb]');
    if(!f) return;
    var n = f.getAttribute('data-nlb');
    if(BILL_RULES[n]) paintBillField(n, billError(n));
  });
  body.addEventListener('input', function(e){
    var f = e.target.closest('#nlStepBill [data-nlb]');
    if(!f) return;
    var n = f.getAttribute('data-nlb');
    var slot = $('#nlStepBill [data-nlb-err="' + n + '"]');
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
      var err = $('#nlStepCap [data-nl-err="' + field + '"]');
      if(err) err.hidden = !bad;
      num.classList.toggle('is-bad', bad);
      /* the forward button of the step the field is ON — scoped, because Capacity and
         Add-ons each render one and a document-wide lookup would disable the wrong one */
      var next = $('#nlStepCap [data-nlnext]');
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
    if(!(n >= min)) return;                 // an invalid value stays put, with its error
    num.value = n.toLocaleString('en-US');
    /* ⚠️ The perpetual device description is composed from the value ("5,000 included
       + 50 extra"), so it has to be rebuilt once the number settles. Deliberately on
       FOCUSOUT, not on input: re-rendering the step mid-number throws the caret away,
       which is the whole reason typing only refreshes the summary. */
    if(isPerpTB() && num.getAttribute('data-nl-num') === 'devices'){ renderCapacity(); syncPinnedSummary(); }
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
    var panel = $('#nlStepBill');
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
    renderBilling();
    clearBillErrors();
  }

  return { open: open, openChange: function(lic){ open({ mode:'change', license: lic }); },
           fillDemoBilling: fillDemoBilling,
           // the settings panel switches the Customize variant while it is open
           refreshCustomize: function(){ if(scr.hidden) return;
             if(st.step === 'capacity'){ renderCapacity(); syncPinnedSummary(); }
             else if(st.step === 'addons'){ renderAddons(); syncPinnedSummary(); } },
           // the billing-data setting changes the step count under an open wizard
           refreshOpen: function(){
             if(scr.hidden) return;
             /* the step list can shrink under an open wizard (billing data saved on
                another tab, a free plan chosen): gotoStep validates the key itself */
             gotoStep(st.step);
           } };
})();


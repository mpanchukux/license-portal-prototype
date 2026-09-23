/* ============================================================================
   data.js — every mock dataset the prototype renders from. Pure data, no DOM:
   loaded first on every page, read through DATA() (see shared.js) so the chosen
   dashboard variant decides which account is on screen.
   ============================================================================ */

/* ============================================================================
   DATES — authored around Aug 19 2026, rendered relative to TODAY
   ============================================================================
   ⚠️ REVERSES the pinned-today decision this prototype was built on. Every date
   below is still written as a literal around Aug 19 2026, because their SPACING is
   hand-tuned — a renewal fourteen days out, updates expiring next week, an invoice
   paid last month — and that spacing is the thing the demo is showing. What changed
   is that the whole set is SHIFTED to today at seed time (see shiftDemoDates), so a
   licence created a minute ago no longer says "Aug 19, 2026" while the clock says
   otherwise. Relative relationships are preserved exactly; only the anchor moves.

   The reason it mattered: dates that disagree with the clock cost the reader trust in
   every other number on the screen, not just the date.
   ========================================================================== */
var MONF = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
var MONN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// exact day count (Howard Hinnant's days-from-civil)
function epochDay(y, m, d){
  y -= (m <= 2) ? 1 : 0;
  var era = Math.floor((y >= 0 ? y : y - 399) / 400), yoe = y - era * 400;
  var doy = Math.floor((153 * ((m > 2 ? m - 3 : m + 9)) + 2) / 5) + d - 1;
  var doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}
// and back again (civil-from-days), so an offset can be turned into a date string
function dayToDate(z){
  z += 719468;
  var era = Math.floor((z >= 0 ? z : z - 146096) / 146097), doe = z - era * 146097;
  var yoe = Math.floor((doe - Math.floor(doe/1460) + Math.floor(doe/36524) - Math.floor(doe/146096)) / 365);
  var y = yoe + era * 400, doy = doe - (365*yoe + Math.floor(yoe/4) - Math.floor(yoe/100));
  var mp = Math.floor((5*doy + 2) / 153), d = doy - Math.floor((153*mp + 2)/5) + 1;
  var m = mp + (mp < 10 ? 3 : -9);
  if(m <= 2) y += 1;
  return MONN[m-1] + ' ' + (d < 10 ? '0' + d : d) + ' ' + y;
}
/* TODAY is the real one now. `nowDay()` reads the clock ONCE per page load — a
   value that changes under a render would put two dates on one screen that disagree. */
var TODAY_DAY = (function(){
  var d = new Date();
  return epochDay(d.getFullYear(), d.getMonth() + 1, d.getDate());
})();
function todayStr(){ return dayToDate(TODAY_DAY); }
/* "Mon DD YYYY" → epoch day, so a stored date can be used in day ARITHMETIC.
   ⚠️ Not `dateKey`: that packs a date into YYYYMMDD for COMPARING and sorting, and the
   number it returns is not a count of days — adding 365 to it lands in the wrong year.
   Two jobs, two functions. */
function dayOf(dateStr){
  var q = String(dateStr).split(' ');
  if(q.length !== 3 || !MONF[q[0]]) return null;
  return epochDay(+q[2], MONF[q[0]], +q[1]);
}
function dayStr(offset){ return dayToDate(TODAY_DAY + offset); }
/* The anchor the literals below were written around. The delta between it and today
   is applied to every date in the seed, once, when the store first snapshots it. */
var SEED_ANCHOR_DAY = epochDay(2026, 8, 19);
var DATE_RE = /^([A-Z][a-z]{2}) (\d{1,2}) (\d{4})(, \d{2}:\d{2})?$/;
/* Walks any structure and rewrites every date-shaped string by `delta` days. Both
   shapes the data uses are covered: "Aug 19 2026" and "Aug 17 2026, 16:20". A value
   that is not a date is left exactly as it is — the grant's empty `event`, prices,
   ids, labels. */
function shiftDemoDates(node, delta){
  if(!delta) return node;
  if(typeof node === 'string'){
    var m = DATE_RE.exec(node);
    if(!m) return node;
    var day = epochDay(+m[3], MONF[m[1]] || 1, +m[2]) + delta;
    return dayToDate(day) + (m[4] || '');
  }
  if(Array.isArray(node)){
    for(var i = 0; i < node.length; i++) node[i] = shiftDemoDates(node[i], delta);
    return node;
  }
  if(node && typeof node === 'object'){
    Object.keys(node).forEach(function(k){ node[k] = shiftDemoDates(node[k], delta); });
    return node;
  }
  return node;
}

/* ---------- the licence key ---------------------------------------------------
   ⚠️ EVERY LICENCE USED TO SHOW THE SAME KEY. It was one literal in DETAILS_HTML
   (`d41d-8cd9-…-3f2a`), so a demo with fifteen licences had fifteen copies of one
   secret — and because the reveal was global too (see wireDetailsOnce), opening one
   licence and revealing it left that same string legible on every other licence for
   the rest of the session.

   Derived, not stored: a key is an identifier, not a product decision, so a table of
   fifteen literals would be fifteen things to keep unique by hand. `licenseKeyFor`
   hashes the licence id into a stable, unique, plausible-looking key — same licence,
   same key, across reloads and across the shifted seed.
   ⚠️ Deterministic on purpose. A random key would change under the reader between one
   render and the next, which is exactly the kind of thing that makes a demo look
   broken when it is only being careless. */
function licenseKeyFor(lic){
  var id = String((lic && lic.id) || 'x');
  var h = 2166136261;                                   // FNV-1a, enough for a mock
  for(var i = 0; i < id.length; i++){ h ^= id.charCodeAt(i); h = (h * 16777619) >>> 0; }
  var g = [], n = h;
  for(var k = 0; k < 6; k++){
    n = (n * 1664525 + 1013904223) >>> 0;               // LCG, so the groups differ
    g.push(('000' + (n & 0xffff).toString(16)).slice(-4));
  }
  return g.join('-');
}
function licenseKeyMask(key){
  var tail = String(key).slice(-4);
  return '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' + tail;
}

/* ---------- instance check-ins as ACTIVITY --------------------------------------
   The licence checks in every hour, and every check is logged. That is ~24 entries per
   instance per day — a demo account with nineteen instances produces roughly four
   hundred a day — which is exactly why the Activity page needs grouping and a type
   filter, and why these are DERIVED rather than stored.

   ⚠️ DERIVED, NOT SEEDED. Writing hundreds of rows into the store per day would bloat
   it, go stale the moment the clock moved, and make "reset demo data" a different demo
   every time. They are computed from what the instance already carries — when it last
   reported (`agoMin`) and its id — so the same account always produces the same history
   and it is always relative to now.

   ⚠️ WHAT A FAILURE CAN SAY, and nothing more. Three causes are expressible from the
   data this prototype actually has; everything else a real portal would report (bad
   credentials, a version the licence does not cover, a quota refusal) has nothing
   behind it here and is NOT invented. See NOTES for the list. */
var CHECK_WINDOW_DAYS = 3;           // how far back the derived history runs
var CHECK_FAIL = {
  unreachable:  'the portal could not reach the instance',
  connection:   'the connection failed',
  blocked:      'the license is blocked — running instances exceed the plan'
};
/* A stable pseudo-random from a string: the same instance always fails at the same
   hours, so the demo does not reshuffle itself between two screenshots. */
function checkHash(str, n){
  var h = 2166136261;
  for(var i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return (h + n * 2654435761) >>> 0;
}
/* Every check for one instance, newest first, over the window. */
function instanceChecks(lic, inst){
  var out = [];
  var hours = CHECK_WINDOW_DAYS * 24;
  var blocked = instOverLimit(lic);
  for(var h = 0; h < hours; h++){
    var minsAgo = (inst.agoMin || 0) + h * 60;
    if(minsAgo > hours * 60) break;
    var r = checkHash(inst.id, h) % 100;
    /* ⚠️ A BLOCKED LICENCE FAILS EVERY CHECK, and that is not decoration: it is what
       "blocked until the count is back within its limit" MEANS, and the log is where a
       person would go to see it happening. */
    var why = blocked ? 'blocked' : (r < 3 ? 'unreachable' : (r < 5 ? 'connection' : null));
    out.push({ kind: why ? 'check_fail' : 'check_ok',
      ts: agoStamp(minsAgo), tsMin: minsAgo,
      entityType:'Instance', entityName: inst.label || inst.id,
      instId: inst.id, licId: lic.id, licName: lic.label || lic.name,
      actor:'System', action: why ? 'CHECK_FAILED' : 'CHECK_OK', why: why || null });
  }
  return out;
}
/* Every check across the account, and the per-licence slice of the same thing. */
function allChecks(licId){
  var out = [];
  (DATA().licenses || []).forEach(function(l){
    if(licId && l.id !== licId) return;
    (l.instances || []).forEach(function(i){ out = out.concat(instanceChecks(l, i)); });
  });
  return out;
}

/* ---------- product versions ---------------------------------------------------
   ⚠️ BOTH OF THESE ARE `inferred`. Nothing in this repository carried a version number
   of any kind before this pass — not a running one, not a released one — so the
   figures below are demo values, not facts about the product. What is real is the
   SHAPE: an instance reports its version when it checks in, so the running version is
   a property of an INSTANCE, and a licence shows the lowest of its instances (see
   licenseVersion) because the question "am I current" is answered by the laggard.

   ⚠️ ONE number stands for both products. TBMQ versions independently of ThingsBoard
   in reality; a second constant is one line when someone confirms the real pair. */
var LATEST_VERSION = '3.9.4';   // inferred

/* ---------- production instances: check-in ------------------------------------
   ⚠️ CORRECTED: the licence checks in EVERY HOUR. It was 24 here — a figure given
   verbally for an earlier pass and flagged in NOTES as unconfirmed — and everything
   derived from it (the stale threshold, the Instances note, the detach confirmation)
   read the wrong cadence. One constant, so there is one place to be wrong. */
var CHECKIN_INTERVAL_H = 1;
/* ⚠️ STALE IS A MULTIPLE OF THE INTERVAL, NOT THE INTERVAL ITSELF — and at one hour
   this stops being a nicety. The earlier pass set the threshold equal to the interval
   because the instruction was explicit, and noted the cost: a healthy deployment that
   reports every N hours is routinely almost N hours old and sits one slow report from
   being accused. At 24h that was a narrow edge. At 1h it is the normal case — one
   missed report, a slow restart, a clock a few minutes out, and a perfectly healthy
   instance reads Stale. 2× is the usual defence and it is what is applied here.
   If the product wants "stale after exactly one missed check-in", set the multiple
   to 1 — the rule is one line and both numbers are named. */
var CHECKIN_STALE_MULT = 2;
function checkinStaleAfterH(){ return CHECKIN_INTERVAL_H * CHECKIN_STALE_MULT; }

/* Hours between a "Mon DD YYYY, HH:MM" stamp and now. Built on the same epochDay the
   date shifting uses, so a shifted seed measures correctly without re-parsing. */
function hoursSince(ts){
  var q = String(ts).split(', '), d = String(q[0]).split(' ');
  if(d.length !== 3 || !MONF[d[0]]) return null;
  var hm = String(q[1] || '00:00').split(':');
  var then = epochDay(+d[2], MONF[d[0]], +d[1]) * 24 + (+hm[0]) + (+hm[1]) / 60;
  var now = new Date();
  return (TODAY_DAY * 24 + now.getHours() + now.getMinutes() / 60) - then;
}
/* ---------- demo check-in stamps are RELATIVE, and they have to be ---------------
   ⚠️ The demo used to carry literal stamps ("Aug 19 2026, 07:41") shifted to today by
   whole days. That worked while the threshold was 24 hours: any time today was inside
   it. At an hourly cadence it breaks completely — a stamp of 07:41 is stale by 10:00,
   so every healthy instance in the demo would read Stale for most of the day, and the
   whole Instances view would be a screen of red herrings.
   So an instance stores `agoMin` — how long ago it last reported — and the stamp is
   DERIVED from the clock each time the demo is loaded. A healthy instance is always
   minutes old and a stale one is always days old, whenever anyone opens the page. */
function agoStamp(min){
  var d = new Date(Date.now() - min * 60000);
  return dayToDate(epochDay(d.getFullYear(), d.getMonth() + 1, d.getDate()))
    + ', ' + (d.getHours() < 10 ? '0' : '') + d.getHours()
    + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
}
/* Re-stamps every instance that carries `agoMin`. Runs against the STORED datasets at
   boot, after the one-time date shift, so it wins over whatever was snapshotted. */
function refreshCheckins(ds){
  Object.keys(ds || {}).forEach(function(k){
    (ds[k].licenses || []).forEach(function(l){
      (l.instances || []).forEach(function(i){
        if(i.agoMin != null) i.seen = agoStamp(i.agoMin);
      });
    });
  });
  return ds;
}
/* The one rule the Instances column is derived from. Unknown stamp → not stale:
   an instance is never accused of being stale because its date failed to parse. */
function instStale(inst){
  var h = hoursSince(inst && inst.seen);
  return h != null && h > checkinStaleAfterH();
}
/* How many production instances a licence is ALLOWED: what the plan includes plus
   whatever was purchased on top. One reading, used by the details banner, the Plan
   table and the Home attention list, so they cannot disagree. */
function instAllowed(lic){
  if(!lic) return 0;
  var spec = TIER_SPECS[lic.tier] || { ent:[] }, base = 0;
  spec.ent.forEach(function(e){
    if(e[0] === 'Production instances') base = parseInt(String(e[1]).replace(/,/g, ''), 10) || 0;
  });
  var extra = lic.extras && lic.extras.prod ? (parseInt(lic.extras.prod, 10) || 0) : 0;
  return base + extra;
}
function instancesOf(lic, type){
  var all = (lic && lic.instances) || [];
  return type ? all.filter(function(i){ return (i.type || 'prod') === type; }) : all;
}
function instRunning(lic){ return instancesOf(lic, 'prod').length; }
/* The version a licence is RUNNING: the lowest across its production instances.
   ⚠️ Lowest, not highest, and not a list. The column answers "am I current", and that
   is governed by the instance furthest behind — a maximum would hide exactly the
   deployment that still needs upgrading. Where instances disagree the count says so
   (see versionCell), rather than printing a number that is true of only one of them.
   A licence with no instances has no running version at all: nothing has reported. */
function licenseVersion(lic){
  var vs = instancesOf(lic, 'prod').map(function(i){ return i.version; }).filter(Boolean);
  if(!vs.length) return null;
  return vs.slice().sort(cmpVersion)[0];
}
/* numeric, part by part — "3.10.0" is ABOVE "3.9.4", which a string compare gets wrong */
function cmpVersion(a, b){
  var x = String(a).split('.'), y = String(b).split('.');
  for(var i = 0; i < Math.max(x.length, y.length); i++){
    var d = (parseInt(x[i], 10) || 0) - (parseInt(y[i], 10) || 0);
    if(d) return d;
  }
  return 0;
}
function versionBehind(lic){
  var v = licenseVersion(lic);
  return v != null && cmpVersion(v, LATEST_VERSION) < 0;
}
/* how many production instances do NOT agree with the licence's reported version */
function versionMixed(lic){
  var v = licenseVersion(lic);
  if(v == null) return false;
  return instancesOf(lic, 'prod').some(function(i){ return i.version !== v; });
}
/* ⚠️ Devices have NO over-limit state and must never be given one: the platform
   refuses connections beyond what the licence allows, so the number on screen is a
   ceiling, not a count that can be exceeded. Instances are the opposite — the portal
   is what checks, so it is the portal that has to say when the count is too high. */
function instOverLimit(lic){
  var allowed = instAllowed(lic);
  return allowed > 0 && instRunning(lic) > allowed;
}

/* ---------- boolean entitlements shown as chips on licence details ---------- */
var FEATURES = [
  { key:'whitelabel', label:'White labeling' },
  { key:'edge',       label:'Edge Computing' },
  { key:'trendz',     label:'Trendz Analytics' },
  /* Bought in the wizard's add-ons block, perpetual only. ⚠️ Not the old "Offline"
     licence TYPE that the content audit removed — that was a billing kind; this is a
     capability the licence can carry. */
  { key:'offline',    label:'Offline Mode' }
];

/* ---------- the account's payment method ----------
   One card, one place. Every surface that shows the card itself renders from
   this (see paymentMethodHTML): Payment method on Payment & Billing, the Next
   charge card on licence details, the styleguide specimen. Prose mentions of
   "Visa ••4242" (activity feed, invoice mock, wizard) are sentences, not this. */
/* ⚠️ The expiry's WORD is its own span so the phone can drop it. Arithmetic: brand
   53 + number 118 + "Expires 12 / 2028" 109 + button 44 = 324 against a 330px
   content box, so with any gap at all the edit button wrapped to a second line.
   Without the word the expiry is ~55px and the row fits with room to spare. */
var PAYMENT_METHOD = { brand:'VISA', num:'•••• •••• •••• 4242',
  exp:'<span class="pc-expw">Expires </span>12 / 2028' };

/* ---------- per-tier specs: what a licence of each tier includes ---------- */
var TIER_SPECS = {
  maker:    { name:'Maker',     price:'$10.00',  wl:false, ent:[['Devices','10'],['Assets','10'],['Production instances','1'],['AI credits','1M','/ month']] },
  prototype:{ name:'Prototype', price:'$39.00',  wl:false, ent:[['Devices','50'],['Assets','50'],['Production instances','1'],['AI credits','2M','/ month']] },
  /* ⚠️ THE TWO FREE TIERS CARRY EXACTLY THE THREE NUMBERS THAT WERE GIVEN and no
     fourth. The paid tiers above and below also list Assets; these do not, because
     no Assets figure was stated for them and inventing one would put a number the
     product never approved on a card people read as a promise. Same for anything
     else the paid shape has — see the report: help desk, white labeling and the
     device-limit line are all absent on purpose, not by omission.
     `free:true` is what every surface tests: no price, no billing step, no total. */
  free:     { name:'Free',           price:'Free', free:true, wl:false, ent:[['Devices','100'],['Production instances','1'],['AI credits','1M','/ month']] },
  pilot:    { name:'Pilot',     price:'$99.00',  wl:true,  ent:[['Devices','100'],['Assets','100'],['Production instances','1'],['AI credits','4M','/ month']] },
  startup:  { name:'Startup',   price:'$299.00', wl:true,  ent:[['Devices','500'],['Assets','500'],['Production instances','2'],['AI credits','8M','/ month']] },
  business: { name:'Business',  price:'$499.00', wl:true,  ent:[['Devices','1,000'],['Assets','1,000'],['Production instances','3'],['AI credits','16M','/ month']] },
  tbmqsub:  { name:'PE subscription', price:'$15.00', wl:false, ent:[['Sessions','100'],['Messages / sec','100'],['Production instances','1']] },
  tbperp:   { name:'PE Perpetual License', price:'one-time', perp:true, wl:true, ent:[['Devices','5,000'],['Assets','5,000'],['Production instances','1'],['AI credits','5M','/ month']] },
  tbmqperp: { name:'PE license', price:'one-time', perp:true, wl:true, ent:[['Sessions','10,000'],['Messages / sec','1,000'],['Production instances','1']] },
  // Community Grant — free, no expiry, nothing recurring. perp:true puts it on the
  // perpetual-style details layout (no renewal, no next charge, no add-ons).
  grant:    { name:'Community Grant', price:'Free', perp:true, grant:true, wl:false, ent:[['Devices','6,050'],['Production instances','2']] }
};
var NAMED_TIER = { maker:'maker', prototype:'prototype', pilot:'pilot', startup:'startup', business:'business', perp:'tbperp', prototypeaddons:'prototype' };
var ENT_EXTRA_KEY = { 'Devices':'devices', 'Production instances':'prod', 'AI credits':'ai' };

/* ---------- dashboard density datasets: one consistent account per variant ---------- */
var DATASETS = {
  A: {
    licenses: [
      // a real-world label: it wraps to two lines in the Product column, next to the
      // short one below it — the case the Home block has to survive
      { id:'A1', tier:'prototype', product:'ThingsBoard', type:'Subscription', name:'Prototype',      label:'Central Europe manufacturing cluster — building 4, line 2', created:'Aug 10 2026', updated:'Aug 14 2026', status:'active', event:'Aug 28 2026', price:'$39.00 / mo', billing:'auto-pay' },
      { id:'A2', tier:'tbmqsub',   product:'TBMQ',        type:'Subscription', name:'PE subscription', label:'Broker',     created:'Jul 22 2026', updated:'Aug 03 2026', status:'active', event:'Sep 05 2026', price:'$15.00 / mo', billing:'auto-pay' },
      // bought two days ago and not named yet — the third label case (none at all),
      // so this account shows the same range the large one does
      { id:'A3', tier:'maker',     product:'ThingsBoard', type:'Subscription', name:'Maker',           label:'',           created:'Aug 17 2026', updated:'Aug 17 2026', status:'active', event:'Sep 17 2026', price:'$10.00 / mo', billing:'auto-pay' }
    ],
    users: [
      { name:'Mariia Panchuk', email:'mpanchuk@thingsboard.io', created:'Jul 17 2026' },
      { name:'A. Admin',       email:'a.admin@thingsboard.io',  created:'Jul 20 2026' }
    ],
    invoices: [
      // the purchase of A3 — a manual one, so no auto-charge icon
      { num:'NAWE49WG-0004', licId:'A3', date:'Aug 17 2026', amount:'$10.00', status:'Paid', payment:'Card',     auto:false },
      { num:'NAWE49WG-0003', licId:'A1', date:'Aug 03 2026', amount:'$39.00', status:'Paid', payment:'Auto-pay', auto:true  },
      { num:'NAWE49WG-0002', licId:'A2', date:'Jul 30 2026', amount:'$15.00', status:'Paid', payment:'Auto-pay', auto:true  },
      // the first charge of A2, on the day it was bought — also manual
      { num:'NAWE49WG-0001', licId:'A2', date:'Jul 22 2026', amount:'$15.00', status:'Paid', payment:'Card',     auto:false }
    ],
    activity: [
      { kind:'created', ts:'Aug 17 2026, 16:20', entityType:'Subscription', entityName:'Maker', actor:'mpanchuk@thingsboard.io', action:'ADDED',
        txt:'Subscription <b>Maker</b> was created by mpanchuk@thingsboard.io.' },
      { kind:'created', ts:'Aug 10 2026, 09:14', entityType:'Subscription', entityName:'Prototype', actor:'mpanchuk@thingsboard.io', action:'ADDED',
        txt:'Subscription <b>Prototype</b> was created by mpanchuk@thingsboard.io.' },
      { kind:'updated', ts:'Jul 28 2026, 15:02', entityType:'Payment method', entityName:'Visa ••4242', actor:'mpanchuk@thingsboard.io', action:'UPDATED',
        txt:'Payment method was added by mpanchuk@thingsboard.io.' },
      { kind:'info', ts:'Jul 22 2026, 11:41', entityType:'Invoice', entityName:'NAWE49WG-0001', actor:'mpanchuk@thingsboard.io', action:'PAID',
        txt:'Invoice <b>NAWE49WG-0001</b> was paid by mpanchuk@thingsboard.io.' },
      { kind:'created', ts:'Jul 22 2026, 11:40', entityType:'Subscription', entityName:'TBMQ PE', actor:'mpanchuk@thingsboard.io', action:'ADDED',
        txt:'Subscription <b>TBMQ PE</b> was created by mpanchuk@thingsboard.io.' }
    ]
  },
  B: {
    licenses: [
      /* ⚠️ Purchased extras and enabled add-ons live here on purpose: without one licence
         carrying them, the "+N" in the Purchased column, the delta pills on the phone and
         the whole removal path are states nothing in the demo can reach. */
      { id:'B1',  tier:'business', product:'ThingsBoard', type:'Subscription', name:'Business',  label:'Global',       created:'May 02 2026', updated:'Aug 12 2026', status:'active',         event:'Sep 13 2026', price:'$736.00 / mo', billing:'auto-pay',
        extras:{ devices:'500', prod:'1', ai:'4M' }, edge:true, trendz:true },
      { id:'B2',  tier:'startup',  product:'ThingsBoard', type:'Subscription', name:'Startup',   label:'Production',   created:'Jun 06 2026', updated:'Aug 02 2026', status:'active',         event:'Sep 20 2026', price:'$356.00 / mo', billing:'auto-pay',
        extras:{ devices:'200', prod:'1' }, edge:true },
      { id:'B3',  tier:'startup',  product:'ThingsBoard', type:'Subscription', name:'Startup',   label:'Factory A',    created:'Jun 20 2026', updated:'Aug 18 2026', status:'payment_failed', event:'Sep 02 2026', price:'$299.00 / mo', billing:'auto-pay' },
      { id:'B4',  tier:'pilot',    product:'ThingsBoard', type:'Subscription', name:'Pilot',     label:'EU pilot',     created:'Jul 01 2026', updated:'Aug 15 2026', status:'active',         event:'Sep 06 2026', price:'$111.00 / mo', billing:'auto-pay',
        extras:{ ai:'2M' } },
      { id:'B5',  tier:'prototype',product:'ThingsBoard', type:'Subscription', name:'Prototype', label:'Sandbox',      created:'Jul 10 2026', updated:'Jul 28 2026', status:'canceled',       event:'Sep 05 2026', price:'$39.00 / mo',  billing:'auto-pay' },
      { id:'B6',  tier:'maker',    product:'ThingsBoard', type:'Subscription', name:'Maker',     label:'',             created:'Jul 15 2026', updated:'Jul 15 2026', status:'active',         event:'Aug 30 2026', price:'$10.00 / mo',  billing:'auto-pay' },
      { id:'B7',  tier:'prototype',product:'ThingsBoard', type:'Subscription', name:'Prototype', label:'Demo',         created:'Jul 20 2026', updated:'Jul 30 2026', status:'active',         event:'Sep 03 2026', price:'$39.00 / mo',  billing:'auto-pay' },
      { id:'B8',  tier:'tbmqsub',  product:'TBMQ',        type:'Subscription', name:'PE subscription', label:'MQTT prod',    created:'Jun 30 2026', updated:'Jul 12 2026', status:'active',   event:'Sep 10 2026', price:'$15.00 / mo', billing:'auto-pay' },
      { id:'B9',  tier:'tbmqsub',  product:'TBMQ',        type:'Subscription', name:'PE subscription', label:'MQTT staging', created:'Jul 05 2026', updated:'Jul 05 2026', status:'active',   event:'Sep 10 2026', price:'$15.00 / mo', billing:'auto-pay' },
      { id:'B10', tier:'tbperp',   product:'ThingsBoard', type:'Perpetual',    name:'PE Perpetual License', label:'On-prem HQ',    created:'Jul 27 2026', updated:'Jul 27 2026', status:'active',           event:'Jul 27 2027', price:'one-time', billing:'paid' },
      { id:'B11', tier:'tbperp',   product:'ThingsBoard', type:'Perpetual',    name:'PE Perpetual License', label:'Plant B',       created:'Sep 01 2025', updated:'Aug 05 2026', status:'updates_expiring', event:'Sep 01 2026', price:'one-time', billing:'paid' },
      /* ⚠️ Its updates term is ~25 days out ON PURPOSE: it is the only licence in the
         demo that exercises the 30-day stage of the updates warning. The three stages
         are 30 / 14 / expired, and without one licence sitting in each the banner's
         escalation cannot be seen at all. */
      { id:'B12', tier:'tbmqperp', product:'TBMQ',        type:'Perpetual',    name:'PE license',           label:'Broker on-prem',created:'Aug 13 2026', updated:'Aug 13 2026', status:'active',           event:'Sep 13 2026', price:'one-time', billing:'paid' },
      // two deliberately long labels: real deployments name themselves like this,
      // and the Product column has to wrap them rather than stretch the table
      { id:'B13', tier:'business', product:'ThingsBoard', type:'Subscription', name:'Business',  label:'Production — Central Europe manufacturing cluster, building 4', created:'Feb 18 2026', updated:'Aug 04 2026', status:'active', event:'Aug 27 2026', price:'$499.00 / mo', billing:'auto-pay' },
      { id:'B14', tier:'pilot',    product:'ThingsBoard', type:'Subscription', name:'Pilot',     label:'Long-term evaluation environment for the Munich pilot',          created:'May 24 2026', updated:'Jun 02 2026', status:'active', event:'Sep 24 2026', price:'$99.00 / mo',  billing:'auto-pay' },
      /* ⚠️ The Community Grant completes the type coverage of this dataset: it was
         the only tier in TIER_SPECS with no row, and it carries the only status no
         other row exercises (`awaiting_checkin`). It has NO event date and NO price,
         which is exactly why it belongs here — every type-aware column and the phone
         card have to cope with both being absent. `grant:true` is what the renderers
         branch on; `limits` replaces the entitlement columns it has no numbers for. */
      /* ⚠️ THE EXPIRED-UPDATES LICENCE, and the demo had none. Its term ended twelve days
         ago, so it is what the alert icon in the list, the licence page's explanation
         and the expired stage of the Home banner are all demonstrated on. Its instance
         runs 3.7.2 against 3.9.4, which is the Product version column's whole argument:
         the gap is the reason to renew, stated as a number rather than a warning.
         ⚠️ `status:'active'` and NOT a stored "expired" status — the state is DERIVED
         from the date, the same way over-the-instance-limit is derived from a count.
         A stored flag can be forgotten on a licence; a comparison cannot. */
      { id:'B16', tier:'tbperp',   product:'ThingsBoard', type:'Perpetual',    name:'PE Perpetual License', label:'Warehouse DC',  created:'Aug 07 2024', updated:'Aug 07 2025', status:'active',           event:'Aug 07 2026', price:'one-time', billing:'paid' },
      { id:'B15', tier:'grant',    product:'ThingsBoard', type:'Grant',        name:'Community Grant', label:'Research cluster', created:'Aug 19 2026', updated:'Aug 19 2026', status:'awaiting_checkin', event:'', price:'Free', billing:'\u2014', grant:true, limits:'6,050 devices &middot; 2 production servers' }
    ],
    users: [
      { name:'Mariia Panchuk', email:'mpanchuk@thingsboard.io',  created:'Jul 17 2026' },
      { name:'A. Admin',       email:'a.admin@thingsboard.io',   created:'Jul 20 2026' },
      { name:'Dev User',       email:'dev@thingsboard.io',       created:'Aug 02 2026' },
      { name:'Olena Kravets',  email:'o.kravets@thingsboard.io', created:'Aug 05 2026' },
      { name:'Ivan Petrenko',  email:'i.petrenko@thingsboard.io',created:'Aug 09 2026' },
      { name:'Sara Lee',       email:'s.lee@thingsboard.io',     created:'Aug 12 2026' },
      { name:'Tom Fischer',    email:'t.fischer@thingsboard.io', created:'Aug 15 2026' },
      { name:'Nina Rossi',     email:'n.rossi@thingsboard.io',   created:'Aug 18 2026' }
    ],
    invoices: [
      { num:'NAWE49WG-0021', licId:'B13', date:'Aug 18 2026', amount:'$499.00',   status:'Paid', payment:'Auto-pay', auto:true  },
      // A capacity purchase on the perpetual: one-time, so no auto-charge icon — and it
      // sits in Home's three-row preview next to the renewals, which is where the
      // difference has to be visible. $1,999 is the perpetual production-instance unit
      // price (UNITS.perpTB.prod), so the figure is the one the wizard would charge.
      { num:'NAWE49WG-0022', licId:'B11', date:'Aug 16 2026', amount:'$1,999.00', status:'Paid', payment:'Card',     auto:false },
      /* ⚠️ THE ORIGINAL PURCHASES. Every perpetual here was created on a date and had
         no document for it: B11 said "created Sep 01 2025" while its only invoice was
         dated eleven months later and the tab read "1–1 of 1", so the purchase that
         brought the licence into existence left no trace. Each one is dated to its own
         licence's `created` and priced at the PRODUCT CARD's price — B11 was invoiced
         $1,999.00 for a licence the card sells at $4,999, which is the same figure the
         wizard would quote today. */
      { num:'NAWE49WG-0009', licId:'B10', date:'Jul 27 2026', amount:'$4,999.00', status:'Paid', payment:'Card',     auto:false },
      { num:'NAWE49WG-0002', licId:'B11', date:'Sep 01 2025', amount:'$4,999.00', status:'Paid', payment:'Card',     auto:false },
      { num:'NAWE49WG-0010', licId:'B12', date:'Aug 13 2026', amount:'$2,999.00', status:'Paid', payment:'Card',     auto:false },
      { num:'NAWE49WG-0020', licId:'B6',  date:'Aug 15 2026', amount:'$10.00',    status:'Paid', payment:'Auto-pay', auto:true  },
      { num:'NAWE49WG-0019', licId:'B8',  date:'Aug 12 2026', amount:'$15.00',    status:'Paid', payment:'Auto-pay', auto:true  },
      { num:'NAWE49WG-0018', licId:'B1',  date:'Aug 08 2026', amount:'$499.00',   status:'Paid', payment:'Auto-pay', auto:true  },
      { num:'NAWE49WG-0017', licId:'B7',  date:'Aug 05 2026', amount:'$39.00',    status:'Paid', payment:'Auto-pay', auto:true  },
      { num:'NAWE49WG-0016', licId:'B2',  date:'Aug 02 2026', amount:'$299.00',   status:'Paid', payment:'Auto-pay', auto:true  },
      { num:'NAWE49WG-0015', licId:'B3',  date:'Jul 28 2026', amount:'$299.00',   status:'Paid', payment:'Auto-pay', auto:true  }
    ],
    activity: [
      { kind:'created', ts:'Aug 18 2026, 10:26', entityType:'User', entityName:'Nina Rossi', actor:'mpanchuk@thingsboard.io', action:'ADDED',
        txt:'User <b>Nina Rossi</b> was invited by mpanchuk@thingsboard.io.' },
      { kind:'status',  ts:'Aug 18 2026, 07:12', entityType:'Subscription', entityName:'Startup', actor:'System', action:'PAYMENT_FAILED',
        txt:'Payment failed for <b>Startup</b> (Production) — card Visa ••4242 was declined.', delta:'Auto-pay charge of $299.00 failed' },
      { kind:'status',  ts:'Aug 15 2026, 14:03', entityType:'Subscription', entityName:'Pilot', actor:'i.petrenko@thingsboard.io', action:'UPDATED',
        txt:'Plan was changed from <b>Prototype</b> to <b>Pilot</b> on <b>Factory A</b> by i.petrenko@thingsboard.io.', delta:'Plan changed from Prototype to Pilot' },
      { kind:'updated', ts:'Aug 12 2026, 09:31', entityType:'Subscription', entityName:'Business', actor:'o.kravets@thingsboard.io', action:'UPDATED',
        txt:'Add-on <b>Edge Computing</b> was enabled on <b>Business</b> (Global) by o.kravets@thingsboard.io.' },
      { kind:'info',    ts:'Aug 08 2026, 00:05', entityType:'Invoice', entityName:'NAWE49WG-0018', actor:'Auto-pay', action:'PAID',
        txt:'Invoice <b>NAWE49WG-0018</b> was paid, charged automatically.' },
      { kind:'status',  ts:'Aug 05 2026, 08:00', entityType:'License', entityName:'ThingsBoard PE Perpetual License', actor:'System', action:'UPDATES_EXPIRING',
        txt:'Software updates for the <b>On-prem</b> perpetual license expire on <b>Aug 28, 2026</b>.', delta:'Updates term ends Aug 28 2026' },
      // a large account keeps producing events — enough of them that the Home feed
      // has a second and third batch to load
      { kind:'updated', ts:'Aug 04 2026, 16:48', entityType:'License', entityName:'Business', actor:'o.kravets@thingsboard.io', action:'UPDATED',
        txt:'Label <b>Production — Central Europe manufacturing cluster, building 4</b> was set on <b>Business</b> by o.kravets@thingsboard.io.', delta:'label = Production — Central Europe manufacturing cluster, building 4' },
      { kind:'created', ts:'Aug 02 2026, 11:05', entityType:'User', entityName:'Dev User', actor:'mpanchuk@thingsboard.io', action:'ADDED',
        txt:'User <b>Dev User</b> was invited by mpanchuk@thingsboard.io.' },
      { kind:'info',    ts:'Aug 02 2026, 00:05', entityType:'Invoice', entityName:'NAWE49WG-0016', actor:'Auto-pay', action:'PAID',
        txt:'Invoice <b>NAWE49WG-0016</b> was paid, charged automatically.' },
      { kind:'updated', ts:'Jul 30 2026, 13:22', entityType:'Subscription', entityName:'Prototype', actor:'i.petrenko@thingsboard.io', action:'UPDATED',
        txt:'Add-on <b>Trendz Analytics</b> was enabled on <b>Prototype</b> (Demo) by i.petrenko@thingsboard.io.' },
      { kind:'status',  ts:'Jul 28 2026, 09:10', entityType:'Subscription', entityName:'Prototype', actor:'mpanchuk@thingsboard.io', action:'CANCELED',
        txt:'Subscription <b>Prototype</b> (Sandbox) was canceled by mpanchuk@thingsboard.io — active until <b>Sep 05, 2026</b>.', delta:'Canceled; active until Sep 05 2026' },
      { kind:'created', ts:'Jul 24 2026, 15:40', entityType:'Subscription', entityName:'Pilot', actor:'mpanchuk@thingsboard.io', action:'ADDED',
        txt:'Subscription <b>Pilot</b> was created by mpanchuk@thingsboard.io.' },
      { kind:'updated', ts:'Jul 20 2026, 08:57', entityType:'Payment method', entityName:'Visa ••4242', actor:'mpanchuk@thingsboard.io', action:'UPDATED',
        txt:'Payment method was updated by mpanchuk@thingsboard.io.' },
      { kind:'created', ts:'Jul 15 2026, 10:12', entityType:'Subscription', entityName:'Maker', actor:'i.petrenko@thingsboard.io', action:'ADDED',
        txt:'Subscription <b>Maker</b> was created by i.petrenko@thingsboard.io.' },
      { kind:'info',    ts:'Jul 12 2026, 00:05', entityType:'Invoice', entityName:'NAWE49WG-0012', actor:'Auto-pay', action:'PAID',
        txt:'Invoice <b>NAWE49WG-0012</b> was paid, charged automatically.' }
    ]
  },
  /* G — Community Grant approved. One licence, and it is an ordinary row: the
     grant carries no price, no renewal and no expiry, and its status is the
     first-check-in wait (the key has been issued, nothing has used it yet). */
  G: {
    noInvoicesNote: 'No invoices &mdash; the Community Grant is free.',
    licenses: [
      { id:'G1', tier:'grant', product:'ThingsBoard', type:'Grant', name:'Community Grant', label:'', created:'Aug 19 2026', updated:'Aug 19 2026',
        status:'awaiting_checkin', event:'', price:'Free', billing:'—', grant:true, limits:'6,050 devices &middot; 2 production servers' }
    ],
    users: [
      { name:'Mariia Panchuk', email:'mpanchuk@thingsboard.io', created:'Aug 12 2026' }
    ],
    invoices: [],
    activity: [
      { kind:'created', ts:'Aug 19 2026, 09:02', entityType:'License', entityName:'Community Grant', actor:'System', action:'GRANT_ISSUED',
        txt:'<b>Community Grant</b> was issued to mpanchuk@thingsboard.io — license key created.', delta:'Community Grant issued' }
    ]
  },
  /* N — a genuinely NEW account: nothing bought, nobody invited, nothing logged.
     ⚠️ This dataset exists because the first-run states used to read dataset A, which
     has three licences, four invoices and two users. Home showed its empty screen off
     a stored flag while Licenses, Invoices, Activity and Users all showed someone
     else's populated account — they disagreed from the moment of sign-up, before any
     purchase. Home now derives its state from the licences that exist (page-home.js),
     and that derivation is only honest if a new account's data is actually empty.
     One user, because the account has exactly the person who just created it — which
     is also the only way the Users page's solo state is ever reached. */
  N: {
    licenses: [],
    users: [
      { name:'Mariia Panchuk', email:'mpanchuk@thingsboard.io', created:'Aug 19 2026' }
    ],
    invoices: [],
    activity: []
  }
};

/* ---------- instances, per licence -------------------------------------------
   ⚠️ REPLACES two hardcoded rows that were identical for every licence — same two
   ids, same blank labels, same dates, whether you opened a $10 Maker or a perpetual.
   Anything derived from instances (a status, a running count, an over-limit check)
   is meaningless while every licence claims the same two, so they had to become data
   before §5, §6 and §7 could mean anything.

   ⚠️ ONE TABLE, so the counts can be audited against the limits at a glance. The
   right-hand comment on each row is `running / allowed`; `allowed` is what
   instAllowed() computes from TIER_SPECS plus purchased extras.

   ⚠️ EXACTLY ONE licence is over its limit on purpose — B10, 2 running against 1
   allowed. Every other row here was checked against its own limit so that the
   over-limit state means something when you find it, rather than being the accident
   it was before (every perpetual showed two instances against a limit of one).

   `agoMin` is how long ago the instance last reported, and `seen` is derived from it
   at load. Values sit well clear of the stale threshold in both directions — minutes
   for healthy, days for stale — so the derived column is never ambiguous in a demo.
   See CHECKIN_INTERVAL_H, CHECKIN_STALE_MULT and agoStamp. */
function inst(id, label, agoMin, created, type, version){
  return { id:id, label:label || '', agoMin:agoMin, seen:agoStamp(agoMin),
           created:created, type:type || 'prod', version:version || LATEST_VERSION };
}
/* ⚠️ `agoMin` IS THE DATA; `seen` is derived from it (see refreshCheckins). Healthy
   instances are minutes old, stale ones days — whenever the demo is opened, not
   whenever it was seeded. The stale threshold is 2 hours (see CHECKIN_STALE_MULT), so
   every "healthy" figure here is well under it and every "stale" one is well over. */
var DEMO_INSTANCES = {
  /* A — small account */
  A1: [ inst('7c4a8d09-ca37-4f1b-9c4e-2b1e8f3a5d61', 'EU line 2',    12, 'Aug 10 2026', 'prod', '3.9.4') ],       // 1 / 1
  A2: [ inst('b5f2e1c7-3a9d-4e62-8f17-0c6d4b2a9e83', 'Broker',       21, 'Jul 22 2026', 'prod', '3.9.4') ],       // 1 / 1
  A3: [],                                                                                                          // 0 / 1 — never activated
  /* B — large account */
  B1:  [ inst('1f0b9a24-6c3e-4d85-b721-9e5a0c8f3d47', 'HQ primary',   7,  'May 02 2026', 'prod', '3.9.4'),
         inst('2a7c5e13-8d40-4b96-a3f2-6c1b9d7e0452', 'HQ secondary', 9,  'May 04 2026', 'prod', '3.9.4'),
         inst('9d3f6b80-2e51-4a7c-8b04-5f2a1c6e9370', 'Dev sandbox',  34, 'Jun 01 2026', 'dev',  '3.9.1') ],       // 2 / 4
  B2:  [ inst('4e8a2d76-1b93-4c50-9f6e-3a7d5b2c8014', 'Prod EU',      5,  'Jun 06 2026', 'prod', '3.9.4'),
         inst('6b1d4f29-7a08-4e63-b5c1-2d9f8a3e7615', 'Prod US',      11, 'Jun 10 2026', 'prod', '3.9.2') ],       // 2 / 3
  B3:  [ inst('8c5e0a31-9d76-4f18-a6b3-1e4c7d0b592f', 'Factory A',    18, 'Jun 20 2026', 'prod', '3.8.1') ],       // 1 / 2
  B4:  [ inst('3a9f7c52-0e14-4b86-9d27-8c5b1a6f3e40', 'Pilot EU',     26, 'Jul 01 2026', 'prod', '3.9.4') ],       // 1 / 1
  B5:  [],                                                                                                          // 0 / 1 — canceled
  /* STALE: five days without a report, against a one-hour cadence */
  B6:  [ inst('5d2b8e47-6f01-4a93-8c15-7b3e9d4a2f60', 'Maker box',    7200, 'Jul 15 2026', 'prod', '3.7.2') ],     // 1 / 1 — STALE
  B7:  [ inst('7f4c1a68-3b97-4e02-a5d8-9c6b2e0f4713', 'Demo',         41, 'Jul 20 2026', 'prod', '3.9.0') ],       // 1 / 1
  B8:  [ inst('0b6e3d95-8c24-4f71-b9a0-4e1d7c5a8362', 'MQTT prod',    8,  'Jun 30 2026', 'prod', '3.9.4') ],       // 1 / 1
  B9:  [ inst('2c9a5f80-4d13-4b67-8e92-1a7f3c6d0b54', 'MQTT staging', 16, 'Jul 05 2026', 'prod', '3.9.3') ],       // 1 / 1
  /* ⚠️ THE deliberate over-limit licence: a perpetual that includes one production
     instance and is running two. This is the only one, and it is what the blocked
     banner, the Home attention row and the detach route are all demonstrated on. */
  B10: [ inst('6e0d2b73-5a89-4c14-9f37-8b2e6a1d4053', 'HQ node 1',    6,  'Jul 27 2026', 'prod', '3.8.1'),
         inst('4b8f1e06-2c75-4d93-a610-7e5c3b9f2841', 'HQ node 2',    4,  'Aug 02 2026', 'prod', '3.8.1') ],       // 2 / 1 — OVER
  /* the updates case: a perpetual well behind the current release, which is what the
     Product version column is for — the gap argues better than any warning */
  B11: [ inst('9a3c7d51-0b68-4e27-8d94-5f1a2c7b6e30', 'Plant B',      23, 'Sep 01 2025', 'prod', '3.7.2') ],       // 1 / 1
  B12: [ inst('1d5b9f42-7e30-4a86-b2c9-6a4d8e0f3517', 'Broker on-prem', 14, 'Aug 13 2026', 'prod', '3.9.4') ],     // 1 / 1
  B13: [ inst('8e2a6c04-9f51-4b73-a8d6-3c7b1e5f9024', 'CE building 4', 3,  'Feb 18 2026', 'prod', '3.9.4'),
         inst('5c7d3a91-6b28-4f40-9e15-2a8f4c6b7d39', 'CE building 5', 10, 'Mar 02 2026', 'prod', '3.9.4') ],      // 2 / 3
  /* STALE: two days */
  B14: [ inst('3f6b0e85-1a47-4d29-8c73-9b5e2f8a0164', 'Munich',       2880, 'May 24 2026', 'prod', '3.8.0') ],     // 1 / 1 — STALE
  /* the grant has been issued but nothing has connected with the key yet — the whole
     point of the awaiting-check-in state, so it must stay empty */
  /* the expired-updates licence: reporting normally, but two minor versions behind —
     which is exactly what the Product version column is for */
  B16: [ inst('c4a71f38-5b62-4e09-9d17-3f8e5a2b6c04', 'Warehouse DC', 19, 'Aug 07 2024', 'prod', '3.7.2') ],
  B15: [],
  G1:  []
};
/* Attached by id, so a licence row stays readable and every instance decision is
   visible in one place above. */
(function attachInstances(){
  Object.keys(DATASETS).forEach(function(k){
    (DATASETS[k].licenses || []).forEach(function(l){
      l.instances = DEMO_INSTANCES[l.id] || [];
    });
  });
})();

/* ---------- plan cards for the new-user screen and the wizard ---------- */
var EC_PLANS = {
  /* ⚠️ Non-commercial was REMOVED from the offer (2026-09-23). Unlike Maker and
     Prototype below, its SPEC went too, and the difference is the installed base: five
     demo licences sit on Maker/Prototype and still have to render their entitlements,
     and NOT ONE sits on Non-commercial (checked: no `tier:'noncomm'` anywhere in
     DATASETS). A spec nothing can reach is not a compatibility shim, it is a dead row.
     Licences a reviewer created on it before this pass go with the store bump.
     ThingsBoard subscriptions are now Free · Pilot · Startup · Business.
     ⚠️ Maker ($10) and Prototype ($39) were REMOVED from the offer (2026-09-01) —
     they are no longer sold. Only these purchase CARDS went: `TIER_SPECS.maker` and
     `TIER_SPECS.prototype` stay, because licences already on those plans still have
     to render their entitlements on the details page. Do not "clean up" the specs
     to match this list — the offer and the installed base are two different sets.
     The Maker-only footnote about Trendz / Edge for testing went with its card; it
     was never shown on any other plan. */
  'thingsboard|payg': {
    cards: [
      /* ⚠️ FIRST, and ThingsBoard-only: TBMQ's sets are untouched. `free:true` travels
         with the card so every surface that renders one — landing, Home, both wizards —
         reads the same flag rather than testing the price string.
         The qualifier given for each ("up to 100 devices, 1 production instance") rides
         in `term`, the slot the perpetual card already uses for its one-line condition,
         so a free card keeps the paid cards' shape without borrowing their rows. */
      { name:'Free',           price:'Free', per:'', free:true, term:'up to 100 devices, 1 production instance',
        feats:['100 devices', '1 production instance', '1M AI credits / month'] },
      { name:'Pilot',     price:'$99',  per:'/ month', badge:'Popular', feats:['100 devices', '100 assets', '1 production instance', '4M AI credits / month', 'Help desk', 'White labeling', 'Device limit is fixed on this plan'] },
      { name:'Startup',   price:'$299', per:'/ month', feats:['500 devices', '500 assets', '2 production instances', '8M AI credits / month', 'Priority help desk', 'White labeling', 'Device limit is fixed on this plan'] },
      { name:'Business',  price:'$499', per:'/ month', feats:['1,000 devices', '1,000 assets', '3 production instances', '16M AI credits / month', 'Priority help desk', 'White labeling', '+$0.10 per extra device'] }
    ]
  },
  'thingsboard|perpetual': {
    single: true,
    cards: [ { name:'ThingsBoard PE Perpetual License', price:'$4,999', per:'· one-time', term:'Including 1 year of software updates',
               /* ⚠️ NO "Device limit is fixed on this plan" here. It was wrong: devices ARE
                  addable on perpetual — each purchased production instance brings 5,000
                  more, and extra devices can be added on top. That line belongs only to
                  the subscription plans that genuinely cap (Pilot, Startup). */
               feats:['5,000 devices included', '5,000 assets', '1 production instance', '5M AI credits / month', 'White labeling', 'All ThingsBoard PE features', 'Add devices and instances at any time'] } ]
  },
  'tbmq|payg': {
    single: true,
    cards: [ { name:'TBMQ PE subscription', price:'$15', per:'/ month',
               feats:['100 sessions', '100 msg/sec', '1 production instance', 'All TBMQ PE features except White labeling', 'Community support'] } ]
  },
  'tbmq|perpetual': {
    single: true,
    cards: [ { name:'TBMQ PE license', price:'$2,999', per:'· one-time', term:'Including 1 year of software updates',
               feats:['10,000 sessions', '1,000 msg/sec', '1 production instance', 'White labeling', 'All TBMQ PE features'] } ]
  }
};
/* ---------- what two of the feature lines actually mean -----------------------
   ⚠️ NOT invented. Both sentences are the prototype's own wording, taken from the
   descriptions the wizard's Customize step already shows for the same two controls
   (see stepCell('prod', …) and stepCell('ai', …) in wizard.js) and shortened to fit a
   card. The plan cards are where a first-time buyer meets these lines FIRST, and they
   carried no explanation at all — the participant guessed at one and gave up on the
   other.

   ⚠️ MARKED GAP: "assets", "sessions" and "msg/sec" have no description anywhere in
   the repo either. They are left unexplained rather than guessed at. */
var FEAT_NOTES = [
  { re:/production instance/i,
    note:'Production compute for your live deployment — enables clustering and HA.' },
  { re:/AI credits/i,
    note:'Monthly allowance for AI features, counted in blocks of 1M credits.' }
];
function featNote(text){
  for(var i = 0; i < FEAT_NOTES.length; i++){
    if(FEAT_NOTES[i].re.test(text)) return FEAT_NOTES[i].note;
  }
  return '';
}

/* ---------- tax ---------------------------------------------------------------
   ⚠️ COPY PENDING CONFIRMATION FROM THE TEAM — recorded in NOTES.md as such. Nothing
   in the repo states a tax position, and a buyer sees no mention of tax anywhere
   before entering a company card. This is the most neutral true-for-most-places
   sentence that can be written without inventing a rule; it says where the number is
   settled rather than what it will be. One constant, three surfaces. */
var TAX_NOTE = 'Prices exclude tax. Tax, where applicable, is calculated at checkout.';

var EC_SINGLE_NOTE = 'You can fine-tune capacity before checkout.';
/* ⚠️ The SHORT billing-mode line, split out of the tab descriptions below. What is left
   here is about PAYMENT — when you are charged and what you can change — because the
   entitlement half of the old sentence ("unlimited customers, dashboards, integrations,
   API calls, data points and messages") was the baseline written as prose, and it now
   lives in the baseline block where it is said once instead of twice. */
var BILLING_MODE_NOTE = {
  subscription: 'Pay every month, and change the plan any time.',
  perpetual:    'Pay once and run it indefinitely. Includes 12 months of software updates, renewable.'
};
/* ---------- what expiry actually means on a perpetual --------------------------
   ⚠️ `PERPETUAL`, `Active` and `Expires Oct 01, 2026` sat next to each other and read
   as a contradiction — a licence that is perpetual and also expires — until you worked
   out that it is the UPDATES TERM that ends, not the licence. Nothing on the licence
   said what you lose on that date.

   ⚠️ ONE source for both audiences. The buyer's sentence (BILLING_MODE_NOTE.perpetual)
   already said the good half — pay once, run indefinitely — but it is only ever shown
   to someone buying, never to the owner whose term is ending. These say the same thing
   in the same words from the other side of the purchase. Change one, change the set. */
var UPDATES_LAPSE = 'Your deployment keeps running indefinitely — a perpetual license does not stop. '
  + 'What ends is the software updates term: you stop receiving new versions and support. '
  + 'You can buy software updates again at any time.';
// the banner has room for one clause, so it carries the half the reader does not expect
var UPDATES_LAPSE_SHORT = 'The deployment keeps running; new versions and support stop.';
/* ⚠️ THE ONE SENTENCE every updates warning carries, at every stage and on every
   surface — Home banner, licence page, and the list's alert tooltip in short form.
   It names exactly two consequences and nothing else: no vague "risk", no "your
   deployment may become insecure", nothing the product cannot stand behind. If the
   wording changes it changes in one place, so the three surfaces cannot drift into
   three different promises. */
var UPDATES_LOSS = 'You will not receive security fixes released after this date, and you cannot upgrade to new versions.';
/* ⚠️ 40% of the licence base price — the figure given for this pass. It is the only
   pricing rule the repository has for updates, and it is not confirmed in writing
   anywhere; see NOTES. Renewing sets a fresh 12-month term FROM THE PURCHASE DATE
   (confirmed for this pass), not from the old expiry — so renewing early forfeits
   whatever was left, which is worth watching in testing. */
var UPDATES_RENEW_RATE = 0.40;
var UPDATES_RENEW_MONTHS = 12;
/* ⚠️ Base price per tier, as NUMBERS, in one place. It used to live only inside
   wizard.js's IIFE, which meant anything outside the wizard that needed a licence's
   price — the updates purchase, for one — had to re-derive it from a display string.
   wizard.js now reads this instead of keeping its own copy. */
var TIER_BASE = { free:0, maker:10, prototype:39, pilot:99, startup:299, business:499,
                  tbmqsub:15, tbperp:4999, tbmqperp:2999, grant:0 };
function tierBase(t){ return TIER_BASE[t] || 0; }
// intro sentence of the PE card — same wording on every plan surface
var PLANS_INCLUDE_NOTE = 'All plans include unlimited customers, dashboards, integrations, API calls, data points & messages.';

/* ---------- the baseline: what every plan of a product includes ----------------
   ⚠️ This list is EDITION-WIDE, not marketing for one tier — which is why it is now
   titled "Included in every plan". The proof is in the exception that was already
   recorded here: white labeling is NOT in it, because white labeling starts at Pilot
   and therefore belongs on the cards that differ. Everything that stayed is true of
   every ThingsBoard PE tier, subscription and perpetual alike.

   ⚠️ THINGSBOARD ONLY. There is no equivalent list for TBMQ anywhere in the data: its
   cards name the set ("All TBMQ PE features") and nothing enumerates it. The baseline
   block says so rather than inventing broker features — see BASELINE below. */
var PE_FEATURES = [
  ['Advanced RBAC for IoT', 'Fine-grained roles and permissions across customers, users, and assets.'],
  ['Entity groups', 'Organize devices, assets, and customers into managed groups with group-level permissions.'],
  ['Scheduler', 'Schedule device commands, firmware updates, and reports.'],
  ['Reporting', 'Generate and email dashboard-based PDF reports on a schedule.'],
  ['Export widget data to CSV/XLS', 'Download any widget\u2019s data for offline analysis.'],
  ['Data converters', 'Transform uplink and downlink payloads between devices and the platform.'],
  ['Platform integrations', 'Connect external systems via MQTT, HTTP, CoAP, LoRaWAN, Sigfox, and more.']
];

/* ---------- the two products the wizard offers ---------- */
var PRODUCT_CARDS = [
  { key:'thingsboard', name:'ThingsBoard',
    vline:'Build your IoT solution. On your terms.',
    sline:'The agile subscription for instant enterprise IoT — deploy anywhere, scale as you grow, pay only for what you need.',
    unlimited:'Customers · Users · Dashboards · Messages · API calls · Integrations' },
  { key:'tbmq', name:'TBMQ',
    vline:'Scale your messaging. On demand.',
    sline:'High-performance MQTT broker with a flexible, consumption-based licensing model.' }
];

/* ---------- shared glyphs + copy ---------- */
var FCHECK = '<svg class="icon fmark" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>';
var KEBAB = '<svg class="icon" viewBox="0 0 24 24" style="fill:currentColor;stroke:none"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>';
var COPYSVG = '<svg class="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>';
var INFOSVG = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11.5v4.5"/><path d="M12 8h.01"/></svg>';
/* the same pencil the Billing card and the licence label already draw — shared here
   so the instance label editor is not a fourth private copy of it */
var PENSVG = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
/* Marks an action that opens a NEW TAB. ⚠️ Not decoration: a participant opened six
   duplicate tabs because nothing on the page changed when the first one opened behind
   it. The mark makes the behaviour predictable before the click instead of a surprise
   after it — so it belongs on EVERY outbound action, not just the ones that felt odd. */
var EXTSVG = '<svg class="icon extmark" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4l-8.5 8.5"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>';
var STUB = 'Placeholder — not part of this wireframe spec yet.';

/* ============================================================================
   EXTERNAL LINKS — the only place the prototype points outside itself
   ============================================================================
   ⚠️ THREE OF FOUR ARE STILL PLACEHOLDERS pointing at the documentation ROOT, because
   the real pages have not been named yet. `install` is the one that is real (confirmed
   2026-09-18). Swapping in the true URLs is a one-line change each, and this constant
   exists so it is exactly one line and not a hunt through four files.

   ⚠️ This does not break "no external requests": that rule is about ASSETS — fonts
   are served locally from fonts/*.woff2 and nothing is fetched at load. These are
   navigation, and every one of them opens in a new tab (target="_blank" rel="noopener"),
   the same way View invoice already does.

     install  — how to activate a deployment with a licence key (PE install docs)
     updates  — what the updates term is and what renewing it means
     support  — how to reach a person
     docs     — the root, for anything that has no page of its own yet
   ========================================================================== */
var EXT = {
  docs:    'https://thingsboard.io/docs/',
  install: 'https://thingsboard.io/docs/pe/installation/',
  updates: 'https://thingsboard.io/docs/',   // TODO: the software-updates term page
  support: 'https://thingsboard.io/docs/'    // TODO: the contact page
};
/* one builder, so every outbound link carries the same attributes */
function extLink(key, text, cls){
  return '<a class="' + (cls || 'link') + '" href="' + EXT[key] + '" target="_blank" rel="noopener">'
    + text + '</a>';
}
// Feed items carry no event icon (see feedItem), so there is no icon set here.
// `kind` stays on each event: it is what the event is, and the next thing that
// groups or filters activity will want it.
// newest first; standard sentence order: what was done -> from -> to (if any) -> by whom.
// `delta` is the plain-text change, kept for the raw audit payload only.
// Activity now lives per-variant in DATASETS (density datasets block above).
var AUDITSVG = '<svg class="icon" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h5"/></svg>';

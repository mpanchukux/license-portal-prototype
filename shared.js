/* ============================================================================
   shared.js — everything every page needs, defined exactly once:

     1. helpers + date maths
     2. Store: a localStorage-backed mock backend. data.js holds the pristine
        seed; the store holds the account as the demo has mutated it, so a
        cancelled subscription, a purchased licence or a deleted user survives
        navigation and refresh.
     3. chrome: top bar, impersonation banner, footer, prototype settings panel
     4. shared modals: generic dialog, add user, update payment, apply coupon
     5. global behaviours: stubs, refresh spin, kebab/dropdown menus, tabs

   Load order on every page: data.js → shared.js → components.js → page script.
   Scripts sit at the end of <body>, so this runs with the DOM already parsed.
   ============================================================================ */

/* ---------- icons ----------------------------------------------------------------
   ONE place that knows how an icon is placed, for every piece of markup this codebase
   builds in JS. The HTML files write the same shape by hand:

       <svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-NAME"></use></svg>

   `size` is 16 (the default, omitted), 20 or 24 — the only three there are.
   `cls` adds the hooks a surface already styles by (`gb-ic`, `searchglyph`, …).
   ⚠️ `label` decides the accessibility contract, and it is not cosmetic: an icon that
   carries meaning ON ITS OWN gets `role="img"` and a name; an icon sitting beside a
   text label is decoration and is hidden from the reader, because announcing it would
   read the same thing twice.
   ⚠️ The href is RELATIVE, like every other path here — the site has to work from a
   subfolder (GitHub Pages, and the /site/ mirror it is checked in). */
function icon(name, opt){
  opt = opt || {};
  var cls = 'ic' + (opt.size ? ' ic-' + opt.size : '') + (opt.cls ? ' ' + opt.cls : '');
  var a11y = opt.label
    ? ' role="img" aria-label="' + String(opt.label).replace(/"/g, '&quot;') + '"'
    : ' aria-hidden="true"';
  return '<svg class="' + cls + '"' + a11y + '><use href="assets/icons.svg#ti-' + name + '"></use></svg>';
}

/* ---------- helpers ---------- */
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(x){ return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* ---------- dates ----------
   ⚠️ `MONF`, `epochDay`, `dayToDate`, `TODAY_DAY`, `todayStr()`, `dayStr()` and
   `shiftDemoDates()` all live in data.js now, because the seed itself has to be able
   to shift its own dates and data.js loads first. TODAY is the real today; the
   formatters below are unchanged. */
function dateKey(sv){ var q = String(sv).split(' '); return (+q[2]) * 10000 + (MONF[q[0]] || 0) * 100 + (+q[1]); }
function fmtDate(sv){ var q = String(sv).split(' '); return q.length === 3 ? (q[0] + ' ' + q[1] + ', ' + q[2]) : sv; }
/* One display format for a date-time: "Aug 17, 2026, 16:20". Timestamps are stored
   in the same month-first order as every plain date ("Aug 17 2026, 16:20"), so one
   parse rule covers both and fmtDate does the date half. */
function fmtDateTime(sv){
  var q = String(sv).split(', ');
  return q.length === 2 ? (fmtDate(q[0]) + ', ' + q[1]) : fmtDate(sv);
}
/* ISO belongs in exactly ONE place — the raw audit payload, which is meant to read
   like what the API returns. Every date a person reads goes through fmtDate or
   fmtDateTime; if ISO shows up anywhere else on screen, that is the bug. */
function isoFromTs(sv){
  var q = String(sv).split(', '), d = String(q[0]).split(' ');
  if(d.length !== 3 || !MONF[d[0]]) return String(sv);
  var p2 = function(n){ return ('0' + n).slice(-2); };
  return d[2] + '-' + p2(MONF[d[0]]) + '-' + p2(d[1]) + 'T' + (q[1] || '00:00') + ':00Z';
}
/* Proration for a mid-cycle change, computed from the licence's OWN renewal date
   rather than one hardcoded fraction: a licence renewing Sep 20 must not be told
   its cycle ends Aug 30. The cycle is the calendar month that ends on `event`, so
   its length is 28–31 days depending on the month — the honest basis for a bill
   described as "billed monthly". Returns null when there is no renewal date to
   read (a grant never expires), and the caller then omits the parenthetical. */
function prorate(eventStr){
  var q = String(eventStr || '').split(' ');
  if(q.length !== 3 || !MONF[q[0]]) return null;
  var y = +q[2], m = MONF[q[0]], d = +q[1];
  var end = epochDay(y, m, d);
  var pm = m === 1 ? 12 : m - 1, py = m === 1 ? y - 1 : y;   // same day, one month back
  var cycle = end - epochDay(py, pm, d);
  var left = end - TODAY_DAY;
  if(cycle <= 0 || left <= 0) return null;                    // already past: nothing to prorate
  /* A monthly subscription renews at the end of the current cycle, so `left` can
     never exceed `cycle` in valid data. Clamp anyway: a renewal date further out
     than one cycle would otherwise give a fraction above 1 and charge MORE than
     the full delta. Clamped, such a date reads as "the whole cycle is ahead". */
  if(left > cycle) left = cycle;
  return { left:left, cycle:cycle, fraction:left / cycle, end:fmtDate(eventStr) };
}

/* ============================================================================
   Store — the mock backend
   ============================================================================
   One localStorage key holds the whole demo: which dashboard state is selected
   plus a working copy of every dataset. Mutations go through the helpers below
   so each one persists; "Reset demo data" drops the key and reseeds from data.js.
   ========================================================================== */
var Store = (function(){
  /* The key carries a version, and the version is the way a change to data.js
     actually reaches anyone. The store snapshots DATASETS on first load and works
     from that copy ever after, so editing the seed changes nothing for a browser
     that already has a snapshot — it would need "Reset demo data" pressed by hand,
     which is not something a reviewer should have to know. Bump this whenever the
     seed changes in a way that has to be seen; the old key is simply abandoned. */
  /* ⚠️ v10 → v11: the SEED is unchanged (both keys were already null), but the MEANING
     of stored data is not — a browser holding a v10 `profile` has a company name and
     address in it that no form writes or reads any more, and its `billingAddress` has
     no company name at all. That store would render a half-empty consolidated section
     and print an invoice missing the company. Bumping is cheaper than a migration for
     a prototype, and unlike a migration it cannot half-succeed. */
  var KEY = 'tb-license-portal-demo-v19';   // v19: seeded activity details no longer repeat their sentence
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  /* ⚠️ The snapshot is taken ONCE and then shifted to today. Doing it here rather than
     at render time means every surface reads the same stored dates, and a browser left
     open overnight does not have its history move under it mid-session. */
  function seed(){
    var ds = clone(DATASETS);
    shiftDemoDates(ds, TODAY_DAY - SEED_ANCHOR_DAY);
    return {
      dash: 'dashB',              // which dashboard state the settings panel selected — the large account
      datasets: ds,               // the demo's accounts, dated relative to today
      pendingEmail: null,         // { from, to } while an email change awaits confirmation
      impersonating: null,        // email of the user being impersonated
      dismissed: {},              // one-time banners the viewer closed
      showCanceled: false,        // Licenses table: cancelled rows are hidden until asked for
      licDetails: 'modal',        // licence details open over the list; 'page' is the comparison
      /* Who is looking. 'out' is the seed, so a fresh browser starts on the landing
         page and reaches the portal through sign-up or log-in — and so "Reset demo
         data" returns there without needing a line of its own. */
      auth: 'out',                // 'out' | 'new' | 'existing'
      /* ⚠️ WHICH PRODUCT THE SESSION ARRIVED FOR. The portal states the product rather
         than offering a choice of two (see nlProductStatedHTML), and in a real portal
         this would come from where the person came from — the product's own pages, a
         campaign link, a referrer. The prototype cannot know that, and there is no URL
         parameter here to read, so the ⚙ panel sets it and every selling surface starts
         from it. Swapping product inside a flow still works and does not write here:
         arrival is where you STARTED, not where you ended up. */
      arrived: 'thingsboard',     // 'thingsboard' | 'tbmq'
      pendingPurchase: null,      // { product, kind, plan } carried across the sign-up navigation
      /* Everything below is written by a form and read by a surface. `null` means
         "nothing saved yet", and every reader falls back to what the markup or
         PAYMENT_METHOD already shows — so an untouched demo looks exactly as it did. */
      paymentMethod: null,        // { brand, last4, num, exp, name, country } once a card is entered
      /* ⚠️ The split moved. `profile` is now ONLY the person — first, last, language;
         the company name, description, phone and address it used to also hold live in
         `billingAddress`, on the one page that owns them. */
      profile: null,              // Account: first, last, lang
      /* ⚠️ SEEDED, unlike its neighbours, and that is the fix for a demo fault: every
         invoice printed "Billed to ThingsBoard, 500 7th Avenue, New York" — the
         VENDOR's own address on a customer's invoice. It came from invoiceParty()'s
         fallback strings, which were the only thing there while nothing was saved.
         A populated demo account is a CUSTOMER, so it now has customer details, and
         the document reads like a document someone was actually sent.
         ⚠️ setSession('new') clears this — a brand-new account has saved nothing and
         must not inherit another company's billing details. */
      billingAddress: {           // Billing: company, descr, email, phone + the address
        company:'Northwind Industrial GmbH', descr:'Industrial IoT systems integrator.',
        email:'billing@northwind-industrial.de', phone:'+49 89 5550 1234',
        country:'Germany', state:'Bavaria', city:'Munich', zip:'80331',
        addr:'Leopoldstrasse 21', addr2:''
      },                          // printed on every invoice (see invoiceParty)
      passwordChangedAt: null,    // Security: a date string. The password itself is NEVER stored.
      /* who signed up in this browser — { email, name }. Events log against it, so a
         purchase made by a new account is not attributed to the demo's own address. */
      account: null,
      /* ⚠️ ACCOUNT CREDIT — one number, not a ledger of entries. What a ledger would add
         is a history of why the balance moved, and that history already exists: every
         change that creates or spends credit writes an activity entry saying so. A
         second record of the same events is a second thing that can disagree with the
         first. If credit ever needs to expire per-entry, THAT is when it becomes a
         list. Stored in whole currency units, like every other amount here. */
      credit: 0,
      seq: 0                      // counter behind generated licence ids and keys
    };
  }
  var state, fresh = false;
  try { state = JSON.parse(localStorage.getItem(KEY)); } catch(e){ state = null; }
  if(!state || !state.datasets || !state.datasets.A){ state = seed(); fresh = true; }

  function save(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }
  /* ⚠️ CHECK-IN STAMPS ARE REFRESHED ON EVERY LOAD, not only on a fresh seed. At an
     hourly cadence a stored stamp is stale within the hour, so a demo opened the next
     day would show every instance as Stale — a screen of red herrings. `agoMin` is the
     real datum; the stamp is derived from the clock each time (see refreshCheckins). */
  refreshCheckins(state.datasets);
  if(fresh) save();   // write the seed straight away, so every page starts from the same copy
  return {
    state: function(){ return state; },
    get: function(k){ return state[k]; },
    set: function(k, v){ state[k] = v; save(); },
    save: save,
    reset: function(){ try { localStorage.removeItem(KEY); } catch(e){} state = seed(); }
  };
})();

/* ---------- which dashboard state is on screen ---------- */
/* Every entry names the dataset it reads and the chrome it adds; `empty` marks
   the two new-user surfaces, which have no licences to read at all. */
var DASH_STATES = {
  dashboard:        { label:'Dashboard — small account (A)', variant:'A' },
  dashB:            { label:'Dashboard — large account (B)', variant:'B' },
  dashempty:        { label:'Dashboard — new user (empty)',  variant:'N' },
  dashgrantpending: { label:'Dashboard — grant pending',     variant:'N', grant:'pending' },
  dashgrant:        { label:'Dashboard — grant approved',    variant:'G' }
};
function dashState(){ return DASH_STATES[Store.get('dash')] || DASH_STATES.dashboard; }
function dashVariant(){ return dashState().variant; }
/* ⚠️ DERIVED, not stored. `empty:true` used to be a flag on the state above, set once
   by setSession('new') and cleared by nobody — so buying a licence left Home on its
   first-run screen while every other page showed the new licence. The answer is not
   to clear the flag in the purchase handler (the next path that adds a licence would
   forget), it is to stop having a flag: an account is new exactly while it owns no
   licences, and that is a question the data can always answer. */
function dashIsEmpty(){ return (DATA().licenses || []).length === 0; }
function DATA(){ return Store.get('datasets')[dashVariant()] || Store.get('datasets').A; }

/* ---------- mutations: every one writes through to localStorage ---------- */
/* A licence id is looked up across every dataset: a details link can outlive the
   dashboard state that produced it (a bookmark, a back button, a shared URL). */
function licById(id){
  if(!id) return null;
  var ds = Store.get('datasets'), found = null;
  Object.keys(ds).forEach(function(k){
    ds[k].licenses.forEach(function(l){ if(l.id === id && !found) found = l; });
  });
  return found;
}
/* ---------- the activity feed is written, not only seeded ----------
   Until now DATA().activity was seed-only: you could add a user, cancel a
   subscription or buy a licence and the feed would not notice. Every mutation
   below logs through this one helper, so the feed reads as what actually
   happened in this session — and an audit trail that misses actions is worse
   than none, because it looks complete.
   The entry shape matches the seed exactly (see data.js), so feedItem and the
   raw payload need no special case. Date stays the pinned Aug 19 2026; the TIME
   is the real clock, which is the same exception the greeting already makes —
   without it every session event would collide at one minute. */
/* The demo's own account, and the fallback for a session that never signed up. */
var PORTAL_ACTOR = 'mpanchuk@thingsboard.io';
/* ⚠️ Who an event is attributed to. It used to be the constant above, unconditionally
   — so an account that had just signed up as someone else watched its own first
   purchase logged under mpanchuk@thingsboard.io. The address typed at sign-up is
   stored (see Auth.finish) and this reads it. */
function portalActor(){
  var a = Store.get('account');
  return (a && a.email) || PORTAL_ACTOR;
}
/* ⚠️ And the NAME, for the same reason. Signing up as someone else left the chrome
   and Home's greeting saying "Mariia Panchuk" — the account's own screens addressing
   a stranger. Falls back to the demo's own name when nobody signed up in this browser. */
var PORTAL_NAME = 'Mariia Panchuk';
function portalName(){
  var a = Store.get('account');
  return (a && a.name) || PORTAL_NAME;
}
function portalFirstName(){ return String(portalName()).split(' ')[0]; }
/* ⚠️ Was 'Aug 19 2026, HH:MM' — the clock was real and the date was not, so an event
   logged a second ago carried a date months away from it. Both halves are real now. */
function nowTs(){
  var d = new Date(), p2 = function(n){ return ('0' + n).slice(-2); };
  return todayStr() + ', ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
}
/* ⚠️ A RECORD, NOT A SENTENCE. Callers hand over facts — `type`, the values in `f`,
   and an optional `detail` — and the wording is decided once, in ACTIVITY_TEXT, by the
   one component that renders activity. Nothing here builds markup, and the store never
   holds any: that is what lets search match the sentence instead of scraping it back
   out of the DOM, and it is what makes a copy change one edit instead of sixteen.
   ⚠️ `noActor` for the events nobody performs — an automatic retry, a credit the system
   draws from a change. Their sentence simply ends, which is how the absence of a name
   says "nobody did this" (decided 2026-09-24). */
function logActivity(e){
  var a = { type: e.type, ts: nowTs(), f: e.f || {} };
  if(!e.noActor) a.actor = e.actor || portalActor();
  if(e.detail && e.detail.length) a.detail = e.detail;
  /* ⚠️ WHICH LICENCE this event is about, when the caller knows. Without it the
     licence's own Activity tab could not show a single thing that had actually been
     logged — it had to synthesise a history from the licence object, so a plan change
     recorded here appeared on the Activity page and nowhere near the licence it
     changed. Optional on purpose: an account-level event (a user invited, a password
     changed) genuinely has no licence. */
  if(e.licId) a.licId = e.licId;
  DATA().activity.unshift(a);          // newest first, the order the feed reads in
  Store.save();
  // the feed is on screen on Home and on the Activity page — repaint if we are there
  if(typeof renderDashFeed === 'function' && $('#dashFeed')) renderDashFeed();
  if(typeof renderActFeed === 'function' && $('#actFeed')) renderActFeed();
  return a;
}

function storeCancelLicense(id){
  var l = licById(id);
  if(l){
    l.status = 'canceled';
    Store.save();
    logActivity({ type:'license.canceled', licId:l.id,
      f:{ entity:(l.label || l.name), until:fmtDate(l.event) } });
    /* the RESULT leaves on its own; the licence's own "Canceled · active until …" is
       state and belongs to the slot below the panel header */
    Snack.show('Subscription canceled \u2014 active until ' + fmtDate(l.event));
  }
  return l;
}
/* ---------- the charge that pays for a licence --------------------------------
   ⚠️ A purchase used to produce NO invoice at all. The proof of payment did not exist
   anywhere in the product: the licence's Invoices tab, the Invoices page, Activity and
   Billing all had nothing, and the closest thing to a receipt was a raw audit record.
   The first charge is now a real, paid invoice — the same shape as every seeded one,
   so it renders, downloads and opens like the rest without a special case. */
function invoiceNumber(){
  var n = (Store.get('seq') || 0) + 1;
  Store.set('seq', n);
  return 'NAWE49WG-' + ('000' + (1000 + n)).slice(-4);
}
/* ⚠️ ONE sorted reading of the invoice list, newest first, used by every surface that
   shows invoices. They used to read `DATA().invoices` raw, which is seed order plus
   whatever `unshift` put on the front — so the page ran Sep 17, Sep 15, Aug 26,
   Oct 01 2025, Sep 12… neither by date nor by number, with no sort control to fix it.
   Sorted here rather than in each renderer so the Invoices page, Home's preview block
   and a licence's own Invoices tab cannot disagree about the order.
   ⚠️ Not sorted in place: `sort` mutates, and the store's array is the seed. */
function invoicesSorted(list){
  return (list || DATA().invoices).slice()
    .sort(function(a, b){ return dateKey(b.date) - dateKey(a.date); });
}
/* ---------- account credit ------------------------------------------------------
   Created when a change gives back what was already paid for and not used; spent on the
   next purchase before the card is touched. */
function accountCredit(){ return +(Store.get('credit') || 0); }
function addCredit(amount, entry){
  if(!(amount > 0)) return 0;
  Store.set('credit', Math.round((accountCredit() + amount) * 100) / 100);
  if(entry) logActivity(entry);
  return amount;
}
/* Spends up to `amount` and returns what was actually taken — the caller needs the real
   figure, because it is what the summary and the invoice both print. */
function useCredit(amount){
  var used = Math.min(accountCredit(), Math.max(0, amount));
  if(used > 0) Store.set('credit', Math.round((accountCredit() - used) * 100) / 100);
  return Math.round(used * 100) / 100;
}
function storeAddInvoice(lic, amount, opts){
  opts = opts || {};
  var inv = { num:invoiceNumber(), licId:lic.id, date:todayStr(), amount:amount,
              status:'Paid', payment:opts.payment || 'Card', auto:!!opts.auto };
  /* ⚠️ CREDIT IS RECORDED ON THE INVOICE, and it has to be. An invoice is the record of
     what was CHARGED: if $60 of a $299 order came off the balance, a document saying
     $299 misstates what the card took, and one saying $239 hides where the rest went.
     Both figures, or the document cannot be reconciled against either the order or the
     card statement. */
  if(opts.credit > 0){ inv.credit = opts.credit; inv.charged = opts.charged; }
  /* ⚠️ A ONE-TIME DISCOUNT IS RECORDED HERE OR NOWHERE. The coupon lives in the wizard's
     own state and dies with the flow; the invoice is the only durable record that this
     charge was not the list price, and without the original figure the document cannot
     be reconciled against the licence's price. Three numbers, because two cannot be
     checked: what it would have been, what came off, what was paid. */
  if(opts.original){ inv.original = opts.original; inv.discount = opts.discount; inv.couponCode = opts.couponCode; }
  DATA().invoices.unshift(inv);
  Store.save();
  return inv;
}
function storeAddLicense(lic){
  DATA().licenses.unshift(lic);
  Store.save();
  logActivity({ type:'license.created', licId:lic.id,
    f:{ kind:lic.type, entity:(lic.label || lic.name) } });
}
function storeAddUser(u){
  DATA().users.push(u);
  Store.save();
  logActivity({ type:'user.invited', f:{ entity:(u.email || u.name) } });
}

/* ---------- invitations ------------------------------------------------------
   The mock of the backend the Add user screen assumes: a record per invitation,
   whose token IS the credential. Held in the store because it has to survive the
   navigation the invite link performs — the whole point of a link is that it is
   opened somewhere else, later.

   ⚠️ `invites` is NOT in the seed and the store key is NOT bumped: an absent key
   reads as an empty list, and nothing a reviewer looks at changes on first load,
   so making every existing browser throw its demo state away would buy nothing.
   ⚠️ An invitation is NOT access. Nothing here touches DATA().users — the invited
   person joins that list by signing up, not by being asked. */
var INVITE_DAYS = 7;
function invites(){ return Store.get('invites') || []; }
function newInviteToken(){
  var n = (Store.get('seq') || 0) + 1;
  Store.set('seq', n);
  return 'inv-' + (1000 + n) + '-' + (n * 7919 % 65536).toString(16);
}
/* `email` is the address the invitation is bound to, or null for the copied link,
   which is an open single-use door rather than one person's. The sign-up screen
   locks the email field exactly when this is set — see Auth.open. */
function mintInvite(email){
  var rec = { token:newInviteToken(), email:email || null,
              createdDay:TODAY_DAY, expiresDay:TODAY_DAY + INVITE_DAYS,
              used:false, revoked:false };
  var all = invites(); all.push(rec); Store.set('invites', all);
  return rec;
}
function inviteByToken(t){
  var m = invites().filter(function(i){ return i.token === t; })[0];
  /* a spent, revoked or expired token is the same answer to the visitor: this
     link does not work. The distinction is the server's business, not the page's. */
  if(!m || m.used || m.revoked || TODAY_DAY > m.expiresDay) return null;
  return m;
}
function updateInvite(t, patch){
  var all = invites();
  all.forEach(function(i){ if(i.token === t) Object.keys(patch).forEach(function(k){ i[k] = patch[k]; }); });
  Store.set('invites', all);
}
/* The URL the copied link carries. Built from where the prototype actually is, so
   the link genuinely opens — paste it anywhere and it works, on Pages, in the
   artifact or on localhost. A real portal would mint this against its own domain. */
function inviteURL(token){
  var base = location.href.split('?')[0].split('#')[0].replace(/[^/]*$/, '');
  return base + 'landing.html?invite=' + encodeURIComponent(token);
}
function storeDeleteUser(email){
  var ds = Store.get('datasets');
  Object.keys(ds).forEach(function(k){
    ds[k].users = ds[k].users.filter(function(u){ return u.email !== email; });
  });
  Store.save();
  logActivity({ type:'user.removed', f:{ entity:email } });
}
/* A label is the one field the demo lets you edit, from three places: the pencil
   on the details surface, that surface's ⋮, and a row's ⋮ in the table. It writes
   through the store, then every surface that renders a label is repainted, so the
   table, the dashboard block and the details page never disagree. */
function setLicenseLabel(lic, val){
  if(!lic) return;
  var was = lic.label;
  lic.label = String(val || '').trim();
  Store.save();                        // the object came out of the store, so this persists it
  if(lic.label !== was){
    /* two types, not one string with a fork in it — the copy map holds both wordings */
    /* ⚠️ The detail says only what the sentence does not. "Label set to X" already
       names the new value, so the row that adds something is the one it replaced — and
       when there was nothing to replace, there is no row at all. */
    logActivity(lic.label
      ? { type:'license.labeled', licId:lic.id, f:{ entity:lic.name, label:lic.label },
          detail: was ? [['Previous label', was]] : null }
      : { type:'license.label_cleared', licId:lic.id, f:{ entity:lic.name },
          detail:[['Previous label', was]] });
  }
  repaintLabelSurfaces();
  /* an action result, so it leaves on its own rather than sitting in the panel */
  if(lic.label !== was) Snack.show(lic.label ? 'Label saved' : 'Label cleared');
}
function repaintLabelSurfaces(){
  if(typeof renderProducts === 'function' && $('#prodBody')) renderProducts();
  if(typeof renderDashLicenses === 'function' && $('#dashLicBody')) renderDashLicenses();
}

function storeNextSeq(){ var n = Store.get('seq') + 1; Store.set('seq', n); return n; }
function isDismissed(k){ return !!Store.get('dismissed')[k]; }
function dismiss(k){ Store.get('dismissed')[k] = true; Store.save(); }

/* ============================================================================
   Session — who is looking, and what that page is allowed to be
   ============================================================================
   Three states, stored like every other piece of demo state, so they survive
   navigation and refresh:

     out       the landing page and the public documents; the truncated header
     new       signed in, no licences yet — Home renders its new-user screen
     existing  signed in with the account's licences — Home renders populated

   The state is not a claim about a real session: it is the demo's way of showing
   the same prototype from three vantage points, and the settings panel jumps
   between them (see the Session group).
   ========================================================================== */
var AUTH_STATES = {
  out:      { label:'Signed out (landing)' },
  'new':    { label:'Signed in — new account' },
  existing: { label:'Signed in — existing account' }
};
function authState(){ return AUTH_STATES[Store.get('auth')] ? Store.get('auth') : 'out'; }
function isSignedIn(){ return authState() !== 'out'; }

/* A page is PUBLIC when it may be read signed out. Three of them are not a
   courtesy: the sign-up consent line links to Terms of Use, Privacy Policy and the
   License agreement, so guarding those would bounce a visitor to the landing page
   the moment they tried to read what they are agreeing to. `styleguide.html` is
   public for a different reason — it is prototype scaffolding, reachable from the
   gear panel, which is itself available while signed out. Everything else is the
   portal proper and requires a session. Declared on <body>, so the page says it
   about itself rather than this file keeping a list of filenames. */
function isPublicPage(){ return document.body.hasAttribute('data-public'); }

/* ⚠️ `location.replace`, never `location.href`: a redirect that leaves a history
   entry makes Back bounce straight into the same redirect, and the visitor is stuck.
   Replace swaps the entry, so Back goes where they actually came from.
   The landing page is the signed-out home AND unreachable once signed in — both
   directions are the same rule, so both live here. */
function guardSession(){
  var landing = document.body.getAttribute('data-page') === 'landing';
  if(landing && isSignedIn()){ location.replace('index.html'); return false; }
  if(!landing && !isPublicPage() && !isSignedIn()){ location.replace('landing.html'); return false; }
  return true;
}

/* Signing in is a state change plus a destination, and both callers (the auth
   surface and the settings panel) need the same pairing, so it is one function.
   ⚠️ `new` also clears billing data. An account created a second ago cannot have a
   card on file, and the wizard reads exactly that flag to decide whether it has a
   Payment & Billing step — leaving it "saved" would let a brand-new account check
   out against a payment method it never entered. The gear panel can still flip it
   back; this only sets the honest starting point. */
function setSession(next, opts){
  opts = opts || {};
  if(!AUTH_STATES[next]) next = 'out';
  Store.set('auth', next);
  if(next === 'new'){
    Store.set('dash', 'dashempty');
    Store.set('billingData', 'none');
    /* the seeded demo customer belongs to the populated account, not to whoever just
       signed up — see the billingAddress note in the seed */
    Store.set('billingAddress', null);
  }
  /* ⚠️ Two callers, two meanings, one flag. The settings panel's "Signed in —
     existing account" is a jump TO a populated account, so an empty dashboard state
     is not one it can land on and it is replaced. Logging in is not that jump: it
     reveals whatever account the demo is currently set to — which is how "the
     populated state with that account's licences, OR the empty state if the account
     has none" comes out without a branch of its own. */
  /* ⚠️ Reads the STATE's dataset, not a flag: "is the dashboard this demo is set to
     an empty one" is now answered by which dataset it names. `dashempty` and
     `dashgrantpending` both point at N, which has no licences. */
  if(next === 'existing' && !opts.keepDash){
    var v = (DASH_STATES[Store.get('dash')] || {}).variant;
    if(v === 'N') Store.set('dash', 'dashB');
  }
  if(opts.go === false) return;
  location.href = next === 'out' ? 'landing.html' : 'index.html';
}
function signOut(){ setSession('out'); }

/* ============================================================================
   Chrome — one definition, injected into every page
   ========================================================================== */
/* The five destinations, in one place. `ic` is only read by the phone's bottom
   navigation bar — the desktop strip is text-only — but it lives here so the
   destination list stays a single source. */
/* ---------- navigation ----------
   The logo leads the bar, the page title lives ON the page directly under the
   header, and Users is NOT a destination — it is a nested level inside the profile
   menu, where "who can get in" belongs with the account. Four destinations, on both
   breakpoints.
   ⚠️ THE COUNT IN THIS PARAGRAPH IS HISTORY: it said "four destinations" from the
   pass that hid Users, Users came back 2026-09-17 making five, and Instances makes
   SIX (2026-09-23). Six is a deliberate, measured choice and not a clean fit — see
   bottomNavHTML.
   ⚠️ This was a switchable variant ('v1' put Users in the nav and the title in the
   bar). The alternative is gone — array, getters, body class, CSS branches, stored
   key and settings group all removed. If a comparison is ever needed again it is a
   new decision, not a flag to re-enable. */
var NAV_ITEMS = [
  { key:'home',     href:'index.html',    label:'Home',
    ic:'home' },
  { key:'licenses', href:'licenses.html', label:'Licenses',
    ic:'key' },
  /* ⚠️ A DESTINATION SINCE 2026-09-23, reversing "a view toggle, NOT a nav destination"
     on the Licenses page. Directly after Licenses, because it is the same subject
     sliced by deployment. See the measurement note above about what a sixth item does
     to the phone. */
  { key:'instances', href:'instances.html', label:'Instances',
    ic:'server' },
  { key:'invoices', href:'invoices.html', label:'Invoices',
    ic:'receipt' },
  { key:'activity', href:'activity.html', label:'Activity',
    ic:'activity' },
  /* ⚠️ USERS IS NOT HERE ANY MORE (2026-09-23), and this is the second reversal of
     the same question, so both answers are worth keeping.
     It was moved OUT of the strip once, into a nested hover level of the profile menu.
     That was wrong for a reason that still stands: it put `Log in as` and Delete — the
     two most destructive actions in the portal — behind a hover, which does not exist
     on touch, and which stopped scaling after a handful of rows. It came BACK into the
     strip 2026-09-17 to fix exactly that.
     It now leaves again, but NOT to a hover level: the profile menu's Users item opens
     a MODAL carrying the whole surface (see UsersModal). That answers the old objection
     — a modal is not a hover, it is the same content the page had, and both destructive
     actions sit in its table with the subject on screen — while taking back a strip slot
     that a sixth destination had made tight on the phone. `Instances` stops being
     truncated at 390 as a side effect. */
];

function navItemsHTML(extraClass){
  return NAV_ITEMS.map(function(n){
    return '<a class="tnav-item' + (extraClass ? ' ' + extraClass : '') + '" data-nav="' + n.key
      + '" href="' + n.href + '">' + n.label + '</a>';
  }).join('');
}
/* The phone's primary navigation: a bottom bar, not a drawer. Destinations at the
   same level are what a bottom bar is for — a drawer hid all of them behind a press
   and put "Users" out of sight.
   ⚠️⚠️ SIX ITEMS DO NOT FIT CLEANLY, and that is a decision, not an oversight.
   Measured at the 14px type floor (which is the floor, so it did not move): the bar
   splits evenly, so six cells are 65px at 390px and the label box is 61px.
   "Instances" is 59.6px wide — it clears 390px by 1.4px, and clips at 375px (−1.1),
   at 360px (−3.6) and, with "Licenses" and "Invoices", at 320px (−10.3). Five cells
   were 78px with 24px of slack, which is what the old "five of them fit" note meant.
   Accepted as-is pending further passes on the bar; nothing was shrunk or renamed to
   make room. Same items, same `data-nav`, same
   `.tnav-item` class, so syncTopNav marks the current one here too and there is
   still one source of truth. Hidden above 600px by CSS; the desktop strip is
   hidden below it. */
function bottomNavHTML(){
  return '<nav class="bnav" id="bottomNav" aria-label="Primary">'
    + NAV_ITEMS.map(function(n){
        return '<a class="tnav-item bnav-item" data-nav="' + n.key + '" href="' + n.href + '">'
          + '<span class="bn-ic">' + icon(n.ic, { size:24 }) + '</span>'
          + '<span class="bn-lb">' + n.label + '</span></a>';
      }).join('')
    + '</nav>';
}
/* The logo lockup, used by both headers. Its destination is the only thing that
   differs: signed in it leads Home, signed out it leads back to the landing page —
   which is the whole of requirement "the logo goes to Home instead". */
function brandHTML(){
  var href = isSignedIn() ? 'index.html' : 'landing.html';
  return '<a class="dbrand" href="' + href + '" aria-label="ThingsBoard License Portal" title="'
    + (isSignedIn() ? 'Home' : 'ThingsBoard License Portal') + '">'
  /* ⚠️ THE REAL WORDMARK, not a drawn stand-in. It replaces both halves of what was
     here — a circle-and-cross placeholder in a bordered box, and the words beside it —
     because the supplied file already carries the mark AND the name. It is recoloured
     to `currentColor` by tools/build-logo.py (the brand file is white, for a dark
     ground; this prototype's ground is light), so the ink comes from CSS.
     ⚠️ It is the ONE drawing that is not from the icon sprite, and it lives in its own
     file so that exception is a named file rather than a hole in the rule. */
  /* ⚠️ The mark is the WHOLE lockup — it already sets "License Portal" under the
     product name, so the separate caption that used to sit beside it is gone. Keeping
     both printed the words twice and pushed the second copy under the nav strip. */
    + '<svg class="tblogo" role="img" aria-label="ThingsBoard License Portal">'
    +   '<use href="assets/logo.svg#tb-logo"></use></svg>'
    + '</a>';
}

/* ---------- the signed-out header ----------
   The same band as the signed-in one (.dtopbar / .dtopbar-inner), truncated to what
   a visitor with no account can act on: the logo, and the two ways in. No nav — there
   is nowhere to navigate; no profile menu — there is no profile; no refresh — there is
   no list to refresh. It is the same header with its middle removed, not a second one,
   so the two cannot drift apart in height, ground or alignment. */
function publicChromeHTML(){
  return ''
  + '<header class="dtopbar pubbar">'
  +   '<div class="dtopbar-inner">'
  +     brandHTML()
  +     '<span class="sp"></span>'
  +     '<div class="pubacts">'
  +       '<button class="btn sec" data-auth="login">Sign in</button>'
  +       '<button class="btn" data-auth="signup">Sign up</button>'
  +     '</div>'
  +   '</div>'
  + '</header>';
}

function chromeHTML(){
  if(!isSignedIn()) return publicChromeHTML();
  var nav = navItemsHTML();
  return ''
  + '<header class="dtopbar">'
  +   '<div class="dtopbar-inner">'
  /* Phone only (CSS hides both above the breakpoint): the app bar's leading slot
     and its title. The slot is empty on a top-level destination and holds a back
     arrow on a detail page — see syncAppBar, which fills both from the body's
     data-title / data-back. */
  +   '<a class="tb-back" id="tbBack" aria-label="Back" hidden>'
  +     '<svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-left"></use></svg>'
  +   '</a>'
  +   '<h2 class="tb-title" id="tbTitle"></h2>'
  +   brandHTML()
  +   '<nav class="tnav" aria-label="Primary">' + nav + '</nav>'
  +   '<span class="sp"></span>'
  +   '<div class="tb-act" id="topbarAction"></div>'
  /* Refresh, as a trailing app-bar action beside the avatar — phone only, and only
     on the list pages (CSS decides from body[data-page]; see the ≤600px block).
     ⚠️ Driven purely by CSS `display`, with NO `hidden` attribute: an author
     `display` beats `[hidden]` at any specificity, and this file has already been
     bitten by that six times. It carries `data-refresh`, so the existing delegated
     spinner handler picks it up with no extra wiring, and the page's own in-content
     refresh button is hidden at this width instead of being moved. */
  +   '<button class="tb-refresh" id="topbarRefresh" data-refresh aria-label="Refresh" title="Refresh">'
  +     '<svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-refresh"></use></svg>'
  +   '</button>'
  +   '<div class="dprofile">'
  +     '<button class="dprofbtn" id="dashProfBtn" aria-haspopup="true" aria-expanded="false">'
  +       '<svg class="ic dprof-ic" aria-hidden="true"><use href="assets/icons.svg#ti-user"></use></svg>'
  +       '<span class="dprof-name">' + esc(portalName()) + '</span>'
  +       '<span class="dprof-caret"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-down"></use></svg></span>'
  +     '</button>'
  +     '<div class="dprofmenu" id="dashProfMenu" role="menu" hidden>'
  +       '<a role="menuitem" href="account.html">Account</a>'
  +       '<a role="menuitem" href="billing.html">Payment &amp; Billing</a>'
  /* Who else can get in is an account fact, so it sits with Account and Billing.
     ⚠️ A button, not a link: there is no Users page any longer — it opens the modal
     that replaced it. */
  +       '<button role="menuitem" id="usersMenuBtn">Users</button>'
  /* Support, in the one menu that is on every page. ⚠️ Above the separator, with the
     other account-level things: it is not a destructive action and not a way out. */
  +       '<a role="menuitem" href="' + EXT.support + '" target="_blank" rel="noopener">Help &amp; support' + EXTSVG + '</a>'
  +       '<div class="sep"></div>'
  /* No longer a stub: with a session in the store there is something to sign out
     OF, and a control labelled "Sign out" sitting next to a working log-in that
     opened a stub dialog would be the surface telling a lie about itself. */
  +       '<button role="menuitem" id="signOutBtn">Sign out</button>'
  +     '</div>'
  +   '</div>'
  +   '</div>'
  + '</header>'
  + bottomNavHTML()
  /* Scroll-to-top, phone only (CSS hides it above the breakpoint). A floating button
     rather than a header action: the app bar is down to title + user, and "back to the
     top" is a page gesture, not a piece of chrome. Bottom-right, opposite the
     prototype's own gear, and lifted clear of the bottom navigation bar. */
  + '<button class="totop" id="toTopBtn" aria-label="Scroll to top" hidden>'
  +   '<svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-arrow-up"></use></svg>'
  + '</button>'
  // impersonation banner: persists across pages until Return is clicked
  + '<div class="imp-wrap" id="impBanner" hidden>'
  +   '<div class="imp-banner" role="status">'
  +     '<span>You are logged in as <b id="impEmail"></b></span>'
  +     '<span class="sp"></span>'
  +     '<button class="imp-return" id="impReturn">Return to my account</button>'
  +   '</div>'
  + '</div>';
}

function footerHTML(){
  return '<footer class="shellfoot" id="shellFoot">'
    + '<div class="shellfoot-in">'
    +   '<span>&copy; 2026 ThingsBoard</span>'
    +   '<span aria-hidden="true">&middot;</span>'
    +   '<a class="link" href="privacy.html">Privacy policy</a>'
    +   '<span aria-hidden="true">&middot;</span>'
    +   '<a class="link" href="terms.html">Terms of service</a>'
    +   '<span aria-hidden="true">&middot;</span>'
    +   '<a class="link" href="license-agreement.html">License agreement</a>'
    + '</div></footer>';
}

/* The settings panel is prototype-only scaffolding: it picks the dashboard state,
   plays the email-confirmation click, opens the styleguide and resets the store. */
/* ---------- prototype settings: context-aware ----------------------------------
   The panel shows only what applies to what is on screen. Everything else is
   HIDDEN, not disabled: a disabled control still asks the reader to work out why
   it is there, and none of these belong to the page they are not about.
   ⚠️ The body is rebuilt on every OPEN, not once at inject time — the context
   changes underneath it (a wizard opens, a modal opens) while the panel is closed,
   and a stale panel is worse than no panel. See wireGlobal's gear handler. */
function settingsContext(){
  var page = document.body.getAttribute('data-page') || '';
  var nl   = $('#nlModal'), lic = $('#licModal');
  return {
    page: page,
    home: page === 'home',
    landing: page === 'landing',
    licenses: page === 'licenses',
    billing: page === 'billing',
    /* the details surface counts in either presentation: the full page, or the
       modal mounted over any list */
    details: page === 'license' || !!(lic && !lic.hidden && $('#licModal #appView')),
    wizard: !!(nl && !nl.hidden),
    /* ⚠️ The NODE, not its state. The presentation setting has to be reachable
       BEFORE a wizard is open — you set the frame, then open one to look at it —
       and #nlModal exists on exactly the pages that load wizard.js. `wizard` above
       stays what it was: the settings that repaint an OPEN flow need it open. */
    wizardPage: !!nl,
    /* the billing step specifically, not just "a wizard is open": the autofill below
       has nothing to fill on the other three steps, and a panel action that does
       nothing where it appears is the thing this panel was cleaned up to stop doing */
    billStep: !!(nl && !nl.hidden && $('#nlStepBill') && !$('#nlStepBill').hidden)
  };
}
function settingsBodyHTML(){
  var c = settingsContext(), out = '';
  function group(head, body){ return body ? '<div class="sp-grouphead">' + head + '</div>' + body : ''; }

  // ---- Home: which dashboard state the page renders
  if(c.home){
    out += group('Dashboard state', Object.keys(DASH_STATES).map(function(k){
      return '<label class="sp-opt"><input type="radio" name="dashState" value="' + k + '"'
        + (Store.get('dash') === k ? ' checked' : '') + '><span>'
        + DASH_STATES[k].label.replace(/^Dashboard — /, '') + '</span></label>';
    }).join(''));
  }

  // ---- License details: how it presents, plus a way into each tier's details
  if(c.details){
    out += group('Details presentation',
      '<label class="sp-opt"><input type="radio" name="licDetails" value="modal"' + (licDetailsMode() === 'modal' ? ' checked' : '') + '><span>Modal (default)</span></label>'
      + '<label class="sp-opt"><input type="radio" name="licDetails" value="page"' + (licDetailsMode() === 'page' ? ' checked' : '') + '><span>Full page</span></label>');
    out += group('Open another tier',
      [['maker','Maker'],['prototype','Prototype'],['pilot','Pilot'],['startup','Startup'],
       ['business','Business'],['prototypeaddons','Prototype + add-ons'],['perp','Perpetual']]
      .map(function(t){ return '<a class="sp-opt" href="license.html?tier=' + t[0] + '"><span>' + t[1] + '</span></a>'; }).join(''));
  }

  // ---- Licenses page: the only variant scoped to it is the layout it already uses
  if(c.licenses){
    out += group('List layout',
      '<a class="sp-opt" href="licenses.html"><span>Product-first (neutral)</span></a>');
  }

  /* ---- which product the session behaves as having arrived for. Scoped to the three
     surfaces that STATE a product — the landing page, Home's new-user screen and the
     wizard — because nowhere else reads it. It stands in for a referrer the prototype
     has no way to see. */
  if(c.landing || c.home || c.wizard){
    out += group('Arrived for', PRODUCT_CHOICES.map(function(o){
      return '<label class="sp-opt"><input type="radio" name="arrived" value="' + o.v + '"'
        + (arrivedProduct() === o.v ? ' checked' : '') + '><span>' + o.t + '</span></label>';
    }).join(''));
  }

  /* ---- the wizard's own options. `Billing data` decides whether the flow has a
     billing step at all, so it belongs to the wizard — and it also drives the
     Payment & Billing page, which is why it appears in both contexts. */
  /* ---- the frame the purchase wizard wears. Scoped to `wizardPage` rather than
     `wizard`: the point of the setting is to compare presentations, and you choose
     one before opening a flow as often as while looking at it. It applies to all
     three modes of this wizard at once — they are one modal. */
  if(c.wizardPage){
    out += group('Purchase modal', WIZARD_PRESENTS.map(function(o){
      return '<label class="sp-opt"><input type="radio" name="wizardPresent" value="' + o[0] + '"'
        + (wizardPresent() === o[0] ? ' checked' : '') + '><span>' + o[1] + '</span></label>';
    }).join('')
      + '<div class="sp-hint">Desktop only \u2014 below 600px all three are the same full-screen sheet.</div>');
  }

  if(c.wizard){
    out += group('Customize step',
      '<label class="sp-opt"><input type="radio" name="custVariant" value="a"' + (custVariant() === 'a' ? ' checked' : '') + '><span>A — Plan card</span></label>'
      + '<label class="sp-opt"><input type="radio" name="custVariant" value="b"' + (custVariant() === 'b' ? ' checked' : '') + '><span>B — Locked inputs (default)</span></label>');
  }
  /* ⚠️ A demo lever for a state that is otherwise unreachable in one sitting: to see a
     purchase spend credit you would first have to downgrade something, and the credit a
     downgrade produces depends on where in its cycle that licence happens to be. This
     puts a known balance on the account so the applied-credit purchase can be shown. */
  if(c.billing || c.wizard){
    out += group('Account credit',
      '<label class="sp-opt"><input type="radio" name="credit" value="0"' + (accountCredit() ? '' : ' checked') + '><span>None</span></label>'
      + '<label class="sp-opt"><input type="radio" name="credit" value="120"' + (accountCredit() ? ' checked' : '') + '><span>$120.00 balance</span></label>');
  }
  if(c.wizard || c.billing){
    out += group('Billing data',
      '<label class="sp-opt"><input type="radio" name="billingData" value="saved"' + (billingSaved() ? ' checked' : '') + '><span>Saved</span></label>'
      + '<label class="sp-opt"><input type="radio" name="billingData" value="none"' + (billingSaved() ? '' : ' checked') + '><span>None</span></label>');
  }

  /* ---- the wizard's billing step: a demo shortcut, labelled as one.
     Eleven required fields is a lot to type to reach the one screen after them, and
     a reviewer is here to look at the flow, not to be a typist. It is scoped to the
     step because there is nothing to fill anywhere else. */
  if(c.billStep){
    out += group('Billing step',
      '<label class="sp-opt"><button class="link" id="devFillBilling">Demo: fill billing with test data</button></label>');
  }

  /* ---- always: the session. It is the one setting that applies to every page
     including the landing one, because it decides which of them you are even
     allowed to be on — so it is rendered first and never scoped to a context. */
  out += group('Session', Object.keys(AUTH_STATES).map(function(k){
    return '<label class="sp-opt"><input type="radio" name="session" value="' + k + '"'
      + (authState() === k ? ' checked' : '') + '><span>' + AUTH_STATES[k].label + '</span></label>';
  }).join(''));

  // ---- always: chrome-wide variant, dev actions, and the reference page
  out += group('Reference',
    '<a class="sp-opt" href="styleguide.html"><span>Design system <svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-arrow-right"></use></svg> styleguide</span></a>');
  /* ⚠️ `Confirm email change` is RENDERED ONLY while a change is pending — not
     rendered-and-disabled. It used to be a permanent disabled button, which is the
     same mistake the whole panel just stopped making: a control that is always there
     but almost never usable makes the reader work out why. The body is rebuilt on
     every open, so it appears the moment Account starts a change and is gone again
     the moment it is confirmed or cancelled. */
  out += group('Dev actions',
    (Store.get('pendingEmail')
      ? '<label class="sp-opt"><button class="link" id="devConfirmEmail">Confirm email change</button></label>'
      : '')
    + '<label class="sp-opt"><button class="link" id="resetDemo">Reset demo data</button></label>');
  return out;
}
function settingsHTML(){
  return '<button class="gearfab" id="gearBtn" aria-haspopup="dialog" aria-expanded="false" aria-label="Prototype settings" title="Prototype settings">'
    /* a real gear: a toothed ring around a hub, not a sun of spokes */
    + '<svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-settings"></use></svg>'
    + '</button>'
    + '<div class="settings-panel" id="settingsPanel" role="dialog" aria-label="Prototype settings" hidden>'
    +   '<h4>Prototype settings</h4>'
    +   '<div class="sp-note">Prototype-only — not part of the product UI.</div>'
    +   '<div class="sp-pick" id="settingsBody"></div>'
    + '</div>';
}

/* Shared dialogs. Every page gets all of them: they are defined once here, and
   the pages that use one only wire its behaviour. */
function modalsHTML(){
  return ''
  // generic dialog — title + body + a footer other code can extend
  + '<div class="overlay" id="overlay" hidden>'
  +   '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">'
  +     '<div class="mh"><h3 id="modalTitle">Title</h3><span class="spacer"></span>'
  +       '<button class="mclose" id="modalClose" aria-label="Close"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-x"></use></svg></button></div>'
  +     '<div class="mb" id="modalBody"></div>'
  +     '<div class="mf"><button class="btn sec" id="modalCloseBtn">Close</button></div>'
  +   '</div>'
  + '</div>'
  + PAY_MODAL_HTML + COUPON_MODAL_HTML + USERS_MODAL_HTML;
}

/* ---------- inject ---------- */
function injectChrome(){
  var main = $('#shellMain');
  document.body.insertAdjacentHTML('afterbegin', chromeHTML());
  if(main) main.insertAdjacentHTML('beforeend', footerHTML());
  document.body.insertAdjacentHTML('beforeend', modalsHTML() + settingsHTML());
}

/* ---------- nav highlight ---------- */
/* `data-nav` on <body> names the section; details pages set it from where the
   licence was opened, the same origin their back button uses. */
/* The phone app bar carries the page name, so orientation survives scrolling —
   the bottom bar shows where you are among the five destinations, the title says
   which page you are on when it is not one of them (Account, Billing, Security).
   Both come off the body: data-title is explicit per page rather than read from
   the H1, because Home's H1 is a greeting and the bar must still say "Home".
   data-back turns the leading slot into a back arrow; without it the slot stays
   empty, which is what a top-level destination should show. */
/* the leading app-bar slot is either a way back or a way out, and it swaps in place */
var TB_CHEVRON = 'chevron-left';
var TB_CLOSE   = 'x';
function syncAppBar(){
  var t = $('#tbTitle'), b = $('#tbBack');
  /* ⚠️ The bar carries NO page title — the page does, right under the header. The
     node stays and is emptied rather than removed: `.tb-title` is a named grid area
     in the bar's layout, and dropping it collapses the row. `data-title` on <body>
     is still read by the licence page's own chrome. */
  if(t) t.textContent = '';
  if(b){
    var href = document.body.getAttribute('data-back');
    b.hidden = !href;
    if(href) b.setAttribute('href', href);
    /* Two leading treatments, declared by the page: a chevron for a surface you step
       back through (Security → Account), an ✕ for a detail surface you leave. The
       details modal already closes with an ✕, so the full-page presentation of the
       same screen says the same thing rather than inventing a second gesture. */
    var close = document.body.getAttribute('data-backicon') === 'close';
    var svg = $('svg', b);
    /* ⚠️ Swap the <use> target, not the geometry: there is no geometry here any more.
       Both names are symbols in the sprite. */
    if(svg){
      var u = svg.querySelector('use');
      if(u) u.setAttribute('href', 'assets/icons.svg#ti-' + (close ? TB_CLOSE : TB_CHEVRON));
    }
    b.setAttribute('aria-label', close ? 'Close' : 'Back');
  }
}
/* The user list inside the profile submenu. Each row is the two-line list item the
   spec asks for — name with the email beneath on the left, icon actions on the
   right — and it reads the SAME dataset the Users page does, so adding or deleting
   a user shows up in both without a second source.
   ⚠️ Rendered on every open, not once at inject time: the chrome is built on page
   load and the list changes underneath it. */
/* ⚠️ `userRowHTML` / `usersListHTML` / `syncUsersSubmenu` are GONE (2026-09-17).
   They rendered the two-line user row that lived inside the profile submenu and,
   briefly, inside the Add user screen. Both surfaces were removed: user management
   is the Users page's table now, and `userRow` in components.js is the one row
   builder again. Nothing else read them. */

function syncTopNav(){
  var active = document.body.getAttribute('data-nav') || '';
  $$('.tnav-item').forEach(function(a){
    var on = a.getAttribute('data-nav') === active;
    a.classList.toggle('on', on);
    if(on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

/* ============================================================================
   Generic modal
   ========================================================================== */
var lastFocus = null;
function openModal(title, bodyHTML){
  var overlay = $('#overlay');
  lastFocus = document.activeElement;
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHTML;
  overlay.hidden = false;
  $('#modalClose').focus();
}
function closeModal(){
  var overlay = $('#overlay');
  overlay.hidden = true;
  /* ⚠️ The width is per-DIALOG, so it has to come off with the dialog. The renewal
     dialog opens on the wizard's two-column Review layout and asks for `wide`; without
     this the next generic dialog — a label edit, a confirm — inherits a 900px box. */
  $('#overlay .modal').classList.remove('wide');
  // drop any per-dialog buttons injected into the footer (e.g. a confirm)
  $$('#overlay .mf button').forEach(function(b){ if(b.id !== 'modalCloseBtn') b.remove(); });
  $('#modalCloseBtn').textContent = 'Close';
  if(lastFocus && lastFocus.focus) lastFocus.focus();
}
function openStub(title){ openModal(title, '<p>' + STUB + '</p>'); }
// add a primary action to the generic dialog's footer and return it
function modalAction(label, onClick, disabled){
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'btn'; b.textContent = label; b.disabled = !!disabled;
  b.addEventListener('click', onClick);
  $('#overlay .mf').appendChild(b);
  return b;
}

/* ============================================================================
   Global behaviours — delegated, so re-rendered rows keep working
   ========================================================================== */
function wireGlobal(){
  /* ---------- info icons (see infoIcon in components.js) ----------
     Only the TAP half lives here. On a pointer device `.tip` already opens on hover
     and on :focus-visible, so this handler stands down — otherwise a mouse click
     would PIN a bubble that hover is about to show anyway, and the same click would
     then be needed to unpin it. Below 600px there is no hover to rely on, so the tap
     is the whole interaction: toggle this one, and close any other that is open.
     Delegated from the document because these icons are rendered inside the wizard,
     which rebuilds its steps on every change — a per-node listener would be lost. */
  var canHover = window.matchMedia && window.matchMedia('(hover:hover)').matches;
  function closeInfo(except){
    $$('.infoic.show').forEach(function(n){ if(n !== except) n.classList.remove('show'); });
  }
  document.addEventListener('click', function(e){
    var ic = e.target.closest && e.target.closest('.infoic');
    if(!ic){ closeInfo(null); return; }
    /* ⚠️ SWALLOW THE CLICK ON EVERY DEVICE, including the ones where hover already
       shows the bubble and this handler has nothing else to do. The icon now lives
       inside plan cards, and a plan card IS a button — without this, reading the
       explanation of "1 production instance" selected that plan and moved the wizard
       on. The icon explains a choice; it must never make it. */
    e.preventDefault();
    e.stopPropagation();
    if(canHover) return;        // hover and :focus-visible already paint it
    closeInfo(ic);
    ic.classList.toggle('show');
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeInfo(null); });

  // generic dialog
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalCloseBtn').addEventListener('click', closeModal);
  $('#overlay').addEventListener('click', function(e){ if(e.target === $('#overlay')) closeModal(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && !$('#overlay').hidden) closeModal();
  });

  /* Sign out: the profile menu's last item, and the only way out of a session.
     ⚠️ Bound DIRECTLY, not delegated from the document like every other chrome
     action — `#dashProfMenu` carries a `click` listener that calls stopPropagation
     (it is how a click inside the menu avoids the document listener that closes it),
     so nothing inside that menu ever reaches a document-level delegate. The node is
     injected once per page and never re-rendered, so there is nothing to delegate for. */
  var soBtn = $('#signOutBtn');
  if(soBtn) soBtn.addEventListener('click', function(){ closeAllMenus(); signOut(); });

  /* Users: same binding style, same reason — `#dashProfMenu` calls stopPropagation on
     click (that is how a click inside it avoids the document listener that closes it),
     so nothing inside that menu ever reaches a document-level delegate. */
  var usersBtn = $('#usersMenuBtn');
  if(usersBtn) usersBtn.addEventListener('click', function(){ closeAllMenus(); UsersModal.open(); });

  // not-yet-specced actions
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-stub]');
    if(!el) return;
    if(el.tagName === 'A') e.preventDefault();
    e.stopPropagation();
    closeAllMenus();
    openStub(el.getAttribute('data-stub'));
  });

  // refresh buttons: a brief spin is the whole feedback
  document.addEventListener('click', function(e){
    var btn = e.target.closest('[data-refresh]');
    if(!btn) return;
    btn.classList.add('spinning');
    setTimeout(function(){ btn.classList.remove('spinning'); }, 600);
  });

  /* Scroll-to-top: appears once the page has actually been scrolled, hides again at
     the top. A plain scroll listener, not rAF — that does not fire in a hidden tab or
     an embedded panel (same trap the feed's lazy load works around). */
  (function(){
    var btn = $('#toTopBtn'), main = $('#shellMain');
    if(!btn || !main) return;
    var SHOW_AFTER = 200;                       // px: past a nudge, into a real scroll
    function sync(){ btn.hidden = main.scrollTop <= SHOW_AFTER; }
    main.addEventListener('scroll', sync);
    btn.addEventListener('click', function(){
      if(!main.scrollTo){ main.scrollTop = 0; return; }
      var from = main.scrollTop;
      main.scrollTo({ top:0, behavior:'smooth' });
      /* ⚠️ A smooth scroll is animated by the compositor, and the embedded preview
         panel throttles rendering — there the animation never advances and the button
         looks dead (measured: scrollTop stayed put for 1.8s). If nothing has moved by
         the time a real animation would be well under way, snap instead. */
      setTimeout(function(){ if(main.scrollTop === from) main.scrollTop = 0; }, 400);
    });
    sync();
  })();

  // profile hub
  var pb = $('#dashProfBtn'), pm = $('#dashProfMenu');
  /* One level, and it closes the way every menu here closes: click outside, or
     Escape. ⚠️ The nested Users level that used to hang off this menu is gone —
     with it went openUsersSub/closeUsersSub, the hover bridge that fixed its 6px
     dead zone, and the panel's own click handler that existed because this menu
     stops propagation. */
  if(pb){
    pb.addEventListener('click', function(e){
      e.stopPropagation();
      var open = pm.hidden;
      pm.hidden = !open;
      pb.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    /* ⚠️ stopPropagation keeps the document handler from closing the menu on a click
       INSIDE it — which is right for the panel, and wrong for its items. Help & support
       opens in a new tab, and with the menu still sitting there afterwards the click
       read as having done nothing at all. Any real menu item now closes it. */
    pm.addEventListener('click', function(e){
      e.stopPropagation();
      if(e.target.closest('[role="menuitem"]')){
        pm.hidden = true;
        pb.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('click', function(){
      if(!pm.hidden){ pm.hidden = true; pb.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function(e){
      if(e.key !== 'Escape' || pm.hidden) return;
      pm.hidden = true; pb.setAttribute('aria-expanded', 'false'); pb.focus();
    });
  }

  /* Impersonation banner (persisted, so it survives navigation).
     ⚠️ Guarded on the node, not on the stored value. The banner is part of the
     SIGNED-IN chrome only — a visitor with no session cannot be impersonating
     anyone — so on the landing page and the public documents `#impReturn` is simply
     not there, and an unguarded addEventListener threw before the rest of
     wireGlobal ever ran: menus, tabs and the settings panel all died with it.
     Everything else in here is either delegated from `document` or already guarded;
     this was the one direct binding to a node the public header omits. */
  var imp = Store.get('impersonating'), impRet = $('#impReturn');
  if(imp && impRet){ $('#impEmail').textContent = imp; $('#impBanner').hidden = false; document.body.classList.add('impersonating'); }
  if(impRet) impRet.addEventListener('click', function(){
    var was = Store.get('impersonating');
    Store.set('impersonating', null);
    if(was) logActivity({ type:'user.session_ended', f:{ entity:was } });
    $('#impBanner').hidden = true;
    document.body.classList.remove('impersonating');
  });

  // kebab (.menu) and toolbar (.dropwrap) menus, both delegated
  document.addEventListener('click', function(e){
    var trigger = e.target.closest('.menu [aria-haspopup], .dropwrap [aria-haspopup]');
    if(trigger){
      e.stopPropagation();
      var pop = trigger.parentNode.querySelector('.pop, .dropmenu');
      var willOpen = pop.hidden;
      closeAllMenus();
      pop.hidden = !willOpen;
      trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      setTimeout(elevateOpenPops, 0);
      return;
    }
    if(!e.target.closest('.pop, .dropmenu')) closeAllMenus();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeAllMenus(); });

  // tabs (licence details)
  wireTabs();
  // sortable column headers: the chevron flips, the mock data does not re-sort
  document.addEventListener('click', function(e){
    var th = e.target.closest('.sortable');
    if(!th) return;
    th.setAttribute('aria-sort', th.getAttribute('aria-sort') === 'descending' ? 'ascending' : 'descending');
  });

  PayCard.wire();          // the card modal is chrome now, not a page's
  /* delegated, because the banner is rebuilt every time a licence renders */
  document.addEventListener('click', function(e){
    if(e.target.closest('[data-paycard]')) PayCard.open(e.target.closest('[data-paycard]'));
  });
  wireSettingsPanel();
  syncTopNav();
  syncAppBar();
}

function closeAllMenus(){
  $$('.menu .pop:not([hidden]), .dropwrap .dropmenu:not([hidden])').forEach(function(pop){
    pop.hidden = true;
    var t = pop.parentNode.querySelector('[aria-haspopup]');
    if(t) t.setAttribute('aria-expanded', 'false');
  });
}

/* Every open menu is re-anchored as position:fixed on a top layer, so no
   ancestor's overflow can clip it. */
function elevateOpenPops(){
  var phone = window.matchMedia('(max-width:600px)').matches;
  $$('.dropmenu:not([hidden]), .menu .pop:not([hidden])').forEach(function(pop){
    /* ⚠️ A pop that CSS turns into a bottom sheet must be left alone: this helper
       writes position/top/left inline, and inline beats the stylesheet — the
       details overflow ended up a 44px-wide dropdown pinned under its own button
       instead of a full-width sheet. The relocated header overflow was the first
       case (see placeOverflow in license-details.js); Activity's period menu is
       the second — it is a .dropmenu, so it lands in this selector by default. */
    /* ⚠️ Keyed on the POP, not on where its button sits. It used to test
       `closest('.fs-headactions, #topbarAction')` — the two places placeOverflow()
       relocated the details overflow to. That relocation is gone (the ⋮ stays beside
       the other actions now), so an ancestor test would no longer match and this
       helper would pin the bottom sheet under a 44px button as a dropdown. The fact
       that matters was never the ancestor: it is that THIS pop is a sheet in CSS. */
    if(phone && (pop.id === 'headKebabPop' || pop.classList.contains('permenu'))) return;
    var anchor = pop.parentNode ? pop.parentNode.querySelector('[aria-haspopup]') : null;
    if(!anchor) return;
    var r = anchor.getBoundingClientRect();
    pop.style.position = 'fixed';
    pop.style.zIndex = '320';
    pop.style.top = (r.bottom + 4) + 'px';
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var alignRight = pop.classList.contains('right') || pop.classList.contains('pop');
    var left = alignRight ? (r.right - w) : r.left;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    pop.style.left = left + 'px';
    pop.style.right = 'auto';
    if(r.bottom + 4 + h > window.innerHeight - 8){ pop.style.top = Math.max(8, r.top - h - 4) + 'px'; }
  });
}

/* Tabs are delegated, not bound at boot. The licence details surface is mounted
   long after shared.js runs — and in modal mode it is mounted again on every
   open — so binding to the .tab elements that happen to exist at load time left
   Instances and Activity dead (only the default-selected Invoices panel showed).
   Delegation also keeps a page and an open modal independent: a tab acts on the
   tablist it belongs to, never on every tablist on the page. */
function tabsIn(tab){
  var list = tab.closest('[role="tablist"]') || tab.parentNode;
  return $$('.tab', list);
}
function selectTab(tab){
  var scope = tab.closest('.canvas, .fs-box, #shellMain') || document;
  tabsIn(tab).forEach(function(t){
    var sel = t === tab;
    t.setAttribute('aria-selected', sel ? 'true' : 'false');
    t.tabIndex = sel ? 0 : -1;
    var panel = $('#' + t.getAttribute('aria-controls'), scope) || $('#' + t.getAttribute('aria-controls'));
    if(panel) panel.hidden = !sel;
  });
}
function wireTabs(){
  document.addEventListener('click', function(e){
    var tab = e.target.closest('.tab');
    if(tab) selectTab(tab);
  });
  document.addEventListener('keydown', function(e){
    if(e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var tab = e.target.closest('.tab');
    if(!tab) return;
    e.preventDefault();
    var list = tabsIn(tab), i = list.indexOf(tab);
    var next = list[(i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length];
    selectTab(next); next.focus();
  });
}

/* ---------- prototype settings panel ---------- */
// Which Customize-step variant the wizard and Manage add-ons render. A stored
// setting so it survives navigation between pages; both flows read it at render.
/* ⚠️ B — "Locked inputs" — is the DEFAULT now. Same shape as licDetailsMode() below:
   only an explicit 'a' opts out, so a browser that has never touched the panel gets B
   and one that chose A keeps it. The key is not in the seed, so nothing about the
   stored state changes and the store key does not need a bump. */
function custVariant(){ return Store.get('custVariant') === 'a' ? 'a' : 'b'; }
/* ---------- the purchase modal's PRESENTATION: A dialog · B inset · C full screen --
   One shell, three frames. The steps, the content and the controller are identical in
   all three; only .fs-box's size and the backdrop change (see the CSS block of the
   same name). Stored, so the choice survives a reload and a page change, and cleared
   by Reset demo data along with everything else in the key.
   ⚠️ A is the default and the shape of that test says so: only an explicit 'b' or 'c'
   opts out, exactly as custVariant() and licDetailsMode() do, so a browser that has
   never opened the panel gets what the product ships. Not in the seed, so no store
   bump — an unknown value reads as A.
   ⚠️ BELOW 600px THE THREE ARE ONE. Every .fs-screen is a full-screen sheet on the
   phone, so the setting has nothing to change there; the panel says so, because the
   alternative is someone testing it on a phone and reporting it broken. */
function wizardPresent(){ var v = Store.get('wizardPresent'); return (v === 'b' || v === 'c') ? v : 'a'; }
var WIZARD_PRESENTS = [['a', 'A \u2014 Dialog (default)'], ['b', 'B \u2014 Inset'], ['c', 'C \u2014 Full screen']];
/* The wizard is the only surface carrying the attribute; it is set where the node is
   born (wizard.js, right after the markup is injected), on every open, and whenever
   the panel writes a new value. Pages that never load wizard.js have no node and this
   is a no-op on them. */
function applyWizardPresent(){
  var nl = $('#nlModal');
  if(nl) nl.setAttribute('data-present', wizardPresent());
}
/* the product every selling surface opens on — see the `arrived` note in the seed */
function arrivedProduct(){ return Store.get('arrived') === 'tbmq' ? 'tbmq' : 'thingsboard'; }
// How a licence row presents its details: its own page (A) or a modal over the
// page you were on (B). Read by the row wiring in components.js.
/* The modal is the default presentation; the page variant stays in the settings
   panel for comparison. Only an explicit 'page' choice opts out. */
function licDetailsMode(){ return Store.get('licDetails') === 'page' ? 'page' : 'modal'; }
// Whether the account already has billing data. With it the wizard commits on
// Review & pay (3 steps); without it a Payment & Billing step is appended and the
// commit moves there (4 steps). Nothing hardcodes the count — see totalSteps().
/* ---------- copying, and saying what was copied --------------------------------
   ⚠️ Every copy action used to confirm with the word "Copied" and nothing else. On a
   licence row that carries a key, an id and a plan name, the participant could not
   tell which of the three was on the clipboard, did not trust it, and went looking for
   the key by hand. The icons stay as they are — what changed is that the confirmation
   names the thing, through the snackbar. */
/* money, for the surfaces outside the wizard's IIFE (which has its own `money`) */
function fmtMoney(n){ return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
/* ⚠️ The confirmation belongs to the BUTTON, not to a snackbar at the edge of the
   screen. A copy is a micro-action taken on one small control; answering it at the
   bottom of the page makes the reader look away from the thing they just pressed to
   find out whether it worked. The tooltip is already there, already positioned, and
   already says what the button does — so it says what the button DID for a moment
   instead, then goes back.

   This is what `.tip.show` was built for: it is deliberately outside the
   `(hover:hover)` gate precisely so a tap on a phone gets the same answer a hover
   gets on a desktop (see the note above `.tip` in styles.css).

   `btn` optional: a copy fired from something without a tooltip still has to say
   something, and for that the snackbar is right. */
function copyValue(text, what, btn){
  var done = function(){
    var tip = btn && btn.closest && btn.closest('.tip');
    if(!tip){ Snack.show(what + ' copied'); return; }
    if(tip._copyT){ clearTimeout(tip._copyT); }
    else { tip._copyWas = tip.getAttribute('data-tip'); }   // only the FIRST press stores it
    tip.setAttribute('data-tip', what + ' copied');
    tip.classList.add('show', 'copied');
    tip._copyT = setTimeout(function(){
      tip.setAttribute('data-tip', tip._copyWas);
      tip.classList.remove('show', 'copied');
      tip._copyT = null;
    }, 1200);
  };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(String(text == null ? '' : text)).then(done, done);
  } else { done(); }
}

/* ---------- card input formatting ---------------------------------------------
   ⚠️ Sixteen unbroken digits cannot be checked by eye, and the panel is labelled
   "Powered by Stripe", which sets the expectation that it behaves like one. The
   participant re-read the number twice and still was not sure. Grouped in fours as it
   is typed, and the expiry gets its slash.

   The caret is restored by counting DIGITS before it rather than characters — with
   characters, inserting a space pushes the caret one position and the next keystroke
   lands in the wrong place. */
function fmtCardNumber(v){
  return String(v || '').replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
}
function fmtCardExpiry(v){
  var d = String(v || '').replace(/\D/g, '').slice(0, 4);
  return d.length <= 2 ? d : d.slice(0, 2) + ' / ' + d.slice(2);
}
function reformatCardField(el, fn){
  var before = el.value, caret = el.selectionStart == null ? before.length : el.selectionStart;
  var digitsBefore = before.slice(0, caret).replace(/\D/g, '').length;
  var after = fn(before);
  if(after === before) return;
  el.value = after;
  // walk forward through the formatted value until that many digits have passed
  var pos = 0, seen = 0;
  while(pos < after.length && seen < digitsBefore){ if(/\d/.test(after[pos])) seen++; pos++; }
  try { el.setSelectionRange(pos, pos); } catch(e){}
}
/* one delegated listener for every card field in the product — the wizard's billing
   step and the update-card modal both carry these ids/attributes */
/* ⚠️ AUTO-ADVANCE between the three subfields. They share one bordered box and read as
   one control, so a full number that leaves the caret sitting at its end asks the
   person to find the next box themselves — on a phone, where the next box is 60px wide
   and the keyboard covers half the screen. Advance only when the field is FULL, and
   never backwards: moving focus on a delete would trap a correction. */
function cardNext(el, sel){
  var box = el.closest('.paystripe'); if(!box) return;
  var next = box.querySelector(sel);
  if(next && !next.value) next.focus();
}
document.addEventListener('input', function(e){
  var el = e.target;
  if(!el || el.tagName !== 'INPUT') return;
  var nlb = el.getAttribute('data-nlb');
  if(el.id === 'payNum' || nlb === 'num'){
    reformatCardField(el, fmtCardNumber);
    if(el.value.replace(/\D/g, '').length >= 16) cardNext(el, '.ps-exp, #payExp');
  }
  else if(el.id === 'payExp' || nlb === 'exp'){
    reformatCardField(el, fmtCardExpiry);
    if(el.value.replace(/\D/g, '').length >= 4) cardNext(el, '.ps-cvc, #payCvc');
  }
});

/* ---------- the payment method on file ----------------------------------------
   `PAYMENT_METHOD` in data.js is the demo's card. It is now a FALLBACK: once someone
   enters one it is stored, and every surface that shows a card reads the stored one.
   ⚠️ `billingData` (the ⚙ panel's switch) and a stored card have to agree, so saving
   a card flips the switch to 'saved'. Otherwise the panel could claim there is no
   card while the billing page displayed the one just entered. */
function savedCard(){ return Store.get('paymentMethod') || null; }
function billingSaved(){ return Store.get('billingData') !== 'none' || !!savedCard(); }
/* Brand from the first digit — the same crude rule a form uses before it has asked
   anyone: 4 Visa, 5 Mastercard, 3 Amex. Anything else is just a card. */
function cardBrand(num){
  var d = String(num || '').replace(/\D/g, '');
  return d.charAt(0) === '4' ? 'VISA' : d.charAt(0) === '5' ? 'MASTERCARD'
       : d.charAt(0) === '3' ? 'AMEX' : 'CARD';
}
function storePaymentMethod(c){
  var d = String(c.num || '').replace(/\D/g, '');
  var last4 = d.slice(-4);
  Store.set('paymentMethod', {
    brand: cardBrand(d), last4: last4,
    num: '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ' + last4,
    // stored as DIGITS, so one rule formats it everywhere (12/28, 12 / 28, 1228 → 1228)
    exp: String(c.exp || '').replace(/\D/g, '').slice(0, 4),
    name: c.name || '', country: c.country || ''
  });
  Store.set('billingData', 'saved');
}
/* What every card surface renders from. Shape matches PAYMENT_METHOD so the callers
   do not have to know which of the two they got. */
function paymentMethodData(){
  var c = savedCard();
  if(!c) return PAYMENT_METHOD;
  var exp = c.exp.length === 4 ? (c.exp.slice(0,2) + ' / 20' + c.exp.slice(2)) : c.exp;
  return { brand:c.brand, num:c.num, exp:'<span class="pc-expw">Expires </span>' + exp };
}
/* ---------- scheduled changes: REMOVED -----------------------------------------
   ⚠️ `scheduleChange()` and `cancelScheduledChange()` are gone, and with them the rule
   they enforced: that anything which SHRINKS a licence — a lower plan, less capacity, an
   add-on switched off — took effect at the end of the paid period, while growth applied
   at once. Downgrades now recalculate immediately, so there is no record to write, no
   date to hold it, and nothing to cancel.

   What that rule was protecting is worth stating, because removing it accepted the cost
   knowingly: entitlement is enforced by the platform, so lowering a licence mid-period
   takes capacity away from a deployment that has already been paid for to this month's
   end. The decision supersedes that; this note is the only thing left of it.

   Removed with it: `lic.scheduled` as a stored shape, the SCHEDULED and
   SCHEDULE_CANCELED activity entries, the banner in the Plan block (`#schedLine` and
   renderScheduled in license-details.js) and its `Cancel this change` action, and the
   Review step's deferral box. Nothing seeded a `scheduled` record in DATASETS, so no
   demo data had to change. */

/* ---------- recovery from a failed payment ------------------------------------
   ⚠️ A failed payment is a property of the CARD, not of the licence — one card
   failing is why a licence is in that state, so replacing the card clears every
   licence that failed on it, not only the one whose banner you happened to open.
   Logged per licence, because each is a separate thing coming back to life. */
function recoverFailedPayments(){
  var ds = Store.get('datasets'), fixed = [];
  Object.keys(ds).forEach(function(k){
    ds[k].licenses.forEach(function(l){
      if(l.status !== 'payment_failed') return;
      l.status = 'active';
      l.updated = todayStr();
      if(fixed.indexOf(l.id) < 0) fixed.push(l.id);
      /* no actor: the charge is retried by the system, not pressed by anyone */
      logActivity({ type:'license.payment_recovered', licId:l.id, noActor:true,
        f:{ entity:(l.label || l.name) } });
    });
  });
  if(fixed.length) Store.save();
  return fixed.length;
}
function wireSettingsPanel(){
  var gearBtn = $('#gearBtn'), panel = $('#settingsPanel');
  /* ⚠️ Rebuilt on every open. The context (wizard open? details mounted?) changes
     while the panel is closed, and the radios' checked state changes from other
     surfaces too — rendering once at boot showed a panel that was right only for
     the moment the page loaded. Cheap: it is a handful of labels. */
  function toggle(open){
    if(open) $('#settingsBody').innerHTML = settingsBodyHTML();
    panel.hidden = !open;
    gearBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    /* on a phone the gear is collapsed into the screen edge until you reach for it —
       while its panel is open it has to be fully out (see .gearfab in the ≤600px block) */
    gearBtn.classList.toggle('on', open);
  }
  gearBtn.addEventListener('click', function(e){ e.stopPropagation(); toggle(panel.hidden); });
  panel.addEventListener('click', function(e){ e.stopPropagation(); });
  document.addEventListener('click', function(){ if(!panel.hidden) toggle(false); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !panel.hidden) toggle(false); });

  /* ⚠️ DELEGATED on the panel, not bound to the inputs. The panel body is rebuilt
     on every open, so a handler attached to the radios at boot would be attached to
     nodes that no longer exist — every setting would silently stop working. One
     listener on the container survives any number of rebuilds. */
  panel.addEventListener('change', function(e){
    var r = e.target.closest('input[type="radio"]');
    if(!r || !r.checked) return;
    switch(r.name){
      /* the session decides which pages exist at all, so it always navigates —
         staying put would leave you on a page the guard is about to reject */
      case 'session':
        setSession(r.value);
        return;
      // the dashboard state is a stored setting: pick it anywhere, land on Home with it
      case 'dashState':
        Store.set('dash', r.value);
        if(document.body.getAttribute('data-page') === 'home') location.reload();
        else location.href = 'index.html';
        return;
      /* the balance changes what a purchase charges, so an open wizard has to repaint */
      case 'credit':
        Store.set('credit', +r.value || 0);
        if(typeof renderCreditBlock === 'function') renderCreditBlock();
        if(window.NL && NL.refreshOpen) NL.refreshOpen();
        return;
      // billing data drives how many steps the wizard has; re-render it if it is open
      case 'billingData':
        Store.set('billingData', r.value);
        if(window.NL && NL.refreshOpen) NL.refreshOpen();
        return;
      // the details presentation is a stored setting; rows read it on click
      case 'licDetails':
        Store.set('licDetails', r.value);
        return;
      /* arrival changes what every selling surface states, and all three of them are
         re-rendered from one entry point rather than each knowing about the others */
      case 'arrived':
        Store.set('arrived', r.value);
        location.reload();
        return;
      /* the frame is an attribute, so it applies to an OPEN wizard without a
         re-render — nothing about the steps or the state depends on it */
      case 'wizardPresent':
        Store.set('wizardPresent', r.value);
        applyWizardPresent();
        return;
      // switching the Customize variant re-renders whichever flow is open
      case 'custVariant':
        Store.set('custVariant', r.value);
        if(window.NL && NL.refreshCustomize) NL.refreshCustomize();
        return;
    }
  });

  // the two dev actions, delegated for the same reason
  panel.addEventListener('click', function(e){
    if(e.target.closest('#resetDemo')){ Store.reset(); location.reload(); return; }
    /* the wizard owns its own state, so the panel asks it rather than writing into
       the DOM behind its back — NL.fillDemoBilling repaints the step from `bill` */
    if(e.target.closest('#devFillBilling')){
      if(window.NL && NL.fillDemoBilling) NL.fillDemoBilling();
      return;
    }
    // dev affordance: play the confirmation click that would arrive by email
    if(e.target.closest('#devConfirmEmail')){
      var pend = Store.get('pendingEmail');
      if(!pend) return;
      Store.set('pendingEmail', null);
      Store.set('emailConfirmed', pend.to);
      location.reload();
    }
  });
}

/* ============================================================================
   Snack — transient confirmation of a completed action
   ============================================================================
   A message at the bottom of the viewport that says something HAPPENED, then goes.

   ⚠️ What it carries and what it must not. Confirmations leave; problems stay.
     · carries — "Invitations sent", "Invite link copied": the action is over, the
       result is on screen behind it, and nothing is left to do about the message;
     · never carries — "Already has access", an invalid address, an empty required
       field. Those belong beside the input, because the person reads them WHILE
       fixing the thing they describe, and a message that removes itself on a timer
       is the worst possible place to put an instruction someone has to act on.

   ⚠️ It coexists with `.savednote` ("Saved · 14:32"), and they are not two ways of
   doing one thing — see the styleguide entry. The note states a PERSISTENT FACT
   about a form ("this page's values are stored, as of then") and stays until the
   next edit contradicts it. The snackbar reports a TRANSIENT EVENT on a list. They
   never appear on the same surface: the settings pages have a page-level Save and
   no list, the list pages have a list and no page-level Save.

   Positioned clear of the bottom navigation bar on the phone — under it, a
   confirmation would be a message nobody can read.
   ========================================================================== */
var Snack = (function(){
  var host = null, timer = null;
  function el(){
    if(host) return host;
    host = document.createElement('div');
    host.className = 'snack';
    host.id = 'snackbar';
    /* role=status, not alert: an alert interrupts, and a confirmation of something
       the person just did has no business taking the cursor off what they are doing */
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');
    host.hidden = true;
    document.body.appendChild(host);
    return host;
  }
  function hide(){
    if(timer){ clearTimeout(timer); timer = null; }
    if(host){ host.classList.remove('on'); host.hidden = true; }
  }
  /* ⚠️ Below 600px the snackbar anchors to the TOP — and the top of a licence panel is
     where the STATE banner lives (payment failed, over the instance limit). Measured at
     390: the snack landed exactly on `#subAlert`, hiding the problem for 4.2s to report
     something unrelated. A result must never cover the state it is not about.
     Measured at show time rather than expressed in CSS: the banner is per-surface and
     conditional, so no static offset can know whether it is there. Desktop is left
     alone — it anchors to the bottom, where no banner ever sits. */
  function clearOf(h){
    h.style.top = '';
    if(!window.matchMedia || !window.matchMedia('(max-width:600px)').matches) return;
    var band = $('#subAlert');
    if(!band || band.hidden) return;
    var r = band.getBoundingClientRect();
    if(r.height) h.style.top = Math.round(r.bottom + 12) + 'px';
  }
  /* `ms` is generous by default: long enough to read a sentence twice, short enough
     that it is gone before it becomes furniture. */
  function show(text, ms){
    var h = el();
    h.innerHTML = '<span class="snack-t"></span>'
      + '<button type="button" class="snack-x" aria-label="Dismiss"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-x"></use></svg></button>';
    $('.snack-t', h).textContent = text;
    $('.snack-x', h).addEventListener('click', hide);
    h.hidden = false;
    clearOf(h);
    // next frame, so the transition has a state to move from
    requestAnimationFrame(function(){ h.classList.add('on'); });
    if(timer) clearTimeout(timer);
    timer = setTimeout(hide, ms || 4200);
  }
  return { show:show, hide:hide };
})();

/* ============================================================================
   PayCard — the one update-card surface
   ============================================================================
   Lives here, not on the billing page, because two callers need it: the Billing &
   payment card block, and the "Payment failed" banner on a licence — which appears
   wherever the details surface does. Opening it over the licence keeps the person
   where the problem is; sending them to billing.html would have been one surface
   instead of two, and would also have thrown away what they were looking at.

   ⚠️ This is the ONE flow in the prototype that has to actually work. Everything
   else can be a placeholder without lying, because nothing has gone wrong; here
   something has, and the whole point is that the person fixed it. So Update stores
   the card, closes, says so, and the licence that failed on the old card comes back
   to life — see recoverFailedPayments().
   ========================================================================== */
var PayCard = (function(){
  var ov, opener = null, savedFns = [];
  function d(v){ return String(v || '').replace(/\D/g, ''); }
  var NODE = { num:'#payNum', exp:'#payExp', cvc:'#payCvc', name:'#payName', country:'#payCountry' };
  /* Same rules, same words as the wizard's billing step — the two surfaces share
     these fields and must not disagree about when a card is acceptable.
     Deliberately loose for a wireframe: no Luhn, 4242… passes. The one thing
     tightened is the expiry MONTH; "four digits" accepted 99/99. */
  var RULES = {
    num:  function(){ var v = d($('#payNum').value);
      if(!v) return 'Enter the card number.';
      return v.length >= 12 ? null : 'A card number is at least 12 digits — this one has ' + v.length + '.'; },
    exp:  function(){ var v = d($('#payExp').value);
      if(!v) return 'Enter the expiry date.';
      if(v.length < 4) return 'Use MM / YY — for example 12 / 28.';
      var mm = parseInt(v.slice(0, 2), 10);
      return (mm >= 1 && mm <= 12) ? null
        : 'There is no month ' + v.slice(0, 2) + ' — the first two digits are the month.'; },
    cvc:  function(){ var v = d($('#payCvc').value);
      if(!v) return 'Enter the security code.';
      return v.length >= 3 ? null : 'The security code is the 3 or 4 digits on the card.'; },
    name: function(){ return $('#payName').value.trim() ? null : 'Enter the name printed on the card.'; },
    country: function(){ return $('#payCountry').value ? null : 'Choose the country the card was issued in.'; }
  };
  function keyOf(el){
    if(!el || !el.id) return null;
    var hit = null;
    Object.keys(NODE).forEach(function(k){ if(NODE[k] === '#' + el.id) hit = k; });
    return hit;
  }
  function paint(k, msg){
    var slot = $('[data-payerr="' + k + '"]', ov);
    if(slot){ slot.textContent = msg || ''; slot.hidden = !msg; }
    var f = $(NODE[k], ov); f = f && f.closest('.field');
    if(!f) return;
    // num / exp / cvc share one .field: it stays marked while any of the three is wrong
    if(k === 'num' || k === 'exp' || k === 'cvc'){
      var any = ['num', 'exp', 'cvc'].some(function(x){
        var sl = $('[data-payerr="' + x + '"]', ov); return sl && !sl.hidden;
      });
      f.classList.toggle('err', any);
    } else { f.classList.toggle('err', !!msg); }
  }
  function badKeys(){ return Object.keys(RULES).filter(function(k){ return !!RULES[k](); }); }
  function clearAll(){
    $$('[data-payerr]', ov).forEach(function(s){ s.hidden = true; s.textContent = ''; });
    $$('.field.err', ov).forEach(function(f){ f.classList.remove('err'); });
    var sum = $('#payFormErr'); if(sum){ sum.hidden = true; sum.textContent = ''; }
  }
  /* The primary is never disabled, so a rejected click has to answer: every failure
     at once, and the cursor in the first of them. */
  function showAll(){
    var bad = badKeys();
    bad.forEach(function(k){ paint(k, RULES[k]()); });
    var sum = $('#payFormErr');
    if(sum){
      sum.textContent = bad.length === 1
        ? 'One field needs attention before the card can be saved.'
        : bad.length + ' fields need attention before the card can be saved.';
      sum.hidden = !bad.length;
    }
    var first = bad.length && $(NODE[bad[0]], ov);
    if(first){ first.focus(); if(first.scrollIntoView) first.scrollIntoView({ block:'center' }); }
    return bad.length === 0;
  }
  function open(from){
    ov = $('#payOverlay'); if(!ov) return;
    opener = from || null;
    $('#payNum').value = ''; $('#payExp').value = ''; $('#payCvc').value = '';
    var c = savedCard();
    if(c){ $('#payName').value = c.name || ''; $('#payCountry').value = c.country || ''; }
    clearAll();
    ov.hidden = false;
    $('#payClose').focus();
  }
  function close(){ if(!ov) return; ov.hidden = true; clearAll(); if(opener && opener.focus) opener.focus(); }
  function save(){
    if(!showAll()) return;              // rejected: every reason is now on screen
    storePaymentMethod({ num:$('#payNum').value, exp:$('#payExp').value,
                         name:$('#payName').value.trim(), country:$('#payCountry').value });
    var recovered = recoverFailedPayments();
    var c = savedCard();
    close();
    /* Confirmed, and the confirmation says what it did — including the part the
       person came for. A card saved in silence is the same as a card not saved. */
    openModal('Payment method updated',
      '<p>Charges now go to <b>' + esc(c.brand) + ' \u2022\u2022' + esc(c.last4) + '</b>.</p>'
      + (recovered
          ? '<p>' + (recovered === 1 ? 'The license that failed on the old card is active again.'
                                     : recovered + ' licenses that failed on the old card are active again.')
            + '</p>'
          : ''));
    savedFns.forEach(function(fn){ try { fn(); } catch(e){} });
  }
  function wire(){
    ov = $('#payOverlay'); if(!ov) return;
    $('#payClose').addEventListener('click', close);
    $('#payCancel').addEventListener('click', close);
    $('#payUpdate').addEventListener('click', save);
    ov.addEventListener('click', function(e){ if(e.target === ov) close(); });
    // blur answers; typing again withdraws the answer, because the value changed
    ov.addEventListener('focusout', function(e){ var k = keyOf(e.target); if(k) paint(k, RULES[k]()); });
    ov.addEventListener('change', function(e){ var k = keyOf(e.target); if(k === 'country') paint(k, RULES[k]()); });
    ov.addEventListener('input', function(e){
      var k = keyOf(e.target); if(!k) return;
      var slot = $('[data-payerr="' + k + '"]', ov);
      if(slot && !slot.hidden) paint(k, null);
      var sum = $('#payFormErr');
      if(sum && !sum.hidden && !badKeys().length){ sum.hidden = true; sum.textContent = ''; }
    });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && ov && !ov.hidden) close(); });
  }
  return { open:open, close:close, wire:wire,
           onSaved:function(fn){ savedFns.push(fn); } };
})();

/* ============================================================================
   Shared modal markup
   ========================================================================== */
/* ⚠️ ADD_USER_HTML is GONE (2026-09-17). Inviting is not a screen any more: it is
   one row sitting above the Users table, visible while you look at the people it
   adds to. The invitation model it introduced (mintInvite / inviteByToken /
   updateInvite / inviteURL, above) survives unchanged and is now driven from
   page-users.js. `.paymodal.narrow` went with it — nothing else used that width. */

var PAY_MODAL_HTML = ''
+ '<div class="payoverlay" id="payOverlay" hidden>'
+ '  <div class="paymodal" role="dialog" aria-modal="true" aria-labelledby="payTitle">'
+ '    <div class="paymodal-h">'
+ '      <h3 id="payTitle">Update payment method</h3>'
+ '      <span class="sp"></span>'
+ '      <button class="paymodal-x" id="payClose" aria-label="Close"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-x"></use></svg></button>'
+ '    </div>'
+ '    <div class="paymodal-b">'
+ '      <div class="field">'
+ '        <label>Card number</label>'
+ '        <div class="paystripe" id="payCardBox">'
+ '          <svg class="ic paystripe-glyph" aria-hidden="true"><use href="assets/icons.svg#ti-credit-card"></use></svg>'
+ '          <input class="ps-num" id="payNum" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" aria-label="Card number" maxlength="24">'
+ '          <input class="ps-exp" id="payExp" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / YY" aria-label="Expiry date" maxlength="7">'
+ '          <input class="ps-cvc" id="payCvc" type="text" inputmode="numeric" autocomplete="cc-csc" placeholder="CVC" aria-label="Security code" maxlength="4">'
+ '        </div>'
/* one slot per subfield, same as the wizard's billing step — the three share a
   .field, so they cannot share a message without the reader guessing which */
+ '        <div class="fielderr" data-payerr="num" hidden></div>'
+ '        <div class="fielderr" data-payerr="exp" hidden></div>'
+ '        <div class="fielderr" data-payerr="cvc" hidden></div>'
+ '      </div>'
+ '      <div class="field2">'
+ '        <div class="field"><label for="payName">Cardholder name</label><input type="text" id="payName" autocomplete="cc-name" value="Mariia Panchuk">'
+ '          <div class="fielderr" data-payerr="name" hidden></div></div>'
+ '        <div class="field"><label for="payCountry">Country</label><select id="payCountry"><option value="">Select a country</option><option>United States</option><option>Ukraine</option><option>Germany</option><option>United Kingdom</option></select>'
+ '          <div class="fielderr" data-payerr="country" hidden></div></div>'
+ '      </div>'
+ '    </div>'
+ '    <div class="paymodal-f">'
+ '      <div class="formerr" id="payFormErr" role="alert" hidden></div>'
+ '      <span class="paystripe-note">Powered by <b>Stripe</b></span>'
+ '      <span class="sp"></span>'
+ '      <button class="btn sec" id="payCancel">Cancel</button>'
/* ⚠️ Not disabled. Same contract as the wizard's billing step: a disabled primary
   cannot say why it is disabled, so this one accepts the click and answers it. */
+ '      <button class="btn" id="payUpdate">Update</button>'
+ '    </div>'
+ '  </div>'
+ '</div>';

var COUPON_MODAL_HTML = ''
+ '<div class="payoverlay" id="couponOverlay" hidden>'
+ '  <div class="paymodal tight" role="dialog" aria-modal="true" aria-labelledby="couponTitle">'
+ '    <div class="paymodal-h">'
+ '      <h3 id="couponTitle">Apply coupon</h3>'
+ '      <span class="sp"></span>'
+ '      <button class="paymodal-x" id="couponClose" aria-label="Close"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-x"></use></svg></button>'
+ '    </div>'
+ '    <div class="paymodal-b">'
+ '      <div class="field">'
+ '        <label for="couponInput">Coupon code</label>'
+ '        <input type="text" id="couponInput" placeholder="Enter coupon code" autocomplete="off" aria-label="Coupon code">'
+ '      </div>'
+ '    </div>'
+ '    <div class="paymodal-f">'
+ '      <span class="sp"></span>'
+ '      <button class="btn sec" id="couponCancel">Cancel</button>'
+ '      <button class="btn" id="couponApply" disabled>Apply</button>'
+ '    </div>'
+ '  </div>'
+ '</div>';

/* ---------- the coupon dialog: ONE controller, two callers -----------------------
   ⚠️ It used to be wired inside license-details.js, against `#couponBtn` — which was
   right while the licence surface was the only place a coupon could be applied. The
   purchase flow applies one too now (on Review, beside the price it changes), and a
   second controller over the same markup is how two surfaces end up disagreeing about
   what Apply does. So the dialog lives with its markup and takes a callback: the
   CALLER decides what applying means — a snackbar on the licence, a recalculated total
   in the wizard — and the dialog only collects the code.

   ⚠️ The `Apply` button IS disabled until something is typed here, unlike the billing
   primaries. It is not refusing a judgement it could explain: there is literally no
   code yet, and the field it belongs to is the only one in the dialog. */
var Coupon = (function(){
  /* ⚠️ BOUND LAZILY, on first open — not at definition. The dialog's markup is injected
     by injectChrome(), which runs in the boot block at the END of this file, so every
     node this controller needs is null while the file is still being evaluated. Bound
     eagerly, `open()` became a silent no-op: the click was handled, nothing appeared,
     and there was no error to find it by. Caught in a flow measurement, not in console. */
  var ov, input, apply, wired = false;
  var onApply = null, returnTo = null;
  function refresh(){ apply.disabled = !input.value.trim(); }
  function close(){
    ov.hidden = true;
    // focus goes back to whatever opened it, not to a fixed button that may not exist
    if(returnTo && document.contains(returnTo)) returnTo.focus();
    returnTo = null; onApply = null;
  }
  function wire(){
    if(wired) return true;
    ov = $('#couponOverlay'); input = $('#couponInput'); apply = $('#couponApply');
    if(!ov || !input || !apply) return false;
    input.addEventListener('input', refresh);
    $('#couponClose').addEventListener('click', close);
    $('#couponCancel').addEventListener('click', close);
    apply.addEventListener('click', function(){
      if(apply.disabled) return;
      var code = input.value.trim(), cb = onApply;
      close();
      if(cb) cb(code);
    });
    ov.addEventListener('click', function(e){ if(e.target === ov) close(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !ov.hidden) close(); });
    wired = true;
    return true;
  }
  return {
    open: function(cb, opener){
      if(!wire()) return;
      onApply = cb || null; returnTo = opener || null;
      input.value = ''; refresh(); ov.hidden = false; input.focus();
    }
  };
})();

/* ---------- boot ---------- */
/* ⚠️ The guard runs FIRST and the boot stops on a redirect. `location.replace` does
   not halt the current script, so without the early return this page would carry on
   building chrome and wiring behaviours for a document that is already navigating
   away — cheap, but it also runs page scripts against a state they were guarded out
   of, and any error from that lands in the console as a real-looking failure. */
/* ============================================================================
   USERS — the whole surface, in a modal, on every page
   ============================================================================
   Was `users.html` + `page-users.js` until 2026-09-23. It is the same content, not a
   summary of it: the invite card and the table with `Log in as` and Delete on each row.
   The page is deleted — a destination nothing links to is a second source of truth
   waiting to drift, and this prototype has deleted one of those before.

   It lives in shared.js rather than a file of its own because it is opened from the
   PROFILE MENU, which is chrome and therefore on every page — the same reason the pay
   and coupon modals are here. It rides `.fs-screen` / `.fs-box`, so it is a centred
   modal above 600px and a full-screen sheet below it, exactly like the wizard and the
   auth surface; `.usersbox` only narrows it and lets the content set its height.

   ⚠️ The ids are the page's own, kept deliberately: the page is gone, so nothing can
   collide with them, and keeping them means the invite controller and `wireSearch`
   below are the page's code moved, not rewritten.
   ============================================================================ */
var USERS_MODAL_HTML = ''
+ '<div class="fs-screen usersscreen" id="usersModal" role="dialog" aria-modal="true"'
+   ' aria-labelledby="usersModalTitle" hidden>'
+   '<div class="fs-box usersbox">'
/* ⚠️ THREE things in the header, in this order: the title, the one action that is
   about the whole surface rather than about a row, and the way out. `Copy invite link`
   came UP here from the invite row (2026-09-24): it is not part of typing addresses —
   it is the other way to invite, and putting it beside the field made the row read as
   one control with two buttons. One copy-link now serves both states, which is also
   why the invite row below could stop being mounted twice. */
+     '<div class="fs-header usershead">'
+       '<h2 class="fs-maintitle" id="usersModalTitle">Users</h2>'
+       '<span class="spacer"></span>'
+       '<button class="link invite-link" data-invitelink>'
+         '<svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-link"></use></svg>'
+         '<span>Copy invite link</span>'
+       '</button>'
+       '<button class="fs-close" id="usersModalClose" aria-label="Close"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-x"></use></svg></button>'
+     '</div>'
+     '<div class="fs-body usersbody">'

/* ============================================================================
   BACKEND DEPENDENCIES assumed by the invite controls (mocked in the store):
   invitation records carrying a single-use token, an expiry and a revoked flag;
   server-side burning of the token on redemption; and mail delivery for the email
   path. See mintInvite / inviteByToken / inviteURL above.
   ============================================================================ */

/* ⚠️ ONE MOUNT, not two. The surface used to hold a whole second copy of the invite
   card — a `solo` one and a `compact` one inside the table state — because the two
   states were two nodes and only one was ever in the layout. They are not two nodes
   any more: the invite row is ALWAYS here and only the table comes and goes, so the
   duplicate is gone and with it the pair of ids the controller had to keep in step. */
+       '<p class="solo-line" id="usersSoloLine" hidden>You’re the only person with access. Invite users by sending link to the e-mail or copy invite link and send directly.</p>'
+       '<div class="inviterow" id="usersInvite">'
+         '<input type="email" class="invite-in" id="usersEmail" autocomplete="off"'
+           ' placeholder="Add comma separated emails to invite" aria-label="Emails to invite">'
+         '<button class="btn invite-go" data-invite>Invite</button>'
+       '</div>'
/* ⚠️ The message slot is ALWAYS in the layout, empty or not: toggled with visibility,
   not `hidden`, so an error cannot change the block's height. Problems only —
   confirmations go to the snackbar and leave. */
+       '<p class="invite-msg" id="usersMsg"></p>'
+       '<p class="invite-note">Anyone you invite gets full access to your licenses, invoices and payment method.</p>'

/* The list. ⚠️ NO TOOLBAR: search and refresh were removed 2026-09-24. Both were
   list-page furniture that came along when this was a page — the account's own people
   are a short, known list you read rather than query, and there is nothing to refresh
   in a demo whose only writer is the row above. `wireSearch` went with the field.
   ⚠️ NO FRAME EITHER: the table sat in `.listcard.listframe` and the invite row in a
   `.setcard`, so the modal was three stacked boxes inside a fourth. The sheet is the
   only surface now; everything below sits directly on it. */
+       '<div id="usersTable" hidden>'
+         '<table>'
+           '<thead><tr>'
+             '<th>Name</th><th>Email</th>'
+             '<th class="sortable" aria-sort="descending" tabindex="0">Added <span class="arrow" aria-hidden="true"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-down"></use></svg></span></th>'
+             '<th aria-label="User actions"></th>'
+           '</tr></thead>'
+           '<tbody></tbody>'
+         '</table>'
+         '<div class="pager air">'
+           '<span class="spacer"></span>'
+           '<span>Items per page<select aria-label="Items per page"><option>10</option><option>20</option><option>50</option><option>100</option></select></span>'
+           '<span class="range"></span>'
+           '<span class="pagebtns">'
+             '<button disabled aria-label="First page"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-chevrons-left"></use></svg></button><button disabled aria-label="Previous page"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-left"></use></svg></button><button disabled aria-label="Next page"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-right"></use></svg></button><button disabled aria-label="Last page"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-chevrons-right"></use></svg></button>'
+           '</span>'
+         '</div>'
+       '</div>'
+     '</div>'
+   '</div>'
+ '</div>';

if(guardSession()){
  injectChrome();
  wireGlobal();
  syncTitleRow();
  wireStickyFrames();
}

/* ---------- the page title row (phone) ----------------------------------------
   Title on the left, the page's own actions on the right, on ONE line. Replaces
   three different arrangements: a full-width primary above the list, a refresh
   button floating in the toolbar, and a back arrow in the app bar.
   ⚠️ It has to be JS, not CSS: the buttons live inside the toolbar and the back
   arrow inside the settings grid, and no `order` carries a child across a parent.
   The nodes are MOVED, not cloned — one control, one handler, wherever it sits.
   ⚠️ Idempotent and reversible: called on load and on resize, it rebuilds above the
   breakpoint by putting every node back where it came from, so the desktop keeps
   its own arrangement byte for byte. */
function syncTitleRow(){
  var h1 = $('#shellMain .lic-h1');
  if(!h1) return;
  var phone = window.matchMedia('(max-width:600px)').matches;
  var row = $('#pageTitleRow');

  if(!phone){
    if(!row) return;
    // put everything back exactly where it was, then drop the row
    $$('[data-homed]', row).forEach(function(el){
      var home = document.querySelector(el.getAttribute('data-homed'));
      if(home) home.appendChild(el);
      el.removeAttribute('data-homed');
    });
    if(row.classList.contains('pagehead') || row.classList.contains('setcard-h-page')){
      row.classList.remove('pagetitlerow');   // markup row: only the class was ours
      row.removeAttribute('id');
    } else {
      row.parentNode.insertBefore(h1, row);
      row.remove();
    }
    return;
  }
  if(row) return;                       // already built

  /* ⚠️ ONE header row per page, never a row inside a row. The settings pages ship
     their own `.pagehead` (sticky, holding the H1 and Save) in markup; inserting a
     second row around the H1 nested them, and the two flex contexts disagreed —
     measured, the title's centre sat 7px above the buttons'. So when a `.pagehead`
     already exists it IS the header row: it gets the class and keeps its children,
     and the back control is moved into it. Otherwise one is created. */
  /* ⚠️ `.setcard-h-page` counts too. Account and Billing put their header INSIDE the
     page's one white frame (see styles.css), so their h1 no longer sits in a
     `.pagehead` — and this lookup, matching nothing, built a second row around the
     title and left Save behind in the card header. Measured on 375: "Account" and
     "Change password" in one row, "Save" orphaned on the next. Both header shapes are
     header rows; the rule is "a header already exists", not "it is called pagehead". */
  var existing = h1.closest('.pagehead, .setcard-h-page');
  if(existing){
    row = existing;
    row.id = 'pageTitleRow';
    row.classList.add('pagetitlerow');
  } else {
    row = document.createElement('div');
    row.className = 'pagetitlerow';
    row.id = 'pageTitleRow';
    h1.parentNode.insertBefore(row, h1);
  }

  /* a back control leads the row when the page declares one — the same data-back
     the app bar used to read, so there is still one source for "where does back go" */
  var backHref = document.body.getAttribute('data-back');
  var back = $('#secBackBtn');
  if(backHref && back){
    back.setAttribute('data-homed', '.secgrid');
    if(!existing) row.appendChild(back);
  }
  if(!existing){
    row.appendChild(h1);
    var sp = document.createElement('span');
    sp.className = 'ptr-sp';
    row.appendChild(sp);
  } else if(back && row.firstChild !== back){
    row.insertBefore(back, row.firstChild);   // back leads the row it already had
  }

  /* refresh first, then the primary — so the destructive-free, always-present
     action keeps one position across every list page and the page-specific one
     sits on the outside */
  [['[data-refresh]', '.lic-controls, .insttoolbar'], ['#licNewBtn', '.lic-controls']]
    .forEach(function(pair){
      var host = $('#shellMain ' + pair[1].split(',')[0]) || $('#shellMain ' + (pair[1].split(',')[1] || '').trim());
      var el = host ? $(pair[0], host) : null;
      if(!el) return;
      el.setAttribute('data-homed', '#shellMain ' + (el.closest('.lic-controls') ? '.lic-controls' : '.insttoolbar'));
      row.appendChild(el);
    });
}
window.addEventListener('resize', syncTitleRow);

/* ============================================================================
   THE STICKY LIST BLOCK — the measuring half of the pattern in styles.css
   ============================================================================
   Three jobs, and each exists because CSS alone gets it wrong here:

   1 · THE COLUMN ROW'S OFFSET. It sticks beneath the toolbar, and the toolbar is a
       different height on every page — taller on Licenses, which carries chips and a
       switch, and taller again at any width where it wraps. A constant would leave a
       gap on one page and overlap on another, so the measured height goes into
       `--barH` and is re-measured whenever the bar changes size.

   2 · WHETHER THE TABLE WRAPPER SCROLLS. ⚠️ `overflow-x:auto` makes the wrapper a
       sticky container in BOTH axes, and a `thead` inside it then sticks to a box with
       no height limit — which is to say, to nothing the reader can see. So the wrapper
       is only made scrollable when the table actually overflows it. Measured: at
       1280px every list table fits; at 660px the Licenses table is 874px against a
       574px box, which is what the wrapper was put there for. Below 600px rows are
       cards and the question does not arise.

   3 · THE SHADOW. ⚠️ Not "scrollTop > 0": on a page whose title is tall the toolbar has
       not reached the top yet, and a shadow under an unstuck block is a line drawn for
       no reason. The test is whether the bar has actually arrived at the container's
       top edge, which is a rect comparison and cannot disagree with what is on screen.

   The licence panel uses the same function with its own scroller — see
   LicenseDetails; `.fs-body` is a separate scroll from the page. */
/* ⚠️ WHERE A STUCK ELEMENT ACTUALLY COMES TO REST, which is not the scroller's top
   edge. A scroll container's PADDING insets its scrollport, and a sticky child's `top`
   resolves against that inset — so on a container with `padding-top:8px` the element
   parks at 8px and a test against the raw edge never fires. Caught on the licence
   panel, where the modal body carried exactly that. Reading both the padding and the
   element's own `top` means the test says "stuck" when the eye does. */
function stickyLine(scroller, el){
  var pad = parseFloat(getComputedStyle(scroller).paddingTop) || 0;
  var off = parseFloat(getComputedStyle(el).top) || 0;
  return scroller.getBoundingClientRect().top + pad + off;
}
function wireStickyFrame(frame, scroller){
  if(!frame || !scroller || frame.__sticky) return;
  frame.__sticky = true;
  var bar = frame.querySelector('.stickybar');
  var wrap = frame.querySelector('.tablescroll');
  var table = wrap && wrap.querySelector('table');

  function measure(){
    if(bar) frame.style.setProperty('--barH', Math.round(bar.getBoundingClientRect().height) + 'px');
    if(wrap && table){
      /* compare against the wrapper's own content box, and do it with the scroller off,
         or a wrapper that is already scrolling reports a clientWidth narrowed by its
         own scrollbar and never switches back */
      wrap.classList.remove('is-scrollable');
      if(table.scrollWidth > wrap.clientWidth + 1) wrap.classList.add('is-scrollable');
    }
  }
  function syncShadow(){
    if(!bar) return;
    var stuck = scroller.scrollTop > 0
      && bar.getBoundingClientRect().top <= stickyLine(scroller, bar) + 0.5;
    frame.classList.toggle('is-stuck', stuck);
  }
  function sync(){ measure(); syncShadow(); }

  scroller.addEventListener('scroll', syncShadow, { passive:true });
  window.addEventListener('resize', sync);
  /* ⚠️ THE TABLE IS OBSERVED TOO, and leaving it out is what made the first version
     wrong: this runs at boot, from the chrome, and the page module that fills the
     tbody has not loaded yet — so the overflow test ran against an empty table, found
     it narrow, and left the wrapper inert on a list that would need it. */
  if(window.ResizeObserver){
    var ro = new ResizeObserver(sync);
    if(bar) ro.observe(bar);
    if(table) ro.observe(table);
  }
  sync();
}
/* The licence panel's tab bar: the same stuck-block behaviour with no column row under
   it and no table to measure, against whichever container actually scrolls. */
function wireStickyTabs(tabs, scroller){
  if(!tabs || !scroller) return;
  function sync(){
    tabs.classList.toggle('is-stuck', scroller.scrollTop > 0
      && tabs.getBoundingClientRect().top <= stickyLine(scroller, tabs) + 0.5);
  }
  scroller.addEventListener('scroll', sync, { passive:true });
  window.addEventListener('resize', sync);
  sync();
}
/* ⚠️ Walk up for the scroll container rather than naming it: the same surface is
   mounted in a modal (`.fs-body`) and in a page (`#shellMain`), and hard-coding either
   leaves the other with a tab bar that scrolls away.
   ⚠️ IT MUST NOT TEST `scrollHeight > clientHeight`. That was the first version, and it
   was wrong for the reason the check looked right: this runs at MOUNT, when the panel
   has been filled but not yet laid out at its final height, so `.fs-body` measured as
   not-yet-scrollable and the walk fell through to the page — which, in a modal, is the
   one container that is explicitly not scrolling. Overflow alone is the right test now
   that `.content` no longer claims to be a scroller. */
function scrollParent(el){
  for(var p = el.parentElement; p; p = p.parentElement){
    var o = getComputedStyle(p).overflowY;
    if(o === 'auto' || o === 'scroll') return p;
  }
  return $('#shellMain') || document.scrollingElement;
}
/* every list page has at most one frame, and the page scroll is always #shellMain */
function wireStickyFrames(){
  var scroller = $('#shellMain');
  if(scroller) $$('#shellMain .listframe').forEach(function(f){ wireStickyFrame(f, scroller); });
}

/* ---------- users: the actions, shared by every surface that lists them ----------
   Users is a nested level inside the profile menu, which is chrome — so add,
   delete and log-in-as live here rather than in page-users.js. */
/* One surface reads the user list: the Users MODAL, and it is injected on every page
   (2026-09-23 — it used to be `users.html`, which existed on one). So this no longer
   has to test whether anything is mounted; it restates the one surface there is.
   ⚠️ Still a function, and still called rather than inlined: `storeDeleteUser` and the
   invite row both have to restate the table after they change it, and neither should
   know how that table is built. */
function refreshUsersSurfaces(){
  if(window.UsersModal) UsersModal.render();
}

function openDeleteUser(email){
  openModal('Delete user', '<p>Delete <b>' + email + '</b>? They will lose access to this portal.</p>');
  var foot = $('#overlay .mf');
  var del = document.createElement('button');
  del.type = 'button'; del.className = 'btn ter'; del.id = 'delUserBtn'; del.textContent = 'Delete';
  foot.appendChild(del);
  $('#modalCloseBtn').textContent = 'Cancel';
  del.addEventListener('click', function(){
    storeDeleteUser(email);      // removed from every dataset, and persisted
    refreshUsersSurfaces();
    closeModal();
  });
  $('#modalCloseBtn').focus();
}
function impersonate(email){
  Store.set('impersonating', email);   // survives navigation
  $('#impEmail').textContent = email;
  $('#impBanner').hidden = false;
  document.body.classList.add('impersonating');
  /* An impersonation session is the one action here that most needs a trail:
     everything done inside it happens under someone else's name. Both ends are
     logged (see the Return handler in shared.js) — a start without an end leaves
     "how long did this last" unanswered. */
  logActivity({ type:'user.session_started', f:{ entity:email } });
}
function openLoginAs(email){
  openModal('Log in as', '<p>Log in as <b>' + email + '</b>? You will see and manage the portal on their behalf until you return to your own account.</p>');
  var foot = $('#overlay .mf');
  var go = document.createElement('button');
  /* ⚠️ Not 'Log in'. The FLOW is called "Log in as" and keeps that name (it is a
     different thing from signing in — see the Users table), but this button is the
     confirm of a dialog that already says whose account it is, so it names the act
     rather than repeating a verb the portal now spells 'Sign in' everywhere else. */
  go.type = 'button'; go.className = 'btn'; go.id = 'loginAsBtn'; go.textContent = 'Continue as this user';
  foot.appendChild(go);
  $('#modalCloseBtn').textContent = 'Cancel';
  go.addEventListener('click', function(){ impersonate(email); closeModal(); });
  $('#modalCloseBtn').focus();
}

document.addEventListener('click', function(e){
  var du = e.target.closest('[data-deluser]');
  if(du){ openDeleteUser(du.getAttribute('data-deluser')); return; }
  var la = e.target.closest('[data-loginas]');
  if(la){ openLoginAs(la.getAttribute('data-loginas')); return; }
});

/* ⚠️ The Add user controller is GONE with its screen. Inviting, the invite link and
   the "who has access" list all live on the Users page now (page-users.js), which
   is the one place the subject — the people — is already on screen. What stays here
   is what every page needs: the invitation records above, and the delegated
   [data-loginas] / [data-deluser] handlers, which the table's rows use. */


/* ============================================================================
   UsersModal — the controller the Users page used to be
   ============================================================================
   Every behaviour below is `page-users.js` moved, not rewritten: the two states, the
   invite row mounted in both, the search. What changed is only the host — the surface
   is now injected on every page and shown on demand, so this runs AFTER the boot block
   above, when `injectChrome` has put the markup in the document.
   ============================================================================ */
var UsersModal = (function(){
  var scr = $('#usersModal');
  if(!scr) return { open:function(){}, close:function(){}, render:function(){} };
  var lastFocus = null;

  /* ---------- which state ----------
     Only the TABLE comes and goes now. The invite row, its note and the header's
     copy-link are on screen either way, so "solo" is down to one extra sentence. */
  function solo(){ return (DATA().users || []).length < 2; }

  function render(){
    var isSolo = solo();
    var line = $('#usersSoloLine'), tbl = $('#usersTable');
    if(line) line.hidden = !isSolo;
    if(tbl)  tbl.hidden  = isSolo;
    if(isSolo) return;

    var b = $('#usersTable tbody'); if(!b) return;
    var us = DATA().users.slice().sort(function(a, c){ return dateKey(c.created) - dateKey(a.created); });
    b.innerHTML = us.map(userRow).join('');
    var r = $('#usersTable .pager .range');
    if(r) r.textContent = '1–' + us.length + ' of ' + us.length;
  }

  /* ---------- the invite row ----------
     the same loose test the sign-up field uses: the prototype has no address book to
     check against, so "could this be an address" is as far as it can honestly go */
  var EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

  function parse(v){
    var seen = {}, bad = [], ok = [];
    v.split(/[,;\s]+/).forEach(function(raw){
      var e = raw.trim(); if(!e) return;
      if(!EMAIL_RE.test(e)){ bad.push(e); return; }
      if(seen[e.toLowerCase()]) return;              // typed twice is asked once
      seen[e.toLowerCase()] = 1; ok.push(e);
    });
    return { ok:ok, bad:bad };
  }
  /* Duplicate detection is against who ALREADY HAS ACCESS, not against who has been
     invited: an outstanding invitation is not access, and telling someone their
     colleague "already has access" because a link is in flight would be false. */
  function hasAccess(email){
    return (DATA().users || []).some(function(u){ return u.email.toLowerCase() === email.toLowerCase(); });
  }
  /* ⚠️ The slot never leaves the layout — `visibility`, not `hidden` — so showing or
     clearing a message cannot change the block's height. PROBLEMS only; confirmations
     go to the snackbar, which is outside the layout entirely. */
  function say(html){
    var el = $('#usersMsg'); if(!el) return;
    el.innerHTML = html || '';
    el.classList.toggle('on', !!html);
  }
  /* one line, always — the slot reserved for it is one line tall */
  function dupesText(d){
    return d.length === 1
      ? '<b>' + esc(d[0]) + '</b> already has access.'
      : '<b>' + d.length + ' of these</b> already have access.';
  }
  function dupesPhrase(d){ return d.length === 1 ? d[0] : d.length; }
  function badText(b){
    return b.length === 1
      ? '<b>' + esc(b[0]) + '</b> is not an email address.'
      : '<b>' + b.length + ' entries</b> are not email addresses.';
  }

  function invite(){
    var input = $('#usersEmail'), p = parse(input.value);
    if(!p.ok.length && !p.bad.length){ say(null); return; }

    var dupes = p.ok.filter(hasAccess), fresh = p.ok.filter(function(e){ return !hasAccess(e); });
    if(!fresh.length){ say(dupesText(dupes)); return; }

    fresh.forEach(function(em){
      mintInvite(em);                                     // single-use token, 7-day expiry
      /* ⚠️ `pending:true` and NO name: an invitation is not a person yet — there is no
         name, no join date, and nothing anyone should be able to do to them. The row
         says the one true thing (this address was invited) and waits. */
      storeAddUser({ email:em, pending:true, created:todayStr() });
    });
    refreshUsersSurfaces();

    input.value = '';
    /* ⚠️ The confirmation is a SNACKBAR, not a line under the field: it reports a
       finished event whose result is already on screen — the new rows — so it has no
       reason to stay, and no reason to occupy the block's height. */
    var sent = fresh.length === 1
      ? 'Invitation sent to ' + fresh[0]
      : 'Invitations sent to ' + fresh.length + ' people';
    Snack.show(sent + (dupes.length ? ' · ' + dupesPhrase(dupes) + ' already had access' : ''));
    /* whatever was not an address stays in the field, and the reason stays with it */
    if(p.bad.length){ input.value = p.bad.join(' '); say(badText(p.bad)); }
    else say(null);
  }

  /* ---- Copy invite link: one click, and that is the whole interaction ----------
     It lives in the HEADER now, beside the title: it is the other way to invite, not a
     second button belonging to the field. `mintInvite(null)` still writes a single-use
     record with a 7-day expiry, and `inviteByToken` still refuses a spent, revoked or
     expired one. */
  function copyLink(){
    var rec = mintInvite(null);                           // no address: an open single-use door
    var url = inviteURL(rec.token);
    var done = function(){ Snack.show('Invite link copied'); };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(done, done);
    } else { done(); }
    logActivity({ type:'user.invite_link_created', f:{} });
  }

  /* one listener on the whole sheet: the copy-link is in the header, the Invite button
     in the body, and the table is re-rendered under both */
  scr.addEventListener('click', function(e){
    if(e.target.closest('[data-invite]')){ invite(); return; }
    if(e.target.closest('[data-invitelink]')){ copyLink(); return; }
  });
  var inp = $('#usersEmail');
  inp.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){ e.preventDefault(); invite(); }
  });
  // typing again clears the previous answer: a stale "already has access" beside a
  // field you are editing is answering a question you stopped asking
  inp.addEventListener('input', function(){ say(null); });

  /* ---------- open / close ---------- */
  function open(){
    lastFocus = document.activeElement;
    render();                              // the list may have changed since last time
    scr.hidden = false;
    $('#usersModalClose').focus();
  }
  function close(){
    scr.hidden = true;
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $('#usersModalClose').addEventListener('click', close);
  scr.addEventListener('click', function(e){ if(e.target === scr) close(); });
  /* ⚠️ CAPTURE phase, and that is the whole fix. `Log in as` and Delete open the
     generic dialog ON TOP of this surface, so Escape has to peel that one first — the
     usual guard for it is `$('#overlay').hidden`, which is what every other Escape
     handler in the prototype tests. In the bubble phase that guard LIES: `wireGlobal`
     registered its own Escape handler at boot, long before this file reached its end,
     so on the same keypress the generic one runs first, hides `#overlay`, and by the
     time this one looks the overlay is already hidden — both layers close at once.
     Measured: one Escape over the delete dialog closed the dialog AND the Users modal.
     Capture runs document-down, so this handler sees the state as it was when the key
     was pressed, and stands aside while a dialog is open. */
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && !scr.hidden && $('#overlay').hidden) close();
  }, true);

  return { open:open, close:close, render:render };
})();

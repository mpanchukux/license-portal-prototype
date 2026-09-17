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

/* ---------- helpers ---------- */
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(x){ return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* ---------- dates: the prototype's "today" is pinned to Aug 19 2026 ---------- */
var MONF = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
// exact day count (Howard Hinnant's days-from-civil) — no Date() needed
function epochDay(y, m, d){
  y -= (m <= 2) ? 1 : 0;
  var era = Math.floor((y >= 0 ? y : y - 399) / 400), yoe = y - era * 400;
  var doy = Math.floor((153 * ((m > 2 ? m - 3 : m + 9)) + 2) / 5) + d - 1;
  var doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}
var TODAY_DAY = epochDay(2026, 8, 19);
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
  var KEY = 'tb-license-portal-demo-v9';
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function seed(){
    return {
      dash: 'dashB',              // which dashboard state the settings panel selected — the large account
      datasets: clone(DATASETS),  // the account as the demo has mutated it
      pendingEmail: null,         // { from, to } while an email change awaits confirmation
      impersonating: null,        // email of the user being impersonated
      dismissed: {},              // one-time banners the viewer closed
      showCanceled: false,        // Licenses table: cancelled rows are hidden until asked for
      licDetails: 'modal',        // licence details open over the list; 'page' is the comparison
      /* Who is looking. 'out' is the seed, so a fresh browser starts on the landing
         page and reaches the portal through sign-up or log-in — and so "Reset demo
         data" returns there without needing a line of its own. */
      auth: 'out',                // 'out' | 'new' | 'existing'
      pendingPurchase: null,      // { product, kind, plan } carried across the sign-up navigation
      /* Everything below is written by a form and read by a surface. `null` means
         "nothing saved yet", and every reader falls back to what the markup or
         PAYMENT_METHOD already shows — so an untouched demo looks exactly as it did. */
      paymentMethod: null,        // { brand, last4, num, exp, name, country } once a card is entered
      profile: null,              // Account: name, company, address — see PROFILE_FIELDS
      billingAddress: null,       // Billing: the address printed on invoices
      passwordChangedAt: null,    // Security: a date string. The password itself is NEVER stored.
      seq: 0                      // counter behind generated licence ids and keys
    };
  }
  var state, fresh = false;
  try { state = JSON.parse(localStorage.getItem(KEY)); } catch(e){ state = null; }
  if(!state || !state.datasets || !state.datasets.A){ state = seed(); fresh = true; }

  function save(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }
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
var PORTAL_ACTOR = 'mpanchuk@thingsboard.io';
function nowTs(){
  var d = new Date(), p2 = function(n){ return ('0' + n).slice(-2); };
  return 'Aug 19 2026, ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
}
function logActivity(e){
  var a = {
    kind: e.kind, ts: nowTs(),
    entityType: e.entityType, entityName: e.entityName,
    actor: e.actor || PORTAL_ACTOR, action: e.action, txt: e.txt
  };
  if(e.delta) a.delta = e.delta;
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
    logActivity({ kind:'canceled', entityType:'Subscription', entityName:l.name, action:'CANCELED',
      txt:'Subscription <b>' + esc(l.name) + '</b>' + (l.label ? ' (' + esc(l.label) + ')' : '')
        + ' was canceled by ' + PORTAL_ACTOR + ' — active until <b>' + fmtDate(l.event) + '</b>.' });
  }
  return l;
}
function storeAddLicense(lic){
  DATA().licenses.unshift(lic);
  Store.save();
  logActivity({ kind:'created', entityType:lic.type, entityName:lic.name, action:'ADDED',
    txt:esc(lic.type) + ' <b>' + esc(lic.name) + '</b> was created by ' + PORTAL_ACTOR + '.' });
}
function storeAddUser(u){
  DATA().users.push(u);
  Store.save();
  logActivity({ kind:'user', entityType:'User', entityName:u.name || u.email, action:'INVITED',
    txt:'User <b>' + esc(u.name || u.email) + '</b> was invited by ' + PORTAL_ACTOR + '.' });
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
  logActivity({ kind:'user', entityType:'User', entityName:email, action:'DELETED',
    txt:'User <b>' + esc(email) + '</b> was removed by ' + PORTAL_ACTOR + '.' });
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
    logActivity({ kind:'updated', entityType:'Label', entityName:lic.name, action:'UPDATED',
      txt: lic.label
        ? ('Label <b>' + esc(lic.label) + '</b> was set on <b>' + esc(lic.name) + '</b> by ' + PORTAL_ACTOR + '.')
        : ('Label was cleared on <b>' + esc(lic.name) + '</b> by ' + PORTAL_ACTOR + '.') });
  }
  repaintLabelSurfaces();
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
   Billing & payment step — leaving it "saved" would let a brand-new account check
   out against a payment method it never entered. The gear panel can still flip it
   back; this only sets the honest starting point. */
function setSession(next, opts){
  opts = opts || {};
  if(!AUTH_STATES[next]) next = 'out';
  Store.set('auth', next);
  if(next === 'new'){
    Store.set('dash', 'dashempty');
    Store.set('billingData', 'none');
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
   ⚠️ This was a switchable variant ('v1' put Users in the nav and the title in the
   bar). The alternative is gone — array, getters, body class, CSS branches, stored
   key and settings group all removed. If a comparison is ever needed again it is a
   new decision, not a flag to re-enable. */
var NAV_ITEMS = [
  { key:'home',     href:'index.html',    label:'Home',
    ic:'<path d="M4 10.5L12 4l8 6.5V20h-5.5v-6h-5v6H4z"/>' },
  { key:'licenses', href:'licenses.html', label:'Licenses',
    ic:'<circle cx="9" cy="15" r="3"/><path d="M11.2 12.8L19 5"/><path d="M15.5 5H19v3.5"/>' },
  { key:'invoices', href:'invoices.html', label:'Invoices',
    ic:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9.5 8.5h5M9.5 12.5h5"/>' },
  { key:'activity', href:'activity.html', label:'Activity',
    ic:'<path d="M3 12h4l2.5-6 3 12 2.5-6h6"/>' },
  /* ⚠️ BACK in the destination strip (2026-09-17), reversing the pass that moved it
     into a nested level of the profile menu. That level put `Log in as` and Delete —
     the two most destructive actions in the portal — one hover away, inside a
     control that does not exist on touch and stopped scaling after a handful of
     rows. Both now live only on the Users page, where the subject is on screen. */
  { key:'users',    href:'users.html',    label:'Users',
    ic:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/>'
      + '<path d="M16.5 5.5a3 3 0 0 1 0 5.6"/><path d="M17.5 19a5.4 5.4 0 0 0-1.6-3.8"/>' },
];

function navItemsHTML(extraClass){
  return NAV_ITEMS.map(function(n){
    return '<a class="tnav-item' + (extraClass ? ' ' + extraClass : '') + '" data-nav="' + n.key
      + '" href="' + n.href + '">' + n.label + '</a>';
  }).join('');
}
/* The phone's primary navigation: a bottom bar, not a drawer. Five destinations
   at the same level are what a bottom bar is for — a drawer hid all five behind a
   press and put "Users" out of sight. Same items, same `data-nav`, same
   `.tnav-item` class, so syncTopNav marks the current one here too and there is
   still one source of truth. Hidden above 600px by CSS; the desktop strip is
   hidden below it. */
function bottomNavHTML(){
  return '<nav class="bnav" id="bottomNav" aria-label="Primary">'
    + NAV_ITEMS.map(function(n){
        return '<a class="tnav-item bnav-item" data-nav="' + n.key + '" href="' + n.href + '">'
          + '<span class="bn-ic"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'
          + n.ic + '</svg></span>'
          + '<span class="bn-lb">' + n.label + '</span></a>';
      }).join('')
    + '</nav>';
}
/* The logo lockup, used by both headers. Its destination is the only thing that
   differs: signed in it leads Home, signed out it leads back to the landing page —
   which is the whole of requirement "the logo goes to Home instead". */
function brandHTML(){
  var href = isSignedIn() ? 'index.html' : 'landing.html';
  return '<a class="dbrand" href="' + href + '" aria-label="ThingsBoard Licenses" title="'
    + (isSignedIn() ? 'Home' : 'ThingsBoard Licenses') + '">'
    + '<div class="mark"><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/></svg></div>'
    + '<div class="bt">ThingsBoard<span class="bsep">\u00b7</span>Licenses</div>'
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
  +     '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
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
  +     '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'
  +       '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 4v5h-5"/></svg>'
  +   '</button>'
  +   '<div class="dprofile">'
  +     '<button class="dprofbtn" id="dashProfBtn" aria-haspopup="true" aria-expanded="false">'
  +       '<svg class="icon dprof-ic" viewBox="0 0 24 24" aria-hidden="true">'
  +         '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/></svg>'
  +       '<span class="dprof-name">Mariia Panchuk</span>'
  +       '<span class="dprof-caret" aria-hidden="true">▾</span>'
  +     '</button>'
  +     '<div class="dprofmenu" id="dashProfMenu" role="menu" hidden>'
  +       '<a role="menuitem" href="account.html">Account</a>'
  +       '<a role="menuitem" href="billing.html">Billing &amp; payment</a>'
  /* Support, in the one menu that is on every page. ⚠️ Above the separator, with the
     other account-level things: it is not a destructive action and not a way out. */
  +       '<a role="menuitem" href="' + EXT.support + '" target="_blank" rel="noopener">Help &amp; support</a>'
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
  +   '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5"/><path d="M6 11l6-6 6 6"/></svg>'
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
    licenses: page === 'licenses',
    billing: page === 'billing',
    /* the details surface counts in either presentation: the full page, or the
       modal mounted over any list */
    details: page === 'license' || !!(lic && !lic.hidden && $('#licModal #appView')),
    wizard: !!(nl && !nl.hidden),
    /* the billing step specifically, not just "a wizard is open": the autofill below
       has nothing to fill on the other three steps, and a panel action that does
       nothing where it appears is the thing this panel was cleaned up to stop doing */
    billStep: !!(nl && !nl.hidden && $('#nlStep4') && !$('#nlStep4').hidden)
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

  /* ---- the wizard's own options. `Billing data` decides whether the flow has a
     billing step at all, so it belongs to the wizard — and it also drives the
     Billing & payment page, which is why it appears in both contexts. */
  if(c.wizard){
    out += group('Customize step',
      '<label class="sp-opt"><input type="radio" name="custVariant" value="a"' + (custVariant() === 'a' ? ' checked' : '') + '><span>A — Plan card</span></label>'
      + '<label class="sp-opt"><input type="radio" name="custVariant" value="b"' + (custVariant() === 'b' ? ' checked' : '') + '><span>B — Locked inputs</span></label>');
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
    '<a class="sp-opt" href="styleguide.html"><span>Design system → styleguide</span></a>');
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
    + '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'
    +   '<circle cx="12" cy="12" r="3"/>'
    +   '<path d="M12 2.6l1.3 2.2 2.5-.5.5 2.5 2.2 1.3-1.4 2.1 1.4 2.1-2.2 1.3-.5 2.5-2.5-.5L12 21.4l-1.3-2.2-2.5.5-.5-2.5-2.2-1.3 1.4-2.1-1.4-2.1 2.2-1.3.5-2.5 2.5.5z"/>'
    + '</svg>'
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
  +       '<button class="mclose" id="modalClose" aria-label="Close">✕</button></div>'
  +     '<div class="mb" id="modalBody"></div>'
  +     '<div class="mf"><button class="btn sec" id="modalCloseBtn">Close</button></div>'
  +   '</div>'
  + '</div>'
  + PAY_MODAL_HTML + COUPON_MODAL_HTML;
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
var TB_CHEVRON = '<path d="M15 5l-7 7 7 7"/>';
var TB_CLOSE   = '<path d="M6 6l12 12M18 6L6 18"/>';
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
    if(svg) svg.innerHTML = close ? TB_CLOSE : TB_CHEVRON;
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
    pm.addEventListener('click', function(e){ e.stopPropagation(); });
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
    if(was) logActivity({ kind:'user', entityType:'Session', entityName:was, action:'LOGIN_AS_END',
      txt:'Session as <b>' + esc(was) + '</b> was ended by ' + PORTAL_ACTOR + '.' });
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
    if(phone && (pop.closest('.fs-headactions, #topbarAction') || pop.classList.contains('permenu'))) return;
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
function custVariant(){ return Store.get('custVariant') === 'b' ? 'b' : 'a'; }
// How a licence row presents its details: its own page (A) or a modal over the
// page you were on (B). Read by the row wiring in components.js.
/* The modal is the default presentation; the page variant stays in the settings
   panel for comparison. Only an explicit 'page' choice opts out. */
function licDetailsMode(){ return Store.get('licDetails') === 'page' ? 'page' : 'modal'; }
// Whether the account already has billing data. With it the wizard commits on
// Review & pay (3 steps); without it a Billing & payment step is appended and the
// commit moves there (4 steps). Nothing hardcodes the count — see totalSteps().
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
/* ---------- scheduled changes -------------------------------------------------
   THE RULE, and it applies to plan changes and add-ons alike:
     · anything that GROWS  — higher plan, more capacity, an add-on switched on —
       applies immediately, prorated, as it always did;
     · anything that SHRINKS — lower plan, less capacity, an add-on switched off —
       applies at the END of the current paid period.

   ⚠️ The reason is not billing neatness. Entitlement is enforced by the platform, so
   taking it away mid-period stops a running instance the person has already paid for
   this month. Immediate-and-symmetric would have been less code and wrong.

   ⚠️ A MIXED change (something grows, something else shrinks) is scheduled WHOLE. The
   test is "does any entitlement decrease", not "is the net bill lower": splitting one
   agreement into two half-applied ones is the thing this rule exists to prevent, and
   the person agreed to one change on one date.

   The record lives on the licence so every surface can read it: what changes, to what,
   and when it takes effect. Cancelling it restores nothing — the licence was never
   modified — it just drops the record and says so. */
function scheduleChange(lic, rec){
  lic.scheduled = rec;                       // { summary, effective, apply:{…}, kind }
  lic.updated = 'Aug 19 2026';
  Store.save();
  logActivity({ kind:'updated', entityType:rec.kind === 'plan' ? 'Plan' : 'Add-on',
    entityName:lic.name, action:'SCHEDULED',
    txt:'A change to <b>' + esc(lic.label || lic.name) + '</b> was scheduled by ' + PORTAL_ACTOR
      + ' for ' + fmtDate(rec.effective) + ' — ' + esc(rec.summary),
    delta:rec.summary });
}
function cancelScheduledChange(licId){
  var lic = licById(licId);
  if(!lic || !lic.scheduled) return null;
  var was = lic.scheduled;
  delete lic.scheduled;
  lic.updated = 'Aug 19 2026';
  Store.save();
  logActivity({ kind:'updated', entityType:'License', entityName:lic.name, action:'SCHEDULE_CANCELED',
    txt:'The scheduled change to <b>' + esc(lic.label || lic.name) + '</b> was canceled by '
      + PORTAL_ACTOR + ' — the license keeps its current plan and capacity.' });
  return was;
}

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
      l.updated = 'Aug 19 2026';
      if(fixed.indexOf(l.id) < 0) fixed.push(l.id);
      logActivity({ kind:'updated', entityType:'License', entityName:l.name, action:'PAYMENT_RECOVERED',
        txt:'Payment succeeded on <b>' + esc(l.label || l.name) + '</b> after the payment method was updated — the license is active again.' });
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
      // billing data drives how many steps the wizard has; re-render it if it is open
      case 'billingData':
        Store.set('billingData', r.value);
        if(window.NL && NL.refreshOpen) NL.refreshOpen();
        return;
      // the details presentation is a stored setting; rows read it on click
      case 'licDetails':
        Store.set('licDetails', r.value);
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
  /* `ms` is generous by default: long enough to read a sentence twice, short enough
     that it is gone before it becomes furniture. */
  function show(text, ms){
    var h = el();
    h.innerHTML = '<span class="snack-t"></span>'
      + '<button type="button" class="snack-x" aria-label="Dismiss">\u2715</button>';
    $('.snack-t', h).textContent = text;
    $('.snack-x', h).addEventListener('click', hide);
    h.hidden = false;
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
+ '      <button class="paymodal-x" id="payClose" aria-label="Close">✕</button>'
+ '    </div>'
+ '    <div class="paymodal-b">'
+ '      <div class="field">'
+ '        <label>Card number</label>'
+ '        <div class="paystripe" id="payCardBox">'
+ '          <svg class="icon paystripe-glyph" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>'
+ '          <input class="ps-num" id="payNum" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="Card number" aria-label="Card number">'
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
+ '      <button class="paymodal-x" id="couponClose" aria-label="Close">✕</button>'
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

/* ---------- boot ---------- */
/* ⚠️ The guard runs FIRST and the boot stops on a redirect. `location.replace` does
   not halt the current script, so without the early return this page would carry on
   building chrome and wiring behaviours for a document that is already navigating
   away — cheap, but it also runs page scripts against a state they were guarded out
   of, and any error from that lands in the console as a real-looking failure. */
if(guardSession()){
  injectChrome();
  wireGlobal();
  syncTitleRow();
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
    if(row.classList.contains('pagehead')){
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
  var existing = h1.closest('.pagehead');
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

/* ---------- users: the actions, shared by every surface that lists them ----------
   Users is a nested level inside the profile menu, which is chrome — so add,
   delete and log-in-as live here rather than in page-users.js. */
/* One surface reads the user list now: the Users page. Kept as a function rather
   than inlined because `storeDeleteUser` and the invite row both have to restate
   whatever is mounted, and on any other page that is nothing at all. */
function refreshUsersSurfaces(){
  if(typeof renderUsersPage === 'function') renderUsersPage();   // only on users.html
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
  logActivity({ kind:'user', entityType:'Session', entityName:email, action:'LOGIN_AS',
    txt:'Session was started as <b>' + esc(email) + '</b> by ' + PORTAL_ACTOR + '.' });
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

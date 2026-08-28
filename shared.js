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

/* ============================================================================
   Store — the mock backend
   ============================================================================
   One localStorage key holds the whole demo: which dashboard state is selected
   plus a working copy of every dataset. Mutations go through the helpers below
   so each one persists; "Reset demo data" drops the key and reseeds from data.js.
   ========================================================================== */
var Store = (function(){
  var KEY = 'tb-license-portal-demo-v1';
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function seed(){
    return {
      dash: 'dashboard',          // which dashboard state the settings panel selected
      datasets: clone(DATASETS),  // the account as the demo has mutated it
      pendingEmail: null,         // { from, to } while an email change awaits confirmation
      impersonating: null,        // email of the user being impersonated
      dismissed: {},              // one-time banners the viewer closed
      showCanceled: false,        // Licenses table: cancelled rows are hidden until asked for
      licDetails: 'modal',        // licence details open over the list; 'page' is the comparison
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
  dashempty:        { label:'Dashboard — new user (empty)',  variant:'A', empty:true },
  dashgrantpending: { label:'Dashboard — grant pending',     variant:'A', empty:true, grant:'pending' },
  dashgrant:        { label:'Dashboard — grant approved',    variant:'G' }
};
function dashState(){ return DASH_STATES[Store.get('dash')] || DASH_STATES.dashboard; }
function dashVariant(){ return dashState().variant; }
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
function storeCancelLicense(id){
  var l = licById(id);
  if(l){ l.status = 'canceled'; Store.save(); }
  return l;
}
function storeAddLicense(lic){ DATA().licenses.unshift(lic); Store.save(); }
function storeAddUser(u){ DATA().users.push(u); Store.save(); }
function storeDeleteUser(email){
  var ds = Store.get('datasets');
  Object.keys(ds).forEach(function(k){
    ds[k].users = ds[k].users.filter(function(u){ return u.email !== email; });
  });
  Store.save();
}
/* A label is the one field the demo lets you edit, from three places: the pencil
   on the details surface, that surface's ⋮, and a row's ⋮ in the table. It writes
   through the store, then every surface that renders a label is repainted, so the
   table, the dashboard block and the details page never disagree. */
function setLicenseLabel(lic, val){
  if(!lic) return;
  lic.label = String(val || '').trim();
  Store.save();                        // the object came out of the store, so this persists it
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
   Chrome — one definition, injected into every page
   ========================================================================== */
var NAV_ITEMS = [
  { key:'home',     href:'index.html',    label:'Home' },
  { key:'licenses', href:'licenses.html', label:'Licenses' },
  { key:'invoices', href:'invoices.html', label:'Invoices' },
  { key:'activity', href:'activity.html', label:'Activity' },
  { key:'users',    href:'users.html',    label:'Users' }
];

function chromeHTML(){
  var nav = NAV_ITEMS.map(function(n){
    return '<a class="tnav-item" data-nav="' + n.key + '" href="' + n.href + '">' + n.label + '</a>';
  }).join('');
  return ''
  + '<header class="dtopbar">'
  +   '<div class="dtopbar-inner">'
  +   '<a class="dbrand" href="index.html" aria-label="ThingsBoard License Portal — home" title="Home">'
  +     '<div class="mark"><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/></svg></div>'
  +     '<div class="bt">ThingsBoard<span class="bsep">·</span>License Portal</div>'
  +   '</a>'
  +   '<nav class="tnav" aria-label="Primary">' + nav + '</nav>'
  +   '<span class="sp"></span>'
  +   '<div class="dprofile">'
  +     '<button class="dprofbtn" id="dashProfBtn" aria-haspopup="true" aria-expanded="false">'
  +       '<span>Mariia Panchuk</span><span aria-hidden="true">▾</span>'
  +     '</button>'
  +     '<div class="dprofmenu" id="dashProfMenu" role="menu" hidden>'
  +       '<a role="menuitem" href="account.html">Account</a>'
  +       '<a role="menuitem" href="billing.html">Billing &amp; payment</a>'
  +       '<div class="sep"></div>'
  +       '<button role="menuitem" data-stub="Sign out">Sign out</button>'
  +     '</div>'
  +   '</div>'
  +   '</div>'
  + '</header>'
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
function settingsHTML(){
  var dash = Object.keys(DASH_STATES).map(function(k){
    return '<label class="sp-opt"><input type="radio" name="dashState" value="' + k + '"'
      + (Store.get('dash') === k ? ' checked' : '') + '><span>' + DASH_STATES[k].label + '</span></label>';
  }).join('');
  var plans = [['maker','Maker'],['prototype','Prototype'],['pilot','Pilot'],['startup','Startup'],
               ['business','Business'],['prototypeaddons','Prototype + add-ons']].map(function(p){
    return '<a class="sp-opt" href="license.html?tier=' + p[0] + '"><span>' + p[1] + '</span></a>';
  }).join('');
  return '<button class="gearfab" id="gearBtn" aria-haspopup="dialog" aria-expanded="false" aria-label="Prototype settings" title="Prototype settings">'
    + '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/></svg>'
    + '</button>'
    + '<div class="settings-panel" id="settingsPanel" role="dialog" aria-label="Prototype settings" hidden>'
    +   '<h4>Prototype settings</h4>'
    +   '<div class="sp-note">Prototype-only — not part of the product UI.</div>'
    +   '<div class="sp-label" style="margin-top:14px">Dashboard (Home)</div>'
    +   '<div class="sp-pick" role="radiogroup" aria-label="Dashboard">' + dash
    +     '<div class="sp-grouphead">Products</div>'
    +     '<a class="sp-opt" href="licenses.html"><span>Product-first (neutral)</span></a>'
    +     '<div class="sp-grouphead">Plan details</div>' + plans
    +     '<a class="sp-opt" href="license.html?tier=perp"><span>Perpetual license details</span></a>'
    +     '<div class="sp-grouphead">Reference</div>'
    +     '<a class="sp-opt" href="styleguide.html"><span>Design system → styleguide</span></a>'
    +     '<div class="sp-grouphead">Billing data</div>'
    +     '<label class="sp-opt"><input type="radio" name="billingData" value="saved"' + (billingSaved() ? ' checked' : '') + '><span>saved</span></label>'
    +     '<label class="sp-opt"><input type="radio" name="billingData" value="none"' + (billingSaved() ? '' : ' checked') + '><span>none</span></label>'
    +     '<div class="sp-grouphead">License details</div>'
    +     '<label class="sp-opt"><input type="radio" name="licDetails" value="modal"' + (licDetailsMode() === 'modal' ? ' checked' : '') + '><span>Modal (default)</span></label>'
    +     '<label class="sp-opt"><input type="radio" name="licDetails" value="page"' + (licDetailsMode() === 'page' ? ' checked' : '') + '><span>Full page</span></label>'
    +     '<div class="sp-grouphead">Customize step</div>'
    +     '<label class="sp-opt"><input type="radio" name="custVariant" value="a"' + (custVariant() === 'a' ? ' checked' : '') + '><span>A — Plan card</span></label>'
    +     '<label class="sp-opt"><input type="radio" name="custVariant" value="b"' + (custVariant() === 'b' ? ' checked' : '') + '><span>B — Locked inputs</span></label>'
    +     '<div class="sp-grouphead">Dev actions</div>'
    +     '<label class="sp-opt"><button class="link" id="devConfirmEmail" disabled>Confirm email change</button></label>'
    +     '<label class="sp-opt"><button class="link" id="resetDemo">Reset demo data</button></label>'
    +   '</div>'
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
  + ADD_USER_HTML + PAY_MODAL_HTML + COUPON_MODAL_HTML;
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

  // profile hub
  var pb = $('#dashProfBtn'), pm = $('#dashProfMenu');
  if(pb){
    pb.addEventListener('click', function(e){
      e.stopPropagation();
      var open = pm.hidden;
      pm.hidden = !open;
      pb.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    pm.addEventListener('click', function(e){ e.stopPropagation(); });
    document.addEventListener('click', function(){ if(!pm.hidden){ pm.hidden = true; pb.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !pm.hidden){ pm.hidden = true; pb.setAttribute('aria-expanded', 'false'); pb.focus(); } });
  }

  // impersonation banner (persisted, so it survives navigation)
  var imp = Store.get('impersonating');
  if(imp){ $('#impEmail').textContent = imp; $('#impBanner').hidden = false; document.body.classList.add('impersonating'); }
  $('#impReturn').addEventListener('click', function(){
    Store.set('impersonating', null);
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

  wireSettingsPanel();
  syncTopNav();
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
  $$('.dropmenu:not([hidden]), .menu .pop:not([hidden])').forEach(function(pop){
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
function billingSaved(){ return Store.get('billingData') !== 'none'; }
function wireSettingsPanel(){
  var gearBtn = $('#gearBtn'), panel = $('#settingsPanel');
  function toggle(open){ panel.hidden = !open; gearBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  gearBtn.addEventListener('click', function(e){ e.stopPropagation(); toggle(panel.hidden); });
  panel.addEventListener('click', function(e){ e.stopPropagation(); });
  document.addEventListener('click', function(){ if(!panel.hidden) toggle(false); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !panel.hidden) toggle(false); });

  // the dashboard state is a stored setting: pick it anywhere, land on Home with it
  $$('input[name="dashState"]').forEach(function(r){
    r.addEventListener('change', function(){
      if(!r.checked) return;
      Store.set('dash', r.value);
      if(document.body.getAttribute('data-page') === 'home') location.reload();
      else location.href = 'index.html';
    });
  });

  // billing data drives how many steps the wizard has; re-render it if it is open
  $$('input[name="billingData"]').forEach(function(r){
    r.addEventListener('change', function(){
      if(!r.checked) return;
      Store.set('billingData', r.value);
      if(window.NL && NL.refreshOpen) NL.refreshOpen();
    });
  });

  // the details presentation is a stored setting; rows read it on click
  $$('input[name="licDetails"]').forEach(function(r){
    r.addEventListener('change', function(){ if(r.checked) Store.set('licDetails', r.value); });
  });

  // switching the Customize variant re-renders whichever flow is open
  $$('input[name="custVariant"]').forEach(function(r){
    r.addEventListener('change', function(){
      if(!r.checked) return;
      Store.set('custVariant', r.value);
      if(window.NL && NL.refreshCustomize) NL.refreshCustomize();
    });
  });

  var reset = $('#resetDemo');
  reset.addEventListener('click', function(){ Store.reset(); location.reload(); });

  // dev affordance: play the confirmation click that would arrive by email
  var dev = $('#devConfirmEmail'), pending = Store.get('pendingEmail');
  dev.disabled = !pending;
  dev.addEventListener('click', function(){
    var p = Store.get('pendingEmail');
    if(!p) return;
    Store.set('pendingEmail', null);
    Store.set('emailConfirmed', p.to);
    location.reload();
  });
}

/* ============================================================================
   Shared modal markup
   ========================================================================== */
var ADD_USER_HTML = ''
+ '<div class="payoverlay" id="addUserOverlay" hidden>'
+ '  <div class="paymodal narrow" role="dialog" aria-modal="true" aria-labelledby="auTitle">'
+ '    <div class="paymodal-h">'
+ '      <h3 id="auTitle">Add user</h3>'
+ '      <span class="sp"></span>'
+ '      <button class="paymodal-x" id="auClose" aria-label="Close">✕</button>'
+ '    </div>'
+ '    <div class="paymodal-b" id="auStep1">'
+ '      <div class="field"><label for="auEmail">Email</label><input type="email" id="auEmail" placeholder="user@company.com" autocomplete="off"></div>'
+ '      <div class="field2">'
+ '        <div class="field"><label for="auFirst">First name</label><input type="text" id="auFirst"></div>'
+ '        <div class="field"><label for="auLast">Last name</label><input type="text" id="auLast"></div>'
+ '      </div>'
+ '      <div class="field"><label for="auDesc">Description</label><textarea id="auDesc"></textarea></div>'
+ '      <div class="field"><label for="auMethod">Activation method</label>'
+ '        <select id="auMethod">'
+ '          <option value="link">Display activation link</option>'
+ '          <option value="email">Send activation email</option>'
+ '        </select>'
+ '      </div>'
+ '    </div>'
+ '    <div class="paymodal-b" id="auStep2" hidden></div>'
+ '    <div class="paymodal-f" id="auFoot1">'
+ '      <span class="sp"></span>'
+ '      <button class="btn sec" id="auCancel">Cancel</button>'
+ '      <button class="btn" id="auAdd" disabled>Add</button>'
+ '    </div>'
+ '    <div class="paymodal-f" id="auFoot2" hidden>'
+ '      <span class="sp"></span>'
+ '      <button class="btn" id="auDone">Done</button>'
+ '    </div>'
+ '  </div>'
+ '</div>';

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
+ '      </div>'
+ '      <div class="field2">'
+ '        <div class="field"><label>Cardholder name</label><input type="text" id="payName" autocomplete="cc-name" value="Mariia Panchuk"></div>'
+ '        <div class="field"><label>Country</label><select id="payCountry"><option>United States</option><option>Ukraine</option><option>Germany</option><option>United Kingdom</option></select></div>'
+ '      </div>'
+ '    </div>'
+ '    <div class="paymodal-f">'
+ '      <span class="paystripe-note">Powered by <b>Stripe</b></span>'
+ '      <span class="sp"></span>'
+ '      <button class="btn sec" id="payCancel">Cancel</button>'
+ '      <button class="btn" id="payUpdate" disabled>Update</button>'
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
injectChrome();
wireGlobal();

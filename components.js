/* ============================================================================
   components.js — the renderers more than one page needs: the licence table
   (Home block + Licenses page), invoice and user rows, the activity feed (Home
   + Activity + the licence's own tab), and the cancel dialog. Every builder is
   pure string-in/string-out; wiring helpers take a root selector so a page can
   attach them to whichever container it owns.
   ============================================================================ */

/* ---------- licence rows ---------- */
function attnRank(l){ return l.status==='payment_failed' ? 0 : l.status==='updates_expiring' ? 1 : l.status==='canceled' ? 3 : 2; }
/* The chip answers one question — is this licence alive? — with two values, on every
   surface: Active or Canceled. Attention states (payment failed, updates expiring,
   no first check-in yet) are not statuses; they are the banner on the details page,
   which carries the date and the action. Same rule as statusChipHTML. The date the
   attention state is about rides under the chip now (see statusCell). */
function statusChip(l){
  var st = l && typeof l === 'object' ? l.status : l;
  if(st==='canceled') return '<span class="pill off">Canceled</span>';
  return '<span class="pill">Active</span>';
}
/* What the next date means depends on the licence: a subscription renews, a
   perpetual stops receiving updates, a cancelled subscription runs out, and a
   grant never expires. Attention states keep their date here. */
function stateText(p){
  if(p.grant)  return '<span class="muted">No expiry</span>';
  if(!p.event) return '<span class="muted">—</span>';
  var d = fmtDate(p.event);
  return p.status === 'canceled' ? ('Active until ' + d)
       : p.type === 'Perpetual'  ? ('Updates until ' + d)
       : ('Renews ' + d);
}
/* Status and State were two columns asking one question between them — is this
   licence alive, and until when. Folded into one cell: the chip on the first line,
   the date underneath. The State column is gone. */
function statusCell(p){
  return '<td><div class="licstat">' + statusChip(p)
    + '<div class="licstat-txt">' + stateText(p) + '</div></div></td>';
}
function nextCharge(ds){
  var subs = ds.licenses.filter(function(l){ return l.type==='Subscription' && l.status==='active'; });
  subs.sort(function(a,b){ return dateKey(a.event)-dateKey(b.event); });
  return subs[0] || null;
}
// a dataset may legitimately have no invoices (the grant is free) — say so
function invEmptyRow(opts){
  return '<tr><td colspan="' + invCols(opts) + '" class="emptybox">' + (DATA().noInvoicesNote || 'No invoices yet.') + '</td></tr>';
}
/* Charged automatically: the recurring charge went out on its own. An invoice from a
   purchase the viewer actually made (auto:false) carries no icon — the absence is the
   signal, so there is nothing to say for it. This is what replaced the Payment type
   column, which said the same thing in a word and spent a whole column doing it. */
var AUTOSVG = '<svg class="icon" viewBox="0 0 24 24"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
function autoChargeIcon(v){
  if(!v || !v.auto) return '';
  return '<span class="autoic tip" tabindex="0" role="img" aria-label="Charged automatically" data-tip="Charged automatically">' + AUTOSVG + '</span>';
}
/* One builder for all three invoice tables, so none of them can drift:
     · the Invoices page  — the full Product cell
     · the Home block     — opts.bareProduct: the type line only
     · the licence's own Invoices tab — opts.noProduct: no column at all, because
       every row on it belongs to the licence you are already looking at
   Everything else (the auto-charge mark, the row actions) is identical everywhere. */
/* Row actions carry both a glyph and a label; CSS picks which shows. Desktop reads
   the words, a phone card reads three icon-buttons — and the third one, the way to
   the licence, only exists on the phone: on desktop that job belongs to the Product
   cell, which is a link already. */
var DLSVG   = '<svg class="icon ra-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11"/><path d="M8 12l4 4 4-4"/><path d="M5 20h14"/></svg>';
var VIEWSVG = '<svg class="icon ra-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 4h7v7"/><path d="M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></svg>';
var GOSVG   = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13"/><path d="M13 6l6 6-6 6"/></svg>';
function invOpenLicenseAction(v){
  var lic = v.licId && licById(v.licId);
  if(!lic) return '';
  return '<a class="iconbtn ib tip mob-only ra-open" data-invlic="' + lic.id + '" href="'
    + licenseHref(lic, 'invoices') + '" aria-label="Open license" data-tip="Open license">' + GOSVG + '</a>';
}
function invRow(v, opts){
  opts = opts || {};
  var pill = v.status==='Past due' ? '<span class="pill attn">Past due</span>' : '<span class="pill">'+(v.status||'Paid')+'</span>';
  return '<tr class="inv-row"><td class="mono">'+v.num+'</td><td>'+fmtDate(v.date)+'</td><td class="num">'+v.amount+'</td>'
    + '<td><span class="statwrap">'+pill+autoChargeIcon(v)+'</span></td>'
    + (opts.noProduct ? '' : invProductCell(v, opts))
    + '<td class="cellact"><span class="rowactions">'
    +   '<button class="link ra-act" data-dlinv aria-label="Download PDF">' + DLSVG + '<span class="ra-txt">Download PDF</span></button>'
    +   '<a class="link ra-act" data-viewinv target="_blank" rel="noopener" href="#" aria-label="View invoice">' + VIEWSVG + '<span class="ra-txt">View invoice</span></a>'
    +   invOpenLicenseAction(v)
    + '</span></td></tr>';
}
// how many columns invRow produces — the empty-state row has to span them
function invCols(opts){ return (opts && opts.noProduct) ? 5 : 6; }
/* The Product cell is the way from an invoice to the licence it bills — the cell, not
   the row: the row already belongs to the invoice (Download PDF / View invoice), and a
   row click that opened something else would be a surprise. It is the same cell the
   licence table renders, and the invoice names its licence through `licId`, so the
   label follows a rename without a second copy of it living here. An invoice whose
   licence is missing keeps the column quiet. */
function invProductCell(v, opts){
  var lic = v.licId && licById(v.licId);
  return lic ? productCell(lic, { link:'invoices', bare: !!(opts && opts.bareProduct) })
             : '<td class="lic-prodcell"><span class="muted">—</span></td>';
}
function userRow(u){
  return '<tr><td>'+u.name+'</td><td>'+u.email+'</td><td>'+fmtDate(u.created)+'</td>'
    + '<td class="cellact"><span class="rowactions"><button class="link" data-loginas="'+u.email+'">Login as →</button><button class="link" data-deluser="'+u.email+'">Delete</button></span></td></tr>';
}
function menuItems(p, opts){
  var type = p && typeof p === 'object' ? p.type : p;
  // naming a licence is the one thing every type allows, so it leads every menu —
  // except in the Home preview block (opts.noLabelEdit), which is a summary: renaming
  // belongs where the licence is the subject, i.e. the Licenses page and its details.
  var label = (opts && opts.noLabelEdit) ? '' : '<button role="menuitem" data-editlabel>Edit label</button>';
  if(type === 'Perpetual') return label + '<button role="menuitem" data-stub="Add capacity">Add capacity</button><button role="menuitem" data-stub="Renew software updates">Renew software updates</button>';
  var last = (p && p.status==='canceled')
    ? '<button role="menuitem" data-stub="Renew subscription">Renew subscription</button>'
    : '<button role="menuitem" data-cancel>Cancel subscription</button>';
  return label + '<button role="menuitem" data-manageaddons>Manage add-ons</button><button role="menuitem" data-changeplan>Change plan</button>' + last;
}

/* From a row there is no inline slot to edit in, so the label gets a small
   dialog of its own. Same writer as the details surface. */
function openLabelModal(lic){
  if(!lic) return;
  openModal('Edit label', '<div class="field"><label for="labelModalInput">Label</label>'
    + '<input id="labelModalInput" type="text" autocomplete="off" placeholder="e.g. Production" value="' + esc(lic.label || '') + '">'
    + '<div class="help">A label tells this licence apart from the others — usually the deployment it runs.</div></div>');
  $('#modalCloseBtn').textContent = 'Cancel';
  var inp = $('#labelModalInput');
  var save = modalAction('Save', function(){
    setLicenseLabel(lic, inp.value);
    closeModal();
  });
  inp.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); save.click(); } });
  inp.focus();
  inp.select();
}
function actionsCell(p, opts){
  // a grant cannot be changed, cancelled or topped up — the key is all there is,
  // so its row carries the copy action and no overflow menu (inferred)
  if(p && p.grant) return '<td class="cellact"><div class="lic-actions">'
    + '<button class="iconbtn ib tip lic-copy" aria-label="Copy license key" data-tip="Copy license key">' + COPYSVG + '</button></div></td>';
  return '<td class="cellact"><div class="lic-actions">'
    + '<button class="iconbtn ib tip lic-copy" aria-label="Copy license key" data-tip="Copy license key">' + COPYSVG + '</button>'
    + '<div class="menu"><button class="iconbtn ib" aria-haspopup="true" aria-expanded="false" aria-label="More actions">' + KEBAB + '</button>'
    + '<div class="pop" role="menu" hidden>' + menuItems(p, opts) + '</div></div></div></td>';
}
function rowOpen(p){
  return '<tr class="lic-row' + (p.status==='canceled' ? ' off' : '') + '" '
    + (p.id ? 'data-licid="' + p.id + '" ' : '')
    + 'data-goto="' + (p.goto || '') + '" data-product="' + (p.product || '') + '" data-type="' + p.type + '" data-status="' + (p.status || 'active') + '" tabindex="0" aria-label="Open ' + (p.product ? p.product + ' ' : '') + p.name + ' details">';
}
/* Product-first, product-neutral: no product-specific columns. Type and the label
   both live inside Product (see productCell); the next date has its own State
   column, which is what lets the Status column carry only Active / Canceled. */
function headHtml(){
  return '<tr><th class="lic-prodhead">Product</th><th>License</th><th>Status</th>'
    + '<th>Updated</th>'
    + '<th aria-label="Actions"></th></tr>';
}
/* The Product cell — one builder for every table that carries it: licence rows and
   both invoice tables. Three parts, in reading order:
     · a placeholder square for the product mark;
     · product · type on the first line. Type folded in here because a chip in its
       own column only restated what this line already says;
     · the label underneath — and nothing at all when the licence has no label yet,
       so the row reads exactly as it will before anyone names it. */
function productCell(p, opts){
  /* opts.bare — the type line alone, no mark and no label. The Home invoice block
     asks for it: three rows of preview next to an amount and a date, where the
     licence only has to be named, not described. The Invoices page keeps the full
     cell. */
  var bare = opts && opts.bare;
  var txt = '<div class="lp-txt">'
    +   '<div class="lp-name">' + (p.product || '') + '<span class="lp-type"> &middot; ' + p.type + '</span></div>'
    +   (p.label && !bare ? '<div class="lic-prodlabel">' + esc(p.label) + '</div>' : '')
    + '</div>';
  // TBD: the product / edition mark goes here. A plain filled square until we have
  // the artwork — it holds the space and the alignment, and reads as a placeholder
  // without a dashed outline drawing attention to itself.
  var inner = (bare ? '' : '<span class="lp-ic" aria-hidden="true"></span>') + txt;
  /* The flex row lives inside the cell, never on it: a <td> that becomes a flex
     container stops being a table cell and takes the column widths with it.
     opts.link makes that row a real anchor to this licence's details — keyboard
     reachable, middle-clickable, with an address of its own; in modal mode a
     delegated handler intercepts it (see the listener under wireLicenseRows).
     The licence table never passes it: there the whole row already navigates, and
     a link inside a clickable row is an interactive element inside another. */
  var link = opts && opts.link;
  return '<td class="lic-prodcell">'
    + (link
        ? '<a class="lp-cell lp-link" data-invlic="' + (p.id || '') + '" href="' + licenseHref(p, link) + '">' + inner + '</a>'
        : '<div class="lp-cell">' + inner + '</div>')
    + '</td>';
}
function rowHtml(p, opts){
  // the licence column is the plan/package; a grant adds what it has instead of a price
  var lic = '<td><div class="lp-name">' + p.name + '</div>'
    + (p.grant ? '<div class="lp-meta">Free &middot; ' + p.limits + '</div>' : '') + '</td>';
  // when the licence last changed — plan, add-ons, label or payment state
  var updatedCell = '<td class="lic-num">' + fmtDate(p.updated || p.created) + '</td>';
  return rowOpen(p) + productCell(p) + lic + statusCell(p) + updatedCell + actionsCell(p, opts) + '</tr>';
}

/* ---------- navigation ---------- */
/* A licence row is a real link target: details live at license.html?id=…, and
   `from` tells that page which section to highlight and where its back goes. */
/* The PE feature card. The wizard dropped it when its Subscription card took
   over that copy, so this now serves ONE surface: the new-user plan screen
   on Home (#ecPlanExtra). Kept here rather than in wizard.js, which no
   longer knows about it. */
function peBlockHTML(intro){
  return '<div class="nl-pe">'
    + '<div class="nl-pe-h">What\u2019s included in Professional Edition</div>'
    + (intro ? '<p class="nl-pe-intro">' + intro + '</p>' : '')
    + '<div class="nl-pe-body">'
    + PE_FEATURES.map(function(f){ return '<div class="nl-pe-item"><b>' + f[0] + '</b> — ' + f[1] + '</div>'; }).join('')
    + '</div></div>';
}

/* The payment method as the parts a surface needs: brand badge, masked number, and
   the expiry where it belongs. Callers own the container — Billing wraps it in a
   bordered .paycard next to its edit button, the Next charge card lays it out inline.
   opts.expiry:false drops the expiry: on the Next charge card the question is which
   card this charge goes to, not when that card runs out. Billing, which is where a
   card is actually managed, keeps it. */
function paymentMethodHTML(opts){
  var withExp = !opts || opts.expiry !== false;
  return '<span class="brandbadge">' + PAYMENT_METHOD.brand + '</span>'
    + '<span class="pc-num">' + PAYMENT_METHOD.num + '</span>'
    + (withExp ? '<span class="pc-exp">' + PAYMENT_METHOD.exp + '</span>' : '');
}

function licenseHref(p, from){
  return 'license.html?id=' + encodeURIComponent(p.id || '') + (from ? '&from=' + from : '');
}

/* An invoice's Product cell is a real link to license.html, which is exactly right in
   page mode. In modal mode the details have no URL of their own, so the click opens the
   modal over the page instead — one listener on the document covers both invoice tables
   (Home and the Invoices page) without either having to wire it. */
document.addEventListener('click', function(e){
  var a = e.target.closest('a[data-invlic]');
  if(!a) return;
  if(licDetailsMode() !== 'modal' || !window.LicenseDetails) return;   // page mode: follow the href
  var lic = licById(a.getAttribute('data-invlic'));
  if(!lic) return;
  e.preventDefault();
  LicenseDetails.openModal(lic);
});

/* Wire a table of licence rows: the row itself navigates, its actions do not.
   `opts.from` labels the origin, `opts.rerender` redraws the page after a change. */
function wireLicenseRows(rootSel, opts){
  var root = $(rootSel);
  if(!root) return;
  opts = opts || {};
  var rerender = opts.rerender || function(){};
  root.addEventListener('click', function(e){
    var copy = e.target.closest('.lic-copy');
    if(copy){
      e.stopPropagation();
      var flash = function(){
        copy.setAttribute('data-tip', 'Copied'); copy.classList.add('show', 'copied');
        setTimeout(function(){ copy.classList.remove('show', 'copied'); copy.setAttribute('data-tip', 'Copy license key'); }, 1200);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText('license-secret').then(flash, flash); } else { flash(); }
      return;
    }
    var licOf = function(el){ var r = el.closest('.lic-row'); return r && licById(r.getAttribute('data-licid')); };
    var labelItem = e.target.closest('[data-editlabel]');
    if(labelItem){ e.stopPropagation(); closeAllMenus(); openLabelModal(licOf(labelItem)); return; }
    var cancelItem = e.target.closest('[data-cancel]');
    if(cancelItem){ e.stopPropagation(); closeAllMenus(); cancelFromRow(cancelItem, rerender); return; }
    var cpItem = e.target.closest('[data-changeplan]');
    if(cpItem){ e.stopPropagation(); closeAllMenus(); var cl = licOf(cpItem); if(cl) NL.openChange(cl); return; }
    var maItem = e.target.closest('[data-manageaddons]');
    if(maItem){ e.stopPropagation(); closeAllMenus(); openManageAddons(licOf(maItem)); return; }
    if(e.target.closest('.lic-actions')) return;       // menus and their items never navigate
    var row = e.target.closest('.lic-row');
    if(row) openRowLink(row, opts.from);
  });
  root.addEventListener('keydown', function(e){
    if(e.key !== 'Enter' && e.key !== ' ') return;
    var row = e.target.closest('.lic-row');
    if(row && e.target === row){ e.preventDefault(); openRowLink(row, opts.from); }
  });
}
/* THE way in to the licence details, for every entry point there is: a row, the grant
   banner, a finished purchase, a committed plan change. Modal is the default, so the
   details open over the page the viewer came from — nav highlight, scroll and filters
   all stay put — and only an explicit "Full page" choice navigates.
   opts.refreshHost: the licence was just created or changed, so the list underneath
   has to be restated too. */
function openLicenseDetails(lic, from, opts){
  if(!lic) return;
  if(licDetailsMode() === 'modal' && window.LicenseDetails){
    LicenseDetails.openModal(lic);
    if(opts && opts.refreshHost) LicenseDetails.afterChange();
    return;
  }
  location.href = licenseHref(lic, from);
}
function openRowLink(row, from){
  var id = row.getAttribute('data-licid'), lic = id && licById(id);
  if(lic){ openLicenseDetails(lic, from); return; }
  openModal('License details', '<p>Placeholder — the ' + (row.getAttribute('data-product') || 'product')
    + ' license detail page is not part of this prototype yet.</p>');
}

/* ---------- cancel subscription ---------- */
function openCancelModal(lic, after){
  if(!lic) return;
  var end = fmtDate(lic.event), who = lic.name + (lic.label ? ' · ' + lic.label : '');
  openModal('Cancel subscription',
    '<p>Cancel <b>' + esc(who) + '</b>?</p>'
    + '<p>The subscription stays active until <b>' + end + '</b>. After that its instances will stop.</p>');
  var foot = $('#overlay .mf');
  var confirm = document.createElement('button');
  confirm.type='button'; confirm.className='btn ter'; confirm.id='cancelConfirmBtn'; confirm.textContent='Cancel subscription';
  foot.appendChild(confirm);
  $('#modalCloseBtn').textContent = 'Keep subscription';
  confirm.addEventListener('click', function(){
    storeCancelLicense(lic.id);      // persisted, so every page sees it
    closeModal();
    if(typeof after === 'function') after(lic);
  });
  $('#modalCloseBtn').focus();   // Keep subscription is the default (secondary)
}
function cancelFromRow(btn, after){
  var row = btn.closest('.lic-row');
  var lic = row && licById(row.getAttribute('data-licid'));
  if(lic) openCancelModal(lic, after);
  else openModal('Cancel subscription', '<p>' + STUB + '</p>');
}


/* ---------- activity feed ---------- */
function auditJson(a){
  var et = a.entityType.toUpperCase().replace(/ /g, '_');
  var payload = {
    createdTime: isoFromTs(a.ts),
    entityType: et,
    entityName: a.entityName,
    userName: a.actor,
    actionType: a.action,
    actionData: {
      entity: {
        id: { entityType: et, id: "784f394c-42b6-435a-983c-b7beff2784f9" },
        name: a.entityName,
        type: a.entityType,
        tenantId: "1f2e6c40-9a2b-11ee-b9d1-0242ac120002",
        additionalInfo: { source: "license-portal" }
      }
    }
  };
  if(a.delta) payload.actionData.change = a.delta.replace(/<[^>]+>/g, '');
  return JSON.stringify(payload, null, 2);
}
// No event icon: the kind of event is already the first words of the sentence, so
// the item starts at the container edge with its timestamp.
function feedItem(a, i){
  return '<div class="fitem">'
    + '<div class="fi-row">'
    +   '<div class="fi-body">'
    +     '<div class="fi-meta">' + fmtDateTime(a.ts) + '</div>'
    +     '<div class="fi-txt">' + a.txt + '</div>'
    +   '</div>'
    +   '<button class="iconbtn ib" data-audit data-i="' + i + '" aria-expanded="false" aria-label="Show details" title="Show details">' + AUDITSVG + '</button>'
    + '</div>'
    + '<pre class="fi-audit" hidden>' + esc(auditJson(a)) + '</pre>'
    + '</div>';
}
function renderFeed(sel, limit){
  var el = $(sel); if(!el) return;
  var all = DATA().activity;
  var list = typeof limit === 'number' ? all.slice(0, limit) : all;
  el.innerHTML = list.map(function(a, idx){ return feedItem(a, idx); }).join('');
}

/* ---------- period filter (Activity page + the licence's Activity tab) ---------- */
var actPeriod = { mode:'all', from:null, to:null };
var licPeriod = { mode:'all', from:null, to:null };
function feedDay(a){ var q=String(a.ts).split(/[ ,]+/); return epochDay(+q[2], MONF[q[0]]||1, +q[1]); }
/* Sorting a newest-first feed by DAY alone leaves two events that share a day in
   whatever order they were pushed — which for the synthesised licence events is
   ascending time, i.e. backwards. Minute precision fixes that. */
function feedMinute(a){
  var t = String(a.ts).split(', ')[1] || '00:00', hm = t.split(':');
  return feedDay(a) * 1440 + (+hm[0] || 0) * 60 + (+hm[1] || 0);
}
function isoDay(v){ var q=String(v).split('-'); return epochDay(+q[0], +q[1], +q[2]); }
function filterFeedByPeriod(list, per){
  if(!per || per.mode==='all') return list;
  return list.filter(function(a){
    var d = feedDay(a);
    if(per.mode==='24h') return d >= TODAY_DAY-1;
    if(per.mode==='7d')  return d >= TODAY_DAY-7;
    if(per.mode==='30d') return d >= TODAY_DAY-30;
    if(per.mode==='custom'){ var ok=true; if(per.from!=null) ok = ok && d>=per.from; if(per.to!=null) ok = ok && d<=per.to; return ok; }
    return true;
  });
}
function tsFrom(created, time){ return String(created) + ', ' + time; }
function licenseActivity(lic){
  var who='mpanchuk@thingsboard.io', noun = lic.type==='Perpetual' ? 'License' : 'Subscription';
  // the grant has exactly one event of its own: it was issued
  if(lic.grant) return [{ kind:'created', ts: tsFrom(lic.created,'09:02'), entityType:'License', entityName:lic.name,
    actor:'System', action:'GRANT_ISSUED',
    txt:'<b>'+lic.name+'</b> was issued to '+who+' — license key created.', delta:'Community Grant issued' }];
  var acts = [];
  acts.push({ kind:'created', ts: tsFrom(lic.created,'09:14'), entityType:noun, entityName:lic.name, actor:who, action:'ADDED',
    txt:noun+' <b>'+lic.name+'</b> was created by '+who+'.' });
  if(lic.label) acts.push({ kind:'updated', ts: tsFrom(lic.created,'09:22'), entityType:noun, entityName:lic.name, actor:who, action:'UPDATED',
    txt:'Label <b>'+esc(lic.label)+'</b> was set by '+who+'.', delta:'label = '+lic.label });
  if(lic.status==='payment_failed') acts.unshift({ kind:'status', ts:'18 Aug 2026, 07:12', entityType:noun, entityName:lic.name, actor:'System', action:'PAYMENT_FAILED',
    txt:'Payment failed — card Visa ••4242 was declined.', delta:'Auto-pay charge failed' });
  if(lic.status==='updates_expiring') acts.unshift({ kind:'status', ts:'05 Aug 2026, 08:00', entityType:'License', entityName:lic.name, actor:'System', action:'UPDATES_EXPIRING',
    txt:'Software updates expire on <b>'+fmtDate(lic.event)+'</b>.', delta:'Updates term ends '+lic.event });
  if(lic.status==='canceled') acts.unshift({ kind:'status', ts:'19 Aug 2026, 09:00', entityType:noun, entityName:lic.name, actor:who, action:'CANCELED',
    txt:'Subscription was canceled — active until <b>'+fmtDate(lic.event)+'</b>.', delta:'Canceled; active until '+lic.event });
  /* The invoices this licence produced. Same sentence the Activity page uses, so
     "charged automatically" reads identically wherever the event surfaces — and an
     invoice the viewer paid themselves names them instead. */
  DATA().invoices.filter(function(v){ return v.licId === lic.id; }).forEach(function(v){
    acts.push({ kind:'info', ts: tsFrom(v.date, '00:05'), entityType:'Invoice', entityName:v.num,
      actor: v.auto ? 'Auto-pay' : who, action:'PAID',
      txt:'Invoice <b>'+v.num+'</b> was paid' + (v.auto ? ', charged automatically.' : ' by '+who+'.') });
  });
  // newest first, like every other feed: the pushes and unshifts above are built by
  // kind, not by date, and the paid events land last however old they are
  acts.sort(function(a,b){ return feedMinute(b)-feedMinute(a); });
  return acts;
}
function renderLicFeed(lic){
  var el = $('#licFeed'); if(!el) return;
  var list = filterFeedByPeriod(licenseActivity(lic), licPeriod);
  el.innerHTML = list.length
    ? list.map(function(a,i){ return feedItem(a, 'lic'+i); }).join('')
    : '<div class="emptybox">No events in the selected period.</div>';
}

/* The details icon expands the raw action-data payload in place (toggle, and
   more than one can stay open). Delegated, so re-rendered feeds keep working. */
function wireFeedAudit(rootSel){
  var host = $(rootSel);
  if(!host) return;
  host.addEventListener('click', function(e){
    var btn = e.target.closest('[data-audit]');
    if(!btn) return;
    var item = btn.closest('.fitem'), pre = item && item.querySelector('.fi-audit');
    if(!pre) return;
    var open = pre.hidden;
    pre.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.classList.toggle('is-on', open);
  });
}

/* ---------- period control ---------- */
var PER_LABEL = { all:'All time','24h':'Last 24 hours','7d':'Last 7 days','30d':'Last 30 days',custom:'Custom range' };
/* Wire one period control. `st` is the period state it edits, `rerender` the
   feed redraw that follows a change. */
function wirePeriod(sel, st, rerender){
  var ctl = $(sel) || $('.perctl');
  if(!ctl) return;
  var btn=$('.perbtn',ctl), menu=$('.permenu',ctl), custom=$('.percustom',ctl), lab=$('.perlabel',ctl);
  var apply=$('.perapply',ctl), fromI=$('.perfrom',ctl), toI=$('.perto',ctl);
  function fmtDM(iso){ var q=String(iso).split('-'); return q[2]+'.'+q[1]; }
  function closeMenu(){ menu.hidden=true; btn.setAttribute('aria-expanded','false'); }
  function syncSel(){ $$('[data-period]', menu).forEach(function(b){ b.classList.toggle('is-sel', b.getAttribute('data-period')===st.mode); }); }
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    var willOpen = menu.hidden;
    menu.hidden = !willOpen;
    btn.setAttribute('aria-expanded', willOpen?'true':'false');
    // reopening while a custom range is active keeps its fields visible
    if(willOpen){ if(custom) custom.classList.toggle('show', st.mode==='custom'); syncSel(); }
  });
  if(menu) menu.addEventListener('click', function(e){
    var b=e.target.closest('[data-period]'); if(!b) return;
    var mode=b.getAttribute('data-period');
    if(mode==='custom'){
      // Custom is SELECTED first (checkmark in the list); the range fields render
      // below inside the same panel, then the user enters the range
      st.mode='custom'; lab.textContent='Custom range';
      if(custom) custom.classList.add('show');
      syncSel(); rerender(); return;
    }
    if(custom) custom.classList.remove('show');
    st.mode=mode; st.from=null; st.to=null; lab.textContent=PER_LABEL[mode]||'All time'; syncSel(); closeMenu(); rerender();
  });
  if(apply) apply.addEventListener('click', function(e){
    e.stopPropagation();
    st.mode='custom'; st.from = (fromI && fromI.value) ? isoDay(fromI.value) : null; st.to = (toI && toI.value) ? isoDay(toI.value) : null;
    lab.textContent = (fromI.value && toI.value) ? (fmtDM(fromI.value)+' \u2013 '+fmtDM(toI.value))
      : fromI.value ? ('from '+fmtDM(fromI.value))
      : toI.value ? ('until '+fmtDM(toI.value)) : 'Custom range';
    closeMenu(); rerender();
  });
  document.addEventListener('click', function(e){ if(!ctl.contains(e.target)) closeMenu(); });
}

/* ---------- settings pages: sticky Save + leave guard ---------- */
/* One sticky page-level Save: any change anywhere on the page enables it, saving
   disables it again. There is no "all saved" note — the disabled button says that
   by itself. `dirty` is also what the leave-guard checks. */
var pageDirty = false;
function wirePageSave(viewSel, btnSel, noteSel){
  var view = $(viewSel), btn = $(btnSel), note = $(noteSel);
  if(!view || !btn) return;
  function clean(){ btn.disabled = true; if(note) note.hidden = false; pageDirty = false; }
  function dirty(){ btn.disabled = false; if(note) note.hidden = true; pageDirty = true; }
  clean();
  view.addEventListener('input', dirty);
  view.addEventListener('change', dirty);
  btn.addEventListener('click', clean);
}
/* Leaving with unsaved edits asks first — the same dialog the wizard uses. */
function guardLinks(){
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href]');
    if(!a || !pageDirty || a.target === '_blank') return;
    var href = a.getAttribute('href');
    if(!href || href.charAt(0) === '#') return;
    e.preventDefault();
    openModal('You have unsaved changes.',
      '<p>Your edits on this page haven\u2019t been saved yet. If you leave now, they\u2019ll be lost.</p>');
    $('#modalCloseBtn').textContent = 'Stay';
    var leave = document.createElement('button');
    leave.type = 'button'; leave.className = 'btn ter'; leave.textContent = 'Leave without saving';
    leave.addEventListener('click', function(){ pageDirty = false; location.href = href; });
    $('#overlay .mf').insertBefore(leave, $('#modalCloseBtn'));
    $('#modalCloseBtn').focus();
  }, true);
}

/* ---------- plan & product cards ---------- */
/* One builder each, shared by the new-user screen, the wizard and styleguide.html. */
function planCard(c){
  return '<div class="dblock plancard">'
    + '<div class="pc-head"><h2>' + c.name + '</h2>' + (c.badge ? '<span class="pill">' + c.badge + '</span>' : '') + '</div>'
    + '<div class="pc-price">' + c.price + ' <span class="pc-per">' + c.per + '</span></div>'
    + (c.term ? '<div class="pc-term">' + c.term + '</div>' : '')
    + '<div class="pc-feats">' + c.feats.map(function(f){ return '<div class="pc-feat">' + f + '</div>'; }).join('') + '</div>'
    + (c.foot ? '<div class="pc-note">' + c.foot + '</div>' : '')
    + '<button class="btn pc-cta" data-plan="' + c.name + '">Get started</button>'
    + '</div>';
}
function productCardHTML(card, selected){
  var on = !!selected;
  return '<div class="dblock plancard nl-prodcard nl-select' + (on ? ' on' : '') + '" data-product="' + card.key + '" role="button" tabindex="0" aria-pressed="' + on + '">'
    + '<div class="pc-head"><h2>' + card.name + '</h2></div>'
    + '<div class="nl-vline">' + card.vline + '</div>'
    + '<div class="nl-sline">' + card.sline + '</div>'
    + (card.unlimited ? '<div class="nl-unl"><div class="nl-unl-k">Unlimited</div><div class="nl-unl-v">' + card.unlimited + '</div></div>' : '')
    + '</div>';
}

/* ============ Invoice actions: mock PDF view + real download ============ */
function rowInvoiceData(btn){
  var tr = btn.closest('tr'), tds = tr ? tr.querySelectorAll('td') : [];
  return { num: tds[0] ? tds[0].textContent.trim() : 'INVOICE',
           date: tds[1] ? tds[1].textContent.trim() : '',
           amount: tds[2] ? tds[2].textContent.trim() : '' };
}
// print-styled mock invoice document — served as a blob URL in a new tab,
// reads as a PDF preview
function mockInvoiceUrl(d){
  var html = '<!doctype html><html><head><meta charset="utf-8"><title>Invoice ' + d.num + '</title>'
    + '<style>body{margin:0;background:#e9e9e7;font:14px/1.5 Ubuntu,system-ui,sans-serif;color:#1c1c1c}'
    + '.page{width:640px;margin:28px auto;background:#fff;border:1px solid #ddd;padding:44px 48px;box-shadow:0 8px 30px rgba(0,0,0,.08)}'
    + '.hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1c1c1c;padding-bottom:16px}'
    + 'h1{font-size:20px;margin:0}.muted{color:#777}.inv{font-family:ui-monospace,monospace}'
    + 'table{width:100%;border-collapse:collapse;margin-top:28px;font-size:14px}'
    + 'th{text-align:left;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:.08em;font-size:12px;border-bottom:1px solid #ddd;padding:8px 0}'
    + 'td{padding:12px 0;border-bottom:1px dashed #e2e2e2}.num{text-align:right}'
    + '.tot{margin-top:18px;display:flex;justify-content:flex-end;gap:40px;font-weight:700;font-size:16px}'
    + '.ft{margin-top:40px;color:#999;font-size:12px}'
    + '@media print{body{background:#fff}.page{border:0;box-shadow:none;margin:0}}</style></head><body>'
    + '<div class="page"><div class="hd"><div><h1>ThingsBoard</h1><div class="muted">License Portal · thingsboard.io</div></div>'
    + '<div style="text-align:right"><div style="font-size:18px;font-weight:700">INVOICE</div><div class="inv">' + d.num + '</div><div class="muted">' + d.date + '</div></div></div>'
    + '<table><thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Amount</th></tr></thead><tbody>'
    + '<tr><td>ThingsBoard Professional Edition — license charge</td><td class="num">1</td><td class="num">' + d.amount + '</td></tr>'
    + '</tbody></table>'
    + '<div class="tot"><span>Total</span><span>' + d.amount + '</span></div>'
    + '<div class="ft">Paid · Visa ••4242 · This is a prototype mock document, not a real invoice.</div></div></body></html>';
  var blob = new Blob([html], { type:'text/html' });
  var url = URL.createObjectURL(blob);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 30000);
  return url;
}
// minimal valid single-page PDF built at runtime (offsets computed dynamically)
function buildPdf(textLines){
  var stream = 'BT /F1 12 Tf 16 TL 50 770 Td '
    + textLines.map(function(t){ return '(' + String(t).replace(/[()\\]/g, '') + ') Tj T*'; }).join(' ')
    + ' ET';
  var objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream'
  ];
  var pdf = '%PDF-1.4\n', offsets = [0];
  objs.forEach(function(o, i){ offsets.push(pdf.length); pdf += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
  var xref = pdf.length;
  pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n';
  for(var i = 1; i <= objs.length; i++){ pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n'; }
  pdf += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
  return new Blob([pdf], { type:'application/pdf' });
}
function downloadInvoice(d, btn){
  var blob = buildPdf([
    'ThingsBoard - License Portal', '',
    'INVOICE ' + d.num,
    'Date: ' + d.date, '',
    'ThingsBoard Professional Edition - license charge',
    'Amount: ' + d.amount, '',
    'Total: ' + d.amount, '',
    'Paid - Visa **4242',
    'This is a prototype mock document, not a real invoice.'
  ]);
  var a = document.createElement('a'), url = URL.createObjectURL(blob);
  a.href = url; a.download = d.num + '.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
  if(btn){
    var old = btn.textContent;
    btn.textContent = '✓ Downloaded'; btn.disabled = true;
    setTimeout(function(){ btn.textContent = old; btn.disabled = false; }, 1000);
  }
}


// View invoice is a real anchor: its blob href is filled during the capture
// phase of the actual click, so the browser opens the new tab natively
document.addEventListener('click', function(e){
  var v = e.target.closest('a[data-viewinv]');
  if(v) v.href = mockInvoiceUrl(rowInvoiceData(v));
}, true);
document.addEventListener('click', function(e){
  var dl = e.target.closest('[data-dlinv]');
  if(dl){ downloadInvoice(rowInvoiceData(dl), dl); }
});

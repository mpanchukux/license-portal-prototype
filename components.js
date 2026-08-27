/* ============================================================================
   components.js — the renderers more than one page needs: the licence table
   (Home block + Licenses page), invoice and user rows, the activity feed (Home
   + Activity + the licence's own tab), and the cancel dialog. Every builder is
   pure string-in/string-out; wiring helpers take a root selector so a page can
   attach them to whichever container it owns.
   ============================================================================ */

/* ---------- licence rows ---------- */
function attnRank(l){ return l.status==='payment_failed' ? 0 : l.status==='updates_expiring' ? 1 : l.status==='canceled' ? 3 : 2; }
/* The Licenses table carries only two statuses for now: Active and Canceled.
   Attention states still live on the licence and still drive the details-page
   alert and the dashboard ordering — the table just does not shout them, and
   their date shows in the Renewal / Updates column instead. */
/* Status answers one question — is this licence alive? — with two values, on every
   surface: Active or Canceled. Attention states (payment failed, updates expiring,
   no first check-in yet) are not statuses; they are the banner on the details page,
   which carries the date and the action. Same rule as statusChipHTML. */
function statusPill(l){
  var st = l && typeof l === 'object' ? l.status : l;
  if(st==='canceled') return '<td><span class="pill off">Canceled</span></td>';
  return '<td><span class="pill">Active</span></td>';
}
/* What the next date means depends on the licence: a subscription renews, a
   perpetual stops receiving updates, a cancelled subscription runs out, and a
   grant never expires. Attention states keep their date here. */
function renewCell(p){
  if(p.grant)  return '<td><span class="muted">No expiry</span></td>';
  if(!p.event) return '<td><span class="muted">—</span></td>';
  var d = fmtDate(p.event);
  var txt = p.status === 'canceled' ? ('Active until ' + d)
          : p.type === 'Perpetual'  ? ('Updates until ' + d)
          : ('Renews ' + d);
  return '<td class="lic-num">' + txt + '</td>';
}
function nextCharge(ds){
  var subs = ds.licenses.filter(function(l){ return l.type==='Subscription' && l.status==='active'; });
  subs.sort(function(a,b){ return dateKey(a.event)-dateKey(b.event); });
  return subs[0] || null;
}
// a dataset may legitimately have no invoices (the grant is free) — say so
function invEmptyRow(){
  return '<tr><td colspan="6" class="emptybox">' + (DATA().noInvoicesNote || 'No invoices yet.') + '</td></tr>';
}
function invRow(v){
  var pill = v.status==='Past due' ? '<span class="pill attn">Past due</span>' : '<span class="pill">'+(v.status||'Paid')+'</span>';
  return '<tr><td class="mono">'+v.num+'</td><td>'+v.date+'</td><td class="num">'+v.amount+'</td><td>'+pill+'</td><td>'+v.payment+'</td>'
    + '<td class="cellact"><span class="rowactions"><button class="link" data-dlinv>Download PDF</button><a class="link" data-viewinv target="_blank" rel="noopener" href="#">View invoice</a></span></td></tr>';
}
function userRow(u){
  return '<tr><td>'+u.name+'</td><td>'+u.email+'</td><td>'+u.created+'</td>'
    + '<td class="cellact"><span class="rowactions"><button class="link" data-loginas="'+u.email+'">Login as →</button><button class="link" data-deluser="'+u.email+'">Delete</button></span></td></tr>';
}
// "Show all" is a plain link — the count lives on the page it opens
function menuItems(p){
  var type = p && typeof p === 'object' ? p.type : p;
  if(type === 'Perpetual') return '<button role="menuitem" data-stub="Add capacity">Add capacity</button><button role="menuitem" data-stub="Renew software updates">Renew software updates</button>';
  var last = (p && p.status==='canceled')
    ? '<button role="menuitem" data-stub="Renew subscription">Renew subscription</button>'
    : '<button role="menuitem" data-cancel>Cancel subscription</button>';
  return '<button role="menuitem" data-manageaddons>Manage add-ons</button><button role="menuitem" data-changeplan>Change plan</button>' + last;
}
function actionsCell(p){
  // a grant cannot be changed, cancelled or topped up — the key is all there is,
  // so its row carries the copy action and no overflow menu (inferred)
  if(p && p.grant) return '<td class="cellact"><div class="lic-actions">'
    + '<button class="iconbtn ib tip lic-copy" aria-label="Copy license key" data-tip="Copy license key">' + COPYSVG + '</button></div></td>';
  return '<td class="cellact"><div class="lic-actions">'
    + '<button class="iconbtn ib tip lic-copy" aria-label="Copy license key" data-tip="Copy license key">' + COPYSVG + '</button>'
    + '<div class="menu"><button class="iconbtn ib" aria-haspopup="true" aria-expanded="false" aria-label="More actions">' + KEBAB + '</button>'
    + '<div class="pop" role="menu" hidden>' + menuItems(p) + '</div></div></div></td>';
}
function rowOpen(p){
  return '<tr class="lic-row' + (p.status==='canceled' ? ' off' : '') + '" '
    + (p.id ? 'data-licid="' + p.id + '" ' : '')
    + 'data-goto="' + (p.goto || '') + '" data-product="' + (p.product || '') + '" data-type="' + p.type + '" data-status="' + (p.status || 'active') + '" tabindex="0" aria-label="Open ' + (p.product ? p.product + ' ' : '') + p.name + ' details">';
}
/* Product-first, product-neutral: no product-specific columns. The label lives
   under Product; the next date has its own State column, which is what lets the
   Status column carry only Active / Canceled. */
function headHtml(){
  return '<tr><th class="lic-prodhead">Product</th><th>License</th><th>Type</th><th>Status</th>'
    + '<th>State</th><th>Created</th>'
    + '<th aria-label="Actions"></th></tr>';
}
function rowHtml(p){
  // Product name, label underneath (muted "—" keeps the two-line rhythm when a
  // licence has no label yet; the real "+ Add label" affordance is on details).
  var prodCell = '<td class="lic-prodcell"><div class="lp-name">' + (p.product || '') + '</div>'
    + '<div class="lic-prodlabel">' + (p.label ? esc(p.label) : '<span class="muted">—</span>') + '</div></td>';
  // the licence column is the plan/package; a grant adds what it has instead of a price
  var lic = '<td><div class="lp-name">' + p.name + '</div>'
    + (p.grant ? '<div class="lp-meta">Free &middot; ' + p.limits + '</div>' : '') + '</td>';
  var typeCell = '<td><span class="chip">' + p.type + '</span></td>';
  var createdCell = '<td class="lic-num">' + p.created + '</td>';
  return rowOpen(p) + prodCell + lic + typeCell + statusPill(p) + renewCell(p) + createdCell + actionsCell(p) + '</tr>';
}

/* ---------- navigation ---------- */
/* A licence row is a real link target: details live at license.html?id=…, and
   `from` tells that page which section to highlight and where its back goes. */
function licenseHref(p, from){
  return 'license.html?id=' + encodeURIComponent(p.id || '') + (from ? '&from=' + from : '');
}

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
function openRowLink(row, from){
  var id = row.getAttribute('data-licid');
  if(id && licById(id)){ location.href = 'license.html?id=' + encodeURIComponent(id) + (from ? '&from=' + from : ''); return; }
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
    createdTime: a.ts,
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
    +     '<div class="fi-meta">' + a.ts + '</div>'
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
function feedDay(a){ var q=String(a.ts).split(/[ ,]+/); return epochDay(+q[2], MONF[q[1]]||1, +q[0]); }
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
function tsFrom(created, time){ var q=String(created).split(' '); return (q[1]||'01')+' '+q[0]+' '+q[2]+', '+time; }
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
/* One sticky page-level Save: any change anywhere on the page enables it and
   hides "All changes saved"; saving resets both. `dirty` is also what the
   leave-guard checks. */
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

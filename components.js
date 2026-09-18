/* ============================================================================
   components.js — the renderers more than one page needs: the licence table
   (Home block + Licenses page), invoice and user rows, the activity feed (Home
   + Activity + the licence's own tab), and the cancel dialog. Every builder is
   pure string-in/string-out; wiring helpers take a root selector so a page can
   attach them to whichever container it owns.
   ============================================================================ */

/* ---------- licence rows ---------- */
/* ⚠️ `awaiting_checkin` was missing from this ranking while the comment right below
   listed it as an attention state — so the one licence that shows an attention
   banner on its own details page did not rank as needing attention on Home. Exposed
   by adding the Community Grant row: it never surfaced in Home's top five. Order is
   most-urgent first; `active` and `canceled` keep their relative places. */
function attnRank(l){
  return l.status==='payment_failed'   ? 0
       : l.status==='updates_expiring' ? 1
       : l.status==='awaiting_checkin' ? 2
       : l.status==='canceled'         ? 4
       : 3;
}
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
  /* ⚠️ No `.muted` wrapper. `.muted` is --faint, while every other state ("Renews
     Sep 02, 2026", "Updates until …") inherits --mid from .licstat-txt/.licstat-mob
     — so the grant's line was a shade lighter than its neighbours for no reason.
     It is the same kind of fact; it gets the same tone. */
  if(p.grant)  return 'No expiry';
  if(!p.event) return '<span class="muted">—</span>';
  var d = fmtDate(p.event);
  return p.status === 'canceled' ? ('Active until ' + d)
       : p.type === 'Perpetual'  ? ('Updates until ' + d)
       : ('Renews ' + d);
}
/* The two glyphs that lead the licence card's bottom line and the details renewal
   row. The MEANING is always written next to the date as well ("Renews …" /
   "Updates until …") — the icon is a marker, never the only carrier.

   ⚠️ Subscription reuses AUTOSVG, the very same mark the invoice tables use for
   "charged automatically". That is deliberate: a subscription renewing and an
   invoice being charged automatically are the same recurring fact seen from two
   places, so one glyph should mean it everywhere. (This replaced a bespoke
   two-arrow cycle drawn for the card alone — two glyphs for one idea.)

   ⚠️ Perpetual is a SHIELD-CHECK, not a download arrow. A download arrow says
   "fetch a file", which is not what the date means: the date is how long the
   licence is COVERED for updates and support. A shield with a check reads as
   coverage, and it cannot be confused with the subscription mark at 18px. */
/* ⚠️ Declared HERE, above its first use, not down beside autoChargeIcon(). `var`
   hoists the name but not the value, so with the declaration below this line
   CYCLESVG was assigned `undefined` and every licence card lost its glyph. */
var AUTOSVG = '<svg class="icon" viewBox="0 0 24 24"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
var CYCLESVG = AUTOSVG;
var UPDSVG = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'
  + '<path d="M12 3l7.5 3v6c0 4.2-3 7.4-7.5 9-4.5-1.6-7.5-4.8-7.5-9V6z"/>'
  + '<path d="M8.75 11.75l2.4 2.4 4.1-4.6"/></svg>';
/* the licence-details header uses the same two glyphs for its renewal row, plus a
   key for the row above it — leading icons instead of caps labels (see the ≤600px
   details-header block). */
var KEYSVG = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'
  + '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8"/><path d="M17 4h3v3"/></svg>';
/* The phone card's bottom line: glyph, then the meaning AND the date in words.
   ⚠️ It used to print the bare date and let the icon carry the meaning alone —
   which asked the reader to know the glyph vocabulary, and left "Sep 02, 2026"
   ambiguous between a renewal and an expiry. `stateText` already words this
   exactly right for the desktop column, so the phone reuses it rather than
   keeping a second phrasing that can drift. */
function stateMobile(p){
  if(p.grant)  return 'No expiry';                    // same tone as every other state
  if(!p.event) return '<span class="muted">&mdash;</span>';
  return (p.type === 'Perpetual' ? UPDSVG : CYCLESVG) + '<span>' + stateText(p) + '</span>';
}
/* Status and State were two columns asking one question between them — is this
   licence alive, and until when. Folded into one cell: the chip on the first line,
   the date underneath. The State column is gone.
   On the phone the chip goes too — the card's left stripe carries the status — and
   only the date line survives, in its icon form. */
function statusCell(p){
  return '<td><div class="licstat">' + statusChip(p)
    + '<div class="licstat-txt">' + stateText(p) + '</div>'
    + '<div class="licstat-mob mob-only">' + stateMobile(p) + '</div></div></td>';
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
/* ~~invOpenLicenseAction~~ removed: the phone card's third action was a way to the
   licence, and the card's product line is now that link on both breakpoints — the
   desktop Product cell always was. Two ways to the same place on one card is noise.
   To bring it back: an <a class="iconbtn ib tip ra-open"> to licenseHref(lic,
   'invoices'), appended in invRow's .rowactions. */
function invRow(v, opts){
  opts = opts || {};
  var pill = v.status==='Past due' ? '<span class="pill attn">Past due</span>' : '<span class="pill">'+(v.status||'Paid')+'</span>';
  return '<tr class="inv-row"><td class="mono">'+v.num+'</td><td>'+fmtDate(v.date)+'</td><td class="num">'+v.amount+'</td>'
    + '<td><span class="statwrap">'+pill+autoChargeIcon(v)+'</span></td>'
    + (opts.noProduct ? '' : invProductCell(v, opts))
    + '<td class="cellact"><span class="rowactions">'
    +   '<button class="link ra-act" data-dlinv aria-label="Download PDF">' + DLSVG + '<span class="ra-txt">Download PDF</span></button>'
    +   '<a class="link ra-act" data-viewinv target="_blank" rel="noopener" href="#" aria-label="View invoice">' + VIEWSVG + '<span class="ra-txt">View invoice</span></a>'
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
/* ⚠️ Two rows, not one. An INVITED user — asked, but not yet signed in and filled in
   their details — renders muted, carrying their email and nothing else: no name, no
   date, and no actions at all. `Login as` on someone who has never signed in would be
   impersonating an account that does not exist yet, and Delete would be revoking an
   invitation through a control labelled as though it removed a person. The row
   becomes an ordinary one, with its actions, the moment they complete sign-up. */
function userRow(u){
  if(u.pending){
    return '<tr class="user-pending"><td class="muted" colspan="3">' + esc(u.email)
      + '<span class="user-pendmark">Invited — waiting for them to sign in</span></td>'
      + '<td class="cellact"></td></tr>';
  }
  return '<tr><td>'+u.name+'</td><td>'+u.email+'</td><td>'+fmtDate(u.created)+'</td>'
    + '<td class="cellact"><span class="rowactions"><button class="link" data-loginas="'+u.email+'">Login as →</button><button class="link" data-deluser="'+u.email+'">Delete</button></span></td></tr>';
}
function menuItems(p, opts){
  var type = p && typeof p === 'object' ? p.type : p;
  // naming a licence is the one thing every type allows, so it leads every menu —
  // except in the Home preview block (opts.noLabelEdit), which is a summary: renaming
  // belongs where the licence is the subject, i.e. the Licenses page and its details.
  var label = (opts && opts.noLabelEdit) ? '' : '<button role="menuitem" data-editlabel>Edit label</button>';
  if(type === 'Perpetual') return label + '<button role="menuitem" data-stub="Add capacity">Add capacity</button><a role="menuitem" href="' + EXT.updates + '" target="_blank" rel="noopener">Renew software updates</a>';
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
  /* The phone card drops the status chip and lets a stripe down its left edge carry
     the status instead. A stripe is a single visual channel, so the status is also
     stated in words in the card's accessible name — that is what a screen reader
     and a high-contrast mode read.
     ⚠️ FOR THE UI PHASE: a tone-only stripe is not a sufficient carrier on its own.
     Pair it with a second, non-colour signal — a shape, an icon, a text marker, or
     a hairline pattern — before this ships to anyone. The aria-label covers assistive
     tech; it does nothing for a sighted user who cannot separate the two tones. */
  var alive = p.status === 'canceled' ? 'Canceled' : 'Active';
  return '<tr class="lic-row' + (p.status==='canceled' ? ' off' : '') + '" '
    + (p.id ? 'data-licid="' + p.id + '" ' : '')
    + 'data-goto="' + (p.goto || '') + '" data-product="' + (p.product || '') + '" data-type="' + p.type + '" data-status="' + (p.status || 'active') + '" tabindex="0" aria-label="' + (p.product ? p.product + ' ' : '') + p.name + ', status: ' + alive + '. Open details">';
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
  /* ⚠️ The phone card and the desktop cell split the SAME three facts differently,
     and CSS cannot repour inline text from one element into another's flow — so
     both arrangements are emitted and each breakpoint hides the other:
       desktop  ·  one line: "ThingsBoard · Subscription", plan in its own column
       phone    ·  eyebrow "Subscription", headline "ThingsBoard · Startup"
     That is why `.lp-name` (desktop) and `.lp-eyebrow`/`.lp-head` (phone) carry the
     same words twice. Editing one without the other is how they drift. */
  var txt = '<div class="lp-txt">'
    +   '<div class="lp-name">' + (p.product || '') + '<span class="lp-type"> &middot; ' + p.type + '</span></div>'
    +   (bare ? '' : '<div class="lp-eyebrow mob-only">' + p.type + '</div>')
    +   (bare ? '' : '<div class="lp-head mob-only">' + (p.product || '') + ' &middot; ' + p.name + '</div>')
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
  /* The licence column is the plan or package — nothing else.
     ⚠️ A grant used to add a second line here ("Free · 6,050 devices · 2 production
     servers"). Removed: the price is already implied by the Grant type in the
     Product column, and the limits are the entitlement table on the details page —
     no other row explains its allowances in the list, so this one should not
     either. `p.limits` is still used by the details surface. */
  /* ⚠️ A scheduled change gets the EXISTING `.pill` — the same small neutral badge the
     plan cards use for "Popular" — and it sits in the licence column, not the status
     one. Status says whether the licence works; this says something is going to
     change. Two facts, two columns, and the pill is small enough not to compete. */
  var sched = p.scheduled ? ' <span class="pill" title="Scheduled for '
      + fmtDate(p.scheduled.effective) + '">Scheduled</span>' : '';
  var lic = '<td><div class="lp-name">' + p.name + sched + '</div></td>';
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
/* ⚠️ `peBlockHTML` is GONE. It built the "What's included in Professional Edition"
   card for the one surface that still used it; that surface now renders
   `baselineBlockHTML`, which is contextual, retitled, and placed above the cards
   instead of under them. Nothing else called it. */


/* The payment method as the parts a surface needs: brand badge, masked number, and
   the expiry where it belongs. Callers own the container — Billing wraps it in a
   bordered .paycard next to its edit button, the Next charge card lays it out inline.
   opts.expiry:false drops the expiry: on the Next charge card the question is which
   card this charge goes to, not when that card runs out. Billing, which is where a
   card is actually managed, keeps it. */
/* ⚠️ Reads paymentMethodData(), not PAYMENT_METHOD directly: once a card has been
   entered, every surface that shows one shows THAT card. PAYMENT_METHOD is the
   fallback for a demo nobody has typed into. */
function paymentMethodHTML(opts){
  var withExp = !opts || opts.expiry !== false;
  var pm = paymentMethodData();
  return '<span class="brandbadge">' + pm.brand + '</span>'
    + '<span class="pc-num">' + pm.num + '</span>'
    + (withExp ? '<span class="pc-exp">' + pm.exp + '</span>' : '');
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
      copyValue('license-secret', 'License key');
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
  /* ⚠️ Quiet, and on the KEEP side — not beside the destructive button. People cancel
     because something is broken, so a route to a person is legitimate here; placed
     next to the confirm it would read as a retention trick, which is the one thing a
     cancel dialog must not be. */
  var help = document.createElement('span');
  help.className = 'cancel-help';
  help.innerHTML = 'Something not working? ' + extLink('support', 'Contact support');
  foot.insertBefore(help, foot.firstChild);
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
/* ---------- empty states: one rule, three pages --------------------------------
   An empty state says WHAT WILL APPEAR HERE and offers the action that fills it.
   Nothing else — no illustration, no explanation of the product, no second link.

   ⚠️ Same `.emptybox` the grant's "No invoices" already used; what is new is that it
   can hold three parts instead of one sentence. That is an extension of the pattern,
   not a second one: `.eb-t` / `.eb-p` / the action are optional, so the one-line form
   still renders exactly as it did.

   ⚠️ Kept visually distinct from `.noresults`. That block is a consequence of what the
   reader TYPED and its exit is "clear the search"; this one is a consequence of a new
   account and its exit is "go and buy something". Solid border, not dashed, for the
   same reason the other one is dashed: one describes the account, the other describes
   the view.

   ⚠️ ONLY ONE PAGE CARRIES A PRIMARY. A new account has exactly one thing to do, and
   invoices and activity fill themselves as a side effect of it — so Licenses gets the
   button, Invoices gets a quiet link back to it, and Activity gets no action at all.
   Four buttons saying different words for the same next step would be four decisions
   where there is one. */
function emptyStateHTML(o){
  return '<div class="emptybox eb">'
    + '<div class="eb-t">' + o.title + '</div>'
    + (o.line ? '<p class="eb-p">' + o.line + '</p>' : '')
    + (o.action ? '<div class="eb-a">' + o.action + '</div>' : '')
    + '</div>';
}
/* A table's empty state is a cell, so the caller says how wide. */
function emptyStateRow(cols, o){
  return '<tr class="eb-row"><td colspan="' + cols + '" class="eb-cell">' + emptyStateHTML(o) + '</td></tr>';
}
/* ⚠️ A body class, not a class on the view. On the phone `syncTitleRow` RELOCATES the
   refresh button and `+ New license` out of the toolbar and into the page header row,
   which is outside the view — a view-scoped rule would hide the toolbar and leave its
   two buttons sitting in the header above an empty page. */
function syncListEmpty(isEmpty){
  document.body.classList.toggle('list-empty', !!isEmpty);
}

/* ---------- search: one wiring, five surfaces ---------------------------------
   Every search box in the portal was a lit control that did nothing. They filter now,
   live, client-side, and they all go through here so they cannot drift into five
   behaviours.

   A surface hands over: where its items are, how to read the text of one, and where
   to put the no-results block. Matching is done on STRIPPED text — the activity feed
   stores HTML (`<b>` round the entity), and matching inside markup would hit a tag
   name as readily as a word.

   ⚠️ The no-results state is NOT the empty state. "Nothing here yet" and "nothing
   matched what you typed" are different facts with different exits: the first is
   waiting for you to create something, the second is waiting for you to clear a
   filter you set. Same slot, different block, and the second carries the way out.  */
function stripText(html){
  var d = document.createElement('div');
  d.innerHTML = String(html == null ? '' : html);
  return (d.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
}
function noResultsHTML(q, cls){
  return '<div class="noresults' + (cls ? ' ' + cls : '') + '">'
    + '<div class="nr-t">No matches for &ldquo;' + esc(q) + '&rdquo;</div>'
    + '<button type="button" class="link nr-clear" data-clearsearch>Clear search</button>'
    + '</div>';
}
/* opts: { items(): [nodes], text(node): string, empty(q): html, host: node }
   `empty` is asked for the block because a table needs a <tr><td colspan>, and a
   feed needs a plain div — the slot's shape belongs to the surface. */
function wireSearch(inputSel, opts){
  var input = $(inputSel); if(!input) return;
  var slot = null;
  function clearSlot(){ if(slot){ slot.remove(); slot = null; } }
  function run(){
    var q = input.value.trim().toLowerCase();
    var items = opts.items(), shown = 0;
    items.forEach(function(el){
      var hit = !q || opts.text(el).indexOf(q) >= 0;
      el.hidden = !hit;
      if(hit) shown++;
    });
    clearSlot();
    if(q && !shown){
      var host = opts.host();
      if(host){
        host.insertAdjacentHTML('beforeend', opts.empty(input.value.trim()));
        slot = host.lastElementChild;
      }
    }
  }
  input.addEventListener('input', run);
  /* delegated on the document: the block is created and destroyed as you type, so
     nothing can be bound to it directly */
  document.addEventListener('click', function(e){
    var c = e.target.closest('[data-clearsearch]');
    if(!c || !slot || !slot.contains(c)) return;
    input.value = ''; run(); input.focus();
  });
  return run;
}

/* ---------- one saved pattern, everywhere something is saved ------------------
   ⚠️ What this used to be: `btn.disabled = true` and, on two of the three pages,
   not even a note. Nothing was persisted and nothing was said — a button going quiet
   is not a confirmation, it is the absence of one, and a "saved" that vanishes on
   reload is worse than no message at all.

   Now: the caller hands over a `save` function that actually writes to the Store and
   returns true, and this wires the rest — the button stays ENABLED, the note appears
   beside it with the time, and it holds until the next edit. A `validate` may refuse,
   in which case nothing is written and nothing is claimed.
   `fieldsOf` / `applyFields` are the two halves of the identity those forms grew: a
   `data-field` on every control, so a page can be read into an object and written
   back out of one. */
function fieldsOf(viewSel){
  var out = {};
  $$(viewSel + ' [data-field]').forEach(function(el){
    out[el.getAttribute('data-field')] = el.type === 'checkbox' ? el.checked : el.value;
  });
  return out;
}
function applyFields(viewSel, data){
  if(!data) return;
  $$(viewSel + ' [data-field]').forEach(function(el){
    var k = el.getAttribute('data-field');
    if(!(k in data)) return;
    if(el.type === 'checkbox') el.checked = !!data[k]; else el.value = data[k];
  });
}
function nowClock(){
  var d = new Date();
  return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
}
function wirePageSave(viewSel, btnSel, opts){
  opts = opts || {};
  var view = $(viewSel), btn = $(btnSel);
  if(!view || !btn) return;
  var note = $(btnSel + 'Note');
  function say(txt){ if(!note) return; note.textContent = txt; note.hidden = !txt; }
  function dirty(){ say(''); pageDirty = true; }
  view.addEventListener('input', dirty);
  view.addEventListener('change', dirty);
  btn.addEventListener('click', function(){
    if(opts.validate && !opts.validate()) return;   // refused: it says why itself
    if(opts.save && opts.save() === false) return;
    pageDirty = false;
    say('Saved \u00b7 ' + nowClock());
  });
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
/* ============================================================================
   The plan picker — ONE template, three hosts
   ============================================================================
   Product cards · Subscription/Perpetual tabs · plan cards with their Select
   buttons. Three hosts render it: the wizard's step 1, the public landing page's
   pricing section, and the new-user screen on Home. They are the same components
   reading the same data (EC_PLANS), so an offer that changes changes in all three
   at once — the only difference is what a Select means, which is why picking is
   reported back to the host rather than acted on here. A visitor who signs up must
   not find that choosing a plan looks different on the other side of the door.

   ⚠️ It lives HERE, not in wizard.js, because styleguide.html renders the plan-card
   specimen and cannot load wizard.js — NL's IIFE binds to #nlModal, which that page
   has no reason to carry.

   Every function takes a plain selection object — { product, kind, plan, locked,
   currentName } — instead of reading a controller's private state. That is what
   made the second host possible: NL passes its own `st` straight in, because the
   three field names are the ones it already used.
   ============================================================================ */
/* LEVEL 1 — product: two wide CARDS, and still a switcher. Exactly one is
   selected; the selected one is marked with a dark outline (`.nl-select.on`
   gives border + inset ring), NOT a black fill — a filled card reads as a
   pressed button and outshouts the plan cards below it, which are the actual
   offer. Each card carries the product's one-line description, so the step
   says what the two products are instead of assuming you know.
   Glyphs stay monochrome: a hub and spokes for the platform, a broadcast arc
   for the broker. */
var PRODUCT_CHOICES = [
  { v:'thingsboard', t:'ThingsBoard', d:'IoT platform — devices, dashboards, rule engine',
    g:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="4" r="1.5"/><circle cx="12" cy="20" r="1.5"/>'
      + '<circle cx="4" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/>'
      + '<path d="M12 9V5.5M12 15v3.5M9 12H5.5M15 12h3.5"/>' },
  { v:'tbmq', t:'TBMQ', d:'MQTT broker for reliable message streaming',
    g:'<circle cx="7" cy="17" r="1.6"/><path d="M7 11.5A5.5 5.5 0 0 1 12.5 17"/>'
      + '<path d="M7 6A11 11 0 0 1 18 17"/>' }
];
function nlProductCardsHTML(sel){
  var active = sel.product, locked = !!sel.locked;
  return '<div class="nl-prodrow">'
    + '<div class="nl-prodcards" role="radiogroup" aria-label="Product">'
    + PRODUCT_CHOICES.map(function(o){
        var on = o.v === active;
        /* a real button, not a div with role=button: it is one of two mutually
           exclusive choices — see the radio note below for the contract. */
        /* ⚠️ `role="radio"` + `aria-checked`, not `aria-pressed`. It is exactly-one-of-N,
           and aria-pressed describes an independent toggle — the wrong contract for
           a group where choosing one unchooses the other. The leading indicator is
           drawn (`.nl-prodradio`), so what a sighted user sees and what a screen
           reader is told finally say the same thing. */
        return '<button type="button" role="radio" class="dblock nl-prodcard nl-select' + (on ? ' on' : '') + '"'
          + ' data-nl-product="' + o.v + '" aria-checked="' + on + '"' + (locked ? ' disabled' : '') + '>'
          + '<span class="nl-prodradio" aria-hidden="true"></span>'
          + '<span class="nl-prodic"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + o.g + '</svg></span>'
          + '<span class="nl-prodtxt"><span class="nl-prodname">' + o.t + '</span>'
          + '<span class="nl-proddesc">' + o.d + '</span></span></button>';
      }).join('')
    + '</div></div>';
}

/* LEVEL 2 — billing as TABS, left-aligned, standing where the heading used to.
   The heading ("Subscription plans" / "Perpetual licenses") is gone: it said the
   same thing the active tab says, and the switch + ⓘ pair made one decision look
   like two controls (a toggle whose labels were also clickable-looking text).
   Two tabs, the active one carrying the indicator, is what a two-way switch
   between two sets of content actually is — and it reuses the `.tabs`/`.tab`
   pattern the details page already has.
   ⚠️ The descriptions moved to a SHORT LINE BENEATH the active tab, not into the
   tab's ⓘ. Reason: on the one step whose entire job is this choice, the
   difference between paying monthly and paying once has to be readable without a
   gesture — and a tooltip is a hover affordance, which does not exist on touch
   (the same reason the plan cards' CTA stopped being hover-revealed). The line
   swaps with the tab, so only the active choice is explained. */
/* ⚠️ The descriptions are now about PAYMENT only. The subscription tab used to end
   "...unlimited customers, dashboards, integrations, API calls, data points and
   messages, and you can change the plan any time" — the first half of that was the
   baseline written as prose, one tab above a block that listed the same thing. It
   moved into the baseline block; what stays is when you are charged and what you can
   change, which is what a billing tab is for. See BILLING_MODE_NOTE in data.js. */
var BILLING_CHOICES = [
  { v:'subscription', t:'Subscription', d:BILLING_MODE_NOTE.subscription },
  { v:'perpetual',    t:'Perpetual',    d:BILLING_MODE_NOTE.perpetual }
];
function nlBillTabsHTML(sel){
  var locked = !!sel.locked, perp = sel.kind === 'perpetual';
  var active = perp ? BILLING_CHOICES[1] : BILLING_CHOICES[0];
  return '<div class="nl-billrow">'
    + '<div class="tabs nl-billtabs" role="tablist" aria-label="Billing">'
    + BILLING_CHOICES.map(function(o){
        var on = (o.v === 'perpetual') === perp;
        return '<button type="button" class="tab nl-billtab' + (on ? ' on' : '') + '"'
          + ' role="tab" aria-selected="' + on + '" data-nl-bill="' + o.v + '"'
          + (locked ? ' disabled' : '') + '>' + o.t + '</button>';
      }).join('')
    + '</div>'
    + '<div class="nl-billdesc">' + active.d + '</div>'
    + '</div>';
}
function nlPlanCardHTML(c, set, sel){
  var current = !!sel.currentName && c.name === sel.currentName;
  var on = !current && c.name === sel.plan;
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
    + '<div class="pc-feats">' + c.feats.map(function(f){
        var n = featNote(f);
        return '<div class="pc-feat">' + f
          + (n ? '<span class="pc-featnote">' + n + '</span>' : '') + '</div>';
      }).join('') + '</div>'
    + (c.foot ? '<div class="pc-note">' + c.foot + '</div>' : '')
    + cta
    + '</div>';
}

/* One selection object shape, so a host does not have to know the spelling. */
function planPickerKey(sel){
  return (sel.product || 'thingsboard') + '|' + (sel.kind === 'perpetual' ? 'perpetual' : 'payg');
}
/* Renders both halves into the two nodes the host provides. `withcur` reserves the
   24px lane the "Current plan" strip needs, and ONLY when a card actually is the
   current one — a licence on a plan that is no longer offered matches nothing here,
   and the class would then hold an empty gap open above every card. */
/* What hangs UNDER the grid on a selling surface, and only there. A single-card
   set says where the sizing happens instead; a multi-card set gets the PE card,
   whose intro carries the "all plans include …" line so nothing floats loose
   between the grid and the block.
   ⚠️ The wizard passes no `extraEl` and so gets neither: its Subscription tab
   description already says what every plan includes, and repeating the PE card
   inside a step whose whole job is the choice would push the cards off screen
   (see renderStep1). That is the one deliberate difference between the hosts. */
/* ---------- the baseline block ------------------------------------------------
   Sits directly under the billing tabs and above the cards, because it answers a
   question the reader has already asked — "what do I get whichever of these I pick"
   — and it is only answerable once a product and a mode are chosen. It is NOT near
   the H1: the page sells two products, and up there it would describe one the reader
   has not selected.

   ⚠️ It is CONTEXTUAL, and for TBMQ it is a marked GAP. Nothing in the data
   enumerates what a TBMQ PE licence includes — the cards name the set and stop — so
   the block says that plainly instead of writing broker features that nobody has
   approved. Do not fill this in from memory of the product. */
function baselineFor(sel){
  var product = sel.product || 'thingsboard';
  if(product === 'thingsboard'){
    return { title:'Included in every plan', intro:PLANS_INCLUDE_NOTE, items:PE_FEATURES };
  }
  return { title:'Included in every plan', gap:true,
           intro:'The TBMQ baseline is not written yet — the plan cards name it '
                + '(&ldquo;All TBMQ PE features&rdquo;) but nothing in this prototype lists it. '
                + 'Copy needed before this block can say anything true.' };
}
function baselineBlockHTML(sel){
  var b = baselineFor(sel);
  return '<div class="nl-pe baseline' + (b.gap ? ' is-gap' : '') + '">'
    + '<div class="nl-pe-h">' + b.title + '</div>'
    + (b.intro ? '<p class="nl-pe-intro">' + b.intro + '</p>' : '')
    + (b.items
        /* ⚠️ The description is WRAPPED so the phone can drop it. Measured at 390 before
           this: the full block ran 530px of an 844px viewport and pushed the first plan
           card to y=1112 — entirely below the fold, so the page showed a list of
           features and no prices. On the phone the names alone carry the point; the
           descriptions are there for someone comparing, and comparing happens on a
           screen where the cards are visible too. */
        ? '<div class="nl-pe-body">'
          + b.items.map(function(f){
              return '<div class="nl-pe-item"><b>' + f[0] + '</b>'
                + '<span class="nl-pe-d"> — ' + f[1] + '</span></div>';
            }).join('')
          + '</div>'
        : '')
    + '</div>';
}

/* What hangs UNDER the grid. Only the single-set note now: the features block moved
   ABOVE the cards, where it describes what they have in common before you read what
   separates them. This note is about the cards themselves, so it stayed below them. */
function planPickerExtraHTML(set, sel){
  /* the tax line sits with the prices it qualifies — one of the three surfaces
     TAX_NOTE appears on, the others being the Review and Billing steps */
  return (set.single ? '<div class="pc-note center">' + EC_SINGLE_NOTE + '</div>' : '')
    + '<p class="taxnote">' + TAX_NOTE + '</p>';
}
/* `extraEl` is optional: pass it on a selling surface (the landing page and the
   new-user screen on Home), omit it in the wizard. Everything above the grid is
   identical for all three by construction — there is no second copy to drift. */
/* `baseEl` is the slot between the tabs and the cards. Like `extraEl` it is optional:
   the wizard passes neither, because its step 1 is a choice and not a sales page. */
function renderPlanPicker(choicesEl, gridEl, sel, extraEl, baseEl){
  var set = EC_PLANS[planPickerKey(sel)];
  choicesEl.innerHTML = nlProductCardsHTML(sel) + nlBillTabsHTML(sel);
  if(baseEl) baseEl.innerHTML = baselineBlockHTML(sel);
  var hasCur = !!sel.currentName && set.cards.some(function(c){ return c.name === sel.currentName; });
  gridEl.className = 'plangrid' + (set.single ? ' one' : '') + (hasCur ? ' withcur' : '');
  gridEl.innerHTML = set.cards.map(function(c){ return nlPlanCardHTML(c, set, sel); }).join('');
  if(extraEl) extraEl.innerHTML = planPickerExtraHTML(set, sel);
}
/* One reading of a click inside the picker, so the two hosts cannot disagree about
   what its parts mean. It mutates `sel` and says what happened; what to DO about it
   — re-render and stay, or advance a step, or open sign-up — belongs to the host.
   ⚠️ The plan branch is scoped to `.plangrid`. Product cards carry `.nl-select`
   too, so an unscoped match would read a product card as a plan. */
function planPickerClick(e, sel){
  var seg = e.target.closest('[data-nl-product]');
  if(seg && !seg.disabled){
    var wantP = seg.getAttribute('data-nl-product');
    if(wantP === sel.product) return null;
    sel.product = wantP; sel.plan = null; return 'changed';
  }
  var btab = e.target.closest('[data-nl-bill]');
  if(btab && !btab.disabled){
    var wantK = btab.getAttribute('data-nl-bill');
    if(wantK === sel.kind) return null;
    sel.kind = wantK; sel.plan = null; return 'changed';
  }
  var pick = e.target.closest('[data-nl-pick], .plangrid .nl-select');
  if(pick){
    sel.plan = pick.getAttribute('data-nl-pick') || pick.getAttribute('data-plan');
    return 'picked';
  }
  return null;
}

/* ⚠️ `planCard` is GONE. It was a second plan-card builder — same data, but a
   "Get started" CTA that was always primary and no selected / current states — and
   it served only Home's new-user screen and the styleguide specimen. Both now use
   `nlPlanCardHTML` (wizard.js), which every other surface already used. If you need
   a plan card, that is the one; do not reintroduce a variant to avoid passing a
   selection object. */
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
/* ---------- who the invoice is billed to --------------------------------------
   ⚠️ Read from the SAVED billing address, falling back to the company profile and
   then to the demo's own strings. Before this, both documents printed hardcoded text
   and "Paid · Visa ••4242" no matter what the Billing page said — a form claiming to
   control a document it was not connected to. Now editing the address changes the
   next invoice, and changing the card changes what the invoice says it was paid with. */
function invoiceParty(){
  var b = Store.get('billingAddress') || {}, p = Store.get('profile') || {};
  var line = function(v, fb){ return (v && String(v).trim()) || fb; };
  var city = line(b.city, line(p.city, 'New York'));
  var state = line(b.state, line(p.state, 'New York'));
  var zip = line(b.zip, line(p.zip, '10001'));
  return {
    company: line(p.company, 'ThingsBoard'),
    email:   line(b.email, 'hello@thingsboard.io'),
    addr:    line(b.addr, line(p.addr, '500 7th Avenue')),
    addr2:   line(b.addr2, line(p.addr2, '')),
    cityline: city + ', ' + state + ' ' + zip,
    country: line(b.country, line(p.country, 'United States'))
  };
}
function invoicePaidWith(){
  var pm = savedCard();
  return pm ? (pm.brand.charAt(0) + pm.brand.slice(1).toLowerCase() + ' \u2022\u2022' + pm.last4)
            : 'Visa \u2022\u20224242';
}

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
    + '.bill{margin-top:34px;font-size:13px;line-height:1.55}.bill .muted{text-transform:uppercase;letter-spacing:.08em;font-size:11px;margin-bottom:4px}'
    + '@media print{body{background:#fff}.page{border:0;box-shadow:none;margin:0}}</style></head><body>'
    + '<div class="page"><div class="hd"><div><h1>ThingsBoard</h1><div class="muted">Licenses · thingsboard.io</div></div>'
    + '<div style="text-align:right"><div style="font-size:18px;font-weight:700">INVOICE</div><div class="inv">' + d.num + '</div><div class="muted">' + d.date + '</div></div></div>'
    + '<table><thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Amount</th></tr></thead><tbody>'
    + '<tr><td>ThingsBoard Professional Edition — license charge</td><td class="num">1</td><td class="num">' + d.amount + '</td></tr>'
    + '</tbody></table>'
    + '<div class="tot"><span>Total</span><span>' + d.amount + '</span></div>'
    + (function(){ var b = invoiceParty();
        return '<div class="bill"><div class="muted">Billed to</div><div>' + esc(b.company) + '</div>'
          + '<div>' + esc(b.addr) + '</div>'
          + (b.addr2 ? '<div>' + esc(b.addr2) + '</div>' : '')
          + '<div>' + esc(b.cityline) + '</div><div>' + esc(b.country) + '</div>'
          + '<div class="muted">' + esc(b.email) + '</div></div>'; })()
    + '<div class="ft">Paid · ' + esc(invoicePaidWith()) + ' · This is a prototype mock document, not a real invoice.</div></div></body></html>';
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
  var b = invoiceParty();
  var blob = buildPdf([
    'ThingsBoard - Licenses', '',
    'INVOICE ' + d.num,
    'Date: ' + d.date, '',
    'Billed to:',
    b.company,
    b.addr
  ].concat(b.addr2 ? [b.addr2] : []).concat([
    b.cityline,
    b.country,
    b.email, '',
    'ThingsBoard Professional Edition - license charge',
    'Amount: ' + d.amount, '',
    'Total: ' + d.amount, '',
    'Paid - ' + invoicePaidWith().replace(/\u2022/g, '*'),
    'This is a prototype mock document, not a real invoice.'
  ]));
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

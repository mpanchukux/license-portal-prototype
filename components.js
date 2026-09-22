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
  /* ⚠️ Over the instance limit ranks ABOVE a failed payment, and it is DERIVED rather
     than read from `status` — a licence can be `active` and still be over its limit,
     which is exactly the state the demo was in with nothing anywhere saying so. It
     leads because it is the only one of these that stops the deployment now rather
     than on a future date. */
  if(instOverLimit(l)) return -1;
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
  /* ⚠️ The one attention state that IS a status — see statusChipHTML. A row that says
     `Active` while its own state line says "Over instance limit · 2 of 1" is the list
     contradicting itself in two adjacent cells. */
  if(typeof l === 'object' && instOverLimit(l)) return '<span class="pill attn">Blocked</span>';
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
  /* the blocking fact outranks the dated one: a licence that is not running right now
     is not best described by when it renews */
  if(instOverLimit(p)) return 'Over instance limit &middot; ' + instRunning(p) + ' of ' + instAllowed(p);
  if(p.grant)  return 'No expiry';
  if(!p.event) return '<span class="muted">—</span>';
  var d = fmtDate(p.event);
  /* ⚠️ A PAST DATE NEEDS ITS OWN WORDS. "Updates until Sep 10, 2026" on a date that has
     already gone reads as a fact about the future and has to be re-read against today
     before it means anything. Four words say it instead, next to the alert icon that
     marks it — and the full explanation stays on the licence page, as specified. */
  if(hasUpdatesTerm(p) && daysUntil(p.event) < 0) return 'Updates period over';
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
  if(instOverLimit(p)) return '<span>' + stateText(p) + '</span>';
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
  return '<td><div class="licstat">' + statusChip(p) + alertIcon(p)
    + '<div class="licstat-txt">' + stateText(p) + '</div>'
    + '<div class="licstat-mob mob-only">' + stateMobile(p) + '</div></div></td>';
}
/* ---------- the ALERT icon, and why it is not the info icon ---------------------
   ⚠️ TWO ICONS, TWO MEANINGS, AND THE DIFFERENCE IS THE POINT. `infoIcon` (ⓘ) explains
   something NEUTRAL — what a production instance is, what an AI credit buys — and the
   reader loses nothing by never opening it. This one says something is WRONG, and it
   is the only thing in the row that does. If they looked the same, a row would answer
   "is anything the matter here?" with a glyph that means either.
   Both are in the styleguide with the distinction stated, so a third does not get
   invented the next time something needs marking.

   ⚠️ IT IS NOT IN AN ERROR COLOUR, and that is a deliberate departure from the brief —
   see the report. This prototype is monochrome by hard rule: state is carried by
   weight, fill and shape, never by hue, and one red glyph would be the only colour in
   the product. The filled ink triangle is the strongest mark the system has, and it is
   the same one the attention chips already use. Adding `--error` is a one-token change
   if the rule is being revisited.

   ⚠️ The label is SHORT, by instruction: the full sentence is on the licence page. */
var ALERTSVG = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'
  + '<path d="M12 3.2l9.2 16.3H2.8z"/><path class="al-bang" d="M12 9.4v4.4"/>'
  + '<circle class="al-bang" cx="12" cy="16.7" r="1"/></svg>';
function alertIcon(p){
  if(!(p && typeof p === 'object')) return '';
  if(!(hasUpdatesTerm(p) && daysUntil(p.event) < 0)) return '';
  /* `.tip` gives it hover on a pointer device AND the delegated tap below 600px — the
     same contract the info icon runs on, because touch has no hover. */
  return '<button type="button" class="alertic tip wide" data-tip="Software updates ended '
    + fmtDate(p.event) + '. No security fixes or version upgrades."'
    + ' aria-label="Software updates expired">' + ALERTSVG + '</button>';
}
/* The running version against the latest released — the comparison IS the argument,
   which is why the two sit in one cell and not in two columns.
   ⚠️ A licence with no instances has no running version: nothing has reported one, and
   printing the latest release there would claim the customer is current when in fact
   they have never started. */
function versionCell(p){
  var v = licenseVersion(p);
  if(v == null) return '<td class="lic-ver"><span class="muted">&mdash;</span></td>';
  var behind = cmpVersion(v, LATEST_VERSION) < 0;
  return '<td class="lic-ver"><div class="verline' + (behind ? ' is-behind' : '') + '">'
    + '<span class="ver-run">' + esc(v) + '</span>'
    + (behind ? '<span class="ver-latest">latest ' + esc(LATEST_VERSION) + '</span>' : '')
    + '</div>'
    /* only when the instances disagree: the licence-level number is the LOWEST of
       them, so without this the reader cannot tell one laggard from a whole estate */
    + (versionMixed(p) ? '<div class="ver-mixed">across ' + instRunning(p) + ' instances</div>' : '')
    + '</td>';
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
    +   '<a class="link ra-act" data-viewinv target="_blank" rel="noopener" href="#" aria-label="View invoice (opens in a new tab)">' + VIEWSVG + '<span class="ra-txt">View invoice' + EXTSVG + '</span></a>'
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
/* ⚠️ An INVITED user — asked, but not yet signed in and filled in their details —
   keeps the table's columns. Their email sits in the EMAIL column like everyone's,
   Name and Added are simply blank because those facts do not exist yet, and a quiet
   `Invited` pill next to the address says why.

   ⚠️ SUPERSEDES the `colspan=3` muted row this used to be. That version said the same
   thing but broke the grid to say it: the email slid under the NAME heading, so the
   one column every row shares stopped lining up exactly where a reader scans for it.
   Missing data is blank cells, not a different row shape.

   What does NOT come back is the actions: `Login as` on someone who has never signed
   in would impersonate an account that does not exist yet, and Delete would revoke an
   invitation through a control labelled as though it removed a person. The row gains
   them the moment they complete sign-up — no separate renderer, just fuller data. */
function userRow(u){
  if(u.pending){
    /* ⚠️ Em dashes, not empty cells. A blank cell reads as "we forgot to render this";
       a dash reads as "there is nothing here yet", which is the actual fact — the
       person has not signed in and so has neither a name nor an added date. Same mark
       the Label column uses for an unlabelled instance. */
    return '<tr class="user-row user-pending"><td class="muted">&mdash;</td>'
      + '<td>' + esc(u.email) + ' <span class="pill soft user-invited">Invited</span></td>'
      + '<td class="muted">&mdash;</td><td class="cellact"></td></tr>';
  }
  /* ⚠️ `.user-row` is the hook the phone layout needs. The Users table had NO mobile
     treatment at all — it kept its four columns at 390px, so `Login as` and `Delete`
     sat off-screen entirely and dragging sideways moved the whole page. The class lets
     it become a card the same way the licence and invoice rows already do. */
  return '<tr class="user-row"><td>'+u.name+'</td><td>'+u.email+'</td><td>'+fmtDate(u.created)+'</td>'
    + '<td class="cellact"><span class="rowactions"><button class="link" data-loginas="'+u.email+'">Login as →</button><button class="link" data-deluser="'+u.email+'">Delete</button></span></td></tr>';
}
function menuItems(p, opts){
  var type = p && typeof p === 'object' ? p.type : p;
  // naming a licence is the one thing every type allows, so it leads every menu —
  // except in the Home preview block (opts.noLabelEdit), which is a summary: renaming
  // belongs where the licence is the subject, i.e. the Licenses page and its details.
  var label = (opts && opts.noLabelEdit) ? '' : '<button role="menuitem" data-editlabel>Edit label</button>';
  /* ⚠️ Two faults lived in this one line.
     `Add capacity` opened a placeholder dialog and is GONE — the same job is `Manage
     add-ons`, exactly as on a subscription, opening the same wizard.
     `Renew software updates` was an <a target="_blank"> among <button>s: it looked
     different from its neighbours AND, because a new tab opens behind the menu that
     stays open, pressing it produced no visible change at all. A participant pressed
     it five times from two places. It is a real menu item now, and it buys. */
  if(type === 'Perpetual') return label
    + '<button role="menuitem" data-manageaddons>Manage add-ons</button>'
    + '<button role="menuitem" data-renewupdates="' + esc(p && p.id) + '">Renew software updates</button>';
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
    /* next to Status on purpose: "am I current" and "is anything wrong" are read
       together, and the version gap is what argues for renewing */
    + '<th>Product version</th>'
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
  /* ⚠️ THE `Scheduled` PILL IS GONE from beside the licence name — and now so is the
     thing it pointed at. It was a third badge competing with the status chip and the
     plan name for the same glance, and it said the least of the three: "something
     changes, at some point". The banner it deferred to has since gone too, because
     downgrades take effect immediately and there is no pending change to announce
     anywhere (see the note in shared.js where scheduleChange used to be). */
  var lic = '<td><div class="lp-name">' + p.name + '</div></td>';
  // when the licence last changed — plan, add-ons, label or payment state
  var updatedCell = '<td class="lic-num">' + fmtDate(p.updated || p.created) + '</td>';
  return rowOpen(p) + productCell(p) + lic + statusCell(p) + versionCell(p) + updatedCell + actionsCell(p, opts) + '</tr>';
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
  return brandBadgeHTML(pm.brand)
    + '<span class="pc-num">' + pm.num + '</span>'
    + (withExp ? '<span class="pc-exp">' + pm.exp + '</span>' : '');
}
/* ⚠️ Mastercard is a SYMBOL, not a word. Its two interlocking circles are the mark
   people recognise on a card, and spelling "MASTERCARD" in the badge read as a
   placeholder standing in for the artwork — next to "VISA", which really is a
   wordmark, the pair looked inconsistent for no reason.
   Drawn, not fetched: the prototype takes no external assets, and the mark reduces
   honestly to monochrome — two overlapping discs at the same tone, so the overlap
   comes out darker on its own, exactly as the real mark's does. Every other brand
   keeps its wordmark until someone asks for its artwork. */
/* ⚠️ Geometry matters more than it looks. First attempt put two r=7.5 circles 8 apart
   inside a 34-wide box: they overlapped by more than half their width and, at the
   ~30px this renders at, read as one rounded blob — a toggle switch, not a card mark.
   Centres are 12 apart on r=9 now (overlapping by a third, the proportion the real
   mark uses), so two discs are legible at badge size and the darker lens between them
   does the work the two brand colours do. */
var MASTERCARD_MARK = '<svg class="brandmark" viewBox="0 0 40 24" role="img" aria-label="Mastercard">'
  + '<circle cx="14" cy="12" r="9" fill="currentColor" fill-opacity=".36"/>'
  + '<circle cx="26" cy="12" r="9" fill="currentColor" fill-opacity=".36"/></svg>';
function brandBadgeHTML(brand){
  if(String(brand).toUpperCase() === 'MASTERCARD')
    return '<span class="brandbadge brandbadge-mark">' + MASTERCARD_MARK + '</span>';
  return '<span class="brandbadge">' + brand + '</span>';
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
      /* ⚠️ Was the literal string 'license-secret' — the row's copy button put a
         placeholder on the clipboard, not a key, and every row put the SAME one. */
      var lrow = copy.closest('.lic-row');
      copyValue(licenseKeyFor(lrow && licById(lrow.getAttribute('data-licid'))), 'License key', copy);
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
  invoicesSorted().filter(function(v){ return v.licId === lic.id; }).forEach(function(v){
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
/* ---------- the info icon ----------------------------------------------------
   ONE pattern, wherever a row's name needs an explanation that does not deserve
   permanent body text. Built on `.tip`, which already solves the hard half: the
   hover bubble is gated behind `(hover:hover)`, so a tap cannot leave a label stuck
   over the glyph (see the note above `.tip` in styles.css).

   Desktop: hover, and `:focus-visible` for the keyboard — both free from `.tip`.
   Below 600px there is no hover, so a tap toggles `.show`; that handler is delegated
   once in shared.js rather than per call site.

   ⚠️ It is a <button>, not a <span>: it is operable, so it must be reachable by Tab
   and answer Enter/Space. `aria-label` names WHAT is being explained ("About AI
   credits"), while the explanation itself rides in `data-tip`, which is what the
   bubble paints — a screen reader gets both without the text being painted twice. */
function infoIcon(about, text){
  return '<button type="button" class="infoic tip wide" data-tip="' + esc(text) + '"'
    + ' aria-label="About ' + esc(about) + '">' + INFOSVG + '</button>';
}
/* Text with its icon attached.
   ⚠️ The icon is tied to the text's LAST WORD, not appended loosely. Wherever this is
   used the text can wrap — a card feature in a narrow column, a heading sharing its
   row with a stepper — and a loose icon wrapped ALONE onto the next line, reading as a
   stray glyph belonging to nothing. Same reason a typesetter does not leave a widow:
   the mark and the word it marks break together. */
function textWithInfo(text, desc){
  if(!desc) return text;
  var cut = text.lastIndexOf(' ');
  var head = cut < 0 ? '' : text.slice(0, cut + 1);
  var tail = cut < 0 ? text : text.slice(cut + 1);
  return head + '<span class="nobreak">' + tail + infoIcon(text, desc) + '</span>';
}
function cellTopWithInfo(label, desc){
  return '<div class="am-celltop">' + textWithInfo(label, desc) + '</div>';
}
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
  /* ⚠️ A CLEAR CONTROL, built here rather than in each page's markup — five search
     boxes, one behaviour, and every one of them was missing it. A participant deleted
     a query character by character; on a phone that is a dozen taps on a key the
     keyboard has already half-covered. Shown only when there is something to clear,
     so an empty field keeps its quiet. */
  var box = input.closest('.searchbox');
  var clearBtn = null;
  if(box){
    clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'searchclear';
    clearBtn.setAttribute('aria-label', 'Clear search');
    clearBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'
      + '<path d="M6 6l12 12M18 6L6 18"/></svg>';
    clearBtn.hidden = true;
    box.appendChild(clearBtn);
    clearBtn.addEventListener('click', function(){
      input.value = ''; run(); input.focus();     // focus returns to where typing continues
    });
  }
  function syncClear(){ if(clearBtn) clearBtn.hidden = !input.value; }
  function run(){
    var q = input.value.trim().toLowerCase();
    var items = opts.items(), shown = 0;
    items.forEach(function(el){
      var hit = !q || opts.text(el).indexOf(q) >= 0;
      el.hidden = !hit;
      if(hit) shown++;
    });
    clearSlot();
    syncClear();
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
/* `d` describes the product in a row next to the other one — it has to say what KIND of
   thing it is ("IoT platform"). `short` is for a page that has already named the product
   in its own heading, where repeating the category is the third level of text saying the
   same thing. See landingLead(). */
var PRODUCT_CHOICES = [
  { v:'thingsboard', t:'ThingsBoard', short:'devices, dashboards, rule engine',
    d:'IoT platform — devices, dashboards, rule engine',
    g:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="4" r="1.5"/><circle cx="12" cy="20" r="1.5"/>'
      + '<circle cx="4" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/>'
      + '<path d="M12 9V5.5M12 15v3.5M9 12H5.5M15 12h3.5"/>' },
  { v:'tbmq', t:'TBMQ', short:'MQTT broker for reliable message streaming',
    d:'MQTT broker for reliable message streaming',
    g:'<circle cx="7" cy="17" r="1.6"/><path d="M7 11.5A5.5 5.5 0 0 1 12.5 17"/>'
      + '<path d="M7 6A11 11 0 0 1 18 17"/>' }
];
/* ---------- the product is STATED, not chosen ---------------------------------
   ⚠️ THIS REPLACES THE TWO-CARD SELECTOR, and the reason is about where the reader
   came from, not about space. Someone arriving at the portal has already decided
   which product they want — they came from that product's own pages — so a pair of
   equal cards asks a question that was answered before the page loaded, and makes
   the one they want look like a maybe.

   So: one line stating the product, and a quiet link offering the other. Choosing the
   link SWAPS the flow, and the line and the link swap with it — the other product is
   never unreachable, it just stops competing for the first decision on the screen.

   ⚠️ The link keeps `data-nl-product`, which is the SAME attribute the cards carried,
   so `planPickerClick` needed no change: one reading of "the product changed" still
   serves all three hosts.

   Which product is stated comes from `arrivedProduct()` — the ⚙ panel's setting. In a
   real portal it would come from the referrer or a campaign link; the prototype cannot
   know that, and there is no URL parameter here to read (checked: only `invite`, `id`
   and `tier` exist), so the setting stands in for arrival rather than inventing one. */
/* ---------- the landing head: TWO levels of text, not four -----------------------
   ⚠️ IT WAS FOUR, and every one of them was true, which is what made it hard to see:
   a heading, a page description, the product name, and the product's own description —
   all before anything could be chosen. The heading already names the product (arrival
   decided it), so the separate product row was saying it a second time, and the
   description was asking the reader to choose a product that was not in question and
   naming a second product they had not come for.
   Two levels now: the heading says what the page is for and which product, the line
   under it says what that product is and what is needed to buy. The swap link survives
   as the only route to the other product. */
function productOf(sel){
  var v = (sel && sel.product) || arrivedProduct();
  return PRODUCT_CHOICES.filter(function(o){ return o.v === v; })[0] || PRODUCT_CHOICES[0];
}
function landingHeading(sel){ return 'Buy and manage ' + productOf(sel).t + ' licenses'; }
function landingLead(sel){
  var p = productOf(sel);
  return 'Self-managed ' + p.t + ' \u2014 ' + p.short
    + '. You\u2019ll need an account to buy a plan.';
}
/* Just the escape hatch, for a surface that has stated the product in its own heading.
   ⚠️ Same builder as the full row below, so the two cannot word it differently. */
function productSwapHTML(sel){
  var cur = productOf(sel);
  var other = PRODUCT_CHOICES.filter(function(o){ return o.v !== cur.v; })[0];
  return other
    ? '<button type="button" class="link nl-prodswap" data-nl-product="' + other.v + '">'
      + 'Need ' + other.t + ' instead?</button>'
    : '';
}
function nlProductStatedHTML(sel){
  /* ⚠️ `statedInHead` — the surface has already named the product in its own H1 (the
     landing page does), so the row would be a second statement of it. The link still
     has to exist, and it lives with the heading there. */
  if(sel && sel.statedInHead) return '';
  var cur = productOf(sel);
  var other = PRODUCT_CHOICES.filter(function(o){ return o.v !== cur.v; })[0];
  return '<div class="nl-prodrow">'
    + '<div class="nl-stated">'
    +   '<span class="nl-prodic"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + cur.g + '</svg></span>'
    +   '<span class="nl-prodtxt"><span class="nl-prodname">' + cur.t + '</span>'
    +   '<span class="nl-proddesc">' + cur.d + '</span></span>'
    + '</div>'
    /* a text link, deliberately not a button that looks like an option: it is an
       escape hatch for the minority who arrived on the wrong product */
    + (other ? '<button type="button" class="link nl-prodswap" data-nl-product="' + other.v + '">'
        + 'Need ' + other.t + ' instead?</button>' : '')
    + '</div>';
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
    /* ⚠️ BOTH forms are emitted and the breakpoint picks one — the same technique the
       product cell already uses for its desktop and phone arrangements, and for the
       same reason: CSS cannot turn an attribute into body text.

       Desktop gets the INFO ICON. The picker is where someone is still working out
       what a production instance or an AI credit IS, but two extra lines inside two of
       the features pushed the cards apart and buried the prices they exist to compare.

       ⚠️ The phone gets the SENTENCE, because there is nothing to hover. An icon that
       only answers on tap hides the explanation behind an interaction nobody is told
       about — on the one breakpoint where the cards are stacked and have the width to
       spare. The tap still works; it is just not the only way to read it.
       The Customize step keeps its descriptions as body text on both; see stepCell. */
    + '<div class="pc-feats">' + c.feats.map(function(f){
        var n = featNote(f);
        return '<div class="pc-feat">' + textWithInfo(f, n)
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
/* ⚠️ TBMQ HAS NO BASELINE BLOCK AT ALL NOW. It used to render a marked GAP — a block
   saying the TBMQ baseline had not been written — which was honest but put an admission
   of missing copy on a selling page. The block is removed for TBMQ rather than filled
   in: writing broker features nobody has approved is the one thing worse than the gap.
   ThingsBoard keeps its block unchanged. When the TBMQ copy exists, this returns a
   second branch and nothing else changes. */
function baselineFor(sel){
  var product = sel.product || 'thingsboard';
  if(product !== 'thingsboard') return null;
  return { title:'Included in every plan', intro:PLANS_INCLUDE_NOTE, items:PE_FEATURES };
}
function baselineBlockHTML(sel){
  var b = baselineFor(sel);
  if(!b) return '';
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
  /* ⚠️ `sel.locked` means "this is an EXISTING licence" — Change plan. Neither of the
     choices above the grid can change on one: a ThingsBoard subscription does not
     become TBMQ, and a monthly plan does not become perpetual. Those are different
     licences and different purchases.
     They used to render DISABLED, which is worse than absent: a greyed radio pair and
     a greyed tab pair still read as "these are settings of this flow", and the reader
     has to work out why two of the four controls on the step refuse to move. Removed,
     the step opens on the one thing it is for — the plan cards.
     ⚠️ The CURRENT PLAN card stays greyed and unselectable, and that is NOT the same
     case: it is not an option being refused, it is where you are now, which is what you
     compare the others against. See nlPlanCardHTML. */
  choicesEl.hidden = !!sel.locked;
  choicesEl.innerHTML = sel.locked ? '' : (nlProductStatedHTML(sel) + nlBillTabsHTML(sel));
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

/* ============================================================================
   THE HOME BANNER — one slot, one banner, a stated priority order
   ============================================================================
   ⚠️ ONE SLOT AND ONLY THE HIGHEST-PRIORITY CONDITION RENDERS. An account with three
   problems does not get three bands pushing its licences off the screen; it gets the
   most serious one, and that banner SAYS how many other licences need attention and
   links to them. The alternative — stack them — turns the top of Home into a queue
   nobody reads and buries the list the page exists for.

   ⚠️ DISMISSAL IS PER LICENCE AND PER STATE. The key is `<licence id>:<state>`, so
   closing the 30-day notice on one licence can never silence a different licence, a
   different problem, or a LATER STAGE of the same problem: `B11:updates30` and
   `B11:updates14` are different keys, so the 14-day notice arrives as if nothing had
   been dismissed. That is the whole reason the stage is in the key rather than in a
   value beside it.

   ⚠️ BLOCKING STATES CANNOT BE DISMISSED — and this is the right call, not a
   simplification: blocked, payment failed and no-payment-method are all conditions
   where something is already not working or is about to stop, and where the portal is
   the only place the person will find out. A dismissible blocker is a blocker that
   gets dismissed once and never seen again, and the next contact is a support ticket
   asking why the deployment stopped. Time-based warnings are different — they repeat
   on their own, so dismissing one costs nothing.

   Priority order, and the whole inventory:
     1 blocked over the instance limit    · no dismiss
     2 payment failed                     · no dismiss
     3 no payment method, paid licence    · no dismiss
     4 card expires before the next charge· dismiss, returns at 14 days
     5 software updates expired           · dismiss, returns after 7 days
     6 software updates end in 14 days    · dismiss, returns at expiry
     7 software updates end in 30 days    · dismiss, returns at 14 days
     8 never activated by any instance    · dismiss, permanent
     9 Community Grant approved           · dismiss, permanent
   A CANCELLED licence that is still active until its end date gets NO banner: nothing
   needs doing, and the state is already on the licence and in the list. */

/* days until a date string, negative once it is past */
function daysUntil(dateStr){
  var d = dayOf(dateStr);
  return d == null ? null : d - TODAY_DAY;
}
/* Does this licence carry a software-updates term at all? Perpetual licences do; a
   subscription's date is its renewal, which is a different fact with a different
   banner. A grant has neither. */
function hasUpdatesTerm(lic){
  return !!(lic && !lic.grant && lic.type === 'Perpetual' && lic.event);
}
/* ⚠️ Dismissal remembers the DAY, not a boolean, because two of the rules are "comes
   back after N days". A stored `true` (the shape the grant banner has always written)
   still counts as dismissed, so nothing that was already closed reappears. */
function dismissBanner(key){ Store.get('dismissed')[key] = TODAY_DAY; Store.save(); }
function bannerDismissed(key, returnAfterDays){
  var v = Store.get('dismissed')[key];
  if(v == null || v === false) return false;
  if(returnAfterDays == null) return true;          // permanent, or until the next stage
  if(v === true) return true;                       // legacy boolean: no day to count from
  return (TODAY_DAY - v) < returnAfterDays;
}
/* The card on file, as a date we can compare. `paymentMethod.exp` is stored as four
   digits (MMYY); the demo's fallback prints "12 / 2028" inside markup, which is why
   this reads the STORED card only and treats the demo fallback as "no date known". */
function cardExpiryDay(){
  var c = savedCard();
  if(!c || !c.exp || c.exp.length !== 4) return null;
  var m = +c.exp.slice(0, 2), y = 2000 + (+c.exp.slice(2));
  if(!(m >= 1 && m <= 12)) return null;
  // the card dies at the END of its month: the first day of the next one
  return epochDay(m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1, 1);
}
/* Every condition that is currently true, in priority order, one entry per licence.
   ⚠️ Derived on every render and never stored: a banner that is written down goes
   stale the moment the thing it describes is fixed. */
function attentionConditions(){
  var out = [];
  var licenses = DATA().licenses || [];
  licenses.forEach(function(l){
    if(l.status === 'canceled') return;             // nothing to do about it — see above
    if(instOverLimit(l)) out.push({ p:1, state:'blocked', lic:l });
    if(l.status === 'payment_failed') out.push({ p:2, state:'payment_failed', lic:l });
    if(hasUpdatesTerm(l)){
      var d = daysUntil(l.event);
      if(d != null && d < 0) out.push({ p:5, state:'updates_expired', lic:l, days:d });
      else if(d != null && d <= 14) out.push({ p:6, state:'updates_14', lic:l, days:d });
      else if(d != null && d <= 30) out.push({ p:7, state:'updates_30', lic:l, days:d });
    }
    /* "never activated by any instance" — the key exists and nothing has ever used it.
       ⚠️ Not the same as stale: stale means it reported once and then stopped. */
    if(l.status === 'awaiting_checkin' || !(l.instances || []).length)
      out.push({ p:8, state:'never_activated', lic:l });
  });
  /* Account-level conditions. They have no licence of their own, so they key on the
     id `account` — dismissal is still per state, it is just that the scope is the
     account rather than one row. */
  var paid = licenses.filter(function(l){
    return l.status !== 'canceled' && !l.grant && String(l.price || '').indexOf('$') === 0;
  });
  if(paid.length && !billingSaved())
    out.push({ p:3, state:'no_card', lic:{ id:'account' } });
  else {
    var exp = cardExpiryDay();
    /* the next charge this card has to survive: the soonest renewal among the
       subscriptions it pays for */
    var next = null;
    licenses.forEach(function(l){
      if(l.status === 'canceled' || l.type !== 'Subscription' || !l.event) return;
      var d = dayOf(l.event);
      if(d != null && (next == null || d < next)) next = d;
    });
    if(exp != null && next != null && exp <= next)
      out.push({ p:4, state:'card_expiring', lic:{ id:'account' }, expDay:exp });
  }
  var grant = licenses.filter(function(l){ return l.grant; })[0];
  if(grant) out.push({ p:9, state:'grant', lic:grant });
  return out.sort(function(a, b){ return a.p - b.p; });
}
/* How long a dismissal of this state lasts. null = until the next stage arrives,
   which is a different key and therefore a different banner. */
var BANNER_RETURN = { updates_expired:7, updates_14:null, updates_30:null,
                      card_expiring:null, never_activated:null, grant:null };
var BANNER_BLOCKING = { blocked:true, payment_failed:true, no_card:true };
function bannerKey(c){
  /* the card warning has two stages and they must be two keys, or dismissing the
     30-day one would also swallow the 14-day one */
  if(c.state === 'card_expiring')
    return 'account:card_' + ((c.expDay - TODAY_DAY) <= 14 ? '14' : '30');
  return c.lic.id + ':' + c.state;
}
/* What actually renders: the first condition that is either blocking or not
   dismissed, plus how many OTHER licences have something wrong. */
function homeBannerPick(){
  var all = attentionConditions();
  var shown = null;
  for(var i = 0; i < all.length; i++){
    var c = all[i];
    if(BANNER_BLOCKING[c.state]){ shown = c; break; }
    if(!bannerDismissed(bannerKey(c), BANNER_RETURN[c.state])){ shown = c; break; }
  }
  if(!shown) return null;
  /* ⚠️ Counted by LICENCE, not by condition: one licence that is blocked AND behind on
     updates is one licence needing attention, and saying "2 other licenses" about it
     would be a lie the reader can check in the list. The grant is not a problem, so it
     never counts toward it. */
  var others = {};
  all.forEach(function(c){
    if(c.state === 'grant' || c.lic.id === 'account' || c.lic.id === shown.lic.id) return;
    others[c.lic.id] = true;
  });
  shown.others = Object.keys(others).length;
  return shown;
}
/* The licence's name as a LINK to the licence, for use inside a banner sentence.
   ⚠️ The name is the link, not a "View license" button beside it: the sentence already
   names the thing, and a button repeating it is a second control for one intent. */
function bannerLicLink(lic){
  return '<a class="gb-lic" href="' + licenseHref(lic, 'home') + '" data-invlic="'
    + esc(lic.id) + '">' + esc(lic.label || lic.name) + '</a>';
}
/* One sentence per state, plus the action that answers it. Everything the reader is
   told about updates comes from UPDATES_LOSS, so the three stages differ only in
   WHEN — never in what is at stake. */
function homeBannerCopy(c){
  var lic = c.lic;
  switch(c.state){
    case 'blocked':
      return { txt:'<b>' + bannerLicLink(lic) + ' is blocked.</b> ' + instRunning(lic)
          + ' production instances are running against ' + instAllowed(lic) + ' allowed on this plan. '
          + 'The license checks in every hour, so it stays blocked until the count is back within its limit. '
          + DETACH_HINT,
        act:'<button class="gb-act" data-modal="add-ons" data-licid="' + esc(lic.id) + '">Manage</button>'
          + '<a class="gb-act sec" href="licenses.html?view=instances">Detach an instance</a>' };
    case 'payment_failed':
      return { txt:'<b>Payment failed for ' + bannerLicLink(lic) + '.</b> '
          + cardLabel() + ' was declined — update it before ' + fmtDate(lic.event)
          + ' to keep the subscription active.',
        act:'<button class="gb-act" data-paycard>Update payment method</button>' };
    case 'no_card':
      return { txt:'<b>No payment method on file.</b> '
          + 'You have an active paid license, and its next charge will fail without one.',
        act:'<a class="gb-act" href="billing.html">Add payment method</a>' };
    case 'card_expiring':
      return { txt:'<b>' + cardLabel() + ' expires ' + fmtDate(dayToDate(c.expDay - 1)) + '.</b> '
          + 'That is before your next charge, so it will be declined.',
        act:'<button class="gb-act" data-paycard>Update payment method</button>' };
    case 'updates_expired':
      return { txt:'<b>Software updates for ' + bannerLicLink(lic) + ' ended on '
          + fmtDate(lic.event) + '.</b> ' + UPDATES_LOSS,
        act:'<button class="gb-act" data-renewupdates="' + esc(lic.id) + '">Renew updates</button>' };
    case 'updates_14':
      return { txt:'<b>Software updates for ' + bannerLicLink(lic) + ' end on '
          + fmtDate(lic.event) + ', in ' + c.days + ' day' + (c.days === 1 ? '' : 's') + '.</b> '
          + UPDATES_LOSS,
        act:'<button class="gb-act" data-renewupdates="' + esc(lic.id) + '">Renew updates</button>' };
    case 'updates_30':
      return { txt:'<b>Software updates for ' + bannerLicLink(lic) + ' end on '
          + fmtDate(lic.event) + '.</b> ' + UPDATES_LOSS,
        act:'<button class="gb-act" data-renewupdates="' + esc(lic.id) + '">Renew updates</button>' };
    case 'never_activated':
      return { txt:'<b>' + bannerLicLink(lic) + ' is waiting for its first instance.</b> '
          + 'The key has been issued — activate a deployment with it and it appears here.',
        act:'<a class="gb-act" href="' + EXT.install + '" target="_blank" rel="noopener">Installation instructions</a>' };
    case 'grant':
      return { txt:'Your Community Grant is ready — the license key has been issued.',
        act:'<button class="gb-act" data-invlic="' + esc(lic.id) + '">View license</button>' };
  }
  return null;
}
/* the card, named the way the Billing page names it */
function cardLabel(){
  var c = savedCard();
  return c ? (c.brand + ' ending ' + c.last4) : 'Your card';
}
/* ⚠️ ONE SENTENCE, IN TWO PLACES, AND IT IS COPY RATHER THAN A CONTROL. Detaching is
   discoverable because the banner explains the situation people are actually in — they
   moved a deployment — not because a second button was added next to Manage. The other
   copy of it sits above the Instances list (see licenses.html). */
var DETACH_HINT = 'This usually happens after moving a deployment to a new server. '
  + 'If that is what happened, detach the old one.';
function renderHomeBanner(){
  var slot = $('#homeBanner');
  if(!slot) return;
  var c = homeBannerPick();
  if(!c){ slot.hidden = true; slot.innerHTML = ''; return; }
  var copy = homeBannerCopy(c);
  if(!copy){ slot.hidden = true; return; }
  var blocking = !!BANNER_BLOCKING[c.state];
  /* the "and there are others" clause lives INSIDE this banner — the alternative is a
     second banner, which is the thing the one-slot rule exists to prevent */
  var others = c.others
    ? ' <a class="gb-lic" href="licenses.html?attention=1">' + c.others + ' other license'
      + (c.others === 1 ? '' : 's') + ' need' + (c.others === 1 ? 's' : '') + ' attention</a>.'
    : '';
  slot.className = 'gbanner homebanner' + (blocking ? ' is-blocking' : '');
  slot.innerHTML = '<svg class="icon gb-ic" viewBox="0 0 24 24" aria-hidden="true">'
    + (blocking
        ? '<path d="M12 3l9 16H3z"/><path d="M12 9.5v4.2"/><circle cx="12" cy="16.6" r=".9"/>'
        : '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V13"/><circle cx="12" cy="16.4" r=".9"/>')
    + '</svg>'
    + '<span class="gb-txt">' + copy.txt + others + '</span>'
    + '<span class="sp"></span>'
    + copy.act
    + (blocking ? '' : '<button class="gb-x" data-bannerx="' + esc(bannerKey(c)) + '" aria-label="Dismiss">✕</button>');
  slot.hidden = false;
}
document.addEventListener('click', function(e){
  var x = e.target.closest('[data-bannerx]');
  if(!x) return;
  dismissBanner(x.getAttribute('data-bannerx'));
  renderHomeBanner();
});
/* ============================================================================
   INSTANCES — the account's deployments, across every licence
   ============================================================================
   ⚠️ A VIEW, NOT A PAGE. It shares the Licenses page's toolbar and chrome because it
   is the same data sliced differently, and because two to five instances do not earn a
   nav destination of their own.
   Columns answer one question each: which deployment · under which licence · did it
   report · what is it running · is it healthy. Plans and money are deliberately
   absent — that is what the licence row is for. */
function allInstances(){
  var out = [];
  (DATA().licenses || []).forEach(function(l){
    (l.instances || []).forEach(function(i){ out.push({ inst:i, lic:l }); });
  });
  /* newest check-in first: the question "is anything not reporting" is answered by
     reading from the bottom, and the stale rows collect there */
  return out.sort(function(a, b){ return (a.inst.agoMin || 0) - (b.inst.agoMin || 0); });
}
function instAllHeadHTML(){
  return '<tr><th>Instance</th><th>License</th><th>Last check-in</th>'
    + '<th>Version</th><th>Status</th><th aria-label="Actions"></th></tr>';
}
/* how long ago, in words — "12 minutes ago" reads as health; a timestamp has to be
   subtracted from the current time before it says anything */
function agoText(min){
  if(min == null) return '—';
  if(min < 60) return Math.max(1, Math.round(min)) + ' min ago';
  var h = min / 60;
  if(h < 48) return Math.round(h) + ' hour' + (Math.round(h) === 1 ? '' : 's') + ' ago';
  return Math.round(h / 24) + ' days ago';
}
function instAllRow(r){
  var i = r.inst, l = r.lic, id = esc(i.id);
  var behind = cmpVersion(i.version, LATEST_VERSION) < 0;
  return '<tr data-instid="' + id + '" data-licid="' + esc(l.id) + '">'
    + '<td><div class="ia-name">' + (i.label ? esc(i.label) : '<span class="muted">Unnamed</span>') + '</div>'
    +   '<div class="ia-id mono"><span class="inst-id" title="' + id + '">' + id + '</span></div></td>'
    + '<td class="ia-lic"><a class="link" href="' + licenseHref(l, 'licenses') + '" data-invlic="' + esc(l.id) + '">'
    +   esc(l.label || l.name) + '</a><div class="ia-licsub">' + esc(l.product || '') + ' · ' + esc(l.type) + '</div></td>'
    + '<td>' + agoText(i.agoMin) + '</td>'
    + '<td class="lic-ver"><div class="verline' + (behind ? ' is-behind' : '') + '">'
    +   '<span class="ver-run">' + esc(i.version || '—') + '</span>'
    +   (behind ? '<span class="ver-latest">latest ' + esc(LATEST_VERSION) + '</span>' : '') + '</div></td>'
    + instStatusCell(i)
    + '<td class="cellact"><div class="lic-actions">' + instRowMenu(i) + '</div></td></tr>';
}
/* ⚠️ Detach is in the row's own menu and NOWHERE ELSE. The blocked banner does not
   implement a second one — it routes here, exactly the way the payment-failed banner
   routes to the card modal. One action, one implementation, one confirmation. */
/* ⚠️ THE MARKUP CONTRACT IS `.menu` > trigger + `.pop`, and getting it wrong is how a
   row ends up with actions that exist and do nothing. This built `.menuwrap` > `.menu`,
   so the delegated handler in shared.js — which looks for `.menu [aria-haspopup]` and
   then for a `.pop` beside it — never matched: the kebab was there, the items were in
   the DOM, and clicking did nothing at all. It reads as "the table has no row actions",
   which is exactly how it was reported. Same builder as the licence row now
   (see actionsCell), so there is one contract and not two. */
function instRowMenu(i){
  var id = esc(i.id);
  return '<div class="menu"><button class="iconbtn ib" aria-haspopup="true" aria-expanded="false" aria-label="Instance actions">' + KEBAB + '</button>'
    + '<div class="pop" role="menu" hidden>'
    +   '<button role="menuitem" data-instlabel="' + id + '">Rename</button>'
    +   '<button role="menuitem" data-instcopy="' + id + '">Copy instance ID</button>'
    +   '<button role="menuitem" data-instopenlic="' + id + '">Open license</button>'
    +   '<button role="menuitem" data-instdetach="' + id + '">Detach</button>'
    + '</div></div>';
}
function renderInstancesView(){
  var head = $('#instAllHead'), body = $('#instAllBody');
  if(!head || !body) return;
  head.innerHTML = instAllHeadHTML();
  var rows = allInstances();
  body.innerHTML = rows.length
    ? rows.map(instAllRow).join('')
    : emptyStateRow(6, { title:'No instances yet.',
        line:'An instance appears here the first time a deployment checks in with one of your license keys.' });
  var r = $('#instRange');
  if(r) r.textContent = rows.length ? ('1–' + rows.length + ' of ' + rows.length) : '0 of 0';
}
/* Find an instance anywhere in the account, with the licence that owns it. */
function findInstance(instId){
  var hit = null;
  (DATA().licenses || []).forEach(function(l){
    (l.instances || []).forEach(function(i){ if(i.id === instId) hit = { inst:i, lic:l }; });
  });
  return hit;
}
/* ---------- detach --------------------------------------------------------------
   ⚠️ DESTRUCTIVE TREATMENT, because this turns off live infrastructure. The dialog
   NAMES the instance — there is no "are you sure?" about an unnamed thing when the
   whole point is choosing the right one of several — and it says what happens to the
   server and WHEN: it keeps running until its next check-in, and then stops. At an
   hourly cadence that is within the hour, which is the fact that makes this a decision
   rather than a click. */
function openDetachModal(instId, after){
  var hit = findInstance(instId);
  if(!hit) return;
  var i = hit.inst, l = hit.lic;
  var who = i.label || 'this instance';
  openModal('Detach instance',
    '<p>Detach <b>' + esc(who) + '</b> from <b>' + esc(l.label || l.name) + '</b>?</p>'
    + '<div class="row"><span class="l">Instance ID</span><span class="r mono">' + esc(i.id) + '</span></div>'
    + '<div class="row"><span class="l">Last check-in</span><span class="r">' + agoText(i.agoMin) + '</span></div>'
    + '<p>The server keeps running until its next check-in, within the hour, and then '
    + 'stops. The license seat is freed immediately, so another deployment can be '
    + 'activated with the same key straight away.</p>');
  $('#modalCloseBtn').textContent = 'Keep instance';
  var foot = $('#overlay .mf');
  var confirm = document.createElement('button');
  confirm.type = 'button'; confirm.className = 'btn ter'; confirm.textContent = 'Detach instance';
  foot.appendChild(confirm);
  confirm.addEventListener('click', function(){
    l.instances = (l.instances || []).filter(function(x){ return x.id !== i.id; });
    l.updated = todayStr();
    Store.save();
    logActivity({ kind:'updated', entityType:'Instance', entityName:(i.label || i.id), action:'DETACHED',
      txt:'Instance <b>' + esc(i.label || i.id) + '</b> was detached from <b>'
        + esc(l.label || l.name) + '</b> by ' + portalActor() + '.',
      delta:'Stops at its next check-in' });
    closeModal();
    Snack.show('Instance detached — it stops at its next check-in');
    if(typeof after === 'function') after();
  });
}
document.addEventListener('click', function(e){
  var d = e.target.closest('[data-instdetach]');
  if(d){
    closeAllMenus();
    openDetachModal(d.getAttribute('data-instdetach'), function(){
      if(typeof renderInstancesView === 'function') renderInstancesView();
      if(window.LicenseDetails && LicenseDetails.isOpen()) LicenseDetails.reopen(activeLicense);
      else if(window.LicenseDetails) LicenseDetails.afterChange();
    });
    return;
  }
  var o = e.target.closest('[data-instopenlic]');
  if(o){
    closeAllMenus();
    var hit = findInstance(o.getAttribute('data-instopenlic'));
    if(hit) openLicenseDetails(hit.lic, 'licenses');
  }
});
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
   ⚠️ ONE source: the saved billing address, with the demo's own strings as the only
   fallback. It used to read `billingAddress` for the address and `profile` for the
   company name, because those two lived on two different pages — which meant the
   document printed halves assembled from two forms, and the company name came from a
   page that never claimed to control invoices. Company details are consolidated on
   Billing now (see billing.html), so the second lookup is gone rather than kept "just
   in case": a fallback to a field no form writes any more is a silent way for an old
   store to keep overriding the current one.
   Before all of this, both documents printed hardcoded text and "Paid · Visa ••4242"
   no matter what the Billing page said. Editing the address changes the next invoice;
   changing the card changes what the invoice says it was paid with. */
function invoiceParty(){
  var b = Store.get('billingAddress') || {};
  var line = function(v, fb){ return (v && String(v).trim()) || fb; };
  return {
    company: line(b.company, 'ThingsBoard'),
    email:   line(b.email, 'hello@thingsboard.io'),
    addr:    line(b.addr, '500 7th Avenue'),
    addr2:   line(b.addr2, ''),
    cityline: line(b.city, 'New York') + ', ' + line(b.state, 'New York') + ' ' + line(b.zip, '10001'),
    country: line(b.country, 'United States')
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
  /* ⚠️ The confirmation is the SNACKBAR now. It used to swap the button's own text to
     "✓ Downloaded" — which destroyed the icon and the `.ra-txt` span inside it, and on
     the surfaces where that label is hidden and the action is icon-only there was
     nothing to see at all. Reported as "no on-screen response", and that was accurate
     wherever it mattered. The snack is the same acknowledgement every other completed
     action in the product already uses. */
  Snack.show('Invoice ' + d.num + ' downloaded');
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

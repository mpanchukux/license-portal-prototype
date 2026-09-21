/* ============================================================================
   license-details.js — the licence details surface, in ONE place.

   Two hosts present the same module:
     • page mode  (variant A) — license.html mounts it in the page shell
     • modal mode (variant B) — Home / Licenses open it in a large modal over
       the page they are on
   The markup, the render layer and every in-surface behaviour live here, so
   neither host owns a copy. Hosts only decide where it goes and how it closes:
     LicenseDetails.mountPage(hostSel, lic, { back:{href,label} })
     LicenseDetails.openModal(lic)
   ============================================================================ */

/* ---------- markup (mounted into whichever host is active) ---------- */
var DETAILS_HTML = ''
+ '<div class="app" id="appView">'
+ ''
+ ''
+ '  <!-- ============ MAIN ============ -->'
+ '  <div class="main">'
+ ''
+ '    <!-- content -->'
+ '    <div class="content">'
+ '      <div class="sheet">'
+ '        <!-- ⚠️ The "License updated …" banner USED TO BE HERE and is now a'
+ '             SNACKBAR. It is the result of something the person just did, not a'
+ '             fact about the licence — and while it lived in the panel it could'
+ '             appear at the same time as the state banner below the header, so one'
+ '             action produced two messages in two places. See the three-way rule in'
+ '             the styleguide: results → snackbar, state → the slot below the header,'
+ '             scheduled changes → the Plan block. -->'
+ '        <!-- License created is the one banner that lives up here: it is shown once'
+ '             per licence, above the title, so a new licence WITH a problem can show'
+ '             it and the state banner without the two colliding. -->'
+ '        <div class="gbanner licnew" id="licNewBanner" role="status" hidden>'
+ '          <svg class="icon gb-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.4l2.4 2.4 4.6-5"/></svg>'
+ '          <span class="gb-txt">License created &mdash; your license key is ready.</span>'
+ '          <span class="sp"></span>'
+ '          <button class="gb-x" id="licNewDismiss" aria-label="Dismiss">\u2715</button>'
+ '        </div>'
+ '        <div class="canvas">'
+ ''
+ '          <!-- header: back button in its own gutter, everything else in the content column -->'
+ '          <div class="head">'
+ '           <div class="headgrid">'
+ '            <button class="back" id="backBtn" aria-label="Back to Licenses" title="Back to Licenses">&larr;</button>'
+ '            <div class="headcol">'
+ '            <div class="top">'
+ '              <div class="idline">'
+ '                <!-- same placeholder square as the Home / Licenses product cell'
+ '                     (.lp-ic): solid light fill, no border. Desktop only — the'
+ '                     phone identity block was specced without it. -->'
+ '                <span class="hd-ic lp-ic" aria-hidden="true"></span>'
+ '                <div class="titleblock">'
+ '                  <div class="titlekicker" data-page="sub" id="kickerSub">ThingsBoard &middot; Subscription</div>'
+ '                  <div class="titlekicker" data-page="perp" id="kickerPerp">ThingsBoard &middot; Perpetual</div>'
+ '                  <div class="titlerow">'
+ '                    <h1 class="planname" data-page="sub" id="planName">Prototype</h1>'
+ '                    <h1 class="planname" data-page="perp" id="planNamePerp">ThingsBoard PE Perpetual License</h1>'
+ '                    <span id="statusSlot"><span class="chip status"><span class="sdot"></span>Active</span></span>'
+ '                  </div>'
+ '                </div>'
+ '              </div>'
+ '              <div class="headactions">'
+ '                <button class="btn sec" id="couponBtn">Apply coupon</button>'
+ '                <button class="btn" id="changePlanBtn" data-modal="change-plan" data-page="sub">Change plan</button>'
+ '                <button class="btn sec" id="renewBtn" data-page="sub" hidden>Renew subscription</button>'
+ '                <!-- a perpetual does not renew and has nothing to cancel, so Change'
+ '                     plan and the ⋮ menu are dropped. Its primary is `Manage`: the same'
+ '                     wizard a subscription opens, committing as a one-time purchase'
+ '                     with no proration and no renewal. -->'
+ '                <button class="btn" data-modal="add-ons" data-page="perp">Manage</button>'
+ '                <div class="menu" data-page="sub" id="headKebabMenu">'
+ '                  <button class="btn sec kebab-btn" id="headKebabBtn" aria-haspopup="true" aria-expanded="false" aria-label="More actions">⋮</button>'
+ '                  <div class="pop" id="headKebabPop" role="menu" hidden>'
+ '                    <!-- mobile only: on a phone the header keeps just the primary'
+ '                         action, and Apply coupon moves in here (see the ≤600px'
+ '                         block in styles.css). It defers to the real button, so'
+ '                         there is one coupon controller, not two. -->'
+ '                    <button role="menuitem" class="mob-only" data-couponmenu>Apply coupon</button>'
+ '                    <button role="menuitem" class="mob-only" data-revealmenu>Reveal key</button>'
+ '                    <button role="menuitem" class="mob-only" data-installmenu>Installation instructions</button>'
+ '                    <button role="menuitem" data-editlabel>Edit label</button>'
+ '                    <button role="menuitem" data-cancel-active>Cancel subscription</button>'
+ '                  </div>'
+ '                </div>'
+ '              </div>'
+ '            </div>'
+ ''
+ '            <!-- row 2: the label — a muted description line under the title -->'
+ '            <!-- ⚠️ The scheduled-change line USED TO SIT HERE, under the title. It'
+ '                 moved into the Plan block (see #schedLine there): everything it'
+ '                 describes — production instances, development instances, AI credits —'
+ '                 is a row of that table, so it belongs above the table it is about. -->'
+ '            <div class="metarow">'
+ '              <span id="labelSlot"><button class="chip ghost" id="addLabel">+ Add label</button></span>'
+ '              <!-- phone: status and label merged into one calm supporting line'
+ '                   ("Active · Factory A"). The chip and the pencil step aside there —'
+ '                   see renderSupportLine and the ≤600px block. -->'
+ '              <div class="supportline mob-only" id="supportMob"></div>'
+ '            </div>'
+ ''
+ '            <div class="hairline"></div>'
+ ''
+ '            <!-- row 3: license key (left) / subscription period (right) -->'
+ '            <div class="keygrid">'
+ '              <div class="keycol">'
+ '                <h3 class="minihead">License key</h3>'
+ '                <div class="keyline">'
+ '                  <span class="rowic mob-only" id="keyIc"></span>'
+ '                  <span class="mono" id="keyText" data-masked="••••••••••••3f2a" data-full="d41d-8cd9-8f00-b204-e980-3f2a">••••••••••••3f2a</span>'
+ '                  <button class="iconbtn ib" id="revealBtn" aria-pressed="false" aria-label="Reveal license key" title="Reveal">'
+ '                    <svg class="icon eye" viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>'
+ '                    <svg class="icon eyeoff" viewBox="0 0 24 24" hidden><path d="M10.6 6.1A9.6 9.6 0 0 1 12 6c6.5 0 10 6 10 6a16.9 16.9 0 0 1-2.4 3M6.5 6.6A16.8 16.8 0 0 0 2 12s3.5 6 10 6a9.5 9.5 0 0 0 3.9-.8"/><path d="M3 3l18 18"/></svg>'
+ '                  </button>'
+ '                  <button class="iconbtn ib tip" id="copyBtn" aria-label="Copy license key" data-tip="Copy">'
+ '                    <svg class="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>'
+ '                  </button>'
+ '                  <!-- what to do with the key, next to the actions that get you the'
+ '                       key. It used to be a button inside the post-purchase banner,'
+ '                       which meant it disappeared the moment that banner was dismissed. -->'
/* ⚠️ An outbound LINK, not a button with a placeholder. Installing a key is not
   the portal's job — the key is entered in ThingsBoard itself, the platform syncs,
   and this surface reflects what came back. The honest control is one that leaves. */
+ '                  <a class="iconbtn ib tip" id="installBtn" href="' + EXT.install + '" target="_blank" rel="noopener" aria-label="Installation instructions (opens in a new tab)" data-tip="Installation instructions \u2197">'
+ '                    <svg class="icon" viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h6M9 16h6"/></svg>'
+ '                  </a>'
+ '                </div>'
+ '                <!-- ⚠️ The "License created" note that used to sit here has moved'
+ '                     ABOVE the licence title (see #licNewBanner at the top of the'
+ '                     panel). Under the key it was the second message a freshly'
+ '                     purchased licence could show at once, and it read as a property'
+ '                     of the key rather than of the licence. -->'
+ '              </div>'
+ '              <div class="keycol right" data-page="sub">'
+ '                <h3 class="periodhead">Subscription period</h3>'
+ '                <div class="period" id="periodSub">Aug 13 2026 to Sep 13 2026</div>'
+ '                <!-- phone: the same fact as a list row — the word moves up into the'
+ '                     label and the value is the bare date. Desktop keeps its caps'
+ '                     header with the word inside the value, so both are emitted. -->'
+ '                <h3 class="rowlabel mob-only" id="periodLabelSub"></h3>'
+ '                <div class="rowvalue mob-only" id="periodValueSub"></div>'
+ '              </div>'
+ '              <!-- the license itself never expires; what is dated here is the'
+ '                   software-updates term -->'
+ '              <div class="keycol right" data-page="perp">'
+ '                <h3 class="periodhead">Software updates<span id="updatesInfo"></span></h3>'
+ '                <div class="period" id="periodPerp">1 year &middot; until Aug 13 2027</div>'
+ '                <h3 class="rowlabel mob-only" id="periodLabelPerp"></h3>'
+ '                <div class="rowvalue mob-only" id="periodValuePerp"></div>'
+ '                <!-- ⚠️ What the date MEANS now rides in an INFO ICON beside the'
+ '                     "Software updates" heading (#updatesInfo), not as three lines of'
+ '                     prose under the date. PERPETUAL + Active + "Expires ..." still'
+ '                     reads as a contradiction without it, so the explanation stays —'
+ '                     but it is a thing you read ONCE, and it was pushing the licence'
+ '                     header a third taller on every visit after that. -->'
+ '              </div>'
+ '            </div>'
+ ''
+ '            <!-- Conditional alert. Rendered ONLY when the subscription needs attention'
+ '                 (payment failed, card expiring, usage over limit). Healthy state shows nothing.'
+ '                 Demo hooks: window.showSubAlert(\'msg…\') / window.clearSubAlert() -->'
+ '            <div class="alert" id="subAlert" role="alert" hidden>'
+ '              <svg class="icon" viewBox="0 0 24 24"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17v.5"/></svg>'
+ '              <span class="atxt"></span>'
+ '            </div>'
+ '            </div><!-- /headcol -->'
+ '           </div><!-- /headgrid -->'
+ '          </div>'
+ ''
+ '          <!-- Plan — always visible, above the tab bar. Add-ons are the block'
+ '               below it now, so this heading says only what it is. -->'
+ '          <div class="section planblock">'
+ '              <div class="sh"><h3>Plan</h3><span class="spacer"></span>'
+ '                <button class="btn sec" data-modal="add-ons" data-page="sub">Manage</button>'
+ '                <!-- inferred: capacity is bought once, so this opens a one-time'
+ '                     purchase flow — not the recurring Manage add-ons flow, which'
+ '                     computes proration and a new monthly total. -->'
+ '                <!-- ⚠️ NO perpetual Manage here. On a subscription the header says'
+ '                     `Change plan` and this says `Manage` — two different actions, two'
+ '                     words. On a perpetual the header ALREADY says `Manage` and opens'
+ '                     this very wizard, so a second one two inches below it was the same'
+ '                     word for the same thing twice on one screen. -->'
+ '              </div>'
+ ''
+ '              <!-- A scheduled change, as the first thing in the block it changes.'
+ '                   ⚠️ It wears `.alert` — the styleguide\'s existing page-alert banner —'
+ '                   and NOT a new treatment. The old note here said a banner was wrong'
+ '                   because "zone 1 is for things that are wrong"; that objection was'
+ '                   about the SLOT, not the clothing, and this no longer sits in that'
+ '                   slot. `.alert` is a light box with an ink rule, not a red flag, so'
+ '                   nothing about it claims something has gone wrong. The glyph is a'
+ '                   clock rather than the specimen\'s warning mark, for the same reason.'
+ '                   Filled by renderScheduled(); hidden when nothing is scheduled. -->'
+ '              <div class="alert sched" id="schedLine" role="status" hidden></div>'
+ ''
+ '              <table class="plantable">'
+ '                <thead>'
+ '                  <!-- Usage is hidden in the UI, not removed: the cells are still'
+ '                       rendered and the data still flows through meterRow. One CSS'
+ '                       rule (.plantable .usecol) does the hiding — delete it and the'
+ '                       column is back. -->'
+ '                  <tr><th>Resource</th><th class="usecol">Usage</th><th class="num">Included</th><th class="num">Purchased</th><th class="num">Limit</th></tr>'
+ '                </thead>'
+ '                <!-- quantified capacity only; rendered from the selected page\'s'
+ '                     entitlements (see PAGES in JS) -->'
+ '                <tbody id="planRows">'
+ '                </tbody>'
+ '              </table>'
+ ''
+ '              <!-- boolean entitlements live here instead of as empty table rows.'
+ '                   Demo hook: window.setFeature(\'edge\'|\'trendz\'|\'whitelabel\', true) -->'
+ '              <div class="featureblock" id="featureBlock">'
+ '                <div class="sh"><h3 class="fhead">Add-ons</h3></div>'
+ '                <div class="features" id="featureChips"></div>'
+ '              </div>'
+ '          </div>'
+ ''
+ '          <!-- tab bar for the three data areas -->'
+ '          <div class="tabs" role="tablist" aria-label="Details areas">'
+ '            <button class="tab" role="tab" id="tab-invoices" aria-controls="panel-invoices" aria-selected="true" tabindex="0">Invoices</button>'
+ '            <button class="tab" role="tab" id="tab-prod" aria-controls="panel-prod" aria-selected="false" tabindex="-1">Instances</button>'
+ '            <button class="tab" role="tab" id="tab-logs" aria-controls="panel-audit" aria-selected="false" tabindex="-1">Activity</button>'
+ '          </div>'
+ ''
+ '          <!-- Invoices -->'
+ '          <div class="panel" id="panel-invoices" role="tabpanel" aria-labelledby="tab-invoices">'
+ '            <div class="section">'
+ '              <!-- recurring billing: subscription only -->'
+ '              <div class="billgrid" data-page="sub">'
+ '                <!-- One full-width row, left to right: what is charged and when,'
+ '                     the card it goes to, then the way to change it. -->'
+ '                <div class="billcard nextcharge">'
+ '                  <div class="nc-main">'
+ '                    <div class="nc-left">'
+ '                      <div class="nc-row">'
+ '                        <h4 class="billcard-h">Next charge</h4>'
+ '                        <!-- 16 days matches the 16-of-31-days remaining that the add-ons'
+ '                             flow prorates against (today ~Aug 14, cycle ends Aug 30). -->'
+ '                        <span class="nc-when" id="ncWhen">in 16 days · Aug 30 2026</span>'
+ '                      </div>'
+ '                      <div class="nc-amount"><span class="big" id="ncAmount">$39.00</span></div>'
+ '                    </div>'
+ '                    <span class="sp"></span>'
+ '                    <!-- the same three parts, same classes, as Payment method on'
+ '                         Payment & Billing: one source (paymentMethodHTML in'
+ '                         components.js, loaded before this file). No border of its'
+ '                         own — a framed card inside this one would read as a card'
+ '                         on a card. -->'
+ '                    <div class="nc-method">' + paymentMethodHTML({ expiry:false }) + '</div>'
+ '                    <!-- the payment method is account-level, so the edit action routes'
+ '                         to Billing rather than pretending to be an inline edit. Same'
+ '                         pencil, same icon-button, as Payment method there. -->'
+ '                    <a class="iconbtn ib tip" id="ncEditPay" href="billing.html" aria-label="Payment and Billing" data-tip="Payment &amp; Billing">'
+ '                      <svg class="icon" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>'
+ '                    </a>'
+ '                  </div>'
+ '                </div>'
+ '              </div>'
+ '              <!-- The licence\'s own invoices, rendered by the same invRow as the'
+ '                   Invoices page and the Home block — so the auto-charge mark and the'
+ '                   row actions behave identically here. No Product column: every row'
+ '                   on this tab belongs to the licence already on screen. One table for'
+ '                   both subscriptions and perpetuals; an invoice is an invoice, and the'
+ '                   rows come from the dataset (see renderLicInvoices). -->'
+ '              <div id="licInvBlock">'
+ '              <table class="invtable" style="margin-top:18px">'
+ '                <thead>'
+ '                  <tr><th>Invoice #</th><th>Date</th><th class="num">Amount</th><th>Status</th><th aria-label="Invoice actions"></th></tr>'
+ '                </thead>'
+ '                <tbody id="licInvBody"></tbody>'
+ '              </table>'
+ '              <div class="pager">'
+ '                <span class="spacer"></span>'
+ '                <span>Items per page<select aria-label="Items per page"><option>10</option><option>20</option><option>50</option><option>100</option></select></span>'
+ '                <span class="range" id="licInvRange">0 of 0</span>'
+ '                <span class="pagebtns">'
+ '                  <button disabled aria-label="First page">&laquo;</button>'
+ '                  <button disabled aria-label="Previous page">&lsaquo;</button>'
+ '                  <button disabled aria-label="Next page">&rsaquo;</button>'
+ '                  <button disabled aria-label="Last page">&raquo;</button>'
+ '                </span>'
+ '              </div>'
+ '              </div>'
+ ''
+ '              <!-- inferred: a grant is free, so it has no invoices at all -->'
+ '              <div class="emptybox" id="grantInvEmpty" hidden>No invoices &mdash; the Community Grant is free.</div>'
+ '            </div>'
+ '          </div>'
+ ''
+ '          <!-- Instances -->'
+ '          <div class="panel" id="panel-prod" role="tabpanel" aria-labelledby="tab-prod" hidden>'
+ '            <div class="section">'
+ '              <!-- type switcher (same segmented style as the Licenses "Type" filter) + toolbar -->'
+ '              <div class="insttoolbar">'
/* ⚠️ The Instances search was REMOVED, not wired. It would have filtered two
   hardcoded rows that are identical for every licence — theatre, and a control that
   survives to a demo either works or is not there. It comes back with real instance
   data; see NOTES. */
+ '                <div class="lic-typeseg" role="group" aria-label="Instance type">'
+ '                  <button class="typechip is-on" data-insttype="prod" aria-pressed="true">Production</button>'
+ '                  <button class="typechip" data-insttype="dev" aria-pressed="false">Development</button>'
+ '                </div>'
+ '                <span class="spacer"></span>'
+ '                <button class="iconbtn ib" data-refresh aria-label="Refresh" title="Refresh"><svg class="icon" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 4v5h-5"/></svg></button>'
+ '              </div>'
+ ''
+ '              <!-- ⚠️ RENDERED, not written. This used to be two hardcoded rows —'
+ '                   the same two ids, the same blank labels, the same dates, for every'
+ '                   licence in the product. Now both tables are filled by'
+ '                   renderInstances() from the licence\'s own `instances`. -->'
+ '              <p class="inst-note" id="instNote"></p>'
+ '              <div class="insttype" data-insttype="prod">'
+ '                <table class="insttable">'
+ '                  <thead>'
+ '                    <tr>'
+ '                      <th>Instance ID</th>'
+ '                      <th>Label</th>'
+ '                      <th>Status</th>'
+ '                      <th>Last activity time</th>'
+ '                      <th class="sortable" aria-sort="descending" tabindex="0">Created time <span class="arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span></th>'
+ '                    </tr>'
+ '                  </thead>'
+ '                  <tbody id="instBodyProd"></tbody>'
+ '                </table>'
+ '                <div class="pager instpager" id="instPagerProd">'
+ '                  <span class="spacer"></span>'
+ '                  <span>Items per page<select aria-label="Items per page"><option>10</option><option>20</option><option>50</option><option>100</option></select></span>'
+ '                  <span class="range" id="instRangeProd">0 of 0</span>'
+ '                  <span class="pagebtns">'
+ '                    <button disabled aria-label="First page">&laquo;</button>'
+ '                    <button disabled aria-label="Previous page">&lsaquo;</button>'
+ '                    <button disabled aria-label="Next page">&rsaquo;</button>'
+ '                    <button disabled aria-label="Last page">&raquo;</button>'
+ '                  </span>'
+ '                </div>'
+ '              </div>'
+ ''
+ '              <div class="insttype" data-insttype="dev" hidden>'
+ '                <table class="insttable" id="instTableDev">'
+ '                  <thead>'
+ '                    <tr>'
+ '                      <th>Instance ID</th><th>Label</th><th>Status</th>'
+ '                      <th>Last activity time</th><th>Created time</th>'
+ '                    </tr>'
+ '                  </thead>'
+ '                  <tbody id="instBodyDev"></tbody>'
+ '                </table>'
+ '              </div>'
+ ''
+ '              <!-- Community Grant: nothing has connected with the new key yet, so the'
+ '                   whole tab is this one line (toolbar and tables hidden) -->'
+ '              <div class="emptybox" id="grantInstEmpty" hidden>An instance appears here after it connects using this license key.</div>'
+ '            </div>'
+ '          </div>'
+ ''
+ '          <!-- Logs -->'
+ '          <div class="panel" id="panel-audit" role="tabpanel" aria-labelledby="tab-logs" hidden>'
+ '            <div class="section">'
+ '              <div class="insttoolbar" data-feed="lic">'
+ '                <div class="searchbox"><svg class="icon searchglyph" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input type="text" placeholder="Search activity" aria-label="Search activity"></div>'
+ '                <div class="dropwrap perctl">'
+ '                  <button class="btn sec perbtn" aria-haspopup="true" aria-expanded="false" aria-label="Period"><b class="perlabel">All time</b> <span aria-hidden="true">&#9662;</span></button>'
+ '                  <div class="dropmenu permenu" hidden>'
+ '                    <button data-period="all">All time</button>'
+ '                    <button data-period="24h">Last 24 hours</button>'
+ '                    <button data-period="7d">Last 7 days</button>'
+ '                    <button data-period="30d">Last 30 days</button>'
+ '                    <button data-period="custom">Custom range&hellip;</button>'
+ '                    <div class="percustom">'
+ '                      <div class="perrow">'
+ '                        <input type="date" class="perfrom" aria-label="From date">'
+ '                        <span class="permid">to</span>'
+ '                        <input type="date" class="perto" aria-label="To date">'
+ '                      </div>'
+ '                      <button class="btn sec perapply">Apply</button>'
+ '                    </div>'
+ '                  </div>'
+ '                </div>'
+ '                <span class="spacer"></span>'
+ '                <button class="iconbtn ib" data-refresh aria-label="Refresh" title="Refresh"><svg class="icon" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 4v5h-5"/></svg></button>'
+ '              </div>'
+ '              <!-- this licence\'s events only — same feed cards as the Activity page -->'
+ '              <div class="feed" id="licFeed"></div>'
+ '            </div>'
+ '          </div>'
+ ''
+ '        </div><!-- /canvas -->'
+ '      </div>'
+ '    </div>'
+ '  </div>'
+ '</div>';

/* ---------- the label ----------
   A licence is created without a label; it is named afterwards, here or from a
   row's ⋮ menu. Editing is inline: the text becomes an input, Enter or Save
   commits, Esc cancels. What commits goes through the store, so the new label
   shows up in the table and the dashboard block too — not just on this surface.

   Lives at top level because the render layer calls into it, and it resolves
   #labelSlot on call: the markup mounts long after this file loads. */
var PENCIL = '<svg class="icon" viewBox="0 0 24 24"><path d="M4 20h4L18.5 9.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z"/><path d="M14.5 6.5l3 3"/></svg>';
function labelSlot(){ return $('#labelSlot'); }

/* the resting state: the label with a pencil beside it, or the quiet add affordance */
function renderLabelSlot(lic){
  var slot = labelSlot(); if(!slot) return;
  if(lic && lic.label){
    slot.innerHTML = '<span class="labeltext">' + esc(lic.label) + '</span>'
      + '<button class="iconbtn ib labeledit" data-editlabel aria-label="Edit label" title="Edit label">' + PENCIL + '</button>';
  } else {
    slot.innerHTML = '<button class="chip ghost" data-editlabel>+ Add label</button>';
  }
}
/* the editing state */
function editLabel(){
  var slot = labelSlot(), lic = activeLicense;
  if(!slot || !lic) return;
  slot.innerHTML = '<span class="labeledit-row">'
    + '<input class="labelinput" id="labelInput" placeholder="Label…" aria-label="Label" value="' + esc(lic.label || '') + '">'
    + '<button class="btn sec labelsave" id="labelSave">Save</button></span>';
  var inp = $('#labelInput', slot);
  inp.focus();
  inp.select();
  inp.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){ e.preventDefault(); commitLabel(inp.value); }
    else if(e.key === 'Escape'){ renderLabelSlot(lic); }
  });
  $('#labelSave', slot).addEventListener('click', function(){ commitLabel(inp.value); });
}
function commitLabel(val){
  var lic = activeLicense;
  if(!lic) return;
  setLicenseLabel(lic, val);          // persists, and repaints the surfaces underneath
  renderLabelSlot(lic);
}

/* ---------- render layer ---------- */
// the licence the surface currently shows (set by whichever host mounted it)
var activeLicense = null;
function licFromNamed(key){
  var tier = NAMED_TIER[key] || 'prototype', spec = TIER_SPECS[tier];
  var lic = { tier:tier, product:'ThingsBoard', type: spec.perp ? 'Perpetual' : 'Subscription',
    name: spec.name, label:'', status:'active', created:dayStr(-6),
    event: spec.perp ? dayStr(359) : dayStr(25), price: spec.price, billing: spec.perp ? 'paid' : 'auto-pay' };
  if(key === 'perp') lic.name = 'ThingsBoard PE Perpetual License';
  if(key === 'prototypeaddons'){ lic.name='Prototype'; lic.price='$126.00'; lic.extras={prod:'2',ai:'2M'}; lic.edge=true; lic.trendz=true; }
  return lic;
}

// A grant and a perpetual licence share the details layout: nothing recurs, so
// no renewal, no next charge, no plan to change. One test, used by every caller.
function isPerpLike(lic){ return !!lic && (lic.type === 'Perpetual' || !!lic.grant); }
/* The status chip answers one question — is this licence alive? — with the same
   two values the tables use: Active or Canceled. Attention states (payment
   failed, updates expiring, no first check-in yet) are NOT statuses: they live
   in the banner above the content, with the date and the action that clears
   them (see renderLicenseAlert). A grant is Active like any other licence; that
   it costs nothing is a licence fact, so it rides in the kicker, not here. */
/* Third line of the identity block on the phone, and it carries ONE thing: the
   label, muted. The status used to share it as a dot indicator; it has moved up to
   the overline (see renderKicker), which leaves this line to the one fact that is
   the user's own words. No label, no line — `hidden` rather than an empty box, so
   the spacing scale above and below closes up (the ≤600px rule reads
   `:not([hidden])` for exactly this reason). */
function renderSupportLine(lic){
  var el = $('#supportMob'); if(!el) return;
  el.hidden = !lic.label;
  el.textContent = lic.label || '';
}
/* The dated fact as ONE line with a leading glyph: a cycle arrow for a subscription
   that renews, a download arrow for a perpetual's software-updates term — the same
   two glyphs the licence cards use, so the icon means the same thing on both
   surfaces. The word rides back inside the value ("Renews Sep 02, 2026"), because a
   caps label above a single date was two lines spent on one fact. `#periodLabel*`
   stays in the markup and hidden: desktop still needs its own caps header, and the
   node is cheap insurance if the row goes two-line again. */
function renderPeriodRow(lic, pk){
  var lab = $('#periodLabel' + (pk === 'perp' ? 'Perp' : 'Sub'));
  var val = $('#periodValue' + (pk === 'perp' ? 'Perp' : 'Sub'));
  if(!lab || !val) return;
  var perp = pk === 'perp';
  var ic = '<span class="rowic">' + (perp ? UPDSVG : CYCLESVG) + '</span>';
  if(lic.grant){
    lab.textContent = 'Expiry';
    /* ⚠️ No `.muted` here either. Its siblings on this row ("Renews Sep 13, 2026",
       "Updates until …") are --ink from `.rowvalue`; --faint made the grant's line
       the only lighter one. Same fact, same tone. */
    val.innerHTML = ic + '<span class="rowtxt">No expiry</span>';
    return;
  }
  var word = perp
    ? (lic.status === 'updates_expiring' ? 'Updates expire' : 'Updates until')
    : (lic.status === 'canceled' ? 'Active until' : 'Renews');
  lab.textContent = word;
  val.innerHTML = ic + '<span class="rowtxt">' + word + ' ' + fmtDate(lic.event) + '</span>';
}
function statusChipHTML(lic){
  if(lic.status === 'canceled')
    return '<span class="chip status off">Canceled &middot; active until ' + fmtDate(lic.event) + '</span>';
  /* ⚠️ BLOCKED IS A STATUS, and this is the one exception to "attention states live in
     the banner, not the chip". The rule holds for payment failed, expiring updates and
     awaiting check-in: the licence still works, and the banner says what to do before
     it stops. Over the instance limit is different — the banner says the licence IS
     blocked right now, and a chip reading `● Active` beside that sentence contradicts
     it outright. The chip answers "is this licence alive"; here the answer is no. */
  if(instOverLimit(lic))
    return '<span class="chip status blocked">Blocked &middot; over instance limit</span>';
  return '<span class="chip status"><span class="sdot"></span>Active</span>';
}
function renderEntitlements(entList, extras){
  extras = extras || {};
  var pr = $('#planRows'); if(!pr) return;
  pr.innerHTML = (entList || []).map(function(e){
    var label=e[0], inc=e[1], suffix=e[2]||'';
    var exKey = ENT_EXTRA_KEY[label], ex = exKey ? extras[exKey] : '';
    var lab = label + (suffix ? ' <span class="muted">'+suffix+'</span>' : '');
    return meterRow(lab, inc, ex);
  }).join('');
}
/* The invoices this licence produced, from the dataset (an invoice names its licence
   through `licId`). Same builder as every other invoice table, minus the Product
   column — see invRow. */
function renderLicInvoices(lic){
  var body = $('#licInvBody'); if(!body) return;
  var opts = { noProduct:true };
  var list = invoicesSorted().filter(function(v){ return v.licId === lic.id; });
  /* ⚠️ THREE cases, and the old code had one line for all of them. "No invoices for
     this license yet." shown to someone who had just paid reads as "your payment
     failed" — which is exactly how the participant read it. It is now reserved for an
     account that genuinely has not been charged; a free licence says it is free, and a
     paid account looking at a licence with no charges of its own says so plainly. */
  var neverPaid = !DATA().invoices.length;
  var msg = lic.grant
    ? 'No invoices — the Community Grant is free.'
    : (neverPaid
        ? 'No invoices yet. The first one appears when this license is charged.'
        : 'No charges on this license yet.');
  body.innerHTML = list.length
    ? list.map(function(v){ return invRow(v, opts); }).join('')
    : '<tr><td colspan="' + invCols(opts) + '" class="emptybox">' + msg + '</td></tr>';
  var r = $('#licInvRange');
  if(r) r.textContent = list.length ? ('1–' + list.length + ' of ' + list.length) : '0 of 0';
}
function renderLicenseFeatures(lic, spec){
  var wl = (lic.whitelabel != null ? lic.whitelabel : spec.wl);
  var active = [];
  if(wl) active.push('White labeling');
  if(lic.edge) active.push('Edge Computing');
  if(lic.trendz) active.push('Trendz Analytics');
  // bought on a perpetual licence in the wizard's add-ons block (see hasOffline)
  if(lic.offline) active.push('Offline Mode');
  var chips = $('#featureChips'); if(!chips) return;
  chips.innerHTML = active.map(function(n){ return '<span class="fchip">'+FCHECK+n+'</span>'; }).join('');
  $('#featureBlock').hidden = active.length === 0;
}
/* One helper for every banner action, because the phone and the desktop want
   different words for the same button. The band on the phone is one row —
   message left, action right, vertically centred — so its label has to be a short
   verb ("Update"); the desktop has the width for the full phrase and must not
   change. Both are emitted and CSS picks, which also keeps the accessible name
   right: `display:none` drops a label out of the a11y tree, so the button is
   named "Update" on the phone and "Update payment method" on the desktop.
   `mobact` marks an action the desktop never had — it stays hidden there rather
   than appearing as a new control on a surface that was not in scope. */
function alertAction(short, long, attrs, mobOnly){
  return '<button class="btn ter aact' + (mobOnly ? ' mobact' : '') + '" ' + attrs + '>'
    + '<span class="aact-long">' + long + '</span>'
    + '<span class="aact-short">' + short + '</span>'
    + '</button>';
}
function renderLicenseAlert(lic){
  var al = $('#subAlert'); if(!al) return;
  var t = $('.atxt', al), st = lic.status;
  /* ⚠️ OVER THE INSTANCE LIMIT is checked FIRST, and it is derived rather than stored:
     it is a comparison between what is running and what the plan allows, so it cannot
     be forgotten on a licence the way a status field can. Before this, the demo had a
     licence running two instances against a limit of one, showing `Active`, with
     nothing anywhere saying so.

     ⚠️ Devices deliberately have no equivalent. The platform refuses connections past
     the licence's allowance, so a device count can never exceed its limit — an
     over-limit device banner would describe a state that cannot happen.

     ⚠️ PROVISIONAL WORDING: "the whole licence is blocked" is what was said verbally
     and is being confirmed with the team. Nothing in the repository states what the
     portal blocks. If it turns out only the extra instance is refused, this sentence
     is the only thing that changes — the count, the action and the attention routing
     stay as they are. */
  /* ⚠️ ONE SLOT, ONE BANNER — and when two conditions are true the second is NAMED in
     the first rather than stacked under it. Two banners is two problems competing for
     the same glance and pushing the licence itself off screen; a clause is enough to
     say "and there is also this", and the reader can act on the blocking one first.
     Order of seriousness: blocked → payment failed → updates expiring → cancelled →
     awaiting check-in. */
  function alsoClause(skip){
    var also = [];
    if(skip !== 'payment_failed' && lic.status === 'payment_failed') also.push('a failed payment');
    if(skip !== 'updates_expiring' && lic.status === 'updates_expiring')
      also.push('software updates expiring ' + fmtDate(lic.event));
    if(skip !== 'canceled' && lic.status === 'canceled') also.push('a pending cancellation');
    return also.length ? ' This license also has ' + also.join(' and ') + '.' : '';
  }
  if(instOverLimit(lic)){
    t.innerHTML = '<span class="amsg"><b>Over the production instance limit.</b> '
      + instRunning(lic) + ' running, ' + instAllowed(lic) + ' allowed on this plan \u2014 '
      + 'this license is blocked until the count is back within its limit.'
      + alsoClause('over_limit') + '</span>'
      /* ⚠️ NOT a third "Manage" on one screen. The header already carries the licence's
         `Manage`; this one is about the instance count specifically, so it says so.
         Same wizard, named for what it is being opened to change. */
      + alertAction('Manage', 'Manage instances', 'data-modal="add-ons"');
    al.hidden = false;
    return;
  }
  /* M3 banner: leading icon, the message with its concrete date, and the action as a
     text button — on the phone the two sit side by side on ONE row, the action
     vertically centred against the message; on the desktop the band stays the single
     line it always was. This is zone 1, directly under the app bar.
     ⚠️ EVERY branch must wrap its prose in a single `.amsg` span. On the phone
     `.atxt` is `display:contents`, so a bare `<b>` + text node become TWO grid
     items and land in different cells — the canceled banner printed its bold lead
     right-aligned on its own line until all four branches were made consistent. */
  if(st==='payment_failed'){
    t.innerHTML = '<span class="amsg"><b>Payment failed.</b> Update your payment method before '
      + fmtDate(lic.event) + ' to keep the subscription active.</span>'
      /* ⚠️ `data-goto="billing"` used to sit here and was read by NOTHING — a fossil of
         the single-file era's row router, reused as if it were a mechanism. The one
         banner whose action matters most had no handler at all. It now opens the card
         modal OVER this licence: the person stays where the problem is. */
      + alertAction('Update', 'Update payment method', 'data-paycard')
      /* the third contextual support route: a failed payment is the other place
         people get stuck with nothing left to try */
      + '<a class="link alert-help" href="' + EXT.support + '" target="_blank" rel="noopener">Contact support' + EXTSVG + '</a>';
    al.hidden=false;
  }
  else if(st==='updates_expiring'){
    /* ⚠️ The banner told you to renew and carried NO control that did it — its only
       button opened the documentation in a new tab. It now opens the same purchase
       modal the menu item opens, so the instruction and the means are in one place. */
    t.innerHTML = '<span class="amsg"><b>Software updates expire ' + fmtDate(lic.event)
      + '.</b> ' + UPDATES_LAPSE_SHORT + '</span>'
      + alertAction('Renew', 'Renew software updates', 'data-renewupdates="' + esc(lic.id) + '"');
    al.hidden=false;
  }
  /* A cancelled subscription's banner states a fact and has no action of its own:
     the one thing to do about it is `Renew subscription`, which is already the
     full-width primary in zone 4. Two buttons for one intent is noise. */
  else if(st==='canceled'){
    t.innerHTML = '<span class="amsg"><b>Subscription canceled.</b> It stays active until '
      + fmtDate(lic.event) + '. After that its instances will stop.</span>';
    al.hidden=false;
  }
  // the key exists but nothing has used it yet — the one thing left to do is activate
  else if(st==='awaiting_checkin'){
    t.innerHTML = '<span class="amsg"><b>No instance has checked in yet.</b> The license key was issued '
      + fmtDate(lic.created) + ' \u2014 activate an instance with it and it appears here. '
      + '<a class="link inlineact" href="' + EXT.install + '" target="_blank" rel="noopener" style="margin-left:6px">Installation guide' + EXTSVG + '</a></span>'
      + '<a class="btn ter aact mobact" href="' + EXT.install + '" target="_blank" rel="noopener">'
      +   '<span class="aact-long">Installation guide' + EXTSVG + '</span><span class="aact-short">Set up' + EXTSVG + '</span></a>';
    al.hidden=false;
  }
  else al.hidden = true;
}
/* The scheduled change, on the surface that owns the licence. It names what changes
   and when, and carries the only way to call it off.
   ⚠️ Renders into the Plan block's banner (see the markup above), because every figure
   it mentions is a row of the table directly beneath it. Same text, same action; what
   changed is that the reader no longer has to carry the sentence down the page. */
var SCHEDSVG = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'
  + '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l2.8 1.8"/></svg>';
function renderScheduled(lic){
  var el = $('#schedLine'); if(!el) return;
  var sc = lic && lic.scheduled;
  if(!sc){ el.hidden = true; el.innerHTML = ''; return; }
  el.innerHTML = SCHEDSVG
    + '<span class="atxt"><b>Scheduled for ' + fmtDate(sc.effective) + ':</b> ' + esc(sc.summary)
    + ' Current allowances stay until then.</span>'
    + '<button class="link sched-cancel" data-cancelsched="' + esc(lic.id) + '">Cancel this change</button>';
  el.hidden = false;
}
document.addEventListener('click', function(e){
  var b = e.target.closest('[data-cancelsched]');
  if(!b) return;
  var id = b.getAttribute('data-cancelsched');
  var was = cancelScheduledChange(id);
  if(!was) return;
  var lic = licById(id);
  /* ⚠️ `renderLicense` NEVER EXISTED — grepped: no file defines it, so the page-mode
     branch of this handler has always been dead. Cancelling a scheduled change on
     license.html removed it from the store and left the banner on screen until a
     reload. Invisible while the banner was a quiet line under the title; not invisible
     now that it is the first thing in the Plan block. `afterChange()` is the module's
     own re-render and serves BOTH hosts, so there is no second name to keep alive. */
  if(window.LicenseDetails){
    if(LicenseDetails.isOpen()) LicenseDetails.reopen(lic);
    else LicenseDetails.afterChange();
  }
  /* ⚠️ Was a MODAL. Interrupting with a dialog to confirm that something was undone
     makes the person dismiss a second thing to get back to where they were; it is an
     action result like any other. */
  Snack.show('Scheduled change canceled \u2014 this license keeps its current plan');
});

function renderLicenseActions(lic){
  var canceled = lic.status==='canceled', isPerp = isPerpLike(lic);
  var coupon=$('#couponBtn'), change=$('#changePlanBtn'), kebab=$('#headKebabMenu'), renew=$('#renewBtn');
  if(!isPerp){
    if(coupon) coupon.hidden = canceled;
    if(change) change.hidden = canceled;
    if(renew)  renew.hidden  = !canceled;
  }
  /* The overflow carries data-page="sub", and desktop wants exactly that: a
     perpetual licence shows Reveal key, Installation instructions and the label
     pencil as its own inline controls, so a ⋮ there would duplicate them.
     On the phone every one of those inline controls is suppressed (see the
     ≤600px block), which leaves the overflow as their ONLY home — so a
     perpetual or cancelled licence has to keep it, with just the items that no
     longer apply taken out. */
  if(kebab){
    var phone = window.matchMedia('(max-width:600px)').matches;
    var cancelItem = $('[data-cancel-active]', kebab);
    var couponItem = $('[data-couponmenu]', kebab);
    if(cancelItem) cancelItem.hidden = isPerp || canceled;
    if(couponItem) couponItem.hidden = canceled || !!lic.grant;
    kebab.hidden = phone ? false : (isPerp || canceled);
  }
  /* zone 4 owns the hairline that closes the header block, so a licence with no
     primary action (a grant) must drop the whole row, rule included. */
  var zone4 = $('#appView .headactions');
  if(zone4){
    var live = $$('.btn', zone4).some(function(b){
      return !b.hidden && b.id !== 'headKebabBtn' && getComputedStyle(b).display !== 'none';
    });
    zone4.classList.toggle('empty', !live);
  }
}
/* The eyebrow above the title says what this licence IS — its product and its
   type — while the title says which plan or package it carries. Neither repeats
   the other, and neither repeats the modal's own header ("License"). */
function renderKicker(lic, pk){
  var el = $('#appView .titlekicker[data-page="' + pk + '"]');
  if(!el) return;
  var product = lic.product || 'ThingsBoard';
  // a grant is free and has no billing type of its own — that is the fact worth stating
  var type = lic.grant ? 'Grant · Free' : (isPerpLike(lic) ? 'Perpetual' : 'Subscription');
  /* On the phone the status chip rides the OVERLINE, right-aligned, so the headline
     below it stands alone. It cannot be moved there by CSS — `#statusSlot` lives in
     `.titlerow` beside the h1, and `order` does not carry a child across parents —
     so the eyebrow emits its own short chip and the desktop one steps aside there.
     Short on purpose: the desktop chip spells out "Canceled · active until <date>",
     and that date is already the renewal row two lines further down. */
  /* ⚠️ Line 1 is the TYPE alone and line 2 is product · plan — the same order the
     licence cards use, so the list and the detail agree. It used to be
     "ThingsBoard · Subscription" over "Startup", which named the product twice
     once the headline gained it and buried the plan under the product.
     The headline is written by renderLicenseDetails (it sets #planName), so the
     product is prepended there, not here. */
  el.innerHTML = esc(type)
    + '<span class="kickchip mob-only">'
    +   '<span class="chip status' + (lic.status === 'canceled' ? ' off' : '') + '">'
    +     (lic.status === 'canceled' ? 'Canceled' : '<span class="sdot"></span>Active')
    +   '</span>'
    + '</span>';
}

/* A grant rides the perpetual details layout, with the few things that differ
   switched over: what the dated block means (nothing expires), no coupon or
   capacity purchase, no invoices, and no instance until the deployment checks
   in with the new key. Every non-grant licence restores the same nodes. */
function renderGrantChrome(lic){
  var isGrant = !!(lic && lic.grant);
  /* ⚠️ `textContent` here WIPED the heading's info-icon slot — it rewrites the whole
     node, span included, and this runs after the markup is mounted. The word is set on
     its own text node instead, and `#updatesInfo` (which renderLicenseDetails fills)
     is left alone. A grant has no updates term, so it gets the word and no icon. */
  var ph = $('#appView .keycol[data-page="perp"] .periodhead');
  if(ph){
    var slot = $('#updatesInfo', ph);
    ph.textContent = isGrant ? 'Expiry' : 'Software updates';
    if(slot) ph.appendChild(slot);
  }
  var coupon = $('#couponBtn'); if(coupon) coupon.hidden = isGrant;
  // the data-page pass above already restored these for a perpetual licence,
  // so a grant only has to take them back out
  if(isGrant) $$('#appView [data-page="perp"][data-modal="add-ons"]').forEach(function(b){ b.hidden = true; });
  var invEmpty = $('#grantInvEmpty'); if(invEmpty) invEmpty.hidden = !isGrant;
  // the invoice block is no longer keyed by data-page (one table serves sub and perp),
  // so the grant hides it by id
  var invBlock = $('#licInvBlock'); if(invBlock) invBlock.hidden = isGrant;
  if(isGrant) $$('#panel-invoices [data-page]').forEach(function(el){ el.hidden = true; });
  var instEmpty = $('#grantInstEmpty'); if(instEmpty) instEmpty.hidden = !isGrant;
  var instBar = $('#panel-prod .insttoolbar'); if(instBar) instBar.hidden = isGrant;
  var onChip = $('#panel-prod .typechip.is-on'), instType = onChip ? onChip.getAttribute('data-insttype') : 'prod';
  $$('#panel-prod .insttype').forEach(function(el){ el.hidden = isGrant || el.getAttribute('data-insttype') !== instType; });
}
function renderLicenseDetails(lic){
  if(!lic) return;
  var spec = TIER_SPECS[lic.tier] || {}, isPerp = isPerpLike(lic), pk = isPerp ? 'perp' : 'sub';
  $$('#appView [data-page]').forEach(function(el){ el.hidden = el.getAttribute('data-page') !== pk; });
  var nameEl = isPerp ? $('#planNamePerp') : $('#planName');
  // the headline carries product · plan; the eyebrow above it carries the type
  if(nameEl) nameEl.textContent = (lic.product || 'ThingsBoard') + ' · ' + lic.name;
  renderKicker(lic, pk);
  $('#statusSlot').innerHTML = statusChipHTML(lic);
  renderLabelSlot(lic);
  renderSupportLine(lic);
  renderPeriodRow(lic, pk);
  var kic = $('#keyIc'); if(kic && !kic.innerHTML) kic.innerHTML = KEYSVG;
  renderGrantChrome(lic);
  if(isPerp){
    var pp = $('#periodPerp');
    // a grant has no term at all — the dated block says so instead of a date
    // `.period` is --ink for every other licence; the grant matches it
    if(pp && lic.grant) pp.textContent = 'No expiry';
    else if(pp) pp.textContent = (lic.status==='updates_expiring' ? 'Expires ' : 'Until ') + fmtDate(lic.event);
    /* the explanation that stops the date reading as "the licence expires". A grant has
       no updates term at all, so it gets no icon rather than an irrelevant one. */
    var ui = $('#updatesInfo');
    if(ui) ui.innerHTML = lic.grant ? '' : infoIcon('Software updates', UPDATES_LAPSE);
  } else {
    var ps = $('#periodSub');
    if(ps) ps.textContent = (lic.status==='canceled' ? 'Active until ' : 'Renews ') + fmtDate(lic.event);
    var price = String(lic.price).replace(/\s*\/\s*mo/i,'');
    var nc=$('#ncAmount'), when=$('#ncWhen');
    /* ⚠️ NO CHARGE AHEAD → NO BLOCK. A cancelled subscription used to keep the card
       and fill it with an em dash and "No upcoming charge" — a framed block, a heading
       and a big empty amount, all to report that there is nothing to report. The card
       exists to answer "what comes off my card next"; when the answer is "nothing", the
       honest form of that answer is the card's absence, not a dash inside it.
       `data-page` already hides it for perpetual and grant, which never charge again;
       this covers the one recurring licence that has stopped. */
    var bill = $('#appView .billgrid');
    if(bill) bill.hidden = !hasNextCharge(lic);
    if(nc) nc.textContent = price;
    /* ⚠️ The "on " prefix is its own span so the phone can drop it. With the
       "NEXT CHARGE" label restored to the line, label + date + amount measured
       302px against a 284px box — and "on" is redundant once the label says what
       the date is. Removing it buys the 22px the line was short of. */
    if(when) when.innerHTML='<span class="nc-on">on </span>'+fmtDate(lic.event);
  }
  renderLicenseKey(lic);
  renderLicInvoices(lic);
  renderInstances(lic);
  renderEntitlements(spec.ent, lic.extras);
  renderLicenseFeatures(lic, spec);
  renderLicenseAlert(lic);
  renderScheduled(lic);
  renderLicenseActions(lic);
  renderLicFeed(lic);
}

/* Is there a scheduled charge ahead? One reading, so the block's visibility and any
   later surface that asks the same question cannot drift apart.
   ⚠️ `payment_failed` counts: the charge is still coming, it is the RETRY, and the
   amount and date are exactly what the person needs while the banner tells them to
   update the card. Cancelled does not: it runs to the end of what was paid for and
   then stops. Perpetual and grant never had one. */
function hasNextCharge(lic){
  if(!lic || lic.grant) return false;
  if(lic.type !== 'Subscription') return false;
  if(lic.status === 'canceled') return false;
  return !!lic.event;
}

/* ---------- the licence key, per licence and masked on open ----------
   ⚠️ Called from renderLicenseDetails, so it runs on EVERY open — page mount, modal
   open, and every re-render after a change. That is what makes "re-masks when the
   panel is closed or another licence is opened" true without a close handler: there
   is no path that shows a licence without going through here. */
function setKeyRevealed(on){
  var t = $('#keyText'), b = $('#revealBtn');
  if(!t || !b) return;
  t.textContent = on ? t.dataset.full : t.dataset.masked;
  var eye = $('.eye', b), eyeOff = $('.eyeoff', b);
  // note: .hidden as a JS property is a no-op on SVG elements — toggle the attribute
  if(on){ eye && eye.setAttribute('hidden',''); eyeOff && eyeOff.removeAttribute('hidden'); }
  else  { eyeOff && eyeOff.setAttribute('hidden',''); eye && eye.removeAttribute('hidden'); }
  b.setAttribute('aria-pressed', on ? 'true' : 'false');
  b.setAttribute('aria-label', on ? 'Hide license key' : 'Reveal license key');
  b.setAttribute('title', on ? 'Hide' : 'Reveal');
}
function renderLicenseKey(lic){
  var t = $('#keyText'); if(!t) return;
  var key = licenseKeyFor(lic);
  t.dataset.full = key;
  t.dataset.masked = licenseKeyMask(key);
  setKeyRevealed(false);              // never inherit the previous licence's state
}

/* ---------- instances -------------------------------------------------------
   ⚠️ The STATUS column is derived, never stored: an instance has a last check-in and
   a known cadence, and "healthy" is a reading of those two, not a third fact that
   could drift out of step with them. See CHECKIN_INTERVAL_H / instStale in data.js.

   The cadence is stated ONCE, above the table (`#instNote`), because a column that
   says "Stale" without saying what it is measured against asks the reader to guess
   the very thing they came to find out. */
function instStatusCell(i){
  return instStale(i)
    ? '<td><span class="pill attn">Stale</span></td>'
    : '<td><span class="pill soft">Healthy</span></td>';
}
/* ⚠️ The full id is on the page, not truncated away from it. It used to render as
   `a1b2c3d4…e5f` with no way to see or copy the rest — an identifier you cannot read
   or paste is decoration. `.inst-id` clips with CSS so the column keeps its width,
   `title` gives it on hover, and the copy button puts the WHOLE value on the
   clipboard (the truncation was only ever visual). */
function instRow(i){
  var id = esc(i.id);
  return '<tr data-instid="' + id + '">'
    + '<td class="mono"><span class="inst-id" title="' + id + '">' + id + '</span>'
    +   '<button class="iconbtn ib tip inst-copy" data-instcopy="' + id + '"'
    +     ' aria-label="Copy instance ID" data-tip="Copy instance ID">' + COPYSVG + '</button></td>'
    + '<td class="inst-labelcell">'
    +   (i.label ? '<span class="inst-label">' + esc(i.label) + '</span>'
                 : '<span class="muted">&mdash;</span>')
    +   '<button class="iconbtn ib tip inst-editlabel" data-instlabel="' + id + '"'
    +     ' aria-label="Edit label" data-tip="Edit label">' + PENSVG + '</button></td>'
    + instStatusCell(i)
    + '<td>' + fmtDateTime(i.seen) + '</td>'
    + '<td>' + fmtDate(i.created) + '</td></tr>';
}
function renderInstances(lic){
  var prod = instancesOf(lic, 'prod'), dev = instancesOf(lic, 'dev');
  var note = $('#instNote');
  if(note){
    /* one sentence, and it carries the number the column is read against */
    note.textContent = 'Licenses check in about every ' + CHECKIN_INTERVAL_H
      + ' hours. An instance that has not checked in since then is shown as stale.';
    note.hidden = !(prod.length || dev.length);
  }
  var pb = $('#instBodyProd');
  if(pb) pb.innerHTML = prod.length
    ? prod.map(instRow).join('')
    : '<tr><td colspan="5" class="emptybox">Instances appear here automatically when a deployment is activated with this license.</td></tr>';
  var db = $('#instBodyDev');
  if(db) db.innerHTML = dev.length
    ? dev.map(instRow).join('')
    : '<tr><td colspan="5" class="emptybox">No development instances are running with this license.</td></tr>';
  var pager = $('#instPagerProd'); if(pager) pager.hidden = !prod.length;
  var range = $('#instRangeProd');
  if(range) range.textContent = prod.length ? ('1\u2013' + prod.length + ' of ' + prod.length) : '0 of 0';
}

/* An instance label is set the same way a licence label is — a small dialog, the same
   writer shape, the same activity entry — because it is the same job on a smaller
   object. ⚠️ It writes onto the instance INSIDE the store\'s licence, so it survives a
   reload like every other mutation; `Store.save()` is what makes that true. */
function openInstanceLabelModal(instId){
  var lic = activeLicense; if(!lic) return;
  var i = instancesOf(lic).filter(function(x){ return x.id === instId; })[0];
  if(!i) return;
  openModal('Edit instance label',
    '<div class="field"><label for="instLabelInput">Label</label>'
    + '<input id="instLabelInput" type="text" autocomplete="off" placeholder="e.g. HQ node 1" value="' + esc(i.label || '') + '">'
    + '<div class="help">A label tells this instance apart from the others running on the same license.</div></div>');
  $('#modalCloseBtn').textContent = 'Cancel';
  var inp = $('#instLabelInput');
  var save = modalAction('Save', function(){
    var was = i.label;
    i.label = String(inp.value || '').trim();
    Store.save();
    if(i.label !== was){
      logActivity({ kind:'updated', entityType:'Instance', entityName:(i.label || i.id), action:'UPDATED',
        txt: i.label
          ? ('Label <b>' + esc(i.label) + '</b> was set on an instance of <b>' + esc(lic.name) + '</b> by ' + portalActor() + '.')
          : ('Label was cleared on an instance of <b>' + esc(lic.name) + '</b> by ' + portalActor() + '.') });
    }
    renderInstances(lic);
    closeModal();
    Snack.show(i.label ? 'Instance label saved' : 'Instance label cleared');
  });
  inp.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); save.click(); } });
  inp.focus(); inp.select();
}

/* ---------- buy software updates ---------------------------------------------
   ⚠️ This was a dead control in two places at once — the row kebab and the licence
   page — and it was dead in the worst way: it LOOKED like it worked (a new tab opened
   behind an open menu) so nothing told the person to stop. One participant pressed it
   five times across two surfaces. It now costs money and says so.

   ⚠️ PRICE: 40% of the licence's base price (UPDATES_RENEW_RATE), computed from the
   licence rather than typed per tier, so it follows the price list. The rate itself is
   unconfirmed in writing — see NOTES.

   ⚠️ TERM: 12 months FROM THE PURCHASE DATE, as specified for this pass. Deliberately
   NOT "12 months from the current expiry": that means renewing a month early forfeits
   the month left, which the modal states outright rather than letting the new date be
   a surprise afterwards. */
function updatesRenewPrice(lic){
  return Math.round(tierBase(lic && lic.tier) * UPDATES_RENEW_RATE * 100) / 100;
}
function updatesNewExpiry(){ return dayStr(Math.round(UPDATES_RENEW_MONTHS * 30.44)); }
function openRenewUpdatesModal(licId){
  var lic = licById(licId) || activeLicense;
  if(!lic) return;
  var price = updatesRenewPrice(lic), to = updatesNewExpiry();
  var lapsed = lic.event && dateKey(lic.event) < dateKey(todayStr());
  openModal('Renew software updates',
    '<p>Buy another ' + UPDATES_RENEW_MONTHS + ' months of software updates for <b>'
    +   esc(lic.name) + (lic.label ? ' \u00b7 ' + esc(lic.label) : '') + '</b>.</p>'
    + '<div class="row"><span class="l">Software updates &middot; ' + UPDATES_RENEW_MONTHS + ' months</span>'
    +   '<span class="r"><b>' + fmtMoney(price) + '</b></span></div>'
    + '<div class="row"><span class="l">' + (lapsed ? 'Updates lapsed' : 'Current term ends') + '</span>'
    +   '<span class="r">' + fmtDate(lic.event) + '</span></div>'
    + '<div class="row"><span class="l">New term ends</span><span class="r"><b>' + fmtDate(to) + '</b></span></div>'
    /* the honest consequence of "12 months from the purchase date" */
    + (lapsed ? '' : '<div class="cardhelp" style="margin-top:12px">The new term runs 12 months from today, '
        + 'so renewing before ' + fmtDate(lic.event) + ' does not add the remaining days.</div>')
    + '<div class="cardhelp" style="margin-top:10px">' + TAX_NOTE + '</div>');
  $('#modalCloseBtn').textContent = 'Cancel';
  modalAction('Pay ' + fmtMoney(price), function(){
    lic.event = to;
    /* ⚠️ the STATUS has to move too, or the banner keeps warning about a term that has
       just been paid for — the exact "form does not change the page" fault this pass
       is cleaning up elsewhere */
    if(lic.status === 'updates_expiring') lic.status = 'active';
    Store.save();
    storeAddInvoice(lic, fmtMoney(price), { payment:'Card', auto:false });
    logActivity({ kind:'updated', entityType:'Perpetual', entityName:lic.name, action:'UPDATED',
      txt:'Software updates were renewed on <b>' + esc(lic.name) + '</b> by ' + portalActor() + '.',
      delta:'Updates term now ends ' + fmtDate(to) });
    closeModal();
    Snack.show('Software updates renewed until ' + fmtDate(to));
    if(window.LicenseDetails && LicenseDetails.isOpen()) LicenseDetails.reopen(lic);
    else if(window.LicenseDetails) LicenseDetails.afterChange();
    });
}
/* one delegated handler for every entry point: the row kebab, the licence header
   menu and the expiring-updates banner all carry `data-renewupdates` */
document.addEventListener('click', function(e){
  var b = e.target.closest('[data-renewupdates]');
  if(!b) return;
  closeAllMenus();
  openRenewUpdatesModal(b.getAttribute('data-renewupdates') || (activeLicense && activeLicense.id));
});

/* ---------- entitlement rows ---------- */

// entitlement amounts may carry a trailing "M" (AI) or thousands commas (devices)
function parseUnit(v){ v = String(v == null ? '0' : v); var m = /M$/i.test(v); var n = parseFloat(v.replace(/,/g, '').replace(/M$/i, '')) || 0; return { n:n, m:m }; }
function fmtUnit(n, m){ return m ? (n + 'M') : n.toLocaleString('en-US'); }
// usage stays a placeholder (0 used) under the limit. `extra` = purchased add-ons:
// it lifts the limit and fills the Purchased column so the row shows what was bought.
function meterRow(item, included, extra){
  var inc = parseUnit(included), ex = parseUnit(extra || '0');
  var incDisp = fmtUnit(inc.n, inc.m), limitDisp = fmtUnit(inc.n + ex.n, inc.m || ex.m);
  var extraCell = ex.n > 0
    ? '<td class="num">+' + fmtUnit(ex.n, ex.m) + '</td>'
    : '<td class="num muted">0</td>';
  /* The delta pill exists for the phone, where Included and Purchased are dropped and the
     row is just name + limit: without it "2" would hide the fact that one of the two
     was bought. Desktop has the Purchased column and hides the pill. */
  var deltaPill = ex.n > 0 ? '<span class="entdelta mob-only">+' + fmtUnit(ex.n, ex.m) + '</span>' : '';
  return '<tr><td>' + item + '</td>' +
    // .usecol — hidden by CSS, still rendered (see the thead comment in DETAILS_HTML)
    '<td class="usecol"><div class="usecell">' +
    '<span class="usetxt">0 / ' + limitDisp + '</span><div class="meter"><span style="width:0%"></span></div></div></td>' +
    '<td class="num">' + incDisp + '</td>' + extraCell +
    '<td class="num entlimit">' + limitDisp + deltaPill + '</td></tr>';
}

/* ---------- in-surface behaviours ----------
   Wired once, after the markup is mounted; the details are re-rendered per
   licence by renderLicenseDetails(). */
function wireDetailsOnce(){
  /* ---------- license key reveal / copy ---------- */
  var revealBtn = $('#revealBtn');
  /* ⚠️ The reveal state lives on the BUTTON (`aria-pressed`), not in a closure
     variable. It was `var revealed = false` inside this once-only wiring, which meant
     it survived every licence switch: reveal one licence and the next one you opened
     was already in the clear — with the same key, because the markup carried one
     hardcoded value for all of them. Reading it from the DOM is what lets
     renderLicenseKey() put it back to masked on every open. */
  revealBtn.addEventListener('click', function(){
    setKeyRevealed(revealBtn.getAttribute('aria-pressed') !== 'true');
  });

  /* ⚠️ `Copy instance ID` had NO handler at all — found while making every copy
     action name what it copied. It is phone-only, which is why it survived unnoticed.
     Delegated, because the Instances panel is part of the mounted markup. */
  document.addEventListener('click', function(e){
    var ic = e.target.closest('.inst-copy');
    if(!ic) return;
    var cell = ic.closest('td');
    var id = cell ? cell.textContent.trim() : '';
    copyValue(id, 'Instance ID', ic);
  });

  var copyBtn = $('#copyBtn');
  copyBtn.addEventListener('click', function(){
    // read it fresh: `keyText` is no longer captured in this scope, and the value
    // changes with the licence
    copyValue($('#keyText').dataset.full, 'License key', copyBtn);
  });
;

  /* the pencil, the "+ Add label" chip and the menu item all open the same inline
     edit; delegated, because the slot's contents are replaced on every render */
  document.addEventListener('click', function(e){
    if(!e.target.closest('[data-editlabel]')) return;
    closeAllMenus();
    editLabel();
  });
  /* The ⋮ entry that mobile uses for Apply coupon just presses the real button, so
     the coupon modal keeps one controller. The button is display:none on a phone —
     a programmatic click still fires its handler. */
  /* Three ⋮ entries the phone needs — coupon, reveal, install — and each just
     presses the real button, so every one of them keeps a single controller. The
     buttons are display:none on a phone; a programmatic click still fires. */
  [['[data-couponmenu]', '#couponBtn'],
   ['[data-revealmenu]', '#revealBtn'],
   ['[data-installmenu]', '#installBtn']].forEach(function(pair){
    document.addEventListener('click', function(e){
      if(!e.target.closest(pair[0])) return;
      closeAllMenus();
      var btn = $(pair[1]);
      if(btn) btn.click();
    });
  });

  /* ---------- coupon ---------- */
  (function(){
    var ov=$('#couponOverlay'), btn=$('#couponBtn'), input=$('#couponInput'), apply=$('#couponApply');
    if(!ov || !btn) return;
    function refresh(){ apply.disabled = !input.value.trim(); }
    function open(){ input.value=''; refresh(); ov.hidden=false; input.focus(); }
    function close(){ ov.hidden=true; btn.focus(); }
    btn.addEventListener('click', open);
    input.addEventListener('input', refresh);
    $('#couponClose').addEventListener('click', close);
    $('#couponCancel').addEventListener('click', close);
    /* ⚠️ Applying a coupon used to close the dialog and say NOTHING — the redemption is
       a stub, but silence made it read as a failure. The result is an action result,
       so it is a snackbar like every other one. */
    apply.addEventListener('click', function(){
      if(apply.disabled) return;
      var code = input.value.trim();
      close();
      Snack.show('Coupon ' + code + ' applied');
    });
    ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !ov.hidden) close(); });
  })();

  /* ---------- Instances tab: Production / Development switcher + select-all ---------- */
  var instPanel = $('#panel-prod');
  if(instPanel){
    $$('.insttoolbar .typechip', instPanel).forEach(function(chip){
      chip.addEventListener('click', function(){
        var type = chip.getAttribute('data-insttype');
        $$('.insttoolbar .typechip', instPanel).forEach(function(c){
          var on = c === chip;
          c.classList.toggle('is-on', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        $$('.insttype', instPanel).forEach(function(b){ b.hidden = b.getAttribute('data-insttype') !== type; });
      });
    });
    /* ⚠️ THE SELECT-ALL AND ROW CHECKBOXES ARE GONE, not re-wired. They ticked, the
       header ticked them all, and nothing anywhere acted on a selection — no action
       bar, no menu, no bulk anything. There is no bulk operation specified for
       instances, so the honest options were "invent one" or "remove the control";
       a control that responds and does nothing is the exact fault this pass is for.
       If a bulk action arrives, the column comes back with it.

       ---------- copy the FULL instance id ---------- */
    instPanel.addEventListener('click', function(e){
      var c = e.target.closest('[data-instcopy]');
      if(c){ copyValue(c.getAttribute('data-instcopy'), 'Instance ID', c); return; }
      var l = e.target.closest('[data-instlabel]');
      if(l){ openInstanceLabelModal(l.getAttribute('data-instlabel')); return; }
    });
  }

  var STUB = 'Placeholder — not part of this wireframe spec yet.';
  var MODALS = {
    'change-plan': function(){ if(activeLicense && activeLicense.type === 'Subscription'){ NL.openChange(activeLicense); } else { openModal('Change plan', '<p>Open a subscription first.</p>'); } },
    'add-ons': function(){ openManageAddons(activeLicense); },
    /* ⚠️ `add-capacity` IS GONE — both the button and the placeholder dialog it opened.
       A perpetual buys capacity through the SAME wizard a subscription uses (`add-ons`),
       so the two headers now read `Manage` on both kinds and there is no second,
       emptier route that only perpetual owners ever found. */
    'manage-payment': function(){ openModal('Manage payment', '<p>Payment method lives in account Billing.</p>'); }
  };
  /* ⚠️ DELEGATED, not bound per node. `$$('[data-modal]')` ran once over the nodes that
     existed at wiring time — which is every button in the static markup and NONE of the
     ones a render produces later. The over-limit banner builds its action in
     renderLicenseAlert, so its `Manage` never got a listener: three taps, no response,
     on the one control that fixes the state the banner is warning about.
     A delegated listener cannot go stale, whatever a later render builds. */
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-modal]');
    if(!el) return;
    var fn = MODALS[el.getAttribute('data-modal')];
    if(fn) fn();
  });

  /* ---------- render ---------- */
  function refreshDetails(){ renderLicenseDetails(activeLicense); }
  refreshDetails();
  wireFeedAudit('#appView');
  wirePeriod('.perctl', licPeriod, function(){ renderLicFeed(activeLicense); });

  /* ---------- header actions ---------- */
  var cancelActiveBtn = $('[data-cancel-active]');
  if(cancelActiveBtn) cancelActiveBtn.addEventListener('click', function(e){
    e.stopPropagation();
    closeAllMenus();
    openCancelModal(activeLicense, function(){ LicenseDetails.afterChange(); });
  });
  /* the card modal can change THIS licence's status (a failed payment recovers), so
     the surface it was opened over has to restate rather than keep showing the banner
     for a problem that is now solved */
  if(window.PayCard) PayCard.onSaved(function(){
    Snack.show('Payment method updated');
    if(!activeLicense) return;
    var fresh = licById(activeLicense.id);
    if(fresh) LicenseDetails.reopen ? LicenseDetails.reopen(fresh) : renderLicense(fresh);
  });

  /* The licence's own Activity tab has real feed data, so its search is wired —
     unlike the Instances one next to it, which was removed rather than faked. */
  (function(){
    var box = $('#panel-audit .searchbox input');
    if(!box || typeof wireSearch !== 'function') return;
    wireSearch('#panel-audit .searchbox input', {
      items: function(){ return $$('#licFeed > *').filter(function(n){ return !n.classList.contains('noresults'); }); },
      text:  function(n){ return stripText(n.innerHTML); },
      host:  function(){ return $('#licFeed'); },
      empty: function(q){ return noResultsHTML(q); }
    });
  })();

  var renewBtn = $('#renewBtn');
  if(renewBtn) renewBtn.addEventListener('click', function(){
    openModal('Renew subscription', '<p>Placeholder — reactivate this subscription and resume billing (TODO).</p>');
  });
}

/* ---------- demo hooks (console) ----------
   The markup is mounted by a host after this file loads, so these resolve their
   nodes on call. Healthy licences show no alert; these fake the states. */
window.showSubAlert = function(html){
  var al = $('#subAlert'); if(!al) return;
  $('.atxt', al).innerHTML = html || '<b>Payment failed.</b> We could not charge Visa \u2022\u20224242. Update your payment method to keep the subscription active.';
  al.hidden = false;
};
window.clearSubAlert = function(){ var al = $('#subAlert'); if(al) al.hidden = true; };
window.setFeature = function(key, on){
  if(!activeLicense) return;
  activeLicense[key === 'whitelabel' ? 'whitelabel' : key] = !!on;
  renderLicenseDetails(activeLicense);
};

/* ---------- the two hosts ----------------------------------------------------
   Page mode mounts the surface in the page shell and keeps the origin-aware
   back button. Modal mode mounts the same surface in a large modal over the
   page that opened it: close is the only exit (no back), the backdrop is inert
   because the details can host open editors, and Escape closes only when no
   nested flow (wizard, add-ons, coupon, confirm) is open above it. */
var LicenseDetails = (function(){
  var MODAL_HTML = ''
  + '<div class="fs-screen licmodal" id="licModal" role="dialog" aria-modal="true" aria-labelledby="licModalTitle" hidden>'
  + '  <div class="fs-box">'
  + '    <div class="fs-header">'
  + '      <h2 class="fs-maintitle" id="licModalTitle">License details</h2>'
  + '      <span class="spacer"></span>'
  + '      <div class="fs-headactions"><button class="fs-close" id="licModalClose" aria-label="Close">\u2715</button></div>'
  + '    </div>'
  + '    <div class="fs-body" id="licModalBody"></div>'
  + '  </div>'
  + '</div>';
  // #nlModal covers Manage add-ons too now — it is a mode of the same wizard
  var NESTED = ['#nlModal', '#couponOverlay', '#payOverlay', '#overlay', '#addUserOverlay'];
  var mountedIn = null, wired = false, modal = null, opener = null;
  // modal mode only: the page underneath keeps its rows on screen, so a change
  // made inside the modal has to be restated there too
  var hostRerender = null;

  function mount(host){
    if(mountedIn === host) return;
    host.innerHTML = DETAILS_HTML;
    mountedIn = host;
  }
  /* ⚠️ The surface KEPT the previous licence's scroll position and selected tab.
     `mount()` moves the same DOM between hosts, so nothing was ever reset — open one
     licence, scroll to its Instances tab, close, open another, and the second one
     opened mid-page on Instances, with the name and status off-screen above. On a
     phone that means the panel gives no sign of which licence you are in.
     Both belong to the licence you WERE looking at, so both are dropped on every open. */
  function resetSurface(){
    var first = $('#tab-invoices');
    if(first) selectTab(first);
  }
  /* ⚠️ SEPARATE from the tab reset, and called AFTER the surface is on screen.
     `show()` runs while the modal is still `hidden`, and `scrollTop` on an element
     with no layout box is silently dropped — measured: the tab reset took effect and
     the scroll stayed at 400, so the second licence still opened mid-page. */
  function resetScroll(){
    var body = $('#licModalBody'), shell = $('#shellMain');
    if(body) body.scrollTop = 0;
    if(shell) shell.scrollTop = 0;
    if(window.scrollY) window.scrollTo(0, 0);
  }
  function show(lic){
    activeLicense = lic;
    renderLicenseDetails(lic);
    resetSurface();
    if(!wired){ wireDetailsOnce(); wired = true; }
    syncNewBanner(lic);
  }
  /* ---------- the overflow stays WITH the other actions ----------
     ⚠️ `placeOverflow()` is GONE. It relocated the ⋮ on a phone — into the app bar's
     trailing slot on the page, into the sheet's own header in the modal — following
     M3's "one primary in the content, everything else behind an overflow in the app
     bar". The cost was that the overflow ended up ABOVE the licence title, three
     screens away from `Change plan`, and so read as the FIRST action on the page
     rather than the last: the opposite of what an overflow is.
     It now lives where it does on desktop — last in `.headactions`, right of the
     primary — at every width and in both hosts. The menu itself is still a bottom
     sheet on a phone; that is keyed off `#headKebabPop` in CSS, not off where the
     button sits, so it survived the removal unchanged. */
  /* ⚠️ ONCE PER LICENCE, and the "once" is recorded the moment it is SHOWN, not when
     it is dismissed. It used to key off `Store.justCreated` alone and clear on dismiss,
     so closing the panel and reopening it brought the banner back, and so did a
     reload — a one-time message that was not one-time. `createdSeen` is a map of
     licence ids in the store, so the record survives a refresh.
     Dismissing only hides it; the seen mark is already written. */
  function syncNewBanner(lic){
    var b = $('#licNewBanner'); if(!b) return;
    var justId = Store.get('justCreated');
    var seen = Store.get('createdSeen') || {};
    var show = !!(lic && justId && lic.id === justId && !seen[lic.id]);
    b.hidden = !show;
    if(!show) return;
    seen[lic.id] = true;
    Store.set('createdSeen', seen);
    var x = $('#licNewDismiss');
    if(x && !x.getAttribute('data-wired')){
      x.setAttribute('data-wired', '1');
      x.addEventListener('click', function(){ b.hidden = true; });
    }
  }
  /* ⚠️ `syncChangedBanner` is GONE. A completed change is an action RESULT, so it goes
     to the snackbar (see commitChange in wizard.js) — it neither renders in the panel
     nor competes with the state slot for the space below the header. */
  function nestedOpen(){
    return NESTED.some(function(sel){ var el = $(sel); return el && !el.hidden; });
  }
  function buildModal(){
    var d = document.createElement('div');
    d.innerHTML = MODAL_HTML;
    modal = d.firstChild;
    document.body.appendChild(modal);
    $('#licModalClose').addEventListener('click', close);
    // capture phase on purpose: a nested flow's own Escape handler runs in the
    // bubble phase, so by then it has already closed itself and we would read
    // "nothing nested" and close this modal too. Deciding first fixes that.
    document.addEventListener('keydown', function(e){
      if(e.key !== 'Escape' || !modal || modal.hidden) return;
      if(nestedOpen()) return;            // whatever sits above us owns Escape
      close();
    }, true);
    // no backdrop-to-close here: an open editor inside the details would lose work
  }
  /* The header names the entity, and the entity is a licence. What kind of licence
     it is (product and type) is the eyebrow above the title, and which plan or
     package it carries is the title itself — so nothing is said twice. */
  function titleFor(){ return 'License'; }
  function openModal(lic){
    if(!lic) return;
    if(!modal) buildModal();
    opener = document.activeElement;
    mount($('#licModalBody'));
    show(lic);
    var back = $('#backBtn'); if(back) back.hidden = true;   // close is the only exit
    $('#licModalTitle').textContent = titleFor();
    modal.hidden = false;
    document.body.classList.add('licmodal-open');            // the page behind stops scrolling
    resetScroll();                                           // now that it has a layout box
    $('#licModalClose').focus();
  }
  function close(){
    if(!modal) return;
    modal.hidden = true;
    document.body.classList.remove('licmodal-open');
    if(opener && opener.focus) opener.focus();
  }
  function mountPage(hostSel, lic, opts){
    var host = $(hostSel); if(!host) return;
    mount(host);
    show(lic);
    resetScroll();
    var b = $('#backBtn');
    if(b && opts && opts.back){
      b.setAttribute('aria-label', opts.back.label);
      b.setAttribute('title', opts.back.label);
      b.addEventListener('click', function(){ location.href = opts.back.href; });
    }
  }
  // a change made inside the surface: restate the details and the page behind
  function afterChange(){
    if(activeLicense) renderLicenseDetails(activeLicense);
    if(hostRerender) hostRerender();
  }
  return {
    mountPage: mountPage,
    openModal: openModal,
    close: close,
    setRerender: function(fn){ hostRerender = fn; },
    afterChange: afterChange,
    isOpen: function(){ return !!modal && !modal.hidden; },
    // a nested flow changed the licence: restate it without leaving the modal
    reopen: function(lic){
      if(!lic) return;
      show(lic);
      if(modal) $('#licModalTitle').textContent = titleFor(lic);
      if(hostRerender) hostRerender();
    },
    refresh: function(){ if(activeLicense) renderLicenseDetails(activeLicense); }
  };
})();

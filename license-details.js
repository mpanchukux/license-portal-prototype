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
+ '             action produced two messages in two places. See the rule in the'
+ '             styleguide: results → snackbar, state → the slot below the header.'
+ '             (There was a third place — scheduled changes — until downgrades'
+ '             started taking effect immediately.) -->'
+ '        <!-- License created is the one banner that lives up here: it is shown once'
+ '             per licence, above the title, so a new licence WITH a problem can show'
+ '             it and the state banner without the two colliding. -->'
/* ⚠️ `on-ink`: this banner keeps `.gbanner`'s ink fill, and the class is now how the
   button rules below find a dark ground (see `toneClass`). Untoned used to imply it. */
+ '        <div class="gbanner licnew on-ink" id="licNewBanner" role="status" hidden>'
+ '          <svg class="ic gb-ic" aria-hidden="true"><use href="assets/icons.svg#ti-circle-check"></use></svg>'
+ '          <span class="gb-txt">License created &mdash; your license key is ready.</span>'
+ '          <span class="sp"></span>'
+ '          <button class="btn btn--ghost btn--md btn--icon gb-x" id="licNewDismiss" aria-label="Dismiss"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-x"></use></svg></button>'
+ '        </div>'
+ '        <div class="canvas">'
+ ''
/* ⚠️⚠️ A FLAT LAVENDER TINT, NOT THE MESH (2026-09-28, by request). The header carried
   the identical `.meshbg` node Home and the wizard carry, for one pass. Two things were
   wrong with it and only one was visible:
     · the request was for a light tint here, with Plan and everything under it on white;
     · ⚠️⚠️ AND THE LAYER OVERFLOWED ITS HEADER. `.meshbg` is `height:48vh` — it is sized
       for a PAGE's header zone — and inside a 234px header that is ~200px of gradient
       hanging below it. `.head` is `position:relative`, so its whole stacking context
       paints above the in-flow sections beneath, and the spill drew a band of gradient
       across the top of the scrolled content and stayed there. Measured: the layer's box
       ran to y=244 with the header ending at y=45.
       `overflow:hidden` on the header would have clipped it AND the info-icon tooltips
       that live in the same block. Taking the node out removes both problems at once.
   ⚠️ `.on-tint` IS THE SURFACE AXIS (renamed from `.on-mesh` in the same pass — the
   ground is not a mesh any more and a class that says so would be a lie). The notes
   asked three times for the button model to gain an axis for WHAT IT STANDS ON; this is
   it. The class goes on the CONTAINER, not on each button — what a button stands on is a
   property of the place. */
+ '          <!-- header: back button in its own gutter, everything else in the content column -->'
+ '          <div class="head">'
+ '           <div class="headgrid">'
+ '            <button type="button" class="btn btn--secondary btn--md btn--icon back" id="backBtn" aria-label="Back to Licenses" title="Back to Licenses">&larr;</button>'
+ '            <div class="headcol">'
+ '            <div class="top">'
+ '              <div class="idline">'
+ '                <!-- same placeholder square as the Home / Licenses product cell'
+ '                     (.lp-ic): solid light fill, no border. Desktop only — the'
+ '                     phone identity block was specced without it. -->'
+ '                <span class="hd-ic lp-ic" id="licHeadMark" aria-hidden="true"></span>'
+ '                <div class="titleblock">'
+ '                  <div class="titlekicker" data-page="sub" id="kickerSub">ThingsBoard &middot; Subscription</div>'
+ '                  <div class="titlekicker" data-page="perp" id="kickerPerp">ThingsBoard &middot; Perpetual</div>'
/* ⚠️ THE STATUS LEFT THIS ROW ON 2026-09-28 (by request) for the key/period grid
   below — see `#statusCol`. It sat beside an h1, which made it a decoration ON the
   title rather than a fact about the licence, and it was the one status in the product
   still wearing a chip while every table had moved to `statmark`. */
+ '                  <div class="titlerow">'
+ '                    <h1 class="planname" data-page="sub" id="planName">Prototype</h1>'
+ '                    <h1 class="planname" data-page="perp" id="planNamePerp">Perpetual License</h1>'
+ '                  </div>'
+ '                </div>'
+ '              </div>'
+ '              <div class="headactions">'
+ '                <button class="btn btn--secondary btn--md" id="couponBtn">Apply coupon</button>'
+ '                <button class="btn btn--primary btn--md" id="changePlanBtn" data-modal="change-plan" data-page="sub">Change plan</button>'
+ '                <button class="btn btn--secondary btn--md" id="renewBtn" data-page="sub" hidden>Renew subscription</button>'
+ '                <!-- a perpetual does not renew and has nothing to cancel, so Change'
+ '                     plan and the ⋮ menu are dropped. -->'
/* ⚠️⚠️ AND ITS `Manage` IS NO LONGER HERE EITHER (2026-09-30, by request): it moved
   down into the Plan block, where every other kind already carries it. The note that
   used to sit in the Plan block argued the opposite — "the header ALREADY says Manage,
   so a second one two inches below is the same word twice" — and that is still true;
   what changed is WHICH of the two goes. Keeping the one in the Plan block puts the
   control on the thing it edits and makes the header read the same on every kind: the
   plan is managed from the Plan block, whatever the licence is.
   ⚠️ A perpetual's zone 4 is now `Apply coupon` alone on the desktop, and on the phone
   the coupon hides into the overflow — which is why the liveness test that collapses
   this row had to learn about the ⋮ (see renderLicenseActions). */
+ '                <div class="menu" data-page="sub" id="headKebabMenu">'
/* ⚠️ `menu`, NOT `secondary`, AND `btn--icon` (2026-09-28, by request). This was the
   one kebab in the product outside the model: without `btn--icon` it took the LABEL
   padding — 13px either side against the 10px a menu trigger asks for — so the header's
   overflow button came out wider than every other kebab in the product. The variant
   exists for this control; naming it is the whole fix. */
+ '                  <button class="btn btn--menu btn--md btn--icon kebab-btn" id="headKebabBtn" aria-haspopup="true" aria-expanded="false" aria-label="More actions"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-dots-vertical"></use></svg></button>'
+ '                  <div class="pop" id="headKebabPop" role="menu" hidden>'
+ '                    <!-- mobile only: on a phone the header keeps just the primary'
+ '                         action, and Apply coupon moves in here (see the ≤600px'
+ '                         block in styles.css). It defers to the real button, so'
+ '                         there is one coupon controller, not two. -->'
+ '                    <button role="menuitem" class="mob-only" data-couponmenu>Apply coupon</button>'
+ '                    <button role="menuitem" class="mob-only" data-revealmenu>Reveal key</button>'
/* ⚠️ `data-installmenu` WENT WITH `#installBtn` (2026-09-29). This entry existed to
   press that button on a phone, where the icon row is hidden; with the button replaced
   by a sentence carrying its own link, the entry had nothing to defer to and `if(btn)`
   below would have made it silently do nothing — the same shape as the `Rename` item
   that did nothing for three days. The link is in the sentence on every breakpoint. */
+ '                    <button role="menuitem" data-editlabel>Edit label</button>'
+ '                    <button role="menuitem" data-cancel-active>Cancel subscription</button>'
+ '                  </div>'
+ '                </div>'
+ '              </div>'
+ '            </div>'
+ ''
+ '            <!-- row 2: the label — a muted description line under the title -->'
+ '            <!-- ⚠️ The scheduled-change line used to sit here, then moved into the'
+ '                 Plan block. It is gone from both: downgrades take effect'
+ '                 immediately, so nothing is pending to state. -->'
+ '            <div class="metarow">'
+ '              <span id="labelSlot">' + chip({ kind:'plain', ghost:true, label:'+ Add label', attrs:'id="addLabel"' }) + '</span>'
+ '              <!-- phone: status and label merged into one calm supporting line'
+ '                   ("Active · Factory A"). The chip and the pencil step aside there —'
+ '                   see renderSupportLine and the ≤600px block. -->'
+ '              <div class="supportline mob-only" id="supportMob"></div>'
+ '            </div>'
+ ''
+ ''
/* ⚠️⚠️ EVERYTHING BELOW THE DIVIDER IS ITS OWN BAND (2026-09-29, by request: "the
   tint only in the first block, white after the divider"). The head is one element
   with one background, so the second colour needs something to paint — this wrapper
   is that something, and it holds exactly what follows the hairline: the key grid and
   the conditional alert.
   ⚠️ IT BLEEDS THROUGH THE HEAD'S PADDING. `.head` insets its content by 22px, so a
   background applied here would stop 22px short of the modal's edges and read as a
   white card floating on the tint. Negative margins plus matching padding put the fill
   on the head's own edges while the content stays where it was. */
+ '            <div class="head-rest">'
+ '            <!-- row 3: license key (left) / subscription period (right) -->'
+ '            <div class="keygrid">'
+ '              <div class="keycol">'
/* ⚠️ `.keyfield` IS `display:contents` EVERYWHERE EXCEPT VARIANT A (2026-09-29). The
   `facts first` layout needs the cap and the key row inside ONE inset box with the
   sentence below it, and those two are siblings — CSS cannot draw a box around a
   subset of siblings. A wrapper that generates no box until a variant asks for one
   changes nothing in the other two layouts, and dissolves on the phone exactly as
   `.keycol` around it does (see the ≤600 block).
   ⚠️ TWO SPELLINGS OF THE CAP, one shown at a time — the same idiom the product cell
   uses for its desktop and phone identity lines. Variant A's field is 560px wide with
   the value and two buttons in it; `License key` above that reads as a heading for the
   whole zone rather than a label on the field. */
+ '              <div class="keyfield">'
+ '                <h3 class="minihead"><span class="mh-full">License key</span><span class="mh-short">Key</span></h3>'
+ '                <div class="keyline">'
+ '                  <span class="rowic mob-only" id="keyIc"></span>'
+ '                  <span class="mono" id="keyText" data-masked="••••••••••••3f2a" data-full="d41d 8cd9 8f00 b204 e980 3f2a">••••••••••••3f2a</span>'
+ '                  <button class="btn btn--secondary btn--md btn--icon" id="revealBtn" aria-pressed="false" aria-label="Reveal license key" title="Reveal">'
+ '                    <svg class="ic eye" aria-hidden="true"><use href="assets/icons.svg#ti-eye"></use></svg>'
+ '                    <svg class="ic eyeoff" aria-hidden="true"><use href="assets/icons.svg#ti-eye-off"></use></svg>'
+ '                  </button>'
+ '                  <button class="btn btn--secondary btn--md btn--icon tip" id="copyBtn" aria-label="Copy license key" data-tip="Copy">'
+ '                    <svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-copy"></use></svg>'
+ '                  </button>'
+ '                </div>'
+ '              </div><!-- /keyfield -->'
/* ⚠️⚠️ THE KEY'S HELP LINE IS GONE ENTIRELY (2026-09-30, by request — "remove the text
   'Enter this key in your installation to activate it. Installation instructions'").
   HISTORY, because this is the third removal in the same place and each one took a
   different thing with it. 09-29 turned an icon-only `#installBtn` into a sentence,
   because a reader who does not know what to do with a licence key cannot learn it from
   a picture of a page. Earlier on 09-30 the LONG paragraph went — the one that named
   ThingsBoard and TBMQ and explained that a deployment checks in with the key and so
   fills the Instances tab by itself. This removes what was left of it, the short line
   and the outbound link with it.
   ⚠️⚠️ SO THE PANEL NOW SAYS NOTHING AT ALL ABOUT WHAT THE KEY IS FOR. Not the
   activation step, not where the key is entered, not why Instances fills in by itself,
   and — new with this pass — no route to the install documentation from this surface at
   all. `EXT.install` still has readers elsewhere (the `awaiting_checkin` alert), so the
   link is not orphaned, but a healthy licence no longer offers one. The debt entry that
   tracks this is now about all three, and it is the entry to read before anyone adds a
   fourth version of this sentence.
   ⚠️ The refusal to move it into the `License created` banner still stands and is still
   the reason this was ever here: that banner shows once per licence forever, and the
   panel carried the sentence precisely BECAUSE it used to live there and vanished with
   it. Nothing about that changed; what changed is that the sentence is not wanted. */
+ '                <!-- ⚠️ The "License created" note that used to sit here has moved'
+ '                     ABOVE the licence title (see #licNewBanner at the top of the'
+ '                     panel). Under the key it was the second message a freshly'
+ '                     purchased licence could show at once, and it read as a property'
+ '                     of the key rather than of the licence. -->'
+ '              </div>'
/* ⚠️ VARIANT B's HAIRLINE, AND ONLY ON THE PHONE. On the desktop the rule is a
   `border-left` on the fact column itself; on a phone there is no column to put it
   beside, so the brief asks for a rule ABOVE the facts — and there is nothing to hang
   it on, because `.keycol` dissolves to `display:contents` at that width and the facts
   are loose `.rowvalue` flex items. One empty element with the facts' own `order` is
   the only thing that lands reliably between the key and them.
   ⚠️ `display:none` by default, not `hidden`: same reason as the two paragraphs above. */
+ '              <div class="zonerule" aria-hidden="true"></div>'
/* ⚠️ FIRST OF THE RIGHT-HAND COLUMNS, so the row reads key · status · when · which
   version — what it is, whether it works, and the two dates that qualify that. It is a
   `.keycol` like the others rather than something bolted to the key column: it is a
   fact of the same kind and gets the same caps heading. */
+ '              <div class="keycol right" id="statusCol">'
+ '                <h3 class="periodhead">Status</h3>'
+ '                <div class="period" id="statusSlot"></div>'
+ '              </div>'
/* ⚠️⚠️ `Period`, NOT `Subscription period` / `Software updates` / `Expiry` (2026-09-30,
   from a reference). THIS OVERRIDES A DECISION THIS FILE ARGUED FOR — that the label
   differs by kind, because "a grant's period IS its expiry, and there is none; a Free
   subscription is still a subscription". What makes the override safe rather than a loss
   is that the VALUE never stopped saying which kind of period it is: `Renews Oct 13`,
   `Until Aug 13 2027`, `Expires …`, `No expiry`. The word moved out of the label and it
   was already in the value; it is not said twice now instead of once.
   ⚠️ The label is visible in variant B alone — A and `current` hide it and let the value
   carry everything — so this is a change to one surface, not to four. */
+ '              <div class="keycol right" data-page="sub">'
+ '                <h3 class="periodhead">Period</h3>'
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
+ '                <h3 class="periodhead">Period<span id="updatesInfo"></span></h3>'
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
+ '              <!-- ⚠️ PRODUCT VERSION, NEXT TO THE UPDATES TERM, because the two are one'
+ '                   argument: the term is what entitles you to new versions, and this is'
+ '                   how far behind you actually are. Apart, each is a fact; together the'
+ '                   gap is a number, and a number argues better than a warning. Filled by'
+ '                   renderLicenseVersion(); hidden when no instance has reported one. -->'
+ '              <div class="keycol right" id="verCol" hidden>'
/* ⚠️ `Version`, NOT `Product version` (2026-09-30, by request). Renamed in the MARKUP,
   so every variant says it — the caps label in B changes with the inline one in A and
   `current`. Two names for one fact, chosen by which layout you happen to be looking at,
   is the drift this panel spends most of its comments refusing. */
+ '                <h3 class="periodhead">Version</h3>'
+ '                <div class="period" id="licVersion"></div>'
+ '                <h3 class="rowlabel mob-only">Version</h3>'
+ '                <div class="rowvalue mob-only" id="licVersionMob"></div>'
+ '              </div>'
/* ⚠️ `#ncCol` IS GONE (2026-09-30, by request). Variant B carried a `Next charge` fact
   beside the key for one day; the card under the header already answers that question,
   and the fact standing in both places meant the same number was on screen twice. The
   CARD is untouched — it is the one that stays. */
+ '            </div>'
+ ''
+ '            <!-- Conditional alert. Rendered ONLY when the subscription needs attention'
+ '                 (payment failed, card expiring, usage over limit). Healthy state shows nothing.'
+ '                 Demo hooks: window.showSubAlert(\'msg…\') / window.clearSubAlert() -->'
+ '            <div class="alert" id="subAlert" role="alert" hidden>'
+ '              <svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-alert-circle-filled"></use></svg>'
+ '              <span class="atxt"></span>'
+ '            </div>'
+ '            </div><!-- /head-rest -->'
+ '            </div><!-- /headcol -->'
+ '           </div><!-- /headgrid -->'
+ '          </div>'
+ ''
+ '          <!-- Plan — always visible, above the tab bar. Add-ons are the block'
+ '               below it now, so this heading says only what it is. -->'
+ '          <div class="section planblock">'
+ '              <div class="sh"><h3>Plan</h3><span class="spacer"></span>'
/* ⚠️⚠️ ONE `Manage` FOR EVERY KIND (2026-09-30, by request), so no `data-page`. It was
   `data-page="sub"` and a perpetual's Manage lived up in the header instead; the block
   that owns the plan now owns the control that changes it, whatever the licence is.
   ⚠️ THE GRANT IS HIDDEN BY ID, NOT BY KIND. A grant is perpetual-LIKE, so it used to
   be caught by the same `data-page` pass and then taken back out by `renderGrantChrome`;
   with the attribute gone it needs its own handle, and a grant buys no capacity at all.
   Hence `#planManageBtn` and one line in `renderGrantChrome`.
   ⚠️ `secondary`, the shape it already had here — a perpetual's was `primary` because it
   was the header's only action. In this block it sits beside a heading, not in zone 4. */
+ '                <button class="btn btn--secondary btn--md" id="planManageBtn" data-modal="add-ons">Manage</button>'
+ '                <!-- inferred: capacity is bought once, so this opens a one-time'
+ '                     purchase flow — not the recurring Manage add-ons flow, which'
+ '                     computes proration and a new monthly total. -->'
+ '              </div>'
+ ''
+ '              <!-- ⚠️ THE SCHEDULED-CHANGE BANNER USED TO BE HERE (#schedLine). It'
+ '                   stated that a lowering change would take effect on a future date'
+ '                   and carried the action that cancelled it. Downgrades recalculate'
+ '                   immediately now, so there is no pending state to announce. -->'
+ ''
+ '              <table class="plantable gridtbl">'
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
/* ⚠️ INSTANCES FIRST. The tab order is Instances · Invoices · Activity — what is
   RUNNING on this licence before what it cost. The panels below are in the same order:
   `aria-controls` would make any order work, but a tablist whose panels are sourced in
   a different sequence is a trap for the next person reading the file. */
/* ⚠️ ICONS ON THE TABS (2026-09-29, by request), and they are `aria-hidden` beside a
   text label — the rule for an icon that sits next to the word it illustrates, or the
   reader hears "Instances Instances".
   ⚠️ THE SAME THREE SYMBOLS THE TOP BAR USES for the same three destinations, read out
   of `NAV_ITEMS` rather than chosen again here: these tabs slice one licence the way
   the nav slices the account, and a tab meaning Invoices while wearing a different
   glyph from the Invoices nav item would be two vocabularies for one product. Reading
   the list also means a glyph changed in the nav cannot leave these behind. */
+ '            <button class="tab" role="tab" id="tab-prod" aria-controls="panel-prod" aria-selected="true" tabindex="0">' + navIcon('instances', { size:20 }) + 'Instances</button>'
+ '            <button class="tab" role="tab" id="tab-invoices" aria-controls="panel-invoices" aria-selected="false" tabindex="-1">' + navIcon('invoices', { size:20 }) + 'Invoices</button>'
+ '            <button class="tab" role="tab" id="tab-logs" aria-controls="panel-audit" aria-selected="false" tabindex="-1">' + navIcon('activity', { size:20 }) + 'Activity</button>'
+ '          </div>'
+ ''
+ '          <!-- Instances -->'
+ '          <div class="panel" id="panel-prod" role="tabpanel" aria-labelledby="tab-prod">'
+ '            <div class="section">'
+ '              <!-- type switcher (same segmented style as the Licenses "Type" filter) + toolbar -->'
+ '              <div class="listbar insttoolbar">'
/* ⚠️ The Instances search was REMOVED, not wired. It would have filtered two
   hardcoded rows that are identical for every licence — theatre, and a control that
   survives to a demo either works or is not there. It comes back with real instance
   data; see NOTES. */
/* ⚠️ THE CHIPS CARRY THEIR COUNTS (2026-09-29, by request), the same `.chipcount` the
   Licenses type chips wear. Two chips that only say `Production` / `Development` make
   the reader press one to find out whether there is anything behind it — and on most
   licences one of the two is empty. The number answers before the press.
   ⚠️ NOT a facet count: these two are the whole set and they do not interact, so each
   simply states how many instances of its kind this licence has. Filled by
   `renderInstances`, which is the one place that already counts both. */
+ '                <div class="lic-typeseg" role="group" aria-label="Instance type">'
+ '                  ' + chip({ kind:'type', label:'Production', on:true, pressed:true,
                                 attrs:'data-insttype="prod"', count:'', countAttrs:'data-instcount="prod"' })
+ '                  ' + chip({ kind:'type', label:'Development', pressed:false,
                                 attrs:'data-insttype="dev"', count:'', countAttrs:'data-instcount="dev"' })
+ '                </div>'
+ '                <span class="spacer"></span>'
+ '                <button class="btn btn--secondary btn--md btn--icon" data-refresh aria-label="Refresh" title="Refresh"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-refresh"></use></svg></button>'
+ '              </div>'
+ ''
+ '              <!-- ⚠️ RENDERED, not written. This used to be two hardcoded rows —'
+ '                   the same two ids, the same blank labels, the same dates, for every'
+ '                   licence in the product. Now both tables are filled by'
+ '                   renderInstances() from the licence\'s own `instances`. -->'
+ '              <p class="inst-note" id="instNote"></p>'
+ '              <div class="insttype" data-insttype="prod">'
/* ⚠️⚠️ THE SCROLLER THE STYLESHEET ALREADY EXPECTED (2026-10-02). This table was a bare
   `<table>` inside `.insttype`, and `.canvas` around it is `overflow:hidden` — so at 601,
   700 and 760 the right-hand columns were simply cut off with nothing to scroll them.
   Measured: 223px of the table past its container at 601. The frame rules have named
   `.insttype > .tablescroll` since they were written; the markup never gave them one.
   ⚠️ ONLY THE TABLE IS WRAPPED. The pager is a sibling inside `.insttype` and must stay
   outside the scroller, or it would slide sideways with the columns.
   ⚠️ The panel's `thead` is NOT sticky (no `.stickyhead` here), so this can be a plain
   rule rather than the script-toggled `is-scrollable` the list pages need — that class
   exists because `overflow-x:auto` computes `overflow-y:auto` and breaks a sticky head. */
+ '                <div class="tablescroll">'
+ '                <table class="insttable gridtbl">'
+ '                  <thead>'
+ '                    <tr>'
+ '                      <th>Instance ID</th>'
+ '                      <th>Label</th>'
+ '                      <th>Status</th>'
+ '                      <th>Last activity time</th>'
+ '                      <th class="sortable" aria-sort="descending" tabindex="0">Created time <span class="arrow" aria-hidden="true"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-down"></use></svg></span></th>'
+ '                      <th aria-label="Actions"></th>'
+ '                    </tr>'
+ '                  </thead>'
+ '                  <tbody id="instBodyProd"></tbody>'
+ '                </table>'
+ '                </div>'
+ pagerHTML('instPagerProd')
+ '              </div>'
+ ''
+ '              <div class="insttype" data-insttype="dev" hidden>'
+ '                <div class="tablescroll">'
+ '                <table class="insttable gridtbl" id="instTableDev">'
+ '                  <thead>'
+ '                    <tr>'
+ '                      <th>Instance ID</th><th>Label</th><th>Status</th>'
+ '                      <th>Last activity time</th><th>Created time</th><th aria-label="Actions"></th>'
+ '                    </tr>'
+ '                  </thead>'
+ '                  <tbody id="instBodyDev"></tbody>'
+ '                </table>'
+ '                </div>'
/* ⚠️ THE DEV TABLE HAD NO PAGER AT ALL. Prod had one (markup only, and inert); dev had
   nothing, so the two halves of the same tab disagreed about whether a long list was
   possible. Same builder as every other pager here now. */
+ pagerHTML('instPagerDev')
+ '              </div>'
+ ''
+ '              <!-- Community Grant: nothing has connected with the new key yet, so the'
+ '                   whole tab is this one line (toolbar and tables hidden) -->'
+ '              <div class="emptybox" id="grantInstEmpty" hidden>An instance appears here after it connects using this license key.</div>'
+ '            </div>'
+ '          </div>'
+ ''
+ '          <!-- Invoices -->'
+ '          <div class="panel" id="panel-invoices" role="tabpanel" aria-labelledby="tab-invoices" hidden>'
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
/* ⚠️ The card is `--c-blue-50`, so the button on it is WHITE — the `surface` axis, taken
   by the card declaring `.on-tint` rather than by this caller naming a colour. */
+ '                    <a class="btn btn--secondary btn--md btn--icon tip" id="ncEditPay" href="billing.html" aria-label="Payment and Billing" data-tip="Payment &amp; Billing">'
+ '                      <svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-pencil"></use></svg>'
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
+ '              <table class="invtable gridtbl" style="margin-top:18px">'
+ '                <thead>'
+ '                  <tr><th>Invoice #</th><th>Date</th><th class="num inv-amt">Amount</th><th>Status</th><th aria-label="Invoice actions"></th></tr>'
+ '                </thead>'
+ '                <tbody id="licInvBody"></tbody>'
+ '              </table>'
/* ⚠️ THROUGH THE SHARED BUILDER (2026-09-28). This was fifteen lines of hand-written
   pager with its own `#licInvRange`, and it showed: on a licence with no charges it
   printed `Items per page 10 · 0 of 0` with four arrows, directly under an empty state
   saying there is nothing here — which is exactly what the 09-28 rule ("nothing to
   count, nothing to show") was written to stop, on the one pager that was not going
   through the function that enforces it. */
+ pagerHTML('licInvPager')
+ '              </div>'
+ ''
+ '              <!-- inferred: a grant is free, so it has no invoices at all -->'
+ '              <div class="emptybox" id="grantInvEmpty" hidden>No invoices &mdash; the Community Grant is free.</div>'
+ '            </div>'
+ '          </div>'
+ ''
+ '          <!-- Logs -->'
+ '          <div class="panel" id="panel-audit" role="tabpanel" aria-labelledby="tab-logs" hidden>'
+ '            <div class="section">'
+ '              <div class="listbar insttoolbar" data-feed="lic">'
+ '                <div class="searchbox"><svg class="ic searchglyph" aria-hidden="true"><use href="assets/icons.svg#ti-search"></use></svg><input type="text" placeholder="Search activity" aria-label="Search activity"></div>'
+ '                <div class="dropwrap perctl" id="licFeedPeriod">'
+ '                  <button class="btn btn--secondary btn--md perbtn" aria-haspopup="true" aria-expanded="false" aria-label="Period"><b class="perlabel">All time</b> <svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-down"></use></svg></button>'
+ '                  <div class="dropmenu permenu" hidden>'
+ '                    <button type="button" role="menuitemradio" data-period="all">All time</button>'
+ '                    <button type="button" role="menuitemradio" data-period="24h">Last 24 hours</button>'
+ '                    <button type="button" role="menuitemradio" data-period="7d">Last 7 days</button>'
+ '                    <button type="button" role="menuitemradio" data-period="30d">Last 30 days</button>'
+ '                    <button type="button" role="menuitemradio" data-period="custom">Custom range&hellip;</button>'
+ '                    <div class="percustom">'
+ '                      <div class="perrow">'
+ '                        <input type="date" class="perfrom" aria-label="From date">'
+ '                        <span class="permid">to</span>'
+ '                        <input type="date" class="perto" aria-label="To date">'
+ '                      </div>'
+ '                      <button class="btn btn--secondary btn--md perapply">Apply</button>'
+ '                    </div>'
+ '                  </div>'
+ '                </div>'
+ '                <span class="spacer"></span>'
+ '                <button class="btn btn--secondary btn--md btn--icon" data-refresh aria-label="Refresh" title="Refresh"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-refresh"></use></svg></button>'
+ '              </div>'
+ '              <!-- this licence\'s events only — same feed cards as the Activity page -->'
+ '              <div class="feed" id="licFeed"></div>'
/* ⚠️ PAGED, like the Activity page (2026-09-24). Derived check-ins make this tab long —
   a blocked licence produced 147 entries — and inside a modal that is an endless scroll
   with no end in sight and no way to jump. Same shared controller as every other pager. */
+ pagerHTML('licFeedPager')
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
var PENCIL = '<svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-pencil"></use></svg>';
function labelSlot(){ return $('#labelSlot'); }

/* the resting state: the label with a pencil beside it, or the quiet add affordance */
function renderLabelSlot(lic){
  var slot = labelSlot(); if(!slot) return;
  if(lic && lic.label){
    /* ⚠️ `btn--sm`, AND NO LOCAL GEOMETRY (2026-09-28, by request). It was `btn--md`
       with `width/height:24px` and a transparent border written on top — three
       declarations that took a component apart and rebuilt it smaller, which is exactly
       what the four axes exist to stop. The size axis already has a 26px step, and the
       label line is a 14px row: `sm` is the answer the model gives. */
    slot.innerHTML = '<span class="labeltext">' + esc(lic.label) + '</span>'
      /* ⚠️ `ghost`, NOT `secondary` (2026-10-01, by request: "no background by default").
         It sits in a line of text beside the label, not in a control row — a resting fill
         there draws a box around a pencil in the middle of a sentence. Ghost keeps the
         hover and pressed washes, so it still answers the pointer; only the rest goes. */
      + '<button class="btn btn--ghost btn--sm btn--icon labeledit" data-editlabel aria-label="Edit label" title="Edit label">' + PENCIL + '</button>';
  } else {
    slot.innerHTML = chip({ kind:'plain', ghost:true, label:'+ Add label', attrs:'data-editlabel' });
  }
}
/* the editing state */
function editLabel(){
  var slot = labelSlot(), lic = activeLicense;
  if(!slot || !lic) return;
  /* ⚠️ 40 CHARACTERS, AND THE COUNTER IS VISIBLE BEFORE YOU HIT IT. A label is a NAME —
     "Factory A", "On-prem HQ" — and the demo has four that are sentences, up to 61
     characters ("Production — Central Europe manufacturing cluster, building 4"). A cap
     with no counter just stops accepting keystrokes and reads as a broken field, so the
     count is on screen from the first character.
     ⚠️ THIS IS A DATA RULE, so it holds in both table variants and everywhere else a
     label is typed — this editor is the only place one can be. The four long seeded
     labels are grandfathered: `maxlength` does not truncate an existing value, it only
     refuses new input, so nothing in the demo loses text. What handles them on screen is
     the ellipsis in variant B's cell, which is a safety net and not the rule. */
  slot.innerHTML = '<span class="labeledit-row">'
    + '<input class="labelinput" id="labelInput" placeholder="Label…" aria-label="Label"'
    +   ' maxlength="' + LABEL_MAX + '" value="' + esc(lic.label || '') + '">'
    + '<span class="labelcount" id="labelCount" aria-live="polite"></span>'
    + '<button class="btn btn--secondary btn--md labelsave" id="labelSave">Save</button></span>';
  var inp = $('#labelInput', slot), cnt = $('#labelCount', slot);
  function tick(){
    cnt.textContent = inp.value.length + '/' + LABEL_MAX;
    /* over-length can only happen to a value that was already stored; the counter says
       so rather than pretending the field is within its limit */
    cnt.classList.toggle('over', inp.value.length > LABEL_MAX);
  }
  tick();
  inp.addEventListener('input', tick);
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
  /* ⚠️ Renamed with the card (2026-09-24). The product is named by the eyebrow above
     this title, so repeating it in the title said ThingsBoard twice on one screen. */
  if(key === 'perp') lic.name = 'Perpetual License';
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
  /* ⚠️ A LICENCE WITH NO END DATE — a grant or a Free subscription (see `neverExpires`
     in components.js, which the tables read too). Before this branch covered both, the
     Free licence fell through to the dated wording below with `lic.event` empty, and the
     row rendered the bare word `Renews` with nothing after it: a label promising a date
     that never came. Caught while giving the tables the same answer — the two surfaces
     were about to say "No expiry" and "Renews" about the same licence.
     ⚠️ The LABEL still differs, and should. A grant's period IS its expiry, and there is
     none; a Free subscription is still a subscription, so it keeps "Subscription period"
     and answers it. The VALUE is one sentence for both, because it is one fact.
     ⚠️ No `.muted` here either. Its siblings on this row ("Renews Sep 13, 2026",
     "Updates until …") are --ink from `.rowvalue`; --faint made the grant's line
     the only lighter one. Same fact, same tone. */
  if(neverExpires(lic)){
    /* ⚠️ The label is never left as it was: on the phone this row is label + value, and
       the early return used to skip the assignment below — so a Free licence rendered a
       value with no label at all. A grant's period IS its expiry; a Free subscription is
       still a subscription, and says on the phone what it says on the desktop. */
    lab.textContent = lic.grant ? 'Expiry' : 'Subscription period';
    val.innerHTML = ic + '<span class="rowtxt">No expiry</span>';
    return;
  }
  var word = perp
    ? (lic.status === 'updates_expiring' ? 'Updates expire' : 'Updates until')
    : (lic.status === 'canceled' ? 'Active until' : 'Renews');
  lab.textContent = word;
  val.innerHTML = ic + '<span class="rowtxt">' + word + ' ' + fmtDate(lic.event) + '</span>';
}
/* ⚠️⚠️ `statusMark`, THE TABLES' BUILDER (2026-09-28, by request). This surface kept
   its own chip vocabulary — `.chip.status`, `.chip.status.off`, `.chip.status.blocked`
   — while every list in the product moved to the glyph-and-word mark, so the row you
   clicked and the panel that opened disagreed about what a status looks like. One
   builder answers it now, and the Blocked tooltip comes along for free.
   ⚠️ WHAT THE CHIP SAID AND THE MARK DOES NOT: a cancelled licence carried its end date
   in the chip (`Canceled · active until Sep 05`). That fact is not lost — the period
   column beside this one already prints `Active until Sep 05, 2026`, which is where a
   date belongs. The chip was saying it twice, two columns apart. */
/* ⚠️ BLOCKED IS A STATUS, and it is the one exception to "attention states live in the
   banner, not the chip". The rule holds for payment failed and expiring updates: the
   licence still works, and the banner says what to do before it stops. ⚠️ `awaiting
   check-in` used to be named here too and is no longer, because it no longer HAS a
   banner (2026-09-30) — it is a status the chip states and nothing interrupts about. Over the instance limit is different — the banner says the licence IS blocked
   right now, and `Active` beside that sentence contradicts it outright. This cell
   answers "is this licence alive"; there, the answer is no. `statusMark` makes exactly
   that distinction, which is why it can be the one builder for both surfaces. */
function statusChipHTML(lic){ return statusMark(lic); }
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
/* ⚠️ A REAL PAGER (2026-09-28, by request), the same controller and the same default
   size as this panel's two instance tables three tabs away. It was `syncPagerUnpaged`,
   which made this the one table in the panel that could not page while its neighbours
   could. ⚠️ State on the module, not inside the function: the panel re-renders on every
   change and a local would reset the reader to page one each time. */
var licInvPage = { page:1, size:10, total:0 };
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
    ? pageSlice(list, licInvPage).map(function(v){ return invRow(v, opts); }).join('')
    : '<tr><td colspan="' + invCols(opts) + '" class="emptybox">' + msg + '</td></tr>';
  if(!list.length) licInvPage.total = 0;
  /* the footer still removes itself when there is nothing to count, and still shows the
     count alone while there is only one page — that part never depended on paging */
  syncPager('#licInvPager', licInvPage);
  /* ⚠️ Wired here rather than at mount: the panel builds its markup fresh every time it
     opens, so the node this binds to does not exist until then. `wirePager` guards
     against a second listener on the same element. */
  wirePager('#licInvPager', licInvPage, function(){ renderLicInvoices(lic); });
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
  /* ⚠️⚠️ THE BLOCK STAYS ON SCREEN WHEN IT IS EMPTY — BUT ONLY SIDE BY SIDE (2026-10-01,
     by request: "a small empty state, so the block reads as a block"). In the stacked
     arrangement an empty Add-ons block is a heading with nothing under it in the middle of
     a column, and hiding it is right — that is what it has always done. In the side
     arrangement the block IS a column: hide it and the grid's second track collapses, the
     table stretches to the full width, and the licence looks like it has a different
     layout rather than no add-ons. The empty line holds the column open and says why.
     ⚠️⚠️ THE BLOCK NEVER HIDES NOW (2026-10-01): the `Plan block` axis retired with
     `Side by side` as the answer, and in that arrangement the block IS a column — hide it
     and the grid's second track collapses, the table stretches full width, and the licence
     looks like it has a different layout rather than no add-ons. The empty line holds the
     column open and says why. (Stacked hid it, and that was right for stacked.) */
  chips.innerHTML = active.length
    ? active.map(function(n){ return '<span class="fchip">'+FCHECK+n+'</span>'; }).join('')
    : '<span class="fchip-none">No add-ons on this license.</span>';
}
/* One helper for every banner action, because the phone and the desktop want
   different words for the same button. The band on the phone is one row —
   message left, action right, vertically centred — so its label has to be a short
   verb ("Update"); the desktop has the width for the full phrase and must not
   change. Both are emitted and CSS picks, which also keeps the accessible name
   right: `display:none` drops a label out of the a11y tree, so the button is
   named "Update" on the phone and "Update payment method" on the desktop.
   ⚠️ `mobOnly` / `.mobact` IS GONE (2026-09-30). It marked an action the desktop never
   had, and its one user was the awaiting-check-in banner, which carried an in-sentence
   link on the desktop and a band button on the phone. That banner now has ONE action on
   both breakpoints like every other, so nothing passed the flag any more — and a
   parameter no call site uses is a branch that looks alive in a grep and is not. */
/* ⚠️⚠️ `secondary`, NOT `text` (2026-10-01, by request). The banner's ground is white in
   the modal, and a text button on white is a word with nothing around it — the one control
   the banner offers was the least visible thing in it. `secondary` is the fill a button
   takes on a light ground; where the banner is ink (the full page's `tone-black`) the
   surface rules repaint it, which is what that axis is for.
   ⚠️ The class `aact` stays: the phone block and the alert's own row rules key on it, and
   it says WHERE the button is, not what it looks like. */
function alertAction(short, long, attrs){
  return '<button class="btn btn--secondary btn--md aact" ' + attrs + '>'
    + '<span class="aact-long">' + long + '</span>'
    + '<span class="aact-short">' + short + '</span>'
    + '</button>';
}
/* The running version against the latest released, on the licence itself — the same two
   facts the Licenses table shows, in the same order and with the same rule: the licence
   reports the LOWEST of its instances, and says so when they disagree.
   ⚠️⚠️ ALWAYS PRESENT, AND A DASH WHEN NOTHING HAS REPORTED (2026-09-30, by request).
   This used to hide the whole column on the argument that "an empty row under a caps
   heading reads as a bug" — but hiding it means the header has three facts on one
   licence and two on the next, so the reader cannot learn where a fact lives. An em
   dash is the same answer the Licenses table has always given in this column
   (`versionCell`), and it says something the absence did not: there IS a version fact,
   and nothing has reported one yet.
   ⚠️ `.muted`, the table's own class for it, so the two surfaces say "no value" the
   same way rather than inventing a second grey. */
function renderLicenseVersion(lic){
  var col = $('#verCol'); if(!col) return;
  var v = licenseVersion(lic);
  col.hidden = false;
  if(v == null){
    var dash = '<span class="muted">&mdash;</span>';
    var e0 = $('#licVersion'); if(e0) e0.innerHTML = dash;
    var m0 = $('#licVersionMob'); if(m0) m0.innerHTML = dash;
    return;
  }
  var behind = cmpVersion(v, LATEST_VERSION) < 0;
  /* ⚠️ THE SAME MARK AS THE TABLE (2026-09-25). This line printed a bare number and a
     `latest 3.9.4` beside it and carried no mark at all — so the one surface a reader
     opens to answer "am I current" was the one that made them compare two numbers
     themselves. `versionMark` is shared, so the answer, the colour and the tooltip are
     the same here as in the list. */
  /* ⚠️ Wrapped in `.ver-run` like the table cell, not just concatenated: that class is
     what puts the 6px between the mark and the number and aligns them on one line.
     Without it the icon sat flush against the digits — measured on screen. */
  var txt = '<span class="ver-run">' + versionMark(behind) + esc(v) + '</span>'
    + (versionMixed(lic) ? ' <span class="ver-mixed">across ' + instRunning(lic) + ' instances</span>' : '');
  var el = $('#licVersion'); if(el) el.innerHTML = txt;
  var mob = $('#licVersionMob'); if(mob) mob.innerHTML = txt;
}
/* ⚠️⚠️ THE PANEL'S OWN COPY OF THE TONE MAPPING (2026-09-30, by request). The three
   tones are Home's — red already broken, black will break on a known date, quiet
   nothing is broken — and this surface uses two of them: it has no quiet condition,
   because a licence with nothing wrong shows no banner at all here.
     red   — over instance limit · payment failed · updates ended
     black — updates end in N days · subscription canceled
   ⚠️ `over_limit` IS RED BECAUSE `blocked` IS RED ON HOME. Same condition, two scopes;
   the brief names them as one, so they must not read as two kinds of trouble. The other
   table is `BANNER_TONE` in components.js — a condition that changes tone changes in
   both, and there is no shared key to make that automatic because these branches are
   derived (a date comparison) rather than stored states.
   ⚠️ `awaiting_checkin` IS ABSENT ON PURPOSE and is not a missing entry: that branch was
   deleted earlier today and nothing renders a banner for it. Checked by grep before
   writing this table — the status still exists, the banner does not. */
function alertTone(kind){
  return (kind === 'over_limit' || kind === 'payment_failed' || kind === 'updates_expired')
    ? 'red' : 'black';
}
/* ⚠️ The class carries BOTH tones explicitly, so no branch renders on the base `.alert`
   with no ground at all — a forgotten tone would be a banner with layout and no colour,
   which reads as a rendering failure rather than as a missing case.
   ⚠️⚠️ WHAT the tone is made of is `toneClass`'s question, not this one's (components.js,
   2026-09-30). This function still decides WHICH tone; the ⚙'s `Alert tone` lever decides
   whether the ground or the mark states it, and it states it the same way on both
   surfaces — a licence panel opened over Home must not disagree with the banner above it. */
function setAlertTone(al, kind){ al.className = 'alert ' + toneClass(alertTone(kind)); }
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
     Order of seriousness: blocked → payment failed → updates expiring → cancelled.
     ⚠️ `awaiting check-in` used to close this list and is no longer a banner at all
     (2026-09-30, by request) — see the note where its branch was. */
  function alsoClause(skip){
    var also = [];
    if(skip !== 'payment_failed' && lic.status === 'payment_failed') also.push('a failed payment');
    if(skip !== 'updates_expiring' && lic.status === 'updates_expiring')
      also.push('software updates expiring ' + fmtDate(lic.event));
    if(skip !== 'canceled' && lic.status === 'canceled') also.push('a pending cancellation');
    return also.length ? ' This license also has ' + also.join(' and ') + '.' : '';
  }
  if(instOverLimit(lic)){
    /* ⚠️ THE MIGRATION SENTENCE LIVES HERE, and it did not before. The brief moved it
       off Home on the understanding that it was already on this banner — it was not,
       only above the Instances list. Home now says what is wrong and what fixes it;
       this is the surface that explains HOW a licence ends up over its limit, next to
       the instances you would act on. One constant, shared with `.inst-hint`. */
    /* ⚠️⚠️ THE BLOCKING CLAUSE IS GONE FROM THIS BANNER (2026-09-30, by request). It
       read "— this license is blocked until the count is back within its limit", and the
       note above still applies to it: that wording was PROVISIONAL, said verbally and
       never confirmed. What is left is the count and what to do about it.
       ⚠️ The word `Blocked` has NOT left the product: the status mark on this licence
       still says it, and `ATTN_TIP.blocked` still carries the full sentence as the
       table's tooltip. So the claim is still made — it is no longer made twice, and the
       banner is now the one that explains rather than the one that asserts. */
    t.innerHTML = '<span class="amsg"><b>Over the production instance limit.</b> '
      /* ⚠️ `allowed`, NOT `allowed on this plan` (2026-09-30, by request). The plan is
         named twice above this banner already — the title carries it and the Plan block
         repeats it with its table — so the qualifier was the third mention in one
         screen and the sentence is about the two numbers. */
      + instRunning(lic) + ' running, ' + instAllowed(lic) + ' allowed. '
      + DETACH_HINT
      + alsoClause('over_limit') + '</span>';
    setAlertTone(al, 'over_limit');
      /* ⚠️ NO ACTION ON THIS ONE (2026-09-24). It carried `Manage instances`, and the
         note here argued for it — but that argument was about which of three Manages it
         was, not about whether the banner needed one. You are already ON this licence:
         the Instances tab is on the same screen, with the rows and their menus. A button
         that opens a wizard to raise the limit competes with the thing the reader came
         to do, and the header's own `Manage` is still there for the other way out.
         The banner states the block and the way out of it in words; the surface under it
         is the way. */
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
      /* ⚠️⚠️ `Contact support` IS GONE (2026-09-30, by request), and with it the only
         banner in the panel that offered two routes. It was argued as "the third
         contextual support route — a failed payment is the other place people get stuck
         with nothing left to try", and that argument loses to the shape every other
         branch now has: one banner, one action, at the right edge. A second link beside
         the primary also competed with it at exactly the moment the reader has one
         obvious thing to do. Support is still reachable from the footer and the account
         menu; this was a shortcut, not the route. */
      + alertAction('Update', 'Update payment method', 'data-paycard');
    setAlertTone(al, 'payment_failed');
    al.hidden=false;
  }
  /* ⚠️ EXPIRED IS ITS OWN BRANCH, above "expiring", and it is DERIVED from the date
     rather than read from a status — the same rule as the instance limit above. A
     perpetual whose term has run out still says `active`, because the licence really is
     active: what ended is the updates term, and only the date knows that.
     The sentence is UPDATES_LOSS, the same one the Home banner and the list's alert
     tooltip carry, so the three surfaces cannot drift into three different promises.
     ⚠️ Not dismissible, and nothing here offers to dismiss it: Home is a notification
     surface and this is the record of state. */
  else if(hasUpdatesTerm(lic) && daysUntil(lic.event) < 0){
    t.innerHTML = '<span class="amsg"><b>Software updates ended on ' + fmtDate(lic.event)
      + '.</b> ' + UPDATES_LOSS + alsoClause('updates_expired') + '</span>'
      + alertAction('Renew updates', 'Renew software updates', 'data-renewupdates="' + esc(lic.id) + '"');
    setAlertTone(al, 'updates_expired');
    al.hidden=false;
  }
  else if(st==='updates_expiring'){
    /* ⚠️ The banner told you to renew and carried NO control that did it — its only
       button opened the documentation in a new tab. It now opens the same purchase
       modal the menu item opens, so the instruction and the means are in one place.
       ⚠️ The same UPDATES_LOSS sentence as the expired branch: what is at stake does
       not change with the date, only when it starts. */
    /* ⚠️ THE COUNT LEADS AND THE DATE QUALIFIES IT (2026-09-30, by request). It was
       "end on Oct 12, 2026, in 12 days" — a date first, with the number of days as an
       afterthought behind a second comma. What makes this banner urgent is the twelve
       days; the date is what you check afterwards.
       ⚠️⚠️ THE BRACKETS ARE GONE AND THE DATE IS A QUIET TRAILER (2026-10-01, by request:
       "drop the parentheses, put the date after a middot, in grey"). Brackets are a
       whisper inside a sentence — they say "this is an aside" with punctuation the reader
       has to parse; a middot and a grey step say the same thing with rank, which is what
       this product already uses everywhere a secondary fact follows a primary one
       (`ThingsBoard · Subscription`, `Blocked · Over instance limit`).
       ⚠️ THE DATE LEAVES THE `<b>`, because that is what makes it quiet: the bold lead is
       the tone-coloured headline (see `.alert .atxt b`), and a date inside it was being
       painted the fault colour as loudly as the count. */
    t.innerHTML = '<span class="amsg"><b>Software updates end in ' + daysUntil(lic.event)
      + ' days<span class="amsg-when"> \u00b7 ' + fmtDate(lic.event) + '</span></b> '
      + UPDATES_LOSS + '</span>'
      + alertAction('Renew updates', 'Renew software updates', 'data-renewupdates="' + esc(lic.id) + '"');
    setAlertTone(al, 'updates_expiring');
    al.hidden=false;
  }
  /* A cancelled subscription's banner states a fact and has no action of its own:
     the one thing to do about it is `Renew subscription`, which is already the
     full-width primary in zone 4. Two buttons for one intent is noise. */
  else if(st==='canceled'){
    t.innerHTML = '<span class="amsg"><b>Subscription canceled.</b> It stays active until '
      + fmtDate(lic.event) + '. After that its instances will stop.</span>';
    setAlertTone(al, 'canceled');
    al.hidden=false;
  }
  // the key exists but nothing has used it yet — the one thing left to do is activate
  /* ⚠️⚠️ THE `awaiting_checkin` BRANCH IS GONE (2026-09-30, by request), not hidden.
     It said "No instance has checked in yet" and pointed at the installation guide —
     which is not a fault, it is the ordinary first minute of a licence, and the panel
     already says the same thing twice in calmer places: the sentence under the key
     ("Enter this key in your installation to activate it", with the same link) and the
     Instances tab's own empty state. A banner is for something being wrong.
     ⚠️ DELETED RATHER THAN COMMENTED OUT, and its row in the states strip below went
     with it in the same pass — a branch nothing can reach is the thing that looks alive
     in a grep and is not. A licence in that state now falls through to `No banner`,
     which is where the strip counts it.
     ⚠️ Nothing else changes for those licences: the status mark still says what they
     are, and `awaiting_checkin` is still a status the rest of the product reads. */
  else al.hidden = true;
}
/* ⚠️ `renderScheduled()`, `SCHEDSVG` and the `Cancel this change` handler ARE GONE.
   They rendered a banner in the Plan block stating that a lowering change would take
   effect on a future date, and the only action that could call it off. Downgrades now
   recalculate immediately (see the note in shared.js where scheduleChange used to be),
   so there is nothing pending to state and nothing to cancel — a change that has
   already happened is undone by making another one, not by a link.
   The `#schedLine` node went with them; every other banner on this surface stays. */

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
     action at all must drop the whole row, rule included.
     ⚠️⚠️ THE ⋮ COUNTS AS AN ACTION NOW (2026-09-30), and it has to since the perpetual
     `Manage` moved to the Plan block. The test used to exclude `headKebabBtn` by name,
     which was right while every kind had a primary beside it: the overflow alone was
     not worth a row. On the phone a perpetual's only remaining zone-4 child is the
     coupon button, which that breakpoint hides into the overflow — so the row would
     have collapsed and taken the ⋮ with it, and the ⋮ is the perpetual's ONLY home at
     that width for Reveal key, Installation instructions and the label pencil (see the
     note above). Collapsing on "no primary" would have deleted the menu to tidy away
     the row it lives in.
     ⚠️ AND IT GIVES THE GRANT ITS ⋮ BACK ON THE PHONE, which it had been losing the
     same way and for longer — `renderGrantChrome` hides the coupon, so the row went
     empty and the menu went with it. Same defect, found by making the perpetual walk
     into it; fixed once, for both.
     ⚠️ NOT A REGRESSION OF THIS PASS, and measured rather than reasoned: the HEAD build
     was served to the mirror and `?id=B15` opened at 375 — `.headactions` came back
     `class="headactions empty"`, `display:none`, and `#headKebabBtn` with `hidden`
     FALSE and a box of 0×0. The menu was in the DOM, unhidden, and unreachable. */
  var zone4 = $('#appView .headactions');
  if(zone4){
    var live = $$('.btn', zone4).some(function(b){
      return !b.hidden && getComputedStyle(b).display !== 'none';
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
  /* ⚠️ THE SQUARE BESIDE THE TITLE IS FILLED NOW (2026-09-27). It was a reserved slot
     with nothing in it — sized and aligned for artwork that never arrived. What goes in
     it is the SAME mark the licence rows carry (`licenseMark`, keyed on product ×
     billing kind), so the row you clicked and the panel it opened wear one identity.
     ⚠️ `aria-hidden` stays: the product, the kind and the plan are all spelled out in
     the two lines beside it, and a reader that also announced the mark would say it
     twice — the same reason the table's copy of this square is hidden. */
  var mk = $('#appView #licHeadMark');
  if(mk) mk.innerHTML = licenseMark(lic);
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
  /* ⚠️ THE HEADING'S WORD IS NO LONGER SWAPPED HERE (2026-09-30). It said `Expiry` for a
     grant and `Software updates` otherwise; the label is `Period` for every kind now (see
     the markup), so there is nothing to swap — and with the assignment gone, the
     `#updatesInfo` slot this code had to rescue from its own `textContent` is safe by
     construction rather than by putting it back afterwards.
     ⚠️ The ICON still differs and is still set by renderLicenseDetails: a grant has no
     updates term, so it gets no info icon. */
  var coupon = $('#couponBtn'); if(coupon) coupon.hidden = isGrant;
  /* ⚠️ BY ID SINCE 2026-09-30. This read `[data-page="perp"][data-modal="add-ons"]` —
     the header's perpetual `Manage`, which no longer exists: the one Manage is in the
     Plan block and carries no `data-page`, so nothing restores or hides it by kind and
     the grant has to name it. A selector that matches nothing fails silently, which is
     how the grant would have grown a capacity button nobody meant to give it. */
  var planManage = $('#planManageBtn'); if(planManage) planManage.hidden = isGrant;
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
    /* ⚠️ Three words for three tenses. "Until <a date that has gone>" is the same
       awkward reading the list just fixed — it states a limit in the future about a
       date in the past, and the reader has to compare it with today before it means
       anything. Same wording as the table's `Updates period over`. */
    else if(pp) pp.textContent = (daysUntil(lic.event) < 0 ? 'Ended '
      : lic.status==='updates_expiring' ? 'Expires ' : 'Until ') + fmtDate(lic.event);
    /* the explanation that stops the date reading as "the licence expires". A grant has
       no updates term at all, so it gets no icon rather than an irrelevant one. */
    var ui = $('#updatesInfo');
    if(ui) ui.innerHTML = lic.grant ? '' : infoIcon('Software updates', UPDATES_LAPSE);
  } else {
    var ps = $('#periodSub');
    /* ⚠️ A Free subscription has no `event`, and this printed the bare word `Renews`
       with nothing after it — a label promising a date that never came. Same predicate
       the tables read (`neverExpires`, components.js), so the licence says one thing
       about itself wherever it is shown. */
    if(ps) ps.textContent = neverExpires(lic) ? 'No expiry'
      : (lic.status==='canceled' ? 'Active until ' : 'Renews ') + fmtDate(lic.event);
    var ncp = nextChargeParts(lic);
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
    if(nc) nc.textContent = ncp.amount;
    /* ⚠️ The "on " prefix is its own span so the phone can drop it. With the
       "NEXT CHARGE" label restored to the line, label + date + amount measured
       302px against a 284px box — and "on" is redundant once the label says what
       the date is. Removing it buys the 22px the line was short of. */
    if(when) when.innerHTML='<span class="nc-on">on </span>'+ncp.when;
  }
  renderLicenseKey(lic);
  renderLicInvoices(lic);
  renderInstances(lic);
  renderEntitlements(spec.ent, lic.extras);
  renderLicenseFeatures(lic, spec);
  renderLicenseAlert(lic);
  renderLicenseVersion(lic);
  renderLicenseActions(lic);
  applyLicPlan();
  renderLicFeed(lic);
}
/* ⚠️ `applyLicZone` IS GONE (2026-10-01) with the `Zone` axis — it wrote `data-zone` on
   `.head-rest` and nothing else; `current` never had rules of its own. */
/* ⚠️⚠️ THE PLAN BLOCK'S ARRANGEMENT, AND THE ONE NODE CSS CANNOT MOVE (2026-10-01, by
   request). `side` puts the plan table and the add-on chips in two columns with their
   headings on one line — that part is a grid and lives in the stylesheet. What cannot be
   done there is `Manage`: in the stacked form it belongs to the `Plan` heading row, and
   in the reference for the side form it sits at the far right of the card, on the
   `Add-ons` line. No `order` carries a child across a parent, so the button is MOVED.
   ⚠️ IT IS THE SAME BUTTON, NOT A SECOND ONE. Rendering a copy per arrangement would give
   the panel two `#planManageBtn`s the moment both were on screen, and the delegated
   `data-modal` handler would fire for whichever the query found first.
   ⚠️ IDEMPOTENT AND REVERSIBLE, the same contract `syncTitleRow` keeps: it runs on every
   render in both directions, so switching back puts the button exactly where the markup
   has it. The spacer in the Add-ons row is created once and left — it is inert when the
   row holds only its heading.
   ⚠️ Runs from `renderLicenseDetails`, i.e. on every open in BOTH hosts — the modal
   re-mounts its markup each time, so anything set once at boot would be lost. */
function applyLicPlan(){
  $$('#appView .planblock').forEach(function(block){
    var btn = $('#planManageBtn', block);
    var planSh = $('.sh', block), featSh = $('#featureBlock .sh', block);
    if(!btn || !planSh || !featSh) return;
    /* ⚠️ ALWAYS THE ADD-ONS HEADING (2026-10-01): `Plan block` retired on `Side by side`,
       where `Manage` sits at the far right of the card rather than on the `Plan` row. The
       attribute is gone with the axis — the arrangement is the stylesheet's default now —
       and this function survives for the one thing CSS cannot do: move a node. */
    var target = featSh;
    if(btn.parentNode === target) return;
    if(!$('.spacer', target)){
      var sp = document.createElement('span');
      sp.className = 'spacer';
      target.appendChild(sp);
    }
    target.appendChild(btn);
  });
}

/* Is there a scheduled charge ahead? One reading, so the block's visibility and any
   later surface that asks the same question cannot drift apart.
   ⚠️ `payment_failed` counts: the charge is still coming, it is the RETRY, and the
   amount and date are exactly what the person needs while the banner tells them to
   update the card. Cancelled does not: it runs to the end of what was paid for and
   then stops. Perpetual and grant never had one. */
/* The amount and the date of the next charge, read in one place.
   ⚠️ ONE READER SINCE 2026-09-30 — the `Next charge` card. It was extracted when the
   header zone stated the same fact too; that second statement is gone, and this is kept
   rather than inlined back because what it holds is a RULE (`/ mo` comes off the stored
   price) and not a convenience. `hasNextCharge` still decides WHETHER there is one. */
function nextChargeParts(lic){
  return { amount: String((lic && lic.price) || '').replace(/\s*\/\s*mo/i,''),
           when: fmtDate(lic && lic.event) };
}
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
/* ⚠️ THE SAME MARK THE LICENCE AND INVOICE COLUMNS CARRY (2026-09-28, by request).
   It was a pair of PILLS — `attn` and `soft` — which made this the only status column in
   the product wearing a different shape: three surfaces answering "what state is this
   row in" with two vocabularies. `statmark` is the one builder for that answer, so the
   glyph, the colour and the weight come from the same place as `Active` and `Paid`.
   ⚠️ The WORDS do not change. `Healthy` / `Stale` are what the filter chips count and
   what `instMatchesStatus` compares against; the mark is a presentation, not a state. */
function instStatusCell(i){
  var stale = instStale(i), tone = stale ? 'alert' : 'ok';
  return '<td><span class="statmark is-' + tone + '">'
    + icon(STATUS_IC[tone], { cls:'statmark-ic' }) + (stale ? 'Stale' : 'Healthy')
    + '</span></td>';
}
/* ⚠️ The full id is on the page, not truncated away from it. It used to render as
   `a1b2c3d4…e5f` with no way to see or copy the rest — an identifier you cannot read
   or paste is decoration. `.inst-id` clips with CSS so the column keeps its width,
   `title` gives it on hover, and the copy button puts the WHOLE value on the
   clipboard (the truncation was only ever visual). */
function instRow(i){
  var id = esc(i.id);
  return '<tr data-instid="' + id + '">'
    /* ⚠️ A GHOST BUTTON, not a framed one. `.iconbtn.ib` is the 40px control that stands
       in a toolbar; inside a table cell, beside the value it copies, the frame reads as a
       second cell. It keeps its tooltip, its label and its 40px hit area — only the box
       goes (see `.ghostbtn`). */
    + '<td class="mono"><span class="inst-id" title="' + id + '">' + id + '</span>'
    +   '<button class="btn btn--ghost btn--md btn--icon tip inst-copy" data-instcopy="' + id + '"'
    +     ' aria-label="Copy instance ID" data-tip="Copy instance ID">' + COPYSVG + '</button></td>'
    /* ⚠️ NO HOVER PENCIL IN THIS CELL (2026-09-24). Renaming lives in the row's own
       menu and nowhere else — the same rule Deactivate and Delete already follow. A
       control that only exists while the pointer is over the cell does not exist on
       touch at all, and it made the Label column the one cell in the table that acted. */
    + '<td class="inst-labelcell">'
    +   (i.label ? '<span class="inst-label">' + esc(i.label) + '</span>'
                 : '<span class="muted">&mdash;</span>') + '</td>'
    + instStatusCell(i)
    + '<td>' + fmtDateTime(i.seen) + '</td>'
    + '<td>' + fmtDate(i.created) + '</td>'
    /* ⚠️ THE SAME ROW MENU AS THE INSTANCES VIEW, from the same builder. An instance row
       is an instance row: if Deactivate lives on it in one table and not the other, the
       reader has to learn which table is the one that can act. One builder, so the two
       cannot drift — and each action still has exactly one implementation behind it. */
    + '<td class="cellact"><div class="lic-actions">' + instRowMenu(i) + '</div></td></tr>';
}
/* one page position per table, reset when another licence is opened (see resetSurface) */
var licInstPage = { prod:{ page:1, size:10, total:0 }, dev:{ page:1, size:10, total:0 } };
function renderInstances(lic){
  var prod = instancesOf(lic, 'prod'), dev = instancesOf(lic, 'dev');
  /* the chips state what each holds — see the note on the markup */
  var pc = $('[data-instcount="prod"]'), dc = $('[data-instcount="dev"]');
  if(pc) pc.textContent = prod.length;
  if(dc) dc.textContent = dev.length;
  var note = $('#instNote');
  if(note){
    /* one sentence, and it carries the number the column is read against */
    /* ⚠️ HOURLY, and the two numbers are different on purpose: the cadence is what the
       deployment does, the threshold is when we stop believing it. See CHECKIN_STALE_MULT. */
    note.textContent = 'Licenses check in every hour. An instance that has not reported for '
      + checkinStaleAfterH() + ' hours is shown as stale.';
    note.hidden = !(prod.length || dev.length);
  }
  /* ⚠️⚠️ THE PRODUCTION EMPTY STATE TOOK THE DEVELOPMENT ONE'S SHAPE (2026-10-01, by
     request): `emptyStateRow` — a title and a sentence on the grey frame — instead of the
     bare `.emptybox` one-liner it carried.
     ⚠️ THIS REVERSES THE NOTE THAT USED TO STAND HERE, and the note is quoted rather than
     deleted: "the production tab keeps its one-liner on purpose: production instances
     need no explanation, and a reader with none is simply waiting for a deployment to
     check in." The argument was about the WORDS, and it still holds — the sentence is
     unchanged. What was wrong was the FORM: two tabs of one control answered the same
     empty condition with two different objects, so switching between them changed the
     shape of the panel rather than its content.
     ⚠️ THE DOCS LINK COMES WITH THE SHAPE, and it is the one thing a reader with zero
     instances actually needs — "how do I start one". It also puts a route to the
     documentation back on a healthy licence, which NOTES records as lost when the key's
     explanatory line was removed. Reported, not slipped in. */
  var pb = $('#instBodyProd');
  if(pb) pb.innerHTML = prod.length
    ? pageSlice(prod, licInstPage.prod).map(instRow).join('')
    : emptyStateRow(6, {
        title:'No production instances',
        line:'Instances appear here automatically when a deployment is activated with '
           + 'this license. '
           + '<a class="link" href="' + EXT.install + '" target="_blank" rel="noopener">'
           + 'How to activate an instance' + EXTSVG + '</a>'
      });
  var db = $('#instBodyDev');
  /* ⚠️⚠️ THE DEVELOPMENT EMPTY STATE EXPLAINS ITSELF (2026-09-29, by request). It said
     "No development instances are running with this license." — true, and useless to
     the reader who does not already know what a development instance IS or why they
     would want one. This is the only place in the product where the distinction is
     ever explained, and the tab is where somebody meets it.
     ⚠️ IT USES THE SHARED BUILDER, `emptyStateRow` — the same title / sentence / action
     shape the Licenses page and the empty account use — and since 2026-10-01 so does the
     production tab above it, so the two halves of this control answer an empty list with
     one object instead of two.
     ⚠️ TWO WAYS OUT, and they answer different questions. The docs link answers "how do
     I start one"; `Manage add-ons` answers "where do I get another", because on this
     prototype development instances are capacity, bought through the wizard — the same
     entry point the row kebab and the Plan block use, not a second one. */
  if(db) db.innerHTML = dev.length
    ? pageSlice(dev, licInstPage.dev).map(instRow).join('')
    : emptyStateRow(6, {
        title:'No development instances',
        line:'A development instance uses the same license on a deployment that serves '
           + 'no one: a staging server, test rig, or local build where you try changes '
           + "before production. It doesn't count against your production instances. "
           + '<a class="link" href="' + EXT.install + '" target="_blank" rel="noopener">'
           + 'How to activate an instance' + EXTSVG + '</a>',
        action: button({ variant:'secondary', size:'md', label:'Manage add-ons',
                         attrs:'data-devaddons' })
      });
  if(!prod.length) licInstPage.prod.total = 0;
  if(!dev.length)  licInstPage.dev.total  = 0;
  var pp = $('#instPagerProd'); if(pp) pp.hidden = !prod.length;
  var dp = $('#instPagerDev');  if(dp) dp.hidden = !dev.length;
  syncPager('#instPagerProd', licInstPage.prod);
  syncPager('#instPagerDev',  licInstPage.dev);
  /* ⚠️ Wired HERE, not at load: the panel's markup is mounted per host, so the pager
     nodes do not exist until a licence is opened. `wirePager` guards against a second
     binding on the same node, which is what makes calling it on every render safe. */
  wirePager('#instPagerProd', licInstPage.prod, function(){ renderInstances(lic); });
  wirePager('#instPagerDev',  licInstPage.dev,  function(){ renderInstances(lic); });
}

/* An instance label is set the same way a licence label is — a small dialog, the same
   writer shape, the same activity entry — because it is the same job on a smaller
   object. ⚠️ It writes onto the instance INSIDE the store\'s licence, so it survives a
   reload like every other mutation; `Store.save()` is what makes that true. */
/* ⚠️ THE LICENCE COMES FROM THE INSTANCE (2026-09-28), not from `activeLicense`. While
   it read the panel's open licence, this dialog was dead on the Instances page — the
   menu item was there, it was correctly named, and clicking it opened nothing. One
   instance belongs to exactly one licence, so `findInstance` is the whole fix and the
   surface stops mattering. */
function openInstanceLabelModal(instId){
  var hit = findInstance(instId); if(!hit) return;
  var lic = hit.lic, i = hit.inst;
  openModal('Edit instance label',
    field({ id:'instLabelInput', label:'Label', autocomplete:'off',
            placeholder:'e.g. HQ node 1', value:i.label || '',
            help:'A label tells this instance apart from the others running on the same license.' }));
  $('#modalCloseBtn').textContent = 'Cancel';
  var inp = $('#instLabelInput');
  var save = modalAction('Save', function(){
    var was = i.label;
    i.label = String(inp.value || '').trim();
    Store.save();
    if(i.label !== was){
      /* the new name is in the sentence; the one it replaced is not */
      logActivity(i.label
        ? { type:'instance.renamed', licId:lic.id,
            f:{ entity:i.label, license:(lic.label || lic.name) },
            detail: was ? [['Previous name', was]] : null }
        : { type:'instance.name_cleared', licId:lic.id,
            f:{ entity:i.id, license:(lic.label || lic.name) },
            detail:[['Previous name', was]] });
    }
    /* ⚠️ Both hosts, not this one — the same repaint the row's other actions use. */
    afterInstanceChange();
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

   ⚠️ TERM: 12 months FROM THE EXISTING END DATE. This REVERSES the earlier pass, which
   ran the term from the purchase date and stated the forfeit outright — honest about a
   rule that was wrong. Buying early now loses nothing, and the modal says so, because
   the fear of losing paid days is exactly what makes people wait until the last day.
   A lapsed term has no days left to keep, so it runs from today instead. */
function updatesRenewPrice(lic){
  return Math.round(tierBase(lic && lic.tier) * UPDATES_RENEW_RATE * 100) / 100;
}
/* ⚠️ Anchored on the licence, not on today: the new term starts where the current one
   ends. Past its end there is nothing to extend, so a lapsed licence starts from today
   — the only case where the two answers differ. */
function updatesNewExpiry(lic){
  var days = Math.round(UPDATES_RENEW_MONTHS * 30.44);
  var end = lic && lic.event ? dayOf(lic.event) : null;
  var from = (end != null && end > TODAY_DAY) ? end : TODAY_DAY;
  return dayToDate(from + days);
}
/* ---------- Renew software updates, on the Review & pay layout -------------------
   ⚠️ REBUILT FROM A NARROW DIALOG. It used to be the generic modal: a paragraph, three
   label/value rows and two help notes, with the price in the footer button. Every one
   of those facts survives — nothing was dropped — but they are now arranged the way the
   purchase wizard's last step arranges the same kind of decision, because it IS the same
   kind of decision: a thing being bought, a total, and a charge.
     left · block 1   what is being renewed — the licence as it reads now
     left · block 2   what is being bought, the total, and how it is billed
     right            Due today, what it is charged to, and the pay button
   Where each old line went: the term and its price and both dates are ORDER ROWS in
   block 2; the sentence about how the new term is dated sits under them, because it
   explains those dates; the tax note joins the billing terms line, where it sits on the
   wizard's Review; the price becomes Due today on the right, so the figure is stated
   once as an amount rather than twice as a label and a button.
   ⚠️ It also carries the legal confirmation — this issues an entitlement, and the same
   gate applies: the primary is never disabled, it answers. */
var ruState = { legalOk:false, legalErr:null, licId:null };
function renewUpdatesHTML(lic){
  var price = updatesRenewPrice(lic), to = updatesNewExpiry(lic);
  var lapsed = lic.event && daysUntil(lic.event) < 0;
  var who = esc(lic.name) + (lic.label ? ' · ' + esc(lic.label) : '');
  return '<div class="fs-grid ru-grid">'
    + '<div class="fs-col">'
    /* block 1 — the licence, exactly as it reads everywhere else */
    +   '<div class="am-sec fs-panel ru-lic">'
    +     '<div class="ru-liclead">' + esc(lic.product || 'ThingsBoard') + ' · ' + esc(lic.type) + '</div>'
    +     '<div class="ru-licname">' + who + '</div>'
    +   '</div>'
    /* block 2 — what is being bought */
    +   '<div class="nl-joined">'
    +     '<div class="am-order">'
    +       '<div class="am-orow am-planrow nl-mainline"><div>Software updates · '
    +         UPDATES_RENEW_MONTHS + ' months</div><div>' + fmtMoney(price) + '</div></div>'
    +       '<div class="am-orow"><div>' + (lapsed ? 'Updates lapsed' : 'Current term ends')
              + '</div><div>' + fmtDate(lic.event) + '</div></div>'
    +       '<div class="am-orow"><div>New term ends</div><div><b>' + fmtDate(to) + '</b></div></div>'
    +       '<div class="am-orow am-newmonthly"><div>One-time total</div><div>' + fmtMoney(price) + '</div></div>'
    +     '</div>'
    /* ⚠️ THE SENTENCE IS THE ONE THE RULE ACTUALLY FOLLOWS. The term runs from the
       existing end date, so buying early loses nothing — see the note above
       updatesNewExpiry. A lapsed term has no days left to keep and runs from today. */
    +     '<div class="nl-terms">'
    +       (lapsed
              ? 'Updates have lapsed, so the new term runs ' + UPDATES_RENEW_MONTHS + ' months from today.'
              : 'The new term starts when the current one ends, on ' + fmtDate(lic.event)
                + ' \u2014 buying early adds ' + UPDATES_RENEW_MONTHS
                + ' months to it and loses none of the days you have already paid for.')
    +       '<span class="taxnote nl-taxline">' + TAX_NOTE + '</span></div>'
    +   '</div>'
    + '</div>'
    + '<div class="am-sec fs-right">'
    +   '<div class="nl-duerow"><div class="am-duelabel">Due today <span class="muted">— one-time</span></div>'
    +     '<div class="am-dueval">' + fmtMoney(price) + '</div></div>'
    +   '<div class="nl-payline">' + (savedCard()
          ? 'Charged once to ' + esc(savedCard().brand) + ' ••' + esc(savedCard().last4)
          : 'Charged once to Visa ••4242') + '</div>'
    +   '<label class="nl-legal' + (ruState.legalErr ? ' err' : '') + '">'
    /* same reason as the wizard's box: a stable id is subject to the browser's own
       form-state restoration, and a restored tick is a consent nobody gave */
    +     '<input type="checkbox" id="ruLegal" autocomplete="off"' + (ruState.legalOk ? ' checked' : '') + '>'
    +     '<span class="nl-legaltxt">I have read and agree to the '
    +     '<a class="link" href="license-agreement.html" target="_blank" rel="noopener">ThingsBoard License Agreement</a>. '
    +     'I confirm I am authorized to accept it on behalf of my organization.</span></label>'
    +   (ruState.legalErr ? '<div class="fielderr nl-legalerr" role="alert">' + esc(ruState.legalErr) + '</div>' : '')
    +   '<button class="btn btn--primary btn--md fs-nextbtn" id="ruPay">Pay ' + fmtMoney(price) + '</button>'
    + '</div>'
    + '</div>';
}
function openRenewUpdatesModal(licId){
  var lic = licById(licId) || activeLicense;
  if(!lic) return;
  ruState = { legalOk:false, legalErr:null, licId:lic.id };
  openModal('Renew software updates', renewUpdatesHTML(lic));
  var box = $('#ruLegal'); if(box) box.checked = false;   // whatever the browser restored
  $('#overlay .modal').classList.add('wide');
  $('#modalCloseBtn').textContent = 'Cancel';
}
/* the dialog's own body is re-rendered on every state change, so both of its controls
   are delegated rather than bound */
document.addEventListener('change', function(e){
  if(!e.target.closest('#ruLegal')) return;
  ruState.legalOk = e.target.checked;
  if(ruState.legalOk && ruState.legalErr){
    ruState.legalErr = null;
    var l = licById(ruState.licId);
    if(l) $('#modalBody').innerHTML = renewUpdatesHTML(l);
  }
});
document.addEventListener('click', function(e){
  if(!e.target.closest('#ruPay')) return;
  var lic = licById(ruState.licId);
  if(!lic) return;
  if(!ruState.legalOk){
    ruState.legalErr = 'Confirm the statement above to issue the license.';
    $('#modalBody').innerHTML = renewUpdatesHTML(lic);
    var c = $('#ruLegal'); if(c) c.focus();
    return;
  }
  var price = updatesRenewPrice(lic), to = updatesNewExpiry(lic);
  lic.event = to;
  /* ⚠️ the STATUS has to move too, or the banner keeps warning about a term that has
     just been paid for — the exact "form does not change the page" fault this pass
     is cleaning up elsewhere */
  if(lic.status === 'updates_expiring') lic.status = 'active';
  Store.save();
  storeAddInvoice(lic, fmtMoney(price), { payment:'Card', auto:false });
  logActivity({ type:'license.updates_renewed', licId:lic.id,
    f:{ entity:(lic.label || lic.name), until:fmtDate(to) },
    /* the new term is in the sentence; what it replaced, and what it cost, are not */
    detail:[['Previous term', fmtDate(lic.event)],
            ['Charged', fmtMoney(price)]] });
  closeModal();
  Snack.show('Software updates renewed until ' + fmtDate(to));
  if(window.LicenseDetails && LicenseDetails.isOpen()) LicenseDetails.reopen(lic);
  else if(window.LicenseDetails) LicenseDetails.afterChange();
});
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
  /* Two ⋮ entries the phone needs — coupon and reveal — and each just presses the
     real button, so every one of them keeps a single controller. The buttons are
     display:none on a phone; a programmatic click still fires.
     ⚠️ It was three until 2026-09-29: `install` is gone with `#installBtn`, whose job
     a sentence with a link does now, at every width. */
  [['[data-couponmenu]', '#couponBtn'],
   ['[data-revealmenu]', '#revealBtn']].forEach(function(pair){
    document.addEventListener('click', function(e){
      if(!e.target.closest(pair[0])) return;
      closeAllMenus();
      var btn = $(pair[1]);
      if(btn) btn.click();
    });
  });

  /* ---------- coupon ----------
     ⚠️ The controller moved to shared.js (see `Coupon`) when the purchase flow gained
     its own Apply coupon on the Review step. This surface is now one of its two
     callers and owns only what applying means HERE: the redemption is a stub, and the
     result is an action result, so it is a snackbar like every other one. */
  (function(){
    var btn = $('#couponBtn');
    if(!btn) return;
    btn.addEventListener('click', function(){
      Coupon.open(function(code){ Snack.show('Coupon ' + code + ' applied'); }, btn);
    });
  })();

  /* ⚠️ Delegated: the empty state is rendered and destroyed with the tab, so a listener
     bound to the button would be bound to a node that is replaced on the next repaint.
     It routes through `openManageAddons` — the one entry point the row kebab and the
     Plan block already use — rather than opening the wizard itself. */
  document.addEventListener('click', function(e){
    if(!e.target.closest('[data-devaddons]')) return;
    if(activeLicense) openManageAddons(activeLicense);
  });

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

       ---------- the row menu is wired NOWHERE IN THIS FILE ----------
       ⚠️ `Copy instance ID` moved out on 2026-09-25 and `Edit label` on 2026-09-28, both
       to the delegated block in components.js, and for one reason: the menu is built by
       `instRowMenu`, which two surfaces draw, so a listener scoped to `instPanel` gives
       the Instances page items that exist and do nothing. Nothing scoped to this panel
       may handle a row action — if the markup is shared, the wiring is shared. */
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
  /* ⚠️⚠️ SCOPED BY ID, AND IT WAS A BARE `.perctl` (fixed 2026-09-28). `$()` returns the
     FIRST match in the document, so this wired whichever period control happened to come
     first in the markup — which was this panel's, right up until the Licenses toolbar B
     gave its Type and Status dropdowns the same `.perctl` box. From that day the panel's
     period filter was wired to a control that has no `.permenu`, and `closeMenu()` —
     which runs from a DOCUMENT click listener — threw on every click anywhere on the
     page. Found in the console sweep, not by anything visibly breaking.
     This is the file's own recurring lesson at a new address: a selector that names a
     LAYOUT reaches surfaces you were not thinking about. */
  wirePeriod('#licFeedPeriod', licPeriod, function(){ renderLicFeed(activeLicense); });

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
    /* before wireSearch, so the rows exist by the time it filters them — the feed
       re-renders to everything while a query is present (see renderLicFeed) */
    box.addEventListener('input', function(){ if(activeLicense) renderLicFeed(activeLicense); });
    wireSearch('#panel-audit .searchbox input', {
      /* `.fitem` only — the date separators are siblings now; see the Activity page */
      items: function(){ return $$('#licFeed > .fitem'); },
      /* the record, not the node — same reason as the Activity page */
      text:  function(n, idx){ var r = licRendered[idx]; return r ? activityHaystack(r, 'license') : ''; },
      host:  function(){ return $('#licFeed'); },
      after: function(){ syncFeedChrome($('#licFeed')); },
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
  + '      <div class="fs-headactions"><button class="btn btn--ghost btn--md btn--icon fs-close" id="licModalClose" aria-label="Close"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-x"></use></svg></button></div>'
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
    /* ⚠️ WIRED PER MOUNT, not once at load: the same markup is mounted into two hosts
       and the scroller differs between them — `.fs-body` in the modal, `#shellMain` on
       the page. Binding at definition time would have caught whichever host happened to
       exist first and left the other with a tab bar that scrolls away. */
    var tabs = host.querySelector('#appView .tabs');
    if(tabs && typeof wireStickyTabs === 'function') wireStickyTabs(tabs, scrollParent(tabs));
  }
  /* ⚠️ The surface KEPT the previous licence's scroll position and selected tab.
     `mount()` moves the same DOM between hosts, so nothing was ever reset — open one
     licence, scroll to its Instances tab, close, open another, and the second one
     opened mid-page on Instances, with the name and status off-screen above. On a
     phone that means the panel gives no sign of which licence you are in.
     Both belong to the licence you WERE looking at, so both are dropped on every open. */
  function resetSurface(){
    /* ⚠️ A DIFFERENT LICENCE IS A DIFFERENT LIST: page 2 of the last one means nothing
       here, and the reader would open a panel already scrolled past its own beginning. */
    if(typeof licInstPage !== 'undefined'){ licInstPage.prod.page = 1; licInstPage.dev.page = 1; }
    if(typeof licFeedPage !== 'undefined') licFeedPage.page = 1;
    /* ⚠️ THE FIRST TAB, whichever it is — not `#tab-invoices` by name. Reordering the
       tab bar left this pointing at what is now the SECOND tab, so every open reset the
       surface to Invoices while the markup said Instances: the order changed and the
       default silently did not follow it. Reading the tablist means the two cannot
       disagree again. */
    var first = $('#appView .tabs .tab');
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
    /* ⚠️ WHICH LICENCE THIS SURFACE IS SHOWING, on the surface itself. In modal mode
       there is no id in the URL, so nothing outside could answer that question — the
       state bar reads this to mark the option it is currently standing on. One
       attribute, written wherever the panel is filled, which is here and only here. */
    var host = $('#appView'); if(host && lic) host.setAttribute('data-lic', lic.id);
    if(window.PageStates) PageStates.sync();
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
    /* the state bar follows what is on screen, and this surface comes and goes over
       pages that have states of their own */
    if(window.PageStates) PageStates.sync();
  }
  function mountPage(hostSel, lic, opts){
    var host = $(hostSel); if(!host) return;
    mount(host);
    show(lic);
    resetScroll();
    var b = $('#backBtn');
    /* ⚠️ NO `opts.back` MEANS NO BUTTON, not an unwired one (2026-09-29). Before the
       `shared` mode existed every caller passed a back, so the falsy branch only ever
       had to skip the wiring — and left the control sitting in the header doing
       nothing, which is worse than either showing it or not. */
    if(b){
      var hasBack = !!(opts && opts.back);
      b.hidden = !hasBack;
      if(hasBack){
        b.setAttribute('aria-label', opts.back.label);
        b.setAttribute('title', opts.back.label);
        b.addEventListener('click', function(){ location.href = opts.back.href; });
      }
    }
  }
  // a change made inside the surface: restate the details and the page behind
  function afterChange(){
    if(activeLicense) renderLicenseDetails(activeLicense);
    if(hostRerender) hostRerender();
  }
  return {
    mountPage: mountPage,
    openModal: function(lic){ openModal(lic); if(window.PageStates) PageStates.sync(); },
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


/* ============================================================================
   THE LICENCE PANEL'S PAGE STATES — the bottom bar (2026-09-28, by request)
   ============================================================================
   ⚠️ THE SURFACE, NOT THE PAGE. This panel has two hosts — a modal over any list and
   `license.html` — so its `when()` asks whether the surface is ON SCREEN rather than
   which page you are on. `openModal` and `close` call `PageStates.sync()`, so the bar
   appears with the modal and goes with it.
   ⚠️ IT SWITCHES BY OPENING A REAL LICENCE, never by faking one. Every option here
   names a licence that actually carries that state, and a state no licence carries is
   DISABLED with its count — which is also how the bar reports what the demo cannot
   currently show (a cancelled perpetual, say, does not exist).
   ⚠️ `Presentation` and `Tier` MOVED HERE FROM THE ⚙ PANEL. Both were facts about this
   one surface living in the panel every page opens — the split this bar exists to make.
   Same store key, same synthetic `?tier=` routes; only where they are set changed. */
(function(){
  if(!window.PageStates) return;

  function onScreen(){
    return document.body.getAttribute('data-page') === 'license'
        || (window.LicenseDetails && LicenseDetails.isOpen());
  }
  /* ⚠️ Honour the CURRENT host: in the modal, swap the licence inside it; on the page,
     navigate. Opening a modal from the full-page host would put the surface on top of
     itself. */
  function openLic(id){
    var lic = licById(id); if(!lic) return;
    if(document.body.getAttribute('data-page') === 'license'){
      location.href = licenseHref(lic, 'licenses');
    } else {
      LicenseDetails.openModal(lic);
    }
  }
  function active(){
    var m = /[?&]id=([^&]+)/.exec(location.search);
    if(m) return decodeURIComponent(m[1]);
    var t = $('#licModalTitle');
    /* the modal does not carry the id in the URL, so the bar reads the licence the
       panel is actually showing — `data-lic` is written by show() */
    var host = $('#appView');
    return host ? host.getAttribute('data-lic') : null;
  }

  /* the six branches of `renderLicenseAlert`, in its own order of seriousness
     ⚠️ SIX, not seven, since 2026-09-30: `Awaiting check-in` stopped being a banner, so
     its row went from this strip in the same pass. Licences in that state are counted by
     `No banner` now, which is where they land — the predicate below dropped the status
     from its exclusion list for exactly that reason. */
/* ⚠️⚠️ `No banner` IS FIRST (2026-09-29, by request), and it is the ONLY re-ordering:
   the six that follow are still in `renderLicenseAlert`'s own order of seriousness.
   The list used to read most-serious-first and end on "nothing is wrong", which put
   the state most licences are actually in at the far end of a seven-item row — and it
   is the one a reviewer reaches for most, because it is the panel with nothing in the
   way of it. Same reason `No banner` leads Home's row. */
  var STATES = [
    ['none',             'No banner',           function(l){
      return !instOverLimit(l) && l.status !== 'payment_failed' && l.status !== 'canceled'
        && l.status !== 'updates_expiring'
        && !(hasUpdatesTerm(l) && daysUntil(l.event) < 0); }],
    ['over_limit',       'Over instance limit', function(l){ return instOverLimit(l); }],
    ['payment_failed',   'Payment failed',      function(l){ return !instOverLimit(l) && l.status === 'payment_failed'; }],
    ['updates_expired',  'Updates ended',       function(l){ return !instOverLimit(l) && l.status !== 'payment_failed' && hasUpdatesTerm(l) && daysUntil(l.event) < 0; }],
    ['updates_expiring', 'Updates ending',      function(l){ return !instOverLimit(l) && l.status === 'updates_expiring'; }],
    ['canceled',         'Canceled',            function(l){ return l.status === 'canceled'; }]
  ];
  var TYPES = [
    ['Subscription', 'Subscription', function(l){ return l.type === 'Subscription' && l.tier !== 'free'; }],
    ['Perpetual',    'Perpetual',    function(l){ return l.type === 'Perpetual'; }],
    ['Grant',        'Grant',        function(l){ return !!l.grant; }],
    ['Free',         'Free',         function(l){ return l.tier === 'free'; }]
  ];
  function group(defs){
    var lic = DATA().licenses || [];
    return defs.map(function(d){
      var hits = lic.filter(d[2]);
      var cur = active();
      var mine = hits.filter(function(l){ return l.id === cur; })[0];
      return { v:d[0], t:d[1], note:hits.length ? String(hits.length) : 'none',
               disabled:!hits.length, _open:(mine || hits[0] || {}).id,
               _on:!!mine };
    });
  }
  function pickFrom(defs){
    return function(v){
      var o = group(defs).filter(function(x){ return x.v === v; })[0];
      if(o && o._open) openLic(o._open);
    };
  }
  function currentOf(defs){
    return function(){
      var o = group(defs).filter(function(x){ return x._on; })[0];
      return o ? o.v : null;
    };
  }

  /* ⚠️⚠️ THE SPEC IS ON SCREEN WHEREVER A LICENCE CAN BE OPENED, not only while one IS
     (2026-09-30). Every tab below works with the panel closed: `State` and `Type` OPEN a
     licence rather than describing an open one, and `Presentation` and `Zone` are read at
     the next open. Gated on the panel being up, half this group was unreachable from the
     list page it opens from — which is exactly why `Zone` had to live in the ⚙ panel
     under a different condition. One scope, one group, one place.
     ⚠️ THE LABEL IS STILL TIED TO THE PANEL BEING OPEN. The bar names the surface it is
     standing on, and `License details` at the foot of a plain list would be a lie; an
     empty answer defers to the page's own name (see `where` in shared.js). */
  PageStates.define({
    id:'license',
    label:function(){ return onScreen() ? 'License details' : ''; },
    when:function(){ return settingsContext().detailsPage; },
    tabs:[
      /* ---- which licence: both of these NAVIGATE, and the count beside an option is
         how many licences in the account really carry it. A state no licence has is
         disabled rather than hidden — "this cannot happen on this account" is the most
         useful thing the row can say about it. ---- */
      { id:'licState', group:'License', label:'State',
        get:currentOf(STATES), set:pickFrom(STATES),
        options:function(){ return group(STATES); } },

      { id:'licType', group:'License', label:'Type',
        get:currentOf(TYPES), set:pickFrom(TYPES),
        options:function(){ return group(TYPES); },
/* ⚠️⚠️ TIER IS A DEPENDENT ROW OF TYPE (2026-09-29, by request), because it is
   literally a narrowing of it: every tier below is a subscription or a perpetual, so
   picking one always answers the row above as a side effect. As sibling tabs the two
   read as independent questions and the answer to the first kept changing under the
   reader when they touched the second.
   ⚠️ IT STILL NAVIGATES, and that is why it cannot merge INTO the Type row rather than
   sitting under it: Type opens a licence that exists in the datasets, Tier routes
   through `?tier=` to a page synthesised from `TIER_SPECS` for plans no licence is on.
   Two different mechanisms answering two levels of one question. */
        sub:{
          label:'Tier',
          get:function(){ var m = /[?&]tier=([^&]+)/.exec(location.search); return m ? m[1] : null; },
          set:function(v){ location.href = 'license.html?tier=' + encodeURIComponent(v); },
          options:[['maker','Maker'],['prototype','Prototype'],['pilot','Pilot'],['startup','Startup'],
                   ['business','Business'],['prototypeaddons','Prototype + add-ons'],['perp','Perpetual']]
                  .map(function(t){ return { v:t[0], t:t[1] }; })
        } },

      /* ---- how it is drawn: the surface the licence opens ON, and the arrangement of
         its first zone. Both are answered before the licence is opened, which is why
         this spec is not gated on one being open. ---- */
      { id:'licPresent', group:'License', label:'Presentation',
        get:licDetailsMode,
/* ⚠️⚠️ THE SETTER HAS TO RE-PRESENT, NOT JUST STORE (fixed 2026-09-29). It wrote
   `licDetails` and called `PageStates.sync()`, which repaints the BAR — so the radio
   moved and the surface did not, and the setting looked broken. It was only ever
   honoured by the NEXT open: picking the page presentation inside a modal left the
   modal standing, and picking `Modal` on the page left the page.
   ⚠️ IT HAS TO CROSS HOSTS, which is why this is not a re-render. Modal and page are
   two different surfaces on two different documents:
     · to the SHARED presentation — navigate to `license.html`, which is that surface;
     · to MODAL from a page — go back to the list and open it there, because a modal
       needs something behind it and `license.html` behind a licence modal would be
       the same licence twice. `?open=` carries which one (read by page-licenses.js).
   ⚠️ Falls back to a plain sync when there is no licence to re-present — which is now
   the ordinary case, not the styleguide's edge: the tab is reachable from the list page
   with nothing open, and there the choice simply waits for the next open. */
        set:function(v){
          Store.set('licDetails', v);
          var id = active(), lic = id && licById(id);
          var onPage = document.body.getAttribute('data-page') === 'license';
          if(!lic){ PageStates.sync(); return; }
          if(v === 'modal'){
            if(onPage) location.href = 'licenses.html?open=' + encodeURIComponent(id);
            else PageStates.sync();                 // already a modal, nothing moves
            return;
          }
          /* ⚠️ THE `page` <-> `shared` RELOAD IS GONE WITH `page` (2026-10-07). It
             existed because the two differed only in a highlight decided at mount time,
             so the same document had to be re-mounted; there is one page presentation
             now, and if we are already standing on it there is nothing to move. */
          if(onPage) PageStates.sync();
          else location.href = licenseHref(lic, 'licenses');
        },
        /* ⚠️⚠️ `Full page` IS GONE (2026-10-07, by request: it and `Shared link` were the
           same thing). Once Back left both on 2026-09-29 the only difference was which
           nav tab lit, which is a highlight and not a page type. The two options left are
           ENTRY PATHS, and both are permanent:
             · `Modal`  — the person is navigating the portal and opened a licence from a
                          list. The list is behind them, so the panel sits over it.
             · `Shared` — the person opened a link somebody sent them. Nothing is behind
                          them, `Licenses` lights, and there is no Back.
           ⚠️ A stored `page` reads as `shared`, not as `modal` — see `licDetailsMode`. */
        options:[{ v:'modal', t:'Modal (default)', note:'opened from a list' },
                 { v:'shared', t:'Shared link (no Back)', note:'opened from a link' }] },

      /* ⚠️ MOVED HERE FROM THE ⚙ PANEL (2026-09-30). It was scoped there to "a page that
         can open a licence", which is this spec's scope exactly — so it now sits beside
         the three tabs it belongs with instead of in a different surface under a
         condition nobody could see was the same one. */
      /* ⚠️ A SECOND ARRANGEMENT AXIS, and it is deliberately separate from `Zone`: that one
         is the block under the header, this one is the Plan block below it. One control
         covering both would make two independent choices look like one. */
      /* ⚠️ `Plan block` IS RETIRED (2026-10-01, by request) with `Side by side` as the
         answer. What `stacked` was: the add-on chips under the plan table in one column,
         with `Manage` on the `Plan` heading row. The grid is the stylesheet's default now
         and `applyLicPlan` keeps only the node move CSS cannot make. */,

      /* ⚠️ `Zone` IS RETIRED (2026-10-01, by request) with `Current — key left, facts
         right` as the answer. A put the facts first; B made the zone two columns. Both
         were a stylesheet over one set of nodes, so retiring them was 42 rules and an
         attribute — see the zone block in styles.css. */
    ]
  });
  PageStates.sync();
})();

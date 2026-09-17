# Flow map — coverage audit

Inventory of the ThingsBoard License Portal prototype as end-to-end journeys.
Read-only: nothing in this audit was changed, fixed or refactored.

Traced at commit `00363ed` + uncommitted working tree, 2026-09-17.
Verified at 1280px and 390px, in both session states (`auth: out` / `existing`).

Method: static trace of every control to its handler, cross-checked by clicking the
ambiguous ones in the running prototype. Where a verdict came from a measurement
rather than from reading code, it says so.

---

> **Status note, 2026-09-17.** Most of what this document recorded as absent or dead
> has since been built — see the batch entries in `NOTES.md`. Two corrections to the
> audit itself are recorded below; the rest of the file is kept as the map it was, not
> updated line by line.
>
> **Correction 1 — A5 was wrong.** "Add-ons cannot be removed, steppers floored at the
> licence's current entitlement" is not what the code did. The floor is `INCL[tier]`,
> the plan's *included* amount, so purchased capacity could always be stepped back down
> and the toggles were never disabled. What made removal unreachable was that **no
> licence in any dataset carried extras or add-ons** — there was nothing to remove.
> Measured on a seeded licence: `−` enabled on Production instances and AI credits,
> both toggles live, and the review already printed `Removed Edge Computing −$7.00`.
>
> **Correction 2 — A3 is out of scope, not missing.** "Connect a running instance to a
> licence key" is not a gap in the portal. The key is entered in ThingsBoard itself; the
> platform syncs and the portal reflects what came back. The portal's job ends at
> issuing the key and showing the result, so the controls that pointed at installation
> instructions are now outbound links to the documentation rather than placeholders.

## A. Absent journeys

No path exists. Not "broken" — never built.

| # | Journey | What is missing |
|---|---|---|
| A1 | **Verify email after sign-up** | Sign-up completes and signs you straight in (`auth.js:186` `finish()` → `setSession('new')`). There is no verification step, no "check your inbox" screen, no token. Email *verification* exists only for **changing** an address on an existing account (`page-account.js:9-51`), which is a different flow. |
| A2 | **Forgot password → reset → sign in** | `Forgot password?` is `data-stub` (`auth.js:148`). It opens the generic placeholder dialog. No reset screen, no token, no new-password form. |
| A3 | **Connect a running instance to a licence key** | The key can be revealed and copied (`license-details.js:717-740`), but every route onward is a stub: `Installation instructions` icon button (`license-details.js:109`), the awaiting-check-in banner's `Installation guide →` inline link and its phone action (`license-details.js:556, 557`). Nothing describes or simulates an instance checking in. |
| A4 | **Perpetual support / updates renewal** | `Renew software updates` is `data-stub` in both places it appears: the row kebab (`components.js:163`) and the updates-expiring banner (`license-details.js:541`). No renewal screen, no price, no confirmation. |
| A5 | **Remove an add-on** | The add-ons wizard (`NL` mode `addons`) only increments capacity. Steppers are floored at the licence's current entitlement (`data-nl-min`), so quantities cannot be reduced and there is no "remove" control for Edge / Trendz / offline once enabled. Downgrade-by-plan exists (A6); downgrade-by-add-on does not. |
| A6 | **Reach help or support from inside the portal** | Grepped all pages and modules: no support link, no help centre, no contact, no docs link, no chat. The word "support" appears only as *plan feature copy* (`data.js:213`) and inside the legal pages. There is no route from a stuck state to a human. |
| A7 | **Migration banner** | No migration banner exists anywhere in the prototype. Nothing matches `migrat` in any `.js` or `.html`. |
| A8 | **Change the billing details that appear on invoices** | `billing.html` has company / address fields and a `Save` button, but `Save` persists nothing (see D3). Invoice PDFs are generated from `PAYMENT_METHOD` and hardcoded strings in `components.js:640-700`, not from those fields — so the form and the document it claims to control are not connected. |
| A9 | **Add a payment method when none exists** | `billingData: 'none'` is a real state (set for every new account, `shared.js` `setSession('new')`), but no surface offers to *add* a first card. `billing.html` always renders the same saved card via `paymentMethodHTML()`, and `#payUpdateBtn` is labelled and wired as an **update**. The wizard's billing step is the only place a card is entered, and it is inside a purchase. |
| A10 | **Change a plan *down*** | Reachable in the UI (a lower plan card is selectable in change mode) but the flow has no downgrade handling: no proration, no credit, no warning that entitlements shrink, no confirmation different from an upgrade. `commitChange()` (`wizard.js:780`) writes the new tier and price and nothing else. Listed as absent rather than partial because a downgrade is not distinguishable from an upgrade at any step. |

---

## B. Dead controls

Rendered, reachable, and wired to nothing or to a placeholder.

### B1 — No handler at all

| Control | Where | Evidence |
|---|---|---|
| **`Update payment method`** (payment-failed banner action) | `license-details.js:535`, built by `alertAction()` `license-details.js:515` | Carries only `data-goto="billing"`. **`data-goto` is read by no JS and no CSS** — the only two emit sites are this and `components.js:209`. Confirmed at runtime on `license.html?id=B3`: click changes neither URL nor any overlay. This is the action on the highest-urgency banner in the portal. |
| **Search inputs** (5) | `licenses.html:19`, `invoices.html:17`, `activity.html:17`, `users.html:60`, `license-details.js:261` (Instances), `license-details.js:329` (licence Activity) | No `input`/`keyup` listener anywhere binds them. Typing filters nothing. |
| **Pagination buttons** (24) | `licenses.html:59-62`, `invoices.html:46`, `activity.html:49`, `users.html:83`, `license-details.js:243-246`, `license-details.js:306-309` | All carry the `disabled` attribute in markup, on every page, in every state. There is no pagination logic at all; the range label is written once from the row count. |
| **Items-per-page selects** (6) | same rows as above | No `change` listener. Selecting 20/50/100 does nothing. |

### B2 — Handler that only shows a placeholder dialog

`data-stub` opens `openStub()` (`shared.js:765`), which renders the constant
`STUB = 'Placeholder — not part of this wireframe spec yet.'` (`data.js:253`).

| Control | Where |
|---|---|
| `Forgot password?` | `auth.js:148` |
| `Installation instructions` (icon button, key row) | `license-details.js:109` |
| `Installation guide →` (inline, awaiting-check-in banner) | `license-details.js:556` |
| `Set up` / `Installation guide` (banner action) | `license-details.js:557` |
| `Renew updates` (updates-expiring banner action) | `license-details.js:541` |
| `Renew software updates` (row kebab, perpetual) | `components.js:163` |
| `Add capacity` (row kebab, perpetual) | `components.js:163` |
| `Renew subscription` (row kebab, cancelled) | `components.js:165` |

Bespoke placeholder dialogs — same effect, different text:

| Control | Where | Text |
|---|---|---|
| `Add capacity` (details page + Plan block) | `license-details.js:819` | "one-time purchase of extra devices, instances, or AI credits…" |
| `Renew subscription` (details page primary, cancelled) | `license-details.js:841` | "reactivate this subscription and resume billing (TODO)" |
| `Learn more` (Community Grant banner) | `page-home.js:168` | "the Community Grant programme page is not part of this prototype" |
| Licence row fallback | `components.js:378` | fires only if a row has no resolvable id |

### B3 — Handler that changes nothing outside the widget

| Control | Where | What it actually does |
|---|---|---|
| **`Update`** (Update payment method modal) | `page-billing.js:34` | `upd.addEventListener('click', close)`. Closes the modal. The card on file is never changed and nothing is said. Comment in source: *"stub: no real card update in the prototype"*. |
| **`Save`** on Account / Billing / Security | `components.js:580-589` (`wirePageSave`) | Disables itself and shows a saved-note **where one is passed**. `page-account.js:54` passes `null`, `page-security.js:6` and `page-billing.js:14` pass nothing — so on all three pages there is **no note**. No field value is persisted. The one exception is the email field, which `EMAIL.onSave()` (`page-account.js:25`) writes to `pendingEmail`. |
| **Sortable column headers** (5) | `shared.js:860-864`; headers at `invoices.html:28`, `index.html:68`, `users.html:72`, `license-details.js:279`, `styleguide.html:166` | Flips `aria-sort` and rotates the chevron. Rows never re-sort. Source comment says so. |

### B4 — Attributes emitted and never read

Harmless, but they document intentions that were not implemented.

| Attribute | Emitted at | Read by |
|---|---|---|
| `data-goto` | `components.js:209`, `license-details.js:535` | nothing (see B1) |
| `data-status` | `components.js:209` (every licence row) | nothing — not JS, not CSS |
| `data-title` | `<body>` of all 13 portal pages | nothing. `syncAppBar()` (`shared.js:665`) deliberately **empties** the title node; its own comment claims "`data-title` … is still read by the licence page's own chrome", which is no longer true |
| `data-feed="lic"` | `license-details.js:328` | nothing |
| `data-i` | `components.js:440` (audit toggle) | nothing (`data-audit` is what is read) |

---

## C. Journeys

### C1 — Land on the portal → sign up → verify email → first sign-in → first screen — `partial`

```
landing.html (guard: signed out only, shared.js guardSession)
  → header "Sign up"  [shared.js:438, data-auth=signup]
  → Auth dialog, signup screen  [auth.js:160 open()]
      fields: Full name, Email, Create a password   (nothing is validated)
      "Sign up" or either social button             [auth.js:196 → finish()]
  → setSession('new')  → dash='dashempty', billingData='none'
  → index.html, new-user screen (plan picker + PE block)
```

Breaks at **verify email**: there is no such step. Sign-up signs you in immediately,
so "first sign-in" and "sign-up" are the same click. Everything either side of that
step is complete, including the guard (13 portal pages redirect while signed out,
4 public pages stay — measured in both states).

Second entry, same destination:

```
landing.html → a plan card "Select"  [page-landing.js:31]
  → Store.pendingPurchase = {product, kind, plan}
  → Auth signup → finish() → index.html
  → page-home.js consumes pendingPurchase and opens the wizard on Customize
    ("Step 1 of 3", 33.3%, no Back)
```

### C2 — Sign in → forgot password → reset → sign in — `absent`

```
landing.html → "Log in" → Auth login screen
  → "Forgot password?"  [auth.js:148, data-stub]
  → placeholder dialog → Close → back on the login screen
```

Dead end at the first step past login. No reset screen exists.

### C3 — Buy a subscription, end to end — `complete`

```
index.html "Buy a license"          [index.html:26 #dashNewBtn → NL.open({})]
  or licenses.html "+ New license"  [licenses.html:42 → NL.open({})]
  or landing plan card (see C1)
  → Step 1 Choose your product and plan   (product cards, Subscription tab, plan cards)
  → Step 2 Customize                      (steppers, add-ons)
  → Step 3 Review order                   [#nlSumNext, wizard.js:500]
  → Step 4 Billing                        [#nlPayNow, wizard.js:674 — disabled until billValid()]
  → startPurchase(): button becomes a spinner, 1500ms   [wizard.js:818]
  → commitPurchase(): storeAddLicense(), Store.justCreated = id   [wizard.js:750-778]
  → wizard closes; the licence details surface opens over the page you bought from,
    carrying a one-time "created" banner; the list underneath is restated
```

Immediately after paying the user sees: **the new licence's details page**, with the
banner and the licence key. No receipt, no invoice, no email. There is deliberately
no success modal (source comment, `wizard.js:773`).

### C4 — Buy a perpetual package, end to end — `complete`

Same path as C3 with the Perpetual tab selected at step 1. Differences that are real:
single plan card per product (`EC_PLANS` `single:true`), step 4's confirm label changes
(`confirmLabel()`), and the committed licence gets `type:'Perpetual'`, `price:'one-time'`,
`event:'Aug 19 2027'` (`wizard.js:756-761`). Lands on the same details surface.

### C5 — Get a licence key and connect an instance — `partial`

```
licenses.html row → details (modal by default, page if licDetails='page')
  → key row: Reveal [#revealBtn], Copy [#copyBtn]   — both work
  → Installation instructions [#installBtn, data-stub]  → placeholder dialog
```

The key half is complete; the connect half does not exist (A3). The
`awaiting_checkin` licence (`B15`) shows a banner explicitly telling the user to
"activate an instance with it", and both of that banner's routes are stubs.

### C6 — Change a plan up / down, add an add-on, remove an add-on — `partial`

```
Change plan (up):
  licenses.html row kebab → "Change plan"  [components.js:167, data-changeplan]
  or details page → "Change plan"          [license-details.js:58 #changePlanBtn]
  → NL.openChange(lic): step 1 with product and billing LOCKED, current plan
    marked with a "Current plan" strip and made non-selectable
  → Customize → Review → commitChange()    [wizard.js:780]
  → details reopen in place; activity logs "Plan was changed from X to Y"

Add an add-on:
  row kebab → "Manage add-ons"  [components.js:167] → openManageAddons()
  or details → Plan & add-ons → "Manage"  [license-details.js:156, data-modal=add-ons]
  → same wizard, mode 'addons', shortened stepper (step 1 completed elsewhere)
  → commitChange() → details reopen with a one-time "what changed" banner
```

Down: see A10. Remove: see A5. Both modification modes end on the licence details
page with a banner; that half is complete.

### C7 — Cancel a licence, and come back from cancelled — `partial`

```
Cancel:
  row kebab → "Cancel subscription"  [components.js:166, data-cancel]
  or details kebab → "Cancel subscription"  [license-details.js:75]
  → openCancelModal()  [components.js:383]: names the licence, states the end date,
    "Keep subscription" focused as the default, "Cancel subscription" destructive
  → storeCancelLicense(id) — persisted, every surface sees it
  → the licence now shows the cancelled banner and a "Renew subscription" primary

Come back:
  details → "Renew subscription"  [#renewBtn, license-details.js:840]
    → placeholder dialog: "reactivate this subscription and resume billing (TODO)"
  row kebab → "Renew subscription"  [components.js:165, data-stub]
    → generic placeholder dialog
```

Cancel is complete and well-confirmed. The return path is a stub, **and the two
entries to it behave differently** (see E3).

### C8 — Renewal — `absent` (perpetual) / `partial` (subscription)

Subscription renewal is only the cancelled-licence return path of C7, which is a
stub. Perpetual updates renewal is A4. Nothing in the prototype renews anything.

### C9 — Update the payment method; add one when none exists — `partial` / `absent`

```
Update:
  billing.html → edit icon on the card  [billing.html:28 #payUpdateBtn]
  or licence details → Next charge → edit icon  [license-details.js:219 #ncEditPay → billing.html]
  or wizard step 4 → "Change → Billing & payment"  [wizard.js:549 #nlPayChange]
  → pay modal: card number / expiry / CVC / name / country, Update disabled until valid
  → "Update"  [page-billing.js:34] → closes the modal
  → nothing changed, nothing said
```

The form validates input and then discards it. Adding a first card is A9.
The payment-failed banner's route into this journey is dead (B1).

### C10 — Find an invoice and download it — `complete`

```
invoices.html (or Home "Recent invoices" block, or details → Invoices tab)
  → row action "Download PDF"  [components.js:136, data-dlinv]
    → downloadInvoice() builds a real file and downloads it
  → row action "View invoice"  [components.js:137, data-viewinv]
    → href="#" in markup, but filled with a blob URL during the CAPTURE phase of the
      click (components.js:881-884), so the browser opens it natively in a new tab
```

`href="#"` here is **not** a dead control — verified by reading the capture-phase
handler. Changing the billing details those invoices carry is A8.

### C11 — Invite a user, remove a user, `Log in as` and return — `complete`

```
Invite:
  nav → Users
  → solo state (1 user): line + email field + "Invite" + "Invite with a link"
    table state (2+): the same row directly above the toolbar
  → "Invite"  [users.html:32/52, data-invite → page-users.js:161]
    → duplicate check against current users → inline "Already has access", or
    → mintInvite() per address, storeAddUser(), inline confirmation under the field,
      new rows appear in the table
  → "Invite with a link"  [data-invitelink → page-users.js:116]
    → single-use token, monospace block, "Single use · expires in 7 days · revocable",
      Copied flash, "Revoke" → token dies (verified: inviteByToken returns null)
  → the invited person opens landing.html?invite=<token>
    → sign-up opens over the landing page with the email locked and a lock glyph
    → completing it burns the token and lands on Home as a new user

Remove:
  Users table row → "Delete"  [components.js:155, data-deluser]
  → openDeleteUser() confirmation → storeDeleteUser() → table restates

Log in as:
  Users table row → "Login as →"  [components.js:155, data-loginas]
  → openLoginAs() confirmation → impersonate() → persistent banner in the chrome
  → "Return to my account"  [shared.js:505 #impReturn] → back to your own account
```

Both ends of the impersonation are logged. This is the most completely wired journey
in the portal.

### C12 — Change profile details, change password, change email — `partial`

```
Profile details:
  profile menu → Account → edit name / company → "Save"  [#profSaveBtn]
  → wirePageSave: the button greys out. Nothing is persisted, nothing is confirmed.

Change password:
  Account → "Change password"  [account.html:23 → security.html]
  → current / new / confirm → "Save"  [#secSaveBtn]
  → wirePageSave: the button greys out. No validation, no persistence, no confirmation.
  → back via #secBackBtn → account.html

Change email:  ← the only one that works
  Account → email field → "Save"
  → EMAIL.onSave(): stores pendingEmail, the field REVERTS to the active address,
    a pending line appears with "Resend" and "Cancel"
  → confirming requires the ⚙ settings panel's "Confirm email change"
    [shared.js:609 #devConfirmEmail] — a prototype dev action, not a user path
  → emailConfirmed is applied on the next Account load
```

Leaving any of these three pages with unsaved edits is guarded (`guardLinks()`,
`components.js:591`) — the guard is real even though the save is not.

### C13 — Community Grant — `partial`

```
Grant pending state (dash='dashgrantpending'):
  index.html → status card "Your Community Grant is almost ready"
  → "Learn more"  [#grantLearnBtn, page-home.js:167]
    → placeholder dialog: "the programme page is not part of this prototype"

Grant approved state (dash='dashgrant'):
  index.html → dismissible banner
  → "View license"  [#grantViewBtn, page-home.js:161] → opens the grant licence details
  → "✕" → dismissed, remembered (Store.dismissed)
  Licenses table → the B15 "Community Grant" row → full details page
```

`View license` and the row both work. `Learn more` — the only route to what the grant
*is* — is a placeholder. There is no path to *apply* for a grant anywhere.

### C14 — Migration banner — `absent`

No such banner exists (A7).

---

## D. Journeys found in the code that were not on the list

| # | Journey | State | Path |
|---|---|---|---|
| D1 | **Apply a coupon** | `partial` | details → `Apply coupon` [`#couponBtn`] → coupon modal → `Apply` disabled until non-empty → applies… nothing. The modal closes; no discount appears on any surface. |
| D2 | **Rename a licence (label)** | `complete` | row kebab → `Edit label`, or details → pencil / `+ Add label` [`data-editlabel`] → inline input → `Save` → persisted, visible on every surface. |
| D3 | **Delete the account** | `partial` | Account → `Delete account` [`#deleteAcctBtn`] → confirmation dialog → confirming does not delete anything or sign you out. |
| D4 | **Sign out** | `complete` | profile menu → `Sign out` [`#signOutBtn`] → `setSession('out')` → landing.html. |
| D5 | **Reset the demo** | `complete` | ⚙ panel → `Reset demo data` → `Store.reset()` + reload → lands on landing.html, because `auth:'out'` is the seed. |
| D6 | **Filter the licence list** | `complete` | `Subscription` / `Perpetual` type chips [`licenses.html:21-22`] and the phone-only cancelled chip [`#licCanceledChip`] both filter the rows for real. The one working filter in the prototype — next to five search boxes that do not. |
| D7 | **Filter activity by period** | `complete` | period button → menu → `All time` / `24h` / `7d` / `30d` / `Custom range…` → `Apply`. Works on the Activity page and inside the licence's Activity tab. |
| D8 | **Expand an activity entry** | `complete` | feed row → audit toggle [`data-audit`] → expands the raw record. |
| D9 | **Switch instance type** | `complete` | details → Instances tab → `Production` / `Development` chips [`data-insttype`] → panels swap. |
| D10 | **Prototype settings panel** | `complete` | ⚙ FAB → context-aware panel: dashboard state, licence-details mode, tier jump links, navigation to the styleguide, dev actions. Not a user journey — scaffolding. |

---

## E. Orphans, dead ends and inconsistencies

### E1 — Orphans (no path reaches them)

| Surface | How it was reached | What would have to link to it |
|---|---|---|
| **`styleguide.html`** | Only from the ⚙ settings panel (`shared.js:600`). Not in any nav, not in the footer. | Intentional — it is prototype scaffolding. Noted because the file is `data-public` and therefore also reachable by typing the URL while signed out. |
| **Dashboard states `dashgrantpending`, `dashgrant`, `dashboard` (A)** | Only by switching them in the ⚙ panel. | No in-product event produces a grant. The Community Grant has a licence row and two banners but no application flow (C13). |
| **The `solo` state of the Users page** | Only when the account has exactly one user — i.e. dataset **G**, or by deleting rows down to one. | `dashempty` ("new user") reads dataset **A**, which has two users, so a brand-new account never sees the solo state. |
| **`prototypeaddons` tier** | ⚙ panel tier links only. No dataset row uses it. | Already recorded as a deliberate decision in NOTES.md. |
| **Perpetual `Add capacity` dialog** | Reachable, but it is a placeholder (B2). | — |

### E2 — Dead ends (enterable, not leavable except by browser back or nav)

| Screen | Why |
|---|---|
| **Every placeholder dialog** (B2) | The only control is `Close`. You return to where you were, having learned that the thing does not exist. Eight distinct controls lead here. |
| **`security.html` (Change password)** | `Save` does nothing and says nothing (B3). The only real exits are `#secBackBtn` and the nav. A user who fills the form correctly gets no signal that they are done. |
| **Update payment method modal** | `Update` closes the modal and changes nothing (B3). Indistinguishable from `Cancel`. |
| **`billing.html`** | Same as Security: `Save` greys itself out with no note. |
| **The awaiting-check-in licence (`B15`)** | The banner states the one thing left to do and both routes to it are stubs (C5). |

### E3 — Actions that change data with no confirmation of what happened

| Action | What changes | What the user is told |
|---|---|---|
| `Save` on Account (name, company) | **nothing is persisted** | the button greys out; `wirePageSave` is called with `noteSel = null` (`page-account.js:54`), so there is no note on this page **by design** |
| `Save` on Billing | nothing persisted | button greys out, no note |
| `Save` on Security | nothing persisted | button greys out, no note |
| `Update` (payment modal) | nothing | modal closes |
| `Apply` (coupon modal) | nothing | modal closes |
| `Delete account` | nothing | dialog closes |
| Sortable header click | nothing | the chevron flips — the control *visibly reacts* and the data does not move |

Actions that **do** change data and **do** confirm: invite (inline confirmation +
new rows), delete user (confirmation dialog + row disappears), cancel subscription
(dialog + status change + banner), purchase (details page + created banner), plan
change (details page + changed banner), label edit (value appears everywhere).

### E4 — Two paths to the same destination that behave differently

| Intent | Path A | Path B | Difference |
|---|---|---|---|
| **Renew a cancelled subscription** | Licence details primary `Renew subscription` (`license-details.js:840`) | Row kebab `Renew subscription` (`components.js:165`, `data-stub`) | Different dialogs: A says "reactivate this subscription and resume billing (TODO)", B says "not part of this wireframe spec yet". Same intent, two texts. |
| **Add capacity (perpetual)** | Details page / Plan block button (`data-modal="add-capacity"` → `license-details.js:819`) | Row kebab `Add capacity` (`components.js:163`, `data-stub`) | A describes what it would do; B is the generic placeholder. |
| **Update the payment method** | `billing.html` edit icon → pay modal | Payment-failed banner action | A opens the modal; **B does nothing at all** (B1). |
| **Open licence details** | Row click / row link → `license.html` or the modal, depending on `licDetails` | Wizard commit → `openLicenseDetails(lic, null, {refreshHost:true})` | Same surface, but the wizard path always opens it over the page you were on regardless of the `licDetails` setting. |
| **Confirm an email change** | The pending line's own text button (`#emailPendingTxt`, `page-account.js:41`) confirms it | The ⚙ panel's `Confirm email change` stores `emailConfirmed` and reloads | Two mechanisms for one action; the in-page one is undocumented and looks like a status label, not a control. |

### E5 — Desktop / mobile divergence

| Journey | Desktop | ≤600px |
|---|---|---|
| **Licence details actions** | `Apply coupon`, `Change plan`, `Renew`, `Add capacity` sit in the header; `⋮` appears only for perpetual/cancelled | One primary button; everything else moves into `⋮` as a bottom sheet (`.mob-only` items at `license-details.js:71-73`) |
| **Reveal key / Installation instructions** | Icon buttons beside the key | Also in the `⋮` sheet — so a phone user has two routes to the same stub |
| **Banner actions** | Long label (`Update payment method`, `Renew updates`) | Short label (`Update`, `Renew`); the `Set up` action is `mobOnly` and **only exists on the phone** (`alertAction(..., true)`), so the awaiting-check-in licence has one extra route on mobile than on desktop |
| **Cancelled-licence overflow** | `⋮` visible | `⋮` visible, with per-item hiding — the item set differs between the two |
| **Invite row** | input + `Invite` + link on one row | stacks to full-width input, full-width button, link beneath |
| **Users list** | table with a toolbar | same table, toolbar's refresh moves into the page header row |
| **Nothing breaks in one and works in the other.** All five list pages, both licence-details presentations, all four wizard steps and both auth screens were walked at 390px and 1280px in both session states: no journey is reachable on one and unreachable on the other. |

### E6 — Incidental

- `shared.js:686-691` — an orphaned comment block describing the removed profile
  submenu sits directly above the note that says it was removed.
- `components.js:378` — `openRowLink`'s fallback placeholder is unreachable while
  every row carries a resolvable `data-licid`.
- `license-details.js:879` — the `NESTED` list (which overlays suppress the licence
  modal's own Escape handling) still names `'#addUserOverlay'`, a node that no longer
  exists. Guarded at `license-details.js:968` (`el && !el.hidden`), so it is inert,
  not a fault.
- `license-details.js:785` and `page-billing.js:34` carry the same comment shape —
  `// stub: no real …` — on the two Apply/Update buttons of E3. The source is honest
  about both; the UI is not.

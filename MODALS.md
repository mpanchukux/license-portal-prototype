# Modal surfaces — measured

Measurement only. Nothing was changed to make anything fit, and nothing was compensated by
shrinking padding, tightening line-height or truncating text.

## Which build every number in this file saw

Three builds. Every section below names the pair it was measured against, and no table
mixes two.

| | build | what it is |
|---|---|---|
| **A** | `before` | **`4c8678f`** — the last commit before the typography passes |
| **B** | `after` | **`67b7d18`** (`HEAD`) — the type passes, committed |
| **C** | `fixed` | **the working tree** — `HEAD` plus five uncommitted changes |

The five changes in C are the four non-type fixes (§3) **and one copy change**: the
perpetual production-instances sentence in `wizard.js` gained `to scale out`. That clause is
part of C, not of B, so any movement on a ThingsBoard-perpetual wizard step belongs to the
copy, not to a fix.

| section | measured | cells |
|---|---|---|
| §1 what the type floor did | **A → B** | 200 + 48 re-measured |
| §2 every cell (the grid) | **A → B** | the licence rows re-run bar-free this session |
| §3 what the four fixes did | **B → C** | 216, 0 voided |
| §3.1 the wrap on its own | **B → B+fix1** | 64, 0 voided |
| §3.2 the four targets, read directly | **B** and **C** side by side | 80 reads |

Every reading in every section is taken with the prototype's settings bar **removed** from
the measured document — `.statebar` deleted, `has-statebar` dropped from `body`, `--sbH`
unset. The bar is review scaffolding and is not part of the product; left in place it was
taking 158px out of every overlay at 1280/1150/944/760, 190px at 700 and 229px at 601.

> The earlier version of this file carried a warning that it mixed two bases, and the grid
> carried eleven rows flagged `⚑` as still bar-inflated. Both are gone: the perpetual rows
> and the licence rows were re-run this session, and the file now stands on the three bases
> above.

---

## 1. What the type floor broke — A → B

### 1. Panels that fitted before and scroll now

The finding asked for first. Five cells, two surfaces.

| surface | width | scroll box | content before → after | box before → after | exceeds by |
|---|---:|---|---|---|---:|
| wizard · Capacity · TB perp | 600 | `#nlBody` | 746 → **787** | 746 → 746 | 41px |

⚠️⚠️ **ONE CELL. THE OTHER FOUR WERE THE SETTINGS BAR.** Everything above 600px that
appeared here — Capacity · TB sub at 1280 and 1150, Manage add-ons at 944, Add-ons · TB
perp at 601 — was measured with the prototype's own settings bar expanded, and that bar
takes **158px** out of every overlay at 1280/1150/944/760, **190px** at 700 and **229px**
at 601 (`body.has-statebar .fs-box{height:min(90vh, calc(100vh − var(--sbH) − 32px))}`).
Re-measured with the bar removed: **not one surface above 600 crosses from fitting to
scrolling.** `Capacity · TB sub` at 1280 reads 834 of content in a box of 834.

The one that stands is at **600**, where the bar is hidden anyway (`--sbH` = 0), so nothing
was subtracted and the 41px is the step's own.

⚠️⚠️ **THE CAPACITY SCROLL AT 600 IS A DECISION, NOT A DEFECT (2026-10-02).** The product
recap stays at the top of the step and the step scrolls. Recorded in NOTES; a later run that
reports it as a finding is re-opening a closed question. The same note once covered 1280,
1150 and 944 — that half is withdrawn, because there was nothing there to decide about.

### 2. Text clipped — content past a box that cannot scroll it

Only one element, and only on the licence panel's **page** host. `.canvas` is
`overflow:hidden`, the instances table inside it is wider, and the markup gave it no
scroller — so there was nothing to catch the overflow.

`DIV.canvas`, horizontal, A → B:

| surface | 760 | 700 | 601 |
|---|---|---|---|
| licence panel (page) · subscription · alert | 30 → **64** | 90 → **124** | 189 → **223** |
| licence panel (page) · subscription · no alert | 30 → **64** | 90 → **124** | 189 → **223** |
| licence panel (page) · perpetual | 27 → **53** | 87 → **113** | 186 → **212** |

Nothing at 1280, 1150, 944, 600 or 390; nothing on `grant`, which has no instances table;
and nothing on the **modal** host at any width — this was a page-host defect only.

⚠️ **Pre-existing in every case.** The pass made it 26–34px worse; it did not create it.

⚠️ **`SPAN.inst-id` was excluded as deliberate.** It is `max-width:22ch` plus
`text-overflow:ellipsis` — a uuid truncating on purpose. Its hidden amount grew 118 → 135px
because the glyphs grew, but nothing is newly cut off. It appears in 72 of the 81 clip
records in this run; counting it would have buried the nine that matter.

→ **Fixed in C.** See §3.2: 223 / 124 / 64 → **0**.

### 3. Content past the panel's own frame

The same defect seen from the other side: the instances table, and everything inside it,
sticking out past the frame. Collapsed to the widest offender per cell — every `TR`, `TD`,
`svg` and `use` in the table overflows by the same amount.

| surface | width | widest offender | A → B | descendants with it |
|---|---:|---|---|---:|
| licence panel (page) · subscription (both) | 760 | `TABLE.insttable` | 6 → **40** | 19 |
| licence panel (page) · perpetual | 760 | `TABLE.insttable` | 3 → **29** | 15 |
| licence panel (page) · subscription (both) | 700 | `TABLE.insttable` | 66 → **100** | 25 |
| licence panel (page) · perpetual | 700 | `TABLE.insttable` | 63 → **89** | 25 |
| licence panel (page) · subscription (both) | 601 | `TABLE.insttable` | 165 → **199** | 25 |
| licence panel (page) · perpetual | 601 | `TABLE.insttable` | 162 → **188** | 25 |

**No overlay-hosted surface has any.** Not the wizard, not the modal licence panel, not the
coupon overlay, the pay overlay, the Users modal, the cancel dialog or the sheets.

### 4. Fixed-height controls whose content no longer fits

**None**, on any surface at any width. Steppers, buttons, the summary rail and its CTA all
still contain their content.

### 5. Inputs below 16px

**None.** 616 input readings across every surface and width, all 16 or more. No rule had to
be split to get there — after the re-addressing pass they were already on `--t-body-fs`.

---

## 1b. New wraps — A → B

Grouped by the element and its text; the surface family and the widths it wraps at.

### The two that change a dialog's shape

| element | text | lines | widths | surface |
|---|---|---|---|---|
| `DIV.modal` | the whole Cancel dialog | **14→16** | 1280 1150 944 760 700 601 | cancel subscription |
| `SPAN.cancel-help` | Something not working? Contact support | **3→5** | 1280 1150 944 760 700 601 | cancel subscription |

The cancel dialog's helper line goes from three lines to five at every width above the
phone, and the dialog grows two lines with it.

### Wizard — Capacity and Manage add-ons

| element | text | lines | widths |
|---|---|---|---|
| `DIV.am-sec nl-cardstack` | Devices … | 22→23 | 1280 1150 |
| `DIV.am-sec nl-cardstack` | Sessions … | 14→15 / 18→19 | 944 390 |
| `DIV.am-groupbody` | Production — 1 included … | 8→9 | 1280 1150 |
| `DIV.am-cell` | AI credits … | 5→6 | 1280 1150 601 600 |
| `DIV.am-cell` | Development … | 4→5 | 1280 1150 |
| `DIV.am-cell am-locked` | Devices / Sessions / Messages per sec … | 4→5 / 5→6 | 944 390 |
| `DIV.fs-cellhead`, `.fs-celltext` | the same four cells | 2→3 / 3→4 | 1280 1150 944 601 600 390 |
| `DIV.fs-celldesc` | every cell description | 1→2 / 2→3 | 1280 1150 944 601 600 390 |

The cell description is the element that wraps most often on this surface, and it is what
pushes the step past its box.

### Wizard — Choose your plan and Change plan

| element | text | lines | widths |
|---|---|---|---|
| `DIV.pc-feats` | the whole feature list on each card | 13→14 | 1150 |
| `DIV.pc-feat` · `SPAN.pc-feattxt` | 4M / 8M / 5M AI credits, +$0.10 per extra device, 5,000 devices included, Add devices and instances at any time | 2→3, 1→2 | 1150 |
| `DIV.pc-feat` · `SPAN.pc-feattxt` · `SPAN.pc-featnote` | 1 / 2 / 3 prod instances | 3→4 / 4→5 | 600 390 |

⚠️ **1150 is where the plan cards wrap and no other width does.** Every card's feature list
gains a line there — at 1280 it does not, and at 944 the layout has already changed.

### Wizard — Add-ons and Review & pay

| element | text | lines | widths |
|---|---|---|---|
| `LABEL.am-cell am-addon` | Edge Computing | 5→6 | 1280 1150 601 600 |
| `LABEL.am-cell am-addon` | Trendz Analytics | 5→6 | 944 |
| `DIV.am-cell am-feature` | White labeling | 4→5 | 944 |
| `DIV.fs-grid` · `DIV.fs-col` | the whole review column | 16→17 | 944 |
| `DIV.nl-joined` | the plan summary block | 11→12 | 944 |
| `DIV.nl-terms` · `P.nl-termline` | billing terms, tax note | 3→4, 1→2 | 944 |
| `LABEL.nl-legal` · `SPAN.nl-legaltxt` | the agreement checkbox label | 3→4 | 944 |

### Licence panel, both hosts

| element | text | lines | widths | host |
|---|---|---|---|---|
| `H3.fhead` | Add-ons | 1→2 | 760 700 601 | both |
| `SPAN.fchip-none` | No add-ons on this license. | 2→3 | 944 760 700 601 | both |
| `SPAN.inst-label` | HQ node 1 / HQ node 2 | 2→3 | 760 700 601 | page |
| `P.inst-note` | Licenses check in every hour … | 1→2 / 2→3 | 760 390 | page |
| `DIV.emptybox` | An instance appears here after it connects … | 4→5 | 601 | page |
| `P.eb-p` | Instances appear here automatically when … | 3→4 | 390 | modal |
| `A.link` | How to activate an instance | 1→2 | 390 | modal |

⚠️ **`Add-ons` — a two-word heading — wraps.** That is the smallest piece of text in the
report that changed line count.

→ **Addressed in C, with a cost.** §3.2: the heading goes back to one line at all three
widths — but §3.3 shows the `Manage` button leaves its row there and stops being flush
right.

### Everything else

| element | text | lines | width | surface |
|---|---|---|---|---|
| `P.invite-note` | Anyone you invite gets full access … | 1→2 | 600 | Users modal |
| `SPAN.paystripe-note` | Powered by Stripe | 1→2 | 390 | add payment method |

---

## 2. Every cell — A → B

Content height of each surface's own scroll box: `+n` the content grew by n px,
`/n` it exceeds its box by n px after the pass, `!` it fitted before and does not now,
`—` no change, `·` the surface does not exist at that width.

**Every column is measured with the scaffolding gone**, and this session that finally means
all eight. The eleven `⚑` rows are retired: the eight licence-panel rows were re-run
A → B with the bar removed, 64 cells, 0 voided, and their numbers here are from that run.
The other 22 rows are from the previous session's 200-cell run, which used the same removal
procedure — `.statebar` deleted, `has-statebar` dropped from `body`, `--sbH` unset — so the
whole table stands on one footing.

⚠️⚠️ **THE 600 AND 390 COLUMNS MOVED TOO, AND THE OLD NOTE SAYING THEY COULD NOT WAS
WRONG.** The claim was that the bar is `display:none` at ≤600 so those columns never carried
it. The bar is indeed hidden there — but `has-statebar` was still on `body`, and one rule
needs only the class:

```css
body.has-statebar #shellMain{padding-bottom:0}
```

At ≤600 the product reserves room for the bottom navigation with
`#shellMain{padding-bottom:calc(var(--bnavH) + 12px)}` — **76px**. The scaffolding class
cancelled that reservation, so every phone-width reading of the page host was short by 76px
of the page's own gutter. Measured directly on `license.html` with nothing open:
`#shellMain` scrollHeight 1317 → 1393 at 600, and 1463 → 1539 at 390, with `clientHeight`
unchanged at 843 either way. The numbers below are the ones with the class gone.

| surface | 1280 | 1150 | 944 | 760 | 700 | 601 | 600 | 390 |
|---|---|---|---|---|---|---|---|---|
| Users modal (invite user) | +3 | +3 | +3 | +3 | +3 | +13 | — | — |
| add payment method | — | — | — | — | — | — | — | — |
| cancel subscription | +15 | +15 | +15 | +15 | +15 | +15 | +7 | +10 |
| coupon overlay | — | — | — | — | — | — | — | — |
| filter sheet · Activity period | · | · | · | · | · | · | — | — |
| filter sheet · Activity type | · | · | · | · | · | · | — | — |
| filter sheet · Invoices status | · | · | · | · | · | · | — | — |
| filter sheet · Licenses | · | · | · | · | · | · | — | — |
| licence panel (modal) · grant | — | — | — | — | +1/1 | +11/91 | +14/30 | +17/106 |
| licence panel (modal) · perpetual | +15/190 | +15/190 | +39/255 | +13/494 | +36/465 | +38/579 | +20/356 | +21/455 |
| licence panel (modal) · subscription · alert | +15/254 | +15/254 | +39/371 | +13/506 | +36/529 | +39/605 | +20/396 | +22/517 |
| licence panel (modal) · subscription · no alert | +15/190 | +15/190 | +39/307 | +13/442 | +36/465 | +39/541 | +20/356 | +22/477 |
| licence panel (page) · grant | — | — | — | -8/14 | +15/89 | +69/194 | +47/224 | +22/300 |
| licence panel (page) · perpetual | +17/238 | +17/238 | -17/303 | +16/542 | +42/537 | +72/658 | +53/550 | +51/673 |
| licence panel (page) · subscription · alert | +17/302 | +17/302 | -17/367 | +16/554 | +42/601 | +73/684 | +53/590 | +53/736 |
| licence panel (page) · subscription · no alert | +17/238 | +17/238 | -17/303 | +16/490 | +42/537 | +73/620 | +53/550 | +53/696 |
| wizard · Add-ons · TB sub | — | — | — | — | — | — | — | +39/103 |
| wizard · Add-ons · TB perp | — | — | — | — | — | — | — | — |
| wizard · Add-ons · TBMQ perp | — | — | — | — | — | — | — | — |
| wizard · Capacity · TB perp | — | — | — | — | — | +1/1 | +41/41 ! | +72/203 |
| wizard · Capacity · TB sub | — | — | — | +32/71 | +32/71 | +57/96 | +58/136 | +83/348 |
| wizard · Capacity · TBMQ perp | — | — | — | — | — | — | — | +88/127 |
| wizard · Capacity · TBMQ sub | — | — | — | — | — | — | — | +87/148 |
| wizard · Change plan | — | — | — | +30/557 | +30/557 | +30/557 | +131/865 | +148/999 |
| wizard · Choose your plan · TB sub | — | — | +38/402 | +64/1304 | +64/1304 | +64/1304 | +131/1023 | +151/1179 |
| wizard · Manage add-ons | — | — | — | +31/36 | +31/36 | +56/61 | +58/84 | +83/296 |
| wizard · Review & pay · TB perp | — | — | — | — | — | — | — | +39/96 |
| wizard · Review & pay · TB sub | — | — | — | — | — | — | — | +35/72 |
| wizard · Review & pay · TBMQ perp | — | — | — | — | — | — | — | +38/74 |
| wizard · Review & pay · TBMQ sub | — | — | — | — | — | — | — | +35/72 |

⚠️ **The negative numbers at 944 and 760 are real.** The licence panel is 17–23px *shorter*
after the pass at those two widths: a block recomposed and the saving beat the size gain.
Not chased further.

⚠️ **Most of the `/n` figures are pre-existing overflow, not new.** The column that matters
for "did this break" is §1 — where `/n` appears beside a `!`, the panel crossed from fitting
to scrolling. Everywhere else it was already scrolling and now scrolls further.

---

## 3. What the four fixes did — B → C

**216 cells · 30 surfaces × 8 widths · 0 voided.** Widths 1280 · 1150 · 944 · 760 · 700 ·
601 · 600 · 390.

> **One guard was relaxed, on purpose.** A cell used to be voided when the two builds had
> different node counts. Fix 1 **wraps** the instances tables, so it changes the node count
> by design — and voiding then hid the one number the fix is judged on. Pairing element *i*
> against element *i* is what a tree mismatch invalidates, so only the per-element lists are
> now withheld; the panel geometry is read from the scroll box, not from the pairing, and
> stays reportable. The 64 licence-panel cells run as `paired:false`, not as voided.

### 3.0 Did anything else move?

**22 of the 30 surfaces did not change height at any of the eight widths.** The whole wizard
(every step, both products, both billing models), Change plan, Manage add-ons, the users
modal, the coupon overlay, add-payment-method, cancel-subscription and all four filter
sheets: zero at every width.

Only the licence panel moved. It moved **everywhere**, including at 600 and 390:

| surface | 1280 | 1150 | 944 | 760 | 700 | 601 | 600 | 390 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| panel (modal) · subscription · alert | +12 | +12 | **−53** | +37 | +14 | +36 | +12 | +12 |
| panel (modal) · subscription · no alert | +12 | +12 | **−53** | +37 | +14 | +36 | +12 | +12 |
| panel (modal) · perpetual | +12 | +12 | **−53** | +29 | +14 | +37 | +12 | +12 |
| panel (modal) · grant | 0 | 0 | 0 | 0 | +1 | +25 | 0 | 0 |
| panel (page) · subscription · alert | +12 | +12 | +12 | +37 | +13 | +37 | +12 | +12 |
| panel (page) · subscription · no alert | +12 | +12 | +12 | +37 | +13 | +37 | +12 | +12 |
| panel (page) · perpetual | +12 | +12 | +12 | +37 | +13 | +37 | +12 | +12 |
| panel (page) · grant | 0 | 0 | 0 | +24 | +1 | +25 | 0 | 0 |

Change in the panel's own scroll box (`#licModalBody` for the modal host, `#shellMain` for
the page host), in px. Grant has no instances table, which is why it is mostly zero.

Two element-level movements in the whole 216-cell run, both decorative and both leaving the
panel's height untouched: `DIV.meshbg` clipped 84 → 85px on *Review & pay · TBMQ sub* at
1280, and the empty `SPAN.mb-cream` on *Choose your plan · TB sub* at 944.

### 3.1 The wrap on its own — B → B+fix1

A third mirror was built: `HEAD` plus **only** the `.tablescroll` wrap and the one rule that
makes it scroll. Nothing else. 64 cells, 0 voided.

| surface | 1280 | 1150 | 944 | 760 | 700 | 601 | 600 | 390 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| panel (modal) · subscription (both) | +12 | +12 | **−53** | +12 | +12 | +12 | +12 | +12 |
| panel (modal) · perpetual | +12 | +12 | **−53** | +4 | +12 | +12 | +12 | +12 |
| panel (modal) · grant | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| panel (page) · subscription, perpetual | +12 | +12 | +12 | +12 | +12 | +12 | +12 | +12 |
| panel (page) · grant | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**So the answer to "did wrapping the instances tables change the panel's height anywhere" is
yes — by a flat +12px at every width in both hosts, and by −53px at 944 in the modal host.**
It is not nothing, and it is not width-dependent noise: it is the same 12px everywhere the
table exists, and zero wherever it does not.

The remainder of the B→C deltas — the +25 at 760 and 601, the +24/+25 on grant — is fix 3,
and §3.2 measures it directly.

### 3.2 Did each fix remove what it targeted?

Read directly in both builds, 80 readings, 5 surfaces × 8 widths × 2 builds.

**Fix 1 — `.insttype > .tablescroll{overflow-x:auto}` + the markup wrap.** Target: `.canvas`
cutting the instances table off with nothing to scroll it.

| width | page host: `.canvas` clipX | scrollable after |
|---:|---|---:|
| 601 | **223 → 0** | 241px |
| 700 | **124 → 0** | 142px |
| 760 | **64 → 0** | 82px |
| 1280 · 1150 · 944 · 600 · 390 | 0 → 0 | 18px |

Removed exactly, at exactly the three widths where it existed. In the **modal** host `.canvas`
clipX was already 0 at every width — the clip was a page-host defect only. At every width the
table now has a real scroller rather than a hidden overflow.

**Fix 2 — `.cancel-help{flex:1 1 100%;order:-1}` + `flex-wrap` on `.modal .mf`.**

| | B | C |
|---|---|---|
| `.cancel-help` | 5 lines in an 83px column, 116px tall | **1 line in 426px, 23px tall** |
| the dialog | 363px tall | **318px** |
| the footer `.mf` | 141px, `nowrap` | **96px**, `wrap` |

Measured at 1280; identical at 1150 · 944 · 760 · 601. **No change at 600 or 390** — and that
is correct, not a miss: `@media (max-width:600px)` already carried `.cancel-help{flex:1 1 100%;
order:-1}` and `.modal .mf{flex-wrap:wrap}`. The defect existed **only above 600px**; the fix
promoted the phone behaviour to every width. (At 600 and 390 the dialog shows a single
`Close` button, so there is no row to wrap.)

**Fix 3 — `.fhead{margin:0;flex:none}` + `flex-wrap` on `#featureBlock .sh`.**

| width | `.fhead` B → C | `.sh` row height |
|---:|---|---|
| 760 · 700 · 601 | **2 lines / 40px wide / 34px tall → 1 line / 73px / 17px** | 40 → **65px** |
| 1280 · 1150 · 944 · 600 · 390 | 1 line / 73px / 17px — unchanged | unchanged |

The heading stops wrapping, at exactly the three widths where it wrapped. **But the row it
lives in grows 40 → 65px, and that is where the +25px in §3.0 comes from.**

**Fix 4 — `.paystripe-note{white-space:nowrap}`.**

| width | B → C |
|---:|---|
| 390 | **2 lines / 106px / 41px tall → 1 line / 119px / 20px** |
| every other width | 1 line already — unchanged |

Removed exactly where it existed. The note does not appear on the wizard's *Review & pay* at
any width; it was found on *add payment method* only.

### 3.3 Did `flex-wrap` reorder anything?

This is the question a wrap actually raises, and it was checked at all eight widths by
reading the children's own boxes and sorting them the way a reader's eye does — down first,
then across.

**`.modal .mf` (the dialog footer): no reorder at any width.** The visual order is
`cancel-help` · `Keep subscription` · `Cancel subscription` in both builds at 1280, 760 and
601, and at 600 and 390 the dialog has a single `Close` button.

**`#featureBlock .sh` (the Plan/Add-ons head): the order changes at 760, 700 and 601** — but
the only element that changes places is the invisible `.spacer`. What a reader sees is this:

| | B | C |
|---|---|---|
| `Add-ons` heading | x 0, 40px wide, two lines | x 0, 73px wide, one line |
| `Manage` button | same line, **flush right** (0px from the row's right edge) | **second line**, x 0, 13px from the row's right edge |
| the row | 142px wide, 40px tall | 99px wide, 65px tall |

**`Manage` is no longer on the heading's line and is no longer flush right at 760, 700 and
601.** At 944 and above, and at 600 and below, it is unchanged. This contradicts the earlier
decision that `Manage` stands to the right of the Plan head, so it is reported here as a
finding rather than folded into "fix 3 worked". Not changed — this file fixes nothing.

> ### ⚠️⚠️ SUPERSEDED — fix 3 was reworked after this run (2026-10-02)
>
> The finding above was acted on. `flex-wrap:wrap` is **gone** from `#featureBlock .sh`, and
> `.fhead` carries `white-space:nowrap` instead. The numbers in §3.2 and §3.3 describe the
> wrapped version and no longer describe the code.
>
> What the wrap was actually doing, measured afterwards: this row sits in `.planblock`'s
> second track, `minmax(min-content,1fr)`, and a **wrapping** flex container's min-content is
> its widest single item rather than the sum of a line. The track's floor therefore fell from
> the whole row to the `Manage` button, and the entire Add-ons column went **142 → 99px** at
> 760, 700 and 601 — the chips narrowed with it and the plan table absorbed the 43px. The
> button sitting 13px from a 99px edge was the symptom; the collapsed column was the cause.
>
> Re-measured with the wrap removed and the hyphen break forbidden — `Add-ons` has a hyphen,
> so its min-content was `Add-` at 40px, which is why `flex:none` alone left the button
> overflowing the row by 33px:
>
> | width | heading | `Manage` | row | Add-ons column | plan table |
> |---:|---|---|---|---:|---:|
> | 1280 · 1150 | 1 line, 73px | heading's row, flush right | 389×40 | 389 (—) | 595 (—) |
> | 944 | 1 line, 73px | heading's row, flush right | 217×40 | 217 (—) | 595 (—) |
> | 760 | 1 line, 73px | heading's row, flush right | 175×40 | 142 → **175** | 501 → **468** |
> | 700 | 1 line, 73px | heading's row, flush right | 175×40 | 142 → **175** | 446 → **413** |
> | 601 | 1 line, 73px | heading's row, flush right | 175×40 | 142 → **175** | 379 (—) |
> | 600 · 390 | 1 line, 73px | heading's row, flush right | 568/358×44 | — | — |
>
> **The heading's row was used at all eight widths**; the full-width second row was never
> needed. The row stays 40px tall (44 at ≤600), so the +25px §3.0 attributed to fix 3 is
> gone. The cost is 33px of plan table at 760 and 700 — it does not overflow at any width
> (`scrollWidth = clientWidth` throughout). Panel height against B: +12 at 1280, −53 at 944,
> +12 at 760, **+36** at 700, +12 at 601, +12 at 600 and 390.

---

## 4. How each surface was opened, and the guards

Both builds are driven by the same opener function and must end in the same state.

| surface | how it was opened |
|---|---|
| wizard, steps 1–4 | `Buy a license` → product tab → billing tab → `Select` → `Continue` ×n |
| licence panel (modal) | first row of the matching kind on `licenses.html` |
| licence panel (page) | `license.html?id=B13` / `B10` / `B15` directly |
| `#subAlert` present / absent | the banner's `hidden` set explicitly after mount, in both builds |
| coupon overlay | panel of a perpetual licence → `#couponBtn` |
| cancel subscription | panel of a subscription → `#headKebabBtn` → `Cancel subscription` |
| Change plan / Manage add-ons | panel of a subscription → `#changePlanBtn` / `#planManageBtn` |
| add payment method | `PayCard.open(null)` — every `[data-paycard]` sits in a banner that needs the `card_expiring` condition, so the product's own builder is called instead |
| Users modal | `#usersMenuBtn` |
| filter sheets | the `.perbtn` inside each control |

**Guards.** A measurement that cannot fail proves nothing — this run produced five
plausible-looking wrong answers before it produced a right one.

1. **nodes** — a 404 renders a near-empty document. Caught `license?id=B13.html`, where the
   query was appended after `.html`: four cells, "nodes 9/9".
2. **address** — signed out, portal pages redirect to the landing; signed in, landing and
   signin redirect to index. Both directions have faked a result in earlier runs.
3. **scroller** — the page does not scroll, `#shellMain` does; with a modal open, neither
   does: its own `.fs-body` / `#nlBody` / `.fsheet-list` does. Reading the wrong box
   reported "+0 everywhere" once already.
4. **parity** — the two builds must end in the same state.
5. **expected surface** — ⚠️ **added during this run, because guard 4 was not enough.**
   Guard 4 compares the two builds and says nothing about intent. When an opener failed to
   reach its modal, *both* builds fell back to the licence panel underneath, agreed with
   each other, and four surfaces — coupon, cancel, Change plan, Manage add-ons — were
   measured as the panel behind them, under four different names. The tell was in the data:
   all four returned byte-identical numbers, and the same ones as the licence panel.

⚠️ **And the root picker was wrong underneath that.** `signature()` took the last matching
overlay in *document order*; these surfaces **nest**, and `#licModal` is later in the markup
than `#couponOverlay` and `#nlModal`. It now sorts by `z-index` — stacking order is what the
reader sees. Both fixes are in `tools/measure-modals.js` with the reasoning beside them.

### What changed in the rig this session

**The tree guard became a flag, not a void.** A cell used to die when the two builds held a
different number of nodes. Fix 1 **wraps** two tables, so it changes the node count on
purpose, and the guard was killing exactly the 64 cells the fix had to be judged on. Pairing
element *i* against element *i* is the only thing a tree mismatch invalidates, so the
per-element lists are now withheld and the panel geometry — read from the scroll box, not
from the pairing — is still reported. Those cells carry `paired:false`.

**Two things the paired harness structurally cannot answer, and the probe that does.**
`tools/fix-probe.js` reads elements directly in each build rather than diffing them:

- The harness reports a per-element height *increase*. Three of the four fixes are
  *reductions*, and a reduction is invisible to it.
- `.cancel-help` lives in `.modal .mf`, the dialog **footer**, which sits outside the scroll
  box the harness measures. The whole cancel surface therefore read as "no change" in the
  B → C run, which is a limit of the instrument and not a result.

It also records the reading order of the two rows that gained `flex-wrap`, by sorting the
children's own boxes down-then-across and comparing that with DOM order — which is how
§3.3 found that `Manage` leaves the heading's line at 760, 700 and 601.

**And the scaffolding removal was itself incomplete until now.** See §2: dropping
`has-statebar` matters at ≤600 even though the bar is hidden there, because one rule needs
only the class. Every number in this file is now taken with the class gone.

---

## 5. What this run does not cover

Added this session:

- **The `−53px` at 944 in the modal host is measured and not explained.** The wrap costs a
  flat +12px everywhere else; at that one width in that one host the panel gets *shorter*.
  Not chased.
- **`#featureBlock .sh` was checked for reordering at the eight widths in the grid**, not at
  every width in between. The row breaks somewhere between 944 (unbroken) and 760 (broken);
  the exact threshold was not bisected.
- **Fix 2 was read on `cancel subscription` only.** `.modal .mf` is shared by every dialog on
  the generic `#overlay` root — fifteen of them, listed below — and `flex-wrap:wrap` now
  applies to all of them above 600px. Only this one was opened.
- **Fix 4 was found on `add payment method` only.** `.paystripe-note` does not appear on the
  wizard's *Review & pay* at any width; wherever else it is rendered, it was not measured.

- **The auth modal is not here.** It needs `auth:'out'`, and every other surface needs
  `auth:'existing'`; the run sets one session for all cells. Sign in and sign up were
  measured in the typography pass itself (16px inputs, hug height) but not diffed here.
- **The generic `#overlay` was measured once — as `Cancel subscription`.** Fifteen other
  dialogs share that root and were not opened: Delete account, Delete user, Delete instance,
  Deactivate instance, Edit label, Edit instance label, Renew software updates, Renew
  subscription, Log in as, Payment method updated, Manage payment, the unsaved-changes guard
  (two call sites), the License-details placeholder and the Community Grant stub. They share
  a frame, not a body, so the cancel numbers do not transfer.
- **The filter sheets show `—` everywhere, and that is a real result with a narrow scope:**
  they exist only at ≤600 (`wireSheetTrigger` returns early above it), so they were measured
  at 600 and 390 only, and nothing in them changed.
- **Steps 2–4 of the TBMQ and perpetual paths** were measured at Capacity and Review only —
  the two steps whose bodies differ by product and model. Add-ons and Choose-your-plan were
  measured on the ThingsBoard subscription path alone.
- **One state per surface.** A wizard with a coupon applied, a panel with a payment-failed
  banner, a sheet with a filter already active — none of those were driven.
- **No interaction after opening.** Nothing was typed, no stepper was pressed, no tab inside
  the licence panel was switched. The Invoices and Activity tabs of the panel are unmeasured.
- **`IntersectionObserver` never fires in this browser panel**, so anything that lazy-loads
  was measured at its first batch in both builds — the diff is honest, the absolute height is
  low in both.

---


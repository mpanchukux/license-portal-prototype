# Components — decided

**This file is a spec, not a proposal**, on the same terms as `SCALES.md`: what is here has
been decided, and where a decision replaced an earlier one the earlier one is gone rather
than kept beside it.

**Read `SCALES.md` → "From scales to components" first.** It says which tokens a component
may read, which four it may not, and what the scales do not answer. This file does not
repeat it.

## Status

**Group 1 — interactive: button, field, chip — BUILT 2026-10-07.**
**The button's ground is a role token — BUILT 2026-10-07** (§1).
**Group 2 — overlay: dropdown + sheet, modal shell, toolbar — BUILT 2026-10-07**, except
the toolbar, where the measurement contradicted the decision — see §5 below.
**Group 3 — surface: card, table row + frame, banner — BUILT 2026-10-07.**
**Pass 1 — the component names, ADDED alongside the old ones — DONE 2026-10-07** (last
section). `.listrow` and `.listbar` exist; nothing was renamed and nothing merged.

---

# How a census becomes a component

**The method, stated once because it is the method for all nine.**

1. **Count rendered forms, not selectors.** The signature is what the browser paints —
   height, padding, radius, font, background, colour, border, shadow, min-width, gap. Two
   selectors painting the same thing are one form; one selector painting two things is two.
   `tools/census.js` does this; the caller has to drive the surfaces a static walk cannot
   open, which on this product is most of them.
2. **Separate three things that look alike.** A real variant; an accident of one place that
   should fold into a neighbour; and **a place that is wrong rather than a variant that is
   missing.** The third is reported, not built.
3. **Say which cells are empty because nothing needs them and which because nobody built
   them.** They are different and a matrix cannot tell them apart.
4. **A form you cannot justify as a variant does not get built.**

## ⚠⚠ THE HARD RULE — it has cost twice in the same shape, so it is a rule, not advice

> **Before calling a form an accident, or two names two components, enumerate every host
> where the class appears and read the winning rule on each. A census that samples one host
> measures that host, not the component.**

**Twice, in the same shape:**

| | what the census said | what the hosts said |
|---|---|---|
| group 1 | `.lic-copy` and `Apply coupon` are one-place accidents | both are **systematic ground rules** — one covers three row types, the other every tinted surface |
| group 2 | `.lic-controls` and `.insttoolbar` are two components | **one component, two names** — identical with `.stickybar`, and the stylesheet already pairs them in seven shared selectors |

Both times the census sampled the class on **one** host. In group 1 it read the rendered form
and never the rule; in group 2 it read `.insttoolbar` only on the licence panel, **where the
modifier that makes it a band is not applied**.

**A form tells you THAT two things differ. Only the rule tells you WHY.** The enumeration is
cheap — grep the class, list the hosts, read the winner on each — and it is the difference
between specifying a component and specifying one page's view of it.

---

# 1 · Button

**Five variants, three sizes, two contents, one tone, three states.** All five variants are
justified by the census: `primary` (44 instances), `secondary` (219), `menu` (86),
`ghost` (24), `text` (4).

⚠️ **`text` has four instances and stays.** All four are the wizard's `Back`. It is the only
form in the product that is a label with no box at all, and folding it into `ghost` would
give `Back` a 40px hit area it does not want in a step bar. One place, but a real variant.

## ⚠️⚠️ The size axis FLOORS at 44 on the phone. It does not flatten to it.

| size | desktop | ≤600 |
|---|---:|---:|
| `sm` | 26 | **44** (rises) |
| `md` | 40 | **44** (rises) |
| `lg` | 48 | **48** (unchanged) |

**A touch target is a minimum, not a levelling.** `sm` and `md` rise because 26 and 40 are
below a usable target. `lg` is already above it. **Collapsing all three would make the
product's most important button the same size as its smallest on the smallest screen**,
which is the opposite of what a floor is for.

⚠️ One rule on Home's card head used to pull `lg` down to 44 and was removed in this pass.
**Do not add `lg` to the touch rule, and do not re-add a height override anywhere else.**

## The cells the product uses

| cell | n |
|---|---:|
| secondary / md / icon only | 182 |
| menu / md / icon only | 86 |
| secondary / md / label | 37 |
| primary / md / label | 23 |
| ghost / md / icon only | 23 |
| primary / lg / label | 11 |
| primary / sm / label | 10 |
| text / sm / label | 4 |
| secondary / md / label / destructive | 1 |
| ghost / sm / icon only | 1 |

**Empty because nothing needs them.** `menu/*/label` — the builder refuses a label on
`menu`, so those four can never fill. `text/lg` and `ghost/lg` — a borderless label at 48px
is a heading. `primary/*/icon only` — **the product names its primary action**, and that is a
rule rather than a gap.

**Empty because nobody built them, and left unbuilt:** `secondary/sm/label`,
`secondary/lg/label`, `secondary/sm/icon only`, `secondary/lg/icon only`, `text/md/label`,
`ghost/md/label`. **Each would be a cell a matrix fills and the product does not use.** If a
dense row later wants `secondary/sm`, that is a request with a caller attached.

## ⚠️⚠️ The ground is a ROLE TOKEN, not a fourth axis — built 2026-10-07

**A button does not know what it stands on; a ground does.** The ground redefines one token
and the component reads it. No new axis, no argument at any call site, and the same
two-layer shape the spacing scale uses.

| who | declares |
|---|---|
| `:root` | `--btn-secondary-bg: var(--surface-quiet)` |
| `.on-tint` | `--btn-secondary-bg: var(--card)` |
| `tr.lic-row`, `tr.inv-row`, `tr.inst-row` | `--btn-secondary-bg: transparent` |

`.btn--secondary` and `.btn--menu` read it. **The three exceptions that used to reach INTO
the component are gone.**

⚠️ **The cost is accepted and real:** you cannot see at a call site that a given button will
be white. The explicitness belongs in the CSS where the ground states it once, not across
thirty calls where one omission paints the wrong thing.

### ⚠️⚠️ Measured: the two grounds do NOT collapse to one token

Tested rather than settled on symmetry, and **they stay two** — because a row's ground MOVES:

| | |
|---|---|
| `.lic-row:hover` | `--row-hover` = **#F8FAFD** |
| `--card` | **#ffffff** |

**A `--card`-filled button would sit as a white patch on a hovered row.** Transparent lets
the hover through. Not interchangeable.

### ⚠️⚠️ Measured: what else is ground-dependent — border never, fill and colour yes

| ground | rest fill | hover fill | active fill | colour |
|---|---|---|---|---|
| default | `--surface-quiet` | quiet-hover | quiet-press | — |
| `.on-tint` | **`--card`** | **`--surface-quiet`** | **`--surface-quiet-hover`** | — |
| table row | **transparent** | *unchanged* | *unchanged* | — |
| `.on-ink` (ghost only) | — | `--overlay-light-press` | — | **`--on-ink-secondary`** |

**Two things the one-token shape does not cover, reported rather than taken:**

1. **`.on-tint` shifts the whole ramp** — every state moves one step up, not just rest. Those
   two rules are still written out. **The row ground changes rest and nothing else**, and
   that is deliberate: with no box at rest, the hover and press washes are the only thing
   left saying these are controls.
2. **`.on-ink` moves COLOUR, not fill**, and only on `ghost` — all that is left there since
   the alert-tone pass.

**So: one token covers rest, and two questions are open** — whether the tinted ramp's hover
and active become tokens, and whether colour on ink becomes one. Each is a decision about
what a ground is allowed to change.

### ⚠️ Nesting is now correct by construction

A table row inside `.on-tint` resolves to **transparent** — the nearer ground wins, because
that is what inheritance does. Before, both selectors were (0,2,0) and the winner was decided
by **source order**. Same outcome today; it is now a property of the mechanism rather than of
where the rules happen to sit.

### Verified

**70 cells, 120,502 elements: 0 changed, 0 lost, 0 gained**, plus a direct probe of all five
grounds and the nested case, since `.on-tint` lives on two surfaces a page walk never reaches.

## ⚠️⚠️ What it replaced, kept for the reasoning

`SCALES.md` warns that a second DARK surface makes `surface` a fifth axis. The census found
the light case is already here, three times over, and each is a **systematic rule, not a
stray override**:

| ground | rule | what it does to `secondary` |
|---|---|---|
| a table row | `tr.lic-row .btn--secondary, tr.inv-row …, tr.inst-row …` | **drops the fill** — across all three row types |
| a tinted surface | `.on-tint .btn--secondary` | fill becomes `--card` instead of `--surface-quiet` |
| an ink banner | `.gbanner.on-ink .btn--*` | inverted primary, outlined secondary |

**Three grounds, three re-paints, and the component does not know about any of them.**
Nothing was changed — adding the axis is adding a variant nobody asked for. **But the
trigger `SCALES.md` set has already fired**, and the table row is group 3's component, so
the decision arrives there whether or not it is taken first.

## What this pass changed

**The page title row stopped re-cornering the component.** `.pagetitlerow` set
`border-radius:var(--radius-control)` (8px) and `padding:0` on three buttons at ≤600 —
**the only button corner in the product that was neither `--btn-r` nor `--radius-pill`.**
Measured at 390 on all five pages that have the row: with both properties gone every button
stays **44×44**, row overflow **0**, document overflow **0**. The squeeze bought nothing.

⚠️ **The label is still dropped in that row and that was NOT fixed.** `Buy a license` renders
icon-only because a child span is `display:none`. **That is a layout defect in the row, not a
missing button size** — the component does not grow a `primary / icon only` cell to serve an
override that is itself wrong. In the debt for the phone work.

---

# 2 · Field

**One component. No variant axis and no size axis, and this pass did not invent one.**

25 rendered instances, 7 signatures, **one form**: 40px (44 on the phone, by the floor),
`--btn-r`, white, 1px `--line`, 16px text. Every one of the seven differences is **content**:

| difference | why it is not a variant |
|---|---|
| padding 16 → 36 / 40 | a glyph is in the box (search, select chevron) |
| fill swaps | `locked` is a **state** |
| 74px, `--radius-surface` | it is a textarea |
| 40 → 44 at ≤600 | the floor |

⚠️⚠️ **IT HAD NO BUILDER AT ALL** — 28 hand-written spellings across five files, each free to
drift. That is exactly how a one-form component becomes a seven-form one. `field()` now
exists and the call sites read it.

⚠️ **The select keeps its wrapper.** `padding-right` does not move the native arrow —
measured and recorded in the stylesheet — so the chevron is drawn by us and `.selwrap` is
what positions it. A select without it loses the glyph.

---

# 3 · Chip, and 4 · Tag — two components, not one

The census found 564 things the markup called chips. **They are three things, and only two
of them are chips.**

| | n | what it is |
|---|---:|---|
| **tag** (`.fi-chip`) | 365 | `display:inline` with `box-decoration-break:clone` — it **wraps across lines like the prose it sits in**. No hit area, no state, nothing to select |
| **chip** (`.filterchip`, `.typechip`) | 59 | a control: `height:var(--btnH)`, pill, bordered, selectable, countable, removable |
| **status mark** (`.statmark`) | 140 | **not a chip** — no box, no padding, no radius. A coloured glyph and a word. **Group 3** |

**Making the tag a chip variant would put `selected` on something nobody can select, and
`height` on something whose whole job is to flow with a sentence.**

⚠️ `.fchip-none` ("No add-ons on this license.") is **an empty state wearing chip clothes** —
reported, not built. An empty state is a sentence.

## ⚠️⚠️ STILL OPEN: the chip has three heights and unifying them is visible

| form | height | where |
|---|---:|---|
| `.chip.ghost` (`+ Add label`) | **26** | licence header |
| `.chip.label.applied-chip` | **32** | phone filter row |
| `.filterchip` / `.typechip` | **40** | toolbars, instance types |

`.filterchip` and `.typechip` are height-locked controls; `.chip` is content-sized and is
not. **Folding them to one height moves pixels on three surfaces and no decision describes
it**, so the builders emit today's classes exactly and nothing moved. `filterchip` and
`typechip` also differ by 4px of padding (`--space-stack` against `--space-control`), which
is the same question in miniature.

**`chip()` takes a `kind` argument for exactly this reason, and it is not a variant axis**:
the day the three fold into one, the argument goes and no call site changes shape.


---

# Group 2 — overlay: the census

**Taken 2026-10-07. Not built**: every collapse it points at moves pixels, and under the
standing rule a visible change that no decision describes is reported, not taken.

Driven across both modal hosts, the wizard, the profile menu, the phone filter sheet and
two toolbars. **15 families.**

## ⚠️⚠️ THREE MODAL SHELLS, AND ONE OF THEM HAS A DIFFERENT CORNER

| shell | radius | fill | shadow |
|---|---:|---|---|
| `.fs-box` (full-screen / licence) | **12** | `--card` | dialog |
| `.paymodal` | **12** | `--card` | dialog |
| **`.modal` (the generic one)** | **8** | `--card` | dialog |
| `.fsheet-panel` (phone sheet) | 12 12 0 0 | `--card` | docked |
| `.dprofmenu` | 12 | `--card` | menu |

**Everything that floats is `--radius-surface` (12) except `.modal`, which is
`--radius-control` (8).** One shell at a different corner from the other four, carrying the
same shadow and the same fill. **That is the collapse the modal shell exists to make** — and
it is visible on every generic dialog, so it waits for a word.

## ⚠️ Footers and headers do not agree either

| | padding |
|---|---|
| `.mf` (modal footer) | `12px 16px` |
| `.fsheet-foot` | `12px 16px` — **agrees** |
| `.paymodal-f` | **`16px 24px`** |
| `.fs-header` | `12px 24px`, fill `--surface-quiet` |
| `.fsheet-head` | `16px 16px 12px`, transparent |

Two of the three footers already agree. The third and both headers are the same kind of
question as the radius.

## ⚠️ Two things called a toolbar are two different components

| | fill | padding | sticky |
|---|---|---|---|
| `.lic-controls` | `--card` | `16px 20px` | **yes**, `--z-sticky` |
| `.insttoolbar` | transparent | `0` | no |

**One is a sticky bar that owns a band of the page; the other is a row of controls with no
box at all.** Folding them would give the instances toolbar a fill and a sticky position it
has never had. They are probably **two components, not one with a variant** — but that is a
decision, and the census only says they are not the same thing today.

## ⚠️⚠️ `.insttoolbar.stickybar` declares `z-index:12` on a `position:static` element

Carried over from `SCALES.md`'s "found while reading". The census confirms it renders
`z-index: auto` — **the declaration does nothing**. It is a correctness question (did it lose
its `position:sticky`, or did it never need to exist?) and it belongs to whoever builds the
toolbar, not to a scales pass.

## Built in this pass: the corner close

**`.fs-close` folds into the modal shell, as decided.** The group-1 census found it as a
42×36 white circle with a hairline and a menu shadow, wearing `btn--ghost` — which it looks
nothing like. **It is not a button variant**: it is a disc the shell hangs off its own corner,
and every value in it is about the shell (the circle and hairline so it reads against
whatever is behind it; `--elevation-menu` because it floats over the page rather than over
the sheet; `overflow:visible` and the negative offsets for the overhang).

⚠️ **The markup still carries `btn btn--ghost btn--md btn--icon`**, deliberately: changing it
is markup across two hosts for no rendered difference, and the class is what gives it the
component's focus ring and hit area. **What changed is where the product says it belongs.**


---

# Group 2 — built 2026-10-07

## The ground tokens, completed

The ground owns **fill and colour**. **Border never moves** — measured across all four
grounds. The principle: **a ground owns what the ground makes unreadable.**

| | declares |
|---|---|
| `:root` | `--btn-secondary-bg` / `-hover` / `-active`, `--btn-ghost-fg` |
| `.on-tint` | all three fills — the tinted surface moves the **whole ramp** one step up |
| `tr.lic-row`, `tr.inv-row`, `tr.inst-row` | **rest only**, and falls through for hover and press |
| `.gbanner.on-ink` | `--btn-ghost-fg` |

⚠️ **Half-tokened would be worse than either**: the ground would answer one state while the
page kept reaching into the component for the other two. The row ground redefining rest alone
is not half-tokened — it is the row having nothing to say about hover and press, which with
no box at rest are the only thing left saying these are controls.

⚠️ **`--on-ink-muted` is still out of reach, and it was checked rather than assumed.** The
ink ghost reads `--on-ink-secondary` at rest and plain white when pressed. There is no
product carrier for a third, muted level — every muted-on-ink value in the file still belongs
to the excluded settings bar. **Named, undeclared, unchanged.**

## ⚠️⚠️ VISIBLE, ON ITS OWN LINE: `.modal` 8 → 12

Five floating shells; four were already `--radius-surface`. `.modal` was `--radius-control`
while carrying a surface's shadow and a surface's fill — **a control's corner on a dialog.**
It now matches `.fs-box`, `.paymodal`, `.fsheet-panel` and `.dprofmenu`.

**This is the only visible change in group 2.** 84 of the 84 changed elements are this.

## ⚠️ The footer is a size axis on the shell, not a defect — measured, left alone

The question was whether `.paymodal-f`'s `16px 24px` is a stray against `.mf`'s `12px 16px`.
**It is not.** Each footer agrees with its own shell's body:

| shell | head | body | foot |
|---|---|---|---|
| `.modal` | 16 | **16** | 12 / **16** |
| `.paymodal` | 20 / 24 | **24** | 16 / **24** |

Two shells, internally consistent, one step apart. **Nothing moved.**

## ⚠️⚠️ §5 — THE MEASUREMENT CONTRADICTS THE DECISION, SO NOTHING WAS RENAMED

> **Superseded in part by pass 1 (last section).** The census below still stands — one
> component, two names, seven shared selectors. What changed is the answer: the shared rules
> now live on `.listbar`, which was **added** to the elements, and the two old names stay as
> per-surface hooks. The rename this section declines is still declined.

The decision was "two toolbars, two components, names that cannot be folded back". **The
measurement says they are ONE component with two names.** Compared at 1280 on all four list
pages:

| | display | gap | padding | position | fill |
|---|---|---|---|---|---|
| `.lic-controls.stickybar` | flex | 12 | 16/20 | sticky | `--card` |
| `.insttoolbar.stickybar` | flex | 12 | 16/20 | sticky | `--card` |

**Byte-identical in every property measured.** And `.insttoolbar` WITHOUT `.stickybar` — the
licence panel — is the bare row: transparent, zero padding, static.

⚠⚠ **So the structure is one component plus one modifier**, not two components:
`.stickybar` is what turns a control row into a band. My group-2 census said otherwise
because it sampled `.insttoolbar` only on the licence panel, **where the modifier is not
applied** — the same mistake as group 1, in the same shape: *a form tells you that two things
differ; only the rule tells you why.*

⚠️ **And the stylesheet already agrees.** The two names are paired in **seven shared
selectors** (`.listcard .lic-controls, .listcard .insttoolbar`; `.lic-controls, .insttoolbar`;
`.lic-controls [data-refresh], .insttoolbar [data-refresh]`; and four more). The file has been
writing every shared rule twice because the component has two names.

**Renaming into two would hard-code a distinction that does not exist.** The fix the
measurement points at is the opposite — **one name** — and neither current name can be it:
`insttoolbar` says "instances" but serves invoices, activity and the licence panel;
`lic-controls` says "licences" and serves one page. That is a rename of ~72 call sites on a
premise that has just been overturned, so it is reported rather than taken.

## ⚠️ §6 — the inert z-index is deleted, and the recorded finding was wrong about where

Measured on licenses, instances, activity and invoices:

| | position | z-index | |
|---|---|---|---|
| **1280** | `sticky` | 10 | **live**, and nothing overlaps it |
| **390** | `static` | 10 | **inert** |

`.stickybar` declares `z-index:var(--z-sticky)` beside `position:sticky`; the phone rule drops
it to `static` and the z-index stayed behind. **Deleted rather than fixed** — at desktop there
was nothing to fix, only a claim to stop making.

⚠⚠ **`SCALES.md` had this as "`.insttoolbar.stickybar` declares `z-index:12` on a
`position:static` element", measured in the licence panel's chain — where `.insttoolbar`
carries no `.stickybar` at all.** Right about the fault, wrong about the place: it is the
phone, and it is every list page rather than one.

## Verified

**70 cells, 67,222 elements: 84 changed, 4 lost, 0 gained.**
Every one of the 84 is `.modal`'s radius. **All 4 "lost" are the intended z-index deletion**
(`#licBarC` and `.insttoolbar.stickybar` at 390) — the check doing exactly its job: a
deliberate deletion shows up as a loss, and has to be read rather than waved through.

⚠️ **The comparison also caught a real regression mid-pass**, which is the argument for it
in one line: an assert aborted the batch that declared `--btn-ghost-fg`, the batch that made
the component READ it went in anyway, and every ghost button in the product silently fell
back to inherited ink — **1,689 changed, 4 lost**. Nothing on screen told me; the sweep did.


---

# Group 3 — surface: card, table row + frame, banner

**Built 2026-10-07. The census for this group found almost nothing to change — and that is
the finding.** The card, the row and the banner are each already ONE component. What is wrong
is the vocabulary: **four names for one row**, on top of the two names for one toolbar.

Hosts enumerated first, per the hard rule above: 112 rendered instances across nine pages at
two widths, plus Home's other layout, the wizard, the licence modal and the Users modal.

## Card — one component, and the rule already holds in the product

`.lcard` has three forms and **the split is by WIDTH, not by host**:

| | radius | border | where |
|---|---:|---|---|
| desktop | **12** | none | Home's card layout, the wizard |
| phone, first | 0 | none | Home, Licenses |
| phone, rest | 0 | 1px `#e2e2e2` top | Home, Licenses |

⚠⚠ **Home's card and the Licenses card are the SAME form at each width.** The rule — *one
component serves both Home layouts* — is not something this pass had to impose; the product
already does it. **Nothing was changed.**

⚠️ **At ≤600 the card loses its corners and becomes a row with a hairline.** That is the
"two arrangements, one component" rule rendering, not a second component: same tokens, same
states, same content — the arrangement changes and nothing else.

`.listcard`/`.listframe` shows the same shape: 12px and a bottom inset on the desktop, square
and flush on the phone. `.plancard` keeps `--radius-feature` (24) with two paddings, which is
the `is-popular` state the radius pass decided.

## ⚠⚠ Table row — ONE component under FOUR names

| | rendered form |
|---|---|
| `tr.lic-row` | `rad 0 · bg transparent · pad 0 · bd 0` |
| `tr.inv-row` | **identical** |
| `tr.inst-row` | **identical** |
| `tr.user-row` | **identical** |

Byte-identical in every measured property, on every host. **The per-table differences are
column layouts** — different tables have different columns — which is content, not variants.

⚠️ **And the stylesheet already says so**, exactly as it did for the toolbar: the phone rule
pairs all four (`tr.lic-row > td, tr.inv-row > td, tr.user-row > td, tr.inst-row > td`).

**Four row names plus two toolbar names = the rename pass has six.** Deferred and batched.

## ⚠️⚠️ VISIBLE, ON ITS OWN LINE: the fourth row joins the ground

`tr.user-row` was **missing from the ground declaration**, so the Users table's buttons kept
the quiet fill while the other three row types went transparent. Measured in the Users modal:
**four `btn--secondary` at `#F4F5F6` → `transparent`.**

**This is the carried ground decision applied to the row that was left out**, not a new
decision — and the omission was an oversight rather than a choice, since the phone layout had
already been pairing all four names for months.

⚠️ It is **the only visible change in group 3**, and it lives in a modal, so the band sweep
cannot see it. It was measured directly.

## `.statmark` — arrives from group 1, and belongs to the row

One form across **ten hosts**: `20px · radius 0 · background transparent · padding 0 · border
0`. **No box of any kind** — a coloured glyph and a word. It is read inside a row, it is not a
chip, and giving it a chip's padding and radius would be inventing a box for something whose
whole form is the absence of one. **Recorded as the row's, unchanged.**

## Banner — one form, four hosts

`.gbanner` renders one form everywhere. The tone rule carried from the alert-tone pass is
already in force: **red is already broken, black breaks on a known date, quiet is nothing
broken — tinted, and the ground carries it.** `.alert` likewise renders one form. Nothing to
collapse.

## Table header — four forms, and all four are the same cell

`TH` differs only in padding: `8px`, `8px 20px 8px 32px`, `8px 8px 8px 20px`,
`8px 20px 8px 8px`. **Those are first-cell and last-cell gutters** — position in the row, not
a variant of the cell.

## Not touched

**The 601–952 mid-width table band.** A missing layout tier across four tables; it stays in
the debt and is not a component question.


---

# Pass 1 — the rename: ATTEMPTED, REVERTED, and the reason is the point

**2026-10-07. Six names to two was the plan. It was applied, measured, and taken back out.**
Nothing in the product changed.

## The names, and the census behind them

| | proposed | free? |
|---|---|---|
| the control row above a list | **`.listbar`** | yes — 0 occurrences anywhere |
| the row inside a list | **`.listrow`** | yes — 0 occurrences anywhere |

Both join the family the file already has (`.listcard`, `.listframe`) and both say what the
thing **is** rather than where it first appeared, which is what `insttoolbar`,
`lic-controls` and all four row names fail.
⚠️ **`.toolbar` was rejected on the census**: 58 CSS occurrences and 139 in markup. A name
that collides is not a name.

## ⚠⚠ WHY IT WAS REVERTED — the names were not interchangeable

**The rows were caught before applying.** All four carry **per-table column targeting**:
`tr.inst-row > td:nth-child(1..5)`, `tr.user-row > td:nth-child(1..3)`,
`tr.inv-row > td:nth-child(2)` and typed cells. Collapsing the names to one would make every
column rule apply to every table. **`.user-row` is the hook by record** — the comment at
`components.js:862` says so outright.

**The toolbars were not, and that is the mistake.** I checked them for column targeting,
found none, and applied. The measurement then showed **geometry moving on four pages**:
`#licBarC` lost `display:flex`, filter controls went `flex` → `inline-flex`, buttons changed
radius and padding.

The cause: `.lic-controls` had 21 selectors and `.insttoolbar` 30, **and only 7 were shared.**
The other 23 applied to ONE of the two. Renaming merged them, so every one-sided rule
suddenly applied to both surfaces.

⚠⚠ **I applied my own hard rule to the rows and not to the toolbars.** The rule says
enumerate every host and read the winning rule on each; what I did for the toolbars was
enumerate the hosts and read only the rules I expected to find. **"No column targeting" is
not the same question as "do these two names select the same set of rules".**

## What a rename of either pair actually needs

Not a rename — a rename **plus a scheme for what the old names were carrying**:

| | what the name carries | what it needs |
|---|---|---|
| rows | per-table column layout | one component name + a per-table modifier (`listrow listrow--inv`), since three of the four have no container to re-scope through and `user-row` has none at all |
| toolbars | 23 one-sided rules | each rule decided: does it belong to the component, or to that one surface? |

**That is a decision per rule, not a mechanical pass.** Both are back in the debt with this
finding attached.

## The revert is exact

Restored line-by-line against the pre-pass mirror as an oracle. ⚠️ **Three lines came back
with the wrong name** on the first attempt, because both candidate spellings existed as whole
lines elsewhere in the file and the match was ambiguous — caught by the same comparison, fixed
by context, re-measured.

**Final: geometry identical on every cell, 0 lost, 0 gained, and the only paint change is
`.modal`'s radius** — group 2's known move, which is all that should remain.

---

# Pass 1 — the name is ADDED, not swapped. Done 2026-10-07.

**The revert above stands as the record of what a rename costs. This is the other move:
`.listrow` and `.listbar` go on the elements ALONGSIDE the old names, and only the rules that
are genuinely shared move onto the new name. Nothing is merged, so nothing can collapse.**

| | markup now | what the new name owns | what the old names keep |
|---|---|---|---|
| row | `class="listrow lic-row"` (and `inv` / `inst` / `user`) | 4 selectors common to all four **in rule text** | per-table column targeting, and every one-sided rule |
| toolbar | `class="listbar insttoolbar"` / `class="listbar lic-controls"` | the band itself + 7 shared selectors | 17 one-sided rules, now standing revealed |

## ⚠️⚠️ THE SHARED ROW SET IS SMALLER THAN THE CENSUS LOOKED — SAID RATHER THAN ROUNDED UP

Group 3 measured the four rows as **identical in rendered form**. That is true and it is not
the same claim as "the four names select the same rules". **In rule text, exactly four
selectors name all four rows:**

| moved to | was |
|---|---|
| `.listrow:hover` | `.lic-row:hover,.inv-row:hover,.inst-row:hover,.user-row:hover` |
| `tr.listrow` | `tr.lic-row,tr.inv-row,tr.inst-row,tr.user-row` (the ground token) |
| `table:has(.listrow) thead` | the same `table:has(…) thead` written four times |
| `tr.listrow > td` | `tr.lic-row > td,tr.inv-row > td,tr.user-row > td,tr.inst-row > td` |

**Everything else stayed.** The one that is worth naming is `.lic-row,.inv-row,.inst-row` —
**three of the four**, because `.user-row` is deliberately still a card at ≤600: it lives in
the Users modal, which has no page frame to be a row of. Folding that into `.listrow` would
have been the bigger win that needs the revert. **A smaller win that is true.**

## The toolbar: the doubling is what went

Three rules — the base, `[hidden]` and `.spacer` — existed **twice, byte for byte**, once
under each name. They are now one trio under `.listbar`, and `check-css` counts the
difference exactly: **2188 authored rules → 2185. Minus three, and nothing else.**

Four more shared selectors were rewritten in place (`.listcard .listbar`,
`.listcard:has(> .listbar)` ×2, `.listframe > .listbar`, `body.list-empty
.listcard:has(> .listbar)`, `.listbar [data-refresh]`, `.listbar .spacer`).

⚠️ **The base trio was kept at the `.insttoolbar` position, not the `.lic-controls` one**, and
that is a cascade decision rather than a tidy-up: the surviving declaration moved ~5,300 lines
EARLIER in the file. Checked before deleting — nothing between the two positions competes for
those properties at equal specificity, so no winner changes. Measured after: `.listbar` on
`#licBarC` computes `flex` / `gap:12px`, which is the licences bar still getting its band from
a rule that now lives with the table rules.

## Specificity: predicted unchanged, and it is

Every moved selector swaps one class for one class. `(0,1,0)→(0,1,0)`, `(0,1,1)→(0,1,1)`,
`(0,1,2)→(0,1,2)`, `(0,2,0)→(0,2,0)`, and the empty-list rule's `(0,4,1)` holds because
`:has()` and `:not()` take their argument's specificity and the argument is still one class.
**Position is unchanged too** — the selector text was rewritten where it stood, so equal-weight
ties resolve the same way. That matters for `tr.listrow > td`, which ties with
`.dblock table td` at `(0,1,2)` and wins only on order.

## ⚠️⚠️ The 17 one-sided toolbar rules, which is the point of doing it this way

They are no longer hidden inside a shared selector list, so the triage is now readable
without a census. Roughly: **`.lic-controls` keeps 4** (the styleguide specimen scope, the
WebKit search-cancel reset, `licNewBtn`, the type segment), **`.insttoolbar` keeps 6** (the
group switch, `.perctl` / `.perbtn`, the `.barfilters` internals), and **7 pair one name with
an ID** (`#licBarC .barfilters`, `#licBarB .perbtn`) — which is the phone filter row written
as id-plus-name because only bar C has it.

**Each needs one question answered: is this the component's, or that one surface's?** That is
a decision per rule, and it can be taken later or never. Nothing about it blocks anything.

## ⚠️ What the measurement needed before it could say anything

**`path()` in `sweep.js` keys every element by its class list, so adding a class unpairs the
element from itself.** Before the fix, every row and every toolbar would have come back as
`unpaired` — skipped, not compared — and the run would have looked like a catastrophe while
measuring nothing. Worse: a real regression on exactly those elements would have been
invisible in the same run that cried wolf. `SWEEP.ignoreClasses(['listrow','listbar'])` now
drops names from the key on both sides. It only ever removes names, so it cannot invent a
pairing.

## Verified

| | |
|---|---|
| geometry, 15 pages × 8 widths | **120 cells, 119 identical** |
| computed values, 15 pages × 3 widths, 19 properties | **35,700 elements: 0 changed, 0 lost\*, 0 gained, 0 unpaired** |
| overlay surfaces (licence panel ×2, Users modal) | **6 cells, 4,167 elements: 0/0/0**, geometry 6/6 |
| `check-css` | `ok:true`, **2185/2185**, 0 dropped (before: 2188/2188) |
| 15 pages | no errors · `check-icons` 3/3 clean · collisions 23/24, `:root` 4/4 |

⚠️ **The two non-zeros, and why neither is this pass.**

1. **`invoices.html@768` gained 136px of overflow on `#shellMain`.** Re-run 6× per mirror:
   it fires on **HEAD** too (1 in 6 there, 0 in 6 on the new tree) and `.tablescroll`
   overflows by exactly 160px on **every** run of **both**. Not fonts — `document.fonts.status`
   is `loaded` in every sample and waiting for `fonts.ready` made it *more* frequent.
   **Pre-existing nondeterminism on that one cell.**
2. **One lost and one gained `background-color`, both the bottom-nav active pill**
   (`licenses.html@390` and `signin.html@390`). Probed directly 3× per mirror: the `.on` item
   and its pill are **identical on both sides every time**, and the class is present from
   t=0. **Does not reproduce.**

⚠️⚠️ **And the hard rule caught my own probe again, for the third time in two sessions.** The
surface sweep reported `0/0/0` on the Users modal — while `tr.user-row` was **0 in the DOM**,
because `OPENERS.usersModal` never reached the modal. Calling `UsersModal.open()` directly
measured it properly: `tr.user-row` carries `.listrow`, the ground token resolves to
`transparent`, and both action buttons are `rgba(0,0,0,0)` on both mirrors at 1280 and 390.
**A zero from a surface you did not open is not a zero.**

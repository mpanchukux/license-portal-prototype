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

## The two rules that hold for all nine

> **A component reads MEANINGS, never the primitive layer.** Four tokens are off limits;
> `SCALES.md` names them. ⚠️ This file pointed at that rule and never stated it, which is
> why the styleguide was carrying it instead — moved here 2026-10-12 when the page that
> held it was dissolved.
>
> **A form that cannot be justified as a variant is not built** (the same as point 4 above,
> said as a rule rather than as a step).

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

**Six variants, three sizes, two contents, one tone, three states.** Every variant is
justified by the census: `primary` (44 instances), `secondary` (219), `menu` (86),
`ghost` (24), `text` (4), `raised` (1).

⚠️⚠️ **THIS FILE SAID FIVE UNTIL 2026-10-12, AND THIS FILE WAS THE WRONG ONE.** `raised` was
added to `BTN_VARIANT` on 2026-10-08 — the day after this section was written — and the
sentence here was never revisited, so the spec and `shared.js` disagreed for four days while
both were being read as the source. The styleguide says six.
⚠️ **One instance is not a reason to fold it**, on the same terms as `text`: `raised` is the
product-swap box on the selling surface (`components.js`, `nl-prodswap`), the one surface that
answers the pointer by **rising** rather than by tinting. The test that admits a surface to
rising is in the stylesheet and on the styleguide's Buttons page; `.blockmore-go` fails it and
the landing hero passes.

⚠️ **`text` has three call sites in the product and stays.** ⚠️ **This said "four instances,
all four are the wizard's `Back`" until 2026-10-12, and the second half was wrong**: the three
are the wizard's `Back` (`wizard.js`) and **two "Leave without saving" guards**
(`components.js`, `wizard.js`) — the fourth was the styleguide's own confirmation specimen,
which is not the product. Enumerated across every builder. It is the only
form in the product that is a label with no box at all, and folding it into `ghost` would
give `Back` a 40px hit area it does not want in a step bar. One place, but a real variant.

## The rising test, and the values behind the axes — moved from the styleguide 2026-10-12

⚠️⚠️ **THE TEST THAT ADMITS A SURFACE TO RISING, STATED HERE RATHER THAN POINTED AT.** This
file said "the test … is in the stylesheet and on the styleguide's Buttons page", and when
that page's prose was cut the test would have survived only as a CSS comment:

> **A surface may answer the pointer by rising only if it neither carries rows of data nor
> stands among them, and carries no more than one control — or if the surface is itself the
> thing being chosen.**

`.blockmore-go` fails it: it sits at the foot of a list of licences and is not a thing in that
list you can choose. The landing hero passes. ⚠️ The first limb says *"nor stands among them"*
because the one surface the system had already failed carries nothing whatever and was failed
for what it stands among; the second limb is bounded — "no control beyond the one that selects
it" — so a card with a checkbox and a kebab is judged by the first limb instead.

**Ghost is the same button without the resting border**, and the two share one declaration for
hover and press. ⚠️ **The border value was chosen on a measurement:** `--mid` **clears
1.4.11's 3:1 on every ground in the product**, floor 3.294 on the densest point of the mesh —
**that threshold is what any replacement has to meet.** `--ink` was dropped on weight, and ink
at .14 on contrast (1.30–1.33: the property that makes a translucent ink inherit its ground is
the property that stops it being seen).

**What each size is for:** `sm` 26 — actions inside an ink banner, where the band would
out-shout the banner. `md` 40 (`--btnH`) — everything standing in a control row. `lg` 48 —
the page's own primary beside its h1, one call site.

**The icon-only form is sized from its icon plus its own padding, not from the label form
narrowed.** Measured at `md`: a ghost or text one is **54×40**, a secondary one **62×40** (it
carries a 24px glyph), and `menu` is **38×40** — taller than wide, because a kebab is a glyph
three dots across. That contrast is the point: a menu trigger is tellable from an action at
the end of a row without reading either.

⚠️ **An icon-only button carries a GREY glyph** — `--mid` at rest, `--ink` on hover and press.
**A secondary WITH a label keeps ink**, where the glyph is decoration beside a word and the
word has to carry the contrast.

**Tone is an axis rather than a variant because the product needs a destructive `primary`**
(the confirm in the cancel dialog) **and a destructive `text` item** (Delete in a kebab). As
variants each of those would need its own name.

**Hover and pressed are two different surfaces, not two opacities of one.** On a **filled**
button hover goes flat black and pressed adds an inset well at the top edge — a recess, which
flat black cannot be. On a **quiet filled** one (`menu`) they are the next two steps of that
fill's own ramp. On a **transparent** one (`secondary`, `ghost`, `text`) they are translucent
ink: `--btn-secondary-bg-hover` then `--btn-secondary-bg-active`.

## Rules — moved from the styleguide 2026-10-12

- **`busy` and `disabled` never hold at once — busy wins.** "You cannot do this" and "this is
  happening" are different statements and one button cannot make both. The builder applies it:
  `disabled = !!o.disabled && !busy`.
- **A busy button keeps its accessible name and its width**, and takes `aria-disabled` rather
  than the `disabled` attribute, **so focus is not lost mid-action** — a disabled element drops
  out of the tab order, and a keyboard reader would land somewhere unrelated when the button
  came back. The width is reserved by the hidden label, not frozen with an inline style.

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
**the only button corner in the product that was neither `--radius-interactive` nor `--radius-pill`.**
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
`--radius-interactive`, white, 1px `--line`, 16px text. Every one of the seven differences is **content**:

| difference | why it is not a variant |
|---|---|
| padding 16 → 36 / 40 | a glyph is in the box (search, select chevron) |
| fill swaps | `locked` is a **state** |
| 74px, `--radius-surface` | it is a textarea |
| 40 → 44 at ≤600 | the floor |

⚠️⚠️ **IT HAD NO BUILDER AT ALL** — 28 hand-written spellings across five files, each free to
drift. That is exactly how a one-form component becomes a seven-form one. `field()` now
exists and the call sites read it.

## The axis, and the rules — moved from the styleguide 2026-10-12

**One axis, `content`: input · select · textarea.** No variant axis and no size axis.

- **The error slot is emitted with the field and stays `hidden` until it has something to
  say.** A slot created only on failure has to be inserted into a live DOM at the moment the
  reader is already dealing with a problem, which is the moment a missing parent shows up.
- **`.help` is suppressed while an error shows.** Two lines under one field, one of them now
  wrong, is worse than either alone.
- **The error message is a caption** (`--t-caption`), **says what is wrong rather than that
  something is** — "Use MM / YY" can be acted on, "invalid" cannot — **and carries no glyph**:
  the fault is already signalled by the border, the label and the line itself.

⚠️ **The select keeps its wrapper.** `padding-right` does not move the native arrow —
measured and recorded in the stylesheet — so the chevron is drawn by us and `.selwrap` is
what positions it. A select without it loses the glyph.

## ⚠️⚠️ THE FIELD'S STATE AXIS — THREE STATES DID NOT EXIST UNTIL 2026-10-12

The state matrix was built and three of its columns rendered **pixel-identical to
`filled`**, because the product had no rule for them. They exist now, and each took a value
the product already used rather than a new one:

| state | before | now |
|---|---|---|
| **hover** | nothing — a field did not answer the pointer at all | `border-color:var(--mid)`, the border every other hovered control takes (`.typechip:hover`) |
| **disabled** | nothing — the browser's default field | `--surface-quiet` fill, `--text-inactive` text, the values `.pager select:disabled` already had |
| **read-only on a textarea** | nothing — `.field.ro` named `input` only | the same `--bg` fill as a read-only input |
| **error on a wrapped select** | nothing — `.field.err > select` is a DIRECT-child selector and the real markup wraps the select in `.selwrap` | `.field.err .selwrap > select` added to the same rule |

⚠️ **The matrix is what found all four**, and it could only find them by rendering every
state side by side. A page that describes states in prose cannot notice that two of them
look the same.

### The `.sg-st-*` hooks, and why they are not a second stylesheet

Hover and focus are the browser's, so a still matrix cannot enter them. The cell carries
`.sg-st-hover` / `.sg-st-focus`, and **those selectors are written into the product's own
declaration blocks** — `.field input:focus, .sg-st-focus .field input { … }` — so there is
one set of values and a change to the component changes the specimen in the same edit.
⚠️ **One exception, named at the rule:** a control the global `:focus-visible` reaches
cannot share that block, because the hook's extra class would raise specificity and drag
`border-radius:var(--radius-tight)` along with the ring — a pill squaring itself on focus.
Those two declarations are repeated, from the same tokens.

## Answering the reader — moved from the styleguide 2026-10-12

- **A primary action is never left disabled with nothing said.** Either it is **enabled and
  answers on submit** — painting every failure at once and moving focus to the first — or it
  is **disabled with the reason visible beside it**. A disabled control cannot explain itself
  and cannot even be focused, so a silent one is a dead end with no way out of it.
  ⚠️ **Only the first limb is built, and the second existed nowhere until this line.**
  `wizard.js` states the contract — the primary is always enabled, `showAllBillErrors()`
  paints every failure and puts the cursor in the first. The disabled-with-a-reason limb is
  kept because it is what makes the built one a CHOICE rather than the only thing anyone
  happened to write.
- **Fields answer on blur, and typing again withdraws the answer.** A reader who is still
  typing has not finished being wrong yet. Built in `shared.js` and `page-security.js`, and
  it is why the reader usually never reaches a rejected submit.
- **`--t-caption` is for something that sits UNDER something else, and for nothing else.**
  The error message and the help line are the cases. It is a position in the reading order
  before it is a size, and using it for anything freestanding makes the axis mean two things.
- **`--sel-gutter` is read twice** — the select's own right padding and the chevron's offset
  — **so the glyph cannot drift from the text's inset.** One number, two readers; a second
  literal is how the two come apart.
- **The error colour is `--status-alert`** — the red that already means *act now* on
  `Blocked` and `Past due`, not a second red — **and it clears 4.5:1 as text**: 5.091 on
  `#ffffff` across 31 elements, 4.513 on `#FCEDED` (`CONTRAST.md`).

## The field's geometry — moved from the styleguide 2026-10-12, and THREE OF ITS NUMBERS WERE WRONG

These were not in the list of rules the cut was asked to check. They were in the same
paragraphs, so they were censused with them — and the census is the only reason the three
stale figures below are written down anywhere instead of leaving the page in silence.

| what the page said | what the product does |
|---|---|
| "a menu is a container (**10px**)" | **10px exists nowhere.** `.menu .pop` reads `--radius-control` (8), `.dropmenu` reads `--radius-surface` (12). 10 was collapsed to 12 by the radius pass on 2026-10-06 |
| "Spacing is **18px**, and it is one number" | **the structure is right and the number is not.** `--space-heading` is `--sp-6` = **20px**. 18 was collapsed to 20 by the spacing pass |
| "`--t-caption`, **13**/1.35" | `--t-caption-fs` is **14px**. Nothing in the product sets type below 14, and `type-roles.py --check` fails on anything that does |

⚠️⚠️ **THE SAME SHAPE AS THE RADII BLOCK, IN A SECTION NOBODY HAD LOOKED AT.** That block was
rewritten on 2026-10-12 because it showed three values the product does not have — and
`5px · 6px · 10px` was the list. **The same `10px` was still sitting in the Inputs prose two
sections further down**, because the fix was applied to the swatches and not to the page.
A pass that corrects a value corrects every place that prints it, or it has corrected one.

**What is true, and is kept:**

- **Fields read `--radius-interactive` (24), and the padding is 16 (`--space-stack`) so the
  text clears the arc.** The radius census confirmed this in both directions: not one of the
  68 rules reading `--radius-control` is an input.
- **A textarea is not a pill: `--radius-surface` (12), `min-height:62px`, and it is the one
  content value that changes the form** — the field's own height axis does not move.
- **The spacing between fields is ONE number** — `.field`'s bottom margin, `.field2`'s row
  gap and `.field2`'s own bottom margin all read `--space-heading`. **`.field.err` drops its
  bottom margin to zero** to pay for the message, so an error does not push the form apart.
- ⚠️ **The card field's expiry and CVC are blocks INSIDE it, not columns of it.** Two quiet
  chips at 28px inside the 40px field, `--radius-pill`, `--surface-quiet`, **and no divider:
  the gap between two filled shapes is the divider.** They replaced bare inputs split by a
  full-height hairline — a second stroke inside a stroked pill, so the eye read three strokes
  and could not tell which one was the field. ⚠️ 6px of right padding rather than 16: a
  filled shape needs less clearance from the arc than text does.

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

## Rules — moved from the styleguide 2026-10-12

**Chip**
- **A removable chip is a span with a button inside — never a button inside a button.** Nesting
  one interactive element in another is invalid, and the remove control is the only thing on it
  that can be pressed.
- **The count sits INSIDE the label, not beside it.** As a sibling it became its own flex item,
  so the chip's `gap` applied to it and the number stood a control's gap away from the word it
  counts, reading as a second object in the chip.
- **`.pill.is-accent` is the filled `--accent` pill** — `Popular` on a plan card, `Included`
  and `Enabled` on a feature row. **Use it for what the reader already has or what we
  recommend, and never for a state that needs acting on** — that is `.pill.attn`, which is
  ink. *(moved from the styleguide 2026-10-12)*

**Tag**
- **A tag takes TEXT, not children.** It is a word in a sentence; anything richer is a different
  thing wearing its background.
- **One per entry in a feed: the entity, and nothing else.** Everything else in the sentence is
  plain, values included — which is what gives the feed a scannable column of names.

## ⚠️⚠️ THE PILL FAMILY IS LIVE AND IS NO LONGER ON THE PAGE — removed 2026-10-12

The `The rest` block was deleted from the Status chips tab on the premise that it held dead
elements. **The premise was true when it was written and false by the time it was acted on:**
the three genuinely dead cells (`.chip.status`, bare `.chip`, `.pill.off`) had already been
pulled the pass before, and **the five that remained were all live**, measured across twelve
pages at two widths plus the wizard and a licence with no label:

| form | live instances | where |
|---|---:|---|
| `.pill` (bare) | **32** | licence panel, Home, Activity, landing |
| `.pill.soft` | **8** | licence page at ≤600 |
| `.fchip` | **4** | licence details — **moved to Small elements** |
| `.chip.ghost` | **1** | a licence with no label (`+ Add label`) |
| `.pill.is-accent` | **1** | the wizard (`Popular` / `Included`) |

**`.fchip` was moved as asked; the other four have no specimen anywhere now.** Their rules
are recorded — `.pill.is-accent` is the filled accent pill, never for a state needing action
(§3); `.chip.ghost` is the removable-chip shape — but **nothing on the page renders them.**
⚠️ **This is the opposite failure to the one the cuts have been fixing.** Those were pages
claiming more than the product had; this is a product carrying four forms the page no longer
shows. A design system that omits a live form is as wrong as one that invents a dead one —
the fix is a row in **Small elements**, not prose.

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

## Toolbar — the axis and the rules, moved from the styleguide 2026-10-12

**One axis, `band`:** `.stickybar` — fill `--card`, padding 16 / 20, sticky at `--z-sticky` ·
**bare** — transparent, no padding, static. `.stickybar` is what turns a control row into a band.

- **Controls that narrow the list go on the left; presentation goes after the spacer.** The
  Instances view switcher sits there because it does not filter.
- **Below 600px the filters are a rail that scrolls sideways, and the attention chip is last
  in it.** Arriving filtered (`?attention=1`) **scrolls the rail so the pressed chip is
  visible — by the rail's own `scrollLeft`, never `scrollIntoView`**, which walks up and
  scrolls every scrollable ancestor and would move the page under a reader who has just
  arrived. **Arrival only:** a chip the reader pressed is in view by definition, and nothing
  may move under a finger that has only this moment tapped.

## The Licences toolbar — moved from the styleguide 2026-10-12

**One axis: `.stickybar` makes the toolbar a band, without it a bare row.** The controls are
`.dropwrap.perctl` ×2 plus `.attnchip`.

- **Everything shows until the reader narrows it. Type starts at All, Status at Active.**
  **The trigger states the answer; the chip states its count.**
  ⚠️ **`Active` is the one default the toolbar sets**, and **`Canceled` is one of four answers
  rather than a switch that pre-hides rows** — the reader changes an answer instead of
  discovering a hidden filter. *(page only)*
- **The two menus are rendered from `LIC_TYPE_OPTS` / `LIC_STATUS_OPTS`**, the lists the page
  reads. **Counts are of the account, not of the current view** — a count that moved with the
  filter could not tell the reader what narrowing would cost.
- ⚠️ **Status holds TWO axes.** A **state** — Active · Blocked · Canceled — and a **condition**
  — Payment failed · Over instance limit · Updates ending. **The separator says the fourth item
  is not a fourth state.**
- ⚠️ **So the two can disagree, on purpose: a licence stored `payment_failed` shows `Active` in
  the chip, and one stored `active` can show `Blocked`. `Blocked` is on both axes.** This falls
  out of `statusMark`, which answers "is this licence alive" — but it was stated nowhere except
  the page. *(page only)*
- ⚠️ **This is Activity's dropdown — the same trigger, panel and rows. The only difference is
  ARITY:** Activity's event types are multi-select and lead with a checkbox; these are
  single-select and end with a tick. **One component, two arities — not two components.**
  *(page only)*

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

## Modal shell — the axes and the rules, moved from the styleguide 2026-10-12

| shell | corner | elevation | footer |
|---|---:|---|---|
| `.modal` | 12 | dialog | `.mf` 12 / 16 |
| `.fs-box` | 12 | dialog | — |
| `.paymodal` | 12 | dialog | `.paymodal-f` 16 / 24 |
| `.fsheet-panel` | 12 12 0 0 | docked | `.fsheet-foot` 12 / 16 |
| `.dprofmenu` | 12 | menu | — |

Fill is `--card` on every shell.

- **Each footer matches its own shell.** Nothing was moved to make the three agree with each
  other; a footer belongs to the box it closes.
- **Below 600px every `.fs-screen` is a full-screen sheet.**
- **A sheet carries a grab handle** (36×4, centred, drawn by `::before` so no extra markup is
  needed), **22px under the last item** — a list ending flush against the screen edge gives no
  way to tell whether it continues — **and scrolls at `max-height:72vh`**, or a sheet taller
  than the viewport silently loses its tail.
- **The centred box is `.fs-box`'s own default**, and the licence-details and Users modals ride
  it; the wizard is the surface that opts out by taking the full screen.

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

## The card's four hosts — moved from the styleguide 2026-10-12

**Card — a surface carrying one object. Three forms, dividing by width**; at ≤600 the card
loses its corners and becomes a row with a hairline (the rule above).

**Plan card** (`.plancard`)
- It carries **the `.pc-current` strip the current plan wears, and the strip's height is
  RESERVED on every card** — otherwise the current plan would stand taller than its
  alternatives and the row would read as a ranking.
- **A free plan puts `Free` where a price goes and gets no extra rows.**

**Two billing models, one surface** (`.plangroups`)
- **Both groups on one line above 600px, one grid, each group labelled over its own cards.
  Below 600px the tabs come back and the inactive group is hidden. Same markup both ways.**
- ⚠️ **The wrapper owns a column per card and each group claims its slice**, which is what
  keeps a card the same width across a group boundary. A per-group grid would size each group
  to its own contents and the boundary would show as a step. *(page only)*
- ⚠️ **A pick carries its group's billing model, read from the GROUP rather than from the
  card's name.** The name is a label someone can change; the group is the identifier — the
  same rule `neverExpires` follows when it reads the tier. *(page only)*
- ⚠️ **Change plan gets ONE group: a subscription does not become a perpetual licence by
  picking a card**, so a locked selection renders only its own model. *(page only)*

**Stated product** (`.nl-stated` + `.nl-prodswap`)
- **The product is stated, not chosen: one line states it, a quiet link offers the other.**
- ⚠️ **Which product is stated comes from the session's ARRIVAL** (Prototype settings →
  *Arrived for*); in a real portal it would come from the referrer. **The prototype's setting
  is standing in for a fact the product would already have**, which is why it is a state and
  not a control. *(page only)*

**Dashboard block** (`.dblock` + `.dblock-head`)
- **Home's section container. The whole heading row is the link** — a title that leads
  somewhere and a separate control that leads to the same place are two targets for one
  destination.
- ⚠️ **The arrow beside the title is an ICON, not a button.** It belongs to the link it sits
  in; making it a button would nest one interactive element in another, the same defect the
  removable chip avoids. *(page only)*

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

## The status mark's rules — moved from the styleguide 2026-10-12

- **The word, in its own colour, with its own glyph.** `--status-ok` for Active,
  `--status-off` for Canceled, `--status-alert` for Blocked — `circle-check`, `circle-x`,
  `alert-triangle-filled`. Three states, three outlines, so removing the colour leaves the
  column readable. All three clear AA as text; the ratios are in `CONTRAST.md`.
- ⚠️⚠️ **THE LINE THAT MUST NOT BE CROSSED: the moment two statuses share a word and differ
  only in hue, this cell fails.** What makes the column readable without colour is that
  `Active` / `Canceled` / `Blocked` are three different STRINGS and not three tints of one
  label. Colour may never become the only difference between two states.
- **`Canceled`, one L.** The reference writes "Cancelled"; the menu item, the cancel dialog,
  the activity copy and `.pill.off` all spell it with one — and a status that disagrees with
  the dialog that sets it is worse than a spelling preference. Flagged, not silently changed.
- **`Blocked` carries a tooltip; the other two do not** — it is the only one of the three
  that raises a question the cell cannot answer. The sentence is `ATTN_TIP.blocked`, the same
  text the licence banner shows.
- ⚠️ **The tooltip is NOT a `<button>`.** It hangs off a word that is the cell's own content,
  and wrapping a status in a button would offer an action this cell does not have. It takes
  `tabindex` so the keyboard can reach the bubble, and **the sentence is repeated in a `.vh`
  span, because a tooltip is a convenience for the pointer and not a carrier.**
- **An instance's status is the same mark** (`instStatusCell`) — licence, invoice and
  instance share one vocabulary. The **words** are what `instMatchesStatus` compares and what
  the filter chips count, so the mark is a presentation and not a state.

### ⚠️ How the three marks reach the styleguide page — process, not description

`statusMark` takes a **licence**, and Blocked is reached only by one that is over its
instance limit (`instOverLimit`), so the page **types the three specimens out by hand**
rather than calling the builder. The glyph choice lives in `STATUS_IC` (`components.js`), and
a fourth state would be added there, not in the markup. ⚠️ Whoever changes a glyph changes
both: the builder for the product, and the three hand-written specimens for the page.

## The version mark — moved from the styleguide 2026-10-12

- **One mark only: the number, and an alert beside it when the number is not the latest.
  Silence is the up-to-date state**, and the digits are one weight in both — so there is no
  pair of shapes to tell apart and no colour doing the telling. Presence, then colour, then
  the tooltip behind it.
- **A circled exclamation, not a triangle.** A triangle means *something is broken, act now*
  in this product; running an older release is the step below that — worth knowing, nothing
  stopped. Keeping the two shapes apart is what lets a reader scan a column of triangles and
  believe them.
- **Only the alert carries a tooltip**, and it holds the number the running one is compared
  against — there is nothing to ask about a licence that is already current. It is a real
  `<button>`: hover on a pointer device, focus for the keyboard, and a delegated tap below
  600px. A `title` would have had none of the three.
- ⚠️ **`across N instances` exists in exactly one place — the licence DETAILS header** — and
  **a licence's version figure is the LOWEST of its instances**, so one laggard and a whole
  estate print the same number. The list column dropped the phrase in 2026-09-25;
  `.ver-mixed` survives as a rule only because that header still prints it.

## Banner — one form, four hosts

`.gbanner` renders one form everywhere. The tone rule carried from the alert-tone pass is
already in force: **red is already broken, black breaks on a known date, quiet is nothing
broken — tinted, and the ground carries it.** `.alert` likewise renders one form. Nothing to
collapse.

## The frame — the bands and the rules, moved from the styleguide 2026-10-12

**The frame is four bands, in this order: toolbar · column header · rows · pagination footer.**
One block, one surface, one hairline round the outside.

- **The toolbar and the column row stick; the footer does not.** The top of the frame is pinned
  already, and pinning the bottom too leaves a strip of list between two fixed bands.
- **The frame comes off below 600px**, where every row is already its own card — an outer frame
  would be a box holding boxes.
- **An empty list has no footer at all, and the last row takes its bottom corners back**, because
  it is the bottom of the box once more. A band reading `0 of 0` under an empty state is a
  control describing the absence of the thing it controls.

### The footer shows only what is true — moved from the styleguide 2026-10-12

- **The count always shows. The page arrows and the items-per-page control appear only above
  one page**, and are `hidden` rather than removed, so nothing has to be rebuilt when a filter
  takes the list across the boundary in either direction.
- **Below 600px the footer sheds what will not fit:** items-per-page and First / Last go, the
  count takes the free space, prev and next stay.
- ⚠️ **Activity has no footer at all — it does not page, it is a log.** Every other list is the
  framed pattern. **Users has no pager either:** that list is four people by design. Both run
  through `syncPagerUnpaged`, which hands `syncPager` a synthetic single page.
- ⚠️ **The styleguide's multi-page footer is HAND-WRITTEN**, because that page never runs
  `syncPager`. Whoever changes the real footer changes the specimen separately — it is a
  drawing of the component, not the component.

### ⚠️⚠️ A FOURTH `10px`, and this one had a matching stale comment in the stylesheet

The Table lead said: *"the whole table sits inside its own hairline with a **10px radius**"*.
**The frame reads `--radius-surface` (12)** — `.listcard` at `styles.css:7380`, and the head
cells' corners at `6497`. There is no 10 anywhere in it.
⚠️ **And `styles.css:6474` still says `/* the 10px radius + the 1px the pane sits out by */`
over a rule that computes `--headPatch` from a radius it no longer has.** The number was
collapsed to 12 by the radius pass on 2026-10-06; the rule was repointed at the token and the
two sentences about it were not.

**This is the fourth `10px` found in six days** — three in the radii block (struck 2026-10-12),
one in the Inputs prose (struck the same day), and this one. **Every one of them was a sentence
beside a rule that had already been fixed.** A pass that repoints a rule at a token has to
grep the number it replaced, or it leaves the old value in the places people read.

**What the lead said that is true, and is kept:** the table is a framed object — **the head is
a filled `--surface-quiet` band**, the whole table sits inside its own hairline, and **a row
under the cursor takes `--row-hover`** (`--c-blue-25`, not `--sel`) — **transient: nothing is
selected, the pointer is simply there.** Home, Licenses, Invoices and the flat Instances list
are all this one look.

### The mechanics of sticking — moved from the styleguide 2026-10-12

**All of this was in the page's prose and nowhere in this file.** Half of it is also in
comments in `shared.js` and `styles.css`; the half that was not is marked.

- ⚠️ **The scroll container is `#shellMain`, not the document**, so `top:0` already means
  "under the app bar" and **no header height is hard-coded anywhere**. *(page only — the code
  says what it does, not why the number is absent)*
- **The column row's offset is the toolbar's MEASURED height (`--barH`)**, because the toolbar
  is a different height on every page — taller on Licenses, taller again where it wraps. A
  constant would leave a gap on one page and an overlap on another. `--barH` is never declared
  in `:root`; `wireStickyFrame` sets it on the frame and re-measures when the bar changes.
- **`overflow-x:auto` computes `overflow-y` to `auto` as well**, which makes the wrapper a
  sticky container in both axes and leaves a `thead` sticking to a box with no visible height.
  So `.tablescroll` is **made scrollable only when the table actually overflows**
  (`.is-scrollable`, toggled from script). **Sideways scrolling and a stuck column row cannot
  both happen** — and inside that box the column row gives up `--barH` for `top:0`, or it is
  pushed down by its own offset and reads as a header that has vanished.
- **"Stuck" is a rect comparison against where the element comes to rest, not `scrollTop > 0`.**
  **A scroll container's padding insets its scrollport**, and a sticky child's `top` resolves
  against that inset, so on a container with `padding-top:8px` the element parks at 8px and a
  test against the raw edge never fires. Caught on the licence panel, whose modal body carries
  exactly that.
- ⚠️ **`--stickyShadow` is a depth cue, not a border: absent at rest, and drawn by the LAST ROW
  of the stuck block only.** Two stacked shadows would read as two blocks rather than one.
  *(the "last row only" rule is page only)* The token is a **gradient**, not a `box-shadow` —
  a negative spread drew nothing on a thin element — so it is painted by a strip hung under
  the block. Every stuck surface in the product draws this same band.
- ⚠️ **Below 600px only the column row sticks; the toolbar scrolls away with the title.**
  **Three stuck rows would take a third of a phone screen.** *(the reason is page only; the
  rule itself is `styles.css:9700`, where `.listframe .stickybar` goes `position:static`.)*
  On every list today that means nothing sticks at all, and that is not a gap: the four framed
  lists turn rows into cards at this width and hide `thead` with them.
- ⚠️ **A collapsed group has no outline at all, and grouped rows are inset 12px from the
  frame.** *(page only)*

⚠️⚠️ **"The sticky list block" and "The frame" were the same object described twice** — one
section said four bands, the other said what happens on scroll. They are folded into one here,
which is why the page can now carry a single heading for it.

## Banner — the axes and the rules, moved from the styleguide 2026-10-12

| axis | values |
|---|---|
| **tone** | `tone-red` already broken · `tone-black` breaks on a known date · `tone-quiet` nothing broken |
| **host** | Home slot · licence panel (`#subAlert`) · impersonation · dismissible success |

- **One banner at a time.** If two conditions are true, state the more serious one and **name
  the other in the same banner** rather than stacking: two banners are two problems competing
  for one glance.
- **A blocking state carries no close control.** Blocked, payment failed and no-payment-method
  are conditions where something has already stopped or is about to, and a dismissible blocker
  is one that gets closed once and never seen again.
- **On the licence page the same conditions are never dismissible: Home notifies, the licence
  records.**
- **Nothing renders that is not in the Home banner inventory** — a condition with no row there
  does not get a banner invented for it.

### Where a message goes — moved off the styleguide 2026-10-12, when the Messages tab was removed

⚠️⚠️ **A message has ONE place, decided by its KIND. Nothing invents a third.**

| kind | place |
|---|---|
| **result of an action** — finished, and no truer for staying on screen | **snackbar**, outside the licence panel: bottom of the viewport on desktop, top below 600px. Leaves on its own |
| **persistent state** — true until something changes | **the slot below the panel header** (`#subAlert`). One at a time; if two are true, the more serious one names the other |
| **field error** — about one input | **inline beside that input**, never the snackbar: the person reads it *while* fixing the thing it describes |

⚠️ **The field-error row came here 2026-10-13**, when the snackbar's prose on the styleguide
was cut to a description. It was the only place the rule was written down, and a description
is not where a rule lives — the same move the Messages tab made a day earlier.

**The snackbar's inventory**, and it is a closed list: plan changed · capacity purchased ·
add-on removed · coupon applied · label saved · payment method updated · subscription
cancelled · updates renewed · invoice downloaded. **Nothing transient goes in `#subAlert`,
and nothing persistent goes in the snackbar.**

- ⚠️ **One banner sits ABOVE the header and only one: `#licNewBanner` — *License created*** —
  so a newly created licence with a problem can show both it and its state banner at once.
  **It appears once per licence, ever**, and ⚠️ **the seen mark is written when it is SHOWN,
  not when it is dismissed** — otherwise a reload turns a one-time message into a permanent
  one (`license-details.js:2114`).
- ⚠️ **Exception: `License key copied` and `Instance ID copied` answer in the button's own
  tooltip, not the snackbar.** A copy is a micro-action on a small control, and an answer at
  the edge of the screen makes the reader look away from the thing they just pressed.

*(The tab that held this was prose with no specimen, so it was removed from the design system
and the rules brought here. The `#subAlert` half was already above; the placement rule, the
inventory and the `#licNewBanner` rule were not.)*

## The licence table — moved from the styleguide 2026-10-12

**Four columns, with the licence's name folded into the product cell** (`licHeadHTML` /
`licRowHTML`).

- **Two lines per licence cell: the label, then product · billing model · plan. With no label
  the plan moves up.** ⚠️ **Never empty and never blank-first** — the cell always has a first
  line, because a row that starts with white space reads as a missing value rather than an
  absent one. *(page only)*
- **Version is the only right-aligned column**, tabular numerals, newest first.
- ⚠️ **`Updated` was removed: one reader, and nothing sorted or filtered by it.** A column that
  no control touches is a column the reader has to rule out on every scan. *(page only)*
- **`LABEL_MAX` is 40 characters with a visible counter.** The cell clamps to one line and
  carries the full string in `title`.
- ⚠️ **`maxlength` refuses new input but never truncates a stored value**, so seeded labels
  that predate the limit keep their text. The limit is a guard on typing, not on data.

## Table header — four forms, and all four are the same cell

`TH` differs only in padding: `8px`, `8px 20px 8px 32px`, `8px 8px 8px 20px`,
`8px 20px 8px 8px`. **Those are first-cell and last-cell gutters** — position in the row, not
a variant of the cell.

## Not touched

**The 601–952 mid-width table band.** A missing layout tier across four tables; it stays in
the debt and is not a component question.


---

# Outside the nine — three surfaces the census never covered

**Moved from the styleguide 2026-10-12.** The stepper, the activity feed and the empty-state
family were never part of the nine-component census, so **none of their rules were in this
file at all** — twenty were checked before the cut and twenty were missing. Most lived only
in the page's own prose.

## The wizard stepper

**Every step at once: a numbered circle and a name, joined by a line. Only the current step's
circle is filled.** Three states on `.nl-steps > .nl-step`: **done** — ringed number in ink;
**current** — filled circle; **upcoming** — ringed number in grey.

- ⚠️ **The step list is COMPUTED per mode, and steps drop out of it.** `steps()` in
  `wizard.js` builds it — Change plan and Manage add-ons are not the new-licence flow — and
  the stepper renders what `steps()` returns, **so it cannot show a step the flow does not
  have.** A written-down list would drift the first time a mode changed. *(page only)*
- ⚠️ **The fill is INK, not the accent.** The accent means *"we suggest this"* — the Popular
  plan card, `Included` — and a filled step says **"you are here"**, which is a fact and not a
  recommendation. Two different jobs must not share a colour. *(page only)*
- ⚠️ **The line INTO the current step counts as travelled**: behind a step the connector is
  ink, ahead of it grey. The current step is somewhere you have arrived, not somewhere you are
  about to go. *(page only)*
- ⚠️ **Done steps are clickable; upcoming ones cannot be jumped to**, because the next step is
  **computed from what this one holds**. Jumping forward would ask the flow a question it
  cannot answer yet. *(page only)*
- **Widths:** below 900px the names go — circles joined by lines still read as a stepper.
  Below 600px only the current step shows, named.

## The activity feed

**An axis with entries hanging off it** (`activityList`): **the entry renders a row with a
mark; the list renders the day separators and draws the rail.** The named thing inside a
sentence is the **Tag** component (`.fi-chip`) — see §4.

**The shape.** The day is a separator row on the axis. **An entry is plain text with a mark,
not a card** — a box appears only when there is more than the sentence. The time trails the
sentence after a middot.

- ⚠️ **The entry is NOT self-sufficient: the date is the LIST's row**, not the entry's, so
  **every surface goes through `activityList`** — the account feed, the licence tab and the
  styleguide alike. An entry rendered on its own would be an event with no day.
  *(`components.js:1641`)*

**The mark** is keyed on the **type's prefix**. The disc is filled `--accent`; **what can go
wrong takes `--status-alert`**. The glyph differs per kind.

- ⚠️ **Three named exceptions to the prefix key: payment failed, check failed, updates
  expiring.** They belong to prefixes whose other members are ordinary, so the key alone would
  paint a failure like a success. *(page only)*
- ⚠️ **No category is carried by hue alone, and there is no per-category palette.** The glyph
  carries the kind; the colour carries only whether something went wrong — the same rule the
  status mark lives by. *(page only)*

**Anatomy:** what it is about · what happened · what changed, from and to · who did it · the
time. **A changed value** is drawn as the change: the old value struck through and quiet, an
arrow, the new one in a `.pill`.

- ⚠️ **A reason or an amount sits INSIDE the sentence, never only behind the expander.** What
  the reader needs to act on cannot be one click away. *(page only)*
- ⚠️ **The expander shows `named field · from → to`, only for types with something to show,
  and it never repeats the sentence.** It is not a raw record. *(page only)*

**One chip per entry: the entity** — licence label, instance label, user email, invoice
number. Everything else is plain. (The rule *one per entry, the entity and nothing else* is
already in §4 Tag; what follows was not.)

- ⚠️ **A chip says "this is a named thing", not "this matters more" — and two entries have no
  chip at all.** A chip used for emphasis makes the column unreadable for its real job.
  *(page only)*
- ⚠️ **In a licence's own tab the entity is DROPPED, not chipped again: the bracketed segment
  is what the licence scope removes.** Naming the licence inside its own tab is the sentence
  repeating its heading. *(page only)*

**Voice** — and all of it was page only:
- ⚠️ **Past tense, no auxiliary. One sentence, ending in a period. Never "successfully".
  Dates as `Sep 13, 2026`.**
- ⚠️ **A machine event has NO actor, rather than saying "System".** An invented actor is a
  claim about who did it.
- ⚠️⚠️ **No HTML in a string, ever.** The copy says what happened; **the component decides
  what is emphasised** — which is what lets search match the sentence. A string carrying its
  own markup cannot be searched, translated or re-emphasised.

### The four shapes, and the grouped run — moved with the examples tab 2026-10-12

The examples were split onto their own page (**Activity examples**) and their prose came off
with the cut. It is **grouped by TYPE, not by domain**: four shapes, every event type landing
in exactly one, and the shape derived from the sample at render time rather than typed in.
A per-domain catalogue would have been a catalogue of COPY, which `ACTIVITY_TEXT` already is.

- **A run is a maximal sequence of one instance's own successes.** Check-ins are **derived,
  not stored** — the licence reports hourly, so a ninety-day history is thousands of rows.
- ⚠️ **A failure NEVER joins a run, even between two successes.** It is the one entry the
  reader is scanning for, and folding it into a count would hide it.
- ⚠️⚠️ **A gap ends a run, and the structure is the message.** "4 successful checks, 08:57 to
  11:57" is true whether or not 10:57 happened; two groups with a hole between them say it by
  shape. **The cadence is recorded, not guessed** — measured against `CHECKIN_INTERVAL_H`,
  with `checkGapMin()` absorbing jitter.
- ⚠️ **Nothing in the feed expands any more.** The group used to carry every folded entry and
  open to them, repeating what the summary already said. Removed, not hidden behind a click.

*(All of this is in `components.js:1848`; none of it was in this file.)*

## Empty states

**An empty state says why it is empty and, where there is one, what would fill it.**

**Saved note vs snackbar** (`.savednote` · `.snack`) — **the saved note is a persistent fact
about a form, beside the button that caused it; the snackbar is a transient event on a list,
outside the layout. They never share a surface.**
- ⚠️ **And that is why the pair never competes: a page either has a Save whose result is a
  stored state, or a list whose result is a changed row.** The split is the kind of thing being
  reported, not a choice between two ways of reporting. *(page only)*

**Invite block** (`.inviterow`) — **one row, always on screen; only the table comes and goes.
Its height does not change: the message slot is always in the layout** (`visibility`, not
`display`), so a message cannot push the form.
- ⚠️ **`Copy invite link` is in the HEADER: it is the other way to invite, not a second button
  belonging to the field.** *(page only)*

**New-account empty** (`.emptybox.eb`) — **three parts: what this page is, what will appear
here, and at most one action. Only Licenses carries a primary** (a new account has exactly one
thing to do).
- ⚠️ **An empty page shows no chrome that operates on rows** — no search, no filters, no
  pager — **and it all comes back with the first row** (`body.list-empty`, toggled in
  `components.js:2312`). ⚠️ Measured against the **account**, not against the filter: a
  filtered-to-nothing list is `.noresults`, not an empty page.

**No results** (`.noresults`) — **dashed, not solid: it describes the VIEW, not the account,
and carries the way out.**
- ⚠️⚠️ ~~**`.emptybox` is solid and `.noresults` is dashed because two different facts must
  not look like one.**~~ **REVERSED 2026-10-12, by request: there is ONE empty treatment.**
  `.emptybox`, `.emptybox.eb` and `.noresults` all render the `--surface-empty` tint with no
  border and centred text. The distinction the border carried is now carried by **the words
  and by the way out**: a no-results block names the filter and offers to clear it, an empty
  page says what would fill it. ⚠️ **The old rule was not wrong about the risk** — two facts
  can now look alike at a glance — **it was outvoted by the cost of three looks for one
  idea.** If the two ever need separating again, separate them on the ACTION, not the stroke.
- ⚠️ **Inside a table it is wrapped in `td.noresults-cell`**, so it does not draw a cell's
  borders as well as its own. Used by all five working searches.


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

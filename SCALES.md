# Scales — decided

**This file is a spec, not a proposal.** Every section below records a decision that has
been taken. Where a decision replaced what the earlier draft proposed, the proposal is
gone rather than kept alongside it — a spec that still carries the option it rejected is
a proposal wearing a spec's title.

## Status

**Spacing is APPLIED (2026-10-06).** §1 is done: the ladder is declared, every literal reads
a token, the values have moved and the sweep is reported below. **Every other axis still
waits its own pass** — radius, elevation, overlays, z-index, motion, border width,
breakpoints, in that order unless something argues otherwise.

### What the spacing pass cost, measured

Paired mirrors, settings bar stripped, mesh excluded; 10 widths × 15 pages + 5 modal
surfaces.

| | |
|---|---|
| taller, typical page | +54 at desktop, +52…+130 at 601–640 |
| taller, worst | **Activity at 390: +869px** — ~350 feed rows at ~2.5px each. **Accepted.** Nothing is cut, the feed scrolls anyway, and this is the measured cost of the pass rather than damage |
| shorter | Instances and Invoices at desktop, −4; licence details at 768, −10 |
| newly wrapped | **none.** Across ~1200 text leaves checked, one label went 3 lines → **2** (an improvement) and five swapped both ways inside the styleguide's own token tables |
| newly overflowing | **the top bar** — see the debt note below |

### ⚠️ What the pass did to table rows, and the one thing the report missed

Four table rows each gained **exactly +16px of minimum width**, all of it in the actions
cell: padding 28→32 and 18→20 (**+6**), the copy button 58→62 (**+4**), the kebab 42→46
(**+4**), the gap between them 6→8 (**+2**). Three tables began overflowing at a width where
they did not — Invoices at 944, Instances at 800, the Home licences block at 700 — and the
rest deepened by 16. Figures per width are in the debt entry.

⚠️ **The actions cell keeps 32/20.** Rolling it back to 28/18 would take two values off the
scale to buy 6px in a problem that is short by 35 to 357. The scale cost three stages; six
pixels that solve nothing is not what it is sold for. The rest is the recorded 601–952 debt:
a missing layout tier on four surfaces, a component to design, not a number to tune.

⚠️⚠️ **Two thirds of that +16 is the icon buttons, and that is product-wide.** `copy` and the
kebab grew with every icon button in the product, so the same +4 each is in every dense
row — toolbars, the key line, instances, users, banner actions — not only in these four
tables. **The stage-3 report did not name it**, because it measured page heights and the
main scroller's overflow, and a button growing 4px only shows where the row has no slack
left. Anyone sizing a dense surface from now on counts from **62 and 46**, not 58 and 42.

⚠️⚠️ **The top bar now overflows from 900, and is 18px deeper than before.** `.tb-trail`'s
right edge went 1163.5 → **1181.5**; at 900 the overflow was 0 and is now 4, at 768 it was
120 and is now 136. **This is the already-recorded "topbar overflows from 601 to ~1150px"
debt, made worse by this pass, not a new defect.** It is the next pass, taken alone:
**diagnose and report before changing anything** — what sets `.tb-trail`'s right edge, which
of the +18 came from which move, and whether the fix belongs to the trail, the bar's padding
or the nav's gap. The cause gets named before a number is touched.

⚠️ **One change to the product was made while deciding, and it is not a scale change.**
`Billing email` now takes a full row of its `.field2` pair (`.field2 > .fullrow` in
`styles.css`, `fullrow` on the field in `billing.html`). It is in because §8's `640`
threshold turned out to be holding that one field's longest value upright, and a threshold
cannot be retired while it is load-bearing. Details and the after-measurements are in §8.

## What the numbers here are counted from

**The current working tree**, re-derived for this document — not copied from `VALUES.md`.
That file was generated before the type passes, the modal fixes and the invoice work, and
its spacing figures (70 values / 1459 occurrences) no longer match the file. The brief's
figures (63 / 1677) match neither. Where a count below differs from either, this one is
the one measured.

| axis | distinct | occurrences |
|---|---:|---:|
| spacing | **65** | **1530** |
| border radius | 14 | 248 |
| box-shadow | 27 | 43 |
| overlay colours | 36 | 62 |
| z-index | 17 (+1 in JS) | 36 |
| duration | 10 | 29 |
| easing | 3 | 15 |
| border width | 6 | 325 |
| breakpoints | 9 thresholds | 23 blocks |

⚠️ **A generated inventory goes stale silently.** It does not break, fail or contradict
itself — it simply stops describing the file, and the only sign of it is somebody counting
again. Counting again is what produced the table above, and it is what the next pass
should do rather than trusting it.

## ⚠️⚠️ The spacing figures were corrected on 2026-10-06. The numbers moved; no decision did.

The axis was published here as **78 distinct / 1586 occurrences**. Recounted from the file
with `tools/spacing.py` — which borrows its property set verbatim from
`tools/classify-dead.py`, the script that produced the axes in the first place — it is
**65 / 1530**. The parser was checked against a crude scan of the same file: 1122 spacing
declarations, none missed.

Where the difference came from:

| | published | in the file | why |
|---|---:|---:|---|
| `var()` tokens read as spacing | 29 values / 117 reads | **16 / 64** | the larger figure counted tokens this axis does not read |
| `0` | 445 | **446** | off by one |
| `24px` | 25 | **23** | off by two |
| `40px` | 9 | **7** | off by two |

⚠️ **This corrects counts, not decisions.** Every literal in the mapping table below matches
the file value-for-value; the ladder is unchanged; **all four visible moves stand**. And the
headline move count is unchanged at **506**, because all three mis-counted literals sit on
rows that do not move — the recount changed the denominator, not the work.

⚠️ **Two different numbers are easy to merge and should not be.** **483** is what stage 2
converted: literals whose value was *already* a step, renamed to a token with no pixel
change. **506** is what stage 3 moves: literals whose value is *not* a step and therefore
changes. They are disjoint populations, and together with `0` (446), the three off-scale
values, the 28 negatives and the 64 `var()` reads they account for all 1530.

Font size is out of scope. The palette — brand, status, surfaces — is out of scope except
where a colour is pure black or white at an alpha, which is the Overlays section.

Excluded as dead-only, per `DEAD.md`: `1.1`, `inherit`, `rgba(255,255,255,.35)`, `.02em`,
`var(--ic-30)`.

## How steps are named

Every token is named for **what it does**, never for what it is made of. There is no second
theme today — zero occurrences of `prefers-color-scheme`, `data-theme` or `color-scheme` —
and this spec does not build one. The naming rule costs nothing now and is the only part of
this document that cannot be retrofitted cheaply later: a role survives a theme, a recipe
does not.

⚠️ **Spacing is the one axis where a pure role name per step would be a fiction**, and the
spec says so rather than inventing one. A 12px gap is control padding in one place, a grid
gutter in another and a stack margin in a third; naming the step `--space-control` would be
false two times in three. Spacing is therefore **two layers**: a private step ladder named
by rank, and the role tokens components actually read, each pointing at a step. Components
never name a step directly. Every other axis is named by role at a single layer, because on
those axes the role and the step genuinely coincide.

---

# 1 · Spacing

65 distinct values, 1530 occurrences, 4% through tokens. The largest axis in the product and
the one with the least structure. **This is the axis the next pass applies.**

## The ladder — eleven steps

| step | value | what sits here |
|---|---:|---|
| 1 | `2px` | a glyph against its own label; chip internals |
| 2 | `4px` | the smallest gap that separates rather than crowds |
| 3 | `8px` | items on one line; cell padding |
| 4 | `12px` | control padding; the default gap inside a component |
| 5 | `16px` | between stacked components |
| 6 | `20px` | between a heading and what it heads |
| 7 | `24px` | between blocks on a surface |
| 8 | `32px` | between bands of a page |
| 9 | `40px` | page gutters at desktop |
| 10 | `48px` | the widest routine inset |
| 11 | `64px` | separation that is doing the work of a divider |

Plus `0`, which is not a step — it is the absence of one.

2–4–8 doubles, then 4px increments to 24, then 8px increments. The breaks are where the data
breaks: everything from 1 to 24 is in constant use, everything above 24 is occasional and
clusters loosely.

## The role tokens components read

Named for the job, each aliasing a step. This is the layer that appears in rules.

`--space-glyph` (2) · `--space-tight` (4) · `--space-inline` (8) · `--space-control` (12) ·
`--space-stack` (16) · `--space-heading` (20) · `--space-block` (24) · `--space-band` (32) ·
`--space-gutter` (40) · `--space-inset` (48) · `--space-divide` (64)

⚠️ The existing `--pageX`, `--pageY`, `--headX`, `--contentX`, `--cellx`, `--cardpad`,
`--s-grp`, `--s-card`, `--s-field`, `--s-sec`, `--s-own`, `--backGap` are already role
tokens of exactly this kind — 64 occurrences — and they become aliases of steps rather than
independent numbers. **Seven of them alias in stage 2** (their current value is a step):
`--pageX` 24→block and 16→stack, `--pageY` 20→heading, `--backGap` 12→control,
`--headX` 16→stack, `--cardpad` 12→control, `--s-card` 12→control, `--s-sec` 24→block,
`--s-sechead` 16→stack. **The rest keep literals until stage 3**, because their current
value is not a step: `--pageY` 28 (desktop), `--contentX` 86 / 22, `--cellx` 22 / 18,
`--s-grp` 28, `--s-field` 14, `--s-grphead` 10.

## ⚠️⚠️ Two of the tokens on this axis describe nothing, and are mapped anyway

Both were found by measurement during the stage-1 split, both are **mapped mechanically with
everything else**, and neither is deleted here. Deleting dead rules is its own pass with its
own measurement; folding it into a scales pass is the mistake this project has recorded
three times.

**`--s-sechead` (16px) is a claim about nothing.** Its only reader is
`.setcard-h{margin-bottom:var(--s-sechead)}` inside `@media(max-width:600px)`, and that rule
is overridden in **every case that exists**:

| the element | what wins | computed |
|---|---|---:|
| `.setsec > .setcard-h` (three on Billing) | `.setsec > .setcard-h{margin-bottom:14px}` — specificity (0,2,0) vs (0,1,0); a media query adds no weight | **14px** |
| `.setcard-h-page.pagetitlerow` (Account, Billing, Security) | `body[data-page=…] .pagetitlerow{margin-bottom:0}` | **0px** |

So the number on screen is **14px**, from a rule that does not read the token, and the 16px
the token names is never rendered anywhere. ⚠️ **The real question for the dead-rule pass is
therefore not "delete or keep" but "does 14 become the token, or does the override go".**
Mapping it to `--space-stack` in stage 2 changes nothing on screen and does not answer that;
it only stops the value being an orphan literal while the question is open.

**`.nl-prodrow` has no markup at all.** Grepped across every `.html` and `.js`: zero. The
rule `gap:var(--s-grphead)` on it is mapped for consistency, **not because anyone sees it** —
`--s-grphead`'s one live reader is `.nl-billrow`.

## ⚠️⚠️ `--s-own` is split first. Nothing else on this axis moves until it is.

**Decided, and it is a precondition, not a task in the queue.** `--s-own` is 10px inside
`#nlStepPick` (`styles.css:8803`) and 16px inside `.setgrid` (`styles.css:9277`) — one name
holding two numbers, in two different ≤600 blocks, read by four rules between them. It
cannot become one alias of one step, and any mapping written while it is in this state maps
a name that does not mean one thing.

Split into two names that say which spacing they are, then map each to its step:
`#nlStepPick`'s 10 → step 4 (12), `.setgrid`'s 16 → step 5 (16, no move).

**Order: split, then map the axis.** Not the other way round, and not both in one pass.

## Every value, mapped

| current | ×  | → step | move | |
|---|---:|---|---:|---|
| `0` | 446 | `0` | — | |
| `12px` | 126 | 12 | — | |
| `10px` | 117 | 12 | **+2** | |
| `8px` | 113 | 8 | — | |
| `14px` | 106 | 16 | **+2** | |
| `16px` | 84 | 16 | — | |
| `6px` | 67 | 8 | **+2** | |
| `18px` | 54 | 20 | **+2** | |
| `2px` | 51 | 2 | — | |
| `4px` | 40 | 4 | — | |
| `20px` | 26 | 20 | — | |
| `24px` | 23 | 24 | — | |
| `9px` | 23 | 8 | −1 | |
| `22px` | 22 | 24 | **+2** | |
| `5px` | 21 | 4 | −1 | |
| `7px` | 20 | 8 | +1 | |
| `3px` | 13 | 4 | +1 | |
| `13px` | 9 | 12 | −1 | |
| `40px` | 7 | 40 | — | |
| `32px` | 8 | 32 | — | |
| `1px` | 7 | 2 | +1 | |
| `34px` | 7 | 32 | **−2** | |
| `28px` | 7 | 32 | **+4** | ⚠️ visible, decided |
| `30px` | 7 | 32 | **+2** | |
| `26px` | 7 | 24 | **−2** | |
| `11px` | 5 | 12 | +1 | |
| `44px` | 4 | 48 | **+4** | ⚠️ visible, decided |
| `48px` | 4 | 48 | — | |
| `15px` | 4 | 16 | +1 | |
| `38px` | 3 | 40 | **+2** | |
| `23px` | 1 | 24 | +1 | |
| `56px` | 1 | 64 | **+8** | ⚠️ visible, decided |
| `60px` | 1 | 64 | **+4** | ⚠️ visible, decided |
| `64px` | 1 | 64 | — | |
| `37px` | 1 | — | — | off scale |
| `80px` | 1 | — | — | off scale |
| `110px` | 1 | — | — | off scale |

**506 of 1530 occurrences move. 13 of them move visibly, and all four visible values move
UP.**

## The five near-duplicate groups

**12 / 10 / 14 / 13 / 11 — 363 occurrences, the heaviest cluster in the product.**
Absorbed by two steps, not one: `12` keeps 10, 11, 13 (140 occurrences move by 1–2px);
`16` takes 14 (106 occurrences, +2). Splitting the group is what keeps the move invisible —
collapsing all 363 onto 12 would push 14px down by 2 and gain nothing, while collapsing onto
14 would create a step the rest of the ladder does not want. **No visible moves.**

**8 / 6 / 9 / 7 — 223 occurrences.** All onto `8`. 6 moves +2 (67), 9 moves −1 (23),
7 moves +1 (20). **No visible moves.** The largest single consolidation here and the
cheapest: 110 occurrences change by 2px or less and the step they land on is already the
most used value in the band.

**16 / 18 / 15 — 142 occurrences.** `16` keeps 15 (+1); `18` goes to **20**, not 16. 18 is
54 occurrences of "a bit more than a stack gap", and pushing it down to 16 erases the
distinction its authors were reaching for, while pushing it up to 20 keeps it. Either
direction is 2px. **No visible moves.**

**22 / 20 / 24 / 23 — 74 occurrences.** `20` and `24` are both steps, so this group splits
rather than collapses: 22 → 24 (+2, 22 occurrences), 23 → 24 (+1).
⚠️ 22 is the licence panel's head inset, and a derivation hangs off it: `--contentX` is
**86 = 22 (head inset) + 52 (`--backW`) + 12 (`--backGap`)**, verified in `:root`.
**The derivation moves with it or it stops being a derivation.** This is the one group where
the arithmetic matters more than the pixels.

**4 / 5 / 3 — 74 occurrences.** All onto `4`. 5 moves −1 (21), 3 moves +1 (13).
**No visible moves.**

## The four visible moves — decided, all upward

**`28px` → 32 (+4), 7 occurrences.** `.authbody` · `.fs-devinput.locked` ·
`.hc-cols .hcsect` · `.hcsect` · `.lic-row > td.cellact` (and the matching `thead th`) ·
`.licmodal .sheet` · `.planblock`.
⚠️ `.fs-devinput.locked` had a floor, and the decision clears it: its 28px was set from a
measurement — the lock glyph sits at `left:9` and is 20px wide, so the inset has to clear
29px. **Raising to 32 is safe; this is the direction that keeps the value off the glyph.**

**`44px` → 48 (+4), 4 occurrences.** `.dwrap,.licview,.sheet` (**every page's bottom
padding**) · `.faqsect` (margin-top) · `.keygrid` (the licence panel's fact row gutter) ·
`tr.inst-row` (padding-right).

⚠️⚠️ **THIS ENTRY DESCRIBED THE WRONG EDGE, AND THE DECISION WAS TAKEN AGAINST THAT
DESCRIPTION.** It said "the page gutter … every page's left and right edge widens by 4". It
does not. `.dwrap,.licview,.sheet` is `padding: var(--pageY) var(--pageX) 44px` — the sides
are **`--pageX`, which is 24, already a step, and did not move**. The 44 is the **bottom**.
Measured after the pass: `.dwrap` padding-bottom 44 → 48, padding-left and padding-right
**24 → 24**.

**The move stands** — 48px of bottom padding on every page is fine, and it is where ~4px of
each page's growth comes from. What does not stand is the sentence it was decided under: a
spec that records a decision under a false description teaches the next reader the wrong
thing about what was decided, and the next person to touch the page gutter would have gone
looking for it here.

**`56px` → 64 (+8), 1 occurrence.** `.planpicker .plangroups` margin-top — the gap above the
plan groups on the landing page and the first-run Home screen. The largest single move in
the spec, on the product's main selling surface.

**`60px` → 64 (+4), 1 occurrence.** `.sg-main` padding — styleguide only, no product surface
affected.

## Off the scale

**`37px` ×1** — `#invoicesList .inv-amt` padding-right inside the 601–952 band. Not a chosen
value: it is 48 − 11, where 11 is the deficit measured between the row's minimum and its
container. On a scale it stops tracking the thing it was derived from. It belongs in a
comment, which is where it is.

**`110px` ×1** — `tr.inv-row > td.mono` padding-right in the phone card. It reserves the
space the two action buttons occupy in the same grid area. Derived from a control's width,
not from a rhythm.

**`80px` ×1** — `.sg-wrap` padding. Styleguide page frame. One occurrence does not earn a
step, and forcing it to 64 is a 16px change to make a table tidier.

**`calc()` and `env()` compositions, `100%`, `auto`** — left exactly as they are.
`env(safe-area-inset-bottom)` (4 occurrences, three wrapped in `calc(12px + …)` or
`calc(22px + …)`) is a device measurement; what the scale owns is the constant added to it,
and those constants map like any other value. `calc(24px - 1px)` ×2 is a hairline correction
— a value deliberately one pixel off a step so a border does not double; **rounding it
recreates the defect.** `calc(var(--pinH, 96px) + 16px)`, `calc(var(--bnavH) + 12px)`,
`calc(var(--sel-gutter) + 22px)`, `max(40px, calc(…))` follow the same rule: the constant is
on the scale, the composition is not. `100%` ×2 and `auto` ×22 are not lengths.

## Negatives — 12 values, 30 occurrences

`-1` (3) · `-4` (5) · `-6` (3) · `-8` (2) · `-10` (3) · `-13` (1) · `-14` (3) · `-16` (2) ·
`-18` (2) · `-20` (1) · `-22` (3) · `-24` (2). ⚠️ Published here as 28; it is **30** — a
shorthand like `margin:-4px 0 -4px 6px` contributes two tokens, not one.

## ⚠️⚠️ The model covers a third of them. 19 of 30 matched no inset.

**This is the finding of the pass, and it is worth knowing before anyone writes a rule that
assumes the model is general.** "A negative is the negation of the inset it undoes" is true
of **11** occurrences. The other **19** are three other things wearing the same minus sign:

| kind | × | what they actually negate |
|---|---:|---|
| **matched** — a container's inset | **11** | `-22`×3 and `-20` (the head's own insets) · `-24`×2 (`.usersbody`, `.setcard-page`) · `-18`×2 (`.dblock`) · `-16`×2 (`.am-sechead-sub`, `#subAlert` through `.head`) · `-14` (`.am-addon`) |
| **a border width** | 3 | `.tab` over the tablist's hairline · `.nl-joined > .nl-terms` closing a 2px seam · `.vh`'s clip recipe |
| **geometry** | 4 | `.btn-spin` ×2 and `.btn--sm .btn-spin` ×2 — half the spinner's own size, which is how a `left:50%` box centres on itself |
| **the element's own extra size** | 2 | `.plancard.is-popular` growing symmetrically and pulling itself back into the row |
| **an optical nudge** | 10 | `-4`×5 on inline glyphs and icon buttons · `-10`×3 tightening icon buttons against the key · `-6` on `.tb-back` · `-13` on `.nl-backrow .nl-back` |

⚠️ **Each of the 19 is now a literal with its reason beside it in `styles.css`**, which is
the point: they are not unconverted leftovers, they are values that a spacing scale has no
business owning. Two are actively dangerous to "fix" — the three border negations would
double a hairline at −2, and the spinner offsets have to track `width`/`height`, not a step.

⚠️ **The spinner pair is already half a pixel adrift** and was before this pass: the box is
15px and the offsets are 8 and 6. Named, not touched.

⚠️⚠️ **No mirrored scale.** Every one of these is a pull-out: a margin that undoes a padding
declared somewhere else so a child can reach an edge its parent inset it from. A mirrored
ladder would let a pull-out and the inset it undoes drift apart by a step and still both be
"on the scale" — which is exactly the bug class this project has recorded twice (the
`.head-rest` negative margins, the `.canvas .gridtbl` inset).

**A negative is written as the negation of the token it undoes.** The pattern already exists
and is already the majority — `calc(-1 * var(--pageX))` ×12, `calc(-1 * var(--headX))` ×2,
`calc(-1 * var(--cellx))` ×1. The 28 literal negatives are the ones not yet converted.

⚠️ **This is the one place on this axis with real work rather than renaming.** Each literal
negative has to be matched to the inset it cancels, and **a literal that matches no inset is
a finding, not a mapping.** It does not get forced onto the scale and it does not get a
token; it gets reported.

⚠️ **One is already known to be of that kind.** `-13px` ×1, `.nl-backrow .nl-back`
(`styles.css:3484`): it pulls back **the text button's own internal padding** so the word
`Back` sits on the content's left edge — the comment above it at `styles.css:3474` says so.
There is no container inset for it to be the negation of. It stays a literal, with its
reason beside it, and it is the example of what the rest of the sweep is looking for.

> **37 literal lengths collapse to 11 steps plus zero; 3 stay off the scale; 506 of 1530
> occurrences move, 13 of them visibly, all four visible values upward.**

---

# 2 · Border radius

14 distinct values, 248 occurrences.

## The scale

| token | value | what it is for |
|---|---:|---|
| `--radius-sharp` | `0` | a surface that meets another surface flush |
| `--radius-tight` | `4px` | the smallest rounding that reads as intentional — focus rings, small marks |
| `--radius-control` | `8px` | inputs, cells, inset fields |
| `--radius-surface` | `12px` | cards, menus, dialogs |
| `--radius-feature` | `24px` | the plan card |

Plus two that are **not steps**: `--radius-pill` (`999px`) and `--radius-circle` (`50%`).

⚠️ **Pill and circle are shapes, not sizes, and that is why they are tokens of their own.**
`999px` does not mean "very round" — it means "as round as this box can be", and its
rendered radius depends on the box's height, not on the scale. Putting them on a size ladder
invites someone to "step down" a pill to 12px, which changes what the component is. Same for
`50%`.

## `10px` → 12 — decided, and it is the decision, not a side effect

39 occurrences, the single most common rounded surface in the product: **cards, menus and
the grouped instances table all get slightly rounder.** The alternative was `10px` → 8, which
merges it with the control radius and leaves a card as round as an input. Rejected.

## The plan card keeps a radius of its own — the scale gains a step at 24

`.plancard` (`styles.css:6142`) is `border-radius:20px`, one occurrence, the only value in
the 16–20 band, on the largest object on the selling surface. It does not join
`--radius-surface` (that would be −8 and visible in the wrong direction), and it does not
stay an orphan literal. **It moves 20 → 24 (+4) and takes `--radius-feature`.**

## ⚠️⚠️ The collision: `--btn-r` is already 24, and the two are allowed to be equal

`--btn-r:24px` is declared at `styles.css:22` and read 12 times. From this pass on, **two
tokens hold the number 24 for two unrelated reasons**:

| token | 24 means | read by |
|---|---|---|
| `--btn-r` | **control radius** — how round a control is | buttons, chips, toolbar, fields, selects, stepper, `.paystripe`, date input |
| `--radius-feature` | **feature-card radius** — how round the plan card is | `.plancard` |

**They must never be merged, and the equality is not the reason to merge them — it is a
coincidence of value between two independent decisions.** Controls are deliberately rounder
than the cards they sit on in this product; the plan card is deliberately rounder than other
cards because it is the selling surface's hero. Those are two separate arguments that
currently land on the same number.

**The test, for whoever finds this later:** if the control radius changes, does the plan card
change with it? No. If the plan card changes, do the buttons? No. Two answers of "no" mean
two tokens, whatever the values say. A single shared token would make the next change to
either one silently change the other, and the failure would be visible on the landing page.

## Mapping

| current | × | → | move | |
|---|---:|---|---:|---|
| `0` | 68 | sharp | — | |
| `10px` | 39 | surface (12) | **+2** | ⚠️ decided — cards, menus, grouped table |
| `6px` | 37 | control (8) | **+2** | |
| `8px` | 32 | control | — | |
| `999px` | 22 | pill | — | |
| `50%` | 15 | circle | — | |
| `var(--btn-r)` | 12 | unchanged | — | stays its own token, see above |
| `4px` | 7 | tight | — | |
| `12px` | 5 | surface | — | |
| `7px` | 5 | control (8) | +1 | |
| `9px` | 2 | control (8) | −1 | |
| `14px` | 2 | surface (12) | **−2** | |
| `3px` | 1 | tight (4) | +1 | |
| `20px` | 1 | **feature (24)** | **+4** | ⚠️ visible — `.plancard` |

> **14 values collapse to 5 steps plus 2 shape tokens plus the existing control radius;
> 87 of 248 occurrences move, 1 of them visibly.**

---

# 3 · Elevation — three levels

27 distinct `box-shadow` values across 43 occurrences. Almost every shadow is unique, and
**three different things are wearing one property.**

## They are not one axis

| kind | occurrences | what it is |
|---|---:|---|
| drop shadows | 16 | an object lifted off the surface behind it |
| rings (`inset 0 0 0 Npx`) | 13 | a border drawn without taking layout space |
| press shadows (`inset 0 Npx Npx rgba`) | 2 | a control being pushed in |
| `none` | 11 | the absence of all three |

⚠️ **Only the first is elevation.** The rest are on the list above only because `box-shadow`
is the property they happen to share, and they get their own scales below.

## The three levels

| token | geometry | alpha | what sits here |
|---|---|---|---|
| `--elevation-menu` | `0 8px 24px` | `--ink-a2` (.08) | a popover anchored to the control that opened it; a control floating over content it scrolls with |
| `--elevation-dialog` | `0 16px 44px` | `--ink-a4` (.18) | a modal, a sheet, a snackbar, the full-screen box |
| `--elevation-docked` | `0 -8px 24px` | `--ink-a4` (.18) | anything anchored to the bottom edge, casting upward |

**Five levels collapsed to three. The two that were left over are folded, not kept.**

⚠️ **The upward level is a direction, not a depth**, which is why it survives the collapse
as its own token: three components cast upward, and inverting a downward shadow by hand is
how two of them ended up with different blurs for the same job.

⚠️ **Its geometry is `0 -8px 24px` — the cleanest of the three, taken whole, not an
average.** Averaging four numbers nobody chose produces a fifth number nobody chose.

⚠️⚠️ **The alphas come from the ink ladder in §4 BY RANK, not through a role name.** A
shadow's darkness and a scrim's darkness are the same question asked twice, so this axis
does not answer it privately — but a menu shadow reading `--overlay-hover` would be a role
name telling a lie, and buying a consistent name by darkening every menu to .18 is a visual
change made to solve a naming problem. **Menus keep the light end of the ladder; dialog and
docked take the .18 rank.**

## What each component does, with the alpha delta spelled out

**Menu level** — `0 8px 24px` at `--ink-a2` (.08):

| component | now | Δ alpha | what changes |
|---|---|---:|---|
| `.menu .pop` | `0 6px 20px /.08` | **0** | offset +2, blur +4 |
| `.dropmenu` | `0 6px 20px /.10` | **−.02** | offset +2, blur +4 |
| `.dprofmenu` | `0 12px 32px /.16` | **−.08** | ⚠️ **loses its heavier blur and alpha** — becomes identical to the other two |
| `.totop` | `0 3px 14px /.16` | **−.08** | ⚠️ folded up from the old `raised` level: offset +5, blur +10 — **larger and lighter at once** |
| `.licmodal .fs-close` | `0 4px 14px /.16` | **−.08** | ⚠️ same fold: offset +4, blur +10 |

**Dialog level** — `0 16px 44px` at `--ink-a4` (.18):

| component | now | Δ alpha | what changes |
|---|---|---:|---|
| `.modal` | `0 14px 44px /.18` | **0** | offset +2, blur unchanged — this level's anchor |
| `.paymodal` | `0 18px 48px /.20` | **−.02** | offset −2, blur −4 |
| `.snack` | `0 10px 30px /.28` | **−.10** | offset +6, blur +14; noticeably lighter |
| `.authbox` | `0 1px 2px /.04, 0 12px 40px /.08` | **+.10** on what remains | ⚠️ **drops to a single layer**: the contact shadow goes, the cast shadow deepens |
| `.fs-box` | `0 24px 64px /.28` | **−.10** | ⚠️ folded down from the old `shell` level: offset −8, blur −20 — **lighter shadow than now** |

**Docked level** — `0 -8px 24px` at `--ink-a4` (.18):

| component | now | Δ alpha | what changes |
|---|---|---:|---|
| `.fs-right.pinned` | `0 -8px 24px /.10` | **+.08** | ⚠️ **the only alpha in the whole axis that goes up.** Geometry already matches — this level was taken from it |
| `.fsheet-panel` | `0 -8px 40px /.18` | **0** | blur 40 → 24 |
| `.dprofmenu,#headKebabPop,.permenu` (≤600) | `0 -12px 40px /.22` | **−.04** | offset −12 → −8, blur 40 → 24 |

> **Thirteen components, one alpha rising (`.fs-right.pinned`, +.08), three unchanged, nine
> falling. The axis gets lighter overall, which is what collapsing onto two ranks out of six
> does when the values that invented themselves were mostly on the heavy side.**

⚠️ **The upward shadows are four, not three — and the fourth is the phone's bottom sheets.**
The earlier draft listed `.statebar`, `.fsheet-panel` and `.fs-right.pinned` and missed
`.dprofmenu,#headKebabPop,.permenu`, which only exists inside `@media (max-width:600px)`.
It is three in the end anyway, because `.statebar` leaves — see the next line.

⚠️ **`.statebar` keeps its own `0 -6px 24px /.24` and is not mapped.** It is the settings
bar, which §4 excludes from the design system as a reviewing instrument. It goes when the
bar goes.

## ⚠️ Three things to look at once they are applied, not adjust quietly

All three are the consequence of three levels instead of five, not of anything chosen for
them, and they are to be reported after the pass rather than tuned during it:

1. **`.totop` and `.licmodal .fs-close` cast a larger and lighter shadow** — blur 14 → 24,
   alpha .16 → .08. Both move in opposite directions at once, which is the hardest kind of
   change to predict from numbers.
2. **`.fs-box` casts a lighter shadow than now** — `0 24px 64px /.28` → `0 16px 44px /.18`.
   The full-screen box is the largest object the product ever lifts, and this is the one
   place where the collapse takes depth away from the thing furthest off the page.
3. **`.fs-right.pinned` is the only alpha that rises** — .10 → .18 on the phone's pinned
   summary bar. Its geometry is already the level's geometry, so the shadow under that bar
   is the single clearest place to judge whether .18 is the right rank for `docked`.

## Rings — a separate scale

13 occurrences, and they are borders. Named for what they mark:

`--ring-selected` (`inset 0 0 0 2px <ink>`) — `.nl-select.on`, `.plangrid .nl-select.on`
`--ring-recommended` (`inset 0 0 0 2px <accent>`) — `.plancard.is-popular`
`--ring-invalid` (`inset 0 0 0 1px <status-alert>`) — `.field.err`, `.fs-devinput.numfield.is-bad`
`--ring-hairline` (`inset 0 0 0 .5px <line>`) — `.btn--menu`, `.blockmore-go`
`--ring-hover` (`0 0 0 1px <line>`) — `.lcard:hover`, `.fsep-dot` (outset, not inset)
`--ring-halo` (`0 0 0 4px <card>`) — `.blockmore-go`

⚠️ **The ring tokens take their width from the border-width scale (§7), not a second copy of
it.** `inset 0 0 0 1px` and `inset 0 0 0 2px` of the same colour are one token at two widths.

⚠️ **`.5px` stays, as a named hairline on the ring width scale.** It is a sub-pixel line that
renders differently per device pixel ratio, and rounding it to 1px is **visible on three
rules for no gain**. Decided: it is a width the scale names, not an error the scale corrects.

⚠️ **`--ring-halo` is a ring made of the surface colour**, not a line: it punches a hole in
the faded table rows behind `.blockmore-go` so the button separates from them. It is the only
ring in the product whose colour is a surface rather than a line, and it will not survive a
dark theme unchanged, because the hole has to match whatever is behind it.
`.blockmore-go` is therefore `--elevation-menu` **plus** `--ring-halo`, two tokens in one
declaration, because it was always two jobs in one declaration.

## Press — 2 occurrences, left alone

`inset 0 3px 4px rgba(0,0,0,.55)` on `.btn--primary:active` and `…,.45` on the destructive
variant. Two values, two components, one job. They are a **state**, not a depth, and the
difference between .55 and .45 compensates for a different button fill underneath. One token
with the alpha staying per-variant. **Not elevation, and not on the overlay scale either.**

## Where `--scrollCue` goes

**Not here.** It is not a shadow: it is a `linear-gradient` stop used as an edge cue on
`.tablescroll`. It is an overlay — ink at an alpha over a surface — and it maps to
`--overlay-edge` in §4.

> **27 shadow values collapse to 3 elevation levels, 6 ring tokens and 1 press pair.**

---

# 4 · Overlays

## ⚠️⚠️ The settings bar is excluded from the design system

**Decided, and it is the largest single thing this section does.** `.sb-*` and `.statebar`
are a **reviewing instrument**. They do not exist in the product, nobody will ship them, and
nobody designed the nine levels of white they invented — the bar invented them because there
was nothing to reach for.

**Their alphas are not mapped. They are not folded. They go when the bar goes.**

Measured: the bar owns **13 of the 22 white-alpha occurrences** in the stylesheet —
`.08 .10 .12 .14 .16 .22 .32 .45 .5 .6 .62 .66 .82`, on `.sb-toggle:hover`, `.sb-tab:hover`,
`.sb-act:hover`, `.sb-sub`, `.sb-tabs`, `.sb-opt`, `.sb-act`, `.sb-group`, `.sb-opt:hover`,
`.sb-act:hover`, `.sb-sublabel`, `.sb-tab`, `.sb-opt` — plus the `0 -6px 24px /.24` shadow in
§3. Mapping them value by value would have been dressing an instrument as a system.

## Then they are three different things, not one

**(a) Gradient ramp.** `.dblock.has-fade tbody tr.is-fading > td` alone contributes black at
`0`, `.04`, `.12`, `.28`, `.50`, `.78` — six values that are **stops in one gradient**, not
six overlay levels. They have to hold their relative proportions or the fade stops being a
fade. They become a single named ramp, **`--fade-rows`, off the alpha scale entirely.**

**(b) Text on ink.** `.alert.tone-black .amsg-when` (.72), `.gbanner.on-ink .btn--ghost`
(.72) and `.hb-todo` (.78) are **foreground colours**, not overlays. White at .78 on an ink
surface is "primary text on a dark ground". They leave this axis for
`--on-ink-primary` / `--on-ink-secondary` / `--on-ink-muted`, which belong to the type and
colour system. (The bar's `.45 .62 .66 .82` are the same kind and leave with the bar.)

**(c) Actual overlays** — a wash of ink or light laid over whatever is beneath. What is left.

## The ink scale — two layers, the same shape as spacing

⚠️⚠️ **This axis is the second one that gets a private ladder plus role tokens, and for the
same reason spacing does: one alpha genuinely does more than one job.** Ink at .08 is a
pointer resting on a row and it is also the darkness a menu's shadow is drawn at — naming
the step `--overlay-hover` and then handing it to `box-shadow` would make the stylesheet say
something untrue about itself. The alternative was to give every shadow the .18 role and
accept menus getting visibly darker, which is a visual change made to settle a name.

**The private ladder, by rank. Nothing outside this file names these directly except the
role tokens and the elevation levels.**

| rank | value |
|---|---|
| `--ink-a1` | .04 |
| `--ink-a2` | .08 |
| `--ink-a3` | .14 |
| `--ink-a4` | .18 |
| `--ink-a5` | .32 |
| `--ink-a6` | .50 |

**The role tokens components read:**

| token | rank | what it does |
|---|---|---|
| `--overlay-wash` | `--ink-a1` | the faintest tint that is still visible |
| `--overlay-hover` | `--ink-a2` | a pointer resting on something |
| `--overlay-edge` | `--ink-a3` | an edge cue; the shade under a sticky element. **`--scrollCue` maps here** |
| `--overlay-shadow` | `--ink-a4` | a wash standing in for depth where a shadow cannot be cast |
| `--overlay-scrim` | `--ink-a5` | the dimming behind a modal |
| `--overlay-scrim-sheet` | `--ink-a6` | the dimming behind the phone's bottom sheet |

**And the elevation levels (§3) point at the ranks, not at the roles:** menu → `--ink-a2`,
dialog and docked → `--ink-a4`. A shadow is not a hover and is not a scrim; it shares their
darkness without sharing their job, and the ladder is what lets it say exactly that.

⚠️ The white side gets the same treatment in principle, but with three values and three jobs
that genuinely coincide, the second layer would be three aliases of three ranks used once
each. It stays single-layer until a second reader for one of them appears.

`.04`(3) → wash · `.05`(1) → wash (+.01) · `.07`(1) → hover (+.01) · `.08`(2) → hover ·
`.10`(3) → hover (−.02) · `.12`(2) → edge (+.02) · `.14`(1) → edge · `.16`(3) → edge (−.02) ·
`.18`(2) → shadow · `.20`(1) → shadow (−.02) · `.22`(1) → shadow (+.04) ⚠️ ·
`.24`(1) → excluded with the bar · `.28`(2, after the ramp leaves) → shadow (+.10) ⚠️ ·
`.32`(3) → scrim · `.35`(1) → scrim-sheet (+.15) ⚠️ · `.45`/`.55`(2) → the press pair, §3

## ⚠️⚠️ `.fsheet-scrim` goes from .35 to .50 — and that is why there are two scrim tokens

**Decided: the page behind the phone sheet gets noticeably darker.**

The earlier draft put `.fsheet-scrim` and "the scrim" on one token at .50, and that was
wrong about the product: **the modal scrim is ink @ .32**, declared three times — `.overlay`,
`.fs-screen`, `.payoverlay` — as `rgba(28,28,28,.32)`. The draft's two `.50` occurrences were
both **gradient-ramp stops**, which leave for `--fade-rows`. So the `.50` it called the scrim
was never a scrim at all.

One scrim token at .50 would therefore have darkened **every modal backdrop in the product**
by +.18 — a change nobody asked for, hidden inside a change somebody did. Two roles instead:

- `--overlay-scrim` @ .32 — `.overlay`, `.fs-screen`, `.payoverlay`. **Unchanged.**
- `--overlay-scrim-sheet` @ .50 — `.fsheet-scrim`. **+.15, and visible, as decided.**

⚠️ This is a second token where the draft wanted one, and the reason is worth keeping: the
phone's bottom sheet covers less of the screen than a modal does, so it needs to dim harder
to read as the same amount of "the page is behind this". That is a real difference between
the two surfaces, not an inconsistency to tidy away.

## The light scale — built from the three alphas that remain

⚠️⚠️ **Excluding the bar does not trim the light scale. It replaces it.** All three tokens
the earlier draft proposed took their values from the bar — .12 (`.sb-act:hover`), .22
(`.sb-opt`), .45 (`.sb-group`). With the bar out, the light side of the product is **three
distinct alphas across six occurrences**, and they are different numbers:

| token | value | what it does | occurrences |
|---|---|---|---:|
| `--overlay-light-press` | white @ .14 | a pointer pressing or resting on a control on an ink ground | 4 |
| `--overlay-light-track` | white @ .35 | the unfilled part of a ring drawn on an ink control | 1 |
| `--overlay-light-border` | white @ .55 | the edge of an outlined control on an ink ground | 1 |

`.14` — `.alert.tone-black .aact:active`, `.gbanner.on-ink .btn--secondary:active`,
`.gbanner.on-ink .btn--ghost:active`, `.snack-x:hover`.
`.35` — `.nl-spin`, the spinner's track.
`.55` — `.gbanner.on-ink .btn--secondary`, the border.

> **Every light value is already a single consistent number. Nothing on the light side moves
> at all.** The only reason it looked like a seventeen-value mess was that an instrument was
> being counted as a product.

---

# 5 · z-index

17 values in CSS, 36 occurrences, plus `'320'` written as a string in `shared.js:2038`.

## The ten layers

| token | value | what sits here |
|---|---:|---|
| `--z-beneath` | `-1` | a layer painted behind its own parent: the mesh, the table-head underlay |
| `--z-raise` | `1` | something lifted within its own component: a badge, a feed mark |
| `--z-sticky` | `10` | a bar or head that sticks while content scrolls |
| `--z-chrome` | `20` | the top bar and tooltips — above the page, below anything that opens |
| `--z-popover` | `40` | a menu anchored to a control |
| `--z-docked` | `90` | the phone's bottom bar, the back-to-top button |
| `--z-overlay` | `100` | a modal, its scrim, and the full-screen wizard |
| `--z-sheet` | `140` | a phone bottom sheet, which has to clear the bottom bar |
| `--z-toast` | `400` | a snackbar — above everything the product can open |
| `--z-instrument` | `880` | the settings bar; not product chrome |

## Mapping

`-1`(3) → beneath · `1`(3) → raise · `5`(3) → sticky (−5) · `11`(2) → sticky (−1) ·
`12`(3) → sticky (−2) · `20`(5) → chrome · `40`(2) → popover · `60`(1) → popover (−20) ·
`88`(1) → docked (+2) · `90`(1) → docked · `95`(2) → overlay (+5) · `100`(3) → overlay ·
`120`(1) → popover (−80, the `.dprofmenu` phone override, deleted — see below) ·
`130`(1) → **leaves the global scale, see below** ·
`140`(2) → sheet · `400`(2) → toast · `880`(1) → instrument

**No z-index move is visible unless it changes a stacking order, and none of the above
does** — each group is already contiguous and nothing crosses a neighbour.

## ⚠️⚠️ `130` — `.fs-right.pinned` is not a layer. Measured.

**Decided after measuring, not assumed.** Both checks the decision asked for were run in the
browser at 390px, on the Capacity step, with the card actually pinned.

**Is `.fs-right` inside `#nlModal`?** Yes, and the chain is:

```
.am-sec.fs-right.nl-calcsum.pinned    position:fixed   z-index:130
  .fs-grid                             static
    #nlStepCap.haspin                  static
      #nlBody.fs-body                  static
        .fs-box                        position:relative   isolation:isolate   ← stacking context
          #nlModal.fs-screen           position:fixed      z-index:100         ← stacking context
```

**Does `#nlModal` create a stacking context?** Yes — `position:fixed` with `z-index:100`.
And so does `.fs-box` **between** them, through the `isolation:isolate` that was put there
for the mesh (`styles.css:3008`). **There are two stacking contexts over the card, not one.**

So `130` never meant what it looks like. It cannot place the card above the modal, above an
overlay, or above anything outside `.fs-box` — the browser clamps it to its own context long
before any of those. It is a global-looking number doing local work, and the only reason it
has not caused a bug is that nothing has needed the band between 100 and 140.

**Measured further, and this is the part that settles the value:** with the step scrolled
under the bar, the card paints over the step content at `z-index` 130, 10, 5, 1, 0 **and with
no z-index at all**. `position:fixed` already puts it in the positioned layer above the
static step content; the z-index was never what kept it on top. The only declared z-indexes
inside `.fs-box` are `.meshbg` (−1), `.pc-badge` (1) and `.fs-header` (5, sticky to the
opposite edge, no overlap). The step carries no tooltips, and tooltips open upward from their
trigger, so none can reach the bar.

**Decided: `130` leaves the global scale. The card takes `--z-sticky` (10), local to the
modal** — which is also what it is: a bar that stays while content scrolls past it.

⚠️ **The behaviour does not change and must not.** At narrow widths the summary card pins to
the bottom of the modal, stays visible, and the step content scrolls under it. The pass that
applies this confirms the card still paints over the step content at the widths where it
pins — the measurement above says it will, but it says so about the current build.

## ⚠️⚠️ The 140 band: there are no menus inside the wizard

The question was asked about "the menus that open from inside the wizard". **The wizard has
no menus.** Grepped: zero `dropmenu`, zero `.pop`, zero `aria-haspopup` anywhere in
`wizard.js`.

The two rules at 140 are `#headKebabPop` (`styles.css:8711`) and `.permenu`
(`styles.css:9082`), **both inside `@media (max-width:600px)` only**, and neither belongs to
the wizard:

| rule | what it is | where it lives |
|---|---|---|
| `#headKebabPop` | the licence panel's header overflow menu | `license-details.js:110`, inside `DETAILS_HTML` |
| `.permenu` | the period control's menu | `components.js`, the Activity toolbar and the panel's Activity tab |

**Measured at 390px, the chain above each of them on its page host runs to `#shellMain` with
no stacking context anywhere in it.** So on `license.html` and `activity.html` the 140 is a
real global claim, and it is doing real work: it clears `.bnav` (90) and `.totop` (88), which
is exactly what a bottom sheet on a phone has to do.

⚠️ **The same rule is clamped in the other host.** When the licence panel is mounted as a
modal, `#headKebabPop` sits inside `.licmodal .fs-box` — `isolation:isolate` again — so its
140 is local there and clears nothing. One number, two meanings, decided by which host
mounted the markup.

**Decided: the layer stays, and it is named `--z-sheet` for what it does** — a phone bottom
sheet above the phone's bottom bar. The old name described a menu opening over a modal, which
is a job nothing in the product performs.

## `.dprofmenu` 60 / 120 — one token at both widths. Decided on the measurement.

The split is `z-index:60` at the top level and `z-index:120` inside the ≤600 block
(`styles.css:4766` and `styles.css:8174`). It is a deliberate phone override, not a
collision, and the question recorded against it was: **nobody has written down what the phone
value needs to clear.**

Measured at both 390px and 1280px, the chain is the same:

```
.dprofmenu#dashProfMenu   absolute (60) / fixed (120)
  .dprofile               relative, z auto
    .tb-trail             static
      .dtopbar-inner      relative, z auto
        header.dtopbar    position:relative  z-index:20   ← stacking context
```

**It needs to clear nothing, because it cannot reach anything.** Both values are clamped
inside the top bar's own stacking context at 20. Neither 60 nor 120 can rise above `.bnav`
(90), `.totop` (88) or any modal, at any width. The phone override buys exactly as much as
the desktop value: both of them order the menu against its siblings inside the bar and
nothing else.

**Decided: `--z-popover` at both widths. The `@media (max-width:600px)` override at
`styles.css:8174` goes.**

⚠️ **The measurement is recorded here on purpose.** "The phone probably needs to clear
something" is exactly the hunch that put 120 there, and it is the hunch that will put it
back. The chain above is the answer: there is nothing between the menu and the root that it
could clear, because the top bar closed the context before the menu was reached.

## ⚠️⚠️ `'320'` in `shared.js:2038` — and the function is not called what the notes say

**Decided: it becomes a token the stylesheet also declares.** A layer that only JavaScript
knows about is a bug waiting to happen.

⚠️ **The function is `elevateOpenPops()`, not `positionPop()`.** `positionPop` does not exist
anywhere in the repository — the earlier draft and the debt entry both name a function that
has never been there. Grepped before writing this line.

What it does: for every open `.dropmenu` or `.menu .pop`, it sets `position:fixed` and
`z-index:320` **inline**, so no ancestor's overflow can clip the menu. It does **not**
re-parent the node.

⚠️ **And because it does not re-parent, 320 is not reliably a layer either.** The inline value
is clamped by whatever stacking context the pop already sits in — global on a page host,
local inside `.licmodal .fs-box`. So the stylesheet and the script disagree about what is on
top **and** the script disagrees with itself depending on the host. Both halves go away when
the number becomes a declared token and the band it names is one the stylesheet owns.

⚠️ On the phone the helper skips `#headKebabPop` and `.permenu` deliberately (they are bottom
sheets there, and inline position beats the stylesheet) — so the 320 band is a desktop-only
thing today.

> **17 values plus 1 in JS collapse to 10 layers; 1 (`130`) is removed as not a layer at
> all; 1 phone override (`.dprofmenu` at 120) is deleted as inert; 0 occurrences move
> visibly.**

---

# 6 · Motion

## Durations

10 values, 29 occurrences — two unrelated populations.

**Transitions: `.12s`(9) · `.15s`(4) · `.16s`(2) · `.18s`(6) · `.7s`(2).**

| token | value | what it is for |
|---|---:|---|
| `--motion-quick` | `.12s` | a state change the pointer caused: hover, press, a chevron turning |
| `--motion-settle` | `.18s` | something arriving or leaving: a bar docking, a header fading |

`.15s`(4) → quick (−.03) · `.16s`(2) → settle (+.02). Neither is perceptible.

**`--motion-spin` — `.7s` ×2**, off the transition scale. `.btn-spin` and `.nl-spin` are
**loop periods**, not transition durations: the number says how fast a spinner rotates and
there is no state being transitioned. One token, named for the loop.

**Ambient: `31s` · `34s`(2) · `37s` · `39s` · `48s` — off the scale, with the reason in a
comment beside them.** The landing mesh drift and the crossfade. ⚠️ **They are deliberately
unequal and deliberately not round**: four blobs drifting on four near-prime periods is what
stops the background from visibly looping. Putting them on a scale would synchronise them and
reintroduce the loop. **The comment is part of the decision, not optional** — the next person
to see five odd numbers in a row will otherwise tidy them.

## Easings

Three values, 15 occurrences. **All three survive as named roles:**

`--motion-ease` — `ease` (11), every transition. The one easing the scale owns.
`--motion-linear` — `linear` (2), the two spinners. ⚠️ A rotation must be linear or it
visibly stutters once per revolution; this is not a style choice.
`--motion-drift` — `ease-in-out` (2), the mesh drift and the crossfade. A drift that starts
and stops abruptly reads as a jump.

> **5 transition durations collapse to 2 steps plus 1 loop token; 5 ambient values stay off
> the scale; 3 easings survive as 3 named roles; 0 occurrences move visibly.**

---

# 7 · Border width

6 values, 325 occurrences, 0% through tokens — and dominated by two.

| token | value | what it is for |
|---|---:|---|
| `--border-hairline-half` | `.5px` | the sub-pixel hairline, §3's `--ring-hairline` |
| `--border-hairline` | `1px` | 168 occurrences — every divider, frame and field edge |
| `--border-emphasis` | `2px` | 26 occurrences — focus rings, selected states |

Plus `--border-none` (`0`, 126 occurrences), which is the absence of a width rather than a
step on the ladder.

`3px`(2) → emphasis (−1). `.faq-cat` and `.sg-flag` are left-edge accent bars rather than
structural borders, but they map without harm.

## ⚠️ `1.5px` on `.nl-smark` stays as it is

**Decided.** It is the stepper's numbered circle, and it is the only fractional width in the
product because a 1px ring looked thin against a 28px circle and 2px looked heavy. **It was a
judgement, not a rounding error**, and the scale does not get to overrule a judgement on the
grounds that it is the only one of its kind.

## ⚠️ `5px` on the tooltip arrow is not a border

`.tip.show::before` and its hover twin build the tooltip's **arrow** out of border triangles.
The number is the arrow's size. **Off the scale**, and it must not join a width ladder.

> **6 values collapse to 3 steps plus zero; 1 stays off the scale; 2 of 325 occurrences
> move, 0 of them visibly.**

---

# 8 · Breakpoints

9 thresholds across 23 media blocks, collapsing to three.

| token | value | what it is |
|---|---:|---|
| `--bp-phone` | `600` (and its `min-width:601px` partner) | the phone layout. The product's one real boundary |
| `--bp-tablet` | `900` | the wizard grid stacks, the plan table widens, the billing card stacks |
| `--bp-wide` | `1200` | the top bar's own padding and nav gap; the plan grid's column count |

## What moves

**`1199` → 1200 (3 blocks).** `.dtopbar-inner` padding, `.tnav` gap, `.tnav-item` padding.
A 1px shift of a boundary; nothing inside changes. Free.

**`1080` → 1200 (2 blocks) — decided, and visible.** ⚠️ **The plan grid drops to three columns
120px earlier**, and `.plancard.is-popular` loses its vertical pull-out 120px earlier. Both
are on the selling surface. The alternative was keeping 1080 and admitting a fourth
threshold; rejected.

**`640` → 600 (1 block) — decided, and it now costs nothing.** See below: the field it was
protecting was fixed first.

**`820` → deleted (4 blocks) — decided, and it costs nothing.** ⚠️⚠️ **The threshold does
nothing at all.** Three of its four rules — `.sidebar`, `.brand`, `.nav` — are the displaced
shell `DEAD.md` lists: grepped, no markup anywhere in any `.html` or `.js`. The fourth,
`.app`, **is live** (`#appView`, built in `license-details.js`) — but the rule sets
`grid-template-columns:1fr`, which is **exactly what `.app` already declares at
`styles.css:370`**. A no-op restating the base rule. Three dead rules and one that changes
nothing: a block to remove, not a breakpoint to map.

## ⚠️ `760` stays — it is a content measurement, not a device boundary

**Decided.** 760 is the width where three plan cards stop fitting. Folding it into 900 would
take the plan grid to a single column 140px earlier, stacking five plans on a tablet where
they currently sit three across. The number has to track the cards, and a named device
threshold would freeze it against them.

The same is true of **`952`**, which stays off the scale for the same reason: it is derived
from the invoices row's own 905px minimum against a `width − 48` container, so 953 is the
first width that fits. If the table's columns change, the number has to change with them.

## ⚠️ `900` is kept rather than folded

Twelve blocks use it and they are genuinely a middle tier: the wizard's two-column grid, the
licence panel's plan table, the billing card. It is the only secondary threshold that has
earned its place.

## `640` → 600 — the threshold was hiding a field, and the field was fixed first

**The block is one rule, not three.** `@media(max-width:640px){.field2{grid-template-columns:1fr}}`
at `styles.css:7254`. ⚠️ The earlier draft credited it with stacking `.paycard` and
`.cardhelp` as well; those two are the **next declarations after the block**, at the top
level, and the block never touched them. A threshold with one rule behind it is a different
thing to decide about than one with three.

**What the first measurement found.** At 601px, with the pair forced two-up, each cell is
**245.5px** — not the ~276 the draft estimated, which was arithmetic on the viewport rather
than on the container; the form sits in a 505px card, so a cell is `(505 − 14) / 2`. Every
label held on one line, including `ZIP / Postal code`, `State / Province` and
`Tax number (optional)`. One value did not: **`billing@northwind-industrial.de` needed 263px
of text box and got 244.**

⚠️⚠️ **And that is what 640 was.** Solving for the same value, the field holds it while
`(w − 110) / 2 − 2 ≥ 263`, which is **w ≥ 640**. Measured at 641, 640, 660 and 700: nothing
clips. At 601: that one field clips, by 19px. **The threshold sat exactly one pixel above
the width at which the longest seeded billing value stopped fitting** — a content
measurement wearing a device boundary's clothes, and the clothes are why nobody noticed that
one field was driving a page-wide layout rule.

## ⚠️ The fix is the field, not the threshold

**An email address does not belong in half a row next to something short.** It is long by
nature; `Billing email` was paired with `Phone`, which is not. Pairing them is the layout
mistake, and the 640 threshold was concealing it by stacking the whole form early enough
that the email always had a full row to itself.

Applied: `.field2 > .fullrow{grid-column:1 / -1}` in `styles.css`, and `fullrow` on the
email field in `billing.html`. **The email takes the whole row at every width; the pair's
other cell keeps its half**, because a phone number does not want a full row either.

**Measured after, on the Billing page, with the seeded long values in place:**

| viewport | 1280 | 900 | 700 | 641 | 601 | 390 |
|---|---:|---:|---:|---:|---:|---:|
| email field | **800** | **800** | **604** | **545** | **505** | **358** |
| other pair cells | 393 | 393 | 295 | 265.5 | 505¹ | 358¹ |
| clipped values | **0** | **0** | **0** | **0** | **0** | **0** |
| wrapped labels | 0 | 0 | 0 | 0 | 0 | 0 |

¹ single column, because the 640 block is still live. Re-measured with it neutralised — the
state `640` → 600 produces — the pair is **245.5px at 601** and **255px at 620**, and
**nothing clips at either**.

**So `640` → 600 now costs nothing, and the field reads at rest everywhere**, including on
desktop where it had 212px of box for 230.6px of text whenever the pair was two-up.

⚠️ **The next value to clip, named before it does:** `Company name`
(`Northwind Industrial GmbH`) is 198.9px of text in 212px of box at 601 two-up —
**13.1px of headroom**, the tightest pair field left. It is fine today and it is the one to
watch, because it is paired with `Tax number`, which is also an identifier that can be long.

⚠️ **The same pairing exists in the wizard and was not touched.** `wizard.js:1854` puts
`Billing email` beside `Company name` on the Payment & Billing step, in a narrower column
than this page has. Nothing clips there at rest because the wizard's fields start empty —
the value arrives only once somebody types it. The `.fullrow` class is there to be used if
that surface should match; this pass stayed on the page the measurement was asked about.

> **9 thresholds collapse to 3; 1 is deleted as inert, 2 stay off the scale as derived
> (`760`, `952`); 13 of 23 blocks move, and 3 of those move something visible.**

---

# Implementation rules

**1 · Merge into the existing `:root`. Never add a second `:root` block.**
⚠️ **This rule stood here with a false justification until 2026-10-06.** It said
`check-collisions.py` would fail on a second `:root`; it would not — that count matches a
bare single **class**, and `:root` is not one. The file was already carrying four top-level
`:root` blocks (16, 388, 6419, 6527) while the sentence was being relied on. A rule with a
false justification beside it is worse than a rule with none, because the next person trusts
the guard instead of reading.
**The guard now counts them**, as a ratchet at the four that exist, and was verified by
adding a fifth to a throwaway copy and watching it fail. Merge first; do not wait for it.

**2 · One axis per pass.** The next pass is spacing, and nothing else. Every axis here has a
visible move in it, and a pass that carries two of them cannot tell which one somebody is
reacting to.

**3 · `--s-own` splits before the spacing pass touches anything** (§1).

**4 · Measure in a band, not at three widths.** Any "what moved" report takes a sweep
(1440 · 1280 · 1024 · 944 · 900 · 768 · 700 · 640 · 601 · 390), because three points chosen
from the request are how the invoices table's +67px went unreported for a day.

**5 · Strip the scaffolding before measuring.** The settings bar takes 158px off every
overlay at 1280 and 229px at 601. A measurement that inherits it invents findings.

**6 · ⚠️⚠️ Compare PAIRED MIRRORS, never two runs separated by the edit.** A sweep taken
before a change and one taken after differ by everything that happened in between — a
re-stamped `?v=`, a re-copied mirror, a different font-load race. Measured 2026-10-06: the
time-separated sweep reported changed geometry on `privacy.html`, `terms.html` and
`license-agreement.html`, which no spacing edit can reach. Build `www/before/` from the
current tree with the stage's edit undone, serve both from the one server, and compare them
in the same instant.

**7 · ⚠️⚠️ Exclude `.meshbg` and `.lmesh` from any geometry signature.** The four ambient
blobs drift on 31/34/37/39/48s periods — deliberately unequal, so the background never
visibly loops (§6) — which means **their rects are different in any two samples**, by
hundredths of a pixel. They were the whole of that phantom diff. They are
`position:absolute`, `z-index:-1`, `pointer-events:none` and carry no layout, so dropping
them costs a sweep nothing and is the difference between a signal and a page of false
positives.

---

# The one thing left to look at, and it is after the work, not before it

**The three elevation changes in §3** — `.totop` and `.licmodal .fs-close` growing while
lightening, `.fs-box` lightening, `.fs-right.pinned` being the single alpha that rises.
They are reported once applied and judged on screen, not adjusted during the pass. Every
other question this document opened has an answer in it.

# Found while reading — not acted on

**1 · `.insttoolbar.stickybar` declares `z-index:12` on a `position:static` element.**
Measured in the Activity toolbar's chain. **A z-index on a static element does nothing and
creates no stacking context** — so this is not a value to map, it is a declaration that
either lost its `position:sticky` or never needed to exist. Which of the two is a
**correctness question**, and somebody has to find out by looking at what the toolbar is
meant to do, not by reading the number.
⚠️ **Not to be touched in a scales pass.** A pass that is changing values across the file is
the worst possible place to also change whether an element sticks: the regression would
arrive wearing the scale's clothes.

**2 · `--ring-halo` will not survive a dark theme unchanged** (§3). The hole it punches is
the surface colour, so it has to match whatever is behind the button, and in a second theme
that is a different colour.

**3 · The wizard's billing step pairs `Billing email` with `Company name`** (`wizard.js:1854`)
in a narrower column than the Billing page's. Nothing clips at rest only because those fields
start empty. See §8.

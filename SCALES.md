# Scales — decided

**This file is a spec, not a proposal.** Every section below records a decision that has
been taken. Where a decision replaced what the earlier draft proposed, the proposal is
gone rather than kept alongside it — a spec that still carries the option it rejected is
a proposal wearing a spec's title.

## Status

## ⚠⚠ ALL EIGHT AXES ARE APPLIED — 2026-10-07. THE TOKEN WORK IS FINISHED.

Spacing, border radius, elevation, overlays, z-index, motion, border width and breakpoints
are each done end to end: the tokens are declared, every literal that axis owns reads one
where the mechanism allows it, the values have moved, and every pass is reported below with
its own measurement.

**The handoff to the component work is at the end of this document, under
"From scales to components".** Start there, not here.

**How each axis landed:**

| | | |
|---|---|---|
| ~~**z-index, motion, border width**~~ | §5 · §6 · §7 | **APPLIED 2026-10-07**, one pass, one report. 0 lost, 0 gained on 172,147 elements. One item left open: `320` in `shared.js` has no layer to become — §5 |
| ~~**elevation**~~ | §3 | **APPLIED 2026-10-07.** Eight visible moves. `.nl-select.on` was added as a ninth and measured to be invisible — the rule it fixes was overridden in 100% of its carriers. The ink unification is in, except the press pair, which measured 13/255 |
| ~~**breakpoints**~~ | §8 | **APPLIED 2026-10-07.** Two visible moves, both on the selling surface. **This was the last token pass — the axis work is finished.** |

⚠️ **Elevation runs AFTER overlays, not in its numbered place** — it takes its alpha from the
ink ladder, and §4 is what builds the ladder. That ordering is now history rather than a
plan: the ladder exists.

⚠️⚠️ **§3 OWNS EVERY SHADOW ALPHA, INCLUDING ONES §4's MAPPING LINE ALSO NAMES.** See
"Where the §4 mapping line stops and §3 begins" below. Four occurrences were deliberately
left at their old values by the overlay pass because §3 sends them somewhere else — one of
them in the opposite direction.

⚠️ **Everything in this document is decided. Applying a decision needs no green light;
changing one does.** A pass stops when a finding contradicts the document, or when the
document does not cover what the pass is standing in front of — not at the end of a stage.

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

# 2 · Border radius — APPLIED 2026-10-06

14 distinct values, **250** occurrences (248 when this was written; the two added since are
`.navpick-item` and `.navpick-btn` from the top-bar band).

**Both stages are done.** Stage 1 declared the seven tokens and converted 149 literals with
zero change; stage 2 moved 88. Nothing is left as a literal on this axis.
⚠️ **What proved it was the computed-value walk, not the sweep** — 3,259 rounded elements
compared across ten surfaces at stage 1 (0 changed, 0 lost, 0 gained) and the same walk at
stage 2, where every change matched this table exactly. See implementation rule 8.

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

## `10px` → 12 — decided, and it is the decision, not a side effect — **applied**

39 occurrences, the single most common rounded surface in the product: **cards, menus and
the grouped instances table all get slightly rounder.** The alternative was `10px` → 8, which
merges it with the control radius and leaves a card as round as an input. Rejected.

## The plan card keeps a radius of its own — the scale gains a step at 24 — **applied**

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

# 3 · Elevation — APPLIED 2026-10-07

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

## ⚠️⚠️ What this pass inherits from §4, and must not rediscover

**1 · It unifies the ink.** Every shadow here is written `rgba(0,0,0, …)` and every scrim is
written `rgba(28,28,28, …)`, which is `--ink`. **Decided: one ink, and it is `--ink`** — the
reasoning is in §4 under "One ink, and it is `--ink`". This pass is where it happens, because
it is already rewriting every one of these declarations.
⚠️ **Measure it, do not assume it.** `28,28,28` is lighter than black by `11/255`; at .18
alpha that **should** be under the threshold of perception. **Report the computed difference
on a shadow at EACH of the three levels before calling it free.** If a level reads as a
change on screen, it is one, and it is reported as one rather than absorbed.

### ⚠️ MEASURED 2026-10-07, BEFORE THE PASS — and it is free, by 3/255

Each level's shadow rendered twice at its own geometry and alpha, black against ink, over
both of the product's backgrounds, and the two rasters diffed pixel by pixel.

| level | geometry / alpha | max channel Δ | mean Δ where it differs | arithmetic bound (28α) |
|---|---|---:|---:|---:|
| menu | `0 8px 24px` / .08 | **1** | 1.00 | 2.24 |
| dialog | `0 16px 44px` / .18 | **3** | 1.58 | 5.04 |
| docked | `0 -8px 24px` / .18 | **3** | 1.56 | 5.04 |

Identical on the page background (`#f4f5f6`) and on a card (`#ffffff`) — the backdrop makes
no difference, because the shadow is composited over whatever is there and only its own
colour changed.

⚠️ **The arithmetic bound is never reached, and that is the point.** `28α` is the difference
at FULL shadow alpha; a blurred shadow delivers full alpha nowhere, so the real worst case is
**3/255 on one channel of a soft gradient**, against 11/255 for the flat colours. The ink
unification is free at every level.

⚠️ **This is a canvas render, not a CSS one.** Canvas shadow compositing is the same
operation — source-over through a blurred alpha mask — and it is what let the difference be
measured in numbers instead of looked at. **Said plainly rather than passed off as a
screen measurement.** The scrims, which are flat fills rather than blurred ones, already use
ink and are not part of this question.

**2 · It owns four alphas the overlay pass deliberately left behind.** §4 stage 2 moved six
alphas and stopped at the occurrences this section sends elsewhere. They arrive here still
carrying their original values, and the deltas in the tables above are measured from those
originals — they are current, not stale:

| occurrence | still at | goes to |
|---|---:|---|
| `.licmodal .fs-close`, `.dprofmenu`, `.totop` | `.16` | menu, `--ink-a2` (.08) |
| `.fs-right.pinned` | `.10` | docked, `--ink-a4` (.18) |
| `.blockmore-go` contact layer `.05` + hover `.07` | as written | the layer is deleted; see Rings |

⚠️ **`.fs-right.pinned` is the one to not get wrong.** §4's per-value mapping line would have
sent it DOWN to .08; this section sends it UP to .18. It was left untouched precisely so it
makes one move instead of two in opposite directions.

**3 · Four inline shadow specimens in `styleguide.html` (lines ~126–129) are literals, not
tokens** — `0 3px 12px /.14` fab, `0 12px 32px /.16` menu, `0 14px 44px /.18` dialog,
`0 24px 64px /.28` wizard. They are the OLD five levels drawn as swatches. The overlay pass
could not reach them and did not try. **This pass collapses them to three or they become a
styleguide that documents a scale the product no longer has.**

## Applied — 2026-10-07

**Three elevation levels, six ring tokens, one press token. 43 `box-shadow` declarations;
three literals left, each for a named reason.**

### The measurement (implementation rule 8: computed value, paired mirrors)

| | |
|---|---|
| band | 10 surfaces × 8 widths = **80 cells** |
| elements compared | **137,745** |
| changed | 876 |
| **lost** | **0** |
| **gained** | **0** |
| distinct transitions | **8** — every one of them a move from the tables above |

Geometry was never in question on this axis and the rings do not take layout space.

### ⚠⚠ THE INK UNIFICATION IS IN — EXCEPT THE PRESS PAIR, AND THAT IS A MEASUREMENT

Measured before applying, at each level, black against ink, same geometry and alpha,
rasters diffed:

| | max channel Δ | mean | 28α bound |
|---|---:|---:|---:|
| menu `0 8px 24px` /.08 | **1** | 1.00 | 2.24 |
| dialog `0 16px 44px` /.18 | **3** | 1.58 | 5.04 |
| docked `0 -8px 24px` /.18 | **3** | 1.56 | 5.04 |
| **press** `inset 0 3px 4px` /.55 | **13** | 6.12 | 15.4 |
| **press** `inset 0 3px 4px` /.45 | **12** | 5.27 | 12.6 |

**The press pair keeps black, and the reason is structural rather than a preference.** A
press inset is a 4px blur at a high alpha, so it reaches nearly full strength, where the
11/255 between black and ink lands almost undiluted. The three levels never get there
because their blurs are 24–44px. §3 already holds press apart from elevation and from the
overlay scale; it is held apart from the ink too, **for a number rather than for tidiness**.

### ⚠⚠ THE NINTH MOVE IS NOT VISIBLE, AND THE RULE IT TOUCHES WAS NEVER WINNING

`.nl-select.on` went 1px → 2px as decided. **It changes nothing on screen, and the reason
matters more than the move.** Probed in the open wizard: **every `.nl-select` in the product
is inside `.plangrid`** — 4 of 4 on the pick step, 0 anywhere else, 0 in any other step.
`.plangrid .nl-select.on` is (0,3,0) against the bare rule's (0,2,0), so **the 1px rule was
overridden in 100% of its carriers and never painted.**

So there were never "two selected states at two widths" on screen; there was one that won
and one that could not. The move is still right — it deletes the disagreement rather than
leaving a rule that says something false about the product — but **the visible count stays
at eight, not nine.**

⚠⚠ **`.nl-select.on` IS THE `--s-sechead` PATTERN IN A NEW PLACE: overridden always, mapped
anyway.** That is now two tokens/rules in this document carrying the same fault, which makes
it a class rather than an incident. **The rule still goes** — it is in the dead-rule debt
beside `--s-sechead`, and whoever runs that pass should grep for the shape rather than for
these two names: a declaration whose every carrier is also matched by a more specific one.

### ⚠️ `.blockmore-go` stops lifting on hover

Rest and hover are both `--elevation-menu`; hover adds `--ring-hairline` over the halo. **The
tint is the standard secondary hover fill (`--surface-quiet-hover`), inherited from
`.btn--secondary:hover` and not restated.**

⚠️ **It is NOT given `--overlay-hover`, and that is a deliberate reading.** `--overlay-hover`
is ink at .08 — *translucent*. `.blockmore-go` stands on faded table rows, and a translucent
fill would let them through, which is the exact thing `--ring-halo` exists to prevent. The
instruction was that the button "joins the rule everything else already follows"; what
everything else follows is the solid `--surface-quiet-hover`, so that is what it gets. Say
the word and it becomes the literal token instead.

### Two rings the six tokens do not cover

Left as literals, named rather than forced into a token that would be wrong:

| | | |
|---|---|---|
| `#nlModal .nl-cardstack .am-addon.on` | `inset 0 0 0 1px var(--accent)` | a selected ADD-ON. `--ring-recommended` is 2px accent and `--ring-selected` is 2px ink; neither is this |
| `.plangrid .nl-select:hover` | `inset 0 0 0 1px var(--line)` | `--ring-hover` is the same colour and width but **outset**. An inset hover ring is a seventh ring, not one of the six |

And `.statebar`'s `0 -6px 24px /.24` stays unmapped, as §4 decided — it goes when the bar goes.

### The styleguide now documents three levels

Four inline literals (`fab` `menu` `dialog` `wizard`) became three specimens reading the
tokens. Left alone they would have gone on showing a five-level scale beside a stylesheet
with three.

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

# 4 · Overlays — APPLIED 2026-10-07

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

## ⚠️⚠️ ONE INK, AND IT IS `--ink` — decided, and it is the ELEVATION pass that does it

**The question.** The file writes "ink at an alpha" two ways: `rgba(0,0,0,…)` on all 27
shadows and the fade ramp, and `rgba(28,28,28,…)` on the three scrims, `--scrollCue` and
`--stickyShadow`. **`28,28,28` is `--ink`.** Stage 1 built the role tokens on ink and left
the shadows their own black, taking only the alpha from the ladder — which parked the
question rather than answering it.

**The answer: one ink, and it is `--ink`.** A shadow and a scrim do the same thing — darken
what is behind — and doing it with two different blacks has nothing behind it. The split is
accidental, not principled. `rgba(0,0,0)` is the naive choice; `--ink` at an alpha stays tied
to the palette and survives a second theme, where darkening is not black.

⚠️ **It happens in the elevation pass (§3), not the overlay pass**, because that is where
the shadows are being rewritten anyway and a colour change folded into a geometry change is
one review instead of two.

⚠️⚠️ **AND IT IS MEASURED, NOT ASSUMED.** `28,28,28` is lighter than black by `11/255`, which
at .18 alpha **should** be under the threshold of perception — should be, not certainly.
**§3 reports the computed difference on a shadow at each of the three levels before calling
it free.** If any level reads as a change, it is a change, and it gets said.

## ⚠️ `--on-ink-muted` is deliberately absent — do not declare it

Every muted-on-ink value in the stylesheet (`.45 .62 .66 .82`) belongs to `.sb-*`, the
settings bar, which this section excludes. A third role would be **an orphan on its first
day**: declared, documented, and read by nothing that ships.

**This is the `--s-sechead` lesson** (§1) applied before the fact instead of after it — that
token is overridden in 100% of its uses and was mapped anyway, and the file now carries a
name that describes nothing. `--on-ink-primary` and `--on-ink-secondary` are declared;
the third is **named here and in the stylesheet's own comment, and left undeclared.** It gets
declared the day a product surface needs muted text on ink, not before.

## ⚠️⚠️ Where the §4 mapping line stops and §3 begins — found 2026-10-07, applying stage 2

**The mapping line above was written over the WHOLE ink population, shadows included. §3
then assigns those same shadow occurrences to three elevation levels, and on four of them it
decides differently.** Both statements are in this document and they cannot both be executed.

**§3 wins, every time.** It is per-component where the mapping line is per-value, and the
ladder exists precisely so a shadow can share a darkness without being handed a role name
that lies about its job. The mapping line is a **census** — which rank each raw alpha is
nearest — not an instruction about who applies it.

| occurrence | §4 line | §3 table | stage 2 did |
|---|---|---|---|
| `.dropmenu` `.10` | hover `.08` | menu `.08` | **moved** — they agree |
| `.blockmore-go` cast layer `.10` | hover `.08` | menu `.08` | **moved** — they agree |
| `.paymodal` `.20` | shadow `.18` | dialog `.18` | **moved** — they agree |
| `.dprofmenu,#headKebabPop,.permenu` `.22` | shadow `.18` | docked `.18` | **moved** — they agree |
| `.fs-box` `.28` | shadow `.18` | dialog `.18` | **moved** — they agree |
| `.snack` `.28` | shadow `.18` | dialog `.18` | **moved** — they agree |
| `.licmodal .fs-close` `.16` | edge `.14` | **menu `.08`** | **left alone** |
| `.dprofmenu` `.16` | edge `.14` | **menu `.08`** | **left alone** |
| `.totop` `.16` | edge `.14` | **menu `.08`** | **left alone** |
| `.fs-right.pinned` `.10` | hover `.08` | **docked `.18`** | **left alone** |
| `.blockmore-go` contact layer `.05` | wash `.04` | **layer is deleted** | **left alone** |
| `.blockmore-go:hover` `.07` | hover `.08` | layer reshaped | **left alone** |

⚠️⚠️ **`.fs-right.pinned` is why this mattered rather than being tidy.** §4 sends it DOWN to
.08 and §3 sends it UP to .18. Moving it in stage 2 would have walked it .10 → .08 → .18 —
two edits, in opposite directions, to land somewhere neither pass chose on its own.

**So stage 2 moved six ink alphas across eight occurrences, and the other six occurrences
are §3's to move, with their geometry, in one edit each.**

## ⚠️ `--stickyShadow` is NOT on this axis, and the document never said so

Found applying stage 2. `--stickyShadow` is
`linear-gradient(to bottom, rgba(28,28,28,.16), rgba(28,28,28,.06) 45%, rgba(28,28,28,0))`,
and **none of its three stops appears in the mapping line above** — the line counts `.16`
three times, and the product has four if this one is included. `.06` and its `0` are not
counted anywhere at all.

**Two independent reasons say the omission was right, so it stands as a decision rather than
a gap:**
1. **It is a gradient, and the ramp's own argument covers it.** `--fade-rows` left this axis
   because its stops have to hold their relative proportions or the fade stops being a fade.
   The same is exactly true here with three stops instead of six.
2. **The arithmetic already excluded it.** `.16`(3) is the count without it. Whoever wrote
   the mapping line had already treated it as a gradient, and only the prose went missing.

**It keeps its own values and is off the alpha scale, beside `--fade-rows`.** The role table
above says `--overlay-edge` is "an edge cue; the shade under a sticky element" — that phrase
describes `--scrollCue`, which does map here, and it should not be read as a claim on this
gradient.

## Stage 1 — declare and translate, zero change (2026-10-06)

The ladder, the six roles, the three light tokens, `--fade-rows` and `--on-ink-*` declared
in the existing `:root`; every literal that matched a rank exactly rewritten to read it.
**16,998 elements across eight surfaces: 0 changed, 0 lost, 0 gained.** The ramp was checked
separately, because it is a mask and does not appear in a `background-image` walk: 10 fading
cells, identical computed `mask-image` on both sides.

## Stage 2 — the moves (2026-10-07) — **applied**

**Six alphas, eight occurrences.** Shadows keep their own `rgba(0,0,0, …)` and take the alpha
from the ladder — the ink unification is §3's, above.

| from | to | occurrences | Δ |
|---:|---|---|---:|
| `.10` | `--ink-a2` | `.dropmenu` (incl. `.navpick-menu`, `.permenu`), `.blockmore-go` cast layer | −.02 |
| `.13` | `--overlay-edge` | `--scrollCue` | +.01 |
| `.20` | `--ink-a4` | `.paymodal` (`#payOverlay`, `#couponOverlay`) | −.02 |
| `.22` | `--ink-a4` | `.dprofmenu,#headKebabPop,.permenu` (≤600) | −.04 |
| `.28` | `--ink-a4` | `.fs-box`, `.snack` | −.10 |
| `.35` | `--overlay-scrim-sheet` | `.fsheet-scrim` | **+.15, and the colour** |

⚠️ **`.fsheet-scrim` moved on two axes at once, and that is correct rather than an
overreach.** It was `rgba(0,0,0,.35)` — the only scrim in the product written in black while
its three siblings (`.overlay`, `.fs-screen`, `.payoverlay`) were already ink. Reading
`--overlay-scrim-sheet` makes it `rgba(28,28,28,.50)`: **+.15 alpha and `0,0,0` → `28,28,28`.**
This is not the deferred ink question — that one is about shadows. This is the fourth member
of a family of four joining the other three.

⚠️ **`--scrollCue` is defined AS the role, not replaced by it**: `--scrollCue:var(--overlay-edge)`.
Two gradient stops read `--scrollCue` by name, and the comment beside it records that it is
the one value in the file that will need a light-theme variant. Deleting the name to save an
indirection would delete that.

### What the pass cost, measured — paired mirrors, settings bar stripped

**Primary check (implementation rule 8): per-element comparison of computed
`background-color`, `background-image`, `color` and `box-shadow`.**

| | |
|---|---|
| ten surfaces at 1280 | 17,229 elements compared — **67 changed, 0 lost, 0 gained** |
| every changed element | one of the six moves above; nothing else moved |
| geometry | unchanged, and never in question on this axis |

⚠️ **Three of the eight occurrences live on surfaces that are not in a static walk** and were
opened for the measurement rather than inferred: `.snack` via `Snack.show`, `.fsheet-scrim`
and `.fsheet-panel` via a real `.perbtn` click at 390, the docked menu band at 390. The
`:≤600` rules were read in a genuine render, not resolved from the CSSOM.

---

# 5 · z-index — APPLIED 2026-10-07

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

## Applied — 2026-10-07

**Ten tokens declared in the existing `:root`; 35 of the 36 occurrences read one. The 36th
was deleted.**

| | |
|---|---|
| converted, no change | 22 |
| moved | 13 — `5`/`11`/`12`→10 (8), `60`→40 (1), `88`→90 (1), `95`→100 (2), `130`→10 (1) |
| deleted | 1 — `.dprofmenu{z-index:120}` |
| literals left in `z-index` | **none** |

**Both behavioural confirmations this section asked for were run, and both were run as
hit-tests in the browser rather than as arguments about numbers.**

**1 · `.fs-right.pinned` at 390, wizard open on Capacity, step scrolled under the bar.**
`z-index` 130 → 10, `position:fixed` both sides, **identical rect (top 649.2, height 194.8)**,
and `elementFromPoint` at the card's own centre returns an element **inside the card** in
both builds, over an identical paint stack
(`.am-figures` › `.am-sec.fs-right` › `.fs-body` › `.fs-box` › `.fs-screen`).
**The card still paints over the step content, and the browser says so.**

**2 · `.dprofmenu`, both widths, menu open.** 120 → 40 at 390 and 60 → 40 at 1280; identical
rect at both (`390×284` at 390, `232×231` at 1280), the menu topmost at both, identical
paint stacks. **The deletion is inert, as the measurement predicted it would be.**

### ⚠️ Three consequences that are real, measured, and were not in the section

**1 · `.totop` and `.bnav` are now the SAME layer.** `88`→90 puts the back-to-top button on
`--z-docked` beside the bottom bar. Measured at 390 on Activity with the page scrolled:
`.bnav` occupies `y 780–844`, `.totop` `y 716–764` — **they do not overlap, by 16px.** And if
they ever did, `.totop` comes after `.bnav` in the DOM, so it would still win. Free, and now
free for a stated reason rather than by assumption.

**2 · `.licmodal` and `.fsheet` are now the same layer as `.fs-screen`.** Both were 95, a
deliberate half-step **below** the generic full-screen surface at 100. Measured with the
licence panel open at 1280 and 390: `#licModal` computed **95 before, 100 after**, while
`.fs-screen` was 100 on both sides. ⚠️ **Order between them is now DOM order, not z-index.**
Driven as far as the product allows, they are never open together — the only control inside
the panel that could do it (`#renewBtn`, "Renew subscription") does not open the wizard — so
nothing changes today. **It is written down because the thing that used to express the
intent has been removed, and the next surface that opens over a licence modal will not find
it.**

**3 · `.bnav`, `.totop` and the whole docked layer are PHONE-ONLY.** Resolved by walking the
real media nesting rather than the nearest preceding `@media`: both rules live inside
`@media (max-width:600px)`, and at 1280 both compute `z-index:auto`. This is what makes §5's
claim about the 140 band correct — and it is also the fact the open question below turns on.

## ⚠️⚠️ STILL OPEN: `320` has no layer to become, and this pass did not invent one

**Decided here:** "it becomes a token the stylesheet also declares". **Not decided here:
which token.** The ten-layer table has no band between `--z-sheet` (140) and `--z-toast`
(400), and 320 sits in that gap. **`shared.js` was left exactly as it is**, because choosing
the layer is changing the document, not applying it.

⚠️ **The line is `shared.js:2085`, not `2038`** — the section's own reference has drifted.
The function is `elevateOpenPops()`, which this document already corrected once from a
`positionPop` that never existed.

**What the measurement says, so the decision is cheap when it is taken:** the helper sets
`position:fixed; z-index:320` on an open pop so no ancestor's overflow clips it, and it
**skips `#headKebabPop` and `.permenu` on the phone** — so it is desktop-only. On desktop
the entire band above `--z-popover` (40) is **empty**: `--z-docked` is phone-only (above),
and every surface at `--z-overlay` (100) is `position:fixed` with a z-index, so a pop inside
one is clamped to it and a pop outside one cannot coexist with it. **`--z-popover` looks
sufficient, and 320 looks like the same kind of inert number as the 120 just deleted** — but
that is a reading of the layers, not a hit-test, and the deleted 120 earned its deletion with
a hit-test.

---

# 6 · Motion — APPLIED 2026-10-07

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

## Applied — 2026-10-07

**Six tokens; 38 occurrences; no literal left in any `transition` or `animation` property
except the five ambient periods.**

| | |
|---|---|
| converted, no change | 32 — `ease`×11, `.12s`×9, `.18s`×6, `.7s`×2, `linear`×2, `ease-in-out`×2 |
| moved | 6 — `.15s`→`.12s` (4), `.16s`→`.18s` (2) |
| left as literals, by decision | `31s · 34s · 34s · 37s · 39s · 48s` — the mesh drift and the crossfade |

⚠️ **The shorthands were converted in place, and that needed the parser to split on commas
as well as spaces.** `transition:opacity .12s,filter .12s` tokenises as `opacity`,
`.12s,filter`, `.12s` under whitespace-only splitting — **the first duration is invisible and
silently survives the pass.** The census caught it before the conversion ran: `.12s` counted
8, the specification said 9, and the missing one was inside `.12s,filter`. Comma-splitting is
per-axis (`SPLIT_COMMA` in `tools/axes.py`), because it is wrong for the others — a spacing
value never carries a top-level comma, and a `box-shadow` one does.

## ⚠️ Both moves are below the threshold, and that was checked rather than asserted

`.15s`→`.12s` is −30ms on 4 declarations and `.16s`→`.18s` is +20ms on 2. The computed
comparison reports them as 40 and 10 changed elements across the band, which is the count of
*elements inheriting those declarations*, not of things anybody can see. **Nothing was
measured on screen here, and nothing claims to have been** — a 20ms difference in a hover
transition is not something a static comparison can speak to.


---

# 7 · Border width — APPLIED 2026-10-07

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

## Applied — 2026-10-07

**Four tokens; 324 of the 327 occurrences read one.**

| | |
|---|---|
| converted, no change | 322 — `1px`×168, `0`×127, `2px`×27 |
| moved | 2 — `3px`→`2px` on `.faq-cat` and `.sg-flag` |
| left off the scale, by decision | `1.5px` (`.nl-smark`), `5px`×2 (the tooltip arrow) |

⚠️ **The census found 327 where the specification said 325.** The two extra are `0` and `2px`
added by last session's top-bar work (`.navpick`), exactly as the radius census ran two over
its own figure for the same reason. **The drift is the document aging, not a miscount.**

## ⚠️⚠️ THE ONLY MOVE ON THIS AXIS LANDS ON TWO RULES WITH NO MARKUP

Checked after the conversion, not assumed from it: `.faq-cat` and `.sg-flag` have **zero
elements on any surface, at any width.**

- **`.sg-flag`** is already in `tools/dead-report.json` as a dead selector.
- **`.faq-cat` is not, and it carries seven rules** (`styles.css` ~10079–10163, including a
  `:hover`, an `.on`, a `:focus-visible` and a phone override). `faq.js` ships on
  `index.html` and `landing.html` and emits `faq-i`, `faq-qh`, `faq-q`, `faq-a`, `faq-h` —
  **never `faq-cat`.** It is a category rail that was designed and never built.

**So §7's one visible-in-principle move is invisible in fact, and the reason is not that
1px is small — it is that neither carrier exists.** The mapping is applied anyway, because a
dead rule that reads the scale costs nothing and a dead rule holding a literal is one more
thing for the deletion pass to read. **Added to the dead-rule debt, not deleted here:**
deleting markup-less rules is its own pass, and this one is a scales pass.


---

# 8 · Breakpoints — APPLIED 2026-10-07

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

⚠️ **And of `1301`, added 2026-10-06** — the ceiling of the top bar's collapsed band.
**Two numbers come out of the bar and they mean different things:** `1262` is where it stops
overflowing the **window**, `1302` is where it stops intruding on its own **40px gutter**.
The ceiling is the second, because at 1262 the bar clears the screen edge by half a pixel
having eaten 39.5 of its 40px inset — and the gutter is a decision, not slack, so a threshold
that consumes it is a rounding rather than a threshold.
Measured on Home, the only page carrying `Buy a license` in the bar: over the window by 61px
at 1200, 11 at 1250, zero from 1262; into the gutter by 39.5px at 1262, 21.5 at 1280, 1.5 at
1300, zero from 1302.
**It tracks the bar's contents, not the device scale** — `--bp-wide` stays at 1200, because
moving it would take the plan grid's column count with it.
⚠️ **Named cost:** at 1280, the commonest desktop width, the nav is collapsed although the
strip would nearly fit — with twenty pixels of gutter instead of forty. The collapsed nav was
accepted; a bar pressed against the window edge was not.

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

## Applied — 2026-10-07

⚠⚠ **THE CENSUS ABOVE WAS STALE, AND THE REAL FIGURES ARE BIGGER.** Not 9 thresholds across
23 blocks but **13 across 43** — the topbar band (1301) and the rest arrived after it was
taken. Recorded rather than quietly corrected, because the shape of the decision did not
change: three on the scale, three off it, two blocks deleted.

| | |
|---|---|
| `1199` → **1200** | 1 block. A 1px shift; the only thing that changes is which side of 1200 the rule falls on |
| `1080` → **1200**, `1081` → **1201** | 3 blocks. **Visible, and on the selling surface** |
| `640` → **600** | 1 block. **Visible**, and free, because the field was fixed first |
| `820` | **deleted** — three dead rules and one restating the base |
| `1000` | **deleted** — an empty block; see below |
| `760` · `952` · `1301` | off the scale, each tracking content |
| `600`/`601` · `900`/`901` | already on the scale; nothing to move |

### ⚠⚠ A MEDIA QUERY CANNOT READ A CUSTOM PROPERTY, SO THIS AXIS HAS NO STAGE 1

`@media (max-width: var(--bp-phone))` is invalid and silently matches nothing. **Every
`@media` still carries its number as a literal.** The three tokens are declared anyway — they
are where the scale is *stated*, they are readable from JavaScript, and they give the next
person a value to look up instead of a neighbour to copy. **Said here because "declare and
translate with zero change" is the shape every other axis took, and on this one the
translate half does not exist.**

### The measurement

| | |
|---|---|
| band | 10 surfaces × 15 widths = **150 cells**, straddling every move (1201/1200/1150/1100/1080, 641/620/601/600) |
| elements compared | **258,314** |
| changed | 54 |
| **lost / gained** | **0 / 0** |
| geometry | **146 / 150 identical** — the four that moved are the `640` → `600` move on `billing.html` and `account.html` at 620 and 601 |

`check-css` 2197 → **2193**, 0 dropped: exactly the four rules of the deleted `820` block.

### Move 1 — `640` → `600`, measured where it bites

| | 620 | 601 |
|---|---|---|
| `.field2` | `1fr` → **`254px 254px`** | `1fr` → **`244.5px 244.5px`** |
| `billing.html` height | 1520 → **1246** (−274) | 1520 → **1246** |
| horizontal overflow | 0 → 0 | 0 → 0 |

§8 predicted 255 and 245.5 for those cells. **Measured 254 and 244.5** — half a pixel of
rounding, and nothing clips, because `.field2 > .fullrow` already gave the email its own row.

### Move 2 — `1080` → `1200`, probed inside the wizard

The plan grid is inside the purchase modal, which a static walk never opens, so it was driven
directly. Four cards, at widths either side of the moved boundary:

| width | before | after |
|---|---|---|
| 1250 | 1 + 3, cards 226px, popular pulled −14 | *identical* |
| 1201 | 1 + 3, 217px, −14 | *identical* |
| **1200** | 1 + 3, 216px, −14 | **3 + 1, 297px, 0** |
| **1150** | 1 + 3, 206px, −14 | **3 + 1, 283px, 0** |
| 1079 | 3 + 1, 264px, 0 | *identical* |

**Between 1081 and 1200 the grid now takes its three-across form, and the cards are ~80px
wider for it** — 216 → 297 at 1200, 206 → 283 at 1150. The popular card's −14px pull-out
goes with it, which is the half that had to move in step: a card standing out of a row that
is no longer there is a card hanging off nothing.

⚠️ The same move shows on a STATIC surface too — `#sgPlans`, the styleguide's plan specimen,
which is why `.plancard` padding `32 → 16` and the footer's margin appear in the diff. A
consequence of the move, not a second one.

### ⚠️ An empty block, and why it was deleted rather than mapped

`@media (min-width:601px) and (max-width:1000px){}` — **no rules at all.** The last of the
licence-zone comparison: its contents left with the `Zone` axis on 2026-10-01 and the braces
stayed, so the file carried a fourteenth threshold that selected nothing. **An empty block is
not a breakpoint**, and mapping it onto `--bp-tablet` would have invented a threshold at 1000
for the scale to carry. Deleted on the same grounds as `820`. The content measurement its
comment recorded is kept, because it will be true again if that zone is rebuilt.

### ⚠️ The phone boundary is still written twice

Nine `matchMedia('(max-width:600px)')` calls across six scripts hardcode 600. They are **not**
wired to `--bp-phone`: building a media string from a custom property at runtime adds a
failure mode — a missing token yields a query that matches nothing, silently — to a pass
about CSS thresholds. In the debt, named, not fixed here.

---

# Variants — closed, and what the component work inherits

**Written here because this is the document the component work will be read against, and
the rule below is the one that will otherwise be got wrong.**

## The prototype settings bar is two sections now, and they mean different things

| section | what is in it | does it empty? |
|---|---|---|
| **Design variants** | competing designs waiting for a decision | **yes — that is the point** |
| **States** | conditions that must all exist, permanently, so they can be demoed | **never** |

Before 2026-10-07 the bar mixed them with no way to tell them apart, and the only record of
which control was which was prose in NOTES. A reviewer could not tell "this is a question
for you" from "this is the product having a bad day".

**States, all permanent:** `Data` (Session · Account · Arrived for · Payment · Credit) ·
`Banner › Condition` — each a different banner type from a different event · `Banner › Shape`
— `Alone, full` and the count form, two states of one banner · `License › State` — page types
by which banner the licence carries · `License › Type` and `Tier` — by subscription kind and
tier · `License › Presentation` — two ENTRY PATHS: `Modal` when the person navigates the
portal, `Shared link` when they open a link somebody sent · `Landing › Sign in` — two
arrivals · `Dev › Actions` — levers that make states reachable.

**Design variants:** `Home › Layout` — and it is the only tab in that section.

## ⚠️⚠️ A COMPONENT IS ONE COMPONENT IN BOTH HOME LAYOUTS

**Home's two layouts are NOT a pending decision for the component work.** Both are kept and
both get components. The team has not chosen which Home ships with, and that choice does not
block anything.

**The table row and the card are two ARRANGEMENTS of the same thing** — same tokens, same
states, same content, same actions, same copy. **They differ in arrangement only.**

**They do not multiply.** There is no "card version" of a component with its own tokens or
its own states. A change to the component changes both arrangements, and **anything true of
one that is not true of the other is a defect, not a variant.**

**The pairs that exist today:**

| | |
|---|---|
| the licence row | the licence card |
| the invoice row | the invoice card |

**Component work is unblocked everywhere, Home included.**

## What closed on 2026-10-07

| axis | what happened |
|---|---|
| `Everywhere › Alert tone` | **collapsed to `Tinted — the ground carries it`.** The `ink` form deleted — switch, markup and CSS |
| `Banner › Shape` | `Auto` and `With others — count` were **one state under two labels**; merged |
| `License › Presentation` | `Full page` and `Shared link` were **one page type**; `Full page` dropped |

⚠️ **The tone collapse took `--on-ink-primary` with it.** Its one reader was `.hb-todo`,
white only while Home's banner could be ink. **A closed variant takes its tokens with it, not
just its rules** — otherwise the next pass declares a scale around an orphan, which is the
`--s-sechead` mistake arriving by a new route.

## ⚠⚠ ZERO OPEN DESIGN VARIANTS — 2026-10-07

**The first time this prototype has been in that state.** Every competing design that was
waiting for somebody to choose has been chosen, and the losers are deleted rather than
retired into a note.

| axis | closed on | what happened to the losers |
|---|---|---|
| `Everywhere › Alert tone` | `Tinted — the ground carries it` | `ink` deleted: switch, markup, 13 CSS rules, `TONE_MARK`, `alertGround()`, `--on-ink-primary` |
| `Landing › Gradient` | `3 — 1's pools, 2's arrangement` | variants 1 and 2 deleted: switch, markup, the `.lmesh` layer, the crossfade, **twelve colour tokens** |

Plus two merges that were never comparisons at all — `Banner › Shape` (`Auto` and
`With others — count` were one state) and `License › Presentation` (`Full page` and
`Shared link` were one page type).

**`Home › Layout` is the one tab left in `Design variants`, and it is not pending.** Both
layouts are kept, both get components, and the rule above says why that blocks nothing.

### ⚠⚠ The rule this produced twice, and it is the one to carry forward

**A closed variant takes its TOKENS with it, not just its rules.** Both closures proved it:

| closure | token | its only reader |
|---|---|---|
| alert tone | `--on-ink-primary` | `.hb-todo`, white only while Home's banner could be ink |
| gradient | `--mesh-a-1..3`, `--mesh-b-1..3` and the six `--c-*-200` primitives behind them | the `.lmesh` layer, and nothing else |

**Thirteen tokens in two passes**, every one of them an orphan the moment its variant lost.
Left in place they would have been the `--s-sechead` mistake arriving by a new route — a
scale built around a name that describes nothing.

### ⚠⚠ The gradient reaches three surfaces, and that was the point of the sentence

`.meshbg` is Home's ground and the licence header's as well as the landing's. Variant 3 lived
behind `body[data-page="landing"][data-lbg="lifted"]`, scoped that way **on purpose** — the
note beside it said a bare change "would have moved three surfaces that nobody asked about".

**"One gradient, everywhere a gradient belongs" removes that scope deliberately.** Home's
ground and the licence header now carry the same three-pool, 84%-blob, three-stop gradient
the landing does. It is a visible change on two surfaces the comparison was never about, it
was made knowingly, and it is the thing to look at first.

### ⚠⚠ Neither trio survived, which corrects the premise

The request assumed one of the two trios would survive as the gradient's colours. **Neither
did.** Variant 3 is variant 1 re-placed, and variant 1 carries its own literals —
`rgb(197 200 247)` lavender and `rgb(255 248 229)` cream. There was no set to keep, so both
trios and all six primitives went.

### The gap that left is closed — 2026-10-07, the following pass

`--c-lav-200` (`#C5C8F7`) and `--c-amber-50` (`#FFF8E5`), minted to the palette's own shape
(`--c-<hue>-<step>`, hex, step tracking HSL lightness: 87% → 200 beside `--c-red-200`, 95%
→ 50 beside `--c-red-50`). The cream is named for its hue, 44°, which is the same ramp as
`--c-amber-400` at 41° — **palette shape over the markup's word**, and `.mb-cream2` keeps
its name.

⚠⚠ **A THIRD COLOUR SPELLING ENTERS THE FILE, AND IT IS CONFINED TO THREE RULES.** The
twelve mesh stops read `rgb(from var(--c-lav-200) r g b / .70)`. It is there because the two
obvious spellings each break a decided rule, and both were measured rather than argued:

| spelling | at `.70` | at `0` | verdict |
|---|---|---|---|
| `color-mix` from the hex | ✓ | **`color(srgb 0 0 0 / 0)`** | breaks the "never `transparent`" rule — it *is* the mud bug |
| channel triplet | ✓ | ✓ | breaks "no second spelling of the same colours" |
| relative colour | ✓ | ✓ | breaks neither: reads FROM the token, keeps channels at zero |

**Relative colour serves the no-second-spelling rule better than `color-mix` did**, because
there is nothing to keep in step. It is **not generalised** beyond these three rules.

⚠⚠ **The accepted cost: three computed `background-image` values now serialise as
`color(srgb 0.772549 …)` instead of `rgba(197, 200, 247, …)`.** Same colour —
0.772549 × 255 = 197 exactly. Recorded so a later sweep does not read it as a regression.
Note that `sweep.js` excludes `.meshbg` under implementation rule 7, so the ordinary run
never sees them at all; they are measured on their own.

⚠⚠ **AND THE PIXELS ARE NOT BIT-IDENTICAL, WHICH IS SAID RATHER THAN ROUNDED OFF.** Both
spellings rasterised through `foreignObject` and diffed, 400×40: the control (same CSS
twice) is **0**, and literal-against-relative is **80 channels in 64,000 — 0.125% — each at
±1/255** (R 15, G 0, B 65, A 0). No column changes its colour; the differences are single
pixels scattered across rows while row 0 is identical. **It is the gradient rasteriser's
dither taking a different numeric path for `rgba()` and for `color(srgb …)`.** The colour is
identical; the dither is not.

⚠ **`--c-lav-50` was NOT re-pointed, and the comment claiming it was derived is corrected.**
It said "that hue at about 12% on white" and "Derived, not picked". Reproducing `#F6F6FD`
from `--c-lav-200` on white needs **a different percentage per channel — R 15.5%, G 16.4%,
B 25.0%** — so no single mix produces it. The best single value renders `#F6F6FE`, one unit
off on blue; the claimed 12% renders `#F8F8FE`. It is a hand-tuned neighbour in the same
ramp, and it keeps its value.

---

# From scales to components

**Read this first. It is written for somebody opening the button component with no memory of
the eight passes above, and it is deliberately long where being brief would cost a day.**

All eight axes are applied. What that bought you is this: **you never choose a number.** You
choose a meaning, and the meaning already has a number behind it. If you find yourself typing
a pixel value into a component, that is the signal that either you have missed a token or you
have found something the scales do not answer — and the third list below is where to check
which.

## 1 · The tokens a component reads

| for | read | not |
|---|---|---|
| space | `--space-glyph` `-tight` `-inline` `-control` `-stack` `-heading` `-block` `-band` `-gutter` `-inset` `-divide` | a pixel count |
| corners | `--radius-sharp` `-tight` `-control` `-surface` `-feature` `-pill` `-circle`; **buttons read `--btn-r`** | `--radius-feature`, even though it is also 24 |
| depth | `--elevation-menu` `-dialog` `-docked` | a hand-written `box-shadow` |
| borders drawn without layout | `--ring-selected` `-recommended` `-invalid` `-hairline` `-hover` `-halo` | an `inset 0 0 0 …` of your own |
| a pressed control | `--press-inset` + the variant's own alpha | the elevation levels |
| a wash over something | `--overlay-wash` `-hover` `-edge` `-shadow` `-scrim` `-scrim-sheet` | the `--ink-a*` ladder — see below |
| light on a dark ground | `--overlay-light-press` `-track` `-border`, `--on-ink-secondary` | `--on-ink-primary`, which no longer exists |
| layering | `--z-beneath` `-raise` `-sticky` `-chrome` `-popover` `-docked` `-overlay` `-sheet` `-toast` | a number between two of them |
| movement | `--motion-quick` `-settle` `-spin`, `--motion-ease` `-linear` `-drift` | a duration of your own |
| line thickness | `--border-hairline-half` `-hairline`, `--border-emphasis`, `--border-none` | `--ring-halo`'s 4px, which is a distance |
| type | the `--t-*` scale | `--t-body-sm-fs`, which has no reader |

### ⚠⚠ Four things a component must NOT read, and why

1. **`--ink-a1 … --ink-a6`.** A private ladder. Only the six `--overlay-*` roles and the three
   `--elevation-*` levels are allowed to name it. Reading `--ink-a2` directly in a component
   is how the stylesheet starts saying a hover and a menu shadow are the same thing: they
   share a darkness, they do not share a job.
2. **Anything `.sb-*` or `.statebar`.** That is the prototype's settings bar — a reviewing
   instrument, excluded from the design system by §4. Its nine whites, its `.24` shadow and
   its `880` layer are not product values. They leave when it leaves.
3. **`--fade-rows`.** It is a **mask**, not a colour: the alphas in it are opacity and the
   colour is there only because a mask gradient needs one.
4. **`--s-sechead`.** It describes nothing — overridden in 100% of its uses. See the class
   below.

### ⚠️ Two tokens that look equal and are not

`--btn-r` and `--radius-feature` are both 24px **and are deliberately separate.** The test is
in §2 and it is the test to reuse whenever you are tempted to merge two tokens with the same
value: *if the control radius moves, does the plan card move with it? No. If the plan card
moves, do the buttons? No.* **Two "no"s means two tokens, whatever the numbers say.**

## 2 · What is settled, that a component must not re-litigate

- **Three elevation levels, not five.** A hover lift needs two levels; the product has three
  for everything. **Hover is signalled by tint, not by rising** — `.blockmore-go` was the last
  component rising on hover and it stopped (§3). If your component wants to lift on hover,
  that is a request for a fourth level, not a component decision.
- **Shadows are `--ink`, except the press pair, which is black.** Measured: 1–3/255 at the
  three levels, **13/255 at press**. Press is a tight blur at high alpha and gets there; the
  levels do not.
- **Rings carry their width inside their value.** `--ring-selected` is
  `inset 0 0 0 var(--border-emphasis) var(--ink)`, so moving `--border-emphasis` moves the
  border and the ring together. Do not re-spell a width.
- **One ink, two forms of alert tone are now one.** Alert tone collapsed to `tinted`; there is
  no `ink` form and no `mark-*` vocabulary.
- **One gradient.** `.meshbg` is the only one, on all three surfaces that carry one, and its
  two colours are `--c-lav-200` and `--c-amber-50`.
- **Zero open design variants** (2026-10-07). Nothing in the product is waiting for a
  comparison to be decided. `Home › Layout` is kept-by-choice, not pending.
- **A component is ONE component in both Home layouts.** The table row and the card are two
  arrangements of the same thing — same tokens, states, content, actions, copy. They do not
  multiply; a difference between them is a defect, not a variant.

## 3 · What a component will hit that no scale answers

**These are the real ones. Each will come up, and none of them has a number waiting.**

1. **⚠⚠ A SECOND DARK SURFACE MAKES `surface` A FIFTH BUTTON AXIS.** The button's axes are
   variant, size, content, state and tone — **none of them is the ground it stands on.** On
   an ink banner a `primary` is ink-on-ink and vanishes, so today the banner declares its own
   ground (`.gbanner.on-ink`) and re-paints the component's surfaces inside itself. **That is
   one exception carrying its own palette.** The moment a second dark surface appears, the
   answer is a fifth axis on the component, **not a second copy of that block.** This is the
   single most likely thing to be got wrong in the button work.
2. **A seventh ring.** Two rings do not fit the six tokens and are left as literals:
   `#nlModal .nl-cardstack .am-addon.on` (a selected add-on at 1px accent — neither the 2px
   accent `recommended` nor the 2px ink `selected`) and `.plangrid .nl-select:hover` (1px line
   but **inset**, where `--ring-hover` is outset). If your component needs either shape, it is
   a seventh ring and that is a decision.
3. **Muted text on a dark ground.** `--on-ink-muted` is deliberately undeclared — every muted
   on-ink value in the file belongs to the excluded settings bar, so declaring it would create
   an orphan. The first product surface that needs it is the one that mints it.
4. **Icon buttons grew and nothing re-checked the dense rows.** copy `58 → 62`, kebab
   `42 → 46`, the gap between them `6 → 8`. **Count from 62 and 46, not from 58 and 42**, and
   expect every dense row — toolbars, the key row, instances, banner actions — to be tighter
   than its last recorded measurement.
5. **There is no layout tier between 601 and 952.** Four tables overflow in that band. It is
   **not a breakpoint problem** — the thresholds are right; what is missing is a layout the
   tables can take. A component to design, not a number to tune.
6. **Dark theme has exactly two values that cannot survive it as written.** `--ring-halo` is a
   ring made of the *surface* colour and the hole has to match whatever is behind it;
   `--scrollCue` is the one value the stylesheet names as needing a light variant. Everything
   else on the colour axis is a token.
7. **The phone boundary is written twice** — `--bp-phone` in CSS, and nine hardcoded
   `matchMedia('(max-width:600px)')` calls in six scripts. A component that asks "am I on the
   phone?" in JavaScript joins the second list, not the first.

## 4 · What is still open in this document, and why each was left

| open | why it was left |
|---|---|
| **`320` in `shared.js:2085`** (§5) | §5 decided it "becomes a token" but **not which one** — there is no band between `--z-sheet` (140) and `--z-toast` (400). Choosing is changing the document, not applying it. The measurement is there: on desktop the whole band above `--z-popover` is empty |
| **`.insttoolbar.stickybar` declares `z-index:12` on a `position:static` element** | It does nothing and creates no stacking context, so it either lost its `position:sticky` or never needed to exist. **A correctness question, and a scales pass is the worst place to change whether something sticks** |
| **`--s-sechead` and `.nl-select.on`** | The same fault twice: **overridden in 100% of carriers, mapped anyway.** Now a class, not two incidents — the dead-rule pass should grep for the *shape* (a declaration every carrier of which is also matched by a more specific one), not for these two names |
| **`.faq-cat` — seven rules, no markup, and not in `dead-report.json`** | A hole in the census, found by a pass about widths. `faq.js` ships and emits `faq-i`/`faq-qh`/`faq-q`/`faq-a`/`faq-h`, never `faq-cat` |
| **`DEAD.md` group 2 is unreliable where a class is written only under a non-default setting** | Eight `mark-*` rules were listed as "never written" while a live branch wrote them. The scenarios set the *variant* and never the *condition* that produces the markup |
| **`sweep.js` cannot see `.meshbg`** | Implementation rule 7, and correct — the pools drift and would make every run report false positives. **Consequence: any mesh change must be measured directly.** It reported a clean zero while twelve gradient stops had just been rewritten |
| **`sweep.js` keys elements by their class list** | Implementation rule 9. A pass that ADDS a class unpairs every element it touched: `paintDiff()` skips them as `unpaired`, so the run is loud and blind at the same time. `SWEEP.ignoreClasses([...])` before the first cell |
| **An opener that resolves without arriving** | Implementation rule 10. `OPENERS.usersModal` reported `0/0/0` on a surface it never opened, three times across two sessions. Every opener now ends in `must()`; `diff()`/`paintDiff()` carry `error` and `compared` so a dead cell cannot read as a pass |
| **A scan keyed on literal token values** | Implementation rule 11. It reported "no failures" after the pass moved the three values it was written against, and had stopped matching anything at all. Resolve targets from `:root` at run time — this is how `--faint`'s 507 failures stayed invisible |
| **The 601–952 table band** | See item 5 above |
| **`mockInvoiceUrl` is a second typography system** | A separate document with its own rules; it was never part of these axes |
| **`?from` is written and read by nothing** | Left in the URL deliberately — a link must work the same for whoever opens it |
| **The two collapsed z-index intents** | `.totop` is now level with `.bnav` (measured not to overlap, by 16px) and `.licmodal`/`.fsheet` are level with `.fs-screen` where they sat a deliberate half-step below. **Collapsed on purpose**; what expressed the intent is gone, so the next surface that opens over a licence modal must express it again |
| **The gradient's dither** | Relative colour moves 80 channels in 64,000 by ±1/255. Colour identical, dither not. Accepted — trading the no-second-spelling rule for a render artefact is the wrong trade |

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

**8 · ⚠️⚠️ THE GEOMETRY SWEEP IS BLIND TO ANY AXIS THAT DOES NOT MOVE LAYOUT, and on those
axes it is the SECONDARY check, never the proof.** A broken `var()` in a `border-radius`
renders square corners with **identical geometry** — same x, y, width, height, same scroll
height, same everything the sweep hashes. It would report a clean sweep and a wrong screen.

**Five axes behave this way: radius, elevation, overlays, motion and border width.** On each
of them the primary check is a **per-element comparison of the computed value** across
paired mirrors: walk every element, read the property that axis owns, diff the two maps.
Three numbers come out and all three matter — values that **changed**, elements that had the
property and no longer do (**lost**), and elements that **gained** it. The second is the one
a broken token produces, and it is invisible to everything else.

⚠️ **Radius is the worked example, and the comparison is what actually proved its stage 1**:
3,259 rounded elements across ten surfaces — 0 changed, 0 lost, 0 gained. The 175 identical
geometry cells proved only that nothing moved, which on this axis was never in question.
Whoever runs elevation, overlays, motion or border width writes the equivalent walk **before**
touching a value, and reports it first.

**9 · ⚠️⚠️ A PASS THAT ADDS A CLASS MUST CALL `SWEEP.ignoreClasses([...])` FIRST, OR THE
RUN IS MEANINGLESS.** `path()` keys every element as `tag.class1.class2.class3:index`, so
putting a second name on an element — `class="listrow lic-row"`, the shape every additive
component rename takes — makes the before key and the after key **different strings for the
same element**. `paintDiff()` then counts it `unpaired` and **skips** it; `diff()` reports
"element count changed" on the whole page.

**Two things go wrong at once, and the second is the dangerous one.** The run looks like a
catastrophe — and it is simultaneously blind, because the elements it refuses to compare are
exactly the ones the pass touched. A real regression there would be invisible in the same
run that cried wolf.

```js
SWEEP.ignoreClasses(['listrow', 'listbar']);   // before the first page() or paint()
```
It only ever **removes** names from the key, so it cannot invent a pairing: two elements that
differed only by an ignored class were the same element. The filter runs **before** the
three-class slice, so an ignored name cannot occupy a slot and push a real one out. The same
key is used by `overflowsIn()`, where without it `newOverflow()` reports a box that "never
overflowed before".
⚠️ Found the hard way on 2026-10-07, before the pass that added `.listrow` and `.listbar`.
The whole of pass 1 would otherwise have reported ~1,500 unpaired elements and nothing else.

**10 · ⚠️⚠️ EVERY OPENER ASSERTS THAT IT ARRIVED. A zero from a surface you did not open is
not a zero.** `OPENERS.usersModal` drove the profile menu and then resolved regardless of
what happened, so the walk ran on a page where the modal had never opened: every element it
was meant to measure was absent, and the cell reported a clean `0 changed / 0 lost /
0 gained`. **It did this three times across two sessions**, and each time a human caught it
by checking `tr.user-row` by hand — never the tool.

Three parts, all of them in `tools/sweep.js` since 2026-10-07:
- `must(d, sel, label)` throws if the selector is absent **or** present-and-`display:none`.
  Every opener ends in one. `page()` and `paint()` already turn a rejection into `{error}`.
- An opener that can ask a controller **asks it** — `UsersModal.open()` — and keeps the click
  path as a fallback, so a broken menu route still shows up instead of being routed around.
- `diff()` returns `errors[]` and `paintDiff()` returns `error` and `compared`. **A summary
  that sums changed/lost/gained without asserting `!error && compared > 0` can still read a
  failed cell as a pass**, because a cell with no rows has nothing to disagree about.

Verified both branches on a throwaway opener: an absent selector and a hidden surface each
become `{error}` with zero rows.

**11 · ⚠️⚠️ A SCAN READS ITS TARGETS FROM `:root` AT RUN TIME. A scan keyed on literal
values goes blind the moment a token moves and reports "no failures" — which is the most
dangerous output a checker can produce.**

The contrast walk that found the two failing pairs was keyed on the hexes it was written
against:

```js
var TARGET = { '#008846':'--status-ok', '#da1818':'--status-alert', '#6b6b6b':'--mid' };
```

The same pass then moved all three values. Re-run to confirm the fix, it matched **nothing**,
found **zero failing groups**, and printed a clean pass. Nothing errored, nothing was skipped,
no count looked wrong — the instrument had simply stopped being able to see its subject.

```js
var root = win.getComputedStyle(doc.documentElement);
NAMES.forEach(function (n) { TARGET[CT.hex(CT.parse(root.getPropertyValue(n)))] = n; });
```

Read that way, the same walk found what the hard-coded version never could: **`--faint`, a
fourth token, failing AA as text in 507 places** — worse than the three the pass had just
closed, and absent from the debt list because no scan had ever been pointed at it.

⚠️⚠️ **THIS IS THE THIRD INSTANCE OF ONE SHAPE IN TWO SESSIONS**, and the shape is what to
watch for rather than the three cases:

| | the instrument | what it reported | what was true |
|---|---|---|---|
| rule 10 | `OPENERS.usersModal` | `0 changed / 0 lost / 0 gained` | the modal never opened; `tr.user-row` was 0 in the DOM |
| rule 9 | `path()` keyed by class list | "element count changed", 1,500 `unpaired` | an added class; the real elements were never compared |
| rule 11 | a scan keyed on literal hexes | "no failing groups" | it could no longer match any of its three targets |

**All three fail by going QUIET, not by going wrong.** A tool that throws gets fixed in a
minute; a tool that returns a confident zero gets believed. So the question to ask of any
check here is not "did it pass" but **"could this instrument still have seen a failure if one
were there"** — and the cheap way to answer it is a control: break the thing on purpose and
watch the check fail.

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

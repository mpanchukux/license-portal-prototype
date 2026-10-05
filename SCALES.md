# Proposed scales — design-system session 2

A proposal, not a change. Nothing in the repository was modified to produce it, no token
was created and nothing was renamed.

## What the numbers here are counted from

**The current working tree**, re-derived for this document — not copied from `VALUES.md`.
That file was generated before the type passes, the modal fixes and this week's work, and
its spacing figures (70 values / 1459 occurrences) no longer match the file. The brief's
figures (63 / 1677) match neither. Where a count below differs from either, this one is
the one measured today.

| axis | distinct | occurrences |
|---|---:|---:|
| spacing | 78 | 1586 |
| border radius | 14 | 248 |
| box-shadow | 27 | 43 |
| overlay colours | 36 | 62 |
| z-index | 17 (+1 in JS) | 36 |
| duration | 10 | 29 |
| easing | 3 | 15 |
| border width | 6 | 325 |
| breakpoints | 9 thresholds | 23 blocks |

Font size is out of scope. The palette — brand, status, surfaces — is out of scope except
where a colour is pure black or white at an alpha, which is the Overlays section.

Excluded as dead-only, per `DEAD.md`: `1.1`, `inherit`, `rgba(255,255,255,.35)`, `.02em`,
`var(--ic-30)`.

## How steps are named

Every token below is named for **what it does**, never for what it is made of. There is no
second theme today — zero occurrences of `prefers-color-scheme`, `data-theme` or
`color-scheme` — and this proposal does not build one. The naming rule costs nothing now
and is the only part of this document that cannot be retrofitted cheaply later: a role
survives a theme, a recipe does not.

⚠️ **Spacing is the one axis where a pure role name per step would be a fiction**, and the
proposal says so rather than inventing one. A 12px gap is control padding in one place, a
grid gutter in another and a stack margin in a third; naming the step `--space-control`
would be false two times in three. The proposal is therefore **two layers**: a private step
ladder named by rank, and the role tokens components actually read, each pointing at a step.
Components never name a step directly. Every other axis is named by role at a single layer,
because on those axes the role and the step genuinely coincide.

---

# 1 · Spacing

78 distinct values, 1586 occurrences, 4% through tokens. The largest axis in the product and
the one with the least structure.

## The proposed ladder

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

Eleven steps. 2–4–8 doubles, then 4px increments to 24, then 8px increments. The breaks are
where the data breaks: everything from 1 to 24 is in constant use, everything above 24 is
occasional and clusters loosely.

## The role tokens components would read

Named for the job, each aliasing a step. This is the layer that appears in rules.

`--space-glyph` (2) · `--space-tight` (4) · `--space-inline` (8) · `--space-control` (12) ·
`--space-stack` (16) · `--space-heading` (20) · `--space-block` (24) · `--space-band` (32) ·
`--space-gutter` (40) · `--space-inset` (48) · `--space-divide` (64)

⚠️ The existing `--pageX`, `--pageY`, `--headX`, `--contentX`, `--cellx`, `--cardpad`,
`--s-grp`, `--s-card`, `--s-field`, `--s-sec`, `--s-own`, `--backGap` are already role
tokens of exactly this kind — 64 occurrences of the 1586 — and they would become aliases of
steps rather than independent numbers. **`--s-own` is a name collision** already recorded in
the debt (10px in one place, 16px in another); it cannot become one alias and has to be
split before anything else happens to it.

## Every value, mapped

| current | ×  | → step | move | |
|---|---:|---|---:|---|
| `0` | 445 | `0` | — | |
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
| `24px` | 25 | 24 | — | |
| `9px` | 23 | 8 | −1 | |
| `22px` | 22 | 24 | **+2** | |
| `5px` | 21 | 4 | −1 | |
| `7px` | 20 | 8 | +1 | |
| `3px` | 13 | 4 | +1 | |
| `13px` | 9 | 12 | −1 | |
| `40px` | 9 | 40 | — | |
| `32px` | 8 | 32 | — | |
| `1px` | 7 | 2 | +1 | |
| `34px` | 7 | 32 | **−2** | |
| `28px` | 7 | 32 | **+4** | ⚠️ visible |
| `30px` | 7 | 32 | **+2** | |
| `26px` | 7 | 24 | **−2** | |
| `11px` | 5 | 12 | +1 | |
| `44px` | 4 | 48 | **+4** | ⚠️ visible |
| `48px` | 4 | 48 | — | |
| `15px` | 4 | 16 | +1 | |
| `38px` | 3 | 40 | **+2** | |
| `23px` | 1 | 24 | +1 | |
| `56px` | 1 | 64 | **+8** | ⚠️ visible |
| `60px` | 1 | 64 | **+4** | ⚠️ visible |
| `64px` | 1 | 64 | — | |
| `37px` | 1 | — | — | off scale |
| `80px` | 1 | — | — | off scale |
| `110px` | 1 | — | — | off scale |

**506 of 1586 occurrences move. 13 of them move visibly.**

## The five near-duplicate groups, individually

The brief asks for these by name. Each is a cluster the ladder has to absorb or split.

**12 / 10 / 14 / 13 / 11 — 363 occurrences, the heaviest cluster in the product.**
Absorbed by two steps, not one: `12` keeps 10, 11, 13 (140 occurrences move by 1–2px);
`16` takes 14 (106 occurrences, +2). Splitting the group is what keeps the move invisible —
collapsing all 363 onto 12 would push 14px down by 2 and nothing would be gained, while
collapsing onto 14 would create a step the rest of the ladder does not want. **No visible
moves.**

**8 / 6 / 9 / 7 — 223 occurrences.** All onto `8`. 6 moves +2 (67), 9 moves −1 (23),
7 moves +1 (20). **No visible moves.** The largest single consolidation in the proposal and
the cheapest: 110 occurrences change by 2px or less and the step they land on is already
the most used value in the band.

**16 / 18 / 15 — 142 occurrences.** `16` keeps 15 (+1); `18` goes to **20**, not 16. That is
a judgement: 18 is 54 occurrences of "a bit more than a stack gap", and pushing it down to
16 would erase the distinction its authors were reaching for, while pushing it up to 20
keeps it. Either direction is 2px. **No visible moves.**

**22 / 20 / 24 / 23 — 74 occurrences.** `20` and `24` are both steps, so this group splits
rather than collapses: 22 → 24 (+2, 22 occurrences), 23 → 24 (+1). ⚠️ 22 is the licence
panel's head inset; moving it up by 2 moves a measurement another token is derived from —
`--contentX` is **86 = 22 (head inset) + 52 (`--backW`) + 12 (`--backGap`)**, verified in
`:root`. **That derivation has to move with it or it stops being a derivation** — this is the one group where the
arithmetic matters more than the pixels.

**4 / 5 / 3 — 74 occurrences.** All onto `4`. 5 moves −1 (21), 3 moves +1 (13).
**No visible moves.**

## The four visible moves, by component

These are decisions, not cleanup.

**`28px` → 32 (+4), 7 occurrences.** `.authbody` · `.fs-devinput.locked` ·
`.hc-cols .hcsect` · `.hcsect` · `.lic-row > td.cellact` (and the matching `thead th`) ·
`.licmodal .sheet` · `.planblock`.
⚠️ `.fs-devinput.locked` is **not free to move**: its 28px was set this week from a
measurement — the lock glyph sits at `left:9` and is 20px wide, so the inset has to clear
29px. Raising it to 32 is harmless; lowering it to 24 would put the value under the glyph.
If the decision goes the other way (28 → 24), this one component has to stay off the scale
and be said so.

**`44px` → 48 (+4), 4 occurrences.** `.dwrap,.licview,.sheet` (page gutter) · `.faqsect` ·
`.keygrid` (the licence panel's fact row gutter) · `tr.inst-row`.
⚠️ The page gutter is the widest-reaching single number in the product. +4 moves every
page's left and right edge.

**`56px` → 64 (+8), 1 occurrence.** `.planpicker .plangroups` margin-top — the gap above the
plan groups on the landing page and the first-run Home screen. The largest single move in
the proposal, on the product's main selling surface.

**`60px` → 64 (+4), 1 occurrence.** `.sg-main` padding — styleguide only, no product
surface affected.

## Three values that should not go on the scale

**`37px` ×1** — `#invoicesList .inv-amt` padding-right inside the 601–952 band. It is not a
chosen value: it is 48 − 11, where 11 is the deficit measured between the row's minimum and
its container. Putting it on a scale would mean the number stops tracking the thing it was
derived from. It belongs in a comment, which is where it is.

**`110px` ×1** — `tr.inv-row > td.mono` padding-right in the phone card. It reserves the
space the two action buttons occupy in the same grid area. Derived from a control's width,
not from a rhythm.

**`80px` ×1** — `.sg-wrap` padding. Styleguide page frame. It could go to 64 (−16) but
nothing else lives up there; one occurrence does not earn a step and forcing it down is a
16px change to make a table tidier.

## Negatives — 12 values, 28 occurrences

`-1` (3) · `-4` (5) · `-6` (3) · `-8` (2) · `-10` (3) · `-13` (1) · `-14` (3) · `-16` (2) ·
`-18` (2) · `-20` (1) · `-22` (3) · `-24` (2).

⚠️⚠️ **The proposal is that negatives do NOT get a mirrored scale.** Every one of them is a
pull-out: a margin that undoes a padding declared somewhere else so a child can reach an
edge its parent inset it from. A mirrored ladder would let a pull-out and the inset it
undoes drift apart by a step and still both be "on the scale" — which is exactly the bug
class this file has recorded twice (the `.head-rest` negative margins, the `.canvas .gridtbl`
inset).

Instead: **a negative is written as the negation of the token it undoes.** The pattern
already exists and is already the majority — `calc(-1 * var(--pageX))` ×12,
`calc(-1 * var(--headX))` ×2, `calc(-1 * var(--cellx))` ×1. The 28 literal negatives are
the ones that have not been converted yet.

⚠️ **This is the one place the proposal will find real work rather than renaming.** Each
literal negative has to be matched to the inset it cancels, and any that matches nothing is
a finding, not a mapping. `-13px` ×1 (`.nl-backrow .nl-back`) is already known to be of that
kind: it pulls back a button's own internal padding, not a container's inset.

## `calc()`, `env()` and `%`

**Left exactly as they are, and off the scale.**

`env(safe-area-inset-bottom)` (4 occurrences, three of them wrapped in `calc(12px + …)` or
`calc(22px + …)`) is a device measurement. It has no business on a design scale: its value
is whatever the hardware says. What the scale owns is the constant added to it, and those
constants (12, 22) map like any other value.

`calc(24px - 1px)` ×2 is a hairline correction — a value deliberately one pixel off a step
so a border does not double. It must not be rounded; rounding it recreates the defect.

`calc(var(--pinH, 96px) + 16px)`, `calc(var(--bnavH) + 12px)`, `calc(var(--sel-gutter) +
22px)`, `max(40px, calc(…))` — all compositions of a measured runtime value with a constant.
Same rule: the constant is on the scale, the composition is not.

`100%` ×2 and `auto` ×22 are not lengths.

> **37 literal lengths collapse to 11 steps plus zero; 3 stay off the scale; 506 of 1586
> occurrences move, 13 of them visibly.**

---

# 2 · Border radius

14 distinct values, 248 occurrences.

## The proposed scale

| token | value | what it is for |
|---|---:|---|
| `--radius-sharp` | `0` | a surface that meets another surface flush |
| `--radius-tight` | `4px` | the smallest rounding that reads as intentional — focus rings, small marks |
| `--radius-control` | `8px` | inputs, cells, inset fields |
| `--radius-surface` | `12px` | cards, menus, dialogs |

Plus two that are **not steps**:

`--radius-pill` (`999px`) and `--radius-circle` (`50%`).

⚠️ **Pill and circle are shapes, not sizes, and that is why they are tokens of their own.**
`999px` does not mean "very round" — it means "as round as this box can be", and its
rendered radius depends on the box's height, not on the scale. Putting them on a size ladder
would invite someone to "step down" a pill to 12px, which changes what the component is.
Same for `50%`.

⚠️ `var(--btn-r)` (24px, 12 occurrences) is **already a role token and already off the
ladder.** It is the control radius and it is deliberately larger than `--radius-surface` —
controls are rounder than the cards they sit on in this product. It stays as it is; it is
not a fifth step, because nothing else may use it.

## Mapping

| current | × | → | move | |
|---|---:|---|---:|---|
| `0` | 68 | sharp | — | |
| `10px` | 39 | surface (12) | **+2** | |
| `6px` | 37 | control (8) | **+2** | |
| `8px` | 32 | control | — | |
| `999px` | 22 | pill | — | |
| `50%` | 15 | circle | — | |
| `var(--btn-r)` | 12 | unchanged | — | |
| `4px` | 7 | tight | — | |
| `12px` | 5 | surface | — | |
| `7px` | 5 | control (8) | +1 | |
| `9px` | 2 | control (8) | −1 | |
| `14px` | 2 | surface (12) | **−2** | |
| `3px` | 1 | tight (4) | +1 | |
| `20px` | 1 | — | — | ⚠️ off scale |

**`20px` ×1 — `.plancard`.** It is the only value in the 16–20 band and the card it rounds is
the largest object on the selling surface. Moving it to 12 is **−8 and visible**; adding a
16 or 20 step widens the scale for one occurrence. Left off, and named: either the plan card
joins `--radius-surface` as a deliberate visible change, or the scale gains a step for one
component. **This is a decision, not a mapping.**

⚠️ `10px` → 12 moves 39 occurrences by 2px, and it is the single most common rounded
surface in the product (cards, menus, the grouped instances table). The alternative is
`10px` → 8, which merges it with the control radius and leaves a card as round as an input.

> **14 values collapse to 4 steps plus 2 shape tokens plus the existing control radius;
> 1 stays off the scale; 86 of 248 occurrences move, 0 of them visibly** (the one visible
> candidate is the unmapped `.plancard`).

---

# 3 · Elevation

27 distinct `box-shadow` values across 43 occurrences. Almost every shadow is unique, and
**three different things are wearing one property.**

## They are not one axis

| kind | occurrences | what it is |
|---|---:|---|
| drop shadows | 16 | an object lifted off the surface behind it |
| rings (`inset 0 0 0 Npx`) | 13 | a border drawn without taking layout space |
| press shadows (`inset 0 Npx Npx rgba`) | 2 | a control being pushed in |
| `none` | 11 | the absence of all three |

⚠️ **Only the first is elevation.** The rest are on the scale below only because `box-shadow`
is the property they happen to share.

## Proposed elevation levels

| token | value | what sits here |
|---|---|---|
| `--elevation-raised` | `0 3px 14px <ink/.16>` | a control floating over content it scrolls with |
| `--elevation-menu` | `0 8px 24px <ink/.12>` | a popover anchored to the control that opened it |
| `--elevation-dialog` | `0 16px 44px <ink/.18>` | a modal over a scrim |
| `--elevation-shell` | `0 24px 64px <ink/.28>` | the full-screen box |
| `--elevation-docked` | `0 -8px 28px <ink/.18>` | something anchored to the bottom edge, casting upward |

Five levels. The fifth is not a depth — it is a **direction**, and it needs its own token
because three components cast upward and inverting a downward shadow by hand is how two of
them ended up with different blurs for the same job.

## Mapping

| current | × | component | → | |
|---|---:|---|---|---|
| `0 3px 14px /.16` | 1 | `.totop` | raised | — |
| `0 4px 14px /.16` | 1 | `.licmodal .fs-close` | raised | −1 offset |
| `0 6px 20px /.08` | 1 | `.menu .pop` | menu | ⚠️ visible |
| `0 6px 20px /.10` | 1 | `.dropmenu` | menu | ⚠️ visible |
| `0 12px 32px /.16` | 1 | `.dprofmenu` | menu | ⚠️ visible |
| `0 14px 44px /.18` | 1 | `.modal` | dialog | — |
| `0 18px 48px /.20` | 1 | `.paymodal` | dialog | ⚠️ visible |
| `0 10px 30px /.28` | 1 | `.snack` | dialog | ⚠️ visible |
| `0 24px 64px /.28` | 1 | `.fs-box` | shell | — |
| `0 -6px 24px /.24` | 1 | `.statebar` | docked | ⚠️ visible |
| `0 -8px 40px /.18` | 1 | `.fsheet-panel` | docked | ⚠️ visible |
| `0 -8px 24px /.10` | 1 | `.fs-right.pinned` | docked | ⚠️ visible |
| `0 1px 2px /.04, 0 12px 40px /.08` | 1 | `.authbox` | dialog | ⚠️ visible, loses a layer |
| `0 2px 5px /.05, 0 12px 40px /.10, 0 0 0 4px --card` | 1 | `.blockmore-go` | menu + ring | ⚠️ see below |
| `0 2px 6px /.07, 0 16px 48px /.14, 0 0 0 4px --card, inset …` | 1 | `.blockmore-go:hover` | menu + ring | ⚠️ see below |

⚠️ **Eight of sixteen drop shadows move visibly.** That is the honest cost of collapsing an
axis where every value is unique: there is no majority to snap to. The biggest single change
is `.dprofmenu`, which is currently twice the blur and half again the alpha of the other two
menus and would become identical to them.

⚠️ **`.blockmore-go` is two shadows and a ring in one declaration**, and the ring
(`0 0 0 4px var(--card)`) is doing a different job: it is a halo that separates the button
from the faded table rows behind it. It cannot be expressed as an elevation level, and the
proposal is that it becomes `--elevation-menu` plus a separate `--ring-halo` token.

## Rings — a separate scale

13 occurrences, and they are borders. Proposed tokens, named for what they mark:

`--ring-selected` (`inset 0 0 0 2px <ink>`) — `.nl-select.on`, `.plangrid .nl-select.on`
`--ring-recommended` (`inset 0 0 0 2px <accent>`) — `.plancard.is-popular`
`--ring-invalid` (`inset 0 0 0 1px <status-alert>`) — `.field.err`, `.fs-devinput.numfield.is-bad`
`--ring-hairline` (`inset 0 0 0 .5px <line>`) — `.btn--menu`, `.blockmore-go`
`--ring-hover` (`0 0 0 1px <line>`) — `.lcard:hover`, `.fsep-dot` (outset, not inset)

⚠️ **`inset 0 0 0 1px` and `inset 0 0 0 2px` of the same colour are the same token at two
widths**, which means the ring scale has a width axis of its own: `.5px`, `1px`, `2px`.
That is the border-width scale, reused. The ring tokens should take their width from it
rather than carrying a second copy.

⚠️ **`.5px` is not on the border-width scale** (section 8) and is used here three times. It
is a sub-pixel hairline that renders differently per device pixel ratio. Either it joins the
width scale as a named hairline or those three rules take `1px`, which is **visible**.

## Press — 2 occurrences, left alone

`inset 0 3px 4px rgba(0,0,0,.55)` on `.btn--primary:active` and `…,.45` on the destructive
variant. Two values, two components, one job. They are a **state**, not a depth, and the
difference between .55 and .45 is compensating for a different button fill underneath.
Proposed as one token with the alpha staying per-variant, or left as-is. Not elevation.

## Where `--scrollCue` goes

**Not here.** It was added this week and it is not a shadow: it is a `linear-gradient` stop
used as an edge cue on `.tablescroll`. It is an **overlay** — ink at an alpha over a surface
— and it belongs in section 4, mapping to `--overlay-edge` at the .12–.16 level. It is in
this section only because the brief asked where it lands, and the answer is "one section
down".

> **27 shadow values collapse to 5 elevation levels, 5 ring tokens and 1 press pair;
> 8 occurrences move visibly.**

---

# 4 · Overlays

36 distinct black-or-white-at-alpha values, 62 occurrences. Nineteen alphas on black,
seventeen on white, no scale on either.

## First: they are three different things, not one

⚠️ Separating them is most of the work, and it removes about a third of the values before
any mapping happens.

**(a) Gradient ramps.** `.dblock.has-fade tbody tr.is-fading > td` alone contributes black at
`0`, `.04`, `.12`, `.28`, `.50`, `.78` — six of the nineteen. They are **stops in one
gradient**, not six overlay levels, and they have to stay in their relative proportions or
the fade stops being a fade. Proposed as a single named ramp (`--fade-rows`), off the alpha
scale entirely.

**(b) Text on ink.** `.sb-sublabel` (.62), `.sb-tab` (.66), `.sb-opt` (.82),
`.alert.tone-black .amsg-when` (.72), `.gbanner.on-ink .btn--ghost` (.72), `.hb-todo` (.78)
are **foreground colours**, not overlays. White at .82 on an ink surface is "primary text on
a dark ground"; it belongs to the type/colour system as `--on-ink-primary` /
`--on-ink-secondary` / `--on-ink-muted`, which is out of scope here but has to be named so
these six stop being counted as overlays.

**(c) Actual overlays** — a wash of ink or light laid over whatever is beneath. What is left.

## Proposed overlay tokens

| token | value | what it does |
|---|---|---|
| `--overlay-wash` | ink @ .04 | the faintest tint that is still visible |
| `--overlay-hover` | ink @ .08 | a pointer resting on something |
| `--overlay-edge` | ink @ .14 | an edge cue; the shade under a sticky element |
| `--overlay-shadow` | ink @ .18 | the alpha drop shadows are built from |
| `--overlay-scrim` | ink @ .50 | the dimming behind a modal |

And on the light side, for controls on an ink ground:

| token | value | what it does |
|---|---|---|
| `--overlay-light-hover` | white @ .12 | a pointer on a dark control |
| `--overlay-light-surface` | white @ .22 | a raised plate on a dark ground |
| `--overlay-light-border` | white @ .45 | a divider on a dark ground |

## Mapping — ink

`.04`(3) → wash · `.05`(1) → wash (+.01) · `.07`(1) → hover (+.01) · `.08`(2) → hover ·
`.10`(3) → hover (−.02) · `.12`(2) → edge (+.02) · `.14`(1) → edge · `.16`(3) → edge (−.02) ·
`.18`(2) → shadow · `.20`(1) → shadow (−.02) · `.22`(1) → shadow (+.04) ⚠️ ·
`.24`(1) → shadow (−.06) ⚠️ · `.28`(4) → shadow (+.10) ⚠️ · `.45`(1) → scrim (+.05) ⚠️ ·
`.50`(2) → scrim · `.55`(1) → scrim (−.05) ⚠️ · `.35`(1) → scrim (+.15) ⚠️

⚠️ **Six ink alphas move by a visible step.** `.28` is the heaviest (4 occurrences:
`.fs-box`, `.snack` and two fade stops — two of which leave for the ramp). `.35` is
`.fsheet-scrim`, the bottom-sheet dimmer: pushing it to .50 makes the phone's sheet
noticeably darker behind, which is a product decision about how much of the page you can
still see.

## Mapping — white

`.08`(1) → light-hover (+.04) ⚠️ · `.10`(1) → light-hover (+.02) · `.12`(1) → light-hover ·
`.14`(5) → light-hover (−.02) · `.16`(1) → light-surface (+.06) ⚠️ · `.22`(1) → light-surface ·
`.32`(1) → light-surface (−.10) ⚠️ or light-border (+.13) ⚠️ · `.35`(1) → light-border (+.10) ⚠️ ·
`.45`(1) → light-border · `.5`(1) → light-border (−.05) ⚠️ · `.55`(1) → light-border (−.10) ⚠️ ·
`.6`(1) → text, see (b) · `.62`,`.66`,`.72`,`.78`,`.82` → text, see (b)

⚠️⚠️ **Fourteen of the seventeen white alphas belong to ONE component family — the settings
bar (`.sb-*`).** It is a reviewing instrument, not product chrome, and it invented its own
nine-level ladder of white because nothing existed to reach for. The honest proposal is that
the bar adopts the three light overlay tokens and **loses the distinctions it cannot
justify** — or that it is explicitly excluded from the system as a tool, which is what it
is. Either answer is defensible; mapping it value by value is not, because nobody designed
those nine levels as nine levels.

> **36 values collapse to 8 overlay tokens, 1 gradient ramp and 3 text-on-ink roles;
> 12 occurrences move visibly.**

---

# 5 · z-index

17 values in CSS, 36 occurrences, plus `'320'` written as a string in `shared.js:2038`.

## Proposed layers

| token | value | what sits here |
|---|---:|---|
| `--z-beneath` | `-1` | a layer painted behind its own parent: the mesh, the table-head underlay |
| `--z-raise` | `1` | something lifted within its own component: a badge, a feed mark |
| `--z-sticky` | `10` | a bar or head that sticks to the page while content scrolls |
| `--z-chrome` | `20` | the top bar and tooltips — above the page, below anything that opens |
| `--z-popover` | `40` | a menu anchored to a control |
| `--z-docked` | `90` | the phone's bottom bar, the back-to-top button |
| `--z-overlay` | `100` | a modal, its scrim, and the full-screen wizard |
| `--z-popover-over-overlay` | `140` | a menu opened from inside a modal |
| `--z-toast` | `400` | a snackbar — above everything the product can open |
| `--z-instrument` | `880` | the settings bar; not product chrome |

## Mapping

`-1`(3) → beneath · `1`(3) → raise · `5`(3) → sticky (−5) · `11`(2) → sticky (−1) ·
`12`(3) → sticky (−2) · `20`(5) → chrome · `40`(2) → popover · `60`(1) → popover (−20) ·
`88`(1) → docked (+2) · `90`(1) → docked · `95`(2) → overlay (+5) · `100`(3) → overlay ·
`120`(1) → popover-over-overlay (+20) · `130`(1) → ⚠️ ambiguous · `140`(2) →
popover-over-overlay · `400`(2) → toast · `880`(1) → instrument

**No z-index move is visible unless it changes a stacking order**, and none of the above
does — each group is already contiguous and nothing crosses a neighbour.

## The ambiguous ones, named

⚠️ **`130` — `.fs-right.pinned`.** The wizard's summary card when it pins itself. It sits
above the overlay (100) but below the menus that open over it (140). It is the only
occupant of its band and it is not clear whether it is "a part of the modal that floats" or
"a thing above the modal". **Needs a decision before it gets a name.**

⚠️⚠️ **`.dprofmenu` is declared at `60` at the top level and `120` inside the ≤600 block.**
Not a collision — a deliberate phone override — but it means the profile menu is a popover
on desktop and a near-overlay on the phone, and the two numbers were picked independently.
Under the proposal it would be `--z-popover` at both widths unless the phone genuinely needs
to clear something; nobody has written down what.

⚠️⚠️ **`'320'` in `shared.js:2038` is the real finding.** `positionPop()` sets it inline on
any popover it re-anchors to the viewport, so a menu that has been repositioned by script
jumps from 40 (or 140) to 320 — above every modal, below the snackbar. **It is a layer the
stylesheet does not know exists**, and it is written as a string in one line of JS. It has
to become a token the CSS also declares, or the two systems will keep disagreeing about
what is on top.

> **17 values plus 1 in JS collapse to 10 layers; 1 is left unnamed pending a decision;
> 0 occurrences move visibly.**

---

# 6 · Motion

## Durations

10 values, 29 occurrences — but they are two unrelated populations.

**Transitions: `.12s`(9) · `.15s`(4) · `.16s`(2) · `.18s`(6) · `.7s`(2).**

| token | value | what it is for |
|---|---:|---|
| `--motion-quick` | `.12s` | a state change the pointer caused: hover, press, a chevron turning |
| `--motion-settle` | `.18s` | something arriving or leaving: a bar docking, a header fading |

`.15s`(4) → quick (−.03) · `.16s`(2) → settle (+.02). Neither is perceptible.

⚠️ **`.7s` ×2 is off the scale.** `.btn-spin` and `.nl-spin` are **loop periods**, not
transition durations — the number says how fast a spinner rotates, and there is no state
being transitioned. One token, `--motion-spin`, named for the loop.

**Ambient: `31s` · `34s`(2) · `37s` · `39s` · `48s`.** The landing mesh drift and the
crossfade. ⚠️ **These are deliberately not round and deliberately not equal** — four blobs
drifting on four prime-ish periods is what stops the background from visibly looping. Putting
them on a scale would synchronise them and reintroduce the loop. **Off the scale, and the
reason belongs in a comment next to them.**

## Easings

Three values, 15 occurrences. **All three survive**, for three different jobs:

`ease` (11) — every transition. The one easing the scale owns: `--motion-ease`.
`linear` (2) — the two spinners. ⚠️ A rotation must be linear or it visibly stutters once
per revolution; this is not a style choice.
`ease-in-out` (2) — the mesh drift and the crossfade. A drift that starts and stops abruptly
reads as a jump.

> **5 transition durations collapse to 2 steps, 1 loop token and 5 ambient values left off;
> 3 easings survive as 3 named roles; 0 occurrences move visibly.**

---

# 7 · Border width

6 values, 325 occurrences, 0% through tokens — and dominated by two.

| token | value | what it is for |
|---|---:|---|
| `--border-none` | `0` | 126 occurrences |
| `--border-hairline` | `1px` | 168 occurrences — every divider, frame and field edge |
| `--border-emphasis` | `2px` | 26 occurrences — focus rings, selected states |

Mapping: `1.5px`(1) → hairline (−.5) or emphasis (+.5); `3px`(2) → emphasis (−1);
`5px`(2) → **off the scale**.

⚠️ **`5px` ×2 is not a border.** `.tip.show::before` and its hover twin are the tooltip's
**arrow**, built out of border triangles. The number is the arrow's size. It must not join a
width scale.

⚠️ `1.5px` ×1 is `.nl-smark`, the stepper's numbered circle. Half a pixel either way is
below the visible threshold but it is the only fractional width in the product, and it exists
because a 1px ring looked thin against a 28px circle and 2px looked heavy. **A judgement, not
a rounding** — worth asking whether the step circle keeps it.

⚠️ `3px` ×2 (`.faq-cat`, `.sg-flag`) are left-edge accent bars, not borders in the structural
sense. They map to emphasis at −1px without harm, but they are the same category error as
the tooltip arrow, one size down.

> **6 values collapse to 3 steps; 1 stays off the scale; 5 of 325 occurrences move,
> 0 of them visibly.**

---

# 8 · Breakpoints

9 thresholds across 23 media blocks.

| threshold | blocks | what is in them |
|---:|---:|---|
| `600` / `601` | 551 + 27 | the phone layout. The product's one real boundary |
| `900` | 12 | tablet-ish: the wizard grid stacks, the plan table widens, the billing card stacks |
| `1080` | 2 | the plan grid drops to 3 columns; the popular card loses its pull-out |
| `1199` | 3 | the top bar's own padding and nav gap |
| `820` | 4 | ⚠️ dead — see below |
| `760` | 3 | the plan grid drops to 1 column; the wizard's card host unconstrains |
| `640` | 1 | `.field2` goes single-column; `.paycard` and `.cardhelp` stack |
| `952` | 1 | the invoices Amount band — derived, see below |

## Proposed set

**`600`/`601` · `900` · `1200`.** Three thresholds, one of them a pair.

- `--bp-phone` : 600 (and its `min-width:601px` partner)
- `--bp-tablet` : 900
- `--bp-wide` : 1200

## What moves

**`1199` → 1200 (3 blocks).** `.dtopbar-inner` padding, `.tnav` gap, `.tnav-item` padding.
A 1px shift of a boundary; nothing inside changes. Free.

**`1080` → 1200 (2 blocks).** ⚠️ The plan grid would drop to three columns 120px earlier,
and `.plancard.is-popular` would lose its vertical pull-out 120px earlier. **Both are on the
selling surface**, and the 1080 was chosen against the card widths. Moving it is a decision;
the alternative is keeping 1080 and admitting a fourth threshold.

**`760` → 900 (3 blocks).** ⚠️ The plan grid would go to a single column 140px earlier — on a
tablet, five plans would stack where they currently sit three-across. **This is the most
consequential move in the section** and it is the one I would not make: 760 exists because
three cards stop fitting there, which is a content measurement, not a device one.

**`640` → 600 (1 block).** `.field2` would hold two columns down to 601 instead of 641.
Measured at 601 the pair is ~276px each, which still holds a label and an input. Probably
free; worth a look before deciding.

**`820` → delete (4 blocks).** ⚠️⚠️ **This threshold does nothing at all**, and the two
halves of that are worth separating because my first reading got it wrong.
Three of its four rules — `.sidebar`, `.brand`, `.nav` — are the displaced shell `DEAD.md`
lists: **grepped, no markup anywhere** in any `.html` or `.js`.
The fourth, `.app`, **is live** (`#appView`, built in `license-details.js`) — but the rule
sets `grid-template-columns:1fr`, which is **exactly what `.app` already declares at
`styles.css:370`**. It is a no-op restating the base rule.
So: three dead rules and one that changes nothing. Not a breakpoint to map — a block to
remove, and the only one in this document that costs nothing to decide.

**`952` — off the scale.** The invoices Amount band. The number is derived from a
measurement (the row's 905px minimum against a `width − 48` container, so 953 is the first
width that fits) and it tracks the table's content, not the device. If the table's columns
change, the number has to change with them. A named breakpoint would freeze it.

⚠️ **`900` is kept rather than moved** because twelve blocks use it and they are genuinely a
middle tier: the wizard's two-column grid, the licence panel's plan table, the billing card.
It is the only secondary threshold that has earned its place.

> **9 thresholds collapse to 3 (one of them a pair); 1 is deleted as inert, 1 stays off the
> scale as derived; 13 of 23 blocks would move, and 5 of those move something visible.**

---

# Found while reading — not acted on

Four things noticed while counting, none of them touched.

**1 · `.dprofmenu` carries two unrelated shadow and z-index pairs.** Base rule: `z-index:60`,
`0 12px 32px /.16`. Phone block: `z-index:120`, and it joins
`.dprofmenu,#headKebabPop,.permenu` with `0 -12px 40px /.22` — an upward shadow, because on
the phone it is a bottom sheet. So one selector is two components depending on width, and
neither the depth nor the layer was chosen with the other in mind.

**2 · `--s-own` is still a live name collision** — 10px inside `#nlStepPick`, 16px inside
`.setgrid`. It is in the debt list already. It cannot become a scale alias until it is split,
and it is the only token on the spacing axis in that state.

**3 · The `0 0 0 4px var(--card)` halo on `.blockmore-go` is a ring made of the surface
colour**, not a shadow — it exists to punch a hole in the faded rows behind the button. It is
the only ring in the product whose colour is a surface rather than a line, and it will not
survive a dark theme without being re-thought, because the hole has to match whatever is
behind it.

**4 · `tools/check-collisions.py` would fail on several of these proposals.** Any axis whose
tokens are declared as a second `:root` block adds a repeated top-level name to its ratchet.
Whoever implements this should expect to merge declarations into the existing `:root`, not
add a new one — the same trap this week's edge cue hit on `.tablescroll`.

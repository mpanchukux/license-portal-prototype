# Contrast — decided and applied, 2026-10-07

**This file was a proposal for one turn and is now the record.** The four questions at the
bottom were answered, applied and re-measured; the numbers that led to each decision are kept
above, unchanged, because the reasoning is the useful part.

| decided | applied |
|---|---|
| `--c-green-600` **`#008243`** — with headroom, not the bare minimum | §1 of the ladder; `Active` on the panel tint **4.239 → 4.573** |
| `--c-red-600` **`#D91818`** — one unit of red | the alert lead ×3 hosts and `Delete account` **4.479 → 4.513** |
| `--mid` **not moved.** A ground-owned role on the lead instead | `#landingLead` / `#ecLead` **4.046 → 4.561** at 1280 |
| `tone-black` gets **a third outline** — `ti-clock` | three tones, three contours, measured at 20px |

**See "After" at the end of this file for the re-measurement.**

---

**The proposal as it stood.** It states every failing pair as a measurement, names which token
value each one implicates, and gives **the smallest change that clears** — not a nicer value.

**Thresholds used** (WCAG 2.1 AA): **4.5:1** body text · **3:1** large text (≥24px, or
≥18.66px bold) and non-text UI components (1.4.11).

## How these were measured, because three recorded numbers did not survive it

- **Every coloured mark in the product, not a list of suspects.** A walk over 11 pages at
  1280 collected **466** elements painted `--status-ok`, `--status-alert` or `--mid`, each
  with the first **opaque** ancestor background and the real computed size and weight.
- **The gradient was rasterised, not reasoned about.** Text over `.meshbg` has no opaque
  ancestor, so the ancestor walk returns `--page-bg` and **misses the failure entirely**.
  The mesh was rendered through `foreignObject` → canvas and the **worst pixel under each
  text box** was read, at **12 steps across the full 39s animation**, at three widths.
  ⚠️ The method was validated first: a known solid and a known radial-gradient reproduce
  byte-exact (`#F4F7FB` → `#f4f7fb`, `#C5C8F7` → `#c5c8f7`).
- **Alert banners were driven to each real state** through the settings bar, on both hosts.

⚠️⚠️ **Four recorded facts were wrong, and the corrections change the work.**

| recorded | measured |
|---|---|
| green status is **14px** | **16px / 400** — threshold is 4.5 either way, but the "raise the size" escape does not exist at 14 |
| panel lead fails at **4.48** | it fails on the licence **PAGE**; inside the modal `.licmodal .alert.tone-red` takes `--surface-notice` (white) and reads **5.091 — passes**. The note measured one of two hosts |
| **four** `--mid` lines fail over the mesh (3.56 / 3.75 / 3.97) | **one line** fails, at **4.046**. Those numbers were taken against the *old* gradient; variant 3 shipped since. `Need TBMQ instead?` now sits on a white button at **5.329** |
| red mark on ink, **3.35** | **does not exist any more.** No `--status-alert` on `#1c1c1c` anywhere: the Home banner is white-grounded in all tones and the panel's `tone-black` paints everything `#fff` (17.042) |

---

# 1 · The failing pairs

**Two pairs fail. Both are text. Nothing in the product fails 1.4.11.**

| # | what | fg | bg | measured | threshold | short by | hosts |
|---|---|---|---|---:|---:|---:|---:|
| **1** | `Active` in the licence panel header, 16px/400 | `#008846` | `#F4F7FB` | **4.239** | 4.5 | **0.261** | 1 |
| **2** | alert lead on the licence **page**, 16px/600 | `#DA1818` | `#FCEDED` | **4.479** | 4.5 | **0.021** | 3 |
| **2** | `Delete account` button label, 16px/400 | `#DA1818` | `#FCEDED` | **4.479** | 4.5 | **0.021** | 1 |
| **3** | `#landingLead` / `#ecLead` over the gradient, 16px/400 | `#6b6b6b` | `#dedff2` worst pixel | **4.046** | 4.5 | **0.454** | 2 |

⚠️ **`Delete account` is a fourth host of pair 2 and was in no note.** It is a destructive
button's own label on its own `--surface-danger` fill — arguably the most consequential of
the four places this pair appears.

**The same pairs where they pass, for the headroom:**

| fg on bg | ratio | n |
|---|---:|---:|
| `--status-ok` on `#ffffff` | 4.555 | 44 |
| `--status-alert` on `#ffffff` | 5.091 | 31 |
| `--status-alert` on `#F4F7FB` | 4.738 | 4 |
| `--mid` on `#ffffff` | 5.329 | 293 |
| `--mid` on `#F4F7FB` | 4.960 | 16 |
| `--mid` on `#F4F5F6` | 4.882 | 27 |
| white on `--status-alert` (destructive primary) | 5.091 | — |

---

# 2 · The three token values, and the minimum change to each

## `--c-green-600` — `#008846` → **`#008346`**

Read by `--status-ok`, read by **one declaration**: `.statmark.is-ok{color:…}`.
**It is never a background.** Blast radius is the status word and its glyph, nothing else.

| | |
|---|---|
| relative luminance now | **0.18051** |
| maximum allowed to clear 4.5 on `#F4F7FB` | **0.16715** |
| minimum change (nearest hex, RGB distance 25) | **`#008346`** — green channel only, **−5** → **4.508** |
| hue-preserving alternative | `#008344` → 4.514 |
| effect on the 44 marks on white | 4.555 → **4.844** |

⚠️ **One number worth deciding with eyes open:** green on `--surface-quiet` `#F4F5F6` is
**4.173** today and **4.438** after the minimum change — still short. **No status mark sits
on that ground today** (measured: zero of 466), so it is latent, not live. To be safe against
it the value is **`#008243`** (4.501 on `#F4F5F6`, 4.573 on `#F4F7FB`, 4.913 on white).

## `--c-red-600` — `#DA1818` → **`#D91818`**

Read by `--status-alert` → **19 declarations**, three of which use it as a **background**
with white text (`.btn--destructive.btn--primary`, `.fi-mark.is-alert`, `--ring-invalid`).
**Darkening is safe in both directions**: white-on-red goes 5.091 → **5.129**.

| | |
|---|---|
| relative luminance now | **0.15625** |
| maximum allowed to clear 4.5 on `#FCEDED` | **0.15528** |
| minimum change | **`#D91818`** — red channel **−1** → **4.513** |
| effect on white | 5.091 → 5.129 · on `#F4F7FB` 4.738 → 4.774 |

**One unit of red closes both hosts of pair 2.** It is the smallest change in this document
and it is the one that fixes a destructive button's label.

## `--mid` — `#6b6b6b` → **`#636363`**

Read by **138 declarations**, foreground only, never a background.

| grey | ratio on `#dedff2` | |
|---|---:|---|
| `#6b6b6b` (now) | 4.046 | ✗ |
| `#676767` | 4.294 | ✗ |
| `#656565` | 4.425 | ✗ |
| `#646464` | 4.493 | ✗ — **misses by 0.007** |
| **`#636363`** | **4.561** | ✓ |

| | |
|---|---|
| maximum allowed luminance | **0.12715** |
| minimum change | **`#636363`** — eight steps darker |
| effect elsewhere | white 5.329 → **6.008** · `#F4F5F6` 4.882 → **5.504** |

⚠️⚠️ **This is the one with a real cost, and the blast radius is the argument against it.**
The failure is **two sentences**; the token paints **293 text elements on white alone**.
Darkening it to clear a gradient that reaches two leads is the largest visible change in
this document.

**Two smaller-scope alternatives, stated because the scope is the decision:**
- **Give the two leads a darker role on the mesh only** — `#landingLead` and `#ecLead` are
  one shared class (`.lp-lead`). `--ink` there reads 11.0+ on the worst pixel. **Changes
  two sentences, nothing else.**
- **Lighten the gradient under them.** The worst pixel is `#dedff2`; `--mid` clears 4.5 from
  `#e4e5f4` upward. This re-opens a surface whose variant comparison closed yesterday.

---

# 3 · The type-and-colour pair, stated as both

**The alert lead on the licence page: `#DA1818` on `#FCEDED`, 16px / 600 → 4.479.**
It is **normal text**: 16px is below the 18.66px large-text floor, and 600 is below bold.

| move | what happens |
|---|---|
| **the colour moves** | `--c-red-600` → `#D91818`. Threshold stays **4.5**; ratio **4.479 → 4.513**. Clears by 0.013. Fixes all four hosts of pair 2, including `Delete account`, and touches no geometry |
| **the size and weight move** | lead → **≥19px / 700**. It becomes large text, threshold drops to **3:1**, and the unchanged 4.479 clears by **1.479**. Fixes the three banner hosts; **does not fix `Delete account`**, which is a 16px/400 button label |
| **weight alone** | 16px / 700 is **still not large text** — 16 < 18.66. Ratio unchanged at 4.479. **This does not clear, and it is the obvious move that does not work** |

⚠️ **The two are not interchangeable in scope.** Colour closes four places with a one-unit
edit. Type closes three of them, leaves the fourth, and changes the banner's headline size
on four surfaces — a visible typographic change that no decision describes.

---

# 4 · The entry where the system contradicts its own rule

**Both passes contrast. This is not an AA failure — it is the rule failing against itself.**

**Side one — the constant, as the system states it about itself** (`NOTES.md`, hard
constants; the same text is on the styleguide's Tokens page):

> ⚠️ **КОЛІР НІКОЛИ НЕ ЄДИНИЙ НОСІЙ**, і саме це тримає доступність. Кожна пофарбована
> марка йде з двома іншими сигналами: **інша ФОРМА** гліфа (галочка, хрестик, знак
> оклику — три різні контури, а не один у трьох відтінках) і, де є місце, **слово**.

**Side two — `components.js:3399–3407`, the decision of 2026-09-30:**

> ⚠️⚠️ THE MARK FOLLOWS THE TONE, NOT A SEPARATE FLAG (2026-09-30, by request). […]
> **Triangle on red and on black, circle on quiet**: the shape now says "something is wrong
> or will be" versus "this is just news", which is what the three tones say.

```js
function bannerIcon(tone){
  return icon(tone === 'quiet' ? 'alert-circle' : 'alert-triangle', { cls:'gb-ic' });
}
```

**Measured on the Home banner, all seven conditions, ground `#ffffff` in every one:**

| tone | glyph | lead colour | ratio |
|---|---|---|---:|
| `tone-red` (blocked · payment failed · no card · updates ended) | `ti-alert-triangle` | `#da1818` | 5.091 |
| `tone-black` (updates ≤14d · ≤30d) | **`ti-alert-triangle`** | `#1c1c1c` | 17.042 |
| `tone-quiet` (grant ready) | `ti-alert-circle` | `#1c1c1c` | 17.042 |

**Two of the three tones share one glyph and are told apart by hue alone.** The rule asks for
three contours; the product draws two. The word still differs, so one of the two backup
signals survives and the other does not — **"не один у трьох відтінках" is exactly what this
is**, at two tones instead of three.

⚠️ **The rest of the family obeys the rule.** `STATUS_IC = { ok:'circle-check',
off:'circle-x', alert:'alert-triangle-filled' }` — three distinct contours, and the status
mark always carries its word.

**Three ways out, and this is a decision, not a fix:**
1. **A third contour for `tone-black`** — a clock or a calendar for a deadline, which is what
   that tone means. Honours the rule; needs one Tabler icon added to the sprite.
2. **Keep two contours and amend the constant** to say what it actually guarantees: a
   differently shaped glyph *per kind of thing*, plus the word in every case.
3. **Leave it and record it as a known exception**, which is what it is today except that
   nothing records it.

---

# What this proposal does not answer

- **Which of the two green values** (`#008346` minimum, `#008243` with headroom against
  `--surface-quiet`).
- **The scope for `--mid`**: the token, the two leads, or the gradient.
- **Colour or type** for the alert lead, knowing colour also fixes `Delete account`.
- **The glyph question** in §4.

**After the numbers are chosen: apply, then re-measure the rows** — the 466-mark walk and
the 12-step raster, paired mirrors, with the contrast of every affected pair restated.


---

# After — applied and re-measured

## The three pairs, closed

| what | before | after | threshold |
|---|---:|---:|---:|
| `Active`, licence panel header, 16/400 on `#F4F7FB` | 4.239 | **4.573** | 4.5 |
| alert lead ×3 hosts, 16/600 on `#FCEDED` | 4.479 | **4.513** | 4.5 |
| `Delete account`, 16/400 on `#FCEDED` | 4.479 | **4.513** | 4.5 |
| `#landingLead` / `#ecLead` over the gradient, worst pixel @1280 | 4.046 | **4.561** | 4.5 |
| the same, @952 | 4.078 | **4.597** | 4.5 |
| the same, @1280 first-run Home | 4.046 | **4.561** | 4.5 |

**A full re-walk of every coloured mark — 13 pages, 1,114 marks — reports zero failing groups
among the three decided tokens.** The thinnest surviving margins are the two that were just
fixed: `--status-alert` on `#FCEDED` at 4.513 and `--status-ok` on `#F4F7FB` at 4.573.

## `--mid` was not moved, and that is the decision

The failure was the **ground**, not the value: `--mid` clears 4.5 on every flat surface in the
product (5.329 white, 4.960 `--page-bg`, 4.882 `--surface-quiet`) and fails only against the
ambient gradient. Darkening it would have repainted **293 text elements on white** to fix two
sentences.

**So the gradient redeclares a role, exactly as `.on-tint` redeclares the button's ground:**

```css
:root            { --text-quiet: var(--mid) }          /* 4.96 on page-bg */
body[data-mesh]  { --text-quiet: var(--mid-strong) }   /* the one ground --mid cannot clear */
.dwelcome p      { color: var(--text-quiet) }
```

⚠️ **This is the ground rule already in the file, applied to the mesh instead of to a button.**
A ground owns what the ground makes unreadable. Not a new exception.

**`--mid-strong` is `#636363` — the lightest value that clears, not a comfortable one.**
`#646464` measures **4.493** and fails; `#636363` measures **4.561**. The existing
`--c-grey-600` (`#525252`) would have cleared at 5.932 and was rejected for being darker than
it needs to be.

**The lead still reads lighter than the heading above it:** 2.837:1 against `--ink`, against
3.198 before. `--ink` would have made that **1:1** and taken the hierarchy with it.

⚠️ **`.pg-d` still reads `--mid` and still passes** — 4.564 and 4.598 at 1280, 4.761 at 952.
Thin, and left alone: it was not a failure, and the same role would cover it the day anyone
decides those margins are too thin.

## The third outline — measured, and the expectation was wrong

| | glyph | narrowest gap @20px | ink units | sub-2px gaps |
|---|---|---:|---:|---:|
| **clock** | `ti-clock` | **1.63px** | **91** | **20** |
| calendar | `ti-calendar` | 0.75px | 121 | 34 |
| calendar-month | `ti-calendar-month` | 0.75px | 137 | 61 |

**The clock is the only candidate whose narrowest feature gap stays above one device pixel at
the size the banner actually draws it.** It also carries the least ink and has the fewest
near-pixel gaps.

⚠️⚠️ **THE EXPECTATION GOING IN WAS THAT THE CALENDAR GRID WOULD MUDDY AT 20px. IT DOES NOT,
and that is recorded rather than quietly dropped.** No narrow gap in either calendar merges
above threshold, every enclosed hole survives at 20px, and the calendar's RMS against an 8×
downsampled reference is **marginally better** than the clock's (0.0398 against 0.0445). The
clock wins on density and on already meaning this condition — **not on the calendar
collapsing.**

**Why a clock is the meaning and not an illustration of it:** `tone-black` is a deadline, and
`ACT_IC['license.updates_expiring']` has drawn a clock in the activity feed all along. The
sprite's two other clock readers are both "pending". Reusing it makes two surfaces agree.
**Zero sprite additions — `ti-clock` was already in the closed set.**

**Measured on screen, all seven banner conditions:**

| tone | glyph | mark | ratio |
|---|---|---|---:|
| `tone-red` ×4 conditions | `ti-alert-triangle` | `#d91818` | 5.129 |
| `tone-black` ×2 | **`ti-clock`** | `#1c1c1c` | 17.042 |
| `tone-quiet` ×1 | `ti-alert-circle` | `#1c1c1c` | 17.042 |

⚠️ **Stated accurately: this was never an accessibility failure.** Both tones passed contrast
and the banner's wording always differs, so a reader who cannot separate the hues still had
the sentence. It was the system not keeping its own promise — "a different outline per kind,
not one outline in three tints" — and the third outline is what made that promise true.

## The run

| | |
|---|---|
| computed values, 13 portal pages × 2 widths | **36,281 elements: 2,352 changed, 0 lost, 1 gained\*, 0 errors** |
| computed values, 2 public pages × 2 widths | **1,440 elements: 78 changed, 0 lost, 0 gained** |
| distinct transitions | **12, and every one is one of the three token moves** |
| `check-css` | `ok:true`, 2185/2185, 0 dropped, identical both sides |
| 15 pages · `check-icons` · collisions | no errors · 3/3 clean · 23/24, `:root` 4/4 |

⚠️ **The one "gained" and the unpaired cells, named with their mechanism.**
- The gained `background-color` is the bottom-nav active pill, captured **mid-transition**:
  `.bn-ic` carries `transition: background 0.12s`, and the walk samples it in flight. Caught
  on the **`pre`** mirror in a repeat run (`rgba(228,228,224,0.467)`) while `site` read
  `rgba(0,0,0,0)` — it lands on either side at random. This also explains the same artifact in
  the previous pass's report, which was recorded there only as "does not reproduce".
- `invoices.html@390` reports 112 unpaired **in both directions**: `.tablescroll` gains
  `.is-scrollable` nondeterministically, which changes an ancestor's class list and so
  re-keys every descendant. Reproduced on the `pre` mirror. Same family as the
  `invoices@768` overflow flake.
- `styleguide.html` reports 30 unpaired / 11 re-keyed: **the paragraph this pass added** to the
  Tokens section, and the eleven siblings whose index it shifted.

## ⚠️⚠️ Found by widening the scan, NOT fixed: `--faint` is a fourth token and it fails worse

The earlier walk looked at three tokens because the debt named three. Reading the token values
off `:root` instead and widening the set found this:

| fg | bg | ratio | threshold | n |
|---|---|---:|---:|---:|
| `--faint` `#9a9a9a` | `#ffffff` | **2.814** | 4.5 | **415 text** + 123 glyphs |
| `--faint` `#9a9a9a` | `#F4F7FB` | **2.619** | 4.5 | **92 text** + 2 glyphs |

**507 text elements and 125 glyphs, and the glyphs fail the 3:1 non-text floor too.** These are
real text, not decoration: `.lic-prodlabel` ("Research cluster", "Factory A") at 16px, the
footer's `© 2026 ThingsBoard`, `.chipcount`, `.muted` em dashes.

⚠️ **Pre-existing and untouched by this pass** — measured identical on both mirrors (2.814
either side). It is in the debt now, not in this pass: it was never one of the four decisions,
and its blast radius is larger than all three token moves put together.

⚠️⚠️ **And the way it was missed is the lesson.** The first scan was keyed on the literal hexes
`#008846` and `#DA1818`. After the tokens moved, that scan **found nothing and reported no
failures** — a clean pass from an instrument that had gone blind. A contrast walk must resolve
its token values from `:root` at scan time. Third instance of this shape in two sessions,
after `OPENERS.usersModal` and `SWEEP.ignoreClasses`.
---

# `--faint` — APPLIED 2026-10-07 (C for the token, A for the licence row)

> **Decided: C + A.** No new value — all 453 text readers moved to `--mid`. The token was
> **renamed, not just rescoped**: `#9a9a9a` survives only under two roles named after an
> exemption. The licence row's third tier is carried by **size**. See **"After"** at the end.
> The measurement that led there is kept below, unchanged.

**This section is the measurement that produced the decision.** It answers four questions and
ends in a choice; the choice taken is recorded after it.

## 1 · The minimum values

`--faint` is `#9a9a9a` and is used on **three** grounds, not two: `#ffffff`, `--page-bg`
`#F4F7FB` and `--bg` `#f4f4f2` (the footer on the styleguide shell).

| ground | now | AA 4.5 needs | 3:1 needs |
|---|---:|---|---|
| `#ffffff` | **2.814** | `#767676` (4.542) | `#949494` (3.033) |
| `--page-bg` `#F4F7FB` | **2.619** | **`#717171`** (4.542) | **`#8f8f8f`** (3.010) |
| `--surface-quiet` `#F4F5F6` | 2.578 | `#707070` (4.537) | — |

**The minimum that clears 4.5 on both grounds it carries text on: `#717171`.**
On white it then reads 4.881, on `--page-bg` 4.542, and on `--surface-quiet` **4.471** — so it
clears the two grounds it is used on and would be 0.03 short on a third it is not used on.

**For 3:1 the answer differs: `#8f8f8f`** — four steps lighter. But see §3: **it is not needed.**

## 2 · The 507 are 453 + 119, and the split matters

Re-walked with the tokens resolved from `:root`, signed in, with a pre-flight confirming each
URL renders its own page: **648 faint marks over 10 pages.**

| | n |
|---|---:|
| **product text** | **453** |
| product glyphs | 119 |
| styleguide text (prototype documentation, not product) | 76 |

### Every product text group, named from the list

| class | n | size | ground | samples | verdict |
|---|---:|---|---|---|---|
| `.fi-time` | **320** | 16 | white | `10:26` `07:12` | **text — AA** |
| (footer span) | 36 | 16 | page-bg | `© 2026 ThingsBoard`, `·` | **text — AA** |
| `.link` | 27 | 16 | page-bg | `Privacy policy`, `Terms of service` | **text, and a LINK — AA** |
| `.lic-prodlabel` | 13 | 16 | white | `MQTT prod`, `Factory A` | **text — AA** |
| `.fd-k` | 12 | 16 | white | `Charge`, `Attempt` | **text — AA** |
| `.inst-id` | 10 | 14 | white | `8e2a6c04-9f51-…` | **text — AA** |
| `.ia-licsub` | 10 | 14 | white | `ThingsBoard · Subscription` | **text — AA** |
| `.fd-was` | 7 | 16 | white | `100`, `1`, `Off` | **text — AA** |
| `.muted` | 4 | 16 | white | `—` | **text — AA** |
| `.num` | 4 | 16 | white | `0` | **text — AA** |
| `.chipcount` | 3 | 14 | white | `4`, `0`, `2` | **text — AA** |
| `.cardhelp` | 2 | 16 | white | `Removes your profile and access…` | **text — AA** |
| `.setcard-hint` | 2 | 16 | white | `Charged automatically for…` | **text — AA** |
| `.inst-note` | 1 | 16 | white | `Licenses check in every hour…` | **text — AA** |
| `.help` | 1 | 16 | white | `Used to sign in. Changing it…` | **text — AA** |
| `.help-inline` | 1 | 16 | white | `(optional)` | **text — AA** |

**All sixteen groups are genuinely text and none is incidental under 1.4.3.** The exception in
1.4.3 covers inactive components, pure decoration, invisible text and logotypes; **nothing here
is any of those** — zero of the 453 sit inside a `[disabled]` or `aria-disabled` subtree, and the
footer's copyright is text, not a logotype.

⚠️ **Two worth calling out by name.** `.link` ×27 is not passive text, it is the **only route to
the Privacy, Terms and Licence-agreement pages**. And `.muted`'s em dash is content by the
file's own argument — "a dash reads as *there is nothing here yet*, which is the actual fact".

## 3 · The 119 glyphs: 1.4.11 does not bite, and that is measured

| glyph | n | how it is marked up |
|---|---:|---|
| `ti-corner-down-right` | 94 | `aria-hidden="true"` |
| `ti-repeat` | 11 | `aria-hidden="true"` |
| `ti-arrow-right` | 7 | `aria-hidden="true"` |
| `ti-search` | 4 | `aria-hidden="true"` |
| `ti-chevron-down` | 3 | `aria-hidden="true"` |

**All 119 are `aria-hidden`, and zero carry meaning alone** — none has `role="img"` or an
`aria-label`. 1.4.11 exempts decoration, so **no new value is needed for the glyphs**: the
`#8f8f8f` figure in §1 is there for completeness, not as a requirement.

⚠️ **One non-contrast finding, reported not fixed:** `ti-repeat` ×11 is the auto-charge mark.
It tells a sighted reader "this charge is automatic" and is `aria-hidden`, so assistive tech
never gets that fact. **That is a different defect on the same elements** and does not belong
to a colour pass.

## 4 · What `#717171` does to hierarchy

| surface | neighbour | faint:ground before → after | faint:neighbour before → after |
|---|---|---|---|
| Activity feed, `.fi-time` (320 of 453) | `--ink` | 2.814 → **4.881** | 6.056 → **3.492** |
| Licence row, `.lic-prodlabel` | `--mid` | 2.814 → **4.881** | 1.894 → **1.092** |
| Account card, `.cardhelp` | `--mid` | 2.814 → **4.881** | 1.894 → **1.092** |
| Footer, copyright + links | (all faint) | 2.619 → **4.542** | — |

### ⚠️⚠️ It flattens — but in 6% of places, not across the product

Measured by asking, for every one of the 453, what coloured text sits within 120px of it inside
the same block:

| the faint text sits beside | n | share | after the change |
|---|---:|---:|---|
| `--ink` | **384** | 85% | **3.492:1 — still clearly two tiers** |
| nothing but other faint text | 44 | 10% | nothing to flatten against |
| **`--mid`** | **25** | **6%** | **1.092:1 — the tier disappears** |

**The 25:** `.lic-prodlabel` ×13 · `.muted` ×3 · `.chipcount` ×3 · `.setcard-hint` ×2 ·
`.inst-note` · `.help` · `.help-inline` · `.cardhelp`.

**The worst of them is the licence row, and it is worth looking at rather than reading about.**
It is a three-line stack, every line 16px/400, the tiers separated by **colour alone**:

```
ThingsBoard · Grant     --ink  #1c1c1c  /  --mid #6b6b6b on "· Grant"
Community Grant         --mid  #6b6b6b
Research cluster        --faint #9a9a9a   ← becomes #717171, i.e. --mid
```

## 5 · What recovers the difference, proposed not applied

**The honest reading: `#717171` is correct for 94% of the cases and costs a tier in 6%.** So the
options are not "fix the colour or fix the type" — they are about what the third tier is made of
in those 25 places.

**A · Carry the third tier by SIZE where it collides.** The quiet tier drops one step on the
existing scale — 16px → **14px `--t-small-fs`** — on the 25 that sit beside `--mid`. The type
scale's floor is 14px, so this is legal and invents nothing. Note it does **not** relax the
contrast requirement (14px is still normal text at 4.5) — it restores the *visible* difference
that colour can no longer carry. **Four of the 25 are already 14px**, so the tier is mixed in
size today and this makes it consistent rather than introducing a new idea.

**B · Carry it by WEIGHT.** Leave the sizes alone and move the `--mid` neighbour to 500 in those
blocks. Cheaper in layout, but it changes the *upper* tier to fix the lower one, and 500 on a
plan name reads as emphasis the plan name does not want.

**C · Accept two tiers and say so.** If AA forces `--faint` within 1.09:1 of `--mid`, then as a
**text** colour the third tier does not survive contrast, and the system should admit that:
`--faint` keeps `#9a9a9a` for the 119 decorative glyphs, and all 453 text readers move to
`--mid` (5.329 white / 4.960 page-bg — already clears everywhere). **One fewer token, no new
value, and the same visual result as A-without-the-size-step.**

**My recommendation: C for the token, A for the licence row.** C is the smaller system — it
stops pretending there is a third text tier — and it costs no new value. A is then only needed
where a stack genuinely has three levels to show, which the census says is **one component**:
the licence row. That keeps the change to one value move plus one size step on thirteen labels,
instead of a new token and a rule about when to use it.

⚠️ **Not applied. Four things still need a decision:** the value (`#717171` or C's "no new
value"), whether the 25 get size, weight or nothing, whether `--faint` survives as a glyph-only
colour, and whether `--surface-quiet`'s 4.471 matters given nothing faint sits on it.


---

# After — `--faint` applied

## What changed, as one transition

**`color: #9a9a9a → #6b6b6b`.** One value move, and it is the largest visible change in the
project.

| | n |
|---|---:|
| elements whose computed `color` moved | **8,441** |
| `outline-color` (defaults to `currentColor`) | 8,441 |
| `border-top-color` (same) | 8,407 |

⚠️ **8,441 is not a contradiction of "453".** The 453 are elements that *directly contain
text*; `color` is inherited, so every descendant of a faint-coloured container reports the move
too. Both numbers are right and they answer different questions. The largest single
contributor is `span.fi-time` and its subtree — **4,584 of the 8,441** across three widths.

## What rides along, named

| transition | n | what it is |
|---|---:|---|
| `font-size: 16px → 14px` | **55** | **the licence row label, and nothing else.** Exactly two element kinds: `div.lic-prodlabel.licc-label` (table) and `span.lic-prodlabel.lcard-labeltxt` (phone card) |
| `#DA1818 → #D91818` | 1,776 | the **previous** pass's red |
| `#008846 → #008243` | 1,365 | the **previous** pass's green |
| `#6b6b6b → #636363` | 9 | the **previous** pass's `--text-quiet` on the two leads |

⚠️ **The `pre` mirror predates BOTH contrast passes**, so the red, green and `--text-quiet`
transitions in this run are the previous pass re-confirmed, not new work. Only the first two
rows belong to this one.

**Nothing else rides along. 0 lost, 0 gained, 0 errors, across 39 portal cells and 4 public
cells (54,589 + 1,424 elements compared).**

## The token, renamed

```css
--c-grey-400: #9a9a9a;                     /* the value, on the existing grey ramp */
--glyph-decorative: var(--c-grey-400);     /* 1.4.11: pure decoration OR an inactive component */
--text-inactive:    var(--c-grey-400);     /* 1.4.3's own exemption */
```

**`--faint` no longer exists** — verified: `getPropertyValue('--faint')` is empty on `:root`,
and `var(--faint)` appears **zero** times in `styles.css`, `styleguide.html` and `styleguide.js`.

**Why two roles and not one.** 1.4.11 exempts "pure decoration" and "an inactive user interface
component" in a single clause, so one role covers both for glyphs. **Text** inside an inactive
component is exempted by a different success criterion (1.4.3), and giving text a role with
"glyph" in its name would be a lie the next reader acts on. Seven rules take `--text-inactive`
— disabled pagers, disabled chips, the `off` pills.

⚠️ **This is one more token than was asked for, and it is the one judgement call in this pass.**
The alternative was moving disabled text to `--mid`, which would make disabled controls look
enabled — a visible change nobody decided.

### The name is a claim, so it was verified on exactly the elements that read it

| glyph | n | host |
|---|---:|---|
| `ti-corner-down-right` | 94 | `.fi-more-ic` |
| `ti-repeat` | 11 | `.autoic` |
| `ti-arrow-right` | 7 | `.fd-arrow` |
| `ti-search` | 4 | `.searchbox .searchglyph` |

**116 of 116 are `aria-hidden`; zero carry meaning alone** (no `role="img"`, no `aria-label`).
**Zero text anywhere in the rendered product is still on `#9a9a9a`.** Both assertions run over
13 pages and both returned empty violation lists.

### ⚠️⚠️ Five glyphs turned out NOT to be decorative, and the rename is what found them

The census had counted 119 decorative glyphs. Reading each one's rule rather than its colour,
**three of them were the column sort arrow** — `th .arrow`, inside `th.sortable`, which is
"visual information required to identify a user interface component and its state" and so owes
1.4.11 a 3:1 ratio it was failing at **2.814**. Four more rules were the same mistake waiting to
happen: `.chip .x` and `.chip-x` (remove controls), `.infoic` (a button) and `.searchclear`.

**All five moved to `--mid` (5.329).** A token named `--faint` would have taken them all
silently; a token named `--glyph-decorative` could not.

## The licence row, A applied

```
ThingsBoard · Grant     --ink  16px  /  --mid 16px on "· Grant"
Community Grant         --mid  16px
Research cluster        --mid  14px   ← was --faint 16px
```

`--t-small-fs` is the scale's **floor**, not a new number, and three of the places that collided
were already on it. Weight was rejected: 500 on the plan name fixes the bottom tier by moving
the top one.

## ⚠️ What this pass did NOT do, and the measurement for it

The 25 collisions were `.lic-prodlabel` ×13 (fixed) · `.chipcount` ×3 (already 14px) · `.muted`
×3 · `.setcard-hint` ×2 · `.inst-note` · `.help` · `.help-inline` · `.cardhelp`. **The nine
help-and-hint cases now sit at `--mid` 16px under a `--mid` 16px label**, so label and help read
as one block.

⚠️⚠️ **And three of them were already asking for the size step before this pass touched them.**
`.setcard-hint`, `.cardhelp` and `.field .help` each declare **three of the four** `--t-small-*`
properties — `line-height`, `letter-spacing`, `font-weight` — and take `--t-body-fs` for the
fourth. They were authored as the small tier with the size left behind. **Completing that is a
one-property change on three rules, not a new decision** — but it is nine visible places and
"A for the licence row" named one component, so it is reported here rather than taken.

## Verified

| | |
|---|---|
| computed values, 13 portal pages × 3 widths | **54,589 elements: 29,055 changed, 0 lost, 0 gained, 0 errors** |
| computed values, 2 public pages × 2 widths | **1,424 elements: 480 changed, 0 lost, 0 gained** |
| contrast re-walk, tokens resolved from `:root` | **13 pages, 1,150 marks, zero failing text groups** |
| the decorative claim | **116/116 `aria-hidden`, 0 meaningful, 0 text left on `#9a9a9a`** |
| `check-css` | `ok:true`, 2185/2185, 0 dropped, identical both sides |
| 15 pages · `check-icons` · collisions | no errors · 3/3 clean · 23/24, `:root` 4/4 |

**Every text group now clears its floor:** `--mid` reads **5.329** on white (713 instances),
**4.960** on `--page-bg` (85), **4.882** on `--surface-quiet` (4), **4.839** on `--bg` (11).

⚠️ **90 unpaired, all in `styleguide.html` across the three widths** — the constant paragraph the
**previous** pass added to the Tokens section, which the `pre` mirror predates. Not this pass.

## `--surface-quiet` at 4.471 — recorded, and now moot

The minimum-value route would have left `#717171` 0.03 short on `--surface-quiet`. Under C the
question disappears: **nothing text-coloured can land there below AA any more**, because the only
text grey is `--mid`, which reads **4.882** on that ground. Recorded and closed.

---

# The nine help-and-hint — applied 2026-10-07, and it is the last change

**Same shape as the licence row, in another place: colour no longer separates, so size does.**
Three rules completed to `--t-small-fs`: `.setcard-hint`, `.cardhelp`, `.field .help`.

## One visible transition

| transition | n | what |
|---|---:|---|
| `font-size: 16px → 14px` | **20** | `.setcard-hint` ×8, `.help` ×6, `.cardhelp` ×4, `#emailHelp` ×2 |
| `line-height: 23.2px → 20.3px` | 20 | rides along — `--t-small-lh` is a ratio, so the line follows the size |

**40 changed, 0 lost, 0 gained, 0 unpaired, 0 errors**, 36,467 elements compared over 13 pages
× 2 widths. Nothing else moved.

Measured after: `.help` and `.cardhelp` read **14px / 400 / `--mid` / 5.329:1**.

## ⚠️ A number in the proposal was wrong, and the census corrected it

The proposal said all three rules "already carry three of the four `--t-small-*` properties".
A brace census over the whole sheet says **only `.setcard-hint` does** — `.cardhelp` and
`.field .help` carry **two** (`line-height` and `letter-spacing`, no `font-weight`). The
argument survives unchanged: all three take the small tier's metrics and the body size. The
figure was true of one rule, not three.

**The same census found two more rules in that shape, both deliberately left alone:**
`.field > label` (3 of 4 — a label, not help text) and `.dwelcome p` (3 of 4 — the landing
lead, which is 16px on purpose and took `--text-quiet` two passes ago).

## ⚠️⚠️ And the control caught 6 phantom changes — `font-weight` on `<use>` is not stable here

The cross-pair run first reported **46** changed, including `font-weight: 900 → 700` ×6 on
`<use>` elements inside the styleguide's warning glyphs. A direct, index-matched probe of all
**68** equivalent `<use>` elements on both mirrors found **zero** differences, which looked
like a flake — so the control was run properly:

| | changed |
|---|---:|
| `site` vs **`site`** (same mirror, styleguide) | **3, all `font-weight 900→700`** |
| `pre` vs **`pre`** (same mirror, styleguide) | **3, the same** |
| same mirror, four product pages, all five properties | **0** |

**The instrument produces them, the tree does not.** The real total is **40**, not 46.
⚠️ This is specific to `<use>` inside the styleguide's glyphs — the noise floor on product
pages is zero. **Any future pass that measures `font-weight` has to run the same-mirror control
first**, or it will report six changes it did not make.

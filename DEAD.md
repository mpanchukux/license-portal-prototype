# Dead selectors — what `styles.css` says about nothing

Report only. Nothing was deleted, nothing was fixed.

Base: the working tree as of this session (`4c8678f` plus the uncommitted type passes and the
four non-type fixes). Produced by `tools/selector-census.py` → `tools/dead-selectors.js` →
`tools/classify-dead.py`; all three are on disk and the run is repeatable.

---

## What was exercised

`tools/dead-selectors.js` drove **54 scenarios × 4 widths (1280, 601, 600, 390) = 216 states**,
and in each one recorded, for every probe in the census, whether it matched an element.

Covered: all 15 pages; both hosts of the licence panel (`.licmodal` overlay and
`#licDetailsHost` inline); every overlay the modal run reached — wizard at each step for both
products and both billing models, licence panel over sub/perp/grant, pay card, users, auth,
the four filter sheets; the ⚙ axes `landingBg`, `alertGround`, `homeLayout`, `dash`,
`billingData`, `credit`, `impersonating`, `auth`; and the interactive states the drivers can
reach — menus open, chips toggled, rows expanded.

**Not covered, and this shows up directly in the results below:** the ⚙ axes `tableframe` and
`mesh`, the instances table in grouped mode, `body.list-empty`, and `listframe.is-stuck`.
Those four account for most of group 1. I am not claiming they are dead; I am reporting that
this run never put the page into them.

Two guards ran throughout: a scenario was voided if it was redirected away from the page it
asked for, or if it rendered fewer than 60 nodes. **216 states, 0 voided.**

### Census

| | |
|---|---:|
| rules parsed | 6,411 |
| comma-split selectors | 7,171 |
| distinct probes | 1,970 |
| matched in at least one state | 1,483 |
| **matched in no state** | **477** |
| not selectors — `@keyframes` stops (`from`, `to`, `0%`, `50%` …) | 7 |
| not selectors — fragments of the malformed comment at 9088 | 3 |

1,483 + 477 + 7 + 3 = 1,970. The last two rows are strings the census lifted out of
`styles.css` that are not selectors at all; five of the `@keyframes` stops and all three prose
fragments were rejected by the browser outright, and `from` / `to` were accepted but mean
nothing — see *Two things found in passing*. They are excluded from every count below.
A **fourth** fragment of that same comment was accepted as a valid descendant selector, matched
nothing, and so sits inside the 477, in group 3, where it is listed.

---

## The three groups

| group | what it means | distinct selectors | declarations |
|---|---|---:|---:|
| 1 | matched nothing, but a nameable state would make it match | 241 | 639 |
| 2 | matched nothing, and no state would — the class is never written anywhere in the source | 113 | 343 |
| 3 | matched nothing because the markup never produced the structure the rule expects | 123 | 285 |

The split between 2 and 3 is mechanical: group 2 is a selector naming at least one class or id
that appears **nowhere** in any `.js` or `.html` file (comments stripped first, so a class
mentioned only in prose counts as never written). Group 3 is every remaining selector whose
parts all exist but whose combinator chain never holds.

---

## Group 1 — a state would make it match (241 selectors, 639 declarations)

| state that would make them match | selectors |
|---|---:|
| the instances table in grouped mode | 35 |
| a toggle the run did not flip | 28 |
| a disabled control | 25 |
| the element hidden or empty | 24 |
| a wizard path the run did not walk (coupon, legal error, credit, unlimited, key) | 24 |
| a banner or status chip in a tone the demo data never produces | 14 |
| an instance group row (grouped mode, expanded) | 13 |
| a list with no rows at all | 12 |
| the prototype settings bar, collapsed or toggled | 10 |
| a user invited but not yet accepted | 6 |
| a list scrolled far enough to stick its header | 6 |
| the licence label being edited | 5 |
| billing with no card on file | 4 |
| something expanded, or a column sorted | 4 |
| a field in error | 4 |
| ⚙ mesh dashboard variant | 3 |
| the sign-in form locked | 2 |
| the styleguide presentation frames | 2 |
| an FAQ item open | 2 |
| (no single state — see the list) | 34 |

**the instances table in grouped mode** — 35

- `body[data-tableframe] #instTable.is-grouped` — 2209
- `body[data-tableframe] .listframe:has(.pager[hidden]) #instTable.is-grouped` — 2222
- `body[data-tableframe].list-empty #instTable.is-grouped` — 2222
- `body[data-tableframe] #instTable.is-grouped thead th:first-child::before` — 2313
- `body[data-tableframe] #instTable.is-grouped thead th:last-child::before` — 2313
- `#instTable.is-grouped` — 2330
- `#instTable.is-grouped thead th:nth-child(1)` — 2331
- `#instTable.is-grouped thead th:nth-child(2)` — 2332
- `#instTable.is-grouped thead th:nth-child(3)` — 2333
- `#instTable.is-grouped thead th:nth-child(4)` — 2334
- `#instTable.is-grouped thead th:nth-child(5)` — 2335
- `#instTable.is-grouped .ia-name` — 2339
- `#instTable.is-grouped thead th:first-child` — 4227
- `#instTable.is-grouped thead th:last-child` — 4228
- `#instTable.is-grouped thead th:first-child::before` — 4261
- `#instTable.is-grouped thead th:last-child::before` — 4261
- `#instTable.is-grouped .stickyhead th:first-child::after` — 4270
- `#instTable.is-grouped .stickyhead th:last-child::after` — 4271
- `.listframe.is-stuck #instTable.is-grouped thead th:first-child::before` — 4276
- `.listframe.is-stuck #instTable.is-grouped thead th:last-child::before` — 4276
- `#instTable.is-grouped tbody tr:last-child > td` — 4280
- `#instTable.is-grouped .instg-row.is-last > td` — 4281
- `#instTable.is-grouped .instgroup > td` — 4289
- `#instTable.is-grouped .instgroup.is-open > td` — 4290
- `#instTable.is-grouped .instg-row > td` — 4294
- `#instTable.is-grouped .instg-row > td:first-child` — 4295
- `#instTable.is-grouped .instg-row > td:last-child` — 4296
- `#instTable.is-grouped .instg-row.is-last > td:first-child` — 4301
- `#instTable.is-grouped .instg-row.is-last > td:last-child` — 4302
- `#instTable.is-grouped .instgap > td` — 4304
- `#instTable.is-grouped .instgroup.is-alt .ig-row` — 4340
- `#instTable.is-grouped .instgroup .ig-row:has(.ig-btn:hover)` — 4359
- `#instTable.is-grouped .instgroup.is-alt .ig-row:has(.ig-btn:hover)` — 4359
- `body.list-empty #instTable.is-grouped` — 6995
- `.listframe:has(.pager[hidden]) #instTable.is-grouped` — 6995

**a toggle the run did not flip** — 28

- `.nav a.on` — 380
- `.nav a.on .ic` — 381
- `.tb-refresh.is-busy > *:not(.btn-spin)` — 1217
- `.tip.wide.show::after` — 1394
- `.alertic.show` — 1524
- `.infoic.show` — 1769
- `.modal.wide` — 2401
- `.modal.wide .mb` — 2408
- `.modal.wide .fs-grid` — 2409
- `.modal.wide .mf` — 2415
- `.modal.wide .fs-right` — 2425, ≤600
- `.am-cardprice.locked::before` — 2513
- `.fs-screen .nl-cardstack .am-addon.on` — 3181
- `.fs-screen .nl-cardstack .am-addon.on:hover` — 3186
- `#nlModal.docked .fs-header` — 3359
- `#nlModal .nl-cardstack .am-addon.on` — 3577
- `.filterchip.is-on .chipcount` — 4155
- `.tb-act.on` — 4630
- `.lcard.off .lcard-name` — 5464
- `.lcard.off .lcard-kind` — 5464
- `.gbanner.on-ink .btn--secondary` — 5762
- `.pc-note.center` — 6155
- `.filterchip.is-on` — 7450
- `.filterchip.is-on .cc-check` — 7451
- `.dropmenu.right` — 7521
- `.chip.status.off` — 7582
- `.chip.status.off .sdot` — 7583
- `.percustom.show` — 7592

**a disabled control** — 25

- `.licmodal .alert .btn--secondary:not([disabled]):hover` — 950
- `.licmodal .alert .btn--menu:not([disabled]):hover` — 950
- `.licmodal .alert .btn--secondary:not([disabled]):active` — 952
- `.licmodal .alert .btn--menu:not([disabled]):active` — 952
- `.btn--destructive.btn--ghost:not([disabled]):not([aria-disabled="true"]):hover` — 1192
- `.btn--destructive.btn--ghost:not([disabled]):not([aria-disabled="true"]):active` — 1192
- `.pager select:disabled` — 2103
- `.pager > span:has(select:disabled)` — 2104
- `.pager > span:has(select:disabled) .selchev` — 2105
- `.nl-prodcard[disabled]` — 3754
- `.nl-prodcard[disabled]:not(.on)` — 3755
- `.nl-prodcard[disabled]:not(.on) .nl-proddesc` — 3757
- `.nl-prodcard[disabled]:not(.on) .nl-prodic` — 3757
- `.nl-billtab[disabled]` — 3776
- `.nl-billtab[disabled].on` — 3777
- `.switch input[disabled] + .track` — 3781
- `.gbanner.on-ink .btn--secondary:not([disabled]):hover` — 5765
- `.gbanner.on-ink .btn--secondary:not([disabled]):active` — 5765
- `.setcard-h-page .btn[disabled]` — 7204
- `.modal .mf .btn[disabled]` — 7215
- `.pagehead .btn[disabled]` — 7220
- `.typechip:disabled` — 7425
- `.typechip:disabled:not(.is-on)` — 7426
- `.typechip:disabled:not(.is-on):hover` — 7426
- `#homeCards .hc-more .btn--secondary.blockmore-go:not([disabled]):not([aria-disabled="true"]):hover` — 7859, ≤600

**the element hidden or empty** — 24

- `.featureblock[hidden]` — 612
- `.inline[hidden]` — 1785
- `.am-sumlist[hidden]` — 2616
- `.nl-plansum[hidden]` — 3016
- `.am-cell[hidden]` — 3057
- `.nl-foot[hidden]` — 3490
- `.nl-foot .btn[hidden]` — 3491
- `.app[hidden]` — 3986
- `.licview[hidden]` — 3986
- `.chipcount:empty` — 4157
- `.paymodal-b[hidden]` — 4710
- `.paymodal-f[hidden]` — 4710
- `.pc-note:empty` — 6156
- `.fsep[hidden]` — 6481
- `.fitem[hidden]` — 6481
- `.listframe:has(.pager[hidden]) table:not(.is-grouped) tbody tr:last-child > td:first-child` — 6991
- `.listframe:has(.pager[hidden]) table:not(.is-grouped) tbody tr:last-child > td:last-child` — 6993
- `.snack[hidden]` — 7021
- `.lic-controls[hidden]` — 7277
- `.fsheet[hidden]` — 7362
- `.lic-row[hidden]` — 7461
- `#subAlert:not([hidden])` — 8359, ≤600
- `.licmodal #subAlert:not([hidden])` — 8369, ≤600
- `.headactions.empty` — 8532, ≤600

**a wizard path the run did not walk (coupon, legal error, credit, unlimited, key)** — 24

- `.nl-creditsum` — 1730
- `.nl-crow` — 1731
- `.nl-crow.muted span` — 1732
- `.nl-creditnote` — 1736
- `.ru-lic` — 2417
- `.ru-liclead` — 2418
- `.ru-licname` — 2419
- `.nl-vline` — 3498
- `.nl-sline` — 3499
- `.nl-unl` — 3500
- `.nl-unl-k` — 3501
- `.nl-unl-v` — 3502
- `.nl-keybox` — 3523
- `.nl-taxline` — 6150
- `.nl-effect` — 6810
- `.nl-effectwhat` — 6812
- `.nl-couponedit` — 6839
- `.nl-couponedit:hover` — 6840
- `.nl-couponerr` — 6847
- `.nl-couponerr:empty` — 6849
- `.nl-free` — 6859
- `.nl-legal.err input` — 6872
- `.nl-legal.err .nl-legaltxt` — 6873
- `.nl-legalerr` — 6874

**a banner or status chip in a tone the demo data never produces** — 14

- `.chip.status.blocked` — 801
- `.alert.tone-red` — 859
- `.alert.tone-black` — 861
- `.alert.tone-black .aact:not([disabled]):hover` — 905
- `.alert.tone-black .aact:not([disabled]):active` — 905
- `.licmodal .alert.tone-black .aact:not([disabled]):hover` — 965
- `.licmodal .alert.tone-black .aact:not([disabled]):active` — 965
- `.gbanner.tone-black:not(.on-ink)` — 5658
- `.gbanner.tone-black:not(.on-ink) .gb-ic` — 5806
- `.pill.attn` — 7567
- `.chip.status.attn` — 7580
- `.chip.status.attn .sdot` — 7581
- `#subAlert.tone-red:not([hidden])` — 8361, ≤600
- `#subAlert.tone-black:not([hidden])` — 8363, ≤600

**an instance group row (grouped mode, expanded)** — 13

- `.ig-row` — 4336
- `.ig-btn` — 4337
- `.ig-btn:focus-visible` — 4360
- `.ig-chev` — 4361
- `.ig-mark` — 4363
- `.ig-name` — 4367
- `.ig-kind` — 4369
- `.ig-desc` — 4372
- `.ig-open` — 4387
- `.ig-count` — 4390
- `.instgroup[hidden]` — 4391
- `tr.instgroup` — 8153, ≤600
- `.instg-row` — 8181, ≤600

**a list with no rows at all** — 12

- `body.list-empty .listframe table:not(.is-grouped) tbody td` — 6961
- `body.list-empty .listframe table:not(.is-grouped)` — 6961
- `body.list-empty .stickybar` — 6985
- `body.list-empty .listcard:has(> .lic-controls):not(.listframe)` — 6985
- `body.list-empty .listcard:has(> .insttoolbar):not(.listframe)` — 6985
- `body.list-empty .pager` — 6985
- `body.list-empty .inst-hint` — 6985
- `body.list-empty thead` — 6985
- `body.list-empty .listframe table:not(.is-grouped) tbody tr:last-child > td:first-child` — 6991
- `body.list-empty .listframe table:not(.is-grouped) tbody tr:last-child > td:last-child` — 6993
- `body.list-empty #pageTitleRow [data-refresh]` — 7007
- `body.list-empty #pageTitleRow [id^="licNewBtn"]` — 7007

**the prototype settings bar, collapsed or toggled** — 10

- `.statebar[hidden]` — 2655
- `.sb-body[hidden]` — 2665
- `.sb-opt.is-off` — 2694
- `.sb-act` — 2706
- `.sb-act:hover` — 2708
- `.sb-opt-n` — 2709
- `.sb-opt.is-on .sb-opt-n` — 2710
- `.sb-sub` — 2718
- `.sb-sublabel` — 2720
- `.sb-subopts` — 2721

**a user invited but not yet accepted** — 6

- `.usershead .invite-link.done` — 3894
- `.usershead .invite-link.done .ic` — 3894
- `.chip.invite-chip` — 6683
- `.invite-chip-t` — 6685
- `.invite-msg.on` — 6717
- `.user-invited` — 7031

**a list scrolled far enough to stick its header** — 6

- `.listframe.is-stuck .stickybar::after` — 6324
- `.listframe.is-stuck:has(.stickyhead th) .stickybar::after` — 6325
- `.listframe.is-stuck .stickyhead th::after` — 6326
- `.listframe.is-stuck:not(:has(.stickyhead th)) .stickybar::after` — 6331
- `.listframe.is-stuck .stickyhead th` — 6344
- `#appView .tabs.is-stuck::after` — 6372

**the licence label being edited** — 5

- `.labeledit-row` — 677
- `.labelsave` — 678
- `.labelinput` — 812
- `.labelcount` — 4536
- `.labelcount.over` — 4538

**billing with no card on file** — 4

- `.credit-amt` — 1723
- `.credit-note` — 1728
- `.paycard-none` — 7037
- `.paycard.is-empty` — 7135

**something expanded, or a column sorted** — 4

- `th[aria-sort="ascending"] .arrow` — 2060
- `.dprofbtn[aria-expanded="true"]` — 4663
- `.faq-q[aria-expanded="true"] .faq-chev` — 9664
- `.faq-i:has(> .faq-qh > .faq-q[aria-expanded="true"])` — 9674

**a field in error** — 4

- `.fs-devinput.numfield.is-bad` — 3052
- `.field.err > select` — 6762
- `.field.err > textarea` — 6762
- `.field.err .paystripe` — 6762

**⚙ mesh dashboard variant** — 3

- `body[data-mesh] .dtopbar:not(.docked) .dprofbtn[aria-expanded="true"]` — 4665
- `body[data-mesh] .dtopbar.docked::after` — 5127
- `body[data-mesh] .dtopbar.docked` — 5139

**the sign-in form locked** — 2

- `.authlocked` — 6733
- `.authlock-ic` — 6736

**the styleguide presentation frames** — 2

- `.sg-presframe.a` — 7674
- `.sg-presframe.b` — 7675

**an FAQ item open** — 2

- `.faq-arrow` — 9683
- `.faq-more[hidden]` — 9697

**No single state names these — each is its own case** — 34

- `.em` — 298
- `.brand` — 373
- `.nav` — 377
- `.topbar` — 384
- `.user` — 391
- `.user:hover` — 392
- `.kebab` — 395
- `.sub` — 497
- `.aact-short` — 831
- `.aact-long` — 832
- `.actions` — 973
- `.btn--menu.btn--icon.btn--sm` — 1156
- `.btn--destructive.btn--ghost` — 1188
- `.btn--destructive.btn--menu` — 1188
- `.ver-mixed` — 1547
- `.vh` — 1599
- `.row` — 1775
- `.row:first-child` — 1776
- `.row:last-child` — 1777
- `.inline` — 1784
- `.stub` — 1788
- `th.cellact` — 2079
- `.seg` — 2767
- `.seg input:checked + span` — 2772
- `button.dbrand` — 4055
- `.pc-term` — 6116
- `.pc-note` — 6154
- `td.noresults-cell` — 6896
- `.brandbadge-mark` — 7146
- `.brandmark` — 7147
- `.pagehead` — 7217
- `.fsheet-extra` — 7408
- `#nlStepBill.haspin` — 8644, ≤600
- `.pagehead.pagetitlerow` — 8821, ≤600

---

## Group 2 — the class is never written (113 selectors, 343 declarations)

No state brings these back. The class does not exist outside this stylesheet.

Three things are visible in this list.

**An entire superseded shell is still styled.** `.sidebar`, `.iconbutton`, `.avatar`, `.ic-16`,
`.itemnote`, `.topbar .pt`, `.brand .bt`, `.brand .bs`, `.user .un` — the early chrome, replaced
by `.dtopbar` / `.dbrand`. `avatar` does appear twice in the source, but only inside comments.
Its relatives `.nav a`, `.brand .mark`, `.topbar .sp` fell into group 3 rather than group 2,
because the parent class survives elsewhere while the child never does.

**A `mark-*` alert vocabulary that was never built.** `.alert.mark-red .ic`, `.alert.mark-warn .ic`,
`.alert.mark-quiet .ic` and their `.licmodal` and `.gbanner` twins. The product uses `tone-*`;
`mark-*` exists only here.

> ⚠️⚠️ **DELETED 2026-10-07 — and this entry was WRONG about why they were dead.** All eight
> rules are gone from `styles.css` with the `Alert tone` axis, which closed on
> `Tinted — the ground carries it`.
>
> **They were not "never built". They were written by a live branch.** `toneClass()` in
> `components.js` returned `'tone-black on-ink mark-' + TONE_MARK[tone]` whenever
> `alertGround()` was `ink` — so the class WAS emitted, by the losing half of an open
> comparison, every time somebody switched the axis and a banner was up.
>
> ⚠️⚠️ **The census drove the axis and still missed it, and that is the finding worth
> keeping.** `tools/dead-selectors.js` has both scenarios — `home · alert tone ink` and
> `licence modal · ink tone`. Neither produces the markup: the first inherits
> `bannerForce: 'none'`, which is the default and means **no banner at all**, and the second
> opens a healthy subscription, whose `.alert` renders `hidden`. **The axis was exercised;
> the state that axis needs was not.** Setting a variant and not also setting the condition
> that makes its markup appear reports a live rule as dead.
>
> **Group 2 is "the class is never written". For these eight it should have read "the class
> is never written IN THE STATES THIS RUN REACHED".** Any other entry whose class is written
> only under a non-default setting is suspect for the same reason — and the fix is scenarios
> that cross a variant with a condition, not more scenarios of each alone.

**Two wizard sub-systems that were designed and not wired**: the `.nl-pe*` plan-explainer
(8 selectors) and the `.nl-success*` confirmation screen (6 selectors), plus `.licb-*`
(9 selectors), a licence-block list that no page renders.

| selector | line | at | decls |
|---|---:|---|---:|
| `.ic-16` | 364 | — | 2 |
| `.sidebar` | 372 | — | 7 |
| `.brand .bt` | 375 | — | 3 |
| `.brand .bs` | 376 | — | 4 |
| `.topbar .pt` | 387 | — | 2 |
| `.iconbutton` | 389 | — | 9 |
| `.iconbutton:hover` | 390 | — | 3 |
| `.avatar` | 393 | — | 11 |
| `.user .un` | 394 | — | 2 |
| `.itemnote` | 500 | — | 4 |
| `.alert.mark-red .ic` | 880 | — | 1 |
| `.alert.mark-warn .ic` | 881 | — | 1 |
| `.alert.mark-quiet .ic` | 882 | — | 1 |
| `.licmodal .alert.mark-warn .ic` | 970 | — | 1 |
| `.licmodal .alert.mark-quiet .ic` | 971 | — | 1 |
| `.inst-statusseg` | 1603 | — | 11 |
| `th.chk` | 2061 | — | 4 |
| `td.chk` | 2061 | — | 4 |
| `.am-cap` | 2492 | — | 2 |
| `.am-capgrid` | 2493 | — | 3 |
| `.am-cardtop` | 2508 | — | 3 |
| `.am-cardtop>div` | 2509 | — | 1 |
| `.am-cardtop .am-addcheck` | 2510 | — | 1 |
| `.nl-terms-tight` | 2569 | — | 2 |
| `.am-total-row .am-chgcount` | 2621 | — | 1 |
| `.viewseg` | 2778 | — | 3 |
| `.viewseg span` | 2779 | — | 5 |
| `#nlStepCap .am-capgrid` | 3010 | — | 1 |
| `#nlStepAdd .am-capgrid` | 3010 | — | 1 |
| `#fsStep1 .am-capgrid` | 3010 | — | 1 |
| `.fs-headback` | 3060 | — | 1 |
| `.fs-headback[hidden]` | 3061 | — | 1 |
| `.fs-screen .am-sechead-sub` | 3110 | — | 3 |
| `.fs-screen .am-capgrid` | 3113 | — | 2 |
| `.fs-screen .am-capgrid .am-group` | 3156 | — | 4 |
| `.fs-screen .am-capgrid .am-group .am-grouphead` | 3158 | — | 1 |
| `.fs-screen .am-capgrid .am-group .am-cell` | 3159 | — | 3 |
| `.fs-screen .am-capgrid .am-group .am-cell + .am-cell` | 3160 | — | 3 |
| `.nl-pc-note` | 3254 | — | 3 |
| `.am-addcheck` | 3256 | — | 6 |
| `.fs-screen .am-addcheck` | 3257 | — | 2 |
| `.nl-pe` | 3506 | — | 5 |
| `.nl-pe-h` | 3507 | — | 6 |
| `.nl-pe-intro` | 3508 | — | 3 |
| `.nl-pe-body` | 3509 | — | 1 |
| `.nl-pe-item` | 3510 | — | 5 |
| `.nl-pe-item:last-child` | 3511 | — | 1 |
| `.nl-pe-item b` | 3512 | — | 2 |
| `.nl-spin` | 3517 | — | 7 |
| `.nl-success` | 3519 | — | 2 |
| `.nl-success-b` | 3520 | — | 4 |
| `.nl-success-h` | 3521 | — | 6 |
| `.nl-success-p` | 3522 | — | 4 |
| `.nl-success-f` | 3525 | — | 2 |
| `.nl-success-f .btn` | 3526 | — | 1 |
| `#nlModal .nl-pe` | 3565 | — | 1 |
| `.nl-prodrow` | 3598 | — | 9 |
| `.nl-stated` | 3632 | — | 4 |
| `.nl-stated .ic` | 3633 | — | 2 |
| `.nl-stated .nl-prodic` | 3634 | — | 1 |
| `.dbrand .bt` | 4057 | — | 3 |
| `.dbrand .bt .bsep` | 4058 | — | 3 |
| `.ig-sub` | 4374 | — | 4 |
| `.licb-row .licb-name` | 4402 | — | 3 |
| `.licb-head-name` | 4402 | — | 1 |
| `.licb-name .lp-ic` | 4404 | — | 3 |
| `.licb-txt` | 4405 | — | 7 |
| `.licb-head` | 4410 | — | 8 |
| `.licb-sub` | 4412 | — | 6 |
| `.licb-row .lic-ver` | 4415 | — | 3 |
| `.licb-row .lic-ver .verline` | 4416 | — | 2 |
| `.licb-row .lic-ver .ver-run` | 4417 | — | 1 |
| `.planpicker .nl-pe.baseline` | 5190 | — | 6 |
| `.nl-pe.baseline .nl-pe-h` | 5192 | — | 1 |
| `.nl-pe.is-gap` | 5194 | — | 1 |
| `.nl-pe.is-gap .nl-pe-intro` | 5195 | — | 1 |
| `.dprodrow` | 5261 | — | 2 |
| `.dprodrow:hover` | 5262 | — | 1 |
| `.hcinv-licmodel` | 5555 | — | 4 |
| `.gbanner.tone-quiet` | 5658 | — | 2 |
| `.impbar .btn--secondary` | 5773 | — | 3 |
| `.impbar .btn--secondary:not([disabled]):hover` | 5774 | — | 1 |
| `.gbanner.tone-quiet .gb-ic` | 5807 | — | 1 |
| `.gbanner.mark-red .gb-ic` | 5823 | — | 1 |
| `.gbanner.mark-warn .gb-ic` | 5824 | — | 1 |
| `.gbanner.mark-quiet .gb-ic` | 5825 | — | 1 |
| `.pg-note` | 5928 | — | 1 |
| `.pc-price.is-free` | 6114 | — | 2 |
| `.pc-freebadge` | 6115 | — | 2 |
| `.am-featgrid` | 6149 | — | 1 |
| `.invitecard` | 6655 | — | 2 |
| `.invitecard > *:not(.setcard-h)` | 6656 | — | 1 |
| `.setdelete .btn.ter` | 7182 | — | 1 |
| `.listcard .lic-viewrow` | 7298 | — | 2 |
| `.lic-filterrow` | 7299 | — | 1 |
| `.chipdiv` | 7442 | — | 6 |
| `.lic-num` | 7505 | — | 2 |
| `th.lic-num` | 7512 | — | 1 |
| `.sg-toc` | 7613 | — | 4 |
| `.sg-toc a` | 7614 | — | 7 |
| `.sg-toc a:hover` | 7615 | — | 1 |
| `.sg-flag` | 7684 | — | 6 |
| `.dwelcome .btn.xl` | 8058 | ≤600 | 1 |
| `tr.lic-row > td.lic-num` | 8234 | ≤600 | 3 |
| `.keyline #installBtn` | 8505 | ≤600 | 13 |
| `.keyline #installBtn .ic` | 8511 | ≤600 | 2 |
| `.keyline #installBtn:hover` | 8512 | ≤600 | 2 |
| `.fs-right.pinned .nl-terms-tight` | 8653 | ≤600 | 2 |
| `.lic-viewrow .spacer` | 8995 | ≤600 | 1 |
| `.inst-statusseg::-webkit-scrollbar` | 9001 | ≤600 | 1 |
| `.inst-statusseg > *` | 9002 | ≤600 | 1 |
| `.cancelchip` | 9014 | ≤600 | 1 |
| `#licBarB .perbtn` | 9019 | ≤600 | 5 |
| `#licBarB .dropwrap` | 9029 | ≤600 | 3 |
| `#licBarB .perctl` | 9030 | ≤600 | 1 |
| `#licBarB .perbtn b` | 9032 | ≤600 | 3 |
| `.insttoolbar #addUserBtn` | 9123 | ≤600 | 3 |
| `.insttable tbody td.chk` | 9525 | ≤600 | 1 |

---

## Group 3 — the structure is never produced (123 selectors, 285 declarations)

Every class here exists. The relationship does not: the rule expects a descendant, child or
sibling arrangement the markup never builds.

The largest single cause is `.alert.tone-black` (14 selectors across the group): the tone is
written by the source, so the bare `.alert.tone-black` is group 1, but every rule reaching
*inside* it — `.aact`, `.link`, `.ic`, `.atxt b`, `.amsg-when` — is group 3, because the black
alert is only ever rendered in a short form that has no action area.

Second is the `@media (max-width:600px)` block for `#subAlert` (5 selectors) and the phone
rules for `tr.instg-row` / `tr.instgroup` (5 selectors), which expect the grouped table that
this run never produced — those may well match once grouped mode is exercised.

| selector | line | at | decls |
|---|---:|---|---:|
| `.fi-txt b` | 298 | — | 1 |
| `.brand .mark` | 374 | — | 9 |
| `.nav a` | 378 | — | 9 |
| `.nav a:hover` | 379 | — | 2 |
| `.topbar .sp` | 388 | — | 1 |
| `.idline .title` | 475 | — | 1 |
| `.titlerow .chip.status` | 495 | — | 1 |
| `.chip .x` | 806 | — | 6 |
| `.chip .x:hover` | 807 | — | 1 |
| `.metarow #labelSlot:has(.labeledit-row)` | 810 | — | 2 |
| `.alert.tone-black .ic` | 872 | — | 1 |
| `.alert .atxt b .amsg-when` | 898 | — | 2 |
| `.alert.tone-black .atxt b .amsg-when` | 899 | — | 1 |
| `.licmodal .alert.tone-black .atxt b .amsg-when` | 900 | — | 1 |
| `.alert.tone-black .atxt b` | 901 | — | 1 |
| `.alert.tone-black .aact` | 903 | — | 1 |
| `.alert.tone-black .link` | 906 | — | 1 |
| `.alert.tone-black .btn:focus-visible` | 907 | — | 1 |
| `.alert .amsg` | 918 | — | 2 |
| `.licmodal .alert.tone-red` | 938 | — | 2 |
| `.licmodal .alert.tone-black` | 938 | — | 2 |
| `.licmodal .alert .btn--secondary` | 948 | — | 1 |
| `.licmodal .alert .btn--menu` | 948 | — | 1 |
| `.licmodal .alert.tone-black .atxt b` | 961 | — | 1 |
| `.licmodal .alert.tone-black .aact` | 963 | — | 1 |
| `.licmodal .alert.tone-black .link` | 963 | — | 1 |
| `.licmodal .alert.tone-black .btn:focus-visible` | 966 | — | 1 |
| `.licmodal .alert.tone-black .ic` | 969 | — | 1 |
| `.btn--sm .btn-spin` | 1221 | — | 3 |
| `.sh .n` | 1318 | — | 10 |
| `.lic-titlerow:has(> .titlecount) > .inst-hint` | 1642 | — | 1 |
| `.nl-creditrow div:last-child` | 1733 | — | 1 |
| `.row .l` | 1778 | — | 2 |
| `.row .r` | 1779 | — | 6 |
| `.inline input` | 1786 | — | 7 |
| `body[data-tableframe] .licmodal .section > .gridtbl:not(.plantable)` | 2244 | — | 4 |
| `body[data-tableframe] .licmodal .section > .tablescroll` | 2244 | — | 4 |
| `body[data-tableframe] .licmodal .insttype > .gridtbl` | 2244 | — | 4 |
| `.listcard.listframe .feed + .pager` | 2387 | — | 6 |
| `.listframe .feed + .pager` | 2387 | — | 6 |
| `.seg label` | 2768 | — | 3 |
| `.seg input` | 2769 | — | 3 |
| `.seg span` | 2770 | — | 7 |
| `.seg label:first-child span` | 2771 | — | 1 |
| `.seg input:focus-visible + span` | 2773 | — | 2 |
| `.nl-plansum > .nl-backrow` | 3025 | — | 1 |
| `.nl-plansum-ic .ic` | 3036 | — | 2 |
| `.fs-screen .fs-col .am-sechead h4` | 3108 | — | 1 |
| `#nlStepBill .fs-col > .am-sec` | 3248 | — | 1 |
| `#nlStepBill .fs-col > .am-sec:last-child` | 3249 | — | 1 |
| `.nl-keybox code` | 3524 | — | 4 |
| `#nlModal .nl-keybox` | 3565 | — | 1 |
| `#nlModal .nl-effect` | 3565 | — | 1 |
| `.nl-prodcard .ic` | 3728 | — | 2 |
| `.usersbody .pager` | 3898 | — | 2 |
| `.dbrand .mark` | 4056 | — | 9 |
| `.ig-btn[aria-expanded="false"] .ig-chev` | 4362 | — | 1 |
| `.ig-name b` | 4368 | — | 2 |
| `.dprofmenu button .who` | 4692 | — | 2 |
| `.dwelcome + .gbanner` | 5211 | — | 1 |
| `.dblock-head .sp` | 5218 | — | 1 |
| `.lcard .btn--secondary` | 5490 | — | 1 |
| `.homebanner .gb-x` | 5782 | ≤600 | 3 |
| `.listframe > .lic-h1` | 6273 | — | 2 |
| `.invite-msg b` | 6718 | — | 2 |
| `.authlocked input` | 6734 | — | 4 |
| `.authlocked input:focus` | 6735 | — | 1 |
| `.nl-couponrow .nl-couponfield` | 6832 | — | 4 |
| `.nl-couponrow .field` | 6833 | — | 3 |
| `.nl-couponrow .field input` | 6834 | — | 2 |
| `.nl-couponrow .btn` | 6837 | — | 1 |
| `.nl-couponrow [data-couponcancel]` | 6838 | — | 2 |
| `.am-newmonthly .was` | 6854 | — | 5 |
| `.am-newmonthly .now` | 6856 | — | 1 |
| `td.noresults-cell .noresults` | 6897 | — | 1 |
| `.feed > .emptybox.eb` | 6948 | — | 1 |
| `.user-pending td` | 7030 | — | 1 |
| `.pagehead .lic-h1` | 7218 | — | 1 |
| `.pagehead .sp` | 7219 | — | 1 |
| `.fsheet-opt--multi .cc-check` | 7393 | — | 1 |
| `.fsheet-extra .perrow` | 7409 | — | 3 |
| `.fsheet-extra input[type="date"]` | 7410 | — | 10 |
| `.fsheet-extra .permid` | 7413 | — | 2 |
| `tr.inv-row .btn--menu` | 7560 | — | 1 |
| `tr.inst-row .btn--secondary` | 7560 | — | 1 |
| `.licstat-txt .alertic` | 7578 | — | 1 |
| `.sg-presframe.a .sg-preswork` | 7678 | — | 2 |
| `.sg-presframe.b .sg-preswork` | 7679 | — | 1 |
| `#licensesList .liccards > .emptybox` | 7825 | ≤600 | 1 |
| `#licensesList .liccards > .noresults` | 7825 | ≤600 | 1 |
| `#licensesList .liccards:has(> .emptybox)` | 7827 | ≤600 | 1 |
| `#licensesList .liccards:has(> .noresults)` | 7827 | ≤600 | 1 |
| `#homeCards .hc-more .blockmore-go` | 7858 | ≤600 | 2 |
| `body[data-page="users"] .tb-refresh` | 7989 | ≤600 | 1 |
| `.menu .pop [data-installmenu]` | 8011 | ≤600 | 1 |
| `tr.instg-row > td:nth-child(1)` | 8148 | ≤600 | 2 |
| `tr.instg-row > td:nth-child(2)` | 8149 | ≤600 | 2 |
| `tr.instg-row > td:nth-child(3)` | 8150 | ≤600 | 2 |
| `tr.instg-row > td:nth-child(4)` | 8151 | ≤600 | 4 |
| `tr.instgroup > td` | 8154 | ≤600 | 4 |
| `tr.user-pending > td.cellact` | 8201 | ≤600 | 1 |
| `#subAlert .amsg` | 8376 | ≤600 | 4 |
| `#subAlert .atxt b` | 8381 | ≤600 | 1 |
| `#subAlert .aact` | 8387 | ≤600 | 8 |
| `#subAlert .aact-long` | 8391 | ≤600 | 1 |
| `#subAlert .aact-short` | 8392 | ≤600 | 1 |
| `.head .hairline` | 8446 | ≤600 | 1 |
| `.plangroups[data-bill="perpetual"] .plangroup[data-bill="subscription"]` | 8687 | ≤600 | 1 |
| `.rowactions .link` | 8706 | ≤600 | 3 |
| `.listframe > .pagetitlerow` | 8805 | ≤600 | 2 |
| `.listframe > .feedmore` | 8805 | ≤600 | 2 |
| `.listframe > .emptybox` | 8805 | ≤600 | 2 |
| `.listframe > .noresults` | 8805 | ≤600 | 2 |
| `.pagehead.pagetitlerow .sp` | 8840 | ≤600 | 1 |
| `.inviterow .invite-link` | 8937 | ≤600 | 2 |
| `.insttoolbar .barapplied > *` | 9070 | ≤600 | 1 |
| `not by writing an override under them — an override would leave two statements about one field` | 9097 | ≤600 | 2 |
| `tr.lic-row .licstat > .pill` | 9296 | ≤600 | 3 |
| `tr.inv-row .lic-prodlabel` | 9436 | ≤600 | 1 |
| `.rowactions .mob-only` | 9465 | ≤600 | 1 |
| `.lic-controls .lic-typeseg` | 9515 | ≤600 | 1 |
| `.insttable .mob-only` | 9531 | ≤600 | 1 |
| `.faq-a ul:last-child` | 9676 | — | 1 |
| `.faq-a ul` | 9677 | — | 2 |
| `.faq-a li` | 9678 | — | 1 |
| `.faq-a b` | 9679 | — | 2 |

---

## How much of `VALUES.md` describes nothing

For each axis: how many distinct values exist, how many of them appear **only** in group 2 and
group 3 selectors, and what share of all occurrences those dead selectors account for.

| axis | distinct values | of those, only in dead rules | occurrences | from dead rules | share |
|---|---:|---:|---:|---:|---:|
| breakpoint | 9 | 0 | 1860 | 133 | 7.2% |
| spacing | 63 | 0 | 1677 | 178 | 10.6% |
| border-width | 8 | 0 | 411 | 34 | 8.3% |
| font-size | 13 | 0 | 308 | 38 | 12.3% |
| radius | 15 | 0 | 308 | 19 | 6.2% |
| colour | 79 | 1 | 250 | 19 | 7.6% |
| icon-size | 8 | 1 | 144 | 12 | 8.3% |
| line-height | 25 | 2 | 137 | 9 | 6.6% |
| font-weight | 13 | 0 | 132 | 17 | 12.9% |
| letter-spacing | 14 | 1 | 69 | 5 | 7.2% |
| font-family | 4 | 0 | 52 | 3 | 5.8% |
| z-index | 17 | 0 | 41 | 0 | 0.0% |
| box-shadow | 26 | 0 | 37 | 0 | 0.0% |
| duration | 10 | 0 | 30 | 1 | 3.3% |
| easing | 3 | 0 | 15 | 1 | 6.7% |
| **all axes** | | **5** | **5471** | **469** | **8.6%** |

Two notes on units. **Icon sizes** are counted here as `var(--ic-*)` reads plus `--ic-*`
definitions — 144 occurrences, where `VALUES.md` counts 174 under a slightly wider rule; the
*share* is computed consistently within this report either way. **Breakpoints** are counted
here as declarations sitting inside a `@media` block (1,860), not as `@media` blocks
(`VALUES.md` counts 39 of those) — a breakpoint cannot itself be dead, so the question asked
here is what fraction of the CSS under each breakpoint belongs to a dead selector.

**The answer is: very little of the inventory describes nothing.**

Dead selectors carry **469 of 5,471 axis occurrences — 8.6%**. But across all fifteen axes,
only **five distinct values** exist nowhere except in a dead rule:

| value | axis | the only rules that carry it | line |
|---|---|---|---:|
| `1.1` | line-height | `.brand .bt`, `.dbrand .bt` | 375, 4057 |
| `inherit` | line-height | `#subAlert .atxt b` (≤600) | 8381 |
| `rgba(255,255,255,.35)` | colour | `.nl-spin` (via `border`) | 3517 |
| `.02em` | letter-spacing | `.nl-keybox code` | 3524 |
| `var(--ic-30)` | icon size | `.iconbutton` — the superseded shell | 389 |

Everything else the dead rules say — all 63 spacing values, all 13 font sizes, all 15 radii,
78 of 79 colours — is also said by rules that match. `--ic-30` is the only *token* the
inventory carries that nothing live reads: it sizes `.iconbutton`, part of the superseded shell.

So deleting every selector in groups 2 and 3 would remove 628 declarations and shrink the
inventory by exactly five values.

That is the useful finding for the next session: **the inventory is not inflated by dead code.**
Its size is real. If `VALUES.md` shows 63 distinct spacing values, 63 spacing values are
genuinely in use — the cleanup there is a consolidation problem, not a deletion problem.

Two axes are carried entirely by live rules: `z-index` and `box-shadow`, 0 occurrences from
dead selectors.

---

## Two things found in passing

**1. The malformed comment at `styles.css:9088` is confirmed from a second direction.**
One "selector" in group 3 is the sentence

> not by writing an override under them — an override would leave two statements about one field

The census read it as a descendant selector because it sits outside any comment, and the
browser accepted it. Three further fragments of the same prose were rejected outright. This is
the defect already recorded: the browser consumes 824 characters as a selector up to the next
`{`, and drops the rule that follows —

```css
.lic-controls .searchbox input::-webkit-search-cancel-button,
.lic-controls .searchbox input::-webkit-search-decoration{-webkit-appearance:none;appearance:none}
```

so WebKit's ✕ suppression on the Licenses page has never been in effect. `csscheck.py` reports
`css ok` because the braces balance. Not fixed here.

**2. `@keyframes` stops were being counted as selectors.** `from` and `to` were reaching the
census as probes and landing in group 1. They are animation stops, not selectors, and could
never match anything. `tools/classify-dead.py` now drops them; the counts above exclude them.
Five percentage stops (`0%`, `50%` …) were already being rejected by the browser.

---

## What this report does not claim

- **Group 1 is not a deletion list.** It is a list of states this run did not reach. Three of
  its largest clusters exist because `tableframe`, `mesh` and grouped mode were not driven.
- **Group 3 is softer than group 2.** A group 3 selector may start matching the day the markup
  changes shape; a group 2 selector cannot, short of someone writing the class.
- Only four widths were used (1280, 601, 600, 390). A rule living only between 601 and 1279 —
  there are media queries at 1150, 944, 760 and 700 — would be reported as matching if it
  matched at 1280, but a rule gated to a band none of the four widths falls in was not tested
  at its own width.
- `:hover`, `:focus-visible` and `:active` were probed as the **element**, not the state: the
  census strips dynamic pseudo-classes so the element behind them is tested. A selector that
  matched this way is reported as matching even though its styling was never seen.

## Reproducing

```bash
python3 tools/selector-census.py          # styles.css -> tools/selectors.json
# then, with the dev server up, run tools/dead-selectors.js in the browser
# -> tools/unmatched.json
python3 tools/classify-dead.py            # -> tools/dead-report.json
```

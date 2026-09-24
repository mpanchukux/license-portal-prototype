# AUDIT — design values in the prototype

Machine-produced by `tools/audit-tokens.py`. Nothing here was hand-counted; see **How to re-run** at the end for the exact command and for the reading rules that decide what counts as a value.

> This file is an audit. It proposes nothing and changes nothing. The final section, **Рішення**, is left empty on purpose.

Counts were cross-checked against independent greps over the comment-stripped sheet while the script was being written; where the two disagreed the disagreement was traced before either was trusted. One worth knowing about: a naive `\bwhite\b` over the file finds 45 more "whites" than this audit does, and all 45 are the word `white-space`.

## Summary

| | count |
|---|---|
| Files read | 33 (1 CSS · 14 HTML · 18 JS) |
| Tokens declared | **88** |
| Tokens referenced at least once | **78** |
| Tokens declared and never referenced | **2** |
| Tokens reached only through a computed name | 8 |
| Tokens referenced but never declared | **3** |
| Tokens declared more than once | 11 |
| Values shared by two or more tokens | 16 groups |
| Total `var()` references | 1179 |
| Distinct raw literals bypassing the system | **421** |
| Raw literal occurrences | **1998** |
| Distinct `@media` breakpoints | **10** |
| Distinct box/text shadows | 14 |
| Near-duplicate clusters | **37** |

Raw literals by property family:

| family | distinct values | occurrences |
|---|---|---|
| spacing | 140 | 660 |
| gap | 24 | 208 |
| font-size | 12 | 194 |
| icon-size | 51 | 161 |
| border-width | 13 | 161 |
| radius | 10 | 137 |
| colour | 30 | 136 |
| layout-size | 72 | 89 |
| line-height | 12 | 68 |
| font-weight | 5 | 65 |
| z-index | 19 | 33 |
| opacity | 9 | 30 |
| duration | 11 | 24 |
| easing | 3 | 14 |
| font-family | 3 | 9 |
| letter-spacing | 7 | 9 |

## List A — declared and unused

2 of 88 declared tokens are never referenced by a `var()` anywhere in the prototype — neither statically nor through a computed name (see A0).

| token | value | declared in |
|---|---|---|
| `--pg-start` | `' + pos.start + '` | `components.js`:1613 — `inline style` |
| `--pg-cols` | `total` | `components.js`:1678 — `setProperty (runtime)` |

### A0 — reached ONLY through a computed name

Not unused, but not statically referenced either: `styleguide.js` assembles `var(--t-<tier>-fs)` and friends for every tier it prints, so these are read by the page that documents the system and by nothing else. A grep would have called them dead; they are not. Whether a token used only by its own documentation is still part of the system is a judgement, not a count.

| token | value | declared in | reached from |
|---|---|---|---|
| `--t-body-sm-fw` | `400` | `styles.css`:59 | `styleguide.js`:76 |
| `--t-body-sm-ls` | `0` | `styles.css`:59 | `styleguide.js`:76 |
| `--t-display-fs` | `64px` | `styles.css`:41 | `styleguide.js`:75 |
| `--t-display-fw` | `700` | `styles.css`:41 | `styleguide.js`:76 |
| `--t-display-lh` | `1.00` | `styles.css`:41 | `styleguide.js`:75 |
| `--t-display-ls` | `-0.035em` | `styles.css`:41 | `styleguide.js`:76 |
| `--t-h1-sm-fw` | `700` | `styles.css`:57 | `styleguide.js`:76 |
| `--t-h1-sm-ls` | `-0.025em` | `styles.css`:57 | `styleguide.js`:76 |

### A1 — declared in more than one place

Two kinds are mixed here and they are not the same thing. A second declaration inside an `@media` is an **override** — the intended way a token changes at a breakpoint. A second declaration under a different selector at the same level is a **collision**: one name carrying two unrelated decisions. The `@media` column is what tells them apart.

| token | kind | declarations |
|---|---|---|
| `--btnH` | override | `40px` in `styles.css`:26 (`:root`) · `44px` in `styles.css`:2867 (`:root` inside `@media (max-width:600px)`) |
| `--backW` | override | `40px` in `styles.css`:27 (`:root`) · `44px` in `styles.css`:2867 (`:root` inside `@media (max-width:600px)`) |
| `--contentX` | override | `74px` in `styles.css`:27 (`:root`) · `22px` in `styles.css`:2867 (`:root` inside `@media (max-width:600px)`) |
| `--pageX` | override | `24px` in `styles.css`:37 (`:root`) · `16px` in `styles.css`:2867 (`:root` inside `@media (max-width:600px)`) |
| `--pageY` | override | `28px` in `styles.css`:37 (`:root`) · `20px` in `styles.css`:2867 (`:root` inside `@media (max-width:600px)`) |
| `--blob` | override | `clamp(420px,57%,620px)` in `styles.css`:1622 (`.meshbg`) · `clamp(230px,82%,330px)` in `styles.css`:1699 (`.meshbg` inside `@media (max-width:600px)`) |
| `--y1` | override | `30px` in `styles.css`:1623 (`.meshbg`) · `24px` in `styles.css`:1700 (`.meshbg` inside `@media (max-width:600px)`) |
| `--y2` | override | `20px` in `styles.css`:1623 (`.meshbg`) · `16px` in `styles.css`:1700 (`.meshbg` inside `@media (max-width:600px)`) |
| `--y3` | override | `210px` in `styles.css`:1623 (`.meshbg`) · `140px` in `styles.css`:1700 (`.meshbg` inside `@media (max-width:600px)`) |
| `--y4` | override | `160px` in `styles.css`:1623 (`.meshbg`) · `108px` in `styles.css`:1700 (`.meshbg` inside `@media (max-width:600px)`) |
| `--s-own` | collision | `10px` in `styles.css`:3508 (`#nlStepPick` inside `@media (max-width:600px)`) · `16px` in `styles.css`:3867 (`.setgrid` inside `@media (max-width:600px)`) |

### A2 — different tokens, identical value

| value | tokens | uses each |
|---|---|---|
| `24px` | `--pageX`, `--ic-24`, `--stripH`, `--s-sec` | 19, 28, 2, 1 |
| `500` | `--t-h2-fw`, `--t-label-fw`, `--t-h2-sm-fw`, `--t-em-fw` | 17, 11, 4, 5 |
| `12px` | `--backGap`, `--s-card`, `--cardpad` | 2, 2, 11 |
| `28px` | `--pageY`, `--t-h1-sm-fs`, `--s-grp` | 2, 2, 3 |
| `700` | `--t-display-fw`, `--t-h1-fw`, `--t-h1-sm-fw` | 0, 5, 0 |
| `20px` | `--t-h2-fs`, `--ic-20`, `--y2` | 17, 30, 1 |
| `16px` | `--t-body-fs`, `--ic-16`, `--headX` | 9, 48, 5 |
| `0` | `--t-body-ls`, `--t-small-ls`, `--t-body-sm-ls` | 2, 7, 0 |
| `400` | `--t-body-fw`, `--t-small-fw`, `--t-body-sm-fw` | 1, 5, 0 |
| `14px` | `--t-small-fs`, `--t-label-fs`, `--s-field` | 19, 12, 2 |
| `40px` | `--btnH`, `--backW` | 31, 2 |
| `64px` | `--t-display-fs`, `--bnavH` | 0, 6 |
| `-0.025em` | `--t-h1-ls`, `--t-h1-sm-ls` | 5, 0 |
| `1.20` | `--t-label-lh`, `--t-h2-sm-lh` | 10, 5 |
| `18px` | `--t-h2-sm-fs`, `--pg-pad` | 6, 2 |
| `10px` | `--pg-cardgap`, `--s-own` | 2, 3 |

### A3 — referenced but never declared

Not asked for, but it is the same bookkeeping and it is the kind of thing that fails silently: `var()` falls back or resolves to nothing.

| token | has a `var()` fallback | referenced from |
|---|---|---|
| `--ic-30` | **no** | `styles.css`:143 |
| `--ic-44` | **no** | `styles.css`:4050 |
| `--t-h3-fs` | yes | `styles.css`:1890 |

Without a fallback the declaration is simply dropped by the browser, so the property falls back to its initial value. With a fallback it works and the token is decorative.


### A4 — `var()` with a computed token name

These build the token name at runtime, so no static reading can tell which tokens they reach. They are excluded from A3 rather than reported as undeclared.

| where | pattern | matches | source |
|---|---|---|---|
| `styleguide.js`:75 | `--t-…-fs` | 9 | `var style = 'font-size:var(--t-' + k + '-fs);line-height:var(--t-' + k + '-l` |
| `styleguide.js`:75 | `--t-…-lh` | 9 | `var style = 'font-size:var(--t-' + k + '-fs);line-height:var(--t-' + k + '-l` |
| `styleguide.js`:76 | `--t-…-ls` | 9 | `+ 'letter-spacing:var(--t-' + k + '-ls);font-weight:var(--t-' + k + '-fw);'` |
| `styleguide.js`:76 | `--t-…-fw` | 10 | `+ 'letter-spacing:var(--t-' + k + '-ls);font-weight:var(--t-' + k + '-fw);'` |

## List B — raw values that bypass the system

Grouped by property family, sorted by how often each value appears. The third column names every token that happens to hold the same value. ⚠️ It is a VALUE match, not a semantic one: a `10px` radius matching a `10px` spacing token does not mean a radius token exists, it means the two numbers are equal. For colours the match is usually meaningful; for lengths, read it as a hint. Values with no match are ones for which a token arguably *should* exist — that judgement is not made here.

### spacing — 660 occurrences over 40 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `12px` | 75 | `--backGap`, `--s-card`, `--cardpad` | margin, margin-bottom, margin-left, margin-top, padding, … | `styleguide.html`:262,298,302,303,305,663,698,750,760,795 · `styles.css`:232,258,277,301,317,327,369,545,553,589,600,738,744,747,+46 more |
| `14px` | 67 | `--t-small-fs`, `--t-label-fs`, `--s-field` | margin, margin-bottom, margin-left, margin-top, padding, … | `page-account.js`:74 · `styleguide.html`:502,1041,1061,1088 · `styles.css`:216,234,282,317,469,585,736,740,787,793,818,854,975,1034,+44 more |
| `10px` | 65 | `--pg-cardgap`, `--s-own` | margin, margin-bottom, margin-left, margin-top, padding, … | `styleguide.html`:924 · `styles.css`:131,132,229,318,375,426,571,575,589,653,757,788,828,1065,+48 more |
| `16px` | 64 | `--t-body-fs`, `--ic-16`, `--headX` | margin, margin-bottom, margin-left, margin-right, … | `styleguide.html`:298,302,303 · `styles.css`:127,309,317,393,545,585,679,730,740,743,744,787,983,1026,+40 more |
| `8px` | 52 | — | margin, margin-bottom, margin-left, margin-top, padding, … | `styleguide.html`:293,316,352,923,924 · `styles.css`:131,132,240,390,391,426,595,648,675,828,829,858,931,1055,+31 more |
| `2px` | 42 | — | margin, margin-bottom, margin-left, margin-top, padding, … | `styles.css`:200,243,252,571,590,631,732,787,861,989,1148,1203,1307,1507,+27 more |
| `6px` | 42 | — | margin, margin-bottom, margin-left, margin-right, … | `license-details.js`:710 · `styles.css`:84,145,198,242,497,600,653,698,864,876,1006,1009,1136,1142,+27 more |
| `18px` | 33 | `--t-h2-sm-fs`, `--pg-pad` | margin, margin-bottom, margin-top, padding, padding-left, … | `license-details.js`:337 · `styleguide.html`:154,178,293,316 · `styles.css`:138,300,309,553,655,730,812,983,1140,1351,1732,1739,1792,2070,+11 more |
| `4px` | 30 | — | margin, margin-bottom, margin-left, margin-right, … | `account.html`:62 · `styles.css`:213,451,552,589,609,696,698,861,866,1052,1060,1507,1536,1734,+15 more |
| `22px` | 23 | — | margin, margin-bottom, margin-left, margin-right, … | `styleguide.html`:352,923 · `styles.css`:84,169,312,696,745,942,948,1026,1216,1304,1366,1368,2420,2558,+3 more |
| `20px` | 22 | `--t-h2-fs`, `--ic-20`, `--y2` | margin, margin-top, padding, padding-bottom, padding-left, … | `styles.css`:169,205,706,721,983,1140,1216,1291,1340,1739,1792,1873,1883,2244,+7 more |
| `24px` | 22 | `--pageX`, `--ic-24`, `--stripH`, `--s-sec` | margin, margin-bottom, margin-top, padding, padding-top | `styles.css`:84,964,1017,1122,1125,1159,1170,1276,1291,1539,1551,1552,1747,2558,+7 more |
| `5px` | 17 | — | margin, margin-left, margin-top, padding, padding-bottom | `styles.css`:151,415,420,485,571,672,861,1710,2018,2513,2705,2741,2791,4143,+2 more |
| `3px` | 14 | — | margin, margin-left, margin-top, padding | `styles.css`:145,193,203,258,602,856,864,866,1810,2040,2521,2816,2848,4346 |
| `9px` | 14 | — | margin-bottom, margin-top, padding | `styles.css`:153,243,277,415,420,642,752,794,808,1122,1157,1541,2012 |
| `13px` | 9 | — | margin-top, padding, padding-bottom, padding-top | `styles.css`:283,391,964,2019,2157,2647,4187,4338 |
| `7px` | 8 | — | padding, padding-bottom | `styles.css`:153,571,876,1479,1767,2023,2521,3917 |
| `11px` | 6 | — | padding | `styles.css`:213,301,793,818,1775 |
| `-4px` | 5 | — | margin, margin-left | `styles.css`:497,631,3358 |
| `28px` | 5 | `--pageY`, `--t-h1-sm-fs`, `--s-grp` | margin-top, padding | `styles.css`:1000,1131,1275,1333,3159 |
| `34px` | 5 | — | margin-top, padding | `styles.css`:291,677,941,2432,2762 |
| `15px` | 4 | `--t-body-sm-fs` | padding, padding-bottom, padding-top | `styles.css`:1739,2070,2140 |
| `1px` | 4 | — | margin-top, padding | `styles.css`:648,756,1219,2093 |
| `32px` | 4 | — | margin-top, padding | `styles.css`:1154,2633,2893,4375 |
| `-10px` | 3 | — | margin-left, margin-right | `styles.css`:3242,3347,3359 |
| `-1px` | 3 | — | margin, margin-bottom, margin-top | `styles.css`:301,527,801 |
| `40px` | 3 | `--btnH`, `--backW` | margin-top, padding | `styles.css`:683,1154,2068 |
| `44px` | 3 | — | margin-top, padding, padding-right | `styles.css`:91,3078,4300 |
| `26px` | 2 | — | margin, margin-bottom | `styles.css`:1186,1803 |
| `30px` | 2 | `--y1` | padding | `styles.css`:1131,1333 |
| `38px` | 2 | `--fs-inset` | padding, padding-right | `styles.css`:1154,2317 |
| `80px` | 2 | — | padding | `styles.css`:1397,2756 |
| `-14px` | 1 | — | margin | `styles.css`:1034 |
| `-16px` | 1 | — | margin | `styles.css`:1026 |
| `-24px` | 1 | — | margin | `styles.css`:2564 |
| `-6px` | 1 | — | margin-left | `styles.css`:2933 |
| `110px` | 1 | — | padding | `styles.css`:4094 |
| `19px` | 1 | — | margin-top | `styles.css`:2545 |
| `36px` | 1 | `--t-h1-fs` | padding-right | `styles.css`:2642 |
| `48px` | 1 | — | padding-top | `styles.css`:1560 |

### gap — 208 occurrences over 19 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `8px` | 50 | — | column-gap, gap | `styles.css`:85,145,212,221,228,257,369,400,531,565,646,651,744,866,+36 more |
| `12px` | 36 | `--backGap`, `--s-card`, `--cardpad` | column-gap, gap, row-gap | `styles.css`:177,216,327,338,584,590,642,665,750,964,1039,1125,1205,1343,+22 more |
| `10px` | 35 | `--pg-cardgap`, `--s-own` | column-gap, gap | `styles.css`:132,177,193,363,603,612,679,740,747,754,817,1122,1157,1268,+21 more |
| `14px` | 24 | `--t-small-fs`, `--t-label-fs`, `--s-field` | gap | `styles.css`:138,180,340,696,967,987,1212,1215,1396,1447,1792,1873,2093,2472,+10 more |
| `6px` | 10 | — | gap | `styles.css`:243,757,991,1448,1468,1811,2111,2660,3838,4367 |
| `16px` | 9 | `--t-body-fs`, `--ic-16`, `--headX` | gap | `styles.css`:684,788,807,831,1057,1186,1707,1966,3478 |
| `2px` | 9 | — | gap, row-gap | `styles.css`:131,300,513,1467,1889,3091,3111,3973,4281 |
| `4px` | 7 | — | gap | `styles.css`:700,1228,2537,2727,3077,3100,4284 |
| `9px` | 6 | — | gap | `styles.css`:127,263,277,282,1507,2644 |
| `18px` | 4 | `--t-h2-sm-fs`, `--pg-pad` | gap | `styles.css`:1129,2598,2803,3106 |
| `5px` | 4 | — | gap | `styles.css`:375,1754,2722,4209 |
| `7px` | 4 | — | gap | `styles.css`:213,829,1325,2770 |
| `24px` | 3 | `--pageX`, `--ic-24`, `--stripH`, `--s-sec` | gap | `styles.css`:234,1018,4305 |
| `1px` | 2 | — | gap | `styles.css`:863,870 |
| `20px` | 1 | `--t-h2-fs`, `--ic-20`, `--y2` | gap | `styles.css`:2792 |
| `22px` | 1 | — | gap | `styles.css`:1248 |
| `26px` | 1 | — | gap | `styles.css`:1029 |
| `34px` | 1 | — | gap | `styles.css`:1883 |
| `3px` | 1 | — | gap | `styles.css`:3916 |

### font-size — 194 occurrences over 12 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `14px` | 148 | `--t-small-fs`, `--t-label-fs`, `--s-field` | font-size | `styleguide.html`:299,302,303 · `styles.css`:85,129,130,132,141,147,148,153,200,203,213,229,230,243,+131 more |
| `13px` | 15 | — | font-size | `styles.css`:516,575,613,618,619,731,824,2104,2112,2114,2482,2771,2776,2777,+1 more |
| `16px` | 10 | `--t-body-fs`, `--ic-16`, `--headX` | font-size | `styles.css`:291,762,919,1229,1249,3307,3333,3416,3775,3782 |
| `14.5px` | 4 | — | font-size | `styleguide.html`:657,686,692 · `styles.css`:752 |
| `15px` | 4 | `--t-body-sm-fs` | font-size | `styles.css`:183,267,973,1158 |
| `18px` | 3 | `--t-h2-sm-fs`, `--pg-pad` | font-size | `components.js`:2349 · `styles.css`:149,732 |
| `12px` | 2 | `--backGap`, `--s-card`, `--cardpad` | font-size | `styles.css`:2791,2793 |
| `19px` | 2 | — | font-size | `styles.css`:3404,3720 |
| `20px` | 2 | `--t-h2-fs`, `--ic-20`, `--y2` | font-size | `styles.css`:3382,3686 |
| `22px` | 2 | — | font-size | `styles.css`:586,3689 |
| `17px` | 1 | — | font-size | `styles.css`:4001 |
| `28px` | 1 | `--pageY`, `--t-h1-sm-fs`, `--s-grp` | font-size | `styles.css`:666 |

### icon-size — 161 occurrences over 28 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `44px` | 42 | — | height, min-height, width | `styleguide.html`:925,926,927 · `styles.css`:849,2933,2948,2960,2966,2970,3006,3012,3033,3142,3241,3351,3381,3402,+13 more |
| `1px` | 10 | — | height, width | `styles.css`:232,527,1352,1536,1743,2973,3837 |
| `24px` | 10 | `--pageX`, `--ic-24`, `--stripH`, `--s-sec` | height, width | `styles.css`:147,224,784,989,1226 |
| `26px` | 9 | — | height, width | `styles.css`:128,229,1418,1544,1837,1860,3921 |
| `48px` | 9 | — | height, min-height, width | `styles.css`:2611,3416,3492,3732,3782,3787,3851,4270 |
| `28px` | 8 | `--pageY`, `--t-h1-sm-fs`, `--s-grp` | height, width | `styles.css`:608,823,2481,3134 |
| `40px` | 7 | `--btnH`, `--backW` | height, min-height, width | `styles.css`:767,774,2686,3830,3848,3996 |
| `16px` | 6 | `--t-body-fs`, `--ic-16`, `--headX` | height, width | `styles.css`:483,775,2404 |
| `20px` | 6 | `--t-h2-fs`, `--ic-20`, `--y2` | height, width | `styles.css`:370,1219,1479,2525 |
| `56px` | 6 | — | height, width | `styles.css`:291,783,1396,2774,2876,2909 |
| `14px` | 5 | `--t-small-fs`, `--t-label-fs`, `--s-field` | height, width | `styles.css`:676,758,2788 |
| `30px` | 5 | `--y1` | height, width | `styles.css`:783,973,2637 |
| `36px` | 5 | `--t-h1-fs` | height, width | `styleguide.html`:924 · `styles.css`:918,2880,3003 |
| `17px` | 4 | — | height, width | `styles.css`:1066,1067 |
| `22px` | 4 | — | height, min-height | `styles.css`:767,774,2010,3837 |
| `32px` | 3 | — | height | `styles.css`:1414,2382,2383 |
| `7px` | 3 | — | height, width | `styles.css`:248,2175 |
| `8px` | 3 | — | height | `styleguide.html`:300 · `styles.css`:396,2209 |
| `10px` | 2 | `--pg-cardgap`, `--s-own` | height, width | `styles.css`:1224 |
| `15px` | 2 | `--t-body-sm-fs` | height, width | `styles.css`:1151 |
| `34px` | 2 | — | width | `styles.css`:675,2525 |
| `38px` | 2 | `--fs-inset` | height, width | `styles.css`:3600 |
| `4px` | 2 | — | height | `styleguide.html`:924 · `styles.css`:3003 |
| `62px` | 2 | — | min-height, width | `styles.css`:2502,2610 |
| `3px` | 1 | — | height | `styles.css`:1120 |
| `46px` | 1 | — | min-width | `styles.css`:765 |
| `52px` | 1 | — | height | `styles.css`:138 |
| `60px` | 1 | — | height | `styles.css`:2791 |

### border-width — 161 occurrences over 5 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `1px` | 138 | — | border, border-bottom, border-left, border-right, … | `styles.css`:126,127,128,132,138,143,145,147,151,168,169,183,213,243,+122 more |
| `2px` | 17 | — | border, border-bottom, border-left, outline | `styles.css`:99,301,482,506,600,637,779,879,1151,1232,1457,1521,2113,2409,+3 more |
| `3px` | 3 | — | border-left | `styles.css`:277,2818,4313 |
| `5px` | 2 | — | border | `styles.css`:431,435 |
| `1.5px` | 1 | — | border | `styles.css`:1220 |

### radius — 137 occurrences over 10 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `6px` | 62 | — | border-radius | `styleguide.html`:68 · `styles.css`:128,132,143,145,151,153,168,183,277,283,375,415,420,480,+44 more |
| `8px` | 27 | — | border-radius | `styleguide.html`:69 · `styles.css`:317,708,818,854,1034,1040,1054,1064,1531,2252,2363,2419,2474,2518,+11 more |
| `10px` | 18 | `--pg-cardgap`, `--s-own` | border-radius | `styleguide.html`:70,298 · `styles.css`:1140,1541,1739,1792,1803,2009,2070,2593,2766,3061,3351,4051,4055 |
| `999px` | 17 | — | border-radius | `styleguide.html`:72,924 · `styles.css`:213,243,258,396,648,774,1450,1480,2647,2760,3003,3839,3848,3921,+1 more |
| `12px` | 6 | `--backGap`, `--s-card`, `--cardpad` | border-radius | `styleguide.html`:71,923 · `styles.css`:959,2998 |
| `4px` | 3 | — | border-radius | `styles.css`:506,2521,2806 |
| `16px` | 1 | `--t-body-fs`, `--ic-16`, `--headX` | border-radius | `styles.css`:1936 |
| `20px` | 1 | `--t-h2-fs`, `--ic-20`, `--y2` | border-radius | `styles.css`:2001 |
| `3px` | 1 | — | border-radius | `styles.css`:99 |
| `5px` | 1 | — | border-radius | `styleguide.html`:67 |

### colour — 136 occurrences over 26 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `#ffffff` | 84 | `--card` | background, border-color, border-top-color, color | `styles.css`:128,147,151,183,213,244,247,251,283,294,370,375,414,419,+69 more |
| `#fafafa` | 6 | — | background | `styles.css`:169,243,655,1157,2239,3199 |
| `#000000 @ 0.16 alpha` | 4 | — | box-shadow | `styleguide.html`:81 · `styles.css`:920,1531,4272 |
| `#000000 @ 0.28 alpha` | 4 | — | box-shadow | `styleguide.html`:83 · `styles.css`:851,959,2475 |
| `#000000` | 3 | — | background, color | `styles.css`:284,387,852 |
| `#000000 @ 0.18 alpha` | 3 | — | box-shadow | `styleguide.html`:82 · `styles.css`:708,854 |
| `#1c1c1c @ 0.32 alpha` | 3 | — | background | `styles.css`:706,883,2581 |
| `#ffffff @ 0.14 alpha` | 3 | — | background | `styles.css`:1845,1864,2484 |
| `#000000 @ 0.1 alpha` | 2 | — | box-shadow | `styles.css`:2705,3483 |
| `#c5c8f7 @ 0 alpha` | 2 | — | background | `styles.css`:1638,1641 |
| `#c5c8f7 @ 0.65 alpha` | 2 | — | background | `styles.css`:1638,1641 |
| `#c5c8f7 @ 0.72 alpha` | 2 | — | background | `styles.css`:1638,1641 |
| `#f4f4f2` | 2 | `--bg` | background | `styles.css`:277,3225 |
| `#fff8e5 @ 0 alpha` | 2 | — | background | `styles.css`:1639,1640 |
| `#fff8e5 @ 0.65 alpha` | 2 | — | background | `styles.css`:1639,1640 |
| `#fff8e5 @ 0.72 alpha` | 2 | — | background | `styles.css`:1639,1640 |
| `#000000 @ 0.05 alpha` | 1 | — | background | `styles.css`:825 |
| `#000000 @ 0.08 alpha` | 1 | — | box-shadow | `styles.css`:151 |
| `#000000 @ 0.14 alpha` | 1 | — | box-shadow | `styleguide.html`:80 |
| `#000000 @ 0.2 alpha` | 1 | — | box-shadow | `styles.css`:2593 |
| `#000000 @ 0.22 alpha` | 1 | — | box-shadow | `styles.css`:3001 |
| `#f6f6f4` | 1 | — | background | `styles.css`:317 |
| `#ffffff @ 0.35 alpha` | 1 | — | border | `styles.css`:1151 |
| `#ffffff @ 0.55 alpha` | 1 | — | border | `styles.css`:1843 |
| `#ffffff @ 0.72 alpha` | 1 | — | color | `styles.css`:1863 |
| `#ffffff @ 0.78 alpha` | 1 | — | color | `styles.css`:1815 |

### layout-size — 89 occurrences over 55 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `16px` | 7 | `--t-body-fs`, `--ic-16`, `--headX` | bottom, left, right | `styles.css`:849,854,3605,3749,4269 |
| `8px` | 6 | — | right, top | `styles.css`:1848,3089,3109 |
| `-18px` | 4 | — | left, right, top | `styles.css`:917,2198,2199 |
| `150px` | 3 | — | min-width, width | `styles.css`:604,2793,3333 |
| `280px` | 3 | — | min-width, width | `styleguide.html`:721,725 · `styles.css`:2631 |
| `300px` | 3 | — | max-height, min-width, width | `styleguide.html`:1030 · `styles.css`:426,2239 |
| `-1px` | 2 | — | bottom | `styleguide.html`:300 · `styles.css`:2209 |
| `-8px` | 2 | — | left, right | `styles.css`:466,639 |
| `11px` | 2 | — | bottom, right | `styles.css`:2319 |
| `120px` | 2 | — | min-height, min-width | `styles.css`:396,2794 |
| `14px` | 2 | `--t-small-fs`, `--t-label-fs`, `--s-field` | right | `styles.css`:430,434 |
| `180px` | 2 | — | min-width, width | `styles.css`:653,2705 |
| `230px` | 2 | — | max-height, max-width | `styles.css`:2694,2797 |
| `250px` | 2 | — | min-width | `styles.css`:2666,2667 |
| `2px` | 2 | — | left, top | `styles.css`:775 |
| `420px` | 2 | — | max-width, width | `styleguide.html`:954 · `styles.css`:2585 |
| `560px` | 2 | — | width | `styles.css`:1153,2593 |
| `6px` | 2 | — | left, right | `styles.css`:467,640 |
| `70ch` | 2 | — | max-width | `styles.css`:2758,2764 |
| `800px` | 2 | — | max-width | `styles.css`:1549,2253 |
| `1040px` | 1 | `--fs-work` | width | `styles.css`:959 |
| `10px` | 1 | `--pg-cardgap`, `--s-own` | left | `styles.css`:2632 |
| `110px` | 1 | — | width | `styles.css`:1055 |
| `12px` | 1 | `--backGap`, `--s-card`, `--cardpad` | left | `styles.css`:2009 |
| `160px` | 1 | `--y4` | min-width | `styles.css`:151 |
| `200px` | 1 | — | height | `styles.css`:1701 |
| `220px` | 1 | — | max-height | `styles.css`:3146 |
| `22ch` | 1 | — | max-width | `styles.css`:472 |
| `232px` | 1 | — | min-width | `styles.css`:1531 |
| `240px` | 1 | — | min-width | `styles.css`:564 |
| `24px` | 1 | `--pageX`, `--ic-24`, `--stripH`, `--s-sec` | bottom | `styles.css`:2471 |
| `252px` | 1 | — | min-width | `styles.css`:2738 |
| `256px` | 1 | — | width | `styles.css`:854 |
| `260px` | 1 | — | width | `styleguide.html`:922 |
| `30ch` | 1 | — | max-width | `styles.css`:618 |
| `36px` | 1 | `--t-h1-fs` | top | `styles.css`:151 |
| `393px` | 1 | — | max-width | `styles.css`:2550 |
| `440px` | 1 | — | width | `styles.css`:1284 |
| `460px` | 1 | — | max-width | `styles.css`:708 |
| `46ch` | 1 | — | max-width | `styles.css`:2434 |
| `4px` | 1 | — | right | `styles.css`:2636 |
| `520px` | 1 | — | max-width | `styleguide.html`:297 |
| `640px` | 1 | — | max-width | `styles.css`:258 |
| `64ch` | 1 | — | max-width | `styles.css`:1720 |
| `70px` | 1 | — | bottom | `styles.css`:854 |
| `720px` | 1 | — | max-width | `styles.css`:1796 |
| `74ch` | 1 | — | max-width | `styles.css`:1254 |
| `74px` | 1 | `--contentX` | height | `styles.css`:2793 |
| `820px` | 1 | — | width | `styles.css`:1290 |
| `82ch` | 1 | — | max-width | `styles.css`:2784 |
| `900px` | 1 | — | max-width | `styles.css`:714 |
| `92px` | 1 | — | width | `styles.css`:2791 |
| `960px` | 1 | — | max-width | `styles.css`:1129 |
| `96px` | 1 | — | min-height | `styleguide.html`:953 |
| `9px` | 1 | — | left | `styles.css`:996 |

### line-height — 68 occurrences over 12 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `1.5` | 16 | — | line-height | `styles.css`:469,552,554,587,743,1144,1156,1809,2093,2236,2239,2364,2396,2434,+2 more |
| `1.45` | 11 | `--t-small-lh` | line-height | `styles.css`:426,861,2054,2298,2303,2344,2405,2479,2496,3238,3569 |
| `1` | 9 | — | line-height | `styles.css`:149,183,267,701,762,824,973,2482,3689 |
| `1.55` | 7 | — | line-height | `styles.css`:993,1060,1133,1254,1365,2784,4290 |
| `1.4` | 6 | — | line-height | `styles.css`:203,575,819,2341,2848,3307 |
| `1.3` | 5 | — | line-height | `styles.css`:513,1891,3999,4001,4287 |
| `1.6` | 4 | — | line-height | `styles.css`:1136,1550,1796,4339 |
| `1.15` | 3 | `--t-h1-sm-lh` | line-height | `styles.css`:368,666,3923 |
| `1.1` | 2 | — | line-height | `styles.css`:129,1419 |
| `1.2` | 2 | — | line-height | `styles.css`:1229,3262 |
| `1.35` | 2 | — | line-height | `styles.css`:1230,4011 |
| `0` | 1 | `--t-body-ls`, `--t-small-ls`, `--t-body-sm-ls` | line-height | `styles.css`:2524 |

### font-weight — 65 occurrences over 5 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `500` | 20 | `--t-h2-fw`, `--t-label-fw`, `--t-h2-sm-fw`, `--t-em-fw` | font-weight | `styles.css`:10,11,515,570,586,617,732,1006,1229,1891,2096,3139,3243,3844,+6 more |
| `600` | 18 | — | font-weight | `styleguide.html`:657 · `styles.css`:134,141,244,280,303,752,790,864,1124,1132,1146,1455,1542,2717,+3 more |
| `400` | 17 | `--t-body-fw`, `--t-small-fw`, `--t-body-sm-fw` | font-weight | `styles.css`:8,9,15,390,578,810,835,1230,1420,2013,2393,2736,2776,3263,+3 more |
| `700` | 9 | `--t-display-fw`, `--t-h1-fw`, `--t-h1-sm-fw` | font-weight | `components.js`:2349 · `styles.css`:12,13,129,147,791,833,1419,2603 |
| `800` | 1 | — | font-weight | `styles.css`:2521 |

### z-index — 33 occurrences over 19 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `20` | 4 | — | z-index | `styles.css`:415,420,431,435 |
| `100` | 3 | — | z-index | `styles.css`:706,883,2581 |
| `12` | 3 | — | z-index | `styles.css`:912,917,2139 |
| `5` | 3 | — | z-index | `styles.css`:2563,2575,3152 |
| `11` | 2 | — | z-index | `styles.css`:2156,2208 |
| `140` | 2 | — | z-index | `styles.css`:3415,3781 |
| `40` | 2 | — | z-index | `styles.css`:151,2705 |
| `400` | 2 | `--t-body-fw`, `--t-small-fw`, `--t-body-sm-fw` | z-index | `styles.css`:838,2472 |
| `95` | 2 | — | z-index | `styles.css`:887,3600 |
| `-1` | 1 | — | z-index | `styles.css`:1625 |
| `1` | 1 | — | z-index | `styles.css`:768 |
| `120` | 1 | — | z-index | `styles.css`:3005 |
| `130` | 1 | — | z-index | `styles.css`:3483 |
| `320` | 1 | — | z-index | `shared.js`:1251 |
| `60` | 1 | — | z-index | `styles.css`:1531 |
| `88` | 1 | — | z-index | `styles.css`:4269 |
| `90` | 1 | — | z-index | `styles.css`:3907 |
| `900` | 1 | — | z-index | `styles.css`:851 |
| `901` | 1 | — | z-index | `styles.css`:854 |

### opacity — 30 occurrences over 9 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `1` | 10 | — | opacity | `styles.css`:569,1055,2181,2183,2211,2477,2484,2511,3603,3845 |
| `0` | 9 | `--t-body-ls`, `--t-small-ls`, `--t-body-sm-ls` | opacity | `styles.css`:568,768,875,1496,2176,2182,2210,2476,3843 |
| `.45` | 5 | — | opacity | `styles.css`:1255,2568,2573,2578,2601 |
| `.5` | 1 | — | opacity | `styles.css`:3601 |
| `.65` | 1 | — | opacity | `styles.css`:485 |
| `.7` | 1 | — | opacity | `styles.css`:2482 |
| `.75` | 1 | — | opacity | `styles.css`:1556 |
| `.78` | 1 | — | opacity | `styles.css`:505 |
| `.82` | 1 | — | opacity | `styles.css`:1841 |

### duration — 24 occurrences over 10 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `0.15s` | 7 | — | transition | `styles.css`:774,776,1756,3602,4331 |
| `0.12s` | 5 | — | transition | `styles.css`:598,2176,2210,3843,3921 |
| `0.18s` | 3 | — | transition | `styles.css`:1496,1684 |
| `0.16s` | 2 | — | transition | `styles.css`:2476 |
| `34s` | 2 | — | animation, animation-duration | `styles.css`:1636,1638 |
| `0.6s` | 1 | — | animation | `styles.css`:382 |
| `0.7s` | 1 | — | animation | `styles.css`:1151 |
| `31s` | 1 | — | animation-duration | `styles.css`:1640 |
| `37s` | 1 | — | animation-duration | `styles.css`:1641 |
| `39s` | 1 | — | animation-duration | `styles.css`:1639 |

### easing — 14 occurrences over 2 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `ease` | 12 | — | animation, transition | `styles.css`:1496,1636,1684,1756,2476,3602,3843,4331 |
| `linear` | 2 | — | animation | `styles.css`:382,1151 |

### font-family — 9 occurrences over 3 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `Ubuntu` | 6 | — | font-family | `styles.css`:8,9,10,11,12,13 |
| `ui-monospace` | 2 | — | font-family | `styles.css`:374,2239 |
| `Ubuntu Mono` | 1 | — | font-family | `styles.css`:15 |

### letter-spacing — 9 occurrences over 7 distinct values

| value | n | a token holds this value | properties | where |
|---|---|---|---|---|
| `.04em` | 2 | — | letter-spacing | `styles.css`:130,731 |
| `.06em` | 2 | — | letter-spacing | `styles.css`:864,2526 |
| `-0.01em` | 1 | `--t-h2-sm-ls` | letter-spacing | `styles.css`:666 |
| `.02em` | 1 | — | letter-spacing | `styles.css`:1158 |
| `.08em` | 1 | — | letter-spacing | `styles.css`:2521 |
| `0.04em` | 1 | — | letter-spacing | `styles.css`:1767 |
| `0.06em` | 1 | — | letter-spacing | `styles.css`:3444 |

### Breakpoints

| condition | n | where |
|---|---|---|
| `max-width: 600px` | 11 | `styles.css`:610,733,1697,1846,2101,2817,2830,3896,4176,4256,4363 |
| `min-width: 601px` | 4 | `styles.css`:906,1101,1901,1930 |
| `max-width: 900px` | 2 | `styles.css`:315,1068 |
| `max-width: 700px` | 1 | `styles.css`:1130 |
| `max-width: 1199px` | 1 | `styles.css`:1465 |
| `max-width: 1080px` | 1 | `styles.css`:1874 |
| `max-width: 760px` | 1 | `styles.css`:1875 |
| `min-width: 1081px` | 1 | `styles.css`:1959 |
| `max-width: 820px` | 1 | `styles.css`:2060 |
| `max-width: 640px` | 1 | `styles.css`:2516 |

## List C — near-duplicates

One cluster per idea. Colour distance is **CIEDE2000** (ΔE00) — a perceptual measure, so it answers "can anyone see this difference" rather than "are the hex codes different". Rough reading: **ΔE00 < 1** is invisible to anyone, **1–2** is visible only side by side to a trained eye, **2–5** is visible when the two are adjacent, **> 5** is plainly two colours. Numeric clusters give the absolute gap.

Counts below combine literal occurrences with `var()` references to a token holding that same value, so a cluster shows the whole weight of each value, not only its raw uses.

### C1 · Colours #dcdcd8–#ffffff — 11 values

| value | uses | where |
|---|---|---|
| `#ffffff` (token `--card`) | 112 | `styleguide.html`:298 · `styles.css`:128,147,151,168,183,213,244,247,251,283,+100 more |
| `#e2e2e2` (token `--line2`) | 81 | `styles.css`:169,232,300,309,317,390,391,396,553,571,+71 more |
| `#f0f0ee` (token `--hover`) | 38 | `styles.css`:133,144,146,154,184,295,376,481,702,763,+28 more |
| `#f4f4f2` (token `--bg`) | 15 | `styles.css`:67,78,84,277,721,959,1375,1539,2092,2317,+5 more |
| `#e4e4e0` (token `--sel`) | 9 | `styles.css`:134,2242,3352,3844,3926,4051,4056,4317,4372 |
| `#dcdcd8` (token `--chromeLine`) | 8 | `styles.css`:126,127,134,138,144,146,2063,3908 |
| `#fafafa` | 6 | `styles.css`:169,243,655,1157,2239,3199 |
| `#e6e6e6` (token `--track`) | 6 | `styles.css`:396,818,1055,1120,2788,2805 |
| `#f4f7fb` (token `--page-bg`) | 3 | `styles.css`:1669,2001,2009 |
| `#efefec` (token `--chrome`) | 2 | `styles.css`:126,138 |
| `#f6f6f4` | 1 | `styles.css`:317 |

Distance:

| pair | ΔE00 |
|---|---|
| `#ffffff` ↔ `#e2e2e2` | **6.05** |
| `#ffffff` ↔ `#f0f0ee` | **3.26** |
| `#ffffff` ↔ `#f4f4f2` | **2.49** |
| `#ffffff` ↔ `#e4e4e0` | **6.06** |
| `#ffffff` ↔ `#dcdcd8` | **7.76** |
| `#ffffff` ↔ `#fafafa` | **1.00** |
| `#ffffff` ↔ `#e6e6e6` | **5.18** |
| `#ffffff` ↔ `#f4f7fb` | **2.75** |
| `#ffffff` ↔ `#efefec` | **3.66** |
| `#ffffff` ↔ `#f6f6f4` | **2.12** |
| `#e2e2e2` ↔ `#f0f0ee` | **3.17** |
| `#e2e2e2` ↔ `#f4f4f2` | **3.96** |
| `#e2e2e2` ↔ `#e4e4e0` | **2.15** |
| `#e2e2e2` ↔ `#dcdcd8` | **2.55** |
| `#e2e2e2` ↔ `#fafafa` | **5.06** |
| `#e2e2e2` ↔ `#e6e6e6` | **0.88** |
| `#e2e2e2` ↔ `#f4f7fb` | **4.90** |
| `#e2e2e2` ↔ `#efefec` | **3.18** |
| `#e2e2e2` ↔ `#f6f6f4` | **4.35** |
| `#f0f0ee` ↔ `#f4f4f2` | **0.83** |
| `#f0f0ee` ↔ `#e4e4e0` | **2.80** |
| `#f0f0ee` ↔ `#dcdcd8` | **4.51** |
| `#f0f0ee` ↔ `#fafafa` | **2.34** |
| `#f0f0ee` ↔ `#e6e6e6` | **2.36** |
| `#f0f0ee` ↔ `#f4f7fb` | **3.43** |
| `#f0f0ee` ↔ `#efefec` | **0.56** |
| `#f0f0ee` ↔ `#f6f6f4` | **1.24** |
| `#f4f4f2` ↔ `#e4e4e0` | **3.59** |
| `#f4f4f2` ↔ `#dcdcd8` | **5.32** |
| `#f4f4f2` ↔ `#fafafa` | **1.65** |
| `#f4f4f2` ↔ `#e6e6e6` | **3.12** |
| `#f4f4f2` ↔ `#f4f7fb` | **3.18** |
| `#f4f4f2` ↔ `#efefec` | **1.18** |
| `#f4f4f2` ↔ `#f6f6f4` | **0.41** |
| `#e4e4e0` ↔ `#dcdcd8` | **1.79** |
| `#e4e4e0` ↔ `#fafafa` | **5.14** |
| `#e4e4e0` ↔ `#e6e6e6` | **2.17** |
| `#e4e4e0` ↔ `#f4f7fb` | **5.75** |
| `#e4e4e0` ↔ `#efefec` | **2.44** |
| `#e4e4e0` ↔ `#f6f6f4` | **3.98** |
| `#dcdcd8` ↔ `#fafafa` | **6.81** |
| `#dcdcd8` ↔ `#e6e6e6` | **3.12** |
| `#dcdcd8` ↔ `#f4f7fb` | **7.12** |
| `#dcdcd8` ↔ `#efefec` | **4.20** |
| `#dcdcd8` ↔ `#f6f6f4` | **5.73** |
| `#fafafa` ↔ `#e6e6e6` | **4.18** |
| `#fafafa` ↔ `#f4f7fb` | **2.29** |
| `#fafafa` ↔ `#efefec` | **2.80** |
| `#fafafa` ↔ `#f6f6f4` | **1.36** |
| `#e6e6e6` ↔ `#f4f7fb` | **4.13** |
| `#e6e6e6` ↔ `#efefec` | **2.46** |
| `#e6e6e6` ↔ `#f6f6f4` | **3.51** |
| `#f4f7fb` ↔ `#efefec` | **3.97** |
| `#f4f7fb` ↔ `#f6f6f4` | **3.13** |
| `#efefec` ↔ `#f6f6f4` | **1.56** |

### C2 · Font sizes 12px–16px — 6 values

| value | uses | where |
|---|---|---|
| `14px` (token `--t-small-fs`, `--t-label-fs`, `--s-field`) | 179 | `styleguide.html`:299,302,303 · `styles.css`:85,129,130,132,141,147,148,153,190,200,+166 more |
| `16px` (token `--t-body-fs`, `--ic-16`, `--headX`) | 19 | `styles.css`:291,762,919,1132,1229,1249,1550,2276,2313,2421,+9 more |
| `13px` | 15 | `styles.css`:516,575,613,618,619,731,824,2104,2112,2114,+5 more |
| `15px` (token `--t-body-sm-fs`) | 15 | `styles.css`:183,267,973,1158,2924,3006,3124,3290,3999,4011,+5 more |
| `14.5px` | 4 | `styleguide.html`:657,686,692 · `styles.css`:752 |
| `12px` (token `--backGap`, `--s-card`, `--cardpad`) | 2 | `styles.css`:2791,2793 |

Distance:

| pair | gap |
|---|---|
| `14px` ↔ `16px` | **2px** |
| `14px` ↔ `13px` | **1px** |
| `14px` ↔ `15px` | **1px** |
| `14px` ↔ `14.5px` | **0.5px** |
| `14px` ↔ `12px` | **2px** |
| `16px` ↔ `13px` | **3px** |
| `16px` ↔ `15px` | **1px** |
| `16px` ↔ `14.5px` | **1.5px** |
| `16px` ↔ `12px` | **4px** |
| `13px` ↔ `15px` | **2px** |
| `13px` ↔ `14.5px` | **1.5px** |
| `13px` ↔ `12px` | **1px** |
| `15px` ↔ `14.5px` | **0.5px** |
| `15px` ↔ `12px` | **3px** |
| `14.5px` ↔ `12px` | **2.5px** |

### C3 · Font sizes 17px–20px — 4 values

| value | uses | where |
|---|---|---|
| `20px` (token `--t-h2-fs`, `--ic-20`, `--y2`) | 19 | `styles.css`:368,647,741,827,966,992,1141,1155,1340,1551,+9 more |
| `18px` (token `--t-h2-sm-fs`, `--pg-pad`) | 9 | `components.js`:2349 · `styles.css`:149,732,1307,2894,2938,3029,3393,3724 |
| `19px` | 2 | `styles.css`:3404,3720 |
| `17px` | 1 | `styles.css`:4001 |

Distance:

| pair | gap |
|---|---|
| `20px` ↔ `18px` | **2px** |
| `20px` ↔ `19px` | **1px** |
| `20px` ↔ `17px` | **3px** |
| `18px` ↔ `19px` | **1px** |
| `18px` ↔ `17px` | **1px** |
| `19px` ↔ `17px` | **2px** |

### C4 · Font sizes 36px–38px — 2 values

| value | uses | where |
|---|---|---|
| `36px` (token `--t-h1-fs`) | 5 | `styles.css`:199,1709,1718,2243,2763 |
| `38px` (token `--fs-inset`) | 2 | `styles.css`:1104 |

Distance:

| pair | gap |
|---|---|
| `36px` ↔ `38px` | **2px** |

### C5 · Border radii 3px–10px — 6 values

| value | uses | where |
|---|---|---|
| `6px` | 62 | `styleguide.html`:68 · `styles.css`:128,132,143,145,151,153,168,183,277,283,+48 more |
| `8px` | 27 | `styleguide.html`:69 · `styles.css`:317,708,818,854,1034,1040,1054,1064,1531,2252,+15 more |
| `10px` (token `--pg-cardgap`, `--s-own`) | 23 | `styleguide.html`:70,298 · `styles.css`:1140,1541,1739,1792,1803,1969,1973,2009,2070,2593,+8 more |
| `4px` | 3 | `styles.css`:506,2521,2806 |
| `3px` | 1 | `styles.css`:99 |
| `5px` | 1 | `styleguide.html`:67 |

Distance:

| pair | gap |
|---|---|
| `6px` ↔ `8px` | **2px** |
| `6px` ↔ `10px` | **4px** |
| `6px` ↔ `4px` | **2px** |
| `6px` ↔ `3px` | **3px** |
| `6px` ↔ `5px` | **1px** |
| `8px` ↔ `10px` | **2px** |
| `8px` ↔ `4px` | **4px** |
| `8px` ↔ `3px` | **5px** |
| `8px` ↔ `5px` | **3px** |
| `10px` ↔ `4px` | **6px** |
| `10px` ↔ `3px` | **7px** |
| `10px` ↔ `5px` | **5px** |
| `4px` ↔ `3px` | **1px** |
| `4px` ↔ `5px` | **1px** |
| `3px` ↔ `5px` | **2px** |

### C6 · Border radii 12px–20px — 5 values

| value | uses | where |
|---|---|---|
| `16px` (token `--t-body-fs`, `--ic-16`, `--headX`) | 54 | `styles.css`:116,118,214,225,279,378,452,485,504,568,+21 more |
| `20px` (token `--t-h2-fs`, `--ic-20`, `--y2`) | 32 | `styles.css`:119,451,1639,1858,2001,2040,2319,2967,3236,3353,+7 more |
| `12px` (token `--backGap`, `--s-card`, `--cardpad`) | 21 | `styleguide.html`:71,923 · `styles.css`:173,959,2544,2998,3511,3535,3973,4071,4094,4103,+4 more |
| `14px` (token `--t-small-fs`, `--t-label-fs`, `--s-field`) | 2 | `styles.css`:3878,3881 |
| `18px` (token `--t-h2-sm-fs`, `--pg-pad`) | 2 | `styles.css`:1936,1968 |

Distance:

| pair | gap |
|---|---|
| `16px` ↔ `20px` | **4px** |
| `16px` ↔ `12px` | **4px** |
| `16px` ↔ `14px` | **2px** |
| `16px` ↔ `18px` | **2px** |
| `20px` ↔ `12px` | **8px** |
| `20px` ↔ `14px` | **6px** |
| `20px` ↔ `18px` | **2px** |
| `12px` ↔ `14px` | **2px** |
| `12px` ↔ `18px` | **6px** |
| `14px` ↔ `18px` | **4px** |

### C7 · Border radii 24px–30px — 3 values

| value | uses | where |
|---|---|---|
| `24px` (token `--pageX`, `--ic-24`, `--stripH`, `--s-sec`) | 50 | `styles.css`:85,91,120,497,631,853,990,1206,1227,1466,+21 more |
| `28px` (token `--pageY`, `--t-h1-sm-fs`, `--s-grp`) | 5 | `styles.css`:91,2756,3510,3534,3535 |
| `30px` (token `--y1`) | 1 | `styles.css`:1638 |

Distance:

| pair | gap |
|---|---|
| `24px` ↔ `28px` | **4px** |
| `24px` ↔ `30px` | **6px** |
| `28px` ↔ `30px` | **2px** |

### C8 · Border widths 1px–1.5px — 2 values

| value | uses | where |
|---|---|---|
| `1px` | 138 | `styles.css`:126,127,128,132,138,143,145,147,151,168,+126 more |
| `1.5px` | 1 | `styles.css`:1220 |

Distance:

| pair | gap |
|---|---|
| `1px` ↔ `1.5px` | **0.5px** |

### C9 · Spacing (margin/padding) -14px–-6px — 3 values

| value | uses | where |
|---|---|---|
| `-10px` | 3 | `styles.css`:3242,3347,3359 |
| `-14px` | 1 | `styles.css`:1034 |
| `-6px` | 1 | `styles.css`:2933 |

Distance:

| pair | gap |
|---|---|
| `-10px` ↔ `-14px` | **4px** |
| `-10px` ↔ `-6px` | **4px** |
| `-14px` ↔ `-6px` | **8px** |

### C10 · Spacing (margin/padding) -4px–4px — 6 values

| value | uses | where |
|---|---|---|
| `2px` | 42 | `styles.css`:200,243,252,571,590,631,732,787,861,989,+31 more |
| `4px` | 30 | `account.html`:62 · `styles.css`:213,451,552,589,609,696,698,861,866,1052,+19 more |
| `3px` | 14 | `styles.css`:145,193,203,258,602,856,864,866,1810,2040,+4 more |
| `-4px` | 5 | `styles.css`:497,631,3358 |
| `1px` | 4 | `styles.css`:648,756,1219,2093 |
| `-1px` | 3 | `styles.css`:301,527,801 |

Distance:

| pair | gap |
|---|---|
| `2px` ↔ `4px` | **2px** |
| `2px` ↔ `3px` | **1px** |
| `2px` ↔ `-4px` | **6px** |
| `2px` ↔ `1px` | **1px** |
| `2px` ↔ `-1px` | **3px** |
| `4px` ↔ `3px` | **1px** |
| `4px` ↔ `-4px` | **8px** |
| `4px` ↔ `1px` | **3px** |
| `4px` ↔ `-1px` | **5px** |
| `3px` ↔ `-4px` | **7px** |
| `3px` ↔ `1px` | **2px** |
| `3px` ↔ `-1px` | **4px** |
| `-4px` ↔ `1px` | **5px** |
| `-4px` ↔ `-1px` | **3px** |
| `1px` ↔ `-1px` | **2px** |

### C11 · Spacing (margin/padding) 5px–13px — 9 values

| value | uses | where |
|---|---|---|
| `12px` (token `--backGap`, `--s-card`, `--cardpad`) | 90 | `styleguide.html`:262,298,302,303,305,663,698,750,760,795 · `styles.css`:173,232,258,277,301,317,327,369,545,553,+60 more |
| `10px` (token `--pg-cardgap`, `--s-own`) | 70 | `styleguide.html`:924 · `styles.css`:131,132,229,318,375,426,571,575,589,653,+57 more |
| `8px` | 52 | `styleguide.html`:293,316,352,923,924 · `styles.css`:131,132,240,390,391,426,595,648,675,828,+35 more |
| `6px` | 42 | `license-details.js`:710 · `styles.css`:84,145,198,242,497,600,653,698,864,876,+31 more |
| `5px` | 17 | `styles.css`:151,415,420,485,571,672,861,1710,2018,2513,+6 more |
| `9px` | 14 | `styles.css`:153,243,277,415,420,642,752,794,808,1122,+3 more |
| `13px` | 9 | `styles.css`:283,391,964,2019,2157,2647,4187,4338 |
| `7px` | 8 | `styles.css`:153,571,876,1479,1767,2023,2521,3917 |
| `11px` | 6 | `styles.css`:213,301,793,818,1775 |

Distance:

| pair | gap |
|---|---|
| `12px` ↔ `10px` | **2px** |
| `12px` ↔ `8px` | **4px** |
| `12px` ↔ `6px` | **6px** |
| `12px` ↔ `5px` | **7px** |
| `12px` ↔ `9px` | **3px** |
| `12px` ↔ `13px` | **1px** |
| `12px` ↔ `7px` | **5px** |
| `12px` ↔ `11px` | **1px** |
| `10px` ↔ `8px` | **2px** |
| `10px` ↔ `6px` | **4px** |
| `10px` ↔ `5px` | **5px** |
| `10px` ↔ `9px` | **1px** |
| `10px` ↔ `13px` | **3px** |
| `10px` ↔ `7px` | **3px** |
| `10px` ↔ `11px` | **1px** |
| `8px` ↔ `6px` | **2px** |
| `8px` ↔ `5px` | **3px** |
| `8px` ↔ `9px` | **1px** |
| `8px` ↔ `13px` | **5px** |
| `8px` ↔ `7px` | **1px** |
| `8px` ↔ `11px` | **3px** |
| `6px` ↔ `5px` | **1px** |
| `6px` ↔ `9px` | **3px** |
| `6px` ↔ `13px` | **7px** |
| `6px` ↔ `7px` | **1px** |
| `6px` ↔ `11px` | **5px** |
| `5px` ↔ `9px` | **4px** |
| `5px` ↔ `13px` | **8px** |
| `5px` ↔ `7px` | **2px** |
| `5px` ↔ `11px` | **6px** |
| `9px` ↔ `13px` | **4px** |
| `9px` ↔ `7px` | **2px** |
| `9px` ↔ `11px` | **2px** |
| `13px` ↔ `7px` | **6px** |
| `13px` ↔ `11px` | **2px** |
| `7px` ↔ `11px` | **4px** |

### C12 · Spacing (margin/padding) 14px–22px — 7 values

| value | uses | where |
|---|---|---|
| `16px` (token `--t-body-fs`, `--ic-16`, `--headX`) | 117 | `styleguide.html`:298,302,303 · `styles.css`:116,118,127,214,225,279,309,317,378,393,+73 more |
| `14px` (token `--t-small-fs`, `--t-label-fs`, `--s-field`) | 69 | `page-account.js`:74 · `styleguide.html`:502,1041,1061,1088 · `styles.css`:216,234,282,317,469,585,736,740,787,793,+50 more |
| `20px` (token `--t-h2-fs`, `--ic-20`, `--y2`) | 53 | `styles.css`:119,169,205,451,706,721,983,1140,1216,1291,+27 more |
| `18px` (token `--t-h2-sm-fs`, `--pg-pad`) | 35 | `license-details.js`:337 · `styleguide.html`:154,178,293,316 · `styles.css`:138,300,309,553,655,730,812,983,1140,1351,+17 more |
| `22px` | 23 | `styleguide.html`:352,923 · `styles.css`:84,169,312,696,745,942,948,1026,1216,1304,+7 more |
| `15px` (token `--t-body-sm-fs`) | 4 | `styles.css`:1739,2070,2140 |
| `19px` | 1 | `styles.css`:2545 |

Distance:

| pair | gap |
|---|---|
| `16px` ↔ `14px` | **2px** |
| `16px` ↔ `20px` | **4px** |
| `16px` ↔ `18px` | **2px** |
| `16px` ↔ `22px` | **6px** |
| `16px` ↔ `15px` | **1px** |
| `16px` ↔ `19px` | **3px** |
| `14px` ↔ `20px` | **6px** |
| `14px` ↔ `18px` | **4px** |
| `14px` ↔ `22px` | **8px** |
| `14px` ↔ `15px` | **1px** |
| `14px` ↔ `19px` | **5px** |
| `20px` ↔ `18px` | **2px** |
| `20px` ↔ `22px` | **2px** |
| `20px` ↔ `15px` | **5px** |
| `20px` ↔ `19px` | **1px** |
| `18px` ↔ `22px` | **4px** |
| `18px` ↔ `15px` | **3px** |
| `18px` ↔ `19px` | **1px** |
| `22px` ↔ `15px` | **7px** |
| `22px` ↔ `19px` | **3px** |
| `15px` ↔ `19px` | **4px** |

### C13 · Spacing (margin/padding) 24px–32px — 5 values

| value | uses | where |
|---|---|---|
| `24px` (token `--pageX`, `--ic-24`, `--stripH`, `--s-sec`) | 72 | `styles.css`:84,85,91,120,497,631,853,964,990,1017,+41 more |
| `28px` (token `--pageY`, `--t-h1-sm-fs`, `--s-grp`) | 10 | `styles.css`:91,1000,1131,1275,1333,2756,3159,3510,3534,3535 |
| `32px` | 4 | `styles.css`:1154,2633,2893,4375 |
| `30px` (token `--y1`) | 3 | `styles.css`:1131,1333,1638 |
| `26px` | 2 | `styles.css`:1186,1803 |

Distance:

| pair | gap |
|---|---|
| `24px` ↔ `28px` | **4px** |
| `24px` ↔ `32px` | **8px** |
| `24px` ↔ `30px` | **6px** |
| `24px` ↔ `26px` | **2px** |
| `28px` ↔ `32px` | **4px** |
| `28px` ↔ `30px` | **2px** |
| `28px` ↔ `26px` | **2px** |
| `32px` ↔ `30px` | **2px** |
| `32px` ↔ `26px` | **6px** |
| `30px` ↔ `26px` | **4px** |

### C14 · Spacing (margin/padding) 34px–40px — 4 values

| value | uses | where |
|---|---|---|
| `40px` (token `--btnH`, `--backW`) | 36 | `styles.css`:173,183,267,283,375,377,479,683,698,701,+22 more |
| `34px` | 5 | `styles.css`:291,677,941,2432,2762 |
| `38px` (token `--fs-inset`) | 2 | `styles.css`:1154,2317 |
| `36px` (token `--t-h1-fs`) | 1 | `styles.css`:2642 |

Distance:

| pair | gap |
|---|---|
| `40px` ↔ `34px` | **6px** |
| `40px` ↔ `38px` | **2px** |
| `40px` ↔ `36px` | **4px** |
| `34px` ↔ `38px` | **4px** |
| `34px` ↔ `36px` | **2px** |
| `38px` ↔ `36px` | **2px** |

### C15 · Gaps 1px–9px — 9 values

| value | uses | where |
|---|---|---|
| `8px` | 50 | `styles.css`:85,145,212,221,228,257,369,400,531,565,+40 more |
| `6px` | 10 | `styles.css`:243,757,991,1448,1468,1811,2111,2660,3838,4367 |
| `2px` | 9 | `styles.css`:131,300,513,1467,1889,3091,3111,3973,4281 |
| `4px` | 7 | `styles.css`:700,1228,2537,2727,3077,3100,4284 |
| `9px` | 6 | `styles.css`:127,263,277,282,1507,2644 |
| `5px` | 4 | `styles.css`:375,1754,2722,4209 |
| `7px` | 4 | `styles.css`:213,829,1325,2770 |
| `1px` | 2 | `styles.css`:863,870 |
| `3px` | 1 | `styles.css`:3916 |

Distance:

| pair | gap |
|---|---|
| `8px` ↔ `6px` | **2px** |
| `8px` ↔ `2px` | **6px** |
| `8px` ↔ `4px` | **4px** |
| `8px` ↔ `9px` | **1px** |
| `8px` ↔ `5px` | **3px** |
| `8px` ↔ `7px` | **1px** |
| `8px` ↔ `1px` | **7px** |
| `8px` ↔ `3px` | **5px** |
| `6px` ↔ `2px` | **4px** |
| `6px` ↔ `4px` | **2px** |
| `6px` ↔ `9px` | **3px** |
| `6px` ↔ `5px` | **1px** |
| `6px` ↔ `7px` | **1px** |
| `6px` ↔ `1px` | **5px** |
| `6px` ↔ `3px` | **3px** |
| `2px` ↔ `4px` | **2px** |
| `2px` ↔ `9px` | **7px** |
| `2px` ↔ `5px` | **3px** |
| `2px` ↔ `7px` | **5px** |
| `2px` ↔ `1px` | **1px** |
| `2px` ↔ `3px` | **1px** |
| `4px` ↔ `9px` | **5px** |
| `4px` ↔ `5px` | **1px** |
| `4px` ↔ `7px` | **3px** |
| `4px` ↔ `1px` | **3px** |
| `4px` ↔ `3px` | **1px** |
| `9px` ↔ `5px` | **4px** |
| `9px` ↔ `7px` | **2px** |
| `9px` ↔ `1px` | **8px** |
| `9px` ↔ `3px` | **6px** |
| `5px` ↔ `7px` | **2px** |
| `5px` ↔ `1px` | **4px** |
| `5px` ↔ `3px` | **2px** |
| `7px` ↔ `1px` | **6px** |
| `7px` ↔ `3px` | **4px** |
| `1px` ↔ `3px` | **2px** |

### C16 · Gaps 10px–18px — 5 values

| value | uses | where |
|---|---|---|
| `16px` (token `--t-body-fs`, `--ic-16`, `--headX`) | 62 | `styles.css`:116,118,214,225,279,378,452,485,504,568,+29 more |
| `12px` (token `--backGap`, `--s-card`, `--cardpad`) | 51 | `styles.css`:173,177,216,327,338,584,590,642,665,750,+37 more |
| `10px` (token `--pg-cardgap`, `--s-own`) | 40 | `styles.css`:132,177,193,363,603,612,679,740,747,754,+30 more |
| `14px` (token `--t-small-fs`, `--t-label-fs`, `--s-field`) | 26 | `styles.css`:138,180,340,696,967,987,1212,1215,1396,1447,+16 more |
| `18px` (token `--t-h2-sm-fs`, `--pg-pad`) | 6 | `styles.css`:1129,1936,1968,2598,2803,3106 |

Distance:

| pair | gap |
|---|---|
| `16px` ↔ `12px` | **4px** |
| `16px` ↔ `10px` | **6px** |
| `16px` ↔ `14px` | **2px** |
| `16px` ↔ `18px` | **2px** |
| `12px` ↔ `10px` | **2px** |
| `12px` ↔ `14px` | **2px** |
| `12px` ↔ `18px` | **6px** |
| `10px` ↔ `14px` | **4px** |
| `10px` ↔ `18px` | **8px** |
| `14px` ↔ `18px` | **4px** |

### C17 · Gaps 20px–28px — 5 values

| value | uses | where |
|---|---|---|
| `24px` (token `--pageX`, `--ic-24`, `--stripH`, `--s-sec`) | 53 | `styles.css`:85,91,120,234,497,631,853,990,1018,1206,+24 more |
| `20px` (token `--t-h2-fs`, `--ic-20`, `--y2`) | 32 | `styles.css`:119,451,1639,1858,2040,2319,2792,2967,3236,3353,+7 more |
| `28px` (token `--pageY`, `--t-h1-sm-fs`, `--s-grp`) | 5 | `styles.css`:91,2756,3510,3534,3535 |
| `22px` | 1 | `styles.css`:1248 |
| `26px` | 1 | `styles.css`:1029 |

Distance:

| pair | gap |
|---|---|
| `24px` ↔ `20px` | **4px** |
| `24px` ↔ `28px` | **4px** |
| `24px` ↔ `22px` | **2px** |
| `24px` ↔ `26px` | **2px** |
| `20px` ↔ `28px` | **8px** |
| `20px` ↔ `22px` | **2px** |
| `20px` ↔ `26px` | **6px** |
| `28px` ↔ `22px` | **6px** |
| `28px` ↔ `26px` | **2px** |
| `22px` ↔ `26px` | **4px** |

### C18 · Control and icon sizes 1px–8px — 5 values

| value | uses | where |
|---|---|---|
| `1px` | 10 | `styles.css`:232,527,1352,1536,1743,2973,3837 |
| `7px` | 3 | `styles.css`:248,2175 |
| `8px` | 3 | `styleguide.html`:300 · `styles.css`:396,2209 |
| `4px` | 2 | `styleguide.html`:924 · `styles.css`:3003 |
| `3px` | 1 | `styles.css`:1120 |

Distance:

| pair | gap |
|---|---|
| `1px` ↔ `7px` | **6px** |
| `1px` ↔ `8px` | **7px** |
| `1px` ↔ `4px` | **3px** |
| `1px` ↔ `3px` | **2px** |
| `7px` ↔ `8px` | **1px** |
| `7px` ↔ `4px` | **3px** |
| `7px` ↔ `3px` | **4px** |
| `8px` ↔ `4px` | **4px** |
| `8px` ↔ `3px` | **5px** |
| `4px` ↔ `3px` | **1px** |

### C19 · Control and icon sizes 10px–18px — 7 values

| value | uses | where |
|---|---|---|
| `16px` (token `--t-body-fs`, `--ic-16`, `--headX`) | 59 | `styles.css`:116,118,214,225,279,378,452,483,485,504,+23 more |
| `12px` (token `--backGap`, `--s-card`, `--cardpad`) | 15 | `styles.css`:173,2544,3511,3535,3973,4071,4094,4103,4117,4132,+2 more |
| `10px` (token `--pg-cardgap`, `--s-own`) | 7 | `styles.css`:1224,1969,1973,3510,3512,3877 |
| `14px` (token `--t-small-fs`, `--t-label-fs`, `--s-field`) | 7 | `styles.css`:676,758,2788,3878,3881 |
| `17px` | 4 | `styles.css`:1066,1067 |
| `15px` (token `--t-body-sm-fs`) | 2 | `styles.css`:1151 |
| `18px` (token `--t-h2-sm-fs`, `--pg-pad`) | 2 | `styles.css`:1936,1968 |

Distance:

| pair | gap |
|---|---|
| `16px` ↔ `12px` | **4px** |
| `16px` ↔ `10px` | **6px** |
| `16px` ↔ `14px` | **2px** |
| `16px` ↔ `17px` | **1px** |
| `16px` ↔ `15px` | **1px** |
| `16px` ↔ `18px` | **2px** |
| `12px` ↔ `10px` | **2px** |
| `12px` ↔ `14px` | **2px** |
| `12px` ↔ `17px` | **5px** |
| `12px` ↔ `15px` | **3px** |
| `12px` ↔ `18px` | **6px** |
| `10px` ↔ `14px` | **4px** |
| `10px` ↔ `17px` | **7px** |
| `10px` ↔ `15px` | **5px** |
| `10px` ↔ `18px` | **8px** |
| `14px` ↔ `17px` | **3px** |
| `14px` ↔ `15px` | **1px** |
| `14px` ↔ `18px` | **4px** |
| `17px` ↔ `15px` | **2px** |
| `17px` ↔ `18px` | **1px** |
| `15px` ↔ `18px` | **3px** |

### C20 · Control and icon sizes 20px–28px — 5 values

| value | uses | where |
|---|---|---|
| `24px` (token `--pageX`, `--ic-24`, `--stripH`, `--s-sec`) | 60 | `styles.css`:85,91,120,147,224,497,631,784,853,989,+26 more |
| `20px` (token `--t-h2-fs`, `--ic-20`, `--y2`) | 37 | `styles.css`:119,370,451,1219,1479,1639,1858,2040,2319,2525,+10 more |
| `28px` (token `--pageY`, `--t-h1-sm-fs`, `--s-grp`) | 13 | `styles.css`:91,608,823,2481,2756,3134,3510,3534,3535 |
| `26px` | 9 | `styles.css`:128,229,1418,1544,1837,1860,3921 |
| `22px` | 4 | `styles.css`:767,774,2010,3837 |

Distance:

| pair | gap |
|---|---|
| `24px` ↔ `20px` | **4px** |
| `24px` ↔ `28px` | **4px** |
| `24px` ↔ `26px` | **2px** |
| `24px` ↔ `22px` | **2px** |
| `20px` ↔ `28px` | **8px** |
| `20px` ↔ `26px` | **6px** |
| `20px` ↔ `22px` | **2px** |
| `28px` ↔ `26px` | **2px** |
| `28px` ↔ `22px` | **6px** |
| `26px` ↔ `22px` | **4px** |

### C21 · Control and icon sizes 30px–38px — 5 values

| value | uses | where |
|---|---|---|
| `30px` (token `--y1`) | 6 | `styles.css`:783,973,1638,2637 |
| `36px` (token `--t-h1-fs`) | 5 | `styleguide.html`:924 · `styles.css`:918,2880,3003 |
| `32px` | 3 | `styles.css`:1414,2382,2383 |
| `34px` | 2 | `styles.css`:675,2525 |
| `38px` (token `--fs-inset`) | 2 | `styles.css`:3600 |

Distance:

| pair | gap |
|---|---|
| `30px` ↔ `36px` | **6px** |
| `30px` ↔ `32px` | **2px** |
| `30px` ↔ `34px` | **4px** |
| `30px` ↔ `38px` | **8px** |
| `36px` ↔ `32px` | **4px** |
| `36px` ↔ `34px` | **2px** |
| `36px` ↔ `38px` | **2px** |
| `32px` ↔ `34px` | **2px** |
| `32px` ↔ `38px` | **6px** |
| `34px` ↔ `38px` | **4px** |

### C22 · Control and icon sizes 40px–48px — 4 values

| value | uses | where |
|---|---|---|
| `44px` | 42 | `styleguide.html`:925,926,927 · `styles.css`:849,2933,2948,2960,2966,2970,3006,3012,3033,3142,+17 more |
| `40px` (token `--btnH`, `--backW`) | 40 | `styles.css`:173,183,267,283,375,377,479,698,701,762,+25 more |
| `48px` | 9 | `styles.css`:2611,3416,3492,3732,3782,3787,3851,4270 |
| `46px` | 1 | `styles.css`:765 |

Distance:

| pair | gap |
|---|---|
| `44px` ↔ `40px` | **4px** |
| `44px` ↔ `48px` | **4px** |
| `44px` ↔ `46px` | **2px** |
| `40px` ↔ `48px` | **8px** |
| `40px` ↔ `46px` | **6px** |
| `48px` ↔ `46px` | **2px** |

### C23 · Control and icon sizes 52px–60px — 3 values

| value | uses | where |
|---|---|---|
| `56px` | 6 | `styles.css`:291,783,1396,2774,2876,2909 |
| `52px` | 1 | `styles.css`:138 |
| `60px` | 1 | `styles.css`:2791 |

Distance:

| pair | gap |
|---|---|
| `56px` ↔ `52px` | **4px** |
| `56px` ↔ `60px` | **4px** |
| `52px` ↔ `60px` | **8px** |

### C24 · Control and icon sizes 62px–64px — 2 values

| value | uses | where |
|---|---|---|
| `64px` (token `--t-display-fs`, `--bnavH`) | 6 | `styles.css`:3599,3605,3606,3908,4268,4269 |
| `62px` | 2 | `styles.css`:2502,2610 |

Distance:

| pair | gap |
|---|---|
| `64px` ↔ `62px` | **2px** |

### C25 · Line heights 1–1.15 — 5 values

| value | uses | where |
|---|---|---|
| `1` | 9 | `styles.css`:149,183,267,701,762,824,973,2482,3689 |
| `1.08` (token `--t-h1-lh`) | 5 | `styles.css`:199,1709,1718,2243,2763 |
| `1.15` (token `--t-h1-sm-lh`) | 5 | `styles.css`:368,666,3026,3169,3923 |
| `1.1` | 2 | `styles.css`:129,1419 |
| `1.00` (token `--t-display-lh`) | 0 | — |

Distance:

| pair | gap |
|---|---|
| `1` ↔ `1.08` | **0.08** |
| `1` ↔ `1.15` | **0.15** |
| `1` ↔ `1.1` | **0.1** |
| `1` ↔ `1.00` | **0** |
| `1.08` ↔ `1.15` | **0.07** |
| `1.08` ↔ `1.1` | **0.02** |
| `1.08` ↔ `1.00` | **0.08** |
| `1.15` ↔ `1.1` | **0.05** |
| `1.15` ↔ `1.00` | **0.15** |
| `1.1` ↔ `1.00` | **0.1** |

### C26 · Line heights 1.2–1.30 — 4 values

| value | uses | where |
|---|---|---|
| `1.20` (token `--t-label-lh`, `--t-h2-sm-lh`) | 15 | `styles.css`:191,240,242,301,318,371,390,748,1135,1308,+5 more |
| `1.30` (token `--t-h2-lh`) | 14 | `styles.css`:741,966,992,1141,1155,1341,1551,1749,1795,2011,+4 more |
| `1.3` | 5 | `styles.css`:513,1891,3999,4001,4287 |
| `1.2` | 2 | `styles.css`:1229,3262 |

Distance:

| pair | gap |
|---|---|
| `1.20` ↔ `1.30` | **0.1** |
| `1.20` ↔ `1.3` | **0.1** |
| `1.20` ↔ `1.2` | **0** |
| `1.30` ↔ `1.3` | **0** |
| `1.30` ↔ `1.2` | **0.1** |
| `1.3` ↔ `1.2` | **0.1** |

### C27 · Line heights 1.35–1.50 — 6 values

| value | uses | where |
|---|---|---|
| `1.45` (token `--t-small-lh`) | 19 | `styles.css`:222,426,861,1710,2054,2244,2256,2298,2303,2344,+9 more |
| `1.5` | 16 | `styles.css`:469,552,554,587,743,1144,1156,1809,2093,2236,+6 more |
| `1.4` | 6 | `styles.css`:203,575,819,2341,2848,3307 |
| `1.50` (token `--t-body-lh`) | 6 | `styles.css`:2313,2421,2433,2501,2758,4327 |
| `1.35` | 2 | `styles.css`:1230,4011 |
| `1.40` (token `--t-body-sm-lh`) | 1 | `styles.css`:3290 |

Distance:

| pair | gap |
|---|---|
| `1.45` ↔ `1.5` | **0.05** |
| `1.45` ↔ `1.4` | **0.05** |
| `1.45` ↔ `1.50` | **0.05** |
| `1.45` ↔ `1.35` | **0.1** |
| `1.45` ↔ `1.40` | **0.05** |
| `1.5` ↔ `1.4` | **0.1** |
| `1.5` ↔ `1.50` | **0** |
| `1.5` ↔ `1.35` | **0.15** |
| `1.5` ↔ `1.40` | **0.1** |
| `1.4` ↔ `1.50` | **0.1** |
| `1.4` ↔ `1.35` | **0.05** |
| `1.4` ↔ `1.40` | **0** |
| `1.50` ↔ `1.35` | **0.15** |
| `1.50` ↔ `1.40` | **0.1** |
| `1.35` ↔ `1.40` | **0.05** |

### C28 · Line heights 1.55–1.6 — 2 values

| value | uses | where |
|---|---|---|
| `1.55` | 7 | `styles.css`:993,1060,1133,1254,1365,2784,4290 |
| `1.6` | 4 | `styles.css`:1136,1550,1796,4339 |

Distance:

| pair | gap |
|---|---|
| `1.55` ↔ `1.6` | **0.05** |

### C29 · Font weights 400–500 — 2 values

| value | uses | where |
|---|---|---|
| `500` (token `--t-h2-fw`, `--t-label-fw`, `--t-h2-sm-fw`, `--t-em-fw`) | 57 | `styles.css`:10,11,72,192,240,242,301,318,368,371,+47 more |
| `400` (token `--t-body-fw`, `--t-small-fw`, `--t-body-sm-fw`) | 23 | `styles.css`:8,9,15,390,578,810,835,1230,1420,1710,+13 more |

Distance:

| pair | gap |
|---|---|
| `500` ↔ `400` | **100** |

### C30 · Font weights 600–700 — 2 values

| value | uses | where |
|---|---|---|
| `600` | 18 | `styleguide.html`:657 · `styles.css`:134,141,244,280,303,752,790,864,1124,1132,+7 more |
| `700` (token `--t-display-fw`, `--t-h1-fw`, `--t-h1-sm-fw`) | 14 | `components.js`:2349 · `styles.css`:12,13,129,147,199,791,833,1419,1709,1719,+3 more |

Distance:

| pair | gap |
|---|---|
| `600` ↔ `700` | **100** |

### C31 · Opacity .45–.5 — 2 values

| value | uses | where |
|---|---|---|
| `.45` | 5 | `styles.css`:1255,2568,2573,2578,2601 |
| `.5` | 1 | `styles.css`:3601 |

Distance:

| pair | gap |
|---|---|
| `.45` ↔ `.5` | **0.05** |

### C32 · z-index -1–20 — 6 values

| value | uses | where |
|---|---|---|
| `20` | 4 | `styles.css`:415,420,431,435 |
| `5` | 3 | `styles.css`:2563,2575,3152 |
| `12` | 3 | `styles.css`:912,917,2139 |
| `11` | 2 | `styles.css`:2156,2208 |
| `-1` | 1 | `styles.css`:1625 |
| `1` | 1 | `styles.css`:768 |

Distance:

| pair | gap |
|---|---|
| `20` ↔ `5` | **15** |
| `20` ↔ `12` | **8** |
| `20` ↔ `11` | **9** |
| `20` ↔ `-1` | **21** |
| `20` ↔ `1` | **19** |
| `5` ↔ `12` | **7** |
| `5` ↔ `11` | **6** |
| `5` ↔ `-1` | **6** |
| `5` ↔ `1` | **4** |
| `12` ↔ `11` | **1** |
| `12` ↔ `-1` | **13** |
| `12` ↔ `1` | **11** |
| `11` ↔ `-1` | **12** |
| `11` ↔ `1` | **10** |
| `-1` ↔ `1` | **2** |

### C33 · z-index 88–120 — 5 values

| value | uses | where |
|---|---|---|
| `100` | 3 | `styles.css`:706,883,2581 |
| `95` | 2 | `styles.css`:887,3600 |
| `88` | 1 | `styles.css`:4269 |
| `90` | 1 | `styles.css`:3907 |
| `120` | 1 | `styles.css`:3005 |

Distance:

| pair | gap |
|---|---|
| `100` ↔ `95` | **5** |
| `100` ↔ `88` | **12** |
| `100` ↔ `90` | **10** |
| `100` ↔ `120` | **20** |
| `95` ↔ `88` | **7** |
| `95` ↔ `90` | **5** |
| `95` ↔ `120` | **25** |
| `88` ↔ `90` | **2** |
| `88` ↔ `120` | **32** |
| `90` ↔ `120` | **30** |

### C34 · Durations 0.12s–0.18s — 4 values

| value | uses | where |
|---|---|---|
| `0.15s` | 7 | `styles.css`:774,776,1756,3602,4331 |
| `0.12s` | 5 | `styles.css`:598,2176,2210,3843,3921 |
| `0.18s` | 3 | `styles.css`:1496,1684 |
| `0.16s` | 2 | `styles.css`:2476 |

Distance:

| pair | gap |
|---|---|
| `0.15s` ↔ `0.12s` | **0.03s** |
| `0.15s` ↔ `0.18s` | **0.03s** |
| `0.15s` ↔ `0.16s` | **0.01s** |
| `0.12s` ↔ `0.18s` | **0.06s** |
| `0.12s` ↔ `0.16s` | **0.04s** |
| `0.18s` ↔ `0.16s` | **0.02s** |

### C35 · Shadows — 14 values

| value | uses | where |
|---|---|---|
| `0 12px 32px rgba(0,0,0,.16)` | 2 | `styleguide.html`:81 · `styles.css`:1531 |
| `0 14px 44px rgba(0,0,0,.18)` | 2 | `styleguide.html`:82 · `styles.css`:708 |
| `0 24px 64px rgba(0,0,0,.28)` | 2 | `styleguide.html`:83 · `styles.css`:959 |
| `0 3px 12px rgba(0,0,0,.14)` | 1 | `styleguide.html`:80 |
| `0 6px 20px rgba(0,0,0,.08)` | 1 | `styles.css`:151 |
| `0 4px 14px rgba(0,0,0,.28)` | 1 | `styles.css`:851 |
| `0 12px 32px rgba(0,0,0,.18)` | 1 | `styles.css`:854 |
| `0 4px 14px rgba(0,0,0,.16)` | 1 | `styles.css`:920 |
| `0 10px 30px rgba(0,0,0,.28)` | 1 | `styles.css`:2475 |
| `0 18px 48px rgba(0,0,0,.20)` | 1 | `styles.css`:2593 |
| `0 6px 20px rgba(0,0,0,.10)` | 1 | `styles.css`:2705 |
| `0 -12px 40px rgba(0,0,0,.22)` | 1 | `styles.css`:3001 |
| `0 -8px 24px rgba(0,0,0,.10)` | 1 | `styles.css`:3483 |
| `0 3px 14px rgba(0,0,0,.16)` | 1 | `styles.css`:4272 |

Distance:

Shadows cannot be subtracted, so what is compared is the three numbers that decide how a shadow reads: the vertical offset, the blur, and the alpha of its colour.

| shadow | x | y | blur | alpha |
|---|---|---|---|---|
| `0 12px 32px rgba(0,0,0,.16)` | 0 | 12 | 32 | 0.16 |
| `0 14px 44px rgba(0,0,0,.18)` | 0 | 14 | 44 | 0.18 |
| `0 24px 64px rgba(0,0,0,.28)` | 0 | 24 | 64 | 0.28 |
| `0 3px 12px rgba(0,0,0,.14)` | 0 | 3 | 12 | 0.14 |
| `0 6px 20px rgba(0,0,0,.08)` | 0 | 6 | 20 | 0.08 |
| `0 4px 14px rgba(0,0,0,.28)` | 0 | 4 | 14 | 0.28 |
| `0 12px 32px rgba(0,0,0,.18)` | 0 | 12 | 32 | 0.18 |
| `0 4px 14px rgba(0,0,0,.16)` | 0 | 4 | 14 | 0.16 |
| `0 10px 30px rgba(0,0,0,.28)` | 0 | 10 | 30 | 0.28 |
| `0 18px 48px rgba(0,0,0,.20)` | 0 | 18 | 48 | 0.2 |
| `0 6px 20px rgba(0,0,0,.10)` | 0 | 6 | 20 | 0.1 |
| `0 -12px 40px rgba(0,0,0,.22)` | 0 | -12 | 40 | 0.22 |
| `0 -8px 24px rgba(0,0,0,.10)` | 0 | -8 | 24 | 0.1 |
| `0 3px 14px rgba(0,0,0,.16)` | 0 | 3 | 14 | 0.16 |

### C36 · Easing curves — 2 values

| value | uses | where |
|---|---|---|
| `ease` | 12 | `styles.css`:1496,1636,1684,1756,2476,3602,3843,4331 |
| `linear` | 2 | `styles.css`:382,1151 |

Distance:

_Distinct strings — no numeric distance applies._

### C37 · Font families — 3 values

| value | uses | where |
|---|---|---|
| `Ubuntu` | 6 | `styles.css`:8,9,10,11,12,13 |
| `ui-monospace` | 2 | `styles.css`:374,2239 |
| `Ubuntu Mono` | 1 | `styles.css`:15 |

Distance:

_Distinct strings — no numeric distance applies._

## Рішення

_One heading per cluster in List C. Intentionally empty — to be filled in by hand and handed back as the input for the next session._

### C1 · Colours #dcdcd8–#ffffff — `#ffffff`, `#e2e2e2`, `#f0f0ee`, `#f4f4f2`, `#e4e4e0`, `#dcdcd8`, `#fafafa`, `#e6e6e6`, `#f4f7fb`, `#efefec`, `#f6f6f4`


### C2 · Font sizes 12px–16px — `14px`, `16px`, `13px`, `15px`, `14.5px`, `12px`


### C3 · Font sizes 17px–20px — `20px`, `18px`, `19px`, `17px`


### C4 · Font sizes 36px–38px — `36px`, `38px`


### C5 · Border radii 3px–10px — `6px`, `8px`, `10px`, `4px`, `3px`, `5px`


### C6 · Border radii 12px–20px — `16px`, `20px`, `12px`, `14px`, `18px`


### C7 · Border radii 24px–30px — `24px`, `28px`, `30px`


### C8 · Border widths 1px–1.5px — `1px`, `1.5px`


### C9 · Spacing (margin/padding) -14px–-6px — `-10px`, `-14px`, `-6px`


### C10 · Spacing (margin/padding) -4px–4px — `2px`, `4px`, `3px`, `-4px`, `1px`, `-1px`


### C11 · Spacing (margin/padding) 5px–13px — `12px`, `10px`, `8px`, `6px`, `5px`, `9px`, `13px`, `7px`, `11px`


### C12 · Spacing (margin/padding) 14px–22px — `16px`, `14px`, `20px`, `18px`, `22px`, `15px`, `19px`


### C13 · Spacing (margin/padding) 24px–32px — `24px`, `28px`, `32px`, `30px`, `26px`


### C14 · Spacing (margin/padding) 34px–40px — `40px`, `34px`, `38px`, `36px`


### C15 · Gaps 1px–9px — `8px`, `6px`, `2px`, `4px`, `9px`, `5px`, `7px`, `1px`, `3px`


### C16 · Gaps 10px–18px — `16px`, `12px`, `10px`, `14px`, `18px`


### C17 · Gaps 20px–28px — `24px`, `20px`, `28px`, `22px`, `26px`


### C18 · Control and icon sizes 1px–8px — `1px`, `7px`, `8px`, `4px`, `3px`


### C19 · Control and icon sizes 10px–18px — `16px`, `12px`, `10px`, `14px`, `17px`, `15px`, `18px`


### C20 · Control and icon sizes 20px–28px — `24px`, `20px`, `28px`, `26px`, `22px`


### C21 · Control and icon sizes 30px–38px — `30px`, `36px`, `32px`, `34px`, `38px`


### C22 · Control and icon sizes 40px–48px — `44px`, `40px`, `48px`, `46px`


### C23 · Control and icon sizes 52px–60px — `56px`, `52px`, `60px`


### C24 · Control and icon sizes 62px–64px — `64px`, `62px`


### C25 · Line heights 1–1.15 — `1`, `1.08`, `1.15`, `1.1`, `1.00`


### C26 · Line heights 1.2–1.30 — `1.20`, `1.30`, `1.3`, `1.2`


### C27 · Line heights 1.35–1.50 — `1.45`, `1.5`, `1.4`, `1.50`, `1.35`, `1.40`


### C28 · Line heights 1.55–1.6 — `1.55`, `1.6`


### C29 · Font weights 400–500 — `500`, `400`


### C30 · Font weights 600–700 — `600`, `700`


### C31 · Opacity .45–.5 — `.45`, `.5`


### C32 · z-index -1–20 — `20`, `5`, `12`, `11`, `-1`, `1`


### C33 · z-index 88–120 — `100`, `95`, `88`, `90`, `120`


### C34 · Durations 0.12s–0.18s — `0.15s`, `0.12s`, `0.18s`, `0.16s`


### C35 · Shadows — `0 12px 32px rgba(0,0,0,.16)`, `0 14px 44px rgba(0,0,0,.18)`, `0 24px 64px rgba(0,0,0,.28)`, …


### C36 · Easing curves — `ease`, `linear`


### C37 · Font families — `Ubuntu`, `ui-monospace`, `Ubuntu Mono`


## How to re-run

```bash
python3 tools/audit-tokens.py          # rewrites AUDIT.md
python3 tools/audit-tokens.py --check  # prints the summary only, writes nothing
```

No dependencies — standard library only, same as the other scripts in `tools/`. The numbers are produced by the script, not by reading: nothing in this file is hand-counted. Re-running overwrites everything above **Рішення** as well as the headings inside it, so copy that section out before re-running once you have filled it in.

### What the script counts, and what it refuses to count

- **Comments are stripped first**, in CSS and in JS. This codebase is heavily commented and the comments are full of hex codes and pixel measurements; counting them would roughly double every figure with prose.
- **Only declarations are read**, never selectors — `@media (max-width:600px)` is collected as a breakpoint, not as a spacing value.
- **In JS and HTML only real style writes count**: a `style="…"` attribute, `el.style.prop = …`, `cssText`, or `setProperty`. A hex in a sentence is prose.
- **`calc()` values are skipped** for numeric families: a computed value is not a literal choice.
- **`assets/*.svg` is not audited** — the sprite and the wordmark are generated (see `tools/build-icons.py`).
- Alpha is kept, so `#fff` and `rgba(255,255,255,.5)` are not merged.


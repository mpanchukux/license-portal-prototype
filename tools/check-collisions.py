#!/usr/bin/env python3
"""Two name collisions that cost this prototype a day each, both invisible at runtime.

⚠️ WHY THIS EXISTS, in two sentences written the day both happened (2026-10-01):

  · `id="dashLicHead"` was on BOTH the Licences block's heading div and its `<thead>`.
    `$()` returns the first match, so the column row was written into the heading and
    then overwritten by the heading's own renderer. The block had no column row for
    days. Nothing threw: a duplicate id is valid markup to everything except the one
    lookup that mattered.

  · `.sheet` was already the licence details page's container when a new bottom-sheet
    component took the same class name. Two live rules, one name, each writer real —
    the panel inherited `position:fixed; inset:0` and its contents were thrown out of
    the modal box. Neither rule was dead and neither was overridden, so none of the
    existing checks could see it.

Both are name collisions, both are silent, and both are cheap to test for.

HOW IT FAILS, and why the two halves are not the same kind of rule:

  IDS are an absolute: an id is unique or it is a bug, so a second one fails the pass.

  CLASS REPEATS are a RATCHET, not an absolute. A class legitimately declared twice —
  a base rule plus a later refinement — is ordinary CSS, and this stylesheet has
  twenty-five of them. A checker that fails on those is a checker nobody can keep
  green, and the first thing anyone does with a checker they cannot keep green is turn
  it off (the same reasoning `check-icons.py` records about comments). So the baseline
  below is the count that existed when the guard was written, and the guard fails only
  when the count GROWS — i.e. when somebody mints a name that is already taken.

  ⚠️ IF YOU DELIBERATELY SPLIT A RULE IN TWO, raise BASELINE by one and say why in the
  commit. That is the whole maintenance cost, and it is paid by the person who knows
  the answer.
"""
import re
import sys
import glob
import os
from collections import Counter

# ⚠️ 25 IS THE HONEST COUNT, measured by this file's own parse on the day it was written.
# An earlier ad-hoc grep said 14 and was wrong — it missed selectors split across lines,
# which is exactly the shape `.sheet` had. A baseline taken from a different parser is a
# baseline that silently forgives whatever that parser could not see.
# ⚠️ THE 25 ARE NOT AUDITED, and that is deliberate rather than lazy: four were read
# (`.topbar`, `.sidebar`, `.fs-screen`, `.plancard`) and every one is a base rule plus a
# later refinement of the SAME component, which is ordinary CSS. Reading the other
# twenty-one is worth a pass of its own; the ratchet does not need it to start working.
BASELINE = 24          # top-level classes declared more than once, 2026-10-01
# ⚠️ 25 -> 24 when the banner's `separate` layout went with the `Banner › Layout` axis.
# A ratchet only ratchets DOWN by hand: lower it whenever a retirement removes a repeat,
# or the next collision has a free slot to hide in.
CSS = 'styles.css'


def strip_comments(text):
    return re.sub(r'/\*.*?\*/', '', text, flags=re.S)


def strip_media(text):
    """Drop @media blocks, depth-aware — a class may be restated inside one for a
    breakpoint, which is the normal way to write it and not a collision."""
    out, i, n = [], 0, len(text)
    while i < n:
        if text.startswith('@media', i):
            j = text.find('{', i)
            if j < 0:
                break
            depth, j = 1, j + 1
            while depth and j < n:
                if text[j] == '{':
                    depth += 1
                elif text[j] == '}':
                    depth -= 1
                j += 1
            i = j
            continue
        out.append(text[i])
        i += 1
    return ''.join(out)


def css_findings(path):
    text = strip_media(strip_comments(open(path, encoding='utf-8').read()))
    counts = Counter()
    for sel in re.findall(r'([^{}]+)\{[^{}]*\}', text):
        for part in sel.split(','):
            part = part.strip()
            # only a BARE single class: `.foo`, never `.foo .bar` or `.foo.bar`, because
            # those are a scope rather than a second declaration of the same component
            if re.fullmatch(r'\.[A-Za-z0-9_-]+', part):
                counts[part] += 1
    repeats = sorted(k for k, v in counts.items() if v > 1)
    return repeats


def id_findings():
    """⚠️ HTML COMMENTS ARE STRIPPED FIRST, and the guard reported a false duplicate on its
    first real run without it: this codebase annotates heavily and a comment routinely
    QUOTES the attribute it is explaining (`⚠️ `id="actPeriod"` is what wirePeriod has
    always been passed`). A checker that cannot tell prose from markup is a checker that
    gets switched off the first time it cries wolf — the same reasoning `check-icons.py`
    records for cutting comments before it looks for glyphs."""
    bad = []
    for f in sorted(glob.glob('*.html')):
        text = re.sub(r'<!--.*?-->', '', open(f, encoding='utf-8').read(), flags=re.S)
        ids = re.findall(r'\bid="([^"]+)"', text)
        for name, n in Counter(ids).items():
            if n > 1:
                bad.append('%s: id="%s" appears %d times' % (f, name, n))
    return bad


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)
    fail = False

    dupes = id_findings()
    if dupes:
        fail = True
        print('ids: %d duplicate(s)' % len(dupes))
        for d in dupes:
            print('   ', d)
    else:
        print('ids: clean - every id in every page is unique')

    repeats = css_findings(CSS)
    if len(repeats) > BASELINE:
        fail = True
        print('classes: %d top-level names declared more than once, baseline %d'
              % (len(repeats), BASELINE))
        print('    a name below is declared twice outside @media - check they are the')
        print('    same component before raising BASELINE:')
        for r in repeats:
            print('   ', r)
    else:
        print('classes: %d repeated top-level name(s), baseline %d - no new collision'
              % (len(repeats), BASELINE))

    sys.exit(1 if fail else 0)


if __name__ == '__main__':
    main()

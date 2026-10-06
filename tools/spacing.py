#!/usr/bin/env python3
"""Spacing axis: census and literal -> token conversion (design-system session 3).

⚠️ IT LIVES HERE BECAUSE THE SCRATCHPAD EATS SCRIPTS. `roles.py` was lost exactly that way
on 2026-10-02, and the debt entry had predicted it. Stage 3 of the spacing work needs this
file again, so it is in the repository rather than in a session directory.

⚠️ THE PROPERTY SET IS NOT MINE. It is copied verbatim from tools/classify-dead.py, which
is what produced the axis counts VALUES.md and SCALES.md decided against. A conversion that
used a different set would be converting a different population than the one anybody agreed
to, and the counts would stop being comparable.

⚠️ TOKENISATION IS DEPTH-AWARE, also from that file. `calc(...)`, `env(...)` and `max(...)`
come back as ONE token, so a literal inside a composition is never seen as a standalone
value and never converted — which is exactly the rule SCALES.md sets for them.

Usage:
  spacing.py census [file]            distinct values and occurrences
  spacing.py convert [file]           rewrite step-valued literals to their tokens
  spacing.py plan [file]              what convert would do, without writing
"""
import re
import sys
import os
from collections import Counter

# --- copied from tools/classify-dead.py -------------------------------------------
SPACING = {'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
           'margin-inline', 'margin-block', 'padding', 'padding-top', 'padding-right',
           'padding-bottom', 'padding-left', 'padding-inline', 'padding-block',
           'gap', 'row-gap', 'column-gap'}
LEN = re.compile(r'^-?(?:\d+\.?\d*|\.\d+)(px|rem|em|%|vh|vw|ch|s|ms)?$', re.I)


def toks_of(v):
    out, depth, cur = [], 0, []
    for c in v:
        if c == '(':
            depth += 1
        elif c == ')':
            depth -= 1
        if depth == 0 and c in ' \t':
            if cur:
                out.append(''.join(cur))
                cur = []
        else:
            cur.append(c)
    if cur:
        out.append(''.join(cur))
    return out
# ----------------------------------------------------------------------------------

# the eleven steps, and the role token each one is read through
STEPS = {
    '2px':  '--space-glyph',
    '4px':  '--space-tight',
    '8px':  '--space-inline',
    '12px': '--space-control',
    '16px': '--space-stack',
    '20px': '--space-heading',
    '24px': '--space-block',
    '32px': '--space-band',
    '40px': '--space-gutter',
    '48px': '--space-inset',
    '64px': '--space-divide',
}


# ---- stage 3: values that are NOT a step, and the step each one moves to --------------
# ⚠️ EVERY ONE OF THESE CHANGES A PIXEL. The mapping is the decided table in SCALES.md §1;
# this dict is that table, not a re-derivation of it.
MOVES = {
    '10px': '--space-control',   # +2   117x
    '14px': '--space-stack',     # +2   106x
    '6px':  '--space-inline',    # +2    67x
    '18px': '--space-heading',   # +2    54x
    '9px':  '--space-inline',    # -1    23x
    '22px': '--space-block',     # +2    22x  ⚠️ carries --contentX with it
    '5px':  '--space-tight',     # -1    21x
    '7px':  '--space-inline',    # +1    20x
    '3px':  '--space-tight',     # +1    13x
    '13px': '--space-control',   # -1     9x
    '1px':  '--space-glyph',     # +1     7x
    '34px': '--space-band',      # -2     7x
    '28px': '--space-band',      # +4     7x  ⚠️ decided visible move
    '30px': '--space-band',      # +2     7x
    '26px': '--space-block',     # -2     7x
    '11px': '--space-control',   # +1     5x
    '44px': '--space-inset',     # +4     4x  ⚠️ decided visible move (the page gutter)
    '15px': '--space-stack',     # +1     4x
    '38px': '--space-gutter',    # +2     3x
    '23px': '--space-block',     # +1     1x
    '56px': '--space-divide',    # +8     1x  ⚠️ decided visible move
    '60px': '--space-divide',    # +4     1x  ⚠️ decided visible move
}
# ⚠️ OFF THE SCALE AND UNTOUCHED, each for a named reason (SCALES.md §1):
#   37px  = 48 - 11, derived from a measured deficit; a step stops it tracking that
#   110px = the width of two action buttons it reserves room for
#   80px  = one occurrence of a styleguide page frame; one does not earn a step
# calc()/env() compositions never reach here at all: toks_of is depth-aware, so a literal
# inside a composition is not a standalone token. `calc(24px - 1px)` is safe by that rule.
OFFSCALE = {'37px', '110px', '80px'}


def mask_comments(text):
    """Blank comments but KEEP offsets, so edits can be applied to the original."""
    out = list(text)
    for m in re.finditer(r'/\*.*?\*/', text, flags=re.S):
        for i in range(m.start(), m.end()):
            if out[i] != '\n':
                out[i] = ' '
    return ''.join(out)


DECL = re.compile(r'(?<=[{;])\s*(--?[a-zA-Z][\w-]*|[a-zA-Z-]+)\s*:\s*([^;{}]*)')


def declarations(text):
    """-> (prop, value, value_start, value_end) over the real file offsets."""
    masked = mask_comments(text)
    for m in DECL.finditer(masked):
        prop = m.group(1).strip().lower()
        raw = m.group(2)
        start = m.start(2)
        end = start + len(raw)
        yield prop, text[start:end], start, end


def census(text):
    vals = Counter()
    for prop, value, _, _ in declarations(text):
        if prop not in SPACING:
            continue
        for t in toks_of(value):
            if LEN.match(t) or t.startswith('var('):
                vals[t] += 1
    return vals


def plan(text, table=None):
    """-> list of (offset, old_token, new_token, prop) for every convertible literal."""
    table = STEPS if table is None else table
    edits = []
    for prop, value, start, _ in declarations(text):
        if prop not in SPACING:
            continue
        # walk the value token by token, tracking each token's offset
        depth, cur, tok_start = 0, [], None
        pos = 0

        def flush(end_pos):
            nonlocal cur, tok_start
            if cur:
                t = ''.join(cur)
                if t in table:
                    edits.append((start + tok_start, t, 'var(%s)' % table[t], prop))
                cur, tok_start = [], None
        for c in value:
            if c == '(':
                depth += 1
            elif c == ')':
                depth -= 1
            if depth == 0 and c in ' \t':
                flush(pos)
            else:
                if tok_start is None:
                    tok_start = pos
                cur.append(c)
            pos += 1
        flush(pos)
    return edits


def convert(path, text, table=None):
    edits = plan(text, table)
    out, last = [], 0
    for off, old, new, _ in sorted(edits):
        out.append(text[last:off])
        out.append(new)
        last = off + len(old)
    out.append(text[last:])
    open(path, 'w', encoding='utf-8').write(''.join(out))
    return edits


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'census'
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(root, 'styles.css')
    text = open(path, encoding='utf-8').read()
    if cmd == 'census':
        v = census(text)
        print('distinct: %d   occurrences: %d' % (len(v), sum(v.values())))
        for k, n in sorted(v.items(), key=lambda kv: -kv[1]):
            mark = '  <- step' if k in STEPS else ''
            print('%8s  %4d%s' % (k, n, mark))
    elif cmd == 'plan':
        e = plan(text)
        by = Counter(x[1] for x in e)
        print('would convert %d occurrences across %d values' % (len(e), len(by)))
        for k, n in sorted(by.items(), key=lambda kv: -kv[1]):
            print('%8s -> var(%s)  x%d' % (k, STEPS[k], n))
        props = Counter(x[3] for x in e)
        print('\nby property:')
        for k, n in sorted(props.items(), key=lambda kv: -kv[1]):
            print('  %-16s %d' % (k, n))
    elif cmd == 'convert':
        e = convert(path, text)
        print('converted %d occurrences in %s' % (len(e), path))
    elif cmd == 'moveplan':
        e = plan(text, MOVES)
        by = Counter(x[1] for x in e)
        print('would MOVE %d occurrences across %d values' % (len(e), len(by)))
        for k, n in sorted(by.items(), key=lambda kv: -kv[1]):
            print('%8s -> var(%s)  x%d' % (k, MOVES[k], n))
    elif cmd == 'move':
        e = convert(path, text, MOVES)
        print('moved %d occurrences in %s' % (len(e), path))

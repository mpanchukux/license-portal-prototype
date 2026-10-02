#!/usr/bin/env python3
"""Which role every font-size declaration carries, derived from the stylesheet.

⚠️⚠️ THIS IS DERIVED, NOT STORED, AND THAT IS THE POINT. The 2026-10-02 pass split 173
declarations into "text read in flow" (`--t-body-fs`) and "service labels recognised
rather than read" (`--t-small-fs`). That classification was written by hand into a
`roles.py` in the session scratchpad — and the scratchpad is cleared between sessions, so
it was gone the next morning and the decision had to be reconstructed by reading the diff.

The classification is already in the stylesheet: it IS the token each rule reads. Deriving
it here means it cannot drift from the code, and it cannot be lost again.

Usage:  python3 tools/type-roles.py            # the table
        python3 tools/type-roles.py --check    # exit 1 if anything renders below 14px
"""
import re, sys, os
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = open(os.path.join(ROOT, 'styles.css'), encoding='utf-8').read()

# ⚠️ Comments are masked, never deleted: the file quotes CSS inside its own prose, and a
# regex that cannot tell the two apart has already eaten a selector once (2026-10-01).
masked = list(CSS)
for m in re.finditer(r'/\*.*?\*/', CSS, flags=re.S):
    for i in range(m.start(), m.end()):
        masked[i] = ' '
masked = ''.join(masked)

def token_values():
    """every --t-*-fs, and what it resolves to at wide and at narrow"""
    wide, narrow = {}, {}
    for m in re.finditer(r'(--t-[\w-]*-fs)\s*:\s*([^;}]+)', masked):
        name, val = m.group(1), m.group(2).strip()
        inside_mq = masked.rfind('@media', 0, m.start()) > masked.rfind('}\n}', 0, m.start())
        (narrow if inside_mq else wide)[name] = val
    def resolve(d, name, depth=0):
        v = d.get(name) or wide.get(name)
        if v is None or depth > 6: return None
        r = re.fullmatch(r'var\(\s*(--[\w-]+)\s*\)', v)
        return resolve(d, r.group(1), depth + 1) if r else v
    return {n: (resolve(wide, n), resolve(narrow, n)) for n in wide}

TOK = token_values()
ROLE_OF = {'--t-body-fs': 'text in flow', '--t-small-fs': 'service label',
           '--t-label-fs': 'service label', '--t-caption-fs': 'service label'}

# walk the sheet keeping the selector stack, so every declaration knows what it styles
rows, sel_stack, at_stack, buf, last, i = [], [], [], [], 0, 0
def harvest(a, b):
    seg_start = a
    depth = 0
    for k in range(a, b):
        c = masked[k]
        if c == '(': depth += 1
        elif c == ')': depth -= 1
        elif c == ';' and depth == 0:
            take(seg_start, k); seg_start = k + 1
    take(seg_start, b)

def take(a, b):
    m = re.match(r'^\s*font-size\s*:\s*(.+?)\s*$', CSS[a:b], re.S)
    if not m: return
    sel = ' >> '.join(s for s in sel_stack if s)
    at = ' >> '.join(x for x in at_stack if x)
    rows.append((sel, at, m.group(1)))

while i < len(masked):
    ch = masked[i]
    if ch == '{':
        head = ''.join(buf).strip(); buf = []
        is_at = head.startswith('@')
        at_stack.append(head if is_at else None)
        sel_stack.append(None if is_at else head)
        last = i + 1
    elif ch == '}':
        harvest(last, i); buf = []
        if sel_stack: sel_stack.pop()
        if at_stack: at_stack.pop()
        last = i + 1
    elif ch == ';':
        harvest(last, i); buf = []; last = i + 1
    else:
        buf.append(masked[i])
    i += 1

def px(v, narrow):
    r = re.fullmatch(r'var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)', v)
    if r:
        pair = TOK.get(r.group(1))
        if not pair: return None
        got = pair[1] if narrow and pair[1] else pair[0]
        return float(got[:-2]) if got and got.endswith('px') else None
    return float(v[:-2]) if v.endswith('px') and re.fullmatch(r'[\d.]+px', v) else None

if '--check' in sys.argv:
    bad = []
    for sel, at, val in rows:
        for narrow in (False, True):
            p = px(val, narrow)
            if p is not None and p < 14:
                bad.append((sel[:70], at[:30], val, p, 'narrow' if narrow else 'wide'))
    for b in bad:
        print('BELOW THE 14px FLOOR:', b)
    print('type-roles: %d font-size declarations, %d below the floor' % (len(rows), len(bad)))
    sys.exit(1 if bad else 0)

print('THE SCALE')
for n, (w, nr) in sorted(TOK.items()):
    print('  %-18s %-8s %s' % (n, w, ('≤600: ' + nr) if nr and nr != w else ''))
print()
by = defaultdict(list)
for sel, at, val in rows:
    r = re.fullmatch(r'var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)', val)
    key = ROLE_OF.get(r.group(1), r.group(1)) if r else ('literal ' + val)
    by[key].append((sel, at))
print('ROLES')
for role, items in sorted(by.items(), key=lambda kv: -len(kv[1])):
    print('  %-16s %3d' % (role, len(items)))
    for sel, at in sorted(items)[:400]:
        print('      %s%s' % (sel[:92], ('   [' + at[:28] + ']') if at else ''))

#!/usr/bin/env python3
"""Every selector in styles.css, with what it declares and where it sits.

Emits JSON for the browser probe (tools/dead-selectors.js) to test for matches.

⚠️ The file quotes CSS inside its own prose, so comments are MASKED to spaces rather than
deleted — a regex that cannot tell a rule from a sentence about a rule has already eaten
a selector once (2026-10-01).
"""
import re, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = open(os.path.join(ROOT, 'styles.css'), encoding='utf-8').read()

masked = list(CSS)
for m in re.finditer(r'/\*.*?\*/', CSS, flags=re.S):
    for i in range(m.start(), m.end()):
        masked[i] = ' '
masked = ''.join(masked)

rules, sel_stack, at_stack, buf, last, i = [], [], [], [], 0, 0
def harvest(a, b):
    body = CSS[a:b].strip()
    if not body: return
    sels = [s for s in sel_stack if s]
    if not sels: return
    ats = [x for x in at_stack if x]
    props = []
    depth, seg = 0, a
    for k in range(a, b):
        c = masked[k]
        if c == '(': depth += 1
        elif c == ')': depth -= 1
        elif c == ';' and depth == 0:
            m = re.match(r'^\s*([-\w]+)\s*:\s*(.+?)\s*$', CSS[seg:k], re.S)
            if m: props.append([m.group(1).lower(), ' '.join(m.group(2).split())])
            seg = k + 1
    m = re.match(r'^\s*([-\w]+)\s*:\s*(.+?)\s*$', CSS[seg:b], re.S)
    if m: props.append([m.group(1).lower(), ' '.join(m.group(2).split())])
    if props:
        rules.append({'sel': sels[-1], 'chain': sels, 'at': ' >> '.join(ats), 'props': props,
                      'line': CSS.count('\n', 0, a) + 1})

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

# one entry per comma-separated simple selector, keeping the rule it came from
DYNAMIC = re.compile(
    r'::?(?:hover|focus-visible|focus-within|focus|active|target|visited|placeholder|'
    r'before|after|selection|backdrop|marker|first-line|first-letter|'
    r'-webkit-[\w-]+|-moz-[\w-]+)\b(?:\([^()]*\))?')
out = []
for r in rules:
    depth, cur, parts = 0, [], []
    for c in r['sel']:
        if c == '(': depth += 1
        elif c == ')': depth -= 1
        if c == ',' and depth == 0: parts.append(''.join(cur)); cur = []
        else: cur.append(c)
    parts.append(''.join(cur))
    for p in parts:
        p = ' '.join(p.split())
        if not p: continue
        probe = DYNAMIC.sub('', p)
        probe = re.sub(r'\s+', ' ', probe).strip()
        # a selector that was nothing but a pseudo-element on html/body is still probe-able
        if probe in ('', '>', '+', '~'): probe = p.split(':')[0].strip() or 'html'
        out.append({'sel': p, 'probe': probe, 'dynamic': probe != p,
                    'at': r['at'], 'line': r['line'], 'props': r['props']})

json.dump(out, open(os.path.join(ROOT, 'tools', 'selectors.json'), 'w'))
print('rules with declarations:', len(rules))
print('comma-split selectors:  ', len(out))
print('needing a dynamic state:', sum(1 for x in out if x['dynamic']))
print('inside a media query:   ', sum(1 for x in out if x['at']))

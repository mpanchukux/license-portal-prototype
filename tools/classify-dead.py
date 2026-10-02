#!/usr/bin/env python3
"""Classify the selectors that matched nothing, and price them against VALUES.md's axes.

Input:  tools/selectors.json (census), tools/unmatched.json (the probes that never matched)
Output: tools/dead-report.json
"""
import re, json, os, sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SELS = json.load(open(os.path.join(ROOT, 'tools', 'selectors.json')))
UNM  = set(json.load(open(os.path.join(ROOT, 'tools', 'unmatched.json'))))

# ---- what the SOURCE knows about, so "never rendered" can be told from "never written"
src = ''
for fn in sorted(os.listdir(ROOT)):
    if fn.endswith('.js') or fn.endswith('.html'):
        t = open(os.path.join(ROOT, fn), encoding='utf-8').read()
        t = re.sub(r'/\*.*?\*/', '', t, flags=re.S)
        t = re.sub(r'<!--.*?-->', '', t, flags=re.S)
        src += '\n' + t

def in_source(tok):
    """is this class or id ever written by the product's own code?"""
    return re.search(r'[\'"\s.#]' + re.escape(tok) + r'[\'"\s,.:\[\]]', src) is not None

STATE = re.compile(
    r'(:disabled|:checked|:empty|:hover|:focus|\[hidden\]|\[disabled\]|\[aria-expanded="true"\]|'
    r'\[aria-sort="ascending"\]|\.is-[\w-]+|\.on\b|\.off\b|\.err\b|\.show\b|\.done\b|\.over\b|'
    r'\.attn\b|\.muted\b|\.docked\b|\.pinned\b|\.baseline\b|\.locked\b|\.wide\b|\.right\b|'
    r'\.center\b|\.blocked\b|\.open\b|list-empty|\.is-bad|\.sel\b|\.alt\b)')
COMBINATOR = re.compile(r'[\s>+~]')

KEYFRAME = re.compile(r'^(from|to|\d+(\.\d+)?%)$')

groups = {1: [], 2: [], 3: []}
for s in SELS:
    if s['probe'] not in UNM: continue
    if KEYFRAME.match(s['probe'].strip()): continue   # @keyframes stop, not a selector
    toks = re.findall(r'[.#]([-\w]+)', s['probe'])
    missing = [t for t in toks if not in_source(t)]
    if missing:
        groups[2].append((s, missing))
    elif STATE.search(s['probe']):
        groups[1].append((s, []))
    elif COMBINATOR.search(s['probe'].strip()):
        groups[3].append((s, []))
    else:
        groups[1].append((s, []))      # written somewhere, never rendered in any state reached

# ---- price it against the VALUES.md axes
SPACING = {'margin','margin-top','margin-right','margin-bottom','margin-left','margin-inline',
 'margin-block','padding','padding-top','padding-right','padding-bottom','padding-left',
 'padding-inline','padding-block','gap','row-gap','column-gap'}
RADIUS = {'border-radius','border-top-left-radius','border-top-right-radius',
 'border-bottom-left-radius','border-bottom-right-radius'}
BW = {'border-width','border-top-width','border-right-width','border-bottom-width','border-left-width','outline-width'}
BSHORT = {'border','border-top','border-right','border-bottom','border-left','outline'}
HEXRE = re.compile(r'#([0-9a-fA-F]{3,8})\b')
FUNRE = re.compile(r'\b(rgba?|hsla?)\(([^)]*)\)', re.I)
LEN = re.compile(r'^-?(?:\d+\.?\d*|\.\d+)(px|rem|em|%|vh|vw|ch|s|ms)?$', re.I)

def toks_of(v):
    out, depth, cur = [], 0, []
    for c in v:
        if c == '(': depth += 1
        elif c == ')': depth -= 1
        if depth == 0 and c in ' \t':
            if cur: out.append(''.join(cur)); cur = []
        else: cur.append(c)
    if cur: out.append(''.join(cur))
    return out

def axis_values(prop, val):
    """-> list of (axis, value) this declaration contributes"""
    got = []
    for m in HEXRE.finditer(val):
        h = m.group(1)
        if len(h) in (3,4,6,8): got.append(('colour', '#'+h.upper()))
    for m in FUNRE.finditer(val): got.append(('colour', ' '.join(m.group(0).split()).lower()))
    if prop == 'font-size': got += [('font-size', t) for t in toks_of(val)]
    if prop == 'font-weight': got += [('font-weight', val)]
    if prop == 'line-height': got += [('line-height', val)]
    if prop == 'font-family': got += [('font-family', ' '.join(val.split()))]
    if prop == 'letter-spacing': got += [('letter-spacing', val)]
    if prop in SPACING: got += [('spacing', t) for t in toks_of(val) if LEN.match(t) or t.startswith('var(')]
    if prop in RADIUS: got += [('radius', t) for t in toks_of(val.replace('/',' '))]
    if prop in BW: got += [('border-width', t) for t in toks_of(val)]
    if prop in BSHORT:
        t = toks_of(val)
        if t: got += [('border-width', t[0])]
    if prop == 'box-shadow' and val.lower() != 'none': got += [('box-shadow', ' '.join(val.split()))]
    if prop in ('transition','transition-duration','animation','animation-duration','animation-delay'):
        got += [('duration', m.group(0)) for m in re.finditer(r'(?<![-\w.])\d*\.?\d+(ms|s)(?![-\w])', val)]
    if prop in ('transition','transition-timing-function','animation','animation-timing-function'):
        got += [('easing', m.group(0)) for m in re.finditer(r'\b(ease-in-out|ease-in|ease-out|ease|linear)\b|cubic-bezier\([^)]*\)', val)]
    if prop == 'z-index': got += [('z-index', val)]
    # VALUES.md's "Icon sizes" axis: --ic-* definitions and every var(--ic-*) read
    if prop.startswith('--ic-'): got += [('icon-size', val.strip())]
    got += [('icon-size', 'var(%s)' % m.group(1)) for m in re.finditer(r'var\((--ic-[\w-]+)\)', val)]
    return got

live_vals, dead_vals, dead_occ, all_occ = defaultdict(set), defaultdict(set), Counter(), Counter()
deadset = set(s['probe'] for s, _ in groups[2] + groups[3])
BPRE = re.compile(r'(min|max)-width:\s*(\d+)px')
for s in SELS:
    isdead = s['probe'] in deadset
    for prop, val in s['props']:
        for axis, v in axis_values(prop, val):
            all_occ[axis] += 1
            (dead_vals if isdead else live_vals)[axis].add(v)
            if isdead: dead_occ[axis] += 1
    # VALUES.md also counts width/height on a selector whose RIGHTMOST compound is an icon
    right = re.split(r'[\s>+~]+', s['sel'].strip())[-1]
    if re.search(r'\.ic(-(16|20|24|30))?\b', right):
        for prop, val in s['props']:
            if prop in ('width', 'height') and 'var(--ic-' not in val:
                all_occ['icon-size'] += 1
                (dead_vals if isdead else live_vals)['icon-size'].add(val.strip())
                if isdead: dead_occ['icon-size'] += 1
    # the breakpoint axis: one contribution per declaration living inside a @media block
    for m in BPRE.finditer(s.get('at') or ''):
        v = '%s-width: %spx' % (m.group(1), m.group(2))
        for _ in s['props']:
            all_occ['breakpoint'] += 1
            (dead_vals if isdead else live_vals)['breakpoint'].add(v)
            if isdead: dead_occ['breakpoint'] += 1

report = {
    'counts': {str(k): {'declarations': len(v), 'probes': len(set(x['probe'] for x, _ in v))}
               for k, v in groups.items()},
    'groups': {str(k): [{'sel': s['sel'], 'line': s['line'], 'at': s['at'],
                         'props': [p[0] for p in s['props']], 'missing': miss}
                        for s, miss in v] for k, v in groups.items()},
    'axes': {}
}
for axis in sorted(set(list(live_vals) + list(dead_vals))):
    only_dead = dead_vals[axis] - live_vals[axis]
    report['axes'][axis] = {
        'distinctTotal': len(live_vals[axis] | dead_vals[axis]),
        'distinctOnlyDead': len(only_dead),
        'occTotal': all_occ[axis],
        'occFromDead': dead_occ[axis],
        'examples': sorted(only_dead)[:8]}
json.dump(report, open(os.path.join(ROOT, 'tools', 'dead-report.json'), 'w'), indent=1)
for n, name in ((1,'unreachable state'), (2,'never written   '), (3,'structure mismatch')):
    print('group %d (%s): %4d declarations  %4d distinct selectors'
          % (n, name, len(groups[n]), len(set(x['probe'] for x, _ in groups[n]))))

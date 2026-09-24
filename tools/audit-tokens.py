#!/usr/bin/env python3
"""Audit the prototype's design values and write AUDIT.md.

WHAT IT DOES
  Reads styles.css, every page and every script, and answers three questions:
    A  which declared tokens nothing references (plus: declared twice, same value twice)
    B  which literal values are written where a token exists or should
    C  which values are near-duplicates of each other

  Colour distance is CIEDE2000 in CIELAB, not a hex comparison: two greys one hex step
  apart can be invisible while another pair is not, and that is the whole point of
  measuring it. Numeric clusters are grouped per property family with a family-specific
  tolerance (see NUM_TOL).

WHAT IT DELIBERATELY DOES NOT DO
  It never says which value should survive. It counts and measures; the choice is a
  design decision and stays with a person.

READING RULES THAT MATTER (they are why the numbers are what they are)
  · COMMENTS ARE STRIPPED FIRST, in CSS and in JS. This file is heavily commented and
    the comments are full of hex codes and pixel measurements ("measured at 1024",
    "#BDC1FF"); counting them would roughly double every figure and every one of the
    extra hits would be prose, not a decision.
  · Only DECLARATIONS are read, never selectors, so `.pc-feat` is not a value and
    `@media (max-width:600px)` is collected as a breakpoint, not as a spacing value.
  · In JS and HTML only real style writes count: a `style="..."` attribute, an
    `el.style.prop = ...`, or a `cssText`. A hex inside a sentence is prose.
  · assets/*.svg is generated (see build-icons.py) and is not audited.

USAGE
    python3 tools/audit-tokens.py            # rewrites AUDIT.md in the repo root
    python3 tools/audit-tokens.py --check    # prints the summary only, writes nothing
"""
import io, os, re, sys, math, json
from collections import defaultdict, OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'AUDIT.md')

SKIP_DIRS = {'node_modules', '.git', '.icon-cache', 'assets', 'fonts', 'tools'}


# ---------------------------------------------------------------------------
# files
# ---------------------------------------------------------------------------
def files():
    out = []
    for name in sorted(os.listdir(ROOT)):
        if name in SKIP_DIRS or name.startswith('.'):
            continue
        path = os.path.join(ROOT, name)
        if os.path.isfile(path) and name.rsplit('.', 1)[-1] in ('css', 'js', 'html'):
            out.append(name)
    return out


def blank(src, a, b):
    """Replace src[a:b] with the same number of newlines, so line numbers survive."""
    return src[:a] + re.sub(r'[^\n]', ' ', src[a:b]) + src[b:]


def strip_comments(src, kind):
    """/* */ everywhere; // only in JS, and only when it is not inside a string or a URL."""
    out = src
    for m in reversed(list(re.finditer(r'/\*.*?\*/', out, re.S))):
        out = blank(out, m.start(), m.end())
    if kind == 'html':
        for m in reversed(list(re.finditer(r'<!--.*?-->', out, re.S))):
            out = blank(out, m.start(), m.end())
    if kind == 'js':
        lines = out.split('\n')
        for i, line in enumerate(lines):
            q = None
            for j, ch in enumerate(line):
                if q:
                    if ch == '\\':
                        continue
                    if ch == q:
                        q = None
                elif ch in '\'"`':
                    q = ch
                elif ch == '/' and j + 1 < len(line) and line[j + 1] == '/':
                    if j > 0 and line[j - 1] == ':':      # a bare http:// in a string-less spot
                        continue
                    lines[i] = line[:j] + ' ' * (len(line) - j)
                    break
        out = '\n'.join(lines)
    return out


# ---------------------------------------------------------------------------
# colour maths — sRGB -> linear -> XYZ(D65) -> Lab -> CIEDE2000
# ---------------------------------------------------------------------------
def _lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgb_to_lab(rgb):
    r, g, b = (_lin(v) for v in rgb)
    x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047
    y = (0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / 1.00000
    z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883
    f = lambda t: t ** (1.0 / 3) if t > 216 / 24389.0 else (841 / 108.0) * t + 4 / 29.0
    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def ciede2000(lab1, lab2):
    L1, a1, b1 = lab1
    L2, a2, b2 = lab2
    kL = kC = kH = 1.0
    C1 = math.hypot(a1, b1)
    C2 = math.hypot(a2, b2)
    Cb = (C1 + C2) / 2.0
    G = 0.5 * (1 - math.sqrt(Cb ** 7 / (Cb ** 7 + 25.0 ** 7))) if Cb > 0 else 0.0
    a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p = math.degrees(math.atan2(b1, a1p)) % 360 if (a1p or b1) else 0.0
    h2p = math.degrees(math.atan2(b2, a2p)) % 360 if (a2p or b2) else 0.0
    dLp = L2 - L1
    dCp = C2p - C1p
    if C1p * C2p == 0:
        dhp = 0.0
    else:
        dh = h2p - h1p
        dhp = dh - 360 if dh > 180 else (dh + 360 if dh < -180 else dh)
    dHp = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dhp) / 2)
    Lbp = (L1 + L2) / 2.0
    Cbp = (C1p + C2p) / 2.0
    if C1p * C2p == 0:
        hbp = h1p + h2p
    else:
        s = h1p + h2p
        if abs(h1p - h2p) > 180:
            hbp = (s + 360) / 2.0 if s < 360 else (s - 360) / 2.0
        else:
            hbp = s / 2.0
    T = (1 - 0.17 * math.cos(math.radians(hbp - 30))
           + 0.24 * math.cos(math.radians(2 * hbp))
           + 0.32 * math.cos(math.radians(3 * hbp + 6))
           - 0.20 * math.cos(math.radians(4 * hbp - 63)))
    dTh = 30 * math.exp(-(((hbp - 275) / 25.0) ** 2))
    Rc = 2 * math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25.0 ** 7)) if Cbp > 0 else 0.0
    Sl = 1 + (0.015 * (Lbp - 50) ** 2) / math.sqrt(20 + (Lbp - 50) ** 2)
    Sc = 1 + 0.045 * Cbp
    Sh = 1 + 0.015 * Cbp * T
    Rt = -math.sin(math.radians(2 * dTh)) * Rc
    return math.sqrt((dLp / (kL * Sl)) ** 2 + (dCp / (kC * Sc)) ** 2 + (dHp / (kH * Sh)) ** 2
                     + Rt * (dCp / (kC * Sc)) * (dHp / (kH * Sh)))


HEX = re.compile(r'#([0-9a-fA-F]{3,8})\b')
RGBF = re.compile(r'rgba?\(([^()]*)\)')
NAMED = {'white': (255, 255, 255), 'black': (0, 0, 0), 'transparent': None,
         'currentColor': None, 'inherit': None, 'none': None}


def parse_color(tok):
    """-> ((r,g,b), alpha) or None. Alpha is kept so #fff and rgba(255,255,255,.5)
    are not reported as the same colour."""
    tok = tok.strip()
    m = HEX.fullmatch(tok)
    if m:
        h = m.group(1)
        if len(h) == 3:
            h = ''.join(c * 2 for c in h)
        if len(h) == 4:
            h = ''.join(c * 2 for c in h)
        if len(h) == 6:
            return ((int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)), 1.0)
        if len(h) == 8:
            return ((int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)), int(h[6:8], 16) / 255.0)
        return None
    m = RGBF.fullmatch(tok)
    if m:
        parts = re.split(r'[,\s/]+', m.group(1).strip())
        parts = [p for p in parts if p]
        if len(parts) < 3:
            return None
        try:
            vals = [float(p.rstrip('%')) for p in parts[:3]]
        except ValueError:
            return None
        a = 1.0
        if len(parts) > 3:
            try:
                a = float(parts[3].rstrip('%')) / (100 if parts[3].endswith('%') else 1)
            except ValueError:
                a = 1.0
        return ((int(vals[0]), int(vals[1]), int(vals[2])), a)
    if tok in NAMED and NAMED[tok]:
        return (NAMED[tok], 1.0)
    return None


def fmt_color(c):
    (r, g, b), a = c
    hexs = '#%02x%02x%02x' % (r, g, b)
    return hexs if a >= 0.999 else '%s @ %g alpha' % (hexs, round(a, 3))


# ---------------------------------------------------------------------------
# property families — what kind of decision a declaration expresses
# ---------------------------------------------------------------------------
FAMILY = [
    ('colour',        re.compile(r'^(color|background|background-color|border(-(top|right|bottom|left))?-color|'
                                 r'outline-color|fill|stroke|caret-color|text-decoration-color|'
                                 r'accent-color|column-rule-color|border-color)$')),
    ('shadow',        re.compile(r'^(box-shadow|text-shadow|filter|backdrop-filter|-webkit-backdrop-filter)$')),
    ('radius',        re.compile(r'^border(-[a-z]+)?-radius$')),
    ('border-width',  re.compile(r'^(border|border-(top|right|bottom|left)|outline|column-rule)(-width)?$')),
    ('font-size',     re.compile(r'^font-size$')),
    ('font-weight',   re.compile(r'^font-weight$')),
    ('font-family',   re.compile(r'^font-family$')),
    ('font-shorthand', re.compile(r'^font$')),
    ('line-height',   re.compile(r'^line-height$')),
    ('letter-spacing', re.compile(r'^letter-spacing$')),
    ('spacing',       re.compile(r'^(margin|padding)(-(top|right|bottom|left))?$')),
    ('gap',           re.compile(r'^(gap|row-gap|column-gap|grid-gap)$')),
    ('size',          re.compile(r'^(width|height|min-width|min-height|max-width|max-height|flex-basis|'
                                 r'top|right|bottom|left|inset)$')),
    ('opacity',       re.compile(r'^opacity$')),
    ('z-index',       re.compile(r'^z-index$')),
    ('transition',    re.compile(r'^(transition|transition-duration|transition-delay|animation|'
                                 r'animation-duration|animation-delay|transition-timing-function|'
                                 r'animation-timing-function)$')),
]

# how close two numbers of a family have to be to count as the same idea
# ⚠️ These are IDEA-sized, not pair-sized. A 3px tolerance on spacing produced 12
# separate "clusters" per family — every adjacent pair on a dense number line — and 75
# clusters in total, which is 75 decisions and therefore no decision at all. The span is
# now wide enough that a family collapses into two or three bands: "the small radii" is
# one idea, "6px vs 8px" is not.
NUM_TOL = {'font-size': 4.0, 'radius': 8.0, 'border-width': 0.6, 'letter-spacing': 0.02,
           'line-height': 0.15, 'spacing': 8.0, 'gap': 8.0, 'icon-size': 8.0,
           'font-weight': 100.0, 'opacity': 0.15, 'z-index': 40.0, 'duration': 0.12}
# a cluster nobody uses is not a decision worth surfacing
MIN_CLUSTER_USES = 5


def family_of(prop):
    for name, rx in FAMILY:
        if rx.match(prop):
            return name
    return None


NUMBER = re.compile(r'(-?\d*\.?\d+)(px|rem|em|ch|vh|vw|%|s|ms|deg)?\b')
VARREF = re.compile(r'var\(\s*(--[a-zA-Z0-9_-]+)')
CALC = re.compile(r'calc\(')


# ---------------------------------------------------------------------------
# collection
# ---------------------------------------------------------------------------
class Audit(object):
    def __init__(self):
        self.decl = OrderedDict()        # token -> [ (value, file, line, selector) ]
        self.uses = defaultdict(list)    # token -> [ (file, line) ]
        self.raw = defaultdict(list)     # (family, prop, literal) -> [ (file, line) ]
        self.breakpoints = defaultdict(list)
        self.families = defaultdict(int)
        self.dynamic = []                # var(--x' + … ) — computed token names
        self.dyn_uses = defaultdict(list)  # token -> where a computed name reaches it
        self.shadows = defaultdict(list)   # the whole box-shadow string, not its parts
        self.fallbacks = set()           # referenced with a var(--x, fallback)

    # ---- declarations and var() references -------------------------------
    def scan_tokens(self, name, src, kind):
        """CSS: every custom property, with the selector and the @media it sits in.
        HTML/JS: ONLY real style writes — a `style="--x:…"`, a cssText, or a
        setProperty. Prose matches otherwise: the styleguide PRINTS `--pageW: 1120px`
        as documentation, and reading that as a declaration is how a doc page ends up
        redefining the system it documents."""
        if kind == 'css':
            for tok, val, i, sel, at in self.css_declarations(src):
                if tok.startswith('--'):
                    self.decl.setdefault(tok, []).append((val, name, i, sel, at))
        else:
            for i, line in enumerate(src.split('\n'), 1):
                zones = []
                for m in re.finditer(r'style\s*=\s*(["\'])(.*?)\1', line):
                    zones.append(m.group(2))
                for m in re.finditer(r'cssText\s*=\s*[\'"`]([^\'"`]*)', line):
                    zones.append(m.group(1))
                for z in zones:
                    for m in re.finditer(r'(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+)', z):
                        self.decl.setdefault(m.group(1), []).append(
                            (m.group(2).strip(), name, i, 'inline style', ''))
                for m in re.finditer(r'setProperty\(\s*[\'"](--[a-zA-Z0-9_-]+)[\'"]\s*,\s*([^)]*)', line):
                    self.decl.setdefault(m.group(1), []).append(
                        (m.group(2).strip()[:40], name, i, 'setProperty (runtime)', ''))

        for i, line in enumerate(src.split('\n'), 1):
            for m in VARREF.finditer(line):
                tail = line[m.end():m.end() + 2]
                # `var(--t-' + name + ')` — the token name is computed, not a reference
                if kind == 'js' and (tail.startswith("'") or tail.startswith('"')
                                     or tail.startswith('`')):
                    # `var(--t-' + k + '-fs)` -> prefix `--t-`, suffix `-fs`
                    tmpl = re.match(r"var\(\s*(--[\w-]*)['\"`]\s*\+[^+]+\+\s*['\"`]([\w-]*)\)",
                                    line[m.start():m.start() + 120])
                    pre, suf = (tmpl.group(1), tmpl.group(2)) if tmpl else (m.group(1), '')
                    self.dynamic.append((name, i, pre, suf, line.strip()[:76]))
                    continue
                self.uses[m.group(1)].append((name, i))
                if re.match(r'\s*,', line[m.end():]):
                    self.fallbacks.add(m.group(1))

    @staticmethod
    def css_declarations(src):
        """Walk the sheet keeping the selector stack and the enclosing at-rule."""
        stack, at = [], []
        for i, line in enumerate(src.split('\n'), 1):
            pos = 0
            while pos < len(line):
                o = line.find('{', pos)
                c = line.find('}', pos)
                nxt = min(x for x in (o, c) if x >= 0) if (o >= 0 or c >= 0) else -1
                seg = line[pos:nxt if nxt >= 0 else len(line)]
                if stack:
                    for part in seg.split(';'):
                        if ':' in part:
                            k, _, v = part.partition(':')
                            k = k.strip()
                            if k.startswith('--'):
                                yield (k, v.strip(), i, stack[-1][:60],
                                       ' / '.join(at)[:60])
                if nxt < 0:
                    break
                if nxt == o:
                    head = seg.strip() or '?'
                    if head.startswith('@'):
                        at.append(head)
                        stack.append(head)
                    else:
                        stack.append(head)
                    pos = o + 1
                else:
                    if stack:
                        top = stack.pop()
                        if top.startswith('@') and at and at[-1] == top:
                            at.pop()
                    pos = c + 1

    # ---- literal values ---------------------------------------------------
    def add_decl_value(self, name, lineno, prop, value):
        prop = prop.strip().lower().lstrip('*')
        if prop.startswith('--'):
            return
        fam = family_of(prop)
        if not fam:
            return
        value = value.strip()
        if not value or value.startswith('var(') and '(' not in value[4:]:
            return
        self.families[fam] += 1

        if prop in ('box-shadow', 'text-shadow') and 'var(' not in value and value != 'none':
            self.shadows[re.sub(r'\s+', ' ', value.strip())].append((name, lineno))

        # ⚠️ COLOUR IS EXTRACTED FROM EVERY RECOGNISED DECLARATION, not only from the
        # properties whose NAME is about colour. `border: 1px solid #fff` is a colour
        # decision living in a shorthand whose family is border-width, and scoping the
        # search by family missed 46 of them — a third of every white in the sheet.
        if True:
            # filed under `colour` whatever the property's own family is — that is the
            # decision being made, and `border: 1px solid #fff` makes two of them
            for m in HEX.finditer(value):
                c = parse_color(m.group(0))
                if c:
                    self.raw[('colour', prop, fmt_color(c))].append((name, lineno))
            for m in RGBF.finditer(value):
                c = parse_color(m.group(0))
                if c:
                    self.raw[('colour', prop, fmt_color(c))].append((name, lineno))
            for w in ('white', 'black'):
                if re.search(r'\b%s\b' % w, value):
                    self.raw[('colour', prop, fmt_color((NAMED[w], 1.0)))].append((name, lineno))

        if fam in ('shadow', 'transition', 'font-shorthand'):
            for m in NUMBER.finditer(value):
                if m.group(2) in ('s', 'ms'):
                    secs = float(m.group(1)) / (1000 if m.group(2) == 'ms' else 1)
                    if secs > 0:
                        self.raw[('duration', prop, '%gs' % round(secs, 4))].append((name, lineno))
            for w in re.findall(r'\b(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end|'
                                r'cubic-bezier\([^()]*\))', value):
                self.raw[('easing', prop, w)].append((name, lineno))

        if fam in ('font-size', 'radius', 'border-width', 'letter-spacing', 'line-height',
                   'spacing', 'gap', 'size', 'opacity', 'z-index', 'font-weight'):
            if CALC.search(value):
                return                               # a computed value is not a literal choice
            if 'var(' in value:
                value = re.sub(r'var\([^()]*\)', '', value)
            for m in NUMBER.finditer(value):
                num, unit = m.group(1), m.group(2) or ''
                if fam in ('opacity', 'z-index', 'font-weight') and unit:
                    continue
                if fam == 'line-height' and unit not in ('', 'px', 'em', 'rem'):
                    continue
                if fam in ('font-size', 'radius', 'border-width', 'letter-spacing',
                           'spacing', 'gap', 'size') and unit not in ('px', 'em', 'rem', 'ch'):
                    continue
                lit = num + unit
                if fam == 'spacing' and num == '0':
                    continue
                famk = fam
                if fam == 'size':
                    # ⚠️ `size` is two different things wearing one property family.
                    # A width of 40px on a control and a max-width of 1180px on a page
                    # column are not the same kind of decision, and clustering them
                    # together produced ten "Box sizes" clusters of pure layout geometry.
                    # Split: small width/height IS the control-and-icon scale and is
                    # clustered; everything else is reported in List B and left alone.
                    small = prop in ('width', 'height', 'min-width', 'min-height')
                    try:
                        px = float(num) * (16 if unit in ('em', 'rem') else 1)
                    except ValueError:
                        px = 1e9
                    famk = 'icon-size' if (small and unit in ('px', 'em', 'rem')
                                           and 0 < px <= 64) else 'layout-size'
                self.raw[(famk, prop, lit)].append((name, lineno))

        if fam == 'font-family':
            fam_name = value.split(',')[0].strip().strip('\'"')
            if fam_name and not fam_name.startswith('var('):
                self.raw[('font-family', prop, fam_name)].append((name, lineno))

    def scan_css(self, name, src):
        depth = 0
        for i, line in enumerate(src.split('\n'), 1):
            for m in re.finditer(r'@media[^{]*\(([a-z-]+)\s*:\s*([0-9.]+)px\)', line):
                self.breakpoints['%s: %spx' % (m.group(1), m.group(2))].append((name, i))
            body = line
            # keep only what is inside a rule body on this line
            if '{' in body:
                body = body[body.index('{') + 1:]
            for part in re.split(r'[;{}]', body):
                if ':' not in part:
                    continue
                prop, _, val = part.partition(':')
                if re.match(r'^\s*[-a-zA-Z]+\s*$', prop):
                    self.add_decl_value(name, i, prop, val)

    def scan_inline(self, name, src):
        """Style writes in a page or a script — the only places a literal is a decision."""
        for i, line in enumerate(src.split('\n'), 1):
            chunks = []
            for m in re.finditer(r'style\s*=\s*(["\'])(.*?)\1', line):
                chunks.append(m.group(2))
            for m in re.finditer(r'style\s*=\s*\\(["\'])(.*?)\\\1', line):
                chunks.append(m.group(2))
            for m in re.finditer(r'\.style\.([a-zA-Z]+)\s*=\s*[\'"`]([^\'"`]*)', line):
                prop = re.sub(r'([A-Z])', lambda x: '-' + x.group(1).lower(), m.group(1))
                self.add_decl_value(name, i, prop, m.group(2))
            for m in re.finditer(r'cssText\s*=\s*[\'"`]([^\'"`]*)', line):
                chunks.append(m.group(1))
            for m in re.finditer(r'\.style\.setProperty\(\s*[\'"]([^\'"]+)[\'"]\s*,\s*[\'"]([^\'"]*)', line):
                self.add_decl_value(name, i, m.group(1), m.group(2))
            for ch in chunks:
                for part in ch.split(';'):
                    if ':' not in part:
                        continue
                    prop, _, val = part.partition(':')
                    if re.match(r'^\s*[-a-zA-Z]+\s*$', prop):
                        self.add_decl_value(name, i, prop, val)

    def run(self):
        for name in files():
            kind = name.rsplit('.', 1)[-1]
            src = io.open(os.path.join(ROOT, name), encoding='utf-8').read()
            src = strip_comments(src, kind)
            self.scan_tokens(name, src, kind)
            if kind == 'css':
                self.scan_css(name, src)
            else:
                self.scan_inline(name, src)
        self.resolve_dynamic()
        return self

    def resolve_dynamic(self):
        """A computed token name is still a reference. styleguide.js builds
        `--t-<tier>-fs` for every tier it prints, which reaches tokens no static
        grep can see — and calling those tokens unused would be the audit's own
        biggest error. Each template becomes a regex over the declared names; what it
        matches is recorded SEPARATELY from a static reference, because the evidence is
        weaker: the template proves the shape, not that the key is ever that value."""
        for f, ln, pre, suf, txt in self.dynamic:
            rx = re.compile('^' + re.escape(pre) + '.+' + re.escape(suf) + '$')
            for tok in self.decl:
                if rx.match(tok):
                    self.dyn_uses[tok].append((f, ln))


# ---------------------------------------------------------------------------
# clustering
# ---------------------------------------------------------------------------
def cluster_colours(items, threshold=6.0):
    """items: [(label, count, locs, rgb, alpha)] -> single-linkage clusters by CIEDE2000."""
    labs = [(rgb_to_lab(it[3]), it) for it in items]
    groups = []
    for lab, it in labs:
        placed = None
        for g in groups:
            if any(ciede2000(lab, l2) <= threshold and abs(it[4] - i2[4]) < 0.2 for l2, i2 in g):
                placed = g
                break
        if placed is None:
            groups.append([(lab, it)])
        else:
            placed.append((lab, it))
    return [g for g in groups if len(g) > 1]


def cluster_numbers(items, tol):
    """items: [(label, count, locs, number)] -> clusters whose whole SPAN is <= tol.

    ⚠️ Span, not neighbour distance. Chaining on neighbours turns a dense number line
    into one useless blob — with a 3px tolerance every spacing value from 2 to 40 joins
    a single 37-member "cluster", which answers nothing. Bounding the span keeps a
    cluster to one idea: `6px` and `8px` are the same decision, `6px` and `40px` are not.
    """
    items = sorted(items, key=lambda x: x[3])
    groups, cur = [], []
    for it in items:
        if cur and it[3] - cur[0][3] <= tol:
            cur.append(it)
        else:
            if len(cur) > 1:
                groups.append(cur)
            cur = [it]
    if len(cur) > 1:
        groups.append(cur)
    return groups


def trunc(items, width=58):
    """Join and cut at a comma, never mid-word — a column reading `padding-left, pa`
    is a column that has to be re-derived by hand."""
    out = []
    for x in items:
        if sum(len(y) + 2 for y in out) + len(x) > width:
            out.append('…')
            break
        out.append(x)
    return ', '.join(out)


def locs_str(locs, cap=None):
    by = defaultdict(list)
    for f, l in locs:
        by[f].append(l)
    parts = []
    for f in sorted(by):
        ls = sorted(set(by[f]))
        shown = ls if cap is None or len(ls) <= cap else ls[:cap]
        s = ','.join(str(x) for x in shown)
        if cap is not None and len(ls) > cap:
            s += ',+%d more' % (len(ls) - cap)
        parts.append('`%s`:%s' % (f, s))
    return ' · '.join(parts)


# ---------------------------------------------------------------------------
# report
# ---------------------------------------------------------------------------
def build(a):
    L = []
    w = L.append

    # ---- token bookkeeping ----
    declared = a.decl
    used = {t: v for t, v in a.uses.items()}
    unused = [t for t in declared if t not in used and t not in a.dyn_uses]
    dyn_only = [t for t in declared if t not in used and t in a.dyn_uses]
    undeclared = sorted(t for t in used if t not in declared)
    twice = [(t, v) for t, v in declared.items() if len(v) > 1]
    byval = defaultdict(list)
    for t, v in declared.items():
        byval[v[0][0].strip()].append(t)
    samevalue = {k: v for k, v in byval.items() if len(v) > 1}

    # ---- raw values ----
    raw_items = []
    for (fam, prop, lit), locs in a.raw.items():
        raw_items.append((fam, prop, lit, len(locs), locs))
    raw_total = sum(r[3] for r in raw_items)

    token_values = defaultdict(list)
    for t, v in declared.items():
        val = v[0][0].strip()
        c = parse_color(val)
        token_values[fmt_color(c) if c else val].append(t)

    # ---- clusters ----
    clusters = []
    colour_pool = defaultdict(lambda: [0, []])
    for fam, prop, lit, n, locs in raw_items:
        if fam in ('colour', 'shadow'):
            c = parse_color(lit)
            if c:
                colour_pool[lit][0] += n
                colour_pool[lit][1] += locs
    for t, v in declared.items():
        c = parse_color(v[0][0].strip())
        if c:
            lbl = fmt_color(c)
            colour_pool[lbl][0] += len(a.uses.get(t, []))
            colour_pool[lbl][1] += a.uses.get(t, [])
    citems = []
    for lit, (n, locs) in colour_pool.items():
        c = parse_color(lit)
        citems.append((lit, n, locs, c[0], c[1]))
    for g in cluster_colours(citems):
        g = sorted(g, key=lambda x: -x[1][1])
        if sum(i[1][1] for i in g) < MIN_CLUSTER_USES:
            continue
        mem = [(i[1][0], i[1][1], i[1][2], i[0]) for i in g]
        byL = sorted(mem, key=lambda m: rgb_to_lab(parse_color(m[0])[0])[0])
        clusters.append(('colour', 'Colours %s\u2013%s' % (byL[0][0], byL[-1][0]), mem))

    numeric_families = [('font-size', 'Font sizes'), ('radius', 'Border radii'),
                        ('border-width', 'Border widths'), ('spacing', 'Spacing (margin/padding)'),
                        ('gap', 'Gaps'), ('icon-size', 'Control and icon sizes'),
                        ('letter-spacing', 'Letter spacing'),
                        ('line-height', 'Line heights'), ('font-weight', 'Font weights'),
                        ('opacity', 'Opacity'), ('z-index', 'z-index'), ('duration', 'Durations')]
    for fam, title in numeric_families:
        pool = defaultdict(lambda: [0, []])
        for f2, prop, lit, n, locs in raw_items:
            if f2 != fam:
                continue
            pool[lit][0] += n
            pool[lit][1] += locs
        for t, v in declared.items():
            val = v[0][0].strip()
            m = NUMBER.fullmatch(val)
            if not m:
                continue
            unit = m.group(2) or ''
            ok = ((fam in ('font-size', 'radius', 'border-width', 'letter-spacing', 'spacing',
                           'gap', 'icon-size') and unit in ('px', 'em', 'rem', 'ch'))
                  or (fam in ('font-weight', 'opacity', 'z-index', 'line-height') and unit == '')
                  or (fam == 'duration' and unit in ('s', 'ms')))
            if not ok:
                continue
            # ⚠️ A TOKEN ONLY JOINS A FAMILY IT PLAUSIBLY BELONGS TO. Without this the
            # type tokens leaked everywhere: `--t-h2-ls: -0.008em` is a length with a
            # legal unit, so it was landing in the radius, spacing, gap and control-size
            # clusters and producing bands like "Border radii -0.035em–6px".
            TYPE_SUFFIX = ('-fs', '-ls', '-lh', '-fw')
            hint = {'font-size': ('-fs',), 'letter-spacing': ('-ls',),
                    'line-height': ('-lh',), 'font-weight': ('-fw',)}.get(fam)
            if hint:
                if not any(h in t for h in hint):
                    continue
            else:
                if any(h in t for h in TYPE_SUFFIX):
                    continue
                if fam in ('radius', 'spacing', 'gap', 'icon-size', 'border-width') and unit != 'px':
                    continue
            pool[val][0] += len(a.uses.get(t, []))
            pool[val][1] += a.uses.get(t, [])
        items = []
        for lit, (n, locs) in pool.items():
            m = NUMBER.fullmatch(lit)
            if not m:
                continue
            val = float(m.group(1))
            if (m.group(2) or '') in ('em', 'rem'):
                val *= 16
            if (m.group(2) or '') == 'ms':
                val /= 1000.0
            items.append((lit, n, locs, val))
        for g in cluster_numbers(items, NUM_TOL.get(fam, 2.0)):
            if sum(x[1] for x in g) < MIN_CLUSTER_USES:
                continue
            lo = min(x[0] for x in sorted(g, key=lambda x: x[3]))
            hi = max(x[0] for x in sorted(g, key=lambda x: x[3])[-1:])
            span = '%s\u2013%s' % (sorted(g, key=lambda x: x[3])[0][0],
                                    sorted(g, key=lambda x: x[3])[-1][0])
            clusters.append((fam, '%s %s' % (title, span), sorted(g, key=lambda x: -x[1])))

    # shadows are strings, not numbers: one cluster, every distinct shadow in the system
    if len(a.shadows) > 1:
        members = sorted(((v, len(l), l, 0.0) for v, l in a.shadows.items()),
                         key=lambda x: -x[1])
        clusters.append(('shadow-str', 'Shadows', members))
    for fam, title in (('easing', 'Easing curves'), ('font-family', 'Font families')):
        pool = defaultdict(lambda: [0, []])
        for f2, prop, lit, n, locs in raw_items:
            if f2 == fam:
                pool[lit][0] += n
                pool[lit][1] += locs
        if len(pool) > 1:
            members = sorted(((k, v[0], v[1], 0.0) for k, v in pool.items()),
                             key=lambda x: -x[1])
            clusters.append(('str', title, members))

    # =======================================================================
    w('# AUDIT — design values in the prototype\n')
    w('Machine-produced by `tools/audit-tokens.py`. Nothing here was hand-counted; '
      'see **How to re-run** at the end for the exact command and for the reading rules '
      'that decide what counts as a value.\n')
    w('> This file is an audit. It proposes nothing and changes nothing. '
      'The final section, **Рішення**, is left empty on purpose.\n')
    w('Counts were cross-checked against independent greps over the comment-stripped '
      'sheet while the script was being written; where the two disagreed the '
      'disagreement was traced before either was trusted. One worth knowing about: a '
      'naive `\\bwhite\\b` over the file finds 45 more "whites" than this audit does, and '
      'all 45 are the word `white-space`.\n')

    w('## Summary\n')
    w('| | count |')
    w('|---|---|')
    w('| Files read | %d (%d CSS · %d HTML · %d JS) |'
      % (len(files()),
         sum(1 for f in files() if f.endswith('.css')),
         sum(1 for f in files() if f.endswith('.html')),
         sum(1 for f in files() if f.endswith('.js'))))
    w('| Tokens declared | **%d** |' % len(declared))
    w('| Tokens referenced at least once | **%d** |' % len([t for t in declared if t in used]))
    w('| Tokens declared and never referenced | **%d** |' % len(unused))
    w('| Tokens reached only through a computed name | %d |' % len(dyn_only))
    w('| Tokens referenced but never declared | **%d** |' % len(undeclared))
    w('| Tokens declared more than once | %d |' % len(twice))
    w('| Values shared by two or more tokens | %d groups |' % len(samevalue))
    w('| Total `var()` references | %d |' % sum(len(v) for v in a.uses.values()))
    w('| Distinct raw literals bypassing the system | **%d** |' % len(raw_items))
    w('| Raw literal occurrences | **%d** |' % raw_total)
    w('| Distinct `@media` breakpoints | **%d** |' % len(a.breakpoints))
    w('| Distinct box/text shadows | %d |' % len(a.shadows))
    w('| Near-duplicate clusters | **%d** |' % len(clusters))
    w('')
    w('Raw literals by property family:\n')
    w('| family | distinct values | occurrences |')
    w('|---|---|---|')
    fam_tot = defaultdict(lambda: [0, 0])
    for fam, prop, lit, n, locs in raw_items:
        fam_tot[fam][0] += 1
        fam_tot[fam][1] += n
    for fam in sorted(fam_tot, key=lambda f: -fam_tot[f][1]):
        w('| %s | %d | %d |' % (fam, fam_tot[fam][0], fam_tot[fam][1]))
    w('')

    # ---- List A ----
    w('## List A — declared and unused\n')
    w('%d of %d declared tokens are never referenced by a `var()` anywhere in the '
      'prototype — neither statically nor through a computed name (see A0).\n'
      % (len(unused), len(declared)))
    if unused:
        w('| token | value | declared in |')
        w('|---|---|---|')
        for t in unused:
            val, f, ln, sel = declared[t][0][:4]
            w('| `%s` | `%s` | `%s`:%d — `%s` |' % (t, val, f, ln, sel))
    else:
        w('_None._')
    w('')
    w('### A0 — reached ONLY through a computed name\n')
    w('Not unused, but not statically referenced either: `styleguide.js` assembles '
      '`var(--t-<tier>-fs)` and friends for every tier it prints, so these are read by '
      'the page that documents the system and by nothing else. A grep would have called '
      'them dead; they are not. Whether a token used only by its own documentation is '
      'still part of the system is a judgement, not a count.\n')
    if dyn_only:
        w('| token | value | declared in | reached from |')
        w('|---|---|---|---|')
        for t in sorted(dyn_only):
            val, f, ln, sel = declared[t][0][:4]
            w('| `%s` | `%s` | `%s`:%d | %s |' % (t, val, f, ln, locs_str(a.dyn_uses[t])))
    else:
        w('_None._')
    w('')
    w('### A1 — declared in more than one place\n')
    w('Two kinds are mixed here and they are not the same thing. A second declaration '
      'inside an `@media` is an **override** — the intended way a token changes at a '
      'breakpoint. A second declaration under a different selector at the same level is '
      'a **collision**: one name carrying two unrelated decisions. The `@media` column '
      'is what tells them apart.\n')
    if twice:
        w('| token | kind | declarations |')
        w('|---|---|---|')
        for t, v in twice:
            kinds = set()
            for x in v:
                kinds.add('override' if x[4] else 'base')
            kind = 'override' if 'override' in kinds and len(kinds) > 1 else (
                   'collision' if len(set(x[3] for x in v)) > 1 else 'repeat')
            w('| `%s` | %s | %s |'
              % (t, kind, ' · '.join('`%s` in `%s`:%d (`%s`%s)'
                                     % (x[0][:48], x[1], x[2], x[3],
                                        ' inside `%s`' % x[4] if x[4] else '')
                                     for x in v)))
    else:
        w('_None — every token is declared once._')
    w('')
    w('### A2 — different tokens, identical value\n')
    if samevalue:
        w('| value | tokens | uses each |')
        w('|---|---|---|')
        for val, toks in sorted(samevalue.items(), key=lambda kv: -len(kv[1])):
            w('| `%s` | %s | %s |' % (val, ', '.join('`%s`' % t for t in toks),
                                      ', '.join(str(len(a.uses.get(t, []))) for t in toks)))
    else:
        w('_None._')
    w('')
    w('### A3 — referenced but never declared\n')
    w('Not asked for, but it is the same bookkeeping and it is the kind of thing that '
      'fails silently: `var()` falls back or resolves to nothing.\n')
    if undeclared:
        w('| token | has a `var()` fallback | referenced from |')
        w('|---|---|---|')
        for t in undeclared:
            w('| `%s` | %s | %s |' % (t, 'yes' if t in a.fallbacks else '**no**',
                                      locs_str(a.uses[t])))
        w('')
        w('Without a fallback the declaration is simply dropped by the browser, so the '
          'property falls back to its initial value. With a fallback it works and the '
          'token is decorative.\n')
    else:
        w('_None._')
    w('')
    w('### A4 — `var()` with a computed token name\n')
    if a.dynamic:
        w('These build the token name at runtime, so no static reading can tell which '
          'tokens they reach. They are excluded from A3 rather than reported as '
          'undeclared.\n')
        w('| where | pattern | matches | source |')
        w('|---|---|---|---|')
        seen = set()
        for f, ln, pre, suf, txt in a.dynamic:
            key = (f, ln, pre, suf)
            if key in seen:
                continue
            seen.add(key)
            rx = re.compile('^' + re.escape(pre) + '.+' + re.escape(suf) + '$')
            hits = [t for t in a.decl if rx.match(t)]
            w('| `%s`:%d | `%s…%s` | %d | `%s` |'
              % (f, ln, pre, suf, len(hits), txt.replace('|', '\\|')))
    else:
        w('_None._')
    w('')

    # ---- List B ----
    w('## List B — raw values that bypass the system\n')
    w('Grouped by property family, sorted by how often each value appears. '
      'The third column names every token that happens to hold the same value. '
      '⚠️ It is a VALUE match, not a semantic one: a `10px` radius matching a `10px` '
      'spacing token does not mean a radius token exists, it means the two numbers are '
      'equal. For colours the match is usually meaningful; for lengths, read it as a '
      'hint. Values with no match are ones for which a token arguably *should* exist — '
      'that judgement is not made here.\n')
    order = sorted(fam_tot, key=lambda f: -fam_tot[f][1])
    for fam in order:
        rows = [r for r in raw_items if r[0] == fam]
        rows.sort(key=lambda r: (-r[3], r[2]))
        distinct = len(set(r[2] for r in rows))
        w('### %s — %d occurrences over %d distinct values\n'
          % (fam, fam_tot[fam][1], distinct))
        w('| value | n | a token holds this value | properties | where |')
        w('|---|---|---|---|---|')
        props = defaultdict(set)
        merged = defaultdict(lambda: [0, [], set()])
        for f2, prop, lit, n, locs in rows:
            merged[lit][0] += n
            merged[lit][1] += locs
            merged[lit][2].add(prop)
        for lit in sorted(merged, key=lambda k: (-merged[k][0], k)):
            n, locs, ps = merged[lit]
            toks = token_values.get(lit, [])
            w('| `%s` | %d | %s | %s | %s |'
              % (lit, n, ', '.join('`%s`' % t for t in toks) if toks else '—',
                 trunc(sorted(ps)), locs_str(locs, cap=14)))
        w('')

    w('### Breakpoints\n')
    if a.breakpoints:
        w('| condition | n | where |')
        w('|---|---|---|')
        for bp in sorted(a.breakpoints, key=lambda b: -len(a.breakpoints[b])):
            w('| `%s` | %d | %s |' % (bp, len(a.breakpoints[bp]), locs_str(a.breakpoints[bp], cap=14)))
    else:
        w('_None found._')
    w('')

    # ---- List C ----
    w('## List C — near-duplicates\n')
    w('One cluster per idea. Colour distance is **CIEDE2000** (ΔE00) — a perceptual '
      'measure, so it answers "can anyone see this difference" rather than "are the hex '
      'codes different". Rough reading: **ΔE00 < 1** is invisible to anyone, **1–2** is '
      'visible only side by side to a trained eye, **2–5** is visible when the two are '
      'adjacent, **> 5** is plainly two colours. Numeric clusters give the absolute gap.\n')
    w('Counts below combine literal occurrences with `var()` references to a token '
      'holding that same value, so a cluster shows the whole weight of each value, not '
      'only its raw uses.\n')
    for idx, (fam, title, members) in enumerate(clusters, 1):
        w('### C%d · %s — %d values\n' % (idx, title, len(members)))
        w('| value | uses | where |')
        w('|---|---|---|')
        for m in members:
            lit, n, locs = m[0], m[1], m[2]
            toks = token_values.get(lit, [])
            label = '`%s`%s' % (lit, (' (token %s)' % ', '.join('`%s`' % t for t in toks))
                                if toks else '')
            w('| %s | %d | %s |' % (label, n, locs_str(locs, cap=10) or '—'))
        w('')
        w('Distance:\n')
        if fam == 'colour':
            w('| pair | ΔE00 |')
            w('|---|---|')
            for i in range(len(members)):
                for j in range(i + 1, len(members)):
                    ci = parse_color(members[i][0])
                    cj = parse_color(members[j][0])
                    d = ciede2000(rgb_to_lab(ci[0]), rgb_to_lab(cj[0]))
                    note = ''
                    if abs(ci[1] - cj[1]) > 0.001:
                        note = ' (alpha differs: %g vs %g)' % (ci[1], cj[1])
                    w('| `%s` ↔ `%s` | **%.2f**%s |' % (members[i][0], members[j][0], d, note))
        elif fam in ('shadow-str', 'str'):
            if fam == 'shadow-str':
                w('Shadows cannot be subtracted, so what is compared is the three numbers '
                  'that decide how a shadow reads: the vertical offset, the blur, and the '
                  'alpha of its colour.\n')
                w('| shadow | x | y | blur | alpha |')
                w('|---|---|---|---|---|')
                for m in members:
                    cm = re.search(r'rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}', m[0])
                    head = m[0][:cm.start()] if cm else m[0]
                    nums = re.findall(r'-?\d*\.?\d+', head)
                    col = parse_color(cm.group(0)) if cm else None
                    g = lambda i: nums[i] if len(nums) > i else '—'
                    w('| `%s` | %s | %s | %s | %s |'
                      % (m[0][:64], g(0), g(1), g(2), ('%g' % col[1]) if col else '—'))
            else:
                w('_Distinct strings — no numeric distance applies._')
        else:
            w('| pair | gap |')
            w('|---|---|')
            for i in range(len(members)):
                for j in range(i + 1, len(members)):
                    a1 = [x for x in members if x[0] == members[i][0]][0][3]
                    a2 = [x for x in members if x[0] == members[j][0]][0][3]
                    unit = 'px' if fam not in ('font-weight', 'opacity', 'z-index',
                                               'line-height', 'duration') else ''
                    if fam == 'duration':
                        w('| `%s` ↔ `%s` | **%gs** |' % (members[i][0], members[j][0],
                                                          round(abs(a1 - a2), 4)))
                    else:
                        w('| `%s` ↔ `%s` | **%g%s** |' % (members[i][0], members[j][0],
                                                           round(abs(a1 - a2), 4), unit))
        w('')

    # ---- Рішення ----
    w('## Рішення\n')
    w('_One heading per cluster in List C. Intentionally empty — to be filled in by hand '
      'and handed back as the input for the next session._\n')
    for idx, (fam, title, members) in enumerate(clusters, 1):
        vals = trunc(['`%s`' % m[0] for m in members], 120)
        w('### C%d · %s — %s\n' % (idx, title, vals))
        w('')

    # ---- how to re-run ----
    w('## How to re-run\n')
    w('```bash')
    w('python3 tools/audit-tokens.py          # rewrites AUDIT.md')
    w('python3 tools/audit-tokens.py --check  # prints the summary only, writes nothing')
    w('```\n')
    w('No dependencies — standard library only, same as the other scripts in `tools/`. '
      'The numbers are produced by the script, not by reading: nothing in this file is '
      'hand-counted. Re-running overwrites everything above **Рішення** as well as the '
      'headings inside it, so copy that section out before re-running once you have '
      'filled it in.\n')
    w('### What the script counts, and what it refuses to count\n')
    w('- **Comments are stripped first**, in CSS and in JS. This codebase is heavily '
      'commented and the comments are full of hex codes and pixel measurements; counting '
      'them would roughly double every figure with prose.\n'
      '- **Only declarations are read**, never selectors — `@media (max-width:600px)` is '
      'collected as a breakpoint, not as a spacing value.\n'
      '- **In JS and HTML only real style writes count**: a `style="…"` attribute, '
      '`el.style.prop = …`, `cssText`, or `setProperty`. A hex in a sentence is prose.\n'
      '- **`calc()` values are skipped** for numeric families: a computed value is not a '
      'literal choice.\n'
      '- **`assets/*.svg` is not audited** — the sprite and the wordmark are generated '
      '(see `tools/build-icons.py`).\n'
      '- Alpha is kept, so `#fff` and `rgba(255,255,255,.5)` are not merged.\n')
    return '\n'.join(L) + '\n'


def main():
    a = Audit().run()
    text = build(a)
    if '--check' in sys.argv:
        print(text[:text.index('## List A')])
        return 0
    io.open(OUT, 'w', encoding='utf-8').write(text)
    print('wrote %s — %d lines' % (OUT, text.count('\n')))
    return 0


if __name__ == '__main__':
    sys.exit(main())

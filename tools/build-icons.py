#!/usr/bin/env python3
"""Build assets/icons.svg — the prototype's ONLY icon source.

Takes the icons named in ICONS from the pinned @tabler/icons release and writes one
<symbol> per icon into a single sprite. Tabler's own names are kept, prefixed `ti-`.

⚠️ WHY PYTHON AND NOT NODE. The task said "install @tabler/icons with npm". There is no
node, npm or brew on this machine (checked 2026-09-23; NOTES claimed node existed — that
was recorded on the other machine). So the package is fetched as the SAME published
tarball the npm registry serves, and verified by the sha1 the registry publishes for it.
The version is pinned below and printed into the sprite, so the file always says what
produced it. On a machine with npm, `npm i @tabler/icons@<TABLER_VERSION>` gives byte
identical sources and this script reads them from node_modules instead — see SEARCH.

Usage:  python3 tools/build-icons.py
        python3 tools/build-icons.py --check   # verify the sprite is up to date
"""
import hashlib, io, os, re, sys, tarfile, urllib.request

TABLER_VERSION = '3.48.0'
TABLER_SHA1    = '08ad2b8c328ef5115b10ea306a52b6d9271f7b32'
TARBALL        = 'https://registry.npmjs.org/@tabler/icons/-/icons-%s.tgz' % TABLER_VERSION

ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT    = os.path.join(ROOT, 'assets', 'icons.svg')
CACHE  = os.path.join(ROOT, '.icon-cache')          # gitignored; never committed
# where to look for already-installed sources before downloading anything
SEARCH = [os.path.join(ROOT, 'node_modules', '@tabler', 'icons', 'icons')]

# ---------------------------------------------------------------------------
# The closed set. Every name is a real Tabler outline icon; adding one here is
# how the set grows, and it is reported in the pass that adds it (see NOTES).
# ---------------------------------------------------------------------------
ICONS = [
    # navigation and structure
    # ⚠️ The five destinations were renamed 2026-09-24, and the swap is one-for-one:
    #   home -> smart-home · server -> server-2 · receipt -> file-invoice
    #   activity -> history-toggle
    # The four they replace had exactly ONE reader each (NAV_ITEMS), so they leave
    # with them rather than sitting in a closed set nothing draws.
    'smart-home', 'key', 'server-2', 'file-invoice', 'history-toggle',
    'user', 'settings',
    # direction
    'chevron-left', 'chevron-right', 'chevron-down', 'chevron-up',
    'chevrons-left', 'chevrons-right', 'arrow-up', 'arrow-right',
    # actions
    'search', 'refresh', 'plus', 'x', 'check', 'copy', 'pencil', 'download',
    'external-link', 'link', 'dots-vertical', 'repeat', 'trash',
    # state and meaning
    'alert-triangle', 'alert-circle', 'info-circle', 'circle-check', 'clock',
    'lock', 'eye', 'eye-off', 'shield-check', 'point', 'file-text',
    # ⚠️ Nothing in the product uses `device-desktop` — it is here because the
    # styleguide's placement example names it, and an example pointing at a symbol that
    # does not exist is the one broken icon on the page that documents icons.
    'device-desktop',
    # products and brands
    'topology-star', 'rss', 'credit-card',
    'brand-google', 'brand-github', 'brand-mastercard',
    # ⚠️ The one FILLED icon, and it is not decoration: the attention marker on a licence
    # row is a solid ink triangle by the prototype's own rule (state is carried by weight
    # and fill, never by colour), so an outline triangle would read as the quiet variant
    # of itself. `-filled` is Tabler's own suffix for the variant.
    'alert-triangle-filled',
]

ATTRS = ('viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
         'stroke-linecap="round" stroke-linejoin="round"')
# ⚠️ A filled icon paints with `fill`, so it takes neither `fill="none"` nor a stroke —
# the outline defaults would erase it and then draw it again as an outline.
FILLED_ATTRS = 'viewBox="0 0 24 24" fill="currentColor" stroke="none"'


def local_dir():
    for d in SEARCH:
        if os.path.isdir(d):
            return d
    return None


def fetch_tarball():
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, 'tabler-%s.tgz' % TABLER_VERSION)
    if not os.path.exists(path):
        sys.stderr.write('downloading %s\n' % TARBALL)
        with urllib.request.urlopen(TARBALL, timeout=120) as r, open(path, 'wb') as f:
            f.write(r.read())
    got = hashlib.sha1(open(path, 'rb').read()).hexdigest()
    if got != TABLER_SHA1:
        raise SystemExit('tarball sha1 mismatch: %s != %s' % (got, TABLER_SHA1))
    return path


def variant(name):
    """('outline'|'filled', file stem) for a sprite name.

    Tabler ships the two styles in two folders and spells the second one with a
    `-filled` suffix in its own API, so the sprite keeps that spelling too.
    """
    if name.endswith('-filled'):
        return 'filled', name[:-len('-filled')]
    return 'outline', name


def read_sources():
    """name -> inner SVG markup, from node_modules if present, else the tarball."""
    d = local_dir()
    out = {}
    if d:
        for n in ICONS:
            style, stem = variant(n)
            p = os.path.join(d, style, stem + '.svg')
            if not os.path.exists(p):
                raise SystemExit('not in @tabler/icons %s: %s' % (TABLER_VERSION, n))
            out[n] = io.open(p, encoding='utf-8').read()
        return out
    tp = fetch_tarball()
    want = {}
    for n in ICONS:
        style, stem = variant(n)
        want['package/icons/%s/%s.svg' % (style, stem)] = n
    with tarfile.open(tp) as t:
        for m in t.getmembers():
            if m.name in want:
                out[want[m.name]] = t.extractfile(m).read().decode('utf-8')
    missing = [n for n in ICONS if n not in out]
    if missing:
        raise SystemExit('not in @tabler/icons %s: %s' % (TABLER_VERSION, ', '.join(missing)))
    return out


def body_of(svg):
    """Inner markup, minus Tabler's invisible full-bleed hit-area path."""
    inner = svg[svg.index('>') + 1:svg.rindex('</svg>')]
    inner = re.sub(r'<path\s+stroke="none"[^>]*?/>', '', inner)
    inner = re.sub(r'\s+', ' ', inner).strip()
    # nothing may carry its own colour — CSS drives every icon through currentColor
    if re.search(r'(fill|stroke)="(?!none\b|currentColor\b)[^"]+"', inner):
        raise SystemExit('hardcoded colour in %s' % inner[:80])
    return inner


def build():
    src = read_sources()
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- GENERATED by tools/build-icons.py - do not edit by hand.',
        '     Source: @tabler/icons %s (sha1 %s)' % (TABLER_VERSION, TABLER_SHA1),
        '     %d icons. Add one by naming it in ICONS and re-running the script. -->' % len(ICONS),
        '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">',
    ]
    for n in sorted(ICONS):
        # ⚠️ A filled icon is painted by `fill`, so it must NOT inherit the outline
        # defaults — `fill="none"` would erase it and a stroke would outline it twice.
        a = FILLED_ATTRS if n.endswith('-filled') else ATTRS
        parts.append('  <symbol id="ti-%s" %s>%s</symbol>' % (n, a, body_of(src[n])))
    parts.append('</svg>')
    return '\n'.join(parts) + '\n'


if __name__ == '__main__':
    sprite = build()
    if '--check' in sys.argv:
        cur = io.open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else ''
        if cur != sprite:
            raise SystemExit('assets/icons.svg is stale - re-run tools/build-icons.py')
        print('icons.svg up to date (%d icons, tabler %s)' % (len(ICONS), TABLER_VERSION))
    else:
        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        tmp = OUT + '.tmp'
        io.open(tmp, 'w', encoding='utf-8').write(sprite)
        os.replace(tmp, OUT)
        print('wrote %s - %d icons from @tabler/icons %s' % (OUT, len(ICONS), TABLER_VERSION))

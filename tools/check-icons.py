#!/usr/bin/env python3
"""Fail if anything draws its own icon.

Rule (NOTES, "Іконки"): icons come only from assets/icons.svg, placed with
<svg class="ic ..."><use href="assets/icons.svg#ti-NAME"></use></svg>.
Nothing else may draw: no inline <path>, no emoji, no text glyph standing in for an
icon, no second library.

    python3 tools/check-icons.py          # report and exit 1 on any finding
    python3 tools/check-icons.py -v       # list every hit, not just the first few

⚠️ assets/icons.svg is the ONE file allowed to contain drawing elements; it is generated
by tools/build-icons.py and never edited by hand.
"""
import glob, io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPRITE = os.path.join('assets', 'icons.svg')

DRAW = re.compile(r'<\s*(path|circle|rect|line|polyline|polygon|ellipse)\b', re.I)

# Characters that stand in for an icon. Deliberately NOT typography: the em dash,
# middot, bullet, ellipsis and the multiplication sign are punctuation inside
# sentences and stay. These are the ranges that only ever appear as a drawn mark.
GLYPH = re.compile(
    '['
    # ⚠️ These four were MISSED by the first version of this checker and shipped as
    # pagination buttons on three pages. They live in Latin-1 and General Punctuation,
    # not in any symbol block, so no range caught them — and unlike the em dash beside
    # them in those blocks, this codebase never uses a guillemet as quotation. Named
    # one by one, because that is the only honest way to say "this one is a control".
    '«»'        # « »  first / last page
    '‹›'        # ‹ ›  previous / next page
    '←-⇿'      # arrows            → ←
    '⋮'             # vertical ellipsis ⋮
    '⌀-⏿'      # misc technical
    '■-◿'      # geometric shapes  ▾ ●
    '☀-➿'      # misc symbols + dingbats  ✕ ✓ ★
    '⬀-⯿'
    '️'             # variation selector (emoji presentation)
    '\U0001f000-\U0001faff'   # emoji proper
    ']')

# Entities doing the same job in HTML source, where the character itself is ASCII.
ENTITIES = ['&laquo;', '&raquo;', '&lsaquo;', '&rsaquo;']

# ⚠️ Numeric entities are the same characters written another way, and a hand-kept list
# of them falls behind: `&#10005;` was listed and `&#9662;` (▾) was not, so a caret sat
# in a period control through the whole icon migration. Decoded and range-tested, so the
# rule is the rule wherever the glyph hides.
NUMERIC = re.compile(r'&#(x[0-9a-fA-F]+|[0-9]+);')
# ⚠️ A JS string may spell the character as an ESCAPE, and the source then holds six
# ASCII characters that no range test can match. Six glyphs hid this way through the
# whole icon migration — three ✕ on close buttons, an ↗ in a tooltip and two → in the
# wizard's change summary. Decoded and range-tested like every other spelling.
ESCAPED = re.compile(r'\\u([0-9a-fA-F]{4})')


def decoded_glyphs(line):
    """Every way a forbidden glyph can be written without being the character itself."""
    out = []
    for m in NUMERIC.finditer(line):
        raw = m.group(1)
        cp = int(raw[1:], 16) if raw[0] in 'xX' else int(raw)
        if GLYPH.search(chr(cp)):
            out.append((m.group(0), cp))
    for m in ESCAPED.finditer(line):
        cp = int(m.group(1), 16)
        if GLYPH.search(chr(cp)):
            out.append((m.group(0), cp))
    return out


def strip_comments(src, is_html):
    """Blank out comments, keeping line numbers intact.

    ⚠️ COMMENTS ARE NOT MARKUP, and this project writes a lot of them. `⚠️` is how every
    warning in this codebase and in NOTES.md is flagged — hundreds of them. A checker
    that fails on those is a checker nobody can keep green, so it would be turned off,
    and then it guards nothing. What ships to the browser is what is checked.
    """
    out = list(src)

    def blank(a, b):
        for i in range(a, b):
            if out[i] != '\n':
                out[i] = ' '

    i, n = 0, len(src)
    while i < n:
        # ⚠️ An HTML comment is a comment wherever it lives, including inside a JS
        # string that builds markup — `+ '<!-- ... -->'` never reaches the reader, and
        # this codebase writes those too.
        if src.startswith('<!--', i):
            j = src.find('-->', i)
            j = n if j == -1 else j + 3
            blank(i, j); i = j; continue
        if not is_html:
            if src.startswith('/*', i):
                j = src.find('*/', i)
                j = n if j == -1 else j + 2
                blank(i, j); i = j; continue
            if src.startswith('//', i):
                j = src.find('\n', i)
                j = n if j == -1 else j
                blank(i, j); i = j; continue
        i += 1
    return ''.join(out)


def files():
    out = []
    for pat in ('*.html', '*.js'):
        out += sorted(glob.glob(os.path.join(ROOT, pat)))
    return out


def main():
    verbose = '-v' in sys.argv
    findings = []
    for p in files():
        rel = os.path.relpath(p, ROOT)
        if rel == SPRITE:
            continue
        src = strip_comments(io.open(p, encoding='utf-8').read(), rel.endswith('.html'))
        for i, line in enumerate(src.split('\n'), 1):
            m = DRAW.search(line)
            if m:
                findings.append((rel, i, 'drawing element <%s' % m.group(1), line.strip()[:90]))
            g = GLYPH.search(line)
            if g:
                findings.append((rel, i, 'glyph U+%04X %r' % (ord(g.group()), g.group()), line.strip()[:90]))
            for e in ENTITIES:
                if e in line:
                    findings.append((rel, i, 'glyph entity %s' % e, line.strip()[:90]))
            for ent, cp in decoded_glyphs(line):
                findings.append((rel, i, 'glyph entity %s = U+%04X' % (ent, cp), line.strip()[:90]))

    if not findings:
        print('icons: clean - no drawing elements or glyphs outside %s' % SPRITE)
        return 0

    by_file = {}
    for f, ln, what, src in findings:
        by_file.setdefault(f, []).append((ln, what, src))
    print('icons: %d finding(s) in %d file(s)\n' % (len(findings), len(by_file)))
    for f in sorted(by_file):
        hits = by_file[f]
        print('  %s  (%d)' % (f, len(hits)))
        for ln, what, src in (hits if verbose else hits[:4]):
            print('    %5d  %-28s %s' % (ln, what, src))
        if not verbose and len(hits) > 4:
            print('    %5s  ... %d more (-v for all)' % ('', len(hits) - 4))
    return 1


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""Build assets/brand-google.svg and assets/brand-github.svg — the two SIGN-IN marks.

⚠️⚠️ THESE ARE THE SECOND NAMED EXCEPTION TO THE ICON RULE, and they are named by FILES,
exactly as `assets/logo.svg` is. The rule is "nothing draws but icons.svg, colour comes
from `currentColor`, no rule paints an icon". A platform mark cannot obey either half:
GitHub's is its own black and Google's is its own blue, and a mark recoloured to the
page's ink stops being that platform's mark. So they leave the sprite, become files, and
are placed with <img> rather than <use> — which also keeps them out of the one mechanism
the icon checker guards. **An exception that is a file can be counted; a colour allowance
inside the icon rule could not be.**

⚠️ THEY ARE FETCHED, NOT DRAWN. The geometry is simple-icons' (the package the web uses
for brand marks), pinned by version and verified against the sha1 the npm registry
publishes for that tarball — the same contract `build-icons.py` has with Tabler. Nothing
here reconstructs a logo from memory, which for a trademark is the one thing a generator
must never do.

⚠️⚠️ GOOGLE COMES OUT IN ONE COLOUR, AND THAT IS A LIMIT WORTH STATING. The mark most
people picture on a sign-in button is the FOUR-colour G, and that artwork is Google's
own, distributed in their "Sign in with Google" brand kit. simple-icons publishes
single-path marks by policy, so what this script can produce honestly is the same G in
Google's primary brand blue. **If the official four-colour file is dropped in at
`assets/brand-google.svg`, nothing else has to change** — the markup already points there.

Usage:  python3 tools/build-brands.py [--check]
"""
import hashlib, io, json, os, re, socket, sys, tarfile, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, 'assets')
PKG  = 'simple-icons'
VER  = '16.34.0'

# ⚠️ The hexes are the brands' OWN published values, not a reading of the artwork:
# GitHub #181717, Google #4285F4. They are written here beside the icon each belongs to
# so a future reader can check one line rather than open two SVGs.
BRANDS = {
    'google': ('brand-google.svg', '#4285F4', 'Google'),
    'github': ('brand-github.svg', '#181717', 'GitHub'),
}

def fetch():
    socket.setdefaulttimeout(60)
    meta = json.load(urllib.request.urlopen('https://registry.npmjs.org/%s' % PKG))
    dist = meta['versions'][VER]['dist']
    raw  = urllib.request.urlopen(dist['tarball']).read()
    got  = hashlib.sha1(raw).hexdigest()
    if got != dist.get('shasum'):
        sys.exit('sha1 mismatch for %s@%s: registry says %s, tarball is %s'
                 % (PKG, VER, dist.get('shasum'), got))
    return tarfile.open(fileobj=io.BytesIO(raw))

def build(tf, key):
    name, hexv, title = BRANDS[key]
    member = 'package/icons/%s.svg' % key
    src = tf.extractfile(member).read().decode('utf-8')
    m = re.search(r'<path\s+d="([^"]+)"', src)
    if not m:
        sys.exit('no path in %s' % member)
    # ⚠️ The fill is written ONTO the path rather than left to inherit: these two files
    # exist precisely because they must not take the colour of what they stand in.
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img"'
            ' aria-label="%s"><title>%s</title><path fill="%s" d="%s"/></svg>\n'
            % (title, title, hexv, m.group(1)))

def main():
    check = '--check' in sys.argv
    tf = fetch()
    bad = []
    for key in BRANDS:
        name = BRANDS[key][0]
        want = build(tf, key)
        path = os.path.join(OUT, name)
        have = io.open(path, encoding='utf-8').read() if os.path.exists(path) else None
        if check:
            if have != want: bad.append(name)
        else:
            io.open(path, 'w', encoding='utf-8').write(want)
            print('wrote %s (%s, from %s@%s)' % (path, BRANDS[key][1], PKG, VER))
    if check:
        if bad: sys.exit('stale: ' + ', '.join(bad))
        print('brand marks up to date (%s@%s)' % (PKG, VER))

main()

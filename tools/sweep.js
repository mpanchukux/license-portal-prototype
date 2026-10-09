/* sweep.js — geometry sweep for the design-system passes (session 3 onward).
 *
 * NOT part of the prototype: nothing loads it. It is fetched and eval'd from the open
 * panel against a mirror. It answers one question: did anything move?
 *
 * ⚠️ IT IS IN THE REPOSITORY, not the scratchpad, for the reason `roles.py` taught:
 * a measurement harness that lives in a session directory is rebuilt from scratch by
 * the next session, and the three traps below get rediscovered one at a time.
 *
 * ⚠️ THE SETTINGS BAR IS STRIPPED BEFORE MEASURING. It takes 158px off every overlay
 * at 1280 and 229px at 601, and a sweep that inherits it invents findings.
 * ⚠️ VIEWPORT EMULATION IN THIS PANEL DOES NOT WORK — resize_window reports the size it
 * was given and innerWidth stays the pane's. Every width here is an iframe of that width,
 * where media queries resolve honestly (verified: innerWidth === the width asked for).
 */
(function (root) {
  /* ⚠️⚠️ CLASS NAMES ARE PART OF THE PATH KEY, SO ADDING A CLASS UNPAIRS THE ELEMENT.
     Every row below is keyed by `tag.class1.class2.class3:index`, so a pass that puts a
     SECOND name on an element it did not rename — `class="listrow lic-row"` — makes the
     before key and the after key different strings. `diff()` then reports the whole
     table as "element count changed" and `paintDiff()` counts every row as `unpaired`
     instead of comparing it. The run looks like a catastrophe and measures nothing.
     ⚠️ Worse than noisy: `unpaired` rows are SKIPPED, so a real paint regression on
     exactly those elements would be invisible in the same run that cried wolf.
     `SWEEP.ignoreClasses(['listrow','listbar'])` drops those names from the key on both
     sides, which is what makes "did the row move" askable across an additive rename.
     It only ever REMOVES names, so it cannot invent a pairing: two elements that
     differed only by an ignored class were the same element. */
  var IGNORE = [];
  function path(el) {
    var out = [], n = el, guard = 0;
    while (n && n.nodeType === 1 && guard++ < 6) {
      var s = n.tagName.toLowerCase();
      if (n.id) { s += '#' + n.id; out.unshift(s); break; }
      if (n.className && typeof n.className === 'string') {
        var cl = n.className.trim().split(/\s+/);
        if (IGNORE.length) cl = cl.filter(function (c) { return IGNORE.indexOf(c) < 0; });
        /* ⚠️ the slice stays AFTER the filter: slicing first would let an ignored name
           occupy one of the three slots and push a real one out of the key. */
        s += '.' + cl.slice(0, 3).join('.');
      }
      var i = 0, p = n.previousElementSibling;
      while (p) { i++; p = p.previousElementSibling; }
      out.unshift(s + ':' + i);
      n = n.parentElement;
    }
    return out.join('>');
  }

  function hash(str) {            // djb2, enough to say "identical or not"
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(16);
  }

  function collect(doc, win) {
    var rows = [];
    var all = doc.querySelectorAll('body *');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.closest('.statebar')) continue;          // the instrument, not the product
      /* ⚠️⚠️ THE AMBIENT MESH IS NEVER STILL, so it can never be compared. The four
         blobs drift on 31/34/37/39/48s periods (deliberately unequal, so the background
         does not visibly loop), and their rects differ by hundredths of a pixel between
         any two samples. Left in, they made every page report "geometry changed" —
         including privacy.html, which no spacing edit can reach. They are
         `position:absolute`, `z-index:-1`, `pointer-events:none` and carry no layout, so
         dropping them costs the sweep nothing and is the difference between a signal and
         a file full of false positives. */
      if (el.closest('.meshbg, .lmesh')) continue;
      var r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;            // hidden: nothing to move
      rows.push(path(el) + '|' + r.x.toFixed(2) + '|' + r.y.toFixed(2)
                         + '|' + r.width.toFixed(2) + '|' + r.height.toFixed(2));
    }
    return rows;
  }

  /* ⚠️⚠️ HORIZONTAL OVERFLOW IS MEASURED FOR EVERY ELEMENT, NOT JUST THE PAGE SCROLLER.
     Added 2026-10-06 after a spacing pass widened four table rows by 16px and the sweep
     said nothing: it reported heights for pages and overflow only for the main box, so
     tables that started running past their block reached the reviewer BY EYE.
     ⚠️ `scrollWidth - clientWidth` catches both cases that matter — a real scroller, and
     a box with `overflow-x:visible` whose content simply runs out of it. The second is
     the dangerous one: it neither scrolls nor draws the edge cue, so nothing on screen
     says it happened. */
  function overflowsIn(doc) {
    var out = [];
    var all = doc.querySelectorAll('body *');
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (e.closest('.meshbg, .lmesh, .statebar')) continue;
      /* ⚠️ `.vh` is the visually-hidden recipe: a 1px box clipping whatever text it
         holds, so it always reports hundreds of pixels of overflow and is never a
         finding. Excluded by name, not by threshold — a threshold would also hide a
         real 2px one. */
      if (e.classList.contains('vh')) continue;
      var over = e.scrollWidth - e.clientWidth;
      if (over <= 0) continue;
      var id = e.id ? '#' + e.id : '';
      /* ⚠️ same key problem as path(): `newOverflow()` matches before/after by this
         label, so an added class would read as a box that never overflowed before. */
      var ecl = (typeof e.className === 'string' && e.className)
        ? e.className.trim().split(/\s+/) : [];
      if (IGNORE.length) ecl = ecl.filter(function (c) { return IGNORE.indexOf(c) < 0; });
      var cls = ecl.length ? '.' + ecl.slice(0, 2).join('.') : '';
      out.push({ el: e.tagName.toLowerCase() + id + cls, over: over,
                 client: e.clientWidth, scroll: e.scrollWidth });
    }
    out.sort(function (a, b) { return b.over - a.over; });
    return out.slice(0, 12);
  }

  /* opts.open: name of a surface to open before measuring (see OPENERS) */
  function page(url, width, opts) {
    opts = opts || {};
    return new Promise(function (res) {
      var f = document.createElement('iframe');
      f.style.cssText = 'position:fixed;left:-99999px;top:0;border:0;width:' + width
                      + 'px;height:' + (opts.height || 900) + 'px';
      f.src = url + (url.indexOf('?') < 0 ? '?' : '&') + 'x=' + Date.now();
      document.body.appendChild(f);
      var done = false;
      function finish(v) { if (done) return; done = true; try { f.remove(); } catch (e) {} res(v); }
      f.onload = function () {
        setTimeout(function () {
          var d = f.contentDocument, w = f.contentWindow;
          try {
            var bar = d.querySelector('.statebar'); if (bar) bar.remove();
            d.body.classList.remove('has-statebar');
            var p = opts.open ? OPENERS[opts.open](d, w) : Promise.resolve();
            Promise.resolve(p).then(function () {
              setTimeout(function () {
                var rows = collect(d, w);
                /* ⚠️ THE PAGE IS NOT THE SCROLLER. `#shellMain` is the scroll box in this
                   product, so documentElement.scrollHeight reports the viewport and never
                   moves — "what got taller" has to be asked of the box that actually
                   scrolls, or every page looks like it never changed height. */
                var sc = d.querySelector('#shellMain') || d.documentElement;
                finish({ url: url, w: width, surface: opts.open || 'page',
                         inner: w.innerWidth, n: rows.length,
                         hash: hash(rows.join('\n')),
                         scrollH: sc.scrollHeight,
                         scrollW: sc.scrollWidth,
                         overX: Math.max(0, sc.scrollWidth - sc.clientWidth),
                         docW: d.documentElement.scrollWidth,
                         overflows: overflowsIn(d),
                         rows: opts.rows ? rows : undefined });
              }, opts.settle || 260);
            }, function (e) { finish({ url: url, w: width, surface: opts.open, error: String(e) }); });
          } catch (e) { finish({ url: url, w: width, error: String(e) }); }
        }, opts.wait || 480);
      };
      setTimeout(function () { finish({ url: url, w: width, error: 'timeout' }); }, opts.timeout || 9000);
    });
  }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ⚠️⚠️ EVERY OPENER MUST ASSERT THAT IT ARRIVED. An opener that drives the UI and then
     resolves regardless is the worst instrument in this harness: the walk runs on a page
     where the surface never opened, every element it was supposed to measure is absent,
     and the result is a clean `0 changed / 0 lost / 0 gained` — a PASS that measured
     nothing. `OPENERS.usersModal` did exactly that three times across two sessions, and
     each time it was caught by hand (`tr.user-row` was 0 in the DOM) rather than by the
     tool. `must()` turns that silence into a rejection, which `page()` and `paint()`
     already convert into `{error}` on the cell.
     ⚠️ The caller still has to LOOK at `error`: a cell with an error carries no rows, and
     a summary that only sums changed/lost/gained will read it as another quiet zero.
     `diff()` and `paintDiff()` therefore pass `error` through — see the note on each. */
  function must(d, sel, label) {
    var el = d.querySelector(sel);
    if (!el) throw new Error('opener never reached ' + label + ': `' + sel + '` absent');
    /* ⚠️ `d.defaultView`, never the bare global: this runs in the panel's top window while
       the element lives in the iframe, and the top window's getComputedStyle would be
       asked about a node it does not own. */
    if (el.hidden || d.defaultView.getComputedStyle(el).display === 'none') {
      throw new Error('opener reached ' + label + ' but it is display:none / [hidden]');
    }
    return el;
  }

  /* Surfaces that are not on the page until something opens them. Each returns a
     promise that settles once the surface is on screen, and THROWS if it did not. */
  var OPENERS = {
    wizardPick: function (d) {
      var b = d.querySelector('#dashNewBtn') || d.querySelector('#topbarNewBtn');
      if (!b) throw new Error('wizardPick: no trigger on this page');
      b.click();
      return wait(500).then(function () { must(d, '#nlStepPick', 'the wizard pick step'); });
    },
    wizardCapacity: function (d) {
      var b = d.querySelector('#dashNewBtn') || d.querySelector('#topbarNewBtn');
      if (!b) throw new Error('wizardCapacity: no trigger on this page');
      b.click();
      return wait(500).then(function () {
        must(d, '#nlStepPick [data-nl-pick]', 'the wizard pick step').click();
        return wait(600).then(function () { must(d, '#nlStepCap', 'the wizard capacity step'); });
      });
    },
    /* ⚠️ AT <=600 THE LIST IS NOT A TABLE. `tr.lic-row` is the desktop row; the phone
       renders `.lcard`, and an opener that only knows the table throws on the one width
       the phone layout exists at. Both carry `data-licid`, so ask for that. */
    licensePanel: function (d) {
      /* ⚠️ `return wait(0)` on a missing row used to make "this page has no licence to
         open" indistinguishable from "the panel opened and nothing changed". */
      var row = must(d, '[data-licid]', 'a licence row');
      row.click();
      return wait(650).then(function () { must(d, '#licModal', 'the licence panel'); });
    },

    /* ⚠️⚠️ THE CONTROLLER FIRST, THE MENU SECOND, AND AN ASSERT EITHER WAY.
       This opener reported a false zero three times across two sessions. It drove the
       profile menu — `#dashProfBtn` → `[data-users]` — and on every surface measured in
       2026-10-07 that path silently did nothing: `#usersModal` stayed hidden, `tr.user-row`
       was 0 in the DOM, and the sweep reported `0/0/0` on a surface it had never opened.
       The Users surface is a controller with a public `open()` (`UsersModal` in
       `shared.js`), so ASK IT. The click path stays as a fallback, because an opener that
       only works through the public API stops telling you when the menu route breaks —
       but neither route is now allowed to finish quietly. */
    usersModal: function (d, w) {
      var viaApi = false;
      try { if (w.UsersModal && typeof w.UsersModal.open === 'function') { w.UsersModal.open(); viaApi = true; } }
      catch (e) { /* fall through to the UI path and let the assert speak */ }
      if (viaApi) {
        return wait(400).then(function () {
          must(d, '#usersModal', 'the Users modal');
          must(d, '#usersModal tr.user-row', 'a Users row');
        });
      }
      var t = d.querySelector('[data-users]') || d.querySelector('#dashProfBtn');
      if (!t) throw new Error('usersModal: neither UsersModal.open() nor a trigger exists here');
      t.click();
      return wait(250).then(function () {
        var u = d.querySelector('[data-users]');
        if (u && u !== t) { u.click(); }
        return wait(500).then(function () {
          must(d, '#usersModal', 'the Users modal');
          must(d, '#usersModal tr.user-row', 'a Users row');
        });
      });
    }
  };

  function all(list, widths, opts) {
    var out = [], i = 0;
    return (function next() {
      if (i >= list.length * widths.length) return Promise.resolve(out);
      var li = Math.floor(i / widths.length), wi = i % widths.length;
      i++;
      var item = list[li];
      var url = typeof item === 'string' ? item : item.url;
      var o = Object.assign({}, opts, typeof item === 'string' ? {} : item.opts);
      return page(url, widths[wi], o).then(function (r) { out.push(r); return next(); });
    })();
  }

  /* which boxes overflow now that did not, and which got worse */
  function newOverflow(b, a) {
    b = b || []; a = a || [];
    var was = {};
    b.forEach(function (o) { was[o.el] = o.over; });
    return a.filter(function (o) { return (was[o.el] || 0) < o.over; })
            .map(function (o) { return o.el + ' ' + (was[o.el] || 0) + ' -> ' + o.over; });
  }

  function diff(before, after) {
    var key = function (r) { return r.url + '@' + r.w + '/' + (r.surface || 'page'); };
    var B = {}, A = {};
    before.forEach(function (r) { B[key(r)] = r; });
    after.forEach(function (r) { A[key(r)] = r; });
    var moved = [], same = 0, errors = [];
    Object.keys(A).forEach(function (k) {
      var b = B[k], a = A[k];
      /* ⚠️⚠️ AN ERRORED CELL HAS NO ROWS, SO IT WOULD COUNT AS "identical". That is the
         false-zero shape this harness has produced before (see OPENERS.must): report it
         separately and loudly rather than folding it into the pass count. */
      if ((a && a.error) || (b && b.error)) {
        errors.push({ k: k, before: b && b.error, after: a && a.error }); return;
      }
      if (!b) { moved.push({ k: k, why: 'new' }); return; }
      if (b.hash === a.hash && b.n === a.n) { same++; return; }
      moved.push({ k: k, why: b.n !== a.n ? 'element count ' + b.n + ' -> ' + a.n : 'geometry',
                   dH: a.scrollH - b.scrollH, dW: a.scrollW - b.scrollW,
                   dOverX: (a.overX || 0) - (b.overX || 0),
                   newOverflow: newOverflow(b.overflows, a.overflows),
                   scrollH: b.scrollH + ' -> ' + a.scrollH });
    });
    return { identical: same, moved: moved, errors: errors };
  }

  /* row-level diff for one cell, when the hash says something moved */
  function rowDiff(beforeRows, afterRows, limit) {
    var B = {}, out = [];
    beforeRows.forEach(function (r) { var i = r.indexOf('|'); B[r.slice(0, i) ] = r.slice(i + 1); });
    afterRows.forEach(function (r) {
      var i = r.indexOf('|'), p = r.slice(0, i), v = r.slice(i + 1);
      if (B[p] === undefined) { out.push({ p: p, before: '(absent)', after: v }); return; }
      if (B[p] !== v) out.push({ p: p, before: B[p], after: v });
    });
    return out.slice(0, limit || 40);
  }

  /* ================= computed-value comparison (SCALES.md implementation rule 8) =========
     ⚠️⚠️ THE GEOMETRY SWEEP ABOVE IS BLIND TO RADIUS, ELEVATION, OVERLAYS, MOTION AND
     BORDER WIDTH. A broken `var()` in any of them renders a wrong screen with identical
     x/y/width/height, so `diff()` would report a clean run. On those five axes the PRIMARY
     check is this walk: read the property the axis owns on every element, across paired
     mirrors, and diff the two maps.

     Three numbers come out and all three matter — changed, LOST (had the property, now
     does not) and gained. The second is what a broken token looks like and nothing else
     sees it. */

  /* what counts as "this element has the property at all", per property. `color` is
     always present, so it has no absence to lose and is compared for change only. */
  var ABSENT = {
    'box-shadow': 'none',
    'background-image': 'none',
    'background-color': 'rgba(0, 0, 0, 0)',
    'mask-image': 'none',
    'border-radius': '0px',
    /* ⚠️ `auto` is z-index's absence, and it is the one a broken --z-* token produces:
       an invalid var() makes the declaration invalid at computed-value time, which falls
       back to `auto` and silently drops the element out of its layer. */
    'z-index': 'auto',
    'transition-duration': '0s',
    'animation-duration': '0s',
    /* ⚠️ A border width of 0px is also what a BROKEN `border` shorthand computes to: the
       declaration is dropped, border-style falls back to `none`, and the used width goes
       to zero. So "lost" on these four is the check that matters most on that axis. */
    'border-top-width': '0px',
    'border-right-width': '0px',
    'border-bottom-width': '0px',
    'border-left-width': '0px',
    'outline-width': '0px'
  };

  /* ⚠️⚠️ `border-color` AND `transform` ADDED 2026-10-08, AND THE REASON IS A PASS THAT WENT
     BLIND. The set was four properties, and the pass that turned every secondary in the product
     into an OUTLINE came back reporting only the fills it had removed — 92 borders appearing
     were invisible to the instrument measuring them. `transform` joins it for the same reason
     one step later: the `raised` variant answers the pointer by moving, and a set that cannot
     see movement cannot check it.
     ⚠️ ADDED TO THE FILE, NOT PASSED PER RUN. A property that has to be remembered is a
     property that will be forgotten — it already was, in the one run that needed it most. */
  var PAINT_PROPS = ['background-color', 'background-image', 'color', 'box-shadow',
                     'border-color', 'transform'];

  /* ⚠️ HIDDEN ELEMENTS ARE INCLUDED HERE, unlike collect(). Half of this axis lives on
     surfaces that are display:none until something opens them — scrims, sheets, menus,
     the snackbar — and a walk that skips zero-size boxes cannot see any of them.
     getComputedStyle resolves colours on a display:none element, which is the whole
     property set this mode reads. */
  function paintRows(doc, props) {
    var rows = [], all = doc.querySelectorAll('body *');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.closest('.statebar')) continue;        // the instrument, not the product
      if (el.closest('.meshbg, .lmesh')) continue;  // never still; see rule 7
      var cs = doc.defaultView.getComputedStyle(el), v = [];
      for (var j = 0; j < props.length; j++) v.push(cs.getPropertyValue(props[j]));
      rows.push(path(el) + '|' + v.join('|'));
    }
    return rows;
  }

  /* ⚠️⚠️ EVERY CLASS ON THE SURFACE, UNFILTERED — this is what makes rule 9 LOUD instead of
     silent. `ignoreClasses` is a list a human types, and the one time it mattered a human
     typed two of the three names: `btn--raised` was missing, the switcher unpaired with
     itself, and its change did not appear in the diff at all. A pass cannot be trusted to
     remember; it can be made to fail. `paintDiff` compares these two vocabularies and refuses
     to report when a class that exists only in `after` is not on the ignore list. */
  function classesIn(doc) {
    var set = {}, all = doc.querySelectorAll('body *');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.closest('.statebar')) continue;
      if (typeof el.className !== 'string' || !el.className.trim()) continue;
      var cl = el.className.trim().split(/\s+/);
      for (var j = 0; j < cl.length; j++) set[cl[j]] = 1;
    }
    return Object.keys(set);
  }

  /* the ladder and the roles, resolved off :root — a broken token shows up here as the
     literal text of the var() call instead of a value */
  function tokens(doc, names) {
    var cs = doc.defaultView.getComputedStyle(doc.documentElement), out = {};
    names.forEach(function (n) { out[n] = cs.getPropertyValue(n).trim(); });
    return out;
  }

  function paint(url, width, opts) {
    opts = opts || {};
    var props = opts.props || PAINT_PROPS;
    return new Promise(function (res) {
      var f = document.createElement('iframe');
      f.style.cssText = 'position:fixed;left:-99999px;top:0;border:0;width:' + width
                      + 'px;height:' + (opts.height || 900) + 'px';
      f.src = url + (url.indexOf('?') < 0 ? '?' : '&') + 'x=' + Date.now();
      document.body.appendChild(f);
      var done = false;
      function finish(v) { if (done) return; done = true; try { f.remove(); } catch (e) {} res(v); }
      f.onload = function () {
        setTimeout(function () {
          var d = f.contentDocument, w = f.contentWindow;
          try {
            var bar = d.querySelector('.statebar'); if (bar) bar.remove();
            d.body.classList.remove('has-statebar');
            var p = opts.open ? OPENERS[opts.open](d, w) : Promise.resolve();
            Promise.resolve(p).then(function () {
              setTimeout(function () {
                /* ⚠️⚠️ PRE-FLIGHT, IN THE TOOL (2026-10-08). A portal url loaded signed out
                   REPLACES itself with the landing page, and this function had no idea: a
                   cell labelled `landing` measured Home, and the only tell was two signed-in
                   nodes turning up in the diff. A measurement that can be of the wrong page
                   must say so itself rather than rely on the caller running a second pass
                   first. */
                var want = url.split('?')[0], got = d.location.pathname;
                if (got.indexOf(want.replace(/^.*(\/[^\/]+)$/, '$1')) < 0) {
                  finish({ url: url, w: width,
                           error: 'preflight: ' + url + ' rendered ' + got });
                  return;
                }
                var out = { url: url, w: width, surface: opts.open || 'page',
                            props: props, rows: paintRows(d, props),
                            classes: classesIn(d),
                            /* ⚠️ THE IGNORE LIST IS RECORDED WITH THE ROWS because `path()`
                               applies it at PAINT time. Calling `ignoreClasses` after the two
                               mirrors are painted changes nothing and looks like it worked —
                               measured: 30 unpaired before and after naming the classes. */
                            ignored: IGNORE.slice() };
                out.n = out.rows.length;
                if (opts.tokens) out.tokens = tokens(d, opts.tokens);
                if (opts.probe) out.probe = probeIn(d, opts.probe, props);
                finish(out);
              }, opts.settle || 260);
            }, function (e) { finish({ url: url, w: width, error: String(e) }); });
          } catch (e) { finish({ url: url, w: width, error: String(e) }); }
        }, opts.wait || 480);
      };
      setTimeout(function () { finish({ url: url, w: width, error: 'timeout' }); }, opts.timeout || 9000);
    });
  }

  /* named selectors -> their computed values, for reporting PER COMPONENT rather than
     per anonymous path. Reports `(no element)` rather than skipping, so a component that
     is not on the surface is visible as such instead of silently absent. */
  function probeIn(doc, sels, props) {
    var out = {};
    sels.forEach(function (s) {
      var el = null;
      try { el = doc.querySelector(s); } catch (e) {}
      if (!el) { out[s] = '(no element)'; return; }
      var cs = doc.defaultView.getComputedStyle(el), v = {};
      props.forEach(function (p) { v[p] = cs.getPropertyValue(p); });
      out[s] = v;
    });
    return out;
  }

  /* changed / lost / gained, element by element, property by property */
  function paintDiff(before, after) {
    var props = after.props || PAINT_PROPS;
    /* ⚠️⚠️ RULE 9, ENFORCED RATHER THAN DOCUMENTED. A class that exists in `after` and not in
       `before` changes the key of every element carrying it, so those elements never pair and
       their changes never appear. The remedy was already here — `ignoreClasses` — and the
       failure mode was that a human has to remember to use it. Now the tool refuses. */
    /* ⚠️⚠️ THE TWO SIDES MUST HAVE BEEN PAINTED UNDER THE SAME LIST, AND IT MUST STILL BE THE
       CURRENT ONE. `ignoreClasses` takes effect inside `path()`, so it has to be set BEFORE
       the first `paint()`; setting it afterwards silently does nothing. This refuses rather
       than letting a run report a pairing it did not get. */
    var ig = IGNORE.slice().sort().join(',');
    if (before.ignored && after.ignored) {
      var bi = before.ignored.slice().sort().join(','), ai = after.ignored.slice().sort().join(',');
      if (bi !== ai || ai !== ig) {
        return { url: after.url, w: after.w, surface: after.surface,
                 error: 'ignoreClasses mismatch: before painted with [' + bi + '], after with ['
                      + ai + '], current list is [' + ig + ']. It is applied when the rows are '
                      + 'collected, so it must be set before the first paint().',
                 elements: after.n, compared: 0, unpaired: 0, unpairedBefore: 0,
                 changed: [], lost: [], gained: [],
                 counts: { changed: 0, lost: 0, gained: 0 } };
      }
    }
    if (before.classes && after.classes) {
      var had = {}, i;
      for (i = 0; i < before.classes.length; i++) had[before.classes[i]] = 1;
      for (i = 0; i < IGNORE.length; i++) had[IGNORE[i]] = 1;
      var unlisted = after.classes.filter(function (c) { return !had[c]; });
      if (unlisted.length) {
        return { url: after.url, w: after.w, surface: after.surface,
                 error: 'rule 9: ' + unlisted.length + ' class(es) are new in `after` and not on '
                      + 'the ignore list — ' + unlisted.slice(0, 8).join(', ')
                      + '. Pass them to SWEEP.ignoreClasses() or the elements carrying them '
                      + 'will not pair.',
                 elements: after.n, compared: 0, unpaired: 0, unpairedBefore: 0,
                 changed: [], lost: [], gained: [],
                 counts: { changed: 0, lost: 0, gained: 0 } };
      }
    }
    var B = {};
    (before.rows || []).forEach(function (r) {
      var i = r.indexOf('|'); B[r.slice(0, i)] = r.slice(i + 1).split('|');
    });
    var changed = [], lost = [], gained = [], onlyAfter = 0, compared = 0, seen = {};
    (after.rows || []).forEach(function (r) {
      var i = r.indexOf('|'), key = r.slice(0, i), av = r.slice(i + 1).split('|');
      var bv = B[key];
      if (!bv) { onlyAfter++; return; }
      seen[key] = 1;
      compared++;
      for (var j = 0; j < props.length; j++) {
        if (bv[j] === av[j]) continue;
        var absent = ABSENT[props[j]];
        if (absent !== undefined && av[j] === absent) {
          lost.push({ el: key, prop: props[j], before: bv[j] });
        } else if (absent !== undefined && bv[j] === absent) {
          gained.push({ el: key, prop: props[j], after: av[j] });
        } else {
          changed.push({ el: key, prop: props[j], before: bv[j], after: av[j] });
        }
      }
    });
    /* ⚠️⚠️ `error` AND `compared` ARE PART OF THE RESULT, NOT DEBUG. A cell whose opener
       failed arrives with no rows: changed/lost/gained are all 0 and `compared` is 0,
       which is indistinguishable from a clean pass unless the caller reads these two.
       Any summary that sums the counts must also assert `!error && compared > 0`. */
    /* ⚠️⚠️ RULE 12: THE OTHER SIDE IS COUNTED TOO (2026-10-08). `onlyAfter` had no
       counterpart, so a key present in `before` and gone from `after` was dropped in silence —
       a pass that only DELETES elements reported zero unpaired and read as a clean run. */
    var onlyBefore = 0;
    for (var k in B) if (!seen[k]) onlyBefore++;
    return { url: after.url, w: after.w, surface: after.surface,
             error: after.error || before.error || null,
             elements: after.n, compared: compared,
             unpaired: onlyAfter, unpairedBefore: onlyBefore,
             changed: changed, lost: lost, gained: gained,
             counts: { changed: changed.length, lost: lost.length, gained: gained.length } };
  }

  function paintAll(list, widths, opts) {
    var out = [], i = 0;
    return (function next() {
      if (i >= list.length * widths.length) return Promise.resolve(out);
      var li = Math.floor(i / widths.length), wi = i % widths.length;
      i++;
      var item = list[li];
      var url = typeof item === 'string' ? item : item.url;
      var o = Object.assign({}, opts, typeof item === 'string' ? {} : item.opts);
      return paint(url, widths[wi], o).then(function (r) { out.push(r); return next(); });
    })();
  }

  root.SWEEP = { ignoreClasses: function (a) { IGNORE = a || []; return IGNORE; },
                 page: page, all: all, diff: diff, rowDiff: rowDiff,
                 overflowsIn: overflowsIn, newOverflow: newOverflow, OPENERS: OPENERS,
                 paint: paint, paintAll: paintAll, paintDiff: paintDiff,
                 PAINT_PROPS: PAINT_PROPS };
})(window);

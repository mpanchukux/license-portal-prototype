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
  function path(el) {
    var out = [], n = el, guard = 0;
    while (n && n.nodeType === 1 && guard++ < 6) {
      var s = n.tagName.toLowerCase();
      if (n.id) { s += '#' + n.id; out.unshift(s); break; }
      if (n.className && typeof n.className === 'string') {
        s += '.' + n.className.trim().split(/\s+/).slice(0, 3).join('.');
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
      var cls = (typeof e.className === 'string' && e.className)
        ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
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

  /* Surfaces that are not on the page until something opens them. Each returns a
     promise that settles once the surface is on screen. */
  var OPENERS = {
    wizardPick: function (d) {
      var b = d.querySelector('#dashNewBtn') || d.querySelector('#topbarNewBtn');
      b.click(); return wait(500);
    },
    wizardCapacity: function (d) {
      var b = d.querySelector('#dashNewBtn') || d.querySelector('#topbarNewBtn');
      b.click();
      return wait(500).then(function () {
        d.querySelector('#nlStepPick [data-nl-pick]').click(); return wait(600);
      });
    },
    /* ⚠️ AT <=600 THE LIST IS NOT A TABLE. `tr.lic-row` is the desktop row; the phone
       renders `.lcard`, and an opener that only knows the table throws on the one width
       the phone layout exists at. Both carry `data-licid`, so ask for that. */
    licensePanel: function (d) {
      var row = d.querySelector('[data-licid]');
      if (!row) return wait(0);
      row.click();
      return wait(650);
    },
    usersModal: function (d) {
      var t = d.querySelector('[data-users], #dashProfBtn');
      if (t && t.id === 'dashProfBtn') {
        t.click();
        return wait(200).then(function () {
          var u = d.querySelector('[data-users]'); if (u) u.click(); return wait(500);
        });
      }
      if (t) { t.click(); return wait(500); }
      return wait(0);
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
    var moved = [], same = 0;
    Object.keys(A).forEach(function (k) {
      var b = B[k], a = A[k];
      if (!b) { moved.push({ k: k, why: 'new' }); return; }
      if (b.hash === a.hash && b.n === a.n) { same++; return; }
      moved.push({ k: k, why: b.n !== a.n ? 'element count ' + b.n + ' -> ' + a.n : 'geometry',
                   dH: a.scrollH - b.scrollH, dW: a.scrollW - b.scrollW,
                   dOverX: (a.overX || 0) - (b.overX || 0),
                   newOverflow: newOverflow(b.overflows, a.overflows),
                   scrollH: b.scrollH + ' -> ' + a.scrollH });
    });
    return { identical: same, moved: moved };
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

  var PAINT_PROPS = ['background-color', 'background-image', 'color', 'box-shadow'];

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
                var out = { url: url, w: width, surface: opts.open || 'page',
                            props: props, rows: paintRows(d, props) };
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
    var B = {};
    (before.rows || []).forEach(function (r) {
      var i = r.indexOf('|'); B[r.slice(0, i)] = r.slice(i + 1).split('|');
    });
    var changed = [], lost = [], gained = [], onlyAfter = 0, compared = 0;
    (after.rows || []).forEach(function (r) {
      var i = r.indexOf('|'), key = r.slice(0, i), av = r.slice(i + 1).split('|');
      var bv = B[key];
      if (!bv) { onlyAfter++; return; }
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
    return { url: after.url, w: after.w, surface: after.surface,
             elements: after.n, compared: compared, unpaired: onlyAfter,
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

  root.SWEEP = { page: page, all: all, diff: diff, rowDiff: rowDiff,
                 overflowsIn: overflowsIn, newOverflow: newOverflow, OPENERS: OPENERS,
                 paint: paint, paintAll: paintAll, paintDiff: paintDiff,
                 PAINT_PROPS: PAINT_PROPS };
})(window);

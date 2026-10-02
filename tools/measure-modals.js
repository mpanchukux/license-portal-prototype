/* ⚠️⚠️ OPENER NOTE, LEARNED THE HARD WAY (2026-10-02): `.nl-billtab` IS A PHONE CONTROL.
 * Above 600px the two billing models sit side by side and the tabs are hidden, so an
 * opener that "chooses perpetual" by clicking a tab chooses nothing — it then presses the
 * first `Select` it finds, which is a SUBSCRIPTION card. Every perpetual cell above 600px
 * in the first modal run was the subscription path wearing a perpetual label, and the tell
 * was that both columns carried identical numbers. Choose the model by pressing the
 * `Select` inside `.plangroup[data-bill="perpetual"]`, never by a tab.
 */
/* Paired-mirror measurement harness for overlay surfaces.
 *
 * Runs in the PARENT page on the same origin as the two mirrors built by tools/mirror.sh.
 * Loads `before/<page>` and `after/<page>` into iframes of the same width, drives both into
 * the same state with the same opener, and reports only the differences.
 *
 * FOUR GUARDS. A measurement that cannot fail proves nothing — the previous two runs both
 * looked plausible and were wrong.
 *   1 nodes     — a 404 renders a near-empty document; identical numbers across pages is
 *                 its signature, and that is exactly what the first invalid run produced.
 *   2 address   — signed out, portal pages redirect to the landing; signed in, landing and
 *                 signin redirect to index. Both directions have already faked a result.
 *   3 scroller  — the page does not scroll, `#shellMain` does. Reading
 *                 documentElement.scrollHeight honestly reports "+0 everywhere".
 *   4 parity    — NEW. The two builds must end in the SAME state. Comparing an open modal
 *                 against the page behind it would look entirely plausible and mean nothing.
 */
(function (root) {
  const PAGE_SCROLLERS = ['#shellMain'];
  /* ⚠️ THE OVERLAY'S OWN SCROLL BOX COMES FIRST. With a modal open, `#shellMain` is the
     page BEHIND it — reading that answers a question nobody asked and hides the one that
     matters: did this panel fit before and scroll now. */
  const PANEL_SCROLLERS = ['.fs-body', '.fsheet-list', '.modal .mb', '.mb', '.pay-body', '.authbody'];

  function scrollerIn(el, win) {
    if (!el) return null;
    for (const s of PANEL_SCROLLERS) { const e = el.querySelector(s); if (e) return e; }
    const cs = win.getComputedStyle(el);
    return /auto|scroll/.test(cs.overflowX + ' ' + cs.overflowY) ? el : null;
  }

  function scrollerOf(d) {
    for (const s of PAGE_SCROLLERS) { const e = d.querySelector(s); if (e) return e; }
    return d.scrollingElement || d.documentElement;
  }

  /* what state is this document in? both builds must agree, or the cell is void */
  function signature(d, win) {
    /* ⚠️⚠️ THE TOPMOST OVERLAY, NOT THE LAST IN DOCUMENT ORDER (2026-10-02). These surfaces
       NEST — the coupon overlay and the wizard both open OVER the licence panel — and
       `querySelectorAll` returns document order, which put `#licModal` last and made it
       the answer every time. That is how four surfaces came back measured as the panel
       behind them with both builds agreeing. Stacking order is what the reader sees, so
       z-index is what decides. */
    const open = [...d.querySelectorAll('#nlModal,#licModal,#authModal,#usersModal,#payOverlay,#couponOverlay,#overlay,.fsheet')]
      .filter(e => !e.hidden && e.getClientRects().length)
      .sort((a, b) => (parseInt(win.getComputedStyle(a).zIndex, 10) || 0)
                    - (parseInt(win.getComputedStyle(b).zIndex, 10) || 0));
    /* ⚠️ THE LICENCE PANEL HAS TWO HOSTS AND ONLY ONE OF THEM IS AN OVERLAY. On
       `license.html` it is mounted into the page (`#licDetailsHost`), so a signature that
       only knows overlays voided all eight of those cells as "no overlay opened" — the
       guard was right about what it could see and wrong about what was there. */
    const root = open[open.length - 1] || d.querySelector('#licDetailsHost') || null;
    const title = root ? (root.querySelector('h1,h2,.fs-title,.fsheet-title,.modal h3,.mh') || {}).textContent : '';
    return {
      id: root ? (root.id || root.className.split(' ')[0]) : '(no overlay)',
      title: (title || '').replace(/\s+/g, ' ').trim().slice(0, 48),
      step: ((root && root.querySelector('.nl-step.is-cur .nl-sname')) || {}).textContent || '',
      fields: root ? root.querySelectorAll('input,select,textarea').length : 0,
      controls: root ? root.querySelectorAll('button').length : 0
    };
  }

  function hasScrollAncestor(el, win, stopAt) {
    for (let p = el.parentElement; p && p !== stopAt; p = p.parentElement) {
      const cs = win.getComputedStyle(p);
      if (/auto|scroll/.test(cs.overflowX + ' ' + cs.overflowY)) return true;
    }
    return false;
  }

  function collect(d, win) {
    const sc = scrollerOf(d);
    const sig = signature(d, win);
    const overlay = sig.id === '(no overlay)' ? null
      : d.querySelector('#' + CSS.escape(sig.id)) || d.querySelector('.' + sig.id);
    const frame = overlay
      ? (overlay.querySelector('.fs-box,.fsheet-panel,.payoverlay-box,.modal,.pay-card') || overlay)
      : null;
    /* a page-mounted panel scrolls with the page, so its "available height" is the page's */
    const pageHosted = overlay && overlay.id === 'licDetailsHost';

    const items = [...(overlay || d).querySelectorAll('*')].map(el => {
      const cs = win.getComputedStyle(el), rc = el.getBoundingClientRect();
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      const scrolls = /auto|scroll/.test(cs.overflowX + ' ' + cs.overflowY);
      const hidden = /hidden/.test(cs.overflowX + ' ' + cs.overflowY);
      return {
        k: el.tagName + '.' + String(el.className && el.className.baseVal !== undefined
             ? el.className.baseVal : el.className || '').trim().slice(0, 34),
        t: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
        h: +rc.height.toFixed(1), w: +rc.width.toFixed(1),
        lines: rc.height > 0 && lh > 0 ? Math.round(rc.height / lh) : 0,
        /* content past a box that cannot scroll it */
        clipY: hidden && el.scrollHeight > el.clientHeight + 1 ? el.scrollHeight - el.clientHeight : 0,
        clipX: hidden && el.scrollWidth > el.clientWidth + 1 ? el.scrollWidth - el.clientWidth : 0,
        /* a fixed-height control whose content no longer fits */
        tight: (cs.height !== 'auto' && !scrolls && !hidden && el.scrollHeight > el.clientHeight + 1)
                 ? el.scrollHeight - el.clientHeight : 0,
        escapes: frame && !hasScrollAncestor(el, win, frame)
                 ? Math.max(0, Math.round(rc.right - frame.getBoundingClientRect().right),
                               Math.round(frame.getBoundingClientRect().left - rc.left)) : 0
      };
    });

    const box = pageHosted ? sc : (scrollerIn(overlay, win) || frame);
    return {
      nodes: d.querySelectorAll('*').length,
      sbH: (win.getComputedStyle(d.body).getPropertyValue('--sbH') || '(unset)').trim(),
      hasStatebar: d.body.classList.contains('has-statebar'),
      statebarInDom: !!d.querySelector('.statebar'),
      path: location.pathname.replace(/^\/(before|after)/, ''),
      href: d.location.pathname,
      scroller: sc === d.documentElement ? '(document)' : (sc.id ? '#' + sc.id : sc.className),
      need: sc.scrollHeight, got: sc.clientHeight,
      boxName: box ? (box.id ? '#' + box.id : '.' + String(box.className || '').split(' ')[0]) : '(none)',
      panelNeed: box ? box.scrollHeight : 0,
      panelGot: box ? box.clientHeight : 0,
      panelH: frame ? +frame.getBoundingClientRect().height.toFixed(1) : 0,
      sig: sig,
      inputs: [...(overlay || d).querySelectorAll('input,select,textarea')]
        .filter(e => !['hidden', 'checkbox', 'radio'].includes(e.type))
        .map(e => ({ sel: (e.id ? '#' + e.id : '.' + String(e.className || '').split(' ')[0]) + '[' + (e.type || e.tagName.toLowerCase()) + ']',
                     fs: parseFloat(win.getComputedStyle(e).fontSize) })),
      items: items
    };
  }

  function load(base, page, w, opener, settle) {
    return new Promise(res => {
      const f = document.createElement('iframe');
      f.style.cssText = 'position:fixed;left:-9999px;top:0;border:0;width:' + w + 'px;height:900px';
      document.body.appendChild(f);
      let fired = false;
      const done = () => {
        if (fired) return; fired = true;
        let out; try { out = collect(f.contentDocument, f.contentWindow); }
        catch (e) { out = { err: String(e) }; }
        f.remove(); res(out);
      };
      f.onload = () => setTimeout(() => {
        let p; try { p = opener ? opener(f.contentDocument, f.contentWindow) : null; } catch (e) { p = null; }
        Promise.resolve(p).then(() => {
          /* ⚠️⚠️ THE PROTOTYPE'S OWN SCAFFOLDING IS REMOVED BEFORE ANYTHING IS READ
             (2026-10-02). `body.has-statebar .fs-box{height:min(90vh, 100vh - var(--sbH) - 32px)}`
             takes the settings bar's height out of EVERY overlay — 158px at 1280, 229px at
             601, nothing at ≤600 where the bar is hidden. Measured with it open, the
             wizard's Capacity step overflowed by 42px at 1280; with it gone the same step
             fits exactly. That bar does not exist in the product, so measuring with it is
             measuring the review tool.
             The class is what gates both rules, so dropping it is enough and is clean —
             `--sbH` is left declared and simply stops being read. The element goes too, so
             a later `PageStates.sync()` cannot put the class back under the measurement. */
          try {
            const d = f.contentDocument;
            const bar = d.querySelector('.statebar'); if (bar) bar.remove();
            d.body.classList.remove('has-statebar');
            d.body.style.removeProperty('--sbH');
          } catch (e) {}
          setTimeout(done, settle || 900);
        });
      }, 650);
      /* ⚠️ A page spec may carry a query (`license.html?id=B13`). Appending `.html` to the
         whole string put it AFTER the query and asked the server for `license?id=B13.html`
         — a 404, which guard 1 caught as "nodes 9/9" on four cells rather than letting a
         near-empty document be measured as a licence panel. */
      const q = page.indexOf('?');
      const file = q < 0 ? page + '.html' : page.slice(0, q) + (page.slice(0, q).endsWith('.html') ? '' : '.html') + page.slice(q);
      f.src = '/' + base + '/' + file;
      setTimeout(done, 9000);
    });
  }

  /* ⚠️⚠️ GUARD 5 — THE SURFACE MUST BE THE ONE THAT WAS ASKED FOR (2026-10-02).
     Guard 4 compares the two BUILDS and says nothing about intent, so when an opener
     failed to reach its modal BOTH builds fell back to the licence panel underneath,
     agreed with each other, and four surfaces — coupon, cancel, Change plan, Manage
     add-ons — were measured as the panel behind them under four different names. The
     numbers were identical across all four, which is the tell; the guard that should
     have caught it is this one. `expect` is the root id the opener is for. */
  /* which two mirrors a run compares; set before queueing */
  root.BASE = root.BASE || { from: 'before', to: 'after' };
  root.measure = async function (name, page, w, opener, settle, expect) {
    /* both builds load at once: they are independent documents, and serially this was the
       whole cost of a run (8.5s a cell, 200 cells). Guard 4 is what makes it safe — if the
       two ever diverge the cell is voided rather than reported. */
    /* ⚠️ PARALLEL BY DEFAULT, SERIAL ON DEMAND. Loading both mirrors at once halves a
       200-cell run, but the openers wait fixed times and two simultaneous page loads make
       the slower one miss its clicks — guard 4 then voids the cell for a state mismatch
       that is a race, not a finding. 23 of 57 voided that way. `window.SERIAL` retries
       those one build at a time, where nothing competes for the main thread. */
    const F = root.BASE.from, T = root.BASE.to;
    const [A, B] = root.SERIAL
      ? [await load(F, page, w, opener, settle), await load(T, page, w, opener, settle)]
      : await Promise.all([load(F, page, w, opener, settle),
                           load(T, page, w, opener, settle)]);
    const fail = m => ({ surface: name, w, VOID: m });

    if (A.err || B.err) return fail('threw: ' + (A.err || B.err));
    if (A.nodes < 50 || B.nodes < 50) return fail('guard 1 nodes ' + A.nodes + '/' + B.nodes + ' — 404?');
    const stem = page.split('?')[0].replace(/\.html$/, '');
    if (A.href.indexOf(stem) < 0 || B.href.indexOf(stem) < 0)
      return fail('guard 2 redirected to ' + A.href + ' / ' + B.href);
    if (A.scroller === '(document)' || B.scroller === '(document)')
      return fail('guard 3 no scroll container found');
    const sa = JSON.stringify(A.sig), sb = JSON.stringify(B.sig);
    if (sa !== sb) return fail('guard 4 state differs — before ' + sa + ' vs after ' + sb);
    if (A.sig.id === '(no overlay)') return fail('guard 4 no overlay opened in either build');
    if (expect && A.sig.id !== expect)
      return fail('guard 5 wrong surface — asked for ' + expect + ', got ' + A.sig.id);
    /* ⚠️ A TREE DIFFERENCE IS NOT A VOID (2026-10-02). A fix that WRAPS something — the
       instances tables gained a `.tablescroll` div — changes the node count on purpose, and
       voiding the cell then hides the one number the fix is being judged on: did the panel's
       height move. Pairing element i against element i is what the mismatch invalidates, so
       only the per-element lists are withheld. The panel geometry is read from the scroll
       box, not from the pairing, and stays reportable. */
    const paired = A.items.length === B.items.length;

    const taller = [], clipped = [], wrapped = [], tight = [], escapes = [];
    for (let i = 0; paired && i < A.items.length; i++) {
      const a = A.items[i], b = B.items[i];
      if (b.h - a.h >= 2) taller.push({ k: a.k, t: a.t, from: a.h, to: b.h });
      if (b.clipY > a.clipY) clipped.push({ k: a.k, t: a.t, over: b.clipY, was: a.clipY, axis: 'y' });
      if (b.clipX > a.clipX) clipped.push({ k: a.k, t: a.t, over: b.clipX, was: a.clipX, axis: 'x' });
      if (b.lines > a.lines && a.lines > 0) wrapped.push({ k: a.k, t: a.t, from: a.lines, to: b.lines });
      if (b.tight > a.tight) tight.push({ k: a.k, t: a.t, over: b.tight, was: a.tight });
      if (b.escapes > a.escapes + 1) escapes.push({ k: a.k, t: a.t, by: b.escapes, was: a.escapes });
    }
    return {
      surface: name, w, base: root.BASE.from + '→' + root.BASE.to,
      state: A.sig.id + (A.sig.step ? ' · ' + A.sig.step : ''),
      paired,
      treeDelta: paired ? 0 : B.items.length - A.items.length,
      panel: { box: B.boxName,
               need: [A.panelNeed, B.panelNeed], got: [A.panelGot, B.panelGot],
               fitsBefore: A.panelNeed <= A.panelGot + 1, fitsAfter: B.panelNeed <= B.panelGot + 1,
               startedScrolling: (A.panelNeed <= A.panelGot + 1) && (B.panelNeed > B.panelGot + 1),
               overflowGrew: (B.panelNeed - B.panelGot) - (A.panelNeed - A.panelGot) },
      pageScroll: { before: A.need, after: B.need, avail: B.got },
      inputsUnder16: B.inputs.filter(i => i.fs < 16),
      inputCount: B.inputs.length,
      taller: taller.sort((x, y) => (y.to - y.from) - (x.to - x.from)).slice(0, 8),
      tallerN: taller.length,
      clipped, wrapped, tight, escapes
    };
  };
  root.__harnessReady = true;
})(window);

/* The four non-type fixes, measured directly in both builds.
 *
 * The paired-mirror harness answers "did the panel's height move". Three of the four fixes
 * are about a single element's shape — how many lines it takes, how wide it is allowed to
 * be, whether a row wraps — and two of them sit in the dialog FOOTER, outside the scroll
 * box the harness reports on. Those need their own reading.
 *
 * It also records the reading order of the two rows that gained `flex-wrap`, because a
 * wrap is exactly the change that can reorder a row at a width nobody looked at.
 */
(function (root) {
  const TARGETS = {
    'cancel-help':    '.cancel-help',
    'dialog':         '.modal',
    'footer':         '.modal .mf',
    'fhead':          '.fhead',
    'feature sh':     '#featureBlock .sh',
    'paystripe-note': '.paystripe-note',
    'canvas':         '.canvas',
    'tablescroll':    '.insttype > .tablescroll',
    'insttable':      '.insttype table'
  };

  function read(d, win, sel) {
    const el = d.querySelector(sel);
    if (!el || !el.getClientRects().length) return null;
    const cs = win.getComputedStyle(el), rc = el.getBoundingClientRect();
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    const hid = /hidden/.test(cs.overflowX + ' ' + cs.overflowY);
    return {
      w: Math.round(rc.width), h: Math.round(rc.height),
      lines: lh > 0 ? Math.round(rc.height / lh) : 0,
      overflowX: cs.overflowX, whiteSpace: cs.whiteSpace, flexWrap: cs.flexWrap,
      clipX: hid && el.scrollWidth > el.clientWidth + 1 ? el.scrollWidth - el.clientWidth : 0,
      scrollableX: el.scrollWidth > el.clientWidth + 1 ? el.scrollWidth - el.clientWidth : 0
    };
  }

  function orderOf(d, win, sel) {
    const row = d.querySelector(sel);
    if (!row || !row.getClientRects().length) return null;
    const kids = [...row.children].filter(e => e.getClientRects().length).map((e, i) => {
      const r = e.getBoundingClientRect();
      return { dom: i, x: Math.round(r.left), y: Math.round(r.top), h: Math.round(r.height),
               k: String(e.className || e.tagName).split(/\s+/)[0] || e.tagName,
               t: (e.textContent || '').trim().slice(0, 24) };
    });
    if (!kids.length) return null;
    const tall = Math.max(1, ...kids.map(b => b.h));
    const vis = kids.slice().sort((a, b) =>
      (Math.abs(a.y - b.y) > tall / 2 ? a.y - b.y : a.x - b.x));
    return {
      rows: new Set(kids.map(b => Math.round(b.y / Math.max(1, tall / 2)))).size,
      visual: vis.map(b => b.k + (b.t ? '(' + b.t + ')' : '')),
      reordered: vis.map(b => b.dom).join() !== kids.map((_, i) => i).join()
    };
  }

  root.probeFix = async function (build, page, w, opener, settle) {
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;left:-99999px;top:0;border:0';
    f.width = w; f.height = 900;
    const q = page.indexOf('?');
    const file = q < 0 ? page + '.html' : page.slice(0, q) + '.html' + page.slice(q);
    f.src = '/' + build + '/' + file + (file.indexOf('?') < 0 ? '?' : '&') + 'v=' + Date.now();
    document.body.appendChild(f);
    try {
      await new Promise(ok => { f.onload = ok; setTimeout(ok, 15000); });
      const d = f.contentDocument, win = f.contentWindow;
      const bar = d.querySelector('.statebar'); if (bar) bar.remove();
      d.body.classList.remove('has-statebar');
      d.body.style.removeProperty('--sbH');
      if (opener) await opener(d, win);
      await new Promise(ok => setTimeout(ok, settle || 500));
      const out = { build, w, el: {}, order: {} };
      for (const name in TARGETS) { const r = read(d, win, TARGETS[name]); if (r) out.el[name] = r; }
      out.order['.modal .mf'] = orderOf(d, win, '.modal .mf');
      out.order['#featureBlock .sh'] = orderOf(d, win, '#featureBlock .sh');
      return out;
    } finally { f.remove(); }
  };
})(window);

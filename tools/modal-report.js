/* Turn the harness's RESULTS array into the report, worst-first.
 * Loaded into the measuring page: `fetch('/report.js').then(r=>r.text()).then(eval)` */
(function (root) {
  const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|');

  root.report = function (RESULTS) {
    const ok = RESULTS.filter(r => !r.VOID);
    const dead = RESULTS.filter(r => r.VOID);

    /* ---- the findings, ordered by how visible they are, not by file ---- */
    const F = { startedScrolling: [], clipped: [], tight: [], escapes: [], wrapped: [], under16: [], grew: [] };
    for (const r of ok) {
      if (r.panel.startedScrolling) F.startedScrolling.push(r);
      else if (r.panel.overflowGrew > 0) F.grew.push(r);
      r.clipped.forEach(c => F.clipped.push({ r, c }));
      r.tight.forEach(c => F.tight.push({ r, c }));
      r.escapes.forEach(c => F.escapes.push({ r, c }));
      r.wrapped.forEach(c => F.wrapped.push({ r, c }));
      (r.inputsUnder16 || []).forEach(i => F.under16.push({ r, i }));
    }

    const L = [];
    const w = s => L.push(s == null ? '' : s);

    w('# Modal surfaces — what the type floor did to them');
    w('');
    w('Measurement only. Nothing was changed to make anything fit.');
    w('');
    w('`before` = `4c8678f` (the last code before the typography passes) · `after` = `HEAD`.');
    w('Both exported with `tools/mirror.sh`, served from one origin, loaded into paired');
    w('iframes of matched width, diffed in the browser. Only differences are reported.');
    w('');
    w('## What broke, worst first');
    w('');

    if (F.clipped.length) {
      w('### Text clipped — content past a box that cannot scroll it');
      w('');
      w('| surface | width | element | text | overflow |');
      w('|---|---:|---|---|---:|');
      F.clipped.sort((a, b) => b.c.over - a.c.over).forEach(({ r, c }) =>
        w('| ' + esc(r.surface) + ' | ' + r.w + ' | `' + esc(c.k) + '` | ' + esc(c.t) + ' | **' + c.over + 'px ' + c.axis + '** |'));
      w('');
    } else { w('### Text clipped'); w(''); w('None, on any surface at any width.'); w(''); }

    if (F.startedScrolling.length) {
      w('### Panels that fitted before and scroll now');
      w('');
      w('The finding the brief asked for first.');
      w('');
      w('| surface | width | scroll box | content before → after | available |');
      w('|---|---:|---|---|---:|');
      F.startedScrolling.sort((a, b) => (b.panel.need[1] - b.panel.got[1]) - (a.panel.need[1] - a.panel.got[1]))
        .forEach(r => w('| ' + esc(r.surface) + ' | ' + r.w + ' | `' + esc(r.panel.box) + '` | ' +
          r.panel.need[0] + ' → **' + r.panel.need[1] + '** | ' + r.panel.got[1] + ' |'));
      w('');
    } else { w('### Panels that fitted before and scroll now'); w(''); w('None.'); w(''); }

    if (F.tight.length) {
      w('### Fixed-height controls whose content no longer fits');
      w('');
      w('| surface | width | control | text | over by |');
      w('|---|---:|---|---|---:|');
      F.tight.sort((a, b) => b.c.over - a.c.over).forEach(({ r, c }) =>
        w('| ' + esc(r.surface) + ' | ' + r.w + ' | `' + esc(c.k) + '` | ' + esc(c.t) + ' | **' + c.over + 'px** |'));
      w('');
    } else { w('### Fixed-height controls whose content no longer fits'); w(''); w('None.'); w(''); }

    if (F.escapes.length) {
      w('### Content past the modal frame');
      w('');
      w('Scroll-ancestor filtered: anything inside a legitimate scroller is not counted.');
      w('');
      /* ⚠️ COLLAPSED TO ONE ROW PER SURFACE AND WIDTH. When a table overflows, every TR,
         TD, svg and <use> inside it overflows by the same amount — 203 rows describing
         one defect. The widest offender is kept and the rest counted, the same way the
         `.tablescroll` filter stopped the previous run reporting 21 invented faults. */
      const grouped = {};
      F.escapes.forEach(({ r, c }) => {
        const k = r.surface + '|' + r.w;
        if (!grouped[k] || c.by > grouped[k].c.by) grouped[k] = { r, c, n: 0 };
        grouped[k].n++;
      });
      w('| surface | width | widest offender | past the frame | descendants with it |');
      w('|---|---:|---|---:|---:|');
      Object.values(grouped).sort((a, b) => b.c.by - a.c.by).forEach(({ r, c, n }) =>
        w('| ' + esc(r.surface) + ' | ' + r.w + ' | `' + esc(c.k) + '` | **' + c.by + 'px** (was ' + c.was + ') | ' + (n - 1) + ' |'));
      w('');
    } else { w('### Content past the modal frame'); w(''); w('None.'); w(''); }

    if (F.under16.length) {
      w('### Inputs below 16px');
      w('');
      w('| surface | width | input | size |');
      w('|---|---:|---|---:|');
      F.under16.forEach(({ r, i }) => w('| ' + esc(r.surface) + ' | ' + r.w + ' | `' + esc(i.sel) + '` | **' + i.fs + 'px** |'));
      w('');
    } else {
      w('### Inputs below 16px');
      w('');
      const n = ok.reduce((a, r) => a + (r.inputCount || 0), 0);
      w('None. ' + n + ' input readings across every surface and width, all 16 or more.');
      w('');
    }

    /* ---- wraps, grouped by what wrapped ---- */
    w('## New wraps');
    w('');
    if (!F.wrapped.length) { w('None.'); w(''); }
    else {
      const byEl = {};
      F.wrapped.forEach(({ r, c }) => {
        const key = c.k + '|' + (c.t || '').slice(0, 28);
        (byEl[key] = byEl[key] || { k: c.k, t: c.t, hits: [] }).hits.push(r.surface + ' @' + r.w + ' (' + c.from + '→' + c.to + ')');
      });
      w('| element | text | where, and at which width |');
      w('|---|---|---|');
      Object.values(byEl).sort((a, b) => b.hits.length - a.hits.length).forEach(e =>
        w('| `' + esc(e.k) + '` | ' + esc(e.t) + ' | ' + esc(e.hits.join(' · ')) + ' |'));
      w('');
    }

    /* ---- the full grid ---- */
    w('## Every cell');
    w('');
    w('Content height of the surface\'s own scroll box, before → after, against what it has.');
    w('');
    const bySurface = {};
    ok.forEach(r => (bySurface[r.surface] = bySurface[r.surface] || {})[r.w] = r);
    const widths = [...new Set(ok.map(r => r.w))].sort((a, b) => b - a);
    w('| surface | ' + widths.join(' | ') + ' |');
    w('|---|' + widths.map(() => '---:').join('|') + '|');
    Object.keys(bySurface).sort().forEach(s => {
      const cells = widths.map(wd => {
        const r = bySurface[s][wd];
        if (!r) return '·';
        const d = r.panel.need[1] - r.panel.need[0];
        const over = r.panel.need[1] - r.panel.got[1];
        const mark = r.panel.startedScrolling ? ' ⚠' : '';
        return (d === 0 ? '—' : (d > 0 ? '+' + d : String(d))) + (over > 0 ? ' /' + over : '') + mark;
      });
      w('| ' + esc(s) + ' | ' + cells.join(' | ') + ' |');
    });
    w('');
    w('`+n` = the content grew by n px. `/n` = it exceeds its box by n px after the pass.');
    w('`⚠` = it fitted before and does not now. `—` = no change.');
    w('');

    if (dead.length) {
      w('## Cells the guards voided');
      w('');
      w('A voided cell is a cell with no number, not a cell with a zero.');
      w('');
      w('| surface | width | why |');
      w('|---|---:|---|');
      dead.forEach(r => w('| ' + esc(r.surface) + ' | ' + r.w + ' | ' + esc(r.VOID) + ' |'));
      w('');
    }
    return L.join('\n');
  };
})(window);

/* Openers for every overlay surface, plus the job list builder.
 *
 * ⚠️ THIS FILE EXISTS BECAUSE THE OPENERS LIVED IN BROWSER MEMORY AND WERE LOST TWICE —
 * once when the scratchpad was cleared between sessions, once when the app was quit
 * mid-run. The rig is only reproducible if every part of it is on disk.
 *
 * Each opener drives BOTH mirrors identically; `expect` is the overlay root the surface
 * must end in, which guard 5 checks. Loaded with:
 *   fetch('/openers.js').then(r=>r.text()).then(eval)
 */
(function (root) {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  /* ⚠️⚠️ WAIT FOR THE THING, DO NOT GUESS HOW LONG IT TAKES (2026-10-02). Every opener used
     fixed delays, and two mirrors loading at once make the slower one miss them — the
     guards then void the cell for a state mismatch that is a race, not a finding. Worse,
     an opener that half-fired took the FALLBACK path in one build and the direct path in
     the other, which is a different licence, not merely a later one. Polling for the
     condition removes the class of failure instead of lengthening a guess. */
  const until = async (fn, ms) => {
    const t0 = Date.now();
    while (Date.now() - t0 < (ms || 5000)) { try { if (fn()) return true; } catch (e) {} await wait(60); }
    return false;
  };
  const click = (d, re, sel) => {
    const e = [...d.querySelectorAll(sel || 'button,a')].find(x => re.test((x.textContent || '').trim()));
    if (e) { e.click(); return true; } return false;
  };
  /* ⚠️⚠️ OPENED THROUGH THE PRODUCT'S OWN ENTRY POINT, NOT BY CLICKING A ROW (2026-10-02).
     The Licenses page pages its list: 17 licences in the dataset, THREE rows on screen, and
     all three are subscriptions. `rows.find(/Perpetual/)` therefore found nothing and fell
     back to `rows[0]`, so the "perpetual" and "grant" variants measured the same
     subscription as the other two — the third time in this work that a variant axis
     silently did not vary, and the third time the tell was identical numbers across
     supposedly different configurations.
     `LicenseDetails.openModal(licById(id))` is what a row click ends up calling, so this
     is the same surface by the same route, with the licence chosen rather than hoped for. */
  const LIC_ID = { sub: 'B13', perp: 'B10', grant: 'B15' };
  const openLic = async (d, kind, win) => {
    const w = win || d.defaultView;
    const id = LIC_ID[kind];
    /* ⚠️ NO FALLBACK. A row click picks whatever is on page one — three subscriptions out
       of seventeen licences — so a fallback does not degrade the measurement, it silently
       changes which licence is being measured. If the product's own entry point is not
       there, the opener does nothing and the guards void the cell, which is the honest
       outcome. */
    /* ⚠️ THE GLOBALS EXIST BEFORE THE PAGE HAS BOOTED. `licById` and `LicenseDetails` are
       script-level, so they answer the moment the file parses — call `openModal` then and
       it runs against a list that has not rendered, and silently does nothing. Waiting for
       a ROW proves the page actually ran. */
    const ready = await until(() => w.licById && w.LicenseDetails && w.LicenseDetails.openModal
      && w.licById(id) && d.querySelector('tr.licc-row,.lcard'));
    if (!ready) return;
    w.LicenseDetails.openModal(w.licById(id));
    await until(() => { const m = d.querySelector('#licModal'); return m && !m.hidden && m.querySelector('h1'); });
    await wait(250);
  };

  root.OP = {
    /* ⚠️ THE BILLING MODEL IS CHOSEN BY WHICH GROUP'S `Select` IS PRESSED, never by a tab:
       `.nl-billtab` is hidden above 600px, so clicking it there silently did nothing and
       every "perpetual" cell measured the subscription path. */
    wiz: (prod, bill, step) => async (d) => {
      await until(() => [...d.querySelectorAll('button,a')].some(x => /buy a license/i.test((x.textContent||'').trim())));
      click(d, /buy a license/i);
      await until(() => { const m = d.querySelector('#nlModal'); return m && !m.hidden && d.querySelector('.plancard'); });
      await wait(250);
      if (prod === 'tbmq') {
        const e = [...d.querySelectorAll('[data-nl-product]')].find(x => /tbmq/i.test(x.textContent));
        e && e.click(); await wait(400);
      }
      const want = bill === 'perp' ? 'perpetual' : 'subscription';
      if (step > 0) {
        const tab = [...d.querySelectorAll('.nl-billtab')]
          .find(x => new RegExp(want === 'perpetual' ? 'perpetual' : 'pay-as-you-go', 'i').test(x.textContent));
        if (tab && tab.getClientRects().length) { tab.click(); await wait(350); }
        const grp = [...d.querySelectorAll('.plangroup')].find(g => g.dataset.bill === want);
        const sel = grp && [...grp.querySelectorAll('.plancard button')].find(b => /^select$/i.test(b.textContent.trim()));
        if (sel) sel.click(); else click(d, /^select$/i);
        await wait(420);
        for (let i = 1; i < step; i++) { click(d, /^(continue|next|review|go to payment)/i); await wait(400); }
      }
      await wait(250);
    },
    licModal: (kind, alert) => async (d, w) => {
      await openLic(d, kind, w);
      const a = d.querySelector('#subAlert'); if (a) a.hidden = !alert; await wait(200);
    },
    licPage: (alert) => async (d) => {
      await wait(550);
      const a = d.querySelector('#subAlert'); if (a) a.hidden = !alert; await wait(200);
    },
    coupon: () => async (d, w) => {
      await openLic(d, 'perp', w);
      await until(() => d.querySelector('#couponBtn'));
      const b = d.querySelector('#couponBtn'); if (!b) return;
      b.click();
      await until(() => { const o = d.querySelector('#couponOverlay'); return o && !o.hidden; });
      await wait(250);
    },
    cancel: () => async (d, w) => {
      await openLic(d, 'sub', w);
      await until(() => d.querySelector('#headKebabBtn'));
      const k = d.querySelector('#headKebabBtn'); if (!k) return;
      k.click();
      await until(() => [...d.querySelectorAll('button,[role="menuitem"]')].some(x => /cancel subscription/i.test(x.textContent)));
      const c = [...d.querySelectorAll('button,[role="menuitem"]')].find(x => /cancel subscription/i.test(x.textContent));
      if (!c) return;
      c.click();
      await until(() => { const o = d.querySelector('#overlay'); return o && !o.hidden && o.querySelector('.modal'); });
      await wait(250);
    },
    users: () => async (d) => {
      await until(() => d.querySelector('#usersMenuBtn'));
      const b = d.querySelector('#usersMenuBtn'); if (!b) return;
      b.click();
      await until(() => { const m = d.querySelector('#usersModal'); return m && !m.hidden; });
      await wait(250);
    },
    /* the pay overlay has no trigger of its own — every `[data-paycard]` sits in a banner
       that needs the card_expiring condition, so the product's own builder is called */
    paycard: () => async (d, w) => {
      if (!await until(() => w.PayCard && w.PayCard.open)) return;
      w.PayCard.open(null);
      await until(() => { const o = d.querySelector('#payOverlay'); return o && !o.hidden; });
      await wait(250);
    },
    wizMode: (mode) => async (d, w) => {
      await openLic(d, 'sub', w);
      const selId = mode === 'addons' ? '#planManageBtn' : '#changePlanBtn';
      await until(() => d.querySelector(selId));
      const b = d.querySelector(selId); if (!b) return;
      b.click();
      await until(() => { const m = d.querySelector('#nlModal'); return m && !m.hidden && m.querySelector('.nl-step.is-cur'); });
      await wait(250);
    },
    /* ⚠️ the trigger is `.perbtn` INSIDE the control — wireSheetTrigger binds there, and
       the sheets only exist at ≤600 (it returns early above it) */
    sheet: (ctl) => async (d) => { const e = d.querySelector(ctl + ' .perbtn') || d.querySelector(ctl); e && e.click(); await wait(600); }
  };

  /* name, page, opener spec, expected overlay root */
  root.SURFACES = [
    ['Users modal (invite user)',          'index',          ['users'],                 'usersModal'],
    ['add payment method',                 'billing',        ['paycard'],               'payOverlay'],
    ['cancel subscription',                'licenses',       ['cancel'],                'overlay'],
    ['coupon overlay',                     'licenses',       ['coupon'],                'couponOverlay'],
    ['licence panel (modal) · subscription · alert',    'licenses', ['licModal','sub',true],  'licModal'],
    ['licence panel (modal) · subscription · no alert', 'licenses', ['licModal','sub',false], 'licModal'],
    ['licence panel (modal) · perpetual',  'licenses',       ['licModal','perp',false], 'licModal'],
    ['licence panel (modal) · grant',      'licenses',       ['licModal','grant',false],'licModal'],
    ['licence panel (page) · subscription · alert',    'license?id=B13', ['licPage',true],  'licDetailsHost'],
    ['licence panel (page) · subscription · no alert', 'license?id=B13', ['licPage',false], 'licDetailsHost'],
    ['licence panel (page) · perpetual',   'license?id=B10', ['licPage',false],         'licDetailsHost'],
    ['licence panel (page) · grant',       'license?id=B15', ['licPage',false],         'licDetailsHost'],
    ['wizard · Choose your plan · TB sub', 'index',          ['wiz','tb','sub',0],      'nlModal'],
    ['wizard · Capacity · TB sub',         'index',          ['wiz','tb','sub',1],      'nlModal'],
    ['wizard · Capacity · TB perp',        'index',          ['wiz','tb','perp',1],     'nlModal'],
    ['wizard · Capacity · TBMQ sub',       'index',          ['wiz','tbmq','sub',1],    'nlModal'],
    ['wizard · Capacity · TBMQ perp',      'index',          ['wiz','tbmq','perp',1],   'nlModal'],
    ['wizard · Add-ons · TB sub',          'index',          ['wiz','tb','sub',2],      'nlModal'],
    ['wizard · Add-ons · TB perp',         'index',          ['wiz','tb','perp',2],     'nlModal'],
    ['wizard · Add-ons · TBMQ perp',       'index',          ['wiz','tbmq','perp',2],   'nlModal'],
    ['wizard · Review & pay · TB sub',     'index',          ['wiz','tb','sub',3],      'nlModal'],
    ['wizard · Review & pay · TB perp',    'index',          ['wiz','tb','perp',3],     'nlModal'],
    ['wizard · Review & pay · TBMQ sub',   'index',          ['wiz','tbmq','sub',3],    'nlModal'],
    ['wizard · Review & pay · TBMQ perp',  'index',          ['wiz','tbmq','perp',3],   'nlModal'],
    ['wizard · Change plan',               'licenses',       ['wizMode','change'],      'nlModal'],
    ['wizard · Manage add-ons',            'licenses',       ['wizMode','addons'],      'nlModal'],
    ['filter sheet · Activity period',     'activity',       ['sheet','#actPeriod'],    'filterSheet'],
    ['filter sheet · Activity type',       'activity',       ['sheet','.acttypectl'],   'filterSheet'],
    ['filter sheet · Invoices status',     'invoices',       ['sheet','#invStatusCtl'], 'filterSheet'],
    ['filter sheet · Licenses',            'licenses',       ['sheet','#licStatusCtlC'],'filterSheet']
  ];
  /* the sheets exist only at ≤600 — wireSheetTrigger returns early above it */
  root.SHEETS = ['filter sheet · Activity period','filter sheet · Activity type',
                 'filter sheet · Invoices status','filter sheet · Licenses'];

  /* queue `names` × `widths` and run them, appending to root.RESULTS */
  root.queue = function (widths, names) {
    const pick = names ? root.SURFACES.filter(s => names.includes(s[0])) : root.SURFACES;
    root.JOBS = []; root.CUR = 0; root.RESULTS = [];
    for (const w of widths) for (const [n, p, op, exp] of pick) {
      if (root.SHEETS.indexOf(n) >= 0 && w > 600) continue;   // the sheet does not exist there
      root.JOBS.push({ name: n, page: p, w, op, exp });
    }
    return root.JOBS.length;
  };
  /* re-queue whatever the guards voided; the caller usually sets SERIAL first */
  root.retryVoids = function () {
    const bad = root.RESULTS.filter(r => r.VOID);
    const keys = new Set(bad.map(v => v.surface + '@' + v.w));
    const redo = root.JOBS.filter(j => keys.has(j.name + '@' + j.w));
    root.RESULTS = root.RESULTS.filter(r => !r.VOID);
    root.JOBS.push(...redo);
    return redo.length;
  };
  root.run = function (budget) {
    root.__running = true;
    return (async () => {
      const t0 = Date.now();
      while (root.CUR < root.JOBS.length && Date.now() - t0 < (budget || 900000)) {
        const j = root.JOBS[root.CUR];
        const o = root.OP[j.op[0]].apply(null, j.op.slice(1));
        let r; try { r = await measure(j.name, j.page, j.w, o, 450, j.exp); }
        catch (e) { r = { surface: j.name, w: j.w, VOID: 'threw ' + e }; }
        root.RESULTS.push(r); root.CUR++;
      }
      root.__running = false;
      return { done: root.CUR, of: root.JOBS.length };
    })();
  };
})(window);

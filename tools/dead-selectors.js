/* Which selectors in styles.css match nothing, in any state we can reach.
 *
 * Loads tools/selectors.json (built by tools/selector-census.py), then walks a list of
 * SCENARIOS — page + overlay + prototype-variant — at several widths, and for each one
 * runs every probe selector against the live document. A selector is "matched" if it ever
 * matched anywhere; what is left over is the report.
 *
 * ⚠️ DYNAMIC STATE IS HANDLED BY STRIPPING IT, NOT BY SIMULATING IT. `:hover`, `:focus`,
 * `::after` and friends cannot be queried, so the census removes them and probes the
 * ELEMENT. That is the right question: a rule whose element never exists is dead whatever
 * the state; a rule whose element exists is reachable, and whether the pointer is over it
 * is not something a census can decide.
 * ⚠️ The settings bar is NOT removed here — it is part of the prototype and its own
 * selectors must be allowed to match.
 */
(function (root) {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const click = (d, re, sel) => {
    const e = [...d.querySelectorAll(sel || 'button,a')].find(x => re.test((x.textContent || '').trim()));
    if (e) { e.click(); return true; } return false;
  };
  const openLic = async (d, kind) => {
    const pick = { sub: /Subscription/, perp: /Perpetual/, grant: /Grant/ }[kind];
    const rows = [...d.querySelectorAll('tr.licc-row,.lcard')];
    const r = rows.find(x => pick.test(x.textContent)) || rows[0];
    r && r.click(); await wait(650);
  };
  const wiz = (prod, bill, step) => async (d) => {
    click(d, /buy a license/i); await wait(450);
    if (prod === 'tbmq') { const e = [...d.querySelectorAll('[data-nl-product]')].find(x => /tbmq/i.test(x.textContent)); e && e.click(); await wait(380); }
    const want = bill === 'perp' ? 'perpetual' : 'subscription';
    if (step > 0) {
      const grp = [...d.querySelectorAll('.plangroup')].find(g => g.dataset.bill === want);
      const sel = grp && [...grp.querySelectorAll('.plancard button')].find(b => /^select$/i.test(b.textContent.trim()));
      if (sel) sel.click(); else click(d, /^select$/i);
      await wait(400);
      for (let i = 1; i < step; i++) { click(d, /^(continue|next|review|go to payment)/i); await wait(380); }
    }
    await wait(200);
  };

  /* [name, page, store patch, opener] — the store patch is applied before the page loads,
     which is how the ⚙ axes are exercised: every one of them is a store key. */
  root.SCENARIOS = [
    ['landing',        'landing',   { auth: 'out' }, null],
    ['landing · auth sign in',  'landing', { auth: 'out' }, async d => { click(d, /^sign in$/i); await wait(600); }],
    ['landing · auth sign up',  'landing', { auth: 'out' }, async d => { click(d, /^sign up$/i); await wait(600); }],
    ['landing · gradient mesh',   'landing', { auth: 'out', landingBg: 'mesh' }, null],
    ['landing · gradient lifted', 'landing', { auth: 'out', landingBg: 'lifted' }, null],
    ['signin',         'signin',    { auth: 'out' }, null],
    ['signin · signup','signin?mode=signup', { auth: 'out' }, null],
    ['home',           'index',     {}, null],
    ['home · new account',  'index', { auth: 'new' }, null],
    ['home · cards layout', 'index', { homeLayout: 'cards' }, null],
    ['home · dataset A',    'index', { dash: 'A' }, null],
    ['home · dataset G',    'index', { dash: 'G' }, null],
    ['home · alert tone ink', 'index', { alertGround: 'ink' }, null],
    ['home · no card',      'index', { billingData: 'none', paymentMethod: null }, null],
    ['home · credit',       'index', { credit: 120 }, null],
    ['home · impersonating','index', { impersonating: 'dev@thingsboard.io' }, null],
    ['licenses',       'licenses',  {}, null],
    ['instances',      'instances', {}, null],
    ['invoices',       'invoices',  {}, null],
    ['activity',       'activity',  {}, null],
    ['account',        'account',   {}, null],
    ['security',       'security',  {}, null],
    ['billing',        'billing',   {}, null],
    ['privacy',        'privacy',   {}, null],
    ['terms',          'terms',     {}, null],
    ['license-agreement', 'license-agreement', {}, null],
    ['styleguide',     'styleguide',{}, null],
    ['licence modal · sub',   'licenses', {}, d => openLic(d, 'sub')],
    ['licence modal · perp',  'licenses', {}, d => openLic(d, 'perp')],
    ['licence modal · grant', 'licenses', {}, d => openLic(d, 'grant')],
    ['licence modal · ink tone', 'licenses', { alertGround: 'ink' }, d => openLic(d, 'sub')],
    ['licence page · sub',    'license?id=B13', {}, null],
    ['licence page · perp',   'license?id=B10', {}, null],
    ['licence page · grant',  'license?id=B15', {}, null],
    ['licence page · canceled','license?id=B14', {}, null],
    ['wizard · step 1',  'index', {}, wiz('tb', 'sub', 0)],
    ['wizard · step 2',  'index', {}, wiz('tb', 'sub', 1)],
    ['wizard · step 3',  'index', {}, wiz('tb', 'sub', 2)],
    ['wizard · step 4',  'index', {}, wiz('tb', 'sub', 3)],
    ['wizard · perp cap','index', {}, wiz('tb', 'perp', 1)],
    ['wizard · tbmq cap','index', {}, wiz('tbmq', 'sub', 1)],
    ['wizard · no card', 'index', { billingData: 'none', paymentMethod: null }, wiz('tb', 'sub', 3)],
    ['coupon overlay',   'licenses', {}, async d => { await openLic(d, 'perp'); const b = d.querySelector('#couponBtn'); b && b.click(); await wait(600); }],
    ['cancel dialog',    'licenses', {}, async d => { await openLic(d, 'sub'); const k = d.querySelector('#headKebabBtn'); k && k.click(); await wait(300); click(d, /cancel subscription/i, 'button,[role="menuitem"]'); await wait(600); }],
    ['change plan',      'licenses', {}, async d => { await openLic(d, 'sub'); const b = d.querySelector('#changePlanBtn'); b && b.click(); await wait(800); }],
    ['manage add-ons',   'licenses', {}, async d => { await openLic(d, 'sub'); const b = d.querySelector('#planManageBtn'); b && b.click(); await wait(800); }],
    ['users modal',      'index', {}, async d => { const b = d.querySelector('#usersMenuBtn'); b && b.click(); await wait(700); }],
    ['pay overlay',      'billing', {}, async (d, w) => { await wait(350); try { w.PayCard.open(null); } catch (e) {} await wait(600); }],
    ['label editor',     'licenses', {}, async d => { await openLic(d, 'sub'); const c = [...d.querySelectorAll('button,.chip')].find(x => /Add label|Edit label/.test(x.textContent)); c && c.click(); await wait(500); }],
    ['sheet · period',   'activity',  {}, async d => { const e = d.querySelector('#actPeriod .perbtn'); e && e.click(); await wait(550); }],
    ['sheet · type',     'activity',  {}, async d => { const e = d.querySelector('.acttypectl .perbtn'); e && e.click(); await wait(550); }],
    ['sheet · invoices', 'invoices',  {}, async d => { const e = d.querySelector('#invStatusCtl .perbtn'); e && e.click(); await wait(550); }],
    ['sheet · licenses', 'licenses',  {}, async d => { const e = d.querySelector('#licStatusCtlC .perbtn'); e && e.click(); await wait(550); }],
    ['grant stub',       'index', { dash: 'G' }, async d => { const b = d.querySelector('#grantLearnBtn'); b && b.click(); await wait(500); }]
  ];

  const KEY = 'tb-license-portal-demo-v23';
  root.probeState = function (scenario, w, probes, matched) {
    const [name, page, patch, opener] = scenario;
    return new Promise(res => {
      let saved = localStorage.getItem(KEY);
      try {
        const st = JSON.parse(saved);
        Object.assign(st, { auth: 'existing', dash: st.dash || 'B' }, patch);
        localStorage.setItem(KEY, JSON.stringify(st));
      } catch (e) {}
      const f = document.createElement('iframe');
      f.style.cssText = 'position:fixed;left:-9999px;top:0;border:0;width:' + w + 'px;height:900px';
      document.body.appendChild(f);
      let fired = false;
      const done = () => {
        if (fired) return; fired = true;
        let n = 0, nodes = 0, href = '', redirected = false;
        try {
          const d = f.contentDocument;
          nodes = d.querySelectorAll('*').length;
          /* ⚠️ A SCENARIO THAT REDIRECTED PROBED THE WRONG DOCUMENT. Signed out, portal
             pages go to the landing; signed in, the landing goes to index. A census that
             does not check this quietly records the landing's elements as proof that
             twenty other pages' elements exist. */
          href = d.location.pathname;
          const want = page.split('?')[0];
          redirected = href.indexOf(want) < 0;
          if (redirected || nodes < 60) {
            f.remove();
            if (saved != null) localStorage.setItem(KEY, saved);
            return res({ name, w, nodes, href, redirected, newlyMatched: 0, VOID: true });
          }
          for (let i = 0; i < probes.length; i++) {
            if (matched[i]) continue;
            try { if (d.querySelector(probes[i])) { matched[i] = 1; n++; } } catch (e) { matched[i] = 2; }
          }
        } catch (e) {}
        f.remove();
        if (saved != null) localStorage.setItem(KEY, saved);
        res({ name, w, nodes, href, redirected, newlyMatched: n });
      };
      f.onload = () => setTimeout(() => {
        Promise.resolve(opener ? opener(f.contentDocument, f.contentWindow) : null)
          .then(() => setTimeout(done, 500));
      }, 600);
      const q = page.indexOf('?');
      f.src = '/site/' + (q < 0 ? page + '.html' : page.slice(0, q) + '.html' + page.slice(q));
      setTimeout(done, 8000);
    });
  };
})(window);

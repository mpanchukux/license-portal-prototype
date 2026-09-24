/* ============================================================================
   styleguide.js — fills the specimens that must not be hand-written: token
   values are read from the live stylesheet, and every component sample is
   produced by the same builder the product calls. Nothing here re-implements a
   component; if a sample looks wrong, the product looks wrong too.
   ============================================================================ */

var CSSVAR = function(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); };

/* ---------- colour ---------- */
var COLORS = [
  ['--ink',        'text, fills, focus'],
  ['--mid',        'secondary text'],
  ['--faint',      'meta, placeholders'],
  ['--line',       'control borders'],
  ['--line2',      'hairlines, card borders'],
  ['--bg',         'page background'],
  ['--card',       'card / bar surface'],
  ['--fill',       'meter fill'],
  ['--track',      'meter track'],
  ['--chrome',     'chrome surface'],
  ['--chromeLine', 'chrome border'],
  ['--hover',      'hover wash'],
  ['--sel',        'selected nav item']
];
$('#sgColors').innerHTML = COLORS.map(function(c){
  return '<div class="sg-swatch">'
    + '<div class="chip-fill" style="background:' + CSSVAR(c[0]) + '"></div>'
    + '<div class="sg-meta"><b>' + c[0] + '</b><span>' + CSSVAR(c[0]) + ' · ' + c[1] + '</span></div>'
    + '</div>';
}).join('');

/* ---------- type scale ----------
   Three groups, because the prototype really does render three. The BASE tier
   is the desktop scale. The COMPACT tier is what the four `max-width:600px`
   blocks substitute for h1/h2/body — it was undeclared for a long while and the
   phone rules carried the numbers themselves; the tokens now hold them. MONO is
   the licence key, which is sized by hand at three steps and has no tokens.
   Anything not listed here is an exception, and the note under the table names
   every one of them; if the table and the product disagree, the table is wrong. */
var TIERS = [
  ['Base — every viewport unless a compact rule overrides it', [
    ['display', 'Numbers that carry a page'],
    ['h1',      'Page titles'],
    ['h2',      'Section and card titles'],
    ['body',    'Reading text'],
    ['small',   'Meta, help, table text'],
    ['label',   'Uppercase labels']
  ]],
  ['Compact — \u2264600px only, substituted for the base level of the same name', [
    ['h1-sm',   'The page\u2019s own headline: a plan name, Home\u2019s greeting'],
    ['h2-sm',   'An app bar, a block heading, a bottom sheet\u2019s title'],
    ['body-sm', 'Card and list text \u2014 the phone\u2019s commonest size after 14']
  ]]
];
/* the key is monospace and hand-sized; no token owns these, so they are listed
   as measured rather than read from a variable */
var MONOROWS = [
  ['key',        '.keyline .mono',    '28px / 1.15 / -0.01em / 400', 'TB-8F2A-…-4C71', 'font-size:28px;line-height:1.15;letter-spacing:-0.01em'],
  ['key-sm',     '.keyline .mono',    '16px / 1.15 / -0.01em / 400', 'TB-8F2A-…-4C71', 'font-size:16px;letter-spacing:-0.01em'],
  ['key-inline', '.nl-keybox code',   '15px / inherit / 0.02em / 400', 'TB-8F2A-…-4C71', 'font-size:15px;letter-spacing:.02em']
];

function sgTypeRow(name, token, values, specimen, style){
  return '<tr><td>' + name + '</td>'
    + '<td class="sg-cls">' + token + '</td>'
    + '<td class="sg-cls">' + values + '</td>'
    + '<td><span style="' + style + '">' + specimen + '</span></td></tr>';
}

$('#sgType').innerHTML = TIERS.map(function(tier){
  return '<tr class="sg-tier"><td colspan="4">' + tier[0] + '</td></tr>'
    + tier[1].map(function(l){
        var k = l[0];
        var style = 'font-size:var(--t-' + k + '-fs);line-height:var(--t-' + k + '-lh);'
                  + 'letter-spacing:var(--t-' + k + '-ls);font-weight:var(--t-' + k + '-fw);'
                  + (k === 'label' ? 'text-transform:uppercase;' : '');
        var values = CSSVAR('--t-' + k + '-fs') + ' / ' + CSSVAR('--t-' + k + '-lh')
                   + ' / ' + CSSVAR('--t-' + k + '-ls') + ' / ' + CSSVAR('--t-' + k + '-fw');
        return sgTypeRow(k, '--t-' + k + '-*', values, l[1], style);
      }).join('');
}).join('')
+ '<tr class="sg-tier"><td colspan="4">Mono \u2014 the licence key, sized by hand (no tokens)</td></tr>'
+ MONOROWS.map(function(m){
    return sgTypeRow(m[0], m[1], m[2], m[3],
      'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;' + m[4]);
  }).join('');

/* ---------- spacing / layout ---------- */
var SPACE = [
  ['--pageW', 'page container width'],
  ['--pageX', 'container side padding'],
  ['--pageY', 'container top padding'],
  ['--btnH',  'every control height'],
  ['--backW', 'back-button gutter'],
  ['--backGap', 'gutter to content gap']
];
$('#sgSpace').innerHTML = SPACE.map(function(s){
  var v = CSSVAR(s[0]);
  var w = Math.min(parseInt(v, 10) || 0, 320);
  return '<div class="sg-space"><i style="width:' + w + 'px"></i>'
    + '<span>' + s[0] + ' = ' + v + '</span><span style="color:var(--faint)">' + s[1] + '</span></div>';
}).join('');

/* the payment method specimen renders from the same builder the product uses */
(function(){ var c = $('#sgPayCard'); if(c) c.innerHTML = paymentMethodHTML(); })();

/* ---------- the licence table, from the product's own builders ---------- */
(function(){
  var sample = Store.get('datasets').B.licenses.slice(0, 2);
  $('#sgTableHead').innerHTML = headHtml().replace('<th>Updated</th>',
    '<th class="sortable" aria-sort="descending" tabindex="0">Updated</th>');
  // explicit callback: rowHtml takes options as its second argument, and .map
  // would hand it the index instead
  $('#sgTableBody').innerHTML = sample.map(function(p){ return rowHtml(p); }).join('');
})();

/* ---------- plan cards: all three states in one row ----------
   Built by nlPlanCardHTML, the ONE plan-card builder the product has — the wizard,
   the landing page and Home's new-user screen all render it. It used to be a second
   builder plus a string replace to fake the Current-plan strip; both are gone, so a
   card cannot look one way here and another way in the flow.
   The selection object gives the row its three states: card 1 selected, card 2 the
   current plan (strip, no CTA), card 3 plain. */
(function(){
  var set = EC_PLANS['thingsboard|payg'];
  /* ⚠️ PICKED BY NAME, not `slice(0, 3)`. The set leads with the free plan, so a
     positional slice would show Free, Pilot and Startup anyway TODAY — and would
     silently change the specimen the next time the offer is reordered, which is what
     happened when Non-commercial was removed. One free card and two paid ones show both
     SHAPES the component has, and the row keeps its three states. */
  function card(n){ return set.cards.filter(function(c){ return c.name === n; })[0]; }
  var cards = [card('Free'), card('Pilot'), card('Startup')];
  var sel = { product:'thingsboard', kind:'subscription',
              plan:'Pilot', currentName:'Startup' };
  var grid = $('#sgPlans');
  grid.className = 'plangrid withcur';
  grid.innerHTML = cards.map(function(c){ return nlPlanCardHTML(c, set, sel); }).join('');
})();

/* ---------- the stated product ----------
   Built by the same function the three selling surfaces call, so the specimen cannot
   drift from them. `sel` is empty: with no product on it the line falls back to the
   session's arrival, which is exactly what a surface opening fresh does. */
$('#sgProducts').innerHTML = nlProductStatedHTML({});

/* ---------- wizard stepper inside the modal specimen ---------- */
$('#sgWizStep').innerHTML = '<div class="nl-progress">'
  + '<div class="nl-ptrack"><span class="nl-pfill" style="width:25%"></span></div>'
  + '<div class="nl-plabel">Step 1 of 4 · <b>Choose your plan</b></div></div>';

/* ---------- ACTIVITY: every type, from the one component -----------------------
   ⚠️ THE LIST IS DRIVEN BY `ACTIVITY_TEXT`, not written out here. Iterating the map is
   what makes this page unable to fall behind: a type added to the map appears here on
   the next load, and a type whose sample is missing shows as a gap rather than as a
   row somebody remembered to retype.
   ⚠️ The SAMPLE VALUES are the only thing this file owns, and they are data, never
   sentences — the wording comes from the map and the markup from the component, exactly
   as it does in the product. */
(function(){
  var HUMAN = 'mpanchuk@thingsboard.io';
  /* [ actor, fields, detail?, whereItOccurs ] */
  var S = {
    'license.created':          [HUMAN, { kind:'Subscription', entity:'Factory A' }, null,
      'A licence is bought — the purchase wizard commits.'],
    'license.canceled':         [HUMAN, { entity:'Sandbox', until:'Sep 05, 2026' }, null,
      'Cancel, from the licence panel or the row menu.'],
    'license.labeled':          [HUMAN, { entity:'Business', label:'Production EU' },
      [['Previous label', 'EU pilot']], 'The label field on the licence panel.'],
    'license.label_cleared':    [HUMAN, { entity:'Business' }, [['Previous label', 'Production EU']],
      'The same field, emptied.'],
    'license.plan_changed':     [HUMAN, { entity:'Factory A', from:'Startup', to:'Business' },
      [['Devices', '500', '1,000'], ['Production instances', '2', '3']],
      'Change plan — the wizard in change mode.'],
    'license.capacity_changed': [HUMAN, { entity:'Global' },
      [['Production instances', '2', '3'], ['Edge Computing', 'Off', 'On']],
      'Manage add-ons — the same wizard, add-ons mode.'],
    'license.updates_renewed':  [HUMAN, { entity:'On-prem HQ', until:'Sep 24, 2027' },
      [['Previous term', 'Sep 11, 2026'], ['Charged', '$1,999.60']],
      'Renew software updates, on a perpetual.'],
    'license.updates_expiring': [null, { entity:'Warehouse DC', until:'Sep 11, 2026' }, null,
      'The system, as a perpetual\u2019s updates term runs out. No actor.'],
    'license.payment_failed':   [null, { entity:'Factory A', card:'Visa ending 4242' },
      [['Charge', '$299.00'], ['Attempt', 'Auto-pay']],
      'An auto-pay charge is declined. No actor.'],
    'license.payment_recovered':[null, { entity:'Factory A' }, null,
      'The retry succeeds after the card is replaced. No actor.'],
    'license.grant_issued':     [null, { entity:'Community Grant' }, null,
      'A Community Grant is approved. No actor.'],

    'instance.deactivated':     [HUMAN, { entity:'HQ node 2', license:'On-prem HQ' },
      [['Server', 'Stops at its next check-in'], ['Record', 'Kept — can be reconnected']],
      'Deactivate, from the instance row menu.'],
    'instance.deleted':         [HUMAN, { entity:'HQ node 2', license:'On-prem HQ' },
      [['Server', 'Stops at its next check-in'], ['Record', 'Removed permanently']],
      'Delete, from the same menu.'],
    'instance.renamed':         [HUMAN, { entity:'HQ primary', license:'On-prem HQ' },
      [['Previous name', '8e2a6c04']], 'Rename, from the same menu.'],
    'instance.name_cleared':    [HUMAN, { entity:'8e2a6c04', license:'On-prem HQ' },
      [['Previous name', 'HQ primary']], 'The same dialog, emptied.'],
    'instance.check_ok':        [null, { entity:'HQ primary' }, null,
      'Derived hourly from the instance. Shown alone only when a failure breaks the run.'],
    'instance.check_failed':    [null, { entity:'HQ node 2', reason:CHECK_FAIL.connection }, null,
      'Derived. Never folds — it is the entry being scanned for.'],
    'instance.checks_grouped':  [null, { entity:'HQ primary', count:36,
      from:'Sep 22, 2026, 01:21', to:'Sep 23, 2026, 12:21' },
      [['Sep 23, 2026, 12:21', 'Checked in'], ['Sep 23, 2026, 11:21', 'Checked in'],
       ['Sep 23, 2026, 10:21', 'Checked in']],
      'A run of consecutive successes for one instance, folded.'],

    'user.invited':             [HUMAN, { entity:'n.rossi@thingsboard.io' }, null,
      'The invite field in the Users modal.'],
    'user.removed':             [HUMAN, { entity:'dev@thingsboard.io' }, null,
      'Delete, on a user row.'],
    'user.session_started':     [HUMAN, { entity:'i.petrenko@thingsboard.io' }, null,
      'Log in as, on a user row.'],
    'user.session_ended':       [HUMAN, { entity:'i.petrenko@thingsboard.io' }, null,
      'Return, from the impersonation banner.'],
    'user.invite_link_created': [HUMAN, {}, null,
      'Copy invite link, in the Users modal header. No entity — nothing is named yet.'],
    'account.password_changed': [HUMAN, {}, null,
      'The Security page. No entity — the subject is the account.'],

    'billing.invoice_paid':     [HUMAN, { entity:'NAWE49WG-0018', amount:'$299.00' }, null,
      'A charge the person made themselves.'],
    'billing.invoice_autopaid': [null, { entity:'NAWE49WG-0016', amount:'$299.00' }, null,
      'A recurring charge. No actor — and its own type, not this one without a name.'],
    'billing.credit_added':     [null, { entity:'Factory A', amount:'$120.00' },
      [['Balance', '$0.00', '$120.00']],
      'A downgrade returns the unused part of the period. No actor.'],
    'billing.card_added':       [HUMAN, { card:'Visa ending 4242' }, null,
      'The first card, on Payment & Billing.'],
    'billing.card_updated':     [HUMAN, { card:'Visa ending 6411' }, null,
      'Replacing it.']
  };
  var TS = 'Sep 13 2026, 07:12';
  $$('.sg-actlist').forEach(function(box){
    var pre = box.getAttribute('data-actgroup');
    var keys = Object.keys(ACTIVITY_TEXT).filter(function(k){
      var p = k.split('.')[0];
      return p === pre || (pre === 'user' && p === 'account');
    });
    box.innerHTML = keys.map(function(k, n){
      var d = S[k];
      if(!d) return '<div class="sg-actrow"><p class="sg-note">'
        + '<span class="sg-warn"><svg class="ic" aria-hidden="true">'
        + '<use href="assets/icons.svg#ti-alert-triangle"></use></svg></span>'
        + ' no sample for <code class="sg-cls">' + k + '</code></p></div>';
      var rec = { type:k, ts:TS, actor:d[0], f:d[1] };
      if(d[2]) rec.detail = d[2];
      if(k === 'instance.checks_grouped') rec.fold = true;   // the one disclosure left
      /* ⚠️ BOTH SCOPES, and only when they differ — a second copy of an identical
         sentence would teach the opposite of the rule it is there to show. */
      var lic = activitySentence(rec, 'license'), glob = activitySentence(rec, 'global');
      return '<div class="sg-actrow">'
        + '<div class="sg-actkey"><code class="sg-cls">' + k + '</code>'
        +   '<span class="sg-actwhere">' + d[3] + '</span></div>'
        + activityEntry(rec, 'global', pre + n)
        + (lic === glob ? ''
            : '<div class="sg-actscope"><span class="sg-actlabel">In the licence&rsquo;s own tab</span>'
              + activityEntry(rec, 'license', pre + n + 'L') + '</div>')
        + '</div>';
    }).join('');
    wireFeedAudit('.sg-actlist[data-actgroup="' + pre + '"]');
  });
})();

/* ---------- the two live demos on this page ---------- */
// the loading button keeps spinning; the split button shows its menu behaviour
$('#sgSplit').addEventListener('click', function(e){ e.preventDefault(); openStub('Split button'); });
// tables and menus on this page use the same delegated handlers as the product,
// so the row kebab opens for real — nothing extra to wire

/* ---------- the icon set, rendered from the sprite itself ----------------------
   ⚠️ Read from `assets/icons.svg`, not from a list typed here. A hand-kept inventory
   is a second source of truth that goes stale the first time the sprite changes, and
   the whole point of this page is that the available set is VISIBLE rather than
   remembered. Fetching it means the page cannot disagree with the file. */
(function(){
  var host = $('#sgSprite'); if(!host) return;

  $('#sgIcSizes').innerHTML = [16, 20, 24].map(function(s){
    return '<div class="sg-cell">' + icon('device-desktop', { size:s === 16 ? 0 : s })
      + '<span class="sg-cls">' + (s === 16 ? '.ic' : '.ic-' + s) + '</span></div>';
  }).join('');

  /* the same icon three times, inheriting three different text colours */
  $('#sgIcColour').innerHTML = ['var(--ink)', 'var(--mid)', 'var(--faint)'].map(function(c){
    return '<div class="sg-cell" style="color:' + c + '">' + icon('alert-circle', { size:20 })
      + '<span class="sg-cls">' + c + '</span></div>';
  }).join('');

  fetch('assets/icons.svg').then(function(r){ return r.text(); }).then(function(txt){
    /* ⚠️ Capture the name, do not slice the match — `id="ti-` is seven characters and
       counting them by hand produced `i-activity`, which pointed every <use> at a
       symbol that does not exist. The boxes still measured 24px, so a size check saw
       nothing wrong; only the names gave it away. */
    var ids = [];
    txt.replace(/id="ti-([a-z0-9-]+)"/g, function(_, n){ ids.push(n); });
    ids.sort();
    host.innerHTML = ids.map(function(id){
      return '<figure class="sg-ic"><svg class="ic ic-24" aria-hidden="true">'
        + '<use href="assets/icons.svg#ti-' + id + '"></use></svg>'
        + '<figcaption>' + id + '</figcaption></figure>';
    }).join('');
    var h = $('#icons .sg-h2');
    if(h) h.insertAdjacentHTML('afterend',
      '<p class="sg-note sg-spritecount"><b>' + ids.length + ' icons</b> in the sprite.</p>');
  });
})();

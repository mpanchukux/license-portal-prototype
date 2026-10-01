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
/* ⚠️ THE COLOURED LAYER IS LISTED SEPARATELY, and it is listed at all because this page
   claimed token swatches "cannot drift from the values the product uses" while the list
   above was curated by hand — the three selling-surface exceptions had never appeared on
   it, and the status colours would have been the fourth omission. Two rows now: what the
   value IS, and what it is FOR.
   ⚠️ A PRIMITIVE IS SHOWN AS ITS OWN ROW, dimmed by its label rather than by a rule: it
   is not a colour any component may read, and a page that shows it beside the meanings
   without saying so teaches exactly the mistake the two layers exist to prevent. */
var COLORS_PRIMITIVE = [
  ['--c-green-600', 'primitive — read only by a meaning below'],
  ['--c-red-600',   'primitive — read only by a meaning below'],
  ['--c-grey-600',  'primitive — read only by a meaning below']
];
var COLORS_MEANING = [
  ['--status-ok',    'healthy, current, running as intended'],
  ['--status-alert', 'needs doing — failed charge, release behind'],
  ['--status-off',   'switched off rather than wrong — cancelled, ended'],
  ['--accent',       'Popular card ring and tag — LITERAL, not through a primitive'],
  ['--tick',         'plan-card ticks — points at --accent'],
  ['--page-bg',      'Home ground under the mesh — LITERAL, not through a primitive'],
  /* ⚠️ Added 2026-09-28 with the licence header's flat tint. It is the mesh's own
     lavender at ~12% on white — derived from the pool colour, not picked — so the two
     surfaces read as one family without one being a copy of the other. */
  ['--c-lav-50',     'licence header tint — the mesh lavender, flattened']
];
function sgSwatches(list){
  return list.map(function(c){
    return '<div class="sg-swatch">'
      + '<div class="chip-fill" style="background:' + CSSVAR(c[0]) + '"></div>'
      + '<div class="sg-meta"><b>' + c[0] + '</b><span>' + CSSVAR(c[0]) + ' · ' + c[1] + '</span></div>'
      + '</div>';
  }).join('');
}
$('#sgColors').innerHTML = sgSwatches(COLORS);
/* ⚠️ `CSSVAR` resolves the COMPUTED value, so a meaning that points at a primitive
   (or at another meaning, as --tick points at --accent) prints the colour it actually
   paints — the indirection is documented in the prose, not hidden by the swatch. */
if($('#sgColorsPrim')) $('#sgColorsPrim').innerHTML = sgSwatches(COLORS_PRIMITIVE);
if($('#sgColorsMeaning')) $('#sgColorsMeaning').innerHTML = sgSwatches(COLORS_MEANING);

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
/* ⚠️ `key` WAS 28px UNTIL 2026-09-29, when the licence key was put back on one line
   with Status, the period and the version and had to stop being the largest type on
   the panel. Desktop and phone are now the same 16, so this table has two rows where
   it had three — `key-sm` is gone rather than left stating a size nothing renders.
   The rule of this page still holds: if the table and the product disagree, the table
   is the one that is lying. */
var MONOROWS = [
  ['key',        '.keyline .mono',    '16px / 1.35 / 0 / 400', 'TB-8F2A-…-4C71', 'font-size:16px;line-height:1.35'],
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
  /* ⚠️ `licHeadHTML` / `licRowHTML`, NOT `headHtml` / `rowHtml` (2026-10-01): variant A's
     pair went with the `Table` axis, and these two are what every surface in the product
     calls. The `Updated` column went with A, so the sortable-header demonstration moved to
     `Status` — it is a demonstration of the SORTABLE AFFORDANCE, not of that column. */
  $('#sgTableHead').innerHTML = licHeadHTML().replace('<th>Status</th>',
    '<th class="sortable" aria-sort="descending" tabindex="0">Status</th>');
  // explicit callback: licRowHTML takes options as its second argument, and .map
  // would hand it the index instead
  $('#sgTableBody').innerHTML = sample.map(function(p){ return licRowHTML(p); }).join('');
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
/* ⚠️ THE STEPPER SPECIMEN IS HAND-BUILT, and it is the one place on this page that is.
   `renderSteps` lives inside the wizard's IIFE and reads the open flow's own state, so
   there is nothing to call from here — a specimen would have to open a purchase to draw
   one. The markup below is copied from it; if the classes change, this changes. */
/* ⚠️ A CLASS, NOT AN ID (2026-10-01). Two specimens carried `id="sgWizStep"` and it
   WORKED — this reads them with `$$`, which is `querySelectorAll` — but it is the same
   fault that cost Home its column row the same day, two pages away. Changed so the new
   duplicate-id guard can be green rather than carrying an exception. */
$$('.sgWizStep').forEach(function(box){
  /* second field = the optional note, not a description: the stepper stopped printing
     descriptions in 2026-09-27 and prints "(Optional)" under the one step that can be
     passed without answering it (see stepOptional in wizard.js) */
  var S = [['Choose your plan',''],
           ['Capacity',''],
           ['Add-ons','(Optional)'],
           ['Review & pay','']];
  var here = 1;                                   // done · CURRENT · upcoming · upcoming
  var out = '';
  S.forEach(function(d, n){
    var done = n < here, cur = n === here;
    /* the connector takes the state of the step BEFORE it, so the line INTO the current
       step reads as travelled — `n <= here`, not `n < here`. Same off-by-one the
       product's own renderSteps had for one pass. */

    out += '<div class="nl-step' + (done ? ' is-done' : '') + (cur ? ' is-cur' : '') + '">'
      + '<span class="nl-smark">' + (n + 1) + '</span>'
      + '<span class="nl-stxt"><span class="nl-sname">' + esc(d[0]) + '</span>'
      + (d[1] ? '<span class="nl-sopt">' + esc(d[1]) + '</span>' : '') + '</span></div>';
  });
  box.innerHTML = '<div class="nl-steps">' + out + '</div>';
});

/* ---------- the licence table, both layouts, from the same rows ------------------
   ⚠️ RENDERED BY THE PRODUCT'S OWN BUILDERS, not by markup typed here — and by BOTH of
   them explicitly, rather than through `licRowHTML`. The dispatcher follows the ⚙
   setting, which would make this page show the same table twice whenever the setting
   was flipped; a page documenting a comparison has to be the one place the setting does
   not reach. */
(function(){
  var rows = (DATASETS.B && DATASETS.B.licenses ? DATASETS.B.licenses : []).slice(0, 5);
  if(!rows.length) return;
  /* ⚠️ ONE SPECIMEN SINCE 2026-10-01: the `Table` axis retired on what was proposal C, so
     the page documents one table. The `B` slot went from the markup with it. */
  var ha = $('#sgLicHeadA'), ba = $('#sgLicBodyA');
  if(ha) ha.innerHTML = licHeadHTML();
  if(ba) ba.innerHTML = rows.map(function(p){ return licRowHTML(p, { noLabelEdit:true }); }).join('');
})();

/* ---------- LICENCES TOOLBAR: the one that won, and its two menus ----------------
   ⚠️ THE MENUS ARE BUILT FROM `LIC_TYPE_OPTS` / `LIC_STATUS_OPTS`, the same two lists
   page-licenses.js reads. That is the whole reason this specimen is rendered rather
   than typed: this file has twice described a component it no longer had, and a filter
   menu is exactly the kind of thing that grows an option nobody comes back to document.
   ⚠️ THE TOOLBARS ARE STATIC. They are the product's own markup with nothing wired —
   a specimen is for reading the shape, and a live filter here would need a list to
   filter and would then be a second, quietly diverging implementation.
   ⚠️ THE COUNTS ARE REAL, read from the dataset the rest of this page uses, because a
   specimen showing `Subscription 0` teaches the wrong thing about the component. */
(function(){
  var lic = (DATA().licenses || []);
  function typeCount(v){ return lic.filter(function(p){ return p.type === v; }).length; }
  function statusCount(v){ return lic.filter(function(p){ return licStatusMatch(p, v); }).length; }
  function row(label, count, on){
    return '<button type="button" role="menuitemradio" class="dropcheck' + (on ? ' is-on' : '')
      + '" aria-checked="' + (on ? 'true' : 'false') + '" tabindex="-1">'
      /* the specimen follows the product: tick last on a single-select row (2026-10-01) */
      + '<span>' + label + '</span><span class="dropcount">' + count + '</span>'
      + '<svg class="ic cc-check" aria-hidden="true"><use href="assets/icons.svg#ti-check"></use></svg></button>';
  }
  function menu(opts, allLabel, countOf){
    return row(allLabel, lic.length, true)
      + opts.map(function(o){
          return (o.sep ? '<div class="dropsep" role="separator"></div>' : '')
            + row(o.t, countOf(o.v), false);
        }).join('');
  }
  var tm = $('#sgLicTypeMenu'), sm = $('#sgLicStatusMenu');
  if(tm) tm.innerHTML = menu(LIC_TYPE_OPTS, 'All types', typeCount);
  if(sm) sm.innerHTML = menu(LIC_STATUS_OPTS, 'All statuses', statusCount);

  /* ⚠️ THE CLASS IS A LITERAL IN EACH, not one helper taking it as an argument.
     `tools/check-icons.py` reads the markup a file EMITS, and `class="' + cls + '"` is a
     class it cannot read — so a builder that assembles the attribute hides every button
     it makes from the guard. Two three-line functions cost less than a blind spot. */
  /* ⚠️ `typeChip` IS GONE 2026-10-01 — the type CHIPS were toolbar A's; the toolbar that
     won asks that question with a dropdown. */
  function attnChip(t, n){
    return '<button class="filterchip attnchip" tabindex="-1">'
      + '<svg class="ic cc-check" aria-hidden="true"><use href="assets/icons.svg#ti-check"></use></svg>'
      + '<span>' + t + '</span><span class="chipcount">' + n + '</span></button>';
  }
  /* ⚠️ ONE SPECIMEN SINCE 2026-10-01: the `licBar` comparison closed on what was proposal
     C — two dropdowns plus an independent `Needs attention` chip. A (four chips and an
     `Active only` switch) and B (two dropdowns and no attention control) left the product
     with the axis; the slot that showed A now shows the toolbar that won. */
  var a = $('#sgBarA');
  if(a) a.innerHTML = '<div class="lic-controls">'
    + '<div class="searchbox"><svg class="ic searchglyph" aria-hidden="true"><use href="assets/icons.svg#ti-search"></use></svg><input type="search" placeholder="Search licenses" aria-label="Search licenses (specimen)" tabindex="-1"></div>'
    + '<div class="dropwrap perctl"><button class="btn btn--secondary btn--md perbtn" tabindex="-1" aria-haspopup="true" aria-expanded="false"><b>All types</b> <svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-down"></use></svg></button></div>'
    + '<div class="dropwrap perctl"><button class="btn btn--secondary btn--md perbtn" tabindex="-1" aria-haspopup="true" aria-expanded="false"><b>Active</b> <svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-down"></use></svg></button></div>'
    + attnChip('Needs attention', statusCount('attention'))
    + '<span class="spacer"></span>'
    + button({ variant:'secondary', icon:'refresh', ariaLabel:'Refresh', title:'Refresh' })
    /* no leading mark: `.lnb-ic` is display:none above 600px, so on the desktop the
       words ARE the button — the specimen shows what the product shows */
    + button({ variant:'primary', label:'Buy a license' })
    + '</div>';
})();

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
    /* ⚠️⚠️ THREE TYPES AND THE CHANGE SHAPE (2026-10-02). These specimens still carried
       the pre-10-01 payload — a single `['Previous label', X]` row, which is the shape
       this product uses for a fact that did NOT change — so the design system was showing
       the old answer for a surface that had already been rebuilt, and `label_added` was
       not shown at all although the type exists. All three now say what `setLabel` in
       shared.js actually writes: added is one value, changed is old -> new, cleared is
       old -> em dash. */
    'license.label_added':      [HUMAN, { entity:'Business', label:'EU pilot' },
      [['Label', 'EU pilot']], 'The label field on the licence panel, filled for the first time.'],
    'license.labeled':          [HUMAN, { entity:'Business', label:'Production EU' },
      [['Label', 'EU pilot', 'Production EU']], 'The same field, changed to something else.'],
    'license.label_cleared':    [HUMAN, { entity:'Business' }, [['Label', 'Production EU', '\u2014']],
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
      [['Previous name', '8e2a6c04']], 'Edit label, from the same menu.'],
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
  /* ⚠️ THE SHAPE IS DERIVED, NOT DECLARED. Grouping by hand would be a second list to
     keep in step with the first, and the first is `ACTIVITY_TEXT`, which grows. A type
     lands in a group because of what its sample actually renders — a detail array, a
     missing actor, the fold flag — so a new type cannot be filed wrongly, only filed. */
  function actShape(k){
    var d = S[k];
    if(k === 'instance.checks_grouped') return 'fold';
    if(!d) return null;                        // no sample: reported as a gap, below
    if(d[2]) return 'detail';
    if(!d[0]) return 'system';
    return 'plain';
  }
  $$('.sg-actlist').forEach(function(box){
    var pre = box.getAttribute('data-actshape');
    var keys = Object.keys(ACTIVITY_TEXT).filter(function(k){
      var sh = actShape(k);
      /* a type with no sample has no shape either — it is shown once, in the first
         group, as the gap it is, rather than vanishing from the page entirely */
      return sh === pre || (sh === null && pre === 'plain');
    });
    box.innerHTML = keys.map(function(k, n){
      var d = S[k];
      if(!d) return '<div class="sg-actrow"><p class="sg-note">'
        + '<span class="sg-warn"><svg class="ic" aria-hidden="true">'
        + '<use href="assets/icons.svg#ti-alert-triangle"></use></svg></span>'
        + ' no sample for <code class="sg-cls">' + k + '</code></p></div>';
      var rec = { type:k, ts:TS, actor:d[0], f:d[1] };
      if(d[2]) rec.detail = d[2];
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
  });

  /* ---------- the gap specimen: two runs and the hole between them ----------------
     ⚠️ THE ONLY CONSTRUCTED PAIR ON THIS PAGE, and it has to be: a gap is a relationship
     BETWEEN two entries, so no single sample from `ACTIVITY_TEXT` can render it. The
     records are the same shape `foldChecks` emits — same type, same `f` — and they go
     through `activityList` like every real feed, so what is shown is the component and
     not a drawing of it.
     ⚠️ The numbers are chosen to BE a gap: the older run ends 18:10, the newer begins
     20:10, and 19:10 is the slot nothing arrived for. Whoever edits these must keep the
     hole; two runs an hour apart would silently become one continuous story. */
  (function(){
    var host = $('#sgActGap'); if(!host) return;
    var mk = function(count, from, to, ts){
      return { type:'instance.checks_grouped', ts:ts,
               f:{ entity:'Factory A', count:count, from:from, to:to } };
    };
    host.innerHTML = activityList([
      mk(4, 'Sep 23, 2026, 20:10', 'Sep 23, 2026, 23:10', 'Sep 23 2026, 23:10'),
      mk(5, 'Sep 23, 2026, 14:10', 'Sep 23, 2026, 18:10', 'Sep 23 2026, 18:10')
    ], 'global', 'gap');
  })();
})();

/* ---------- the button matrix: variants down, states across ---------------------
   ⚠️ EVERY CELL IS `button()`. Nothing here draws a button — the page asks the
   component for one per cell, which is what makes the matrix a test rather than a
   picture of one. If a combination stops rendering, this page stops rendering it too.
   ⚠️ HOVER, FOCUS AND PRESSED CANNOT BE FAKED with a class, because the component does
   not have one for them — they are `:hover`, `:focus-visible` and `:active`, and the
   browser owns all three. The matrix renders a real button in each cell and LABELS the
   column; you read those three with a pointer and a Tab key, which is the only honest
   way to show a state the markup does not carry. Enabled, disabled and busy are real
   arguments and render as themselves. */
(function(){
  var head = $('#sgBtnHead'), body = $('#sgBtnBody');
  if(!head || !body) return;
  var STATES = [
    ['enabled',  {}],
    ['hovered',  {}],
    ['focused',  {}],
    ['pressed',  {}],
    ['disabled', { disabled:true }],
    ['busy',     { busy:true }]
  ];
  var VARIANTS = ['primary','secondary','text','ghost','menu'];
  head.innerHTML = '<tr><th>Variant</th>'
    + STATES.map(function(s){ return '<th>' + s[0] + '</th>'; }).join('')
    + '<th>icon only</th></tr>';
  body.innerHTML = VARIANTS.map(function(v){
    var labelled = STATES.map(function(st){
      /* menu refuses a label — the component drops it, and the cell shows what you
         actually get rather than pretending the combination exists */
      var o = { variant:v, size:'md', label:'Label', icon:(v==='menu'?'dots-vertical':null) };
      for(var k in st[1]) o[k] = st[1][k];
      if(v === 'menu'){ o.label = ''; o.ariaLabel = 'More actions'; }
      return '<td>' + button(o) + '</td>';
    }).join('');
    var only = button({ variant:v, size:'md',
      icon:(v === 'menu' ? 'dots-vertical' : 'plus'),
      ariaLabel:(v === 'menu' ? 'More actions' : 'Add') });
    return '<tr><th scope="row">' + v + '</th>' + labelled
      + '<td class="sg-btnonly">' + only + '</td></tr>';
  }).join('');

  $('#sgBtnSizes').innerHTML = ['sm','md','lg'].map(function(z){
    return '<div class="sg-cell">' + button({ variant:'primary', size:z, label:'Label' })
      + button({ variant:'secondary', size:z, icon:'plus', ariaLabel:'Add' })
      + '<span class="sg-cls">' + z + '</span></div>';
  }).join('');

  $('#sgBtnTone').innerHTML = ['primary','secondary','text'].map(function(v){
    return '<div class="sg-cell">'
      + button({ variant:v, size:'md', label:'Delete', tone:'destructive' })
      + '<span class="sg-cls">' + v + ' &middot; destructive</span></div>';
  }).join('');

  $('#sgBtnBusy').innerHTML = '<div class="sg-cell">'
      + button({ variant:'primary', size:'md', label:'Confirm purchase', busy:true })
      + '<span class="sg-cls">busy &mdash; the hidden label is holding the width</span></div>'
    + '<div class="sg-cell">'
      + button({ variant:'secondary', size:'md', icon:'refresh', ariaLabel:'Refresh', busy:true })
      + '<span class="sg-cls">busy &middot; icon only</span></div>'
    + '<div class="sg-cell">'
      + button({ variant:'primary', size:'md', label:'Confirm purchase', disabled:true })
      + '<span class="sg-cls">disabled &mdash; same button, different statement</span></div>';
})();

/* ⚠️⚠️ `#sgSplit` IS GONE, AND SO IS THE UNGUARDED LOOKUP THAT KILLED THE PAGE.
   It was the split-button demo inside the old Buttons section. When that section was
   replaced by the matrix the element went with it, and this line — `$('#sgSplit')`
   with no null check — threw on load. Everything after it in this file stopped running,
   INCLUDING the rail that builds the side navigation, so the design system lost its
   navigation and fourteen of its twenty-one pages. The page still looked fine at the
   top, which is why it was reported as "the navigation went somewhere" rather than as a
   crash.
   ⚠️ THE LESSON IS THE GUARD, not the element. Every other block in this file opens with
   `var host = $('#…'); if(!host) return;`. This one line did not, and one line was
   enough. A page whose markup is edited by hand cannot have a script that assumes it.
   Tables and menus on this page use the product's delegated handlers, so the row kebab
   opens for real — nothing to wire here. */

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

/* ============================================================================
   sgRouter — the rail, and one component per page
   ============================================================================
   ⚠️ THE PAGES ARE THE SECTIONS THAT ARE ALREADY IN THE FILE. Nothing is listed twice:
   the rail is built by reading `.sg-sec` out of the document, so a section added to
   styleguide.html appears in the rail on the next load and a section removed disappears
   with it. The old `.sg-toc` was a hand-typed list and had already drifted — it linked
   to `#solo`, `#snack`, `#sheet` and four others that were not sections at all.

   ⚠️ SEVEN ITEMS ARE PROMOTED TO PAGES OF THEIR OWN, and they are promoted HERE rather
   than re-nested in the HTML. They were `.sg-item`s inside `#empty`, which had become a
   drawer: an empty state, a bottom sheet, a snackbar and the Home banner are four
   different components that shared a section only because nobody had moved them out.
   Moving the node at boot costs ten lines and no edit to the specimens; re-nesting the
   markup would have been a 400-line diff across things that work.
   ⚠️ `stickyblock` is NOT promoted — it is a behaviour OF the table, and a page about it
   with no table on it would document nothing.

   ⚠️ Hiding is `hidden`, not a class, so a page that is not on screen is out of the
   accessibility tree too — a rail that says "one page" while a screen reader walks
   twenty-one is not one page. */
(function(){
  var wrap = $('.sg-main'), nav = $('#sgNav');
  if(!wrap || !nav) return;

  /* [id, label] — the label is what the rail shows; the page keeps its own heading */
  var PROMOTE = ['infoicon', 'alerticon', 'homebanner', 'instancesview', 'messages', 'sheet', 'snack', 'solo'];
  PROMOTE.forEach(function(id){
    var item = document.getElementById(id);
    if(!item || item.classList.contains('sg-sec')) return;
    var sec = document.createElement('section');
    sec.className = 'sg-sec';
    sec.id = id;
    item.removeAttribute('id');
    item.parentNode.insertBefore(sec, item.nextSibling);
    sec.appendChild(item);
    wrap.appendChild(sec);                      // out of its old host, into the page list
  });

  var pages = $$('.sg-main .sg-sec');
  /* ⚠️ A RAIL LABEL IS A NAME, NOT A SENTENCE. Three of the promoted items carry headings
     written to be read above a specimen — "Where a message goes — two places, one rule
     each" — which is right there and wrong in a 240px rail. Overridden by id; every other
     page still takes its own heading, so nothing has to be kept in step. */
  var LABEL = { messages:'Messages', homebanner:'Home banner', instancesview:'Instances view',
                infoicon:'Info icon', alerticon:'Alert icon', sheet:'Bottom sheet',
                snack:'Snackbar', solo:'Solo state' };
  function labelOf(sec){
    if(LABEL[sec.id]) return LABEL[sec.id];
    var h = sec.querySelector('h2, h3');
    /* the class chip inside a heading is a caption, not part of the name */
    var t = h ? h.cloneNode(true) : null;
    if(t) $$('.sg-cls', t).forEach(function(n){ n.remove(); });
    return (t ? t.textContent : sec.id).trim().replace(/\s+/g, ' ');
  }
  nav.innerHTML = pages.map(function(sec){
    return '<a href="#' + sec.id + '" data-sgpage="' + sec.id + '">' + esc(labelOf(sec)) + '</a>';
  }).join('');

  function show(id){
    var found = pages.some(function(s){ return s.id === id; });
    if(!found) id = pages[0] && pages[0].id;
    pages.forEach(function(s){ s.hidden = s.id !== id; });
    $$('#sgNav a').forEach(function(a){
      var on = a.getAttribute('data-sgpage') === id;
      a.classList.toggle('on', on);
      /* `aria-current`, not just a class: the rail is a nav, and "which one am I on" is
         the one thing a nav has to say to something that cannot see the highlight */
      if(on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var sc = $('#shellMain');
    if(sc) sc.scrollTop = 0;
  }
  show((location.hash || '').replace('#', ''));
  window.addEventListener('hashchange', function(){ show(location.hash.replace('#', '')); });
})();

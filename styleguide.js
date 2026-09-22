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
  /* ⚠️ PICKED BY NAME, not `slice(0, 3)`. The set now leads with the two free plans, so
     a positional slice showed Free, Non-commercial and Pilot — three cards, but only one
     of the two SHAPES the component has. One free card and two paid ones show both, and
     the row keeps its three states. */
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

/* ---------- feed entries, from the real renderer ---------- */
(function(){
  var sample = Store.get('datasets').B.activity.slice(0, 3);
  $('#sgFeed').innerHTML = sample.map(function(a, i){ return feedItem(a, 'sg' + i); }).join('');
  wireFeedAudit('#sgFeed');
})();

/* ---------- the two live demos on this page ---------- */
// the loading button keeps spinning; the split button shows its menu behaviour
$('#sgSplit').addEventListener('click', function(e){ e.preventDefault(); openStub('Split button'); });
// tables and menus on this page use the same delegated handlers as the product,
// so the row kebab opens for real — nothing extra to wire

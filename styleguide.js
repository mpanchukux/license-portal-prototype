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

/* ---------- type scale ---------- */
var LEVELS = [
  ['display', 'Numbers that carry a page'],
  ['h1',      'Page titles'],
  ['h2',      'Section and card titles'],
  ['body',    'Reading text'],
  ['small',   'Meta, help, table text'],
  ['label',   'Uppercase labels']
];
$('#sgType').innerHTML = LEVELS.map(function(l){
  var k = l[0];
  var style = 'font-size:var(--t-' + k + '-fs);line-height:var(--t-' + k + '-lh);'
            + 'letter-spacing:var(--t-' + k + '-ls);font-weight:var(--t-' + k + '-fw);'
            + (k === 'label' ? 'text-transform:uppercase;' : '');
  return '<tr><td>' + k + '</td>'
    + '<td class="sg-cls">--t-' + k + '-*</td>'
    + '<td class="sg-cls">' + CSSVAR('--t-' + k + '-fs') + ' / ' + CSSVAR('--t-' + k + '-lh')
      + ' / ' + CSSVAR('--t-' + k + '-ls') + ' / ' + CSSVAR('--t-' + k + '-fw') + '</td>'
    + '<td><span style="' + style + '">' + l[1] + '</span></td></tr>';
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

/* ---------- the licence table, from the product's own builders ---------- */
(function(){
  var sample = Store.get('datasets').B.licenses.slice(0, 2);
  $('#sgTableHead').innerHTML = headHtml().replace('<th>Created</th>',
    '<th class="sortable" aria-sort="descending" tabindex="0">Created</th>');
  $('#sgTableBody').innerHTML = sample.map(rowHtml).join('');
})();

/* ---------- plan cards, including the Current plan strip ---------- */
(function(){
  var set = EC_PLANS['thingsboard|payg'];
  var cards = set.cards.slice(0, 3);
  var html = cards.map(function(c, i){
    var card = planCard(c);
    // the second card wears the strip the change-plan wizard puts on the current plan
    return i === 1 ? card.replace('<div class="pc-head">', '<div class="pc-strip">Current plan</div><div class="pc-head">') : card;
  }).join('');
  var grid = $('#sgPlans');
  grid.className = 'plangrid withcur';
  grid.innerHTML = html;
})();

/* ---------- product cards ---------- */
$('#sgProducts').innerHTML = PRODUCT_CARDS.map(function(c, i){
  return productCardHTML(c, i === 0);      // the first one shows the selected ring
}).join('');

/* ---------- wizard stepper inside the modal specimen ---------- */
$('#sgWizStep').innerHTML = '<div class="nl-progress">'
  + '<div class="nl-ptrack"><span class="nl-pfill" style="width:25%"></span></div>'
  + '<div class="nl-plabel">Step 1 of 4 · <b>Product</b></div></div>';

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

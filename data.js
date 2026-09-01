/* ============================================================================
   data.js — every mock dataset the prototype renders from. Pure data, no DOM:
   loaded first on every page, read through DATA() (see shared.js) so the chosen
   dashboard variant decides which account is on screen.
   Today, everywhere in this data, is Aug 19 2026.
   ============================================================================ */

/* ---------- boolean entitlements shown as chips on licence details ---------- */
var FEATURES = [
  { key:'whitelabel', label:'White labeling' },
  { key:'edge',       label:'Edge Computing' },
  { key:'trendz',     label:'Trendz Analytics' },
  /* Bought in the wizard's add-ons block, perpetual only. ⚠️ Not the old "Offline"
     licence TYPE that the content audit removed — that was a billing kind; this is a
     capability the licence can carry. */
  { key:'offline',    label:'Offline Mode' }
];

/* ---------- the account's payment method ----------
   One card, one place. Every surface that shows the card itself renders from
   this (see paymentMethodHTML): Payment method on Billing & payment, the Next
   charge card on licence details, the styleguide specimen. Prose mentions of
   "Visa ••4242" (activity feed, invoice mock, wizard) are sentences, not this. */
var PAYMENT_METHOD = { brand:'VISA', num:'•••• •••• •••• 4242', exp:'Expires 12 / 2028' };

/* ---------- per-tier specs: what a licence of each tier includes ---------- */
var TIER_SPECS = {
  maker:    { name:'Maker',     price:'$10.00',  wl:false, ent:[['Devices','10'],['Assets','10'],['Production instances','1'],['AI credits','1M','/ month']] },
  prototype:{ name:'Prototype', price:'$39.00',  wl:false, ent:[['Devices','50'],['Assets','50'],['Production instances','1'],['AI credits','2M','/ month']] },
  pilot:    { name:'Pilot',     price:'$99.00',  wl:true,  ent:[['Devices','100'],['Assets','100'],['Production instances','1'],['AI credits','4M','/ month']] },
  startup:  { name:'Startup',   price:'$299.00', wl:true,  ent:[['Devices','500'],['Assets','500'],['Production instances','2'],['AI credits','8M','/ month']] },
  business: { name:'Business',  price:'$499.00', wl:true,  ent:[['Devices','1,000'],['Assets','1,000'],['Production instances','3'],['AI credits','16M','/ month']] },
  tbmqsub:  { name:'PE subscription', price:'$15.00', wl:false, ent:[['Sessions','100'],['Messages / sec','100'],['Production instances','1']] },
  tbperp:   { name:'PE Perpetual License', price:'one-time', perp:true, wl:true, ent:[['Devices','5,000'],['Assets','5,000'],['Production instances','1'],['AI credits','5M','/ month']] },
  tbmqperp: { name:'PE license', price:'one-time', perp:true, wl:true, ent:[['Sessions','10,000'],['Messages / sec','1,000'],['Production instances','1']] },
  // Community Grant — free, no expiry, nothing recurring. perp:true puts it on the
  // perpetual-style details layout (no renewal, no next charge, no add-ons).
  grant:    { name:'Community Grant', price:'Free', perp:true, grant:true, wl:false, ent:[['Devices','6,050'],['Production instances','2']] }
};
var NAMED_TIER = { maker:'maker', prototype:'prototype', pilot:'pilot', startup:'startup', business:'business', perp:'tbperp', prototypeaddons:'prototype' };
var ENT_EXTRA_KEY = { 'Devices':'devices', 'Production instances':'prod', 'AI credits':'ai' };

/* ---------- dashboard density datasets: one consistent account per variant ---------- */
var DATASETS = {
  A: {
    licenses: [
      // a real-world label: it wraps to two lines in the Product column, next to the
      // short one below it — the case the Home block has to survive
      { id:'A1', tier:'prototype', product:'ThingsBoard', type:'Subscription', name:'Prototype',      label:'Central Europe manufacturing cluster — building 4, line 2', created:'Aug 10 2026', updated:'Aug 14 2026', status:'active', event:'Aug 28 2026', price:'$39.00 / mo', billing:'auto-pay' },
      { id:'A2', tier:'tbmqsub',   product:'TBMQ',        type:'Subscription', name:'PE subscription', label:'Broker',     created:'Jul 22 2026', updated:'Aug 03 2026', status:'active', event:'Sep 05 2026', price:'$15.00 / mo', billing:'auto-pay' },
      // bought two days ago and not named yet — the third label case (none at all),
      // so this account shows the same range the large one does
      { id:'A3', tier:'maker',     product:'ThingsBoard', type:'Subscription', name:'Maker',           label:'',           created:'Aug 17 2026', updated:'Aug 17 2026', status:'active', event:'Sep 17 2026', price:'$10.00 / mo', billing:'auto-pay' }
    ],
    users: [
      { name:'Mariia Panchuk', email:'mpanchuk@thingsboard.io', created:'Jul 17 2026' },
      { name:'A. Admin',       email:'a.admin@thingsboard.io',  created:'Jul 20 2026' }
    ],
    invoices: [
      // the purchase of A3 — a manual one, so no auto-charge icon
      { num:'NAWE49WG-0004', licId:'A3', date:'Aug 17 2026', amount:'$10.00', status:'Paid', payment:'Card',     auto:false },
      { num:'NAWE49WG-0003', licId:'A1', date:'Aug 03 2026', amount:'$39.00', status:'Paid', payment:'Auto-pay', auto:true  },
      { num:'NAWE49WG-0002', licId:'A2', date:'Jul 30 2026', amount:'$15.00', status:'Paid', payment:'Auto-pay', auto:true  },
      // the first charge of A2, on the day it was bought — also manual
      { num:'NAWE49WG-0001', licId:'A2', date:'Jul 22 2026', amount:'$15.00', status:'Paid', payment:'Card',     auto:false }
    ],
    activity: [
      { kind:'created', ts:'Aug 17 2026, 16:20', entityType:'Subscription', entityName:'Maker', actor:'mpanchuk@thingsboard.io', action:'ADDED',
        txt:'Subscription <b>Maker</b> was created by mpanchuk@thingsboard.io.' },
      { kind:'created', ts:'Aug 10 2026, 09:14', entityType:'Subscription', entityName:'Prototype', actor:'mpanchuk@thingsboard.io', action:'ADDED',
        txt:'Subscription <b>Prototype</b> was created by mpanchuk@thingsboard.io.' },
      { kind:'updated', ts:'Jul 28 2026, 15:02', entityType:'Payment method', entityName:'Visa ••4242', actor:'mpanchuk@thingsboard.io', action:'UPDATED',
        txt:'Payment method was added by mpanchuk@thingsboard.io.' },
      { kind:'info', ts:'Jul 22 2026, 11:41', entityType:'Invoice', entityName:'NAWE49WG-0001', actor:'mpanchuk@thingsboard.io', action:'PAID',
        txt:'Invoice <b>NAWE49WG-0001</b> was paid by mpanchuk@thingsboard.io.' },
      { kind:'created', ts:'Jul 22 2026, 11:40', entityType:'Subscription', entityName:'TBMQ PE', actor:'mpanchuk@thingsboard.io', action:'ADDED',
        txt:'Subscription <b>TBMQ PE</b> was created by mpanchuk@thingsboard.io.' }
    ]
  },
  B: {
    licenses: [
      { id:'B1',  tier:'business', product:'ThingsBoard', type:'Subscription', name:'Business',  label:'Global',       created:'May 02 2026', updated:'Aug 12 2026', status:'active',         event:'Sep 13 2026', price:'$499.00 / mo', billing:'auto-pay' },
      { id:'B2',  tier:'startup',  product:'ThingsBoard', type:'Subscription', name:'Startup',   label:'Production',   created:'Jun 06 2026', updated:'Aug 02 2026', status:'active',         event:'Sep 20 2026', price:'$299.00 / mo', billing:'auto-pay' },
      { id:'B3',  tier:'startup',  product:'ThingsBoard', type:'Subscription', name:'Startup',   label:'Factory A',    created:'Jun 20 2026', updated:'Aug 18 2026', status:'payment_failed', event:'Sep 02 2026', price:'$299.00 / mo', billing:'auto-pay' },
      { id:'B4',  tier:'pilot',    product:'ThingsBoard', type:'Subscription', name:'Pilot',     label:'EU pilot',     created:'Jul 01 2026', updated:'Aug 15 2026', status:'active',         event:'Sep 06 2026', price:'$99.00 / mo',  billing:'auto-pay' },
      { id:'B5',  tier:'prototype',product:'ThingsBoard', type:'Subscription', name:'Prototype', label:'Sandbox',      created:'Jul 10 2026', updated:'Jul 28 2026', status:'canceled',       event:'Sep 05 2026', price:'$39.00 / mo',  billing:'auto-pay' },
      { id:'B6',  tier:'maker',    product:'ThingsBoard', type:'Subscription', name:'Maker',     label:'',             created:'Jul 15 2026', updated:'Jul 15 2026', status:'active',         event:'Aug 30 2026', price:'$10.00 / mo',  billing:'auto-pay' },
      { id:'B7',  tier:'prototype',product:'ThingsBoard', type:'Subscription', name:'Prototype', label:'Demo',         created:'Jul 20 2026', updated:'Jul 30 2026', status:'active',         event:'Sep 03 2026', price:'$39.00 / mo',  billing:'auto-pay' },
      { id:'B8',  tier:'tbmqsub',  product:'TBMQ',        type:'Subscription', name:'PE subscription', label:'MQTT prod',    created:'Jun 30 2026', updated:'Jul 12 2026', status:'active',   event:'Sep 10 2026', price:'$15.00 / mo', billing:'auto-pay' },
      { id:'B9',  tier:'tbmqsub',  product:'TBMQ',        type:'Subscription', name:'PE subscription', label:'MQTT staging', created:'Jul 05 2026', updated:'Jul 05 2026', status:'active',   event:'Sep 10 2026', price:'$15.00 / mo', billing:'auto-pay' },
      { id:'B10', tier:'tbperp',   product:'ThingsBoard', type:'Perpetual',    name:'PE Perpetual License', label:'On-prem HQ',    created:'Jul 27 2026', updated:'Jul 27 2026', status:'active',           event:'Jul 27 2027', price:'one-time', billing:'paid' },
      { id:'B11', tier:'tbperp',   product:'ThingsBoard', type:'Perpetual',    name:'PE Perpetual License', label:'Plant B',       created:'Sep 01 2025', updated:'Aug 05 2026', status:'updates_expiring', event:'Sep 01 2026', price:'one-time', billing:'paid' },
      { id:'B12', tier:'tbmqperp', product:'TBMQ',        type:'Perpetual',    name:'PE license',           label:'Broker on-prem',created:'Aug 13 2026', updated:'Aug 13 2026', status:'active',           event:'Aug 13 2027', price:'one-time', billing:'paid' },
      // two deliberately long labels: real deployments name themselves like this,
      // and the Product column has to wrap them rather than stretch the table
      { id:'B13', tier:'business', product:'ThingsBoard', type:'Subscription', name:'Business',  label:'Production — Central Europe manufacturing cluster, building 4', created:'Feb 18 2026', updated:'Aug 04 2026', status:'active', event:'Aug 27 2026', price:'$499.00 / mo', billing:'auto-pay' },
      { id:'B14', tier:'pilot',    product:'ThingsBoard', type:'Subscription', name:'Pilot',     label:'Long-term evaluation environment for the Munich pilot',          created:'May 24 2026', updated:'Jun 02 2026', status:'active', event:'Sep 24 2026', price:'$99.00 / mo',  billing:'auto-pay' }
    ],
    users: [
      { name:'Mariia Panchuk', email:'mpanchuk@thingsboard.io',  created:'Jul 17 2026' },
      { name:'A. Admin',       email:'a.admin@thingsboard.io',   created:'Jul 20 2026' },
      { name:'Dev User',       email:'dev@thingsboard.io',       created:'Aug 02 2026' },
      { name:'Olena Kravets',  email:'o.kravets@thingsboard.io', created:'Aug 05 2026' },
      { name:'Ivan Petrenko',  email:'i.petrenko@thingsboard.io',created:'Aug 09 2026' },
      { name:'Sara Lee',       email:'s.lee@thingsboard.io',     created:'Aug 12 2026' },
      { name:'Tom Fischer',    email:'t.fischer@thingsboard.io', created:'Aug 15 2026' },
      { name:'Nina Rossi',     email:'n.rossi@thingsboard.io',   created:'Aug 18 2026' }
    ],
    invoices: [
      { num:'NAWE49WG-0021', licId:'B13', date:'Aug 18 2026', amount:'$499.00',   status:'Paid', payment:'Auto-pay', auto:true  },
      // Add capacity on the perpetual: a one-time purchase the viewer made, so no
      // auto-charge icon — and it sits in Home's three-row preview next to the
      // renewals, which is where the difference has to be visible
      { num:'NAWE49WG-0022', licId:'B11', date:'Aug 16 2026', amount:'$1,999.00', status:'Paid', payment:'Card',     auto:false },
      { num:'NAWE49WG-0020', licId:'B6',  date:'Aug 15 2026', amount:'$10.00',    status:'Paid', payment:'Auto-pay', auto:true  },
      { num:'NAWE49WG-0019', licId:'B8',  date:'Aug 12 2026', amount:'$15.00',    status:'Paid', payment:'Auto-pay', auto:true  },
      { num:'NAWE49WG-0018', licId:'B1',  date:'Aug 08 2026', amount:'$499.00',   status:'Paid', payment:'Auto-pay', auto:true  },
      { num:'NAWE49WG-0017', licId:'B7',  date:'Aug 05 2026', amount:'$39.00',    status:'Paid', payment:'Auto-pay', auto:true  },
      { num:'NAWE49WG-0016', licId:'B2',  date:'Aug 02 2026', amount:'$299.00',   status:'Paid', payment:'Auto-pay', auto:true  },
      { num:'NAWE49WG-0015', licId:'B3',  date:'Jul 28 2026', amount:'$299.00',   status:'Paid', payment:'Auto-pay', auto:true  }
    ],
    activity: [
      { kind:'created', ts:'Aug 18 2026, 10:26', entityType:'User', entityName:'Nina Rossi', actor:'mpanchuk@thingsboard.io', action:'ADDED',
        txt:'User <b>Nina Rossi</b> was invited by mpanchuk@thingsboard.io.' },
      { kind:'status',  ts:'Aug 18 2026, 07:12', entityType:'Subscription', entityName:'Startup', actor:'System', action:'PAYMENT_FAILED',
        txt:'Payment failed for <b>Startup</b> (Production) — card Visa ••4242 was declined.', delta:'Auto-pay charge of $299.00 failed' },
      { kind:'status',  ts:'Aug 15 2026, 14:03', entityType:'Subscription', entityName:'Pilot', actor:'i.petrenko@thingsboard.io', action:'UPDATED',
        txt:'Plan was changed from <b>Prototype</b> to <b>Pilot</b> on <b>Factory A</b> by i.petrenko@thingsboard.io.', delta:'Plan changed from Prototype to Pilot' },
      { kind:'updated', ts:'Aug 12 2026, 09:31', entityType:'Subscription', entityName:'Business', actor:'o.kravets@thingsboard.io', action:'UPDATED',
        txt:'Add-on <b>Edge Computing</b> was enabled on <b>Business</b> (Global) by o.kravets@thingsboard.io.' },
      { kind:'info',    ts:'Aug 08 2026, 00:05', entityType:'Invoice', entityName:'NAWE49WG-0018', actor:'Auto-pay', action:'PAID',
        txt:'Invoice <b>NAWE49WG-0018</b> was paid, charged automatically.' },
      { kind:'status',  ts:'Aug 05 2026, 08:00', entityType:'License', entityName:'ThingsBoard PE Perpetual License', actor:'System', action:'UPDATES_EXPIRING',
        txt:'Software updates for the <b>On-prem</b> perpetual license expire on <b>Aug 28, 2026</b>.', delta:'Updates term ends Aug 28 2026' },
      // a large account keeps producing events — enough of them that the Home feed
      // has a second and third batch to load
      { kind:'updated', ts:'Aug 04 2026, 16:48', entityType:'License', entityName:'Business', actor:'o.kravets@thingsboard.io', action:'UPDATED',
        txt:'Label <b>Production — Central Europe manufacturing cluster, building 4</b> was set on <b>Business</b> by o.kravets@thingsboard.io.', delta:'label = Production — Central Europe manufacturing cluster, building 4' },
      { kind:'created', ts:'Aug 02 2026, 11:05', entityType:'User', entityName:'Dev User', actor:'mpanchuk@thingsboard.io', action:'ADDED',
        txt:'User <b>Dev User</b> was invited by mpanchuk@thingsboard.io.' },
      { kind:'info',    ts:'Aug 02 2026, 00:05', entityType:'Invoice', entityName:'NAWE49WG-0016', actor:'Auto-pay', action:'PAID',
        txt:'Invoice <b>NAWE49WG-0016</b> was paid, charged automatically.' },
      { kind:'updated', ts:'Jul 30 2026, 13:22', entityType:'Subscription', entityName:'Prototype', actor:'i.petrenko@thingsboard.io', action:'UPDATED',
        txt:'Add-on <b>Trendz Analytics</b> was enabled on <b>Prototype</b> (Demo) by i.petrenko@thingsboard.io.' },
      { kind:'status',  ts:'Jul 28 2026, 09:10', entityType:'Subscription', entityName:'Prototype', actor:'mpanchuk@thingsboard.io', action:'CANCELED',
        txt:'Subscription <b>Prototype</b> (Sandbox) was canceled by mpanchuk@thingsboard.io — active until <b>Sep 05, 2026</b>.', delta:'Canceled; active until Sep 05 2026' },
      { kind:'created', ts:'Jul 24 2026, 15:40', entityType:'Subscription', entityName:'Pilot', actor:'mpanchuk@thingsboard.io', action:'ADDED',
        txt:'Subscription <b>Pilot</b> was created by mpanchuk@thingsboard.io.' },
      { kind:'updated', ts:'Jul 20 2026, 08:57', entityType:'Payment method', entityName:'Visa ••4242', actor:'mpanchuk@thingsboard.io', action:'UPDATED',
        txt:'Payment method was updated by mpanchuk@thingsboard.io.' },
      { kind:'created', ts:'Jul 15 2026, 10:12', entityType:'Subscription', entityName:'Maker', actor:'i.petrenko@thingsboard.io', action:'ADDED',
        txt:'Subscription <b>Maker</b> was created by i.petrenko@thingsboard.io.' },
      { kind:'info',    ts:'Jul 12 2026, 00:05', entityType:'Invoice', entityName:'NAWE49WG-0012', actor:'Auto-pay', action:'PAID',
        txt:'Invoice <b>NAWE49WG-0012</b> was paid, charged automatically.' }
    ]
  },
  /* G — Community Grant approved. One licence, and it is an ordinary row: the
     grant carries no price, no renewal and no expiry, and its status is the
     first-check-in wait (the key has been issued, nothing has used it yet). */
  G: {
    noInvoicesNote: 'No invoices &mdash; the Community Grant is free.',
    licenses: [
      { id:'G1', tier:'grant', product:'ThingsBoard', type:'Grant', name:'Community Grant', label:'', created:'Aug 19 2026', updated:'Aug 19 2026',
        status:'awaiting_checkin', event:'', price:'Free', billing:'—', grant:true, limits:'6,050 devices &middot; 2 production servers' }
    ],
    users: [
      { name:'Mariia Panchuk', email:'mpanchuk@thingsboard.io', created:'Aug 12 2026' }
    ],
    invoices: [],
    activity: [
      { kind:'created', ts:'Aug 19 2026, 09:02', entityType:'License', entityName:'Community Grant', actor:'System', action:'GRANT_ISSUED',
        txt:'<b>Community Grant</b> was issued to mpanchuk@thingsboard.io — license key created.', delta:'Community Grant issued' }
    ]
  }
};

/* ---------- plan cards for the new-user screen and the wizard ---------- */
var EC_PLANS = {
  'thingsboard|payg': {
    cards: [
      { name:'Maker',     price:'$10',  per:'/ month', feats:['10 devices', '10 assets', '1 production instance', '1M AI credits / month', 'Community support'],
        foot:'Includes Trendz Analytics & Edge Computing for testing.' },
      { name:'Prototype', price:'$39',  per:'/ month', feats:['50 devices', '50 assets', '1 production instance', '2M AI credits / month', 'Community support'] },
      { name:'Pilot',     price:'$99',  per:'/ month', badge:'Popular', feats:['100 devices', '100 assets', '1 production instance', '4M AI credits / month', 'Help desk', 'White labeling'] },
      { name:'Startup',   price:'$299', per:'/ month', feats:['500 devices', '500 assets', '2 production instances', '8M AI credits / month', 'Priority help desk', 'White labeling'] },
      { name:'Business',  price:'$499', per:'/ month', feats:['1,000 devices', '1,000 assets', '3 production instances', '16M AI credits / month', 'Priority help desk', 'White labeling', '+$0.10 per extra device'] }
    ]
  },
  'thingsboard|perpetual': {
    single: true,
    cards: [ { name:'ThingsBoard PE Perpetual License', price:'$4,999', per:'· one-time', term:'Including 1 year of software updates',
               feats:['5,000 devices', '5,000 assets', '1 production instance', '5M AI credits / month', 'White labeling', 'All ThingsBoard PE features'] } ]
  },
  'tbmq|payg': {
    single: true,
    cards: [ { name:'TBMQ PE subscription', price:'$15', per:'/ month',
               feats:['100 sessions', '100 msg/sec', '1 production instance', 'All TBMQ PE features except White labeling', 'Community support'] } ]
  },
  'tbmq|perpetual': {
    single: true,
    cards: [ { name:'TBMQ PE license', price:'$2,999', per:'· one-time', term:'Including 1 year of software updates',
               feats:['10,000 sessions', '1,000 msg/sec', '1 production instance', 'White labeling', 'All TBMQ PE features'] } ]
  }
};
var EC_SINGLE_NOTE = 'You can fine-tune capacity before checkout.';
// intro sentence of the PE card — same wording on every plan surface
var PLANS_INCLUDE_NOTE = 'All plans include unlimited customers, dashboards, integrations, API calls, data points & messages.';

// full PE feature set — rendered once per surface as a self-contained card
// (wizard step 2, perpetual step 1, new-user screen), never per plan card.
// White-labeling is NOT edition-wide (Pilot+ only) — it lives on the plan cards
var PE_FEATURES = [
  ['Advanced RBAC for IoT', 'Fine-grained roles and permissions across customers, users, and assets.'],
  ['Entity groups', 'Organize devices, assets, and customers into managed groups with group-level permissions.'],
  ['Scheduler', 'Schedule device commands, firmware updates, and reports.'],
  ['Reporting', 'Generate and email dashboard-based PDF reports on a schedule.'],
  ['Export widget data to CSV/XLS', 'Download any widget\u2019s data for offline analysis.'],
  ['Data converters', 'Transform uplink and downlink payloads between devices and the platform.'],
  ['Platform integrations', 'Connect external systems via MQTT, HTTP, CoAP, LoRaWAN, Sigfox, and more.']
];

/* ---------- the two products the wizard offers ---------- */
var PRODUCT_CARDS = [
  { key:'thingsboard', name:'ThingsBoard',
    vline:'Build your IoT solution. On your terms.',
    sline:'The agile subscription for instant enterprise IoT — deploy anywhere, scale as you grow, pay only for what you need.',
    unlimited:'Customers · Users · Dashboards · Messages · API calls · Integrations' },
  { key:'tbmq', name:'TBMQ',
    vline:'Scale your messaging. On demand.',
    sline:'High-performance MQTT broker with a flexible, consumption-based licensing model.' }
];

/* ---------- shared glyphs + copy ---------- */
var FCHECK = '<svg class="icon fmark" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>';
var KEBAB = '<svg class="icon" viewBox="0 0 24 24" style="fill:currentColor;stroke:none"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>';
var COPYSVG = '<svg class="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>';
var STUB = 'Placeholder — not part of this wireframe spec yet.';
// Feed items carry no event icon (see feedItem), so there is no icon set here.
// `kind` stays on each event: it is what the event is, and the next thing that
// groups or filters activity will want it.
// newest first; standard sentence order: what was done -> from -> to (if any) -> by whom.
// `delta` is the plain-text change, kept for the raw audit payload only.
// Activity now lives per-variant in DATASETS (density datasets block above).
var AUDITSVG = '<svg class="icon" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h5"/></svg>';

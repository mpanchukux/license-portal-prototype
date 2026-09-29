/* ============================================================================
   page-license.js — PAGE MODE host for the licence details (variant A).

   The surface itself lives in license-details.js; this file only reads the URL
   and mounts it:
     license.html?id=B3          a licence from the current dataset
     license.html?tier=maker     a synthesised plan page (settings panel only)
     &from=home                  which section to highlight and where back goes
   ============================================================================ */

var params = new URLSearchParams(location.search);
var pageLic = params.get('id') ? licById(params.get('id')) : null;
if(!pageLic) pageLic = licFromNamed(params.get('tier') || 'prototype');

/* The details page belongs to the section it was opened from — that one origin
   decides both the highlighted nav item and where back goes. Invoices is a real
   origin now: an invoice's Product cell links here. */
var ORIGINS = {
  home:      { nav:'home',      href:'index.html',     label:'Back to Home' },
  invoices:  { nav:'invoices',  href:'invoices.html',  label:'Back to Invoices' },
  /* the Instances page's License column links here too, and without an entry it fell
     to the default and offered "Back to Licenses" — a way back to a page the reader
     had not come from */
  instances: { nav:'instances', href:'instances.html', label:'Back to Instances' }
};
var origin = ORIGINS[params.get('from')] || { nav:'licenses', href:'licenses.html', label:'Back to Licenses' };

/* ⚠️⚠️ THE SHARED-LINK MODE (2026-09-29, by request) — the licence as a destination of
   its own rather than a detour off a list. Two things change, and they are the same
   decision twice:
     · NO BACK. The reader of a pasted URL has no list behind them; offering "Back to
       Licenses" would send them somewhere they never were, which is the fault the
       `?attention=1` note records on the Licenses page in another form.
     · NAV IS ALWAYS `licenses`, whatever `?from` says. `from` describes the journey,
       and in this mode there was no journey — the licence belongs to the Licenses
       section, so that is the tab that lights.
   ⚠️ `?from` is deliberately still READ and still ignored here rather than stripped:
   the same URL has to keep working when the setting is switched back, and a link that
   loses information depending on a viewer's preference is not a shareable link. */
var shared = licDetailsMode() === 'shared';

document.body.setAttribute('data-nav', shared ? 'licenses' : origin.nav);
syncTopNav();

LicenseDetails.mountPage('#licDetailsHost', pageLic,
  shared ? {} : { back: { href: origin.href, label: origin.label } });

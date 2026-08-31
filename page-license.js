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
  home:     { nav:'home',     href:'index.html',    label:'Back to Home' },
  invoices: { nav:'invoices', href:'invoices.html', label:'Back to Invoices' }
};
var origin = ORIGINS[params.get('from')] || { nav:'licenses', href:'licenses.html', label:'Back to Licenses' };

document.body.setAttribute('data-nav', origin.nav);
syncTopNav();

LicenseDetails.mountPage('#licDetailsHost', pageLic, {
  back: { href: origin.href, label: origin.label }
});

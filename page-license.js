/* ============================================================================
   page-license.js — PAGE MODE host for the licence details (variant A).

   The surface itself lives in license-details.js; this file only reads the URL
   and mounts it:
     license.html?id=B3          a licence from the current dataset
     license.html?tier=maker     a synthesised plan page (settings panel only)
     &from=home                  which section to highlight and where back goes
   ============================================================================ */

var params = new URLSearchParams(location.search);
var fromHome = params.get('from') === 'home';
var pageLic = params.get('id') ? licById(params.get('id')) : null;
if(!pageLic) pageLic = licFromNamed(params.get('tier') || 'prototype');

// the details page belongs to the section it was opened from
document.body.setAttribute('data-nav', fromHome ? 'home' : 'licenses');
syncTopNav();

LicenseDetails.mountPage('#licDetailsHost', pageLic, {
  back: fromHome ? { href:'index.html', label:'Back to Home' }
                 : { href:'licenses.html', label:'Back to Licenses' }
});

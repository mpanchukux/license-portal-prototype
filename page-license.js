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
/* ⚠️ `href` AND `label` ARE GONE FROM THESE ENTRIES (2026-09-29). They fed the Back
   button, and there is no Back button on either presentation any more (see below). What
   `?from` still decides is the nav highlight, so that is all this map still holds — a
   map whose two of three fields nothing reads is a map the next reader will wire
   something to. The Instances entry, which was added because falling through to the
   default offered a way back to a page the reader had not come from, stays for the same
   reason in its new form: it lights the tab they actually came from. */
var ORIGINS = {
  home:      { nav:'home' },
  invoices:  { nav:'invoices' },
  instances: { nav:'instances' }
};
var origin = ORIGINS[params.get('from')] || { nav:'licenses' };

/* ⚠️⚠️ NEITHER PRESENTATION CARRIES A BACK BUTTON ANY MORE (2026-09-29, by request:
   "Full page must not have a back button in it"). `Full page` had one; `Shared link` was
   defined as the same page WITHOUT it. So the button is gone from both, and this file no
   longer passes `opts.back` at all — `mountPage` already treats a missing `back` as "no
   button", which is why nothing there had to change.
   ⚠️⚠️ AND THAT LEAVES THE TWO PRESENTATIONS ALMOST IDENTICAL — reported, not papered
   over. What still separates them is one thing: which nav tab lights. `Full page` lights
   the section named by `?from` (you came from Invoices, Invoices stays lit); `Shared link`
   always lights `Licenses`, because a pasted URL had no journey to describe. If that is
   not worth a third option, the two collapse into one and `licDetailsMode()` goes back to
   two values.
   ⚠️ `ORIGINS` IS STILL READ, and still earns its place: it decided two things and now
   decides one. `?from` is not stripped from the URL either — the same link has to keep
   working when the setting moves, and a link that loses information depending on a
   viewer's preference is not a shareable link. */
var shared = licDetailsMode() === 'shared';

document.body.setAttribute('data-nav', shared ? 'licenses' : origin.nav);
syncTopNav();

LicenseDetails.mountPage('#licDetailsHost', pageLic, {});

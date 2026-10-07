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

/* ⚠️⚠️ `Full page` AND `Shared link` WERE THE SAME PAGE TYPE, AND ARE NOW ONE
   (2026-10-07, by request). The note that stood here predicted it: once the Back button
   left both presentations on 2026-09-29, the only thing separating them was which nav
   tab lit — `?from`'s section for `Full page`, always `Licenses` for `Shared link`. That
   is not a second page type, it is a highlight.

   **What this page IS, now that it is one thing: the page a shared link opens into.**
   Nobody is behind you, so `Licenses` lights, and there is no Back.

   ⚠️⚠️ `ORIGINS` AND `origin` ARE DELETED WITH IT, NOT LEFT STANDING. They existed only
   to answer the highlight for the presentation that is gone; the surviving one answers it
   with a constant. A map kept past its last reader is how `.licb-*` became nine dead
   selectors — the merge has to take its own leavings with it.
   ⚠️ `?from` IS STILL WRITTEN by `licenseHref` and is now READ BY NOTHING. Left in the
   URL deliberately: the same link has to keep working whoever opens it, and stripping a
   parameter because this viewer's build stopped reading it is how a shareable link stops
   being shareable. Recorded as debt rather than hidden. */
document.body.setAttribute('data-nav', 'licenses');
syncTopNav();

LicenseDetails.mountPage('#licDetailsHost', pageLic, {});

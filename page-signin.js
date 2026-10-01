/* ============================================================================
   page-signin.js — the auth surface arrived at directly, rather than over the landing
   ============================================================================
   Four lines, and that is the point: the surface is `auth.js`, which this page only
   opens in its page form. If this file ever grows a second responsibility, the two
   arrivals have started to diverge and the thing to do is move it back into `Auth`.

   ⚠️ WHICH SCREEN IS A URL QUESTION, because a link is what gets you here. `?mode=signup`
   opens the sign-up; anything else opens sign-in, which is what a bare `signin.html`
   should be. The footer link inside the card still swaps between them without a reload,
   exactly as it does in the modal — the parameter decides where you ENTER, not where you
   are stuck.
   ============================================================================ */
(function(){
  if(!window.Auth) return;
  var want = new URLSearchParams(location.search).get('mode');
  Auth.mountPage(want === 'signup' ? 'signup' : 'login');
})();

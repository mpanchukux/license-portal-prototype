/* ============================================================================
   auth.js — the signed-out surface: sign up and sign in, in ONE container
   ============================================================================
   Two screens, one box. They are not two modals: the footer of each is a link to
   the other, and switching re-renders the body in place rather than closing one
   surface and opening a second — a swap the visitor would see as a flicker and
   read as having been thrown out.

   Presentation follows the wizard's: `.fs-screen` + `.fs-box`, which is already a
   centred modal above 600px and a full-screen sheet below it (see the ≤600px
   block). That is exactly "modal on desktop, full-screen page on mobile", and it
   costs no second breakpoint of our own. `.authbox` only narrows it and lets its
   height come from the content — an auth card is not a 90vh workspace.

   ⚠️ Nothing here validates anything. There is no account to check against, so a
   password field that refused you would be inventing a rule the prototype cannot
   keep; both the social buttons and the primary sign you in. Consistent with the
   search inputs and the sortable headers — see NOTES, open debt.

   Loaded on the landing page only: it is the one page a signed-out visitor can
   reach that has a way in. The public documents (Terms, Privacy, License
   agreement) carry the header's Sign in / Sign up, which link there.
   ============================================================================ */

var Auth = (function(){

  /* Monochrome glyphs, drawn not fetched: the prototype makes no external requests,
     and brand colour is not available to it anyway. The shapes still have to be
     recognisable at 18px, so Google is its G and GitHub is its mark. */
  var SOCIALS = [
    { k:'google', t:'Google', g:'<path d="M19.25 8.62A8 8 0 1 0 20 12h-6.5"/>' },
    { k:'github', t:'GitHub', g:'<path d="M9 19c-4 1.2-4-2.2-6-2.7m12 5.4v-3.4c0-1 .1-1.4-.5-2 '
        + '2.3-.3 4.5-1.2 4.5-5a3.9 3.9 0 0 0-1-2.7 3.6 3.6 0 0 0-.1-2.7s-.9-.3-2.9 1.1a9.9 9.9 0 0 0-5 0'
        + 'C8 5.6 7.1 5.9 7.1 5.9a3.6 3.6 0 0 0-.1 2.7A3.9 3.9 0 0 0 6 11.3c0 3.8 2.2 4.7 4.5 5'
        + '-.6.6-.6 1.2-.5 2V21"/>' }
  ];

  /* The two screens differ in their words, their fields and their footer — nothing
     else. Keeping that difference as DATA rather than as two render functions is
     what stops the pair drifting into two designs. */
  var SCREENS = {
    /* The invited person fills in their OWN details — which is the whole reason
       Add user stopped asking an admin to type someone else's name. Name is asked
       on every sign-up, invited or not: one screen, not two. */
    signup: {
      /* ⚠️ Not "personal". The buyer is purchasing for a company, on a company card,
         and will invite colleagues — "personal" sent the participant looking for a
         business sign-up that does not exist. */
      h:'Create your account',
      fields:[ { id:'authName',  label:'Full name', type:'text', req:true, ac:'name' },
               { id:'authEmail', label:'Email', type:'email', req:true, ac:'email' },
               { id:'authPass',  label:'Create a password', type:'password', req:true, ac:'new-password' } ],
      legal:true, cta:'Sign up', foot:'login', footTxt:'Already have an account?'
    },
    login: {
      h:'Sign in with',
      fields:[ { id:'authUser', label:'Username (email)', type:'email', ac:'username' },
               { id:'authPass', label:'Password', type:'password', ac:'current-password' } ],
      cta:'Sign in', foot:'signup', footTxt:'Do not have an account?', forgot:true
    }
  };

  var MARKUP = ''
  + '<div class="fs-screen authscreen" id="authModal" role="dialog" aria-modal="true"'
  +   ' aria-labelledby="authHeading" hidden>'
  +   '<div class="fs-box authbox">'
  /* The header band carries nothing but the way out. On the phone it is the sticky
     bar of a full-screen page, which is the only reason it exists at all — on the
     desktop the ✕ is all that is in it. */
  +     '<div class="fs-header">'
  +       '<span class="spacer"></span>'
  +       '<button class="fs-close" id="authClose" aria-label="Close">✕</button>'
  +     '</div>'
  +     '<div class="fs-body authbody" id="authBody"></div>'
  +   '</div>'
  + '</div>';

  document.body.insertAdjacentHTML('beforeend', MARKUP);
  var scr = $('#authModal'), body = $('#authBody');
  var mode = 'signup', lastFocus = null;
  /* the invitation this sign-up is redeeming, or null for an ordinary one */
  var invited = null;

  function socialHTML(){
    return '<div class="auth-social">'
      + SOCIALS.map(function(s){
          return '<button class="btn sec auth-soc" data-auth-social="' + s.k + '">'
            + '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + s.g + '</svg>'
            + '<span>' + s.t + '</span></button>';
        }).join('')
      + '</div>';
  }
  /* The password field gets the same reveal control the licence key has — one eye
     that swaps for a struck-through eye — so "did I type that right" is answerable
     without clearing the field. */
  /* An invitation binds an address, so on that sign-up the email is shown and not
     editable: changing it would mean redeeming someone else's invitation. It is
     `readonly`, not `disabled` — a disabled field is skipped by the keyboard and
     is not read out, and this one still has to be readable as "this is who you
     are signing up as". The lock glyph says why it cannot be typed in, the same
     way the wizard's fixed entitlements do. */
  function fieldHTML(f){
    var pw = f.type === 'password';
    var lock = f.id === 'authEmail' && invited && invited.email;
    return '<div class="field' + (pw ? ' authpw' : '') + (lock ? ' authlocked' : '') + '">'
      + '<label for="' + f.id + '">' + f.label + (f.req ? ' <span class="req">*</span>' : '') + '</label>'
      + '<input id="' + f.id + '" type="' + f.type + '" autocomplete="' + f.ac + '"'
      + (lock ? ' value="' + esc(invited.email) + '" readonly aria-readonly="true"' : '') + '>'
      + (lock ? '<svg class="icon authlock-ic" viewBox="0 0 24 24" aria-hidden="true">'
          + '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>' : '')
      + (pw ? '<button class="iconbtn ghost ib authpw-eye" data-auth-reveal aria-label="Show password">'
          + '<svg class="icon eye" viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>'
          + '<svg class="icon eyeoff" viewBox="0 0 24 24" hidden><path d="M10.6 6.1A9.6 9.6 0 0 1 12 6c6.5 0 10 6 10 6a16.9 16.9 0 0 1-2.4 3M6.5 6.6A16.8 16.8 0 0 0 2 12s3.5 6 10 6a9.5 9.5 0 0 0 3.9-.8"/><path d="M3 3l18 18"/></svg>'
          + '</button>' : '')
      + '</div>';
  }
  /* Consent names the button that gives it, and each document is a real link to the
     page the prototype already has. ⚠️ Those three pages are PUBLIC (see
     isPublicPage) — guarding them would bounce a visitor to the landing page the
     moment they tried to read what they were agreeing to. */
  function legalHTML(){
    return '<p class="auth-legal">By selecting Sign up, I agree to the '
      + '<a class="link" href="terms.html">Terms of Use</a>, '
      + '<a class="link" href="privacy.html">Privacy Policy</a> and acknowledge the '
      + '<a class="link" href="license-agreement.html">License agreement</a>.</p>';
  }
  /* Reads the choice the landing page stored. Silent when there is none — a flat
     sign-up from the header is not buying anything yet. */
  function pendingPurchaseLine(){
    var p = Store.get('pendingPurchase');
    if(!p || !p.plan) return '';
    var set = EC_PLANS[(p.product || 'thingsboard') + '|' + (p.kind === 'perpetual' ? 'perpetual' : 'payg')];
    var card = set && set.cards.filter(function(c){ return c.name === p.plan; })[0];
    if(!card) return '';
    var product = p.product === 'tbmq' ? 'TBMQ' : 'ThingsBoard';
    var price = card.price + (card.per === '/ month' ? '/mo' : ' ' + card.per);
    return '<p class="auth-ctx">Creating an account to buy <b>' + esc(product) + ' ' + esc(card.name)
      + '</b> — ' + esc(price) + '</p>';
  }
  function render(){
    var s = SCREENS[mode];
    body.innerHTML = ''
      + '<div class="auth-brand" aria-hidden="true">'
      +   '<div class="mark"><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/></svg></div>'
      +   '<div class="bt">ThingsBoard<span class="bsep">·</span>Licenses</div>'
      + '</div>'
      + '<h2 class="auth-h" id="authHeading">' + s.h + '</h2>'
      /* ⚠️ What you just chose, carried into the modal. Clicking Select on a plan used
         to open a dialog that said nothing about the plan, the product or the price,
         and the participant stopped to check whether they had clicked the wrong thing.
         Built from the pending purchase, so it says exactly what the card said. */
      + (mode === 'signup' ? pendingPurchaseLine() : '')
      + socialHTML()
      + '<div class="auth-or"><span>OR</span></div>'
      + s.fields.map(fieldHTML).join('')
      + (s.legal ? legalHTML() : '')
      + '<button class="btn auth-primary" id="authSubmit">' + s.cta + '</button>'
      /* The footer is the door to the other screen, and the two are not the same
         shape: sign-up asks a question whose answer is a link, log-in asks one whose
         answer is an action you have not taken yet — so it gets a real secondary
         button. Straight from the reference, and it is also the honest hierarchy:
         "I already have one" is a correction, "create one" is a second task. */
      + '<div class="auth-foot">'
      +   '<span class="auth-footq">' + s.footTxt + '</span>'
      +   (mode === 'login'
          ? '<button class="btn sec auth-alt" data-auth="signup">Create an account</button>'
          : '<button class="link auth-altlink" data-auth="login">Sign in</button>')
      + '</div>'
      + (s.forgot ? '<div class="auth-forgot"><button class="link" data-stub="Forgot password">Forgot password?</button></div>' : '');
    scr.setAttribute('aria-label', s.h);
  }

  /* ---- the way in ------------------------------------------------------------
     Signing up is always a NEW account: no licences, no billing data, so Home opens
     on its new-user screen. Logging in is an EXISTING one and keeps whatever
     dashboard state the demo is set to — which is how "the populated state with that
     account's licences, or the empty state if the account has none" comes out of one
     line instead of a branch. */
  function finish(){
    /* ⚠️ Remember WHO. Nothing used to store the address typed here, so every event a
       new account created was logged against the demo's own mpanchuk@thingsboard.io —
       a purchase attributed to a stranger. `portalActor()` reads this. */
    if(mode === 'signup'){
      var em = ($('#authEmail') && $('#authEmail').value.trim())
            || (invited && invited.email) || '';
      var nm = ($('#authName') && $('#authName').value.trim()) || '';
      if(em || nm) Store.set('account', { email:em || PORTAL_ACTOR, name:nm });
    }
    /* Redeeming burns the token: single use is the invitation's whole promise, and
       the burn belongs at the moment the account is made, not at the moment the
       link was opened — a visitor who closes the screen has not used anything. */
    if(invited){ updateInvite(invited.token, { used:true }); invited = null; }
    if(mode === 'signup') setSession('new');
    else setSession('existing', { keepDash:true });
  }

  /* `opts.invite` is an invitation record (see mintInvite in shared.js). It only
     ever reaches sign-up: logging in needs no invitation, and an invitation is not
     a way to log in to an account that already exists. */
  function open(which, opts){
    mode = SCREENS[which] ? which : 'signup';
    invited = (opts && opts.invite) || null;
    if(mode !== 'signup') invited = null;
    lastFocus = document.activeElement;
    render();
    scr.hidden = false;
    $('#authClose').focus();
  }
  function close(){
    scr.hidden = true;
    /* a pending plan must not outlive the sign-up it was waiting for: leave it in
       the store and the NEXT sign-up, from anywhere, would open a wizard on a plan
       this visitor never chose */
    Store.set('pendingPurchase', null);
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* delegated: the body is re-rendered on every switch between the two screens */
  body.addEventListener('click', function(e){
    var alt = e.target.closest('[data-auth]');
    if(alt){
      mode = alt.getAttribute('data-auth');
      if(mode !== 'signup') invited = null;   // an invitation is not a way to log in
      render(); var f = $('input', body); if(f) f.focus(); return;
    }
    if(e.target.closest('#authSubmit') || e.target.closest('[data-auth-social]')){ finish(); return; }
    var eye = e.target.closest('[data-auth-reveal]');
    if(eye){
      var inp = $('input', eye.closest('.field'));
      var on = inp.type === 'password';
      inp.type = on ? 'text' : 'password';
      $('.eye', eye).hidden = on;
      $('.eyeoff', eye).hidden = !on;
      eye.setAttribute('aria-label', on ? 'Hide password' : 'Show password');
    }
  });
  $('#authClose').addEventListener('click', close);
  scr.addEventListener('click', function(e){ if(e.target === scr) close(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && !scr.hidden && $('#overlay').hidden) close();
  });

  /* The header's two buttons live in the chrome, so they are delegated from the
     document — the same reason every other chrome action is. */
  document.addEventListener('click', function(e){
    var b = e.target.closest('.pubacts [data-auth]');
    if(b) open(b.getAttribute('data-auth'));
  });

  return { open: open, close: close };
})();

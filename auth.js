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
    { k:'google', t:'Google', ic:'brand-google' },
        { k:'github', t:'GitHub', ic:'brand-github' }
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
      /* ⚠️ `authName` DELETED 2026-10-08, by request. The comment above describes why the
         field was asked for, and it is kept because the reason has not stopped being true:
         the invited person filled in their OWN details here. What changes is that nothing
         now captures a name at sign-up, so `portalName()` falls back to the demo's own —
         see NOTES, open debt. */
      fields:[ { id:'authEmail', label:'Email', type:'email', req:true, ac:'email' },
               { id:'authPass',  label:'Create a password', type:'password', req:true, ac:'new-password' } ],
      legal:true, cta:'Sign up', foot:'login'
    },
    login: {
      h:'Sign in with',
      fields:[ { id:'authUser', label:'Username (email)', type:'email', ac:'username' },
               { id:'authPass', label:'Password', type:'password', ac:'current-password' } ],
      cta:'Sign in', foot:'signup', forgot:true
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
  +       '<button class="btn btn--ghost btn--md btn--icon fs-close" id="authClose" aria-label="Close"><svg class="ic" aria-hidden="true"><use href="assets/icons.svg#ti-x"></use></svg></button>'
  +     '</div>'
  +     '<div class="fs-body authbody" id="authBody"></div>'
  +   '</div>'
  + '</div>';

  document.body.insertAdjacentHTML('beforeend', MARKUP);
  var scr = $('#authModal'), body = $('#authBody');
  var mode = 'signup', lastFocus = null;
  /* ⚠️⚠️ TWO ARRIVALS, ONE SURFACE (2026-10-01, by request). The modal over the landing
     is unchanged; the second variant is a PAGE a link can land on with no landing behind
     it — `signin.html`. What differs is only what a page is allowed to do that a modal is
     not: it cannot be closed (there is nothing behind it to go back to), and it carries
     the product's identity itself, because on the landing that identity is in the bar
     above it. Everything else — the two screens, their fields, the swap between them, the
     social buttons, the reveal eye — is the same code, which is the whole reason this is a
     flag and not a second file. */
  var standalone = false;
  /* the invitation this sign-up is redeeming, or null for an ordinary one */
  var invited = null;

  function socialHTML(){
    return '<div class="auth-social">'
      + SOCIALS.map(function(s){
          return '<button class="btn btn--secondary btn--md auth-soc" data-auth-social="' + s.k + '">'
            + icon(s.ic)
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
      + (lock ? '<svg class="ic authlock-ic" aria-hidden="true"><use href="assets/icons.svg#ti-lock"></use></svg>' : '')
      /* ⚠️⚠️ `.eyeoff` SHIPS HIDDEN, AND IT DID NOT (found 2026-10-01). Both glyphs were
         emitted bare, so every password field in this surface drew an eye AND a struck
         eye side by side from the first paint — in the modal as well as on the page.
         `.ic[hidden]{display:none}` is the rule that makes the attribute work on an
         `<svg>`; the licence key's own reveal control has carried this note since the
         trap was first hit there. */
      + (pw ? '<button class="btn btn--ghost btn--md btn--icon authpw-eye" data-auth-reveal aria-label="Show password">'
          + '<svg class="ic eye" aria-hidden="true"><use href="assets/icons.svg#ti-eye"></use></svg>'
          + '<svg class="ic eyeoff" aria-hidden="true" hidden><use href="assets/icons.svg#ti-eye-off"></use></svg>'
          + '</button>' : '')
      + '</div>';
  }
  /* ⚠️ IT BELONGS TO THE PASSWORD FIELD (2026-10-08, by request), and it is emitted by
     the field loop for that reason: it used to be the last node in the box, below the
     footer, with the primary and the way to the other screen standing between it and the
     input it is about. Flush left because it lines up with the field, not with the card —
     `.authbody` centres, and the fields already opt out of that. */
  function forgotHTML(){
    return '<div class="auth-forgot">'
      + '<button class="link" data-stub="Forgot password">Forgot password?</button></div>';
  }

  /* Consent names what gives it, and each document is a real link.
     ⚠️⚠️ THE TWO LINKS LEFT THE PROTOTYPE (2026-10-08, by request). They were
     `terms.html` and `privacy.html` — pages this repository holds and serves — and they
     are now ABSOLUTE URLs on thingsboard.io. Both questions this raises were MEASURED
     rather than left open, and neither is resolved here:
     ⚠️ THE THREE LOCAL PAGES KEEP A ROUTE — the FOOTER carries all three, on 14 of the 15
     pages. `license-agreement.html` also keeps two more: the licence panel and the
     wizard's review step. The one surface where this line was the only route is
     `signin.html`, which has no footer: a visitor who signs up there can no longer reach
     the prototype's own legal pages at all.
     ⚠️ AND THE RELATIVE-PATHS RULE IS NOT WHAT THESE BREAK. That rule is about ASSET paths,
     so the site works from a subfolder; outbound links to thingsboard.io were already here
     in quantity — `faq.js` alone carries dozens. These two join that population rather than
     opening an exception. See NOTES. */
  function legalHTML(){
    return '<p class="auth-legal">By signing up you agree to the '
      + '<a class="link" href="https://thingsboard.io/legal/privacy-policy/">Privacy Policy</a> and '
      + '<a class="link" href="https://thingsboard.io/legal/terms-of-use/">Terms of Use</a>.</p>';
  }
  /* ⚠️ ONE line, not a heading with a subtitle under it. It used to be
     `Create your account` with `Creating an account to buy ThingsBoard Pilot — $99/mo`
     beneath — two sentences that restate each other's subject, so the reader had to
     assemble the single fact they carry between them. Merged, the line names the
     action and what it is for, in the order they happen.

     Reads the choice the landing page stored. No pending purchase — a flat sign-up
     from the header — leaves the bare heading: nothing is being bought, so there is
     nothing to name, and the line must not invent one. Same for a stored plan that no
     longer matches a card (the offer changed under a stale store). */
  function signupHeading(){
    var base = SCREENS.signup.h;
    var p = Store.get('pendingPurchase');
    if(!p || !p.plan) return esc(base);
    var set = EC_PLANS[(p.product || 'thingsboard') + '|' + (p.kind === 'perpetual' ? 'perpetual' : 'payg')];
    var card = set && set.cards.filter(function(c){ return c.name === p.plan; })[0];
    if(!card) return esc(base);
    var product = p.product === 'tbmq' ? 'TBMQ' : 'ThingsBoard';
    /* ⚠️ NO PRICE. It was here in a quieter span, and it was still one fact too many:
       this heading answers "what am I signing up for", and the price is a term of the
       purchase, which the review step states in full before anyone pays. What the
       reader is checking here is that they picked the right PLAN. */
    /* ⚠️ "buy" IS WRONG FOR A FREE PLAN, and it was reaching the one reader least able
       to shrug it off: someone choosing Free is told, on the first
       screen, that they are about to buy something. The verb follows the price — free
       plans are GOT, paid ones are bought. */
    var free = card.free || !card.price || String(card.price).toLowerCase() === 'free';
    return esc(base) + (free ? ' to get ' : ' to buy ') + esc(product) + ' ' + esc(card.name);
  }
  function render(){
    var s = SCREENS[mode];
    /* ⚠️ The `ThingsBoard · Licenses` brand row is GONE from both screens. It was
       `aria-hidden` decoration repeating the identity that is already on the page
       behind the modal and in the browser tab — and at h2 weight it out-shouted the
       heading that says what the screen is actually for. */
    body.innerHTML = ''
      /* ⚠️ THE LOCK-UP IS THE PAGE FORM'S ONLY ADDITION, and the note below says why the
         modal has none: over the landing it would repeat the identity already in the bar
         behind it. Arriving by link there IS no bar, so the card has to say whose it is.
         `tb-logo` is the lock-up that carries `License Portal` inside the artwork — the
         one symbol built for standing alone (see tools/build-logo.py). */
      + (standalone
          ? '<div class="auth-brand"><svg class="auth-brandmark" role="img" aria-label="ThingsBoard License Portal">'
            + '<use href="assets/logo.svg#tb-logo"></use></svg></div>'
          : '')
      /* ⚠️ What you just chose is IN the heading, not under it — clicking Select on a
         plan used to open a dialog that said nothing about the plan, the product or
         the price, and the participant stopped to check they had not clicked the wrong
         thing. Built from the pending purchase, so it says what the card said. */
      + '<h2 class="auth-h" id="authHeading">'
      +   (mode === 'signup' ? signupHeading() : esc(s.h)) + '</h2>'
      + socialHTML()
      + '<div class="auth-or"><span>OR</span></div>'
      /* ⚠️ Sign-up carries no forgot control and none was added: there is no password to
         have forgotten on the screen that is creating one. */
      + s.fields.map(function(f){
          return fieldHTML(f) + (s.forgot && f.type === 'password' ? forgotHTML() : '');
        }).join('')
      + (s.legal ? legalHTML() : '')
      + '<button class="btn btn--primary btn--md auth-primary" id="authSubmit">' + s.cta + '</button>'
      /* The footer is the door to the other screen, and the two are not the same
         shape: sign-up asks a question whose answer is a link, log-in asks one whose
         answer is an action you have not taken yet — so it gets a real secondary
         button. Straight from the reference, and it is also the honest hierarchy:
         "I already have one" is a correction, "create one" is a second task.
         ⚠️⚠️ THE QUESTION IS THE LABEL NOW (2026-10-08, by request). Both screens used to
         say it twice: a question in quiet text (`.auth-footq`) with the control under it
         repeating the subject. One control, and the question is on it. `footTxt` and
         `.auth-footq` are gone — nothing else wore either. */
      + '<div class="auth-foot">'
      +   (mode === 'login'
          ? '<button class="btn btn--secondary btn--md auth-alt" data-auth="signup">New here? Create your account</button>'
          : '<button class="link auth-altlink" data-auth="login">Already have an account?</button>')
      + '</div>';
    scr.setAttribute('aria-label', s.h);
    /* ⚠️ THE PASSWORD FIELD IS CLEARED, and the reason matters for where to look:
       nothing in this prototype ever wrote a value into it. The prefill is the
       BROWSER's password manager acting on `autocomplete="current-password"` — which
       is the correct markup, and exactly what you want everywhere except here. On the
       one screen people reach BECAUSE they have forgotten their password, a filled
       password field is absurd, and it also hands the next person at the machine a
       working session in a demo that gets passed around.

       Cleared twice on purpose: autofill runs asynchronously, so the synchronous clear
       alone loses the race in some browsers. The email is left exactly as it is — it
       saves typing in the demo and gives away nothing. */
    var pw = $('#authPass');
    if(pw && mode === 'login'){
      pw.value = '';
      setTimeout(function(){ if(pw.isConnected) pw.value = ''; }, 0);
    }
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
  /* ⚠️ THE PAGE FORM HAS NO WAY OUT, and that is not an omission: a ✕ on a surface with
     nothing behind it would either do nothing or drop the visitor on a page they did not
     ask for. The close control is hidden rather than removed so `render` and the key
     handler keep one node to reason about, and `close()` refuses while it is up. */
  function mountPage(which){
    standalone = true;
    scr.classList.add('authstandalone');
    $('#authClose').hidden = true;
    /* ⚠️⚠️ THE CARD MOVES INTO `#shellMain`, AND IT HAS TO. `auth.js` appends its markup
       to `<body>` because a modal belongs above the page, not in it — which is right for
       the overlay and wrong here: as a child of body the screen is a flex item of the
       shell layout and gets STRETCHED by it (measured: a 1016px card holding 400px of
       form). In the page form the card IS the page's content, so it goes where content
       goes and is centred by the scroll box like anything else. */
    var host = $('#shellMain');
    if(host) host.appendChild(scr);
    open(which);
    var first = $('input', body); if(first) first.focus();
  }
  function close(){
    if(standalone) return;
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
      /* ⚠️ THE ATTRIBUTE, NOT THE PROPERTY: `el.hidden = true` is a no-op on an SVG
         element, so this toggle has been silently doing nothing. Same correction, and
         the same comment, as `setKeyRevealed` in license-details.js. */
      var gEye = $('.eye', eye), gOff = $('.eyeoff', eye);
      if(on){ gEye.setAttribute('hidden',''); gOff.removeAttribute('hidden'); }
      else  { gOff.setAttribute('hidden',''); gEye.removeAttribute('hidden'); }
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
    if(!b) return;
    var which = b.getAttribute('data-auth');
    /* ⚠️ THE AXIS DECIDES THE ARRIVAL, NOT THE SURFACE (2026-10-01). `page` navigates to
       the same two screens on their own page; the mode travels in the URL so the button
       pressed is the screen that opens. Nothing about the surface changes. */
    if(typeof authArrival === 'function' && authArrival() === 'page'){
      location.href = 'signin.html' + (which === 'signup' ? '?mode=signup' : '');
      return;
    }
    open(which);
  });

  return { open: open, close: close, mountPage: mountPage };
})();

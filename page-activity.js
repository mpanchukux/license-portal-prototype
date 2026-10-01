/* ============================================================================
   page-activity.js — the full activity feed and its period filter. The feed
   items themselves come from components.js (Home renders the same ones).
   ============================================================================ */

/* ⚠️ The type filter starts with EVERYTHING selected — including instance checks.
   Hiding a type by default would make the page quietly incomplete: a reader who never
   opens the filter would never learn that the checks are there, which is the opposite
   of what a log is for. The noise is handled by FOLDING the successful ones, not by
   dropping them. */
/* ⚠️⚠️ EMPTY IS THE DEFAULT, AND THE DEFAULT IS EVERYTHING (2026-09-28, by request),
   which reverses the 09-25 rule that an empty selection meant an empty list. That rule
   was written against a real fault — "unticking the last chip fell back to showing
   everything, so the filter appeared to RESET ITSELF" — and the reason it appeared to
   was that the control started with all four ticked: unticking the fourth looked like a
   fifth click in a sequence, and the list jumping back to full was a surprise.
   Start from NOTHING ticked and the same mechanic reads the other way round: no ticks
   is the state the page opens in, the trigger says `All event types` while it holds,
   and clearing the last tick is visibly a return to it rather than a reset out of
   nowhere. The page shows every note by default, so the control that filters it should
   open agreeing with the page.
   ⚠️ AND THERE IS NO "ALL FOUR TICKED" STATE. Ticking the fourth collapses the
   selection to empty — because those two are the same list, and a control with two
   spellings of one answer is a control that can be left in the wrong one. */
var actTypes = [];
/* ⚠️⚠️ THE FEED IS NOT PAGED ANY MORE (2026-09-28, by request), and the argument that
   added the pager on 09-25 is answered rather than dropped. It was: "instance check-ins
   are derived, so this page renders well over a thousand entries — measured at 22,093px
   of scroll". Two things changed. The successful checks FOLD into one row per run, which
   is what took the list from ~1400 to 315; and the entry stopped being a filled card, so
   315 rows are a column of sentences rather than 315 boxes.
   ⚠️ IT ALSO REMOVES A PAIRING THIS FILE HAD TO MAINTAIN: search and paging cannot both
   be on (`wireSearch` filters rows already in the DOM), so every render asked "is there
   a query" before deciding how much to draw. There is one answer now — everything. */
function actQuery(){
  var i = $('#activityView .searchbox input');
  return i ? i.value.trim() : '';
}
/* the records currently on screen, in render order — what search reads instead of the DOM */
var actRendered = [];
function renderActFeed(){
  var el = $('#actFeed'); if(!el) return;
  /* ⚠️ `null`, NOT `[]`. `activityFeed` reads "was a selection passed at all" — an empty
     array is a selection of nothing and filters the list to nothing, which is exactly
     what the default must not do. */
  var all = activityFeed({ types: actTypes.length ? actTypes : null });
  var everything = activityFeed({});
  var list = filterFeedByPeriod(all, actPeriod);
  /* ⚠️ TWO different empties, and the old code only had one. "No events in the
     selected period" was shown to a brand-new account, which has no events in ANY
     period — it described a filter the reader had not set and implied that widening
     it would help. Nothing has ever happened is a different sentence with no action:
     activity is a side effect of using the account, not something to go and create. */
  /* ⚠️ "Nothing has ever happened" is measured against EVERYTHING, not against the
     current filters — otherwise unticking every type would tell a busy account that it
     has never done anything. The two narrower empties describe the filter the reader
     set, and say which one. */
  if(!everything.length){
    el.innerHTML = emptyStateHTML({
      title:'Nothing has happened yet.',
      line:'Purchases, plan changes, and user activity are recorded here.'
    });
  } else if(!all.length){
    el.innerHTML = '<div class="emptybox">No events of the selected types.</div>';
  } else if(!list.length){
    el.innerHTML = '<div class="emptybox">No events in the selected period.</div>';
  } else {
    actRendered = list;
    el.innerHTML = activityList(list, 'global', '');
  }
  syncListEmpty(!everything.length);
  /* the feed's own chrome: a separator with nothing under it, and where the rail ends */
  syncFeedChrome($('#actFeed'));
}
/* ---------- the type filter -------------------------------------------------------
   ⚠️ ONE DROPDOWN, NOT FOUR CHIPS. Four chips was four controls for one question, and
   they took a whole toolbar row to ask it — next to a period control that asks the same
   KIND of question ("how much of the log") from a single button. One trigger stating the
   current answer, with the choices inside, makes the two filters read as a pair.
   It is MULTI-select: a reader narrowing a log usually wants two kinds at once
   ("changes and purchases"), so the menu holds checkboxes and stays open while they are
   used. It closes on the next click outside, like every other dropdown here. */
function actTypeLabel(){
  if(!actTypes.length) return 'All event types';
  if(actTypes.length === 1){
    var one = ACT_TYPES.filter(function(t){ return t.v === actTypes[0]; })[0];
    return one ? one.t : '1 type';
  }
  return actTypes.length + ' event types';
}
function renderActTypes(){
  var lbl = $('#actTypeLabel');
  if(lbl) lbl.textContent = actTypeLabel();
  $$('#actTypeMenu [data-acttype]').forEach(function(box){
    var on = actTypes.indexOf(box.getAttribute('data-acttype')) >= 0;
    box.checked = on;
    var row = box.closest('.dropcheck');
    if(row) row.classList.toggle('is-on', on);
  });
  /* ⚠️ THE WAY BACK APPEARS ONLY WHEN THERE IS SOMEWHERE TO GO BACK TO. It used to be
     `Select all`, standing there permanently — which under the old model was the way out
     of a narrowed list and under this one would be a second name for doing nothing. */
  var foot = $('#actTypeFoot');
  if(foot) foot.hidden = !actTypes.length;
}
(function(){
  var menu = $('#actTypeMenu'); if(!menu) return;
  /* ⚠️⚠️ A REAL CHECKBOX, BECAUSE THIS MENU IS MULTI-SELECT (2026-10-01, by request:
     "if only one can be chosen the tick goes on the right; if it is multi-select, rework
     the component so the rows carry a checkbox"). It was a `<button
     role="menuitemcheckbox">` with a tick that appeared on the right of nothing — the same
     row shape the SINGLE-select menus use, so two different arities looked identical and
     the reader could not tell which one shut on a click.
     ⚠️ A `<label>` WRAPPING AN `<input>`, not a button with an input inside it: an
     interactive control inside a button is invalid, and the label is what makes the whole
     row a hit target for the box. The native control brings the checked state, the space
     key and the accessible role with it.
     ⚠️ THE EVENT MOVED FROM `click` TO `change` with the control. A click handler on the
     row would fire twice — once for the label, once for the input it forwards to — and
     toggle the type back off again. */
  menu.innerHTML = ACT_TYPES.map(function(t){
    return '<label class="dropcheck dropcheck--multi">'
      + '<input type="checkbox" class="dropbox" data-acttype="' + t.v + '">'
      + '<span>' + t.t + '</span></label>';
  }).join('')
    + '<div class="dropfoot" id="actTypeFoot" hidden><button class="link" id="actTypeAll">Clear</button></div>';
  menu.addEventListener('click', function(e){
    var all = e.target.closest('#actTypeAll');
    if(all){
      e.stopPropagation();
      actTypes = [];
      renderActTypes(); renderActFeed();
      return;
    }
    /* ⚠️ The menu does NOT close on a tick. Choosing two kinds is two clicks, and a menu
       that shuts after the first turns one decision into two round trips — so every click
       inside it is stopped, whether it hit a row or the gap between them. */
    e.stopPropagation();
  });
  menu.addEventListener('change', function(e){
    var row = e.target.closest('[data-acttype]'); if(!row) return;
    e.stopPropagation();
    var v = row.getAttribute('data-acttype'), i = actTypes.indexOf(v);
    if(i >= 0) actTypes.splice(i, 1); else actTypes.push(v);
    /* every type ticked IS the default, so it is stored as the default */
    if(actTypes.length === ACT_TYPES.length) actTypes = [];
    renderActTypes();
    renderActFeed();
  });
  renderActTypes();
})();

renderActFeed();
wirePeriod('#actPeriod', actPeriod, renderActFeed);
/* ⚠️ Bound BEFORE wireSearch, and the order is the whole trick: this re-renders the
   feed (everything while there is a query, one page when there is not) and the
   listener wireSearch adds next then hides the non-matches in what was just drawn. */
(function(){
  var i = $('#activityView .searchbox input');
  if(i) i.addEventListener('input', renderActFeed);
})();

/* ---------- search: event text, entity name and actor, as ONE query ----------
   All three at once, against the stripped text of the entry — the feed stores HTML,
   and matching inside markup would hit a tag name as readily as a word. */
/* ⚠️ MATCHES THE RECORD, NOT THE NODE. This was `stripText(n.innerHTML)`, and
   `textContent` includes the hidden expander — so the JSON dump was the haystack and
   the sentence was not. Measured before the change: `784f394c`, a uuid that appears
   only inside that dump, matched all 298 rows, as did `actionType` and `createdTime`.
   The rows render in the same order as the list they came from, so index lines them up. */
wireSearch('#activityView .searchbox input', {
  /* ⚠️ `.fitem` ONLY, and it matters twice (2026-09-28). The feed's children are no
     longer all entries — a date separator sits between the runs — so `> *` would both
     hide separators as if they were non-matching rows AND shift every index by however
     many separators came before, which is what lines `actRendered` up with the DOM. */
  items: function(){ return $$('#actFeed > .fitem'); },
  text:  function(n, idx){ var r = actRendered[idx]; return r ? activityHaystack(r, 'global') : ''; },
  host:  function(){ return $('#actFeed'); },
  after: function(){ syncFeedChrome($('#actFeed')); },
  empty: function(q){ return noResultsHTML(q); }
});

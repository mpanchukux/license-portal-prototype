/* ============================================================================
   page-activity.js — the full activity feed and its period filter. The feed
   items themselves come from components.js (Home renders the same ones).
   ============================================================================ */

/* ⚠️ The type filter starts with EVERYTHING selected — including instance checks.
   Hiding a type by default would make the page quietly incomplete: a reader who never
   opens the filter would never learn that the checks are there, which is the opposite
   of what a log is for. The noise is handled by FOLDING the successful ones, not by
   dropping them. */
var actTypes = ACT_TYPES.map(function(t){ return t.v; });
/* ⚠️ THE FEED IS PAGED NOW, and it had to be: instance check-ins are derived, so this
   page renders well over a thousand entries on the demo account — measured at 22,093px
   of scroll. The pager markup was already in the page and could not move.
   ⚠️ While a SEARCH is active the page renders everything and the pager stands down —
   `wireSearch` filters rows that are already in the DOM, so searching one page of many
   would search ten rows and report the rest missing. See pageSlice in components.js. */
var actPage = { page:1, size:10, total:0 };
function actQuery(){
  var i = $('#activityView .searchbox input');
  return i ? i.value.trim() : '';
}
/* the records currently on screen, in render order — what search reads instead of the DOM */
var actRendered = [];
function renderActFeed(){
  var el = $('#actFeed'); if(!el) return;
  var all = activityFeed({ types:actTypes });
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
    var searching = !!actQuery();
    var rows = searching ? list : pageSlice(list, actPage);
    if(searching) actPage.total = list.length;
    actRendered = rows;
    el.innerHTML = rows.map(function(a, i){ return activityEntry(a, 'global', i); }).join('');
  }
  syncListEmpty(!everything.length);
  var pg = $('#activityView .pager');
  if(pg) pg.hidden = !!actQuery() || !list.length;
  syncPager('#activityView .pager', actPage);
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
  if(actTypes.length === ACT_TYPES.length) return 'All event types';
  if(!actTypes.length) return 'No event types';
  if(actTypes.length === 1){
    var one = ACT_TYPES.filter(function(t){ return t.v === actTypes[0]; })[0];
    return one ? one.t : '1 type';
  }
  return actTypes.length + ' event types';
}
function renderActTypes(){
  var lbl = $('#actTypeLabel');
  if(lbl) lbl.textContent = actTypeLabel();
  $$('#actTypeMenu [data-acttype]').forEach(function(row){
    var on = actTypes.indexOf(row.getAttribute('data-acttype')) >= 0;
    row.setAttribute('aria-checked', on ? 'true' : 'false');
    row.classList.toggle('is-on', on);
  });
}
(function(){
  var menu = $('#actTypeMenu'); if(!menu) return;
  menu.innerHTML = ACT_TYPES.map(function(t){
    return '<button role="menuitemcheckbox" class="dropcheck" data-acttype="' + t.v + '" aria-checked="true">'
      + '<svg class="ic cc-check" aria-hidden="true"><use href="assets/icons.svg#ti-check"></use></svg>'
      + '<span>' + t.t + '</span></button>';
  }).join('')
    /* ⚠️ A way back to everything, because a multi-select can be left in a state whose
       way out is four more clicks. */
    + '<div class="dropfoot"><button class="link" id="actTypeAll">Select all</button></div>';
  menu.addEventListener('click', function(e){
    var all = e.target.closest('#actTypeAll');
    if(all){
      actTypes = ACT_TYPES.map(function(t){ return t.v; });
      renderActTypes(); renderActFeed();
      return;
    }
    var row = e.target.closest('[data-acttype]'); if(!row) return;
    /* ⚠️ The menu does NOT close on a tick. Choosing two kinds is two clicks, and a menu
       that shuts after the first turns one decision into two round trips. */
    e.stopPropagation();
    var v = row.getAttribute('data-acttype'), i = actTypes.indexOf(v);
    if(i >= 0) actTypes.splice(i, 1); else actTypes.push(v);
    renderActTypes();
    renderActFeed();
  });
  renderActTypes();
})();

renderActFeed();
wireFeedAudit('#activityView');
wirePeriod('#actPeriod', actPeriod, renderActFeed);
wirePager('#activityView .pager', actPage, renderActFeed);
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
  items: function(){ return $$('#actFeed > *').filter(function(n){ return !n.classList.contains('noresults'); }); },
  text:  function(n, idx){ var r = actRendered[idx]; return r ? activityHaystack(r, 'global') : ''; },
  host:  function(){ return $('#actFeed'); },
  empty: function(q){ return noResultsHTML(q); }
});

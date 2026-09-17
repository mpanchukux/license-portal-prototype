/* ============================================================================
   page-activity.js — the full activity feed and its period filter. The feed
   items themselves come from components.js (Home renders the same ones).
   ============================================================================ */

function renderActFeed(){
  var el = $('#actFeed'); if(!el) return;
  var all = DATA().activity;
  var list = filterFeedByPeriod(all, actPeriod);
  /* ⚠️ TWO different empties, and the old code only had one. "No events in the
     selected period" was shown to a brand-new account, which has no events in ANY
     period — it described a filter the reader had not set and implied that widening
     it would help. Nothing has ever happened is a different sentence with no action:
     activity is a side effect of using the account, not something to go and create. */
  if(!all.length){
    el.innerHTML = emptyStateHTML({
      title:'Nothing has happened yet.',
      line:'Purchases, plan changes, and user activity are recorded here.'
    });
  } else if(!list.length){
    el.innerHTML = '<div class="emptybox">No events in the selected period.</div>';
  } else {
    el.innerHTML = list.map(function(a, i){ return feedItem(a, i); }).join('');
  }
  syncListEmpty(!all.length);
  var r = $('#activityView .pager .range');
  if(r) r.textContent = list.length ? ('1–' + list.length + ' of ' + list.length) : '0 of 0';
}
renderActFeed();
wireFeedAudit('#activityView');
wirePeriod('#actPeriod', actPeriod, renderActFeed);

/* ---------- search: event text, entity name and actor, as ONE query ----------
   All three at once, against the stripped text of the entry — the feed stores HTML,
   and matching inside markup would hit a tag name as readily as a word. */
wireSearch('#activityView .searchbox input', {
  items: function(){ return $$('#actFeed > *').filter(function(n){ return !n.classList.contains('noresults'); }); },
  text:  function(n){ return stripText(n.innerHTML); },
  host:  function(){ return $('#actFeed'); },
  empty: function(q){ return noResultsHTML(q); }
});

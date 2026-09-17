/* ============================================================================
   page-activity.js — the full activity feed and its period filter. The feed
   items themselves come from components.js (Home renders the same ones).
   ============================================================================ */

function renderActFeed(){
  var el = $('#actFeed'); if(!el) return;
  var list = filterFeedByPeriod(DATA().activity, actPeriod);
  el.innerHTML = list.length
    ? list.map(function(a, i){ return feedItem(a, i); }).join('')
    : '<div class="emptybox">No events in the selected period.</div>';
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

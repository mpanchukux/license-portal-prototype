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

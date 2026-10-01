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
  } else if(!all.length || !list.length){
    /* ⚠️ THE TWO SENTENCES BECAME ONE BUILDER (2026-10-01, by request). They already said
       WHICH filter was responsible — "of the selected types", "in the selected period" —
       and that was the better half of what the pattern asks for; what they did not do is
       offer the way out. `constraintEmptyHTML` names the constraint AND carries its exit,
       and it is the same block the other three list pages draw. */
    el.innerHTML = constraintEmptyHTML(actQ(), actApplied().length > 0, 'events');
  } else {
    actRendered = list;
    el.innerHTML = activityList(list, 'global', '');
  }
  syncListEmpty(!everything.length);
  /* ⚠️ THE ACCOUNT'S TOTAL, not what the period and the type filter leave — the same
     reading the chip has on Licenses and Instances, and `everything` is already the
     unfiltered feed this function measures its empty state against.
     ⚠️ IT COUNTS FOLDED RUNS AS ONE, because that is what a row is here: a run of
     successful checks is one entry in this list, and a number that said 1,400 beside a
     list of 315 rows would be counting something the page never shows. */
  var actTotal = $('#actTotal');
  if(actTotal) actTotal.textContent = everything.length;
  syncAppliedRow('#actApplied', actApplied);
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

/* ---------- the phone's filter pattern, ported from Licenses (2026-10-01, by request)
   ⚠️ BOTH DROPDOWNS GET A SHEET, including the multi-select one and the one that carries
   a FORM. Leaving either on the inline menu would put two kinds of control side by side
   in the same row, which is worse than either on its own. */
var actRun = null;
function actApply(){ if(actRun) actRun(); else renderActFeed(); }
function actQ(){ var i = $('#activityView .searchbox input'); return i ? i.value.trim() : ''; }
/* ⚠️⚠️ THE TRIGGER'S LABEL IS THE SINGLE SOURCE, and reading it back is deliberate rather
   than lazy. `actPeriod.from` / `.to` hold EPOCH DAY NUMBERS (see `isoDay`), not the ISO
   strings the label is written from — `wirePeriod` builds its text from the date inputs'
   own values and keeps nothing. So a second formatter here would have to re-derive a
   calendar date from a day count to say what the control already says, and the two could
   disagree. Whichever path set the label — the desktop menu or the phone sheet — this
   reads what is on screen. */
function perLabelNow(){
  var lab = $('#actPeriod .perlabel');
  return lab ? lab.textContent.trim() : (PER_LABEL[actPeriod.mode] || 'All time');
}
function setPerLabel(txt){
  var lab = $('#actPeriod .perlabel');
  if(lab) lab.textContent = txt;
}
function rangeLabel(fromISO, toISO){
  function dm(iso){ var q = String(iso).split('-'); return q[2] + '.' + q[1]; }
  if(fromISO && toISO) return dm(fromISO) + ' \u2013 ' + dm(toISO);
  if(fromISO) return 'from ' + dm(fromISO);
  if(toISO) return 'until ' + dm(toISO);
  return 'Custom range';
}
/* ⚠️ THE APPLIED ROW READS THE SAME TWO CONTROLS the toolbar does, and `All time` is not
   applied — it is the absence of a period, the way an empty type list is the absence of a
   type filter. A chip for "no filter" would be a control that undoes nothing. */
function actApplied(){
  var out = [];
  if(actPeriod.mode && actPeriod.mode !== 'all')
    out.push({ k:'period', t:perLabelNow(),
      clear:function(){ actPeriod.mode = 'all'; actPeriod.from = null; actPeriod.to = null;
                        setPerLabel(PER_LABEL.all); } });
  actTypes.forEach(function(v){
    var hit = ACT_TYPES.filter(function(t){ return t.v === v; })[0];
    out.push({ k:'type:' + v, t:(hit ? hit.t : v),
      clear:function(){ var i = actTypes.indexOf(v); if(i >= 0) actTypes.splice(i, 1); renderActTypes(); } });
  });
  return out;
}
function actCountFor(st, types){
  var all = activityFeed({ types: types && types.length ? types : null });
  return filterFeedByPeriod(all, st).length;
}
/* ⚠️⚠️ THE CUSTOM RANGE LIVES IN THE SHEET, revealed by its own row — the period is the
   one filter in this product that is not a plain list, and the pattern's answer to "a
   sheet is a list of options" cannot simply drop it. The two inputs are rendered only
   while `custom` is the pending answer, and read off the panel on apply (see
   `FilterSheet`'s `extra`). */
wireSheetTrigger('#actPeriod', function(){
  var opts = ['all','24h','7d','30d','custom'].slice(1).map(function(m){
    return { v:m, t:PER_LABEL[m] };
  });
  return {
    title:'Period', opts:opts, current:(actPeriod.mode === 'all' ? null : actPeriod.mode),
    allLabel:PER_LABEL.all, total:actCountFor({ mode:'all' }, actTypes),
    countOf:function(m){ return m === 'custom' ? null : actCountFor({ mode:m }, actTypes); },
    countWith:function(m){ return m === 'custom' ? actCountFor(actPeriod, actTypes)
                                                 : actCountFor({ mode:(m || 'all') }, actTypes); },
    noun:'event', nounPlural:'events',
    extra:{ when:'custom',
      html:'<div class="fsheet-extra"><div class="perrow">'
        /* ⚠️ THE FIELDS OPEN EMPTY rather than pre-filled, and the reason is the one
           above: what is stored is a day COUNT, and a `<input type=date>` wants a
           calendar string. Reconstructing one to show it back is a second formatter for
           a value the reader is about to retype anyway. The desktop menu's own fields
           behave the same way. */
        + '<input type="date" class="perfrom" aria-label="From date">'
        + '<span class="permid">to</span>'
        + '<input type="date" class="perto" aria-label="To date">'
        + '</div></div>',
      /* ⚠️ BOTH FORMS COME BACK: the day NUMBERS the filter compares against, and the
         ISO strings the label is written from. `isoDay` is one-way. */
      read:function(panel){
        var f = $('.perfrom', panel), t = $('.perto', panel);
        return { from:(f && f.value) ? isoDay(f.value) : null, fromISO:(f ? f.value : ''),
                 to:(t && t.value) ? isoDay(t.value) : null,   toISO:(t ? t.value : '') };
      } },
    onApply:function(m, extra){
      actPeriod.mode = m || 'all';
      actPeriod.from = (m === 'custom' && extra) ? extra.from : null;
      actPeriod.to   = (m === 'custom' && extra) ? extra.to   : null;
      setPerLabel(m === 'custom' ? rangeLabel(extra && extra.fromISO, extra && extra.toISO)
                                 : (PER_LABEL[actPeriod.mode] || 'All time'));
      actApply();
    }
  };
});
wireSheetTrigger('.acttypectl', function(){
  return {
    title:'Event types', multi:true, opts:ACT_TYPES.slice(),
    current:actTypes, allLabel:'All event types',
    total:actCountFor(actPeriod, []),
    countOf:function(v){ return actCountFor(actPeriod, [v]); },
    countWith:function(sel){ return actCountFor(actPeriod, sel); },
    noun:'event', nounPlural:'events',
    onApply:function(sel){
      /* every type ticked IS the default, exactly as the menu stores it */
      actTypes = (sel.length === ACT_TYPES.length) ? [] : sel;
      renderActTypes(); actApply();
    }
  };
});
wireAppliedRow('#actApplied', actApplied, actApply);
document.addEventListener('click', function(e){
  if(e.target.closest('#activityView [data-clearfilters]')){
    actPeriod.mode = 'all'; actPeriod.from = null; actPeriod.to = null;
    actTypes = []; setPerLabel(PER_LABEL.all); renderActTypes(); actApply(); return;
  }
  if(e.target.closest('#activityView [data-clearall]')){
    var f = $('#activityView .searchbox input'); if(f) f.value = '';
    actPeriod.mode = 'all'; actPeriod.from = null; actPeriod.to = null;
    actTypes = []; setPerLabel(PER_LABEL.all); renderActTypes(); actApply();
  }
});

/* ---------- search: event text, entity name and actor, as ONE query ----------
   All three at once, against the stripped text of the entry — the feed stores HTML,
   and matching inside markup would hit a tag name as readily as a word. */
/* ⚠️ MATCHES THE RECORD, NOT THE NODE. This was `stripText(n.innerHTML)`, and
   `textContent` includes the hidden expander — so the JSON dump was the haystack and
   the sentence was not. Measured before the change: `784f394c`, a uuid that appears
   only inside that dump, matched all 298 rows, as did `actionType` and `createdTime`.
   The rows render in the same order as the list they came from, so index lines them up. */
actRun = wireSearch('#activityView .searchbox input', {
  before: renderActFeed,
  debounce: 160,
  /* ⚠️ `.fitem` ONLY, and it matters twice (2026-09-28). The feed's children are no
     longer all entries — a date separator sits between the runs — so `> *` would both
     hide separators as if they were non-matching rows AND shift every index by however
     many separators came before, which is what lines `actRendered` up with the DOM. */
  items: function(){ return $$('#actFeed > .fitem'); },
  text:  function(n, idx){ var r = actRendered[idx]; return r ? activityHaystack(r, 'global') : ''; },
  host:  function(){ return $('#actFeed'); },
  after: function(){ syncFeedChrome($('#actFeed')); },
  empty: function(q){ return constraintEmptyHTML(q, actApplied().length > 0, 'events'); }
});

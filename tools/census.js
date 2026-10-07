/* census.js — the COMPONENT census, by rendered form (component work, 2026-10-07).
 *
 * ⚠⚠ IT IS IN THE REPOSITORY FOR THE REASON `roles.py` TAUGHT: a measurement harness
 * that lives in a session directory is rebuilt from scratch by the next session. This one
 * is needed for all three component groups, not just the first.
 *
 * ⚠⚠ IT GROUPS BY WHAT THE BROWSER PAINTS, NOT BY SELECTOR. The signature is height,
 * padding, radius, font, background, colour, border, shadow, min-width and gap — so two
 * selectors painting the same thing collapse to one row, and one selector painting two
 * things shows up as two. That is the whole point: a component set is specified from the
 * forms a reader can tell apart, not from the class names that happen to exist.
 *
 * ⚠️ REVIEWING INSTRUMENTS ARE EXCLUDED (`.statebar`, `.sg-`) for the same reason the
 * sweep excludes them: they are not product chrome and never ship.
 * ⚠️ HIDDEN AND ZERO-SIZE ELEMENTS ARE SKIPPED — a form nobody can see is not a form.
 *   Half of what this has to count lives on surfaces a static walk never opens (the
 *   wizard, the licence modal, the phone's filter sheet), so the CALLER must drive them;
 *   see the group-1 run in NOTES.
 */
/* component census — by RENDERED FORM, not by selector.
   Two selectors painting the same thing collapse to one row. */
(function(root){
  function sig(el, win){
    var cs = win.getComputedStyle(el), r = el.getBoundingClientRect();
    return [
      Math.round(r.height),
      cs.paddingTop + '/' + cs.paddingRight + '/' + cs.paddingBottom + '/' + cs.paddingLeft,
      cs.borderTopLeftRadius,
      cs.fontSize + '/' + cs.fontWeight,
      cs.backgroundColor,
      cs.color,
      cs.borderTopWidth + ' ' + cs.borderTopColor,
      cs.boxShadow === 'none' ? '-' : 'shadow',
      cs.minWidth,
      cs.gap || '-'
    ].join(' | ');
  }
  function label(el){
    var t = (el.textContent || '').trim().replace(/\s+/g,' ');
    if(t) return t.slice(0,28);
    return '(icon only)';
  }
  function kindOf(el){
    var c = ' ' + String(el.className) + ' ';
    if(/\bbtn\b/.test(c)) return 'button';
    if(/chip|verm|seg|statmark|sdot|fchip|attnchip/.test(c)) return 'chip';
    if(/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return 'field';
    if(el.tagName === 'BUTTON' || (el.tagName === 'A' && el.getAttribute('role') === 'button')) return 'button-ish';
    return null;
  }
  root.CENSUS = function(doc, win, where){
    var out = [];
    var all = doc.querySelectorAll('button, a.btn, input, select, textarea, [class*="chip"], .verm, .seg, .statmark, .sdot, .fchip, .attnchip');
    for(var i=0;i<all.length;i++){
      var el = all[i];
      if(el.closest('.statebar') || el.closest('.sg-')) continue;       // reviewing instruments
      if(el.type === 'radio' || el.type === 'checkbox') continue;        // not a field form
      var k = kindOf(el); if(!k) continue;
      var cs = win.getComputedStyle(el);
      if(cs.display === 'none' || cs.visibility === 'hidden') continue;
      var r = el.getBoundingClientRect();
      if(!r.width && !r.height) continue;
      out.push({ kind:k, where:where,
                 cls:String(el.className).trim().split(/\s+/).slice(0,4).join('.'),
                 tag:el.tagName.toLowerCase(),
                 label:label(el), sig:sig(el, win),
                 w:Math.round(r.width), h:Math.round(r.height) });
    }
    return out;
  };
})(window);
/* component census — by RENDERED FORM, not by selector.
   Two selectors painting the same thing collapse to one row. */
(function(root){
  function sig(el, win){
    var cs = win.getComputedStyle(el), r = el.getBoundingClientRect();
    return [
      Math.round(r.height),
      cs.paddingTop + '/' + cs.paddingRight + '/' + cs.paddingBottom + '/' + cs.paddingLeft,
      cs.borderTopLeftRadius,
      cs.fontSize + '/' + cs.fontWeight,
      cs.backgroundColor,
      cs.color,
      cs.borderTopWidth + ' ' + cs.borderTopColor,
      cs.boxShadow === 'none' ? '-' : 'shadow',
      cs.minWidth,
      cs.gap || '-'
    ].join(' | ');
  }
  function label(el){
    var t = (el.textContent || '').trim().replace(/\s+/g,' ');
    if(t) return t.slice(0,28);
    return '(icon only)';
  }
  function kindOf(el){
    var c = ' ' + String(el.className) + ' ';
    if(/\bbtn\b/.test(c)) return 'button';
    if(/chip|verm|seg|statmark|sdot|fchip|attnchip/.test(c)) return 'chip';
    if(/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return 'field';
    if(el.tagName === 'BUTTON' || (el.tagName === 'A' && el.getAttribute('role') === 'button')) return 'button-ish';
    return null;
  }
  root.CENSUS = function(doc, win, where){
    var out = [];
    var all = doc.querySelectorAll('button, a.btn, input, select, textarea, [class*="chip"], .verm, .seg, .statmark, .sdot, .fchip, .attnchip');
    for(var i=0;i<all.length;i++){
      var el = all[i];
      if(el.closest('.statebar') || el.closest('.sg-')) continue;       // reviewing instruments
      if(el.type === 'radio' || el.type === 'checkbox') continue;        // not a field form
      var k = kindOf(el); if(!k) continue;
      var cs = win.getComputedStyle(el);
      if(cs.display === 'none' || cs.visibility === 'hidden') continue;
      var r = el.getBoundingClientRect();
      if(!r.width && !r.height) continue;
      out.push({ kind:k, where:where,
                 cls:String(el.className).trim().split(/\s+/).slice(0,4).join('.'),
                 tag:el.tagName.toLowerCase(),
                 label:label(el), sig:sig(el, win),
                 w:Math.round(r.width), h:Math.round(r.height) });
    }
    return out;
  };
})(window);

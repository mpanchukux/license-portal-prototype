/* Which rules the browser threw away — run in the embedded panel against the mirror.
 *
 * ⚠️⚠️ THIS REPLACES `csscheck.py`, AND THE REASON IS A RULE THAT NEVER WORKED A DAY.
 * `csscheck.py` walked nesting depth and reported `css ok` whenever the braces balanced.
 * On 2026-10-02 five lines of prose were found sitting OUTSIDE any comment: the browser
 * read 824 characters as a selector, swallowed the rule that followed, and dropped both.
 * The braces balanced perfectly, so the depth check was green the whole time — and the
 * prose and the rule had arrived in the SAME commit, so the rule had never once applied.
 * A balanced file and a parsed file are two different claims, and only the second is the
 * one anyone cares about.
 *
 * ⚠️ SO THE ORACLE IS THE BROWSER, NOT A PARSER OF MINE. Re-implementing CSS parsing in
 * Python would just be a second opinion that can be wrong in its own way. `CSSStyleSheet`
 * is the same engine that will render the file, so what it refuses is exactly what will
 * not apply. This file's own text scan exists ONLY to say WHERE — it supplies line
 * numbers, which the CSSOM does not carry.
 *
 * ⚠️ THE COUNT IS THE TEST; THE ALIGNMENT ONLY LOCATES. Authored rules are compared to
 * accepted rules by COUNT first, and a file where the two agree is reported clean without
 * any selector matching at all. Only when they differ does it align the two lists to name
 * the casualties. That ordering is deliberate: selector normalisation (the browser quotes
 * attribute values, respaces combinators) is the one part of this that can be wrong, and
 * it must never be able to invent a finding in a healthy file. A checker that cries wolf
 * is a checker somebody turns off — the same reasoning `check-icons.py` records about
 * comments and `check-collisions.py` about its ratchet.
 *
 * USAGE, from the panel, with the mirror served:
 *     await checkCSS('/site/styles.css')     → {ok, authored, accepted, dropped:[...]}
 * `dropped` carries {line, selector, length} for every rule the browser did not keep.
 * ⚠️ Run it on the MIRROR, not on a file:// path — the fetch has to succeed, and the
 * mirror is the copy the browser is actually rendering.
 */
(function (root) {

  /* ---- what the FILE says, with line numbers ----------------------------------
     A deliberately small scanner: it only has to find rule preludes, so it tracks
     comments, strings and brace depth and nothing else.
     ⚠️ `@keyframes` is skipped as a CONTAINER: its children are keyframe selectors
     (`0%`, `from`), not style rules, and the CSSOM does not report them as such
     either — counting them on one side and not the other would be a permanent
     false positive. `@media` and `@supports` ARE recursed into: their children are
     ordinary style rules and the browser reports them as such. */
  function authoredRules(text) {
    const out = [];
    let i = 0, line = 1, depth = 0, preludeStart = 0, prelude = '';
    const skipKeyframes = [];          // depths whose block holds keyframe selectors
    while (i < text.length) {
      const c = text[i], c2 = text[i + 1];
      if (c === '\n') { line++; i++; prelude += c; continue; }
      if (c === '/' && c2 === '*') {   // comment — not part of any prelude
        i += 2;
        while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
          if (text[i] === '\n') line++;
          i++;
        }
        i += 2; continue;
      }
      if (c === '"' || c === "'") {    // string — may legally contain { } /*
        const q = c; prelude += c; i++;
        while (i < text.length && text[i] !== q) {
          if (text[i] === '\\') { prelude += text[i]; i++; }
          if (text[i] === '\n') line++;
          prelude += text[i]; i++;
        }
        prelude += q; i++; continue;
      }
      if (c === '{') {
        const sel = prelude.trim();
        const atRule = sel[0] === '@';
        /* ⚠️ THE DEPTH RECORDED IS THE ONE INSIDE THE BLOCK (`depth + 1`), not the one
           the `@keyframes` prelude sits at. Recording the outer depth was the first
           version and it skipped nothing: `from` and `0%,16%` live one level deeper, so
           the test never matched and twelve keyframe selectors were counted as authored
           style rules the browser had "dropped". Twelve false findings on a healthy
           file — the exact failure this tool's own header warns about. */
        if (!atRule && sel && skipKeyframes.indexOf(depth) < 0) {
          out.push({ line: lineOfPrelude(text, preludeStart), selector: sel, length: sel.length });
        }
        depth++;
        if (/^@(-\w+-)?keyframes\b/i.test(sel)) skipKeyframes.push(depth);
        prelude = ''; preludeStart = i + 1; i++; continue;
      }
      if (c === '}') {
        const k = skipKeyframes.indexOf(depth);
        if (k >= 0) skipKeyframes.splice(k, 1);
        depth--;
        prelude = ''; preludeStart = i + 1; i++; continue;
      }
      if (c === ';' && depth === 0) {   // @import / @charset — statement, not a rule
        prelude = ''; preludeStart = i + 1; i++; continue;
      }
      prelude += c; i++;
    }
    /* the prelude's own first non-blank line, not the line the `{` landed on — a
       selector list wrapped over four lines should report where it STARTS, which is
       where a reader will look for it */
    function lineOfPrelude(src, from) {
      let n = 1;
      for (let j = 0; j < from; j++) if (src[j] === '\n') n++;
      let j = from;
      while (j < src.length && /\s/.test(src[j])) { if (src[j] === '\n') n++; j++; }
      return n;
    }
    return out;
  }

  /* ---- what the BROWSER kept -------------------------------------------------- */
  function acceptedRules(text) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(text);
    const out = [];
    (function walk(rules) {
      for (const r of rules) {
        if (r.type === CSSRule.STYLE_RULE) out.push(r.selectorText);
        else if (r.cssRules && r.type !== CSSRule.KEYFRAMES_RULE) walk(r.cssRules);
      }
    })(sheet.cssRules);
    return out;
  }

  /* ⚠️ Normalisation is for ALIGNMENT ONLY and never decides whether the file is ok.
     The browser respaces combinators and quotes attribute values, so both sides lose
     whitespace and quotes before they are compared.
     ⚠️ `*:` → `:` — THE BROWSER DROPS A QUALIFIED UNIVERSAL. `.setcard > *:not(.setcard-h)`
     serialises back as `.setcard > :not(.setcard-h)`, because `*` adds nothing once a
     compound follows it. Six healthy rules were named as casualties before this line
     existed. A standalone `*` is left alone — the browser keeps that one. */
  const norm = s => s.replace(/\s+/g, '').replace(/["']/g, '')
                     .replace(/\*(?=[:[.#])/g, '').toLowerCase();

  root.checkCSS = async function (url) {
    const text = await (await fetch(url, { cache: 'no-store' })).text();
    const authored = authoredRules(text);
    const accepted = acceptedRules(text);

    if (authored.length === accepted.length) {
      return { ok: true, url, authored: authored.length, accepted: accepted.length,
               dropped: [], note: 'every authored rule survived the parse' };
    }

    /* counts disagree — align to find which ones the browser did not keep */
    const pool = new Map();
    for (const s of accepted) { const k = norm(s); pool.set(k, (pool.get(k) || 0) + 1); }
    const dropped = [];
    for (const a of authored) {
      const k = norm(a.selector);
      const n = pool.get(k) || 0;
      if (n > 0) pool.set(k, n - 1);
      else dropped.push({ line: a.line, length: a.length,
                          selector: a.selector.length > 120
                                    ? a.selector.slice(0, 60) + ' … ' + a.selector.slice(-57)
                                    : a.selector });
    }
    return {
      ok: false, url,
      authored: authored.length, accepted: accepted.length,
      missing: authored.length - accepted.length,
      dropped,
      /* ⚠️ The fingerprint of swallowed prose: a "selector" hundreds of characters long.
         THE TAIL IS THE PART THAT MATTERS — the rule that actually died is the last
         thing in the blob, because the browser ran from the stray text to the next `{`.
         Reporting only the head would name the prose and hide the casualty. */
      suspectProse: dropped.filter(d => d.length > 200).map(d => ({
        line: d.line, chars: d.length,
        swallowedRule: '…' + d.selector.replace(/…$/, '').slice(-60).replace(/\s+/g, ' ')
      }))
    };
  };

})(window);

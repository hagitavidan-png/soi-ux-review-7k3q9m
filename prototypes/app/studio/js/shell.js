/* Interactive Art Studio V2: the shell around the artwork.
   Top bar, the toolbar (undo and redo, then the activity's tools), panels, the two questions
   ("Clear?" and "Unsaved changes"), the short message, and leaving without losing work.
   An artwork that saves itself (S.auto, app prototype ?art=): no "Save" and no "Unsaved changes" question; a small
   "Saved" beside the title once it is written, and leaving or hiding the page writes what is left first.
   The activity may also say: clear: false (no "Clear"); keep (an artwork that saves itself only): one button that
   keeps the work as it is now as a development point of the artwork ('kept'), its label from the activity;
   next (the same): one button that writes the work and goes back to the lesson, like "Back", with its own label.
   The work first (all activities, 15 October 2026): the tools' secondary controls (their panels) open in a row of
   their own between the work and the toolbar (#tray), never over the work; a panel the tool keeps open while it is used
   (item.stay: light and shadow) closes only when its tool is tapped again or another tool is chosen. "Expand"
   (#expand) hides what is not needed for drawing (the bar's words, the lesson's line, the main action) and lets the page
   fill the space (js/core.js setView: the part not seen is reached with two fingers); one button, "Show all", in the
   same place, brings them back.
   No row of actions under the work (16 October 2026, after the review on a phone): the main action (the lesson's next
   step, "Save") is a small button at the bar's end; the secondary ones ("Clear" / "Start over", a tool's own) are in
   the bar's "More" (⋯), and "Start over" still asks first. On a narrow bar its least needed words go first (fitBar):
   the title, the words of "Back", the other buttons' words, My artworks into "More", and only then the main action's
   on two lines (17 October 2026: on one line while anything else can make room). In "Expand", "Whole page" (#fitView)
   shows the page whole, and "Fill the screen" lets it fill the space again. */
Studio.shell = (function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var S;   // what the core hands over in build()
  var panels = [];   // [panel id, button id, stays open while its tool is used]

  var ICON = {
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/></svg>',
    redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 000 12h3"/></svg>'
  };

  function button(id, icon, label) {
    var b = document.createElement('button');
    b.className = 'tool'; b.id = id; b.type = 'button';
    b.innerHTML = icon + '<span data-t="' + label + '"></span>';
    return b;
  }

  function build(s) {
    S = s;
    var nav = $('tools');
    var u = button('undo', ICON.undo, 'undo'); u.disabled = true; u.addEventListener('click', S.undo); nav.appendChild(u);
    var r = button('redo', ICON.redo, 'redo'); r.disabled = true; r.addEventListener('click', S.redo); nav.appendChild(r);
    if (S.items.length) { var g = document.createElement('i'); g.className = 'gap'; g.setAttribute('aria-hidden', 'true'); nav.appendChild(g); }
    S.items.forEach(function (it) {
      var b = button(it.id, it.icon, it.label);
      if (it.panel) { b.setAttribute('aria-haspopup', 'true'); b.setAttribute('aria-expanded', 'false'); panels.push([it.panel, it.id, !!it.stay]); }
      if (it.pressed) b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', it.onClick);
      nav.appendChild(b);
    });

    /* "Pattern settings", in "Expand" only, while the work has a repeat's sliders (Hagit on her phone, 21 October 2026:
       "Expand" should be a larger, quieter place to draw): the sliders are put away there, and this brings them back and
       puts them away again (studio.css, html.vary-open); out of "Expand" they are always shown. Only in a work that has
       such sliders, added to the toolbar the first time "Expand" opens (the sliders are built by the tools after this) */
    var vt = button('varyToggle', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>', 'varyToggle');
    vt.classList.add('vary-toggle'); vt.setAttribute('aria-expanded', 'false');
    vt.addEventListener('click', function () {
      var open = document.documentElement.classList.toggle('vary-open');
      vt.setAttribute('aria-expanded', String(open));
    });
    vt.setAttribute('aria-label', S.T.varyToggle); vt.title = S.T.varyToggle; vt.querySelector('span').textContent = S.T.varyToggle;

    /* "Start over" (or "Clear"), in the toolbar too, at its far end after a divider (Hagit, 21 October 2026: in "More"
       it could not be found, and "Expand" had none): the same action as "More"'s, the same question first, so "Cancel"
       keeps everything; a work of the store is never cleared, a new one begins (js/core.js startNew). It takes "More"'s
       place there */
    if (S.clear) {
      var g2 = document.createElement('i'); g2.className = 'gap gap-rs'; g2.setAttribute('aria-hidden', 'true'); nav.appendChild(g2);
      var rs = button('restartTool', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9.5 13.5a3 3 0 1 0 1-2.2"/><path d="M9.3 9.8l.2 1.7 1.7-.2"/></svg>', 'clear');
      rs.classList.add('restart-tool'); rs.disabled = true;
      rs.addEventListener('click', function () { $('clear').click(); });
      nav.appendChild(rs);
      $('clear').hidden = true;
    }

    /* the tools' panels: out of the work's way, in their row above the toolbar */
    var tray = document.createElement('div');
    tray.className = 'tray'; tray.id = 'tray';
    nav.parentNode.insertBefore(tray, nav);
    [].slice.call($('stage').querySelectorAll('.panel')).forEach(function (p) { tray.appendChild(p); });

    /* the floating toolbar (version 44, approved 24 October 2026; html.floatbar, set by js/core.js layout): the same toolbar, as a
       pill of icons over the workspace, in three states (version 49, approved 25 October 2026): 'min' the grip alone, a small circle
       with the tool in use and a "+" (a tap opens the tools again); 'compact' the drawing tools (brush, eraser, colour, line width,
       undo; studio.css); 'full' all of them. A tap on the grip hides the tools or brings back the state they had; the button at
       the pill's end goes between compact ("Show all tools", four squares) and full ("Fewer tools"). Compact the first time; kept
       for the visit (sessionStorage 'tools-state'). The tools' panels open as popovers beside the pill (positioned in togglePanel) */
    if (S.floatbar) {
      var fold = button('toolsFold', '<svg class="fold-less" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 12l5-5 5 5"/><path d="M7 18l5-5 5 5"/></svg><svg class="fold-more" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/></svg>', 'toolsFold');   // compact: "Show all tools" (four squares); full: "Fewer tools" (chevrons towards the grip)
      fold.classList.add('tools-fold');
      nav.insertBefore(fold, nav.firstChild);
      /* the compact state's tools: the activity's primary tools (activity.primaryTools, ARCHITECTURE.md), by default the drawing
         tools of version 48 – brush, eraser, colour, line width, undo; those the activity does not have are left out */
      var PRIMARY = ['brush', 'eraser', 'color', 'size', 'undo'];
      var mine = function (l) { return (l || []).map(function (id) { return nav.querySelector('#' + id); }).filter(Boolean); };
      var prim = mine(S.primary);
      (prim.length ? prim : mine(PRIMARY)).forEach(function (b) { b.classList.add('tools-primary'); });
      var tstate = 'compact', last = 'compact';
      try { var ks = sessionStorage.getItem('tools-state') || '', kl = sessionStorage.getItem('tools-last') || ''; if (/^(min|compact|full)$/.test(ks)) tstate = ks; if (/^(compact|full)$/.test(kl)) last = kl; } catch (e) {}
      var toolsState = function (st) {
        var root = document.documentElement, grip = $('toolsGrip');
        tstate = st; if (st !== 'min') last = st;
        root.classList.toggle('tools-min', st === 'min'); root.classList.toggle('tools-folded', st === 'compact');
        fold.setAttribute('aria-expanded', String(st === 'full'));
        fold.setAttribute('aria-label', st === 'full' ? S.T.toolsFold : S.T.toolsShow); fold.title = st === 'full' ? S.T.toolsFold : S.T.toolsShow;
        if (grip) {
          grip.setAttribute('aria-expanded', String(st !== 'min'));
          grip.setAttribute('aria-label', st === 'min' ? S.T.toolsOpen : S.T.toolsHide); grip.title = grip.getAttribute('aria-label');
          if (st === 'min') {   // the tool in use, in the small circle (a primary tool pressed; else the brush, else the first primary tool)
            var now = nav.querySelector('.tools-primary[aria-pressed=true]') || $('brush') || nav.querySelector('.tools-primary'), ic = now && now.querySelector('svg');
            grip.querySelector('.grip-now').innerHTML = ic ? ic.outerHTML : '';
          }
        }
        if (st !== 'full') closePanels();
        try { sessionStorage.setItem('tools-state', st); sessionStorage.setItem('tools-last', last); } catch (e) {}
      };
      fold.addEventListener('click', function () { toolsState(tstate === 'full' ? 'compact' : 'full'); });
      moveable(nav, function () { toolsState(tstate === 'min' ? last : 'min'); });
      toolsState(tstate);
    }

    /* a short line from the lesson, above the work (activity.prompt), in the current language; the page first (2.2, version 41):
       said once, briefly, when the Studio opens, and no line takes room from the page */
    /* activity.promptLine (2.3, its approved line, 16 October 2026): the line stays above the work in the shared workspace too */
    if (S.prompt && S.pageFirst && S.promptLine) document.documentElement.classList.add('prompt-line');
    if (S.prompt && (!S.pageFirst || S.promptLine)) { var pr = document.createElement('p'); pr.className = 'prompt'; pr.textContent = S.prompt; $('stage').parentNode.insertBefore(pr, $('stage')); }
    if (S.prompt && S.pageFirst && !S.promptLine) setTimeout(function () { toast(S.prompt, 3200); }, 600);

    /* every text in the current language; a tool's name is also its button's name (shown by its icon alone on a low
       screen held sideways) */
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = S.T[el.getAttribute('data-t')]; });
    nav.querySelectorAll('.tool:not(.tools-fold) > span[data-t]').forEach(function (sp) { sp.parentNode.setAttribute('aria-label', sp.textContent); sp.parentNode.title = sp.textContent; });   // the name also on hover: in "Expand" the toolbar shows only icons (the state button names what it will do: js above)

    /* "More": the secondary actions; there only when one of them is */
    var more = $('more'), menu = $('menu'), top = document.querySelector('.top');
    more.setAttribute('aria-label', S.T.more); more.title = S.T.more;
    function menuOpen(on) {
      menu.hidden = !on; more.setAttribute('aria-expanded', String(on));
      if (on) { onScreen(); var f = [].filter.call(menu.children, shown).filter(function (b) { return !b.disabled; })[0]; if (f) f.focus(); }
    }
    /* the menu whole on the screen: under "More", moved over as far as it needs when it is wider than the room before the
       button (an English bar with My artworks in it, "More" near its start) */
    function onScreen() {
      menu.style.transform = '';
      var r = menu.getBoundingClientRect(), m = 6, dx = Math.max(0, m - r.left) - Math.max(0, r.right - (innerWidth - m));
      if (dx) menu.style.transform = 'translateX(' + dx + 'px)';
    }
    /* the page first (2.2, version 41): "How to use?" in "More"; My artworks there too (below), the bar keeping only "Back", the
       detail, "Expand" and the main action. It opens a short help, only when asked (the author's approval of 28 October 2026, after
       the UX review): this activity's own tools, each with its icon from the toolbar and one line (S.T['help_' + its id], from its
       tool), two fingers for the page, and "Back to my artwork" */
    if (S.pageFirst) {
      var how = document.createElement('button');
      how.type = 'button'; how.className = 'menu-item menu-howto'; how.id = 'howTo'; how.textContent = S.T.howTo;
      how.addEventListener('click', help);
      menu.insertBefore(how, $('clear'));
      /* and in sight (UX review, second round, 28 October 2026; approved): a "?" beside "More", the same help; where the bar is short of
         room it leaves the bar first after the title (the step 'th', fitBar) for the end of the full toolbar ("Show all tools"), and
         "How to use?" in "More" stays */
      var hq = document.createElement('button');
      hq.type = 'button'; hq.className = 'morebtn helpq'; hq.id = 'helpBtn'; hq.setAttribute('aria-label', S.T.howTo); hq.title = S.T.howTo;
      hq.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.4"/><circle cx="12" cy="16.8" r=".6" fill="currentColor"/></svg>';
      hq.addEventListener('click', function () { closePanels(); help(); });
      top.insertBefore(hq, $('moreWrap'));
      var ht = button('helpTool', hq.innerHTML, 'howTo');
      ht.setAttribute('aria-label', S.T.howTo); ht.title = S.T.howTo; ht.querySelector('span').textContent = S.T.howTo;
      ht.addEventListener('click', function () { closePanels(); help(); });
      nav.insertBefore(ht, nav.querySelector('.gap-rs'));
    }
    more.addEventListener('click', function () { closePanels(); menuOpen(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('.menu-item')) menuOpen(false); });
    document.addEventListener('pointerdown', function (e) { if (!menu.hidden && !e.target.closest('#moreWrap')) menuOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { menuOpen(false); more.focus(); } });
    function shown(el) { return !el.hidden && getComputedStyle(el).display !== 'none'; }
    function syncMore() {   // (only a change is written: the bar is watched, a write would be seen as one)
      var none = ![].some.call(menu.children, shown);
      if ($('moreWrap').hidden !== none) $('moreWrap').hidden = none;
    }

    document.addEventListener('pointerdown', function (e) {
      if (!e.target.closest('.panel') && !panels.some(function (p) { return e.target.closest('#' + p[1]); })) closePanels(true);
    });

    $('clear').addEventListener('click', function () {
      if (!S.hasDrawing()) return;
      /* an artwork of the store is never cleared: a new one is started and this one stays (js/core.js startNew) */
      if (S.startNew) return ask('confirmNew').then(function (v) { if (v === 'new') S.startNew().catch(function () { saveState('error'); toast(S.T.saveFailed, 2600); }); });
      ask('confirmClear').then(function (v) { if (v === 'clear') S.clearAll(); });
    });
    $('save').addEventListener('click', S.save);
    if (!S.clear) $('clear').hidden = true;
    /* a hidden "More" item still answers its click: the toolbar's "Start over" goes through it */
    $('save').classList.add('main');

    /* the lesson's next step: written first, then back to the lesson (never away with the work not written) */
    if (S.next) {
      var next = document.createElement('button');
      next.className = 'btn primary main'; next.id = 'next'; next.type = 'button';
      /* its words; in "Expand" a check mark in their place (studio.css), the same name read aloud */
      next.innerHTML = '<svg class="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span></span>';
      next.querySelector('span').textContent = S.next; next.setAttribute('aria-label', S.next); next.title = S.next;
      $('save').parentNode.appendChild(next);
      /* written first, and only once it really is written: the word that it is saved, then on to the lesson's next
         screen (never away with the work not written; a failed write says so and stays here) */
      next.addEventListener('click', function () {
        if (next.disabled) return;
        next.disabled = true;
        S.flush().then(function (ok) {
          if (ok !== false && !S.dirty()) { toast(S.T.doneSaved, 1500); setTimeout(leave, 700); return; }
          next.disabled = false; saveState('error'); toast(S.T.saveFailed, 2600);
        }, function () { next.disabled = false; saveState('error'); toast(S.T.saveFailed, 2600); });
      });
      if (S.source) $('back').style.visibility = 'hidden';   // working on the source: its one way back is this button
    }

    /* My artworks, in the top bar where the lesson's screens have it: the work written first, then the gallery (its
       back returns to this screen of the lesson, which opens this Studio again on the same work) */
    if (S.works) {
      var works = document.createElement('a');
      works.className = 'works'; works.href = S.works; works.setAttribute('aria-label', S.T.works); works.title = S.T.works;
      works.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/></svg><span class="works-t"></span>';
      works.querySelector('.works-t').textContent = S.T.works;   // its name in words on a tablet or a computer (studio.css)
      top.insertBefore(works, $('moreWrap'));
      /* the same in "More", for a bar too narrow for it (t4) */
      var worksItem = document.createElement('a');
      worksItem.className = 'menu-item menu-works'; worksItem.href = S.works; worksItem.textContent = S.T.works;
      menu.appendChild(worksItem);
      [works, worksItem].forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          S.flush().then(function () { if (!S.dirty()) { allowUnload = true; location.href = S.works; } });
        });
      });
    }

    /* the lesson's paper screen (2.1), the first line in "More": quiet, there whenever it is needed; the work written
       first, as with My artworks, and never changed */
    if (S.paper) {
      var paperItem = document.createElement('a');
      paperItem.className = 'menu-item menu-paper'; paperItem.href = S.paper.href;
      paperItem.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 13l6-6"/></svg><span></span>';
      paperItem.querySelector('span').textContent = S.paper.label;
      menu.insertBefore(paperItem, menu.firstChild);
      paperItem.addEventListener('click', function (e) {
        e.preventDefault();
        S.flush().then(function () { if (!S.dirty()) { allowUnload = true; location.href = S.paper.href; } });
      });
    }

    /* "Whole page" / "Fill the screen", in "Expand" (the page fills the space there, js/core.js setView); "Whole page"
       also in the usual view while the page is zoomed (view() below) */
    var fv = document.createElement('button');
    fv.type = 'button'; fv.id = 'fitView'; fv.className = 'fitview'; fv.hidden = true;
    fv.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="1.5"/><path d="M9 9h6M9 13h6"/></svg><span></span>';
    top.insertBefore(fv, $('moreWrap'));
    fv.addEventListener('click', function () { S.setView(vw.z > 1.01 ? 'fit' : 'fill'); });

    /* "Save artwork", in "Expand" only (Hagit, 21 October 2026: saving without leaving it): the same writing as
       everywhere (the artwork of the store written in place, one record: js/core.js flush / save); the page, its zoom
       and the drawing stay as they are; "Artwork saved" only once it is written, else what went wrong */
    var fs = document.createElement('button');
    fs.type = 'button'; fs.id = 'saveNow'; fs.className = 'fsave';
    fs.setAttribute('aria-label', S.T.saveNow); fs.title = S.T.saveNow;
    fs.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h11l3 3v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M8 4v5h7V4"/><rect x="8" y="13" width="8" height="5" rx=".5"/></svg>';
    top.insertBefore(fs, fv);
    fs.addEventListener('click', function () {
      if (fs.disabled) return;
      fs.disabled = true;
      Promise.resolve(S.auto ? S.flush().then(function () { return !S.dirty(); }) : S.save()).then(function (ok) { return ok; }, function () { return false; })
        .then(function (ok) { fs.disabled = false; toast(ok ? S.T.savedNow : S.T.saveNowFailed, ok ? 1800 : 3600); });
    });

    /* the drawing space larger: "Expand" before the main action; then "Show all", in the same place, brings everything
       back */
    var ex = document.createElement('button');
    ex.type = 'button'; ex.id = 'expand'; ex.className = 'expand'; ex.setAttribute('aria-pressed', 'false');
    ex.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<g class="ex-on"><path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/></g>' +
      '<g class="ex-off"><path d="M9 4v5H4"/><path d="M15 4v5h5"/><path d="M9 20v-5H4"/><path d="M15 20v-5h5"/></g></svg><span></span>';
    top.insertBefore(ex, $('save'));
    /* on a 320 px screen (the author's choice, 28 October 2026), where the way out would otherwise lose its words (fitBar): "Expand" goes
       from the bar to the toolbar (the floating toolbar: with all its tools, "Show all tools"); in "Expand" the bar keeps "Show all" */
    var et = button('expandTool', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/></svg>', 'expand');
    et.querySelector('span').textContent = S.T.expand; et.setAttribute('aria-label', S.T.expandLong); et.title = S.T.expandLong;
    et.addEventListener('click', function () { ex.click(); });   // in the toolbar only while needed (fitBar)
    /* 2.1 (no floating toolbar, its row already full at 320 px): in "More" instead, "Make the drawing space bigger" */
    var ei = document.createElement('button');
    ei.type = 'button'; ei.className = 'menu-item menu-expand'; ei.id = 'expandItem'; ei.textContent = S.T.expandLong;
    ei.addEventListener('click', function () { ex.click(); });   // in "More" (last) only while needed (fitBar)
    var hinted = false;
    function expand(on, first) {
      document.documentElement.classList.toggle('expanded', on);
      document.documentElement.classList.remove('vary-open'); vt.setAttribute('aria-expanded', 'false');   // the sliders put away again in "Expand"
      if (on) addVaryToggle();
      ex.setAttribute('aria-pressed', String(on));
      ex.querySelector('span').textContent = on ? S.T.showAll : S.T.expand;
      ex.setAttribute('aria-label', on ? S.T.showAllLong : S.T.expandLong); ex.title = on ? S.T.showAllLong : S.T.expandLong;
      fitBar();
      if (first) return;
      if (S.layout) S.layout();   // the controls at the side or under the work, again for the new room
      /* the whole page, as large as the room allows and in its middle (contain), never cut off (Hagit on her phone,
         21 October 2026: "Fill" had cut the page's sides); "Fill the screen" stays a choice, and "Whole page" brings
         all of it back whenever it is zoomed */
      var larger = S.setView('fit');
      /* once, on a touch screen: how to reach the part of the page not seen */
      if (on && larger && !hinted && window.matchMedia && matchMedia('(pointer: coarse)').matches) { hinted = true; toast(S.T.moveHint, 2600); }
    }
    ex.addEventListener('click', function () { expand(!document.documentElement.classList.contains('expanded')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.documentElement.classList.contains('expanded') && !document.querySelector('dialog[open]') && menu.hidden) expand(false);
    });

    /* the bar on one line: what it can do without goes first, one step at a time, while it is too long */
    var fitting = 0;
    function fitBar() {
      var root = document.documentElement, was = root.classList.contains('expand-in-tools');
      function steps() {
        top.classList.remove('t1', 't2', 'th', 't3', 't4', 't5', 't6', 't7');
        syncMore();
        var all = ['t1', 't2', 'th', 't3', 't4', 't5', 't6', 't7'];   // th: the "?" (the same help stays in "More")
        for (var i = 0; i < all.length && over(); i++) { top.classList.add(all[i]); syncMore(); }
      }
      /* a 320 px screen (the author's choice, 28 October 2026): only when the way out would lose its words (t7), "Expand" goes to the
         toolbar (studio.css), and the bar is fitted again */
      root.classList.remove('expand-in-tools'); steps();
      if (top.classList.contains('t7') && window.matchMedia && matchMedia('(max-width:340px)').matches && !root.classList.contains('expanded')) { root.classList.add('expand-in-tools'); steps(); }
      root.classList.toggle('help-in-tools', top.classList.contains('th'));   // the "?" at the full toolbar's end
      /* "Expand"'s other place there only while it is needed, so no other screen has it at all (a change only when it changes) */
      var need = root.classList.contains('expand-in-tools');
      if (et) { if (need && S.floatbar) { if (!et.parentNode) nav.insertBefore(et, nav.querySelector('.gap-rs')); } else if (et.parentNode) et.parentNode.removeChild(et); }
      if (ei) { if (need && !S.floatbar) { if (!ei.parentNode) menu.appendChild(ei); } else if (ei.parentNode) ei.parentNode.removeChild(ei); }
      if (was !== root.classList.contains('expand-in-tools') && S.layout) S.layout();   // the toolbar changed: the page fitted again
    }
    function over() {
      var m = top.querySelector('.main:not([hidden])');   // the main action: two lines at most
      if (m && m.offsetParent !== null) {
        var rg = document.createRange(); rg.selectNodeContents(m);
        var tops = {}; [].forEach.call(rg.getClientRects(), function (q) { tops[Math.round(q.top)] = 1; });
        if (Object.keys(tops).length > 2) return true;
      }
      var r = top.getBoundingClientRect(), cs = getComputedStyle(top);
      var lo = r.left + parseFloat(cs.paddingLeft) - 1, hi = r.right - parseFloat(cs.paddingRight) + 1;
      return [].some.call(top.children, function (el) {
        if (el.offsetParent === null || getComputedStyle(el).position === 'absolute') return false;
        var q = el.getBoundingClientRect(); return q.width > 0 && (q.left < lo || q.right > hi);
      });
    }
    function refit() { syncMore(); if (!fitting) fitting = requestAnimationFrame(function () { fitting = 0; fitBar(); }); }
    window.addEventListener('resize', refit);
    if (window.MutationObserver) new MutationObserver(refit).observe(top, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
    function addVaryToggle(strip) {   // before "Start over"'s divider, once the work has a repeat's sliders (strip: only where the strip is, not a phone)
      if (strip && !(window.matchMedia && matchMedia('(orientation:landscape) and (min-width:640px) and (min-height:521px)').matches)) return;
      if (!vt.parentNode && document.querySelector('.app > div.chrome > .vary')) $('tools').insertBefore(vt, $('restartTool') ? $('restartTool').previousElementSibling : null);
    }
    expand(false, true);

    /* 2.1's compact toolbar (Hagit, 22 October 2026; on a landscape tablet or a computer, studio.css): the panel closed,
       a narrow strip of the essential tools (brush, colour, eraser, Repeat's switch, undo, redo, Save, "I'm done for now",
       My artworks) and the page the rest of the width; open, everything as before. Only a class: the tools, the sliders and
       their settings stay as they are, hidden; the choice kept for the next visit */
    var pt = document.createElement('button');
    pt.type = 'button'; pt.id = 'panelToggle'; pt.className = 'panel-toggle';
    pt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/><path class="pt-in" d="M15 10l-2 2 2 2"/><path class="pt-out" d="M13 10l2 2-2 2"/></svg>';
    top.insertBefore(pt, top.firstChild);
    function panel(open, first) {
      document.documentElement.classList.toggle('panel-closed', !open);
      pt.setAttribute('aria-expanded', String(open));
      pt.setAttribute('aria-label', open ? S.T.panelClose : S.T.panelOpen); pt.title = open ? S.T.panelClose : S.T.panelOpen;
      if (first) return;
      if (!open) addVaryToggle(true);
      document.documentElement.classList.remove('vary-open'); vt.setAttribute('aria-expanded', 'false');
      try { localStorage.setItem('studioPanel', open ? 'open' : 'closed'); } catch (e) {}
      closePanels(true); fitBar();
      if (S.layout) S.layout();
      S.setView('fit');
    }
    var closedBefore = false;
    try { closedBefore = localStorage.getItem('studioPanel') === 'closed'; } catch (e) {}
    panel(!closedBefore, true);
    pt.addEventListener('click', function () { panel(document.documentElement.classList.contains('panel-closed')); });
    /* the strip has "Pattern settings" too (Hagit, 22 October 2026): the sliders beside it (studio.css), closed again by a
       touch anywhere else, the page or another button */
    setTimeout(function () { if (document.documentElement.classList.contains('panel-closed')) addVaryToggle(true); }, 0);   // added only when needed, as in "Expand" (an eighth button tightens the usual toolbar)
    var swTap = -Infinity;   // the last touch on the switch (none yet)
    document.addEventListener('pointerdown', function (e) {
      var r = document.documentElement;
      if (e.target.closest('.rp-switch')) swTap = performance.now();
      if (r.classList.contains('panel-closed') && r.classList.contains('vary-open') && !e.target.closest('.vary-all, #varyToggle')) { r.classList.remove('vary-open'); vt.setAttribute('aria-expanded', 'false'); }
    });
    /* Repeat switched on there by the learner (Hagit, 22 October 2026): its sliders open by themselves beside the strip,
       closed by a touch on the page as before; not when a work merely opens with Repeat on */
    if (window.MutationObserver) new MutationObserver(function (list) {
      var r = document.documentElement, sw = list[0].target;
      if (sw.getAttribute('aria-checked') !== 'true' || list[0].oldValue === 'true' || performance.now() - swTap > 4000) return;
      if (!r.classList.contains('panel-closed') || r.classList.contains('expanded')) return;
      addVaryToggle(true);
      setTimeout(function () { if (vt.parentNode && getComputedStyle(vt).display !== 'none') { r.classList.add('vary-open'); vt.setAttribute('aria-expanded', 'true'); } }, 0);
    }).observe(top, { subtree: true, attributes: true, attributeFilter: ['aria-checked'], attributeOldValue: true });

    /* keep this possibility: written first, then kept; one press, one point (a press while it is being kept is not
       another); said in the same quiet way as saving, in its own word (T.kept: the learner's choice, not the autosave) */
    if (S.keep) {
      var keep = document.createElement('button'), busy = false;   // only there when the activity asks for it
      keep.className = 'btn primary main'; keep.id = 'keep'; keep.type = 'button'; keep.textContent = S.keep;
      $('save').parentNode.appendChild(keep);
      keep.addEventListener('click', function () {
        if (busy) return;
        busy = true; keep.disabled = true; keeping = true;
        S.point('kept').then(function (p) { keeping = false; saveState(''); if (p) toast(S.T.kept); }, function () { keeping = false; saveState('error'); })
          .then(function () { busy = false; keep.disabled = false; });
      });
    }

    syncMore(); refit();
    if (S.auto) {
      $('save').hidden = true;
      /* "Back" writes what is left, then leaves; while it cannot be written ("Could not save"), the learner stays, every
         time: the next change or "Back" tries again */
      $('back').addEventListener('click', function () {
        S.flush().then(function () { if (!S.dirty()) leave(); });
      });
      document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') S.flush(true); });
      window.addEventListener('pagehide', function () { S.flush(true); });
      return;
    }

    /* leaving: never lose work by accident */
    $('back').addEventListener('click', function () {
      if (!S.dirty()) return leave();
      ask('confirmExit').then(function (v) {
        if (v === 'exit') leave();
        else if (v === 'save') Promise.resolve(S.save()).then(function (ok) { if (ok) setTimeout(leave, 450); });   // saved first, then away
      });
    });
    window.addEventListener('beforeunload', function (e) {
      if (S.dirty() && !allowUnload) { e.preventDefault(); e.returnValue = ''; }
    });
  }

  var allowUnload = false;
  function help() {
    var d = $('helpDialog');
    if (!d) {
      d = document.createElement('dialog'); d.className = 'refs help'; d.id = 'helpDialog'; d.setAttribute('aria-label', S.T.howTo);
      document.body.appendChild(d);
      d.addEventListener('click', function (e) {
        if (e.target.closest('.refs-x,.help-back')) return d.close();
        if (e.target !== d) return;
        var r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
      });
    }
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var rows = [].slice.call($('tools').querySelectorAll('.tool')).filter(function (b) { return S.T['help_' + b.id]; }).map(function (b) {
      var ic = b.querySelector('svg, .size-dot, .color-wheel, .tone-icon, .dot');
      return '<li><span class="help-ic" aria-hidden="true">' + (ic ? ic.outerHTML.replace(/ id="[^"]*"/g, '') : '') + '</span><span>' + esc(S.T['help_' + b.id]) + '</span></li>';
    });
    rows.push('<li><span class="help-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V4.5a1.5 1.5 0 013 0V12m0-4.5a1.5 1.5 0 013 0V13"/><path d="M14 10.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6h-.5a6 6 0 01-4.9-2.6L4 15a1.5 1.5 0 012.5-1.6L8 15.5"/></svg></span><span>' + esc(S.T.help_fingers) + '</span></li>');
    d.innerHTML = '<div class="refs-top"><h2 class="refs-h">' + esc(S.T.howTo) + '</h2><button type="button" class="refs-x" aria-label="' + esc(S.T.helpBack) + '" title="' + esc(S.T.helpBack) + '">✕</button></div>' +
      '<ul class="help-list">' + rows.join('') + '</ul><div class="refs-row"><button type="button" class="btn primary help-back">' + esc(S.T.helpBack) + '</button></div>';
    closePanels(); d.showModal(); d.querySelector('.help-back').focus();
  }
  function leave() { allowUnload = true; location.href = S.back(); }

  /* the floating toolbar can be moved (Hagit's request after testing version 44, 25 October 2026): a grip at the head of the pill,
     dragged with a finger or the mouse (pointer events, captured, so no line is drawn and no tool is pressed by the move), anywhere
     on the screen, over the top bar too (version 47), settling clear of the bar's buttons when let go; a tap on it (no move) hides
     or brings back the tools (onTap, version 49). Its place is the grip's, kept as fractions of the screen for each layout (the
     column of a wide screen, the row of a tall one; sessionStorage 'tools-pos' and 'tools-pos-row', for the visit), so the grip
     stays where it was left when the pill changes its state, in "Whole page" and "Fill the screen", and when the screen turns.
     Until it is moved, the stylesheet's place holds. The arrow keys move it too (16 px), Enter and Space are the tap.
     Shared: any activity with toolbar 'float' has it; 2.2 is the one for now. */
  function moveable(nav, onTap) {
    var root = document.documentElement, chrome = nav.parentNode, app = chrome.parentNode, stage = $('stage'), STEP = 16, TAP = 8;
    var grip = document.createElement('button');
    grip.type = 'button'; grip.className = 'tools-grip'; grip.id = 'toolsGrip';
    grip.innerHTML = '<svg class="grip-dots" viewBox="0 0 14 20" fill="currentColor" aria-hidden="true"><circle cx="4" cy="4" r="1.7"/><circle cx="10" cy="4" r="1.7"/><circle cx="4" cy="10" r="1.7"/><circle cx="10" cy="10" r="1.7"/><circle cx="4" cy="16" r="1.7"/><circle cx="10" cy="16" r="1.7"/></svg>' +
      '<span class="grip-now" aria-hidden="true"></span><span class="grip-plus" aria-hidden="true"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2.5v7M2.5 6h7"/></svg></span>';
    nav.insertBefore(grip, nav.firstChild);
    /* where the grip was left, for each layout: moved freely while dragged; let go where the pill would cover a button of the top bar,
       it goes to the nearest place that covers none (settle), never across the screen */
    var kept = {};
    function key() { return root.classList.contains('tools-row') ? 'tools-pos-row' : 'tools-pos'; }
    function posNow() {
      var k = key();
      if (!(k in kept)) { kept[k] = null; try { var v = JSON.parse(sessionStorage.getItem(k) || 'null'); if (v && isFinite(v.fx) && isFinite(v.fy)) kept[k] = { fx: v.fx, fy: v.fy }; } catch (e) {} }
      return kept[k];
    }
    var bar = document.querySelector('.top'), M = 4, GAP = 6;
    /* the room: the whole screen, a margin M from its edges, less the pill's own size; in the app's coordinates (the pill is placed in it) */
    function roomOf() {
      var ap = app.getBoundingClientRect(), nr = nav.getBoundingClientRect();
      return { x0: M - ap.left, y0: M - ap.top, w: Math.max(0, innerWidth - 2 * M - nr.width), h: Math.max(0, innerHeight - 2 * M - nr.height) };
    }
    /* what it may never cover when it settles: the top bar's buttons and links (and the groups that hold them), each GAP px clear */
    function essentials() {
      var ap = app.getBoundingClientRect();
      return [].slice.call(bar.children).filter(function (e) { return e.matches('button, a') || e.querySelector('button, a'); })
        .map(function (e) { return e.getBoundingClientRect(); }).filter(function (r) { return r.width > 0 && r.height > 0; })
        .map(function (r) { return { l: r.left - GAP - ap.left, t: r.top - GAP - ap.top, r: r.right + GAP - ap.left, b: r.bottom + GAP - ap.top }; });
    }
    /* the nearest place to (x, y) inside the room where the pill covers none of them: just beside or under the button it was on */
    function settle(x, y) {
      var o = roomOf(), nr = nav.getBoundingClientRect(), w = nr.width, h = nr.height, obs = essentials();
      function cl(q) { return [Math.max(o.x0, Math.min(o.x0 + o.w, q[0])), Math.max(o.y0, Math.min(o.y0 + o.h, q[1]))]; }
      function hits(q) { return obs.some(function (b) { return q[0] < b.r && q[0] + w > b.l && q[1] < b.b && q[1] + h > b.t; }); }
      var p = cl([x, y]);
      if (!hits(p)) return p;
      var best = null, bd = Infinity;
      obs.forEach(function (b) {
        [[b.l - w, p[1]], [b.r, p[1]], [p[0], b.b], [p[0], b.t - h]].forEach(function (c) {
          c = cl(c); if (hits(c)) return;
          var d = Math.hypot(c[0] - p[0], c[1] - p[1]); if (d < bd) { bd = d; best = c; }
        });
      });
      return best || cl([p[0], Math.max.apply(null, obs.map(function (b) { return b.b; }))]);   // under the bar: always free
    }
    function place(p) {
      chrome.style.setProperty('--fb-x', Math.round(p[0]) + 'px'); chrome.style.setProperty('--fb-y', Math.round(p[1]) + 'px');
      root.classList.add('tools-moved');
    }
    /* the grip's place in the pill (its head in a column, its start in a row: the right end in Hebrew) */
    function off() { var g = grip.getBoundingClientRect(), n = nav.getBoundingClientRect(); return [g.left - n.left, g.top - n.top]; }
    /* only where the learner leaves it is kept (a drag, the arrow keys, the first change of state); the states, a turn or the bar only
       show it there, kept inside the screen at the pill's size of the moment, so it never creeps (version 48) */
    function keep(p) {
      var ap = app.getBoundingClientRect(), o = off();
      var pos = { fx: Math.max(0, Math.min(1, (p[0] + o[0] + ap.left) / innerWidth)), fy: Math.max(0, Math.min(1, (p[1] + o[1] + ap.top) / innerHeight)) };
      kept[key()] = pos;
      try { sessionStorage.setItem(key(), JSON.stringify(pos)); } catch (e) {}
    }
    /* where the grip was left, on the screen as it is now (a turn, "Expand", the bar's buttons, the pill's state), settled clear of the
       bar's buttons; a layout where it was never moved: the stylesheet's place */
    /* a row wraps towards the middle of the screen (the second row above the first in the lower half), so the grip's row stays put */
    function up() { var pos = posNow(); root.classList.toggle('tools-up', root.classList.contains('tools-row') && (!pos || pos.fy > .5)); }
    function apply() {
      if (drag || !root.classList.contains('floatbar')) return;
      up();
      var pos = posNow();
      if (!pos) { root.classList.remove('tools-moved'); return; }
      var ap = app.getBoundingClientRect(), o = off(); place(settle(pos.fx * innerWidth - ap.left - o[0], pos.fy * innerHeight - ap.top - o[1]));
    }
    function head() { var nr = nav.getBoundingClientRect(), ap = app.getBoundingClientRect(); return [nr.left - ap.left, nr.top - ap.top]; }
    /* the pill changes its state (the grip's tap, the button at its end): the grip stays under the finger. Before it was ever moved
       in this layout, the place it has now is kept first, so the stylesheet's centring does not carry it away */
    function changing() { if (!posNow()) { var h = head(); place(h); keep(h); up(); } requestAnimationFrame(apply); }
    var drag = null;
    grip.addEventListener('pointerdown', function (e) {
      if (drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault(); e.stopPropagation();
      var h = head();
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, hx: h[0], hy: h[1], moved: false };
      try { grip.setPointerCapture(e.pointerId); } catch (err) {}
      closePanels();
      chrome.classList.add('dragging');
    });
    grip.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < TAP) return;   // a finger that wobbles a little is still a tap
      drag.moved = true;
      var o = roomOf(); place([Math.max(o.x0, Math.min(o.x0 + o.w, drag.hx + dx)), Math.max(o.y0, Math.min(o.y0 + o.h, drag.hy + dy))]);   // free while dragged
    });
    function dragEnd(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var moved = drag.moved; drag = null; chrome.classList.remove('dragging');
      if (moved) { var h = head(), p = settle(h[0], h[1]); place(p); keep(p); apply(); }   // apply: a full row may wrap the other way now
      else if (e.type === 'pointerup') { changing(); onTap(); }
    }
    grip.addEventListener('pointerup', dragEnd); grip.addEventListener('pointercancel', dragEnd); grip.addEventListener('lostpointercapture', dragEnd);
    grip.addEventListener('click', function (e) { if (e.detail === 0) { changing(); onTap(); } });   // Enter or Space (a pointer's tap is its pointerup)
    grip.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    /* the touch itself cancelled on the grip: a quick flick of the pill is then no fling for the browser, and the tap that follows
       it is a tap (otherwise the browser spends the first tap on stopping the fling) */
    ['touchstart', 'touchmove'].forEach(function (t) { grip.addEventListener(t, function (e) { e.preventDefault(); }, { passive: false }); });
    grip.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, -STEP], ArrowDown: [0, STEP] }[e.key];
      if (!d) return;
      e.preventDefault(); var h = head(), p = settle(h[0] + d[0], h[1] + d[1]); place(p); keep(p);
    });
    $('toolsFold').addEventListener('click', changing, true);
    /* the top bar's buttons change ("Expand", "Whole page" / "Fill the screen"): the pill keeps clear of them */
    bar.addEventListener('click', function () { requestAnimationFrame(function () { requestAnimationFrame(apply); }); });
    /* the room changes (a turn, "Expand", the bar): the pill keeps its place in it */
    /* one column or two (the author's approval, 25 October 2026): the pill is one column of icons where that leaves it room to move up
       and down (TWO px or more); where it does not (the unfolded foldable, a phone turned), two columns, so it can be parked beside
       the page and moved along it. Decided on the full pill in one column (measured with the classes off for a moment, nothing
       painted), so the states never change it; again on every turn and change of the room. A row (a tall screen) wraps instead */
    var TWO = 100;
    function cols() {
      if (!root.classList.contains('floatbar') || root.classList.contains('tools-row')) { root.classList.remove('tools-two'); return; }
      var folded = root.classList.contains('tools-folded'), min = root.classList.contains('tools-min');
      root.classList.remove('tools-two', 'tools-folded', 'tools-min');
      var st = stage.getBoundingClientRect(), h1 = nav.getBoundingClientRect().height;
      var room = Math.min(st.bottom, innerHeight) - Math.max(st.top, 0) - 8 - h1;
      if (folded) root.classList.add('tools-folded');
      if (min) root.classList.add('tools-min');
      root.classList.toggle('tools-two', room < TWO);
    }
    function relayout() { cols(); apply(); }
    if (window.ResizeObserver) new ResizeObserver(relayout).observe(stage);
    window.addEventListener('resize', function () { relayout(); requestAnimationFrame(relayout); });   // and once the core's layout has turned the screen
    relayout();
    S.toolsPlace = function () { return posNow(); };
  }

  /* keep: the panels a tool keeps open while it is used stay (a tap on the work, or elsewhere) */
  function closePanels(keep) {
    /* the floating toolbar (stage 2, 2.3's light and shadow): its popover would lie over the work while the learner paints, so it
       folds away as painting begins; the tool stays on in its mode, and a tap on it opens the controls again */
    if (keep && document.documentElement.classList.contains('floatbar')) keep = false;
    panels.forEach(function (p) {
      if (keep && p[2]) return;
      var el = $(p[0]); if (el) el.hidden = true;
      var b = $(p[1]); if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  function togglePanel(panelId, btnId) {
    var open = $(panelId).hidden;
    closePanels();
    if (open) { $(panelId).hidden = false; $(btnId).setAttribute('aria-expanded', 'true'); popover(panelId, btnId); }
  }
  /* the floating toolbar: the panel beside its button, as a popover, kept inside the workspace (the stage) */
  function popover(panelId, btnId) {
    var tray = $('tray'), b = $(btnId), pn = $(panelId), nav = $('tools');
    if (!tray || !b || !document.documentElement.classList.contains('floatbar')) return;
    var cr = nav.parentNode.getBoundingClientRect(), br = b.getBoundingClientRect();
    tray.style.top = '0px'; tray.style.left = '0px'; tray.style.right = 'auto';
    var pr = pn.getBoundingClientRect(), ph = pr.height, pw = pr.width, top = br.top - cr.top - 6;
    /* a row (a tall screen, version 49): above the pill where it fits (over the page, closed after a choice), else below it, else on
       the side with more room; at the button pressed, and always on the screen */
    if (document.documentElement.classList.contains('tools-row')) {
      var up = cr.top - 6 - ph >= 4 || (innerHeight - cr.bottom - 6 - ph < 4 && cr.top > innerHeight - cr.bottom);
      var y = Math.max(4, Math.min(innerHeight - ph - 4, up ? cr.top - 6 - ph : cr.bottom + 6));
      var x = Math.max(4, Math.min(innerWidth - pw - 4, br.left + br.width / 2 - pw / 2));
      tray.style.top = Math.round(y - cr.top) + 'px'; tray.style.left = Math.round(x - cr.left) + 'px';
      return;
    }
    top = Math.max(4 - cr.top, Math.min(innerHeight - cr.top - ph - 4, top));   // inside the screen (the pill may be over the top bar)
    tray.style.top = Math.round(top) + 'px';
    /* beside the pill, on the side with more room (the pill can be moved anywhere, Hebrew and English alike), and always on the screen */
    var toRight = cr.left + cr.width / 2 < innerWidth / 2, left = toRight ? cr.width + 6 : -(pw + 6);
    var abs = Math.max(4, Math.min(innerWidth - 4 - pw, cr.left + left));
    tray.style.left = Math.round(abs - cr.left) + 'px';
  }

  /* a question: resolves with the value of the button pressed (Esc = cancel) */
  function ask(id) {
    var d = $(id);
    return new Promise(function (resolve) {
      function done(v) { d.querySelectorAll('button').forEach(function (b) { b.onclick = null; }); d.onclose = null; if (d.open) d.close(); resolve(v); }
      d.querySelectorAll('button').forEach(function (b) { b.onclick = function () { done(b.value); }; });
      d.onclose = function () { done('cancel'); };
      d.showModal();
      var first = d.querySelector('button[value=cancel]'); if (first) first.focus();
    });
  }

  /* the artwork that saves itself: "Saved" once written; nothing while a change waits or is being written; the
     failure said plainly */
  var keeping = false;   // while a possibility is kept, its own "Kept" is the only word shown
  function saveState(st) {
    var el = $('saveState');
    if (!el || !S) return;
    if (keeping && st !== 'error') st = '';
    el.setAttribute('data-state', st);
    el.textContent = st === 'saved' ? S.T.autoSaved : st === 'error' ? S.T.saveFailed : '';
  }

  var tt;
  function toast(msg, ms) {
    var el = $('toast'); el.textContent = msg; el.classList.add('on');
    clearTimeout(tt); tt = setTimeout(function () { el.classList.remove('on'); }, ms || 1800);
  }

  /* the view changed (js/core.js): in "Expand", "Whole page" while the page is larger than its space, "Fill the screen"
     while it is whole (out of "Expand", two fingers apart and together zoom it, and back to the whole page) */
  var vw = { z: 1, cover: 1 };
  function view(v) {
    vw = v;
    var fv = $('fitView'); if (!fv || !S) return;
    var expanded = document.documentElement.classList.contains('expanded'), zoomed = v.z > 1.01;
    /* in "Expand": "Whole page" or "Fill the screen"; in the usual view only once the page is zoomed (and so may be
       moved away): "Whole page" brings all of it back, in the middle, as it was (18 October 2026) */
    var off = expanded ? !(zoomed || v.cover > 1.04) : !zoomed;
    if (fv.hidden !== off) fv.hidden = off;
    var t = zoomed ? 'whole' : 'fill';
    if (fv.querySelector('span').textContent !== S.T[t]) fv.querySelector('span').textContent = S.T[t];
    fv.setAttribute('aria-label', S.T[t + 'Long']); fv.title = S.T[t + 'Long'];
  }

  function leaveTo(href) { allowUnload = true; location.href = href; }
  /* this Studio again at another address that differs only after its # (another artwork): loaded anew */
  function reopen(href) { allowUnload = true; history.replaceState(null, '', href); location.reload(); }
  return { build: build, closePanels: closePanels, togglePanel: togglePanel, toast: toast, saveState: saveState, view: view, leaveTo: leaveTo, reopen: reopen };
})();

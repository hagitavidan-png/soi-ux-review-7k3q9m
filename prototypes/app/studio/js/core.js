/* Interactive Art Studio V2: the core.
   It knows the artwork (a list of operations), the history, how to paint it, where the pointer goes,
   the canvas size and saving. It does not know any tool: tools (js/draw.js, js/color.js, …) register
   themselves and add their buttons, panels, operations and pointer handling.
   Two layers, the same size and place: the base layer (#base, below: what the activity provides, painted by
   the tools that show it) and the learner layer (#canvas, on top: the learner's operations). The eraser
   works on the learner layer only. A tool may show the learner layer in its own way (S.present: Repeat
   shows it repeated); the operations stay the learner's own, one per action.
   Repeat as a step in the artwork's development (S.present(fn, true)): an operation { t:'repeat' } in the history.
   What comes before it (after the last clear) is the source; fn shows that source repeated; what comes after it
   is painted once, in order, over the repeated composition on the same layer, so a line after it appears once
   and an eraser after it erases only where it goes. { t:'rset' } operations after it are Repeat's own settings
   (they paint nothing). Without a { t:'repeat' } operation the learner layer is painted as it is.
   activity.source (app prototype, lesson 2.1 "back to the drawing"): only the source is worked on. Repeat and what
   came after it are set aside (tail) while the Studio is open, and put back after the source in every save and
   preview: the artwork stays whole, repeated, with the source as the learner changed it.
   Live repeat (lesson 2.1, params.repeat.live): a line drawn after Repeat entered can belong to the unit itself
   ({ u:1 } on its operation, its points in the unit's own place): it is painted with the source, in every repeat.
   Lines after Repeat without u (works made before live repeat) stay as they were: once, over the composition.
   "Start over" (activity.restart) is the operation { t:'clear' }; with Repeat in the work it carries Repeat with it,
   { t:'clear', rep: { c, size, rotation, spacing } }: the page is empty and the next line repeats at once. On an
   artwork of the store that operation begins a new artwork (startNew), never this one cleared. */
window.Studio = (function () {
  'use strict';

  var LOGICAL_W = 1000;   // the artwork's width in its own units; the height follows the activity's aspect ratio

  /* texts of the studio itself; each tool adds its own */
  var TEXT = {
    he: { back: 'חזרה לשיעור', backEnd: 'לסיום השיעור', title: 'היצירה שלי', undo: 'בטל', redo: 'בצע שוב', clear: 'נקה', save: 'שמור', cancel: 'ביטול',
          exit: 'צא', clearQ: 'לנקות את כל היצירה?', unsaved: 'יש שינויים שלא נשמרו.', saved: 'היצירה נשמרה',
          saveFailed: 'השמירה נכשלה', opened: 'העבודה השמורה נפתחה', canvas: 'משטח הציור', backGallery: 'חזרה ליצירות שלי', works: 'היצירות שלי',
          autoSaved: 'נשמר', kept: 'נשמר', doneSaved: 'היצירה נשמרה', restart: 'להתחיל מחדש', restartQ: 'לנקות את הדף ולהתחיל מחדש?', newQ: 'רוצים להתחיל ציור חדש? הציור הנוכחי יישמר בגלריה ותוכלו לחזור אליו בכל זמן.', newYes: 'ציור חדש', newNo: 'ביטול', restartCancel: 'לבטל',
          expand: 'הגדלה', expandLong: 'הגדלת אזור הציור', showAll: 'הצגת הכול', showAllLong: 'הצגת כל הכפתורים',
          more: 'עוד', whole: 'כל הדף', wholeLong: 'הצגת כל הדף', fill: 'מילוי המסך', fillLong: 'הדף ממלא את המסך',
          moveHint: 'אפשר להזיז את הדף בשתי אצבעות',
          saveNow: 'שמירת הציור', savedNow: 'הציור נשמר', saveNowFailed: 'השמירה נכשלה. הציור עדיין פתוח – נסו שוב.',
          varyToggle: 'הגדרות דפוס', panelOpen: 'הצגת כל הכלים וההגדרות', panelClose: 'סרגל כלים מצומצם',
          howTo: 'איך משתמשים?', soon: 'ההדרכה בהכנה', helpBack: 'חזרה ליצירה', help_undo: 'צעד אחורה', help_redo: 'צעד קדימה, אחרי ״בטל״', help_fingers: 'שתי אצבעות: מגדילים ומזיזים את הדף', toolsFold: 'פחות כלים', toolsShow: 'הצגת כל הכלים', toolsOpen: 'פתיחת הכלים (גוררים כדי להזיז)', toolsHide: 'הסתרת הכלים (גוררים כדי להזיז)' },
    en: { back: 'Back to the lesson', backEnd: 'To the end of the lesson', title: 'My artwork', undo: 'Undo', redo: 'Redo', clear: 'Clear', save: 'Save', cancel: 'Cancel',
          exit: 'Leave', clearQ: 'Clear the whole artwork?', unsaved: 'There are unsaved changes.', saved: 'Artwork saved',
          saveFailed: 'Could not save', opened: 'Your saved work is open', canvas: 'Drawing area', backGallery: 'Back to my artworks', works: 'My artworks',
          autoSaved: 'Saved', kept: 'Kept', doneSaved: 'Your artwork is saved', restart: 'Start over', restartQ: 'Clear the page and start over?', newQ: "Start a new drawing? Your current artwork will stay in My Artworks, so you can return to it anytime.", newYes: 'New drawing', newNo: 'Cancel', restartCancel: 'Cancel',
          expand: 'Expand', expandLong: 'Make the drawing space bigger', showAll: 'Show all', showAllLong: 'Show all the buttons',
          more: 'More', whole: 'Whole page', wholeLong: 'Show the whole page', fill: 'Fill the screen', fillLong: 'Let the page fill the screen',
          moveHint: 'Move the page with two fingers',
          saveNow: 'Save artwork', savedNow: 'Artwork saved', saveNowFailed: "Couldn't save. Your drawing is still open – try again.",
          varyToggle: 'Pattern settings', panelOpen: 'Show all tools and settings', panelClose: 'Compact toolbar',
          howTo: 'How to use?', soon: 'The guide is being prepared', helpBack: 'Back to my artwork', help_undo: 'One step back', help_redo: 'One step forward, after Undo', help_fingers: 'Two fingers: make the page bigger and move it', toolsFold: 'Fewer tools', toolsShow: 'Show all tools', toolsOpen: 'Open the tools (drag to move)', toolsHide: 'Hide the tools (drag to move)' }
  };

  var caps = {};          // registered tools: id → { strings, init(api) }
  var renderers = {};     // operation type → function (op, context)
  var basePainters = [];  // functions (context) that paint the base layer
  var presenter = null;   // function (context, paint) that shows the learner layer, or null: as it is
  var aside = null;       // a picture kept beside the page, never over it (2.2's detail, js/detail.js): { size(W, H) → its side in px or 0, place(at) }
  var ASIDE_GAP = 8;
  var asStep = false;     // the presenter shows only the source before a { t:'repeat' } operation, and only once there is one
  var watchers = [];      // the tools' functions called when the history changes (undo, redo, a new step)
  var clearers = [];      // the tools' functions that add to a { t:'clear' } what it carries (Repeat: rep)
  var liveFn = null;      // live repeat: where a new line's points go (js/repeat.js), or null
  var pending = null, raf = 0;   // live repeat: the line being drawn, shown in every repeat at the next frame
  var pointers = {};      // active tool id → { down(e), move(events), up(e) }
  var items = [];         // toolbar buttons from the activity's tools

  /* the parameters: in the address's query, or after its # (the app's way: a preview frame that drops the query keeps
     the #), or, with no activity in either, the ones the app handed over in this tab as it opened the Studio
     (sessionStorage 'studio-open', js/app.js) */
  var Q = (function () {
    var q = new URLSearchParams(location.search);
    function add(s) { new URLSearchParams(s).forEach(function (v, k) { if (!q.has(k)) q.set(k, v); }); }
    add(location.hash.replace(/^#/, ''));
    if (!q.has('activity')) { try { add(sessionStorage.getItem('studio-open') || ''); } catch (e) {} }
    return q;
  })();
  var $ = function (id) { return document.getElementById(id); };
  var app, stage, canvas, ctx, base, bctx;
  var activity, LANG, T, KEY, BACK;
  /* app prototype: ?art=<id> the artwork this is (js/artworks.js: saved there by itself, under its own id; a new id
     is a new work), ?from=<id> the artwork a new one starts from (lesson 2.1: version 2 from version 1). Without
     ?art= the Studio saves one work per activity in localStorage (KEY) when the learner saves, as before */
  var ID = /^[A-Za-z0-9-]{1,64}$/;
  var ART = ID.test(Q.get('art') || '') ? Q.get('art') : null, FROM = ID.test(Q.get('from') || '') ? Q.get('from') : null;
  var ENTRY, created = null;
  var paper = false;      // ?art= is a paper artwork: the Studio does not write into it
  var tools = [];         // the activity's tools that are available
  var doc = { w: LOGICAL_W, h: 750, ops: [], settings: {} };   // ops: { t:'clear' } or the tools' own operations;
                                                                // settings: the tools' choices for the whole work (not history)
  var redoStack = [];
  var tail = [];          // activity.source: Repeat and what came after it, set aside while the source is worked on
  var version = 0, savedVersion = 0;
  var scale = 1;          // css px per artwork unit, the whole page in view (the tools' sizes are on-screen sizes at this scale)
  /* the view: z, the page's size against the whole page in view (1: all of it, up to ZMAX); x, y: where its top left
     corner is in the stage (css px, the stage's own box); fill: the page fills the stage ("Expand"); cover: the zoom at
     which it would fill it. A view, never the artwork: the operations and their sizes do not depend on it */
  var view = { z: 1, x: 0, y: 0, fill: false, cover: 1 };
  var ZMAX = 3, MAXPX = 8e6, MAXSIDE = 4096;   // larger than the whole page: never more than this in pixels (memory)
  var SHEET = '#fffdf9';  // the paper (studio.css --sheet)
  var state = { tool: null };

  function register(id, def) { caps[id] = def; }
  function freeze(o) {
    if (o && typeof o === 'object') { Object.keys(o).forEach(function (k) { freeze(o[k]); }); Object.freeze(o); }
    return o;
  }

  /* ── where "Back to the lesson" may go: only a relative path inside this site ── */
  function safeBack(v) {
    if (typeof v !== 'string') return null;
    v = v.trim();
    if (!v || /[\u0000-\u001f\\]/.test(v)) return null;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(v)) return null;        // javascript:, http:, data: …
    if (/^\/\//.test(v)) return null;                          // //other.site
    try {
      var u = new URL(v, location.href);
      if (u.origin !== location.origin) return null;
    } catch (e) { return null; }
    return v;
  }

  /* ── the artwork ── */
  function aspect(a) {
    var m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(String(a || ''));
    return m && +m[1] > 0 && +m[2] > 0 ? +m[2] / +m[1] : 3 / 4;   // height / width; default 4:3
  }
  function visibleOps() {
    var from = 0;
    for (var i = doc.ops.length - 1; i >= 0; i--) if (doc.ops[i].t === 'clear') { from = i + 1; break; }
    return doc.ops.slice(from);
  }
  function paintOps(ops, c) {
    ops.forEach(function (op) { var r = renderers[op.t]; if (r) r(op, c); });
    c.globalCompositeOperation = 'source-over';
  }
  function paint(c) { paintOps(visibleOps(), c); }
  /* the visible operations around the (last) { t:'repeat' }: the source before it, the operations after it */
  function lastClear() {
    for (var i = doc.ops.length - 1; i >= 0; i--) if (doc.ops[i].t === 'clear') return doc.ops[i];
    return null;
  }
  /* "Start over" with Repeat in the work: the { t:'clear', rep } is Repeat's marker, with nothing before it */
  function split() {
    var ops = visibleOps(), at = -1;
    for (var i = ops.length - 1; i >= 0; i--) if (ops[i].t === 'repeat') { at = i; break; }
    if (at >= 0) return { source: ops.slice(0, at), marker: ops[at], after: ops.slice(at + 1) };
    var lc = lastClear();
    return lc && lc.rep ? { source: [], marker: lc, after: ops } : { source: ops, marker: null, after: [] };
  }
  function unitOf(op) { return op.u === 1; }
  /* the unit is the source and the lines of the unit drawn after Repeat; the rest after Repeat is painted once, over it.
     info for the presenter: the unit's operations, the line being drawn (live repeat, the screen only), the marker, and
     whether it paints the screen (not a preview) */
  function paintLearner(c) {
    if (!presenter) return paint(c);
    if (!asStep) return presenter(c, paint);
    var sp = split();
    if (!sp.marker) return paintOps(sp.source, c);
    var unit = sp.source.concat(sp.after.filter(unitOf)), over = sp.after.filter(function (op) { return !unitOf(op); });
    presenter(c, function (x) { paintOps(unit, x); }, { unit: unit, marker: sp.marker, pending: c === ctx && pending && pending.u ? pending : null, screen: c === ctx });
    paintOps(over, c);
  }
  /* live repeat: the line being drawn (null: none), shown at the next frame on the learner layer */
  function pend(op) {
    pending = op;
    if (!op) { if (raf) cancelAnimationFrame(raf); raf = 0; return; }
    if (!raf) raf = requestAnimationFrame(function () { raf = 0; wipe(ctx, canvas); paintLearner(ctx); });
  }
  function paintBase(c) {
    basePainters.forEach(function (fn) { c.save(); fn(c); c.restore(); });
  }
  function wipe(c, el) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, el.width, el.height); c.restore(); }
  function redraw() {
    wipe(bctx, base); paintBase(bctx);
    wipe(ctx, canvas); paintLearner(ctx);
  }
  /* where the controls go (html.side, studio.css): on a screen wider than tall, in a column at the side when that gives
     the work clearly more room than under it, measured both ways for this work's proportions (a 4:5 page on a
     computer: at the side; a 4:3 page on a 4:3 tablet: under it). Chosen when the Studio opens, when the screen changes
     and with "Expand"; never while a panel opens or closes */
  function layout() {
    var root = document.documentElement, was = root.classList.contains('side');
    stage.style.setProperty('--page-h', String(doc.h / doc.w));   // the stage as high as the page, upright (studio.css)
    /* upright, the picture beside the page goes under it: the stage that much higher, so the page keeps its size */
    var ar = aside && !(innerWidth >= 640 && innerWidth > innerHeight) ? aside.size(innerWidth, innerHeight) : 0;
    if (ar) stage.style.setProperty('--aside-h', (ar + ASIDE_GAP) + 'px'); else stage.style.removeProperty('--aside-h');
    /* the page first (2.2, version 41): never the side column; wider than tall, the toolbar is a column of icons at the reading
       side and the reference's controls a narrow column at the far side; taller than wide, both under the page (studio.css) */
    if (root.classList.contains('pagefirst')) {
      root.classList.remove('side');
      var wide = innerWidth > innerHeight;
      if (root.classList.contains('pf-wide') !== wide) Studio.shell.closePanels(true);
      root.classList.toggle('pf-wide', wide); root.classList.toggle('pf-tall', !wide);
      /* the floating toolbar (activity.toolbar 'float', version 44): the shared toolbar is a pill of icons over the workspace, its
         panels popovers beside it (js/shell.js, studio.css html.floatbar); on every screen since version 49 (approved 25 October
         2026): a column on a wide screen, a row on a tall one (html.tools-row), parked under the page until it is moved */
      root.classList.toggle('floatbar', activity.toolbar === 'float');
      root.classList.toggle('tools-row', !wide && activity.toolbar === 'float');
      return;
    }
    if (!(innerWidth >= 640 && innerWidth > innerHeight)) { root.classList.remove('side'); return; }
    /* the column at the side (not on a phone turned sideways, nor 2.1's projector column, nor in the other lessons' "Expand":
       studio.css keeps its own): what the page leaves when it is the whole height, 176px to 300px (an iPad held sideways: the
       page as high as the screen; 22 October 2026); in 2.1's "Expand" 176px to 240px, its column's own range, so the page
       there is never smaller than in the usual view (an iPad Pro 13: beside the column, not over it) */
    var app = stage.parentNode, compact = root.classList.contains('compact'), expanded = root.classList.contains('expanded');
    /* 2.1's compact toolbar (the panel closed, js/shell.js; 22 October 2026): a narrow strip of the essential tools, the
       page the rest of the width */
    var strip = compact && !expanded && innerHeight > 520 && root.classList.contains('panel-closed');
    if (strip) app.style.setProperty('--side', '64px');
    else if (innerHeight <= 520 || (expanded && !compact) || (compact && matchMedia('(min-width:1500px) and (orientation:landscape)').matches)) app.style.removeProperty('--side');
    else if (expanded) app.style.setProperty('--side', Math.round(Math.max(176, Math.min(240, innerWidth - (innerHeight - 4) * doc.w / doc.h - 6))) + 'px');
    else app.style.setProperty('--side', Math.round(Math.max(176, Math.min(300, innerWidth - (innerHeight - 20) * doc.w / doc.h - 17))) + 'px');
    function room(side) {
      root.classList.toggle('side', side);
      var r = stage.getBoundingClientRect(), cs = getComputedStyle(stage);
      return Math.min((r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) / doc.w, (r.height - 4) / doc.h);
    }
    var under = room(false), beside = room(true);
    root.classList.toggle('side', strip || beside > under * 1.04);   // the panel closed: always the strip at the side (a wide page on an iPad Pro 13 too)
    if (root.classList.contains('side') !== was) Studio.shell.closePanels(true);
  }

  /* the stage's room for the page: its box (W × H), and the part the whole page is fitted into (aw × ah, from pl / pt);
     centre: the page in the middle of its height (at the side, and in "Expand"), else at its top, so a panel opening
     under it never moves it under the finger */
  /* an upright phone (22 October 2026, after a review on an Android phone): the stage has all the height left (studio.css), the
     toolbar at the bottom, and the page in the middle of the stage, never cut */
  function PHONE_UP() { return document.documentElement.classList.contains('compact') && window.matchMedia && matchMedia('(max-width:600px) and (orientation:portrait)').matches; }
  function room() {
    var r = stage.getBoundingClientRect(), cs = getComputedStyle(stage), root = document.documentElement;
    var pl = parseFloat(cs.paddingLeft) || 0;
    var b = { r: r, W: r.width, H: r.height, aw: r.width - pl * 2, ah: r.height - 4, pl: pl, pt: parseFloat(cs.paddingTop) || 0,
              centre: root.classList.contains('side') || root.classList.contains('expanded') || root.classList.contains('pf-wide') || PHONE_UP() };
    /* the picture beside the page: its room taken from the side (at the end of the stage) or from under the page, whichever
       leaves the page larger; the page is fitted, placed and zoomed in what is left */
    var R = aside ? aside.size(b.W, b.H) : 0;
    b.aside = null;
    if (R) {
      var cut = R + ASIDE_GAP, side = Math.min((b.aw - cut) / doc.w, b.ah / doc.h), under = Math.min(b.aw / doc.w, (b.ah - cut) / doc.h);
      if (side >= under) { b.W -= cut; b.aw -= cut; b.aside = { side: true, R: R }; }
      else { b.H -= cut; b.ah -= cut; b.aside = { side: false, R: R }; }
      b.aside.W = r.width; b.aside.H = r.height;
    }
    return b;
  }
  /* where the page goes at zoom z: an axis it fits in stays as before (centred across, at the top or in the middle down);
     an axis it is larger than keeps x / y, as far as the page still covers the stage */
  function place(b, z, x, y) {
    var pw = Math.floor(doc.w * scale * z), ph = Math.floor(doc.h * scale * z);
    function clamp(v, lo) { return Math.min(0, Math.max(lo, v)); }
    return { pw: pw, ph: ph,
             x: pw <= b.aw ? b.pl + (b.aw - pw) / 2 : clamp(x, b.W - pw),
             y: ph <= b.ah ? (b.centre ? (b.H - ph) / 2 : b.pt) : clamp(y, b.H - ph) };
  }
  /* the zoom at which the page fills the stage: its whole room, the row of an open panel under it counted in (in "Expand"
     a panel opening covers the page's lower part, it does not shrink or move it; closed, the page fills the space again) */
  function cover(b) {
    var t = $('tray'), under = t && !document.documentElement.classList.contains('side') && t.getBoundingClientRect().top >= stage.getBoundingClientRect().bottom - 1;   // not beside the work (the light table on an upright tablet)
    var tp = $('tablePanel'), extra = under && !(tp && !tp.hidden) ? t.getBoundingClientRect().height : 0;   // the light table's controls (option A, 24 October 2026): the page fills what they leave, never under them
    return Math.min(ZMAX, Math.max(b.aw / (doc.w * scale), (b.H + extra) / (doc.h * scale)));
  }
  /* the canvas keeps the activity's proportions and fills as much of the stage as they allow; zoomed, it is larger, and
     its pixels are as many as the screen shows, up to MAXPX */
  function fit() {
    var b = room();
    scale = Math.max(0.01, Math.min(b.aw / doc.w, b.ah / doc.h));
    view.cover = cover(b);
    if (view.fill) view.z = view.cover > 1.04 ? view.cover : 1;
    var q = place(b, view.z, view.x, view.y), cw = q.pw, ch = q.ph, dpr = window.devicePixelRatio || 1;
    view.x = q.x; view.y = q.y;
    var k = dpr;   // canvas pixels per css pixel
    if (view.z > 1) {
      var most = Math.min(Math.sqrt(MAXPX / (cw * ch)), MAXSIDE / Math.max(cw, ch));
      k = Math.min(dpr, Math.max(most, dpr / view.z));   // never fewer pixels than the whole page has
    }
    [canvas, base].forEach(function (el) {
      el.style.width = cw + 'px'; el.style.height = ch + 'px';
      el.style.left = q.x + 'px'; el.style.top = q.y + 'px';
      el.width = Math.round(cw * k); el.height = Math.round(ch * k);
    });
    var u = view.z > 1 ? canvas.width / doc.w : dpr * scale;   // canvas pixels per artwork unit (the whole page: as before)
    ctx.setTransform(u, 0, 0, u, 0, 0);
    bctx.setTransform(u, 0, 0, u, 0, 0);
    redraw();
    if (aside && b.aside) aside.place({ side: b.aside.side, R: b.aside.R, W: b.aside.W, H: b.aside.H, pl: b.pl, gap: ASIDE_GAP, page: { x: q.x, y: q.y, w: cw, h: ch } });
    else if (aside) aside.place(null);
    if (Studio.shell.view) Studio.shell.view({ z: view.z, fill: view.fill, cover: view.cover });
  }
  /* "Expand" fills the stage with the page ('fill': as far as ZMAX; the part not seen is moved to with two fingers),
     "Show all" and "Whole page" show it whole again ('fit') */
  function setView(mode) {
    var b = room();
    scale = Math.max(0.01, Math.min(b.aw / doc.w, b.ah / doc.h));
    var z = cover(b);
    if (mode === 'fill' && z > 1.04) {
      view.z = z; view.fill = true;
      view.x = (b.W - Math.floor(doc.w * scale * z)) / 2; view.y = 0;   // across: its middle; down: from its top
    } else { view.z = 1; view.fill = false; }
    fit();
    return view.z > 1;
  }
  /* zoom to z around a point of the stage (ax, ay: css px in it), the page point under it staying there */
  function zoomAt(z, ax, ay) {
    z = Math.min(ZMAX, Math.max(1, z));
    var f = z / view.z;
    view.x = ax - (ax - view.x) * f; view.y = ay - (ay - view.y) * f; view.z = z < 1.01 ? 1 : z; view.fill = false;
    fit();
  }

  /* ── zoom and pan: two fingers on the work (a line just begun with the first one is taken back: it was the start of
     the gesture), a trackpad's pinch or Ctrl and the wheel; the wheel, or two fingers on a trackpad, move a page larger
     than its space. While the fingers move, the page is moved and scaled as it is (css); once they lift, it is painted
     again at its new size ── */
  var touches = {}, gesture = null, downAt = 0, from = null, went = 0, YOUNG_MS = 300, YOUNG_PX = 12, REST_MS = 600, REST_PX = 12, PINCH_PX = 8;
  /* a line just begun: a second finger now is a gesture, not a hand resting on the screen (a line that has not moved for
     a while is a resting hand too, not a beginning: 24 October 2026, Hagit's unfolded foldable) */
  function young() { var age = performance.now() - downAt; return age < YOUNG_MS || (went < YOUNG_PX && age < REST_MS); }
  /* a touch that has been still for a while: a hand holding the screen, a finger left from a pinch; it is not a finger of
     a gesture and it does not keep the other finger from drawing (24 October 2026: on a large unfolded screen the holding
     thumb often rests on the page, and after a pinch one finger often stays; every stroke then became a pinch) */
  function resting(t) { return performance.now() - t.tm > REST_MS; }   // still since its last movement
  function live() { return Object.keys(touches).filter(function (k) { return !resting(touches[k]); }); }
  function pair(k) {
    var a = touches[k[0]], c = touches[k[1]];
    return { c: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2], d: Math.max(1, Math.hypot(a[0] - c[0], a[1] - c[1])) };
  }
  function touch(e, t) {   // a touch: where it is, and when it last moved (a few px of trembling are no movement)
    var now = performance.now();
    if (!t) return { 0: e.clientX, 1: e.clientY, tm: now, mx: e.clientX, my: e.clientY };
    t[0] = e.clientX; t[1] = e.clientY;
    if (Math.abs(e.clientX - t.mx) + Math.abs(e.clientY - t.my) >= REST_PX) { t.tm = now; t.mx = e.clientX; t.my = e.clientY; }
    return t;
  }
  function cancelStroke() {
    var h = handler; activeId = null; handler = null; app.classList.remove('drawing');
    if (!h) return;
    if (h.cancel) h.cancel(); else h.up({ type: 'pointercancel', clientX: NaN, clientY: NaN });
  }
  /* a second finger on a line just begun: the gesture waits (pending) until the two fingers really move together or apart;
     a touch that lifts before that (a knuckle, a brushing finger) leaves the line as it is, drawn on (24 October 2026) */
  function startGesture(pending) {
    var k = live(), p = pair(k), b = room();
    gesture = { ids: k, c0: p.c, d0: p.d, z0: view.z, x0: view.x, y0: view.y, b: b, z: view.z, x: view.x, y: view.y, pending: !!pending };
    Studio.shell.closePanels(true);
  }
  function moveGesture() {
    var g = gesture, p = pair(g.ids), r = g.b.r;
    if (g.pending) {
      if (Math.abs(p.d - g.d0) < PINCH_PX && Math.hypot(p.c[0] - g.c0[0], p.c[1] - g.c0[1]) < PINCH_PX) return;
      g.pending = false; if (activeId !== null) cancelStroke();
    }
    var z = Math.min(ZMAX, Math.max(1, g.z0 * p.d / g.d0)), f = z / g.z0;
    var x = (p.c[0] - r.left) - (g.c0[0] - r.left - g.x0) * f, y = (p.c[1] - r.top) - (g.c0[1] - r.top - g.y0) * f;
    var q = place(g.b, z, x, y), s = q.pw / Math.floor(doc.w * scale * g.z0);
    g.z = z; g.x = q.x; g.y = q.y;
    var t = 'translate(' + (q.x - g.x0) + 'px,' + (q.y - g.y0) + 'px) scale(' + s + ')';
    [canvas, base].forEach(function (el) { el.style.transformOrigin = '0 0'; el.style.transform = t; });
  }
  function endGesture() {
    var g = gesture; gesture = null;
    [canvas, base].forEach(function (el) { el.style.transform = ''; el.style.transformOrigin = ''; });
    view.z = g.z < 1.01 ? 1 : g.z; view.x = g.x; view.y = g.y; view.fill = false;
    fit();
  }
  var wheelRaf = 0, wheelTo = null;
  function onWheel(e) {
    if (gesture || activeId !== null) return;
    var r = stage.getBoundingClientRect(), ax = e.clientX - r.left, ay = e.clientY - r.top;
    var unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? r.height : 1, dx = e.deltaX * unit, dy = e.deltaY * unit;
    if (e.ctrlKey || e.metaKey) {
      wheelTo = { z: Math.min(ZMAX, Math.max(1, (wheelTo ? wheelTo.z : view.z) * Math.exp(-dy * 0.01))), ax: ax, ay: ay };
    } else {
      if (view.z <= 1) return;   // the whole page in view: nothing to move
      if (e.shiftKey && !dx) { dx = dy; dy = 0; }
      view.x -= dx; view.y -= dy;
    }
    e.preventDefault();
    if (!wheelRaf) wheelRaf = requestAnimationFrame(function () {
      wheelRaf = 0;
      if (wheelTo) { var w = wheelTo; wheelTo = null; zoomAt(w.z, w.ax, w.ay); } else fit();
    });
  }

  /* ── history ── */
  function commit(op) { doc.ops.push(op); redoStack = []; changed(); }
  function changed() { version++; updateUi(); schedule(); }
  /* a work saved after "Start over" with Repeat begins with that { t:'clear', rep }: it is the work's start, not a step */
  function canUndo() { return doc.ops.length > (doc.ops[0] && doc.ops[0].t === 'clear' && doc.ops[0].rep ? 1 : 0); }
  function undo() { if (!canUndo()) return; redoStack.push(doc.ops.pop()); changed(); redraw(); }
  function redo() { if (!redoStack.length) return; doc.ops.push(redoStack.pop()); changed(); redraw(); }
  function clearAll() {
    var op = { t: 'clear' };
    clearers.forEach(function (fn) { var x = fn(); if (x) Object.assign(op, x); });
    commit(op); redraw();
  }
  function hasDrawing() { return visibleOps().length > 0; }
  function dirty() { return version !== savedVersion; }

  function updateUi() {
    $('undo').disabled = !canUndo();
    $('redo').disabled = !redoStack.length;
    $('clear').disabled = !hasDrawing();
    if ($('restartTool')) $('restartTool').disabled = !hasDrawing();   // "Start over" in the toolbar (js/shell.js)
    items.forEach(function (it) { if (it.update) it.update($(it.id)); });
    watchers.forEach(function (fn) { fn(); });
  }

  /* ── pointer: finger, stylus, mouse or trackpad; one stroke at a time; the active tool decides what it does ── */
  var activeId = null, activeType = null, handler = null;
  function pt(e) {
    var r = canvas.getBoundingClientRect();
    var k = scale * view.z;
    return [Math.round((e.clientX - r.left) / k * 10) / 10, Math.round((e.clientY - r.top) / k * 10) / 10];
  }
  function onDown(e) {
    /* a first finger (or pen, or mouse) while the Studio still holds one of the same kind as down: its lift never came
       (an iPad: the system colour picker, "Another colour", closed by that touch, kept it; only one line could be
       drawn after it). What was left is ended first, the line drawn so far kept, and this touch begins anew */
    if (e.isPrimary) {
      if (e.pointerType === 'touch') { if (gesture) endGesture(); touches = {}; }
      if (activeId !== null && activeType === e.pointerType) { var stale = handler; activeId = null; handler = null; app.classList.remove('drawing'); if (stale) stale.up({ type: 'pointerup' }); }
    }
    if (e.pointerType === 'touch') {
      touches[e.pointerId] = touch(e);
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      if (gesture) return e.preventDefault();            // a third finger: nothing
      var others = live().filter(function (k) { return +k !== e.pointerId; });
      if (others.length >= 2) return e.preventDefault();  // a third finger: nothing
      if (others.length === 1 && (activeId === null || young())) {
        if (activeId !== null && !young()) cancelStroke();
        startGesture(activeId !== null); e.preventDefault();   // pending while the line is young: it goes on unless the fingers pinch
        if (!gesture.pending) return;
      }
      /* the only other touch is a hand resting on the page: it draws nothing (a dot it may have begun is taken back) and
         it does not keep this finger from drawing */
      if (!gesture && activeId !== null && touches[activeId] && resting(touches[activeId])) cancelStroke();
    }
    if (activeId !== null) return;                       // a resting hand does not draw over a stroke
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    Studio.shell.closePanels(true);   // a panel its tool keeps open while it is used stays (light and shadow)
    handler = pointers[state.tool];
    if (!handler) return;
    activeId = e.pointerId; activeType = e.pointerType; downAt = performance.now(); from = [e.clientX, e.clientY]; went = 0;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    app.classList.add('drawing');
    handler.down(e);
    e.preventDefault();
  }
  function onMove(e) {
    if (touches[e.pointerId]) touch(e, touches[e.pointerId]);
    if (gesture) { if (gesture.ids.indexOf(String(e.pointerId)) >= 0) { moveGesture(); e.preventDefault(); } if (!gesture.pending) return; }
    if (e.pointerId !== activeId || !handler) return;
    if (from) went = Math.max(went, Math.abs(e.clientX - from[0]) + Math.abs(e.clientY - from[1]));
    var list = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    handler.move(list.length ? list : [e]);
    e.preventDefault();
  }
  function onUp(e) {
    var finger = !!touches[e.pointerId], ofGesture = gesture && gesture.ids.indexOf(String(e.pointerId)) >= 0;
    delete touches[e.pointerId];
    if (finger && gesture && !ofGesture) return;         // a resting hand lifted during a gesture: nothing
    if (finger && gesture) {
      if (!gesture.pending) return endGesture();         // one finger lifted: the gesture ends; the other draws nothing
      gesture = null;                                    // the fingers never pinched: no gesture; the line goes on (or ends, if this was its finger)
    }
    if (e.pointerId !== activeId) return;
    activeId = null; app.classList.remove('drawing');
    var h = handler; handler = null;
    if (h) h.up(e);
  }

  /* ── save: the operations (to reopen the work), a small preview, the activity and lesson ── */
  function preview() {
    var W = 480, k = W / doc.w, H = Math.round(doc.h * k);
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    var ink = document.createElement('canvas'); ink.width = W; ink.height = H;
    var y = ink.getContext('2d'); y.setTransform(k, 0, 0, k, 0, 0);
    var own = doc.ops;   // the whole artwork, also while only its source is worked on
    if (tail.length) doc.ops = own.concat(tail);
    try { paintLearner(y); } finally { doc.ops = own; }
    x.fillStyle = '#fffdf9'; x.fillRect(0, 0, W, H);
    x.save(); x.setTransform(k, 0, 0, k, 0, 0); paintBase(x); x.restore();
    x.drawImage(ink, 0, 0);
    return c.toDataURL('image/png');
  }
  /* what the visible operations stand on: a "Start over" that carries Repeat is kept with them */
  function startOps() { var lc = lastClear(); return lc && lc.rep ? [lc] : []; }
  function record() {
    var data = { v: 2, activity: { id: activity.id, lesson: activity.lesson }, lang: LANG, back: BACK,
                 savedAt: new Date().toISOString(), canvas: { aspect: activity.canvas.aspect, w: doc.w, h: doc.h },
                 ops: startOps().concat(visibleOps(), tail), preview: preview() };
    if (Object.keys(doc.settings).length) data.settings = doc.settings;
    return data;
  }
  /* ── an artwork of the store (?art=) saves itself: a moment after the last change (AUTO_MS, so a drawing in
     progress is not written at every line), and at once when the page is left or hidden. One write at a time, in
     order. This saves the artwork's current state; it never keeps a development point (point() does, when asked).
     Leaving or hiding the page (away): the state not written yet goes first to Artworks.stash, which survives the
     page going away, then is written as usual; once a write of the latest state ends, the stash is removed ── */
  var AUTO_MS = 1000, timer = null, chain = Promise.resolve(true);
  function autosaves() { return !!ART && !paper; }
  function schedule() {
    if (!autosaves()) return;
    clearTimeout(timer); timer = setTimeout(flush, AUTO_MS);
    Studio.shell.saveState('pending');
  }
  /* write now what is not written yet: a promise of true once it is. away: the page is being left or hidden */
  function flush(away) {
    clearTimeout(timer); timer = null;
    if (!autosaves() || !dirty()) return chain;
    var at = version, data;
    try { data = record(); } catch (e) { Studio.shell.saveState('error'); return Promise.resolve(false); }
    data.id = ART; data.activity.entry = ENTRY;
    if (created) data.createdAt = created;
    if (away) window.Artworks.stash(data);
    Studio.shell.saveState('saving');
    chain = chain.then(function () {
      return window.Artworks.put(data).then(function (w) {
        created = w.createdAt; if (at > savedVersion) savedVersion = at;
        if (at === version) window.Artworks.unstash(ART);
        Studio.shell.saveState(dirty() ? 'pending' : 'saved');
        return true;
      }, function () { Studio.shell.saveState('error'); return false; });
    });
    return chain;
  }
  /* keep the current state as a development point of the artwork (only when asked: never while drawing or saving).
     once: if a point of the same kind already has exactly this state, that point is the answer and none is added */
  function point(kind, once) {
    if (!autosaves()) return Promise.resolve(null);
    return flush().then(function () {
      if (dirty()) throw new Error('not written');   // the work on screen is not written: no point of an older state
      if (!once) return window.Artworks.addPoint(ART, kind);
      return window.Artworks.get(ART).then(function (w) {
        var now = w && JSON.stringify([w.canvas, w.ops, w.settings]);
        var same = w && (w.points || []).filter(function (p) { return p.kind === kind && JSON.stringify([p.state.canvas, p.state.ops, p.state.settings]) === now; })[0];
        return same || window.Artworks.addPoint(ART, kind);
      });
    });
  }
  /* "Start over" (or "Clear") on an artwork of the store: a new artwork, never this one cleared (18 October 2026). Clearing
     in place kept only what came after the clear, so the artwork that was there was gone at the next save: a learner who
     came back to a finished work and pressed "Start over" to draw a new one lost the first. Now this work is written as
     it is and stays, with its id, its run and every line, in My artworks; the new one is a lesson run of its own (a copy
     of this run's lesson state, so the lesson goes on from here) with a new artwork: an empty page, or the start that
     "Start over" carries (Repeat's marker), and the same settings. The Studio then opens it. Nothing is deleted */
  function startNew() {
    var A = window.Artworks, lesson = null;
    return flush().then(function () {
      if (dirty()) throw new Error('not written');
      return A.get(ART);
    }).then(function (w) {
      lesson = (w && w.lesson) || activity.works || null;
      return lesson ? A.runs(lesson) : [];
    }).then(function (runs) {
      var mine = runs.filter(function (r) { return r.artwork === ART; }).pop() || null;
      var op = { t: 'clear' }; clearers.forEach(function (fn) { var x = fn(); if (x) Object.assign(op, x); });
      var id = A.newId();
      var rec = { id: id, medium: 'digital', lesson: lesson, v: 2, activity: { id: activity.id, lesson: activity.lesson, entry: ENTRY }, lang: LANG, back: BACK,
                  canvas: { aspect: activity.canvas.aspect, w: doc.w, h: doc.h }, ops: op.rep ? [op] : [] };
      if (Object.keys(doc.settings).length) rec.settings = JSON.parse(JSON.stringify(doc.settings));
      var run = mine ? JSON.parse(JSON.stringify(mine)) : { lesson: lesson, medium: 'studio' };
      run.id = A.newId(); run.artwork = id; delete run.createdAt; delete run.updatedAt; delete run.done;
      return A.put(rec).then(function () { return lesson ? A.putRun(run) : null; }).then(function () {
        try { if (lesson) sessionStorage.setItem('run:' + lesson, run.id); } catch (e) {}   // the lesson player goes on with it (js/player.js pin)
        var q = new URLSearchParams(Q.toString()); q.set('art', id); q['delete']('from');
        try { if (sessionStorage.getItem('studio-open')) sessionStorage.setItem('studio-open', q.toString()); } catch (e) {}
        Studio.shell.reopen(location.pathname + '#' + q.toString());
        return id;
      });
    });
  }
  /* saving: true once saved (for an artwork of the store, a promise of it) */
  function save() {
    if (ART) return flush().then(function () { return !dirty(); });
    var data;
    try { data = record(); } catch (e) { Studio.shell.toast(T.saveFailed); return false; }
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      savedVersion = version;
      Studio.shell.toast(T.saved);
      return true;
    } catch (e) {
      Studio.shell.toast(T.saveFailed);
      return false;
    }
  }
  /* reopen a saved work into the document: true when there is something in it */
  function apply(data) {
    if (!data || data.v !== 2 || !data.canvas || !Array.isArray(data.ops)) return false;
    doc.w = data.canvas.w; doc.h = data.canvas.h; doc.ops = data.ops;   // the work keeps the proportions it was made in
    if (data.settings && typeof data.settings === 'object') doc.settings = data.settings;   // each tool checks its own
    return data.ops.length > 0;
  }
  function load() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) {}
    if (!raw) return false;
    try { return apply(JSON.parse(raw)); } catch (e) { return false; }
  }
  /* the artwork ?art= (or, while it is not saved yet, the one ?from= it starts from) */
  function loadArt() {
    var A = window.Artworks;
    return A.get(ART).then(function (w) {
      if (w && w.medium === 'paper') { paper = true; return null; }   // not a Studio work: nothing to open, nothing written
      if (w) { created = w.createdAt; return w; }
      return FROM ? A.get(FROM) : null;
    }).then(function (w) {
      if (!w) return false;
      try { return apply(JSON.parse(JSON.stringify(w))); } catch (e) { return false; }
    }, function () { return false; });
  }

  /* canvas.portrait (2.1): a NEW work on an upright phone: the page as tall as the room under the bar and the line
     allows, above the tools (Hagit on her phone, 21 October 2026: the 4:5 page left a band empty under the tools); never
     less upright than canvas.portrait, never more than 1.6 (a strip); in steps of .05 down (the page as wide as the screen). Measured once the Studio is laid out;
     the work keeps it from then on (apply()); a work with lines in it is never changed */
  function fitPortrait() {
    var cv = activity.canvas, ch = document.querySelector('div.chrome');
    if (!cv.portrait || doc.ops.length || !(innerHeight > innerWidth) || !ch) return;
    var w = Math.max(1, stage.getBoundingClientRect().width - 4), free = innerHeight - ch.getBoundingClientRect().bottom - 20;
    var r = Math.max(aspect(cv.portrait), Math.floor(Math.min(1.6, (w * doc.h / doc.w + free) / w) * 20) / 20);
    if (Math.abs(r - doc.h / doc.w) < .01) return;
    cv.aspect = '20:' + Math.round(r * 20); doc.h = Math.round(LOGICAL_W * r);
    layout(); fit();
  }

  /* ── start ── */
  function boot() {
    var list = window.STUDIO_ACTIVITIES || {};
    var id = Q.get('activity') || 'drawing';
    if (!list[id]) { console.warn('Studio: no activity "' + id + '", using "drawing"'); id = 'drawing'; }
    activity = Object.assign({ canvas: {} }, list[id]);
    activity.canvas = Object.assign({ aspect: '4:3' }, activity.canvas);   // an activity without a ratio gets 4:3
    /* the workspace (ARCHITECTURE.md, approved 25 October 2026): 'floating' – the page first and the floating toolbar in three
       states, lesson 2.2's (approved on the author's device, version 49) – for every activity that does not say otherwise;
       'classic' – the layouts made before it (2.1, 2.3 and the earlier prototypes: activities.js), kept until each move is approved */
    activity.workspace = activity.workspace === 'classic' ? 'classic' : 'floating';
    if (activity.workspace === 'floating') { activity.pageFirst = true; activity.toolbar = 'float'; }

    LANG = Q.get('lang') || (function () { try { return localStorage.getItem('sourcesLang'); } catch (e) { return null; } })() || 'he';
    if (!TEXT[LANG]) LANG = 'he';
    tools = (activity.tools || []).filter(function (t) {
      if (!caps[t]) console.warn('Studio: tool "' + t + '" is not available');
      return !!caps[t];
    });
    T = Object.assign({}, TEXT[LANG]);
    tools.forEach(function (t) { Object.assign(T, (caps[t].strings || {})[LANG]); });
    if (activity.title && activity.title[LANG]) T.title = activity.title[LANG];
    if (activity.restart) { T.clear = T.restart; T.clearQ = T.restartQ; T.cancel = T.restartCancel; }   // "Start over"
    document.documentElement.lang = LANG;
    document.documentElement.dir = LANG === 'he' ? 'rtl' : 'ltr';
    if (activity.compact) document.documentElement.classList.add('compact');   // the work first, the controls small (studio.css)
    if (activity.pageFirst) document.documentElement.classList.add('pagefirst');   // 2.2, version 41: the page first; wide or tall (layout below; studio.css)

    BACK = safeBack(Q.get('back')) || safeBack(activity.back) || '../../index.html';
    if (activity.backEnd) T.back = T.backEnd;   // the lesson's end screen is where "Back" goes (2.1–2.3): it says so
    if (Q.get('ctx') === 'gallery') T.back = T.backGallery;   // opened from the app's "My artworks"
    ENTRY = id;
    KEY = 'studio-v2:' + activity.lesson + ':' + activity.id;
    /* canvas.portrait (2.1, 21 October 2026): a NEW work begun on an upright screen (a phone) is on an upright page, so
       the drawing fills the phone's height instead of a band across it; a work keeps the proportions it was begun in
       (apply() below), wherever it opens later, so nothing saved changes */
    if (activity.canvas.portrait && innerHeight > innerWidth) activity.canvas.aspect = activity.canvas.portrait;
    /* canvas.landscape (2.1, Hagit, 22 October 2026): a NEW work begun on a tablet held sideways (a touch screen, not a
       phone) is on a wider page, 16:10, nearly the whole room beside the compact toolbar; a saved work keeps its own */
    else if (activity.canvas.landscape && innerWidth > innerHeight && innerHeight > 520 && window.matchMedia && matchMedia('(any-pointer: coarse)').matches) activity.canvas.aspect = activity.canvas.landscape;
    doc.w = LOGICAL_W; doc.h = Math.round(LOGICAL_W * aspect(activity.canvas.aspect));

    app = $('app'); stage = $('stage'); canvas = $('canvas'); ctx = canvas.getContext('2d');
    base = document.createElement('canvas'); base.id = 'base'; base.setAttribute('aria-hidden', 'true');
    stage.insertBefore(base, canvas); bctx = base.getContext('2d');
    canvas.setAttribute('aria-label', T.canvas);
    /* the page's touch moves are the drawing's own (touch-action: none already says so to the browser for scrolling).
       Said once more here because Chrome on a phone still turned a quick stroke lifted while the finger moved into a
       fling, and the next tap, on any button within about 300 ms, only stopped that fling: no click ("My details" or
       Undo did nothing). A touch move the page takes for itself starts no fling. The pointer events, and so drawing,
       two fingers and every tool, are unchanged */
    canvas.addEventListener('touchmove', function (e) { if (e.cancelable) e.preventDefault(); }, { passive: false });
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('lostpointercapture', onUp);   // the touch taken away without a lift: ended as one (after a lift: nothing left to end)
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    if (!window.Artworks) ART = null;
    if (ART) loadArt().then(start); else start(load());
  }
  function start(reopened) {
    if (activity.source) {   // the source only: Repeat and what follows it set aside (see above)
      for (var at = doc.ops.length - 1; at >= 0 && doc.ops[at].t !== 'repeat'; at--) {}
      if (at >= 0) { tail = doc.ops.slice(at); doc.ops = doc.ops.slice(0, at); }
    }
    /* what the tools may read about the activity; read-only */
    var info = freeze(JSON.parse(JSON.stringify({ id: activity.id, lesson: activity.lesson, tools: activity.tools || [],
      canvas: activity.canvas, params: activity.params || {}, content: activity.content || {},
      promptAfter: activity.promptAfter || null })));   // promptAfter (2.1): the lesson's line once Repeat is in the work (js/repeat.js)
    var api = {
      T: T, lang: LANG, state: state, doc: doc, $: $, stage: stage, activity: info,
      art: ART,                                         // the artwork's id (?art=), or null
      pageFirst: !!activity.pageFirst,                  // 2.2, version 41: the page first (the tools place their controls accordingly)
      floatbar: activity.toolbar === 'float',          // version 44: the toolbar floats on a wide screen (html.floatbar while it does)
      leaveTo: function (href) { return flush().then(function () { if (!dirty()) Studio.shell.leaveTo(href); }); },   // saved, then to another page of the app
      ctx: function () { return ctx; }, scale: function () { return scale; }, pt: pt,
      sheet: SHEET,                                     // the paper's colour
      commit: commit, redraw: redraw, updateUi: updateUi, paintOps: paintOps,
      restart: !!activity.restart,                      // the activity offers "Start over"
      clearWith: function (fn) { clearers.push(fn); },  // fn() → what a { t:'clear' } carries, or null
      live: function (fn) { liveFn = fn; },             // live repeat: fn(point) → null, or { map } for a new line
      liveStart: function (p) { return liveFn ? liveFn(p) : null; },
      pend: pend,                                       // live repeat: the line being drawn, shown at the next frame
      has: function (t) { return tools.indexOf(t) >= 0; },
      renderer: function (type, fn) { renderers[type] = fn; },
      base: function (fn) { basePainters.push(fn); },   // paint on the base layer (artwork units)
      present: function (fn, step) { presenter = fn; asStep = !!step; },   // show the learner layer through fn(context, paint);
                                                        // step: only the source, once a { t:'repeat' } is in the history
      split: split,                                     // { source, marker, after } around the { t:'repeat' } operation
      watch: function (fn) { watchers.push(fn); },      // fn() whenever the history changes
      changed: changed,                                 // a setting changed: unsaved, but not a step in the history
      point: point,                                     // keep the current state as a development point (?art= only)
      pointer: function (toolId, h) { pointers[toolId] = h; },
      item: function (it) { items.push(it); },
      closePanels: function (keep) { Studio.shell.closePanels(keep); },   // keep: leave the panels a tool keeps open
      togglePanel: function (panel, btn) { Studio.shell.togglePanel(panel, btn); },
      aside: function (a) { aside = a; },               // a picture beside the page (see aside above)
      refit: function () { layout(); if (view.fill) setView('fill'); else fit(); }   // the room changed: laid out again
    };
    tools.forEach(function (t) { caps[t].init(api); });
    /* the first tool on: the main tool of the first capability the activity asks for that has one */
    if (!state.tool) tools.some(function (t) { return (state.tool = caps[t].tool || null); });
    items.sort(function (a, b) { return a.order - b.order; });

    Studio.shell.build({ T: T, items: items, undo: undo, redo: redo, clearAll: clearAll, hasDrawing: hasDrawing,
                         save: save, dirty: dirty, startNew: autosaves() ? startNew : null, back: function () { return BACK; }, auto: autosaves(), flush: flush, layout: layout, setView: setView,
                         clear: activity.clear !== false || !!activity.restart, point: point,
                         keep: autosaves() && activity.keep && activity.keep.label && activity.keep.label[LANG] || null,
                         next: autosaves() && activity.next && activity.next.label && activity.next.label[LANG] || null,
                         source: !!activity.source, prompt: activity.prompt && activity.prompt[LANG] || null,
                         promptLine: !!activity.promptLine,   // the line stays above the work in the shared workspace too (2.3; ARCHITECTURE.md)
                         pageFirst: !!activity.pageFirst, floatbar: activity.toolbar === 'float',
                         /* the tools of the floating toolbar's compact state (activity.primaryTools: toolbar ids, in the toolbar's
                            order; the shell's default without them) */
                         primary: Array.isArray(activity.primaryTools) ? activity.primaryTools.filter(function (t) { return typeof t === 'string' && /^[A-Za-z][\w-]*$/.test(t); }) : null,
                         /* the lesson's paper screen (2.1): the work written first, then there; the work stays as it is */
                         paper: autosaves() && activity.paper && safeBack(activity.paper.href) ? { href: safeBack(activity.paper.href), label: activity.paper.label[LANG] || activity.paper.label.he } : null,
                         /* My artworks from the lesson's Studio screen (activity.works: the lesson; ?at=: its screen); opened
                            from My artworks itself (ctx=gallery): back there, where "Back" goes */
                         works: !autosaves() || !activity.works ? null : /^\d+$/.test(Q.get('at') || '') ? '../index.html#/gallery/' + activity.works + '/' + Q.get('at') :
                                Q.get('ctx') === 'gallery' ? BACK : null });
    tools.forEach(function (t) { if (caps[t].ready) caps[t].ready(); });
    layout();
    fit();
    updateUi();
    /* after the tools' own lines have appeared (Repeat's line under the prompt: in the next frame) */
    requestAnimationFrame(function () { requestAnimationFrame(fitPortrait); });
    if (reopened && !autosaves()) Studio.shell.toast(T.opened);   // an artwork that saves itself just opens, without a word about it
    var rt;
    /* laid out again whenever the room may have changed: a resize, and on a tablet also the browser's own bars settling
       after the Studio opened, the visible part changing, a turn, a return from the browser's back and forward cache
       (Hagit's iPad, 22 October 2026: the page was cut at its top until then); never left scrolled */
    function refit() { clearTimeout(rt); rt = setTimeout(function () { if (window.scrollX || window.scrollY) window.scrollTo(0, 0); layout(); if (view.fill) setView('fill'); else fit(); }, 80); }
    window.addEventListener('resize', refit);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', refit);
    window.addEventListener('orientationchange', refit);
    window.addEventListener('pageshow', refit);
    setTimeout(refit, 500);
    stage.addEventListener('wheel', onWheel, { passive: false });
    /* the stage also changes without a resize (Repeat's controls appearing under it): fit again */
    if (window.ResizeObserver) {
      var sw = 0, sh = 0, ft;   // its own timer: sharing the re-layout's (rt) cancelled it after a turn, and the layout stayed the other orientation's (25 October 2026)
      new ResizeObserver(function (e) {
        var b = e[0].contentRect; if (Math.round(b.width) === sw && Math.round(b.height) === sh) return;
        sw = Math.round(b.width); sh = Math.round(b.height); clearTimeout(ft); ft = setTimeout(fit, 30);
      }).observe(stage);
    }

    /* for the prototype tests only: a read-only view of the state */
    window.__studio = { doc: doc, state: state, dirty: dirty, key: KEY, art: ART, lang: LANG, activity: activity, back: BACK, tools: tools,
                        flush: flush, point: point, auto: autosaves(), split: split, scale: function () { return scale; },
                        view: function () { return { z: view.z, x: view.x, y: view.y, fill: view.fill, cover: view.cover }; } };
  }

  return { register: register, boot: boot, safeBack: safeBack, point: point };
})();

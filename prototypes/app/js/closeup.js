/* Lesson 2.2, "Up Close": "A Closer Look" (the discovery tool) and the screens drawn by it (window.PlayerKinds, js/player.js s.kind).
   Closeup.mount(el, opts): the photographs to choose from (a strip), the chosen one nearly as large as the screen, whole and
   clear: no frame and nothing darkened until the learner chooses where to look (a tap, a drag or two fingers on it; the
   author's decision of 23 October 2026: free exploration, nothing preselected). Then a square frame: one finger moves it from
   anywhere on the photograph (a tap puts it there), two fingers pinch it closer or farther and move it; the frame's detail
   beside the controls (tap it to enlarge; there too a drag and two fingers), "Far ↔ Close" (x2 to x8: the nearer, the
   smaller the frame), "Surprise me" (another photograph, by chance; never a detail), and "Save this detail": the details saved, from any of the
   photographs, wait in a compact strip of "saved inspiration" (a tap goes back to one, × removes it). At the limit (o.max) the
   button becomes "Swap a saved detail": a tap on a saved one then puts the detail now framed in its place (22 October 2026);
   a run kept with more details than the limit keeps them all, and swaps the same way. A tool to look with:
   nothing is edited or copied over a photograph, and a photograph is never part of an artwork.
   A frame is { cx, cy, z }: its centre as a fraction of the picture's width and height, and its zoom (its side is the picture's
   shorter side / z); the arithmetic is js/crop.js (the Studio's "My details", studio/js/detail.js, uses it too). A saved
   detail or area is a frame with its picture: { src (its id), img (the 960 px file), hi (the larger file it is cut from) }.
   What the lesson's run keeps (run.close): src (the photograph now looked at), frames (the last frame in each photograph),
   worlds (the saved details, up to L.closeup.worlds, from any photograph), pick (the detail chosen on screen 9 and on paper),
   areas (the details chosen to draw from, in order; the last is the current one), chosen (a photograph was chosen on screen 7),
   began (the drawing has begun: "choose another area" then comes back to it, not on to the next screen).
   Everything stays on the device. The words are in STR below (he/en); the screens' own words are in lessons/2-2-close.js. */
window.Closeup = (function () {
  'use strict';
  var I = window.I18N;

  var STR = {
    he: { cue: 'הקישו על מה שמסקרן אתכם', far: 'רחוק', close: 'קרוב', zoom: 'קרוב או רחוק', closer: 'להתקרב', farther: 'להתרחק', enlarge: 'להגדיל', backPic: 'חזרה לתמונה',
          surprise: 'הפתיעו אותי', keep: 'שמרו את הפרט שבחרתם', saved: 'השראה שמורה', savedN: 'שמרתם {n} פרטים', savedOne: 'שמרתם פרט אחד', other: 'תמונה אחרת', source: 'מקור וזכויות', empty: 'שמרו פרט מעניין, והוא יחכה לכם כאן.',
          detailN: 'פרט {n}', removeDetail: 'הסרת פרט {n}', goDetail: 'חזרה לפרט {n}', photos: 'התמונות', photo: 'התמונה: {what}',
          frame: 'מבט מקרוב. גררו כדי להזיז, או הקישו על מקום בתמונה', detail: 'הפרט בהגדלה', justSaved: 'נשמר', already: 'הפרט הזה כבר שמור. הזיזו את המסגרת או שנו את הקרבה כדי לשמור פרט אחר.', full: 'אפשר לשמור עד {n} פרטים. אפשר להסיר פרט שמור.',
          reached: 'זה המקסימום. אפשר להחליף פרט שמור בפרט אחר.', swap: 'להחליף פרט שמור', swapAsk: 'הקישו על הפרט השמור שתרצו להחליף.',
          swapN: 'להחליף את פרט {n} בפרט הזה', swapped: 'הפרט הוחלף', pick: 'הקישו על מקום בתמונה שמסקרן אתכם, או התקרבו בשתי אצבעות.',
          more: 'לגלות עוד צילומים', allPhotos: 'כל הצילומים', keptOne: 'פרט שמור', keptN: 'פרטים שמורים', go: 'להמשיך', goKept: 'להמשיך עם הפרטים השמורים',
          hasKept: '{what}, יש בו פרטים שמורים', mine: 'הפרטים שלי', backLook: 'חזרה להתבוננות', backDetail: 'חזרה לפרט', prevPhoto: 'הצילום הקודם', nextPhoto: 'הצילום הבא' },
    en: { cue: 'Tap what makes you curious', far: 'Far', close: 'Close', zoom: 'Closer or farther', closer: 'Closer', farther: 'Farther', enlarge: 'Enlarge', backPic: 'Back to the picture',
          surprise: 'Surprise me', keep: 'Save the detail you chose', saved: 'Saved inspiration', savedN: 'You saved {n} details', savedOne: 'You saved 1 detail', other: 'Another photo', source: 'Source and rights', empty: 'Save a detail that interests you, and it will wait for you here.',
          detailN: 'Detail {n}', removeDetail: 'Remove detail {n}', goDetail: 'Back to detail {n}', photos: 'Photographs', photo: 'The photograph: {what}',
          frame: 'A closer look. Drag to move it, or tap a place in the picture', detail: 'The detail, enlarged', justSaved: 'Saved', already: 'This detail is already saved. Move the frame or change the zoom to save a different one.', full: 'You can save up to {n} details. You can remove a saved one.',
          reached: "That's the most you can keep. You can swap a saved detail for another one.", swap: 'Swap a saved detail', swapAsk: 'Tap the saved detail you want to swap.',
          swapN: 'Swap detail {n} for this one', swapped: 'Detail swapped', pick: 'Tap a place in the photo that makes you curious, or zoom in with two fingers.',
          more: 'Explore more photographs', allPhotos: 'All photographs', keptOne: 'saved detail', keptN: 'saved details', go: 'Continue', goKept: 'Continue with your saved details',
          hasKept: '{what}, with saved details', mine: 'My details', backLook: 'Back to exploring', backDetail: 'Back to the detail', prevPhoto: 'Previous photograph', nextPhoto: 'Next photograph' }
  };
  function T(k, o) { var t = (STR[I.lang()] || STR.en)[k] || k; return o ? t.replace(/\{(\w+)\}/g, function (m, x) { return o[x]; }) : t; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var Crop = window.Crop, fw = Crop.fw, fh = Crop.fh, clampFrame = Crop.clamp, same = Crop.sameDetail, draw = Crop.draw, load = Crop.load;

  /* ── "A Closer Look" ──
     o: gallery (the photographs: { id, img, hi, size, alt }), entry (the one now), src(path) → url, zoom, max, frames (the last
     frame in each photograph, kept by the caller), worlds (the saved details; changed in place),
     onSource(id), onFrame(f), onWorlds(list).
     o.compact (25 October 2026, screen 4 of 8): the photograph and its tools only, no strip of photographs (the gallery is a screen of
     its own): the zoom without its words, the detail beside "Save", and the saved details as o.max fixed slots (the empty ones
     dashed); o.lookup (the photographs a saved detail may come from, the retired ones too), o.credit(entry) (its line under the
     photograph) and o.onBuild(el) (after each photograph is drawn: the caller lays it out) */
  /* the fingers on a picture (pointer events; the mouse is one finger): tap(p) with no real movement; start(p), then
     move(dx, dy) while one finger moves (fractions of the element); two fingers: pinchStart(middle) → the closeness now, then
     pinch(that × how far apart they are against at first, and how far their middle moved); done() once they all lift */
  function gestures(node, h, at) {
    var pts = {}, one = null, two = null, TAP = 6;
    function ids() { return Object.keys(pts); }
    function pair() { var k = ids(), a = pts[k[0]], b = pts[k[1]]; return { m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, d: Math.max(1, Math.hypot(a.cx - b.cx, a.cy - b.cy)) }; }
    node.addEventListener('pointerdown', function (ev) {
      if (ev.button > 0) return;
      var p = at(ev); pts[ev.pointerId] = { x: p.x, y: p.y, cx: ev.clientX, cy: ev.clientY };
      try { node.setPointerCapture(ev.pointerId); } catch (x) {}
      if (ids().length === 1) one = { x0: ev.clientX, y0: ev.clientY, p: p, last: p, moved: false };
      else if (ids().length === 2) { one = null; var q = pair(); two = { z0: h.pinchStart ? h.pinchStart(q.m) : 1, d0: q.d, m: q.m }; }
      ev.preventDefault();
    });
    node.addEventListener('pointermove', function (ev) {
      var t = pts[ev.pointerId]; if (!t) return;
      var p = at(ev); t.x = p.x; t.y = p.y; t.cx = ev.clientX; t.cy = ev.clientY;
      if (two && ids().length >= 2) { var q = pair(); if (h.pinch) h.pinch(two.z0 * q.d / two.d0, q.m.x - two.m.x, q.m.y - two.m.y); two.m = q.m; return; }
      if (!one) return;
      if (!one.moved && Math.hypot(ev.clientX - one.x0, ev.clientY - one.y0) < TAP) return;
      if (!one.moved) { one.moved = true; if (h.start) h.start(one.p); }
      if (h.move) h.move(p.x - one.last.x, p.y - one.last.y); one.last = p;
    });
    function up(ev) {
      if (!pts[ev.pointerId]) return;
      var wasOne = one && ids().length === 1, tap = wasOne && !one.moved;   // a held press that the phone cancels (Android: a long press, or the app around the page taking it) is still a tap
      delete pts[ev.pointerId];
      if (tap && h.tap) h.tap(one.p);
      if (!ids().length) { if ((one || two) && h.done && !tap) h.done(); one = null; two = null; }
      else if (ids().length === 1) { two = null; var k = ids()[0], r = pts[k]; one = { x0: r.cx, y0: r.cy, p: { x: r.x, y: r.y }, last: { x: r.x, y: r.y }, moved: true }; }
    }
    node.addEventListener('pointerup', up); node.addEventListener('pointercancel', up);
    node.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });   // no long-press menu over the photograph
  }

  function mount(el, o) {
    var zoom = o.zoom || [2, 8], max = o.max || 24, worlds = o.worlds, frames = o.frames || {}, entry = o.entry, e, f, image = null, big = null;
    var view, frame, range, live, list, keepBtn, status, say = 0, swap = false;
    function url(path) { return o.src(path); }
    function alt(en) { return I.tx(en.alt); }

    function build(start) {
      e = entry.size;
      f = start || frames[entry.id] ? clampFrame(e, start || frames[entry.id], zoom) : null;   // a photograph not looked into yet: whole, no frame
      if (f) frames[entry.id] = f;
      if (o.compact) return compact();
      var strip = o.gallery.map(function (g) {
        return '<li><button type="button" class="cu-pic" data-id="' + g.id + '" aria-pressed="' + (g.id === entry.id) + '" aria-label="' + esc(T('photo', { what: alt(g) })) + '">' +
          '<img src="' + esc(url(g.img)) + '" alt="" loading="lazy" draggable="false"></button></li>';
      }).join('');
      el.innerHTML =
        /* the photograph first and large, the zoom right under it, then the one action (the detail beside it, small: a tap
           enlarges it), the details saved, and the other photographs with "Surprise me" last (the author, 19 October 2026) */
        '<div class="cu-main' + (e[0] / e[1] < 0.9 ? ' cu-tall' : '') + '"><div class="cu-view" dir="ltr" tabindex="0" aria-label="' + esc(T('pick')) + '" style="aspect-ratio:' + e[0] + '/' + e[1] + ';width:min(100%,calc(var(--cu-h) * ' + (e[0] / e[1]).toFixed(4) + '))">' +
          '<img class="cu-img" src="' + esc(url(entry.img)) + '" alt="' + esc(T('photo', { what: alt(entry) })) + '" draggable="false">' +
          '<div class="cu-frame" tabindex="0" role="slider" aria-label="' + esc(T('frame')) + '" aria-valuemin="' + zoom[0] + '" aria-valuemax="' + zoom[1] + '"></div>' + CUE() + '</div>' +
          '<div class="cu-row cu-ctl">' +
            '<div class="cu-zoomrow"><span class="cu-end">' + esc(T('far')) + '</span>' +
              '<button type="button" class="cu-step" data-z="-1" aria-label="' + esc(T('farther')) + '">−</button>' +
              '<input class="cu-zoom" type="range" min="' + zoom[0] + '" max="' + zoom[1] + '" step="0.05" aria-label="' + esc(T('zoom')) + '">' +
              '<button type="button" class="cu-step" data-z="1" aria-label="' + esc(T('closer')) + '">+</button>' +
              '<span class="cu-end">' + esc(T('close')) + '</span></div>' +
            '<div class="cu-keeprow"><button type="button" class="cu-peek cu-enlarge" aria-label="' + esc(T('enlarge')) + '"><canvas class="cu-live" aria-hidden="true"></canvas></button>' +
              '<button type="button" class="cu-btn cu-keep"></button></div></div></div>' +
        '<section class="cu-saved" aria-label="' + esc(T('saved')) + '"><h3 class="cu-saved-h"><span class="cu-n"></span><span class="cu-status" role="status"></span></h3>' +
          '<ul class="cu-worlds"></ul><p class="cu-empty">' + esc(T('empty')) + '</p></section>' +
        '<div class="cu-more"><p class="cu-more-h"><span>' + esc(T('other')) + '</span><button type="button" class="cu-link cu-surprise">' + esc(T('surprise')) + '</button></p>' +
          '<ul class="cu-pics" aria-label="' + esc(T('photos')) + '">' + strip + '</ul></div>';
      view = el.querySelector('.cu-view'); frame = el.querySelector('.cu-frame'); range = el.querySelector('.cu-zoom');
      el.querySelector('.cu-keeprow').insertAdjacentHTML('beforebegin', '<p class="cu-pickhint">' + esc(T('pick')) + '</p>');
      live = el.querySelector('.cu-live'); list = el.querySelector('.cu-worlds'); keepBtn = el.querySelector('.cu-keep'); status = el.querySelector('.cu-status');
      image = null;
      load(url(entry.hi)).then(function (im) { image = im; paint(); });
      bind(); thumbs(); paint(); fit();
      var on = el.querySelector('.cu-pic[aria-pressed=true]');   // the strip shows the photograph now looked at
      if (on) { var s = on.parentNode.parentNode; s.scrollLeft = on.parentNode.offsetLeft - (s.clientWidth - on.offsetWidth) / 2; }
    }

    /* o.compact: the photograph (no words over it), its credit, then the tools; the caller lays them out (o.onBuild) */
    function compact() {
      el.innerHTML =
        '<div class="cv-media"><div class="cu-view" dir="ltr" tabindex="0" aria-label="' + esc(T('pick')) + '" style="aspect-ratio:' + e[0] + '/' + e[1] + '">' +
          '<img class="cu-img" src="' + esc(url(entry.img)) + '" alt="' + esc(T('photo', { what: alt(entry) })) + '" draggable="false">' +
          '<div class="cu-frame" tabindex="0" role="slider" aria-label="' + esc(T('frame')) + '" aria-valuemin="' + zoom[0] + '" aria-valuemax="' + zoom[1] + '"></div>' + CUE() + '</div>' +
          (o.credit ? '<p class="cv-credit">' + o.credit(entry) + '</p>' : '') + '</div>' +
        '<div class="cv-tools"><div class="cu-row cu-ctl">' +
          '<div class="cu-zoomrow"><button type="button" class="cu-step" data-z="-1" aria-label="' + esc(T('farther')) + '">−</button>' +
            '<input class="cu-zoom" type="range" min="' + zoom[0] + '" max="' + zoom[1] + '" step="0.05" aria-label="' + esc(T('zoom')) + '">' +
            '<button type="button" class="cu-step" data-z="1" aria-label="' + esc(T('closer')) + '">+</button></div>' +
          '<p class="cu-pickhint">' + esc(T('pick')) + '</p>' +
          '<div class="cu-keeprow"><button type="button" class="cu-peek cu-enlarge" aria-label="' + esc(T('enlarge')) + '"><canvas class="cu-live" aria-hidden="true"></canvas></button>' +
            '<button type="button" class="cu-btn cu-keep"></button></div></div>' +
          '<p class="cu-status" role="status"></p>' +
          '<div class="cv-row2"><span class="cu-n pl-sr"></span><ul class="cu-worlds cv-slots" aria-label="' + esc(T('saved')) + '"></ul><p class="cu-empty" hidden></p></div></div>';
      view = el.querySelector('.cu-view'); frame = el.querySelector('.cu-frame'); range = el.querySelector('.cu-zoom');
      live = el.querySelector('.cu-live'); list = el.querySelector('.cu-worlds'); keepBtn = el.querySelector('.cu-keep'); status = el.querySelector('.cu-status');
      image = null;
      load(url(entry.hi)).then(function (im) { image = im; paint(); });
      bind(); thumbs(); paint();
      if (o.onBuild) o.onBuild(el);
    }

    /* before the first choice only (the author's approval of 28 October 2026, after the UX review): a dashed frame in the middle
       of the photograph and one line, "Tap what makes you curious"; it goes with the first tap, drag or pinch and does not come back */
    function CUE() {
      return '<div class="cu-cue" aria-hidden="true"><span class="cu-cue-box"></span><span class="cu-cue-tag" dir="auto">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5.5a1.5 1.5 0 013 0V11m0-1.5a1.5 1.5 0 013 0V12m0-1a1.5 1.5 0 013 0v3.5a6 6 0 01-6 6h-1a6 6 0 01-5-2.7l-2.6-4a1.5 1.5 0 012.4-1.8L9 14"/></svg>' +
        esc(T('cue')) + '</span></div>';
    }
    function chosenOnce() { return Object.keys(frames).some(function (k) { return !!frames[k]; }) || (worlds && worlds.length > 0); }   // (a photograph not looked into is kept as null)
    function put(next, animate) {
      var first = !f;
      f = clampFrame(e, next, zoom); frames[entry.id] = f;
      frame.classList.toggle('cu-glide', !!animate && !first);
      paint(); if (o.onFrame) o.onFrame(f);
    }
    function paint() {
      var none = !f;
      el.classList.toggle('cu-free', none);   // the photograph whole and clear: no frame, nothing darkened; the zoom and the detail wait
      el.classList.toggle('cu-cueing', none && !chosenOnce());   // the first choice not made yet: the dashed frame and its line
      [].slice.call(el.querySelectorAll('.cu-enlarge')).forEach(function (b) { b.disabled = none; });   // the zoom never waits (23 October 2026, Hagit on her phone): before a tap, it looks into the middle
      var hint = el.querySelector('.cu-pickhint'), was = hint.hidden; hint.hidden = !none;
      if (was !== hint.hidden && view.isConnected) setTimeout(fit, 0);   // the line came or went: the photograph as large as the room allows again
      if (none) {
        var full0 = worlds.length >= max; if (!full0) swap = false;
        keepBtn.textContent = full0 ? T('swap') : T('keep'); keepBtn.classList.toggle('cu-full', full0); el.classList.toggle('cu-swapping', swap);
        if (full0) keepBtn.setAttribute('aria-pressed', String(swap)); else keepBtn.removeAttribute('aria-pressed');
        el.querySelector('.cu-n').textContent = worlds.length === 1 ? T('savedOne') : worlds.length ? T('savedN', { n: worlds.length }) : '';
        list.querySelectorAll('.cu-w').forEach(function (b) { b.classList.remove('on'); });
        var lc = live.getContext('2d'); lc.clearRect(0, 0, live.width, live.height);
        return;
      }
      var w = fw(e, f.z), h = fh(e, f.z);
      frame.style.left = ((f.cx - w / 2) * 100) + '%'; frame.style.top = ((f.cy - h / 2) * 100) + '%';
      frame.style.width = (w * 100) + '%'; frame.style.height = (h * 100) + '%';
      frame.setAttribute('aria-valuenow', f.z.toFixed(1)); frame.setAttribute('aria-valuetext', '×' + f.z.toFixed(1));
      range.value = f.z;
      if (image) { draw(live, image, f, Math.max(120, Math.min(520, Math.round(live.clientWidth || 120)))); if (big) draw(big.canvas, image, f, big.px); }   // the detail beside the controls, or under the photograph as wide as the page, at its own size
      var full = worlds.length >= max;
      if (!full) swap = false;
      keepBtn.textContent = full ? T('swap') : T('keep'); if (full) keepBtn.setAttribute('aria-pressed', String(swap)); else keepBtn.removeAttribute('aria-pressed');
      keepBtn.classList.toggle('cu-full', full); el.classList.toggle('cu-swapping', swap);
      el.querySelector('.cu-n').textContent = worlds.length === 1 ? T('savedOne') : worlds.length ? T('savedN', { n: worlds.length }) : '';
      list.querySelectorAll('.cu-w').forEach(function (b, i) { b.classList.toggle('on', same(worlds[i], Object.assign({ src: entry.id }, f))); });
    }
    function thumbs() {
      list.innerHTML = worlds.map(function (w, i) {
        return '<li><button type="button" class="cu-w" aria-label="' + esc(T(swap ? 'swapN' : 'goDetail', { n: i + 1 })) + '"><canvas aria-hidden="true"></canvas></button>' +   // nothing written on the detail
          '<button type="button" class="cu-x" aria-label="' + esc(T('removeDetail', { n: i + 1 })) + '">×</button></li>';
      }).join('') + (o.compact ? new Array(Math.max(0, max - worlds.length) + 1).join('<li class="cv-free-slot" aria-hidden="true"></li>') : '');   // compact: the room left, as empty slots
      el.querySelector('.cu-empty').hidden = o.compact || worlds.length > 0;
      list.hidden = !o.compact && !worlds.length;
      list.querySelectorAll('li:not(.cv-free-slot)').forEach(function (li, i) {
        var w = worlds[i];
        load(url(w.hi)).then(function (im) { draw(li.querySelector('canvas'), im, w, 64); });
        li.querySelector('.cu-w').addEventListener('click', function () {
          if (swap) { if (!f) return note(T('pick')); swap = false; worlds[i] = here(); changed(); thumbs(); paint(); return note(T('swapped')); }   // the detail now framed in this one's place
          if (w.src !== entry.id) { entry = (o.lookup || o.gallery).filter(function (g) { return g.id === w.src; })[0] || entry; if (o.onSource) o.onSource(entry.id); build(Crop.frameOf(w)); }
          else put(Crop.frameOf(w), true);
          if (f && o.onFrame) o.onFrame(f);
        });
        li.querySelector('.cu-x').addEventListener('click', function () { worlds.splice(i, 1); swap = false; changed(); thumbs(); paint(); status.textContent = ''; });
      });
    }
    /* the photograph a little lower when the words above it are long (22 October 2026: the approved, longer instruction), so "Save"
       is still seen without scrolling; never under 200px, never larger than the layout's own height */
    function fit() {
      if (o.compact) return;   // laid out by the caller (o.onBuild)
      var main = el.querySelector('.cu-main'), sc = el.closest('.pl-main'); if (!main || !sc || !keepBtn) return;
      main.style.removeProperty('--cu-h');
      var r = sc.getBoundingClientRect(), y = keepBtn.getBoundingClientRect().bottom - r.top + sc.scrollTop, room = sc.clientHeight - 8 - y;
      if (room < 0) main.style.setProperty('--cu-h', Math.max(200, Math.floor(view.getBoundingClientRect().height + room)) + 'px');
    }
    var fitT = 0;
    window.addEventListener('resize', function onResize() { if (!el.isConnected) return window.removeEventListener('resize', onResize); clearTimeout(fitT); fitT = setTimeout(fit, 120); });
    function changed() { if (o.onWorlds) o.onWorlds(worlds); }
    function note(t, stay) { status.textContent = t; clearTimeout(say); if (!stay) say = setTimeout(function () { status.textContent = ''; }, t === T('already') || t === T('reached', { n: max }) ? 4200 : 1800); }
    function here() { return { src: entry.id, img: entry.img, hi: entry.hi, cx: f.cx, cy: f.cy, z: f.z }; }

    function bind() {
      /* another photograph: its last frame, or the middle */
      el.querySelectorAll('.cu-pic').forEach(function (b) {
        b.addEventListener('click', function () {
          var g = o.gallery.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
          if (!g || g === entry) return;
          entry = g; if (o.onSource) o.onSource(g.id); build(); if (f && o.onFrame) o.onFrame(f);
        });
      });
      /* where to look, by the learner (23 October 2026): a tap puts the frame there; one finger (or the mouse) moving on the
         photograph moves the frame with it, from anywhere; two fingers pinch it closer (apart) or farther (together) and move
         it; Ctrl and the wheel (a trackpad's pinch) too. Before any of these there is no frame: the photograph is whole */
      function at(ev) { var r = view.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width, y: (ev.clientY - r.top) / r.height }; }
      var Z0 = 3;   // the frame's first closeness, where the learner first taps or drags
      gestures(view, {
        tap: function (p) { put({ cx: p.x, cy: p.y, z: f ? f.z : Z0 }, true); frame.focus({ preventScroll: true }); },
        start: function (p) { if (!f) put({ cx: p.x, cy: p.y, z: Z0 }); },
        move: function (dx, dy) { put({ cx: f.cx + dx, cy: f.cy + dy, z: f.z }); },
        pinchStart: function (p) { if (!f) put({ cx: p.x, cy: p.y, z: zoom[0] }); return f.z; },
        pinch: function (z, dx, dy) { put({ cx: f.cx + dx, cy: f.cy + dy, z: z }); },
        done: function () { frame.focus({ preventScroll: true }); }
      }, at);
      view.addEventListener('wheel', function (ev) {
        if (!ev.ctrlKey) return;   // a plain wheel scrolls the page
        ev.preventDefault(); var p = at(ev);
        put(f ? { cx: f.cx, cy: f.cy, z: f.z * Math.exp(-ev.deltaY / 200) } : { cx: p.x, cy: p.y, z: Z0 });
      }, { passive: false });
      view.addEventListener('keydown', function (ev) {   // the keyboard: Enter or Space looks into the middle, then the frame has the keys
        if (f || ['Enter', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '='].indexOf(ev.key) < 0 || ev.target !== view) return;
        ev.preventDefault(); put({ cx: 0.5, cy: 0.5, z: Z0 }); frame.focus({ preventScroll: true });
      });
      frame.addEventListener('keydown', function (ev) {
        var d = ev.shiftKey ? 0.08 : 0.02, m = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[ev.key];
        if (m) { ev.preventDefault(); put({ cx: f.cx + m[0], cy: f.cy + m[1], z: f.z }); }
        else if (ev.key === '+' || ev.key === '=') { ev.preventDefault(); put({ cx: f.cx, cy: f.cy, z: f.z + 0.5 }); }
        else if (ev.key === '-') { ev.preventDefault(); put({ cx: f.cx, cy: f.cy, z: f.z - 0.5 }); }
      });
      range.addEventListener('input', function () { put({ cx: f ? f.cx : 0.5, cy: f ? f.cy : 0.5, z: +range.value }); });
      el.querySelectorAll('.cu-ctl .cu-step').forEach(function (b) { b.addEventListener('click', function () { put(f ? { cx: f.cx, cy: f.cy, z: f.z + 0.75 * +b.getAttribute('data-z') } : { cx: 0.5, cy: 0.5, z: Z0 }, true); }); });
      if (el.querySelector('.cu-surprise')) el.querySelector('.cu-surprise').addEventListener('click', function () {   // another photograph by chance; where to look in it stays the learner's
        var others = o.gallery.filter(function (g) { return g !== entry; }); if (!others.length) return;
        entry = others[Math.floor(Math.random() * others.length)]; if (o.onSource) o.onSource(entry.id); build();
        if (f && o.onFrame) o.onFrame(f);
        var v = el.querySelector('.cu-view'); if (v) { v.scrollIntoView({ block: 'nearest' }); v.focus({ preventScroll: true }); }
      });
      keepBtn.addEventListener('click', function () {
        if (!f) { view.focus({ preventScroll: true }); return note(T('pick')); }
        var d = here();
        if (worlds.some(function (w) { return same(w, d); })) return note(T('already'));   // coming back, the frame stands on the detail saved before: say so, never do nothing
        if (worlds.length >= max) { swap = !swap; thumbs(); paint(); return swap ? note(T('swapAsk'), true) : (status.textContent = ''); }   // at the limit: choose the one to swap (again: never mind)
        worlds.push(d); changed(); thumbs(); paint(); note(worlds.length >= max ? T('reached', { n: max }) : T('justSaved'));
        list.scrollLeft = list.scrollWidth;
      });
      el.querySelector('.cu-enlarge').addEventListener('click', enlarge);
    }

    /* "Enlarge": the detail over the whole screen; dragging it moves the frame; "Back to the picture" */
    var opener = null;
    function onKey(ev) { if (ev.key === 'Escape' && big) { ev.stopPropagation(); close(); } }
    function close() {
      if (!big) return; document.removeEventListener('keydown', onKey, true); big.box.remove(); big = null;
      if (opener) opener.focus({ preventScroll: true });
    }
    function enlarge() {
      if (!f) return;
      opener = document.activeElement;
      var box = document.createElement('div');
      box.className = 'cu-big'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', T('detail'));
      box.innerHTML = '<div class="cu-big-stage"><canvas></canvas></div><div class="cu-big-bar">' +
        '<button type="button" class="cu-step" data-z="-1" aria-label="' + esc(T('farther')) + '">−</button>' +
        '<button type="button" class="pl-primary cu-back">' + esc(T('backPic')) + '</button>' +
        '<button type="button" class="cu-step" data-z="1" aria-label="' + esc(T('closer')) + '">+</button></div>';
      document.body.appendChild(box);
      var stage = box.querySelector('.cu-big-stage'), canvas = box.querySelector('canvas');
      var px = Math.max(160, Math.floor(Math.min(stage.clientWidth, stage.clientHeight)));
      canvas.style.width = canvas.style.height = px + 'px';
      big = { box: box, canvas: canvas, px: px };
      /* a drag moves the picture under the frame (the frame goes the other way); two fingers apart come closer, together
         farther, as on any photograph */
      function atc(ev) { var r = canvas.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width, y: (ev.clientY - r.top) / r.height }; }
      gestures(canvas, {
        move: function (dx, dy) { put({ cx: f.cx - dx * fw(e, f.z), cy: f.cy - dy * fh(e, f.z), z: f.z }); },
        pinchStart: function () { return f.z; },
        pinch: function (z, dx, dy) { put({ cx: f.cx - dx * fw(e, f.z), cy: f.cy - dy * fh(e, f.z), z: z }); }
      }, atc);
      canvas.addEventListener('wheel', function (ev) { if (!ev.ctrlKey) return; ev.preventDefault(); put({ cx: f.cx, cy: f.cy, z: f.z * Math.exp(-ev.deltaY / 200) }); }, { passive: false });
      box.querySelectorAll('.cu-step').forEach(function (b) { b.addEventListener('click', function () { put({ cx: f.cx, cy: f.cy, z: f.z + 0.75 * +b.getAttribute('data-z') }); }); });
      box.querySelector('.cu-back').addEventListener('click', close);
      document.addEventListener('keydown', onKey, true);
      if (image) draw(canvas, image, f, px);
      box.querySelector('.cu-back').focus({ preventScroll: true });
    }

    build();
    /* another photograph (the arrows of "Look closely", 24 October 2026): as a tap on one in the strip; its last frame, or whole */
    function go(g) { if (!g || g === entry) return; entry = g; if (o.onSource) o.onSource(g.id); build(); if (f && o.onFrame) o.onFrame(f); }
    return { frame: function () { return f; }, entry: function () { return entry; }, go: go, close: close };
  }

  return { mount: mount, draw: draw, load: load, clamp: clampFrame, same: same, T: T, esc: esc, STR: STR };
})();

/* ── the player's kinds (window.PlayerKinds): each is given what the player knows of the screen (js/player.js) and returns
   { html, action, extra, later, mount(root) } ── */
window.PlayerKinds = window.PlayerKinds || {};
(function () {
  'use strict';
  var C = window.Closeup, Crop = window.Crop, I = window.I18N, esc = C.esc, T = C.T;

  function opts(x) { return x.L.closeup; }
  /* a screen's number by its kind (or step): the lesson's screens may be rearranged, its code never counts them */
  function scr(x, kind) { var k = x.L.screens.findIndex(function (s) { return s.kind === kind || s.step === kind; }); return k < 0 ? 1 : k + 1; }
  /* a photograph by its id: the gallery's, or one that left it (opts.retired: a detail saved from it before is still shown) */
  function all(x) { return opts(x).gallery.concat(opts(x).retired || []); }
  function entryOf(x, id) { return all(x).filter(function (g) { return g.id === id; })[0]; }
  function inGallery(x, id) { return opts(x).gallery.some(function (g) { return g.id === id; }); }
  function src(path) { return window.Player.src(path); }
  /* the run's close-up state; before a photograph is chosen (screen 3), the lesson's first */
  function state(x) {
    var c = x.run.close = x.run.close || {};
    c.worlds = c.worlds || []; c.areas = c.areas || []; c.frames = c.frames || {};
    if (!c.src || !inGallery(x, c.src)) c.src = opts(x).gallery[0].id;
    c.img = entryOf(x, c.src).img;   // the photograph's file, for runs read by the Studio before details carried their own
    return Crop.normalize(c);
  }
  function detailOf(x, c, f) { var e = entryOf(x, f.src || c.src); return { src: e.id, img: e.img, hi: e.hi, cx: f.cx, cy: f.cy, z: f.z }; }
  function current(c) { return c.areas.length ? c.areas[c.areas.length - 1] : (c.choice && c.worlds[c.pick]) || null; }   // never a detail the learner did not choose
  function pushArea(x, c, f) { if (f && !(c.areas.length && Crop.sameDetail(c.areas[c.areas.length - 1], detailOf(x, c, f)))) c.areas.push(detailOf(x, c, f)); }
  /* the screen's title and, in the same row, its one way back (screens 4, 5 and 6 of 8: "All photographs", "Back to exploring",
     "Back to the detail"), at the far side; the arrow points back in either direction of reading */
  function headLink(root, label, go) {
    var h = root.querySelector('.pl-title'); if (!h) return;
    var row = document.createElement('div'); row.className = 'cv-hd';
    h.parentNode.insertBefore(row, h); row.appendChild(h);
    row.insertAdjacentHTML('beforeend', '<button type="button" class="cv-back"><span aria-hidden="true">' + (I.dir() === 'rtl' ? '→' : '←') + '</span>' + esc(label) + '</button>');
    row.querySelector('.cv-back').addEventListener('click', go);
  }
  /* a saved detail's count on a photograph and at the foot of the gallery: one mark, the same in both places */
  function cnt(n) { return '<span class="cv-cnt" aria-hidden="true">' + n + '</span>'; }
  function fig(inner, cls) { return '<figure class="cu-fig' + (cls ? ' ' + cls : '') + '">' + inner + '</figure>'; }
  function credit(c) { return c ? '<small class="pl-credit"><a href="' + esc(c.href) + '" target="_blank" rel="noopener noreferrer">' + esc(c.who) + ' · ' + esc(c.licence) + '</a></small>' : ''; }

  /* a detail painted large on a canvas, from the larger file */
  function paintDetail(x, canvas, d, maxPx) {
    return C.load(src(d.hi)).then(function (im) {
      var px = Math.min(canvas.parentNode.clientWidth || maxPx, maxPx); Crop.draw(canvas, im, d, px); canvas.style.width = canvas.style.height = px + 'px';
    });
  }
  /* the saved details as small pictures to choose from (screen 9 and the paper's): one is pressed */
  function pickerHtml(c, pressed) {
    return '<ul class="cu-worlds cu-pickers" aria-label="' + esc(T('saved')) + '">' + c.worlds.map(function (w, i) {
      return '<li><button type="button" class="cu-w" aria-pressed="' + (i === pressed) + '" aria-label="' + esc(T('detailN', { n: i + 1 })) + '"><canvas aria-hidden="true"></canvas><span>' + (i + 1) + '</span></button></li>';
    }).join('') + '</ul>';
  }
  function pickerMount(x, root, c, pick) {
    root.querySelectorAll('.cu-pickers .cu-w').forEach(function (b, i) {
      var w = c.worlds[i];
      C.load(src(w.hi)).then(function (im) { Crop.draw(b.querySelector('canvas'), im, w, 64); });
      b.addEventListener('click', function () {
        c.pick = i; c.choice = Object.assign({}, w); root.querySelectorAll('.cu-pickers .cu-w').forEach(function (o, j) { o.setAttribute('aria-pressed', j === i); }); x.keep(); pick(i);
      });
    });
  }

  /* 1 · the opening: a photograph enlarged at first; a button moves back to all of it and, pressed again, closer again, as often
     as the learner likes. The title is the screen's question; the one below it (shown once the photograph has been moved back
     from) is quiet */
  /* s.shrink (2.1, Morris): the screen names its own picture { hi, size, alt, from, at }, not one of a close-up gallery.
     shrink.list (2.2, 24 October 2026): several photographs of the gallery, one shown at a time (shrinkSet) */
  PlayerKinds.shrink = function (x) {
    var o = x.s.shrink || opts(x).shrink;
    if (o.list) return shrinkSet(x, o.list);
    var e = o.hi ? o : entryOf(x, o.src), r = (e.size[0] / e.size[1]).toFixed(4), he = I.lang() === 'he';
    var OUT = he ? 'להתרחק' : 'Move back', IN = he ? 'להתקרב שוב' : 'Move closer again';
    return {
      html: fig('<div class="cu-shrink cu-tap" style="aspect-ratio:' + e.size[0] + '/' + e.size[1] + ';width:min(100%,calc(var(--cu-h) * ' + r + '))"><img src="' + esc(src(e.hi)) + '" alt="' + esc(I.tx(e.alt)) + '" style="--cu-s:' + (o.from || 5) + ';--cu-at:' + (o.at || '50% 50%') + '"></div>') +
        '<p class="cu-act"><button type="button" class="cu-btn cu-moveback" aria-pressed="false">' + esc(OUT) + '</button></p>',
      mount: function (root) {
        var q = root.querySelector('.pl-q'), box = root.querySelector('.cu-shrink'), b = root.querySelector('.cu-moveback');
        if (q) { q.hidden = true; q.classList.add('cu-quiet'); }
        function toggle() {
          var whole = box.classList.toggle('cu-whole'); b.textContent = whole ? IN : OUT; b.setAttribute('aria-pressed', whole);
          if (whole && q) q.hidden = false;
        }
        b.addEventListener('click', toggle); box.addEventListener('click', toggle);
      }
    };
  };

  /* 1 (2.2, 24 October 2026; zooming in from 24 October 2026, approved) · three discoveries: three photographs, one at a time, each
     whole at first (from its larger file, o.zoom). One tap on "Move closer" (or on the photograph) comes closer by itself in three
     steps (x1.7, x2.9, then o.from, the close-up; Hagit, 24 October 2026: one tap, not three), each a short glide into the same
     point (o.at: the point stays where it is, the photograph grows around it) with a pause to notice what changed; at the
     close-up, "See it from afar again" goes back to all of it. The small pictures above show each one whole (the close-up stays a surprise),
     and one is marked once its close-up has been reached. The screen's one question only once all three have been: nothing to
     write, and "Continue" never waits. Its source and rights under it, as on the artists' cards. The larger files are fetched one
     at a time: the first at once, the others after it. Reduced motion: each step at once (app.css) */
  function shrinkSet(x, list) {
    var he = I.lang() === 'he', IN = he ? 'להתקרב' : 'Move closer', AGAIN = he ? 'לראות שוב מרחוק' : 'See it from afar again';
    var N = he ? 'תמונה {n}' : 'Photograph {n}', PICK = he ? 'שלוש תמונות' : 'Three photographs', SEEN = he ? ', התגלתה מקרוב' : ', seen up close';
    var items = list.map(function (o) { return { o: o, e: entryOf(x, o.src) }; }), at = 0, step = [], seen = [];
    function scales(i) { return [1, 1.7, 2.9, items[i].o.from || 5]; }
    var LAST = 3, run = 0;   // run: the timer of the steps under way
    var STEP = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches ? 1100 : 1450;   // a step's glide (1s, app.css) and the pause after it; reduced motion: the steps at once, a moment apart
    function name(i) { return N.replace('{n}', i + 1); }
    return {
      html: '<ul class="cu-sh-pick" role="group" aria-label="' + esc(PICK) + '">' + items.map(function (it, i) {
          return '<li><button type="button" class="cu-sh-thumb" data-i="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="' + esc(name(i)) + '">' +
            '<img src="' + esc(src(it.e.img)) + '" alt="" style="--cu-s:1"></button></li>';
        }).join('') + '</ul>' +
        fig(items.map(function (it, i) {
          var e = it.e, r = (e.size[0] / e.size[1]).toFixed(4);
          return '<div class="cu-shrink cu-tap" data-i="' + i + '"' + (i ? ' hidden' : '') + ' style="aspect-ratio:' + e.size[0] + '/' + e.size[1] + ';width:min(100%,calc(var(--cu-h) * ' + r + '))">' +
            '<img ' + (i ? 'data-src' : 'src') + '="' + esc(src(it.o.zoom || e.hi)) + '" alt="' + esc(I.tx(e.alt)) + '" decoding="async" style="--cu-s:1;--cu-at:' + (it.o.at || '50% 50%') + '"></div>';
        }).join('')) +
        '<p class="cu-act"><button type="button" class="cu-btn cu-moveback cu-closer">' + esc(IN) + '</button></p>' +
        '<details class="ar-src cu-sh-src"><summary>' + esc(T('source')) + '</summary><p></p></details>',
      mount: function (root) {
        var q = root.querySelector('.pl-q'), b = root.querySelector('.cu-closer'), boxes = root.querySelectorAll('.cu-shrink'), thumbs = root.querySelectorAll('.cu-sh-thumb');
        var srcP = root.querySelector('.cu-sh-src p');
        if (q) { q.hidden = true; q.classList.add('cu-quiet'); }
        function load(i) { var im = boxes[i] && boxes[i].querySelector('img[data-src]'); if (im) { im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); } }
        var first = boxes[0].querySelector('img');
        function rest() { for (var i = 1; i < boxes.length; i++) load(i); }
        if (first.complete) rest(); else { first.addEventListener('load', rest); first.addEventListener('error', rest); }
        function label() { b.textContent = (step[at] || 0) >= LAST ? AGAIN : IN; b.disabled = !!run; }
        function stop() { clearTimeout(run); run = 0; }
        function show(i) {
          at = i; load(i);
          boxes.forEach(function (bx, j) { bx.hidden = j !== i; });
          thumbs.forEach(function (t, j) { t.setAttribute('aria-pressed', j === i); });
          label(); srcP.innerHTML = credit(items[i].e.credit);
        }
        function set(i, k) {
          step[i] = k; boxes[i].querySelector('img').style.setProperty('--cu-s', scales(i)[k]); boxes[i].setAttribute('data-step', k);
          if (k === LAST && !seen[i]) {
            seen[i] = true; thumbs[i].classList.add('cu-sh-seen'); thumbs[i].setAttribute('aria-label', name(i) + SEEN);
            if (q && seen.filter(Boolean).length === items.length) q.hidden = false;
          }
        }
        function closer() {
          if (run) return;
          if ((step[at] || 0) >= LAST) { set(at, 0); label(); return; }   // from the close-up: all of it again
          var i = at;
          function next() {
            set(i, (step[i] || 0) + 1);
            run = step[i] < LAST ? setTimeout(function () { if (!root.isConnected) return stop(); next(); }, STEP) : 0;
            label();
          }
          next();
        }
        thumbs.forEach(function (t, i) { t.addEventListener('click', function () { stop(); show(i); }); });   // another photograph: the steps under way end where they are
        b.addEventListener('click', closer); boxes.forEach(function (bx) { bx.addEventListener('click', closer); });
        show(0);
      }
    };
  }

  /* O'Keeffe: a photograph of the flower that comes close (never her painting; the author's favourite interaction:
     "Get close like O'Keeffe" enlarges the flower until it fills the frame and its edges are cut, as in her canvas; a tap on the
     picture does the same; again, and it moves back), its credit, and the museum's page. The button is under the picture, never
     over it (the author, 19 October 2026: no button or label over a work or a photograph); the credit and the museum's link
     after it, quieter */
  function okeeffeParts(x) {
    var o = opts(x).okeeffe, he = I.lang() === 'he';   // (the credit and the museum's link: the card's "Source and rights", PlayerKinds.artists)
    var S = he ? { go: 'להתקרב כמו אוקיף', back: 'להתרחק', cap: 'צילום של פרח דטורה. זה לא הציור של אוקיף.', link: 'פתחו את היצירה באתר Crystal Bridges', alt: 'פרח דטורה לבן, מלפנים' }
              : { go: 'Get close like O\'Keeffe', back: 'Move back', cap: 'A photograph of a datura flower, not O\'Keeffe\'s painting.', link: 'Open the work on the Crystal Bridges website', alt: 'A white datura flower, face on' };
    return {
      html: fig('<div class="cu-shrink cu-datura" style="aspect-ratio:1/1;width:min(100%,var(--cu-h))"><img src="' + esc(o.img) + '.jpg" alt="' + esc(S.alt) + '" style="--cu-s:2.6">' +
        '</div><p class="cu-act cu-act-under"><button type="button" class="cu-btn cu-moveback" aria-pressed="false">' + esc(S.go) + '</button></p>' +
        '<figcaption>' + esc(S.cap) + '</figcaption>'),
      source: credit(o.credit) + '<a class="cu-museum" href="' + esc(o.href) + '" target="_blank" rel="noopener noreferrer">' + esc(S.link) + ' ↗</a>',
      mount: function (root) {
        var b = root.querySelector('.cu-moveback'), box = root.querySelector('.cu-datura');
        function toggle() { var on = box.classList.toggle('cu-zoomed'); b.setAttribute('aria-pressed', on); b.textContent = on ? S.back : S.go; }
        b.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
        box.addEventListener('click', toggle);
      }
    };
  }

  /* 3 · the artists together (the author, 17 October 2026): ONE gallery of all the works, no tabs and no screen for each artist, and
     almost no words on the screen itself: the pictures, each with the artist's name on it, and the one question that compares them.
     A tap on a work opens it large (the shared viewer, big); under the large picture, what the author approved for that artist:
     the name, the work and its credit, the background and the question; previous / next go through all the works and the words
     change with the picture. O'Keeffe is in the gallery too: in her place the viewer shows the flower photograph with her reversible
     zoom ("Get close like O'Keeffe"), her words under it. (Her painting itself is never shown.) */
  PlayerKinds.artists = function (x) {
    var A = x.L.artists, he = I.lang() === 'he', works = [];
    A.forEach(function (a) {
      if (a.special === 'okeeffe') { works.push({ a: a, special: 'okeeffe', size: [1, 1], img: opts(x).okeeffe.img, alt: { he: 'פרח דטורה לבן, מלפנים', en: 'A white datura flower, face on' }, workTitle: a.work }); return; }
      x.L.boards[a.board].forEach(function (it) { works.push({ a: a, it: it, size: it.size, img: it.img, alt: it.alt, workTitle: it.workTitle, credit: it.credit }); });
    });
    var ok = okeeffeParts(x);
    /* the card under the work (art first, 19 October 2026): one line, the artist and the work; the words; the question; then the
       credit and the museum's link under "Source and rights", there but quiet */
    function info(w) {
      var a = w.a, src = w.special ? ok.source : (w.credit ? credit(w.credit) : '');
      return '<div class="ar-info"><p class="ar-who"><b>' + esc(I.tx(a.name)) + '</b> · <bdi class="ar-work">' + esc(I.tx(w.workTitle)) + '</bdi> <span>· ' + esc(I.tx(a.way)) + '</span></p>' +
        a.text[I.lang()].map(function (t) { return '<p class="ar-bg">' + t + '</p>'; }).join('') + '<p class="ar-q">' + esc(I.tx(a.ask)) + '</p>' +
        (src ? '<details class="ar-src"><summary>' + esc(T('source')) + '</summary><p>' + src + '</p></details>' : '') + '</div>';
    }
    var items = works.map(function (w) {
      if (w.special) return { win: ok.html, alt: I.tx(w.a.name), caption: info(w), note: true };
      return { src: src(w.img), alt: I.tx(w.alt), ratio: (w.size[0] / w.size[1]).toFixed(4), caption: info(w), note: true };
    });
    return {
      html: '<ul class="ar-grid ar-one">' + works.map(function (w, i) {
        /* the artist's name (and, for the flower, "illustrative photo") under the picture, never on it (19 October 2026) */
        return '<li><button type="button" class="ar-img" data-i="' + i + '" data-artist="' + w.a.id + '" style="--r:' + (w.size[0] / w.size[1]).toFixed(4) + '" aria-label="' + esc(I.tx(w.a.name) + ': ' + I.tx(w.alt)) + '">' +
          '<img src="' + esc(src(w.img)) + '" alt=""></button><p class="ar-under" aria-hidden="true"><span class="ar-chip">' + esc(I.tx(w.a.name)) + '</span>' + (w.special ? '<span class="ar-photo">' + esc(he ? 'צילום להמחשה' : 'Illustrative photo') + '</span>' : '') + '</p></li>';
      }).join('') + '</ul><p class="ar-note">' + esc(he ? 'התמונה של הפרח היא צילום להמחשה, לא ציור מקורי של ג\'ורג\'יה אוקיף.' : 'The flower picture is an illustrative photograph, not an original painting by Georgia O\'Keeffe.') + '</p>' +
        '<p class="pl-text pl-q ar-ask">' + esc(I.tx(x.s.compareAsk)) + '</p>',
      mount: function (root) {
        root.querySelectorAll('.ar-img').forEach(function (b) {
          b.addEventListener('click', function () {
            window.Viewer.open({ list: items, at: +b.getAttribute('data-i'), from: b, big: true, onShow: function (k) { if (works[k].special) ok.mount(document.querySelector('dialog.ga-view .ga-view-win')); } });
          });
        });
      }
    };
  };

  /* 2 · "Two Ways to Get Close" (the author's approval, 23 October 2026): two artists, one work each, side by side where there is
     room and one under the other on a phone. Blossfeldt's photograph first with a guess ("What does this look like to you?") and
     "Find out what it is", then who and what; O'Keeffe's flower that comes close (the photograph, never her painting). The screen's
     one question comes only after the learner has done one of the two. Haeckel: optional, in the lesson's Inspiration */
  var PS = {
    he: { reveal: 'לגלות מה זה', answer: 'זה צמח.' },
    en: { reveal: 'Find out what it is', answer: "It's a plant." }
  };
  PlayerKinds.pair = function (x) {
    var o = opts(x).pair, b = o.blossfeldt, k = o.okeeffe, he = I.lang() === 'he', S = PS[he ? 'he' : 'en'], ok = okeeffeParts(x);
    function who(a) { return '<p class="ar-who"><b>' + esc(I.tx(a.name)) + '</b> · <bdi class="ar-work">' + esc(I.tx(a.work)) + '</bdi> <span>· ' + esc(I.tx(a.way)) + '</span></p>'; }
    function src0(html) { return '<details class="ar-src"><summary>' + esc(T('source')) + '</summary><p>' + html + '</p></details>'; }
    return {
      html: '<p class="pl-text pl-q cu-pair-q">' + esc(I.tx(x.s.question)) + '</p><ul class="cu-pair">' +
        '<li class="cu-card cu-card-b"><button type="button" class="cu-bl-img" style="--r:' + (b.size[0] / b.size[1]).toFixed(4) + '" aria-label="' + esc(I.ui('enlarge', { what: I.tx(b.alt) })) + '" disabled><img src="' + esc(src(b.img)) + '" alt="' + esc(he ? 'צילום בשחור לבן של צורה זקופה' : 'A black-and-white photograph of an upright form') + '"></button>' +
          '<p class="pl-text cu-guess">' + esc(I.tx(b.guess)) + '</p><p class="cu-act cu-act-under"><button type="button" class="cu-btn cu-reveal">' + esc(S.reveal) + '</button></p>' +
          '<div class="cu-ans" hidden><p class="cu-ans-h"><b>' + esc(S.answer) + '</b></p>' + who(b) + '<p class="ar-bg">' + esc(I.tx(b.text)) + '</p>' + src0(credit(b.credit)) + '</div></li>' +
        '<li class="cu-card cu-card-o">' + ok.html + who(k) + '<p class="ar-bg">' + esc(I.tx(k.text)) + '</p>' + src0(ok.source) + '</li></ul>',
      mount: function (root) {
        var img = root.querySelector('.cu-bl-img');
        /* the question first, before both artists, to guide the looking (Hagit, 23 October 2026; it came after both, once both were
           done, from 24 October): Blossfeldt's work, look and reveal together; O'Keeffe's work, zoom and words together */
        ok.mount(root.querySelector('.cu-card-o'));
        root.querySelector('.cu-reveal').addEventListener('click', function () {
          root.querySelector('.cu-guess').hidden = true; this.parentNode.hidden = true; root.querySelector('.cu-ans').hidden = false;
          img.disabled = false; img.querySelector('img').alt = I.tx(b.alt);
        });
        img.addEventListener('click', function () {   // once revealed, the photograph opens large
          window.Viewer.open({ src: src(b.img), alt: I.tx(b.alt), ratio: (b.size[0] / b.size[1]).toFixed(4), from: img, big: true });
        });
      }
    };
  };

  /* 2 (the arrangements before 23 October 2026) · Hidden Worlds (the author, 19 October 2026): the lesson's photographs one at a time, as large as the screen allows and whole
     (never cropped), previous / next and the count under it (nothing over the photograph), a swipe as on a phone (towards the next:
     left in English, right in Hebrew), the arrow keys; a tap opens it in the big viewer, where previous / next go on through them all */
  PlayerKinds.carousel = function (x) {
    var list = x.L.boards[x.s.board], at = 0, he = I.lang() === 'he';
    var PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>', NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
    return {
      html: '<section class="cu-car" aria-roledescription="carousel" aria-label="' + esc(I.ui('images')) + '">' +
        '<div class="cu-car-stage">' + list.map(function (it, i) {
          return '<button type="button" class="cu-car-img" data-i="' + i + '" style="--r:' + (it.size[0] / it.size[1]).toFixed(4) + '"' + (i ? ' hidden' : '') + ' aria-label="' + esc(I.ui('enlarge', { what: I.tx(it.alt) })) + '">' +
            '<img src="' + esc(src(it.img)) + '" alt="' + esc(I.tx(it.alt)) + '" draggable="false"></button>';
        }).join('') + '</div>' +
        '<div class="cu-car-nav"><button type="button" class="pl-gal-btn cu-car-prev" aria-label="' + esc(I.ui('galleryPrev')) + '">' + PREV + '</button>' +
        '<span class="cu-car-count" aria-live="polite"></span>' +
        '<button type="button" class="pl-gal-btn cu-car-next" aria-label="' + esc(I.ui('galleryNext')) + '">' + NEXT + '</button></div></section>',
      mount: function (root) {
        var box = root.querySelector('.cu-car'), imgs = box.querySelectorAll('.cu-car-img'), count = box.querySelector('.cu-car-count');
        function show(k) {
          at = (k + list.length) % list.length;
          imgs.forEach(function (b, i) { b.hidden = i !== at; });
          count.innerHTML = '<span aria-hidden="true">' + (at + 1) + '/' + list.length + '</span><span class="pl-sr">' + esc(I.ui('galleryCount', { n: at + 1, total: list.length })) + '</span>';
        }
        box.querySelector('.cu-car-prev').addEventListener('click', function () { show(at - 1); });
        box.querySelector('.cu-car-next').addEventListener('click', function () { show(at + 1); });
        box.addEventListener('keydown', function (e) {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          e.preventDefault(); show(at + (((e.key === 'ArrowRight') !== he) ? 1 : -1));
        });
        /* a swipe changes the photograph; a tap (no real movement) opens it large */
        var x0 = null, y0 = 0, moved = false;
        box.querySelector('.cu-car-stage').addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; moved = false; });
        box.querySelector('.cu-car-stage').addEventListener('pointerup', function (e) {
          if (x0 === null) return; var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { moved = true; show(at + (((dx < 0) !== he) ? 1 : -1)); }
        });
        imgs.forEach(function (b, i) {
          b.addEventListener('click', function (e) {
            if (moved) { moved = false; e.preventDefault(); return; }
            window.Viewer.open({ list: list.map(function (it) { return { src: src(it.img), alt: I.tx(it.alt), ratio: (it.size[0] / it.size[1]).toFixed(4) }; }), at: i, from: b, big: true });
          });
        });
        show(0);
      }
    };
  };

  /* 6 · the shape stays: one photograph, whole, enlarged, cropped, one under another, each as wide as the screen */
  PlayerKinds.stays = function (x) {
    var e = entryOf(x, opts(x).stays.src), he = I.lang() === 'he';
    var L3 = he ? ['שלם', 'מוגדל', 'חתוך'] : ['Whole', 'Enlarged', 'Cropped'], cap = I.tx(opts(x).stays.caption);
    var scales = [1, 1.9, 4.2];
    return {
      html: fig('<ul class="cu-stack" style="--r:' + (e.size[0] / e.size[1]).toFixed(4) + '">' + scales.map(function (sc, i) {
        return '<li><div class="cu-panel"><img src="' + esc(src(e.hi)) + '" alt="' + (i === 0 ? esc(I.tx(e.alt)) : '') + '" style="--cu-s:' + sc + '"></div><span class="cu-lab">' + esc(L3[i]) + '</span></li>';   // its name under it, not on it
      }).join('') + '</ul><figcaption>' + esc(cap) + credit(e.credit) + '</figcaption>')
    };
  };

  /* 7 · choose a photograph to look at closely (the learner's own photo: off, opts.personalPhoto). Choosing another later
     keeps what was saved */
  PlayerKinds.source = function (x) {
    var c = state(x), chosen = !!c.chosen, g = opts(x).gallery;
    var act = { label: I.ui('continue'), off: !chosen, go: function () { x.go(x.n + 1); } };
    return {
      html: '<ul class="cu-pick" role="group" aria-label="' + esc(I.tx(x.s.title)) + '">' + g.map(function (e) {
        return '<li><button type="button" class="cu-pickbtn" data-id="' + e.id + '" aria-pressed="' + (chosen && c.src === e.id) + '" style="--r:' + (e.size[0] / e.size[1]).toFixed(4) + '">' +
          '<img src="' + esc(src(e.img)) + '" alt="' + esc(I.tx(e.alt)) + '" loading="lazy"></button></li>';
      }).join('') + '</ul>',
      action: act,
      mount: function (root) {
        var go = root.querySelector('.pl-primary');
        root.querySelectorAll('.cu-pickbtn').forEach(function (b) {
          b.addEventListener('click', function () {
            c.src = b.getAttribute('data-id'); c.chosen = true;
            root.querySelectorAll('.cu-pickbtn').forEach(function (o) { o.setAttribute('aria-pressed', o === b); });
            act.off = false; go.disabled = false; x.keep();
          });
        });
      }
    };
  };

  /* 3 of 8 · "What catches your eye?" (25 October 2026): the gallery. Six photographs first (opts.first), each whole at its own
     proportions, in rows of one height (two in a row on a phone, three where there is room); "Explore more photographs" adds the
     others under them, on the same screen, and stays open in the run (and is open when a detail was saved from one of them). No
     names under the photographs (their names are for screen readers; "Source and rights" at the foot). A photograph with saved
     details: an outline, and on its corner the number saved from it, the same mark as the count at the foot. A tap opens it on
     screen 4. The foot: the details saved and "Continue" (to screen 5; from the drawing, back to it), only once one is saved; it is
     the screen's foot, never over a photograph */
  PlayerKinds.gallery = function (x) {
    var c = state(x), g = opts(x).gallery, first = Math.min(g.length, opts(x).first || g.length), rest = g.slice(first), back = !!c.began;
    var open = !!c.more || c.worlds.some(function (w) { return rest.some(function (e) { return e.id === w.src; }); });
    var DOWN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    function choose(id) { c.src = id; c.chosen = true; x.go(scr(x, 'discover')); }
    return {
      html: '<div class="cv-gal" data-cv-gal></div>' +
        (rest.length ? '<p class="cv-more-p"' + (open ? ' hidden' : '') + '><button type="button" class="cv-more" aria-expanded="false">' + esc(T('more')) + DOWN + '</button></p>' : '') +
        '<p class="cv-links"><button type="button" class="cu-link cv-surprise">' + esc(T('surprise')) + '</button></p>' +
        '<details class="ar-src cv-creds"><summary>' + esc(T('source')) + '</summary><ol></ol></details>',
      action: null,
      mount: function (root) {
        var box = root.querySelector('[data-cv-gal]'), foot = root.querySelector('.pl-foot'), per = 0;
        function has(id) { return c.worlds.filter(function (w) { return w.src === id; }).length; }
        function rows(list) {
          var out = '';
          for (var i = 0; i < list.length; i += per) {
            var row = list.slice(i, i + per);
            out += '<div class="cv-row">' + row.map(function (e) {
              var k = has(e.id), r = e.size[0] / e.size[1], name = I.tx(e.alt);
              return '<button type="button" class="cv-ph' + (k ? ' cv-has' : '') + '" data-id="' + e.id + '" style="flex:' + r.toFixed(4) + ' 1 0%;aspect-ratio:' + e.size[0] + '/' + e.size[1] + '" aria-label="' + esc(k ? T('hasKept', { what: name }) : name) + '">' +
                '<img src="' + esc(src(e.img)) + '" alt="" loading="lazy" draggable="false">' + (k ? cnt(k) : '') + '</button>';
            }).join('') + (row.length < per ? '<i style="flex:' + (1.33 * (per - row.length)).toFixed(2) + ' 1 0%"></i>' : '') + '</div>';   // a short last row keeps the others' height
          }
          return out;
        }
        function draw() {
          var now = box.clientWidth >= 520 ? 3 : 2; if (now === per) return; per = now;
          box.innerHTML = '<div class="cv-rows">' + rows(g.slice(0, first)) + '</div>' + (open && rest.length ? '<div class="cv-rows cv-rows-more" id="cv-more">' + rows(rest) + '</div>' : '');
          box.querySelectorAll('.cv-ph').forEach(function (b) { b.addEventListener('click', function () { choose(b.getAttribute('data-id')); }); });
          root.querySelector('.cv-creds ol').innerHTML = (open ? g : g.slice(0, first)).map(function (e) { return '<li>' + credit(e.credit) + '</li>'; }).join('');
        }
        draw();
        var more = root.querySelector('.cv-more');
        if (more) more.addEventListener('click', function () {
          open = true; c.more = true; x.keep(); per = 0; draw();
          more.parentNode.hidden = true;
          var b = box.querySelector('#cv-more .cv-ph'); if (b) { b.focus({ preventScroll: true }); b.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
        });
        root.querySelector('.cv-surprise').addEventListener('click', function () {   // another photograph by chance; where to look in it stays the learner's
          var others = g.filter(function (e) { return e.id !== c.src; }); choose(others[Math.floor(Math.random() * others.length)].id);
        });
        /* the foot: the count and "Continue", or nothing at all until a detail is saved */
        var n = c.worlds.length;
        if (foot) {
          if (!n) foot.style.display = 'none';
          else {
            foot.classList.add('cv-foot');
            foot.innerHTML = '<div class="cv-bar">' + cnt(n) + '<span class="cv-bar-l">' + esc(T(n === 1 ? 'keptOne' : 'keptN')) + '</span>' +
              '<button type="button" class="cv-go"' + (back ? '' : ' aria-label="' + esc(T('goKept')) + '"') + '>' + esc(back ? (I.lang() === 'he' ? 'חזרה לציור' : 'Back to my drawing') : T('go')) + ' <span aria-hidden="true">' + (I.dir() === 'rtl' ? '←' : '→') + '</span></button></div>';
            foot.querySelector('.cv-go').addEventListener('click', function () { x.go(scr(x, back ? 'detailPaper' : 'world')); });
          }
        }
        var t = 0; window.addEventListener('resize', function onR() { if (!box.isConnected) return window.removeEventListener('resize', onR); clearTimeout(t); t = setTimeout(draw, 120); });
      }
    };
  };

  /* 4 of 8 · "Look closely" (25 October 2026; "A Closer Look" before it). The photograph chosen on screen 3, as large as the screen
     allows and whole; the tools one compact block (the zoom, the detail beside "Save", the saved details as three slots with
     "Continue" in their row). The block goes under the photograph, or into a narrow column beside it when that leaves the
     photograph more room (a tall photograph on a wide screen, and a phone held sideways): whichever gives the photograph the larger
     area. "All photographs" (in the title's row) goes back to the gallery; nothing saved is lost. From the drawing ("choose another
     area"), the same screen with "Back to my drawing": the detail now in the frame joins the run's areas and the drawing is opened
     again (nothing is deleted, no new artwork) */
  PlayerKinds.discover = function (x) {
    var c = state(x), back = !!c.began, he = I.lang() === 'he', t = 0, mounted = null, root0 = null;
    function frameNow() { return c.frames[c.src] || null; }
    function late() { if (mounted && root0 && root0.isConnected) x.keep(); }   // a timer left over from a screen already left must not write its old run over the newer one
    /* s.needSave (22 October 2026): at least one detail saved, by the learner, before going on; until then "Save" is the screen's
       main action and "Continue" quieter, and pressing it says what to do (nothing is saved for them) */
    var need = !!x.s.needSave && !back, NEED = he ? 'כדי להמשיך, שמרו לפחות פרט אחד: הקישו על מקום בתמונה ולחצו על "שמרו את הפרט שבחרתם".'
                                                 : 'To continue, save at least one detail: tap a place in the photo and tap "Save the detail you chose".';
    var sync = function () {};
    return {
      inline: true,   // the tool has the whole screen; its buttons come in its own row, not fixed over it
      html: (x.s.hint ? '<p class="cv-hint">' + esc(I.tx(x.s.hint)) + '</p>' : '') + '<div class="cv" data-cu></div>' + (need ? '<p class="cu-need" role="status" hidden>' + esc(NEED) + '</p>' : ''),
      action: back ? { label: he ? 'חזרה לציור' : 'Back to my drawing', go: function () {
                        var f = frameNow(); pushArea(x, c, f);
                        if (f) c.pick = Math.max(0, c.worlds.findIndex(function (w) { return Crop.sameDetail(w, detailOf(x, c, f)); })); x.go(scr(x, 'detailPaper')); } }
                   : { label: I.ui('continue'), go: function () {   // only what the learner saved is saved
                       if (need && !c.worlds.length) {
                         var h = document.querySelector('.cu-need'), k = document.querySelector('.cu-keep');
                         if (h) { h.hidden = false; h.scrollIntoView({ block: 'nearest' }); }
                         if (k) { k.classList.remove('cu-attn'); void k.offsetWidth; k.classList.add('cu-attn'); }
                         return;
                       }
                       x.go(x.n + 1); } },
      mount: function (root) {
        root0 = root.querySelector('[data-cu]'); var last = c.areas[c.areas.length - 1];
        if (back && last && entryOf(x, last.src)) { c.src = last.src; c.frames[c.src] = c.frames[c.src] || Crop.frameOf(last); }
        headLink(root, T('allPhotos'), function () { x.go(scr(x, 'gallery')); });
        var foot = root.querySelector('.pl-foot'), needP = root.querySelector('.cu-need'), main = root.querySelector('.pl-main');
        /* previous / next (Hagit, 24 October 2026): through the gallery's photographs in their order, without going back to "All
           photographs"; outside the photograph, never over it: beside it where the screen is wide (an unfolded foldable, a tablet,
           a computer), under it on a phone, so the photograph stays as large; at the ends the arrow waits; the saved details and
           each photograph's last frame stay as they are (the same way in as a tap in the gallery) */
        var gal = opts(x).gallery, ARROW = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
        function arrow(d) { var b = document.createElement('button'); b.type = 'button'; b.className = 'cv-arrow cv-arrow-' + d; b.setAttribute('aria-label', T(d + 'Photo')); b.innerHTML = ARROW;
          b.addEventListener('click', function () { var i = gal.indexOf(mounted.entry()), g = gal[d === 'next' ? (i < 0 ? 0 : i + 1) : i - 1]; if (g) mounted.go(g); }); return b; }
        var prev = arrow('prev'), next = arrow('next'), navRow = document.createElement('div'); navRow.className = 'cv-navrow';
        function nav(beside) {   // the arrows into their place, and whether each has somewhere to go
          var cv = root0, media = cv.querySelector('.cv-media'), i = gal.indexOf(mounted ? mounted.entry() : entryOf(x, c.src));
          prev.disabled = i <= 0; next.disabled = i >= gal.length - 1;
          media.classList.toggle('cv-nav-beside', beside);
          if (beside) { var vw = media.querySelector('.cu-view'); media.insertBefore(prev, vw); media.insertBefore(next, vw.nextSibling); if (navRow.parentNode) navRow.remove(); }   // prev, the photograph, next in one row; the credit under them
          else { navRow.appendChild(prev); navRow.appendChild(next); media.appendChild(navRow); }
        }
        /* the layout, after each photograph is drawn: the foot into the slots' row; then stacked or beside, by the area each leaves */
        function layout() {
          var cv = root0, tools = cv.querySelector('.cv-tools'), view = cv.querySelector('.cu-view'), credit = cv.querySelector('.cv-credit');
          if (!tools || !view || !cv.isConnected) return;
          var row = tools.querySelector('.cv-row2'); if (foot && foot.parentNode !== row) row.appendChild(foot);
          if (needP && needP.parentNode !== tools) tools.appendChild(needP);
          var e = entryOf(x, mounted ? mounted.entry().id : c.src).size, ar = e[0] / e[1];
          cv.classList.remove('cv-side'); view.style.width = view.style.height = '';
          var m = main.getBoundingClientRect(), top = cv.getBoundingClientRect().top - m.top, H = main.clientHeight - top - 22, W = cv.clientWidth;
          var cr = credit ? credit.offsetHeight + 4 : 0, th = tools.offsetHeight + 10, col = W >= 680 ? 300 : W > 600 ? 220 : 208;   // the column: wider where the screen is (a phone held sideways), so "Continue" fits beside the slots
          cv.style.setProperty('--cv-col', col + 'px');
          function fit(w, h) { w = Math.max(0, Math.min(w, h * ar)); return [w, w / ar]; }
          function area(s) { return s[0] * s[1]; }
          /* the arrows (44px, and 10px to the photograph) beside it only where that costs the photograph nothing (a screen with room to the
             sides: a computer, a tablet); where its width is what the screen allows (a phone, an unfolded foldable upright) they go under it */
          var AW = 2 * 54 + 6, NAV = 50, GAP = 10, aU = fit(W, H - th - cr - NAV), aB = fit(W - AW, H - th - cr - GAP), bU = fit(W - col - 16, H - cr - NAV), bB = fit(W - col - 16 - AW, H - cr - GAP);
          var beside = Math.max(area(aB), area(bB)) >= Math.max(area(aU), area(bU)) * 1.08; nav(beside);   // beside only where it clearly leaves the photograph larger, so one screen keeps one arrangement
          var aw = beside ? AW : 0, ch = cr + (beside ? 0 : navRow.offsetHeight + 6), a = beside ? aB : aU, b = beside ? bB : bU;
          var side = area(b) > area(a) * 1.05;
          if (side) { cv.classList.add('cv-side'); cv.style.setProperty('--cv-h', Math.max(200, H) + 'px'); }
          var s = side ? b : a;
          if (s[1] < 180) s = fit(W - aw, 180);   // never smaller than this: below it, the screen scrolls
          view.style.width = Math.floor(s[0]) + 'px'; view.style.height = Math.floor(s[1]) + 'px';
        }
        mounted = C.mount(root0, {
          compact: true, gallery: opts(x).gallery, lookup: all(x), entry: entryOf(x, c.src), src: src, zoom: opts(x).zoom, max: opts(x).worlds, frames: c.frames, worlds: c.worlds,
          credit: function (e) { return credit(e.credit); },
          onBuild: function () { setTimeout(layout, 0); setTimeout(layout, 400); },   // again once the screen's entrance has settled
          onSource: function (id) { c.src = id; c.img = entryOf(x, id).img; clearTimeout(t); t = setTimeout(late, 250); },
          onFrame: function () { clearTimeout(t); t = setTimeout(late, 350); },
          onWorlds: function () { x.keep(); sync(); }
        });
        if (!frameNow()) c.frames[c.src] = mounted.frame();
        var r = 0; window.addEventListener('resize', function onR() { if (!root0.isConnected) return window.removeEventListener('resize', onR); clearTimeout(r); r = setTimeout(layout, 120); });
        if (need) {
          sync = function () {
            var has = c.worlds.length > 0, p = root.querySelector('.pl-primary'), h = root.querySelector('.cu-need');
            if (p) p.classList.toggle('cu-wait', !has);
            if (has && h) h.hidden = true;
          };
          sync();
        }
      }
    };
  };

  /* the words of "From Detail to Artwork" (screen 5 of 8) of its own; a choice kept from before (c.choice, runs of 17-19 October) is left
     as it was, and chosenAt reads it for screen 5 and the paper's screen */
  var W7 = {
    he: { enlarge: 'הגדלת פרט {n}', more: 'חזרה למבט מקרוב', none: 'עדיין לא שמרתם תקריבים. אפשר לחזור ל\'מבט מקרוב\' ולבחור פרטים שמסקרנים אתכם.' },
    en: { enlarge: 'Enlarge detail {n}', more: 'Back to A Closer Look', none: 'You haven\'t saved any close-ups yet. You can go back to \'A Closer Look\' and choose details that intrigue you.' }
  };
  function chosenAt(c) {   // the index of the chosen detail among the saved ones, or -1 (a removed detail is no longer chosen)
    var i = c.choice ? c.worlds.findIndex(function (w) { return Crop.sameDetail(w, c.choice); }) : -1;
    if (i < 0) delete c.choice; else c.pick = i;
    return i;
  }
  /* 5 of 8 · "From Detail to Artwork" (25 October 2026): one detail, as large as the screen allows without scrolling (at most 560px);
     under it, touching it, "My details" (when more than one is saved: a tap makes that one the large one, briefly shown changing);
     the task, as approved, the width of the detail. The detail shown is the one chosen before, else the last saved (the author:
     nothing to choose again; another is one tap away). "Back to exploring" in the title's row. A tap on the detail: larger still,
     in the shared viewer. With nothing saved (a run of an earlier arrangement), a plain line says so; "Continue" never waits */
  PlayerKinds.world = function (x) {
    var c = state(x), he = I.lang() === 'he', S = W7[he ? 'he' : 'en'], n = c.worlds.length, after = (x.s.after && x.s.after[I.lang()]) || [];
    var at = chosenAt(c);
    if (at < 0 && n) { at = n - 1; c.pick = at; c.choice = Object.assign({}, c.worlds[at]); pushArea(x, c, c.worlds[at]); }
    return {
      inline: !!n,   // "Continue" goes with the detail: under the task, or beside the detail on a wide, low screen
      html: n ? '<div class="cv-det" data-cv-det><div class="cv-unit">' +
          '<button type="button" class="cv-big" aria-label="' + esc(S.enlarge.replace('{n}', at + 1)) + '"><canvas aria-hidden="true"></canvas></button>' +
          (n > 1 ? '<div class="cv-mine" role="group" aria-label="' + esc(T('mine')) + '"><span class="cv-mine-l" aria-hidden="true">' + esc(T('mine')) + '</span>' + c.worlds.map(function (w, i) {
            return '<button type="button" class="cv-pick" data-pick="' + i + '" aria-pressed="' + (i === at) + '" aria-label="' + esc(T('detailN', { n: i + 1 })) + '"><canvas aria-hidden="true"></canvas></button>';
          }).join('') + '</div>' : '') +
          '<div class="cv-task">' + after.map(function (t, i) { return '<p class="cu-after' + (i ? ' cu-after-quiet' : '') + '">' + t + '</p>'; }).join('') + '</div></div></div>'
        : '<p class="cu-empty cu-none">' + esc(S.none) + '</p>',
      mount: function (root) {
        headLink(root, T('backLook'), function () { x.go(scr(x, 'discover')); });
        var det = root.querySelector('[data-cv-det]'); if (!det) return;
        var unit = det.querySelector('.cv-unit'), big = det.querySelector('.cv-big'), main = root.querySelector('.pl-main'), foot = root.querySelector('.pl-foot');
        if (foot) unit.appendChild(foot);
        function paint(animate) {
          var d = c.worlds[c.pick]; if (!d) return;
          C.load(src(d.hi)).then(function (im) { Crop.draw(big.querySelector('canvas'), im, d, Math.max(160, Math.round(big.clientWidth || 360))); });
          big.setAttribute('aria-label', S.enlarge.replace('{n}', c.pick + 1));
          if (animate) { big.classList.remove('cv-swap'); void big.offsetWidth; big.classList.add('cv-swap'); }
        }
        /* the detail's side: the room the screen has once my details and the task are under it (no scrolling), 160 to 560 */
        function fit() {
          if (!det.isConnected) return;
          var m = main.getBoundingClientRect(), top = det.getBoundingClientRect().top - m.top + main.scrollTop, room = main.clientHeight - top - 16;
          unit.classList.remove('cv-wide'); big.style.width = ''; unit.style.width = '160px';
          var rest = unit.offsetHeight - big.offsetHeight, s = 160;
          for (var i = 0; i < 3; i++) { s = Math.floor(Math.max(160, Math.min(det.clientWidth, room - rest - 14, 560))); unit.style.width = s + 'px'; rest = unit.offsetHeight - big.offsetHeight; }
          /* a wide, low screen (a phone held sideways): the detail its full height, my details and the task beside it */
          var b = Math.floor(Math.min(room - 4, 560, det.clientWidth - 236));
          if (main.clientHeight < 480 && b > s * 1.15) { unit.classList.add('cv-wide'); unit.style.width = ''; big.style.width = b + 'px'; }
          paint();
        }
        det.querySelectorAll('.cv-pick').forEach(function (b, i) {
          var w = c.worlds[i];
          C.load(src(w.hi)).then(function (im) { Crop.draw(b.querySelector('canvas'), im, w, 64); });
          b.addEventListener('click', function () {
            if (c.pick === i) return;
            c.pick = i; c.choice = Object.assign({}, w); pushArea(x, c, w); x.keep();
            det.querySelectorAll('.cv-pick').forEach(function (o, j) { o.setAttribute('aria-pressed', j === i); });
            paint(true);
          });
        });
        big.addEventListener('click', function () {   // the same detail larger, in the shared viewer (a copy of the pixels: nothing is stored)
          var d = c.worlds[c.pick];
          C.load(src(d.hi)).then(function (im) {
            var cv = document.createElement('canvas'); Crop.draw(cv, im, d, 900);
            window.Viewer.open({ src: cv.toDataURL('image/jpeg', 0.9), alt: T('detailN', { n: c.pick + 1 }), ratio: '1', caption: '', from: big, big: true });
          });
        });
        fit();
        var t = 0; window.addEventListener('resize', function onR() { if (!det.isConnected) return window.removeEventListener('resize', onR); clearTimeout(t); t = setTimeout(fit, 120); });
      }
    };
  };

  /* 6 of 8 · "How would you like to create?" (25 October 2026): the player's own choice of paper or Studio (s.step 'medium': one tap
     goes on, the learner may change it later, the run keeps its one artwork), with the detail chosen above it and the two cards
     centred with it in the screen's height; "Back to the detail" in the title's row; this screen's own icons, a sheet with a pencil's
     line and a screen with a drawn line and a pen, of one weight (the player's shared icons, lesson 2.1's, stay as they are) */
  var HOW = {
    paper: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 16c1.5-2.5 3-3.5 4.5-2s3 .5 2.5-2"/></svg>',
    studio: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M9 21h6"/><path d="M6.5 13.5c1.5-3 3-4 4.5-2.5s2.5 1 3.5-1.5"/><path d="M15.5 12.5l3-3"/></svg>'
  };
  PlayerKinds.how = function (x) {
    var c = state(x), d = current(c) || c.worlds[c.pick] || c.worlds[c.worlds.length - 1];
    return {
      html: d ? '<div class="cv-how-d"><span class="cv-chip"><canvas aria-hidden="true"></canvas></span></div>' : '',
      mount: function (root) {
        var main = root.querySelector('.pl-main'), choices = root.querySelector('.pl-choices'), chip = root.querySelector('.cv-chip');
        main.classList.add('cv-how');
        headLink(root, T('backDetail'), function () { x.go(scr(x, 'world')); });
        root.querySelectorAll('.pl-choice').forEach(function (b) { var svg = b.querySelector('svg'); if (svg) svg.outerHTML = HOW[b.getAttribute('data-medium')]; });
        var grp = document.createElement('div'); grp.className = 'cv-how-grp';
        if (choices) { choices.parentNode.insertBefore(grp, choices); if (chip) grp.appendChild(chip.parentNode); grp.appendChild(choices); }
        if (!chip) return;
        /* the detail: 220 on a phone, up to 300 where there is room, never pushing the cards out of sight */
        function fit() {
          if (!grp.isConnected) return;
          var m = main.getBoundingClientRect(), top = grp.getBoundingClientRect().top - m.top + main.scrollTop, room = main.clientHeight - top - 24 - choices.offsetHeight - 40;
          var s = Math.floor(Math.max(120, Math.min(main.clientWidth >= 600 ? 300 : 220, room, grp.clientWidth * 0.62)));
          chip.style.width = chip.style.height = s + 'px';
          C.load(src(d.hi)).then(function (im) { Crop.draw(chip.querySelector('canvas'), im, d, s); });
        }
        fit();
        var t = 0; window.addEventListener('resize', function onR() { if (!grp.isConnected) return window.removeEventListener('resize', onR); clearTimeout(t); t = setTimeout(fit, 120); });
      }
    };
  };

  /* 9 · on paper: the learner says where the inspiration comes from, a detail saved in "A Closer Look" or a photograph of their own, taken
     outside the app (nothing is asked of them, nothing is uploaded: the app only keeps which they chose, c.inspiration). A saved
     detail: the details to choose from, the chosen one large (tap it to see it larger still), "choose another area". Their own
     photograph: nothing of the app's is shown as their inspiration, here or at the end. (In the Studio this screen is the Studio itself.) */
  PlayerKinds.detailPaper = function (x) {
    var c = state(x), he = I.lang() === 'he';
    c.began = true;   // from here "choose another area" comes back to the drawing
    if (x.studio) return { html: '' };
    /* s.paper.stages (23 October 2026, as in 2.1): the paper's one screen; the detail chosen on screen 5 above the stages, and nothing
       to choose here (a photograph of one's own is no longer offered) */
    if (x.side && x.side.stages) {
      var d = current(c) || c.worlds[c.pick] || c.worlds[c.worlds.length - 1];
      if (d) c.inspiration = 'detail';
      return {
        html: '',
        lead: d ? '<div class="cu-world cu-detailbox cu-paperdetail"><button type="button" class="cu-bigbtn" aria-label="' + esc(T('enlarge')) + '"><canvas class="cu-bigdetail" aria-hidden="true"></canvas></button></div>' : '',
        mount: function (root) {
          var big = root.querySelector('.cu-bigdetail'), btn = root.querySelector('.cu-bigbtn');
          if (!big) return; paintDetail(x, big, d, 280);
          btn.addEventListener('click', function () {
            C.load(src(d.hi)).then(function (im) { var cv = document.createElement('canvas'); Crop.draw(cv, im, d, 900);
              window.Viewer.open({ src: cv.toDataURL('image/jpeg', 0.9), alt: T('detail'), ratio: '1', caption: '', from: btn, big: true }); });
          });
        }
      };
    }
    if (!c.worlds.length) { var f0 = current(c); if (f0) c.worlds.push(f0); }
    var at = chosenAt(c);   // the detail chosen on screen 7 or here; none, and none is pressed until the learner chooses one
    if (at < 0 && current(c)) at = c.worlds.findIndex(function (w) { return Crop.sameDetail(w, current(c)); });
    c.pick = at;
    var S = he ? { h: 'מקור ההשראה שלי', detail: 'פרט שמור מ\'מבט מקרוב\'', own: 'צילום משלי, שצילמתי מחוץ לאפליקציה' }
               : { h: 'My source of inspiration', detail: 'A saved detail from \'A Closer Look\'', own: 'My own photograph, taken outside the app' };
    return {
      html: '<div class="cu-insp" role="radiogroup" aria-label="' + esc(S.h) + '">' + ['detail', 'own'].map(function (k) {
          return '<button type="button" role="radio" class="cu-inspbtn" data-insp="' + k + '" aria-checked="' + (c.inspiration === k) + '">' + esc(S[k]) + '</button>';
        }).join('') + '</div>' +
        '<div class="cu-world cu-detailbox"' + (c.inspiration === 'detail' ? '' : ' hidden') + '><button type="button" class="cu-bigbtn" aria-label="' + esc(T('enlarge')) + '"><canvas class="cu-bigdetail" aria-hidden="true"></canvas></button>' +
        (c.worlds.length > 1 || (c.worlds.length && c.pick < 0) ? pickerHtml(c, c.pick) : '') + '</div>',
      extra: { label: he ? 'לבחור אזור אחר' : 'Choose another area', go: function () { x.go(scr(x, 'discover')); } },
      mount: function (root) {
        var big = root.querySelector('.cu-bigdetail'), btn = root.querySelector('.cu-bigbtn'), box = root.querySelector('.cu-detailbox'), other = root.querySelector('.pl-foot .pl-secondary');
        function show() { btn.hidden = !c.worlds[c.pick]; if (btn.hidden) return; pushArea(x, c, c.worlds[c.pick]); return paintDetail(x, big, c.worlds[c.pick], 420); }
        function choose(k, first) {
          c.inspiration = k; box.hidden = k !== 'detail'; if (other) other.hidden = k === 'own';
          root.querySelectorAll('.cu-inspbtn').forEach(function (b) { b.setAttribute('aria-checked', b.getAttribute('data-insp') === k); });
          if (k === 'detail') show(); if (!first) x.keep();
        }
        pickerMount(x, root, c, show);
        root.querySelectorAll('.cu-inspbtn').forEach(function (b) { b.addEventListener('click', function () { choose(b.getAttribute('data-insp')); }); });
        if (c.inspiration) choose(c.inspiration, true); else if (other) other.hidden = false;
        btn.addEventListener('click', function () {   // the same detail larger, in the shared viewer (a copy of the pixels: nothing is stored)
          var d = c.worlds[c.pick];
          C.load(src(d.hi)).then(function (im) {
            var cv = document.createElement('canvas'); Crop.draw(cv, im, d, 900);
            window.Viewer.open({ src: cv.toDataURL('image/jpeg', 0.9), alt: T('detailN', { n: c.pick + 1 }), ratio: '1', caption: '', from: btn, big: true });
          });
        });
      }
    };
  };

  /* 12 · stop: a question to look back with (nothing to answer in the app); keep drawing, choose another area, or compare
     and finish */
  PlayerKinds.stop = function (x) {
    var he = I.lang() === 'he', work = x.studio && x.made(x.art);
    var Q = he ? 'מה משתנה כשבוחרים אזור אחר? האם הוא מעורר בכם רעיון חדש?' : 'What changes when you choose a different area? Does it spark a new idea?';
    return {
      html: (work ? '<figure class="pl-studio-work"><img src="' + work.preview + '" alt=""></figure>' : '') + '<p class="pl-text pl-q">' + esc(Q) + '</p>',
      action: { label: he ? 'להשוות ולסיים' : 'Compare and finish', go: function () { x.go(x.n + 1); } },
      extra: { label: he ? 'להמשיך לצייר' : 'Keep drawing', go: function () { x.go(scr(x, 'detailPaper')); } },
      later: { label: he ? 'לבחור אזור אחר' : 'Choose another area', go: function () { x.go(scr(x, 'discover')); } }
    };
  };

  /* 13 · the photograph of the detail drawn from, the areas chosen in it marked in order, beside the drawing (the Studio's,
     shown by the player; on paper, the detail itself) */
  PlayerKinds.compare = function (x) {
    var r = compareBody(x);
    /* s.anotherArea (22 October 2026, "Stop." joined the end): another area of the same photograph, the drawing kept, in the place
       of "come back to it later" */
    if (x.s.anotherArea) r.later = { label: I.lang() === 'he' ? 'לבחור אזור אחר' : 'Choose another area', go: function () { x.go(scr(x, 'discover')); } };
    return r;
  };
  function compareBody(x) {
    var c = state(x), he = I.lang() === 'he';
    /* s.detailOnly (23 October 2026): the detail chosen beside the work: in the Studio the player shows the work after it; on paper, a
       line asks to put the drawing beside the screen. Runs that chose their own photograph keep their own end below */
    /* 24 October 2026: the two side by side in one row, at the height the screen has left, so both are seen without scrolling (the
       Studio's work moved into the row from where the player puts it; on paper the line takes the drawing's place) */
    if (x.s.detailOnly && c.inspiration !== 'own') {
      var d = current(c) || (c.worlds.length ? c.worlds[c.worlds.length - 1] : null);
      if (!d) return { html: '' };
      var e0 = entryOf(x, d.src || c.src);
      return {
        html: '<div class="cu-side">' +
          '<figure class="cu-side-cell"><div class="cu-world cu-cmpdetail"><canvas class="cu-bigdetail" aria-hidden="true"></canvas></div><figcaption class="cu-label">' + esc(he ? 'הפרט שבחרתם' : 'The detail you chose') + credit(e0 && e0.credit) + '</figcaption></figure>' +
          (x.studio ? '<figure class="cu-side-cell cu-side-work"><figcaption class="cu-label cu-mine">' + esc(he ? 'הציור שלכם' : 'Your drawing') + '</figcaption></figure>'
                    : '<div class="cu-side-cell cu-side-paper"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 15l3-3 2 2"/></svg><p class="pl-text cu-besides">' + esc(I.tx(x.s.paperLine)) + '</p></div>') +
          '</div>',
        mount: function (root) {
          var side = root.querySelector('.cu-side'), cell = side.querySelector('.cu-side-work'), work = root.querySelector('.pl-studio-work');
          if (cell && work) cell.insertBefore(work, cell.firstChild);
          /* 24 October 2026 (the author): the pictures and the question first; My artworks, another area and a new attempt come after
             them in the screen (scrolled to on a small phone), and only "Keep creating" stays at the foot */
          var foot = root.querySelector('.pl-foot-keep'), quiet = foot ? foot.querySelectorAll('.pl-secondary') : [];
          if (quiet.length) { var row = document.createElement('div'); row.className = 'cu-side-more'; [].forEach.call(quiet, function (q) { row.appendChild(q); }); root.querySelector('.pl-inner').appendChild(row); }
          var main = root.querySelector('.pl-main'), cv = root.querySelector('.cu-bigdetail');
          function fit() {   // the pictures' height: the room down to the foot (at least 150px, at most 520px; below that the screen scrolls)
            if (!side.isConnected) return;
            side.style.setProperty('--side-h', '520px');
            for (var i = 0; i < 4; i++) {
              var m = main.getBoundingClientRect(), over = side.getBoundingClientRect().bottom - m.top + main.scrollTop - main.clientHeight + 8;
              if (over <= 0) break;
              var now = Math.max.apply(null, [].map.call(side.querySelectorAll('.cu-bigdetail, .pl-studio-work img, .cu-side-paper'), function (e) { return e.getBoundingClientRect().height; }));
              side.style.setProperty('--side-h', Math.max(150, Math.floor(now - over - 2)) + 'px');
            }
          }
          paintDetail(x, cv, d, 360).then(fit);
          var img = work && work.querySelector('img'); if (img && !img.complete) img.addEventListener('load', fit);
          fit();
          var t = 0; window.addEventListener('resize', function onR() { if (!side.isConnected) return window.removeEventListener('resize', onR); clearTimeout(t); t = setTimeout(fit, 120); });
        }
      };
    }
    if (!x.studio && c.inspiration !== 'detail') {   // on paper: only what the learner chose is shown as their inspiration
      if (c.inspiration !== 'own') return { html: '' };   // nothing chosen: a neutral end, no picture of inspiration
      var own = he ? 'יצרתם בהשראת צילום משלכם' : 'You created this inspired by your own photograph';
      return { html: '<p class="cu-label cu-own">' + esc(own) + '</p>' };
    }
    var cur = current(c) || (x.studio && c.worlds.length ? c.worlds[c.worlds.length - 1] : null), areas = c.areas.length ? c.areas : (cur ? [cur] : []);   // in the Studio with no area chosen there: the last detail the learner saved (22 October 2026: one is always saved)
    if (!cur) return { html: '' };   // went on freely, no detail chosen: a neutral end (the Studio's drawing is shown by the player)
    var e = entryOf(x, (cur && cur.src) || c.src), W = e.size[0], H = e.size[1];
    var marks = areas.filter(function (a) { return a.src === e.id; }).map(function (a, i) {
      var w = Math.min(W, H) / a.z, last = a === areas[areas.length - 1];
      return '<rect x="' + (a.cx * W - w / 2).toFixed(1) + '" y="' + (a.cy * H - w / 2).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + w.toFixed(1) + '" class="' + (last ? 'cu-mark cu-last' : 'cu-mark') + '"/>' +
        '<text x="' + (a.cx * W - w / 2 + 8).toFixed(1) + '" y="' + (a.cy * H - w / 2 + 8 + H / 24).toFixed(1) + '" class="cu-num" style="font-size:' + (H / 20).toFixed(1) + 'px">' + (i + 1) + '</text>';
    }).join('');
    var srcL = he ? 'מקור ההשראה' : 'Your source', mine = he ? 'הציור שלכם' : 'Your drawing', det = he ? 'הפרט שבחרתם' : 'The detail you chose';
    return {
      html: fig('<div class="cu-cmp" style="aspect-ratio:' + W + '/' + H + ';width:min(100%,calc(var(--cu-h) * ' + (W / H).toFixed(4) + '))"><img src="' + esc(src(e.img)) + '" alt="' + esc(I.tx(e.alt)) + '">' +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' + marks + '</svg></div><figcaption>' + esc(srcL) + credit(e.credit) + '</figcaption>') +
        (x.studio ? '<p class="cu-label">' + esc(mine) + '</p>' : '<div class="cu-world"><canvas class="cu-bigdetail" aria-hidden="true"></canvas></div><p class="cu-label">' + esc(det) + '</p>'),
      mount: function (root) {
        var big = root.querySelector('.cu-bigdetail');
        if (big && cur) paintDetail(x, big, cur, 360);
      }
    };
  }
})();

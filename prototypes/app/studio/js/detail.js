/* Tool: my details (lesson 2.2 "Up Close"; version 41, Hagit's brief of 24 October 2026). The detail chosen to draw from is
   the reference picture, shown by the light table tool (js/table.js: under the page, floating over it, or not at all); no
   second copy of it beside the page. One compact button in the top bar, "Choose another detail", opens, over the work, the
   details the learner saved in "A Closer Look": the one drawn from large, the others small; a tap on a small one makes it the
   reference at once (shown the way the picture is shown now), a tap on the large one shows it larger still. A peek: the
   pictures are only looked at, never put in the work (no photograph is drawn on the canvas or saved with the artwork), and
   "Close" comes back to the work as it was. "Choose another area" saves the work and opens the lesson's "A Closer Look" on the
   same photographs, where they were; "Back to my drawing" there opens this same artwork again, with everything drawn in it.
   Where the details are: the lesson's run (Artworks.runs('2-2-close'): the run whose artwork this is; run.close.worlds the saved
   details, each with the file it is cut from (hi), run.close.areas the ones chosen to draw from, in order, the last the current
   one; Crop.normalize reads runs saved when there was one photograph). Nothing is read until the page opens and nothing is
   written but, on leaving to choose another area, which attempt the lesson player continues (sessionStorage 'run:<lesson>'). */
Studio.register('detail', {
  strings: {
    he: { detail: 'בחירת פרט אחר', detailTitle: 'הפרטים שלי', detailClose: 'סגירה', detailChange: 'לבחור אזור אחר', detailN: 'פרט {n}', detailBig: 'הגדלת הפרט' },
    en: { detail: 'Choose another detail', detailTitle: 'My details', detailClose: 'Close', detailChange: 'Choose another area', detailN: 'Detail {n}', detailBig: 'Enlarge the detail' }
  },
  init: function (S) {
    'use strict';
    if (!S.art || !window.Artworks || !window.Crop) return;
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function fill(t, o) { return t.replace(/\{(\w+)\}/g, function (m, k) { return o[k]; }); }
    var LESSON = S.activity.content.lesson || '2-2-close', data = null, at = 0;

    var d = document.createElement('dialog');
    d.className = 'detail'; d.id = 'detailDialog'; d.setAttribute('aria-label', S.T.detailTitle);
    d.innerHTML = '<h2 class="refs-h">' + esc(S.T.detailTitle) + '</h2>' +
      '<button type="button" class="detail-bigbtn" aria-label="' + esc(S.T.detailBig) + '"><canvas class="detail-img" role="img"></canvas></button>' +
      '<ul class="detail-list"></ul>' +
      '<div class="refs-row">' +
      '<button type="button" class="btn detail-change">' + esc(S.T.detailChange) + '</button>' +
      '<button type="button" class="btn primary detail-close">' + esc(S.T.detailClose) + '</button></div>';
    document.body.appendChild(d);
    var canvas = d.querySelector('.detail-img'), listEl = d.querySelector('.detail-list');
    d.querySelector('.detail-close').addEventListener('click', function () { d.close(); });
    d.addEventListener('click', function (e) {
      if (e.target !== d) return;
      var r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    });
    /* opened from My artworks: the lesson opens this artwork's Studio again with the way back to My artworks (js/player.js
       openStudio), not to the lesson's end (UX review, 28 October 2026) */
    function keepWay() { try { if (S.gallery) sessionStorage.setItem('studio-ctx:' + LESSON, JSON.stringify({ art: S.art, back: S.gallery })); } catch (e) {} }
    d.querySelector('.detail-change').addEventListener('click', function () {
      /* the lesson player continues this artwork's attempt (js/player.js pin), not the newest one */
      try { sessionStorage.setItem('run:' + LESSON, data.run.id); } catch (e) {}
      keepWay();
      S.leaveTo('../index.html#/lesson/' + LESSON + '/play/discover');
    });
    function url(w) { return '../' + w.hi + '.jpg'; }
    function px() { return Math.max(160, Math.min(420, window.innerWidth - 64, window.innerHeight - 330)); }
    function show(i) {
      at = i; var w = data.list[i], n = px();
      if (S.table) S.table.use(w);   // the one looked at is the reference (shown the way it is shown now; js/table.js)
      canvas.style.width = canvas.style.height = n + 'px'; canvas.setAttribute('aria-label', fill(S.T.detailN, { n: i + 1 }));
      listEl.querySelectorAll('.detail-w').forEach(function (b, j) { b.setAttribute('aria-pressed', j === i); });
      window.Crop.load(url(w)).then(function (im) { if (at === i) window.Crop.draw(canvas, im, w, n); });
    }
    /* the same detail larger in a layer of its own over the dialog (a copy for looking; nothing is stored) */
    d.querySelector('.detail-bigbtn').addEventListener('click', function () {
      var w = data.list[at], box = document.createElement('div'), n = Math.min(window.innerWidth, window.innerHeight) - 24;
      box.className = 'detail-large'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', fill(S.T.detailN, { n: at + 1 }));
      box.innerHTML = '<canvas></canvas><button type="button" class="btn primary">' + esc(S.T.detailClose) + '</button>';
      d.appendChild(box);
      var c = box.querySelector('canvas'); c.style.width = c.style.height = Math.max(160, n - 70) + 'px';
      window.Crop.load(url(w)).then(function (im) { window.Crop.draw(c, im, w, Math.max(160, n - 70)); });
      box.querySelector('button').addEventListener('click', function () { box.remove(); d.querySelector('.detail-bigbtn').focus(); });
      box.querySelector('button').focus();
    });

    var open = document.createElement('button');
    open.type = 'button'; open.className = 'refsbtn'; open.id = 'detailbtn'; open.setAttribute('aria-label', S.T.detail); open.title = S.T.detail;
    open.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="11" cy="11" r="3.5"/><path d="M13.6 13.6L17 17"/></svg><span>' + esc(S.T.detail) + '</span>';
    open.addEventListener('click', function () {
      if (!data) return;
      S.closePanels();
      listEl.innerHTML = data.list.map(function (w, i) {
        return '<li><button type="button" class="detail-w" aria-pressed="false" aria-label="' + esc(fill(S.T.detailN, { n: i + 1 })) + '"><canvas aria-hidden="true"></canvas><span>' + (i + 1) + '</span></button></li>';
      }).join('');
      listEl.hidden = data.list.length < 2;
      listEl.querySelectorAll('.detail-w').forEach(function (b, i) {
        window.Crop.load(url(data.list[i])).then(function (im) { window.Crop.draw(b.querySelector('canvas'), im, data.list[i], 56); });
        b.addEventListener('click', function () { show(i); });
      });
      d.showModal(); show(data.start); d.querySelector('.detail-close').focus();
    });
    var top = document.querySelector('.top');
    top.insertBefore(open, S.$('moreWrap'));

    /* for the light table (studio/js/table.js): "My details" opened from it, or, with no saved detail, the way back to
       "A Closer Look" (screen 3) to save one; this artwork's attempt is the one the lesson continues, and the work is saved
       first (S.leaveTo), so nothing drawn is lost and no new artwork is made */
    var mine = null;
    S.details = {
      has: function () { return !!data; },
      current: function () { return data ? data.list[at] : null; },   // the one drawn from
      open: function () { if (data) open.click(); },
      closeLook: function () {
        try { if (mine) sessionStorage.setItem('run:' + LESSON, mine.id); } catch (e) {}
        keepWay();
        S.leaveTo('../index.html#/lesson/' + LESSON + '/play/discover');
      }
    };

    /* the run of this artwork; without a detail to show (an artwork that did not come from the lesson) there is no button */
    Artworks.runs(LESSON).catch(function () { return []; }).then(function (runs) {
      var run = runs.filter(function (r) { return r.artwork === S.art; }).pop(), c = run && window.Crop.normalize(run.close);
      mine = run || null;
      function none() { open.remove(); window.dispatchEvent(new Event('resize')); if (S.table) S.table.refresh(); }
      if (!c) return none();
      var list = (c.worlds || []).slice(), cur = (c.areas || [])[(c.areas || []).length - 1];
      if (cur && !list.some(function (w) { return window.Crop.sameDetail(w, cur); })) list.push(cur);   // the area drawn from is always among them
      if (!list.length) return none();
      var start = cur ? list.findIndex(function (w) { return window.Crop.sameDetail(w, cur); }) : list.length - 1;
      data = { run: run, list: list, start: Math.max(0, start) }; at = data.start;
      /* the detail drawn from is the reference from the start (a new work: on the light table); a work that has one keeps it */
      if (S.table) { if (!S.table.has()) S.table.use(data.list[at]); else S.table.refresh(); }
    });
  }
});

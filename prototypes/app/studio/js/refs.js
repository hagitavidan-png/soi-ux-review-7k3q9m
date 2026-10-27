/* Tool: inspiration (lesson 2.3). The lesson's images, to look at again while working, without leaving the Studio:
   one button in the top bar (an eye, "View inspiration") opens them over it: all of them first, in even cells, each image whole;
   a tap shows one large with its words, previous / next (buttons, arrow keys, a swipe) go through the others, and
   "All the images" goes back to them. Closing comes back to the work as it was: nothing in it changes, nothing is
   written. The images: activity.content.refs, [{ src (from studio/index.html), alt: { he, en } }]. */
Studio.register('refs', {
  strings: {
    he: { refs: 'השראה', refsView: 'צפייה בהשראה', refsTitle: 'מקורות ההשראה', refsClose: 'חזרה ליצירה', refsAll: 'כל התמונות',
          refsPrev: 'התמונה הקודמת', refsNext: 'התמונה הבאה', refsCount: 'תמונה {n} מתוך {total}', refsOpen: 'הגדלת התמונה: {what}' },
    en: { refs: 'Inspiration', refsView: 'View inspiration', refsTitle: 'Sources of inspiration', refsClose: 'Back to my artwork', refsAll: 'All the images',
          refsPrev: 'Previous image', refsNext: 'Next image', refsCount: 'Image {n} of {total}', refsOpen: 'Enlarge image: {what}' }
  },
  init: function (S) {
    'use strict';
    /* the button (Hagit, 21 October 2026): an eye (Lucide "eye"), no word on it; its name for screen readers and as the
       tooltip, and a long press on a touch screen says it too; the same in the usual view and in "Expand" */
    function eyeButton(onOpen) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'refsbtn'; b.id = 'refs'; b.setAttribute('aria-label', S.T.refsView); b.title = S.T.refsView;
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>';
      b.addEventListener('click', onOpen);
      b.addEventListener('contextmenu', function (e) { e.preventDefault(); Studio.shell.toast(S.T.refsView); });
      return b;
    }
    /* content.inspiration (2.1): the lesson's one gallery (../js/inspiration.js), the same as from the lesson's screens; it
       lies over the work and closing it comes back to the work as it was (nothing in it, its history or its settings
       changes). Its button in the top bar, as below */
    var lesson = S.activity.content && S.activity.content.inspiration;
    if (lesson && window.Inspiration) {
      var ob = eyeButton(function () { S.closePanels(); window.Inspiration.open({ lesson: lesson, lang: S.lang, base: '../', from: ob, close: S.T.refsClose }); });
      /* the page first (2.2, version 41): the bar keeps only what is essential, so the gallery is a line in "More" (js/shell.js) */
      if (S.pageFirst) {
        var mi = document.createElement('button');
        mi.type = 'button'; mi.className = 'menu-item menu-refs'; mi.id = 'refsItem'; mi.textContent = S.T.refs;
        mi.addEventListener('click', function () { S.closePanels(); window.Inspiration.open({ lesson: lesson, lang: S.lang, base: '../', from: S.$('more'), close: S.T.refsClose }); });
        S.$('menu').insertBefore(mi, S.$('menu').firstChild);
        return;
      }
      document.querySelector('.top').insertBefore(ob, S.$('moreWrap'));
      return;
    }
    var list = (S.activity.content && S.activity.content.refs) || [];
    if (!list.length) return;
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function alt(r) { return (r.alt && (r.alt[S.lang] || r.alt.he)) || ''; }
    function fill(t, o) { return t.replace(/\{(\w+)\}/g, function (m, k) { return o[k]; }); }
    var rtl = S.lang === 'he';
    var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    var PREV = CHEV + '<path d="M9 5l7 7-7 7"/></svg>', NEXT = CHEV + '<path d="M15 5l-7 7 7 7"/></svg>';   // RTL; mirrored in LTR (studio.css)

    var d = document.createElement('dialog');
    d.className = 'refs'; d.id = 'refsDialog'; d.setAttribute('aria-label', S.T.refsTitle);
    d.innerHTML = '<h2 class="refs-h">' + esc(S.T.refsTitle) + '</h2>' +
      '<ul class="refs-grid">' + list.map(function (r, i) {
        return '<li><button type="button" class="refs-thumb" data-i="' + i + '" aria-label="' + esc(fill(S.T.refsOpen, { what: alt(r) })) + '"><img src="' + esc(r.src) + '" alt=""></button></li>';
      }).join('') + '</ul>' +
      '<figure class="refs-one" hidden><img alt=""><figcaption></figcaption></figure>' +
      '<div class="refs-nav" hidden><button type="button" class="refs-step" data-step="-1" aria-label="' + esc(S.T.refsPrev) + '">' + PREV + '</button>' +
      '<span class="refs-count" aria-live="polite"></span>' +
      '<button type="button" class="refs-step" data-step="1" aria-label="' + esc(S.T.refsNext) + '">' + NEXT + '</button></div>' +
      '<div class="refs-row"><button type="button" class="btn refs-all" hidden>' + esc(S.T.refsAll) + '</button>' +
      '<button type="button" class="btn primary refs-close">' + esc(S.T.refsClose) + '</button></div>';
    document.body.appendChild(d);
    var grid = d.querySelector('.refs-grid'), one = d.querySelector('.refs-one'), img = one.querySelector('img'), cap = one.querySelector('figcaption'),
        nav = d.querySelector('.refs-nav'), all = d.querySelector('.refs-all'), at = 0;

    function showAll() {
      grid.hidden = false; one.hidden = true; nav.hidden = true; all.hidden = true;
      d.classList.remove('is-one');
      var t = d.querySelector('.refs-thumb[data-i="' + at + '"]'); if (t && d.open) t.focus();
    }
    function show(i) {
      at = (i % list.length + list.length) % list.length;
      var r = list[at];
      img.src = r.src; img.alt = alt(r); cap.textContent = alt(r);
      d.querySelector('.refs-count').innerHTML = '<span aria-hidden="true">' + (at + 1) + '/' + list.length + '</span><span class="sr">' + esc(fill(S.T.refsCount, { n: at + 1, total: list.length })) + '</span>';
      grid.hidden = true; one.hidden = false; nav.hidden = list.length < 2; all.hidden = false;
      d.classList.add('is-one');
    }
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.refs-thumb');
      if (b) { show(+b.getAttribute('data-i')); all.focus(); }
    });
    d.querySelectorAll('.refs-step').forEach(function (b) { b.addEventListener('click', function () { show(at + +b.getAttribute('data-step')); }); });
    d.addEventListener('keydown', function (e) {
      if (one.hidden || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
      e.preventDefault(); show(at + ((e.key === 'ArrowRight') !== rtl ? 1 : -1));
    });
    var x0 = null;   // a swipe on the large image: towards the next one (left in LTR, right in RTL)
    img.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    img.addEventListener('pointerup', function (e) {
      if (x0 === null) return; var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) show(at + ((dx < 0) !== rtl ? 1 : -1));
    });
    img.addEventListener('dragstart', function (e) { e.preventDefault(); });
    all.addEventListener('click', showAll);
    d.querySelector('.refs-close').addEventListener('click', function () { d.close(); });
    d.addEventListener('click', function (e) {   // a tap outside the box
      if (e.target !== d) return;
      var r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    });

    /* its button in the top bar, before My artworks (16 October 2026: no row of actions under the work; the toolbar keeps
       its room for the drawing tools): the eye, as above */
    var open = eyeButton(function () { S.closePanels(); showAll(); d.showModal(); d.querySelector('.refs-thumb').focus(); });
    var top = document.querySelector('.top');
    top.insertBefore(open, S.$('moreWrap'));
  }
});

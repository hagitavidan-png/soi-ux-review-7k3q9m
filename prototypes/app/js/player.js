/* The Lesson Player: one screen, one idea, one action. It shows any lesson whose screens are listed in
   window.APP_LESSONS (lessons/<id>.js: where each screen's content is in the lesson, the player's own words for it),
   through that lesson format's adapter.
   One lesson run, one artwork (js/artworks.js): the run keeps where the learner is in the lesson and what they chose
   (screen, medium, the thing to change, the possibility chosen); the artwork keeps the work. Paper or Studio is
   chosen on screen 9, and the artwork made then (on paper: an artwork with no Studio state). Every Studio screen
   opens that same artwork (?art=) in its Studio activity and comes back to its screen (?back=); the Studio saves the
   work by itself. A new run (a new artwork) starts the lesson again; the earlier ones and their works stay.
   Development points: 'before-repeat' (made by the Studio when Repeat enters, never offered as a choice) and 'kept'
   (the learner's "keep this", screen 14); screen 15 offers the kept ones, only when there are two or more. */
window.Player = (function () {
  'use strict';
  var I = window.I18N;
  var IMG = '../../images/editorial/';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var W = window.Artworks;
  /* the lesson's current run; before the learner has one, a new one (stored once something is kept in it) */
  /* the attempt the learner chose by opening one of its artworks (My artworks): kept in this tab (sessionStorage), preferred over
     the newest attempt while it exists, forgotten when a new attempt starts (Artworks.newRun) */
  function pin(lesson, runId) { try { sessionStorage.setItem('run:' + lesson, runId); } catch (e) {} }
  function pinned(id) { try { return sessionStorage.getItem('run:' + id); } catch (e) { return null; } }
  function runOf(id) {
    var p = pinned(id);
    return (p ? W.runs(id).then(function (l) { return l.filter(function (r) { return r.id === p; })[0] || null; }) : Promise.resolve(null))
      .then(function (r) { return r || W.currentRun(id); })
      .then(function (r) { return r || { id: W.newId(), lesson: id, artwork: null }; })
      .then(function (r) {   // L.layout / L.screenMap (2.2: its screens were rearranged): a run kept under an earlier arrangement continues at the same place
        var L = window.APP_LESSONS[id];   // L.screenMaps (2.1): one map for each earlier arrangement ('old': runs from before any layout)
        if (L && L.layout && r.layout !== L.layout) {
          var map = L.screenMaps ? L.screenMaps[r.layout === undefined ? 'old' : r.layout] : (r.layout === undefined ? L.screenMap : null);
          if (r.screen && map) r.screen = map[r.screen] || r.screen;
          r.layout = L.layout;
        }
        return r;
      });
  }

  /* ── the parts of the lesson's content (texts come from the lesson; they may hold <b> and <br>) ── */
  function core(b) {
    return (b.big ? '<h3 class="pl-big">' + I.tx(b.big) + '</h3>' : '') +
      (b.sub ? '<p class="pl-sub">' + I.tx(b.sub) + '</p>' : '') +
      (b.body ? '<p>' + I.tx(b.body) + '</p>' : '') +
      (b.lines ? '<ul class="pl-lines">' + (b.lines[I.lang()] || []).map(function (v) { return '<li>' + v + '</li>'; }).join('') + '</ul>' : '') +
      (b.list ? '<ol class="pl-steps">' + (b.list[I.lang()] || []).map(function (v) { return '<li>' + v + '</li>'; }).join('') + '</ol>' : '') +
      (b.ask ? '<p class="pl-ask">' + I.tx(b.ask) + '</p>' : '');
  }
  function parts(list) {
    return list.map(function (p) {
      if (p.block) return core(p.block);
      if (p.list) return '<ul class="pl-lines">' + (p.list[I.lang()] || []).map(function (v) { return '<li>' + v + '</li>'; }).join('') + '</ul>';
      if (p.text) return '<p>' + I.tx(p.text) + '</p>';
      return '';
    }).join('');
  }
  /* a row of the lesson: "do" leads the screen; why, materials and check are quieter. The names of the lesson's
     structure stay in its data; the learner does not see them unless they add meaning (UNLABELLED: shown without) */
  var UNLABELLED = ['why', 'check'];
  function row(r) {
    if (r.k === 'do') return '<div class="pl-do">' + parts(r.parts) + '</div>';
    return '<section class="pl-row pl-row-' + esc(r.k) + '">' + (UNLABELLED.indexOf(r.k) < 0 ? '<h4>' + esc(I.ui(r.k)) + '</h4>' : '') + parts(r.parts) + '</section>';
  }
  function proto(text) {
    return '<aside class="pl-proto" role="note"><b>' + esc(I.ui('proto')) + '</b><span>' + esc(text) + '</span></aside>';
  }
  /* an image or the music the screen needs: the approved one, or a placeholder in the same place (audio: L.audio) */
  var NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>';
  function media(m, L) {
    if (!m) return '';
    if (m.audio) {
      var file = L.audio && L.audio[m.audio];
      if (file) return '<figure class="pl-audio"><audio controls preload="none" src="' + esc(file) + '"></audio></figure>';
      return '<figure class="pl-audio pl-placeholder" data-audio="' + esc(m.audio) + '">' + NOTE + '<figcaption>' + esc(I.ui('protoAudio')) + '</figcaption></figure>';
    }
    var img = L.assets && L.assets[m.asset];
    if (img) return '<figure class="pl-media"><img src="' + IMG + esc(img) + '.jpg" alt=""></figure>';
    return '<figure class="pl-media pl-placeholder" data-asset="' + esc(m.asset) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M4 18l5-5 3 3 3-3 5 5"/></svg>' +
      '<figcaption>' + esc(I.ui('protoImage')) + '</figcaption></figure>';
  }
  /* an artwork of the lesson: its image, or, with no right to show it, the lesson's link to the museum */
  function work(w, small) {
    var cap = '<figcaption><b>' + esc(I.tx(w.artist)) + '</b> · ' + esc(I.tx(w.workTitle)) + '</figcaption>';
    var alt = w.alt && typeof w.alt === 'object' ? I.tx(w.alt) : w.alt;
    if (w.img) return '<figure class="pl-work' + (small ? ' small' : '') + '"><img src="' + IMG + esc(w.img) + '.jpg" alt="' + esc(alt || '') + '">' + cap + '</figure>';
    /* no image and nothing to link to yet: a placeholder where the image will be, the artist and title under it */
    if (!w.link) return '<figure class="pl-work pl-linkcard' + (small ? ' small' : '') + '"><div class="pl-linkcard-box pl-placeholder">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M4 18l5-5 3 3 3-3 5 5"/></svg>' +
      '<span>' + esc(I.ui('protoImage')) + '</span></div>' + cap + '</figure>';
    return '<figure class="pl-work pl-linkcard' + (small ? ' small' : '') + '"><div class="pl-linkcard-box">' +
      (w.link ? '<a href="' + esc(w.link.href) + '" target="_blank" rel="noopener">' + esc(I.tx(w.link.label)) + '</a>' : '') + '</div>' + cap + '</figure>';
  }
  function works(b, small) {
    return (b.works || []).map(function (w) {
      return work(w, small) + (small ? '' : (w.note ? '<p class="pl-note">' + esc(I.tx(w.note)) + '</p>' : '') +
        (w.link && w.img ? '<p class="pl-ext"><a href="' + esc(w.link.href) + '" target="_blank" rel="noopener">' + esc(I.tx(w.link.label)) + '</a></p>' : ''));
    }).join('');
  }

  /* the lesson's galleries (L.galleries: { <name>: [item] }): one large image at a time, previous / next and a small
     counter. An item: { img, size, alt, artist?, workTitle?, credit? }; img an image of the site
     (images/editorial/<img>.jpg) or of the app (a path, '<dir>/<img>.jpg'), or null: a placeholder in its place (an
     image not cleared for use yet); size [width, height]: the image is shown whole, at its own proportions, its place
     kept before it loads; credit { who, licence?, href }: the photographer (and licence) a photograph is to be named
     with, a small line under the caption, linked to the photograph's page.
     Lesson 2.1 shows its galleries as boards (s.board names one of L.galleries; the board of 2.3, below): all the
     images at once, a tap opens one large with the others to go through. The image the learner looked at last there
     (opened large) is kept in the run (run.seen), and the later screens show it: focus (it, large), pair (two
     galleries' side by side), thumbs (small, to look at again). None opened yet: never the first one in its place; the
     screen that needs one asks for it (s.pick: its line; the gallery's images, small, a tap chooses) */
  var PIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M4 18l5-5 3 3 3-3 5 5"/></svg>';
  var PREV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>', NEXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  function src(img) { var ext = /\.(png|jpe?g|webp)$/i.test(img) ? '' : '.jpg';   // a file that names its own kind (2.3's vase: .png) as it is
    return img.indexOf('/') >= 0 ? esc(img) + ext : IMG + esc(img) + ext; }
  function seenOf(run, L, g) { var n = L.galleries[g].length, i = (run.seen && run.seen[g]) | 0; return ((i % n) + n) % n; }
  /* the image of a gallery the learner chose (run.seen): the one looked at last, or chosen where a screen asked; none
     yet, null */
  function picked(run, L, g) { var i = run.seen && run.seen[g], it = i == null ? null : L.galleries[g][i]; return it && it.img ? it : null; }
  var EXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v6H4V6h6"/></svg>';
  function outLink(href, inner) { return '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' + inner + '<span class="pl-sr"> ' + esc(I.ui('newTab')) + '</span></a>'; }
  /* the caption: the artist, then the work's title and year, smaller, then the credit. short: a long title is cut at a
     word, with its year (the full title stays for screen readers and as the element's title) */
  var SHORT = 28;
  function shortTitle(t) {
    var m = /^(.*), (\d{4})$/.exec(t), name = m ? m[1] : t, year = m ? ', ' + m[2] : '';
    if (name.length <= SHORT) return t;
    var cut = name.slice(0, SHORT), sp = cut.lastIndexOf(' ');
    return (sp > 10 ? cut.slice(0, sp) : cut).replace(/[,;:]$/, '') + '…' + year;
  }
  function caption(it, short) { return '<figcaption>' + captionText(it, short) + '</figcaption>'; }
  function captionText(it, short) {
    var c = it.credit, t = it.workTitle ? I.tx(it.workTitle) : '', v = short ? shortTitle(t) : t;
    return (it.artist ? '<b class="pl-cap-artist">' + esc(I.tx(it.artist)) + '</b>' +
        (v === t ? '<span class="pl-cap-work"><bdi>' + esc(t) + '</bdi></span>'
                 : '<span class="pl-cap-work" title="' + esc(t) + '"><bdi aria-hidden="true">' + esc(v) + '</bdi><span class="pl-sr">' + esc(t) + '</span></span>') : '') +
      (c ? '<small class="pl-credit">' + outLink(c.href, esc(I.ui('photoBy', { who: '' })) + '<bdi>' + esc(c.who) + (c.licence ? ' · <span class="pl-licence">' + esc(c.licence) + '</span>' : '') + '</bdi>') + '</small>' : '');
  }
  /* the image at its own proportions (--r, from size): never cropped, as large as the space allows */
  function ratio(it) { return it.size ? (it.size[0] / it.size[1]).toFixed(4) : '1.3333'; }
  function imgTag(it, alt) {
    return '<img src="' + src(it.img) + '" alt="' + esc(alt) + '" style="--r:' + ratio(it) + '"' + (it.size ? ' width="' + it.size[0] + '" height="' + it.size[1] + '"' : '') + '>';
  }
  function picture(it, cls) {
    return it.img ? '<div class="' + cls + '">' + imgTag(it, I.tx(it.alt)) + '</div>'
      : '<div class="' + cls + ' pl-placeholder" role="img" aria-label="' + esc(I.ui('protoImage') + (it.artist ? ' ' + I.tx(it.artist) + ', ' + I.tx(it.workTitle) : '')) + '">' + PIC + '<span aria-hidden="true">' + esc(I.ui('protoImage')) + '</span></div>';
  }
  function counterOf(i, n) { return '<span aria-hidden="true">' + (i + 1) + '/' + n + '</span><span class="pl-sr">' + esc(I.ui('galleryCount', { n: i + 1, total: n })) + '</span>'; }
  /* a gallery's image, whole, in its frame; it can be looked at large (js/viewer.js) */
  function galPicture(it) { return it.img ? '<div class="pl-gal-frame">' + zoomable(it, 'pl-gal-zoom', true) + '</div>' : picture(it, 'pl-gal-frame'); }
  function gallery(L, run, g) {
    var items = L.galleries[g], i = seenOf(run, L, g);
    return '<section class="pl-gallery" data-gallery="' + esc(g) + '" aria-label="' + esc(I.ui('images')) + '">' +
      '<figure class="pl-gal-fig">' + galPicture(items[i]) + caption(items[i]) + '</figure>' +
      '<div class="pl-gal-nav"><button type="button" class="pl-gal-btn" data-step="-1" aria-label="' + esc(I.ui('galleryPrev')) + '">' + PREV + '</button>' +
      '<span class="pl-gal-count" aria-live="polite">' + counterOf(i, items.length) + '</span>' +
      '<button type="button" class="pl-gal-btn" data-step="1" aria-label="' + esc(I.ui('galleryNext')) + '">' + NEXT + '</button></div></section>';
  }
  function focusOn(L, run, g, line) {
    var it = picked(run, L, g);
    return it ? '<figure class="pl-gal-fig pl-focus">' + galPicture(it) + caption(it) + '</figure>' : pickLine(line) + pickFrom(L, g, false);
  }
  /* the invitation to choose an image (s.pick): the line once, then each gallery's images, small (named: under its
     artist's name); a tap chooses one, and the screen shows it in its place */
  function pickLine(line) { return line ? '<p class="pl-text pl-q pl-pick-line">' + esc(I.tx(line)) + '</p>' : ''; }
  function pickFrom(L, g, named) {
    var items = L.galleries[g], who = named && items[0].artist ? I.tx(items[0].artist) : '';
    return '<section class="pl-pick" data-pick-gallery="' + esc(g) + '" role="group" aria-label="' + esc(who || I.ui('images')) + '">' +
      (who ? '<b class="pl-pick-who" aria-hidden="true">' + esc(who) + '</b>' : '') + '<ul class="pl-thumbs">' + items.map(function (it, i) {
        return it.img ? '<li><button type="button" class="pl-thumb pl-pick-btn" data-pick="' + i + '" style="--r:' + ratio(it) + '" aria-label="' + esc(I.ui('pick', { what: I.tx(it.alt) })) + '">' + imgTag(it, '') + '</button></li>' : '';
      }).join('') + '</ul></section>';
  }
  /* an image to look at large (js/viewer.js): a button around it, named for what it shows; only to look at, it changes
     nothing. zooms: this screen's items, by number */
  var zooms = [], ZOOM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4h5v5"/><path d="M20 4l-6 6"/><path d="M9 20H4v-5"/><path d="M4 20l6-6"/></svg>';
  function zoomable(it, cls, badge) {
    if (!it.img) return picture(it, cls);
    return '<button type="button" class="pl-zoom ' + cls + '" style="--r:' + ratio(it) + '" data-zoom="' + (zooms.push(it) - 1) + '" aria-label="' + esc(I.ui('enlarge', { what: I.tx(it.alt) })) + '">' +
      imgTag(it, '') + (badge ? '<span class="pl-zoom-badge">' + ZOOM + '</span>' : '') + '</button>';
  }
  function pair(L, run, gs, line) {
    var missing = gs.filter(function (g) { return !picked(run, L, g); });
    if (missing.length) return pickLine(line) + missing.map(function (g) { return pickFrom(L, g, true); }).join('');
    return '<div class="pl-duo">' + gs.map(function (g) { var it = picked(run, L, g); return '<figure class="pl-duo-fig">' + zoomable(it, 'pl-duo-img', true) + caption(it, true) + '</figure>'; }).join('') + '</div>';
  }
  /* thumbs: small, each to look at large with the others to go through (2.1 screen 7); seen: the learner's image of
     each of those galleries (one not chosen: none in its place) */
  function thumbs(L, run, t) {
    var list = [];
    (t.all || []).forEach(function (g) { list = list.concat(L.galleries[g]); });
    (t.seen || []).forEach(function (g) { var it = picked(run, L, g); if (it) list.push(it); });
    return '<ul class="pl-thumbs">' + list.map(function (it) {
      return '<li>' + (it.img ? zoomable(it, 'pl-thumb') : '<span class="pl-thumb pl-placeholder" aria-hidden="true">' + PIC + '</span>') + '</li>';
    }).join('') + '</ul>';
  }

  /* "Want to discover more?": a few artists to look at outside the lesson, on their own or a museum's site (a new tab;
     no image of theirs is copied here; the lesson and the work stay as they are in this one). An item: { name, site
     (what the page is), href }. 2.3: { intro, links, title } (its line under the heading; while no link has been
     checked for the learners' age, a placeholder in their place; title: the lesson's own heading, 16 October 2026) */
  function more(m) {
    var list = Array.isArray(m) ? m : m.links || [], h = m.title ? I.tx(m.title) : I.ui('exploreMore');
    return '<section class="pl-more" aria-label="' + esc(h) + '"><h3>' + esc(h) + '</h3>' +
      (m.intro ? '<p class="pl-more-intro">' + I.tx(m.intro) + '</p>' : '') +
      (list.length ? '<ul>' + list.map(function (x) {
        return '<li>' + outLink(x.href, '<span class="pl-more-text"><b>' + esc(I.tx(x.name)) + '</b><span class="pl-more-site">' + esc(I.tx(x.site)) + '</span></span>' + EXT) + '</li>';
      }).join('') + '</ul>' : '<p class="pl-more-none pl-placeholder">' + esc(I.ui('protoLinks')) + '</p>') + '</section>';
  }

  /* s.source (2.1): where the screen's artwork comes from and its licence, quiet, under "Source and rights" (opened with a
     tap; as 2.2's viewer): { who, licence, href, note? } */
  function source(c) {
    return '<details class="pl-source"><summary>' + esc(I.ui('sourceRights')) + '</summary><p>' + (c.note ? esc(I.tx(c.note)) + '. ' : '') +
      outLink(c.href, '<bdi>' + esc(c.who) + '</bdi>') + ' · ' + esc(I.tx(c.licence)) + '</p></details>';
  }
  /* Inspiration (2.1): the lesson's one gallery over the screen (js/inspiration.js), at a section or whole; closing comes
     back here as it was. A button: { label, section? } */
  var INSP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="13" height="11" rx="1.5"/><path d="M8 19h12a1 1 0 001-1V9"/><path d="M5 14l3-3 2.5 2.5L13 11l3 3"/></svg>';
  function inspireBtn(b) { return '<p class="pl-inspire-row"><button type="button" class="pl-inspire"' + (b.section ? ' data-section="' + esc(b.section) + '"' : '') + '>' + INSP + '<span>' + esc(I.tx(b.label)) + '</span></button></p>'; }
  function inspire(id, section, from) { if (window.Inspiration) window.Inspiration.open({ lesson: id, lang: I.lang(), base: '', section: section || null, from: from }); }

  /* a board (lesson 2.3, L.boards): every image of a gallery seen at once, each at its own proportions; a tap shows it
     large, and in the large view previous / next go through them all (js/viewer.js). An item is an image
     { img, size, alt, artist?, workTitle?, note? }, or a set of images shown side by side ({ set: [image], artist?,
     note? }: the vase in three lights, two of Monet's cathedrals), or an artwork that may not be shown ({ win: { href,
     label }, artist, workTitle, note }: a window in its place with the link to the museum; nothing of it is copied
     here). An image whose file does not exist yet (img null) is a placeholder, never something else in its place.
     note: words about the work, shown only once it is opened large, never before the looking. wide: on a wide screen,
     a row of its own (the others two by two). label (an image of a set): its name under it, to compare them (2.3, the
     vase: strong light, soft light, shadow), also under it opened large.
     2.1 (its galleries as boards): L.boardColumns, two columns on a phone as well (a group of six to browse); L.boardCaptions,
     an artwork's short caption under it (artist, title and the photograph's credit, as on screen 6) */
  function boardItems(L, g) { return (L.boards && L.boards[g]) || L.galleries[g]; }
  function boardViews(items) {
    var out = [];
    items.forEach(function (it) {
      if (it.set) it.set.forEach(function (s) { out.push({ it: Object.assign({ artist: it.artist, note: it.note }, s) }); });
      else out.push({ it: it });
    });
    return out;
  }
  var WIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>';
  function viewCaption(it) {
    return (it.artist ? captionText(it) : it.label ? '<p class="pl-view-label">' + esc(I.tx(it.label)) + '</p>' : '') + (it.note ? '<div class="pl-view-note">' + (it.note[I.lang()] || []).map(function (v) { return '<p>' + v + '</p>'; }).join('') + '</div>' : '');
  }
  function board(L, g) {
    var k = 0;
    function under(it, inner) { return L.boardCaptions && it.artist && it.img ? '<figure class="pl-tile-fig">' + inner + caption(it, true) + '</figure>' : inner; }
    function cell(it) {
      var n = k++;
      if (it.win) return '<button type="button" class="pl-win" data-view="' + n + '" aria-label="' + esc(I.ui('artworkWindow') + ': ' + I.tx(it.artist) + ', ' + I.tx(it.workTitle)) + '">' + WIN +
        '<b>' + esc(I.tx(it.artist)) + '</b><span><bdi>' + esc(I.tx(it.workTitle)) + '</bdi></span><small>' + esc(I.ui('artworkWindow')) + '</small></button>';
      if (!it.img) return '<div class="pl-board-ph pl-placeholder" role="img" aria-label="' + esc(I.ui('protoImage') + ' ' + I.tx(it.alt)) + '">' + PIC + '</div>';
      return '<button type="button" class="pl-zoom pl-board-img" style="--r:' + ratio(it) + '" data-view="' + n + '" aria-label="' + esc(I.ui('enlarge', { what: I.tx(it.alt) })) + '">' + imgTag(it, '') +
        (L.bareImages ? '' : '<span class="pl-zoom-badge">' + ZOOM + '</span>') + '</button>';   // L.bareImages (2.2): nothing over the picture
    }
    return '<section class="pl-board' + (L.boardColumns ? ' pl-board-cols' : '') + '" data-board="' + esc(g) + '" aria-label="' + esc(I.ui('images')) + '"><ul>' + boardItems(L, g).map(function (it) {
      if (!it.set) return '<li class="pl-tile' + (it.win ? ' pl-tile-win' : '') + (it.wide ? ' pl-tile-wide' : '') + '"' + (it.img ? ' style="--r:' + ratio(it) + '"' : '') + '>' + under(it, cell(it)) + '</li>';
      var none = !it.set.some(function (s) { return s.img; });
      /* an image of a set with its name under it (label) */
      function labelled(s, inner) {
        return s.label ? '<div class="pl-set-cell"' + (s.img ? ' style="--r:' + ratio(s) + '"' : '') + '>' + inner + '<span class="pl-set-label" aria-hidden="true">' + esc(I.tx(s.label)) + '</span></div>' : inner;
      }
      /* a set with none of its images yet (the vase): a frame in the place of each, and what will be there */
      return '<li class="pl-tile pl-tile-set">' + (none ? '<div class="pl-set pl-set-ph" role="img" aria-label="' + esc(I.ui('protoImage') + ' ' + I.tx(it.alt) +
          it.set.filter(function (s) { return s.label; }).map(function (s) { return ', ' + I.tx(s.label); }).join('')) + '">' +
        it.set.map(function (s) { k++; return labelled(s, '<div class="pl-board-ph pl-placeholder">' + PIC + '</div>'); }).join('') + '</div>' +
        '<p class="pl-ph-cap" aria-hidden="true">' + esc(I.tx(it.alt)) + ' · ' + esc(I.ui('protoImage')) + '</p>'
        : '<div class="pl-set">' + it.set.map(function (s) { return labelled(s, cell(Object.assign({ artist: it.artist, note: it.note }, s))); }).join('') + '</div>') + '</li>';
    }).join('') + '</ul></section>';
  }
  /* the board's large view: every image and window of it, in order (placeholders passed over); onShow (2.1): told
     which of the board's images is shown large */
  function boardOpen(L, g, n, from, onShow) {
    var views = boardViews(boardItems(L, g)).map(function (v, i) { return { i: i, it: v.it }; }).filter(function (v) { return v.it.img || v.it.win; }), at = 0;
    var list = views.map(function (v, j) {
      var it = v.it; if (v.i === n) at = j;
      if (it.win) return { win: '<p class="pl-win-big">' + WIN + '<b>' + esc(I.tx(it.artist)) + '</b><span><bdi>' + esc(I.tx(it.workTitle)) + '</bdi></span></p>' +
        '<p class="pl-win-why">' + esc(I.ui('artworkWindowWhy')) + '</p><p>' + outLink(it.win.href, esc(I.tx(it.win.label)) + EXT) + '</p>',
        alt: I.tx(it.artist) + ', ' + I.tx(it.workTitle), caption: it.note ? viewCaption({ note: it.note }) : '' };
      return { src: src(it.img), alt: I.tx(it.alt), ratio: ratio(it), caption: viewCaption(it), note: !!it.note };
    });
    window.Viewer.open({ list: list, at: at, from: from, big: !!L.bigViewer, onShow: onShow ? function (j) { onShow(views[j].i); } : null });
  }

  /* "Inspiration" (2.3 on paper, side.refs: the boards): every image of the lesson's boards, all of them first, even
     and whole; a tap shows one large, with the others to go through (js/viewer.js). Only to look at */
  var REFS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="13" height="11" rx="1.5"/><path d="M8 19h12a1 1 0 001-1V9"/><path d="M5 14l3-3 2.5 2.5L13 11l3 3"/></svg>';
  function refsOpen(L, boards, from) {
    var list = [];
    boards.forEach(function (g) {
      boardViews(L.boards[g]).forEach(function (v) {
        var it = v.it;
        if (it.img) list.push({ src: src(it.img), alt: I.tx(it.alt), ratio: ratio(it), caption: it.artist ? captionText(it) : '' });
      });
    });
    window.Viewer.open({ list: list, grid: { title: I.ui('inspirationTitle') }, from: from });
  }

  /* the work of an artwork, if the Studio made any (its preview and operations) */
  function made(w) { return w && w.ops && w.ops.length ? w : null; }
  function hasRepeat(w) { return !!(w && (w.ops || []).some(function (o) { return o.t === 'repeat'; })); }
  function kept(w) { return ((w && w.points) || []).filter(function (p) { return p.kind === 'kept'; }); }
  function figure(img, label) {
    return '<figure class="pl-version"><img src="' + img + '" alt="">' + (label ? '<figcaption>' + esc(label) + '</figcaption>' : '') + '</figure>';
  }
  /* a screen's words, a paragraph each; a guidance for the looking (the whole line <span class="pl-hint">) is quieter */
  function lines(t) { return ((t && t[I.lang()]) || []).map(function (v) { return '<p class="pl-text' + (/^<span class="pl-hint">/.test(v) ? ' pl-hint' : '') + '">' + v + '</p>'; }).join(''); }

  /* ── one screen ── */
  /* a screen: the run and its artwork first (the store answers later), then the screen; a newer screen asked for
     meanwhile wins */
  var asked = 0, revealed = {}, picking = false;   // picking: an image was just chosen on this screen (2.1)
  var choosing = null;   // 2.1 screen 8: the choice shown again from the paper's screen ('<lesson>:<screen>'), for that one showing
  function render(root, id, n, nav) {
    var my = ++asked;
    runOf(id).then(function (run) {
      /* nav.medium (2.1, from the Studio's "Creating on paper"): the run goes on on paper; its artwork stays as it is (a
         drawing in it is kept, and opens again from "Continue to Studio"); the address drops /paper, nothing reloads */
      if (nav.medium && run.medium !== nav.medium) { run.medium = nav.medium; W.putRun(run); }
      if (nav.medium && history.replaceState) history.replaceState(null, '', '#/lesson/' + id + '/play/' + n);
      return Promise.all([run, run.artwork ? W.get(run.artwork) : null]);
    })
      .then(function (r) { if (my === asked) show(root, id, n, nav, r[0], r[1]); });
  }
  function show(root, id, n, nav, run, art) {
    zooms = [];
    var L = window.APP_LESSONS[id], A = window.AppAdapters[L.adapter](window.LESSON_PAGE), count = L.screens.length;
    var s = L.screens[n - 1], studio = run.medium === 'studio';
    var side = (studio ? s.studio : s.paper) || {};   // from screen 11, the words and actions of the learner's way
    var ACT = function (k) { return I.tx(L.actions[k]); };
    function keep() { return W.putRun(run); }
    function go(k) { return keep().then(function () { nav.go(k); }); }
    /* the Studio on the run's artwork, back to screen `back` */
    function openStudio(activity, back, more) {
      (run.artwork ? Promise.resolve() : W.artworkFor(run.id, 'digital').then(function (w) { run.artwork = w.id; })).then(function () {
        var href = 'studio/index.html#activity=' + encodeURIComponent(activity) + '&art=' + encodeURIComponent(run.artwork) +
          '&back=' + encodeURIComponent('../index.html#/lesson/' + id + '/play/' + (back || n)) + (L.works ? '&at=' + n : '') + (more || '');
        return keep().then(function () { nav.studio(href); });
      });
    }
    var few = !studio || kept(art).length < 2;   // screen 15 only with two or more kept possibilities (never on paper)
    var free = 0;   // the last screen of free making (3.1: 14; the Studio's own screen in 2.1: 12)
    L.screens.forEach(function (x, i) { if (x.step === 'free' || x.step === 'studio') free = i + 1; });
    if (s.step === 'choose' && few) return nav.go(n + 1);

    var blocks = (s.src || []).map(A.block);
    var title = '';
    blocks.forEach(function (b) { if (!title) title = A.title(b); });
    if (s.title && s.title[I.lang()]) title = s.title[I.lang()];
    if (s.step === 'studio' && !studio && side.title) title = I.tx(side.title);   // 2.3: the making screen on paper, its own title
    var rows = [];
    var own = s.rows || {};   // the player's own words for a row, in this language (else the lesson's)
    blocks.forEach(function (b) { if (b.kind !== 'close') A.rows(b).forEach(function (r) {
      if (s.only && s.only.indexOf(r.k) < 0) return;
      rows.push(own[r.k] && own[r.k][I.lang()] != null ? { k: r.k, parts: [{ text: own[r.k] }] } : r);
    }); });
    /* L.wordsFirst (2.1): on a screen with images the screen's words come first, the images after them, so its question
       is never under the images, cut off by the bottom of a small screen */
    /* s.ask (2.3): the screen's question, a line of its own after its words (the opening and the question apart).
       side.steps (2.3 on paper): what to do, step by step, before the screen's quieter words; s.steps (2.3 screen 4): the
       same, for both ways (the task before the choice) */
    /* s.askFirst (2.1, Taeuber-Arp's second screen, 21 October 2026): only the question above the images, as on the
       screen before it, so the same work stays where it was; the screen's other words under the images */
    /* s.askWith (2.1, Taeuber-Arp's two screens): the question in a box shared with the other screen's question, laid in the
       same place unseen (and unread), so the box is as high as the longer one on both screens, at any width and in any
       language, and the work under it does not move between them */
    var askHtml = function () {
      if (!s.ask) return '';
      var q = '<p class="pl-text pl-q">' + I.tx(s.ask) + '</p>';
      return s.askWith ? '<div class="pl-qbox">' + q + '<p class="pl-text pl-q pl-qsize" aria-hidden="true">' + I.tx(s.askWith) + '</p></div>' : q;
    };
    var words = function (part) {
      var steps = side.steps || s.steps, st = steps && steps[I.lang()];
      if (part === 'ask') return askHtml();
      return (st ? '<ol class="pl-steps pl-do-steps">' + st.map(function (v) { return '<li>' + v + '</li>'; }).join('') + '</ol>' : '') +
        lines(side.text || s.text) + (part === 'text' ? '' : askHtml());
    };
    /* s.kind (2.2): a screen drawn by a lesson's own kind (window.PlayerKinds, js/closeup.js): { html, action, extra, later,
       mount(root) }; it gets what the player knows of the screen and may show it again */
    var kd = s.kind && window.PlayerKinds && window.PlayerKinds[s.kind] ? window.PlayerKinds[s.kind]({
      L: L, id: id, n: n, s: s, side: side, run: run, art: art, studio: studio, nav: nav, root: root, keep: keep, go: go, openStudio: openStudio,
      again: function () { show(root, id, n, nav, run, art); }, ACT: ACT, made: made
    }) : null;
    var images = s.gallery || s.focus || s.pair || s.thumbs || s.board || (kd && kd.html), split = !!(L.wordsFirst && images && s.askFirst);
    var first = L.wordsFirst && images ? words(split ? 'ask' : null) : '';
    var moreHtml = s.more ? more(s.more) : '';
    var body = first + (kd ? kd.html : '') + (s.board && !kd ? board(L, s.board) : '') + (s.gallery ? gallery(L, run, s.gallery) : '') + (s.focus ? focusOn(L, run, s.focus, s.pick) : '') +
      (s.pair ? pair(L, run, s.pair, s.pick) : '') + (s.thumbs ? thumbs(L, run, s.thumbs) : '') +
      (s.media ? media(s.media, L) : '') +
      (s.compare ? '<div class="pl-pair">' + s.compare.map(function (r) { return works(A.block(r), true); }).join('') + '</div>'
                 : blocks.filter(function (b) { return b.works; }).map(function (b) { return works(b, false); }).join('')) +
      (s.gap ? proto(I.ui(s.gap)) : '') +
      rows.filter(function (r) { return r.k === 'do'; }).map(row).join('') +
      rows.filter(function (r) { return r.k !== 'do'; }).map(row).join('') +
      (split ? words('text') : first ? '' : words()) + (s.source ? source(s.source) : '') + moreHtml;
    var action = { label: I.ui('continue'), go: function () { go(n + 1); } }, extra = null, later = null, again = null;
    /* 2.1: an image the screen needs and the learner has not chosen yet: "Continue" once it is chosen (s.pick) */
    if ((s.focus && !picked(run, L, s.focus)) || (s.pair && s.pair.some(function (g) { return !picked(run, L, g); }))) action.off = true;
    var work = studio && made(art), preview = work ? '<figure class="pl-studio-work"><img src="' + work.preview + '" alt=""></figure>' : '';

    /* 3, 4: what the learner sees first; the word for it only once "Continue" is pressed */
    if (s.reveal) {
      var shown = revealed[id + ':' + n];
      if (shown) body += '<p class="pl-reveal">' + esc(I.tx(s.reveal)) + '</p>';
      else action.go = function () { revealed[id + ':' + n] = true; show(root, id, n, nav, run, art); };
    }
    /* 9: paper or Studio; once the work has begun, that way stays (another way is a new artwork). s.switchable (2.1): the
       learner may change it at any time; the run keeps its one artwork (Artworks.artworkFor: an empty paper one becomes
       the Studio's, a Studio work with something in it stays as it is, and the Studio opens on it again) */
    if (s.step === 'medium') {
      var again = choosing === id + ':' + n; choosing = null;
      var paperWork = !studio && run.medium === 'paper' && side.first;
      if (paperWork && !again) {
        /* on paper (2.1, s.paper): the work on paper has a screen of its own in the place of the choice (the same step,
           not a numbered one): its title, the first unit's words, on to the pattern; and back to the choice */
        title = I.tx(side.title); body = lines(side.first);
        action = { label: ACT('toPattern'), go: function () { run.begun = true; go(n + 1); } };
        extra = { label: ACT('toChoice'), go: function () { choosing = id + ':' + n; show(root, id, n, nav, run, art); } };
      } else {
        var locked = !s.switchable && !!(run.begun || made(art));
        body += '<div class="pl-choices">' + ['paper', 'studio'].map(function (m) {
          return '<button type="button" class="pl-choice" data-medium="' + m + '" aria-pressed="' + (run.medium === m) + '"' + (locked && run.medium !== m ? ' disabled' : '') + '>' +
            (m === 'paper' ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 13l6-6"/></svg>'
                           : '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8"/><path d="M8 13l3-3 2 2 3-3"/></svg>') +
            '<span>' + esc(I.tx(s.choices[m])) + '</span></button>';
        }).join('') + '</div>';
        action = run.medium ? action : null;
        if (paperWork) action.go = function () { show(root, id, n, nav, run, art); };   // the choice again, paper kept: its screen
        if (studio && s.studio && made(art)) extra = { label: I.ui('reopen'), go: function () { openStudio(s.studio.activity, s.studio.back); } };
      }
    }
    /* the question before Repeat (2.1 screen 9): Studio, once there is a drawing; paper, its own words */
    if (s.step === 'ask') {
      if (studio) { body += preview; action = { label: ACT('seeWhat'), off: !work, go: function () { if (work) go(n + 1); } }; }
      else action.go = function () { run.begun = true; go(n + 1); };
    }
    /* the Studio's own screen (2.1: 10, 12): arriving, the artwork opens there; on paper, the paper's words */
    if (s.step === 'studio' && studio) {
      run.screen = n;
      root.innerHTML = '<main class="pl-main pl-step-studio" data-screen="' + n + '"></main>';
      openStudio(side.activity, side.back);
      return;
    }
    /* the paper workspace (2.1, side.stages; one screen, approved 21 October 2026): the whole way at once, its stages in
       order, nothing to press between them; "I've finished creating" to the end, and "Continue to Studio" straight into
       the Studio on the run's artwork (a drawing already in it opens as it was; an empty paper one becomes the Studio's,
       Artworks.artworkFor), no choice screen on the way */
    if (s.step === 'studio' && !studio && side.stages) {
      body = (kd && kd.lead || '') + '<ol class="pl-stages pl-stages-all">' + (side.stages[I.lang()] || []).map(function (v) { return '<li>' + v + '</li>'; }).join('') + '</ol>' + body;   // kd.lead (2.2): the detail chosen, above the stages
      action = { label: ACT('finishedCreating'), go: function () { run.begun = true; go(n + 1); } };
      if (s.studio && s.studio.activity) extra = { label: ACT('toStudio'), button: true, go: function () {
        run.medium = 'studio';
        keep().then(function () { return W.artworkFor(run.id, 'digital'); })
          .then(function (w) { run.artwork = w.id; openStudio(s.studio.activity, s.studio.back); });
      } };
    }
    if (side.inspire && !(s.step === 'studio' && studio)) body += inspireBtn(side.inspire);
    if (s.step === 'studio' && !studio && side.action) action.label = ACT(side.action);
    if (s.step === 'studio' && !studio && side.refs) body += '<button type="button" class="pl-refs">' + REFS + '<span>' + esc(I.ui('inspiration')) + '</span></button>';
    /* looking at what emerged (2.1: 11): then straight back to the making */
    if (s.step === 'notice' && studio) { body += preview; action = { label: ACT('keepCreating'), go: function () { go(n + 1); } }; }
    /* 10: the work begins (Studio: the drawing tools only) */
    if (s.step === 'begin') {
      var begun = function () { run.begun = true; go(n + 1); };
      action = { label: I.ui('continue'), go: begun };
      if (studio) {
        body += preview;
        if (work) extra = { label: I.ui('reopen'), go: function () { openStudio(s.studio.activity); } };
        else action = { label: I.ui('openStudio'), go: function () { openStudio(s.studio.activity); } };
      }
    }
    /* 11: Repeat enters the work (Studio: once, on the work there is; then screen 12) */
    if (s.step === 'repeat' && studio) {
      body += preview;
      if (!hasRepeat(art)) action = { label: ACT('tryRepeat'), off: !work, go: function () { if (work) openStudio(side.activity, side.back); } };
    }
    /* 12: look; back to the drawing (the source, then "see it repeat again" back here), or develop it */
    if (s.step === 'look' && studio) {
      body += preview;
      action = { label: ACT('develop'), go: function () { go(n + 1); } };
      extra = { label: ACT('backToDrawing'), go: function () { openStudio(side.activity, n); } };
    }
    /* 13: one thing to change */
    if (s.step === 'change') {
      var long = Object.keys(side.choices).some(function (c) { return I.tx(side.choices[c]).length > 8; });   // a long name: one under another
      body += '<div class="pl-changes' + (long ? ' pl-stack' : '') + '" role="group"><div>' + Object.keys(side.choices).map(function (c) {
        return '<button type="button" class="pl-change" data-change="' + c + '" aria-pressed="' + (run.change === c) + '">' + esc(I.tx(side.choices[c])) + '</button>';
      }).join('') + '</div></div>';
      action.off = !run.change;
    }
    /* 14: try possibilities (Studio: that one setting, drawing, "keep this") */
    if (s.step === 'try') {
      action.go = function () { go(few ? n + 2 : n + 1); };   // past the choice (15 in 2.1) when there is none to make
      if (studio) {
        body += preview;
        var openTry = function () { run.tried = true; openStudio(side.activity + run.change); };
        if (run.tried) extra = { label: I.ui('reopen'), go: openTry };
        else action = { label: I.ui('openStudio'), go: openTry };
      }
    }
    /* 15: which kept possibility to go on with (two or more); it becomes the work, the others stay */
    if (s.step === 'choose') {
      body += '<div class="pl-options">' + kept(art).map(function (p) {
        return '<button type="button" class="pl-option" data-point="' + esc(p.id) + '" aria-pressed="' + (run.chosen === p.id) + '"><img src="' + p.state.preview + '" alt=""></button>';
      }).join('') + '</div>';
      action = { label: I.ui('continue'), off: !run.chosen, go: function () {
        if (!run.chosen) return;
        W.restorePoint(run.artwork, run.chosen).then(function () { go(n + 1); });
      } };
    }
    /* 16: free (Studio: all the tools, the setting of screen 13 first) */
    if (s.step === 'free' && studio) {
      body += preview;
      var openFree = function () { run.free = true; openStudio(side.activity, n, '&control=' + encodeURIComponent(run.change || 'size')); };
      if (run.free) extra = { label: ACT('keepCreating'), go: openFree };
      else action = { label: ACT('keepCreating'), go: openFree };
    }
    if (s.step === 'free' && !studio) action.label = ACT('doneForNow');   // paper: time to make; the learner says when it is enough for now
    /* back to the artwork (3.1 screen 13): the Studio opens on it, and comes back to the free screen after it */
    if (s.step === 'return' && studio) {
      body += preview;
      action = { label: ACT('keepCreating'), go: function () { run.free = true; openStudio(side.activity, side.back); } };
    }
    if (s.step === 'see' || (s.step === 'end' && s.work)) body = moreHtml ? body.replace(moreHtml, preview + moreHtml) : body + preview;   // s.work (2.3): the end screen shows the work (2.1: before the artists to discover)
    /* the end (2.1: 18): go on making, or another time (the work stays as it is, open) */
    if (s.step === 'end') {
      action = { label: ACT('anotherTime'), go: function () { run.done = true; keep().then(nav.finish); } };
      extra = { label: ACT('keepCreating'), go: function () {
        if (studio) openStudio(s.studio.activity, n, '&control=' + encodeURIComponent(run.change || 'size')); else go(free);
      } };
      /* L.works (2.1): My artworks is the main way out; "another time" stays, quieter */
      if (L.works) { later = action; action = { label: I.ui('gallery'), go: function () { run.done = true; keep().then(function () { nav.works(n); }); } }; }
      /* L.retry (2.3): another attempt, a new artwork; this one stays as it is, in My artworks. A new run, from screen
         L.retry (where paper or Studio is chosen) */
      if (L.retry) again = { label: I.ui('newAttempt'), go: function () { run.done = true; keep().then(function () { return W.newRun(id); }).then(function () { nav.go(L.retry); }); } };
    }
    if (s.step === 'repeat' && studio && hasRepeat(art)) action = { label: I.ui('continue'), go: function () { go(n + 1); } };

    if (s.inspire) body += inspireBtn(s.inspire);   // a quiet button in the screen (2.1: the choice screen)
    if (s.inspireFoot) extra = { label: I.tx(s.inspireFoot.label), go: function () { inspire(id, s.inspireFoot.section, root.querySelector('.pl-secondary')); } };
    if (kd && kd.action !== undefined) action = kd.action;
    if (kd && kd.extra !== undefined) extra = kd.extra;
    if (kd && kd.later !== undefined) later = kd.later;
    /* s.mains (2.2's end, 22 October 2026): two main ways on, "Keep creating" (extra) and the screen's own (later: "Choose another
       area"), both as main buttons; a new attempt and My artworks (action) under them, quieter. The same actions, only their weight */
    var main2 = null;
    if (s.step === 'end' && s.mains && extra && later) { main2 = later; later = action; action = extra; extra = null; }
    /* s.keepMain (2.2's end, 23 October 2026): "Keep creating" the one main button; My artworks, another area and a new attempt quieter */
    if (s.step === 'end' && s.keepMain && extra) { var k0 = action; action = extra; extra = k0; }
    root.innerHTML =
      '<header class="pl-top">' +
        '<button type="button" class="pl-back" aria-label="' + esc(I.ui('back')) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>' +
        '<div class="pl-id"><span>' + esc(I.ui('lesson')) + ' ' + esc(A.lesson.number) + '</span> · ' + esc(I.tx(A.lesson.title)) + '</div>' +
        (L.works ? '<a class="pl-works" href="' + nav.worksHref(n) + '" aria-label="' + esc(I.ui('gallery')) + '" title="' + esc(I.ui('gallery')) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/></svg></a>' : '') +
        '<span class="pl-count" aria-label="' + n + '/' + count + '">' + n + '/' + count + '</span>' +
        '<div class="pl-progress" aria-hidden="true"><i style="width:' + (n / count * 100).toFixed(2) + '%"></i></div>' +
      '</header>' +
      '<main class="pl-main' + (s.step ? ' pl-step-' + s.step : '') + '" data-screen="' + n + '" tabindex="-1"><div class="pl-inner">' +
        (title ? '<h2 class="pl-title">' + esc(title) + '</h2>' : '') + body + '@@INLINE@@</div></main>' +
      '<footer class="pl-foot' + (s.step === 'end' ? ' pl-foot-end' + (s.keepMain ? ' pl-foot-keep' : '') : '') + '">' + (extra ? '<button type="button" class="pl-secondary' + (extra.button ? ' pl-alt' : '') + '">' + esc(extra.label) + '</button>' : '') +
        (later ? '<button type="button" class="pl-secondary pl-later">' + esc(later.label) + '</button>' : '') +
        (again ? '<button type="button" class="pl-secondary pl-again">' + esc(again.label) + '</button>' : '') +
        (action ? '<button type="button" class="pl-primary"' + (action.off ? ' disabled' : '') + '>' + esc(action.label) + '</button>' : '') + '</footer>';
    if (main2) root.innerHTML = root.innerHTML.replace(/<footer class="pl-foot pl-foot-end">[\s\S]*<\/footer>/, '<footer class="pl-foot pl-foot-end pl-foot-mains"><div class="pl-mains">' +
      '<button type="button" class="pl-primary">' + esc(action.label) + '</button><button type="button" class="pl-primary pl-main2">' + esc(main2.label) + '</button></div>' +
      '<div class="pl-quiet">' + (again ? '<button type="button" class="pl-secondary pl-again">' + esc(again.label) + '</button>' : '') +
      '<button type="button" class="pl-secondary pl-later">' + esc(later.label) + '</button></div></footer>');
    /* kd.inline (2.2 screen 6, "A Closer Look"): the screen is a tool that needs the whole screen, so its buttons come at the end of
       its content, in the flow, with room under them, and no bar is fixed over what the learner is working with */
    var html = root.innerHTML;
    if (kd && kd.inline) {
      var m = html.match(/<footer class="pl-foot[^>]*>[\s\S]*<\/footer>$/);
      if (m) root.innerHTML = html.replace(m[0], '').replace('@@INLINE@@', m[0].replace('class="pl-foot', 'class="pl-foot pl-foot-inline'));
    } else root.innerHTML = html.replace('@@INLINE@@', '');
    root.className = 'app player' + (kd && kd.inline ? ' pl-inline' : '') + (L.wide ? ' pl-wide' : '');   // L.wide (2.1): the projector's width (css/app.css)

    root.querySelector('.pl-back').addEventListener('click', function () {
      if (n === 1) return nav.exit();
      var prev = L.screens[n - 2];
      go(prev && ((prev.step === 'choose' && few) || (prev.step === 'studio' && studio)) ? n - 2 : n - 1);   // a choice skipped on the way, or the Studio's own screen, is passed over going back
    });
    if (action) root.querySelector('.pl-primary').addEventListener('click', function () { if (!action.off) action.go(); });
    if (extra) root.querySelector('.pl-secondary').addEventListener('click', extra.go);
    if (later) root.querySelector('.pl-later').addEventListener('click', later.go);
    if (again) root.querySelector('.pl-again').addEventListener('click', again.go);
    if (main2) root.querySelector('.pl-main2').addEventListener('click', main2.go);
    root.querySelectorAll('.pl-choice').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.disabled) return;
        run.medium = b.getAttribute('data-medium');
        keep().then(function () { return W.artworkFor(run.id, run.medium === 'studio' ? 'digital' : 'paper'); })
          .then(function (w) { run.artwork = w.id; return keep(); }).then(function () {
            if (run.medium === 'studio' && s.studio && s.studio.activity) openStudio(s.studio.activity, s.studio.back);   // 2.1: begin at once
            else if (s.paper && s.paper.first) show(root, id, n, nav, run, art);   // 2.1 on paper: the paper's own screen
            else nav.go(n + 1);
          });
      });
    });
    /* a gallery: previous / next (buttons, arrow keys, a swipe); only its image and counter change */
    var swiped = 0;
    function zoomOn(b) {
      b.addEventListener('click', function () {
        if (Date.now() - swiped < 500) return;
        var it = zooms[+b.getAttribute('data-zoom')];
        window.Viewer.open({ src: b.querySelector('img').getAttribute('src'), alt: I.tx(it.alt), ratio: ratio(it), caption: it.artist ? captionText(it) : '', from: b });
      });
    }
    root.querySelectorAll('.pl-gallery').forEach(function (box) {
      var g = box.getAttribute('data-gallery'), items = L.galleries[g], rtl = I.dir() === 'rtl';
      function preload(i) { var it = items[((i % items.length) + items.length) % items.length]; if (it.img) new Image().src = src(it.img); }
      function move(d) {
        run.seen = run.seen || {};
        var i = ((seenOf(run, L, g) + d) % items.length + items.length) % items.length;
        run.seen[g] = i;
        box.querySelector('.pl-gal-fig').innerHTML = galPicture(items[i]) + caption(items[i]);
        box.querySelector('.pl-gal-count').innerHTML = counterOf(i, items.length);
        box.querySelectorAll('.pl-zoom').forEach(zoomOn);
        box.querySelectorAll('.pl-gal-fig img').forEach(function (im) { if (!im.complete) im.addEventListener('load', cue); });
        preload(i + d); keep(); cue();
      }
      box.querySelectorAll('.pl-gal-btn').forEach(function (b) { b.addEventListener('click', function () { move(+b.getAttribute('data-step')); }); });
      box.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault(); move((e.key === 'ArrowRight') !== rtl ? 1 : -1);
      });
      var x0 = null, fig = box.querySelector('.pl-gal-fig');
      fig.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
      fig.addEventListener('pointerup', function (e) {
        if (x0 === null) return; var dx = e.clientX - x0; x0 = null;
        if (Math.abs(dx) > 40) { swiped = Date.now(); move((dx < 0) !== rtl ? 1 : -1); }   // towards the next one: left in LTR, right in RTL
      });
      preload(seenOf(run, L, g) + 1); preload(seenOf(run, L, g) - 1);
    });
    /* an image, large: the whole image, its caption; closing comes back here, where it was (a swipe is not a tap) */
    root.querySelectorAll('.pl-zoom:not([data-view]):not(.pl-thumb)').forEach(zoomOn);
    /* small images (2.1 screen 7): one large, with the others to go through */
    root.querySelectorAll('.pl-thumbs').forEach(function (ul) {
      var bs = [].slice.call(ul.querySelectorAll('.pl-zoom')), list = bs.map(function (b) {
        var it = zooms[+b.getAttribute('data-zoom')];
        return { src: src(it.img), alt: I.tx(it.alt), ratio: ratio(it), caption: it.artist ? captionText(it) : '' };
      });
      bs.forEach(function (b, j) { b.addEventListener('click', function () { window.Viewer.open({ list: list, at: j, from: b }); }); });
    });
    root.querySelectorAll('.pl-inspire').forEach(function (b) { b.addEventListener('click', function () { inspire(id, b.getAttribute('data-section'), b); }); });
    root.querySelectorAll('.pl-refs').forEach(function (b) { b.addEventListener('click', function () { refsOpen(L, side.refs, b); }); });
    /* a board's image or window: large, with all the board's others to go through */
    root.querySelectorAll('.pl-board').forEach(function (box) {
      /* 2.1: a board of the lesson's galleries; the image shown large last is the learner's, for the screens after it */
      var g = box.getAttribute('data-board'), mine = L.galleries && L.galleries[g] ? function (i) { run.seen = run.seen || {}; run.seen[g] = i; keep(); } : null;
      box.querySelectorAll('[data-view]').forEach(function (b) {
        b.addEventListener('click', function () { boardOpen(L, g, +b.getAttribute('data-view'), b, mine); });
      });
    });
    /* 2.1: the image chosen where the screen asked for one; the screen again, with it in its place */
    root.querySelectorAll('.pl-pick').forEach(function (box) {
      var g = box.getAttribute('data-pick-gallery');
      box.querySelectorAll('[data-pick]').forEach(function (b) {
        b.addEventListener('click', function () {
          run.seen = run.seen || {}; run.seen[g] = +b.getAttribute('data-pick'); picking = true;
          keep().then(function () { show(root, id, n, nav, run, art); });
        });
      });
    });
    /* the bottom of the screen: when the words or images go on below it, a soft edge over "Continue" says so */
    var main = root.querySelector('.pl-main'), foot = root.querySelector('.pl-foot');
    /* a screen whose content takes less than half of its room (words only, a short question) is centred in it */
    function sparse() { if (!main) return; var inner = main.firstElementChild; main.classList.remove('pl-sparse'); var low = inner && inner.offsetHeight < main.clientHeight * 0.5; main.classList.toggle('pl-sparse', !!low); }
    function cue() { sparse(); if (foot && main) foot.classList.toggle('pl-lift', main.scrollHeight - main.scrollTop - main.clientHeight > 6); }
    if (main) {
      main.addEventListener('scroll', cue, { passive: true });
      main.querySelectorAll('img').forEach(function (im) { if (!im.complete) im.addEventListener('load', cue); });
      if (window.ResizeObserver) new ResizeObserver(cue).observe(main);
      cue();
    }
    root.querySelectorAll('.pl-change').forEach(function (b) {
      b.addEventListener('click', function () { run.change = b.getAttribute('data-change'); keep().then(function () { show(root, id, n, nav, run, art); }); });
    });
    root.querySelectorAll('.pl-option').forEach(function (b) {
      b.addEventListener('click', function () { run.chosen = b.getAttribute('data-point'); keep().then(function () { show(root, id, n, nav, run, art); }); });
    });
    run.screen = n; keep();
    if (kd && kd.mount) kd.mount(root);
    root.querySelector('.pl-main').focus({ preventScroll: true });
    /* just chosen (2.1): the focus to the next choice, or to the image now in its place */
    if (picking) { picking = false; var f = root.querySelector('.pl-pick-btn') || root.querySelector('.pl-focus .pl-zoom, .pl-duo .pl-zoom'); if (f) f.focus(); }
  }
  return { render: render, run: runOf, made: made, src: src, esc: esc, pin: pin };
})();

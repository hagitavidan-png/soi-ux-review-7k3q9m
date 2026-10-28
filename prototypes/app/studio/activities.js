/* Activities: each one says which tools the studio shows (the learner never sees the word "capability").
   tools      the studio's tools for this activity: "draw", "color", "repeat", "fill", "arrange".
              The studio places their buttons in a fixed order (V1's: brush, colour, size, eraser)
   canvas     the aspect ratio of the artwork, the same on every screen and in any orientation
   back       where "Back to the lesson" goes (a path inside this site); ?back= can override it
   params     settings for a tool, under its name (repeat: see js/repeat.js)
   content    what the activity provides to work on (fill: the areas, see js/fill.js; arrange: the elements, js/arrange.js)
   title      optional; the default is "My artwork"
   clear      false: no "Clear" (app prototype)
   restart    app prototype: "Start over" in the place of "Clear" (its own words and question; with Repeat in the work,
              Repeat stays: js/core.js, js/repeat.js)
   keep       app prototype, an artwork that saves itself (?art=): one button that keeps the work as it is now as a
              development point ('kept'); keep.label is its label in each language (none in a language: no button)
   workspace  'floating' (the default): the page first, the floating toolbar in three states (lesson 2.2, version 49, approved on
              the author's device); 'classic': the layouts made before it, kept until each move is approved (the list at the end)
   primaryTools  the toolbar ids shown in the floating toolbar's compact state, in the toolbar's order; without it brush,
              eraser, colour, line width and undo (ARCHITECTURE.md)
   backEnd    true: "Back" goes to the lesson's end screen, and says so ("To the end of the lesson"; the author's approval of 28
              October 2026, after the UX review: where it goes stays as it was)
   promptLine true: in the floating workspace the line (prompt) stays above the work, as in the classic layouts; without it the
              line is said once, briefly, as the Studio opens (2.2) */
window.STUDIO_ACTIVITIES = {
  drawing: {
    id: 'drawing',
    lesson: 'prototype',
    tools: ['draw', 'color'],
    canvas: { aspect: '4:5' },   /* portrait: the most drawing area on phones and tablets held upright */
    back: '../../lesson-pages/lesson-2-1-learner.html'
  },
  pattern: {
    id: 'pattern',
    lesson: 'prototype',
    tools: ['draw', 'repeat'],
    canvas: { aspect: '4:3' },
    params: { repeat: { modes: ['grid', 'offset'], step: 250 } },
    back: '../../lesson-pages/lesson-2-1-learner.html'
  },
  /* lesson 2.1, step 9 of the independent learner version: the same as pattern, back to the lesson's "create" part */
  'pattern-2-1': {
    id: 'pattern-2-1',
    lesson: '2.1',
    tools: ['draw', 'repeat'],
    canvas: { aspect: '4:3' },
    params: { repeat: { modes: ['grid', 'offset'], step: 250 } },
    back: '../../lesson-pages/lesson-2-1-learner.html#create'
  },
  /* the app prototype (prototypes/app/): lesson 2.1, screen 10; back to that screen of the Lesson Player */
  'pattern-2-1-app': {
    id: 'pattern-2-1-app',
    lesson: '2.1-app',
    tools: ['draw', 'repeat'],
    canvas: { aspect: '4:3' },
    params: { repeat: { modes: ['grid', 'offset'], step: 250 } },
    back: '../index.html#/lesson/2-1/play/10'
  },
  /* the same work, version 2 (screen 11, change one thing only): one entry per thing that may change, all with the
     same id, so all save version 2 under one key and version 1 stays as it was. Only the repeat: no drawing, no
     kind of repeat, no clearing (draw shows the lines only); the Lesson Player starts it from a copy of version 1 */
  'pattern-2-1-app-v2-size': {
    id: 'pattern-2-1-app-v2', lesson: '2.1-app', tools: ['draw', 'repeat'], canvas: { aspect: '4:3' },
    params: { draw: { view: true }, repeat: { modes: ['grid', 'offset'], step: 250, vary: 'size' } },
    back: '../index.html#/lesson/2-1/play/11'
  },
  'pattern-2-1-app-v2-direction': {
    id: 'pattern-2-1-app-v2', lesson: '2.1-app', tools: ['draw', 'repeat'], canvas: { aspect: '4:3' },
    params: { draw: { view: true }, repeat: { modes: ['grid', 'offset'], step: 250, vary: 'direction' } },
    back: '../index.html#/lesson/2-1/play/11'
  },
  'pattern-2-1-app-v2-spacing': {
    id: 'pattern-2-1-app-v2', lesson: '2.1-app', tools: ['draw', 'repeat'], canvas: { aspect: '4:3' },
    params: { draw: { view: true }, repeat: { modes: ['grid', 'offset'], step: 250, vary: 'spacing' } },
    back: '../index.html#/lesson/2-1/play/11'
  },

  color: {
    id: 'color',
    lesson: 'prototype',
    tools: ['color', 'fill'],
    canvas: { aspect: '4:3' },
    /* an abstract composition of seven areas (artwork 1000 × 750): a large field with a circle inside it,
       two areas under it divided on a slant, and three areas of different heights on the right */
    content: {
      regions: [
        { id: 'field', d: 'M0 0H620V430H0Z M490 230A130 130 0 1 0 230 230A130 130 0 1 0 490 230Z' },
        { id: 'circle', d: 'M490 230A130 130 0 1 0 230 230A130 130 0 1 0 490 230Z' },
        { id: 'low-left', d: 'M0 430H380L260 750H0Z' },
        { id: 'low-right', d: 'M380 430H620V750H260Z' },
        { id: 'top-right', d: 'M620 0H1000V260H620Z' },
        { id: 'right', d: 'M620 260H1000V600H620Z' },
        { id: 'strip', d: 'M620 600H1000V750H620Z' }
      ]
    },
    back: '../../lesson-pages/lesson-2-1-learner.html'
  },
  composition: {
    id: 'composition',
    lesson: 'prototype',
    tools: ['arrange', 'draw'],
    canvas: { aspect: '4:3' },
    /* five abstract elements (artwork 1000 × 750), back to front: one large, two medium, two small */
    content: {
      elements: [
        { id: 'mass', x: 300, y: 220, w: 380, h: 300, color: '#e08a2e', d: 'M40 150C20 60 120 0 210 20C300 40 380 80 370 170C360 260 270 300 180 290C90 280 60 240 40 150Z' },
        { id: 'column', x: 200, y: 160, w: 110, h: 300, color: '#2b2a28', d: 'M0 0H110V300H0Z' },
        { id: 'disc', x: 560, y: 110, w: 200, h: 200, color: '#2f6fa8', d: 'M200 100A100 100 0 1 0 0 100A100 100 0 1 0 200 100Z' },
        { id: 'bar', x: 620, y: 570, w: 200, h: 36, color: '#5d8a4f', d: 'M0 0H200V36H0Z' },
        { id: 'dot', x: 840, y: 190, w: 60, h: 60, color: '#c8423b', d: 'M60 30A30 30 0 1 0 0 30A30 30 0 1 0 60 30Z' }
      ]
    },
    back: '../../lesson-pages/lesson-2-1-learner.html'
  }
};

/* the app prototype's lesson 2.1, the new flow: one artwork through the lesson, opened in the Studio again and again
   (?art=; the Lesson Player says where "Back" goes, ?back=). Only configuration: the tools are the same everywhere.
     2-1-begin            screen 10: the work begins; drawing, colour, line width, eraser, undo, redo; no Repeat (the
                          rebuilt flow below: the unit alone once Repeat is in the work)
     2-1-repeat           screen 11: Repeat enters the work (a 'before-repeat' point first), in a grid; no control yet
     2-1-change-<kind>    screen 14: one Repeat setting to change (size, rotation or spacing), drawing as before,
                          and "keep this possibility"
     2-1-source           screen 12, "back to the drawing": the source only (Repeat and what followed set aside and
                          kept), drawing as on screen 10; "see it repeat again" goes back to the lesson
     2-1-continue         screen 16: all three settings, one at a time (tabs); the first shown: ?control=
   None has "Clear"; none can let Repeat enter a second time. The labels are in the flow's languages (lessons/2-1.js
   langs): a label missing in a language leaves its button out */
(function (A) {
  var KEEP = { label: { he: 'את זה אני רוצה לשמור', en: 'I want to keep this one' } };
  function lesson21(id, repeat, more) {
    var a = { id: id, lesson: '2.1-app', tools: repeat ? ['draw', 'color', 'repeat'] : ['draw', 'color'], canvas: { aspect: '4:3' },
              clear: false, back: '../index.html#/lesson/2-1' };
    if (repeat) a.params = { repeat: Object.assign({ modes: ['grid'], step: 250, asStep: true }, repeat) };
    A[id] = Object.assign(a, more || {});
  }
  lesson21('2-1-begin', null);
  lesson21('2-1-repeat', { enter: true });
  ['size', 'rotation', 'spacing'].forEach(function (k) { lesson21('2-1-change-' + k, { control: k }, { keep: KEEP }); });
  lesson21('2-1-source', {}, { source: true, next: { label: { he: 'לראות שוב בחזרה', en: 'See it repeated again' } } });
  lesson21('2-1-continue', { controls: ['size', 'rotation', 'spacing'] });
  /* 2.1 rebuilt: Repeat appears by itself (a moment after the Studio opens), then Size, Direction and Spacing all at
     once, with the drawing tools; then the same without a new Repeat; "Keep creating" and My artworks the same.
     Live repeat (live): once Repeat entered, every new line repeats as it is drawn, and Repeat can be switched off and
     on. "Start over" (restart) on every screen of the rebuilt flow, the first one (2-1-begin) too */
  var ALL = ['size', 'rotation', 'spacing'];
  /* the first drawing's way on: the work written, then the lesson's next screen (9: the question, and the learner's own
     "See what happens" before Repeat appears); never Repeat itself. "Start over" stays the quieter button.
     unit: back on the first drawing once Repeat is in the work (screen 8 again), the unit alone, and a new line is a line
     of the unit, so the next Repeat takes it (js/repeat.js); Repeat neither shown nor entering here, no controls */
  lesson21('2-1-begin', { live: true, unit: true }, { restart: true,
    prompt: { he: 'ציירו את היחידה הראשונה שלכם. אפשר להתנסות, לשנות ולהתחיל מחדש.', en: 'Draw your first unit. You can experiment, change things and start over.' },
    next: { label: { he: 'ממשיכים ליצירת דפוס', en: 'Next: make a pattern' } } });
  lesson21('2-1-play', { enter: true, reveal: true, controls: ALL, together: true, live: true }, { restart: true,
    prompt: { he: 'מה יקרה אם תשנו רק דבר אחד? ומה יקרה אם תשנו כמה דברים יחד?', en: 'What happens if you change just one thing? And what if you change several things together?' },
    next: { label: { he: 'לגלות מה נוצר', en: 'Discover what emerged' } } });
  lesson21('2-1-develop', { controls: ALL, together: true, live: true }, { restart: true, next: { label: { he: 'סיימתי לעכשיו', en: "I'm done for now" } } });
  lesson21('2-1-free', { controls: ALL, together: true, live: true, offer: true }, { restart: true });   // offer: Repeat by the switch (js/repeat.js)
  /* 2.1 redesign (the author's approval, 20 October 2026): ONE Studio visit, from the learner's own unit to its pattern
     and beyond. The unit first, Repeat not active (offer: nothing repeats); "Continue to create a pattern" (seeIt, js/repeat.js) makes
     the drawing as it is the repeated unit, with the short appearing, without leaving the Studio; then Size, Direction and
     Spacing together, live repeat, "Back to drawing the unit" as before. promptAfter: the line once Repeat is in the work.
     content.inspiration: the lesson's one Inspiration gallery (js/refs.js, ../js/inspiration.js). The earlier activities
     stay as they are, for the works made with them; 2-1-free (Keep creating, My artworks) gets the gallery too */
  lesson21('2-1-create', { offer: true, seeIt: true, controls: ALL, together: true, live: true }, { restart: true,
    prompt: { he: 'ציירו יחידה באופן חופשי', en: 'Draw a unit freely' },   // (approved, 20 October 2026)
    promptAfter: { he: 'מה יקרה אם תשנו רק דבר אחד? ומה יקרה אם תשנו כמה דברים יחד?', en: 'What happens if you change just one thing? And what if you change several things together?' },
    next: { label: { he: 'סיימתי לעכשיו', en: "I'm done for now" } }, content: { inspiration: '2-1' } });
  /* 21 October 2026 (approved): a new work begun on an upright phone is on a 4:5 page (canvas.portrait, js/core.js), its
     own shape from then on; and "Creating on paper" in "More" goes to the lesson's paper screen (its route sets the run
     to paper, the drawing kept: ../js/app.js, js/player.js) */
  A['2-1-create'].backEnd = A['2-1-free'].backEnd = true;   // "Back" goes to the lesson's end screen: it says so (28 October 2026; "Keep creating" too, the words only)
  ['2-1-create', '2-1-free'].forEach(function (id) { A[id].canvas = { aspect: '4:3', portrait: '4:5', landscape: '16:10' }; });   // landscape: a new work on a tablet held sideways (22 October 2026)
  A['2-1-create'].paper = { href: '../index.html#/lesson/2-1/play/6/paper', label: { he: 'יוצרים על נייר', en: 'Creating on paper' } };
  A['2-1-create'].tools.push('refs');
  A['2-1-free'].tools.push('refs'); A['2-1-free'].content = { inspiration: '2-1' };
  /* compact (studio.css): the work the centre of the screen, the controls as small as a finger allows; works: My
     artworks in the top bar of the lesson's Studio screens (10, 12), back to the same screen */
  ['2-1-begin', '2-1-play', '2-1-develop', '2-1-free', '2-1-create'].forEach(function (id) { A[id].compact = true; });
  A['2-1-play'].works = A['2-1-develop'].works = A['2-1-create'].works = '2-1';
  /* Keep creating and My artworks (2-1-free) end as the lesson's own visit does (the author, 22 October 2026, after the
     review on an iPad): "I'm done for now", the work written first, then back where it came from (the lesson's end
     screen, or My artworks); and My artworks in the bar */
  A['2-1-free'].next = { label: { he: 'סיימתי לעכשיו', en: "I'm done for now" } };
  A['2-1-free'].works = '2-1';
})(window.STUDIO_ACTIVITIES);

/* the app prototype's lesson 3.1: one artwork, drawn from the music and developed after it; drawing, colour, line
   width, eraser, undo, redo (no Repeat, no Clear) on every screen it opens from (5, 13, 14, 16) and from My artworks */
window.STUDIO_ACTIVITIES['3-1-draw'] = { id: '3-1-draw', lesson: '3.1-app', tools: ['draw', 'color'], canvas: { aspect: '4:3' },
  clear: false, back: '../index.html#/lesson/3-1' };

/* the app prototype's lesson 2.3, "Same Thing, Different Light" (the app's id is 2-2: the site's file for this lesson is
   lesson-2-2). The page 4:5, as large as the screen allows (not compact: that layout keeps 2.1's 4:3 paper on phones).
   One artwork in each attempt: drawing, colour, line width, eraser, and light and shadow (js/light.js),
   undo, redo, "Start over"; the lesson's images to look at while working (js/refs.js; first the vase in its three
   lights, 16 October 2026). The same activity from the lesson's Studio screen and from My artworks.
   prompt: the lesson's one question for the making, a line above the work as in 2.1 (the author's words, after her
   review of preview Version 5); 2.3 has one making step, so it is the same question wherever the work is opened,
   My artworks too (2.1's line belongs to one step of its own, 2-1-play) */
window.STUDIO_ACTIVITIES['2-3-light'] = { id: '2-3-light', lesson: '2.3-app', tools: ['draw', 'color', 'light', 'refs'], canvas: { aspect: '4:5' },
  /* the shared workspace (stage 2, approved 25 October 2026): the page first, the floating toolbar in three states. The compact
     toolbar as in every lesson (the author's approval of 28 October 2026, after the UX review): brush, eraser, colour, line width
     and undo, with the lesson's own tool, light and shadow, beside them */
  workspace: 'floating', primaryTools: ['brush', 'eraser', 'color', 'size', 'tone', 'undo'], promptLine: true,   // promptLine: the approved line stays above the work
  clear: false, restart: true, works: '2-2', back: '../index.html#/lesson/2-2', backEnd: true,
  prompt: { he: 'איך אור וצל יכולים לשנות את הציור שלכם?', en: 'How can light and shadow transform your artwork?' },
  next: { label: { he: 'סיימתי לעכשיו', en: "I'm done for now" } },
  /* (the line over the Light & Shadow controls, content.toneHint, gave way on 28 October 2026 to the tool's own small picture and
     words, js/light.js) */
  content: {
    refs: [
    { src: '../images/2-3/vase-strong-light.png', alt: { he: 'האגרטל באור חזק', en: 'The vase in strong light' } },
    { src: '../images/2-3/vase-soft-light.png', alt: { he: 'האגרטל באור רך', en: 'The vase in soft light' } },
    { src: '../images/2-3/vase-shadow.png', alt: { he: 'האגרטל בצל', en: 'The vase in shadow' } },
    { src: '../images/2-3/light-water-pebbles.jpg', alt: { he: 'קווי אור על חלוקי אבן במים רדודים', en: 'Lines of light on pebbles in shallow water' } },
    { src: '../images/2-3/light-leaf-shadow.jpg', alt: { he: 'עלה אדום והצל שלו על מדרכה', en: 'A red leaf and its shadow on a pavement' } },
    { src: '../images/2-3/light-window-room.jpg', alt: { he: 'אור מחלון חוצה חדר ונוחת על רצפת לבנים', en: 'Light from a window crossing a room onto a brick floor' } },
    { src: '../images/2-3/monet-rouen-west-facade-1894.jpg', alt: { he: 'קלוד מונה, הקתדרלה ברואן, החזית המערבית, 1894', en: 'Claude Monet, Rouen Cathedral, West Façade, 1894' } },
    { src: '../images/2-3/monet-rouen-west-facade-sunlight-1894.jpg', alt: { he: 'קלוד מונה, הקתדרלה ברואן, החזית המערבית באור שמש, 1894', en: 'Claude Monet, Rouen Cathedral, West Façade, Sunlight, 1894' } },
    { src: '../images/2-3/sorolla-sewing-the-sail-1896.jpg', alt: { he: 'חואקין סורויה, תפירת המפרש, 1896', en: 'Joaquín Sorolla, Sewing the Sail, 1896' } },
    { src: '../images/2-3/sargent-simplon-pass-1911.jpg', alt: { he: "ג'ון סינגר סרג'נט, מעבר סימפלון, 1911", en: 'John Singer Sargent, Simplon Pass, 1911' } },
    { src: '../images/2-3/heade-cattleya-orchid-hummingbirds-1871.jpg', alt: { he: "מרטין ג'ונסון היד, סחלב קטליה ושלושה יונקי דבש, 1871", en: 'Martin Johnson Heade, Cattleya Orchid and Three Hummingbirds, 1871' } }
  ] } };

/* lesson 2.2 "Up Close", the drawing (screen 7 of 8; it comes back to the end, …/play/end, and "My details" to …/play/discover: links by
   stage, 25 October 2026; screen 5 → 6 before it, 6 → 7 before 24 October): a portrait page, drawing and colour, no Repeat. One visit,
   as 2.1's (the author's approval, 23 October 2026): the detail chosen beside the page as a reference, never under it or over it,
   "My details" in the top bar (js/detail.js), the lesson's Inspiration behind the eye (never opened by itself), "Creating on paper" in
   "More", "I'm done for now"; and the light table back as a tool of its own, off until the learner takes it (js/table.js). The line
   above the work follows the lesson's task */
window.STUDIO_ACTIVITIES['2-2-close-draw'] = { id: '2-2-close-draw', lesson: '2.2-app', tools: ['draw', 'color', 'table', 'detail', 'refs'], canvas: { aspect: '4:5' },
  workspace: 'floating',   // the page first (version 41) and the floating toolbar in three states (versions 44–49, approved on the author's device): the shared workspace (ARCHITECTURE.md)
  primaryTools: ['brush', 'eraser', 'color', 'size', 'table', 'undo'],   // the light table among the compact tools, as light and shadow in 2.3 (UX review, 28 October 2026)
  clear: false, restart: true, works: '2-2-close', back: '../index.html#/lesson/2-2-close/play/end', backEnd: true,
  prompt: { he: 'צרו מהפרט שבחרתם משהו חדש.', en: 'Create something new from the detail you chose.' },
  next: { label: { he: 'סיימתי לעכשיו', en: "I'm done for now" } },
  paper: { href: '../index.html#/lesson/2-2-close/play/7/paper', label: { he: 'יוצרים על נייר', en: 'Creating on paper' } },
  content: { lesson: '2-2-close', inspiration: '2-2-close' } };

/* the workspace (ARCHITECTURE.md, approved 25 October 2026): the activities made before the shared workspace keep the layout they were
   made with ('classic': lesson 2.1's and 3.1's, and the earlier prototypes) until the move of each is approved on its own (2.3: moved,
   stage 2). An
   activity added after this gets the shared workspace ('floating') unless it says otherwise */
['drawing', 'pattern', 'pattern-2-1', 'pattern-2-1-app', 'pattern-2-1-app-v2-size', 'pattern-2-1-app-v2-direction', 'pattern-2-1-app-v2-spacing',
 'color', 'composition', '2-1-begin', '2-1-repeat', '2-1-change-size', '2-1-change-rotation', '2-1-change-spacing', '2-1-source', '2-1-continue',
 '2-1-play', '2-1-develop', '2-1-free', '2-1-create', '3-1-draw'].forEach(function (id) { window.STUDIO_ACTIVITIES[id].workspace = 'classic'; });

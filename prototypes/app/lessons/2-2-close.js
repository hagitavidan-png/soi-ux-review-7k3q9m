/* Lesson 2.2, "Up Close", in the Lesson Player. Its app id is 2-2-close: the app's id 2-2 is lesson 2.3 (the earlier
   numbering, "Same Thing, Different Light"), and this lesson's site file is lesson-2-3.html, so the app finds it by the
   nav path below (js/app.js lessonIds), not by the file's number. The pedagogy, the 13 screens and the words (the
   [מאושר] ones approved, the [חדש] ones a draft for the author): PEDAGOGICAL_MASTER, section 10. The images: images/2-2/
   (previews, 960 px; clear-rights candidates only; SOURCES.md there).
   The direction (the author's, 17 October 2026): the lesson is about discovering unexpected visual worlds by looking closely, and
   making personal work from what is found (textures, colours, shapes, spaces, unexpected associations; abstract or figurative);
   not repetition, patterns or geometric structures (lesson 2.1's), and nothing to copy or to find again. The images of an earlier screen 2:
   N3, N4, N6, N7, approved (19 October 2026; N10 and N11 left it and stay in "A Closer Look"). C1 (oil and water on yellow) is
   approved too, waiting for its original high-resolution file: not here until it is.
   The flow (6 screens, from 24 October 2026, the author's approval; before it 7, 8, 11 and 13). The idea: close observation reveals
   forms, lines, textures and structures that are easily overlooked, and these can start new work. Three close-ups, each moved back
   from to see all of it, one question once all three are seen (1) → two artists, Blossfeldt and O'Keeffe, one work each, and what
   they chose to focus on; Haeckel optional, in the lesson's Inspiration (2) → "A Closer Look", free exploration, one to three
   details saved by the learner (3) → one detail chosen, the task, paper or Studio (4) → creating: one Studio visit (the detail
   beside the page, Inspiration, an optional light table) or one paper screen as in 2.1 (5) → the detail and the work side by side,
   one question (6). After the drawing has begun the learner may choose another area on the same artwork (from 6, or from the
   Studio's "My details"): screen 3 again, "Back to my drawing"; nothing is deleted, no new artwork is made.
   25 October 2026 (the author's approval of the mockups): 8 screens. "A Closer Look" became two: the gallery, six photographs and four
   more on request (3), and one photograph looked at closely (4); "From Detail to Artwork" became two: one detail, my details under it
   (5), and paper or Studio (6). "Choose another area" now comes back to 4. The sand ripples and the cut onion left the gallery. The small figures placed
   on a detail (screen 2 of the 7) were removed on 24 October 2026: the lesson is about looking and transforming, not miniature worlds.
   What the run keeps (run.close, js/closeup.js): the source, up to three saved worlds, the chosen world, the areas
   chosen in order (the last is the current one) and the answer of screen 12. The learner's own photo (upload, camera) is
   off until its privacy and storage are approved: L.closeup.personalPhoto.
   The screens with s.kind are drawn by js/closeup.js (window.PlayerKinds, js/player.js).
   Studio: 2-2-close-draw (studio/activities.js): drawing, colour, "My detail" (studio/js/detail.js). */
window.APP_LESSONS = window.APP_LESSONS || {};
(function () {
  var P = 'images/2-2/';
  /* a Wikimedia Commons file's page, from its name */
  function C(file) { return 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file.replace(/ /g, '_')); }
  function nat(id, size, he, en, who, licence, file) {
    return { id: id, img: P + id, hi: P + 'hi/' + id, size: size, alt: { he: he, en: en }, credit: { who: who, licence: licence, href: C(file) } };
  }
  /* the photographs (candidates N1–N12 of PEDAGOGICAL_MASTER, section 10). Ten are the gallery's; the sand ripples (n12) and the cut
     onion (n10) left it on 25 October 2026 (the author) and stay here only so that a detail saved from them earlier is still shown */
  function pick(ids) { return ids.map(function (id) { return NATURE.filter(function (n) { return n.id === id; })[0]; }); }
  var NATURE = [
    nat('n1', [960, 720], 'ברוקולי רומנסקו', 'Romanesco', 'Benoît Prieur', 'CC0', 'Chou romanesco - Boucheries André (Rillieux-la-Pape) - 1.jpg'),
    nat('n2', [960, 1440], 'אלוורה ספירלי, מלמעלה', 'Spiral aloe, from above', 'Pseudopanax', 'Public domain', 'Spiral aloe spirals from top.jpg'),
    nat('n3', [960, 640], 'חזזית כתומה על בטון', 'Orange lichen on concrete', 'Pseudopanax', 'Public domain', 'Orange lichen (Xanthoria parietina) on concrete.jpg'),
    nat('n4', [960, 703], 'בועה קפואה וגבישי קרח', 'A frozen bubble with ice crystals', 'Aaron Burden', 'CC0', 'Frozen snowflake bubble (Unsplash).jpg'),
    nat('n5', [960, 769], 'ראש זרעים של שן הארי', 'A dandelion seed head', 'Jebulon', 'CC0', 'Taraxacum obovatum seedhead.jpg'),
    nat('n6', [960, 636], 'דליה מקרוב', 'A dahlia, close up', 'Konatom1', 'CC0', 'DSC 2800.jpg'),
    nat('n7', [960, 639], 'קקטוס חבית, קוצים ופרחים', 'A barrel cactus, thorns and flowers', 'Gentry George, U.S. Fish and Wildlife Service', 'Public domain', 'Close up of a flowering barrel cactus with its thorns.jpg'),
    nat('n8', [960, 840], 'מאובן של שפירית', 'A dragonfly fossil', 'National Park Service', 'Public domain', 'Zacallites cockerelli FOBU.jpg'),
    nat('n9', [960, 739], 'דבורת בנייה, מלמעלה', 'A mason bee, from above', 'USGS Bee Inventory and Monitoring Lab', 'Public domain', 'Osmia trevoris, F, back - Park Co., Wyoming - 2015-11-20-23.38 - USGS Bee Inventory and Monitoring Laboratory.jpg'),
    nat('n10', [960, 1577], 'בצל סגול חתוך', 'A red onion, cut', 'Amada44', 'Public domain', 'Red onion cut.jpg'),
    nat('n11', [960, 720], 'צבע מתקלף', 'Peeling paint', 'Georges Grondin', 'Public domain', 'Painted conrete.jpg'),
    nat('n12', [960, 720], 'אדוות בחול', 'Sand ripples', 'NOAA Photo Library', 'Public domain', 'Line6809 (27662155890).jpg')
  ];
  /* the gallery (the author's choice, 25 October 2026): six first, for their variety (colour, texture, light, abstraction, contrast,
     structure), and four more on "Explore more photographs"; the romanesco and the spiral aloe, the repeating forms of lesson 2.1,
     last. A run keeps its photograph by its id, so the order changes nothing kept */
  var ORDER = ['n6', 'n3', 'n4', 'n11', 'n7', 'n9', 'n5', 'n8', 'n2', 'n1'], FIRST = 6, RETIRED = ['n10', 'n12'];
  var GALLERY = pick(ORDER), OUT = pick(RETIRED);
  function art(id, size, artist, work, alt, who, licence, file) {
    return { img: P + id, size: size, artist: artist, workTitle: work, alt: alt, credit: { who: who, licence: licence, href: C(file) } };
  }

  window.APP_LESSONS['2-2-close'] = {
    adapter: 'guide',
    unit: 'unit02',
    nav: { unit: 'unit02', path: 'lessons/lesson-2-3.html', title: { he: 'מקרוב מאוד', en: 'Up Close' } },
    langs: ['he', 'en'],
    artworkActivity: '2-2-close-draw',   // the Studio activity "My artworks" opens an artwork of this lesson in
    wordsFirst: true,                    // a screen with images: its words (and its question) first, then the images
    boardCaptions: true,                 // the artist and the work under each image of a board
    bigViewer: true,                     // a picture of the lesson opens as large as the phone allows (js/viewer.js big)
    boardColumns: true,                  // a board's images two across on a phone as well: related works side by side, to compare (2.1's pattern)
    bareImages: true,                    // nothing over a picture: no zoom badge on a board's images (the author, 19 October 2026; js/player.js)
    works: true,                         // My artworks: an icon in the top bar, and the end screen's main button
    retry: 3,                            // "New attempt" at the end: a new run, from screen 3 (the gallery; "A Closer Look" before 25 October 2026)
    paperScreen: 7,                      // …/play/N/paper always opens the paper screen (7): a Studio opened before 25 October 2026 still links to 5 (js/app.js)
    intro: {
      info: { he: 'כ־50 דקות · {n} שלבים', en: 'About 50 minutes · {n} steps' },
      subtitle: { he: 'צורות, קווים ומרקמים שמתגלים מקרוב', en: 'Forms, lines and textures revealed up close' },   // (24 October 2026; before: "A whole world in a small detail")
      /* the lesson's central question (the author's, 17 October 2026) */
      question: { he: 'מה מתגלה כשמסתכלים ממש מקרוב, ומה אפשר ליצור מתוך מה שגילינו?', en: 'What can we discover by looking really closely, and what can we create from what we find?' },
      start: { he: 'מתחילים את השיעור', en: 'Start the lesson' },
      resume: { he: 'ממשיכים מהמקום שעצרתי', en: 'Continue where I left off' }
    },
    page: {
      number: '2.2', unitNum: '02',
      title: { he: 'מקרוב מאוד', en: 'Up Close' },
      unit: { he: 'מבט החוצה', en: 'Looking Outward' },
      time: null,
      sections: {}
    },
    /* "A Closer Look" (the author's name for the tool, 17 October 2026) and its screens (js/closeup.js) */
    closeup: {
      personalPhoto: false,   // upload and camera: off until the privacy and storage of a personal photo are approved
      gallery: GALLERY,       // screen 3: the photographs to choose from, in order; screen 4: the one chosen
      first: FIRST,           // screen 3 shows the first six; the others on "Explore more photographs" (kept open in the run)
      retired: OUT,           // out of the gallery: found by id only, for a detail saved from them before 25 October 2026
      zoom: [2, 8],           // the frame: from half of the image's shorter side to an eighth of it
      worlds: 3,              // the details a learner may save (the author, 22 October 2026; it was 24): at the limit, one swapped for another
      /* screen 1 (24 October 2026; zooming in, 24 October 2026): three photographs, whole at first, each close-up x5 (from) at its point (at): the fossil's wing (structure and lines), the
         lichen's cups (organic shapes and textures), the ice in the bubble (abstract forms and patterns). From their 1920 px files
         (hi/) until the approved larger files of the same Commons photographs are in (zoom: the file to use, SOURCES.md) */
      shrink: { list: [{ src: 'n8', from: 5, at: '68% 24%' },
                       { src: 'n3', from: 5, at: '70% 70%' },
                       { src: 'n4', from: 5, at: '56% 36%' }] },
      /* screen 2 (23 October 2026): one work each */
      pair: {
        blossfeldt: { img: P + 'b4', size: [960, 1245], name: { he: 'קרל בלוספלדט', en: 'Karl Blossfeldt' }, way: { he: 'צילום', en: 'Photography' },
                      work: { he: 'אקנתוס רך, 1928', en: 'Acanthus mollis, 1928' }, alt: { he: 'קרל בלוספלדט, אקנתוס רך, 1928', en: 'Karl Blossfeldt, Acanthus mollis, 1928' },
                      guess: { he: 'מה זה נראה לכם?', en: 'What does this look like to you?' },
                      text: { he: 'בלוספלדט צילם צמחים מקרוב, ובצילומיו חלקים קטנים של צמחים נראים כמו פסלים או מבנים.', en: 'Blossfeldt photographed plants up close, and in his photographs small parts of plants look like sculptures or buildings.' },
                      credit: { who: 'Getty Open Content', licence: 'Public domain', href: C('Karl Blossfeldt. Acanthus mollis, 1928.jpg') } },
        okeeffe: { name: { he: 'ג׳ורג׳יה אוקיף', en: "Georgia O'Keeffe" }, way: { he: 'ציור', en: 'Painting' }, work: { he: 'פרח לבן, 1932', en: 'Jimson Weed/White Flower No. 1, 1932' },
                   text: { he: 'אוקיף ציירה פרחים מקרוב כל כך, עד שהפרטים הקטנים הפכו לצורות גדולות ומפתיעות.', en: "O'Keeffe painted flowers so close up that their small details became large, surprising shapes." } }
      },
      stays: { src: 'n6', caption: { he: 'אותו פרח, שלוש דרכי הסתכלות', en: 'The same flower, three ways of looking' } },   // screen 6: whole · enlarged · cropped, one image
      okeeffe: { img: P + 'd1', size: [960, 960], href: 'https://crystalbridges.org/artworks/2014-35',
                 credit: { who: 'Dlarsen', licence: 'Public domain', href: C('Datura wrightii flower2.jpg') } }
    },
    /* the artists' gallery (screen 3): each with the board of its works (boards below) or its own interaction (okeeffe) */
    artists: [
      { id: 'blossfeldt', name: { he: 'קרל בלוספלדט', en: 'Karl Blossfeldt' }, way: { he: 'צילום', en: 'Photography' }, board: 'blossfeldt',
        text: { he: ['קרל בלוספלדט צילם צמחים מקרוב וחשף פרטים וצורות שקשה להבחין בהם במבט רגיל. בצילומיו, חלקים קטנים של צמחים נראים לעיתים כמו פסלים או מבנים.',
                     'כשמסתכלים מקרוב, צורות מוכרות יכולות להיראות כמו משהו אחר לגמרי.'],
                en: ['Karl Blossfeldt photographed plants up close and revealed details and shapes that are hard to see at a glance. In his photographs, small parts of plants sometimes look like sculptures or buildings.',
                     'When you look closely, familiar shapes can look like something completely different.'] },
        ask: { he: 'מה אתם מגלים בתמונה?', en: 'What do you discover in the picture?' } },
      /* the author's words of 19 October 2026 (Hebrew); the English title stays the work's full title */
      { id: 'okeeffe', name: { he: 'ג׳ורג׳יה אוקיף', en: "Georgia O'Keeffe" }, way: { he: 'ציור', en: 'Painting' }, special: 'okeeffe',
        work: { he: 'פרח לבן, 1932', en: 'Jimson Weed/White Flower No. 1, 1932' },
        text: { he: ['אוקיף ציירה פרחים מקרוב כל כך, עד שהפרטים הקטנים הפכו לצורות גדולות ומפתיעות.'],
                en: ["O'Keeffe painted flowers so close up that their small details became large, surprising shapes."] },
        ask: { he: 'מה אתם מגלים כשמתקרבים לפרח?', en: 'What do you discover when you get close to the flower?' } },   // not one place to look (23 October 2026)
      { id: 'haeckel', name: { he: 'ארנסט הקל', en: 'Ernst Haeckel' }, way: { he: 'רישום', en: 'Drawing' }, board: 'haeckel',
        text: { he: ['הקל היה מדען ואמן. הוא רשם יצורים זעירים כפי שנראו דרך מיקרוסקופ, וגילה בהם צורות מדויקות ומפתיעות.'],
                en: ['Haeckel was a scientist and an artist. He drew tiny creatures as he saw them through a microscope, and found precise, surprising forms in them.'] },
        ask: { he: 'מה מתגלה כשמתקרבים יותר ממה שהעין רואה?', en: 'What do you discover when you get closer than the eye can see?' } }
    ],
    /* the screens as rearranged on 22 October 2026 (the author's approval, after the UX review): 11 became 8 – the choice of a
       photograph inside "A Closer Look", the saved details with paper or Studio, the stop with the comparison and the end.
       (Before: 17 October, the three artists in one gallery, 13 became 11.) Where a run kept under an earlier arrangement continues: */
    /* 7 screens from 23 October 2026 (layout 4). A run kept under an earlier arrangement goes on at the same stage of the lesson, never
       back: the old "shape stays" (4, after the artists) goes on to "A Closer Look", the next thing not yet done; its photographs,
       details, choices and artwork are kept as they are (only the screen number changes) */
    /* 8 screens from 25 October 2026 (layout 6, the author's approval of the mockups): "A Closer Look" became the gallery (3) and the
       photograph looked at closely (4); "From Detail to Artwork" became the detail (5) and paper or Studio (6). A run kept under an
       earlier arrangement goes on at the same stage: each earlier map is followed by this step (5 → 6) */
    layout: 6,
    screenMaps: (function () {
      var to6 = { 1: 1, 2: 2, 3: 4, 4: 5, 5: 7, 6: 8 };
      var before = { old: { 1: 1, 2: 2, 3: 2, 4: 2, 5: 2, 6: 3, 7: 3, 8: 3, 9: 4, 10: 4, 11: 5, 12: 6, 13: 6 },
                     2: { 1: 1, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 4, 8: 4, 9: 5, 10: 6, 11: 6 },
                     3: { 1: 1, 2: 2, 3: 2, 4: 3, 5: 3, 6: 4, 7: 5, 8: 6 },
                     4: { 1: 1, 2: 2, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6 } };
      var maps = { 5: to6 };
      Object.keys(before).forEach(function (k) { maps[k] = {}; Object.keys(before[k]).forEach(function (n) { maps[k][n] = to6[before[k][n]]; }); });
      return maps;
    })(),
    /* a Studio opened before 25 October 2026 still holds the old numbers of the screens it goes back to: arriving from it, its "Back"
       (6, the end then) and "Choose another area" (3, "A Closer Look" then) land where they meant (js/app.js; the Studio's links
       now name the stage: …/play/end, …/play/discover) */
    studioReturn: { from: 6, 3: 4, 6: 8 },   // from: the "Back" such a Studio holds (6, the end before 25 October 2026)
    boards: {
      small: pick(['n3', 'n4', 'n6', 'n7']).map(function (n) { return { img: n.img, size: n.size, alt: n.alt, credit: n.credit }; }),
      blossfeldt: [
        art('b1', [960, 1222], { he: 'קרל בלוספלדט', en: 'Karl Blossfeldt' }, { he: 'דלעת, 1928', en: 'Cucurbita (pumpkin), 1928' },
            { he: 'קרל בלוספלדט, דלעת, 1928', en: 'Karl Blossfeldt, Cucurbita, 1928' }, 'Getty Open Content', 'Public domain', 'Karl Blossfeldt. Cucurbita, 1928.jpg'),
        art('b4', [960, 1245], { he: 'קרל בלוספלדט', en: 'Karl Blossfeldt' }, { he: 'אקנתוס רך, 1928', en: 'Acanthus mollis, 1928' },
            { he: 'קרל בלוספלדט, אקנתוס רך, 1928', en: 'Karl Blossfeldt, Acanthus mollis, 1928' }, 'Getty Open Content', 'Public domain', 'Karl Blossfeldt. Acanthus mollis, 1928.jpg')
      ],
      haeckel: [
        art('h1', [960, 1352], { he: 'ארנסט הקל', en: 'Ernst Haeckel' }, { he: 'דיאטומאה, 1904', en: 'Diatomea, 1904' },
            { he: 'ארנסט הקל, דיאטומאה, 1904', en: 'Ernst Haeckel, Diatomea, 1904' }, 'Ernst Haeckel', 'Public domain', 'Haeckel Diatomea.jpg'),
        art('h2', [960, 1345], { he: 'ארנסט הקל', en: 'Ernst Haeckel' }, { he: 'דסמידיאה, 1904', en: 'Desmidiea, 1904' },
            { he: 'ארנסט הקל, דסמידיאה, 1904', en: 'Ernst Haeckel, Desmidiea, 1904' }, 'Ernst Haeckel', 'Public domain', 'Haeckel Desmidiea.jpg'),
        art('h3', [960, 1361], { he: 'ארנסט הקל', en: 'Ernst Haeckel' }, { he: 'ספומלריה, 1904', en: 'Spumellaria, 1904' },
            { he: 'ארנסט הקל, ספומלריה, 1904', en: 'Ernst Haeckel, Spumellaria, 1904' }, 'Ernst Haeckel', 'Public domain', 'Haeckel Spumellaria.jpg')
      ]
    },
    actions: {
      anotherTime: { he: 'להמשיך בפעם אחרת', en: 'Come back to it later' },
      keepCreating: { he: 'להמשיך ליצור', en: 'Keep creating' },
      doneForNow: { he: 'לעצור ולהסתכל', en: 'Stop and look' },
      finishedCreating: { he: 'סיימתי ליצור', en: "I've finished creating" },   // the paper's screen, as in 2.1
      toStudio: { he: 'ממשיכים לסטודיו', en: 'Continue to Studio' }
    },
    /* the 8 screens (25 October 2026, the author's approval of the mockups: one meaningful decision on each screen; the photographs
       and the details lead). The words: PEDAGOGICAL_MASTER, section 10 */
    screens: [
      /* 1 · Three discoveries: three photographs, each whole at first; "Move closer" comes closer in three steps to the close-up;
         the one question once all three close-ups have been reached; nothing to write, "Continue" never waits (js/closeup.js shrink list) */
      { kind: 'shrink', title: { he: 'מה מסתתר בפרטים הקטנים?', en: 'What might be hiding in the smallest details?' },
        ask: { he: 'מה גיליתם כשהתקרבתם?', en: 'What did you discover as you moved closer?' } },
      /* 2 · Two ways to get close: Blossfeldt (look first, then what it is) and O'Keeffe (her flower comes close); the question only after both;
         Haeckel optional, in the lesson's Inspiration (lessons/2-2-close-inspiration.js) */
      { kind: 'pair', title: { he: 'שתי דרכים להתקרב', en: 'Two Ways to Get Close' },
        question: { he: 'במה בחרו האמנים להתמקד, ואיך הבחירה הזאת משנה את מה שאנחנו רואים?', en: 'What did the artists choose to focus on, and how does that choice change what we see?' },   // (24 October 2026)
        inspire: { label: { he: 'רוצים לגלות עוד? ארנסט הקל ←', en: 'Want to discover more? Ernst Haeckel →' }, section: 'artists' } },
      /* 3 · The gallery: six photographs, four more on request, each whole; a tap opens it on screen 4. The saved details, counted, at the foot */
      { kind: 'gallery', title: { he: 'מה מסקרן אתכם?', en: 'What catches your eye?' } },
      /* 4 · Look closely: the photograph as large as the screen allows, the tools around it; one to three details saved by the learner */
      { kind: 'discover', needSave: true, title: { he: 'התבוננו מקרוב', en: 'Look closely' },
        hint: { he: 'התקרבו וגלו פרטים שמסקרנים אתכם.', en: 'Zoom in and discover details that make you curious.' } },
      /* 5 · From detail to artwork: one detail large, my details under it to switch, the task (as approved) */
      { kind: 'world', choose: true, title: { he: 'מהפרט ליצירה', en: 'From Detail to Artwork' },
        after: { he: ['<b>עכשיו צרו משהו חדש מהפרט שבחרתם.</b>', 'אפשר להגדיל, לשנות, לפרק, להוסיף ולהמציא.'],   // (24 October 2026: the detail is already chosen on screen 4)
                 en: ['<b>Now create something new from the detail you chose.</b>', 'You can enlarge it, change it, break it apart, add to it, or invent something new.'] } },
      /* 6 · How would you like to create? Paper or Studio, equal, one tap (the player's choice; js/closeup.js "how": the detail above, the
         screen's own drawing icons) */
      { kind: 'how', step: 'medium', switchable: true, title: { he: 'איך תרצו ליצור?', en: 'How would you like to create?' },
        choices: { paper: { he: 'על נייר', en: 'On paper' }, studio: { he: 'בסטודיו', en: 'In the Studio' } },
        studio: { activity: '2-2-close-draw', back: 'end' } },
      /* 7 · Creating. Studio: the Studio itself (one visit; it comes back to the end). Paper: one screen, as in 2.1: the chosen detail, the
         three stages, the material line, Inspiration, "I've finished creating" and "Continue to Studio" */
      { step: 'studio', kind: 'detailPaper', studio: { activity: '2-2-close-draw', back: 'end' },
        paper: { title: { he: 'יוצרים על נייר', en: 'Creating on paper' },
                 stages: { he: ['התבוננו בפרט שבחרתם. אילו צורות, קווים ומרקמים אתם מגלים?',
                                'התחילו לצייר מתוך משהו שמסקרן אתכם בפרט.',
                                'שנו, הוסיפו והמציאו. לאן הציור שלכם יכול להתפתח?'],
                           en: ['Look at the detail you chose. What shapes, lines and textures do you discover?',
                                'Start drawing from something in the detail that makes you curious.',
                                'Change, add and invent. Where could your drawing go from here?'] },
                 text: { he: ['<span class="pl-hint">הכינו דף ובחרו חומר שנעים לכם לעבוד איתו: עיפרון, טוש, פחם או עיפרון צבעוני.</span>'],
                         en: ['<span class="pl-hint">Prepare a sheet of paper and choose a material you enjoy working with: pencil, marker, charcoal or coloured pencil.</span>'] },
                 inspire: { label: { he: 'השראה', en: 'Inspiration' } } } },
      /* 6 · The detail and the work side by side, one question; "Keep creating" the main way on (s.keepMain), another area, a new
         attempt and My artworks quieter */
      { step: 'end', work: true, kind: 'compare', anotherArea: true, keepMain: true, detailOnly: true, studio: { activity: '2-2-close-draw' },
        title: { he: 'מקור ההשראה והציור שלכם', en: 'Your source and your drawing' },
        ask: { he: 'מה נשאר מהפרט, ומה השתנה?', en: 'What remained from the detail, and what changed?' },   // (24 October 2026)
        text: { he: ['התחלתם מפרט קטן, ויצרתם ממנו משהו משלכם.'], en: ['You started with a small detail and created something of your own.'] },
        paperLine: { he: 'הניחו את הציור שלכם ליד המסך.', en: 'Place your drawing next to the screen.' } }
    ]
  };
})();

/* Lesson 2.3, "Same Thing, Different Light", in the Lesson Player. Its app id is 2-2: the site's file for this lesson
   is lesson-2-2 (the earlier numbering; the app names a lesson by its file). The pedagogy and the approved words:
   PEDAGOGICAL_MASTER, section 11 (15 October 2026); the images and their sources: images/2-3/SOURCES.md.
   The flow, as approved (the order of 15 October 2026, after the review on a phone: light around you before the
   artists): the inspiration gallery (the four directions together, the vase among them) → light around you → the
   artists' gallery (the words about each work only once it is opened; "Want to discover more?" under it, optional) →
   the task, step by step, for both ways, then paper or Studio (17 October: the task before the choice) → making (on
   paper: making on paper, and the lesson's images to look at again; in the Studio: its line above the work, and one
   for light and shadow over its controls) → the end. One artwork in each attempt; "New
   attempt" at the end starts another (a new run and artwork; the earlier ones stay, in My artworks). No quiz, no
   score, no second version to compare.
   boards: a gallery whose images are all seen at once (js/player.js board). The vase (16 October 2026, the author's
   choice): the approved triptych of the same blue-and-white ceramic vase in three lights, strong light, soft light and
   shadow, side by side and named under each, to compare, always in this order (Hebrew from the right, English from the
   left: where reading starts): its three panels as the author gave them, the soft light and the shadow without the thin
   white gap between the panels at their left edge (images/2-3/SOURCES.md). The artists' gallery (the author's choice of
   15 October, after the review on a phone): Monet's two cathedrals, Sorolla (wide: a row of his own on a wide screen),
   Sargent and Heade (National Gallery of Art, open access); Hopper's link-only window was taken out.
   The Studio: 2-3-light (studio/activities.js): drawing, colour, light and shadow, and the lesson's images to look at
   while working; the lesson's question for the making in one line above the work, as in 2.1. */
window.APP_LESSONS = window.APP_LESSONS || {};
window.APP_LESSONS['2-2'] = {
  adapter: 'guide',
  unit: 'unit02',
  nav: { unit: 'unit02', path: 'lessons/lesson-2-2.html', title: { he: 'אותו דבר, אור אחר', en: 'Same Thing, Different Light' } },
  langs: ['he', 'en'],
  artworkActivity: '2-3-light',   // the Studio activity "My artworks" opens an artwork of this lesson in
  wordsFirst: true,               // a screen with images: its words (and its question) first, then the images
  works: true,                    // My artworks: an icon in the top bar, and the end screen's main button
  retry: 4,                       // "New attempt" at the end: a new run, from screen 4 (paper or Studio)
  intro: {
    info: { he: 'כ־50 דקות · {n} שלבים', en: 'About 50 minutes · {n} steps' },
    start: { he: 'מתחילים את השיעור', en: 'Start the lesson' },
    resume: { he: 'ממשיכים מהמקום שעצרתי', en: 'Continue where I left off' }
  },
  page: {
    number: '2.3', unitNum: '02',
    title: { he: 'אותו דבר, אור אחר', en: 'Same Thing, Different Light' },
    unit: { he: 'מבט החוצה', en: 'Looking Outward' },
    time: null,
    sections: {}
  },
  boards: {
    /* the four directions of inspiration: the same thing in another light (the vase), light in water, light and shadow
       of leaves, light crossing a space */
    inspiration: [
      { set: [{ img: 'images/2-3/vase-strong-light.png', size: [618, 735], label: { he: 'אור חזק', en: 'Strong light' }, alt: { he: 'האגרטל באור חזק', en: 'The vase in strong light' } },
              { img: 'images/2-3/vase-soft-light.png', size: [610, 735], label: { he: 'אור רך', en: 'Soft light' }, alt: { he: 'האגרטל באור רך', en: 'The vase in soft light' } },
              { img: 'images/2-3/vase-shadow.png', size: [619, 735], label: { he: 'צל', en: 'Shadow' }, alt: { he: 'האגרטל בצל', en: 'The vase in shadow' } }],
        alt: { he: 'אגרטל קרמי בשלושה מצבי תאורה', en: 'A ceramic vase in three lights' } },
      { img: 'images/2-3/light-water-pebbles', size: [1600, 1067], alt: { he: 'קווי אור על חלוקי אבן במים רדודים', en: 'Lines of light on pebbles in shallow water' } },
      { img: 'images/2-3/light-leaf-shadow', size: [1280, 793], alt: { he: 'עלה אדום והצל שלו על מדרכה', en: 'A red leaf and its shadow on a pavement' } },
      { img: 'images/2-3/light-window-room', size: [1232, 1600], alt: { he: 'אור מחלון חוצה חדר ונוחת על רצפת לבנים', en: 'Light from a window crossing a room onto a brick floor' } }
    ],
    artists: [
      { artist: { he: 'קלוד מונה', en: 'Claude Monet' },
        note: { he: ['אותו בניין. שוב ושוב.<br>אבל בכל פעם נדמה שהוא אחר.<br>מה מונה ראה שם שגרם לו לחזור ולצייר אותו?'],
                en: ['The same building. Again and again. But each time it seems different. What did Monet see there that made him come back and paint it again?'] },
        set: [{ img: 'images/2-3/monet-rouen-west-facade-1894', size: [1028, 1600], workTitle: { he: 'הקתדרלה ברואן, החזית המערבית, 1894', en: 'Rouen Cathedral, West Façade, 1894' },
                alt: { he: 'קלוד מונה, הקתדרלה ברואן, החזית המערבית, 1894', en: 'Claude Monet, Rouen Cathedral, West Façade, 1894' } },
              { img: 'images/2-3/monet-rouen-west-facade-sunlight-1894', size: [1048, 1600], workTitle: { he: 'הקתדרלה ברואן, החזית המערבית, אור שמש, 1894', en: 'Rouen Cathedral, West Façade, Sunlight, 1894' },
                alt: { he: 'קלוד מונה, הקתדרלה ברואן, החזית המערבית, אור שמש, 1894', en: 'Claude Monet, Rouen Cathedral, West Façade, Sunlight, 1894' } }] },
      { img: 'images/2-3/sorolla-sewing-the-sail-1896', size: [960, 735], artist: { he: 'חואקין סורויה', en: 'Joaquín Sorolla' }, workTitle: { he: 'תפירת המפרש, 1896', en: 'Sewing the Sail, 1896' },
        alt: { he: 'חואקין סורויה, תפירת המפרש, 1896', en: 'Joaquín Sorolla, Sewing the Sail, 1896' },
        note: { he: ['מפרש לבן ענקי פרוש בחצר.<br>אבל האם הוא באמת לבן?<br>התקרבו קצת. כמה צבעים אתם מצליחים לגלות בו?'],
                en: ['A huge white sail spread out in a courtyard. But is it really white? Come a little closer. How many colors can you find in it?'] },
        wide: true },
      /* Sargent and Heade: National Gallery of Art, Washington, open access (CC0; images/2-3/SOURCES.md). Their words in Hebrew:
         the author's, approved 25 October 2026; in English: their translation, approved the same day */
      { img: 'images/2-3/sargent-simplon-pass-1911', size: [1600, 1240], artist: { he: "ג'ון סינגר סרג'נט", en: 'John Singer Sargent' }, workTitle: { he: 'מעבר סימפלון, 1911', en: 'Simplon Pass, 1911' },
        alt: { he: "ג'ון סינגר סרג'נט, מעבר סימפלון, 1911", en: 'John Singer Sargent, Simplon Pass, 1911' },
        note: { he: ['התבוננו בהרים ובאור שעליהם.<br>איפה האור מדגיש את הצורות, ואיפה הצל גורם להן להיראות אחרת?'],
                en: ['Look at the mountains and the light on them. Where does the light bring out the shapes, and where does the shadow make them look different?'] } },
      { img: 'images/2-3/heade-cattleya-orchid-hummingbirds-1871', size: [1600, 1215], artist: { he: "מרטין ג'ונסון היד", en: 'Martin Johnson Heade' }, workTitle: { he: 'סחלב קטליה ושלושה יונקי דבש, 1871', en: 'Cattleya Orchid and Three Hummingbirds, 1871' },
        alt: { he: "מרטין ג'ונסון היד, סחלב קטליה ושלושה יונקי דבש, 1871", en: 'Martin Johnson Heade, Cattleya Orchid and Three Hummingbirds, 1871' },
        note: { he: ['הביטו בפרח, בציפורים וברקע הכהה.<br>מה האור מאפשר לנו לראות, ומה נשאר כמעט נסתר בצל?'],
                en: ['Look at the flower, the birds and the dark background. What does the light let us see, and what stays almost hidden in the shadow?'] } }
    ]
  },
  actions: {
    keepCreating: { he: 'להמשיך ליצור', en: 'Keep creating' },
    doneForNow: { he: 'סיימתי לעכשיו', en: "I'm done for now" },
    anotherTime: { he: 'להמשיך בפעם אחרת', en: 'Come back to it later' },
    finishedCreating: { he: 'סיימתי ליצור', en: "I've finished creating" },   // the paper screen, as in 2.1 and 2.2 (28 October 2026)
    toStudio: { he: 'ממשיכים לסטודיו', en: 'Continue to Studio' }
  },
  screens: [
    /* 1 */ { board: 'inspiration',
              text: { he: ['לפעמים מספיק שהאור ישתנה, ופתאום משהו מוכר נראה אחרת לגמרי.'],
                      en: ['Sometimes all it takes is a change in the light, and something familiar suddenly looks completely different.'] },
              ask: { he: 'הביטו בתמונות. איך האור משנה את מה שאנחנו רואים?', en: 'Look at the pictures. How does light change what we see?' } },
    /* 2 */ { title: { he: 'האור סביבכם', en: 'Light Around You' },
              text: { he: ['הביטו סביבכם לרגע.', 'איפה האור נופל? אילו צורות יוצרים הצללים?', 'האם יש משהו שנראה פתאום אחרת בגלל האור?'],
                      en: ['Take a moment to look around.', 'Where does the light fall? What shapes do the shadows make?', 'Is there something that suddenly looks different because of the light?'] } },
    /* 3 */ { board: 'artists',
              text: { he: ['האור נמצא בכל מקום. אבל מה קורה כשהוא הופך לדבר הכי מעניין בתמונה?<br>ארבעה אמנים הסתכלו על העולם וגילו בו משהו שאולי לא שמנו לב אליו.'],
                      en: ['Light is everywhere. But what happens when it becomes the most interesting thing in the picture? Four artists looked at the world and discovered something we may not have noticed.'] },
              ask: { he: 'מה אתם מגלים ביצירות האלה כשהעיניים מתחילות לחפש את האור?', en: 'What do you discover in these works when your eyes start searching for the light?' },
              /* optional: the museums' own pages, in a new tab (images/2-3/SOURCES.md); the author's choice of 16 October:
                 Monet, Hopper (here only, never in the gallery) and Heade. After her review of preview Version 5, other works
                 of Monet and Heade than the gallery's (the links had been to two of its works): links only, never in the
                 gallery or in the Studio's "Inspiration" */
              more: { title: { he: 'רוצים לגלות עוד?', en: 'Want to explore more?' },
                      /* the author's words of 16 October: the question is the heading, the rest of her sentence follows it */
                      intro: { he: 'בואו לראות איך אמנים שונים השתמשו באור ובצל כדי לשנות צבעים, ליצור עומק ואווירה.',
                               en: 'Discover how different artists used light and shadow to transform colors, create depth and set a mood.' },
                      links: [
                        { name: { he: 'קלוד מונה', en: 'Claude Monet' }, site: { he: 'בית הפרלמנט, שקיעה · הגלריה הלאומית לאמנות, וושינגטון', en: 'The Houses of Parliament, Sunset · National Gallery of Art, Washington' },
                          href: 'https://www.nga.gov/artworks/46523-houses-parliament-sunset' },
                        { name: { he: 'אדוארד הופר', en: 'Edward Hopper' }, site: { he: 'חדרים ליד הים, 1951 · הגלריה לאמנות של אוניברסיטת ייל', en: 'Rooms by the Sea, 1951 · Yale University Art Gallery' },
                          href: 'https://artgallery.yale.edu/collections/objects/52939' },
                        { name: { he: "מרטין ג'ונסון היד", en: 'Martin Johnson Heade' }, site: { he: 'אור שמש וצל: הביצות של ניוברי · הגלריה הלאומית לאמנות, וושינגטון', en: 'Sunlight and Shadow: The Newbury Marshes · National Gallery of Art, Washington' },
                          href: 'https://www.nga.gov/artworks/126145-sunlight-and-shadow-newbury-marshes' }] } },
    /* 4: the shared task, for both ways, before the choice (the author's decision of 17 October: the task first, then
       paper or Studio): her three steps, the first with the light of the inspiration gallery in it (water, the shadow of
       leaves, a window), so the screen's earlier words are kept without being said twice */
    /* 4 */ { step: 'medium', switchable: true, title: { he: 'עכשיו האור בידיים שלכם', en: 'Now the Light Is in Your Hands' },
              steps: { he: ['בחרו משהו שמעניין אתכם: חפץ, צמח, פינה בחדר, השתקפות במים, צל של עלים, אור שנכנס מבעד לחלון, או כל דבר אחר.',
                            'התבוננו איך האור פוגש אותו. מאיפה מגיע האור? איפה מופיע צל? אילו צבעים משתנים?',
                            'ציירו או צרו את מה שאתם רואים, או את מה שאתם מדמיינים. השתמשו בצבעים, בקווים ובכתמים כדי להראות איך האור משנה את התמונה.'],
                       en: ['Choose something that interests you: an object, a plant, a corner of a room, a reflection in water, the shadow of leaves, light coming through a window, or anything else.',
                            'Look at how light falls on it. Where does the light come from? Where do shadows appear? Which colors change?',
                            'Draw or create what you see, or what you imagine. Use colors, lines, and shapes to show how light transforms the image.'] },
              choices: { paper: { he: 'על נייר', en: 'On paper' }, studio: { he: 'Studio', en: 'Studio' } },
              studio: { activity: '2-3-light', back: 6 } },
    /* 5: making. Studio: the Studio itself (it comes back to 6). Paper: making on paper (the author's words of 17
       October: the materials, light and dark, ways of working), the quieter line that one artwork is enough,
       "Inspiration" (the lesson's images, to look at again while drawing), and the learner says when it is enough for now */
    /* 5 */ { step: 'studio', studio: { activity: '2-3-light', back: 6 },
              paper: { title: { he: 'יוצרים על נייר', en: 'Creating on Paper' }, action: 'finishedCreating', toStudio: true,   // as in 2.1 and 2.2 (28 October 2026)
                       steps: { he: ['הכינו דף נייר ובחרו את החומרים שאיתם תרצו לעבוד: עפרונות, עפרונות צבעוניים, פחם, פסטל, טושים או צבעי מים.',
                                     'התחילו בציור החפץ או המקום שבחרתם. הוסיפו אזורים בהירים וכהים ונסו ליצור הבדלים בין אור לצל.',
                                     'אפשר לעבוד בשכבות, למחוק, לטשטש או להוסיף צבע. מותר לשנות כיוון תוך כדי העבודה.'],
                                en: ['Prepare a sheet of paper and choose the materials you would like to use: pencils, colored pencils, charcoal, pastels, markers, or watercolors.',
                                     'Begin drawing the object or place you chose. Add light and dark areas, exploring the contrast between light and shadow.',
                                     'You can work in layers, erase, blend, or add color. Feel free to change direction as you work.'] },
                       text: { he: ['<span class="pl-hint">אין חובה ליצור שתי גרסאות. יצירה אחת מספיקה, ואפשר להתחיל ניסיון נוסף.</span>'],
                               en: ['<span class="pl-hint">You don\'t have to make two versions. One artwork is enough, and you can start another attempt.</span>'] },
                       refs: ['inspiration', 'artists'] } },
    /* 6: the end. A question to look back with (the author's words of 17 October; to think about, nothing to write),
       then the work (Studio; on paper nothing in its place) and the ways on as before */
    /* 6 */ { step: 'end', work: true, studio: { activity: '2-3-light' },
              ask: { he: 'התבוננו במה שיצרתם. מה גיליתם על אור וצל במהלך העבודה?', en: 'Look at what you created. What did you discover about light and shadow while working?' } }
  ]
};

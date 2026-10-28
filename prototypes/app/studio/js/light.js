/* Tool: light and shadow (lesson 2.3). The learner makes the colours already painted lighter or darker, where the soft
   brush goes, with its own size and strength; a third mode takes light and shadow away there, and the colours are as
   they were painted. Every stroke is the learner's own, one operation { t:'tone', mode:'light'|'shadow'|'clear', w, a,
   pts:[x,y,…] } (artwork units), undone like any other.
   How it looks (the author's decision of 16 October 2026, after the review on a phone: "change the brightness of the
   existing painted colors, not paint light or shadow in a separate color"): no colour is added. Light raises a colour's
   brightness and shadow lowers it; its hue stays, so a blue under light is a lighter blue and under shadow a darker blue;
   the lines and the texture stay as they are, only brighter or darker. The strength is how much. Only what is painted
   changes: the bare paper stays as it is, under light and under shadow alike (no grey band where nothing is painted).
   Light and shadow are kept apart from the lines and colours, on two masks of their own (how much, where), and applied
   to the drawing as it shows on the paper: its brightness changed (shadow: multiplied down; light: divided up,
   'color-dodge'), then only the brightness taken over by the colours as they are ('luminosity': their hue and
   saturation stay), and kept where the drawing is. So taking light and shadow away, or undoing them, never touches a
   line. A light stroke takes away the shadow under it and a shadow stroke the light, so the one painted
   last shows. The tool shows the learner layer through the presenter (S.present), so it cannot be in one activity with
   Repeat. Works painted before 16 October keep their operations; they are now shown this way. */
Studio.register('light', {
  strings: {
    he: { light: 'אור', shadow: 'צל', toneClear: 'מחק אור וצל', toneSize: 'גודל', toneStrength: 'עוצמה', toneTools: 'אור וצל',
          toneDrag: 'גררו על הציור', toneFirst: 'קודם מציירים, ואז מוסיפים אור וצל', help_tone: 'גוררים על הציור: אור או צל' },
    en: { light: 'Light', shadow: 'Shadow', toneClear: 'Erase light & shadow', toneSize: 'Size', toneStrength: 'Strength', toneTools: 'Light & shadow',
          toneDrag: 'Drag over your drawing', toneFirst: 'Draw first, then add light and shadow', help_tone: 'Drag over your drawing: light or shadow' }
  },
  init: function (S) {
    'use strict';
    /* the masks: shadow, how much darker (black: the colour multiplied by 1 − strength); light, how much lighter (a grey
       of .6: the colour divided by .4, up to white, as much as the strength) */
    var MASK = { light: '#999999', shadow: '#000000' };
    var SIZE = { min: 12, max: 140, start: 48 };          // on-screen pixels when painted
    var STRENGTH = { min: 10, max: 80, start: 45 };       // per cent
    var PASSES = [];                                      // a soft edge: the same line 18 times, narrower each time
    for (var i = 0; i < 18; i++) PASSES.push(1 - i * 0.04);
    var st = S.state;
    st.toneSize = SIZE.start; st.toneStrength = STRENGTH.start / 100;
    if (S.has('repeat')) console.warn('Studio: light and shadow cannot be in one activity with Repeat');

    S.renderer('tone', function () {});   // painted on its own layers, by the presenter below

    /* the line through the points, as the brush draws it (curves through the midpoints) */
    function path(x, p) {
      var n = p.length / 2;
      x.beginPath(); x.moveTo(p[0], p[1]);
      for (var i = 1; i < n - 1; i++) x.quadraticCurveTo(p[i * 2], p[i * 2 + 1], (p[i * 2] + p[i * 2 + 2]) / 2, (p[i * 2 + 1] + p[i * 2 + 3]) / 2);
      x.lineTo(p[(n - 1) * 2], p[(n - 1) * 2 + 1]);
    }
    /* one stroke on one mask: added (source-over) or taken away (destination-out), soft at its edge; its middle has
       the stroke's strength (erasing light and shadow takes them away entirely: a = 1) */
    function soft(x, op, how, color) {
      var p = op.pts, b = 1 - Math.pow(1 - Math.min(op.mode === 'clear' ? 1 : 0.95, op.a), 1 / PASSES.length);
      x.save();
      x.globalCompositeOperation = how; x.globalAlpha = b;
      x.strokeStyle = x.fillStyle = color || '#000'; x.lineCap = 'round'; x.lineJoin = 'round';
      PASSES.forEach(function (k) {
        if (p.length < 4) { x.beginPath(); x.arc(p[0], p[1], op.w * k / 2, 0, Math.PI * 2); x.fill(); return; }
        x.lineWidth = op.w * k; path(x, p); x.stroke();
      });
      x.restore();
    }
    function apply(lay, op) {
      if (op.mode === 'light') { soft(lay.shadow, op, 'destination-out'); soft(lay.light, op, 'source-over', MASK.light); }
      else if (op.mode === 'shadow') { soft(lay.light, op, 'destination-out'); soft(lay.shadow, op, 'source-over', MASK.shadow); }
      else { soft(lay.light, op, 'destination-out'); soft(lay.shadow, op, 'destination-out'); }
    }
    /* the two masks, the size of the canvas c paints on and in its units */
    function layer(c) {
      var el = document.createElement('canvas'); el.width = c.canvas.width; el.height = c.canvas.height;
      var x = el.getContext('2d'); x.setTransform(c.getTransform()); return x;
    }
    function build(c, ops) { var lay = { light: layer(c), shadow: layer(c) }; ops.forEach(function (op) { apply(lay, op); }); return lay; }
    function copy(c, lay) {
      var out = { light: layer(c), shadow: layer(c) };
      ['light', 'shadow'].forEach(function (k) { out[k].save(); out[k].setTransform(1, 0, 0, 1, 0, 0); out[k].drawImage(lay[k].canvas, 0, 0); out[k].restore(); });
      return out;
    }
    /* a canvas of c's size to work in (the screen's are kept from one frame to the next) */
    var kept = {};
    function scratch(k, c, screen) {
      var el = screen ? kept[k] : null;
      if (!el || el.width !== c.canvas.width || el.height !== c.canvas.height) {
        el = document.createElement('canvas'); el.width = c.canvas.width; el.height = c.canvas.height;
        if (screen) kept[k] = el;
      }
      var x = el.getContext('2d');
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
      x.clearRect(0, 0, el.width, el.height);
      return x;
    }
    /* the drawing on c as it shows on the paper, its brightness changed by the masks l, its colours' hue and saturation
       kept; then only where the drawing is (the paper itself stays as it is) */
    function lay(c, l, screen) {
      var W = c.canvas.width, H = c.canvas.height;
      var shown = scratch('shown', c, screen);
      shown.fillStyle = S.sheet; shown.fillRect(0, 0, W, H);
      shown.drawImage(c.canvas, 0, 0);
      var lit = scratch('lit', c, screen);
      lit.drawImage(shown.canvas, 0, 0);
      lit.globalCompositeOperation = 'multiply'; lit.drawImage(l.shadow.canvas, 0, 0);
      lit.globalCompositeOperation = 'color-dodge'; lit.drawImage(l.light.canvas, 0, 0);
      shown.globalCompositeOperation = 'luminosity'; shown.drawImage(lit.canvas, 0, 0);
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-in'; c.drawImage(shown.canvas, 0, 0); c.restore();
    }
    function toneOps() { return S.split().source.filter(function (op) { return op.t === 'tone'; }); }

    /* the screen's layers are kept until the history changes or the canvas does; the stroke being painted goes over a
       copy of them, at the next frame */
    var cur = null, frame = 0, stamp = 0, cache = { key: null, lay: null };
    S.watch(function () { stamp++; });
    S.present(function (c, paint) {
      paint(c);
      var screen = c === S.ctx(), ops = toneOps();
      if (!ops.length && !(screen && cur)) return;
      var l;
      if (screen) {
        var key = c.canvas.width + 'x' + c.canvas.height + ':' + stamp;
        if (cache.key !== key) { cache.lay = build(c, ops); cache.key = key; }
        l = cache.lay;
        if (cur) { l = copy(c, l); apply(l, cur); }
      } else l = build(c, ops);
      lay(c, l, screen);
    });

    function show() { if (!frame) frame = requestAnimationFrame(function () { frame = 0; S.redraw(); }); }
    var last = null;
    var brush = {
      down: function (e) {
        var p = S.pt(e); last = p;
        var m = st.tool === 'toneClear' ? 'clear' : st.tool;
        cur = { t: 'tone', mode: m, w: Math.round(st.toneSize / S.scale() * 100) / 100,
                a: m === 'clear' ? 1 : Math.round(st.toneStrength * 100) / 100, pts: p.slice() };
        show();
      },
      move: function (events) {
        if (!cur) return;
        var min = 0.8 / S.scale();
        events.forEach(function (ev) {
          var q = S.pt(ev);
          if (Math.abs(q[0] - last[0]) + Math.abs(q[1] - last[1]) < min) return;
          last = q; cur.pts.push(q[0], q[1]);
        });
        show();
      },
      up: function () {
        if (!cur) return;
        var op = cur; cur = null;
        if (op.pts.length >= 4) op.pts.push(op.pts[op.pts.length - 2], op.pts[op.pts.length - 1]);
        S.commit(op); S.redraw();
      },
      cancel: function () { if (cur) { cur = null; S.redraw(); } }   // the start of a two-finger gesture: never painted
    };
    ['light', 'shadow', 'toneClear'].forEach(function (m) { S.pointer(m, brush); });

    /* the toolbar: one button, "Light and shadow" (its icon the mode it paints in); it opens its controls (the mode, the
       size and the strength) in their row above the toolbar, out of the work's way (js/shell.js #tray). They stay while
       the learner paints; a tap on the tool again folds them away (the tool stays on, in the mode chosen last), another
       tool closes them */
    var SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    var ICON = { light: SVG + '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>',
                 shadow: SVG + '<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/></svg>',
                 toneClear: SVG + '<circle cx="12" cy="12" r="8"/><path d="M6.5 17.5l11-11"/></svg>' };
    var MODES = ['light', 'shadow', 'toneClear'], mode = 'light';
    function on() { return MODES.indexOf(st.tool) >= 0; }
    function pick(m) { st.tool = mode = m; marks(); S.updateUi(); }
    S.item({ id: 'tone', order: 50, label: 'toneTools', pressed: true, panel: 'tonePanel', stay: true,
      icon: '<span class="tone-icon" id="toneIcon">' + ICON.light + '</span>',
      onClick: function () {
        var shown = !S.$('tonePanel').hidden, was = on();
        pick(mode);
        if (was && shown) S.closePanels(); else if (!shown) { S.togglePanel('tonePanel', 'tone'); telling(); replay(); }
      },
      update: function (b) {
        b.setAttribute('aria-pressed', String(on()));
        if (!on() && !S.$('tonePanel').hidden) { S.$('tonePanel').hidden = true; b.setAttribute('aria-expanded', 'false'); }   // another tool: its controls go
        var i = S.$('toneIcon'); if (i && i.getAttribute('data-mode') !== mode) { i.innerHTML = ICON[mode]; i.setAttribute('data-mode', mode); }
      } });

    /* its controls: the mode (light, shadow, erase light and shadow) in one row, the size and the strength under it */
    var tp = document.createElement('div');
    tp.className = 'panel tone-panel'; tp.id = 'tonePanel'; tp.hidden = true; tp.setAttribute('role', 'group'); tp.setAttribute('aria-label', S.T.toneTools);
    var modes = document.createElement('div'); modes.className = 'tone-modes';
    MODES.forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'tone-mode'; b.dataset.mode = m; b.innerHTML = ICON[m] + '<span>' + S.T[m] + '</span>';
      b.addEventListener('click', function () { pick(m); });
      modes.appendChild(b);
    });
    /* how it is used, over its controls (the author's approval of 28 October 2026, after the UX review): a small picture of a
       finger dragging over a line, the light spreading under it (it moves three times, then rests), and three words; on a page
       with nothing drawn yet, what comes first instead. Small, beside the tool, never over the work */
    var how = document.createElement('p'); how.className = 'tone-how';
    how.innerHTML = '<svg class="tone-demo" viewBox="0 0 64 28" aria-hidden="true"><path class="tone-demo-line" d="M3 21C11 5 19 5 27 18S45 27 61 7"/>' +
      '<path class="tone-demo-glow" d="M5 19C12 8 19 8 26 17"/><g class="tone-demo-hand"><circle cx="0" cy="0" r="4.5"/></g></svg><span class="tone-how-t"></span>';
    tp.appendChild(how);
    function drawn() { return S.split().source.some(function (op) { return op.t === 'stroke' && op.tool !== 'eraser'; }); }
    function telling() {
      var first = !drawn();
      how.classList.toggle('tone-how-first', first);
      how.querySelector('.tone-how-t').textContent = first ? S.T.toneFirst : S.T.toneDrag;
    }
    function replay() { var d = how.querySelector('.tone-demo'); d.classList.remove('play'); void d.getBoundingClientRect(); d.classList.add('play'); }
    S.watch(telling);
    tp.appendChild(modes);
    var ranges = document.createElement('div'); ranges.className = 'tone-ranges';
    tp.appendChild(ranges);
    function slider(label, r, value, set) {
      var l = document.createElement('label'); l.className = 'tone-line';
      if (set === strength) l.classList.add('tone-strength');
      l.innerHTML = '<span>' + label + '</span><input type="range" min="' + r.min + '" max="' + r.max + '" step="1" value="' + value + '">';
      l.querySelector('input').addEventListener('input', function (e) { set(+e.target.value); });
      ranges.appendChild(l);
    }
    slider(S.T.toneSize, SIZE, SIZE.start, function (v) { st.toneSize = v; });
    function strength(v) { st.toneStrength = v / 100; }
    slider(S.T.toneStrength, STRENGTH, STRENGTH.start, strength);
    /* the mode chosen; erasing takes light and shadow away entirely, so its strength is not offered then */
    function marks() {
      modes.querySelectorAll('.tone-mode').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.mode === mode)); });
      var k = tp.querySelector('.tone-strength'); if (k) { k.classList.toggle('off', mode === 'toneClear'); k.querySelector('input').disabled = mode === 'toneClear'; }
    }
    S.stage.appendChild(tp);
    marks(); telling();
  }
});

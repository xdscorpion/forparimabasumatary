/* Cake, letters, scrapbook, hidden surprises, progress, finale */
(function () {
  'use strict';
  var C = window.CONFIG, T = window.T, esc = window.esc, FX = window.FX;
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var DEV = /[?&]dev\b/.test(location.search);

  /* ---------- toast ---------- */
  function toast(msg, ms) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, ms || 4200);
  }

  /* ---------- progress ---------- */
  var Progress = {
    tasks: { cake: false, letters: false, memories: false, scrapbook: false },
    done: function (k) { if (this.tasks[k]) return; this.tasks[k] = true; this.render(); },
    render: function () {
      var self = this, left = [];
      $$('#progress-list li').forEach(function (li) { var d = self.tasks[li.dataset.task]; li.classList.toggle('done', d); if (!d) left.push(li.textContent.trim()); });
      var all = !left.length, btn = $('#finale-btn');
      btn.disabled = !(all || DEV);
      btn.classList.toggle('pulse-btn', all || DEV);
      $('#finale-hint').textContent = all ? 'Everything is done. Your final surprise is ready \u2661' : (4 - left.length) + ' of 4 done. Finish the steps above to unlock it.';
    }
  };

  /* ---------- hidden messages ---------- */
  var Surprise = {
    c: { hearts: 0, stars: 0, balloons: 0, flowers: 0 }, need: { hearts: 5, stars: 5, balloons: 3, flowers: 3 }, shown: {},
    bump: function (kind) {
      this.c[kind]++;
      if (this.c[kind] >= this.need[kind] && !this.shown[kind]) {
        this.shown[kind] = true; var msg = (C.hiddenMessages || {})[kind];
        if (msg) setTimeout(function () { toast('\u2726 ' + T(msg), 6000); FX.sparkles(window.innerWidth / 2, window.innerHeight * .7, 28); }, 350);
      }
    }
  };
  window.Surprise = Surprise;
  window.App = { toast: toast, Progress: Progress, DEV: DEV, wait: wait };

  /* ---------- decorative bits ---------- */
  function buildBunting() {
    var el = $('#bunting'), cols = ['#ffb3c8', '#ffe3ec', '#f3dfb0', '#ff9fbd', '#ffd9c7'], s = '<path d="M0 10Q400 92 800 10" fill="none" stroke="#c9a45c" stroke-width="2"/>', n = 15;
    for (var i = 1; i < n; i++) {
      var t = i / n, x = 2 * (1 - t) * t * 400 + t * t * 800, y = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 91 + t * t * 10;
      s += '<path d="M' + (x - 22) + ' ' + (y - 1) + ' L' + (x + 22) + ' ' + (y - 1) + ' L' + x + ' ' + (y + 48) + 'Z" fill="' + cols[i % cols.length] + '" opacity=".95"><animateTransform attributeName="transform" type="rotate" values="-3 ' + x + ' ' + y + ';3 ' + x + ' ' + y + ';-3 ' + x + ' ' + y + '" dur="' + (3 + (i % 3)) + 's" repeatCount="indefinite"/></path>';
    }
    el.innerHTML = s;
  }
  function initFlowers() {
    var cols = ['#ffb3c8', '#ffd0b8', '#fff', '#ff9fbd', '#f7c6d6'];
    $$('[data-flowers]').forEach(function (row) {
      for (var i = 0; i < Number(row.dataset.flowers); i++) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'deco-flower'; b.style.setProperty('--c', cols[(i * 2) % cols.length]);
        b.setAttribute('aria-label', 'A little flower, tap to see it bloom'); b.innerHTML = '<svg aria-hidden="true"><use href="#flower"/></svg>'; row.appendChild(b);
      }
    });
    document.addEventListener('click', function (e) {
      var f = e.target.closest('.deco-flower'); if (!f) return;
      f.classList.remove('bloom'); void f.offsetWidth; f.classList.add('bloom');
      var c = FX.center(f); FX.petals(c.x, c.y, 16); FX.sparkles(c.x, c.y, 8); Surprise.bump('flowers');
    });
  }

  /* ---------- CAKE ---------- */
  function cakeSVG() {
    var r = rnd, s = '<svg viewBox="0 0 400 450" role="img" aria-label="A three tier pink birthday cake with five candles">';
    s += '<defs><linearGradient id="ckSponge" x1="0" x2="1"><stop offset="0" stop-color="#ffe3ea"/><stop offset=".5" stop-color="#fcd0dc"/><stop offset="1" stop-color="#f3b5c8"/></linearGradient>' +
      '<linearGradient id="ckFrost" x1="0" x2="1"><stop offset="0" stop-color="#ffc6d8"/><stop offset=".5" stop-color="#ff9fbd"/><stop offset="1" stop-color="#f27fa5"/></linearGradient>' +
      '<linearGradient id="ckShade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".75" stop-color="#8a2e52" stop-opacity="0"/><stop offset="1" stop-color="#8a2e52" stop-opacity=".2"/></linearGradient>' +
      '<linearGradient id="ckPlate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ffe9ef"/></linearGradient>' +
      '<radialGradient id="ckFlame" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#fff7c2"/><stop offset=".45" stop-color="#ffcf5a"/><stop offset="1" stop-color="#ff8a3d"/></radialGradient>' +
      '<radialGradient id="ckGlow"><stop offset="0" stop-color="#ffe29a" stop-opacity=".85"/><stop offset="1" stop-color="#ffe29a" stop-opacity="0"/></radialGradient></defs>';
    s += '<ellipse cx="200" cy="422" rx="190" ry="24" fill="url(#ckPlate)" stroke="#f5d3dd"/><ellipse cx="200" cy="416" rx="156" ry="15" fill="#fff" opacity=".75"/><ellipse cx="200" cy="412" rx="172" ry="10" fill="#c9788f" opacity=".16"/>';
    var tiers = [{ x: 40, y: 306, w: 320, h: 104 }, { x: 78, y: 222, w: 244, h: 86 }, { x: 116, y: 150, w: 168, h: 74 }], sprink = ['#fff', '#f3dfb0', '#ffd9e4', '#e9739b', '#c9a45c'];
    tiers.forEach(function (t) {
      var x = t.x, y = t.y, w = t.w, h = t.h, n = Math.round(w / 26), sw = w / n, i;
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="16" fill="url(#ckSponge)"/>';
      s += '<rect x="' + x + '" y="' + (y + h * .52) + '" width="' + w + '" height="9" fill="#fff6ee" opacity=".95"/>';
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="16" fill="url(#ckShade)"/>';
      s += '<rect x="' + (x - 5) + '" y="' + (y - 5) + '" width="' + (w + 10) + '" height="22" rx="11" fill="url(#ckFrost)"/>';
      for (i = 0; i < n; i++) { var cx = x + sw * (i + .5); s += '<rect x="' + (cx - 7.5).toFixed(1) + '" y="' + (y + 6) + '" width="15" height="' + r(14, 36).toFixed(1) + '" rx="7.5" fill="url(#ckFrost)"/>'; }
      for (var px = x + 14; px < x + w - 8; px += 22) s += '<circle cx="' + px + '" cy="' + (y + h - 4) + '" r="5.5" fill="#fff" stroke="#f6c3d1" stroke-width="1"/>';
      for (i = 0; i < Math.round(w / 12); i++) { var sx = r(x + 4, x + w - 10), sy = r(y - 2, y + 10); s += '<rect x="' + sx.toFixed(1) + '" y="' + sy.toFixed(1) + '" width="6" height="2.400" rx="1.200" fill="' + sprink[i % sprink.length] + '" transform="rotate(' + Math.round(r(0, 180)) + ' ' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ')"/>'; }
    });
    [64, 122, 180, 238, 296].forEach(function (fx, i) { s += '<use href="#flower" x="' + fx + '" y="338" width="30" height="30" style="color:' + (i % 2 ? '#ffe3ec' : '#fff') + '"/>'; });
    [92, 150, 208, 266, 324].forEach(function (dx) { s += '<circle cx="' + dx + '" cy="383" r="3" fill="#ff9fbd"/>'; });
    s += '<rect x="78" y="266" width="244" height="11" fill="#f3dfb0"/><rect x="78" y="268" width="244" height="2" fill="#fff" opacity=".6"/>';
    for (var gx = 92; gx < 320; gx += 24) s += '<circle cx="' + gx + '" cy="272" r="2" fill="#c9a45c"/>';
    s += '<use href="#heart" x="132" y="182" width="22" height="20" style="color:#fff"/><use href="#heart" x="189" y="188" width="22" height="20" style="color:#ffe3ec"/><use href="#heart" x="246" y="182" width="22" height="20" style="color:#fff"/>';
    s += '<use href="#strawberry" x="52" y="282" width="30" height="34"/><use href="#strawberry" x="318" y="282" width="30" height="34"/><use href="#strawberry" x="90" y="198" width="26" height="30"/><use href="#strawberry" x="284" y="198" width="26" height="30"/>';
    s += '<use class="ck-spark" href="#sparkle" x="18" y="110" width="20" height="20" style="color:#f3d27a"/><use class="ck-spark" href="#sparkle" x="362" y="150" width="16" height="16" style="color:#ffc2d6;animation-delay:-1s"/><use class="ck-spark" href="#sparkle" x="340" y="60" width="22" height="22" style="color:#f3d27a;animation-delay:-2s"/>';
    var xs = [146, 173, 200, 227, 254], cc = ['#fff0f5', '#ffd3e1', '#fff3e3', '#ffc9d8', '#fff0f5'];
    xs.forEach(function (cx, i) {
      s += '<g class="candle" data-i="' + i + '" tabindex="0" role="button" aria-pressed="false" aria-label="Candle ' + (i + 1) + ', tap to blow out">';
      s += '<rect x="' + (cx - 5.5) + '" y="106" width="11" height="48" rx="3" fill="' + cc[i] + '" stroke="#f0c4d2" stroke-width=".8"/>';
      for (var k = 0; k < 4; k++) s += '<rect x="' + (cx - 5.5) + '" y="' + (112 + k * 11) + '" width="11" height="5" fill="rgba(255,130,170,.55)"/>';
      s += '<rect class="wick" x="' + (cx - .9) + '" y="98" width="1.800" height="9" rx=".9" fill="#6b4b55"/>';
      s += '<g transform="translate(' + cx + ' 99)"><g class="flame-in" style="--fd:-' + (i * .23).toFixed(2) + 's"><circle class="glow" cy="-14" r="26" fill="url(#ckGlow)"/><path d="M0 -32C9 -20 11 -9 0 0C-11 -9 -9 -20 0 -32z" fill="url(#ckFlame)"/><path d="M0 -17C4 -12 4 -6 0 -2C-4 -6 -4 -12 0 -17z" fill="#fff" opacity=".88"/></g></g>';
      s += '<rect class="hit" x="' + (cx - 14) + '" y="60" width="28" height="98" rx="8"/></g>';
    });
    return s + '</svg>';
  }

  function initCake() {
    var wrap = $('#cake-wrap'); wrap.innerHTML = cakeSVG();
    var candles = $$('#cake-wrap .candle'), statusEl = $('#cake-status'), msgEl = $('#wish-message'), busy = false, micOn = false, mic = null, celebrated = false;
    var setStatus = function (m) { statusEl.textContent = m; };
    var lit = function () { return candles.filter(function (c) { return !c.classList.contains('out'); }); };
    function wick(c) { return FX.center(c.querySelector('.wick')); }
    function setOut(c, out, silent) {
      c.classList.remove('lean'); c.classList.toggle('out', out); c.setAttribute('aria-pressed', String(out));
      c.setAttribute('aria-label', 'Candle ' + (Number(c.dataset.i) + 1) + (out ? ', blown out, tap to relight' : ', tap to blow out'));
      if (!silent) { var p = wick(c); if (out) FX.smoke(p.x, p.y - 4); else FX.sparkles(p.x, p.y - 20, 6); }
    }
    function afterChange() {
      if (!lit().length) celebrate();
      else { celebrated = false; msgEl.classList.remove('show'); setStatus(lit().length + ' of 5 candles still glowing.'); }
    }
    function celebrate() {
      if (celebrated) return; celebrated = true; wrap.classList.remove('wishing');
      var c = FX.center(wrap); FX.celebrate(c.x, c.y - c.h * .15);
      setTimeout(function () { FX.hearts(c.x, c.y, 16); FX.confetti(c.x - c.w * .3, c.y, 40); FX.confetti(c.x + c.w * .3, c.y, 40); }, 500);
      msgEl.textContent = T(C.wishMessage); msgEl.classList.add('show'); setStatus('Your wish is on its way \u2661');
      if (navigator.vibrate) navigator.vibrate([40, 30, 80]);
      Progress.done('cake');
    }
    candles.forEach(function (c) {
      var act = function () { if (busy) return; setOut(c, !c.classList.contains('out')); afterChange(); };
      c.addEventListener('click', act);
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });
    async function blowAll() {
      if (busy) return; var on = lit(); if (!on.length) { setStatus('They are already out. Tap Relight to try again.'); return; }
      busy = true; var cp = FX.center(wrap); setStatus('Whoooosh...');
      FX.puff(cp.x - cp.w * .55, cp.y - cp.h * .2, 12); await wait(120); FX.puff(cp.x - cp.w * .5, cp.y - cp.h * .22, 10);
      on.forEach(function (c) { c.classList.add('lean'); }); await wait(560);
      for (var i = 0; i < on.length; i++) { setOut(on[i], true); await wait(130); }
      await wait(350); busy = false; afterChange();
    }
    function relight() { if (busy) return; stopMic(); candles.forEach(function (c) { setOut(c, false, true); var p = wick(c); FX.sparkles(p.x, p.y - 22, 4); }); celebrated = false; msgEl.classList.remove('show'); setStatus('The candles are glowing again \u2661'); }
    function wish() {
      var cp = FX.center(wrap); wrap.classList.add('wishing'); FX.sparkles(cp.x, cp.y - cp.h * .1, 26);
      setStatus('Close your eyes... think of your biggest wish...'); $('#btn-blow').classList.remove('pulse-btn');
      setTimeout(function () { setStatus('Now take a deep breath and blow them out!'); $('#btn-blow').classList.add('pulse-btn'); }, 3200);
    }
    function stopMic() {
      if (!mic) return; mic.stop = true; try { mic.stream.getTracks().forEach(function (t) { t.stop(); }); mic.ctx.close(); } catch (e) {} mic = null; micOn = false;
      var b = $('#btn-mic'); b.setAttribute('aria-pressed', 'false'); b.textContent = 'Blow with my microphone';
    }
    async function toggleMic() {
      if (micOn) { stopMic(); setStatus('Microphone off. You can still tap to blow.'); return; }
      try {
        var stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        var AC = window.AudioContext || window.webkitAudioContext, ctx = new AC(), src = ctx.createMediaStreamSource(stream), an = ctx.createAnalyser(); an.fftSize = 512; src.connect(an);
        mic = { stream: stream, ctx: ctx, stop: false }; micOn = true; var b = $('#btn-mic'); b.setAttribute('aria-pressed', 'true'); b.textContent = 'Listening... (tap to stop)';
        setStatus('Take a deep breath and blow gently towards your microphone.');
        var buf = new Uint8Array(an.fftSize), loud = 0, t0 = Date.now(), thr = C.micSensitivity || .16;
        (function loop() {
          if (!mic || mic.stop) return; an.getByteTimeDomainData(buf); var sum = 0, i;
          for (i = 0; i < buf.length; i++) { var v = (buf[i] - 128) / 128; sum += v * v; }
          var rms = Math.sqrt(sum / buf.length); loud = rms > thr ? loud + 1 : Math.max(0, loud - 1);
          if (loud > 9) { stopMic(); blowAll(); return; }
          if (Date.now() - t0 > 30000) { stopMic(); setStatus('Microphone stopped. Tap Blow whenever you are ready.'); return; }
          requestAnimationFrame(loop);
        })();
      } catch (e) { setStatus('The microphone is not available, so just tap "Blow out the candles" instead \u2661'); }
    }
    $('#btn-wish').addEventListener('click', wish); $('#btn-blow').addEventListener('click', blowAll);
    $('#btn-relight').addEventListener('click', relight); $('#btn-mic').addEventListener('click', toggleMic);
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) $('#btn-mic').style.display = 'none';
  }

  /* ---------- LETTERS ---------- */
  var BOW = '<svg viewBox="0 0 100 60" aria-hidden="true"><use href="#bow"/></svg>';
  function initLetters() {
    var grid = $('#letter-grid'), read = {}, modal = $('#letter-modal'), paper = modal.querySelector('.letter-paper'), lastEnv = null;
    function secretLocked() { var n = 0; C.letters.forEach(function (L, i) { if (!L.secret && read[i]) n++; }); return n < C.letters.filter(function (L) { return !L.secret; }).length; }
    C.letters.forEach(function (L, i) {
      var card = document.createElement('div'); card.className = 'env-card reveal' + (L.secret ? ' locked' : ''); card.style.setProperty('--d', (i * 140) + 'ms');
      card.innerHTML = '<button class="envelope" type="button" aria-haspopup="dialog" aria-label="Open letter: ' + esc(T(L.label)) + (L.secret ? ' (locked until you read the first two)' : '') + '">' +
        '<span class="env-back"></span><span class="env-letter"><span class="env-letter-title">' + esc(T(L.title)) + '</span></span><span class="env-pocket"></span>' +
        '<span class="env-ribbon"></span><span class="env-bow">' + BOW + '</span>' +
        '<svg class="env-heart eh1" aria-hidden="true"><use href="#heart"/></svg><svg class="env-heart eh2" aria-hidden="true"><use href="#heart"/></svg>' +
        '<span class="env-flap"></span><span class="seal"><svg aria-hidden="true"><use href="#heart"/></svg></span>' +
        (L.secret ? '<span class="env-lock"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.400" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="3" fill="#b4476a"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span>' : '') +
        '</button><p class="env-label">' + esc(T(L.label)) + '</p>';
      grid.appendChild(card); Reveal.observe(card);
      var env = card.querySelector('.envelope');
      env.addEventListener('click', async function () {
        if (L.secret && secretLocked()) { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); toast('Read the first two letters to break this seal \u2661'); return; }
        if (!env.classList.contains('opened')) {
          env.classList.add('opened'); var c = FX.center(env); FX.sparkles(c.x, c.y, 14); await wait(480); env.classList.add('slid'); await wait(750);
        }
        openModal(i, env);
      });
    });
    function openModal(i, env) {
      var L = C.letters[i]; lastEnv = env;
      $('#lm-kicker').textContent = T(L.kicker || ''); $('#lm-title').textContent = T(L.title);
      var body = $('#lm-body'); body.innerHTML = '';
      L.paragraphs.forEach(function (p, n) { var el = document.createElement('p'); el.className = 'lm-line'; el.style.setProperty('--i', n); el.textContent = T(p); body.appendChild(el); });
      var sg = $('#lm-sign'); sg.style.setProperty('--i', L.paragraphs.length); sg.innerHTML = esc(T(L.sign || '')) + '<br>' + esc(T(C.from || ''));
      modal.hidden = false; requestAnimationFrame(function () { modal.classList.add('show'); paper.focus({ preventScroll: true }); }); paper.scrollTop = 0;
      document.body.style.overflow = 'hidden';
      var pc = FX.center(paper); FX.hearts(pc.x, pc.y - pc.h * .3, 10);
      var firstTime = !read[i]; read[i] = true;
      if (firstTime) {
        if (L.secret) { /* nothing */ } else if (!secretLocked()) { setTimeout(function () { var sc = $('.env-card.locked'); if (sc) { sc.classList.remove('locked'); toast('A secret envelope just unlocked \u2661'); var e = FX.center(sc); FX.sparkles(e.x, e.y, 26); } }, 700); }
        if (Object.keys(read).length >= C.letters.length) Progress.done('letters');
      }
    }
    function closeModal() {
      modal.classList.remove('show'); document.body.style.overflow = ''; setTimeout(function () { modal.hidden = true; }, 350);
      if (lastEnv) lastEnv.focus({ preventScroll: true });
      if (Object.keys(read).length >= C.letters.length) Progress.done('letters');
    }
    modal.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  }

  /* ---------- SCRAPBOOK ---------- */
  function initBook() {
    var S = C.scrapbook, book = $('#book');
    function st(sym, x, y, w, col, rot) { return '<svg class="sc-st" style="--x:' + x + '%;--y:' + y + '%;--w:' + w + '%;--c:' + col + ';--r:' + (rot || 0) + 'deg" aria-hidden="true"><use href="#' + sym + '"/></svg>'; }
    function starBtn(x, y, w, col) { return '<button class="sc-btn sc-star" type="button" style="--x:' + x + '%;--y:' + y + '%;--w:' + w + '%;--c:' + col + '" aria-label="A little star, tap for sparkles"><svg aria-hidden="true"><use href="#star"/></svg></button>'; }
    function heartBtn(x, y, w, col) { return '<button class="sc-btn sc-heart" type="button" style="--x:' + x + '%;--y:' + y + '%;--w:' + w + '%;--c:' + col + '" aria-label="A little heart, tap for love"><svg aria-hidden="true"><use href="#heart"/></svg></button>'; }
    function pol(slot, x, y, w, rot, cap) { return '<div class="sc-pol" style="--x:' + x + '%;--y:' + y + '%;--w:' + w + '%;--r:' + rot + 'deg"><i class="sc-tape"></i><div class="sc-pol-img" data-slot="' + slot + '"></div><span class="sc-cap">' + esc(T(cap)) + '</span></div>'; }
    function note(x, y, w, rot, text) { return '<p class="sc-note" style="--x:' + x + '%;--y:' + y + '%;--w:' + w + '%;--r:' + rot + 'deg">' + esc(text) + '</p>'; }
    var pages = [
      '<div class="page cover"><div class="cover-border"></div>' + st('sparkle', 14, 8, 11, '#fff') + st('sparkle', 76, 14, 8, '#fff') + st('flower', 66, 68, 22, '#ffe3ec', 12) + st('strawberry', 14, 66, 16, '#ef5b7b', -10) +
        '<p class="cv-kicker">' + esc(T(S.kicker)) + '</p><h3 class="cv-title">for<span>' + esc(C.recipient) + '</span></h3><svg class="cv-heart" aria-hidden="true"><use href="#heart"/></svg><p class="cv-hint">tap the page to open \u2661</p></div>',
      '<div class="page"><p class="sc-title">page one</p>' + pol(0, 14, 14, 58, -4, S.captions[0]) + note(14, 68, 74, 2, T(S.note1)) + st('flower', 68, 10, 22, '#ffb3c8', 12) + starBtn(74, 72, 13, '#f3d27a') + st('butterfly', 10, 84, 13, '#ff9fbd', -10) + '</div>',
      '<div class="page"><p class="sc-title">a little secret</p><button class="sc-flap" type="button" aria-expanded="false" aria-label="Lift the flap to read a hidden message"><span class="flap-msg">' + esc(T(S.secret)) + '</span><span class="flap-top">' + esc(S.flapLabel) + '</span></button>' + st('butterfly', 66, 74, 18, '#ff9fbd', 12) + st('heart', 14, 76, 10, '#ffb3c8', -12) + st('sparkle', 80, 10, 10, '#f3d27a') + '</div>',
      '<div class="page"><p class="sc-title">page three</p>' + pol(1, 8, 12, 46, 5, S.captions[1]) + pol(2, 44, 44, 46, -5, S.captions[2]) + st('flower', 8, 62, 20, '#ffd0b8', -8) + starBtn(72, 8, 12, '#f3d27a') + heartBtn(14, 86, 9, '#ff9fbd') + st('strawberry', 80, 86, 11, '#ef5b7b', 14) + '</div>',
      '<div class="page"><p class="sc-title">' + esc(T(S.note2)) + '</p>' + S.tabs.map(function (t, n) { return '<div class="tabrow" style="top:' + (26 + n * 19) + '%"><span class="tab-text">' + esc(T(t)) + '</span><button class="sc-tab" type="button" aria-label="Pull the tab to read it">pull me \u2661</button></div>'; }).join('') + st('flower', 72, 86, 13, '#ffb3c8', 10) + '</div>',
      '<div class="page cover"><div class="cover-border"></div><p class="cv-title" style="top:28%;font-size:7.5cqw">' + esc(T(S.lastTitle)) + '</p><p class="cv-kicker" style="top:46%;padding:0 14%;font-size:5cqw">' + esc(T(S.lastNote)) + '</p>' + heartBtn(38, 64, 24, '#fff') + '</div>'
    ];
    book.innerHTML = '<div class="rings" aria-hidden="true">' + new Array(9).join('<i></i>') + '</div>' + pages.map(function (p, i) { return '<div class="leaf" data-i="' + i + '" style="z-index:' + (pages.length - i) + '">' + p + '</div>'; }).join('');

    function fillSlots() {
      $$('#book .sc-pol-img').forEach(function (el) {
        var src = window.Gallery ? Gallery.src(Number(el.dataset.slot)) : null;
        el.innerHTML = src ? '<img src="' + esc(src) + '" alt="A cherished memory" loading="lazy">' : '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="url(#phG)"/><use href="#heart" x="32" y="32" width="36" height="36" style="color:#fff" opacity=".85"/></svg>';
      });
    }
    fillSlots(); window.addEventListener('gallery:change', fillSlots);

    var leaves = $$('#book .leaf'), idx = 0, last = leaves.length - 1, prev = $('#bk-prev'), next = $('#bk-next'), count = $('#bk-count');
    function sync() {
      leaves.forEach(function (l, i) { l.classList.toggle('flipped', i < idx); l.toggleAttribute('inert', i !== idx); });
      count.textContent = 'Page ' + (idx + 1) + ' of ' + leaves.length; prev.disabled = idx === 0; next.disabled = idx === last;
    }
    function go(n) {
      n = Math.max(0, Math.min(last, n)); if (n === idx) return;
      var fwd = n > idx; idx = n; sync();
      if (fwd) { var r = book.getBoundingClientRect(); FX.sparkles(r.left + r.width * .5, r.top + r.height * .5, 8); }
      if (idx === last) Progress.done('scrapbook');
    }
    sync();
    prev.addEventListener('click', function () { go(idx - 1); });
    next.addEventListener('click', function () { go(idx + 1); });
    book.addEventListener('click', function (e) {
      var star = e.target.closest('.sc-star'), heart = e.target.closest('.sc-heart'), flap = e.target.closest('.sc-flap'), tab = e.target.closest('.sc-tab');
      if (star) { var c = FX.center(star); FX.sparkles(c.x, c.y, 20); Surprise.bump('stars'); return; }
      if (heart) { var h = FX.center(heart); FX.hearts(h.x, h.y, 14); Surprise.bump('hearts'); return; }
      if (flap) { var o = flap.classList.toggle('open'); flap.setAttribute('aria-expanded', String(o)); if (o) { var f = FX.center(flap); FX.sparkles(f.x, f.y, 16); } return; }
      if (tab) { tab.parentNode.classList.add('open'); var t = FX.center(tab.parentNode); FX.hearts(t.x, t.y, 6); return; }
      var r = book.getBoundingClientRect(); go(e.clientX - r.left < r.width * .2 ? idx - 1 : idx + 1);
    });
    book.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') go(idx + 1); else if (e.key === 'ArrowLeft') go(idx - 1); });
  }

  /* ---------- MEMORIES (cards + progress) ---------- */
  function initMemories() {
    var cards = $('#memory-cards'), cols = ['#ff9fbd', '#f3d27a', '#ffb3c8'], icons = ['heart', 'sparkle', 'flower'];
    cards.innerHTML = C.memoryCaptions.slice(0, 3).map(function (c, i) {
      return '<div class="memory-card glass reveal" style="--d:' + (i * 120) + 'ms"><svg style="--c:' + cols[i % 3] + '" aria-hidden="true"><use href="#' + icons[i % 3] + '"/></svg><span>' + esc(T(c)) + '</span></div>';
    }).join('');
    $$('.memory-card').forEach(Reveal.observe);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { setTimeout(function () { Progress.done('memories'); }, 1200); io.disconnect(); } }, { threshold: .35 });
      io.observe($('#memories'));
    } else Progress.done('memories');
  }

  /* ---------- FINALE ---------- */
  function initFinale() {
    var fin = $('#finale'), btn = $('#finale-btn'), text = $('#finale-text'), timers = [];
    function build() {
      var msg = T(C.finalMessage); text.setAttribute('aria-label', msg);
      text.innerHTML = msg.split(/\s+/).map(function (w, i) { return '<span class="w" aria-hidden="true" style="--i:' + i + '">' + esc(w) + '</span>'; }).join(' ');
    }
    function bursts() {
      timers.forEach(clearTimeout); timers = []; var W = window.innerWidth, H = window.innerHeight;
      [0, 700, 1500, 2600, 4000, 5600].forEach(function (d) { timers.push(setTimeout(function () { FX.celebrate(W * (.2 + .6 * Math.random()), H * (.25 + .3 * Math.random())); }, d)); });
      FX.rain(7000);
    }
    function show() {
      build(); document.body.classList.add('is-locked'); fin.classList.remove('hidden', 'play'); void fin.offsetWidth; fin.classList.add('play');
      fin.scrollTop = 0; bursts(); setTimeout(function () { $('#finale-replay').focus({ preventScroll: true }); }, 600);
    }
    function hide() { fin.classList.add('hidden'); fin.classList.remove('play'); document.body.classList.remove('is-locked'); timers.forEach(clearTimeout); }
    btn.addEventListener('click', function () { if (!btn.disabled) show(); });
    $('#finale-replay').addEventListener('click', show);
    $('#finale-back').addEventListener('click', hide);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !fin.classList.contains('hidden')) hide(); });
  }

  window.Interact = {
    init: function () { buildBunting(); initFlowers(); initCake(); initLetters(); initMemories(); initBook(); initFinale(); Progress.render(); }
  };
})();

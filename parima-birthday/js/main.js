/* Boot: config text, passcode, gift opening, music, button ripple */
(function () {
  'use strict';
  var C = window.CONFIG, T = window.T, FX = window.FX, App = window.App;
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var wait = App.wait;
  try { history.scrollRestoration = 'manual'; } catch (e) {}

  /* ---- text from config ---- */
  document.title = T(C.title);
  $$('[data-name]').forEach(function (el) { el.textContent = C.recipient; });
  $('#intro-text').textContent = T(C.intro);
  $('#intro-sign').textContent = T(C.introSign || '');
  $('.ht-line2').dataset.delay = 600;
  $$('[data-split]').forEach(function (el) { Reveal.split(el, T(el.dataset.text)); });
  $('#hero-title').setAttribute('aria-label', 'Happy Birthday, ' + C.recipient + '!');

  /* ---- gift markup (shared by the mini and the big gift) ---- */
  var GIFT = '<span class="gift-shadow"></span><span class="gift-rays"></span><span class="gift-glow"></span><span class="gift-body"><i class="rib"></i></span><span class="gift-lid"><i class="rib"></i><span class="bow"><svg viewBox="0 0 100 60" aria-hidden="true"><use href="#bow"/></svg></span></span>';
  $$('[data-gift]').forEach(function (el) { el.innerHTML = GIFT; });

  /* ---- passcode ---- */
  var code = String(C.passcode), n = Math.min(8, Math.max(3, code.length));
  var wrap = $('#pass-boxes'), card = $('.pass-card'), msg = $('#pass-msg'), form = $('#pass-form'), boxes = [], unlocking = false, autoT = null;
  for (var i = 0; i < n; i++) {
    var b = document.createElement('input');
    b.className = 'pass-box'; b.type = 'text'; b.inputMode = 'numeric'; b.pattern = '[0-9]*'; b.maxLength = 1; b.autocomplete = 'off';
    b.setAttribute('enterkeyhint', i === n - 1 ? 'go' : 'next'); b.setAttribute('aria-label', 'Digit ' + (i + 1) + ' of ' + n);
    wrap.appendChild(b); boxes.push(b);
  }
  var hint = C.passcodeHint ? 'Hint: ' + C.passcodeHint : '';
  msg.textContent = hint;
  function val() { return boxes.map(function (x) { return x.value; }).join(''); }
  function resetState() { card.classList.remove('error'); if (msg.classList.contains('err')) { msg.classList.remove('err'); msg.textContent = hint; } }
  function clearBox(x) { x.value = ''; x.classList.remove('filled'); }
  function autoSubmit() { clearTimeout(autoT); autoT = setTimeout(attempt, 300); }
  function spread(from, digits) {
    var j = 0; for (var k = from; k < n && j < digits.length; k++, j++) { boxes[k].value = digits[j]; boxes[k].classList.add('filled'); }
    boxes[Math.min(n - 1, from + digits.length)].focus(); if (val().length === n) autoSubmit();
  }
  boxes.forEach(function (x, idx) {
    x.addEventListener('input', function () {
      resetState(); var v = x.value.replace(/\D/g, '');
      if (v.length > 1) { x.value = ''; spread(idx, v); return; }
      x.value = v; x.classList.toggle('filled', !!v);
      if (v && idx < n - 1) boxes[idx + 1].focus();
      if (val().length === n) autoSubmit();
    });
    x.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !x.value && idx > 0) { e.preventDefault(); clearBox(boxes[idx - 1]); boxes[idx - 1].focus(); }
      else if (e.key === 'ArrowLeft' && idx > 0) { e.preventDefault(); boxes[idx - 1].focus(); }
      else if (e.key === 'ArrowRight' && idx < n - 1) { e.preventDefault(); boxes[idx + 1].focus(); }
    });
    x.addEventListener('beforeinput', function (e) { if (e.inputType === 'deleteContentBackward' && !x.value && idx > 0) { clearBox(boxes[idx - 1]); boxes[idx - 1].focus(); } });
    x.addEventListener('paste', function (e) { var t = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\D/g, ''); if (t) { e.preventDefault(); spread(idx, t); } });
    x.addEventListener('focus', function () { x.select(); });
  });
  function fail(m, clear) {
    msg.textContent = m; msg.classList.add('err'); card.classList.add('error', 'shake'); if (navigator.vibrate) navigator.vibrate(160);
    setTimeout(function () { card.classList.remove('shake'); }, 600);
    if (clear) setTimeout(function () { boxes.forEach(clearBox); boxes[0].focus(); }, 650);
  }
  function attempt() {
    clearTimeout(autoT); if (unlocking) return; var v = val();
    if (v.length < n) { fail('Please enter all ' + n + ' digits.', false); return; }
    if (v === code) success(); else fail('That is not quite it. Try again \u2661', true);
  }
  async function success() {
    unlocking = true; card.classList.remove('error'); card.classList.add('success'); msg.classList.remove('err'); msg.textContent = 'Unlocked \u2661';
    $('.unlock-label').textContent = 'Unlocked!'; boxes.forEach(function (x) { x.blur(); x.readOnly = true; });
    var c = FX.center(card); FX.celebrate(c.x, c.y); if (navigator.vibrate) navigator.vibrate([30, 40, 60]);
    await wait(1300); $('#lock').classList.add('hidden'); $('#gift-stage').classList.remove('hidden');
    setTimeout(function () { $('#gift').focus({ preventScroll: true }); }, 900);
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); attempt(); });
  if (!(window.matchMedia && matchMedia('(pointer:coarse)').matches)) boxes[0].focus();

  /* ---- gift opening ---- */
  var gift = $('#gift'), opened = false;
  function reveal() {
    $('#gift-stage').classList.add('hidden'); var ex = $('#experience'); ex.classList.remove('hidden'); ex.classList.add('show');
    document.body.classList.remove('is-locked'); window.scrollTo(0, 0); Ambient.enableInteractive(); Ambient.refreshParallax();
    $$('#hero-title [data-split]').forEach(function (el) { el.classList.add('in'); });
    setTimeout(function () { FX.confetti(window.innerWidth / 2, window.innerHeight * .3, 90); FX.hearts(window.innerWidth / 2, window.innerHeight * .4, 16); }, 500);
  }
  gift.addEventListener('click', async function () {
    if (opened) return; opened = true; $('#gift-hint').style.visibility = 'hidden';
    gift.classList.add('wiggle'); await wait(650); gift.classList.remove('wiggle'); gift.classList.add('untie'); await wait(750);
    gift.classList.add('open');
    var r = FX.center(gift.querySelector('.gift-body')), top = r.y - r.h * .4;
    FX.hearts(r.x, top, 26); FX.confetti(r.x, top, 150, 1.2); FX.sparkles(r.x, top, 40); if (navigator.vibrate) navigator.vibrate([30, 40, 70]);
    await wait(900); FX.hearts(r.x, top, 18); FX.confetti(r.x, top, 60);
    await wait(1700); reveal();
  });

  /* ---- button ripple ---- */
  document.addEventListener('pointerdown', function (e) {
    var bt = e.target.closest('.btn'); if (!bt || bt.disabled) return;
    var r = bt.getBoundingClientRect(), s = Math.max(r.width, r.height) * 1.6, sp = document.createElement('span');
    sp.className = 'ripple'; sp.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    bt.appendChild(sp); setTimeout(function () { sp.remove(); }, 700);
  });

  /* ---- music: uses assets/music/birthday.mp3, falls back to a built-in music-box melody ---- */
  (function () {
    var player = $('#player'), playBtn = $('#play'), vol = $('#vol'), muteBtn = $('#mute'), SRC = 'assets/music/birthday.mp3';
    var mode = null, audio = null, ctx = null, master = null, playing = false, muted = false, volume = .6, timer = null, nextStart = 0, told = false;
    var TUNE = [[392,.75],[392,.25],[440,1],[392,1],[523.25,1],[493.88,2],[392,.75],[392,.25],[440,1],[392,1],[587.33,1],[523.25,2],[392,.75],[392,.25],[783.99,1],[659.25,1],[523.25,1],[493.88,1],[440,2],[698.46,.75],[698.46,.25],[659.25,1],[523.25,1],[587.33,1],[523.25,2]];
    var ready = (async function () {
      try {
        var r = await fetch(SRC, { method: 'HEAD', cache: 'no-store' }), ct = r.headers.get('content-type') || '';
        if (r.ok && !/text\/html/i.test(ct)) {
          audio = new Audio(SRC); audio.loop = true; audio.preload = 'auto'; audio.volume = volume;
          audio.addEventListener('error', function () { audio = null; mode = 'synth'; if (playing) startSynth(); });
          mode = 'file'; return;
        }
      } catch (e) {}
      mode = 'synth';
    })();
    function ui() { player.classList.toggle('playing', playing); playBtn.setAttribute('aria-pressed', String(playing)); playBtn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music'); }
    function apply() { var v = muted ? 0 : volume; if (audio) audio.volume = v; if (master) master.gain.setTargetAtTime(v * .5, ctx.currentTime, .03); player.classList.toggle('muted', muted || volume === 0); muteBtn.setAttribute('aria-pressed', String(muted)); muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute'); }
    function ensureCtx() {
      if (ctx) return true; var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      ctx = new AC(); master = ctx.createGain(); var comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination); apply(); return true;
    }
    function note(f, t, d) {
      var len = Math.max(.6, d * 1.8);
      [[1, .5], [2, .16], [3.01, .07]].forEach(function (h) {
        var o = ctx.createOscillator(), e = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * h[0];
        e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(h[1], t + .012); e.gain.exponentialRampToValueAtTime(.0008, t + len);
        o.connect(e); e.connect(master); o.start(t); o.stop(t + len + .05);
      });
    }
    function scheduleTune(t0) { var beat = .62, t = t0; TUNE.forEach(function (nt) { note(nt[0], t, nt[1] * beat); t += nt[1] * beat; }); return t + 1.8; }
    function pump() { if (!playing || mode !== 'synth' || !ctx) return; if (ctx.currentTime + 1 >= nextStart) nextStart = scheduleTune(Math.max(nextStart, ctx.currentTime + .05)); }
    function startSynth() {
      if (!ensureCtx()) { App.toast('Sorry, audio is not supported in this browser.'); return false; }
      ctx.resume(); clearInterval(timer); timer = setInterval(pump, 400); pump(); return true;
    }
    async function play() {
      await ready; playBtn.classList.remove('pulse-btn');
      if (mode === 'file' && audio) { try { await audio.play(); } catch (e) { audio = null; mode = 'synth'; } }
      if (mode === 'synth') {
        if (!startSynth()) return;
        if (!told) { told = true; App.toast('No assets/music/birthday.mp3 yet, so a little music-box melody is playing. Add your own file any time.', 6500); }
      }
      playing = true; ui();
    }
    function pause() { playing = false; if (audio) audio.pause(); if (ctx) ctx.suspend(); clearInterval(timer); ui(); }
    playBtn.classList.add('pulse-btn');
    playBtn.addEventListener('click', function () { if (playing) pause(); else play(); });
    vol.addEventListener('input', function () { volume = vol.value / 100; if (volume > 0) muted = false; apply(); });
    muteBtn.addEventListener('click', function () { muted = !muted; apply(); });
    apply(); ui();
  })();

  /* ---- go! ---- */
  Ambient.init(); Reveal.init(); Interact.init(); Gallery.init();
  if (App.DEV) { $('#lock').classList.add('hidden'); reveal(); }
})();

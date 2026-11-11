/* Particle engine (canvas), ambient floating decor, scroll reveals, parallax */
(function () {
  'use strict';
  var REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var PINKS = ['#ff9fbd', '#ffc2d6', '#ffb3c8', '#e9739b', '#f7c6d6'];
  var MIX = ['#ff9fbd', '#ffc2d6', '#ffd9c7', '#f3dfb0', '#ffffff', '#e9739b', '#c9a45c', '#ffb3c8'];
  var N = function (c) { return REDUCED ? Math.max(1, Math.round(c / 3)) : c; };

  /* ---------- canvas particles ---------- */
  var cv = document.getElementById('fx'), g = cv.getContext('2d');
  var W = 0, H = 0, parts = [], running = false, last = 0;
  function size() {
    var d = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    g.setTransform(d, 0, 0, d, 0, 0);
  }
  size(); window.addEventListener('resize', size);

  function add(p) {
    p.age = 0; p.ph = Math.random() * 6.283;
    if (parts.length > 650) parts.splice(0, 50);
    parts.push(p);
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
  }
  function heartPath(s) { g.beginPath(); g.moveTo(0, s * .9); g.bezierCurveTo(-s * 1.6, -s * .2, -s * .7, -s * 1.2, 0, -s * .45); g.bezierCurveTo(s * .7, -s * 1.2, s * 1.6, -s * .2, 0, s * .9); g.closePath(); }
  function sparkPath(s) { g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * .15, -s * .15, s, 0); g.quadraticCurveTo(s * .15, s * .15, 0, s); g.quadraticCurveTo(-s * .15, s * .15, -s, 0); g.quadraticCurveTo(-s * .15, -s * .15, 0, -s); g.closePath(); }

  function tick(now) {
    var dt = Math.min(40, now - last); last = now; var k = dt / 16.67;
    g.clearRect(0, 0, W, H);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.age += dt;
      if (p.age >= p.life || p.y > H + 80 || p.y < -160 || p.x < -100 || p.x > W + 100) { parts.splice(i, 1); continue; }
      var u = p.age / p.life;
      p.x += p.vx * k; p.y += p.vy * k;
      g.save(); g.translate(p.x, p.y);
      if (p.t === 'c') {
        p.vy += .16 * k; p.vx *= Math.pow(.985, k); p.rot += p.vr * k;
        g.rotate(p.rot); g.globalAlpha = Math.min(1, (1 - u) * 3); g.fillStyle = p.c;
        g.scale(1, Math.cos(p.age * .012 + p.ph)); g.fillRect(-p.s / 2, -p.s * .3, p.s, p.s * .6);
      } else if (p.t === 'h') {
        p.vx = p.vx * Math.pow(.97, k) + Math.sin(p.age * .006 + p.ph) * .03 * k; p.vy = p.vy * Math.pow(.97, k) - .03 * k;
        g.rotate(Math.sin(p.age * .004 + p.ph) * .35);
        g.globalAlpha = u < .12 ? u / .12 : 1 - Math.pow(u, 2.2); g.fillStyle = p.c; heartPath(p.s); g.fill();
      } else if (p.t === 's') {
        p.vx *= Math.pow(.97, k); p.vy = p.vy * Math.pow(.97, k) + .02 * k;
        g.rotate(p.age * .004); g.globalAlpha = Math.sin(u * Math.PI); g.fillStyle = p.c;
        sparkPath(p.s * (.65 + .35 * Math.sin(p.age * .02 + p.ph))); g.fill();
      } else if (p.t === 'm') {
        p.vx += Math.sin(p.age * .004 + p.ph) * .012 * k;
        g.globalAlpha = .24 * (1 - u); g.fillStyle = '#b8a2aa'; g.beginPath(); g.arc(0, 0, p.s * (1 + u * 2), 0, 6.283); g.fill();
      } else if (p.t === 'p') {
        g.globalAlpha = .38 * Math.sin(u * Math.PI); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, p.s * (1 + u * 1.5), 0, 6.283); g.fill();
      } else if (p.t === 'f') {
        p.vx += Math.sin(p.age * .003 + p.ph) * .03 * k; p.vy = Math.min(p.vy + .02 * k, 1.8);
        g.rotate(p.age * .003 + p.ph); g.globalAlpha = 1 - Math.pow(u, 3); g.fillStyle = p.c;
        g.beginPath(); g.ellipse(0, 0, p.s * .5, p.s, 0, 0, 6.283); g.fill();
      }
      g.restore();
    }
    if (parts.length) requestAnimationFrame(tick); else { running = false; g.clearRect(0, 0, W, H); }
  }

  var rainTimer = null;
  var FX = {
    reduced: REDUCED,
    center: function (el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; },
    confetti: function (x, y, c, power) {
      power = power || 1;
      for (var i = 0; i < N(c || 90); i++) {
        var a = rnd(0, 6.283), sp = rnd(3, 11) * power;
        add({ t: 'c', x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4 * power, s: rnd(6, 12), rot: rnd(0, 6), vr: rnd(-.25, .25), c: pick(MIX), life: rnd(1800, 3200) });
      }
    },
    hearts: function (x, y, c) {
      for (var i = 0; i < N(c || 14); i++) {
        var a = rnd(0, 6.283), sp = rnd(1.5, 6);
        add({ t: 'h', x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, s: rnd(5, 11), c: pick(PINKS), life: rnd(1400, 2600) });
      }
    },
    sparkles: function (x, y, c) {
      for (var i = 0; i < N(c || 16); i++) {
        var a = rnd(0, 6.283), sp = rnd(.8, 5);
        add({ t: 's', x: x + rnd(-8, 8), y: y + rnd(-8, 8), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, s: rnd(4, 10), c: pick(['#fff', '#f7e3b5', '#ffd9e4', '#f3d27a']), life: rnd(700, 1500) });
      }
    },
    smoke: function (x, y) {
      for (var i = 0; i < N(7); i++) add({ t: 'm', x: x + rnd(-2, 2), y: y, vx: rnd(-.25, .25), vy: rnd(-1.1, -.6), s: rnd(3, 6), life: rnd(1500, 2600) });
    },
    puff: function (x, y, n) {
      for (var i = 0; i < N(n || 10); i++) add({ t: 'p', x: x + rnd(-10, 10), y: y + rnd(-26, 26), vx: rnd(3, 6), vy: rnd(-.3, .3), s: rnd(6, 13), life: rnd(500, 850) });
    },
    petals: function (x, y, c) {
      for (var i = 0; i < N(c || 14); i++) {
        var a = rnd(-Math.PI, 0), sp = rnd(1, 4);
        add({ t: 'f', x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, s: rnd(5, 9), c: pick(PINKS), life: rnd(2200, 3600) });
      }
    },
    rain: function (ms) {
      clearInterval(rainTimer); var end = Date.now() + (ms || 6000);
      rainTimer = setInterval(function () {
        if (Date.now() > end) { clearInterval(rainTimer); return; }
        for (var i = 0; i < N(4); i++) add({ t: 'c', x: rnd(0, W), y: -10, vx: rnd(-1, 1), vy: rnd(1.5, 3.5), s: rnd(6, 11), rot: rnd(0, 6), vr: rnd(-.15, .15), c: pick(MIX), life: 5200 });
        if (Math.random() < .35) add({ t: 'h', x: rnd(0, W), y: H + 10, vx: rnd(-.6, .6), vy: rnd(-3, -1.5), s: rnd(6, 11), c: pick(PINKS), life: 4200 });
      }, 90);
    },
    celebrate: function (x, y) { FX.confetti(x, y, 100); FX.hearts(x, y, 18); FX.sparkles(x, y, 24); }
  };
  window.FX = FX;

  /* ---------- reveals ---------- */
  var io = null;
  var Reveal = {
    init: function () {
      if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
        }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
      }
      document.querySelectorAll('.reveal,[data-split]').forEach(Reveal.observe);
    },
    observe: function (el) { if (io) io.observe(el); else el.classList.add('in'); },
    split: function (el, text) {
      el.setAttribute('aria-hidden', 'true'); el.innerHTML = '';
      var base = Number(el.dataset.delay || 0);
      Array.from(text).forEach(function (ch, i) {
        var s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; s.style.setProperty('--i', i); s.style.setProperty('--d', base + 'ms'); el.appendChild(s);
      });
    }
  };
  window.Reveal = Reveal;

  /* ---------- parallax ---------- */
  var par = [], ticking = false;
  function onScroll() {
    if (REDUCED || ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = Math.min(window.scrollY, 1400);
      par.forEach(function (el) { el.style.translate = '0 ' + (y * parseFloat(el.dataset.speed)).toFixed(1) + 'px'; });
      ticking = false;
    });
  }

  /* ---------- ambient decor ---------- */
  var Ambient = (function () {
    var layer = document.getElementById('ambient'), bg = document.getElementById('twinkles');
    var small = window.innerWidth < 640, interactive = false, deco = [];
    function svg(id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; }

    function floatItem(kind, isDeco) {
      var d = document.createElement('div'); d.className = 'fi fi-' + kind;
      var s = kind === 'balloon' ? rnd(30, 44) : rnd(18, 30), x0 = rnd(2, 94);
      d.style.setProperty('--s', s + 'px');
      d.style.setProperty('--x0', x0 + 'vw'); d.style.setProperty('--x1', Math.min(96, Math.max(1, x0 + rnd(-16, 16))) + 'vw');
      d.style.setProperty('--dur', rnd(18, 30) + 's'); d.style.setProperty('--dl', (-rnd(0, 24)) + 's');
      d.style.setProperty('--c', kind === 'balloon' ? pick(['#ff9fbd', '#ffc2a8', '#f7d9a0', '#e98aa8', '#ffb8cc']) : pick(PINKS));
      var b = document.createElement(isDeco ? 'span' : 'button'); b.className = 'fi-btn';
      if (!isDeco) { b.type = 'button'; b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); b.addEventListener('click', function () { pop(kind, d, b); }); }
      b.innerHTML = svg(kind); d.appendChild(b); layer.appendChild(d); return d;
    }
    function starItem() {
      var d = document.createElement('div'); d.className = 'fi fi-star';
      d.style.setProperty('--s', rnd(20, 30) + 'px'); place(d);
      d.style.setProperty('--c', pick(['#f3d27a', '#ffd98a', '#fff1b8']));
      var b = document.createElement('button'); b.type = 'button'; b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); b.className = 'fi-btn';
      b.innerHTML = svg('star'); b.addEventListener('click', function () { pop('star', d, b); });
      d.appendChild(b); layer.appendChild(d);
    }
    function place(d) { d.style.setProperty('--x', rnd(3, 92) + 'vw'); d.style.setProperty('--y', rnd(10, 86) + 'vh'); }
    function pop(kind, d, b) {
      var c = FX.center(b);
      if (kind === 'heart') {
        FX.hearts(c.x, c.y, 14); FX.sparkles(c.x, c.y, 8); d.remove(); if (window.Surprise) Surprise.bump('hearts');
        setTimeout(function () { if (interactive) floatItem('heart', false); }, rnd(1500, 4000));
      } else if (kind === 'star') {
        FX.sparkles(c.x, c.y, 24); d.classList.add('pop'); if (window.Surprise) Surprise.bump('stars');
        setTimeout(function () { place(d); d.classList.remove('pop'); }, 1800);
      } else {
        b.classList.add('away'); FX.sparkles(c.x, c.y, 10); if (window.Surprise) Surprise.bump('balloons');
        setTimeout(function () { d.remove(); if (interactive) floatItem('balloon', false); }, 4200);
      }
    }
    return {
      init: function () {
        var i, t, tw = small ? 16 : 28;
        for (i = 0; i < tw; i++) {
          t = document.createElement('span'); t.className = 'tw';
          t.style.cssText = '--x:' + rnd(1, 99) + '%;--y:' + rnd(1, 99) + '%;--s:' + rnd(2, 5) + 'px;--dur:' + rnd(3, 7) + 's;--dl:' + (-rnd(0, 6)) + 's';
          bg.appendChild(t);
        }
        if (!REDUCED) {
          var pc = small ? 6 : 11;
          for (i = 0; i < pc; i++) {
            var p = document.createElement('span'); p.className = 'petal';
            p.style.cssText = '--x:' + rnd(0, 98) + 'vw;--s:' + rnd(10, 17) + 'px;--c:' + pick(['#ffc2d6', '#ffb3c8', '#ffd9e4', '#f7c6d6']) + ';--dur:' + rnd(13, 24) + 's;--dl:' + (-rnd(0, 20)) + 's;--dx:' + rnd(-90, 90) + 'px;--rot:' + rnd(180, 540) + 'deg';
            p.innerHTML = svg('petal'); layer.appendChild(p);
          }
          for (i = 0; i < (small ? 3 : 5); i++) deco.push(floatItem('heart', true));
        }
        par = Array.prototype.slice.call(document.querySelectorAll('[data-speed]'));
        window.addEventListener('scroll', onScroll, { passive: true });
      },
      enableInteractive: function () {
        if (interactive || REDUCED) { interactive = true; return; }
        interactive = true; deco.forEach(function (d) { d.remove(); }); deco = [];
        var i; for (i = 0; i < (small ? 3 : 5); i++) floatItem('heart', false);
        for (i = 0; i < (small ? 2 : 3); i++) floatItem('balloon', false);
        for (i = 0; i < (small ? 3 : 5); i++) starItem();
      },
      refreshParallax: function () { par = Array.prototype.slice.call(document.querySelectorAll('[data-speed]')); }
    };
  })();
  window.Ambient = Ambient;
})();

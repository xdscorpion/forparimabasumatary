/* Photo gallery: auto-detects assets/images, uploads (IndexedDB), lightbox, captions */
window.Gallery = (function () {
  'use strict';
  var C = window.CONFIG, T = window.T, esc = window.esc;
  var DB_NAME = 'parima-birthday-photos', STORE = 'photos', META_KEY = 'parima.gallery.meta';
  var OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'], OK_EXT = /\.(jpe?g|png|webp)$/i;
  var db = null, items = [], memStore = [], urls = {}, lbIndex = -1, replaceId = null, lastFocus = null;
  var meta = { captions: {}, hidden: [] };
  try { var m = JSON.parse(localStorage.getItem(META_KEY) || '{}'); meta.captions = m.captions || {}; meta.hidden = m.hidden || []; } catch (e) {}
  function saveMeta() { try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) {} }
  var $ = function (s) { return document.querySelector(s); };
  var grid, input, rInput, lb, lbImg, lbCap, lbCount;
  var ROT = [-4, 3, -2, 5, -5, 2, -3, 4, -1.5, 3.5];
  var SVG = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
    del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg>'
  };

  /* ---- IndexedDB ---- */
  function openDB() {
    return new Promise(function (res) {
      try {
        var r = indexedDB.open(DB_NAME, 1);
        r.onupgradeneeded = function () { r.result.createObjectStore(STORE, { keyPath: 'id' }); };
        r.onsuccess = function () { res(r.result); }; r.onerror = function () { res(null); }; r.onblocked = function () { res(null); };
      } catch (e) { res(null); }
    });
  }
  function dbAll() { return new Promise(function (res) { if (!db) return res([]); try { var q = db.transaction(STORE, 'readonly').objectStore(STORE).getAll(); q.onsuccess = function () { res(q.result || []); }; q.onerror = function () { res([]); }; } catch (e) { res([]); } }); }
  function dbPut(rec) { return new Promise(function (res) { if (!db) return res(false); try { var t = db.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(rec); t.oncomplete = function () { res(true); }; t.onerror = t.onabort = function () { res(false); }; } catch (e) { res(false); } }); }
  function dbDel(id) { return new Promise(function (res) { if (!db) return res(false); try { var t = db.transaction(STORE, 'readwrite'); t.objectStore(STORE).delete(id); t.oncomplete = function () { res(true); }; t.onerror = t.onabort = function () { res(false); }; } catch (e) { res(false); } }); }

  /* ---- discovery of permanent photos ---- */
  function probe(src) { return new Promise(function (res) { var im = new Image(); im.onload = function () { res(true); }; im.onerror = function () { res(false); }; im.src = src; }); }
  async function discover() {
    var found = {}, listed = [];
    try {
      var r = await fetch('assets/images/', { cache: 'no-store' });
      if (r.ok) {
        var t = await r.text(), re = /href="([^"?#]+\.(?:jpe?g|png|webp))"/gi, mm;
        while ((mm = re.exec(t))) { var f = decodeURIComponent(mm[1]).split('/').pop(); found[f] = true; }
      }
    } catch (e) {}
    (C.photos || []).forEach(function (p) { if (p && p.file && !found[p.file]) listed.push(p.file); });
    for (var i = 0; i < listed.length; i++) { if (await probe('assets/images/' + encodeURIComponent(listed[i]))) found[listed[i]] = true; }
    return Object.keys(found).sort(function (a, b) { return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }); });
  }

  function urlFor(id, blob) { if (!urls[id]) urls[id] = URL.createObjectURL(blob); return urls[id]; }
  function cfgCaption(file) {
    if (C.photoCaptions && C.photoCaptions[file]) return C.photoCaptions[file];
    var p = (C.photos || []).filter(function (x) { return x.file === file; })[0]; return p && p.caption;
  }
  function captionFor(it, i) { return meta.captions[it.id] != null ? meta.captions[it.id] : (it.kind === 'cfg' && cfgCaption(it.file)) || T(C.memoryCaptions[i % C.memoryCaptions.length]); }

  async function load() {
    db = await openDB();
    var files = await discover();
    var cfg = files.filter(function (f) { return meta.hidden.indexOf('cfg:' + f) < 0; }).map(function (f) { return { id: 'cfg:' + f, kind: 'cfg', file: f, src: 'assets/images/' + encodeURIComponent(f) }; });
    var recs = db ? await dbAll() : memStore.slice();
    recs.sort(function (a, b) { return a.ts - b.ts; });
    var ups = recs.map(function (r) { return { id: r.id, kind: 'up', blob: r.blob, ts: r.ts, src: urlFor(r.id, r.blob) }; });
    items = cfg.concat(ups);
  }

  /* ---- rendering ---- */
  function render() {
    var html = '<button class="polaroid add-tile reveal in" type="button" data-act="add" style="--r:-2deg" aria-label="Add photos"><span class="add-box">' + SVG.plus + '<span>Add photos</span><small style="font-size:1rem;opacity:.7">or drop them here</small></span></button>';
    if (!items.length) {
      var arts = ['heart', 'flower', 'butterfly'];
      for (var k = 0; k < 3; k++) {
        html += '<button class="polaroid ph" type="button" data-act="add" style="--r:' + ROT[k + 1] + 'deg" aria-label="Add your first photo"><div class="pol-img"><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="url(#phG)"/><use href="#' + arts[k] + '" x="30" y="30" width="40" height="40" style="color:#fff" opacity=".85"/></svg></div><span class="pol-cap" style="pointer-events:none;line-height:36px">' + esc(T(C.memoryCaptions[k % C.memoryCaptions.length])) + '</span></button>';
      }
    }
    items.forEach(function (it, i) {
      var cap = captionFor(it, i);
      html += '<figure class="polaroid" style="--r:' + ROT[i % ROT.length] + 'deg" data-id="' + esc(it.id) + '">' +
        '<div class="pol-actions"><button class="pol-act" type="button" data-act="replace" aria-label="Replace this photo">' + SVG.swap + '</button><button class="pol-act" type="button" data-act="delete" aria-label="Remove this photo">' + SVG.del + '</button></div>' +
        '<button class="pol-open" type="button" data-act="open" aria-label="Open photo: ' + esc(cap) + '"><div class="pol-img"><img src="' + esc(it.src) + '" alt="' + esc(cap) + '" loading="lazy" decoding="async"></div></button>' +
        '<input class="pol-cap" type="text" maxlength="80" value="' + esc(cap) + '" aria-label="Photo caption" data-cap></figure>';
    });
    grid.innerHTML = html;
    grid.querySelectorAll('img').forEach(function (im) { im.addEventListener('error', function () { var f = im.closest('.polaroid'); if (f) f.style.display = 'none'; }); });
    window.dispatchEvent(new CustomEvent('gallery:change'));
  }
  function idxOf(id) { for (var i = 0; i < items.length; i++) if (items[i].id === id) return i; return -1; }

  /* ---- adding / replacing / removing ---- */
  async function shrink(file) {
    try {
      var bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      var s = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
      if (s === 1 && file.size < 1.5e6 && file.type !== 'image/png') return file;
      var c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(bmp, 0, 0, c.width, c.height);
      return await new Promise(function (r) { c.toBlob(function (b) { r(b || file); }, 'image/jpeg', .88); });
    } catch (e) { return file; }
  }
  function validFile(f) { return OK_TYPES.indexOf(f.type) >= 0 || OK_EXT.test(f.name); }
  async function store(blob, extra) {
    var rec = { id: 'up:' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), blob: blob, ts: Date.now() + (extra || 0) };
    var ok = await dbPut(rec); if (!ok) memStore.push(rec);
    return { rec: rec, persisted: ok };
  }
  async function handleFiles(list) {
    var files = Array.prototype.slice.call(list || []), good = files.filter(validFile), added = 0, mem = false;
    if (files.length && files.length !== good.length) App.toast('Only JPG, PNG and WebP photos can be added.');
    for (var i = 0; i < good.length; i++) {
      var blob = await shrink(good[i]), r = await store(blob, i); if (!r.persisted) mem = true;
      items.push({ id: r.rec.id, kind: 'up', blob: blob, ts: r.rec.ts, src: urlFor(r.rec.id, blob) }); added++;
    }
    if (added) {
      render(); FX.sparkles(window.innerWidth / 2, window.innerHeight / 2, 18);
      App.toast(mem ? 'Added, but this browser cannot save photos, so they will vanish when you close the page.' : 'Added ' + added + ' photo' + (added > 1 ? 's' : '') + ' \u2661');
    }
    input.value = '';
  }
  async function replaceWith(file) {
    if (!file || !validFile(file) || replaceId == null) return;
    var i = idxOf(replaceId); if (i < 0) return; var it = items[i], blob = await shrink(file);
    if (it.kind === 'up') {
      var rec = { id: it.id, blob: blob, ts: it.ts }; var ok = await dbPut(rec);
      if (!ok) { memStore = memStore.filter(function (r) { return r.id !== it.id; }); memStore.push(rec); }
      if (urls[it.id]) URL.revokeObjectURL(urls[it.id]); delete urls[it.id]; it.blob = blob; it.src = urlFor(it.id, blob);
    } else {
      meta.hidden.push(it.id); saveMeta(); items.splice(i, 1);
      var r = await store(blob); items.push({ id: r.rec.id, kind: 'up', blob: blob, ts: r.rec.ts, src: urlFor(r.rec.id, blob) });
    }
    replaceId = null; rInput.value = ''; render(); if (lbIndex >= 0) { lbIndex = Math.min(lbIndex, items.length - 1); showLb(); }
    App.toast('Photo replaced \u2661');
  }
  async function remove(id) {
    var i = idxOf(id); if (i < 0) return; var it = items[i];
    if (!window.confirm(it.kind === 'cfg' ? 'Hide this photo? (The file stays in assets/images, it is only hidden on this browser.)' : 'Remove this photo?')) return;
    if (it.kind === 'cfg') { meta.hidden.push(it.id); saveMeta(); }
    else { await dbDel(it.id); memStore = memStore.filter(function (r) { return r.id !== it.id; }); if (urls[it.id]) { URL.revokeObjectURL(urls[it.id]); delete urls[it.id]; } }
    items.splice(i, 1); render();
    if (lbIndex >= 0) { if (!items.length) closeLb(); else { lbIndex = Math.min(lbIndex, items.length - 1); showLb(); } }
  }
  function setCaption(id, v) { meta.captions[id] = v; saveMeta(); }

  /* ---- lightbox ---- */
  function showLb(swap) {
    var it = items[lbIndex]; if (!it) return;
    var cap = captionFor(it, lbIndex);
    function apply() { lbImg.src = it.src; lbImg.alt = cap; lbImg.classList.remove('swap'); }
    if (swap) { lbImg.classList.add('swap'); setTimeout(apply, 180); } else apply();
    lbCap.value = cap; lbCount.textContent = (lbIndex + 1) + ' / ' + items.length;
    $('#lb-prev').style.display = $('#lb-next').style.display = items.length > 1 ? '' : 'none';
  }
  function openLb(i) { lastFocus = document.activeElement; lbIndex = i; lb.hidden = false; showLb(); requestAnimationFrame(function () { lb.classList.add('show'); $('#lb-close').focus(); }); document.body.style.overflow = 'hidden'; }
  function closeLb() { lb.classList.remove('show'); lbIndex = -1; setTimeout(function () { lb.hidden = true; }, 350); document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); render(); }
  function step(d) { if (items.length < 2) return; lbIndex = (lbIndex + d + items.length) % items.length; showLb(true); }

  function init() {
    grid = $('#polaroids'); input = $('#photo-input'); rInput = $('#replace-input'); lb = $('#lightbox'); lbImg = $('#lb-img'); lbCap = $('#lb-cap'); lbCount = $('#lb-count');
    $('#btn-add').addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () { handleFiles(input.files); });
    rInput.addEventListener('change', function () { replaceWith(rInput.files[0]); });
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return; var fig = b.closest('.polaroid'), act = b.dataset.act, id = fig && fig.dataset.id;
      if (act === 'add') input.click();
      else if (act === 'open') openLb(idxOf(id));
      else if (act === 'replace') { replaceId = id; rInput.click(); }
      else if (act === 'delete') remove(id);
    });
    grid.addEventListener('change', function (e) { var t = e.target; if (t.matches('[data-cap]')) { var id = t.closest('.polaroid').dataset.id; setCaption(id, t.value); } });
    var sec = $('#memories');
    ['dragenter', 'dragover'].forEach(function (ev) { sec.addEventListener(ev, function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0) { e.preventDefault(); sec.classList.add('drag'); } }); });
    sec.addEventListener('dragleave', function (e) { if (!sec.contains(e.relatedTarget)) sec.classList.remove('drag'); });
    sec.addEventListener('drop', function (e) { e.preventDefault(); sec.classList.remove('drag'); handleFiles(e.dataTransfer.files); });
    $('#lb-close').addEventListener('click', closeLb); $('#lb-prev').addEventListener('click', function () { step(-1); }); $('#lb-next').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    lbCap.addEventListener('change', function () { var it = items[lbIndex]; if (it) setCaption(it.id, lbCap.value); });
    $('#lb-replace').addEventListener('click', function () { var it = items[lbIndex]; if (it) { replaceId = it.id; rInput.click(); } });
    $('#lb-delete').addEventListener('click', function () { var it = items[lbIndex]; if (it) remove(it.id); });
    document.addEventListener('keydown', function (e) {
      if (lbIndex < 0) return;
      if (e.target === lbCap && e.key !== 'Escape') return;
      if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); sx = null; }, { passive: true });
    return load().then(render).catch(function () { items = []; render(); });
  }
  return { init: init, count: function () { return items.length; }, src: function (i) { return items[i] ? items[i].src : null; } };
})();

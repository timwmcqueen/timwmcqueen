(() => {
  const $ = id => document.getElementById(id);
  const video = $('video');
  const viewport = $('timelineViewport');
  const content = $('timelineContent');
  const startHandle = $('startHandle');
  const endHandle = $('endHandle');
  const PPS = 8;

  let file = null;
  let url = '';
  let dur = 0;
  let clipStart = 0;
  let clipEnd = 30;
  let clips = [];
  let draggingBoundary = null;
  let boundaryWasPlaying = false;
  let userScrubbing = false;
  let scrubWasPlaying = false;
  let syncingScroll = false;
  let scrollRAF = 0;
  let playRAF = 0;

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const fmt = t => {
    t = Math.max(0, Number(t) || 0);
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    const sec = s.toFixed(2).padStart(5, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
  };
  const fmtTick = t => {
    t = Math.max(0, Math.floor(t));
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  };
  function toast(message) {
    const el = $('toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 1600);
  }

  if (!matchMedia('(display-mode: standalone)').matches && !navigator.standalone) $('install').style.display = 'block';
  $('pickBtn').onclick = () => $('fileInput').click();
  $('fileInput').onchange = e => e.target.files[0] && loadVideo(e.target.files[0]);

  function loadVideo(f) {
    file = f;
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(f);
    video.src = url;
    video.load();
    $('picker').style.display = 'none';
    $('workspace').style.display = 'block';
  }

  video.onloadedmetadata = () => {
    dur = Number.isFinite(video.duration) ? video.duration : 0;
    clipStart = 0;
    clipEnd = Math.min(dur, 30);
    buildTimeline();
    restoreClips();
    syncTimelineTo(0, false);
    updateUI();
  };

  function buildTimeline() {
    const vw = viewport.clientWidth || 320;
    content.style.width = `${Math.max(vw, dur * PPS + vw)}px`;
    const half = vw / 2;
    const step = dur > 7200 ? 60 : 30;
    let labels = '';
    for (let t = 0; t <= dur; t += step) labels += `<span class="tickLabel" style="left:${half + t * PPS}px">${fmtTick(t)}</span>`;
    $('ticks').innerHTML = labels;
    positionRange();
  }

  function halfWidth() { return (viewport.clientWidth || 320) / 2; }
  function xForTime(t) { return halfWidth() + clamp(t, 0, dur) * PPS; }
  function timeForClientX(clientX) {
    const r = viewport.getBoundingClientRect();
    const x = viewport.scrollLeft + clientX - r.left;
    return clamp((x - halfWidth()) / PPS, 0, dur);
  }

  function positionRange() {
    if (!dur) return;
    const a = xForTime(clipStart), b = xForTime(clipEnd);
    startHandle.style.left = `${a}px`;
    endHandle.style.left = `${b}px`;
    $('selection').style.left = `${a}px`;
    $('selection').style.width = `${Math.max(0, b - a)}px`;
    startHandle.dataset.time = fmt(clipStart);
    endHandle.dataset.time = fmt(clipEnd);
    $('startReadout').textContent = fmt(clipStart);
    $('endReadout').textContent = fmt(clipEnd);
    $('selectionDuration').textContent = `${(clipEnd - clipStart).toFixed(2)} sec`;
  }

  function updateUI() {
    if (!dur) return;
    const t = clamp(video.currentTime || 0, 0, dur);
    $('now').textContent = fmt(t);
    $('dur').textContent = fmt(dur);
    $('playheadBubble').textContent = fmt(t);
    positionRange();
  }

  function seek(t) {
    t = clamp(t, 0, dur);
    if (Math.abs((video.currentTime || 0) - t) > .003) {
      try { video.currentTime = t; } catch {}
    }
    $('now').textContent = fmt(t);
    $('playheadBubble').textContent = fmt(t);
  }

  function syncTimelineTo(t, animated = false) {
    syncingScroll = true;
    const left = clamp(t, 0, dur) * PPS;
    if (animated) viewport.scrollTo({ left, behavior: 'smooth' }); else viewport.scrollLeft = left;
    requestAnimationFrame(() => { syncingScroll = false; });
  }

  function animationLoop() {
    cancelAnimationFrame(playRAF);
    const loop = () => {
      if (!video.paused && !userScrubbing && !draggingBoundary) {
        syncTimelineTo(video.currentTime, false);
        updateUI();
        playRAF = requestAnimationFrame(loop);
      }
    };
    playRAF = requestAnimationFrame(loop);
  }

  function togglePlay() {
    if (video.paused) video.play().catch(() => {}); else video.pause();
  }
  $('videoTap').onclick = togglePlay;
  video.onplay = () => { $('videoTap').classList.add('playing'); animationLoop(); };
  video.onpause = () => { $('videoTap').classList.remove('playing'); cancelAnimationFrame(playRAF); };
  video.ontimeupdate = () => { if (video.paused) updateUI(); };

  viewport.addEventListener('scroll', () => {
    if (syncingScroll || draggingBoundary) return;
    cancelAnimationFrame(scrollRAF);
    scrollRAF = requestAnimationFrame(() => {
      const t = clamp(viewport.scrollLeft / PPS, 0, dur);
      seek(t);
    });
  }, { passive: true });

  viewport.addEventListener('pointerdown', e => {
    if (e.target.closest('.boundary')) return;
    userScrubbing = true;
    scrubWasPlaying = !video.paused;
    video.pause();
  }, { passive: true });
  window.addEventListener('pointerup', () => {
    if (!userScrubbing || draggingBoundary) return;
    userScrubbing = false;
    if (scrubWasPlaying) video.play().catch(() => {});
  });
  window.addEventListener('pointercancel', () => { userScrubbing = false; });

  function beginBoundary(kind, e) {
    e.preventDefault(); e.stopPropagation();
    draggingBoundary = kind;
    boundaryWasPlaying = !video.paused;
    video.pause();
    const el = kind === 'start' ? startHandle : endHandle;
    el.classList.add('dragging');
    try { el.setPointerCapture(e.pointerId); } catch {}
    moveBoundary(kind, e.clientX);
  }

  function moveBoundary(kind, clientX) {
    if (!draggingBoundary) return;
    const r = viewport.getBoundingClientRect();
    if (clientX < r.left + 44) viewport.scrollLeft = Math.max(0, viewport.scrollLeft - 12);
    if (clientX > r.right - 44) viewport.scrollLeft = Math.min(dur * PPS, viewport.scrollLeft + 12);
    const t = timeForClientX(clientX);
    if (kind === 'start') clipStart = clamp(t, 0, Math.max(0, clipEnd - .02));
    else clipEnd = clamp(t, Math.min(dur, clipStart + .02), dur);
    seek(kind === 'start' ? clipStart : clipEnd);
    positionRange();
  }

  function endBoundary() {
    if (!draggingBoundary) return;
    const el = draggingBoundary === 'start' ? startHandle : endHandle;
    el.classList.remove('dragging');
    draggingBoundary = null;
    if (boundaryWasPlaying) video.play().catch(() => {});
  }

  startHandle.onpointerdown = e => beginBoundary('start', e);
  endHandle.onpointerdown = e => beginBoundary('end', e);
  window.addEventListener('pointermove', e => draggingBoundary && moveBoundary(draggingBoundary, e.clientX), { passive: false });
  window.addEventListener('pointerup', endBoundary);
  window.addEventListener('pointercancel', endBoundary);

  $('addClip').onclick = addClip;
  $('clearAll').onclick = () => {
    if (!clips.length || confirm('Remove all clips?')) { clips = []; saveClips(); renderLibrary(); }
  };

  function storageKey() { return file ? `clipmine:${file.name}:${file.size}:${file.lastModified}` : ''; }
  function saveClips() {
    try { localStorage.setItem(storageKey(), JSON.stringify(clips.map(({ id, name, start, end }) => ({ id, name, start, end })))); } catch {}
  }
  function restoreClips() {
    try { clips = JSON.parse(localStorage.getItem(storageKey()) || '[]'); } catch { clips = []; }
    renderLibrary();
  }

  async function thumbnailAt(t) {
    return new Promise(resolve => {
      const v = document.createElement('video'); v.src = url; v.muted = true; v.playsInline = true;
      v.onloadedmetadata = () => { v.currentTime = clamp(t, 0, dur); };
      v.onseeked = () => {
        const c = document.createElement('canvas'); c.width = 220; c.height = Math.max(124, Math.round(220 * (v.videoHeight || 9) / (v.videoWidth || 16)));
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height); resolve(c.toDataURL('image/jpeg', .65)); v.remove();
      };
      setTimeout(() => resolve(''), 2200);
    });
  }

  async function addClip() {
    if (clipEnd - clipStart < .1) return toast('Choose a longer range');
    const c = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name: `Clip ${clips.length + 1}`, start: +clipStart.toFixed(3), end: +clipEnd.toFixed(3), thumb: '' };
    clips.push(c); saveClips(); renderLibrary();
    c.thumb = await thumbnailAt(c.start); renderLibrary();
    toast('Clip created — keep watching');

    const anchor = clamp(video.currentTime || clipEnd, 0, dur);
    if (dur - anchor > .1) { clipStart = anchor; clipEnd = Math.min(dur, anchor + 30); }
    else { clipEnd = dur; clipStart = Math.max(0, dur - 30); }
    positionRange();
  }

  function esc(s) { return String(s).replace(/[&<>\"]/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m])); }
  function renderLibrary() {
    $('clipCount').textContent = clips.length ? `(${clips.length})` : '';
    if (!clips.length) { $('clipList').innerHTML = '<div class="empty">No clips yet.<br><br>Drag Start and End on the timeline, tap Create Clip, then keep watching.</div>'; return; }
    $('clipList').innerHTML = clips.map(c => `<article class="clip" data-id="${c.id}"><div class="clipTop">${c.thumb ? `<img class="thumb" src="${c.thumb}">` : '<div class="thumb"></div>'}<div class="clipMeta"><input class="clipName" value="${esc(c.name)}"><div class="sub">${fmt(c.start)} → ${fmt(c.end)} · ${(c.end-c.start).toFixed(2)} sec</div></div></div><div class="clipBtns"><button class="tiny" data-a="preview">Preview</button><button class="exportBtn" data-a="export">Export</button><button class="danger" data-a="delete">Delete</button></div></article>`).join('');
    document.querySelectorAll('.clip').forEach(el => {
      const c = clips.find(x => x.id === el.dataset.id);
      el.onclick = e => {
        if (e.target.closest('button') || e.target.closest('input')) return;
        clipStart = c.start; clipEnd = c.end; positionRange(); seek(c.start); syncTimelineTo(c.start, true); scrollTo({ top: 0, behavior: 'smooth' });
      };
      el.querySelector('.clipName').onchange = e => { c.name = e.target.value.trim() || c.name; saveClips(); };
      el.querySelectorAll('[data-a]').forEach(b => b.onclick = e => { e.stopPropagation(); clipAction(c, b.dataset.a); });
    });
  }

  function clipAction(c, action) {
    if (action === 'preview') return showPreview(c);
    if (action === 'delete') { clips = clips.filter(x => x.id !== c.id); saveClips(); renderLibrary(); return; }
    if (action === 'export') window.ClipExporter.export(video, c, toast);
  }

  function showPreview(c) {
    $('sheetTitle').textContent = c.name;
    $('sheetInfo').textContent = `${fmt(c.start)} → ${fmt(c.end)} · ${(c.end-c.start).toFixed(2)} sec`;
    const pv = $('previewVideo'); pv.src = url;
    $('sheet').classList.add('open');
    const ready = () => { pv.currentTime = c.start; pv.play().catch(() => {}); };
    if (pv.readyState >= 1) ready(); else pv.onloadedmetadata = ready;
    const stop = () => { if (pv.currentTime >= c.end) { pv.pause(); pv.removeEventListener('timeupdate', stop); } };
    pv.addEventListener('timeupdate', stop);
  }
  $('closeSheet').onclick = () => { $('previewVideo').pause(); $('sheet').classList.remove('open'); };
  $('sheet').onclick = e => e.target === $('sheet') && $('closeSheet').click();

  addEventListener('resize', () => { if (dur) { buildTimeline(); syncTimelineTo(video.currentTime, false); } });
  if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
})();
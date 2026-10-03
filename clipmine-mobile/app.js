(() => {
  const $ = id => document.getElementById(id);
  const video = $('video');
  const timeline = $('timeline');
  const scrubber = $('scrubber');
  const startHandle = $('startHandle');
  const endHandle = $('endHandle');
  const playBtn = $('playBtn');

  let file = null;
  let url = '';
  let dur = 0;
  let clipStart = 0;
  let clipEnd = 0;
  let clips = [];
  let preview = null;
  let dragging = null;
  let dragRange = null;
  let pendingSeek = null;
  let seekFrame = 0;

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const fmt = t => {
    t = Math.max(0, Number(t) || 0);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    const sec = s.toFixed(2).padStart(5, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
  };
  const fmtShort = t => {
    t = Math.max(0, Number(t) || 0);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  };

  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 1700);
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
    $('durationLabel').textContent = fmtShort(dur);
    restoreClips();
    updateUI();
  };

  video.ontimeupdate = () => {
    if (!dragging) updateUI();
    if (preview && video.currentTime >= preview.end) {
      video.pause();
      preview = null;
    }
  };
  video.onplay = () => playBtn.textContent = '❚❚';
  video.onpause = () => playBtn.textContent = '▶';

  function togglePlay() {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }
  playBtn.onclick = togglePlay;
  $('videoTap').onclick = togglePlay;

  $('setStart').onclick = () => {
    clipStart = clamp(video.currentTime, 0, Math.max(0, dur - .05));
    if (clipStart >= clipEnd) clipEnd = Math.min(dur, clipStart + 5);
    updateUI();
    toast(`Start ${fmt(clipStart)}`);
  };
  $('setEnd').onclick = () => {
    clipEnd = clamp(video.currentTime, .05, dur);
    if (clipEnd <= clipStart) clipStart = Math.max(0, clipEnd - 5);
    updateUI();
    toast(`End ${fmt(clipEnd)}`);
  };
  $('playSelection').onclick = () => playRange(clipStart, clipEnd);
  $('addClip').onclick = addClip;
  $('clearAll').onclick = () => {
    if (!clips.length || confirm('Remove all clips?')) {
      clips = [];
      saveClips();
      renderLibrary();
    }
  };

  function activeRange() {
    if (dragRange) return dragRange;
    return [0, dur || 1];
  }

  function timeToPercent(t) {
    const [a, b] = activeRange();
    return clamp((t - a) / Math.max(.001, b - a) * 100, 0, 100);
  }

  function xToTime(clientX) {
    const r = timeline.getBoundingClientRect();
    const [a, b] = activeRange();
    const p = clamp((clientX - r.left) / Math.max(1, r.width), 0, 1);
    return a + p * (b - a);
  }

  function scheduleSeek(t) {
    pendingSeek = clamp(t, 0, dur);
    if (seekFrame) return;
    seekFrame = requestAnimationFrame(() => {
      seekFrame = 0;
      if (pendingSeek == null) return;
      const target = pendingSeek;
      pendingSeek = null;
      if (Math.abs(video.currentTime - target) > .005) {
        try { video.currentTime = target; } catch {}
      }
      updateUI(target);
    });
  }

  function precisionRange(around) {
    if (dur <= 180) return [0, dur];
    const span = 120;
    let a = around - span / 2;
    let b = around + span / 2;
    if (a < 0) { b -= a; a = 0; }
    if (b > dur) { a -= b - dur; b = dur; }
    return [Math.max(0, a), Math.min(dur, b)];
  }

  function beginDrag(kind, e) {
    e.preventDefault();
    e.stopPropagation();
    const wasPlaying = !video.paused;
    video.pause();
    dragging = { kind, pointerId: e.pointerId, wasPlaying };
    const target = kind === 'start' ? clipStart : kind === 'end' ? clipEnd : video.currentTime;
    dragRange = (kind === 'start' || kind === 'end') ? precisionRange(target) : null;
    const el = kind === 'start' ? startHandle : kind === 'end' ? endHandle : scrubber;
    el.classList.add('dragging');
    try { el.setPointerCapture(e.pointerId); } catch {}
    updateDrag(e.clientX);
  }

  function updateDrag(clientX) {
    if (!dragging) return;
    const t = xToTime(clientX);
    if (dragging.kind === 'start') {
      clipStart = clamp(t, 0, Math.max(0, clipEnd - .02));
      scheduleSeek(clipStart);
    } else if (dragging.kind === 'end') {
      clipEnd = clamp(t, Math.min(dur, clipStart + .02), dur);
      scheduleSeek(clipEnd);
    } else {
      scheduleSeek(t);
    }
    updateUI(t);
  }

  function endDrag(e) {
    if (!dragging) return;
    const wasPlaying = dragging.wasPlaying;
    const kind = dragging.kind;
    const el = kind === 'start' ? startHandle : kind === 'end' ? endHandle : scrubber;
    el.classList.remove('dragging');
    dragging = null;
    dragRange = null;
    updateUI();
    if (wasPlaying) video.play().catch(() => {});
  }

  startHandle.onpointerdown = e => beginDrag('start', e);
  endHandle.onpointerdown = e => beginDrag('end', e);
  scrubber.onpointerdown = e => beginDrag('scrubber', e);
  timeline.onpointerdown = e => {
    if (e.target.closest('.boundary') || e.target.closest('.scrubber')) return;
    beginDrag('scrubber', e);
  };
  window.addEventListener('pointermove', e => dragging && updateDrag(e.clientX), { passive: false });
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  function updateUI(forcedTime) {
    if (!dur) return;
    const current = forcedTime == null ? (video.currentTime || 0) : clamp(forcedTime, 0, dur);
    const [a, b] = activeRange();
    const startVisible = clipStart >= a && clipStart <= b;
    const endVisible = clipEnd >= a && clipEnd <= b;

    $('now').textContent = fmt(current);
    $('dur').textContent = fmt(dur);
    $('hudNow').textContent = fmt(current);
    $('hudRange').textContent = `${fmt(clipStart)} → ${fmt(clipEnd)}`;
    $('selectionLabel').textContent = `${fmt(clipStart)} → ${fmt(clipEnd)} · ${fmt(clipEnd - clipStart)}`;

    $('timelineFill').style.width = `${timeToPercent(current)}%`;
    scrubber.style.left = `${timeToPercent(current)}%`;
    $('scrubberBubble').textContent = fmt(current);

    const left = timeToPercent(Math.max(clipStart, a));
    const right = timeToPercent(Math.min(clipEnd, b));
    $('selection').style.left = `${left}%`;
    $('selection').style.width = `${Math.max(0, right - left)}%`;

    startHandle.style.left = `${timeToPercent(clipStart)}%`;
    endHandle.style.left = `${timeToPercent(clipEnd)}%`;
    startHandle.style.display = startVisible ? 'block' : 'none';
    endHandle.style.display = endVisible ? 'block' : 'none';
    $('startBubble').textContent = fmt(clipStart);
    $('endBubble').textContent = fmt(clipEnd);

    if (dragRange) {
      $('durationLabel').textContent = fmtShort(b);
      document.querySelector('.timelineLabels span:first-child').textContent = fmtShort(a);
    } else {
      $('durationLabel').textContent = fmtShort(dur);
      document.querySelector('.timelineLabels span:first-child').textContent = '0:00';
    }
  }

  function storageKey() {
    return file ? `clipmine:${file.name}:${file.size}:${file.lastModified}` : '';
  }
  function saveClips() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(clips.map(({ id, name, start, end }) => ({ id, name, start, end }))));
    } catch {}
  }
  function restoreClips() {
    try { clips = JSON.parse(localStorage.getItem(storageKey()) || '[]'); }
    catch { clips = []; }
    renderLibrary();
  }

  async function thumbnailAt(t) {
    return new Promise(resolve => {
      const v = document.createElement('video');
      v.src = url;
      v.muted = true;
      v.playsInline = true;
      v.onloadedmetadata = () => { v.currentTime = clamp(t, 0, dur); };
      v.onseeked = () => {
        const c = document.createElement('canvas');
        c.width = 220;
        c.height = Math.max(124, Math.round(220 * (v.videoHeight || 9) / (v.videoWidth || 16)));
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', .65));
        v.remove();
      };
      setTimeout(() => resolve(''), 2200);
    });
  }

  async function addClip() {
    if (clipEnd - clipStart < .1) return toast('Choose a longer clip');
    const c = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: `Clip ${clips.length + 1}`,
      start: Number(clipStart.toFixed(3)),
      end: Number(clipEnd.toFixed(3)),
      thumb: ''
    };
    clips.push(c);
    saveClips();
    renderLibrary();
    c.thumb = await thumbnailAt(c.start);
    renderLibrary();
    toast('Clip created — keep watching');
  }

  function esc(s) {
    return String(s).replace(/[&<>\"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  }
  function renderLibrary() {
    $('clipCount').textContent = clips.length ? `(${clips.length})` : '';
    if (!clips.length) {
      $('clipList').innerHTML = '<div class="empty">No clips yet.<br><br>Watch the video → Set Start → Set End → Create Clip.<br><br>Then keep watching and make the next one.</div>';
      return;
    }
    $('clipList').innerHTML = clips.map(c => `<article class="clip" data-id="${c.id}"><div class="clipTop">${c.thumb ? `<img class="thumb" src="${c.thumb}">` : '<div class="thumb"></div>'}<div class="clipMeta"><input class="clipName" value="${esc(c.name)}"><div class="sub">${fmt(c.start)} → ${fmt(c.end)} · ${fmt(c.end - c.start)}</div></div></div><div class="clipBtns"><button class="tiny" data-a="preview">Preview</button><button class="tiny" data-a="load">Adjust</button><button class="primary exportBtn" data-a="export">Export MP4</button><button class="danger" data-a="delete">Delete</button></div></article>`).join('');
    document.querySelectorAll('.clip').forEach(el => {
      const c = clips.find(x => x.id === el.dataset.id);
      el.querySelector('.clipName').onchange = e => { c.name = e.target.value.trim() || c.name; saveClips(); };
      el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => clipAction(c, b.dataset.a));
    });
  }

  function clipAction(c, action) {
    if (action === 'preview') return showPreview(c);
    if (action === 'load') {
      clipStart = c.start;
      clipEnd = c.end;
      video.currentTime = clipStart;
      updateUI();
      scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (action === 'delete') {
      clips = clips.filter(x => x.id !== c.id);
      saveClips();
      renderLibrary();
      return;
    }
    if (action === 'export') window.ClipExporter.export(video, c, toast);
  }

  function playRange(start, end) {
    preview = { end };
    video.currentTime = start;
    video.play().catch(() => {});
  }

  function showPreview(c) {
    $('sheetTitle').textContent = c.name;
    $('sheetInfo').textContent = `${fmt(c.start)} → ${fmt(c.end)} · ${fmt(c.end - c.start)}`;
    const pv = $('previewVideo');
    pv.src = url;
    pv.currentTime = c.start;
    $('sheet').classList.add('open');
    const stop = () => {
      if (pv.currentTime >= c.end) {
        pv.pause();
        pv.removeEventListener('timeupdate', stop);
      }
    };
    pv.addEventListener('timeupdate', stop);
    pv.play().catch(() => {});
  }
  $('closeSheet').onclick = () => {
    $('previewVideo').pause();
    $('sheet').classList.remove('open');
  };
  $('sheet').onclick = e => e.target === $('sheet') && $('closeSheet').click();

  if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
})();
(() => {
  const $ = id => document.getElementById(id);
  const sheet = $('sheet');
  const video = $('previewVideo');
  const range = $('previewRange');
  const play = $('previewPlay');
  const tap = $('previewTap');
  const glyph = $('previewGlyph');
  const now = $('previewNow');
  const total = $('previewDur');
  const info = $('sheetInfo');

  let start = 0;
  let end = 0;
  let active = false;
  let scrubbing = false;

  function parseTime(value) {
    const parts = String(value).trim().split(':').map(Number);
    if (parts.some(Number.isNaN)) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
  }

  function fmt(t) {
    t = Math.max(0, Number(t) || 0);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = (t % 60).toFixed(2).padStart(5, '0');
    return h ? `${h}:${String(m).padStart(2,'0')}:${s}` : `${m}:${s}`;
  }

  function clipLength() { return Math.max(0, end - start); }

  function readBounds() {
    const text = info.textContent || '';
    const match = text.match(/([^→]+)→([^·]+)/);
    if (!match) return false;
    start = parseTime(match[1]);
    end = parseTime(match[2]);
    return end > start;
  }

  function update() {
    if (!active) return;
    const length = clipLength();
    const absolute = Math.min(end, Math.max(start, video.currentTime || start));
    const relative = Math.min(length, Math.max(0, absolute - start));
    if (!scrubbing) range.value = length ? String(Math.round(relative / length * 1000)) : '0';
    now.textContent = fmt(relative);
    total.textContent = fmt(length);

    if (absolute >= end - 0.015 && !video.paused) {
      video.pause();
      try { video.currentTime = end; } catch {}
      range.value = '1000';
      now.textContent = fmt(length);
    }
  }

  function configure() {
    if (!sheet.classList.contains('open') || !readBounds()) return;
    active = true;
    video.controls = false;
    total.textContent = fmt(clipLength());
    now.textContent = '0:00.00';
    range.value = '0';
    const seekStart = () => {
      try { video.currentTime = start; } catch {}
      video.pause();
      update();
    };
    if (video.readyState >= 1) seekStart();
    else video.addEventListener('loadedmetadata', seekStart, { once: true });
  }

  function toggle() {
    if (!active) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    if ((video.currentTime || 0) >= end - 0.03 || (video.currentTime || 0) < start) {
      try { video.currentTime = start; } catch {}
    }
    video.play().catch(() => {});
  }

  play.addEventListener('click', toggle);
  tap.addEventListener('click', toggle);

  range.addEventListener('input', () => {
    if (!active) return;
    scrubbing = true;
    const relative = clipLength() * (Number(range.value) / 1000);
    try { video.currentTime = start + relative; } catch {}
    now.textContent = fmt(relative);
  });
  range.addEventListener('change', () => { scrubbing = false; update(); });
  range.addEventListener('pointerup', () => { scrubbing = false; update(); });
  range.addEventListener('touchend', () => { scrubbing = false; update(); }, { passive: true });

  video.addEventListener('timeupdate', update);
  video.addEventListener('play', () => {
    play.textContent = '❚❚';
    glyph.textContent = '❚❚';
    tap.classList.add('playing');
  });
  video.addEventListener('pause', () => {
    play.textContent = '▶';
    glyph.textContent = '▶';
    tap.classList.remove('playing');
  });
  video.addEventListener('seeking', update);

  const observer = new MutationObserver(() => {
    if (sheet.classList.contains('open')) requestAnimationFrame(configure);
    else {
      active = false;
      video.pause();
    }
  });
  observer.observe(sheet, { attributes: true, attributeFilter: ['class'] });
})();
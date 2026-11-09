/* Public visit counts only. Private dashboard credentials never belong here. */
(() => {
  'use strict';
  const cfg = window.BEAN_ANALYTICS || {};
  const today = document.getElementById('today-count');
  const grid = document.querySelector('.grid');
  const cards = Array.from(document.querySelectorAll('.card'));
  const projects = {
    '0': ['ppogum', '뽀금'], '6': ['doongdoong', '마이둥 on Desktop'],
    '5': ['opic-coach', 'OPIc Coach'], '4': ['nailo', 'NAILO'],
    '2': ['salady', '샐러디'], '3': ['face-balance', 'Face Balance']
  };
  let root;
  try {
    root = new URL(cfg.site);
    if (root.protocol !== 'https:' || !/^[a-z0-9-]+\.goatcounter\.com$/.test(root.hostname) || root.username || root.password || root.port) return;
  } catch { return; }
  const origin = root.origin;
  const liveURL = 'https://ubin-project-notes.ubin2914.chatgpt.site/api/live-today';
  let dayShown = null;
  let loadingToday = false;
  const dayKey = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date());
    const part = name => parts.find(p => p.type === name).value;
    return part('year')+'-'+part('month')+'-'+part('day');
  };
  function numericCount(value) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
    if (typeof value !== 'string' || !/^\d[\d, .\u00a0\u202f]*$/.test(value)) throw new Error('Invalid counter');
    return Number(value.replace(/\D/g, ''));
  }
  async function count(path, start) {
    const url = new URL(origin + '/counter/' + encodeURIComponent(path) + '.json');
    if (start) {
      url.searchParams.set('start', start);
      const nextDay = new Date(start + 'T00:00:00Z');
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      url.searchParams.set('end', nextDay.toISOString().slice(0, 10));
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { signal: controller.signal, credentials: 'omit' });
      if (response.status === 404) return 0; // No visits recorded for this path yet.
      if (!response.ok) throw new Error('Counter unavailable');
      return numericCount((await response.json()).count);
    } finally { clearTimeout(timer); }
  }
  async function refreshToday() {
    if (!today || loadingToday) return;
    loadingToday = true;
    const day = dayKey();
    if (day !== dayShown) today.textContent = '—';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
      let payload;
      try {
        const response = await fetch(liveURL, {cache:'no-store', credentials:'omit', signal:controller.signal});
        if (!response.ok) throw new Error('Live count unavailable');
        payload = await response.json();
      } finally {clearTimeout(timeout);}
      if (payload.date !== day || !Number.isSafeInteger(payload.today) || payload.today < 0) throw new Error('Invalid live count');
      const value = payload.today;
      if (day !== dayKey()) return;
      today.textContent = new Intl.NumberFormat('ko-KR').format(value);
      dayShown = day;
      today.title = '한국 시간 기준 오늘 조회 수 · 15초마다 갱신 · 집계 저장 후 반영';
    } catch {
      today.textContent = '—';
      today.title = '방문 수를 불러오지 못했습니다.';
    } finally { loadingToday = false; }
  }
  let userInteracted = false;
  document.addEventListener('pointerdown', () => { userInteracted = true; }, { once: true });
  document.addEventListener('keydown', () => { userInteracted = true; }, { once: true });
  // Load shared totals once; do not move a card under a visitor's pointer.
  Promise.all(cards.map(async (card, index) => {
    const project = projects[card.dataset.id];
    const clicks = project ? await count('project-' + project[0]) : 0;
    return { card, index, clicks };
  })).then(rows => {
    if (!grid || userInteracted) return;
    rows.sort((a, b) => b.clicks - a.clicks || a.index - b.index);
    rows.forEach(row => grid.appendChild(row.card));
  }).catch(() => { /* Preserve the original order on network errors. */ });
  // Match the same canonical path for both public Today and the private dashboard.
  window.goatcounter = { path: '/', no_session: true, allow_local: false, allow_frame: false };
  const tracker = document.createElement('script');
  tracker.async = true;
  tracker.src = 'https://gc.zgo.at/count.js';
  tracker.dataset.goatcounter = origin + '/count';
  tracker.addEventListener('load', () => setTimeout(refreshToday, 12000), {once:true});
  document.head.appendChild(tracker);
  cards.forEach(card => card.addEventListener('click', () => {
    const project = projects[card.dataset.id];
    if (project && typeof window.goatcounter?.count === 'function') {
      window.goatcounter.count({ path: 'project-' + project[0], title: project[1], event: true, no_session: true });
    }
  }));
  refreshToday();
  setInterval(() => { if (!document.hidden) refreshToday(); }, 15000);
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      if (typeof window.goatcounter?.count === 'function') window.goatcounter.count({path:'/', event:false, no_session:true});
      refreshToday();
      setTimeout(refreshToday, 12000);
    }
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshToday(); });
})();





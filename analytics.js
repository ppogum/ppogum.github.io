/* Public visit counts only. Private dashboard credentials never belong here. */
(() => {
  'use strict';
  const cfg = window.BEAN_ANALYTICS || {};
  const today = document.getElementById('today-count');
  const grid = document.querySelector('.grid');
  const cards = Array.from(document.querySelectorAll('.card'));
  const projects = {
    '0': ['ppogum', '뽀금'], '6': ['doongdoong', '둥둥이'],
    '5': ['opic-coach', 'OPIc Coach'], '4': ['nailo', 'NAILO'],
    '2': ['salady', '샐러디'], '3': ['face-balance', 'Face Balance']
  };
  let root;
  try {
    root = new URL(cfg.site);
    if (root.protocol !== 'https:' || !/^[a-z0-9-]+\.goatcounter\.com$/.test(root.hostname) || root.username || root.password || root.port) return;
  } catch { return; }
  const origin = root.origin;
  let dayShown = null;
  let loadingToday = false;
  const dayKey = () => new Intl.DateTimeFormat('en-CA', {
    timeZone: cfg.timezone || 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
  function numericCount(value) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
    if (typeof value !== 'string' || !/^\d[\d, .\u00a0\u202f]*$/.test(value)) throw new Error('Invalid counter');
    return Number(value.replace(/\D/g, ''));
  }
  async function count(path, start) {
    const url = new URL(origin + '/counter/' + encodeURIComponent(path) + '.json');
    if (start) url.searchParams.set('start', start);
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
      const value = await count('/', day); // Only site visits, never project-click events.
      if (day !== dayKey()) return;
      today.textContent = new Intl.NumberFormat('ko-KR').format(value);
      dayShown = day;
      today.title = '한국 시간 기준 오늘 방문 수 · 집계 반영에는 시간이 걸릴 수 있습니다.';
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
  document.head.appendChild(tracker);
  cards.forEach(card => card.addEventListener('click', () => {
    const project = projects[card.dataset.id];
    if (project && typeof window.goatcounter?.count === 'function') {
      window.goatcounter.count({ path: 'project-' + project[0], title: project[1], event: true, no_session: true });
    }
  }));
  refreshToday();
  setInterval(() => { if (!document.hidden) refreshToday(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshToday(); });
})();


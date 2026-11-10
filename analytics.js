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
  const downloadCount=document.getElementById('mydoong-download-count');
  const downloadEvents=[];
  let loadingDownloads=false;
  function flushDownloads(){
    if(typeof window.goatcounter?.count!=='function')return;
    while(downloadEvents.length){try{window.goatcounter.count(downloadEvents[0]);downloadEvents.shift()}catch{return}}
  }
  async function refreshDownloads(){
    if(!downloadCount||loadingDownloads)return;loadingDownloads=true;
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
    try{
      const response=await fetch('https://ubin-project-notes.ubin2914.chatgpt.site/api/mydoong-downloads',{cache:'no-store',credentials:'omit',signal:controller.signal});
      if(!response.ok)throw Error('counter unavailable');const data=await response.json();
      if(!Number.isSafeInteger(data.downloads)||data.downloads<0)throw Error('invalid counter');
      downloadCount.textContent=new Intl.NumberFormat('ko-KR').format(data.downloads);downloadCount.title='누적 다운로드 버튼 클릭 수 · 15초마다 확인';
    }catch{downloadCount.textContent='—';downloadCount.title='누적 횟수를 불러오지 못했어요. PDF는 다운로드할 수 있어요.'}finally{clearTimeout(timer);loadingDownloads=false}
  }
  document.addEventListener('click',event=>{
    const link=event.target instanceof Element?event.target.closest('[data-download="mydoong-guide"]'):null;
    if(!link)return;
    downloadEvents.push({path:'download-mydoong-guide',title:'마이둥 제작 가이드 PDF 다운로드',event:true,no_session:true});flushDownloads();
    setTimeout(refreshDownloads,12000);setTimeout(refreshDownloads,25000);
  });

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
  // Keep the project order chosen in the portfolio design.
  // Match the same canonical path for both public Today and the private dashboard.
  window.goatcounter = { path: '/', no_session: true, allow_local: false, allow_frame: false };
  const tracker = document.createElement('script');
  tracker.async = true;
  tracker.src = 'https://gc.zgo.at/count.js';
  tracker.dataset.goatcounter = origin + '/count';
  tracker.addEventListener('load', () => {flushDownloads();setTimeout(refreshToday,12000)}, {once:true});
  document.head.appendChild(tracker);
  cards.forEach(card => card.addEventListener('click', () => {
    const project = projects[card.dataset.id];
    if (project && typeof window.goatcounter?.count === 'function') {
      window.goatcounter.count({ path: 'project-' + project[0], title: project[1], event: true, no_session: true });
    }
  }));
  refreshToday();
  refreshDownloads();
  setInterval(()=>{if(!document.hidden)refreshDownloads()},15000);
  setInterval(() => { if (!document.hidden) refreshToday(); }, 15000);
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      if (typeof window.goatcounter?.count === 'function') window.goatcounter.count({path:'/', event:false, no_session:true});
      refreshToday();
      setTimeout(refreshToday, 12000);
    }
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) {refreshToday();refreshDownloads()} });
})();






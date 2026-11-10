'use strict';
const projects = {
  0: {title:'Ppogum 뽀금이', slug:'ppogum', count:7, alt:['수족관 메인','분홍빛 수족관','물고기 성장','밤의 수족관','수족관 메뉴','물고기 도감','수족관 꾸미기'], paragraphs:[
    '아이폰 운동 기록을 보며 시작된 질문,<br>“운동 기록이 게임으로 이어지면 더 걷게 될까?”에서 출발했어요.<br>걸음 수를 물고기 성장과 수족관 관리로 연결하는 게임을 기획하고 디자인하며 개발하고 있어요.']},
  6: {title:'마이둥 on Desktop', slug:'mydoong', count:2, alt:['마이둥 물고기 캐릭터','맥 데스크탑에서 움직이는 마이둥'], paragraphs:[
    'ChatGPT에서 펫을 만든 뒤,<br>채팅창 밖에서도 함께하면 좋겠다는 생각으로 시작했어요.<br>내 맥북 데스크탑 위를 떠다니는 펫을 직접 만들었어요.<br>누구나 자신만의 데스크탑 펫을 만들 수 있도록 제작 프롬프트를 정리했어요.']},
  5: {title:'OPIc Coach', slug:'opic', count:8, alt:['학습 홈','자기소개 답변 연습','답변 힌트와 녹음','실전 모의고사','어휘 검색','어휘 목록','필러 퀴즈','퀴즈 결과'], paragraphs:[
    '비용 없이 독학으로 오픽 IH를 받기 위해 직접 만든 실전 연습 앱입니다. 검색창에 입력한 내용을 바탕으로 AI가 최신 기출 정보와 오픽 유튜브 스크립트를 검색·정리하고, 연습 문제와 모의고사로 구성해 실전처럼 훈련할 수 있도록 만들었습니다. 직접 사용하며 준비해 실제 IH를 달성했습니다.']},
  3: {title:'Face Balance', slug:'face', count:6, alt:['AI 분석가 AURA 소개','얼굴 분석 기술 소개','분석 데이터 안내','카메라 권한 안내','얼굴 스캔','부위별 분석 결과'], paragraphs:[
    '내 얼굴의 비율을 확인하고 싶다는 호기심에서 시작했어요.<br>MediaPipe Face Mesh를 연동해 478개 랜드마크로 얼굴을 매핑해<br>얼굴을 따라 흐르는 스캔 효과부터 부위별 지표와 메쉬 표현까지 세밀하게 구현했어요.<br>얼굴 스캔 과정의 시각적 피드백과 안내, 결과를 이해하는 화면의 흐름을 고민해요.']},
  4: {title:'NAILO — 네일 예약 플랫폼', paragraphs:[
    '시술 옵션에 따라 예상 시간과 금액을 계산하고,<br>예약 가능한 시간을 보여주는 네일 예약 서비스입니다.<br>반복 문의 없이 직접 확인하고 예약하도록 설계하고,<br>당일 빈자리는 옵션을 간소화한 별도 흐름으로 구성했습니다.',
    '<strong>데스크 리서치·사용자 인터뷰</strong>부터 <strong>퍼소나·저니맵, 와이어프레임·화면 설계, UX/UI 디자인</strong>까지 전 과정을 진행했습니다.']},
  2: {title:'샐러디 앱 개선', paragraphs:[
    '복잡한 커스텀 옵션을 단계별로 정리하고,<br>선택한 재료와 금액을 한눈에 확인·수정하도록 주문 흐름을 개선했어요.<br>자주 먹는 조합을 ‘나만의 메뉴’로 저장해 재주문으로 연결하고,<br>홈의 주요 기능과 멤버십 혜택도 쉽게 찾도록 재구성했어요.',
    '아이콘과 디자인 시스템을 함께 정리하고 있어요.']}
};
const projectDialog=document.getElementById('project-dialog');
const contactDialog=document.getElementById('contact-dialog');
function gallery(project){
 const host=document.getElementById('project-gallery');host.replaceChildren();
 if(!project.count)return;
 const files={ppogum:'ppogum-gallery.png',face:'face-gallery.svg',mydoong:'mydoong-gallery.svg',opic:'opic-gallery.svg'};
 const frame=document.createElement('div');frame.className='gallery-frame';
 const track=document.createElement('div');track.className='gallery-track';track.tabIndex=0;track.setAttribute('role','region');track.setAttribute('aria-label',project.title+' 전체 이미지. 좌우로 스크롤');
 const img=document.createElement('img');img.src='assets/original/'+files[project.slug];img.alt=project.title+' 전체 화면 모음';img.draggable=false;img.height=305;img.width={ppogum:1285,face:1084,mydoong:747,opic:1482}[project.slug];track.append(img);
 const next=document.createElement('button');next.className='gallery-next';next.textContent='SWIPE →';next.setAttribute('aria-label','이미지를 오른쪽으로 스크롤');frame.append(track,next);host.append(frame);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const move=direction=>{const atEnd=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;track.scrollTo({left:direction===1&&atEnd?0:track.scrollLeft+direction*track.clientWidth*.75,behavior:reduced?'instant':'smooth'})};
 next.onclick=()=>move(1);track.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}};
 let drag=null;
 track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,left:track.scrollLeft};track.classList.add('dragging');track.setPointerCapture(e.pointerId)});
 track.addEventListener('pointermove',e=>{if(drag)track.scrollLeft=drag.left-(e.clientX-drag.x)});
 const end=()=>{drag=null;track.classList.remove('dragging')};
 track.addEventListener('pointerup',end);track.addEventListener('pointercancel',end);track.addEventListener('lostpointercapture',end);
}
document.querySelectorAll('.card').forEach(card=>card.addEventListener('click',()=>{
 const p=projects[card.dataset.id];document.getElementById('project-title').textContent=p.title;
 document.getElementById('project-description').innerHTML=p.paragraphs.map(text=>`<p>${text}</p>`).join('');
 document.getElementById('project-attachment').hidden=card.dataset.id!=='6';document.getElementById('project-attachment').open=false;gallery(p);projectDialog.showModal();projectDialog.scrollTop=0;
}));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});
 document.querySelectorAll('.card').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.type!==button.dataset.filter);
}));
for(const dialog of [projectDialog,contactDialog]){
 dialog.querySelector('.close').onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
}
document.querySelectorAll('a[href^="mailto:"]').forEach(link=>{if(!contactDialog.contains(link))link.addEventListener('click',e=>{e.preventDefault();document.getElementById('copy-status').textContent='';contactDialog.showModal()})});
document.getElementById('copy-email').onclick=async()=>{const email=document.getElementById('contact-email');const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText(email.value);status.textContent='이메일 주소를 복사했어요.'}catch{email.focus();email.select();status.textContent='이메일 주소를 선택해 복사해 주세요.'}};

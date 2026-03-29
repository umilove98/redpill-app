/**
 * 가상 공식 웹사이트 렌더러
 * siteId + pageId → 전체 화면 전환으로 공식 사이트 표시
 */
import { router } from '../core/router.js';

let sitesCache = null;

async function loadSites() {
  if (sitesCache) return sitesCache;
  sitesCache = await fetch('/data/websites.json').then(r => r.json());
  return sitesCache;
}

export async function renderFakeSite(container, siteId, pageId) {
  const sites = await loadSites();
  const site = sites[siteId];
  if (!site) return;

  const activePage = pageId || 'main';
  const pageData = site.pages[activePage];
  if (!pageData) return;

  container.innerHTML = `
    <div class="fakesite" style="--site-color: ${site.color}">
      <header class="fs-header">
        <div class="fs-header-inner">
          <a class="fs-logo" href="javascript:void(0)" data-page="main">${site.name}</a>
          <nav class="fs-nav" id="fs-nav">
            ${buildNav(site, siteId, activePage)}
          </nav>
          <span class="fs-domain">${site.domain}</span>
        </div>
      </header>
      <main class="fs-body" id="fs-body">
        ${renderPage(site, siteId, activePage)}
      </main>
      <footer class="fs-footer">
        <p>© 2026 ${site.name}. All rights reserved.</p>
        <p class="fs-footer-domain">${site.domain}</p>
      </footer>
      <button class="fs-back-game" id="fs-back-game">← 서치라이트로 돌아가기</button>
    </div>
  `;

  // 네비게이션 클릭
  container.addEventListener('click', (e) => {
    const navLink = e.target.closest('[data-page]');
    if (navLink) {
      e.preventDefault();
      router.navigate(`/site/${siteId}/${navLink.dataset.page}`);
    }
  });

  document.getElementById('fs-back-game').addEventListener('click', () => {
    router.navigate('/searchlight');
  });
}

function buildNav(site, siteId, activePage) {
  const pageMap = {
    hanbyeol: [
      { id: 'main', label: '홈' },
      { id: 'about', label: '학교 소개' },
      { id: 'departments', label: '학과 안내' },
      { id: 'clubs', label: '동아리' },
      { id: 'admission', label: '입학 안내' }
    ],
    eunha_arts: [
      { id: 'main', label: '홈' },
      { id: 'about', label: '학교 소개' },
      { id: 'departments', label: '학과 안내' },
      { id: 'library', label: '자료실' }
    ],
    dalbitheun: [
      { id: 'main', label: '홈' },
      { id: 'greeting', label: '인사말' },
      { id: 'menu', label: '메뉴' },
      { id: 'location', label: '오시는 길' },
      { id: 'recruit', label: '채용공고' }
    ]
  };

  return (pageMap[siteId] || []).map(p =>
    `<a class="fs-nav-link ${activePage === p.id ? 'active' : ''}" data-page="${p.id}" href="javascript:void(0)">${p.label}</a>`
  ).join('');
}

function renderPage(site, siteId, pageId) {
  const p = site.pages[pageId];
  if (!p) return '<p>페이지를 찾을 수 없습니다.</p>';

  switch (`${siteId}/${pageId}`) {
    // --- 한별공대 ---
    case 'hanbyeol/main': return renderUnivMain(p, site);
    case 'hanbyeol/about': return renderHanbyeolAbout(p);
    case 'hanbyeol/departments': return renderHanbyeolDepts(p);
    case 'hanbyeol/clubs': return renderHanbyeolClubs(p);
    case 'hanbyeol/admission': return renderHanbyeolAdmission(p);
    // --- 은하예대 ---
    case 'eunha_arts/main': return renderUnivMain(p, site);
    case 'eunha_arts/about': return renderEunhaAbout(p);
    case 'eunha_arts/departments': return renderEunhaDepts(p);
    case 'eunha_arts/library': return renderEunhaLibrary(p);
    // --- 달빛헌 ---
    case 'dalbitheun/main': return renderRestaurantMain(p, site);
    case 'dalbitheun/greeting': return renderDalbitGreeting(p);
    case 'dalbitheun/menu': return renderDalbitMenu(p);
    case 'dalbitheun/location': return renderDalbitLocation(p);
    case 'dalbitheun/recruit': return renderDalbitRecruit(p);
    default: return `<p>${p.title || '페이지'}</p>`;
  }
}

// === 공통: 대학 메인 ===
function renderUnivMain(p, site) {
  return `
    <div class="fs-hero" style="background: linear-gradient(135deg, ${site.color}, ${site.color}cc)">
      <h1 class="fs-hero-title">${p.hero}</h1>
      <p class="fs-hero-sub">${p.subtext}</p>
    </div>
    <div class="fs-section">
      <h2 class="fs-section-title">공지사항</h2>
      <ul class="fs-notice-list">
        ${p.notices.map(n => `
          <li class="fs-notice-item">
            <span class="fs-notice-title">${n.title}</span>
            <span class="fs-notice-date">${n.date}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

// === 한별공대 ===
function renderHanbyeolAbout(p) {
  return `
    <div class="fs-section">
      <h2 class="fs-section-title">총장 인사말</h2>
      <div class="fs-greeting">
        <div class="fs-greeting-meta">
          <strong>${p.greeting.name}</strong> ${p.greeting.position}
        </div>
        <p class="fs-greeting-text">${p.greeting.text}</p>
      </div>
    </div>
    <div class="fs-section">
      <h2 class="fs-section-title">연혁</h2>
      <div class="fs-timeline">
        ${p.history.map(h => `
          <div class="fs-timeline-item">
            <span class="fs-timeline-year">${h.year}</span>
            <span class="fs-timeline-event">${h.event}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="fs-section">
      <h2 class="fs-section-title">현황</h2>
      <div class="fs-stats-grid">
        ${Object.entries(p.stats).map(([k, v]) => `
          <div class="fs-stat-card">
            <span class="fs-stat-label">${{ students: '재학생', faculty: '교수진', campus: '캠퍼스' }[k] || k}</span>
            <span class="fs-stat-value">${v}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderDeptTabs(p) {
  const html = `
    <div class="fs-section">
      <h2 class="fs-section-title">학과 안내</h2>
      <div class="fs-item-tabs" id="fs-dept-tabs">
        ${p.list.map((d, i) => `<button class="fs-item-tab ${i === 0 ? 'active' : ''}" data-idx="${i}">${d.name}</button>`).join('')}
      </div>
      <div class="fs-item-content" id="fs-dept-content"></div>
    </div>
  `;

  setTimeout(() => {
    const tabs = document.getElementById('fs-dept-tabs');
    const content = document.getElementById('fs-dept-content');
    if (!tabs || !content) return;

    function showDept(idx) {
      tabs.querySelectorAll('.fs-item-tab').forEach(t => t.classList.remove('active'));
      tabs.querySelector(`[data-idx="${idx}"]`).classList.add('active');
      const dept = p.list[idx];
      content.innerHTML = renderDeptDetail(dept);
      bindScheduleTabs(dept);
    }

    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.fs-item-tab');
      if (tab) showDept(parseInt(tab.dataset.idx));
    });

    showDept(0);
  }, 0);

  return html;
}

function renderDeptDetail(dept) {
  if (!dept.detail) {
    return `
      <div class="fs-detail-body">
        <h3 class="fs-detail-name">${dept.name}</h3>
        <p>${dept.desc}</p>
        <p class="fs-contact-info">자세한 내용은 학과사무실로 문의하세요.<br><strong>☎ ${dept.phone}</strong></p>
      </div>
    `;
  }

  const scheduleKeys = dept.schedule ? Object.keys(dept.schedule) : [];

  let body = `
    <div class="fs-detail-body">
      <h3 class="fs-detail-name">${dept.name}</h3>
      <div class="fs-dept-meta">
        ${dept.head ? `<span>학과장: <strong>${dept.head}</strong></span>` : ''}
        ${dept.students ? `<span>재학생: <strong>${dept.students}</strong></span>` : ''}
        <span>☎ ${dept.phone}</span>
      </div>
      <p class="fs-dept-desc-full">${dept.desc}</p>
  `;

  if (dept.curriculum) {
    body += `<h4>교육과정</h4><div class="fs-curriculum">
      ${Object.entries(dept.curriculum).map(([year, semesters]) => `
        <div class="fs-cur-year"><h4>${year}</h4>
          ${Object.entries(semesters).map(([sem, subjects]) => `
            <div class="fs-cur-sem"><span class="fs-cur-sem-label">${sem}</span><span class="fs-cur-subjects">${subjects}</span></div>
          `).join('')}
        </div>
      `).join('')}
    </div>`;
  }


  if (dept.majors) {
    body += `<h4>전공 안내</h4><div class="fs-majors">
      ${dept.majors.map(m => `
        <div class="fs-major-card">
          <h4>${m.name}</h4>
          <ul class="fs-list">${m.subjects.map(s => `<li>${s}</li>`).join('')}</ul>
          ${m.facilities ? `<p class="fs-major-facility">${m.facilities}</p>` : ''}
        </div>
      `).join('')}
    </div>`;
  }

  if (dept.admission) body += `<p class="fs-admission-method">입시 전형: ${dept.admission}</p>`;

  if (scheduleKeys.length > 0) {
    body += `
      <h4>시간표 (2026학년도 1학기)</h4>
      <div class="fs-schedule-tabs" id="fs-sched-tabs">
        ${scheduleKeys.map((k, i) => `<button class="fs-sched-tab ${i === 0 ? 'active' : ''}" data-sched="${k}">${k}</button>`).join('')}
      </div>
      <div id="fs-sched-content">${renderScheduleTable(dept.schedule[scheduleKeys[0]])}</div>
    `;
  }

  body += '</div>';
  return body;
}

function bindScheduleTabs(dept) {
  const tabsEl = document.getElementById('fs-sched-tabs');
  const schedContent = document.getElementById('fs-sched-content');
  if (!tabsEl || !schedContent || !dept.schedule) return;

  tabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('.fs-sched-tab');
    if (!tab) return;
    tabsEl.querySelectorAll('.fs-sched-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    schedContent.innerHTML = renderScheduleTable(dept.schedule[tab.dataset.sched]);
  });
}

function renderScheduleTable(schedule) {
  return `
    <table class="fs-table">
      <thead><tr><th>요일</th><th>과목</th></tr></thead>
      <tbody>${schedule.map(s => `<tr><td>${s.day}요일</td><td>${s.subjects}</td></tr>`).join('')}</tbody>
    </table>
  `;
}

// 한별공대 학과 (공통 탭 렌더러 사용)
function renderHanbyeolDepts(p) {
  return renderDeptTabs(p);
}

function renderHanbyeolClubs(p) {
  const html = `
    <div class="fs-section">
      <h2 class="fs-section-title">동아리 안내</h2>
      <div class="fs-item-tabs" id="fs-club-tabs">
        ${p.list.map((c, i) => `<button class="fs-item-tab ${i === 0 ? 'active' : ''}" data-idx="${i}">${c.name}</button>`).join('')}
      </div>
      <div class="fs-item-content" id="fs-club-content"></div>
    </div>
  `;

  setTimeout(() => {
    const tabs = document.getElementById('fs-club-tabs');
    const content = document.getElementById('fs-club-content');
    if (!tabs || !content) return;

    function showClub(idx) {
      tabs.querySelectorAll('.fs-item-tab').forEach(t => t.classList.remove('active'));
      tabs.querySelector(`[data-idx="${idx}"]`).classList.add('active');
      const club = p.list[idx];
      content.innerHTML = `
        <div class="fs-detail-body">
          <h3 class="fs-detail-name">${club.name}</h3>
          <div class="fs-dept-meta">
            <span>회원: <strong>${club.members}</strong></span>
            ${club.founded ? `<span>설립: <strong>${club.founded}</strong></span>` : ''}
            ${club.advisor ? `<span>지도교수: <strong>${club.advisor}</strong></span>` : ''}
          </div>
          <p class="fs-dept-desc-full">${club.desc}</p>
          ${club.activities ? `<h4>주요 활동</h4><p>${club.activities}</p>` : ''}
          ${club.meetingPlace ? `<p><strong>활동 장소:</strong> ${club.meetingPlace}</p>` : ''}
          ${club.recruit ? `<p><strong>모집:</strong> ${club.recruit}</p>` : ''}
          ${club.email ? `<p><strong>문의:</strong> ${club.email}</p>` : ''}
        </div>
      `;
    }

    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.fs-item-tab');
      if (tab) showClub(parseInt(tab.dataset.idx));
    });

    showClub(0);
  }, 0);

  return html;
}

function renderHanbyeolAdmission(p) {
  return `
    <div class="fs-section">
      <h2 class="fs-section-title">모집 전형</h2>
      ${p.types.map(t => `
        <div class="fs-admission-type">
          <h3>${t.name}</h3>
          <div class="fs-info-card">
            <div class="fs-info-row"><span class="fs-info-label">접수 기간</span><span>${t.period}</span></div>
            <div class="fs-info-row"><span class="fs-info-label">전형 방법</span><span>${t.method}</span></div>
            <div class="fs-info-row"><span class="fs-info-label">반영 비율</span><span>${t.ratio}</span></div>
          </div>
          ${t.note ? `<p class="fs-admission-note">${t.note}</p>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="fs-section">
      <h2 class="fs-section-title">입시 일정 (2026학년도)</h2>
      <table class="fs-table">
        <thead><tr><th>일정</th><th>날짜</th></tr></thead>
        <tbody>${p.schedule.map(s => `<tr><td>${s.event}</td><td>${s.date}</td></tr>`).join('')}</tbody>
      </table>
    </div>

    <div class="fs-section">
      <h2 class="fs-section-title">자주 묻는 질문</h2>
      ${p.faq.map(f => `
        <div class="fs-faq-item">
          <p class="fs-faq-q">Q. ${f.q}</p>
          <p class="fs-faq-a">A. ${f.a}</p>
        </div>
      `).join('')}
    </div>

    <div class="fs-section">
      <h2 class="fs-section-title">입학 문의</h2>
      <div class="fs-info-card">
        <div class="fs-info-row"><span class="fs-info-label">전화</span><span>${p.contact.phone}</span></div>
        <div class="fs-info-row"><span class="fs-info-label">이메일</span><span>${p.contact.email}</span></div>
        <div class="fs-info-row"><span class="fs-info-label">방문</span><span>${p.contact.office}</span></div>
      </div>
    </div>
  `;
}

// === 은하예대 ===
function renderEunhaAbout(p) {
  return `
    <div class="fs-section">
      <h2 class="fs-section-title">총장 인사말</h2>
      <div class="fs-greeting">
        <div class="fs-greeting-meta"><strong>${p.greeting.name}</strong> ${p.greeting.position}</div>
        <p class="fs-greeting-text">${p.greeting.text}</p>
      </div>
    </div>
  `;
}

function renderEunhaDepts(p) {
  return renderDeptTabs(p);
}

function renderEunhaLibrary(p) {
  const html = `
    <div class="fs-section">
      <h2 class="fs-section-title">학과 자료실</h2>
      <p class="fs-section-sub">${p.desc}</p>
      <div class="fs-item-tabs" id="fs-lib-tabs">
        ${p.categories.map((cat, i) => `<button class="fs-item-tab ${i === 0 ? 'active' : ''}" data-idx="${i}">${cat.name}</button>`).join('')}
      </div>
      <div class="fs-item-content" id="fs-lib-content"></div>
    </div>
  `;

  setTimeout(() => {
    const tabs = document.getElementById('fs-lib-tabs');
    const content = document.getElementById('fs-lib-content');
    if (!tabs || !content) return;

    function showCategory(idx) {
      tabs.querySelectorAll('.fs-item-tab').forEach(t => t.classList.remove('active'));
      tabs.querySelector('[data-idx="' + idx + '"]').classList.add('active');
      const cat = p.categories[idx];
      content.innerHTML = '<div class="fs-detail-body"><div class="fs-file-list">' +
        cat.files.map(f =>
          '<div class="fs-file-item">' +
            '<div class="fs-file-icon">' + (f.type === 'PDF' ? '📄' : '📝') + '</div>' +
            '<div class="fs-file-info">' +
              '<span class="fs-file-title">' + f.title + '</span>' +
              '<span class="fs-file-meta">' + f.type + ' · ' + f.size + ' · ' + f.date + '</span>' +
            '</div>' +
            '<span class="fs-file-download">다운로드</span>' +
          '</div>'
        ).join('') +
      '</div></div>';
    }

    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.fs-item-tab');
      if (tab) showCategory(parseInt(tab.dataset.idx));
    });

    showCategory(0);
  }, 0);

  return html;
}

// === 달빛헌 ===
function renderRestaurantMain(p, site) {
  return `
    <div class="fs-hero fs-hero-restaurant" style="background: linear-gradient(135deg, ${site.color}, ${site.color}cc)">
      <h1 class="fs-hero-title fs-hero-korean">${p.hero}</h1>
      <p class="fs-hero-sub">${p.subtext}</p>
    </div>
  `;
}

function renderDalbitGreeting(p) {
  return `
    <div class="fs-section">
      <h2 class="fs-section-title">오너셰프 인사말</h2>
      <div class="fs-greeting">
        <div class="fs-greeting-meta"><strong>${p.name}</strong> ${p.position}</div>
        <p class="fs-greeting-text">${p.text}</p>
      </div>
    </div>
  `;
}

function renderDalbitMenu(p) {
  return `
    <div class="fs-section">
      <h2 class="fs-section-title">메뉴</h2>
      <p class="fs-menu-type">${p.type}</p>
      <div class="fs-menu-grid">
        ${p.courses.map(c => `
          <div class="fs-menu-card">
            <h3 class="fs-menu-name">${c.name}</h3>
            <p class="fs-menu-desc">${c.desc}</p>
            <span class="fs-menu-price">${c.price}</span>
          </div>
        `).join('')}
      </div>
      <p class="fs-note">${p.notice}</p>
    </div>
  `;
}

function renderDalbitLocation(p) {
  return `
    <div class="fs-section">
      <h2 class="fs-section-title">오시는 길</h2>
      <div class="fs-info-card">
        <div class="fs-info-row"><span class="fs-info-label">주소</span><span>${p.address}</span></div>
        <div class="fs-info-row"><span class="fs-info-label">찾아오기</span><span>${p.directions}</span></div>
        <div class="fs-info-row"><span class="fs-info-label">정기 휴무</span><span>${p.closedDay}</span></div>
        <div class="fs-info-row"><span class="fs-info-label">영업시간</span><span>${p.hours}</span></div>
        <div class="fs-info-row"><span class="fs-info-label">전화</span><span>${p.phone}</span></div>
      </div>
    </div>
    <div class="fs-section">
      <h2 class="fs-section-title">건물 안내</h2>
      <div class="fs-info-card">
        ${Object.entries(p.building).map(([k, v]) => `
          <div class="fs-info-row">
            <span class="fs-info-label">${{ floor1: '1층', floor2: '2층', backyard: '후원' }[k] || k}</span>
            <span>${v}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderDalbitRecruit(p) {
  return `
    <div class="fs-section">
      <h2 class="fs-section-title">요리사 모집공고</h2>
      <p class="fs-recruit-position">${p.position}</p>
      <div class="fs-section">
        <h3>자격 요건</h3>
        <ul class="fs-list fs-recruit-reqs">
          ${p.requirements.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
      <div class="fs-section">
        <h3>복리후생</h3>
        <p>${p.benefits}</p>
      </div>
      <div class="fs-section">
        <h3>지원 방법</h3>
        <p>${p.contact}</p>
      </div>
    </div>
  `;
}

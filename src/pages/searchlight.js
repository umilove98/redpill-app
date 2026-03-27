/**
 * 서치라이트 — 나무위키풍 검색엔진 + 위키 문서 뷰어
 * wiki.json 데이터를 검색하여 문서를 표시하고, 힌트 발견 시 증거 수집
 */
import { router } from '../core/router.js';
import { trySpend, collectEvidence } from '../core/game.js';
import { costs } from '../core/game.js';

let wikiData = null;
let searchHistory = [];

async function loadWiki() {
  if (wikiData) return wikiData;
  const res = await fetch('/data/wiki.json');
  wikiData = await res.json();
  return wikiData;
}

/** wiki.json을 검색 가능한 문서 목록으로 변환 */
function buildArticles(data) {
  const articles = [];

  // 도시 문서
  articles.push({
    id: 'city',
    title: data.city.name,
    category: '도시',
    keywords: [data.city.name, '은하시', '도시'],
    render: () => renderCityArticle(data)
  });

  // 지역 문서
  for (const d of data.districts) {
    articles.push({
      id: `district-${d.id}`,
      title: d.name,
      category: '지역',
      keywords: [d.name, d.type, d.keyPlace, ...(d.facilities || []), d.description],
      render: () => renderDistrictArticle(d)
    });
  }

  // 장소 문서
  for (const p of data.places) {
    const info = p.info;
    const allKeywords = [p.name, p.district, p.type, info.description];
    if (info.departments) allKeywords.push(...info.departments);
    if (info.clubs) allKeywords.push(...info.clubs);
    if (info.musicDepartments) allKeywords.push(...info.musicDepartments);
    if (info.owner) allKeywords.push(info.owner);
    if (info.signature) allKeywords.push(...info.signature);
    articles.push({
      id: `place-${p.id}`,
      title: p.name,
      category: p.type === 'university' ? '대학교' : '식당',
      keywords: allKeywords,
      render: () => renderPlaceArticle(p)
    });
  }

  return articles;
}

function search(articles, query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return articles.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.keywords.some(k => k && k.toLowerCase().includes(q))
  );
}

// --- 렌더러 ---

function renderCityArticle(data) {
  const districtList = data.districts.map(d =>
    `<tr>
      <td><a class="wiki-link" data-article="district-${d.id}">${d.name}</a></td>
      <td>${d.type}</td>
      <td>${d.description}</td>
    </tr>`
  ).join('');

  return `
    <div class="wiki-article">
      <div class="wiki-header">
        <span class="wiki-category">도시</span>
        <h1 class="wiki-title">${data.city.name}</h1>
      </div>
      <div class="wiki-infobox">
        <div class="wiki-infobox-title">${data.city.name}</div>
        <div class="wiki-infobox-row"><span class="wiki-infobox-label">유형</span><span>중규모 도시</span></div>
        <div class="wiki-infobox-row"><span class="wiki-infobox-label">구조</span><span>${data.city.structure}</span></div>
      </div>
      <div class="wiki-body">
        <h2 class="wiki-h2">1. 개요</h2>
        <p>${data.city.description}</p>
        <h2 class="wiki-h2">2. 행정구역</h2>
        <table class="wiki-table">
          <thead><tr><th>동</th><th>유형</th><th>설명</th></tr></thead>
          <tbody>${districtList}</tbody>
        </table>
        <h2 class="wiki-h2">3. 주요 시설</h2>
        <ul class="wiki-list">
          ${data.places.map(p =>
            `<li><a class="wiki-link" data-article="place-${p.id}">${p.name}</a> — ${p.info.description.slice(0, 40)}...</li>`
          ).join('')}
        </ul>
      </div>
    </div>
  `;
}

function renderDistrictArticle(d) {
  return `
    <div class="wiki-article">
      <div class="wiki-header">
        <span class="wiki-category">지역</span>
        <h1 class="wiki-title">${d.name}</h1>
      </div>
      <div class="wiki-infobox">
        <div class="wiki-infobox-title">${d.name}</div>
        <div class="wiki-infobox-row"><span class="wiki-infobox-label">유형</span><span>${d.type}</span></div>
        <div class="wiki-infobox-row"><span class="wiki-infobox-label">주요 시설</span><span>${d.keyPlace}</span></div>
      </div>
      <div class="wiki-body">
        <h2 class="wiki-h2">1. 개요</h2>
        <p>${d.description}</p>
        <h2 class="wiki-h2">2. 주요 시설</h2>
        <ul class="wiki-list">
          ${(d.facilities || []).map(f => `<li>${f}</li>`).join('')}
        </ul>
        ${d.hint ? `<div class="wiki-note"><strong>참고:</strong> ${d.hint}</div>` : ''}
      </div>
    </div>
  `;
}

function renderPlaceArticle(p) {
  const info = p.info;
  let body = `
    <h2 class="wiki-h2">1. 개요</h2>
    <p>${info.description}</p>
  `;

  if (p.type === 'university') {
    if (info.enrollment) {
      body += `<h2 class="wiki-h2">2. 규모</h2><p>${info.enrollment}</p>`;
    }
    if (info.departments) {
      body += `
        <h2 class="wiki-h2">3. 학과</h2>
        <ul class="wiki-list">${info.departments.map(d => `<li>${d}</li>`).join('')}</ul>
      `;
    }
    if (info.musicDepartments) {
      body += `
        <h2 class="wiki-h2">3. 음악 관련 학과</h2>
        <ul class="wiki-list">${info.musicDepartments.map(d => `<li>${d}</li>`).join('')}</ul>
      `;
    }
    if (info.clubs) {
      body += `
        <h2 class="wiki-h2">4. 동아리</h2>
        <ul class="wiki-list">${info.clubs.map(c => `<li>${c}</li>`).join('')}</ul>
        ${info.clubNote ? `<div class="wiki-note"><strong>비고:</strong> ${info.clubNote}</div>` : ''}
      `;
    }
    if (info.composition) {
      const cur = info.composition.curriculum;
      body += `
        <h2 class="wiki-h2">4. 작곡과 커리큘럼</h2>
        <p><strong>특화:</strong> ${info.composition.focus}</p>
        <table class="wiki-table">
          <thead><tr><th>학년</th><th>주요 과목</th></tr></thead>
          <tbody>
            ${Object.entries(cur).map(([y, subj]) =>
              `<tr><td>${y.replace('year', '')}학년</td><td>${subj}</td></tr>`
            ).join('')}
          </tbody>
        </table>
        <h3 class="wiki-h3">필수 소프트웨어</h3>
        <ul class="wiki-list">${info.composition.requiredSoftware.map(s => `<li>${s}</li>`).join('')}</ul>
        ${info.composition.note ? `<div class="wiki-note"><strong>참고:</strong> ${info.composition.note}</div>` : ''}
      `;
    }
    if (info.appliedMusic) {
      const vocal = info.appliedMusic.vocalMajor;
      body += `
        <h2 class="wiki-h2">5. 실용음악과 (보컬 전공)</h2>
        <ul class="wiki-list">${vocal.subjects.map(s => `<li>${s}</li>`).join('')}</ul>
        <p><strong>사용 소프트웨어:</strong> ${vocal.software.join(', ')}</p>
        <p>${vocal.facilities}</p>
      `;
    }
    if (info.schedule) {
      const sched = info.schedule;
      body += `<h2 class="wiki-h2">5. 학사 일정</h2>`;
      body += `<p><strong>학기:</strong> ${sched.semester}</p>`;
      body += `<p><strong>축제:</strong> ${sched.festival}</p>`;
      if (sched.physics3rd) {
        body += `
          <h3 class="wiki-h3">물리학과 3학년 시간표</h3>
          <table class="wiki-table">
            <thead><tr><th>요일</th><th>과목</th></tr></thead>
            <tbody>
              ${Object.entries(sched.physics3rd).map(([day, subj]) => {
                const dayKo = { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금' }[day] || day;
                return `<tr><td>${dayKo}요일</td><td>${subj}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        `;
      }
    }
    if (info.admission) {
      body += `<h2 class="wiki-h2">6. 입학</h2>`;
      if (typeof info.admission === 'object' && info.admission.method) {
        body += `
          <p><strong>경쟁률:</strong> ${info.admission.competitionRate}</p>
          <p><strong>방법:</strong> ${info.admission.method}</p>
          ${info.admission.note ? `<div class="wiki-note">${info.admission.note}</div>` : ''}
        `;
      } else {
        body += `<ul class="wiki-list">
          ${Object.entries(info.admission).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}
        </ul>`;
      }
    }
  }

  if (p.type === 'restaurant') {
    if (info.owner) body += `<h2 class="wiki-h2">2. 운영</h2><p><strong>오너셰프:</strong> ${info.owner}</p>`;
    if (info.closedDay) body += `<p><strong>휴무:</strong> ${info.closedDay}</p>`;
    if (info.location) body += `<p><strong>위치:</strong> ${info.location}</p>`;
    if (info.award) body += `<p><strong>수상:</strong> ${info.award}</p>`;
    if (info.structure) {
      body += `
        <h2 class="wiki-h2">3. 구조</h2>
        <ul class="wiki-list">
          ${Object.entries(info.structure).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}
        </ul>
      `;
    }
    if (info.signature) {
      body += `
        <h2 class="wiki-h2">4. 대표 메뉴</h2>
        <ul class="wiki-list">${info.signature.map(s => `<li>${s}</li>`).join('')}</ul>
      `;
    }
    if (info.relatedArticle) {
      body += `<div class="wiki-note"><strong>관련 기사:</strong> ${info.relatedArticle}</div>`;
    }
  }

  const infoboxRows = [];
  infoboxRows.push(`<div class="wiki-infobox-row"><span class="wiki-infobox-label">소재지</span><span><a class="wiki-link" data-article="district-${p.district.replace('동', '').toLowerCase()}">${p.district}</a></span></div>`);
  infoboxRows.push(`<div class="wiki-infobox-row"><span class="wiki-infobox-label">유형</span><span>${p.type === 'university' ? '대학교' : '식당'}</span></div>`);

  return `
    <div class="wiki-article">
      <div class="wiki-header">
        <span class="wiki-category">${p.type === 'university' ? '대학교' : '식당'}</span>
        <h1 class="wiki-title">${p.name}</h1>
      </div>
      <div class="wiki-infobox">
        <div class="wiki-infobox-title">${p.name}</div>
        ${infoboxRows.join('')}
      </div>
      <div class="wiki-body">${body}</div>
    </div>
  `;
}

// --- 메인 렌더 ---

export async function renderSearchlight(container) {
  const data = await loadWiki();
  const articles = buildArticles(data);

  container.innerHTML = `
    <div class="sl-fullscreen">
      <div class="sl-topbar">
        <button class="sl-back" id="sl-back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          돌아가기
        </button>
        <div class="sl-topbar-hud">
          <span class="sl-hud-badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.2"/><path d="M7 4v3l2 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            <strong id="sl-hud-ip"></strong>P
          </span>
        </div>
      </div>
      <div class="searchlight">
        <div class="sl-search-area">
          <div class="sl-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M16 16l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span>서치라이트</span>
          </div>
        <p class="sl-desc">은하시 종합 백과사전. 검색어를 입력하면 관련 문서를 찾아드립니다.</p>
        <div class="sl-search-box">
          <input type="text" class="sl-input" id="sl-input" placeholder="검색어 입력 (예: 한별공대, 달빛동, 작곡과...)" autocomplete="off" />
          <button class="sl-btn" id="sl-btn">검색 <span class="sl-cost">${costs.searchlight}P</span></button>
        </div>
        <div class="sl-suggestions" id="sl-suggestions"></div>
      </div>
      <div class="sl-result" id="sl-result">
        <div class="sl-welcome">
          <div class="sl-welcome-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="22" cy="22" r="14" stroke="currentColor" stroke-width="2.5"/><path d="M32 32l10 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          </div>
          <h3>무엇을 찾으시나요?</h3>
          <p>버튜버의 학교, 거주지, 경력 등을 확인할 수 있습니다.</p>
          <div class="sl-quick-links">
            <span class="sl-quick" data-q="은하시">은하시</span>
            <span class="sl-quick" data-q="한별공대">한별공대</span>
            <span class="sl-quick" data-q="은하예술대학">은하예대</span>
            <span class="sl-quick" data-q="달빛헌">달빛헌</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  // 뒤로가기
  document.getElementById('sl-back').addEventListener('click', () => router.back());

  // HUD 포인트 표시
  const { store } = await import('../core/store.js');
  const hudIp = document.getElementById('sl-hud-ip');
  if (hudIp) hudIp.textContent = store.state.investigationPoints;
  store.subscribe('investigationPoints', (val) => {
    if (hudIp) hudIp.textContent = val;
  });

  const input = document.getElementById('sl-input');
  const btn = document.getElementById('sl-btn');
  const resultArea = document.getElementById('sl-result');
  const suggestionsEl = document.getElementById('sl-suggestions');

  function doSearch(query) {
    if (!query.trim()) return;

    if (!trySpend(costs.searchlight)) return;

    searchHistory.push(query);
    const results = search(articles, query);

    if (results.length === 0) {
      resultArea.innerHTML = `
        <div class="sl-no-result">
          <p>"<strong>${escapeHtml(query)}</strong>"에 대한 문서를 찾을 수 없습니다.</p>
          <p class="sl-hint">다른 키워드로 검색해 보세요.</p>
        </div>
      `;
      return;
    }

    if (results.length === 1) {
      showArticle(results[0], resultArea);
    } else {
      resultArea.innerHTML = `
        <div class="sl-results-list">
          <p class="sl-results-count">"<strong>${escapeHtml(query)}</strong>" 검색 결과 ${results.length}건</p>
          ${results.map(r => `
            <div class="sl-result-item" data-article="${r.id}">
              <span class="sl-result-category">${r.category}</span>
              <span class="sl-result-title">${r.title}</span>
            </div>
          `).join('')}
        </div>
      `;
      resultArea.addEventListener('click', (e) => {
        const item = e.target.closest('.sl-result-item');
        if (!item) return;
        const article = articles.find(a => a.id === item.dataset.article);
        if (article) showArticle(article, resultArea);
      }, { once: true });
    }

    suggestionsEl.innerHTML = '';
  }

  function showArticle(article, target) {
    target.innerHTML = article.render();

    // 위키 내 링크 클릭 처리 (추가 포인트 없이 이동)
    target.addEventListener('click', (e) => {
      const link = e.target.closest('.wiki-link');
      if (!link) return;
      const linkedArticle = articles.find(a => a.id === link.dataset.article);
      if (linkedArticle) showArticle(linkedArticle, target);
    });

    // 힌트가 있는 note 요소에 증거 수집 표시
    const notes = target.querySelectorAll('.wiki-note');
    notes.forEach(note => {
      note.classList.add('wiki-hint-found');
    });
  }

  // 실시간 추천
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 1) {
      suggestionsEl.innerHTML = '';
      return;
    }
    const matches = articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.keywords.some(k => k && k.toLowerCase().includes(q))
    ).slice(0, 5);

    suggestionsEl.innerHTML = matches.map(m =>
      `<div class="sl-suggestion" data-q="${escapeHtml(m.title)}">${m.title} <span class="sl-suggestion-cat">${m.category}</span></div>`
    ).join('');
  });

  suggestionsEl.addEventListener('click', (e) => {
    const sug = e.target.closest('.sl-suggestion');
    if (!sug) return;
    input.value = sug.dataset.q;
    doSearch(sug.dataset.q);
  });

  btn.addEventListener('click', () => doSearch(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch(input.value);
  });

  // 빠른 검색 링크
  container.addEventListener('click', (e) => {
    const quick = e.target.closest('.sl-quick');
    if (!quick) return;
    input.value = quick.dataset.q;
    doSearch(quick.dataset.q);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

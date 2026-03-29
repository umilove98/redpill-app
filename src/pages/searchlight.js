/**
 * 서치라이트 — 나무위키풍 검색엔진 + 위키 문서 뷰어
 * wiki.json 데이터를 검색하여 문서를 표시하고, 힌트 발견 시 증거 수집
 */
import { router } from '../core/router.js';
import { store } from '../core/store.js';
import { trySpend, costs } from '../core/game.js';

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
      </div>
    </div>
  `;
}

function renderPlaceArticle(p) {
  const info = p.info;

  const INFOBOX = {
    hanbyeol: {
      category: '대학교',
      rows: [
        ['분류', '사립, 4년제 공과대학'],
        ['설립', '1978년'],
        ['총장', '제7대 김태성'],
        ['이사장', '한진우'],
        ['주소', '은하시 별내동 별내로 128'],
        ['재학생', '약 1,200명 (2025)'],
        ['교원', '약 180명'],
        ['웹사이트', '<a class="wiki-site-link" href="#/site/hanbyeol">공식 웹사이트</a>']
      ]
    },
    eunha_arts: {
      category: '대학교',
      rows: [
        ['분류', '사립, 4년제 예술종합대학'],
        ['설립', '1991년'],
        ['총장', '제5대 이수진'],
        ['이사장', '윤채원'],
        ['주소', '은하시 은하동 예술로 55'],
        ['재학생', '약 2,800명 (2025)'],
        ['웹사이트', '<a class="wiki-site-link" href="#/site/eunha_arts">공식 웹사이트</a>']
      ]
    },
    dalbitheun: {
      category: '식당',
      rows: [
        ['분류', '한식 파인다이닝'],
        ['개업', '2008년'],
        ['오너셰프', '박도현'],
        ['주소', '은하시 달빛동 달빛로 42길 7'],
        ['정기휴무', '매주 월요일'],
        ['수상', '은하시 미식 가이드 3년 연속 선정'],
        ['웹사이트', '<a class="wiki-site-link" href="#/site/dalbitheun">공식 웹사이트</a>']
      ]
    }
  };
  const box = INFOBOX[p.id];
  if (!box) return `<p>${info.description}</p>`;

  let body;
  if (p.id === 'hanbyeol') body = renderHanbyeolWiki(p, info);
  else if (p.id === 'eunha_arts') body = renderEunhaWiki(p, info);
  else if (p.id === 'dalbitheun') body = renderDalbitWiki(p, info);
  else body = `<h2 class="wiki-h2">1. 개요</h2><p>${info.description}</p>`;

  return `
    <div class="wiki-article">
      <div class="wiki-header">
        <span class="wiki-category">${box.category}</span>
        <h1 class="wiki-title">${p.name}</h1>
      </div>
      <div class="wiki-infobox">
        <div class="wiki-infobox-title">${p.name}</div>
        ${box.rows.map(([label, val]) =>
          `<div class="wiki-infobox-row"><span class="wiki-infobox-label">${label}</span><span>${val}</span></div>`
        ).join('')}
      </div>
      <div class="wiki-body">${body}</div>
    </div>
  `;
}

function renderHanbyeolWiki(p, info) {
  return `
    <h2 class="wiki-h2">1. 개요</h2>
    <p><strong>한별공과대학교</strong>(韓別工科大學校, Hanbyeol Institute of Technology)는 <a class="wiki-link" data-article="district-byeolnae">은하시 별내동</a>에 위치한 4년제 사립 공과대학이다. 1978년 설립되었으며, 세계 대학 랭킹 공학 부문 상위 20위권에 이름을 올리고 있다.</p>
    <p>학부 정원 약 300명/학년(전체 재학생 ~1,200명)이라는 소수정예 체제를 고수하고 있으며, '한 명의 한별인이 열 명의 인재를 대신한다'는 표어로 유명하다.</p>

    <h2 class="wiki-h2">2. 역사</h2>
    <p>1978년 전자공학과와 기계공학과 2개 학과로 출발했다. 이후 1985년 컴퓨터공학과, 1992년 물리학과·화학공학과를 신설하며 규모를 확대했으나, 학부 정원은 300명 선을 유지하고 있다. 2020년 세계 대학 랭킹 공학 부문 20위권에 진입하며 명실상부 국내 최고 수준의 공과대학으로 자리매김했다.</p>

    <h2 class="wiki-h2">3. 학과</h2>
    <p>전자공학과, 컴퓨터공학과, 기계공학과, 신소재공학과, 물리학과, 화학공학과, 수리과학과의 7개 학과가 개설되어 있다.</p>

    <h2 class="wiki-h2">4. 캠퍼스</h2>
    <p>별내동 별내로 128에 위치한다. 주변에 카페와 서점이 많은 조용한 대학가 분위기이며, 소규모 학교 특성상 캠퍼스가 아담한 편이다. 학생 식당은 본관 지하 1층에 있으며 메뉴가 4종류밖에 없다고 한다.</p>

    <h2 class="wiki-h2">5. 입시</h2>
    <p>수학+과학 필기시험과 심층면접으로 선발하며, 경쟁률은 약 15:1(2025학년도 기준)에 달한다. 입시 난이도가 매우 높아 재수·삼수생 비율도 적지 않은 것으로 알려져 있다.</p>

    <h2 class="wiki-h2">6. 학교 생활</h2>
    <p>매년 10월에 <strong>'별내제'</strong>라는 축제를 개최한다. 소규모 학교 특성상 학생 수가 적어 '다 아는 사이'라는 말이 있으며, 교수와 학생 간 거리가 가까운 편이다.</p>

    <h2 class="wiki-h2">7. 여담</h2>
    <ul class="wiki-list">
      <li>버튜버 <strong>하늘별 소라</strong>가 본교 물리학과에 재학 중인 것으로 알려져 있으며, 천문 동아리에서 활동한다고 한다. <span class="wiki-citation">[출처 필요]</span></li>
      <li>공학 부문 세계 랭킹이 높아 해외 교환학생 프로그램이 활발한 편이다.</li>
      <li>캠퍼스 뒤편에 별내공원이 있어 학생들이 쉬는 시간에 자주 찾는다.</li>
      <li>졸업 요건으로 졸업논문 제출이 필수이며, 관련 스트레스로 인해 '한별탈출'이라는 밈이 있다.</li>
    </ul>
  `;
}

function renderEunhaWiki(p, info) {
  return `
    <h2 class="wiki-h2">1. 개요</h2>
    <p><strong>은하예술대학</strong>(銀河藝術大學, Eunha University of Arts)은 <a class="wiki-link" data-article="district-eunha">은하시 은하동</a>에 위치한 4년제 사립 예술종합대학이다. 1991년 설립되었으며, 음악·미술·무용·연극 등 예술 전반을 아우른다.</p>

    <h2 class="wiki-h2">2. 학과</h2>
    <h3 class="wiki-h3">2.1. 음악 관련</h3>
    <ul class="wiki-list">
      <li><strong>작곡과</strong> — 클래식 작곡 중심. 입시 경쟁률이 높기로 유명하다.</li>
      <li><strong>실용음악과</strong> — 보컬, 기악, 프로듀싱 전공으로 세분화.</li>
      <li>국악과</li>
      <li>성악과</li>
    </ul>
    <h3 class="wiki-h3">2.2. 기타</h3>
    <p>미술학과, 무용학과, 연극영화학과 등이 있다.</p>

    <h2 class="wiki-h2">3. 캠퍼스</h2>
    <p>은하동 예술로 55에 위치한다. 주변에 갤러리, 공연장, 라이브 바가 밀집한 문화 예술 지구 한가운데에 있으며, 학교 앞 버스킹 존이 유명하다.</p>

    <h2 class="wiki-h2">4. 학교 생활</h2>
    <p>매년 가을에 <strong>'은하예술제'</strong>를 개최하며, 학생들의 버스킹 공연이 은하동 일대에서 열려 지역 명물로 자리잡았다. 실용음악과 녹음실은 예약제로 운영되며 학생들 사이에서 자리 경쟁이 치열하다고 한다.</p>

    <h2 class="wiki-h2">5. 여담</h2>
    <ul class="wiki-list">
      <li>버튜버 <strong>새벽달 리온</strong>이 작곡과에 재학 중인 것으로 알려져 있다. 방송에서 직접 만든 곡을 공개하며 음악 실력을 보여주고 있다. <span class="wiki-citation">[출처 필요]</span></li>
      <li>작곡과와 실용음악과는 같은 음악관 건물을 쓰지만 분위기가 완전히 다르다는 이야기가 있다. 작곡과 쪽 복도에서는 피아노 소리가, 실용음악과 쪽에서는 비트가 들린다고.</li>
      <li>은하동 카페에서 과제하는 예대생들을 쉽게 볼 수 있어, 은하동을 '예대 앞마당'이라고 부르기도 한다.</li>
    </ul>
  `;
}

function renderDalbitWiki(p, info) {
  return `
    <h2 class="wiki-h2">1. 개요</h2>
    <p><strong>달빛헌</strong>(達光軒)은 <a class="wiki-link" data-article="district-dalbit">은하시 달빛동</a>에 위치한 전통 한식 파인다이닝 레스토랑이다. 오너셰프 박도현이 2008년에 개업했으며, '은하시 미식 가이드' 3년 연속 선정된 은하시 대표 맛집 중 하나다.</p>

    <h2 class="wiki-h2">2. 특징</h2>
    <p>완전 예약제로 운영되는 전통 한식 파인다이닝 코스를 제공한다. 시그니처 메뉴는 8시간 저온 조리 갈비찜 코스. 오너셰프 박도현은 '한 치의 오차도 없는 요리'를 철학으로 내세우며 주방 내 레시피 변형을 일절 허용하지 않는 것으로 유명하다.</p>
    <p>건물 1층이 식당(주방+홀)이며 매주 월요일 정기 휴무.</p>

    <h2 class="wiki-h2">3. 위치</h2>
    <p>달빛동 달빛로 42길 7. 달빛동 큰길에서 골목 하나 들어가면 돌담장이 보이는 한옥 개조 건물이다. 달빛동 주민들 사이에서는 "돌담장 보이면 달빛헌"이라는 말이 통용될 정도로 랜드마크 역할을 하고 있다.</p>

    <h2 class="wiki-h2">4. 사건사고</h2>
    <ul class="wiki-list">
      <li>약 1년 전, '달빛헌 관계자 퇴사'라는 제목의 기사가 올라왔으나 구체적인 내용은 알려지지 않았다. 직원 퇴사인지, 가족 관련인지에 대해 여러 추측이 있었으나 달빛헌 측은 별도 입장을 밝히지 않았다.</li>
    </ul>

    <h2 class="wiki-h2">5. 여담</h2>
    <ul class="wiki-list">
      <li>버튜버 <strong>달콩 미루</strong>가 이 식당에서 일한 경험이 있다고 주장하고 있다. <span class="wiki-citation">[출처 필요]</span></li>
      <li>주방 직원 이직률이 높다는 소문이 있다. 오너셰프의 엄격한 운영 방침 때문이라는 이야기가 있지만 확인된 바는 없다.</li>
      <li>후원에 전통 장독대가 있어 간장·된장을 직접 담가 사용한다고 한다.</li>
      <li>달빛동 전통시장에서 도보 5분 거리에 위치해 있어, 시장 구경 후 방문하는 코스가 관광객들 사이에서 인기다.</li>
    </ul>
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
            <strong id="sl-hud-ip"></strong> 토큰
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
          <button class="sl-btn" id="sl-btn">검색 <span class="sl-cost">${costs.searchlight} 토큰</span></button>
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
      });
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

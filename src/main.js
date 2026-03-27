import { router } from './core/router.js';
import { store } from './core/store.js';
import { initTheme, bindThemeToggle } from './core/theme.js';
import { shell } from './components/shell.js';
import { renderChannelContent } from './pages/channel.js';
import { renderSnsPage } from './pages/snsPage.js';
import { renderSearchlight } from './pages/searchlight.js';
import { thumbGradient } from './utils/gradients.js';
import './styles/global.css';
import './styles/channel.css';
import './styles/sns.css';
import './styles/searchlight.css';

const app = document.getElementById('app');

// --- 페이지 렌더러 ---

function renderHome() {
  store.state.phase = 'home';

  app.innerHTML = shell(`
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">이 방송 어때요?</h2>
        <a class="section-more" href="#/home">전체보기</a>
      </div>
      <div class="stream-grid" id="character-grid">
        <p class="loading">로딩 중...</p>
      </div>
    </section>
  `, { activeNav: 'home' });

  bindThemeToggle();
  loadCharacters();
}

async function loadCharacters() {
  const res = await fetch('/data/characters.json');
  const characters = await res.json();
  const grid = document.getElementById('character-grid');

  grid.innerHTML = characters.map(c => {
    const isComplete = store.state.completedCharacters.includes(c.id);
    return `
    <article class="stream-card" data-id="${c.id}">
      <div class="thumb">
        <div class="thumb-img" style="background: linear-gradient(135deg, ${thumbGradient(c.id)})">
          <img class="thumb-avatar" src="/assets/characters/${c.id}/avatar.png" alt="${c.name}" />
        </div>
        <span class="badge-live">LIVE</span>
        <span class="badge-viewers">${c.profile.concurrent.toLocaleString()}명</span>
        ${isComplete ? '<span class="badge-complete">판정 완료</span>' : ''}
      </div>
      <div class="stream-info">
        <img class="stream-avatar-img" src="/assets/characters/${c.id}/avatar.png" alt="${c.name}" />
        <div class="stream-text">
          <p class="stream-title">${c.profile.concept}</p>
          <p class="stream-name">${c.name} <span class="stream-handle">${c.handle}</span></p>
          <div class="stream-tags">
            ${(c.profile.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    </article>
  `}).join('');

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.stream-card');
    if (card) router.navigate('/character/' + card.dataset.id);
  });
}

function renderCharacter({ params, query }) {
  store.state.phase = 'investigating';
  store.state.activeCharacterId = params.id;

  app.innerHTML = shell(`
    <div class="channel-header">
      <button class="btn-back" id="btn-back">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        홈
      </button>
      <button class="btn-verdict-sm" id="btn-verdict">판정하기</button>
    </div>
    <div id="channel-body" class="channel-body"></div>
  `, { activeNav: '' });

  bindThemeToggle();
  document.getElementById('btn-back').addEventListener('click', () => router.navigate('/home'));
  document.getElementById('btn-verdict').addEventListener('click', () => router.navigate('/verdict/' + params.id));
  renderChannelContent(params.id, { initialTab: query.tab });
}

function renderVerdict({ params }) {
  store.state.phase = 'verdict';
  app.innerHTML = shell(`
    <div class="channel-header">
      <button class="btn-back" id="btn-back">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        돌아가기
      </button>
    </div>
    <div class="verdict-page">
      <h2>판정: ${params.id}</h2>
      <p>판정 화면 (구현 예정)</p>
    </div>
  `, { activeNav: '' });

  bindThemeToggle();
  document.getElementById('btn-back').addEventListener('click', () => router.navigate('/character/' + params.id));
}

function renderSearchlightPage() {
  store.state.phase = 'searchlight';
  app.innerHTML = '<div id="searchlight-fullscreen"></div>';
  renderSearchlight(document.getElementById('searchlight-fullscreen'));
}

function renderNotFound({ path }) {
  app.innerHTML = shell(`
    <div class="not-found">
      <h1>404</h1>
      <p>${path} 페이지를 찾을 수 없습니다.</p>
      <a href="#/home">홈으로</a>
    </div>
  `);
}

// --- 초기화 ---
initTheme();

store.subscribe('investigationPoints', (val) => {
  const el = document.getElementById('hud-ip');
  if (!el) return;
  el.textContent = val;
  const badge = el.closest('.hud-badge');
  if (!badge) return;
  badge.classList.toggle('hud-low', val > 0 && val <= 3);
  badge.classList.toggle('hud-depleted', val === 0);
});

store.subscribe('trustGauge', (val) => {
  const el = document.getElementById('hud-trust');
  if (el) el.textContent = val;
  if (val <= 0) router.navigate('/ending/bad');
});

store.subscribe('phase', (val) => {
  if (val === 'roundComplete') {
    if (store.isGameOver()) {
      router.navigate('/ending/bad');
    } else {
      router.navigate('/ending/fake');
    }
  }
});

function renderEnding({ params }) {
  store.state.phase = 'ending';
  const isBad = params.type === 'bad';
  app.innerHTML = shell(`
    <div class="ending-page">
      <h2>${isBad ? '게임 오버' : '축하합니다!'}</h2>
      <p>${isBad ? '신뢰도가 바닥났습니다... 더 이상 방송국에서 일할 수 없습니다.' : 'R1 튜토리얼을 클리어했습니다! (페이크엔딩은 P6에서 구현 예정)'}</p>
      <button class="btn-verdict" id="btn-restart">다시 시작</button>
    </div>
  `);
  bindThemeToggle();
  document.getElementById('btn-restart').addEventListener('click', () => {
    store.reset();
    router.navigate('/home');
  });
}

router
  .on('/home', renderHome)
  .on('/character/:id', renderCharacter)
  .on('/character/:id/sns/:platform', ({ params }) => {
    app.innerHTML = '<div id="sns-fullscreen"></div>';
    renderSnsPage(document.getElementById('sns-fullscreen'), params.id, params.platform);
  })
  .on('/searchlight', renderSearchlightPage)
  .on('/verdict/:id', renderVerdict)
  .on('/ending/:type', renderEnding)
  .notFound(renderNotFound)
  .start();

if (!location.hash || location.hash === '#' || location.hash === '#/') {
  router.navigate('/home');
}

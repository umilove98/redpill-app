import { store } from '../core/store.js';

export function shell(mainContent, { activeNav = 'home' } = {}) {
  return `
    <header class="gnb">
      <div class="gnb-left">
        <button class="gnb-hamburger" aria-label="메뉴">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </button>
        <a class="gnb-logo glitch" data-text="빨간약 방송국" href="#/home">빨간약 방송국</a>
      </div>
      <nav class="gnb-nav">
        <a class="gnb-link ${activeNav === 'home' ? 'active' : ''}" href="#/home">라이브</a>
        <a class="gnb-link" href="#/home">인기</a>
        <a class="gnb-link" href="#/home">카테고리</a>
      </nav>
      <div class="gnb-right">
        <div class="gnb-search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input type="text" placeholder="채널, 라이브, 동영상 검색" class="gnb-search-input" />
        </div>
        <button class="theme-toggle" id="theme-toggle" title="테마 전환">
          <svg class="icon-moon" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.4 10.4A6 6 0 015.6 2.6 6 6 0 1013.4 10.4z" stroke="currentColor" stroke-width="1.3"/></svg>
          <svg class="icon-sun" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.3"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
        </button>
        <div class="gnb-hud">
          <span class="hud-badge hud-ip" title="조사 포인트">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.2"/><path d="M7 4v3l2 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            <strong id="hud-ip">${store.state.investigationPoints}</strong>
          </span>
          <span class="hud-badge hud-trust" title="신뢰도">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2l1.5 3 3.5.5-2.5 2.4.6 3.6L7 10l-3.1 1.5.6-3.6L2 5.5 5.5 5z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>
            <strong id="hud-trust">${store.state.trustGauge}</strong>
          </span>
        </div>
      </div>
    </header>

    <div class="layout">
      <aside class="sidebar">
        <a class="sb-item ${activeNav === 'home' ? 'active' : ''}" href="#/home">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M6 16h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span>전체 채널</span>
        </a>
        <a class="sb-item" href="#/home">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="8,4 16,10 8,16" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/></svg>
          <span>인기 클립</span>
        </a>
        <a class="sb-item" href="#/home">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/></svg>
          <span>카테고리</span>
        </a>
        <a class="sb-item" href="#/home">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.4"/><path d="M10 6v4l2.5 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span>편성표</span>
        </a>
        <a class="sb-item" href="#/home">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3l2 4 4.5.7-3.2 3.2.8 4.5L10 13.2 5.9 15.4l.8-4.5L3.5 7.7 8 7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none"/></svg>
          <span>팔로잉</span>
        </a>
        <div class="sb-divider"></div>
        <div class="sb-section-label">도구</div>
        <a class="sb-item" href="#/home">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.4"/><path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.2 4.2l2.1 2.1M13.7 13.7l2.1 2.1M4.2 15.8l2.1-2.1M13.7 6.3l2.1-2.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          <span>서치라이트</span>
        </a>
        <a class="sb-item" href="#/home">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4h12v12H4z" stroke="currentColor" stroke-width="1.3"/><path d="M4 8h12M8 8v8" stroke="currentColor" stroke-width="1.2"/></svg>
          <span>판정표</span>
        </a>
      </aside>
      <main class="content">
        ${mainContent}
      </main>
    </div>
  `;
}

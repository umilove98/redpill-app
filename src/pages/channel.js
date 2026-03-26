/**
 * 채널 페이지 오케스트레이터
 * 배너 렌더 + 탭 전환만 담당, 각 탭은 개별 모듈
 */
import { renderClipsTab } from './channel/clips.js';
import { renderCommunityTab } from './channel/community.js';
import { renderMetadataTab } from './channel/metadata.js';
import { renderSnsTab } from './channel/sns.js';
import { bannerGradient } from '../utils/gradients.js';

let currentChar = null;
let activeTab = 'clips';

const TABS = {
  clips: renderClipsTab,
  community: renderCommunityTab,
  metadata: renderMetadataTab,
  sns: renderSnsTab
};

export async function renderChannelContent(charId, { initialTab } = {}) {
  const res = await fetch('/data/characters.json');
  const characters = await res.json();
  currentChar = characters.find(c => c.id === charId);
  if (!currentChar) return;

  activeTab = (initialTab && TABS[initialTab]) ? initialTab : 'clips';
  const container = document.getElementById('channel-body');
  if (!container) return;

  container.innerHTML = `
    <div class="ch-banner" style="background: linear-gradient(135deg, ${bannerGradient(charId)})">
      <div class="ch-profile">
        <div class="ch-avatar">${currentChar.name[0]}</div>
        <div class="ch-info">
          <h2 class="ch-name">${currentChar.name}</h2>
          <p class="ch-handle">${currentChar.handle}</p>
          <p class="ch-bio">${currentChar.profile.bio}</p>
          <div class="ch-stats">
            <span>구독자 ${currentChar.profile.subscribers}</span>
            <span>클립 ${currentChar.profile.clipCount}개</span>
            <span>동시 ${currentChar.profile.concurrent.toLocaleString()}명</span>
          </div>
        </div>
      </div>
    </div>

    <nav class="tab-bar" id="channel-tabs">
      <button class="tab ${activeTab === 'clips' ? 'active' : ''}" data-tab="clips">클립</button>
      <button class="tab ${activeTab === 'community' ? 'active' : ''}" data-tab="community">커뮤니티</button>
      <button class="tab ${activeTab === 'metadata' ? 'active' : ''}" data-tab="metadata">정보</button>
      <button class="tab ${activeTab === 'sns' ? 'active' : ''}" data-tab="sns">SNS</button>
    </nav>

    <div id="tab-content" class="tab-content"></div>
  `;

  document.getElementById('channel-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    const tab = btn.dataset.tab;
    if (tab === activeTab) return;

    activeTab = tab;
    document.querySelectorAll('#channel-tabs .tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderActiveTab();
  });

  renderActiveTab();
}

function renderActiveTab() {
  const el = document.getElementById('tab-content');
  if (!el || !currentChar) return;
  const renderFn = TABS[activeTab];
  if (renderFn) renderFn(el, currentChar);
}

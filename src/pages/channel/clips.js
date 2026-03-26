/**
 * 클립 탭 — 썸네일 그리드 + 클릭 시 뷰어(영상 + 채팅창)
 * 채팅에서 힌트를 직접 찾아 클릭해야 증거 수집
 */
import { costs, getProgress, updateProgress, trySpend, collectEvidence } from '../../core/game.js';

let clipsCache = null;

async function loadClips() {
  if (clipsCache) return clipsCache;
  const res = await fetch('/data/clips.json');
  clipsCache = await res.json();
  return clipsCache;
}

export async function renderClipsTab(el, char) {
  const allClips = await loadClips();
  const clips = allClips[char.id] || [];
  const progress = getProgress(char.id);

  el.innerHTML = `
    <div class="clips-section">
      <h3 class="tab-section-title">클립</h3>
      <p class="tab-section-desc">클립 시청 시 <strong>${costs.clipView}p</strong> 소모. 수상한 채팅은 클릭해서 메모할 수 있습니다.</p>
      <div class="clip-grid" id="clip-grid">
        ${clips.map((clip, i) => `
          <div class="clip-thumb-card ${progress.clipsWatched.includes(i) ? 'watched' : ''}" data-idx="${i}">
            <div class="clip-thumb" style="background: linear-gradient(135deg, ${clip.gradient})">
              <span class="clip-thumb-icon">▶</span>
              <span class="clip-duration">${clip.duration}</span>
              ${progress.clipsWatched.includes(i) ? '<span class="clip-watched-badge">시청함</span>' : ''}
            </div>
            <div class="clip-thumb-info">
              <p class="clip-thumb-title">${clip.title}</p>
              <span class="clip-thumb-views">조회수 ${clip.views}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('clip-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.clip-thumb-card');
    if (!card) return;
    const idx = parseInt(card.dataset.idx);
    const alreadyWatched = progress.clipsWatched.includes(idx);

    // 첫 시청만 포인트 소모
    if (!alreadyWatched) {
      if (!trySpend(costs.clipView)) return;
      progress.clipsWatched.push(idx);
      updateProgress(char.id, progress);
    }

    openClipViewer(el, char, clips[idx], idx);
  });
}

function openClipViewer(el, char, clip, clipIdx) {
  const progress = getProgress(char.id);
  const hintKey = `clip_${clipIdx}`;
  if (!progress._chatHintsFound) progress._chatHintsFound = {};
  if (!progress._chatHintsFound[hintKey]) progress._chatHintsFound[hintKey] = [];
  const found = progress._chatHintsFound[hintKey];

  el.innerHTML = `
    <div class="clip-viewer">
      <div class="clip-viewer-main">
        <div class="clip-video" style="background: linear-gradient(135deg, ${clip.gradient})">
          <div class="clip-video-overlay">
            <span class="clip-video-title">${clip.title}</span>
            <span class="clip-video-live">LIVE</span>
          </div>
          <img class="clip-video-avatar-img" src="/assets/characters/${char.id}/avatar.png" alt="${char.name}" />
        </div>
        <div class="clip-video-bar">
          <span class="clip-bar-name">${char.name}</span>
          <span class="clip-bar-meta">${clip.views} · ${clip.duration}</span>
          <button class="btn-clip-back" id="btn-clip-back">← 목록</button>
        </div>
      </div>
      <div class="clip-chat">
        <div class="clip-chat-header">
          <span>채팅</span>
          <span class="clip-chat-count">${clip.chatLog.length}</span>
        </div>
        <div class="clip-chat-log" id="clip-chat-log">
          ${clip.chatLog.map((msg, i) => {
            const isFound = found.includes(i);
            const badgeHtml = msg.badge === 'subscriber' ? '<span class="chat-sub-badge">구독</span>'
              : msg.badge === 'streamer' ? '<span class="chat-streamer-badge">방장</span>' : '';
            return `
              <div class="chat-msg ${isFound ? 'chat-msg-noted' : ''}" data-idx="${i}">
                ${badgeHtml}<span class="chat-user ${msg.badge === 'streamer' ? 'chat-user-streamer' : ''}">${msg.user}</span>
                <span class="chat-text">${msg.text}</span>
                ${isFound ? '<span class="chat-noted-mark">📌</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
        <div class="clip-chat-input">
          <span class="clip-chat-input-text">채팅에서 수상한 메시지를 클릭하세요</span>
        </div>
      </div>
    </div>
  `;

  // 채팅 클릭 — 힌트 발견
  document.getElementById('clip-chat-log').addEventListener('click', (e) => {
    const msgEl = e.target.closest('.chat-msg');
    if (!msgEl) return;
    const idx = parseInt(msgEl.dataset.idx);
    const msg = clip.chatLog[idx];

    if (found.includes(idx)) return; // 이미 발견

    // 모든 채팅을 메모할 수 있음 — 힌트든 아니든
    found.push(idx);
    updateProgress(char.id, progress);

    // 힌트인 경우 조용히 증거 수집 (플레이어는 모름)
    if (msg.isHint) {
      collectEvidence(char.id, 'clip_chat', msg.hintNote, 'medium');
    }

    // 메모됨 표시
    msgEl.classList.add('chat-msg-noted');
    const pin = document.createElement('span');
    pin.className = 'chat-noted-mark';
    pin.textContent = '📌';
    msgEl.appendChild(pin);
  });

  document.getElementById('btn-clip-back').addEventListener('click', () => {
    renderClipsTab(el, char);
  });
}

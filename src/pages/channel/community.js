import { costs, getProgress, collectEvidence } from '../../core/game.js';
import { revealCardList } from '../../components/revealCard.js';

// 게시판 느낌 랜덤 데이터
const NICKNAMES = ['별빛수호자', '진실탐정', '팩트폭격기', '소문난헌터', '눈팅러', '정보통', '떡밥수집가', '궁금해요', '지나가던시청자', '익명의제보자'];
const TIMES = ['3시간 전', '5시간 전', '12시간 전', '1일 전', '2일 전', '3일 전'];

function pseudoRandom(charId, idx) {
  let hash = 0;
  for (const ch of charId + idx) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

export function renderCommunityTab(el, char) {
  const items = char.hints.community;
  const progress = getProgress(char.id);

  el.innerHTML = `
    <div class="community-section">
      <h3 class="tab-section-title">커뮤니티 게시판</h3>
      <p class="tab-section-desc">게시글을 열면 <strong>${costs.communityReveal}p</strong>가 소모됩니다.</p>
      <div id="community-cards"></div>
    </div>
  `;

  const container = document.getElementById('community-cards');
  revealCardList(container, {
    containerId: 'community-list',
    items,
    revealedIds: progress.communityRevealed,
    cost: costs.communityReveal,
    renderHidden: (_item, i) => {
      const r = pseudoRandom(char.id, i);
      const nick = NICKNAMES[r % NICKNAMES.length];
      const time = TIMES[r % TIMES.length];
      return `
        <div class="post-header">
          <span class="post-author">${nick}</span>
          <span class="post-time">${time}</span>
        </div>
        <p class="post-preview">숨겨진 댓글입니다</p>
      `;
    },
    renderRevealed: (item, i) => {
      const r = pseudoRandom(char.id, i);
      const nick = NICKNAMES[r % NICKNAMES.length];
      const time = TIMES[r % TIMES.length];
      const likes = 3 + (r % 42);
      const replies = r % 8;
      return `
        <div class="post-header">
          <span class="post-author">${nick}</span>
          <span class="post-time">${time}</span>
        </div>
        <p class="post-body">${item.content}</p>
        <div class="post-footer">
          <span class="post-reactions">
            <span class="post-like">👍 ${likes}</span>
            <span class="post-reply">💬 ${replies}</span>
          </span>
        </div>
      `;
    },
    onReveal: (_idx, item) => {
      if (item.type === 'real' && item.reliability === 'high') {
        collectEvidence(char.id, 'community', item.content, 'strong');
      }
    },
    rerender: () => renderCommunityTab(el, char)
  });
}

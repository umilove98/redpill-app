/**
 * RevealCard — 클릭으로 숨김→공개되는 카드 리스트 컴포넌트
 *
 * 커뮤니티 제보, SNS 크로스체크 등 동일 패턴 재사용
 *
 * @param {Object} opts
 * @param {string} opts.containerId   — 이벤트 위임 대상 ID
 * @param {Array}  opts.items         — 데이터 배열
 * @param {Array}  opts.revealedIds   — 이미 공개된 인덱스 배열
 * @param {number} opts.cost          — 공개당 포인트 비용
 * @param {Function} opts.renderHidden(item, i) — 숨김 상태 HTML
 * @param {Function} opts.renderRevealed(item, i) — 공개 상태 HTML
 * @param {Function} opts.onReveal(idx, item)  — 공개 시 콜백 (증거 수집 등)
 * @param {Function} opts.rerender    — 전체 리렌더 함수
 */
import { trySpend } from '../core/game.js';

export function revealCardList(el, opts) {
  const { containerId, items, revealedIds, cost, renderHidden, renderRevealed, onReveal, rerender } = opts;

  el.innerHTML = `<div class="reveal-list" id="${containerId}">
    ${items.map((item, i) => {
      const revealed = revealedIds.includes(i);
      return `
        <div class="reveal-card ${revealed ? 'revealed' : ''}" data-idx="${i}">
          ${revealed ? renderRevealed(item, i) : renderHidden(item, i)}
        </div>
      `;
    }).join('')}
  </div>`;

  document.getElementById(containerId).addEventListener('click', (e) => {
    const card = e.target.closest('.reveal-card:not(.revealed)');
    if (!card) return;
    const idx = parseInt(card.dataset.idx);
    if (!trySpend(cost)) return;

    revealedIds.push(idx);
    if (onReveal) onReveal(idx, items[idx]);
    rerender();
  });
}

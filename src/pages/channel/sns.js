/**
 * SNS 탭 — X / Instagram 링크만 표시, 클릭 시 별도 페이지로 이동
 */
import { router } from '../../core/router.js';

export async function renderSnsTab(el, char) {
  const res = await fetch('/data/sns.json');
  const allSns = await res.json();
  const sns = allSns[char.id];
  if (!sns) { el.innerHTML = '<p class="placeholder">SNS 데이터 없음</p>'; return; }

  el.innerHTML = `
    <div class="sns-links" id="sns-links">
      <a class="sns-link-card sns-x" data-platform="x" href="javascript:void(0)">
        <div class="sns-link-icon">𝕏</div>
        <div class="sns-link-info">
          <span class="sns-link-name">${sns.x.displayName}</span>
          <span class="sns-link-handle">${sns.x.handle}</span>
        </div>
        <span class="sns-link-arrow">→</span>
      </a>
      <a class="sns-link-card sns-ig" data-platform="insta" href="javascript:void(0)">
        <div class="sns-link-icon">📷</div>
        <div class="sns-link-info">
          <span class="sns-link-name">${sns.insta.displayName}</span>
          <span class="sns-link-handle">@${sns.insta.handle}</span>
        </div>
        <span class="sns-link-arrow">→</span>
      </a>
    </div>
  `;

  document.getElementById('sns-links').addEventListener('click', (e) => {
    const card = e.target.closest('.sns-link-card');
    if (!card) return;
    router.navigate(`/character/${char.id}/sns/${card.dataset.platform}`);
  });
}

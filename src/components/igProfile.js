/**
 * Instagram 패러디 프로필 컴포넌트
 * 포인트 소모 없이 자유 열람. 게시물 클릭하면 상세 보기.
 */

export function renderIgProfile(el, { char, data, onBack }) {
  el.innerHTML = `
    <div class="ig-page">
      <div class="ig-topbar">
        <button class="btn-sns-back" id="btn-sns-back">← ${char.name} 채널로</button>
        <span class="ig-topbar-logo">📷 Instaram</span>
      </div>
      <div class="ig-profile">
        <div class="ig-avatar">${char.name[0]}</div>
        <div class="ig-profile-stats">
          <span><strong>${data.postCount}</strong><br>게시물</span>
          <span><strong>${data.followers.toLocaleString()}</strong><br>팔로워</span>
          <span><strong>${data.following}</strong><br>팔로잉</span>
        </div>
      </div>
      <div class="ig-profile-bio">
        <strong>${data.displayName}</strong>
        <p>${data.bio}</p>
      </div>
      <div class="ig-grid" id="ig-grid">
        ${data.posts.map((post, i) => `
          <div class="ig-thumb" data-idx="${i}">
            <div class="ig-thumb-img">📷</div>
          </div>
        `).join('')}
      </div>
      <div id="ig-detail"></div>
    </div>
  `;

  document.getElementById('btn-sns-back').addEventListener('click', onBack);

  document.getElementById('ig-grid').addEventListener('click', (e) => {
    const thumb = e.target.closest('.ig-thumb');
    if (!thumb) return;
    const idx = parseInt(thumb.dataset.idx);
    const post = data.posts[idx];

    // 클릭한 썸네일 하이라이트
    document.querySelectorAll('.ig-thumb').forEach(t => t.classList.remove('ig-thumb-active'));
    thumb.classList.add('ig-thumb-active');

    document.getElementById('ig-detail').innerHTML = `
      <div class="ig-post-detail">
        <div class="ig-post-img">📷</div>
        <div class="ig-post-info">
          <div class="ig-post-header">
            <span class="ig-post-author">${data.displayName}</span>
            <span class="ig-post-time">${post.time}</span>
          </div>
          <p class="ig-post-caption">${post.caption}</p>
          <span class="ig-post-likes">❤️ ${post.likes}</span>
        </div>
      </div>
    `;
  });
}

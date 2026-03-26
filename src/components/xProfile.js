/**
 * X (트위터 패러디) 프로필 컴포넌트
 * 포인트 소모 없이 자유 열람. 내용 보고 플레이어가 직접 판단.
 */

export function renderXProfile(el, { char, data, onBack }) {
  el.innerHTML = `
    <div class="x-page">
      <div class="x-topbar">
        <button class="btn-sns-back" id="btn-sns-back">← ${char.name} 채널로</button>
        <span class="x-topbar-logo">𝕏</span>
      </div>
      <div class="x-profile">
        <div class="x-banner" style="background: linear-gradient(135deg, var(--accent-purple), var(--accent-pink)); height: 100px;"></div>
        <div class="x-profile-body">
          <div class="x-avatar">${char.name[0]}</div>
          <div class="x-profile-info">
            <h3 class="x-display-name">${data.displayName}</h3>
            <span class="x-handle">${data.handle}</span>
            <p class="x-bio">${data.bio}</p>
            <div class="x-stats">
              <span><strong>${data.following}</strong> 팔로잉</span>
              <span><strong>${data.followers.toLocaleString()}</strong> 팔로워</span>
              <span>가입일: ${data.joined}</span>
            </div>
            <div class="x-following-list">
              <span class="x-following-label">팔로잉 중:</span>
              ${data.followList.map(f => `<span class="x-follow-tag">${f}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="x-feed-header">게시물</div>
      <div class="x-feed">
        ${data.posts.map(post => `
          <div class="x-post">
            <div class="x-post-avatar">${char.name[0]}</div>
            <div class="x-post-body">
              <div class="x-post-header">
                <span class="x-post-name">${data.displayName}</span>
                <span class="x-post-handle">${data.handle}</span>
                <span class="x-post-time">· ${post.time}</span>
              </div>
              <p class="x-post-text">${post.text}</p>
              <div class="x-post-actions">
                <span>💬 ${Math.floor(post.likes * 0.1)}</span>
                <span>🔁 ${post.retweets}</span>
                <span>❤️ ${post.likes}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('btn-sns-back').addEventListener('click', onBack);
}

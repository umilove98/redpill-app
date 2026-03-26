import { costs, getProgress, updateProgress, trySpend, collectEvidence } from '../../core/game.js';

export function renderMetadataTab(el, char) {
  const meta = char.hints.metadata;
  const voice = char.hints.voiceAnalysis;
  const progress = getProgress(char.id);

  el.innerHTML = `
    <div class="metadata-section">
      <h3 class="tab-section-title">채널 정보</h3>
      <div class="meta-grid">
        ${meta.map(m => `
          <div class="meta-card">
            <div class="meta-label">${m.item}</div>
            <div class="meta-value">${m.content}</div>
          </div>
        `).join('')}
      </div>

      <div class="voice-section">
        <h3 class="tab-section-title">음성 분석 도구</h3>
        ${progress.voiceUsed ? `
          <div class="voice-result">
            <div class="voice-gauge">
              <div class="voice-gauge-fill" style="width: ${voice.confidence}%"></div>
              <span class="voice-gauge-label">신뢰도 ${voice.confidence}%</span>
            </div>
            <p class="voice-report">${voice.report}</p>
          </div>
        ` : `
          <button class="btn-voice" id="btn-voice">
            음성 분석 실행 <span class="cost-badge">${costs.voiceAnalysis}p</span>
          </button>
        `}
      </div>
    </div>
  `;

  const voiceBtn = document.getElementById('btn-voice');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      if (!trySpend(costs.voiceAnalysis)) return;
      progress.voiceUsed = true;
      updateProgress(char.id, progress);

      if (voice.confidence >= 80) {
        collectEvidence(char.id, 'voice', voice.report, 'strong');
      }
      renderMetadataTab(el, char);
    });
  }
}

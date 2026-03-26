/**
 * SNS 페이지 오케스트레이터
 * charId + platform → X 또는 Instagram 전체 화면 렌더링
 */
import { router } from '../core/router.js';
import { renderXProfile } from '../components/xProfile.js';
import { renderIgProfile } from '../components/igProfile.js';

let snsCache = null;
let charsCache = null;

async function loadData() {
  if (!snsCache) snsCache = await fetch('/data/sns.json').then(r => r.json());
  if (!charsCache) charsCache = await fetch('/data/characters.json').then(r => r.json());
  return { sns: snsCache, chars: charsCache };
}

export async function renderSnsPage(el, charId, platform) {
  const { sns, chars } = await loadData();
  const charSns = sns[charId];
  const char = chars.find(c => c.id === charId);
  if (!charSns || !char) return;

  const onBack = () => router.navigate('/character/' + charId + '?tab=sns');

  if (platform === 'x') {
    renderXProfile(el, { char, data: charSns.x, onBack });
  } else if (platform === 'insta') {
    renderIgProfile(el, { char, data: charSns.insta, onBack });
  }
}

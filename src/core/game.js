/**
 * 게임 로직 — 포인트 소모, 증거 수집, 진행도 추적
 * 모든 탭에서 재사용되는 핵심 게임 메카닉
 */
import { store } from './store.js';
import { toast } from '../components/toast.js';
import gameConfig from '../../public/data/game-config.json';

export const costs = gameConfig.rounds[0].pointCosts;

const EMPTY_PROGRESS = {
  chatUsed: [],
  clipsWatched: [],
  communityRevealed: [],
  snsRevealed: [],
  voiceUsed: false
};

/** 캐릭터별 진행도 조회 (없으면 초기화) */
export function getProgress(charId) {
  if (!store.state.progress[charId]) {
    store.state.progress = {
      ...store.state.progress,
      [charId]: { ...EMPTY_PROGRESS }
    };
  }
  return store.state.progress[charId];
}

/** 진행도 갱신 (Proxy 감지용 얕은 복사) */
export function updateProgress(charId, progress) {
  store.state.progress = { ...store.state.progress, [charId]: progress };
}

/** 토큰 소모 시도. 부족하면 false + 토스트 */
export function trySpend(cost) {
  if (store.state.investigationPoints < cost) {
    toast('조사 토큰이 부족합니다!');
    return false;
  }
  store.state.investigationPoints -= cost;

  const remaining = store.state.investigationPoints;
  if (remaining === 0) {
    toast('조사 토큰을 모두 소진했습니다. 판정을 진행하세요.');
  } else if (remaining <= 3) {
    toast(`조사 토큰이 ${remaining}개 남았습니다!`);
  }
  return true;
}

/** 증거 수집 (조용히 — 플레이어에게 알리지 않음) */
export function collectEvidence(charId, source, content, strength) {
  store.addEvidence(charId, { source, content, strength });
}


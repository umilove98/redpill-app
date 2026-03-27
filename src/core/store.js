/**
 * Proxy 기반 미니 스토어
 *
 * 사용법:
 *   store.subscribe('investigationPoints', (val, old) => updateHUD())
 *   store.state.investigationPoints -= 3   // 자동으로 구독자 호출
 */

import gameConfig from '../../public/data/game-config.json';

const r1 = gameConfig.rounds[0];

const initialState = {
  // 현재 라운드
  currentRound: 'R1',

  // 조사 토큰 (라운드당 제한)
  investigationPoints: r1.investigationPoints,
  maxInvestigationPoints: r1.investigationPoints,

  // 신뢰도 게이지
  trustGauge: gameConfig.trustGauge.initial,

  // 현재 조사 중인 캐릭터 ID
  activeCharacterId: null,

  // 수집된 증거 — { characterId: [{ source, content, strength }] }
  evidence: {},

  // 캐릭터별 판정 결과 — { characterId: { gender, ageGroup, education, overall } }
  verdicts: {},

  // 캐릭터별 조사 진행 상태 — { characterId: { chatUsed: [], tabsVisited: [], clipsWatched: [] } }
  progress: {},

  // 판정 완료된 캐릭터 ID 목록
  completedCharacters: [],

  // 게임 페이즈
  phase: 'home' // home | investigating | verdict | result | ending
};

const listeners = new Map();

function createStore() {
  const state = structuredClone(initialState);

  const proxy = new Proxy(state, {
    set(target, prop, value) {
      const oldValue = target[prop];
      target[prop] = value;
      notify(prop, value, oldValue);
      return true;
    }
  });

  function notify(prop, value, oldValue) {
    const fns = listeners.get(prop);
    if (fns) {
      for (const fn of fns) {
        fn(value, oldValue);
      }
    }
    // 와일드카드 구독자에게도 알림
    const wildcardFns = listeners.get('*');
    if (wildcardFns) {
      for (const fn of wildcardFns) {
        fn(prop, value, oldValue);
      }
    }
  }

  return proxy;
}

export const store = {
  state: createStore(),

  /** 특정 키 변경 구독. '*'로 모든 변경 구독 가능 */
  subscribe(key, fn) {
    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    listeners.get(key).add(fn);

    // unsubscribe 함수 반환
    return () => listeners.get(key)?.delete(fn);
  },

  /** 증거 추가 (배열 내부 변경이라 Proxy가 감지 못하므로 헬퍼 제공) */
  addEvidence(characterId, item) {
    if (!this.state.evidence[characterId]) {
      this.state.evidence[characterId] = [];
    }
    this.state.evidence[characterId].push(item);
    // 수동 알림 (중첩 객체 변경)
    this.state.evidence = { ...this.state.evidence };
  },

  /** 조사 토큰 소모 */
  spendPoints(cost) {
    if (this.state.investigationPoints < cost) return false;
    this.state.investigationPoints -= cost;
    return true;
  },

  /** 판정 제출 */
  submitVerdict(characterId, verdict) {
    this.state.verdicts = {
      ...this.state.verdicts,
      [characterId]: verdict
    };
    this.state.completedCharacters = [...this.state.completedCharacters, characterId];

    if (this.isRoundComplete()) {
      setTimeout(() => { this.state.phase = 'roundComplete'; }, 0);
    }
  },

  /** 신뢰도 감소 (양수/음수 모두 안전) */
  penalizeTrust(amount = 25) {
    this.state.trustGauge = Math.max(0, this.state.trustGauge - Math.abs(amount));
  },

  /** 게임 오버 체크 */
  isGameOver() {
    return this.state.trustGauge <= gameConfig.trustGauge.badEndingThreshold;
  },

  /** 라운드 내 모든 캐릭터 판정 완료 체크 */
  isRoundComplete() {
    const round = gameConfig.rounds.find(r => r.id === this.state.currentRound);
    if (!round) return false;
    return round.characterIds.every(id => this.state.completedCharacters.includes(id));
  },

  /** 상태 초기화 */
  reset() {
    const fresh = structuredClone(initialState);
    for (const key of Object.keys(fresh)) {
      this.state[key] = fresh[key];
    }
  }
};

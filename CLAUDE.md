# 빨간약 방송국 - Claude Code 개발 가이드

## 프로젝트 개요
"빨간약 방송국" — 버튜버 팩트체크 추리 게임.
**Vanilla JS + Vite** 기반 웹 게임 (React 사용하지 않음).
도트 그래픽 + AI 생성 GIF 하이브리드.
1차 MVP: R1 튜토리얼(캐릭터 3명) + 페이크엔딩. 목표일 4/12.

## 기술 스택 핵심 규칙

- **Vanilla JS** (React 사용 금지) — DOM 직접 조작으로 반응성 최우선
- **Vite** 번들러 — HMR 개발 환경
- **상태 관리** — Proxy 기반 미니 스토어 (또는 Zustand vanilla 모드). 게임 상태를 한 곳에서 관리
- **라우팅** — hash 라우터 직접 구현
- **컴포넌트 패턴** — template literal + DOM API로 재사용 가능한 함수 컴포넌트. innerHTML 또는 createElement 사용
- **이벤트 위임** — 각 요소에 리스너 달지 말고 상위 컨테이너에서 이벤트 위임

## 데이터 분리

- 모든 캐릭터/클립/위키 데이터는 `public/data/*.json`에서 관리
- 코드는 JSON을 읽어서 렌더링할 뿐. **하드코딩 금지**
- 새 캐릭터 추가 = JSON 파일 + 에셋 폴더 추가만으로 완료되어야 함

## 에셋 경로 규칙

```
public/assets/
├── characters/{id}/   # avatar.png, face_*_a.png, face_*_b.png, redpill.gif, banner.png, thumbs/
├── sns_photos/{id}/
├── backgrounds/
├── wiki/
├── ui/
└── audio/bgm/, sfx/, glitch/
```

## 아트 스타일

- 기본: 도트/픽셀아트 (64x64 스프라이트)
- **숨쉬기 애니메이션**: 모든 표정을 A/B 2프레임으로 제작. opacity를 1.5~2초 간격으로 ease-in-out 전환
- 빨간약 순간: AI 생성 GIF (실사풍/고해상도) — 스타일 갭이 연출
- UI: 치지직/트위치 패러디. 파스텔톤 + 네온 핑크/보라 다크테마
- 글리치: CSS animation으로 구현 (skew, RGB 색수차, 스캔라인, hue-rotate)

## 화면 흐름 (MVP)

```
홈 (썸네일 그리드)
  → 캐릭터 선택 (1명 집중 조사 시작)
    → 채널 페이지 (클립/커뮤니티/정보/SNS 탭)
      → 클립 뷰어 (대사 + 표정 + 질문 선택지)
      → 서치라이트 (위키 검색)
    → 판정 화면 (항목별 선택 + 증거 제출)
      → 판정 결과 (빨간약 공개 / 후일담 연출)
  → 홈으로 복귀 → 다음 캐릭터 선택 → 반복
  → 전체 판정 완료 시 라운드 종료
    → 페이크엔딩 (승진 + AI 암시 크레딧)
```

## 게임 상태

- **조사 포인트**: 라운드당 제한. 탭 탐색/클립 시청/질문 시 소모
- **신뢰도 게이지**: 오판 시 감소. 바닥나면 배드엔딩
- **증거 수집**: 힌트 발견 시 자동 수집. 판정 시 근거로 제출해야 만점
- **판정 후 후일담 연출**: 가짜는 빨간약 공개, 진짜는 "의심받을 만했던 진짜 사연" 공개

## 프로젝트 구조

```
src/
├── components/    # 재사용 UI 컴포넌트
├── core/          # 게임 로직, 라우터, 스토어, 테마
├── pages/         # 페이지별 모듈 (channel, sns 등)
├── styles/        # CSS 파일
├── utils/         # 유틸리티 함수
└── main.js        # 진입점

public/
├── assets/        # 캐릭터 이미지 등 에셋
├── data/          # JSON 데이터 (characters, clips, wiki, sns, game-config)
└── favicon.svg
```

## 커맨드

- `npm run dev` — 개발 서버 실행
- `npm run build` — 프로덕션 빌드
- `npm run preview` — 빌드 결과 미리보기

## Notion 참조 페이지

- 오늘의 작업: 📅 1차 MVP WBS → 🔄 진행 칸반 뷰
- 게임 기획 전체: 🎮 빨간약 방송국 — Game Design Document
- 캐릭터 데이터: 🎭 캐릭터 시트
- UI/에셋 기준: 🖥️ 에셋 & UI 구현 계획서
- 기술 스택: 🛠️ 기술 스택 & 레퍼런스

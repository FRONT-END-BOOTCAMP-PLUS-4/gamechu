# Arena Loading Bug Fix — 의사결정 기록

아레나 페이지 뒤로가기 시 무한 로딩 버그 수정 과정에서 내린 주요 결정들을 기록합니다.

이슈: #300 | PR: #302

---

## 1. 버그 원인 분석

React **bottom-up effect 실행 순서** + **automatic batching** 조합에서 발생하는 race condition.

뒤로가기 시 TanStack Query 캐시가 즉시 데이터를 반환하면:

1. 자식(섹션) effects 먼저 실행 → `onLoaded()` 다섯 번 호출 → `doneSections = 5`
2. 이후 부모(ArenaPage) mount effect 실행 → `setDoneSections(0)` 리셋
3. React batching으로 `doneSections=5` 렌더가 발생하지 않음
4. `doneSections`가 다시 5에 도달하지 못함 → `setLoading(false)` 미호출 → **무한 로딩**

---

## 2. 수정 방향 결정: sectionKey 패턴 vs. 직접 수정

### 고려한 옵션

**옵션 A — 직접 race condition 수정**

부모 effect에서 `doneSections` 리셋을 제거하거나, 자식-부모 간 effect 실행 순서를 `useLayoutEffect` + `flushSync`로 제어.

- 장점: 개념적으로 "올바른" 수정
- 단점: `useLayoutEffect`는 SSR 경고를 발생시키고, `flushSync`는 React 렌더 파이프라인에 직접 개입해 예측하기 어려운 부작용을 만들 수 있음. 컴포넌트 간 결합도 증가.

**옵션 B — sectionKey 패턴 (채택)**

뒤로가기 감지 시 `sectionKey`를 증가시켜 섹션 컨테이너를 강제 remount. `key={sectionKey}`로 React가 해당 서브트리를 완전히 초기화.

- 장점: race condition 자체를 우회. 상태 초기화 보장. React의 `key` 메커니즘을 의도대로 사용.
- 단점: 섹션 remount 비용(미미). `totalSections` 상수를 섹션 개수와 수동 동기화해야 함(주석으로 명시).

**결정 이유**: 옵션 A는 수정 범위보다 복잡도가 높고 SSR 제약이 있음. 옵션 B는 React가 권장하는 "state 리셋" 패턴이며, 동작이 예측 가능하고 범위가 명확함.

---

## 3. 안전 타임아웃 10초 설정

섹션 중 하나가 네트워크 오류 등으로 `onLoaded()`를 호출하지 못하면 로딩이 영구히 지속되는 상황을 방지하기 위해 10초 fallback 타임아웃을 추가했습니다.

**10초를 선택한 이유**: 페이지 로딩 UX 기준으로 10초는 사용자가 "오류가 있다"고 인식하는 임계값에 가까움. 5초는 느린 네트워크에서 오탐 가능성이 있고, 15초는 사용자 이탈 후 타임아웃이 발생할 가능성이 높음.

---

## 4. ECC 리뷰 반영 사항

초기 PR에서 ECC 리뷰를 통해 추가된 수정:

| 항목 | 원인 | 조치 |
| --- | --- | --- |
| `React` default import 제거 | React 17+ 환경에서 불필요한 import | named `Fragment` import으로 교체 |
| `totalSections` 주석 누락 | 상수와 실제 섹션 개수 동기화 필요성이 불명확 | 동기화 필요 주석 추가 |
| `profile/page.tsx` 등 3개 파일 cleanup 누락 | 동일한 `setLoading` 패턴에 cleanup 없음 | 세 파일에 `return () => setLoading(false)` 추가 |

**cleanup 범위 확장 이유**: 버그는 `ArenaDetailPage`에서 발견됐지만, 동일 패턴(`setLoading`을 외부에서 받아 useEffect에서 호출)이 `profile/page.tsx`, `profile/[nickname]/page.tsx`, `games/page.tsx`에도 존재했음. 발견된 패턴을 일관되게 수정하지 않으면 동일 버그가 재발할 수 있어 함께 수정.

---

## 5. 트레이드오프 및 알려진 한계

- `sectionKey` 증가 시 섹션 전체 remount가 발생하므로, 섹션 내 로컬 상태(스크롤 위치 등)는 초기화됨. 현재 아레나 섹션은 로컬 상태를 거의 갖지 않아 영향 없음.
- `totalSections` 상수를 실제 섹션 수와 수동으로 맞춰야 함. 섹션 추가/제거 시 이 상수도 함께 업데이트해야 함(주석으로 명시됨).

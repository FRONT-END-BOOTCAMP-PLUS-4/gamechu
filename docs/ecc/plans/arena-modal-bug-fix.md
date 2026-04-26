# Arena Modal Bug Fix — 의사결정 기록

도전장 작성하기 모달 미표시 버그 수정 과정에서 내린 주요 결정들을 기록합니다.

이슈: #301 | PR: #303

---

## 1. 버그 원인 분석

두 가지 독립적인 원인이 복합적으로 작용했습니다.

**주 원인 — React 19 StrictMode + focus-trap-react**

React 19 StrictMode에서 effects가 mount → unmount → mount 순서로 두 번 실행됩니다. `focus-trap-react`의 `onDeactivate: onClose` 설정이 cleanup(첫 번째 unmount) 시 즉시 `onClose`를 호출하여 모달을 닫아버림.

**보조 원인 — LottieLoader 이벤트 차단**

`LottieLoader`에 `pointer-events-none`이 없어 로딩 오버레이가 "도전장 작성하기" 버튼 클릭 이벤트를 차단했음. 로딩이 끝난 후에도 오버레이가 z-index 우위를 점하는 타이밍에 클릭이 발생하면 버튼 이벤트가 전달되지 않음.

---

## 2. FocusTrap 수정 방향 결정

### 고려한 옵션

**옵션 A — `checkCanDeactivate` 게이팅**

`checkCanDeactivate` 콜백에서 실제 포커스 해제 요청인지 판별해 `onDeactivate` 호출을 차단.

- 단점: 판별 로직이 복잡하고, React StrictMode의 cleanup을 "실제 비활성화"와 구분하는 신뢰할 만한 방법이 없음. 라이브러리 내부 동작에 의존하는 취약한 접근.

**옵션 B — `onDeactivate` 제거 + ESC 직접 처리 (채택)**

`onDeactivate`를 제거하고, ESC 키 처리를 `useEffect` 내 `keydown` 리스너로 직접 구현.

- 장점: StrictMode cleanup과 무관하게 동작. ESC 처리 로직의 소유권이 컴포넌트 안에 있어 의도가 명확함.
- 단점: `onClose`가 `useEffect` deps에 포함되므로, 부모가 `useCallback` 없이 인라인 함수를 전달하면 모달 열린 상태에서 매 렌더마다 리스너가 탈부착됨(기능적 버그는 아님, ECC 리뷰에서 지적).

**결정 이유**: 옵션 A는 라이브러리 내부 구현에 의존하는 불안정한 패턴. 옵션 B는 동작 범위가 명확하고 StrictMode와 무관하게 예측 가능.

---

## 3. z-index z-50 → z-[10001] 변경

`LottieLoader`의 z-index가 `z-9999`(= 9999)이므로, 모달이 로딩 오버레이 위에 표시되려면 그보다 높은 값이 필요했습니다. `z-[10001]`은 Tailwind 임의값 문법으로 10001을 명시한 것이며, 이 수치가 LottieLoader(`z-9999`)와의 관계를 의식한 값임을 주석으로 기록했습니다.

---

## 4. LottieLoader pointer-events-none 적용 결정

### 트레이드오프

`pointer-events-none`을 적용하면 로딩 오버레이가 표시되는 **모든 상황**에서 하단 UI와 상호작용이 가능해집니다. 예를 들어 아레나 생성 요청 중에 다시 "도전장 작성하기"를 클릭하면 모달이 재오픈되어 중복 제출이 이론적으로 가능합니다.

### 결정

중복 제출 방지는 서버 측에서 처리하는 것이 올바른 책임 분리입니다(클라이언트 UI는 보조적 방어선). 현재 버그(버튼 클릭 자체가 막힘)가 더 심각한 UX 문제이므로 `pointer-events-none` 적용을 우선했습니다. 이 의도를 코드 주석으로 명시했습니다.

---

## 5. 점수 차감 서버 이전 결정

### 기존 구조의 문제

`CreateArenaModal`이 아레나 생성 후 클라이언트에서 직접 `POST /api/member/scores`를 호출해 점수를 차감하고 기록을 생성했습니다.

**보안 취약점**: 클라이언트가 `policyId`, `actualScore`를 직접 전달하므로 임의 조작이 가능했습니다.

**비원자성**: 아레나 생성과 점수 차감이 별개 요청이므로 네트워크 오류 시 데이터 불일치 발생 가능.

### 결정: 서버에서 처리

`POST /api/member/arenas` 핸들러에서 아레나 생성과 동시에 점수 차감(-100) 및 기록 생성(policyId: 4)을 처리. `policyId`와 `actualScore`는 서버에서 하드코딩되므로 클라이언트 조작 불가.

---

## 6. prisma.$transaction 도입 결정

### ECC 리뷰에서 지적된 문제

초기 구현에서 세 연산(아레나 생성 → 점수 차감 → 기록 생성)이 트랜잭션 없이 순차 실행되었습니다. ECC 리뷰에서 이를 [Critical]로 지적:

- `incrementScore` 실패 시: 아레나는 생성됐지만 점수 미차감 (100점 비용 없이 아레나 획득)
- `createRecord` 실패 시: 점수는 차감됐지만 이력 없음

### 결정: prisma.$transaction 적용

초기에는 후속 이슈(#307)로 분리했지만, 코드 한 줄 수준의 변경이어서 별도 이슈/브랜치 없이 fix/#301에서 처리하기로 결정하고 #307을 닫았습니다.

트랜잭션 블록에서 리포지토리 추상화를 거치지 않고 `tx` 클라이언트를 직접 사용한 이유: 기존 리포지토리들이 `Prisma.TransactionClient`를 받는 인터페이스를 갖추지 않아, 트랜잭션 클라이언트를 주입하려면 리포지토리 전체 리팩터링이 필요합니다. 범위 대비 비용이 커서 라우트 핸들러에서 직접 처리하는 방향을 선택했습니다.

---

## 7. ECC 리뷰 반영 사항 (2차 커밋)

| 항목 | ECC 지적 | 조치 |
| --- | --- | --- |
| z-[10001] 의도 불명 | 매직 넘버 주석 권장 | LottieLoader z-9999 위임을 주석으로 명시 |
| pointer-events-none 광범위한 영향 | 의도된 동작이면 주석 권장 | 중복 제출은 서버가 방어함을 주석으로 명시 |
| 트랜잭션 부재 | [Critical] 원자성 미보장 | prisma.$transaction 적용 후 #307 이슈 닫음 |
| 새 동작 검증 테스트 부재 | incrementScore/createRecord 인자 검증 미흡 | 호출 인자(delta, policyId) 검증 테스트 추가 |

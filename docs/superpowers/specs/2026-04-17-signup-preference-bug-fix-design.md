# 회원가입 선호 설정 버그 수정 Design

**Date**: 2026-04-17
**Status**: In Progress
**Branch**: `fix/#304`
**Issue**: #304

---

## Problem

회원가입 선호 장르/테마/플랫폼 입력 단계에서 발견된 버그 3건.

### Bug 1 — SelectionCard className에 주석 포함

```tsx
// SelectionCard.tsx:15
className={`// ✅ min-width로 변경해 반응형 대응 flex h-[80px] min-w-[140px] ...`}
```

`// ✅ min-width로 변경해 반응형 대응` 문자열이 className에 그대로 포함되어 DOM에 출력됨.
CSS 클래스로 해석되지 않아 무해하지만, 불필요한 문자열이 마크업에 노출되는 코드 품질 문제.

### Bug 2 — nextStep 상한이 5로 설정

```tsx
// page.tsx:21
const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
```

실제 step은 최대 4(StepPlatforms)까지만 존재. 상한이 5이므로 이론상 step 5에 도달 가능.
step 5에 해당하는 렌더링 분기가 없어 빈 화면이 표시되는 잠재 버그.

### Bug 3 — 빈 선택 시 기존 데이터 미삭제

```tsx
// StepGenres.tsx
const handleNext = () => {
    if (selectedGenreIds.length === 0) {
        onNext(); // API 호출 없이 스킵
        return;
    }
    saveGenres();
};
```

아무것도 선택하지 않고 다음 단계로 이동하면 API를 호출하지 않아 기존 저장된 선호 데이터가 삭제되지 않음.
현재 회원가입 최초 진행 시에는 기존 데이터가 없어 즉각적 문제는 없지만,
이 컴포넌트를 "선호 설정 수정" 페이지에서 재사용할 경우 기존 데이터가 남아 있게 됨.

---

## Decisions

| 질문 | 결정 | 근거 |
| --- | --- | --- |
| Bug 3 수정 위치: 프론트 vs 백엔드 | 프론트에서 early return 제거 | 서버 UseCase는 이미 `deleteMany` 후 빈 배열이면 INSERT 없이 종료. 백엔드 로직 정상 |
| 빈 배열 전송 시 서버 동작 | 정상 처리 (200 OK) | `z.array()` 기본 동작상 빈 배열 허용, UseCase는 delete 후 루프 없이 종료 |
| Zod 스키마 변경 여부 | 변경 안 함 | 빈 배열은 유효한 입력 (선호 항목 없음을 의미) |

---

## Architecture

### Bug 1 수정

```tsx
// 수정 전
className={`// ✅ min-width로 변경해 반응형 대응 flex h-[80px] min-w-[140px] ...`}

// 수정 후
className={`flex h-[80px] min-w-[140px] ...`}
```

### Bug 2 수정

```tsx
// 수정 전
const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));

// 수정 후
const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
```

### Bug 3 수정 (StepGenres / StepThemes / StepPlatforms 동일)

```tsx
// 수정 전
const handleNext = () => {
    if (selectedGenreIds.length === 0) {
        onNext();
        return;
    }
    saveGenres();
};

// 수정 후
const handleNext = () => {
    saveGenres();
};
```

---

## Out of Scope

- N+1 INSERT 쿼리 개선 (→ refactor #305)
- Step 컴포넌트 3벌 중복 통합 (→ refactor #305)
- Domain / Prisma 타입 의존 분리 (→ refactor #305)

---

## Affected Files

| 파일 | 변경 |
| --- | --- |
| `app/(auth)/components/SelectionCard.tsx` | className 주석 제거 |
| `app/(auth)/sign-up/page.tsx` | `nextStep` 상한 5 → 4 |
| `app/(auth)/components/StepGenres.tsx` | `handleNext` 빈 배열 조기 반환 제거 |
| `app/(auth)/components/StepThemes.tsx` | `handleNext` 빈 배열 조기 반환 제거 |
| `app/(auth)/components/StepPlatforms.tsx` | `handleSubmit` 빈 배열 조기 반환 제거 |

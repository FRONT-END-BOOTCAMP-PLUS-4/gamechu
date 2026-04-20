# 회원가입 선호 설정 버그 수정 Plan

> **Status**: ✅ Done — Issue #304, branch `fix/#304`

**Goal:** 회원가입 선호 장르/테마/플랫폼 입력 흐름의 버그 3건 수정.

**Architecture:** 프론트엔드 3개 파일(SelectionCard, page, Step 컴포넌트들)만 수정. 백엔드 무변경.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript

---

## File Map

| 파일                                            | 상태     | 역할                                       |
| ----------------------------------------------- | -------- | ------------------------------------------ |
| `app/(auth)/components/SelectionCard.tsx`       | **수정** | className 내 주석 문자열 제거              |
| `app/(auth)/sign-up/page.tsx`                   | **수정** | `nextStep` 상한 5 → 4 수정                 |
| `app/(auth)/components/StepGenres.tsx`          | **수정** | 빈 선택 시 API 스킵 제거, 항상 API 호출   |
| `app/(auth)/components/StepThemes.tsx`          | **수정** | 빈 선택 시 API 스킵 제거, 항상 API 호출   |
| `app/(auth)/components/StepPlatforms.tsx`       | **수정** | 빈 선택 시 API 스킵 제거, 항상 API 호출   |

---

## Task 1: SelectionCard className 주석 제거

**Goal:** className 문자열에 포함된 `// ✅ min-width로 변경해 반응형 대응` 주석 제거.

- [x] **Step 1:** `SelectionCard.tsx:15` className 템플릿 리터럴에서 주석 텍스트 제거

---

## Task 2: nextStep 상한 수정

**Goal:** `page.tsx`의 `nextStep` 함수가 step 5까지 허용하는 버그 수정.

- [x] **Step 1:** `page.tsx:21` — `Math.min(prev + 1, 5)` → `Math.min(prev + 1, 4)`

---

## Task 3: 빈 선택 시 API 스킵 로직 제거

**Goal:** 선택 없이 다음 단계로 이동 시 항상 API를 호출하도록 수정.

- [x] **Step 1:** `StepGenres.tsx` `handleNext` — 빈 배열 조기 반환 제거, 항상 `saveGenres()` 호출
- [x] **Step 2:** `StepThemes.tsx` `handleNext` — 동일 수정
- [x] **Step 3:** `StepPlatforms.tsx` `handleSubmit` — 동일 수정

> 서버 측 `CreatePreferredGenresUsecase`는 이미 `deleteMany` 후 빈 배열이면 INSERT 없이 종료하므로 백엔드 무변경.

---

## Task 4: 커밋

- [x] **Step 1:** 변경 파일 스테이징 (문서 포함)
- [x] **Step 2:** 커밋 메시지 `[fix/#304] 회원가입 선호 설정 버그 수정`

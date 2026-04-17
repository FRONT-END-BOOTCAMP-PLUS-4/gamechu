# 회원가입 선호 설정 리팩토링 Plan

> **Status**: 🚧 In Progress — Issue #305, branch `refactor/#305`

**Goal:** 선호 장르/테마/플랫폼 입력 흐름의 N+1 쿼리, Domain/Prisma 의존, 컴포넌트 중복, 코드 품질 문제를 일괄 개선한다.

**Architecture:**
- Backend: Domain 인터페이스에서 Prisma 타입 제거 + `saveMany()` 추가 + Use case N+1 제거
- Frontend: Step 3개 컴포넌트 → 제네릭 `StepPreferences` 1개로 통합

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma 6

---

## File Map

### Backend

| 파일 | 상태 | 역할 |
| --- | --- | --- |
| `backend/preferred-genre/domain/repositories/PreferredGenreRepository.ts` | **수정** | Prisma import 제거, 인라인 타입 정의, `saveMany()` 추가, 주석 잔재 제거 |
| `backend/preferred-theme/domain/repositories/PreferredThemeRepository.ts` | **수정** | 동일 |
| `backend/preferred-platform/domain/repositories/PreferredPlatformRepository.ts` | **수정** | 동일 |
| `backend/preferred-genre/infra/repositories/prisma/PrismaPreferredGenreRepository.ts` | **수정** | `PrismaClient` import/private 필드 제거, `saveMany()` → `createMany()` 구현 |
| `backend/preferred-theme/infra/repositories/prisma/PrismaPreferredThemeRepository.ts` | **수정** | 동일 |
| `backend/preferred-platform/infra/repositories/prisma/PrismaPreferredPlatformRepository.ts` | **수정** | 동일 |
| `backend/preferred-genre/application/usecase/CreatePreferredGenresUsecase.ts` | **수정** | `for` 루프 → `saveMany()` 단일 호출 |
| `backend/preferred-theme/application/usecase/CreatePreferredThemesUsecase.ts` | **수정** | 동일 |
| `backend/preferred-platform/application/usecase/CreatePreferredPlatformsUsecase.ts` | **수정** | 동일 |

### Frontend

| 파일 | 상태 | 역할 |
| --- | --- | --- |
| `app/(auth)/components/StepPreferences.tsx` | **신규** | 제네릭 선호 선택 스텝 컴포넌트 |
| `app/(auth)/sign-up/page.tsx` | **수정** | `StepGenres/Themes/Platforms` → `StepPreferences` 교체 |
| `app/(auth)/components/StepGenres.tsx` | **삭제** | `StepPreferences`로 통합 |
| `app/(auth)/components/StepThemes.tsx` | **삭제** | `StepPreferences`로 통합 |
| `app/(auth)/components/StepPlatforms.tsx` | **삭제** | `StepPreferences`로 통합 |

---

## Task 1: 문서 작성

- [ ] Plan 작성
- [ ] Spec 작성
- [ ] 커밋

---

## Task 2: Backend 리팩토링

**Goal:** N+1 제거 + Domain 순수화 + 코드 정리

### Step 1: Domain 인터페이스 정리 (Genre / Theme / Platform 동일)
- [ ] Prisma `import` 제거
- [ ] `CreatePreferred*Input` 타입을 인라인 plain object로 정의
- [ ] `save()` 제거, `saveMany(inputs: ...[]): Promise<void>` 추가
- [ ] 주석 처리된 이전 인터페이스 코드 제거

### Step 2: Prisma Repository 정리 (Genre / Theme / Platform 동일)
- [ ] `PrismaClient` 타입 import 제거
- [ ] `private prisma` 필드 및 constructor 제거
- [ ] `save()` 제거, `saveMany()` → `createMany()` 구현

### Step 3: Use Case 단순화 (Genre / Theme / Platform 동일)
- [ ] `for` 루프 + 개별 `save()` 호출 → `saveMany()` 단일 호출로 교체

### Step 4: 커밋
```
[refactor/#305] 선호 설정 backend: N+1 제거, Domain/Prisma 의존 분리, 코드 정리
```

---

## Task 3: Frontend 리팩토링

**Goal:** Step 3벌 중복 → 제네릭 컴포넌트 1개로 통합

### Step 1: `StepPreferences.tsx` 신규 생성
- [ ] props: `title`, `queryKey`, `fetchUrl`, `saveUrl`, `bodyKey`, `errorMessage`, `onBack`, `onComplete`, `submitLabel`
- [ ] 기존 세 컴포넌트의 공통 로직 이전

### Step 2: `page.tsx` 수정
- [ ] `StepGenres/Themes/Platforms` import 제거 → `StepPreferences` import
- [ ] step 2~4 렌더링을 `StepPreferences` + 설정값으로 교체

### Step 3: 기존 Step 파일 삭제
- [ ] `StepGenres.tsx`, `StepThemes.tsx`, `StepPlatforms.tsx` 삭제

### Step 4: 커밋
```
[refactor/#305] 선호 설정 frontend: Step 컴포넌트 3개 → StepPreferences 1개로 통합
```

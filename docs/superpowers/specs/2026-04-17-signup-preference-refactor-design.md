# 회원가입 선호 설정 리팩토링 Design

**Date**: 2026-04-17
**Status**: In Progress
**Branch**: `refactor/#305`
**Issue**: #305

---

## Problem

### 1. N+1 INSERT 쿼리

```ts
// CreatePreferredGenresUsecase.ts (현재)
for (const genreId of dto.genreIds) {
    await this.repo.save({ memberId: dto.memberId, genreId });
}
```

장르 N개 선택 시 INSERT 쿼리가 N번 발생. `createMany()`로 한 번에 처리 가능.

### 2. Domain 레이어의 Prisma 타입 의존

```ts
// PreferredGenreRepository.ts (현재)
import { PreferredGenre } from "@/prisma/generated"; // ← 인프라 타입
export type CreatePreferredGenreInput = Omit<PreferredGenre, "id">;
```

Domain 레이어는 인프라(Prisma)를 모르는 게 DDD 원칙. 단순 plain object 타입으로 교체 가능.

### 3. Step 컴포넌트 3벌 중복

`StepGenres`, `StepThemes`, `StepPlatforms`가 설정값(URL, queryKey, label)만 다르고 구조가 완전히 동일.

### 4. 코드 품질 문제

- Domain 인터페이스에 주석 처리된 이전 설계 잔재
- Prisma Repository에 불필요한 `PrismaClient` 타입 import + `private prisma` 필드

---

## Decisions

| 질문 | 결정 | 근거 |
| --- | --- | --- |
| `save()` 메서드 유지 여부 | 제거 | Use case 리팩토링 후 호출부 없음. 미사용 코드 제거 원칙 |
| Domain 인터페이스 `saveMany` 반환 타입 | `Promise<void>` | 저장 결과를 Use case에서 사용하지 않음 |
| `StepPreferences` props 설계 | `onComplete` + `submitLabel` 통일 | `onNext`/`onSubmit` 분리 없이 단일 콜백으로 처리 |
| `page.tsx` 변경 범위 | Step 3개 제거 + `StepPreferences` 교체 | 제네릭 컴포넌트를 직접 사용하는 것이 래퍼보다 명확 |

---

## Architecture

### Backend

#### Domain 인터페이스 (변경 후)

```ts
// PreferredGenreRepository.ts
export type CreatePreferredGenreInput = {
    memberId: string;
    genreId: number;
};

export interface PreferredGenreRepository {
    saveMany(inputs: CreatePreferredGenreInput[]): Promise<void>;
    delete(memberId: string): Promise<void>;
}
```

#### Prisma Repository (변경 후)

```ts
// PrismaPreferredGenreRepository.ts
import { PreferredGenreRepository, CreatePreferredGenreInput } from "...";
import { prisma } from "@/lib/Prisma";

export class PrismaPreferredGenreRepository implements PreferredGenreRepository {
    async saveMany(inputs: CreatePreferredGenreInput[]): Promise<void> {
        await prisma.preferredGenre.createMany({ data: inputs });
    }

    async delete(memberId: string): Promise<void> {
        await prisma.preferredGenre.deleteMany({ where: { memberId } });
    }
}
```

#### Use Case (변경 후)

```ts
async execute(dto: CreatePreferredGenresDto): Promise<void> {
    await this.repo.delete(dto.memberId);
    await this.repo.saveMany(
        dto.genreIds.map((genreId) => ({ memberId: dto.memberId, genreId }))
    );
}
```

쿼리 수: N+1 → **2** (deleteMany 1회 + createMany 1회)

---

### Frontend

#### StepPreferences.tsx (신규)

```tsx
type Item = { id: number; name: string };

type Props = {
    title: string;
    queryKey: readonly unknown[];
    fetchUrl: string;
    saveUrl: string;
    bodyKey: string;
    errorMessage: string;
    onBack: () => void;
    onComplete: () => void;
    submitLabel: string;
};
```

- 세 Step 컴포넌트의 공통 로직 완전히 이전
- `[bodyKey]: selectedIds` 동적 키로 POST body 구성

#### page.tsx (변경 후)

```tsx
{step === 2 && (
    <StepPreferences
        title="선호하는 게임 장르를 선택해주세요"
        queryKey={queryKeys.genres()}
        fetchUrl="/api/genres"
        saveUrl="/api/preferred-genres"
        bodyKey="genreIds"
        errorMessage="선호 장르 저장에 실패했습니다."
        onBack={prevStep}
        onComplete={nextStep}
        submitLabel="다음 →"
    />
)}
{step === 3 && (
    <StepPreferences
        title="선호하는 게임 테마를 선택해주세요"
        queryKey={queryKeys.themes()}
        fetchUrl="/api/themes"
        saveUrl="/api/preferred-themes"
        bodyKey="themeIds"
        errorMessage="선호 테마 저장에 실패했습니다."
        onBack={prevStep}
        onComplete={nextStep}
        submitLabel="다음 →"
    />
)}
{step === 4 && (
    <StepPreferences
        title="이용하는 게임 플랫폼을 선택해주세요"
        queryKey={queryKeys.platforms()}
        fetchUrl="/api/platforms"
        saveUrl="/api/preferred-platforms"
        bodyKey="platformIds"
        errorMessage="선호 플랫폼 저장에 실패했습니다."
        onBack={prevStep}
        onComplete={handleSubmit}
        submitLabel="가입 완료"
    />
)}
```

---

## Out of Scope

- Zod 스키마 변경 (빈 배열 허용은 이미 정상 동작)
- API route handler 변경 (로직 동일)
- `SelectionCard` 변경

---

## Affected Files

| 파일 | 변경 |
| --- | --- |
| `backend/preferred-*/domain/repositories/Preferred*Repository.ts` (3개) | Prisma 의존 제거, `saveMany()` 추가, 주석 제거 |
| `backend/preferred-*/infra/repositories/prisma/Prisma*Repository.ts` (3개) | `PrismaClient` 제거, `createMany()` 구현 |
| `backend/preferred-*/application/usecase/Create*Usecase.ts` (3개) | N+1 루프 → `saveMany()` |
| `app/(auth)/components/StepPreferences.tsx` | 신규 생성 |
| `app/(auth)/sign-up/page.tsx` | Step 3개 → `StepPreferences` 교체 |
| `app/(auth)/components/StepGenres.tsx` | 삭제 |
| `app/(auth)/components/StepThemes.tsx` | 삭제 |
| `app/(auth)/components/StepPlatforms.tsx` | 삭제 |

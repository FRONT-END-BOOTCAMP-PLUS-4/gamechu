# 닉네임 중복 검사 PR 리뷰 반영 설계

**PR**: [#279](https://github.com/FRONT-END-BOOTCAMP-PLUS-4/gamechu/pull/279)
**브랜치**: `feat/#271`
**날짜**: 2026-03-27
**리뷰어**: @wojin57

---

## 변경 범위 요약

| 번호 | 중요도  | 항목                                                   |
| ---- | ------- | ------------------------------------------------------ |
| 1    | 🔴 필수 | `/api/member/nickname-check` DB 이중 쿼리 제거         |
| 2    | 🟡 권장 | 두 라우트에 Zod 입력 검증 적용                         |
| 3    | 🟡 권장 | 테스트 파일 3개 추가                                   |
| 4    | 🟡 권장 | usecase 레이어에 8자 제한 검증 추가                    |
| 5    | ⚪ 선택 | `StepProfile` UI 상태를 `ProfileInfoTab` 패턴으로 통일 |

---

## 1. DB 이중 쿼리 제거 (🔴 필수)

### 문제

`/api/member/nickname-check` route에서 `usecase.execute()`가 내부적으로 `repo.findByNickname()`을 이미 호출하지만, 반환값이 `isDuplicate: boolean`뿐이어서 route가 본인 닉네임 비교를 위해 동일 쿼리를 한 번 더 날린다.

```ts
// 현재 코드 — 쿼리 2회
const result = await usecase.execute(nickname);   // → findByNickname 내부 호출
if (result.isDuplicate) {
    const member = await repo.findByNickname(nickname); // ← 중복 쿼리
    if (member?.id === memberId) { ... }
}
```

### 해결 방법: Option A — DTO에 `foundMemberId` 추가

`NicknameCheckResponseDto`에 `foundMemberId: string | null` 필드를 추가하여 usecase에서 member 객체를 이미 조회하는 김에 ID까지 반환한다. route는 반환된 ID와 세션 ID를 비교하면 되므로 추가 쿼리가 불필요해진다.

**변경 파일**:

- `backend/member/application/usecase/dto/NicknameCheckResponseDto.ts` — `foundMemberId` 필드 추가
- `backend/member/application/usecase/NicknameCheckUsecase.ts` — member.id를 DTO에 포함
- `app/api/member/nickname-check/route.ts` — 이중 쿼리 제거, `result.foundMemberId` 사용

```ts
// 변경 후 DTO
export class NicknameCheckResponseDto {
    constructor(
        public readonly isDuplicate: boolean,
        public readonly foundMemberId: string | null,
    ) {}
}

// 변경 후 usecase
async execute(nickname: string): Promise<NicknameCheckResponseDto> {
    const member = await this.repo.findByNickname(nickname);
    return new NicknameCheckResponseDto(!!member, member?.id ?? null);
}

// 변경 후 route — 추가 쿼리 없음
const result = await usecase.execute(nickname);
if (result.isDuplicate) {
    if (result.foundMemberId === memberId) {
        return NextResponse.json({ message: "사용 가능한 닉네임입니다." }, { status: 200 });
    }
    return NextResponse.json({ message: "이미 사용 중인 닉네임입니다." }, { status: 409 });
}
```

---

## 2. Zod 입력 검증 적용 (🟡 권장)

기존 두 라우트는 `if (!nickname)`, `if (nickname.length > 8)` 수동 가드를 사용한다. `email-check` 라우트와 일치하도록 `validate()` + Zod 스키마로 교체한다.

```ts
const NicknameQuerySchema = z.object({
    nickname: z
        .string()
        .min(1, "닉네임이 누락되었습니다.")
        .max(8, "닉네임은 8자 이하여야 합니다."),
});
const validated = validate(
    NicknameQuerySchema,
    Object.fromEntries(searchParams)
);
if (!validated.success) return validated.response;
```

**변경 파일**:

- `app/api/auth/nickname-check/route.ts`
- `app/api/member/nickname-check/route.ts`

---

## 3. Usecase 레이어 8자 제한 검증 (🟡 권장)

현재 8자 초과 검증이 라우트·UI에만 존재한다. 직접 API를 호출하면 우회 가능하다. Zod 적용(#2)으로 라우트 레벨에서는 처리되지만, usecase도 독립적으로 도메인 규칙을 지켜야 한다.

```ts
async execute(nickname: string): Promise<NicknameCheckResponseDto> {
    if (nickname.length > 8) {
        throw new Error("닉네임은 8자 이하여야 합니다.");
    }
    const member = await this.repo.findByNickname(nickname);
    return new NicknameCheckResponseDto(!!member, member?.id ?? null);
}
```

**변경 파일**:

- `backend/member/application/usecase/NicknameCheckUsecase.ts`

---

## 4. 테스트 파일 추가 (🟡 권장)

`EmailCheckUsecase` 및 `email-check` 라우트 테스트 패턴을 그대로 따른다. `MockMemberRepository`가 이미 `findByNickname`을 지원하므로 추가 설정 불필요.

### 4-1. `NicknameCheckUsecase.test.ts`

| 케이스    | 설명                                                                        |
| --------- | --------------------------------------------------------------------------- |
| 사용 가능 | `findByNickname → null` → `isDuplicate: false`, `foundMemberId: null`       |
| 중복      | `findByNickname → member` → `isDuplicate: true`, `foundMemberId: member.id` |
| 8자 초과  | `execute("123456789")` → Error throw                                        |

**파일**: `backend/member/application/usecase/__tests__/NicknameCheckUsecase.test.ts`

### 4-2. `app/api/auth/nickname-check/__tests__/route.test.ts`

| 케이스                 | 기대 상태 |
| ---------------------- | --------- |
| 사용 가능 닉네임       | 200       |
| 중복 닉네임            | 409       |
| nickname 파라미터 누락 | 400       |
| 8자 초과               | 400       |

패턴: `email-check` route 테스트와 동일 (RateLimiter mock, PrismaMemberRepository mock)

**파일**: `app/api/auth/nickname-check/__tests__/route.test.ts`

### 4-3. `app/api/member/nickname-check/__tests__/route.test.ts`

| 케이스                                    | 기대 상태 |
| ----------------------------------------- | --------- |
| 사용 가능 닉네임                          | 200       |
| 중복 닉네임 (타인)                        | 409       |
| nickname 파라미터 누락                    | 400       |
| 8자 초과                                  | 400       |
| 본인 닉네임 (foundMemberId === sessionId) | 200       |
| 인증 없음                                 | 401       |

추가 mock: `getServerSession` (next-auth)

**파일**: `app/api/member/nickname-check/__tests__/route.test.ts`

---

## 5. StepProfile UI 상태 패턴 통일 (⚪ 선택)

`StepProfile`은 닉네임 상태를 두 개의 state로 관리한다:

- `isNicknameDuplicate: boolean | null`
- `nicknameSuccessMessage: string`

`ProfileInfoTab`은 하나로 통합한다:

- `nicknameMessage: { text: string; isError: boolean } | null`

`ProfileInfoTab` 방식으로 `StepProfile`을 통일한다. 버그는 아니지만 코드베이스 일관성을 위해 반영한다.

**변경 파일**:

- `app/(auth)/components/StepProfile.tsx` — `nicknameSuccessMessage` 제거, `nicknameMessage` 통합

---

## 변경 파일 목록

| 파일                                                                        | 변경 유형 |
| --------------------------------------------------------------------------- | --------- |
| `backend/member/application/usecase/dto/NicknameCheckResponseDto.ts`        | 수정      |
| `backend/member/application/usecase/NicknameCheckUsecase.ts`                | 수정      |
| `app/api/member/nickname-check/route.ts`                                    | 수정      |
| `app/api/auth/nickname-check/route.ts`                                      | 수정      |
| `app/(auth)/components/StepProfile.tsx`                                     | 수정      |
| `backend/member/application/usecase/__tests__/NicknameCheckUsecase.test.ts` | 신규      |
| `app/api/auth/nickname-check/__tests__/route.test.ts`                       | 신규      |
| `app/api/member/nickname-check/__tests__/route.test.ts`                     | 신규      |

# Nickname Check PR Review 반영 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PR #279 리뷰 5개 항목(DB 이중쿼리, Zod 검증, 테스트, usecase 8자 제한, UI 상태 패턴)을 모두 반영한다.

**Architecture:** `NicknameCheckResponseDto`에 `foundMemberId` 필드를 추가해 usecase 단일 쿼리로 본인 닉네임 비교까지 처리. 두 라우트는 Zod + `validate()` 패턴으로 통일. UI는 `nicknameMessage: { text, isError } | null` 단일 상태 패턴으로 통일.

**Tech Stack:** Next.js 15 App Router, Zod 4, Vitest 4, `@/utils/validation` (validate helper), NextAuth.js v4

---

## 변경 파일 목록

| 파일                                                                        | 유형 |
| --------------------------------------------------------------------------- | ---- |
| `backend/member/application/usecase/dto/NicknameCheckResponseDto.ts`        | 수정 |
| `backend/member/application/usecase/NicknameCheckUsecase.ts`                | 수정 |
| `backend/member/application/usecase/__tests__/NicknameCheckUsecase.test.ts` | 신규 |
| `app/api/auth/nickname-check/route.ts`                                      | 수정 |
| `app/api/auth/nickname-check/__tests__/route.test.ts`                       | 신규 |
| `app/api/member/nickname-check/route.ts`                                    | 수정 |
| `app/api/member/nickname-check/__tests__/route.test.ts`                     | 신규 |
| `app/(auth)/components/StepProfile.tsx`                                     | 수정 |

---

## Task 1: NicknameCheckResponseDto + NicknameCheckUsecase 수정 (TDD)

**Files:**

- Modify: `backend/member/application/usecase/dto/NicknameCheckResponseDto.ts`
- Modify: `backend/member/application/usecase/NicknameCheckUsecase.ts`
- Create: `backend/member/application/usecase/__tests__/NicknameCheckUsecase.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

`backend/member/application/usecase/__tests__/NicknameCheckUsecase.test.ts` 생성:

```ts
import { describe, it, expect, vi } from "vitest";
import { NicknameCheckUsecase } from "../NicknameCheckUsecase";
import { MockMemberRepository } from "@/tests/mocks/MockMemberRepository";
import { Member } from "@/prisma/generated";

describe("NicknameCheckUsecase", () => {
    it("사용 가능: findByNickname이 null → isDuplicate false, foundMemberId null", async () => {
        const repo = MockMemberRepository();
        vi.mocked(repo.findByNickname).mockResolvedValue(null);

        const usecase = new NicknameCheckUsecase(repo);
        const result = await usecase.execute("newname");

        expect(result.isDuplicate).toBe(false);
        expect(result.foundMemberId).toBeNull();
    });

    it("중복: findByNickname이 member 반환 → isDuplicate true, foundMemberId 포함", async () => {
        const repo = MockMemberRepository();
        vi.mocked(repo.findByNickname).mockResolvedValue({
            id: "member-1",
            nickname: "taken",
        } as unknown as Member);

        const usecase = new NicknameCheckUsecase(repo);
        const result = await usecase.execute("taken");

        expect(result.isDuplicate).toBe(true);
        expect(result.foundMemberId).toBe("member-1");
    });

    it("8자 초과: execute 호출 시 Error throw", async () => {
        const repo = MockMemberRepository();
        const usecase = new NicknameCheckUsecase(repo);

        await expect(usecase.execute("123456789")).rejects.toThrow(
            "닉네임은 8자 이하여야 합니다."
        );
        expect(repo.findByNickname).not.toHaveBeenCalled();
    });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- NicknameCheckUsecase
```

Expected: FAIL — `foundMemberId` 프로퍼티가 없으므로 타입 에러 또는 assertion 실패

- [ ] **Step 3: DTO 수정**

`backend/member/application/usecase/dto/NicknameCheckResponseDto.ts`:

```ts
export class NicknameCheckResponseDto {
    constructor(
        public readonly isDuplicate: boolean,
        public readonly foundMemberId: string | null
    ) {}
}
```

- [ ] **Step 4: Usecase 수정**

`backend/member/application/usecase/NicknameCheckUsecase.ts`:

```ts
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { NicknameCheckResponseDto } from "./dto/NicknameCheckResponseDto";

export class NicknameCheckUsecase {
    constructor(private repo: MemberRepository) {}

    async execute(nickname: string): Promise<NicknameCheckResponseDto> {
        if (nickname.length > 8) {
            throw new Error("닉네임은 8자 이하여야 합니다.");
        }
        const member = await this.repo.findByNickname(nickname);
        return new NicknameCheckResponseDto(!!member, member?.id ?? null);
    }
}
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

```bash
npm test -- NicknameCheckUsecase
```

Expected: PASS (3 tests)

- [ ] **Step 6: 커밋**

```bash
git add backend/member/application/usecase/dto/NicknameCheckResponseDto.ts \
        backend/member/application/usecase/NicknameCheckUsecase.ts \
        backend/member/application/usecase/__tests__/NicknameCheckUsecase.test.ts
git commit -m "[feat/#271] NicknameCheckResponseDto foundMemberId 추가, usecase 8자 제한 추가"
```

---

## Task 2: /api/auth/nickname-check route 수정 (TDD)

**Files:**

- Modify: `app/api/auth/nickname-check/route.ts`
- Create: `app/api/auth/nickname-check/__tests__/route.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

`app/api/auth/nickname-check/__tests__/route.test.ts` 생성:

```ts
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/redis", () => ({
    default: {},
}));

vi.mock("@/lib/RateLimiter", () => ({
    RateLimiter: vi.fn(function (this: Record<string, unknown>) {
        this.check = vi.fn().mockResolvedValue({
            allowed: true,
            remaining: 9,
            retryAfterMs: 0,
        });
    }),
    getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
    rateLimitResponse: vi.fn(),
}));

const mockFindByNickname = vi.fn().mockResolvedValue(null);

vi.mock(
    "@/backend/member/infra/repositories/prisma/PrismaMemberRepository",
    () => ({
        PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findByNickname = mockFindByNickname;
        }),
    })
);

import { GET } from "../route";

describe("GET /api/auth/nickname-check", () => {
    it("200: 사용 가능한 닉네임", async () => {
        mockFindByNickname.mockResolvedValueOnce(null);

        const req = new Request(
            "http://localhost/api/auth/nickname-check?nickname=hello"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.message).toContain("사용 가능");
    });

    it("409: 이미 사용 중인 닉네임", async () => {
        mockFindByNickname.mockResolvedValueOnce({
            id: "member-1",
            nickname: "hello",
        });

        const req = new Request(
            "http://localhost/api/auth/nickname-check?nickname=hello"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(409);
        const body = await response.json();
        expect(body.message).toContain("이미 사용");
    });

    it("400: nickname 파라미터 누락", async () => {
        const req = new Request(
            "http://localhost/api/auth/nickname-check"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(400);
    });

    it("400: 8자 초과", async () => {
        const req = new Request(
            "http://localhost/api/auth/nickname-check?nickname=123456789"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(400);
    });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- "auth/nickname-check"
```

Expected: 일부 FAIL (Zod 미적용으로 400 케이스 동작 다를 수 있음)

- [ ] **Step 3: route 수정 (Zod 적용)**

`app/api/auth/nickname-check/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { NicknameCheckUsecase } from "@/backend/member/application/usecase/NicknameCheckUsecase";
import { RateLimiter, getClientIp, rateLimitResponse } from "@/lib/RateLimiter";
import { validate } from "@/utils/validation";
import { z } from "zod";

const nicknameCheckLimiter = new RateLimiter("nickname-check", 60_000, 10);
const NicknameQuerySchema = z.object({
    nickname: z
        .string()
        .min(1, "닉네임이 누락되었습니다.")
        .max(8, "닉네임은 8자 이하여야 합니다."),
});

export async function GET(req: NextRequest) {
    const ip = getClientIp(req);
    const rateLimit = await nicknameCheckLimiter.check(ip);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterMs);

    const { searchParams } = new URL(req.url);
    const validated = validate(
        NicknameQuerySchema,
        Object.fromEntries(searchParams)
    );
    if (!validated.success) return validated.response;

    const repo = new PrismaMemberRepository();
    const usecase = new NicknameCheckUsecase(repo);

    try {
        const result = await usecase.execute(validated.data.nickname);

        if (result.isDuplicate) {
            return NextResponse.json(
                { message: "이미 사용 중인 닉네임입니다." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "사용 가능한 닉네임입니다." },
            { status: 200 }
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : "서버 오류 발생";
        return NextResponse.json({ message }, { status: 500 });
    }
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test -- "auth/nickname-check"
```

Expected: PASS (4 tests)

- [ ] **Step 5: 커밋**

```bash
git add app/api/auth/nickname-check/route.ts \
        "app/api/auth/nickname-check/__tests__/route.test.ts"
git commit -m "[feat/#271] /api/auth/nickname-check Zod 검증 적용 및 테스트 추가"
```

---

## Task 3: /api/member/nickname-check route 수정 (TDD)

**Files:**

- Modify: `app/api/member/nickname-check/route.ts`
- Create: `app/api/member/nickname-check/__tests__/route.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

`app/api/member/nickname-check/__tests__/route.test.ts` 생성:

```ts
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/redis", () => ({
    default: {},
}));

vi.mock("@/lib/RateLimiter", () => ({
    RateLimiter: vi.fn(function (this: Record<string, unknown>) {
        this.check = vi.fn().mockResolvedValue({
            allowed: true,
            remaining: 9,
            retryAfterMs: 0,
        });
    }),
    getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
    rateLimitResponse: vi.fn(),
}));

const mockFindByNickname = vi.fn().mockResolvedValue(null);

vi.mock(
    "@/backend/member/infra/repositories/prisma/PrismaMemberRepository",
    () => ({
        PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findByNickname = mockFindByNickname;
        }),
    })
);

vi.mock("next-auth", () => ({
    getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth/authOptions", () => ({
    authOptions: {},
}));

import { getServerSession } from "next-auth";
import { GET } from "../route";

describe("GET /api/member/nickname-check", () => {
    it("401: 인증 없음", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce(null);

        const req = new Request(
            "http://localhost/api/member/nickname-check?nickname=hello"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(401);
    });

    it("200: 사용 가능한 닉네임", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { id: "session-user-1" },
        } as never);
        mockFindByNickname.mockResolvedValueOnce(null);

        const req = new Request(
            "http://localhost/api/member/nickname-check?nickname=hello"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.message).toContain("사용 가능");
    });

    it("409: 타인이 사용 중인 닉네임", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { id: "session-user-1" },
        } as never);
        mockFindByNickname.mockResolvedValueOnce({
            id: "other-user",
            nickname: "hello",
        });

        const req = new Request(
            "http://localhost/api/member/nickname-check?nickname=hello"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(409);
        const body = await response.json();
        expect(body.message).toContain("이미 사용");
    });

    it("200: 본인 닉네임 (foundMemberId === sessionId)", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { id: "session-user-1" },
        } as never);
        mockFindByNickname.mockResolvedValueOnce({
            id: "session-user-1",
            nickname: "myname",
        });

        const req = new Request(
            "http://localhost/api/member/nickname-check?nickname=myname"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.message).toContain("사용 가능");
    });

    it("400: nickname 파라미터 누락", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { id: "session-user-1" },
        } as never);

        const req = new Request(
            "http://localhost/api/member/nickname-check"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(400);
    });

    it("400: 8자 초과", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { id: "session-user-1" },
        } as never);

        const req = new Request(
            "http://localhost/api/member/nickname-check?nickname=123456789"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(400);
    });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- "member/nickname-check"
```

Expected: FAIL — 이중 쿼리 로직 및 Zod 미적용으로 여러 케이스 실패

- [ ] **Step 3: route 수정 (이중쿼리 제거 + Zod 적용)**

`app/api/member/nickname-check/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { NicknameCheckUsecase } from "@/backend/member/application/usecase/NicknameCheckUsecase";
import { RateLimiter, getClientIp, rateLimitResponse } from "@/lib/RateLimiter";
import { validate } from "@/utils/validation";
import { z } from "zod";

const nicknameCheckLimiter = new RateLimiter(
    "member-nickname-check",
    60_000,
    10
);
const NicknameQuerySchema = z.object({
    nickname: z
        .string()
        .min(1, "닉네임이 누락되었습니다.")
        .max(8, "닉네임은 8자 이하여야 합니다."),
});

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const memberId = session?.user?.id;
    if (!memberId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    const rateLimit = await nicknameCheckLimiter.check(ip);
    if (!rateLimit.allowed) {
        return rateLimitResponse(rateLimit.retryAfterMs);
    }

    const { searchParams } = new URL(req.url);
    const validated = validate(
        NicknameQuerySchema,
        Object.fromEntries(searchParams)
    );
    if (!validated.success) return validated.response;

    const repo = new PrismaMemberRepository();
    const usecase = new NicknameCheckUsecase(repo);

    try {
        const result = await usecase.execute(validated.data.nickname);

        if (result.isDuplicate) {
            if (result.foundMemberId === memberId) {
                return NextResponse.json(
                    { message: "사용 가능한 닉네임입니다." },
                    { status: 200 }
                );
            }
            return NextResponse.json(
                { message: "이미 사용 중인 닉네임입니다." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "사용 가능한 닉네임입니다." },
            { status: 200 }
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : "서버 오류 발생";
        return NextResponse.json({ message }, { status: 500 });
    }
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test -- "member/nickname-check"
```

Expected: PASS (6 tests)

- [ ] **Step 5: 전체 테스트 실행**

```bash
npm test
```

Expected: 기존 테스트 포함 모두 PASS

- [ ] **Step 6: 커밋**

```bash
git add app/api/member/nickname-check/route.ts \
        "app/api/member/nickname-check/__tests__/route.test.ts"
git commit -m "[feat/#271] /api/member/nickname-check DB 이중쿼리 제거, Zod 검증 적용, 테스트 추가"
```

---

## Task 4: StepProfile UI 상태 패턴 통일

**Files:**

- Modify: `app/(auth)/components/StepProfile.tsx`

`ProfileInfoTab`의 `nicknameMessage: { text: string; isError: boolean } | null` 단일 상태 패턴으로 `StepProfile`의 `isNicknameDuplicate` + `nicknameSuccessMessage` 두 상태를 통합한다.

- [ ] **Step 1: StepProfile.tsx 수정**

`app/(auth)/components/StepProfile.tsx`의 닉네임 관련 상태 및 로직을 아래와 같이 교체:

**변경 전 상태 선언:**

```ts
const [isNicknameDuplicate, setIsNicknameDuplicate] = useState<boolean | null>(
    null
);
const [nicknameSuccessMessage, setNicknameSuccessMessage] = useState("");
```

**변경 후 상태 선언:**

```ts
const [isNicknameDuplicate, setIsNicknameDuplicate] = useState<boolean | null>(
    null
);
const [nicknameMessage, setNicknameMessage] = useState<{
    text: string;
    isError: boolean;
} | null>(null);
```

**변경 전 `checkNicknameDuplicate` 함수:**

```ts
const checkNicknameDuplicate = async () => {
    setNicknameSuccessMessage("");
    setFieldErrors((prev) => ({ ...prev, nickname: "" }));

    if (!nickname) {
        setFieldErrors((prev) => ({
            ...prev,
            nickname: "닉네임을 입력해주세요.",
        }));
        setIsNicknameDuplicate(null);
        return;
    }

    if (nickname.length > 8) {
        setFieldErrors((prev) => ({
            ...prev,
            nickname: "닉네임은 8자 이하여야 합니다.",
        }));
        setIsNicknameDuplicate(null);
        return;
    }

    try {
        const res = await fetch(
            `/api/auth/nickname-check?nickname=${encodeURIComponent(nickname)}`
        );
        const data = await res.json();

        if (res.status === 409) {
            setFieldErrors((prev) => ({
                ...prev,
                nickname: data.message,
            }));
            setIsNicknameDuplicate(true);
            return;
        }

        if (!res.ok) {
            throw new Error(data.message || "중복 확인 실패");
        }

        setIsNicknameDuplicate(false);
        setNicknameSuccessMessage(data.message);
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "오류가 발생했습니다.";
        setFieldErrors((prev) => ({ ...prev, nickname: message }));
        setIsNicknameDuplicate(null);
    }
};
```

**변경 후 `checkNicknameDuplicate` 함수:**

```ts
const checkNicknameDuplicate = async () => {
    setNicknameMessage(null);

    if (!nickname) {
        setNicknameMessage({ text: "닉네임을 입력해주세요.", isError: true });
        setIsNicknameDuplicate(null);
        return;
    }

    if (nickname.length > 8) {
        setNicknameMessage({
            text: "닉네임은 8자 이하여야 합니다.",
            isError: true,
        });
        setIsNicknameDuplicate(null);
        return;
    }

    try {
        const res = await fetch(
            `/api/auth/nickname-check?nickname=${encodeURIComponent(nickname)}`
        );
        const data = await res.json();

        if (res.status === 409) {
            setNicknameMessage({ text: data.message, isError: true });
            setIsNicknameDuplicate(true);
            return;
        }

        if (!res.ok) {
            throw new Error(data.message || "중복 확인 실패");
        }

        setIsNicknameDuplicate(false);
        setNicknameMessage({ text: data.message, isError: false });
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "오류가 발생했습니다.";
        setNicknameMessage({ text: message, isError: true });
        setIsNicknameDuplicate(null);
    }
};
```

**onChange에서 상태 초기화 변경:**

```ts
// 변경 전
onChange={(e) => {
    setNickname(e.target.value);
    setIsNicknameDuplicate(null);
    setNicknameSuccessMessage("");
}}

// 변경 후
onChange={(e) => {
    setNickname(e.target.value);
    setIsNicknameDuplicate(null);
    setNicknameMessage(null);
}}
```

**닉네임 메시지 렌더링 변경 (JSX 부분):**

```tsx
{
    /* 변경 전 */
}
{
    fieldErrors.nickname && (
        <p className="mt-1 text-caption text-state-error">
            {fieldErrors.nickname}
        </p>
    );
}
{
    !fieldErrors.nickname && nicknameSuccessMessage && (
        <p className="text-state-success mt-1 text-caption">
            {nicknameSuccessMessage}
        </p>
    );
}

{
    /* 변경 후 */
}
{
    nicknameMessage && (
        <p
            className={`mt-1 text-caption ${
                nicknameMessage.isError
                    ? "text-state-error"
                    : "text-state-success"
            }`}
        >
            {nicknameMessage.text}
        </p>
    );
}
```

`handleNext` 내부의 닉네임 에러도 `nicknameMessage` 기반으로 동작은 그대로이므로 `fieldErrors.nickname`은 다른 필드(이메일, 비밀번호 등)에서 계속 사용된다. `isNicknameDuplicate` 상태는 그대로 유지한다.

- [ ] **Step 2: lint 확인**

```bash
npm run lint
```

Expected: No errors

- [ ] **Step 3: 커밋**

```bash
git add "app/(auth)/components/StepProfile.tsx"
git commit -m "[feat/#271] StepProfile 닉네임 상태 ProfileInfoTab 패턴으로 통일"
```

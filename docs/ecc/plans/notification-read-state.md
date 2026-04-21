# Notification Read State Plan (Revised)

알림 뱃지를 **미읽음 건수**로 전환하고, 알림 항목 클릭 시 읽음 처리 후 해당 페이지로 이동하는 계획.

**개정 이유**: ECC 리뷰 반영 (B-1·H-2·M-1~M-5·L-1 수정) + isRead 동작 방식 변경
- 구 동작: 모달 열기 → 전체 일괄 읽음 처리
- 신 동작: 알림 항목 클릭 → 개별 읽음 처리 → 해당 페이지 이동 / 'x' 버튼 → 삭제

**전제 조건 (B-1 인지)**: `NotificationBellButton.tsx` 및 5개 트리거 훅(P0/P1)이 먼저 병합되어야 함.
이 계획은 P2 기능이므로 P0/P1 작업이 완료·병합된 이후에 실행할 것.

---

## Task 1 — DB 스키마: `isRead` 컬럼 추가

**파일**: `prisma/schema.prisma`

```prisma
model NotificationRecord {
  id          Int              @id @default(autoincrement())
  memberId    String           @map("member_id")
  typeId      Int              @map("type_id")
  description String
  isRead      Boolean          @default(false) @map("is_read")
  createdAt   DateTime         @default(now()) @map("created_at")
  member      Member           @relation(fields: [memberId], references: [id])
  type        NotificationType @relation(fields: [typeId], references: [id])

  @@map("notification_records")
}
```

- `isRead`: 읽음 여부 (기본값 `false`)

마이그레이션 실행:

```bash
npx prisma migrate dev --name add_notification_is_read
npx prisma generate
```

---

## Task 2 — Repository: `isRead` 필터 지원

### 2a. `NotificationRecordFilter`에 `isRead` 추가

**파일**: `backend/notification-record/domain/repositories/filters/NotificationRecordFilter.ts`

```typescript
export class NotificationRecordFilter {
    constructor(
        public memberId: string | null,
        public typeId: number | null,
        public createdAt: Date[] | null,
        public isRead: boolean | null,      // ← 추가 (4번째 위치)
        public sortField: string = "createdAt",
        public ascending: boolean = false,
        public offset: number = 0,
        public limit: number = 5
    ) {}
}
```

**콜 사이트 전수 조사 (M-3 수정)**: `grep -r "new NotificationRecordFilter"` 결과 — 프로덕션 코드 콜 사이트 1개:

| 파일 | 현재 인수 | 변경 후 인수 |
|------|----------|-------------|
| `backend/notification-record/application/usecase/GetNotificationRecordUsecase.ts:32` | `(memberId, null, null, "createdAt", false, offset, limit)` | `(memberId, null, null, null, "createdAt", false, offset, limit)` |

### 2b. `NotificationRecordRepository` 인터페이스 — 변경 없음

**파일**: `backend/notification-record/domain/repositories/NotificationRecordRepository.ts`

`markAsRead`를 별도 메서드로 추가하지 않음.
컨벤션(`BACKEND_ARCHITECTURE.md`): "partial field updates happen in usecase before calling `update()`".
읽음 처리는 유스케이스에서 `record.isRead = true` 후 기존 `update(record)` 호출로 처리한다 (Task 5 참조).

기존 인터페이스에서 추가·변경 없음:

```typescript
export interface NotificationRecordRepository {
    count(filter: NotificationRecordFilter): Promise<number>;
    findAll(filter: NotificationRecordFilter): Promise<NotificationRecord[]>;
    findById(id: number): Promise<NotificationRecord | null>;
    save(record: CreateNotificationRecordInput): Promise<NotificationRecord>;
    update(record: NotificationRecord): Promise<NotificationRecord>;
    deleteById(id: number): Promise<void>;
}
```

### 2c. `PrismaNotificationRecordRepository` 구현 업데이트

**파일**: `backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository.ts`

`getWhereClause`에 `isRead` 조건 추가만 진행 (`markAsRead` 메서드 추가 없음):

```typescript
private getWhereClause(filter: NotificationRecordFilter): Prisma.NotificationRecordWhereInput {
    const { memberId, typeId, createdAt, isRead } = filter;
    return {
        ...(memberId && { memberId }),
        ...(typeId && { typeId }),
        ...(isRead !== null && isRead !== undefined && { isRead }),
        ...(createdAt && createdAt.length > 0 && {
            OR: createdAt.map((date) => ({
                createdAt: {
                    gte: new Date(date.setHours(0, 0, 0, 0)),
                    lt: new Date(date.setHours(24, 0, 0, 0)),
                },
            })),
        }),
    };
}
```

---

## Task 3 — DTO: `isRead` 필드 추가

### 3a. `NotificationRecordDto`에 필드 추가

**파일**: `backend/notification-record/application/usecase/dto/NotificationRecordDto.ts`

```typescript
export class NotificationRecordDto {
    constructor(
        public id: number,
        public memberId: string,
        public typeId: number,
        public description: string,
        public isRead: boolean,      // ← 추가
        public createdAt: Date,
        public typeName: string,
        public typeImageUrl: string
    ) {}
}
```

### 3b. `GetNotificationRecordUsecase` 업데이트

**파일**: `backend/notification-record/application/usecase/GetNotificationRecordUsecase.ts`

`filter` 생성 (line 32) — `isRead: null` 삽입:

```typescript
// 변경 전
const filter = new NotificationRecordFilter(
    memberId,
    null,
    null,
    "createdAt",
    false,
    offset,
    limit
);

// 변경 후
const filter = new NotificationRecordFilter(
    memberId,
    null,
    null,
    null,           // isRead: null — 전체 조회 (L-1: totalCount는 전체 건수 의미 유지)
    "createdAt",
    false,
    offset,
    limit
);
```

> **L-1 주석**: `totalCount`는 이 변경 이후에도 "전체 알림 건수"를 의미함.
> `NotificationModal` 페이지 계산이 totalCount에 의존하므로 `isRead: null`로 전체 조회 유지.
> 미읽음 전용 카운트는 별도 Task 4 유스케이스 사용.

`recordDto` 매핑에 `isRead` 추가:

```typescript
return {
    id: record.id,
    memberId: record.memberId,
    typeId: record.typeId,
    description: record.description,
    isRead: record.isRead,           // ← 추가
    createdAt: record.createdAt,
    typeName: type?.name || "기타",
    typeImageUrl: type?.imageUrl || "@/public/icons/defaultTypeImage.ico",
};
```

---

## Task 4 — 유스케이스: `GetUnreadNotificationCountUsecase` 신규 생성

**신규 파일**: `backend/notification-record/application/usecase/GetUnreadNotificationCountUsecase.ts`

```typescript
import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";
import { NotificationRecordFilter } from "@/backend/notification-record/domain/repositories/filters/NotificationRecordFilter";

export class GetUnreadNotificationCountUsecase {
    constructor(
        private readonly notificationRecordRepository: NotificationRecordRepository
    ) {}

    async execute(memberId: string): Promise<number> {
        const filter = new NotificationRecordFilter(
            memberId,
            null,
            null,
            false   // isRead: false → 미읽음만 카운트
        );
        return this.notificationRecordRepository.count(filter);
    }
}
```

---

## Task 5 — 유스케이스: `MarkNotificationReadUsecase` 신규 생성

**신규 파일**: `backend/notification-record/application/usecase/MarkNotificationReadUsecase.ts`

개별 알림을 읽음 처리. 소유권 검증은 API 라우트에서 수행 (Task 6b).

```typescript
import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";

export class MarkNotificationReadUsecase {
    constructor(
        private readonly notificationRecordRepository: NotificationRecordRepository
    ) {}

    async execute(id: number): Promise<void> {
        const record = await this.notificationRecordRepository.findById(id);
        if (!record) throw new Error("알림을 찾을 수 없습니다.");
        await this.notificationRecordRepository.update({ ...record, isRead: true });
    }
}
```

---

## Task 6 — API 라우트: 미읽음 카운트 + 개별 읽음 처리

### 6a. `GET /api/member/notification-records/count`

**신규 파일**: `app/api/member/notification-records/count/route.ts`

```typescript
import { GetUnreadNotificationCountUsecase } from "@/backend/notification-record/application/usecase/GetUnreadNotificationCountUsecase";
import { PrismaNotificationRecordRepository } from "@/backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { errorResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";
import logger from "@/lib/Logger";

export async function GET() {
    const memberId = await getAuthUserId();
    const log = logger.child({
        route: "/api/member/notification-records/count",
        method: "GET",
    });

    if (!memberId) return errorResponse("알림 조회 권한이 없습니다.", 401);

    try {
        const repository = new PrismaNotificationRecordRepository();
        const usecase = new GetUnreadNotificationCountUsecase(repository);
        const count = await usecase.execute(memberId);

        return NextResponse.json({ count });
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "미읽음 알림 수 조회 실패");
        const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

### 6b. `PATCH /api/member/notification-records/[id]` — 개별 읽음 처리

**신규 파일**: `app/api/member/notification-records/[id]/route.ts`

> **M-1 해소**: 새 파일이므로 기존 GET 핸들러 스타일 충돌 없음. `errorResponse` 사용.

```typescript
import { MarkNotificationReadUsecase } from "@/backend/notification-record/application/usecase/MarkNotificationReadUsecase";
import { PrismaNotificationRecordRepository } from "@/backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { errorResponse } from "@/utils/ApiResponse";
import { validate, IdSchema } from "@/utils/Validation";
import { NextResponse } from "next/server";
import logger from "@/lib/Logger";

export async function PATCH(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const memberId = await getAuthUserId();
    const log = logger.child({
        route: "/api/member/notification-records/[id]",
        method: "PATCH",
    });

    if (!memberId) return errorResponse("알림 읽음 처리 권한이 없습니다.", 401);

    try {
        const { id: idStr } = await params;
        const v = validate(IdSchema, idStr);
        if (!v.success) return v.response;

        const repository = new PrismaNotificationRecordRepository();
        const record = await repository.findById(v.data);
        if (!record) return errorResponse("알림을 찾을 수 없습니다.", 404);
        if (record.memberId !== memberId) return errorResponse("권한이 없습니다.", 403);

        const usecase = new MarkNotificationReadUsecase(repository);
        await usecase.execute(v.data);

        return NextResponse.json({ message: "읽음 처리 완료" });
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "알림 읽음 처리 실패");
        const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

---

## Task 7 — Frontend: `queryKeys` + `useNotificationCount` 훅

### 7a. `queryKeys`에 `notificationCount` 추가

**수정 파일**: `lib/QueryKeys.ts`

```typescript
/** Unread notification count for bell badge. */
notificationCount: () => ["notificationCount"] as const,
```

### 7b. `useNotificationCount` 훅 신규 생성

**신규 파일**: `hooks/useNotificationCount.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys } from "@/lib/QueryKeys";

export function useNotificationCount() {
    return useQuery<{ count: number }>({
        queryKey: queryKeys.notificationCount(),
        queryFn: () => fetcher<{ count: number }>("/api/member/notification-records/count"),
        refetchOnWindowFocus: false,
    });
}
```

### 7c. `NotificationBellButton` 업데이트

**수정 파일**: `app/components/NotificationBellButton.tsx`

- `useNotifications(1)` 제거 → `useNotificationCount()` 사용

```typescript
import { useNotificationCount } from "@/hooks/useNotificationCount";

export default function NotificationBellButton({ size = 24, onOpen }: Props) {
    const { data } = useNotificationCount();
    const totalCount = data?.count ?? 0;
    // 나머지 동일
}
```

---

## Task 8 — Frontend: 알림 클릭 시 읽음 처리 + 페이지 이동

**수정 파일**: `app/(base)/components/NotificationRecordItem.tsx`

알림 항목 클릭 시:
1. `PATCH /api/member/notification-records/[id]` 호출 → 읽음 처리
2. `notificationCount` 쿼리 무효화
3. 이동 대상 URL은 호출부(소스)에서 직접 결정

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/QueryKeys";

type NotificationRecordItemProps = {
    record: NotificationRecordDto;
    href: string;
};

export default function NotificationRecordItem({ record, href }: NotificationRecordItemProps) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { mutate: markRead } = useMutation({
        mutationFn: () =>
            fetch(`/api/member/notification-records/${record.id}`, { method: "PATCH" }),
        onSuccess: () => {
            // H-2 수정: 접두사 무효화로 전체 페이지 캐시 갱신
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
            queryClient.invalidateQueries({ queryKey: queryKeys.notificationCount() });
            router.push(href);
        },
    });

    const handleClick = () => {
        if (!record.isRead) {
            markRead();
        } else {
            router.push(href);
        }
    };

    // 기존 삭제('x' 버튼) 로직 유지
    // ...
    return (
        <div onClick={handleClick} style={{ opacity: record.isRead ? 0.6 : 1 }}>
            {/* 기존 JSX */}
        </div>
    );
}
```

> **H-2 수정**: 삭제 시 `queryKeys.notifications(1)` 단일 페이지 무효화 → `queryKeys.notifications()` 접두사 무효화로 변경.
> 모든 페이지 캐시가 동시에 갱신됨.

---

## Task 9 — 삭제 시 카운트 무효화 (기존 Task 9 + H-2 수정)

**수정 파일**: `app/(base)/components/NotificationRecordItem.tsx`

기존 삭제 `onSuccess`에서:

```typescript
// 변경 전
onSuccess: () => {
    queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(1),  // page-1-only → 버그
    });
},

// 변경 후 (H-2 수정)
onSuccess: () => {
    queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(),   // 접두사 무효화 → 전체 페이지
    });
    queryClient.invalidateQueries({
        queryKey: queryKeys.notificationCount(),
    });
},
```

---

## Task 10 — 테스트

### 10a. Mock 파일 신규 생성 (M-5 수정)

**신규 파일**: `tests/mocks/createMockNotificationRecordRepository.ts`

프로젝트 컨벤션(`createMockArenaRepository.ts` 등) 따름:

```typescript
import { vi } from "vitest";
import type { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";

export function createMockNotificationRecordRepository(): NotificationRecordRepository {
    return {
        count: vi.fn(),
        findAll: vi.fn(),
        findById: vi.fn(),
        save: vi.fn(),
        update: vi.fn(),
        deleteById: vi.fn(),
    };
}
```

### 10b. `GetUnreadNotificationCountUsecase.test.ts`

**신규 파일**: `backend/notification-record/application/usecase/__tests__/GetUnreadNotificationCountUsecase.test.ts`

Mock: `createMockNotificationRecordRepository()` 사용.

케이스:
1. 미읽음 알림 3건 존재 시 `3` 반환
2. 미읽음 알림 0건 시 `0` 반환
3. `count()` 호출 시 filter의 `isRead`가 `false`임을 확인

### 10c. `MarkNotificationReadUsecase.test.ts`

**신규 파일**: `backend/notification-record/application/usecase/__tests__/MarkNotificationReadUsecase.test.ts`

케이스:
1. 레코드 존재 시 `update({ ...record, isRead: true })` 1회 호출 확인
2. 알림 없음(`findById` → null) → Error throw 확인

### 10d. `NotificationBellButton.test.tsx` 업데이트

**수정 파일**: `app/components/__tests__/NotificationBellButton.test.tsx`

- `vi.mock("@/hooks/useNotifications", ...)` → `vi.mock("@/hooks/useNotificationCount", ...)`
- 기존 3케이스(뱃지 숨김·표시·99+) 유지, mock 모듈명만 변경

---

## 실행 순서

```
Task 1   DB 마이그레이션 (isRead 컬럼)                       — 선행 필수
Task 2   Repository 인터페이스 + Filter + Prisma 구현        — Task 1 이후
Task 3   DTO + GetNotificationRecordUsecase 업데이트         — Task 2 이후
Task 4   GetUnreadNotificationCountUsecase 신규              — Task 2 이후
Task 5   MarkNotificationReadUsecase 신규                    — Task 2 이후
Task 6   API 라우트 (count + PATCH [id])                    — Task 4, 5 이후
Task 7   queryKeys + useNotificationCount 훅                 — Task 6 이후
Task 8   NotificationRecordItem 클릭 핸들러                  — Task 7 이후
Task 9   NotificationRecordItem 삭제 무효화 수정              — Task 7 이후
Task 10  Mock 파일 + 단위 테스트                             — Task 4, 5 이후
```

---

## 신규/수정 파일 요약

**신규 (7개)**
- `prisma/migrations/<timestamp>_add_notification_is_read/migration.sql`
- `app/api/member/notification-records/count/route.ts`
- `app/api/member/notification-records/[id]/route.ts`
- `backend/notification-record/application/usecase/GetUnreadNotificationCountUsecase.ts`
- `backend/notification-record/application/usecase/MarkNotificationReadUsecase.ts`
- `hooks/useNotificationCount.ts`
- `tests/mocks/createMockNotificationRecordRepository.ts`

**수정 (9개)**
- `prisma/schema.prisma`
- `backend/notification-record/domain/repositories/filters/NotificationRecordFilter.ts`
- `backend/notification-record/domain/repositories/NotificationRecordRepository.ts`
- `backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository.ts`
- `backend/notification-record/application/usecase/dto/NotificationRecordDto.ts`
- `backend/notification-record/application/usecase/GetNotificationRecordUsecase.ts`
- `lib/QueryKeys.ts`
- `app/components/NotificationBellButton.tsx`
- `app/(base)/components/NotificationRecordItem.tsx`

**테스트 신규/수정 (3개)**
- `tests/mocks/createMockNotificationRecordRepository.ts` (Task 10a)
- `backend/notification-record/application/usecase/__tests__/GetUnreadNotificationCountUsecase.test.ts`
- `backend/notification-record/application/usecase/__tests__/MarkNotificationReadUsecase.test.ts`
- `app/components/__tests__/NotificationBellButton.test.tsx`

---

## 리뷰 반영 체크리스트

| 항목 | 상태 | 조치 |
|------|------|------|
| B-1 전제 조건 | ⚠️ 인지 | 계획 상단에 P0/P1 의존성 명시 |
| H-1 useEffect deps | ✅ 해소 | 모달 일괄 읽음(Task 8 구)을 제거 — 해당 없음 |
| H-2 page-1-only 무효화 | ✅ 수정 | `queryKeys.notifications()` 접두사 무효화로 변경 |
| M-1 errorResponse 스타일 불일치 | ✅ 해소 | PATCH를 새 파일(`[id]/route.ts`)로 분리 — 충돌 없음 |
| M-2 errorResponse import 누락 | ✅ 수정 | 6b 스니펫에 import 명시 |
| M-3 Filter 콜 사이트 미감사 | ✅ 수정 | 프로덕션 1개 (`GetNotificationRecordUsecase.ts:32`) 명시 |
| M-4 Usecase import 누락 | ✅ 수정 | 6b 스니펫에 import 명시 |
| M-5 mock 파일 컨벤션 미준수 | ✅ 수정 | Task 10a에 `createMockNotificationRecordRepository.ts` 추가 |
| L-1 totalCount 시맨틱 미문서화 | ✅ 수정 | Task 3b에 주석 추가 |

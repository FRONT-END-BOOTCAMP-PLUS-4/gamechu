# PR Review: feat/#308 — 알림 읽음 상태 관리 및 P0/P1 알림 트리거

**Reviewed**: 2026-04-25 (updated)
**Branch**: feat/#308 → dev
**Decision**: REQUEST CHANGES

## Summary

전반적으로 구조가 깔끔하고 Clean Architecture 패턴을 잘 따르고 있습니다. 비핵심 경로 분리(알림 실패 시 메인 흐름 불중단)도 적절합니다. 다만 `fetch()` 응답 오류 미처리 버그(HIGH)는 머지 전 반드시 수정이 필요합니다.

---

## Findings

### CRITICAL
없음.

---

### HIGH

#### H1. `NotificationRecordItem.tsx` — `fetch()` 응답 오류 미처리
**위치**: `app/(base)/components/NotificationRecordItem.tsx:32-52`

`mutationFn`이 raw `fetch()` Promise를 반환합니다. TanStack Query는 Promise가 reject될 때만 에러로 처리하는데, `fetch()`는 4xx/5xx에서도 resolve됩니다. 따라서 PATCH/DELETE가 403 또는 500을 반환해도 `onSuccess`가 실행되어 캐시가 무효화되고 UI가 성공한 것처럼 동작합니다.

```ts
// 현재 (버그)
mutationFn: () =>
    fetch(`/api/member/notification-records/${notificationRecordDto.id}`, {
        method: "PATCH",
    }),

// 수정 후
mutationFn: async () => {
    const res = await fetch(`/api/member/notification-records/${notificationRecordDto.id}`, {
        method: "PATCH",
    });
    if (!res.ok) throw new Error((await res.json()).message ?? "요청 실패");
},
```

DELETE `mutationFn`도 동일하게 수정 필요.

---

---

### MEDIUM

#### M0. `PrismaNotificationRecordRepository.update()` — 전체 레코드를 `data`에 전달
**위치**: `backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository.ts:89-96`

`data: record`로 `id`, `memberId`, `typeId`, `createdAt` 등 변경 불필요한 필드를 모두 Prisma `data`에 넘깁니다. 현재 `MarkNotificationReadUsecase`는 `{ ...record, isRead: true }`를 전달하므로 나머지 필드는 원래 값과 동일해 데이터 손상은 없습니다. 다만 Prisma가 생성하는 SQL에는 모든 컬럼이 SET 절에 포함되어 불필요한 쓰기가 발생하고, 훗날 `deletedAt` 등 새 필드가 추가될 때 이 패턴이 예상치 못한 값을 덮어쓸 수 있습니다.

```ts
// 수정 후: update input 타입을 명시적으로 제한
async update(record: NotificationRecord): Promise<NotificationRecord> {
    const { id, memberId, typeId, description, isRead, createdAt } = record;
    const newData = await this.prisma.notificationRecord.update({
        where: { id },
        data: { memberId, typeId, description, isRead, createdAt },
    });
    return newData;
}
```

또는 usecase에서 `isRead`만 변경하는 게 목적이라면 레포지토리에 `updateIsRead(id: number, isRead: boolean)` 메서드를 추가하는 것이 더 명확합니다.

#### M1. N+1 쿼리 — `GetNotificationRecordUsecase`
**위치**: `backend/notification-record/application/usecase/GetNotificationRecordUsecase.ts:45-64`

페이지당 최대 5개 레코드에 대해 `notificationTypeRepository.findById()`를 개별 호출합니다. pageSize=5이므로 최대 5번의 추가 DB 쿼리가 발생합니다.

`NotificationTypeRepository.findAll()`이 이미 존재하므로 이를 활용해 한 번에 조회하고 Map으로 룩업합니다:

```ts
// 수정 후 (1 쿼리)
const allTypes = await this.notificationTypeRepository.findAll();
const typeMap = new Map(allTypes.map((t) => [t.id, t]));

const recordDto: NotificationRecordDto[] = records.map((record) => {
    const type = typeMap.get(record.typeId);
    return new NotificationRecordDto(
        record.id, record.memberId, record.typeId,
        record.description, record.isRead, record.createdAt,
        type?.name ?? "기타",
        type?.imageUrl ?? "@/public/icons/defaultTypeImage.ico"
    );
});
```

`async/await`도 제거되어 코드가 단순해집니다.

---

#### M2. 이중 DB 조회 — PATCH 핸들러와 `MarkNotificationReadUsecase`
**위치**: `app/api/member/notification-records/[id]/route.ts:34` + `MarkNotificationReadUsecase.ts:9`

라우트 핸들러에서 `findById`로 소유권 확인 후, `usecase.execute(id)`에서 다시 `findById`를 호출합니다. 동일 레코드에 대한 불필요한 DB 라운드트립입니다.

권장 수정: 이미 조회한 레코드를 usecase에 직접 전달하도록 인터페이스 변경:
```ts
async execute(record: NotificationRecord): Promise<void>
```

---

#### M3. 알림 typeId 매직 넘버
**위치**: `lib/TierNotification.ts:15`, `lib/ArenaTimerRecovery.ts:185,205`

typeId 1~5가 소스 전반에 하드코딩되어 있습니다. 별도 파일을 만들기보다 사용 위치에 인라인 주석을 추가해 typeId 변경 시 연동 수정이 필요함을 명시합니다.

```ts
// lib/TierNotification.ts
// typeId: 1=티어 승급, 2=티어 강등 (notification_types 테이블과 동기화 필요)
const typeId = afterScore > beforeScore ? 1 : 2;

// lib/ArenaTimerRecovery.ts
// typeId: 3=도전자 참가, 4=토론 시작, 5=투표 종료 (notification_types 테이블과 동기화 필요)
await createNotification.execute(new CreateNotificationRecordDto(current.creatorId, 4, description));
```

---

#### M4. Date 객체 뮤테이션 — `getWhereClause`
**위치**: `backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository.ts:33-38`

`date.setHours(0,0,0,0)`이 filter의 `createdAt` 배열 내 Date 객체를 직접 변경합니다. filter 객체가 재사용될 경우 버그를 유발합니다.

```ts
// 수정 후
gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
lt: new Date(new Date(date).setHours(24, 0, 0, 0)),
```

---

#### M5. 컴포넌트 테스트 부족
`NotificationRecordItem`(읽음 처리 클릭, 삭제 버튼)과 `NotificationModal`(로딩 스켈레톤, 빈 상태, 페이지네이션)에 대한 테스트가 없습니다.

---

#### M6. CSS_STYLING.md 위반 — 임의 픽셀값 `text-[Xpx]` 사용
**위치**: `app/components/NotificationBellButton.tsx:36`, `app/(base)/components/NotificationModal.tsx:36`

규약: **"Never use raw `text-[Xpx]` — use named scale classes only."**

두 곳에서 디자인 토큰 대신 임의 픽셀값을 사용합니다.

| 파일 | 현재 | 권장 |
|---|---|---|
| `NotificationBellButton.tsx:36` | `text-[10px]` | `text-caption`(12px) 또는 `tailwind.config.ts`에 토큰 추가 |
| `NotificationModal.tsx:36` | `text-[11px]` | 동일 |

---

#### M7. BACKEND_ARCHITECTURE.md 위반 — DTO 클래스 생성자 미사용
**위치**: `backend/notification-record/application/usecase/GetNotificationRecordUsecase.ts:52-63, 74-80`

규약: DTOs는 클래스로 정의되므로 `new Dto(...)` 생성자를 통해 인스턴스화해야 합니다. (참고: `return new ArenaDto(arena)` 패턴)

`GetNotificationRecordUsecase`에서 `NotificationRecordDto`와 `NotificationRecordListDto` 모두 플레인 객체 리터럴로 생성됩니다.

```ts
// 현재 (위반)
const recordListDto: NotificationRecordListDto = {
    records: recordDto,
    totalCount,
    currentPage,
    pages,
    endPage,
};

// 수정 후
return new NotificationRecordListDto(recordDto, totalCount, currentPage, pages, endPage);
```

`NotificationRecordDto`도 동일:
```ts
// 현재 (위반)
return {
    id: record.id,
    memberId: record.memberId,
    ...
};

// 수정 후
return new NotificationRecordDto(
    record.id, record.memberId, record.typeId,
    record.description, record.isRead, record.createdAt,
    type?.name ?? "기타",
    type?.imageUrl ?? "@/public/icons/defaultTypeImage.ico"
);
```

---

### LOW

#### L1. `ModalWrapper` — Escape 키 핸들러 미동작
**위치**: `app/components/ModalWrapper.tsx:28`

backdrop `div`의 `onKeyDown`은 해당 div에 포커스가 있을 때만 발생합니다. 그러나 `FocusTrap`이 내부 dialog에 포커스를 가두고, `escapeDeactivates: false`로 설정되어 FocusTrap의 자동 닫기도 비활성화됩니다. 결과적으로 키보드로 Escape를 눌러도 모달이 닫히지 않습니다.

```tsx
// 수정 후: inner dialog에 onKeyDown 추가
<div
    role="dialog"
    aria-modal="true"
    aria-labelledby={labelId}
    onKeyDown={(e) => e.key === "Escape" && onClose()}
    className={...}
>
```

또는 FocusTrap의 `escapeDeactivates` 옵션을 활용:
```tsx
focusTrapOptions={{
    returnFocusOnDeactivate: true,
    escapeDeactivates: true,  // Escape로 FocusTrap 비활성화
    onDeactivate: onClose,    // 비활성화 시 onClose 호출
    allowOutsideClick: true,
}}
```

---

#### L2. `Header.tsx` — `flex hidden` 중복 클래스
**위치**: `app/components/Header.tsx:110`

`"flex hidden flex-shrink-0 items-center space-x-8 sm:flex"` — `hidden`이 `display: none`을 설정하므로 앞의 `flex`가 즉시 덮어씌워집니다. 선행 `flex`는 제거해도 동작에 차이가 없습니다.

```tsx
// 수정 후
className="hidden flex-shrink-0 items-center space-x-8 sm:flex"
```

---

#### L3. `useNotificationCount` staleTime 미설정
**위치**: `hooks/useNotificationCount.ts`

`staleTime`이 없어 컴포넌트 마운트마다 API 요청이 발생합니다. 벨 버튼 리렌더 시마다 불필요한 네트워크 비용이 생깁니다. `staleTime: 30_000` 정도 추가 권장.

---

#### L4. `CreateNotificationRecordUsecase` — DB 기본값 중복
**위치**: `backend/notification-record/application/usecase/CreateNotificationRecordUsecase.ts:22-23`

`isRead: false`와 `createdAt: new Date()`는 스키마 `@default(false)`, `@default(now())`와 중복입니다. 제거해도 동작에 차이 없습니다.

---

#### L5. `NotificationRecordDto` — 클래스지만 생성자 미사용 → M7로 격상
**위치**: `backend/notification-record/application/usecase/dto/NotificationRecordDto.ts`

`GetNotificationRecordUsecase`에서 `new NotificationRecordDto(...)` 대신 플레인 객체 리터럴로 생성합니다. 규약상 올바른 수정은 `type`으로 전환하는 것이 아니라 **생성자를 사용**하는 것입니다 — `NotificationRecordListDto`도 동일하게 위반하므로 **M7**에서 통합하여 다룹니다.

---

## Validation Results

| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | Pass |
| Lint (`npm run lint`) | Pass |
| Tests (`npm test`) | Pass — 330 tests, 78 files |
| Build | Skipped (pre-commit hook에서 검증) |

_2회차 검증 (2026-04-25 최신 커밋 반영):_

| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | Pass |
| Lint (`npm run lint`) | Pass |
| Tests (`npm test`) | Pass — 330 tests, 78 files |

## Files Reviewed

| File | Type |
|---|---|
| `prisma/schema.prisma` | Modified |
| `prisma/migrations/20260423121931_add_notification_is_read/migration.sql` | Added |
| `backend/notification-record/application/usecase/CreateNotificationRecordUsecase.ts` | Modified |
| `backend/notification-record/application/usecase/GetNotificationRecordUsecase.ts` | Modified |
| `backend/notification-record/application/usecase/GetUnreadNotificationCountUsecase.ts` | Added |
| `backend/notification-record/application/usecase/MarkNotificationReadUsecase.ts` | Added |
| `backend/notification-record/application/usecase/dto/NotificationRecordDto.ts` | Modified |
| `backend/notification-record/domain/repositories/filters/NotificationRecordFilter.ts` | Modified |
| `backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository.ts` | Modified |
| `app/api/member/notification-records/[id]/route.ts` | Modified |
| `app/api/member/notification-records/count/route.ts` | Added |
| `app/api/member/arenas/[id]/join/route.ts` | Modified |
| `app/api/member/attend/route.ts` | Modified |
| `app/api/member/review-likes/[reviewId]/route.ts` | Modified |
| `app/(base)/components/NotificationModal.tsx` | Modified |
| `app/components/ModalWrapper.tsx` | Added |
| `app/(base)/components/NotificationRecordList.tsx` | Modified |
| `app/(base)/components/NotificationRecordItem.tsx` | Modified |
| `app/components/Header.tsx` | Modified |
| `app/components/NotificationBellButton.tsx` | Modified |
| `app/components/__tests__/NotificationBellButton.test.tsx` | Added |
| `hooks/useNotificationCount.ts` | Added |
| `lib/QueryKeys.ts` | Modified |
| `lib/TierNotification.ts` | Added |
| `lib/ArenaTimerRecovery.ts` | Modified |
| `lib/__tests__/ArenaTimerRecovery.test.ts` | Modified |
| `tests/mocks/createMockNotificationRecordRepository.ts` | Added |
| `backend/notification-record/application/usecase/__tests__/GetUnreadNotificationCountUsecase.test.ts` | Added |
| `backend/notification-record/application/usecase/__tests__/MarkNotificationReadUsecase.test.ts` | Added |
| `app/api/member/arenas/[id]/join/__tests__/route.test.ts` | Modified |

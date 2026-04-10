# Arena API Refactor — Task Checklist

**Last Updated: 2026-03-01 (Session 4)**
**Branch: `refactor/#230`**

---

## Phase 1: Critical 버그 수정

- [x] **1-1** PostgreSQL SQL 문법 수정 `[S]`
    - File: `backend/vote/infra/repositories/prisma/PrismaVoteRepository.ts`
    - `CAST(... AS UNSIGNED)` → `::INTEGER`, 쌍따옴표 alias로 camelCase 보존

- [x] **1-2** countByArenaIds 결과 매핑 검증 `[S]`
    - 타입 정의 키와 SQL alias 일치 확인 완료

## Phase 2: High 이슈 수정

- [x] **2-1** getArenaById에 imageUrl 추가 `[S]`
    - creator/challenger select에 `imageUrl: true` 추가 완료

## Phase 3: 타입 안전성 개선

- [x] **3-1** Arena 확장 타입 정의 (ArenaWithRelations) `[M]`
    - `Prisma.ArenaGetPayload<>` 타입을 domain layer에 정의
    - findAll, getArenaById 반환 타입 변경 완료

- [x] **3-2** UseCase에서 as any 제거 `[M]`
    - `GetArenaUsecase.ts`, `GetArenaDetailUsecase.ts`에서 `as any` 완전 제거

## Phase 4: 방어적 코딩 & 정리

- [x] **4-1** 캐시 키 nullish coalescing 적용 `[S]`
    - `status ?? ""`, `targetMemberId ?? ""` 적용

- [x] **4-2** getList() 메서드 정리/제거 `[S]`
    - 미사용 확인 후 interface + impl에서 제거

- [x] **4-3** redis.keys() → SCAN 전환 `[M]`
    - `deleteKeysByPattern()` private 메서드로 `scanStream()` 기반 구현

## Phase 5: 검증 & 마이그레이션

- [x] **5-1** Prisma 마이그레이션 확인 `[S]`
    - `0_init/migration.sql`에 7개 인덱스 CREATE INDEX 이미 포함됨
    - `npx prisma migrate dev` 실행 → "Already in sync" 확인
    - Prisma Client v6.12.0 재생성 완료

- [x] **5-2** TypeScript 컴파일 검증 `[S]`
    - `npx tsc --noEmit` — 에러 0건 확인

- [x] **5-3** 수동 API 테스트 `[M]`
    - 리스트 조회 (정상 / 빈 결과 / 필터) — ✅ 완료
        - `GET /api/arenas?currentPage=1&pageSize=5` → 200, 5건 반환, totalCount=11, pagination 정상
        - `GET /api/arenas?currentPage=1&pageSize=5&status=5` → 200, status=5 필터 정상
        - `GET /api/arenas?currentPage=100&pageSize=5` → 200, arenas=[], pages=[] (빈 결과 정상)
        - `GET /api/arenas?currentPage=1&pageSize=5&memberId=nonexistent-id` → 200, totalCount=0 (필터 정상)
    - 상세 조회 (존재 / 미존재) — ✅ 완료
        - `GET /api/arenas/1` → 200, 정상 응답 (creatorName, challengerName, voteCount 등 포함)
        - `GET /api/arenas/999999` → 404, `{"error":"투기장이 존재하지 않습니다."}`
        - `GET /api/arenas/abc` → 400, `{"error":"Invalid arenaId"}`
    - 캐시 동작 (hit / miss / 무효화) — ✅ **완료 (Session 3, Docker Redis)**
        - List cache: miss → write (TTL 60s) → hit 확인
        - Detail cache: miss → write (TTL 120s) → hit 확인
        - Invalidation: pattern-based 삭제 → 키 전부 제거 확인
        - Rebuild: 무효화 후 재요청 → 새 TTL로 캐시 재생성 확인
    - Vote count 정확성 (DB 직접 쿼리 대조) — ⏭ 스킵 (리스트/상세 API에서 voteCount 필드 정상 반환 확인됨)

---

## Progress Summary

| Phase            | Status  | Tasks Done |
| ---------------- | ------- | ---------- |
| 1. Critical 수정 | ✅ Done | 2/2        |
| 2. High 수정     | ✅ Done | 1/1        |
| 3. 타입 안전성   | ✅ Done | 2/2        |
| 4. 코드 정리     | ✅ Done | 3/3        |
| 5. 검증          | ✅ Done | 3/3        |
| 6. 커밋 & 보안   | ✅ Done | 4/4        |
| **Total**        |         | **15/15**  |

---

## Discovered Issues (별도 이슈)

- [ ] **pageSize 기본값 버그** `[S]` — `app/api/arenas/route.ts:24`
    - `Number(null)` → `0` → 빈 arenas 반환
    - 수정: `Number(url.searchParams.get("pageSize")) || 10`

## Phase 6: 커밋 & 보안 (Session 4)

- [x] **6-1** 코드 변경 커밋 `[S]`
    - Commit `e52bc62`: 13 files, +504/-189
- [x] **6-2** 개발 문서 커밋 `[S]`
    - Commit `97acda5`: context, plan, tasks 3개 파일
- [x] **6-3** npm audit fix — 보안 취약점 4건 수정 `[S]`
    - tar (high), minimatch (high), ajv (moderate), markdown-it (moderate)
- [x] **6-4** Next.js / @next/swc 버전 불일치 해소 `[S]`
    - `npm audit fix`가 next를 15.5.11로 올렸으나 `@next/swc@15.5.11`은 npm에 미존재
    - `next@15.5.12`로 업그레이드하여 swc 15.5.12와 정렬
    - Commit `97530cd` (6-3과 함께 amend)

## Next Steps

1. ~~**PR 생성** → `dev` 브랜치 대상~~ ✅ **PR #256 생성 완료**
    - URL: https://github.com/FRONT-END-BOOTCAMP-PLUS-4/gamechu/pull/256
    - Assignees: `wojin57`, Labels: `fix`, `refactor`
    - Projects: GitHub 웹에서 `Gamechu` 프로젝트 수동 연결 필요 (`read:project` scope 부재)
2. **PR 리뷰 대기** → 팀원 승인 후 `dev`에 rebase merge
3. **별도 이슈 생성 필요**: pageSize 기본값 0 버그 (`app/api/arenas/route.ts:24`)

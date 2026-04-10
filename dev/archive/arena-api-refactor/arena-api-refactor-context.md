# Arena API Refactor — Context

**Last Updated: 2026-03-01 (Session 5)**
**Branch: `refactor/#230`**

---

## Key Files

### Modified (committed)

| File                                                               | Role                   | Changes                                                                   |
| ------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------- |
| `app/api/arenas/[id]/route.ts`                                     | Arena PATCH/DELETE API | 캐시 무효화 추가 (ArenaCacheService import + invalidateArenaCache 호출)   |
| `backend/arena/application/usecase/GetArenaDetailUsecase.ts`       | 상세 조회 UseCase      | member 개별 조회 제거, include 활용, 캐시 적용, `as any` 제거 완료        |
| `backend/arena/application/usecase/GetArenaUsecase.ts`             | 리스트 조회 UseCase    | N+1 제거 (배치 vote count), 캐시 적용, `as any` 제거 완료                 |
| `backend/arena/domain/repositories/ArenaRepository.ts`             | Arena Repo 인터페이스  | `ArenaWithRelations` 타입 추가, `findAll` 반환타입 변경, `getList()` 제거 |
| `backend/arena/infra/repositories/prisma/PrismaArenaRepository.ts` | Arena Prisma Repo      | findAll/getArenaById에 include 추가, imageUrl 포함, `getList()` 제거      |
| `backend/vote/domain/repositories/VoteRepository.ts`               | Vote Repo 인터페이스   | `countByArenaIds` 메서드 추가                                             |
| `backend/vote/infra/repositories/prisma/PrismaVoteRepository.ts`   | Vote Prisma Repo       | `countByArenaIds` PostgreSQL raw SQL 구현 — **버그 수정 완료**            |
| `lib/cacheKey.ts`                                                  | 캐시 키 생성           | arena 캐시 키 함수 추가 (nullish coalescing 적용)                         |
| `prisma/schema.prisma`                                             | DB 스키마              | Arena/Vote 인덱스 추가                                                    |

### New (committed)

| File                                             | Role                                          |
| ------------------------------------------------ | --------------------------------------------- |
| `backend/arena/infra/cache/ArenaCacheService.ts` | Arena Redis 캐시 서비스 (SCAN 기반 패턴 삭제) |

### Related but Unchanged

| File                                                      | Role                                                   |
| --------------------------------------------------------- | ------------------------------------------------------ |
| `app/api/arenas/route.ts`                                 | Arena 리스트 API 라우트 (status 검증 미흡 — 별도 이슈) |
| `lib/redis.ts`                                            | Redis 클라이언트 싱글톤                                |
| `lib/prisma.ts`                                           | Prisma 클라이언트 싱글톤                               |
| `backend/arena/application/usecase/dto/ArenaListDto.ts`   | 리스트 응답 DTO                                        |
| `backend/arena/application/usecase/dto/ArenaDetailDto.ts` | 상세 응답 DTO                                          |

---

## Key Decisions

### 1. N+1 쿼리 해결 방법

- **선택**: Prisma `include`로 relation eager loading + `countByArenaIds` raw SQL 배치
- **대안 고려**: DataLoader 패턴 — 과도한 복잡성으로 기각
- **근거**: 가장 단순하면서 효과적, 쿼리 수 51 → 3으로 감소

### 2. 캐시 전략

- **선택**: Read-through cache with TTL-based expiration + event-based invalidation
- **TTL**: 리스트 60s, 상세 120s
- **무효화**: PATCH/DELETE 시 해당 상세 캐시 + 모든 리스트 캐시 삭제
- **한계**: 투표 시 캐시 무효화 미구현 — TTL 동안 stale 가능

### 3. Raw SQL 사용 (Vote count)

- **선택**: `$queryRaw`로 GROUP BY 집계
- **근거**: Prisma ORM으로는 단일 쿼리 집계 불가능, N개 count 쿼리 → 1개 raw SQL
- **PostgreSQL 대응**: `::INTEGER` 캐스팅 + 쌍따옴표(`"camelCase"`) alias로 키 보존

### 4. 타입 안전성 (`ArenaWithRelations`)

- **선택**: `Prisma.ArenaGetPayload<>` 타입을 domain layer(`ArenaRepository.ts`)에 정의
- **근거**: repository interface에서 반환 타입을 명시하여 UseCase에서 `as any` 완전 제거

### 5. SCAN 기반 캐시 무효화

- **선택**: `redis.scanStream()` 기반 `deleteKeysByPattern()` private 메서드
- **근거**: `redis.keys()` 대비 프로덕션 안전 (O(N) 블로킹 방지)

---

## Resolved Issues (This Session)

| #   | 심각도   | 이슈                               | 해결 방법                                         |
| --- | -------- | ---------------------------------- | ------------------------------------------------- |
| 1   | CRITICAL | `CAST(... AS UNSIGNED)` MySQL 전용 | `::INTEGER` PostgreSQL 캐스팅으로 변경            |
| 2   | CRITICAL | Raw SQL alias camelCase 손실       | 쌍따옴표 `"arenaId"`, `"totalCount"` 등으로 보존  |
| 3   | HIGH     | `getArenaById()` imageUrl 누락     | creator/challenger select에 `imageUrl: true` 추가 |
| 4   | MEDIUM   | `as any` 타입 캐스팅               | `ArenaWithRelations` 타입 정의 + UseCase 적용     |
| 5   | MEDIUM   | 캐시 키 falsy 값 처리              | `status ?? ""`, `targetMemberId ?? ""` 적용       |
| 6   | LOW      | `getList()` 미사용 메서드          | interface + impl에서 완전 제거                    |
| 7   | LOW      | `redis.keys()` 프로덕션 위험       | `scanStream()` 기반으로 전환                      |

---

## Architecture Impact

```
[Before]
API → UseCase → for each arena:
                  → memberRepo.findById(creatorId)     ← N queries
                  → memberRepo.findById(challengerId)  ← N queries
                  → voteRepo.count(total)              ← N queries
                  → voteRepo.count(left)               ← N queries
                  → voteRepo.count(right)              ← N queries
                Total: 5N + 1 queries

[After]
API → UseCase → Cache check
              → arenaRepo.findAll(filter)  ← 1 query (with include)
              → voteRepo.countByArenaIds() ← 1 raw SQL query
              → arenaRepo.count(filter)    ← 1 query
              → Cache set
                Total: 3 queries (or 0 on cache hit)
```

---

## Remaining Work

### All Tasks Complete — PR 생성 완료 ✅

- **Commit 1** `e52bc62`: Arena API 리팩토링 코드 변경 (13 files, +504/-189)
- **Commit 2** `97acda5`: 개발 문서 추가
- **Commit 3** `a0ab242`: npm audit fix + Next.js 15.5.12 버전 정렬
- **PR #256**: https://github.com/FRONT-END-BOOTCAMP-PLUS-4/gamechu/pull/256
    - Base: `dev`, Head: `refactor/#230`
    - Assignees: `wojin57`, Labels: `fix`, `refactor`
    - Projects: 수동 설정 필요 (토큰 `read:project` scope 부재)

### Nice to Have (별도 이슈)

- 투표 API에 캐시 무효화 추가 (현재 투표 후 TTL 동안 stale)
- `app/api/arenas/route.ts` status 검증 강화
- `app/api/arenas/route.ts` pageSize 기본값 버그: `Number(null)` → `0` (빈 arenas 반환)

---

## Session 3 Notes (2026-03-01)

### Docker Redis 로컬 환경 구축

- 로컬에 Redis 미설치 문제 해결: Docker 컨테이너로 로컬 Redis 구동
- 명령어: `docker run -d --name gamechu-redis -p $REDIS_PORT:$REDIS_PORT redis:7-alpine redis-server --requirepass $REDIS_PASSWORD`
- `.env` 변경 없음 — 기존 설정(`$REDIS_HOST:$REDIS_PORT`)이 Docker와 정확히 매칭
- `redis-cli` 접근: `docker exec -it gamechu-redis redis-cli -a $REDIS_PASSWORD`

### 캐시 테스트 결과 (전수 통과)

| 테스트                                                 | 결과             |
| ------------------------------------------------------ | ---------------- |
| List cache miss → Redis에 `arena:list:0::10:1` 키 생성 | TTL = 60s ✅     |
| Detail cache miss → Redis에 `arena:detail:46` 키 생성  | TTL = 120s ✅    |
| Detail cache hit → 두 번째 요청은 캐시에서 반환        | TTL 감소 확인 ✅ |
| Cache invalidation → detail + list 패턴 삭제           | 키 전부 삭제 ✅  |
| Cache rebuild → 무효화 후 재요청 시 새 캐시 생성       | 새 TTL 확인 ✅   |

### 발견된 버그

- **`pageSize` 기본값 0 문제**: `GET /api/arenas` (pageSize 미지정) → `Number(null)` = `0` → arenas 빈 배열 반환, 하지만 totalCount는 정상
    - 원인: `app/api/arenas/route.ts:24` — `Number(url.searchParams.get("pageSize")!)` (null → 0)
    - 영향: pageSize 쿼리 파라미터를 생략하면 빈 결과 반환
    - 수정 필요: `Number(url.searchParams.get("pageSize")) || 10` 등 기본값 처리

### Turbopack 이슈

- 연속 빠른 요청 시 "Jest worker encountered 2 child process exceptions" 500 에러 발생
- 원인: Turbopack 내부 worker 과부하 (dev 전용, 프로덕션 영향 없음)
- 대응: 요청 간 간격을 두거나, 서버 재시작으로 해결

### 커밋 상태 (Session 4에서 완료)

- **3개 커밋 생성 완료** — working tree clean
    - `e52bc62` 코드 리팩토링
    - `97acda5` 개발 문서
    - `97530cd` npm audit fix + Next.js 15.5.7→15.5.12 업그레이드
- `npm audit fix`가 Next.js를 15.5.11로 올렸으나 `@next/swc` 15.5.11은 npm에 미존재
    - 해결: `npm install next@15.5.12`로 swc 15.5.12와 정렬
- **다음 단계**: `dev` 브랜치로 PR 생성

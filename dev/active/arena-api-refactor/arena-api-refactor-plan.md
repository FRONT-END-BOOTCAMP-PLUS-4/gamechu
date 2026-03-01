# Arena API 리팩토링 & 버그 수정 계획

**Last Updated: 2026-02-28**
**Branch: `refactor/#230`**

---

## Executive Summary

Arena API의 성능 최적화(N+1 쿼리 제거, Redis 캐시 도입)와 버그 수정(PostgreSQL 비호환 SQL, 타입 안전성 부재, 누락된 필드)을 수행한다. 현재 변경 사항은 작성 완료되었으나, 커밋되지 않은 상태에서 **Critical 버그 2건**이 수정되지 않은 채 남아있다.

---

## Current State Analysis

### 이미 완료된 작업 (unstaged)
1. **N+1 쿼리 제거**: `GetArenaUsecase` — 개별 member/vote 조회 → Prisma include + `countByArenaIds` 배치 쿼리
2. **Redis 캐시 도입**: `ArenaCacheService` 생성, 리스트(60s)/상세(120s) TTL 캐시
3. **캐시 무효화**: PATCH/DELETE 엔드포인트에 캐시 무효화 로직 추가
4. **DB 인덱스**: `arenas`(creatorId, challengerId, status, startDate) + `votes`(arenaId, memberId, votedTo)
5. **Arena 상세 조회 최적화**: `GetArenaDetailUsecase` — member 개별 조회 제거, include 활용

### 미해결 Critical/High 이슈
| # | 심각도 | 이슈 | 파일 |
|---|--------|------|------|
| 1 | **CRITICAL** | `CAST(... AS UNSIGNED)` — MySQL 전용 문법, PostgreSQL 런타임 에러 | `PrismaVoteRepository.ts` |
| 2 | **CRITICAL** | Raw SQL 컬럼 alias가 camelCase — PostgreSQL은 소문자 반환, 매핑 실패 | `PrismaVoteRepository.ts` |
| 3 | **HIGH** | `getArenaById()`에 `imageUrl` select 누락 — 리스트/상세 응답 불일치 | `PrismaArenaRepository.ts` |
| 4 | **MEDIUM** | `as any` 타입 캐스팅 — 타입 안전성 부재 | `GetArenaUsecase.ts`, `GetArenaDetailUsecase.ts` |
| 5 | **MEDIUM** | `generateArenaCacheKey`에서 falsy 값 처리 미흡 | `lib/cacheKey.ts` |
| 6 | **LOW** | `getList()` 메서드 불완전 구현 (미사용) | `PrismaArenaRepository.ts` |
| 7 | **LOW** | `redis.keys()` 사용 — 프로덕션에서 O(N) 블로킹 | `ArenaCacheService.ts` |

---

## Proposed Future State

### 목표 아키텍처
```
API Route → UseCase → Repository (Prisma include) + VoteRepository.countByArenaIds()
                    ↘ ArenaCacheService (Redis) — 캐시 우선 조회
```

### 성능 목표
| 시나리오 | Before | After |
|----------|--------|-------|
| 리스트 쿼리 수 | ~51 (N+1) | 3 (findAll + countByArenaIds + count) |
| 상세 쿼리 수 | ~13 | 2 (getArenaById + countByArenaIds) |
| 리스트 (cache miss) | ~1s+ | < 300ms |
| 리스트 (cache hit) | N/A | < 50ms |

---

## Implementation Phases

### Phase 1: Critical 버그 수정 (우선순위 최상)
**목표**: PostgreSQL에서 런타임 에러 없이 동작하도록 수정

#### Task 1-1: PostgreSQL SQL 문법 수정 [CRITICAL] — Effort: S
- **파일**: `backend/vote/infra/repositories/prisma/PrismaVoteRepository.ts`
- **작업**:
  - `CAST(... AS UNSIGNED)` → `...::INTEGER` (PostgreSQL 캐스팅)
  - 컬럼 alias를 snake_case로 변경 (`arenaId` → `arena_id`, `totalCount` → `total_count` 등)
  - 결과 매핑 코드에서 snake_case 키 사용
- **수정 방향**:
  ```sql
  -- Before (MySQL)
  CAST(COUNT(*) AS UNSIGNED) as totalCount

  -- After (PostgreSQL)
  COUNT(*)::INTEGER AS "totalCount"
  ```
  또는 snake_case alias 사용 후 매핑 변환
- **수락 기준**: `npx prisma generate` 후 TypeScript 컴파일 에러 없음, PostgreSQL에서 정상 실행

#### Task 1-2: 결과 매핑 타입 수정 — Effort: S
- **파일**: `PrismaVoteRepository.ts`, `GetArenaUsecase.ts`, `GetArenaDetailUsecase.ts`
- **작업**: `countByArenaIds` 반환 타입의 키를 실제 SQL 반환 키와 일치시키기
- **수락 기준**: 타입 정의와 런타임 결과가 일치

### Phase 2: High 이슈 수정
**목표**: 데이터 일관성 보장

#### Task 2-1: getArenaById에 imageUrl 추가 [HIGH] — Effort: S
- **파일**: `backend/arena/infra/repositories/prisma/PrismaArenaRepository.ts`
- **작업**: `getArenaById()`의 creator/challenger select에 `imageUrl: true` 추가
- **수락 기준**: 상세 API 응답에 프로필 이미지 URL 포함

### Phase 3: 타입 안전성 개선
**목표**: `as any` 제거

#### Task 3-1: Arena 확장 타입 정의 — Effort: M
- **파일**: 새 타입 정의 또는 기존 타입 파일
- **작업**:
  ```typescript
  import { Prisma } from "@/prisma/generated";

  type ArenaWithRelations = Prisma.ArenaGetPayload<{
      include: {
          creator: { select: { id: true; nickname: true; imageUrl: true; score: true } };
          challenger: { select: { id: true; nickname: true; imageUrl: true; score: true } };
      };
  }>;
  ```
- **수락 기준**: `as any` 제거 후 `npx tsc --noEmit` 통과

#### Task 3-2: UseCase에서 as any 제거 — Effort: M
- **파일**: `GetArenaUsecase.ts`, `GetArenaDetailUsecase.ts`
- **작업**: 확장 타입 적용, 타입 단언 제거
- **의존성**: Task 3-1 완료 필요
- **수락 기준**: `as any` 0건, 컴파일 에러 없음

### Phase 4: 방어적 코딩 & 정리
**목표**: 코드 품질 개선

#### Task 4-1: 캐시 키 nullish coalescing 적용 — Effort: S
- **파일**: `lib/cacheKey.ts`
- **작업**: `status = ""` → `status ?? ""`
- **수락 기준**: `status=0`이 빈 문자열로 변환되지 않음

#### Task 4-2: getList() 메서드 정리 — Effort: S
- **파일**: `PrismaArenaRepository.ts`
- **작업**: 미사용 메서드 제거 또는 findAll과 통합
- **수락 기준**: 사용되지 않는 코드 제거, 빌드 성공

#### Task 4-3: redis.keys() → SCAN 전환 검토 — Effort: M
- **파일**: `ArenaCacheService.ts`
- **작업**: `redis.keys("arena:list:*")` → `redis.scanStream()` 기반으로 전환
- **수락 기준**: 프로덕션 안전한 캐시 무효화

### Phase 5: 검증 & 마이그레이션
**목표**: 변경사항 안전한 배포

#### Task 5-1: Prisma 마이그레이션 생성 — Effort: S
- **작업**: `npx prisma migrate dev --name add_arena_vote_indexes`
- **수락 기준**: 마이그레이션 파일 생성, `npx prisma generate` 성공

#### Task 5-2: TypeScript 컴파일 검증 — Effort: S
- **작업**: `npx tsc --noEmit`
- **수락 기준**: 컴파일 에러 0건

#### Task 5-3: 수동 API 테스트 — Effort: M
- **작업**: ARENA_API_FIX_PLAN.md 3-3절의 테스트 시나리오 실행
- **수락 기준**: 모든 엣지 케이스 통과

---

## Risk Assessment

| 리스크 | 심각도 | 완화 전략 |
|--------|--------|-----------|
| PostgreSQL SQL 런타임 에러 (현재 존재) | **Critical** | Phase 1에서 최우선 수정 |
| 캐시 stale 데이터 (투표 후 TTL 동안) | Medium | 투표 API에도 캐시 무효화 추가 검토 |
| `redis.keys()` 프로덕션 블로킹 | Low | Phase 4에서 SCAN 전환, 현재는 키 수가 적어 영향 미미 |
| 타입 불일치로 인한 런타임 에러 | Medium | Phase 3에서 `as any` 제거로 컴파일타임 검증 |
| 인덱스 추가 시 마이그레이션 충돌 | Low | dev 환경에서 먼저 검증 |

---

## Success Metrics

- [ ] PostgreSQL에서 `countByArenaIds` 정상 실행 (에러 0건)
- [ ] 리스트/상세 API 응답에 모든 필드 포함 (imageUrl 포함)
- [ ] `as any` 사용 0건 (Arena 관련 UseCase)
- [ ] `npx tsc --noEmit` 통과
- [ ] 리스트 API cache miss < 300ms
- [ ] 리스트 API cache hit < 50ms

---

## Dependencies

```
Task 1-1 → Task 1-2 (SQL 수정 → 매핑 수정)
Task 3-1 → Task 3-2 (타입 정의 → UseCase 적용)
Phase 1~4 → Task 5-1 (코드 수정 완료 → 마이그레이션)
Phase 1~4 → Task 5-2 (코드 수정 완료 → 컴파일 검증)
Task 5-2 → Task 5-3 (컴파일 통과 → API 테스트)
```

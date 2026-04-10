# prisma/seed.ts 업데이트 + IGDB 게임 임포트 분리 계획

> Last Updated: 2026-03-06
> Plan Review v2 반영

## Executive Summary

`prisma/seed.ts`를 현재 `prisma/schema.prisma`에 맞게 정비하고, IGDB 게임 임포트 로직을 독립 스크립트로 분리한다.
또한 `prisma/seed-data/` 디렉토리에 준비된 **JSON 샘플 데이터**(운영 DB 추출)를 import하여,
새 개발자가 `prisma db seed` 한 번으로 완전한 개발 환경을 구성할 수 있도록 한다.
(기존 `dev/active/igdb-game-import/` 태스크를 이 계획에 통합)

현재 seed.ts의 문제점:

1. `@prisma/client` import → `../prisma/generated` 상대 경로로 변경 필수
2. **`@/utils/...` import → 상대 경로로 변경 필수** (tsx가 tsconfig paths 미지원)
3. Member 모델의 `isAttended` 필드가 `lastAttendedDate`로 변경됨 — 주석 시드 데이터가 구 스키마 기준
4. Genre, Platform, Theme 시드가 주석 처리됨 — Junction 테이블 FK가 깨질 수 있음
5. IGDB 게임 임포트 로직이 seed에 통합되어 있음 — 독립 스크립트로 분리 필요
6. ScoreRecord의 `actualScore` 필드가 스키마에 추가됨 — seed에 미반영
7. IGDB 임포트가 500개 제한, 중복 안전성 없음, rate limit 미처리
8. **`tsx` 미설치** — devDependency 추가 필수
9. **ScorePolicy 시드에 명시적 ID 미지정** — skipDuplicates 무효화 위험

기존 스크립트:

- `scripts/fetchAllGames.ts` — `execSync`로 `seed.ts`를 offset별로 반복 호출하는 래퍼 스크립트
    - offset 20000부터 시작, 500씩 증가, maxOffset 100000
    - 문제: seed.ts 전체를 매번 실행 (참조 데이터 시딩 포함), 프로세스 fork 오버헤드, rate limit 미처리
    - **→ `scripts/import-games.ts`로 대체 후 삭제**

## Current State Analysis

### prisma/schema.prisma 기준 변경점 (seed.ts 대비)

| 모델                 | 스키마 현황                                 | seed.ts 상태                        | 조치               |
| -------------------- | ------------------------------------------- | ----------------------------------- | ------------------ |
| Member               | `lastAttendedDate DateTime @default(now())` | 주석에 `isAttended: true` (구 필드) | 주석 데이터 수정   |
| Member               | `deletedAt DateTime?` 존재                  | seed에 없음                         | nullable이므로 OK  |
| ScoreRecord          | `actualScore Int @default(0)` 추가됨        | seed 데이터에 없음                  | 주석 데이터에 추가 |
| Game                 | `id Int @id` (autoincrement 아님)           | IGDB ID 사용 — OK                   | 변경 불필요        |
| Genre/Platform/Theme | `name String @unique`                       | 주석 처리된 시드 코드 존재          | 주석 해제 + 활성화 |
| Arena                | `status Int`, `startDate DateTime`          | 주석 처리 OK                        | 변경 불필요        |

### IGDB 임포트 로직

현재 seed.ts에 IGDB API fetch + game/junction 삽입 로직이 포함되어 있다.
이 로직을 `scripts/import-games.ts`로 분리하여 재사용 가능한 임포트 스크립트로 개선한다.

**기존 문제점** (from igdb-game-import plan):

1. 중복 실행 시 PK 충돌로 실패 (upsert 없음)
2. 한 번에 500개 제한 — 수천~수만 개 임포트 불가
3. 진행 상태 추적 없음
4. Rate limit 미처리 (IGDB: 4 req/sec)

### IGDB API 제약

- **Rate limit**: 4 requests/second
- **Max limit**: 500 records per request
- **Total games**: ~300,000+ (플랫폼 필터 적용 시 ~50,000-100,000)
- **인증**: Twitch Client Credentials → Bearer token

## Proposed Future State

### seed.ts 역할 정의

- **초기 시딩 전용**: Genre, Platform, Theme, NotificationType, ScorePolicy 등 **참조 데이터**만 시딩
- IGDB 게임 임포트 로직은 `scripts/import-games.ts`로 분리 → seed.ts에서 제거
- 주석 처리된 예시 데이터는 **현재 스키마에 맞게 수정**

### scripts/import-games.ts 역할 정의

- **IGDB 게임 대량 임포트 전용**: 자동 페이지네이션, 중복 안전, rate limit 준수
- seed.ts 실행 후 별도 실행 (`npx tsx scripts/import-games.ts`)
- CLI args: `--offset`, `--limit`

### 주요 변경사항

1. **Genre 시드 활성화** — IGDB에서 쓰는 장르를 미리 시딩 (Junction FK 무결성)
2. **Platform 시드 활성화** — 필터에 사용하는 9개 플랫폼 시딩
3. **Theme 시드 활성화** — IGDB에서 쓰는 테마 시딩
4. **ScorePolicy 시드 활성화** — 앱에서 실제 사용하는 정책 데이터 (명시적 ID 포함)
5. **NotificationType 시드 활성화** — 알림 유형 5개
6. **샘플 데이터 JSON 임포트** — `prisma/seed-data/*.json` 파일에서 import하여 `createMany`로 삽입
    - Member, Game, GameGenre/Platform/Theme(7개 샘플), Arena, Chatting, Review, ReviewLike, Wishlist, Vote, Preferred\*, ScoreRecord 전체
    - bcrypt 비밀번호, 유효한 FK, actualScore 등 모두 JSON에 포함됨
    - 기존 주석 처리된 하드코딩 샘플 데이터 제거
7. **실행 순서 수정** — FK 의존성에 따른 올바른 순서 (Member → Game 관련 → 나머지)
8. **IGDB 임포트 분리** — seed.ts → scripts/import-games.ts
9. **중복 안전성** — `skipDuplicates: true` + 명시적 ID + Junction 처리

## Implementation Phases

### Phase 1: 참조 데이터 시드 활성화 (핵심)

Genre, Platform, Theme을 IGDB API에서 가져오는 대신 **하드코딩된 시드 데이터**로 변경.
이유: IGDB API는 런타임 의존성이므로 시드에서 분리하는 것이 안정적.
ScorePolicy, NotificationType도 함께 활성화.
**참조 데이터는 개별 `upsert` 사용** (소량이므로 성능 무관, 향후 데이터 변경 시 자동 반영).

### Phase 2: 샘플 데이터 활성화 (`prisma/seed-data/` JSON 임포트)

`prisma/seed-data/` 디렉토리에 운영 DB에서 추출한 실제 샘플 데이터가 JSON 파일로 준비되어 있다.
seed.ts에서 이 JSON 파일을 import하여 `createMany({ skipDuplicates: true })`로 삽입한다.
주석 처리된 하드코딩 예시 데이터를 직접 만들 필요 없음.

**JSON 파일 목록:** `members.json`, `games.json`, `game_genres.json`, `game_platforms.json`, `game_themes.json`, `arenas.json`, `chattings.json`, `reviews.json`, `review_likes.json`, `wishlists.json`, `votes.json`, `preferred_genres.json`, `preferred_platforms.json`, `preferred_themes.json`, `score_records.json` (notification_records.json은 비어 있어 스킵)

**장점:**

- bcrypt 해싱 비밀번호 포함 (seed.ts에서 bcrypt 호출 불필요)
- 모든 FK가 실제 데이터 간 유효한 참조 (gameId: 0 같은 무효 참조 없음)
- `actualScore` 필드 이미 포함 (score_records.json)
- 실제 IGDB Platform/Genre/Theme ID 참조 (preferred\_\*.json)

**필요 작업:**

- members.json 스키마 동기화 확인 (`isAttended` → `lastAttendedDate` 필드 매핑)
- seed.ts 실행 순서를 FK 의존성에 맞게 재배치
- 기존 주석 처리된 하드코딩 샘플 데이터 제거 (JSON으로 대체)

**실행 순서 재배치 (FK 의존성 기준):**

```
1. Genre, Platform, Theme, ScorePolicy, NotificationType  (참조 데이터 — 개별 upsert)
2. Member                                                   (members.json)
3. Game                                                     (games.json — 7개 샘플)
3a. GameGenre, GamePlatform, GameTheme                      (game_genres/platforms/themes.json)
4. Review, Wishlist                                         (reviews.json, wishlists.json)
5. ReviewLike                                               (review_likes.json)
6. Arena                                                    (arenas.json)
7. Chatting, Vote                                           (chattings.json, votes.json)
8. PreferredGenre, PreferredPlatform, PreferredTheme        (preferred_*.json)
9. ScoreRecord                                              (score_records.json)
10. NotificationRecord                                      (스킵 — 빈 파일)
```

### Phase 3: IGDB 게임 임포트 스크립트 분리

seed.ts의 IGDB fetch 로직을 `scripts/import-games.ts`로 추출.
기존 `scripts/fetchAllGames.ts` (seed.ts를 execSync로 반복 호출하는 래퍼)는 삭제하고 대체.

```
scripts/
  import-games.ts    # 메인 임포트 스크립트 (fetchAllGames.ts 대체)
  fetchAllGames.ts   # ← 삭제
```

**핵심 로직 (keyset pagination):**

```typescript
const BATCH_SIZE = 500; // IGDB max limit
const DELAY_MS = 350; // rate limit safety margin
let lastId = startId ?? (await getMaxGameId()); // DB에서 MAX(id) 조회

while (true) {
    // keyset pagination: offset 대신 id 기반 (IGDB offset 10,000 제한 회피)
    const games = await fetchIGDB(
        `where id > ${lastId} & platforms = (...); sort id asc; limit ${BATCH_SIZE}`
    );
    if (games.length === 0) break;

    await prisma.$transaction(
        async (tx) => {
            await tx.game.createMany({ data: gameData, skipDuplicates: true });
            await tx.gameGenre.createMany({
                data: junctionData,
                skipDuplicates: true,
            });
            await tx.gamePlatform.createMany({
                data: junctionData,
                skipDuplicates: true,
            });
            await tx.gameTheme.createMany({
                data: junctionData,
                skipDuplicates: true,
            });
        },
        { timeout: 30000 }
    ); // interactive transaction, 30s timeout

    lastId = games[games.length - 1].id;
    console.log(`Imported up to ID ${lastId} (${totalCount} games)...`);
    await sleep(DELAY_MS);
}
```

> **Note**: `createMany`는 기존 레코드를 update하지 않음. Game 메타데이터 갱신이 필요한 경우 향후 upsert로 전환.

분리 후 seed.ts에서 IGDB 관련 코드 제거.

### Phase 4: 중복 안전성

- **Game 테이블**: `createMany({ skipDuplicates: true })` — PK 충돌 방지
- **Junction 테이블**: compound unique constraint (Phase 0) + `skipDuplicates`로 충분 (delete-reinsert 불필요)
    - Known limitation: IGDB에서 연결이 제거된 경우 로컬 DB에 반영되지 않음

### Phase 5: 실행 및 검증

```bash
# 1. 참조 데이터 시딩
npx prisma db seed

# 2. 게임 임포트 (전체)
npx tsx scripts/import-games.ts

# 3. 특정 offset부터 이어서
npx tsx scripts/import-games.ts --offset 5000

# 4. 특정 개수만
npx tsx scripts/import-games.ts --limit 2000
```

## Risk Assessment

| Risk                                           | Severity     | Mitigation                                                |
| ---------------------------------------------- | ------------ | --------------------------------------------------------- |
| Genre/Platform/Theme ID가 IGDB ID와 불일치     | **high**     | IGDB ID를 그대로 사용 (autoincrement 아닌 수동 ID 할당)   |
| 기존 DB에 데이터 존재 시 PK 충돌               | medium       | `skipDuplicates: true` 사용 (DB reset 금지)               |
| IGDB rate limit 초과                           | medium       | 요청 간 350ms delay + 429 응답 시 exponential backoff     |
| IGDB offset 상한 10,000                        | **critical** | keyset pagination (`where id > lastId; sort id asc`) 사용 |
| Twitch token 만료                              | medium       | 스크립트 시작 시 매번 새 토큰 발급                        |
| 네트워크 끊김으로 임포트 중단                  | medium       | lastId 로깅으로 재시작 지원 (`--start-id` CLI arg)        |
| Junction FK 누락 (Genre/Platform/Theme 미시딩) | **high**     | seed.ts 먼저 실행하여 참조 데이터 확보                    |
| ScorePolicy 중복 생성                          | **high**     | 시드 데이터에 명시적 ID(1-8) 지정 + skipDuplicates        |
| `@/` path alias tsx 미지원                     | **critical** | 모든 import를 상대 경로로 변경                            |
| `tsx` 미설치                                   | **critical** | `npm install -D tsx` 사전 실행                            |
| Interactive transaction timeout (기본 5s)      | medium       | `$transaction({}, { timeout: 30000 })` 명시               |
| Game 메타데이터 stale                          | low          | known limitation으로 문서화 (향후 upsert 전환 가능)       |

## Success Metrics

- [ ] `npx prisma db seed` 실행 시 에러 없이 완료
- [ ] Genre, Platform, Theme 테이블에 참조 데이터 삽입됨
- [ ] ScorePolicy 테이블에 8개 정책, NotificationType 5개 유형 삽입됨
- [ ] `prisma/seed-data/*.json` 파일의 샘플 데이터 전체 삽입됨
- [ ] 샘플 Member로 로그인 가능 (JSON에 bcrypt 비밀번호 포함)
- [ ] 모든 샘플 데이터의 FK 무결성 확인 (JSON 데이터 간 유효한 참조)
- [ ] 중복 실행해도 에러 없이 완료 (skipDuplicates)
- [ ] `scripts/import-games.ts` 단독 실행 가능
- [ ] 10,000개 이상 임포트 시 안정적 동작
- [ ] Junction 테이블 (genre, platform, theme) 정합성 유지
- [ ] 기존 앱 API (`/api/games`) 정상 동작

## Dependencies

- `prisma/schema.prisma` 스키마가 최신 마이그레이션과 동기화되어 있어야 함
- IGDB 게임 임포트 시 Genre/Platform/Theme이 먼저 시딩되어 있어야 함
- `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` 환경변수 (임포트 스크립트용)
- `tsx` 또는 `ts-node` (스크립트 실행용)
- PostgreSQL DB 접근

## Timeline Estimate

| Phase     | Effort | Description                                                                              |
| --------- | ------ | ---------------------------------------------------------------------------------------- |
| Phase 0   | **S**  | tsx 설치(^4.0.0), prisma generate 확인, DB 백업, Junction unique constraint 마이그레이션 |
| Phase 1   | **M**  | Genre, Platform, Theme, ScorePolicy, NotificationType 시드 활성화                        |
| Phase 2   | **M**  | JSON 샘플 데이터 임포트 + 스키마 동기화 + 실행 순서 재배치                               |
| Phase 3   | **M**  | IGDB 임포트 스크립트 분리 (`scripts/import-games.ts`)                                    |
| Phase 4   | **S**  | 실행 및 검증                                                                             |
| **Total** | **XL** | ~3-4시간                                                                                 |

---

## Git & GitHub Workflow

> **참조 문서**:
>
> - 이슈 body → `.github/ISSUE_TEMPLATE/feature_request.md` 형식을 따른다
> - PR body → `.github/PULL_REQUEST_TEMPLATE.md` 형식을 따른다
> - 브랜치 네이밍, 커밋 컨벤션, 워크플로 → `docs/CODE_CONVENTIONS.md` "Git & Collaboration" 섹션을 따른다

### 이슈 생성

```bash
gh issue create \
  --title "[chore]: prisma/seed.ts 스키마 동기화 + IGDB 임포트 스크립트 분리" \
  --body "## ✅ 어떤 기능인가요?
> prisma/seed.ts를 현재 schema.prisma에 맞게 업데이트하고, 참조 데이터 시드를 활성화하며, IGDB 게임 임포트 로직을 독립 스크립트로 분리한다.

## 🛠 작업 상세 내용
- [ ] Genre/Platform/Theme 시드 활성화 (IGDB ID 하드코딩)
- [ ] ScorePolicy 시드 활성화 (8개 정책, 명시적 ID)
- [ ] NotificationType 시드 활성화 (5개 유형)
- [ ] prisma/seed-data/*.json 샘플 데이터 import + createMany 삽입
- [ ] members.json 스키마 동기화 (isAttended → lastAttendedDate)
- [ ] seed.ts 실행 순서 FK 의존성 기준 재배치
- [ ] scripts/import-games.ts 생성 (fetchAllGames.ts 대체, keyset pagination, skipDuplicates, rate limit)
- [ ] scripts/fetchAllGames.ts 삭제
- [ ] seed.ts에서 IGDB 임포트 로직 제거
- [ ] 실행 검증 (seed + import + 앱 API + 로그인)

## 📚 참고자료(선택)
- dev/active/seed-update/seed-update-plan.md" \
  --label "chore" \
  --assignee "@me"
```

> ⚠️ 실행 후 GitHub이 반환하는 이슈 번호(예: #263)를 확인하고,
> 아래 `<issue-number>` 자리에 해당 번호를 대입하세요.

### 브랜치 생성 & 커밋 & Push

```bash
# 브랜치 생성
git checkout dev && git pull origin dev
git checkout -b chore/#<issue-number>

# Push 전 리베이스
git checkout dev && git pull origin dev
git checkout chore/#<issue-number>
git rebase dev
git push origin chore/#<issue-number>
```

### PR 생성

```bash
gh pr create --base dev \
  --title "[chore/#<issue-number>] prisma/seed.ts 스키마 동기화 + IGDB 임포트 스크립트 분리" \
  --body "## ✨ 작업 개요

prisma/seed.ts를 현재 schema.prisma에 맞게 업데이트하고, IGDB 게임 임포트 로직을 독립 스크립트로 분리

## ✅ 상세 내용

- [x] Genre/Platform/Theme 시드 활성화 (IGDB ID 하드코딩)
- [x] ScorePolicy 시드 활성화 (8개 정책, 명시적 ID)
- [x] NotificationType 시드 활성화 (5개 유형)
- [x] prisma/seed-data/*.json 샘플 데이터 import + createMany 삽입
- [x] members.json 스키마 동기화 (isAttended → lastAttendedDate)
- [x] seed.ts 실행 순서 FK 의존성 기준 재배치
- [x] scripts/import-games.ts 생성 (keyset pagination, skipDuplicates, rate limit 350ms)
- [x] scripts/fetchAllGames.ts 삭제 (import-games.ts로 대체)
- [x] seed.ts에서 IGDB 임포트 로직 제거

## 🧪 확인 사항

- [ ] npx prisma db seed 실행 시 에러 없이 완료
- [ ] 참조 테이블(Genre, Platform, Theme)에 데이터 정상 삽입
- [ ] 샘플 Member로 로그인 가능 (JSON에 bcrypt 비밀번호 포함)
- [ ] prisma/seed-data/*.json 샘플 데이터 전체 삽입 확인
- [ ] npx tsx scripts/import-games.ts 단독 실행 가능
- [ ] 중복 실행해도 에러 없이 완료
- [ ] 기존 앱 API (/api/games) 정상 동작

## 🙏 기타 참고 사항

seed.ts: 참조 데이터 시딩 전용 / scripts/import-games.ts: IGDB 대량 임포트 전용

## 이슈 관리

close #<issue-number>" \
  --assignee "@me" --label "chore"
```

> ⚠️ PR의 Assignees, Labels, Projects는 연결된 Issue와 동일하게 설정한다.

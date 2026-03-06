# Seed Update & IGDB Game Import — Task Checklist

> Last Updated: 2026-03-07
> **STATUS: COMMITTED (`660a49e` on `chore/#259`)** — PR to `dev` remaining

## Phase 0: 사전 준비 (DB 백업 + 의존성 + 마이그레이션)

- [x] **T0.0** `tsx` devDependency 설치 + prisma generate 확인 — AC: PASS
- [x] **T0.1** DB 백업 실행 — 사용자 수동 실행 완료 (2026-03-07)
- [x] **T0.2** Junction 테이블 compound unique constraint 마이그레이션 — AC: PASS
    - 사용자가 `npx prisma migrate dev --name add_junction_unique_constraints` 직접 실행

## Phase 1: seed.ts 정비

- [x] **T1.0** seed.ts import 경로 전체 수정 — AC: PASS
- [x] **T1.1** Genre 시드 데이터 하드코딩 — AC: PASS
- [x] **T1.2** Platform 시드 데이터 하드코딩 — AC: PASS
- [x] **T1.3** Theme 시드 데이터 하드코딩 — AC: PASS
- [x] **T1.4** ScorePolicy 시드 데이터 (실제 DB 순서) — AC: PASS
- [x] **T1.5** package.json에 `prisma.seed` 설정 추가 — AC: PASS
- [x] **T1.6** PG sequence 동기화 (T2.5에서 통합) — AC: PASS

## Phase 2: JSON 샘플 데이터 임포트

- [x] **T2.0** JSON 데이터 DB에서 추출 — AC: PASS
- [x] **T2.1** seed.ts 실행 순서 재배치 + JSON import 구조 — AC: PASS
- [x] **T2.2** members.json 스키마 동기화 확인 — AC: PASS
- [x] **T2.3** NotificationType 시드 활성화 — AC: PASS
- [x] **T2.4** 전체 JSON 샘플 데이터 삽입 코드 — AC: PASS
- [x] **T2.5** PG sequence 자동 동기화 코드 — AC: PASS

## Phase 3: IGDB 게임 임포트 스크립트 분리

- [x] **T3.1** `scripts/import-games.ts` 파일 생성 — AC: PASS
- [x] **T3.2** `scripts/fetchAllGames.ts` 삭제 — AC: PASS
- [x] **T3.3** seed.ts에서 IGDB 임포트 로직 제거 — AC: PASS
- [x] **T3.4** `utils/GetTwitchAccessToken.ts` 버그 수정 — AC: PASS

## Phase 4: 검증

- [x] **T4.1** `npx prisma db seed` 실행 검증 — AC: PASS
    - 참조 데이터 + 샘플 데이터 + 시퀀스 동기화 성공
    - **버그 발견 및 수정**: Prisma 6은 `Z` suffix 없는 DateTime 거부 → `fixDates()` 헬퍼 추가
- [x] **T4.2** 소규모 임포트 테스트 (500건) — AC: PASS
    - `npx tsx scripts/import-games.ts --limit 500` → 500 games (IDs 633→1414)
- [x] **T4.3** 대규모 임포트 실행 (--full) — AC: PASS
    - **223,929 games** imported (lastId: 393964)
- [x] **T4.4** DB 데이터 접근 확인 — AC: PASS
    - 224,929 total games, 441K genre links, 287K platform links, 215K theme links
    - 참고: dev server 미실행 상태로 HTTP API 테스트는 미수행. DB 쿼리로 대체 검증
- [x] **T4.5** DB 데이터 무결성 최종 확인 — AC: PASS

## Remaining Work

- [x] **Commit**: `660a49e` on `chore/#259` (pushed)
- [x] **PR 생성**: `chore/#259` → `dev` (PR template 사용)
- [x] (Optional) dev server 실행 후 `/api/games` HTTP 테스트 — AC: PASS (2026-03-07)
    - `GET /api/games?page=1&size=3` → 3 games, totalCount: 224,929
    - `GET /api/games?meta=true` → 23 genres, 22 themes, 9 platforms
    - `GET /api/games?genreId=12&sort=recent` → RPG filter: 34,763 results
    - `GET /api/games?keyword=zelda` → 102 results
    - `GET /api/games/7346` → Zelda BotW detail with genres/themes/platforms

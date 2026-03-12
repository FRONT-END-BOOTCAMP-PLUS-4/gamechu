# Seed Update & IGDB Game Import — Context

> Last Updated: 2026-03-07
> Status: **COMMITTED on `chore/#259`** — PR to `dev` remaining

## Implementation State

**모든 코드 변경 및 검증 완료. 커밋 완료 (`660a49e`). PR 생성만 남음.**
- Branch: `chore/#259` (pushed to origin)
- Commit: `660a49e [chore/#259] seed.ts 재구성 + IGDB 임포트 스크립트 분리`
- Parent branch: `chore/#257` (PR #258, not yet merged into `dev`)

## Files Modified (cumulative)

| File | Change | Status |
|------|--------|--------|
| `prisma/seed.ts` | Complete rewrite: reference data upserts + JSON sample data import via `$transaction` + PG sequence sync + `fixDates()` helper | Done |
| `prisma/schema.prisma` | Added `@@unique` on 3 junction tables | Done, **migrated** |
| `scripts/import-games.ts` | New file: standalone IGDB game import with keyset pagination, rate limiting, CLI args | Done |
| `scripts/fetchAllGames.ts` | Deleted (replaced by import-games.ts) | Done |
| `package.json` | Added `"prisma": { "seed": "npx tsx prisma/seed.ts" }` + `tsx@^4.21.0` devDep | Done |
| `package-lock.json` | Updated by npm install tsx | Done |
| `utils/GetTwitchAccessToken.ts` | Fixed bug: `tokenRes.text` -> `await tokenRes.text()` | Done |

## Key Decisions Made

### Prisma 6 DateTime Fix (discovered 2026-03-07)
- **Problem**: Prisma 6 rejects DateTime strings without timezone suffix (e.g., `"2000-01-01T00:00:00"`)
- **Error**: `Invalid value for argument 'birthDate': premature end of input. Expected ISO-8601 DateTime.`
- **Fix**: Added `fixDates()` helper in seed.ts that appends `Z` to date strings matching `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/`
- Applied to: members, games, reviews, arenas, chattings, scoreRecords
- Not needed for: junction tables, reviewLikes, wishlists, votes, preferred* (no DateTime fields)

### ScorePolicy ID Ordering (Critical)
- Actual DB: ID 4 = 투기장 참여 (-100), ID 5 = 투기장 승리 (190), ..., ID 8 = 리뷰 좋아요 삭제 (-5)
- Original code comments had different order — used actual DB ordering

### Other Decisions (from previous session)
- JSON loading: `readFileSync` + `JSON.parse` (not ESM import)
- Junction table snake_case → camelCase mapping via `.map()`
- Transaction: batch `$transaction([...])` for sample data, interactive for import script

## Verification Results (2026-03-07)

| Check | Result |
|-------|--------|
| `npx prisma db seed` | PASS — all reference + sample data |
| Import 500 games | PASS — IDs 633→1414 |
| Full import | PASS — **223,929 games** (lastId: 393964) |
| DB counts | 224,929 games, 441K gameGenres, 287K gamePlatforms, 215K gameThemes |
| Sample data | 6 members, 11 arenas, 8 reviews, 343 scoreRecords |

## Next Steps

1. ~~**Commit all changes**~~ — **DONE** (`660a49e` on `chore/#259`)
2. **Create PR** to `dev` (use `.github/PULL_REQUEST_TEMPLATE.md` format)
   - Base: `dev`, Head: `chore/#259`
   - Note: depends on `chore/#257` (PR #258) — merge order matters
3. ~~(Optional) Test `/api/games` with running dev server~~ — **DONE** (2026-03-07)
   - All endpoints verified: list, meta, genre filter, keyword search, detail
4. Move task folder from `dev/active/` to completed or delete after PR merge

## IGDB Import Script Reference

```bash
# Incremental (from last imported ID)
npx tsx scripts/import-games.ts

# With limit
npx tsx scripts/import-games.ts --limit 500

# Full import
npx tsx scripts/import-games.ts --full

# From specific ID
npx tsx scripts/import-games.ts --start-id 50000 --limit 1000
```

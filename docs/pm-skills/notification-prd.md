# Product Requirements Document: In-App Notification System

**Author**: Kwon Woojin
**Date**: 2026-04-15
**Status**: Draft → Ready for Implementation
**Stakeholders**: Dev (solo)

---

### 1. Executive Summary

Gamechu has a fully scaffolded notification infrastructure (DB schema, backend use cases, UI modal, API routes) but zero triggers are wired — no notification is ever created. This PRD specifies completing the system by updating the 5 confirmed notification type icons, adding an unread badge to the bell icon, and wiring each trigger so users are informed of high-signal moments: arena lifecycle milestones and tier changes.

---

### 2. Background & Context

The notification UI and backend were built as part of an earlier sprint but never connected to real events. As a result:
- The bell icon in the header opens an empty modal for every user.
- Users have no in-product signal when they are promoted/relegated in tier, when a challenger joins their arena, when their arena starts, or when it finishes.
- There is no unread count badge, so even if notifications existed, users would have no reason to open the modal.

Discovery confirmed (see `docs/pm-skills/notification-discovery.md`):
- 5 trigger types are finalized and already seeded in DB.
- Review liked was excluded due to spam risk.
- The notification infrastructure is complete; only icon assets, badge, and trigger wiring are missing.

---

### 3. Notification Types (DB — already seeded)

| id | name (DB) | Trigger | DB icon (current) | Better icon (SVG) |
|----|-----------|---------|-------------------|-------------------|
| 1 | 티어 승급 | Tier promote | `/icons/Promote.ico` | `/icons/promotion.svg` |
| 2 | 티어 강등 | Tier relegation | `/icons/Relegation.ico` | `/icons/relegation.svg` |
| 3 | 투기장 도전자 참여 완료 | Challenger joins arena | `/icons/ArenaMatching.ico` | `/icons/recruitComplete.svg` |
| 4 | 투기장 토론 시작 | Arena goes active (status 1→3) | `/icons/AranaStart.ico` ⚠️ typo | `/icons/debateStart.svg` |
| 5 | 투기장 투표 완료 | Arena finishes (status→5) | `/icons/ArenaFinish.ico` | `/icons/voteComplete.svg` |

**Action**: Run a DB migration to update `image_url` for all 5 types to the SVG paths. Fix the typo in type 4 (`AranaStart` → `ArenaStart`) while at it.

---

### 4. Objectives & Success Metrics

**Goals**:
1. Every user receives a notification for each of the 5 trigger events.
2. The bell icon shows an unread count so users discover the modal.
3. Notifications are visually differentiated by type using SVG icons.

**Non-Goals**:
- Email or browser push notifications — in-app only.
- Notification preferences / opt-out toggles.
- Real-time delivery via Socket.IO — TanStack Query polling is sufficient for MVP.
- Review liked notification — excluded by design.
- Read/unread state per record — unread count = total record count (no `isRead` field needed).

**Success Metrics**:

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Notification records created per arena lifecycle | 0 | 2 per participant per completed arena | DB count |
| Bell modal open rate | Unknown baseline | Increases after badge ships | Request logs on GET endpoint |
| Notification types with SVG icons | 0 / 5 | 5 / 5 | DB `image_url` check |

---

### 5. Target Users & Segments

- **Arena hosts** — need Challenger Arrival and Arena Start signals.
- **Arena challengers** — need Arena Start and Arena Finished signals.
- **All ranked users** — need Tier Promote and Tier Relegation signals.

---

### 6. User Stories & Requirements

**P0 — Must Have**

| # | User Story | Acceptance Criteria |
|---|-----------|---------------------|
| 1 | As a user, I see an unread count badge on the bell icon | Badge shows `totalCount`; visible whenever records exist |
| 2 | As an arena owner, I receive a notification when a challenger joins | `NotificationRecord` created for `arena.creatorId`; typeId = 3 |
| 3 | As a participant, I receive a notification when my arena starts | `NotificationRecord` created for both players when status → 3; typeId = 4 |
| 4 | As a participant, I receive a notification when my arena finishes | `NotificationRecord` created for both players when status → 5; typeId = 5 |
| 5 | As a user, I receive a notification when my tier is promoted | `NotificationRecord` created when score delta causes tier upgrade; typeId = 1 |
| 6 | As a user, I receive a notification when my tier is relegated | `NotificationRecord` created when score delta causes tier downgrade; typeId = 2 |
| 7 | As a user, I see distinct SVG icons on each notification card | All 5 `imageUrl` values updated to `.svg` paths; icons render in `NotificationRecordItem` |

**P1 — Should Have**

| # | User Story | Acceptance Criteria |
|---|-----------|---------------------|
| 8 | Notification descriptions include the game/arena name | Description strings use arena game title, e.g. "○○ 투기장 토론이 시작되었습니다." |

**P2 — Nice to Have / Future**

| # | User Story | Acceptance Criteria |
|---|-----------|---------------------|
| 9 | Real-time badge update via Socket.IO | Bell count updates without page refresh |
| 10 | Per-type notification preferences | User can toggle each type on/off |
| 11 | Read/unread state | Badge clears on modal open; `isRead` field on `NotificationRecord` |

---

### 7. Solution Overview

#### 7a. Icon migration
Update all 5 `NotificationType.imageUrl` values in DB via Prisma migration or seed script.

#### 7b. Unread badge

`totalCount` is already returned by `GET /api/member/notification-records` (page 1).
- Add a dedicated lightweight hook `useNotificationCount` that fetches page 1 and reads `totalCount`.
- Or reuse the existing `useNotifications(1)` result and read `.totalCount` from the store/context.
- Render badge on the bell icon in `Header.tsx` when `totalCount > 0`.

> **Open Q4 resolution**: Use `totalCount` from the existing paginated endpoint (page 1 call) — no new endpoint needed. Evaluate if a dedicated `GET .../count` route is warranted after usage patterns emerge.

#### 7c. Trigger wiring (all inside `ArenaTimerRecovery.ts → transitionArena`)

The arena status machine lives entirely in `lib/ArenaTimerRecovery.ts`. All automatic status transitions go through `transitionArena()`. This is the single insertion point for arena notifications.

**Status map:**
```
1 (Recruiting) → 2 (Challenger joined)  ← set by join/route.ts
2 → 3 (Debate active)                   ← timer: startDate
3 → 4 (Voting)                           ← timer: startDate + 30 min
4 → 5 (Finished)                         ← timer: startDate + 30 min + 24 h
```

| Trigger | Where to add | Recipient(s) | typeId |
|---------|-------------|--------------|--------|
| Challenger Arrival | `UpdateArenaStatusUsecase.execute()`, `status === 2` branch — after `updateChallengerAndStatus` | `arena.creatorId` | 3 |
| Arena Start | `transitionArena()` in `ArenaTimerRecovery.ts`, after `updateArenaStatusUsecase.execute()` when `newStatus === 3` | `arena.creatorId` + `arena.challengerId` | 4 |
| Arena Finished | `transitionArena()`, after `endArenaUsecase.execute()` when `newStatus === 5` | `arena.creatorId` + `arena.challengerId` | 5 |

#### 7d. Tier change detection

`ApplyArenaScoreUsecase.execute()` calls `memberRepository.incrementScore(memberId, delta)` but does not know the member's current score or tier. To detect a tier change:

1. **Before** `incrementScore`: fetch `member.score` → compute `oldTier = getTier(member.score)`
2. **After** `incrementScore`: fetch updated `member.score` → compute `newTier = getTier(newScore)`
3. If `oldTier.id !== newTier.id`:
   - `newTier > oldTier` → create Tier Promote notification (typeId = 1)
   - `newTier < oldTier` → create Tier Relegation notification (typeId = 2)

`ApplyArenaScoreUsecase` already receives `memberRepository` — extend its interface to expose `findById` (or `getScore`) alongside `incrementScore`, and inject `NotificationRecordRepository` for the create call.

#### 7e. Description strings (Korean)

| typeId | Description template |
|--------|---------------------|
| 3 | `"[게임명] 투기장에 도전자가 참여했습니다."` |
| 4 | `"[게임명] 투기장 토론이 시작되었습니다."` |
| 5 | `"[게임명] 투기장 투표가 완료되었습니다."` |
| 1 | `"티어가 [이전티어] → [신규티어]로 승급했습니다."` |
| 2 | `"티어가 [이전티어] → [신규티어]로 강등되었습니다."` |

---

### 8. Open Questions

All previously open questions are now resolved:

| # | Question | Resolution |
|---|----------|------------|
| Q1 | Icon assets | 5 SVG equivalents exist in `public/icons/` — update DB `image_url` values |
| Q2 | Arena active hook point | Single: `transitionArena()` in `ArenaTimerRecovery.ts` when `newStatus === 3` |
| Q3 | Tier change hook | `ApplyArenaScoreUsecase` — compare `getTier()` before/after `incrementScore` |
| Q4 | Unread count source | Use `totalCount` from existing paginated GET page-1 response; no new endpoint |

---

### 9. Timeline & Phasing

**Phase 1 — Foundation (Day 1)**
- [ ] DB migration: update all 5 `NotificationType.imageUrl` to SVG paths (fix typo in type 4)
- [ ] Ship unread badge on bell icon using `totalCount` from existing endpoint

**Phase 2 — Arena Triggers (Day 2–3)**
- [ ] Wire Challenger Arrival in `UpdateArenaStatusUsecase` (`status === 2` branch)
- [ ] Wire Arena Start in `transitionArena()` (`newStatus === 3`)
- [ ] Wire Arena Finished in `transitionArena()` (`newStatus === 5`)
- [ ] Manual QA: full arena lifecycle produces correct notifications for both players

**Phase 3 — Tier Triggers (Day 4)**
- [ ] Extend `ApplyArenaScoreUsecase` to detect tier change before/after `incrementScore`
- [ ] Inject `NotificationRecordRepository` and `CreateNotificationRecordUsecase`
- [ ] Manual QA: score change that crosses tier boundary creates correct notification

**Phase 4 — Retrospective**
- Review modal open rate after badge ships
- Decide: Socket.IO real-time delivery vs. notification preferences vs. read/unread state

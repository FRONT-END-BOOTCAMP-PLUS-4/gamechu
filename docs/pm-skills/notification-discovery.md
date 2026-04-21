# Discovery Plan: Notification Feature

**Date**: 2026-04-14
**Product Stage**: Existing product (feature addition)
**Discovery Question**: Which notification trigger events matter most to Gamechu users, and how should they be delivered?

---

## Codebase Context (What's Already Built)

The notification infrastructure is scaffolded but not yet wired to any events:

| Layer | Status |
|-------|--------|
| DB schema: `NotificationType` + `NotificationRecord` | ✅ Exists |
| Backend: usecase / domain / infra layers | ✅ Exists |
| API: `GET /api/member/notification-records` + `DELETE .../[id]` | ✅ Exists |
| UI: `NotificationModal`, `NotificationRecordList`, `NotificationRecordItem` | ✅ Exists |
| Hook: `useNotifications` | ✅ Exists |
| Notification type seed data | ❌ Empty |
| Any trigger that calls `CreateNotificationRecordUsecase` | ❌ None |
| Unread count badge on bell icon | ❌ Missing |
| Real-time delivery via Socket.IO | ❌ Not connected |

---

## Defined Notification Types

These 5 types are confirmed and must be seeded into `NotificationType`:

| # | Type Name | Trigger Event |
|---|-----------|---------------|
| 1 | **Tier Promote** | User's tier increases after score recalculation |
| 2 | **Tier Relegation** | User's tier decreases after score recalculation |
| 3 | **Arena Challenger Arrival** | A challenger joins the user's arena |
| 4 | **Arena Start** | Arena status transitions to active (both players ready) |
| 5 | **Arena Finished** | Arena ends (timer expiry or manual close) |

---

## Ideas Explored

| # | Idea | Lens |
|---|------|------|
| 1 | Arena Challenger Arrival — notify arena owner when someone joins | PM |
| 2 | Arena Start — notify both players when arena goes active | PM |
| 3 | Arena Finished — notify both players when arena ends with result | PM |
| 4 | Tier Promote / Relegation — notify user on tier change after scoring | PM |
| 5 | Unread badge on bell icon — show count in header | Designer |
| 6 | Real-time delivery via Socket.IO | Eng |
| 7 | Notification preferences per user | PM |
| 8 | Weekly digest email | PM |

> **Excluded**: Review liked — high spam risk with low incremental value.

---

## Selected Ideas for Validation

| # | Idea | Rationale |
|---|------|-----------|
| 1 | Arena Challenger Arrival | Highest urgency signal; owner must know a match started |
| 2 | Arena Start | Both players need a clear "game on" signal |
| 3 | Arena Finished | Closes the core game loop; drives return to check results |
| 4 | Tier Promote / Relegation | High-emotion moments; strongest retention driver |
| 5 | Unread badge | Usability prerequisite — users have no visual cue today |

---

## Critical Assumptions

| # | Assumption | Category | Impact | Uncertainty | Priority |
|---|-----------|----------|--------|-------------|----------|
| A1 | Users don't discover the modal without a visible badge | Usability | High | High | P0 |
| A2 | Arena join (`POST .../join`) is a single hook point for challenger arrival notification | Feasibility | High | High | P0 |
| A3 | Arena end is a single deterministic event (timer or PATCH handler) | Feasibility | High | Medium | P1 |
| A4 | Arena start has a single identifiable status-transition hook | Feasibility | High | Medium | P1 |
| A5 | Tier change is computed in one place and produces a clear up/down delta | Feasibility | High | Medium | P1 |
| A6 | In-app notifications are sufficient for MVP (no push/email needed yet) | Value | High | Low | P2 |

---

## Validation Experiments

| # | Tests | Method | Success Criteria | Effort | Timeline |
|---|-------|--------|-----------------|--------|----------|
| E1 | A1 (badge usability) | Add `unreadCount` to GET response; render badge on bell icon | Modal open rate increases | 0.5 day | Week 1 |
| E2 | A2 (challenger arrival hook) | Audit `POST /api/arenas/[id]/join` — trace all code paths | Single insertion point confirmed | 2h | Week 1 |
| E3 | A3 (arena end hook) | Audit timer/end handler and any PATCH arena-status routes | Single deterministic end event confirmed | 2h | Week 1 |
| E4 | A4 (arena start hook) | Audit status-transition to active — confirm single path | Single insertion point confirmed | 2h | Week 1 |
| E5 | A5 (tier change hook) | Audit tier recalculation logic — confirm single up/down delta computation | Clear up/down delta at one code location | 2h | Week 1 |

---

## Experiment Details

### E1 — Unread Badge
- **Hypothesis**: Users open the notification modal more when a count badge is visible on the bell icon.
- **Setup**: Extend GET response to include `unreadCount` (count of all records for the user). Add red badge to `Header.tsx` bell icon.
- **Measurement**: Log modal open events; compare before vs. after badge.
- **Decision**: Opens increase → badge is the right unlock. Flat → investigate discoverability further before adding more triggers.

### E2 — Arena Challenger Arrival Hook
- **Hypothesis**: `POST /api/arenas/[id]/join` has one clean exit path for inserting a notification to the arena owner.
- **Setup**: Read `app/api/arenas/[id]/join/route.ts`; trace all code paths.
- **Decision**: Single path → wire `CreateNotificationRecordUsecase` directly. Multiple paths → introduce a `NotificationService` called from all paths.

### E3 — Arena Finished Hook
- **Hypothesis**: Arena end is triggered at one deterministic place (timer expiry or manual close handler).
- **Setup**: Trace arena status-update handlers, the timer chain, and any PATCH routes that set arena to ended state.
- **Decision**: Single path → wire notification there. Multiple paths → identify canonical end event first.

### E4 — Arena Start Hook
- **Hypothesis**: The transition to "active" status happens in one place.
- **Setup**: Search for arena status transition logic (e.g., status update when challenger joins and conditions are met).
- **Decision**: Single path → wire notification. Multiple paths → centralize before wiring.

### E5 — Tier Change Hook
- **Hypothesis**: Tier recalculation produces a clear up/down delta at one code location.
- **Setup**: Trace scoring / tier recalculation logic; look for where old tier vs. new tier are compared.
- **Decision**: Single location with delta → wire Promote/Relegation notification based on sign. Scattered → aggregate first.

---

## Discovery Timeline

| Week | Activity | Output |
|------|----------|--------|
| Week 1 | E2–E5 hook audits | Go/no-go decision on each trigger wiring |
| Week 1 | Seed 5 `NotificationType` rows + icons | Modal renders typed items correctly |
| Week 1–2 | E1 — unread badge shipped | Bell icon shows count; baseline established |
| Week 2 | Wire Arena Challenger Arrival (#2) | First real notifications in prod |
| Week 2 | Wire Arena Start (#3) | Players get "game on" signal |
| Week 2 | Wire Arena Finished (#4) | Arena loop fully closed |
| Week 3 | Wire Tier Promote / Relegation (#1, #5) | Highest-emotion notifications live |
| Week 3 | Retrospective | Decide: real-time Socket.IO delivery or preferences UI next |

---

## Decision Framework

- E2 single path → wire challenger arrival in `join/route.ts` directly
- E2 multiple paths → introduce `NotificationService` wrapper first
- E3 single end event → wire Arena Finished in timer/end handler
- E4 single start transition → wire Arena Start at status flip
- E5 clear delta → wire Tier Promote (delta > 0) / Relegation (delta < 0) at recalculation site
- E1 badge causes no open-rate increase → run user interview before building more triggers
- All Week 1 audits pass → proceed to implementation sprint

---

## Recommended Next Steps

1. **Audit** all 4 hook points (E2–E5) — ~8h total
2. **Seed** 5 `NotificationType` rows and confirm modal renders with icons
3. **Ship** unread badge (E1) as immediate quick win
4. **Wire** triggers in order: Challenger Arrival → Arena Start → Arena Finished → Tier changes
5. After all 5 types live → evaluate real-time Socket.IO delivery

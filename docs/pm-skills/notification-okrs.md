# Team OKRs: Gamechu Notification Feature — Q2 2026

**Aligned to**: Improve user engagement and retention by closing product feedback loops

---

### Objective 1: Make users feel informed at every critical moment of their Gamechu journey

| # | Key Result | Baseline | Target | Owner |
|---|-----------|----------|--------|-------|
| KR1 | Notification records created per completed arena lifecycle (both players) | 0 | 6 records (3 types × 2 players) | Dev |
| KR2 | Notification records created per tier-change event | 0 | 1 record per affected user | Dev |
| KR3 | All 5 `NotificationType` rows using SVG icons (no `.ico`) | 0 / 5 | 5 / 5 | Dev |

---

### Objective 2: Surface notifications so users actually discover them

| # | Key Result | Baseline | Target | Owner |
|---|-----------|----------|--------|-------|
| KR1 | Unread badge visible on bell icon when records exist | Not implemented | Shipped and rendering correctly | Dev |
| KR2 | Bell modal open rate (GET endpoint request rate per DAU) | Unknown (establish baseline in Week 1) | Measurable increase vs. pre-badge baseline by end of phase | Dev |
| KR3 | Notification modal shows correct type icon + name for all 5 types | 0 / 5 renderable | 5 / 5 confirmed via manual QA | Dev |

---

### Objective 3: Ship a notification system that is correct, traceable, and safe to extend

| # | Key Result | Baseline | Target | Owner |
|---|-----------|----------|--------|-------|
| KR1 | All trigger insertion points are single, isolated hook locations (no scattered calls) | 0 wired | 3 arena triggers in `transitionArena()` + 1 tier trigger in `ApplyArenaScoreUsecase` | Dev |
| KR2 | Tier change detection covered by unit tests (before/after `getTier` comparison) | 0 tests | ≥2 tests: one promote case, one relegation case | Dev |
| KR3 | No new notification-related API endpoint exposed publicly (creation is server-side only) | Secure (POST endpoint previously removed) | Remains secure after all wiring | Dev |

---

### Alignment Map

```
Product Goal: Close feedback loops → keep users engaged
  └─ O1: Inform users at key moments
       └─ KR1-3: All 5 trigger types fire correctly
  └─ O2: Make notifications discoverable
       └─ KR1-3: Badge + icons drive modal opens
  └─ O3: Ship correctly, safely, extendably
       └─ KR1-3: Single hook points, tested, secure
```

---

### Scoring Guide

| Score | Meaning |
|-------|---------|
| 0.0–0.3 | Significant miss — investigate root cause |
| 0.4–0.6 | Progress made but fell short |
| 0.7–0.9 | Well-calibrated stretch — target zone |
| 1.0 | Nailed it or target wasn't ambitious enough |

---

### Check-in Cadence (adapted for solo dev)

- **End of each phase**: Score KRs for that phase before moving to next
- **End of Phase 2** (after all arena triggers): Deep review — are notifications firing correctly in staging?
- **End of Phase 3** (after tier triggers): Full score, retrospective, feed into next feature decision (Socket.IO real-time vs. preferences UI)

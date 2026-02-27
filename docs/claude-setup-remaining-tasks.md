# Claude Code Setup — Remaining Tasks

These tasks continue the `.claude/` integration setup. Execute them in order.

---

## Task 1: Adapt frontend-dev-guidelines Skill Content

The skill triggers are already configured for GameChu, but the **content** (SKILL.md + resource files) still teaches MUI v7, TanStack Query, and TanStack Router patterns that don't apply.

**Files to rewrite:**
- `.claude/skills/frontend-dev-guidelines/SKILL.md`
- `.claude/skills/frontend-dev-guidelines/resources/component-patterns.md`
- `.claude/skills/frontend-dev-guidelines/resources/common-patterns.md`
- `.claude/skills/frontend-dev-guidelines/resources/complete-examples.md`
- `.claude/skills/frontend-dev-guidelines/resources/data-fetching.md`
- `.claude/skills/frontend-dev-guidelines/resources/file-organization.md`
- `.claude/skills/frontend-dev-guidelines/resources/loading-and-error-states.md`
- `.claude/skills/frontend-dev-guidelines/resources/performance.md`
- `.claude/skills/frontend-dev-guidelines/resources/routing-guide.md`

**What to replace:**
| Current (wrong for GameChu) | Replace with |
|---|---|
| MUI v7 (`<Grid>`, `sx` prop, `@mui/material`) | TailwindCSS utility classes |
| TanStack Query (`useSuspenseQuery`) | Next.js Server Components + `fetch` + SWR/client fetch patterns |
| TanStack Router | Next.js App Router (`app/` directory, `useRouter`, `Link`) |
| Zustand is not mentioned | Add Zustand state management patterns (`stores/`) |
| `features/` directory pattern | GameChu's `app/(base)/`, `app/components/`, `hooks/`, `stores/` |

**Reference for GameChu's actual stack:**
- Frontend: Next.js 15 App Router, React 19, TypeScript, TailwindCSS 3, Zustand
- Directory: `app/(auth)/`, `app/(base)/`, `app/components/`, `hooks/`, `stores/`
- Data fetching: Server Components for reads, API routes for mutations
- Auth: NextAuth.js v4 with JWT sessions

**How to do it:**
1. Read each resource file
2. Read 2-3 actual GameChu frontend files to understand real patterns (e.g., `app/(base)/page.tsx`, a component in `app/components/`, a hook in `hooks/`, a store in `stores/`)
3. Rewrite each resource file using GameChu's actual patterns as examples
4. Keep the overall structure and section headings — just replace framework-specific code and guidance

---

## Task 2: Adapt backend-dev-guidelines Skill Content

The skill teaches Express.js patterns, but GameChu uses Next.js API route handlers.

**Files to rewrite:**
- `.claude/skills/backend-dev-guidelines/SKILL.md`
- `.claude/skills/backend-dev-guidelines/resources/architecture-overview.md`
- `.claude/skills/backend-dev-guidelines/resources/routing-and-controllers.md`
- `.claude/skills/backend-dev-guidelines/resources/services-and-repositories.md`
- `.claude/skills/backend-dev-guidelines/resources/database-patterns.md`
- `.claude/skills/backend-dev-guidelines/resources/middleware-guide.md`
- `.claude/skills/backend-dev-guidelines/resources/validation-patterns.md`
- `.claude/skills/backend-dev-guidelines/resources/async-and-errors.md`
- `.claude/skills/backend-dev-guidelines/resources/configuration.md`
- `.claude/skills/backend-dev-guidelines/resources/sentry-and-monitoring.md`
- `.claude/skills/backend-dev-guidelines/resources/complete-examples.md`
- `.claude/skills/backend-dev-guidelines/resources/testing-guide.md`

**What to replace:**
| Current (wrong for GameChu) | Replace with |
|---|---|
| Express `router.get()` / `app.get()` | Next.js `export async function GET(req: NextRequest)` |
| Express middleware | Next.js middleware (`middleware.ts`) |
| BaseController pattern | Direct route handler pattern (instantiate repo + usecase inline) |
| `unifiedConfig` / DI container | Inline instantiation per request |
| Service names (`blog-api`, etc.) | GameChu's feature modules |

**What to keep (still applies):**
- Clean Architecture layers: `application/usecase/`, `domain/repositories/`, `infra/repositories/prisma/`
- Repository pattern with Prisma implementations
- Use case classes with DTOs
- Redis caching patterns (arena feature)
- Error handling philosophy

**Reference for GameChu's actual backend:**
- API routes: `app/api/` (Next.js serverless handlers)
- Business logic: `backend/[feature]/application/usecase/`, `domain/repositories/`, `infra/repositories/prisma/`
- Prisma client: `@/prisma/generated` (NOT `@prisma/client`)
- Redis: `lib/redis.ts` + `lib/cacheKey.ts` + `backend/arena/infra/cache/ArenaCacheService.ts`
- Auth: `utils/GetAuthUserId.server.ts` / `.client.ts`

**How to do it:**
1. Read each resource file
2. Read 2-3 actual GameChu backend files to understand real patterns (e.g., `app/api/arenas/[id]/route.ts`, a usecase in `backend/arena/application/usecase/`, a repository in `backend/arena/infra/repositories/prisma/`)
3. Rewrite each resource file with GameChu's actual patterns
4. Keep the architecture principles — just update the framework-specific code

---

## Task 3: Audit Agents for Hardcoded Paths

Check all 11 agent files for hardcoded paths that reference the showcase project instead of GameChu.

**Files to check:**
- `.claude/agents/auth-route-debugger.md`
- `.claude/agents/auth-route-tester.md`
- `.claude/agents/auto-error-resolver.md`
- `.claude/agents/code-architecture-reviewer.md`
- `.claude/agents/code-refactor-master.md`
- `.claude/agents/documentation-architect.md`
- `.claude/agents/frontend-error-fixer.md`
- `.claude/agents/plan-reviewer.md`
- `.claude/agents/refactor-planner.md`
- `.claude/agents/web-research-specialist.md`
- `.claude/agents/README.md`

**What to look for and fix:**
- `~/git/...` or `/root/git/...` → replace with `.` or remove
- Hardcoded service names (`blog-api`, `auth-service`, etc.) → replace with GameChu paths
- Screenshot paths → use project-relative paths
- References to Express/middleware → update to Next.js patterns if relevant
- References to JWT cookie auth → update to NextAuth.js session pattern if relevant

---

## Task 4: Audit Slash Commands for Path References

**Files to check:**
- `.claude/commands/dev-docs.md`
- `.claude/commands/dev-docs-update.md`
- `.claude/commands/route-research-for-testing.md`

**What to look for:**
- `dev/active/` path references — does this directory exist in GameChu? If not, update to `docs/` or wherever dev documentation should go
- Service path references — update to GameChu's structure
- Any showcase-specific assumptions

---

## Task 5: Decide on error-tracking Skill

GameChu's CLAUDE.md does not mention Sentry. Check if Sentry is actually used:

```bash
grep -r "sentry" --include="*.ts" --include="*.tsx" --include="*.json" . | head -10
```

- **If Sentry is used:** Keep the skill, update paths
- **If NOT used:** Remove `.claude/skills/error-tracking/` and remove the `error-tracking` entry from `.claude/skills/skill-rules.json`

---

## Task 6: Decide on route-tester Skill

The route-tester skill assumes raw JWT cookie auth. GameChu uses NextAuth.js v4 with JWT sessions. Check if the skill's testing approach works:

1. Read `.claude/skills/route-tester/SKILL.md` (if it exists, or check the route-tester skill definition)
2. Compare with GameChu's actual auth pattern in `lib/auth/authOptions.ts`
3. Either adapt the skill for NextAuth.js sessions or remove it

---

## Task 7: Cleanup

After all above tasks are done:

1. **Delete unused hook files** (no longer wired in settings.json):
   - `.claude/hooks/tsc-check.sh`
   - `.claude/hooks/trigger-build-resolver.sh`
   - `.claude/hooks/stop-build-check-enhanced.sh`

2. **Delete the integration guide** (no longer needed):
   - `CLAUDE_INTEGRATION_GUIDE.md`

3. **Delete this file:**
   - `docs/claude-setup-remaining-tasks.md`

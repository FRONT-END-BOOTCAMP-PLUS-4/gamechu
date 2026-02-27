# .claude/ Integration Test Plan

How to verify that every skill, hook, agent, and command in `.claude/` works correctly for the GameChu project.

---

## 1. Hooks

### 1-1. skill-activation-prompt (UserPromptSubmit)

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Type a prompt containing "backend" or "controller" | Hook output recommends `backend-dev-guidelines` skill |
| 2 | Type a prompt containing "component" or "tailwind" | Hook output recommends `frontend-dev-guidelines` skill |
| 3 | Type a prompt containing "create skill" | Hook output recommends `skill-developer` skill |
| 4 | Type a prompt containing "sentry" or "error tracking" | Hook output recommends `error-tracking` skill |
| 5 | Type a prompt containing "test route" or "test API" | Hook output recommends `route-tester` skill |
| 6 | Type a generic prompt like "hello" | No skill recommendation appears |

**How to verify:** Look for the `SKILL ACTIVATION CHECK` banner in stderr output after submitting each prompt.

### 1-2. post-tool-use-tracker (PostToolUse)

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Ask Claude to edit any `.ts` file | Hook runs silently, tracking file is updated |
| 2 | Ask Claude to create a new `.tsx` file | Hook runs silently, tracking file is updated |
| 3 | Ask Claude to read a file (no edit) | Hook does NOT trigger (matcher is `Edit|MultiEdit|Write` only) |

**How to verify:** Check `~/.claude/session-tracking/` for a JSON file tracking the edited files.

### 1-3. tsc-check (NOT wired in settings.json)

> **Decision:** `tsc-check.sh` will NOT be wired into PostToolUse. It remains available for manual use only. Reason: running `npx tsc --noEmit` after every file edit adds ~5-10s of latency, which is too disruptive for the development workflow.

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Manually run: `echo '{"tool_name":"Edit","tool_input":{"file_path":"'$(pwd)'/app/page.tsx"}}' \| bash .claude/hooks/tsc-check.sh` | Runs `npx tsc --noEmit` and reports OK or errors |
| 2 | Run with a non-TS file path | Hook exits without running tsc |
| 3 | Introduce a deliberate type error, then run | Hook exits with code 1 and shows error preview |

### 1-4. error-handling-reminder (NOT wired in settings.json)

> **Decision:** `error-handling-reminder.sh` will NOT be wired into PreToolUse. It remains available but inactive. Sentry error handling reminders are not needed at this time.

---

## 2. Skills

### 2-1. backend-dev-guidelines

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Ask "help me create a new API route" | Skill suggested, Claude follows layered architecture patterns |
| 2 | Edit a file in `backend/**/*.ts` | fileTrigger activates |
| 3 | Edit a file in `app/api/**/*.ts` | fileTrigger activates |
| 4 | Use `/backend-dev-guidelines` or the Skill tool | Skill loads and Claude applies backend conventions |

**Verify path patterns match:** `backend/**/*.ts`, `app/api/**/*.ts`, `lib/**/*.ts`

### 2-2. frontend-dev-guidelines

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Ask "create a new React component" | Skill suggested |
| 2 | Edit a file in `app/components/**/*.tsx` | fileTrigger activates |
| 3 | Edit a file in `hooks/**/*.ts` or `stores/**/*.ts` | fileTrigger activates |
| 4 | Edit a file in `app/api/**/*.ts` | fileTrigger does NOT activate (excluded) |

**Verify path patterns match:** `app/**/*.tsx`, `app/components/**/*.tsx`, `hooks/**/*.ts`, `stores/**/*.ts`
**Verify exclusions:** `app/api/**/*.ts` is correctly excluded

### 2-3. error-tracking

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Ask "add sentry error tracking" | Skill suggested |
| 2 | Edit a file containing `Sentry.` or `captureException` | contentPattern activates |

### 2-4. route-tester

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Ask "test this API route" | Skill suggested |
| 2 | Edit `app/api/**/route.ts` | fileTrigger activates |
| 3 | Use `/route-research-for-testing` command | Maps routes and prepares testing |

### 2-5. skill-developer

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Ask "create a new skill" | Skill suggested |
| 2 | Ask "how do skills work" | Skill suggested via intentPattern |

---

## 3. Agents

Each agent is invoked via the `Task` tool with `subagent_type` matching the agent filename (without `.md`).

| # | Agent | Test Prompt | Expected Behavior |
|---|-------|-------------|-------------------|
| 1 | `auth-route-debugger` | "Debug 401 error on /api/arenas" | Investigates auth flow, checks NextAuth config |
| 2 | `auth-route-tester` | "Test POST /api/arenas route" | Tests route with cookie auth |
| 3 | `auto-error-resolver` | "Fix TypeScript errors" | Reads cached errors, fixes TS issues |
| 4 | `code-architecture-reviewer` | "Review the arena usecase code" | Reviews code for architecture patterns |
| 5 | `code-refactor-master` | "Refactor arena components" | Proposes and executes refactoring |
| 6 | `documentation-architect` | "Document the arena feature" | Creates comprehensive docs |
| 7 | `frontend-error-fixer` | "Fix the build error in page.tsx" | Diagnoses and fixes frontend errors |
| 8 | `plan-reviewer` | "Review my implementation plan" | Reviews plan for issues |
| 9 | `refactor-planner` | "Plan refactoring of vote system" | Creates refactoring plan |
| 10 | `web-research-specialist` | "Research Next.js 15 caching" | Searches web for solutions |

**Quick smoke test:** Pick 2-3 agents most relevant to current work and run a real task through them.

---

## 4. Commands (Slash Commands)

| # | Command | How to Invoke | Expected Behavior |
|---|---------|--------------|-------------------|
| 1 | `/dev-docs` | Type `/dev-docs` in Claude Code | Creates a strategic plan in `dev/active/[task-name]/` |
| 2 | `/dev-docs-update` | Type `/dev-docs-update` | Updates existing docs in `dev/active/` before context compaction |
| 3 | `/route-research-for-testing` | Type `/route-research-for-testing` | Maps edited routes and launches test agents |

**Pre-requisite:** `dev/active/` directory must exist (already created).

---

## 5. Suggested Test Execution Order

Run tests in this order to validate dependencies correctly:

1. **JSON validation** — Confirm `settings.json` and `skill-rules.json` parse without errors
2. **Hook permissions** — Confirm all `.sh` files are executable
3. **UserPromptSubmit hook** — Type test prompts, verify skill suggestions appear
4. **Skill activation** — Use a recommended skill, verify it loads correctly
5. **PostToolUse hook** — Edit a file, verify tracker runs
6. **Agent smoke test** — Run `code-architecture-reviewer` on a small file
7. **Slash commands** — Run `/dev-docs` to verify command + directory setup
8. **End-to-end** — Full workflow: ask a backend question -> skill activates -> edit file -> tracker runs

---

## 6. Resolved Decisions

| # | Item | Decision | Reason |
|---|------|----------|--------|
| 1 | Wire `tsc-check.sh` into PostToolUse? | **No** | ~5-10s latency per edit is too disruptive; kept for manual use only |
| 2 | Wire `error-handling-reminder` into PreToolUse? | **No** | Not actively needed at this time |
| 3 | Keep `trigger-build-resolver.sh` and `stop-build-check-enhanced.sh`? | **Deleted both** | No Stop hook needed; without `tsc-check` wired, the Stop hooks had no cached errors to act on |

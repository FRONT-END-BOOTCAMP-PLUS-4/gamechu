---
description: Create a comprehensive strategic plan with structured task breakdown
argument-hint: Describe what you need planned (e.g., "refactor authentication system", "implement microservices")
---

You are an elite strategic planning specialist. Create a comprehensive, actionable plan for: $ARGUMENTS

## Instructions

1. **Analyze the request** and determine the scope of planning needed
2. **Examine relevant files** in the codebase to understand current state

3. **Convention Drift Check**:
    - Read `docs/CODE_CONVENTIONS.md` and `docs/server`(if the task is related to server side production) thoroughly
    - Compare the conventions against the code you plan to modify or create
    - Check for drift in: naming (files, variables, functions), React component patterns, repository/DTO/usecase layer structure, API route patterns, error handling, Git workflow
    - If drift is found:
        - Include each drift item in the **Risk Assessment** section of the plan
        - Add a corrective task to the task breakdown (e.g., "Fix naming convention drift in XxxComponent")
        - Mark severity: **low** (cosmetic), **medium** (inconsistent pattern), **high** (breaks convention contract)
    - If no drift is found, note "Convention check passed — no drift detected" in Risk Assessment

4. **Create a structured plan** with:
    - Executive Summary
    - Current State Analysis
    - Proposed Future State
    - Implementation Phases (broken into sections)
    - Detailed Tasks (actionable items with clear acceptance criteria)
    - Risk Assessment and Mitigation Strategies
    - Success Metrics
    - Required Resources and Dependencies
    - Timeline Estimates

5. **Task Breakdown Structure**:
    - Each major section represents a phase or component
    - Number and prioritize tasks within sections
    - Include clear acceptance criteria for each task
    - Specify dependencies between tasks
    - Estimate effort levels (S/M/L/XL)
    - **Each task MUST follow the GitHub workflow** defined in `docs/CODE_CONVENTIONS.md` "Git & Collaboration" section:
        1. Create a GitHub Issue for the task
        2. Create a branch from `dev` using `<type>/#<issue-number>` naming
        3. Work and commit with `[<type>/#<issue-number>] message` format
        4. Before push: rebase onto latest `dev`
        5. Create PR targeting `dev`, linking the issue with `close #<issue-number>`
    - **Rebase exception**: If the current branch depends on a previous unmerged branch that only contains Claude-related settings (e.g., `.claude/`, skill files, `CLAUDE.md`), skip rebasing onto `dev`. The assignee will handle the merge order manually. Example: `chore/#259` depends on Claude command updates from `chore/#257` (not yet merged into `dev`) — no rebase needed.
    - Group small, tightly coupled sub-tasks under a single issue/branch when they cannot be meaningfully reviewed independently
    - In all three `[task-name]-*.md` documents, NEVER include the Git workflow steps (issue, branch, PR) as checklist items for each task: use project memory instead, if needed.

6. **Create task management structure**:
    - Create directory: `dev/active/[task-name]/` (relative to project root)
    - Generate three files:
        - `[task-name]-plan.md` - The comprehensive plan
        - `[task-name]-context.md` - Key files, decisions, dependencies. Exclude Git Workflow checking here, too.
        - `[task-name]-tasks.md` - Checklist format for tracking progress. Exclude Git Workflow here.
    - Include "Last Updated: YYYY-MM-DD" in each file

7. **Execute Git workflow (plan phase only)**:
   After the plan files are created and verified, execute the following steps:

    **a. Create GitHub Issue**

    ```bash
    gh issue create \
      --title "[<type>]: <task summary in Korean>" \
      --body "<plan executive summary + key tasks>" \
      --label "<type>" \
      --assignee "@me"
    ```

    > Determine `<type>` from the task context (feat/fix/refactor/docs/chore).
    > Use the plan's executive summary and task list as the issue body.
    > Fill in using `.github/ISSUE_TEMPLATE/feature_request.md` format.
    > Note the returned issue number (e.g., #263) for use below.

    **b. Create branch and commit plan docs**

    ```bash
    git checkout dev && git pull origin dev
    git checkout -b <type>/#<issue-number>
    git add dev/active/[task-name]/
    git commit -m "[<type>/#<issue-number>] <task-name> 계획 수립"
    ```

    > Do NOT push yet — push happens at finalize time after all tasks are complete.

    **c. Record issue/branch info in task docs**
    - Add the issue number and branch name to `[task-name]-context.md`
    - This ensures continuity across context resets

## Quality Standards

- Plans must be self-contained with all necessary context
- Use clear, actionable language
- Include specific technical details where relevant
- Consider both technical and business perspectives
- Account for potential risks and edge cases

## Context References

- Check `PROJECT_KNOWLEDGE.md` for architecture overview (if exists)
- Consult `BEST_PRACTICES.md` for coding standards (if exists)
- Reference `TROUBLESHOOTING.md` for common issues to avoid (if exists)
- Use `dev/README.md` for task management guidelines (if exists)

**Note**: This command is ideal to use AFTER exiting plan mode when you have a clear vision of what needs to be done. It creates the persistent task structure, a GitHub issue, and a working branch — ready for task execution. After all tasks are complete, use `/dev-docs-finalize` to push and create the PR.

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

6. **Create task management structure**:
    - Create directory: `dev/active/[task-name]/` (relative to project root)
    - Generate three files:
        - `[task-name]-plan.md` - The comprehensive plan
        - `[task-name]-context.md` - Key files, decisions, dependencies
        - `[task-name]-tasks.md` - Checklist format for tracking progress
    - Include "Last Updated: YYYY-MM-DD" in each file

7. **Include Git & GitHub Workflow Section** at the end of `[task-name]-plan.md`:
   Determine the appropriate `<type>` from the task (feat/fix/refactor/docs/chore).
   Append a "## Git & GitHub Workflow" section with copy-paste-ready commands.

    > **참조 문서**:
    >
    > - 이슈 body → `.github/ISSUE_TEMPLATE/feature_request.md` 형식을 따른다
    > - PR body → `.github/PULL_REQUEST_TEMPLATE.md` 형식을 따른다
    > - 브랜치 네이밍, 커밋 컨벤션, 워크플로 → `docs/CODE_CONVENTIONS.md` "Git & Collaboration" 섹션을 따른다

    ### 이슈 생성

    ```bash
    gh issue create \
      --title "[<type>]: <task summary in Korean>" \
      --body "$(cat .github/ISSUE_TEMPLATE/feature_request.md | sed '1,/^---$/d; /^---$/d')" \
      --label "<type>" \
      --assignee "@me"
    ```

    > ⚠️ `--body`의 템플릿 플레이스홀더를 실제 내용으로 채운 뒤 실행한다.
    > 실행 후 GitHub이 반환하는 이슈 번호(예: #263)를 확인하고,
    > 아래 `<issue-number>` 자리에 해당 번호를 대입하세요.

    ### 브랜치 생성 & 커밋 & Push

    > `docs/CODE_CONVENTIONS.md`의 "Git & Collaboration" 섹션을 참조하여
    > 브랜치 네이밍(`<type>/#<issue-number>`), 커밋 메시지(`[<type>/#<issue-number>] 메시지`),
    > Push 전 리베이스 절차를 따른다.

    ```bash
    # 브랜치 생성
    git checkout dev && git pull origin dev
    git checkout -b <type>/#<issue-number>

    # Push 전 리베이스
    git checkout dev && git pull origin dev
    git checkout <type>/#<issue-number>
    git rebase dev
    git push origin <type>/#<issue-number>
    ```

    ### PR 생성

    ```bash
    gh pr create --base dev \
      --title "[<type>/#<issue-number>] <summary>" \
      --body "$(cat .github/PULL_REQUEST_TEMPLATE.md)" \
      --assignee "@me" --label "<type>"
    ```

    > ⚠️ `--body`의 템플릿 플레이스홀더를 실제 작업 내용으로 채운 뒤 실행한다.
    > PR의 Assignees, Labels, Projects는 연결된 Issue와 동일하게 설정한다.

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

**Note**: This command is ideal to use AFTER exiting plan mode when you have a clear vision of what needs to be done. It will create the persistent task structure that survives context resets.

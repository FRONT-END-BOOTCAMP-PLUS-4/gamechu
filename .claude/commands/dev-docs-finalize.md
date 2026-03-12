---
description: Commit completed task work and create PR following GitHub workflow
argument-hint: Task name from dev/active/ (e.g., "rate-limiting")
---

Finalize the completed dev-docs task and execute the full GitHub workflow for: **$ARGUMENTS**

## Instructions

### 1. Validate task completion

- Read `dev/active/$ARGUMENTS/$ARGUMENTS-tasks.md`
- Verify that **all** checkboxes are checked (`[x]`).
  - If any are unchecked (`[ ]`), list them and **stop** — ask the user whether to proceed anyway or finish the remaining tasks first.

### 2. Update task documentation

- Update `dev/active/$ARGUMENTS/$ARGUMENTS-tasks.md`: ensure all completed items are `[x]`
- Update `dev/active/$ARGUMENTS/$ARGUMENTS-context.md`:
  - Set status to "COMPLETED" or "READY FOR PR"
  - Update "Last Updated" timestamp
  - Fill in any remaining verification results or notes

### 3. Execute Git & GitHub Workflow

Follow `docs/CODE_CONVENTIONS.md` "Git & Collaboration" section strictly.

> **Prerequisite**: The GitHub issue and branch should already exist from `/dev-docs`.
> Read the issue number and branch name from `dev/active/$ARGUMENTS/$ARGUMENTS-context.md`.

#### 3a. Commit remaining changes and push

```bash
# Stage and commit all task-related changes
git add <changed-files>
git commit -m "[<type>/#<issue-number>] <message>"

# Rebase before push
git checkout dev && git pull origin dev
git checkout <type>/#<issue-number>
git rebase dev
git push origin <type>/#<issue-number>
```

> **Rebase exception**: If the current branch depends on a previous unmerged branch
> that only contains Claude-related settings (`.claude/`, `CLAUDE.md`), skip rebasing
> onto `dev`. The assignee will handle the merge order manually.

#### 3b. Create PR

```bash
gh pr create --base dev \
  --title "[<type>/#<issue-number>] <summary>" \
  --body "$(cat .github/PULL_REQUEST_TEMPLATE.md)" \
  --assignee "@me" --label "<type>"
```

> Fill in the PR template placeholders with actual work content.
> PR의 Assignees, Labels, Projects는 연결된 Issue와 동일하게 설정한다.

### 4. Report

After PR creation, output:
- Issue URL (from context.md)
- PR URL (newly created)
- Branch name
- Summary of what was committed

> **Note**: This command does NOT archive the task. After the PR is merged,
> use `/archive-task` to move completed tasks from `dev/active/` to `dev/archive/`.

## Reference

- Issue body format: `.github/ISSUE_TEMPLATE/feature_request.md`
- PR body format: `.github/PULL_REQUEST_TEMPLATE.md`
- Branch naming, commit conventions, workflow: `docs/CODE_CONVENTIONS.md` "Git & Collaboration"

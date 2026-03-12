---
description: Move completed tasks from dev/active/ to dev/archive/
argument-hint: "Task name(s) to archive (e.g., 'rate-limiting' or 'all' for every completed task)"
---

Archive completed dev-docs tasks by moving them from `dev/active/` to `dev/archive/`.

Target: **$ARGUMENTS**

## Instructions

### 1. Identify tasks to archive

- If `$ARGUMENTS` is `all`: scan every subdirectory in `dev/active/`
- Otherwise: use the specified task name(s) (space-separated)

For each task, read `dev/active/[task-name]/[task-name]-tasks.md`.

### 2. Validate completion

For each task:

- Check that **all** checkboxes are `[x]` in the tasks file
- If any task has unchecked items:
    - List the unchecked items
    - **Skip** that task (do not archive it)
    - Continue with remaining tasks

### 3. Check for archive conflicts

Before moving, check if `dev/archive/[task-name]/` already exists.

- If it exists: **warn the user** and ask whether to overwrite, rename (e.g., `[task-name]-v2`), or skip
- If it does not exist: proceed

### 4. Move task folders

For each validated task:

```bash
git mv dev/active/[task-name] dev/archive/[task-name]
```

### 5. Report

Output a summary:

- Archived: list of tasks moved to `dev/archive/`
- Skipped: list of tasks not archived (with reason — incomplete or conflict)
- Remaining in `dev/active/`: list of tasks still active

> **Note**: This command only moves files. It does NOT create commits.
> Commit the archive move as part of your next relevant commit, or separately.

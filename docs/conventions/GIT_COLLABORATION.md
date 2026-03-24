### Worktree

- path: `../<label-issue number>` (e.g. `../feat-280`)
- after creating: run `npm i` and `npx prisma generate`

### Metadata

| Name            | value                     |
| --------------- | ------------------------- |
| owner           | FRONT-END-BOOTCAMP-PLUS-4 |
| repo            | gamechu                   |
| projects number | 9                         |
| base branch     | dev                       |
| head branch     | current working branch    |

### Labels, Branch types

| Name       | Purpose                           |
| ---------- | --------------------------------- |
| `feat`     | New feature                       |
| `fix`      | Bug fix                           |
| `refactor` | Code refactoring                  |
| `build`    | Build-related changes             |
| `chore`    | Miscellaneous small changes       |
| `docs`     | Documentation                     |
| `style`    | Non-functional code style changes |
| `test`     | Test code                         |
| `API`      | API integration                   |
| `file`     | File/folder changes               |

### Branch naming

```
<label>/#<issue-number>
e.g. feat/#12
```

### Commit messages

```
[<label>/#<issue-number>] Title
e.g. [API/#35] 글 작성 API 연동
```

### Workflow

1. Pull latest `dev` branch
2. Create issue -> create branch or new worktree from issue
3. Work on branch -> commit
4. Before push: switch to `dev`, pull latest, switch back, `git rebase dev`
    - **Exception**: If the current branch depends on a previous unmerged branch that only contains Claude-related settings (`.claude/`, skill files, `CLAUDE.md`), skip rebasing onto `dev`. The assignee will handle the merge order manually. (e.g., `chore/#259` depends on `chore/#257` which updated Claude commands — no rebase needed)
5. Resolve conflicts if any, then push
6. If `dev` changed after your branch (other PRs merged), rebase and `--force` push
7. Create PR: branch -> `dev`
8. Get teammate approval -> approver rebases into `dev`
9. Close issue (use `close #` in PR), delete branch or worktree
10. If ready, rebase `main` to `dev`, then GitHub Actions will run automatically (build -> test -> deploy)

### Issue template

> 템플릿 파일: `.github/ISSUE_TEMPLATE/feature_request.yml`
> read following table and set fields for issue
> | Field | How to set |
> | --------- | -------------------------------------------------------- |
> | Title | `[label]: Title` 제목 한글로 작성, tech term은 영어 사용 |
> | Labels | 이슈 branch 타입에 맞는 라벨 선택 |
> | Assignees | 요청한 사람의 GitHub 계정으로 지정 (use `mcp__github__get_me` to resolve) |
> | Projects | `Gamechu` 프로젝트 (`FRONT-END-BOOTCAMP-PLUS-4/9`) 선택 |

### PR template

> 템플릿 파일: `.github/PULL_REQUEST_TEMPLATE.md`

> **PR의 Assignees, Labels, Projects는 연결된 Issue와 동일하게 설정한다.**
> PR 본문만 실제 작업 내용에 맞게 작성하되, 메타 필드는 Issue에서 그대로 가져온다.

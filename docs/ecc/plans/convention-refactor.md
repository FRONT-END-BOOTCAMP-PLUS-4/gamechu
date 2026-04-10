# Convention Refactor Plan

전체 코드베이스를 `docs/conventions/` 문서 기준으로 정렬하는 리팩터링 계획.

---

## Task 1 — Error Response Shape + `errorResponse` 적용

**컨벤션**: `ERROR_HANDLING.md` — 에러 응답은 반드시 `{ message }` 키를 사용. `errorResponse()` 헬퍼 사용 필수.

### `{ error }` → `{ message }` 변경

| 파일                                   | 라인       |
| -------------------------------------- | ---------- |
| `app/api/preferred-genres/route.ts`    | 32         |
| `app/api/preferred-platforms/route.ts` | 32         |
| `app/api/preferred-themes/route.ts`    | 35         |
| `app/api/member/scores/route.ts`       | 42, 49, 58 |

### 인라인 `NextResponse.json()` → `errorResponse()` 교체

| 파일                                                        |
| ----------------------------------------------------------- |
| `app/api/preferred-genres/route.ts`                         |
| `app/api/preferred-platforms/route.ts`                      |
| `app/api/preferred-themes/route.ts`                         |
| `app/api/member/scores/route.ts`                            |
| `app/api/auth/signup/route.ts`                              |
| `app/api/auth/email-check/route.ts`                         |
| `app/api/auth/nickname-check/route.ts`                      |
| `app/api/member/nickname-check/route.ts`                    |
| `app/api/genres/route.ts`                                   |
| `app/api/platforms/route.ts`                                |
| `app/api/themes/route.ts`                                   |
| `app/api/arenas/[id]/chattings/route.ts`                    |
| `app/api/arenas/[id]/votes/route.ts`                        |
| `app/api/member/arenas/[id]/chattings/route.ts`             |
| `app/api/member/arenas/[id]/votes/route.ts`                 |
| `app/api/notification-records/route.ts`                     |
| `app/api/member/notification-records/[id]/route.ts`         |
| `app/api/member/wishlists/[id]/route.ts`                    |
| `app/api/games/[id]/route.ts`                               |
| `app/api/member/games/[gameId]/reviews/[reviewId]/route.ts` |
| `app/api/member/games/[gameId]/reviews/route.ts`            |

---

## Task 2 — Logger 적용 (누락 라우트)

**컨벤션**: `LOGGING.md` — 모든 API 라우트 핸들러에 `logger.child({ route, method })` 필수.

### logger 미적용 라우트

| 파일                                        | 핸들러              |
| ------------------------------------------- | ------------------- |
| `app/api/preferred-genres/route.ts`         | POST                |
| `app/api/preferred-platforms/route.ts`      | POST                |
| `app/api/preferred-themes/route.ts`         | POST                |
| `app/api/auth/signup/route.ts`              | POST                |
| `app/api/auth/email-check/route.ts`         | GET                 |
| `app/api/auth/nickname-check/route.ts`      | GET                 |
| `app/api/member/nickname-check/route.ts`    | GET                 |
| `app/api/member/arenas/[id]/votes/route.ts` | POST (PATCH는 있음) |

---

## Task 3 — console.log / console.error 제거

**컨벤션**: `LOGGING.md`, `FRONTEND.md` — API 라우트·백엔드·컴포넌트 모두에서 `console.*` 사용 금지.

### 컴포넌트 (23개 파일)

| 파일                                                              | 라인     | 종류                              |
| ----------------------------------------------------------------- | -------- | --------------------------------- |
| `app/(auth)/components/StepGenres.tsx`                            | 25, 64   | `console.error`                   |
| `app/(auth)/components/StepThemes.tsx`                            | 25, 64   | `console.error`                   |
| `app/(auth)/components/StepPlatforms.tsx`                         | 27, 65   | `console.error`                   |
| `app/(base)/components/GlobalAttendanceToast.tsx`                 | 77       | `console.warn`                    |
| `app/(base)/arenas/[id]/page.tsx`                                 | 67       | `console.error`                   |
| `app/components/UserProfileComponent.tsx`                         | 47       | `console.error`                   |
| `app/(base)/profile/[nickname]/page.tsx`                          | 74       | `console.error`                   |
| `app/(base)/profile/page.tsx`                                     | 103      | `console.error`                   |
| `app/(base)/arenas/[id]/components/ArenaDetailRecruiting.tsx`     | 53       | `console.error`                   |
| `app/(base)/games/[gameId]/components/Comment.tsx`                | 80, 172  | `console.error`                   |
| `app/(base)/games/page.tsx`                                       | 107, 113 | `console.error`                   |
| `app/(base)/games/[gameId]/components/CommentCard.tsx`            | 151, 156 | `console.error`                   |
| `app/(base)/arenas/components/CompleteArenaSection.tsx`           | 25       | `console.log`                     |
| `app/(base)/arenas/components/CreateArenaModal.tsx`               | 106, 111 | `console.log`, `console.error`    |
| `app/(base)/arenas/components/DebatingArenaSection.tsx`           | 27       | `console.log`                     |
| `app/(base)/arenas/components/RecruitingArenaSection.tsx`         | 27       | `console.log`                     |
| `app/(base)/arenas/components/SelectedArenaSection.tsx`           | 37       | `console.log`                     |
| `app/(base)/arenas/components/VotingArenaSection.tsx`             | 31       | `console.log`                     |
| `app/(base)/arenas/components/WaitingArenaSection.tsx`            | 27       | `console.log`                     |
| `app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx` | 39       | `console.error` (Lexical onError) |
| `app/(base)/profile/components/tabs/ProfilePointHistoryTab.tsx`   | 43       | `console.error`                   |
| `app/(base)/profile/components/tabs/ProfileInfoTab.tsx`           | 285      | `console.error`                   |

### 훅 (5개 파일)

| 파일                                | 라인                       | 종류                           |
| ----------------------------------- | -------------------------- | ------------------------------ |
| `hooks/useArenaAutoStatusDetail.ts` | 29, 85, 100                | `console.error`                |
| `hooks/useArenaSocket.ts`           | 29, 30, 38, 43, 59, 79, 89 | `console.log`, `console.error` |
| `hooks/useArenaChatManagement.ts`   | 97, 181                    | `console.error`                |
| `hooks/useArenaAutoStatus.ts`       | 45, 90, 105                | `console.error`                |

---

## Task 4 — Props `interface` → `type` 변환

**컨벤션**: `NAMING.md`, `FRONTEND.md` — 컴포넌트 props는 `type` 사용 (`interface` 금지).

| 파일                                                                     | 인터페이스명                  |
| ------------------------------------------------------------------------ | ----------------------------- |
| `app/components/UserProfileComponent.tsx`                                | `UserProfileComponentProps`   |
| `app/components/Toast.tsx`                                               | `GlobalToastProps`            |
| `app/components/TierBadge.tsx`                                           | `TierBadgeProps`              |
| `app/components/LandingCard.tsx`                                         | `LandingCardProps`            |
| `app/components/Button.tsx`                                              | `ButtonProps`                 |
| `app/(base)/profile/components/MemberReviewItem.tsx`                     | `MemberReviewItemProps`       |
| `app/(base)/profile/components/PointHistoryCard.tsx`                     | `PointHistoryCardProps`       |
| `app/(base)/games/[gameId]/page.tsx`                                     | `PageProps`                   |
| `app/(base)/games/components/SearchBar.tsx`                              | `SearchBarProps`              |
| `app/(base)/games/components/GameFilterWrapper.tsx`                      | `GameFilterWrapperProps`      |
| `app/(base)/games/components/GameFilter.tsx`                             | `GameFilterProps`             |
| `app/(base)/games/components/GameCardList.tsx`                           | `GameCardListProps`           |
| `app/(base)/games/components/GameCard.tsx`                               | `GameCardProps`               |
| `app/(base)/games/[gameId]/components/StarRating.tsx`                    | `StarRatingProps`             |
| `app/(base)/games/[gameId]/components/GameHeaderInfoSection.tsx`         | `GameTitleInfoSectionProps`   |
| `app/(base)/games/[gameId]/components/ReviewSelector.tsx`                | `ReviewSelectorProps`         |
| `app/(base)/games/[gameId]/components/CommentCard.tsx`                   | `CommentCardProps`            |
| `app/(base)/games/[gameId]/components/Comment.tsx`                       | `CommentProps`                |
| `app/(base)/games/[gameId]/components/GameInfoCard.tsx`                  | `GameInfoCardProps`           |
| `app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx`        | `ReadOnlyReviewProps`         |
| `app/(base)/games/[gameId]/components/lexical/plugins/ToolbarPlugin.tsx` | `ToolbarPluginProps`          |
| `app/(base)/arenas/[id]/components/ArenaDetailInputBox.tsx`              | `ArenaInputBoxProps`          |
| `app/(base)/games/[gameId]/containers/GameDetailContainer.tsx`           | `Props`                       |
| `hooks/useArenaSocket.ts`                                                | `ArenaSocketProps`            |
| `hooks/useArenaChatManagement.ts`                                        | `UseArenaChatManagementProps` |

---

## Task 5 — `validate(IdSchema, id)` 적용

**컨벤션**: `VALIDATION.md` — 경로 파라미터 ID는 반드시 `validate(IdSchema, id)` 사용.

| 파일                                                | 현재 패턴                                         |
| --------------------------------------------------- | ------------------------------------------------- |
| `app/api/games/[id]/route.ts`                       | `Number(id)` + 수동 `isNaN` 검사                  |
| `app/api/games/[id]/reviews/route.ts`               | `Number.parseInt(gameId, 10)` + 수동 `isNaN` 검사 |
| `app/api/member/notification-records/[id]/route.ts` | `Number(id)` + 유효성 검사 없음                   |

---

## Task 6 — 테스트 목 파일명 컨벤션

**컨벤션**: `TESTING_VITEST.md` — 목 팩토리 파일명은 `createMockXxx.ts`, 함수명은 `createMockXxx()`.

| 현재 파일                                  | 변경 후                                          |
| ------------------------------------------ | ------------------------------------------------ |
| `tests/mocks/MockArenaRepository.ts`       | `tests/mocks/createMockArenaRepository.ts`       |
| `tests/mocks/MockMemberRepository.ts`      | `tests/mocks/createMockMemberRepository.ts`      |
| `tests/mocks/MockReviewRepository.ts`      | `tests/mocks/createMockReviewRepository.ts`      |
| `tests/mocks/MockScoreRecordRepository.ts` | `tests/mocks/createMockScoreRecordRepository.ts` |
| `tests/mocks/MockVoteRepository.ts`        | `tests/mocks/createMockVoteRepository.ts`        |
| `tests/mocks/MockReviewLikeRepository.ts`  | `tests/mocks/createMockReviewLikeRepository.ts`  |

임포트 수정 필요: 18개 테스트 파일

---

## Task 7 — 파일명 PascalCase 적용

**컨벤션**: `NAMING.md` — 파일명은 PascalCase (프레임워크 파일 제외).

### 7a. 오타 수정 (우선순위 높음)

| 현재                                                              | 변경 후                      |
| ----------------------------------------------------------------- | ---------------------------- |
| `app/(base)/games/[gameId]/components/GameHedaerImageSection.tsx` | `GameHeaderImageSection.tsx` |

### 7b. lib/ utils/ stores/ 파일 (위험도 높음, 마지막에 실행)

| 현재                                                          | 변경 후            |
| ------------------------------------------------------------- | ------------------ |
| `utils/tailwindUtil.ts`                                       | `TailwindUtil.ts`  |
| `utils/apiResponse.ts`                                        | `ApiResponse.ts`   |
| `utils/validation.ts`                                         | `Validation.ts`    |
| `lib/redis.ts`                                                | `Redis.ts`         |
| `lib/prisma.ts`                                               | `Prisma.ts`        |
| `lib/fetcher.ts`                                              | `Fetcher.ts`       |
| `lib/queryKeys.ts`                                            | `QueryKeys.ts`     |
| `lib/logger.ts`                                               | `Logger.ts`        |
| `lib/withCache.ts`                                            | `WithCache.ts`     |
| `lib/cacheKey.ts`                                             | `CacheKey.ts`      |
| `stores/loadingStore.ts`                                      | `LoadingStore.ts`  |
| `stores/modalStore.ts`                                        | `ModalStore.ts`    |
| `stores/useArenaStore.ts`                                     | `UseArenaStore.ts` |
| `app/(base)/games/[gameId]/components/lexical/sharedTheme.ts` | `SharedTheme.ts`   |
| `app/(base)/games/[gameId]/components/lexical/urlMatchers.ts` | `UrlMatchers.ts`   |

---

## Task 8 — 불리언 변수명 컨벤션

**컨벤션**: `NAMING.md` — 불리언 상태는 `is` 접두사, 존재 여부는 `has` 접두사.

| 파일                                                          | 현재                       | 변경 후                        |
| ------------------------------------------------------------- | -------------------------- | ------------------------------ |
| `app/(base)/arenas/[id]/components/ArenaDetailRecruiting.tsx` | `loading` / `setLoading`   | `isLoading` / `setIsLoading`   |
| `app/components/Toast.tsx`                                    | `visible` / `setVisible`   | `isVisible` / `setIsVisible`   |
| `app/(base)/games/[gameId]/components/CommentCard.tsx`        | `expanded` / `setExpanded` | `isExpanded` / `setIsExpanded` |

---

## Task 9 — 직접 `fetch()` → TanStack Query 마이그레이션

**컨벤션**: `FRONTEND.md` — 컴포넌트에서 직접 `fetch()` 사용 금지. `useQuery`/`useMutation` + `lib/fetcher.ts` 사용.

| 파일                                                            | fetch 호출 수 |
| --------------------------------------------------------------- | ------------- |
| `app/(auth)/components/StepGenres.tsx`                          | 2             |
| `app/(auth)/components/StepThemes.tsx`                          | 2             |
| `app/(auth)/components/StepPlatforms.tsx`                       | 2             |
| `app/(auth)/components/StepProfile.tsx`                         | 3             |
| `app/(base)/components/GlobalAttendanceToast.tsx`               | 1             |
| `app/(base)/components/NotificationRecordItem.tsx`              | 1             |
| `app/(base)/profile/page.tsx`                                   | 3             |
| `app/(base)/profile/[nickname]/page.tsx`                        | 2             |
| `app/(base)/games/page.tsx`                                     | 2             |
| `app/(base)/arenas/[id]/page.tsx`                               | 1             |
| `app/(base)/arenas/[id]/components/ArenaDetailHeader.tsx`       | 1             |
| `app/(base)/games/[gameId]/components/Comment.tsx`              | 1             |
| `app/(base)/arenas/components/CreateArenaModal.tsx`             | 2             |
| `app/(base)/games/[gameId]/components/CommentCard.tsx`          | 1             |
| `app/(base)/arenas/[id]/components/ArenaDetailRecruiting.tsx`   | 1             |
| `app/(base)/profile/components/tabs/ProfileInfoTab.tsx`         | 2             |
| `app/(base)/profile/components/tabs/ProfilePointHistoryTab.tsx` | 1             |

---

## Task 10 — 기타 (Zod 스키마 누락 + 잔여 인라인 NextResponse)

### 10a. Zod 스키마 누락

| 파일                                   | 현재                            |
| -------------------------------------- | ------------------------------- |
| `app/api/preferred-genres/route.ts`    | `req.json()` 바디 검증 없음     |
| `app/api/preferred-platforms/route.ts` | `req.json()` 바디 검증 없음     |
| `app/api/preferred-themes/route.ts`    | `req.json()` 바디 검증 없음     |
| `app/api/member/scores/route.ts`       | 수동 `if (!body.policyId)` 체크 |

### 10b. 잔여 인라인 NextResponse (Task 1 이후 처리)

| 파일                                            |
| ----------------------------------------------- |
| `app/api/arenas/[id]/votes/route.ts`            |
| `app/api/member/arenas/[id]/chattings/route.ts` |
| `app/api/member/wishlists/[id]/route.ts`        |

---

## 실행 순서

```
Task 1  Error response shape + errorResponse  (독립, 우선순위 높음)
Task 2  Logger 적용                           (독립, 우선순위 높음)
Task 3  console.* 제거                        (독립)
Task 4  Props interface → type                (독립)
Task 5  IdSchema 적용                         (독립)
Task 10a Zod 스키마 추가                      (독립)
Task 8  불리언 네이밍                         (독립)
Task 6  테스트 목 파일명                      (독립, 테스트 전용)
Task 10b 잔여 errorResponse                   (Task 1 이후)
Task 9  TanStack Query 마이그레이션           (범위 넓음, 분리 진행)
Task 7  파일명 PascalCase                     (위험도 높음, 마지막)
```

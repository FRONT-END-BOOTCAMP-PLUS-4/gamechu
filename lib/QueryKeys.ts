// lib/QueryKeys.ts

/**
 * Typed cache key factories — single source of truth.
 * Import from here in all hooks and mutation onSuccess invalidateQueries calls.
 *
 * NOTE: ArenasQueryParams is defined here (not imported from hooks/) to keep
 * the dependency direction clean: lib/ must not import from hooks/.
 */

export type GamesQueryParams = {
    page: number;
    size: number;
    genreId?: number;
    themeId?: number;
    platformId?: number;
    keyword?: string;
    sort?: string;
};

export type ArenasQueryParams = {
    currentPage?: number;
    status: number;
    mine: boolean;
    pageSize: number;
    targetMemberId?: string;
};

export const queryKeys = {
    /**
     * Paginated arena list — used by useArenas.
     * Returns ArenaListDto (paginated object with arenas[], totalCount, etc.)
     */
    arenas: (params: ArenasQueryParams) => ["arenas", params] as const,

    /**
     * Flat arena array — used by useArenaList.
     * Returns ArenaDetailDto[] from resData.data.
     * DISTINCT from queryKeys.arenas() — response shapes differ.
     */
    arenaList: () => ["arenaList"] as const,

    /**
     * Aggregate vote counts for an arena.
     * Prefix-matches arenaVotesMine: invalidateQueries({ queryKey: arenaVotes(id) })
     * invalidates BOTH arenaVotes and arenaVotesMine in one call. This is intentional.
     */
    arenaVotes: (arenaId: number) => ["arenas", arenaId, "votes"] as const,

    /**
     * The current user's own vote for an arena (mine=true query).
     */
    arenaVotesMine: (arenaId: number) =>
        ["arenas", arenaId, "votes", "mine"] as const,

    /**
     * Vote results for a list of arenas.
     * IDs are sorted ascending inside useVoteList before building this key.
     * Callers must stabilise the arenaIds array with useMemo to avoid
     * unnecessary re-fetches from new array references on each render.
     */
    voteList: (sortedArenaIds: number[]) => ["votes", sortedArenaIds] as const,

    /** All genres list. */
    genres: () => ["genres"] as const,

    /** All themes list. */
    themes: () => ["themes"] as const,

    /** All platforms list. */
    platforms: () => ["platforms"] as const,

    /** Game filter metadata (genres + themes + platforms combined). */
    gameMeta: () => ["gameMeta"] as const,

    /** Paginated game list with filters. */
    games: (params: GamesQueryParams) => ["games", params] as const,

    /** Current user's own profile. */
    myProfile: () => ["myProfile"] as const,

    /** Another user's profile by nickname. */
    userProfile: (nickname: string) => ["userProfile", nickname] as const,

    /** Current user's own reviews. */
    myReviews: () => ["myReviews"] as const,

    /** Reviews by a specific member. */
    reviewsByMember: (memberId: string) => ["reviewsByMember", memberId] as const,

    /** Current user's wishlists (paginated). */
    myWishlists: (page: number) => ["myWishlists", page] as const,

    /** Score records for current user. */
    scoreRecords: () => ["scoreRecords"] as const,

    /** Arena detail by ID. */
    arenaDetail: (arenaId: number) => ["arenaDetail", arenaId] as const,

    /** Nickname availability check (lazy — use with enabled: false). */
    nicknameCheck: (nickname: string) => ["nicknameCheck", nickname] as const,

    /** Email availability check (lazy — use with enabled: false). */
    emailCheck: (email: string) => ["emailCheck", email] as const,

    /** Reviews for a game page. */
    reviews: (gameId: number) => ["reviews", gameId] as const,

    /**
     * Wishlist status for a game.
     * Query is disabled when viewerId is falsy (unauthenticated).
     */
    wishlist: (gameId: number) => ["wishlist", gameId] as const,

    /**
     * Paginated notification records.
     * Param name is currentPage (matches /api/member/notification-records route).
     */
    notifications: (currentPage: number) =>
        ["notifications", currentPage] as const,
};

export type SortType = "latest" | "popular" | "rating";

export interface CacheKeyParams {
    genreId?: string;
    themeId?: string;
    platformId?: string;
    keyword?: string;
    sort: SortType;
    page: string;
    size: string;
}

/**
 * Game list cache key (existing — unchanged)
 */
export function generateCacheKey(params: CacheKeyParams): string {
    const {
        genreId = "",
        themeId = "",
        platformId = "",
        keyword = "",
        sort = "popular",
        page = "1",
        size = "6",
    } = params;

    return `games:${sort}:${genreId}:${themeId}:${platformId}:${keyword}:${page}:${size}`;
}

// ─── New key generators ────────────────────────────────────────────────────

export function gameDetailKey(id: number): string {
    return `game:detail:${id}`;
}

export function genreListKey(): string {
    return "genre:list";
}

export function platformListKey(): string {
    return "platform:list";
}

export function themeListKey(): string {
    return "theme:list";
}

export function gameMetaKey(): string {
    return "game:meta";
}

export function memberProfileKey(nickname: string): string {
    return `member:profile:${nickname}`;
}

// ─── Arena keys (version-based) ───────────────────────────────────────────

export const ARENA_LIST_VERSION_KEY = "arena:list:version";

type ArenaListKeyParams = {
    currentPage: number;
    status?: number;
    targetMemberId?: string;
    pageSize: number;
};

export function arenaListKey(
    version: string,
    params: ArenaListKeyParams
): string {
    const { currentPage, status, targetMemberId, pageSize } = params;
    return `arena:list:v${version}:${status ?? ""}:${targetMemberId ?? ""}:${pageSize}:${currentPage}`;
}

export function arenaDetailKey(id: number): string {
    return `arena:detail:${id}`;
}

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
 * 캐시 키 생성 함수
 * 쿼리 조건을 기준으로 고유한 키 생성
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

/**
 * Arena 캐시 키 생성 함수
 */
export function generateArenaCacheKey(params: {
    currentPage: number;
    status?: number;
    targetMemberId?: string;
    pageSize: number;
}): string {
    const {
        currentPage = 1,
        status,
        targetMemberId,
        pageSize = 10,
    } = params;

    return `arena:list:${status ?? ""}:${targetMemberId ?? ""}:${pageSize}:${currentPage}`;
}

/**
 * Arena 상세 캐시 키
 */
export function generateArenaDetailCacheKey(arenaId: number): string {
    return `arena:detail:${arenaId}`;
}

/**
 * 특정 사용자의 모든 arena 캐시 무효화
 */
export function getArenaCachePatterns(userId: string): string[] {
    return [`arena:list:*:${userId}:*`, `arena:list:*::*`]; // 사용자 본인 + 전체 캐시
}

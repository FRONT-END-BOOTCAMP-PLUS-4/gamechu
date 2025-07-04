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

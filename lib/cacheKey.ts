export type SortType = "popular" | "rating" | "latest";

export interface CacheKeyParams {
    sort: SortType;
    genre?: string;
    theme?: string;
    platform?: string;
    keyword?: string;
    page: string;
    size: string;
}

export function generateCacheKey(params: CacheKeyParams): string {
    const isFilterless =
        !params.genre && !params.theme && !params.platform && !params.keyword;

    if (!isFilterless) return ""; // 캐시 대상 아님

    return `games:${params.sort}:p${params.page}:s${params.size}`;
}

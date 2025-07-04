export interface GetFilteredGamesRequestDto {
    genreId?: number;
    themeId?: number;
    platformId?: number;
    keyword?: string;
    sort: "latest" | "popular" | "rating";
    offset: number;
    limit: number;
}

export interface GetGamesByFilterRequestDto {
    genre?: string;
    theme?: string;
    platform?: string;
    keyword?: string;
    sort?: "latest" | "popular" | "rating";
}

export interface GetGameDetailDto {
    id: number;
    title: string;
    developer: string;
    thumbnail: string;
    releaseDate: string;
    platforms: string[];
    genres: string[];
    themes: string[];
}

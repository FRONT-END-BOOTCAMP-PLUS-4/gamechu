export interface GetGameCardDto {
    id: number;
    title: string;
    thumbnail: string;
    developer: string;
    platform: string;
    expertRating: number;
    reviewCount: number;
    releaseDate: Date;
}

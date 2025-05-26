export interface ReviewByMembersDto {
    id: number;
    gameId: number;
    content: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date | null;
    gameTitle: string;
    imageUrl: string | null;
}

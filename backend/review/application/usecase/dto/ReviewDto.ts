export interface ReviewDto {
    id: number;
    memberId: string;
    gameId: number;
    content: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date | null;
    nickname: string;
    imageUrl: string | null;
    score: number;
    likeCount: number;
    isLiked: boolean;
}

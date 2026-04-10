import { z } from "zod";

export const CreateReviewSchema = z.object({
    content: z.string().min(1, "리뷰 내용을 입력해주세요."),
    rating: z
        .number()
        .int()
        .min(1, "별점은 1-5 사이여야 합니다.")
        .max(5, "별점은 1-5 사이여야 합니다."),
});

export interface CreateReviewDto {
    gameId: number;
    content: string;
    rating: number;
}

import { z } from "zod";

export const UpdateReviewSchema = z
    .object({
        content: z.string().min(1, "리뷰 내용을 입력해주세요.").optional(),
        rating: z
            .number()
            .int()
            .min(1, "별점은 1-5 사이여야 합니다.")
            .max(5, "별점은 1-5 사이여야 합니다.")
            .optional(),
    })
    .refine((data) => data.content !== undefined || data.rating !== undefined, {
        message: "수정할 내용을 입력해주세요.",
    });

export interface UpdateReviewDto {
    content?: string;
    rating?: number;
}

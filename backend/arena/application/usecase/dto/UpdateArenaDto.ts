import { z } from "zod";

// Member route fields
export const UpdateArenaSchema = z.object({
    challengerId: z.string().optional(),
    description:  z.string().min(1, "설명을 입력해주세요.").max(500, "설명은 500자 이하여야 합니다.").optional(),
    startDate:    z.string().datetime("올바른 날짜 형식이 아닙니다.").optional(),
}).refine(
    data => Object.values(data).some(v => v !== undefined),
    { message: "변경된 내용을 입력해주세요." }
);

// Admin route fields
export const UpdateArenaAdminSchema = z.object({
    status:       z.number().int().optional(),
    challengerId: z.string().optional(),
}).refine(
    data => Object.values(data).some(v => v !== undefined),
    { message: "변경된 내용을 입력해주세요." }
);

export class UpdateArenaDto {
    constructor(
        public id: number,
        public challengerId?: string,
        public title?: string,
        public description?: string,
        public status?: number,
        public startDate?: Date
    ) {}
}

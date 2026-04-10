import { z } from "zod";

export const GetArenaSchema = z.object({
    currentPage: z.coerce
        .number()
        .int()
        .min(1, "페이지는 1 이상이어야 합니다.")
        .default(1),
    status: z.coerce.number().int().default(0),
    // Absent from searchParams when not set → optional with default false after transform.
    mine: z
        .enum(["true", "false"])
        .optional()
        .transform((v) => v === "true"),
    pageSize: z.coerce
        .number()
        .int()
        .min(1, "페이지 크기는 1 이상이어야 합니다.")
        .default(9),
    memberId: z.string().optional(), // targetMemberId — for "other user's arenas" view
});

export class GetArenaDto {
    constructor(
        public queryString: {
            currentPage: number;
            status: number;
            mine: boolean;
            targetMemberId?: string; // 👈 추가 (타 유저용)
        },
        public memberId: string | null,
        public pageSize: number,
        public sortField: string = "startDate",
        public ascending: boolean = false
    ) {}
}

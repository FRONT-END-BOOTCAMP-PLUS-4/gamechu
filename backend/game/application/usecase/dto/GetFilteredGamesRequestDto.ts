import { z } from "zod";

export const GetFilteredGamesSchema = z.object({
    sort: z.enum(["popular", "latest", "rating"]).default("popular"),
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).default(6),
    genreId: z.coerce.number().int().positive().optional(),
    themeId: z.coerce.number().int().positive().optional(),
    platformId: z.coerce.number().int().positive().optional(),
    keyword: z.string().max(100).optional(),
});

export interface GetFilteredGamesRequestDto {
    genreId?: number;
    themeId?: number;
    platformId?: number;
    keyword?: string;
    sort: "latest" | "popular" | "rating";
    offset: number;
    limit: number;
}

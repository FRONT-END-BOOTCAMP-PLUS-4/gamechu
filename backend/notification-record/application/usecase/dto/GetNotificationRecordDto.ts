import { z } from "zod";

export const GetNotificationRecordSchema = z.object({
    currentPage: z.coerce.number().int().min(1).default(1),
});

export class GetNotificationRecordDto {
    constructor(
        public currentPage: number,
        public memberId: string
    ) {}
}

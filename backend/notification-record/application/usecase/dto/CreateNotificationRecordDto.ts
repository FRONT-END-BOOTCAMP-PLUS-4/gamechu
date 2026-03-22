import { z } from "zod";

export const CreateNotificationRecordSchema = z.object({
    memberId:    z.string().min(1, "회원 ID를 입력해주세요."),
    typeId:      z.number().int().positive("유효하지 않은 알림 유형입니다."),
    description: z.string().min(1, "알림 내용을 입력해주세요."),
});

export class CreateNotificationRecordDto {
    constructor(
        public memberId: string,
        public typeId: number,
        public description: string
    ) {}
}

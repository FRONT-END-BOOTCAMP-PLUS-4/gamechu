import { getTier } from "@/utils/GetTiers";
import { PrismaNotificationRecordRepository } from "@/backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository";
import { CreateNotificationRecordUsecase } from "@/backend/notification-record/application/usecase/CreateNotificationRecordUsecase";
import { CreateNotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/CreateNotificationRecordDto";

export async function sendTierNotificationIfChanged(
    memberId: string,
    beforeScore: number,
    afterScore: number
): Promise<void> {
    const beforeTier = getTier(beforeScore);
    const afterTier = getTier(afterScore);
    if (beforeTier.label === afterTier.label) return;

    // typeId: 1=티어 승급, 2=티어 강등 (notification_types 테이블과 동기화 필요)
    const typeId = afterScore > beforeScore ? 1 : 2;
    const description =
        typeId === 1
            ? `${afterTier.label} 티어로 승급했습니다!`
            : `${afterTier.label} 티어로 강등되었습니다.`;

    const repo = new PrismaNotificationRecordRepository();
    const usecase = new CreateNotificationRecordUsecase(repo);
    await usecase.execute(
        new CreateNotificationRecordDto(memberId, typeId, description)
    );
}

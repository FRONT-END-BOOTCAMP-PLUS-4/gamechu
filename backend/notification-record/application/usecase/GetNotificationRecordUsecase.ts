import { NotificationTypeRepository } from "@/backend/notification-type/domain/repositories/NotificationTypeRepository";
import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";
import { GetNotificationRecordDto } from "./dto/GetNotificationRecordDto";
import { NotificationRecordFilter } from "@/backend/notification-record/domain/repositories/filters/NotificationRecordFilter";
import { NotificationRecord, NotificationType } from "@/prisma/generated";
import { NotificationRecordListDto } from "./dto/NotificationRecordListDto";
import { NotificationRecordDto } from "./dto/NotificationRecordDto";

export class GetNotificationRecordUsecase {
    private notificationRecordRepository: NotificationRecordRepository;
    private notificationTypeRepository: NotificationTypeRepository;

    constructor(
        notificationRecordRepository: NotificationRecordRepository,
        notificationTypeRepository: NotificationTypeRepository
    ) {
        this.notificationRecordRepository = notificationRecordRepository;
        this.notificationTypeRepository = notificationTypeRepository;
    }

    async execute(
        getNotificationRecordDto: GetNotificationRecordDto
    ): Promise<NotificationRecordListDto> {
        try {
            // page setup
            const pageSize: number = 5;
            const currentPage: number =
                getNotificationRecordDto.currentPage || 1;
            const memberId: string = getNotificationRecordDto.memberId;
            const offset: number = (currentPage - 1) * pageSize;
            const limit: number = pageSize;

            // data query
            const filter = new NotificationRecordFilter(
                memberId,
                null,
                null,
                "createdAt",
                false,
                offset,
                limit
            );

            const records: NotificationRecord[] =
                await this.notificationRecordRepository.findAll(filter);
            const recordDto: NotificationRecordDto[] = await Promise.all(
                records.map(async (record) => {
                    const type: NotificationType | null =
                        await this.notificationTypeRepository.findById(
                            record.typeId
                        );

                    return {
                        id: record.id,
                        memberId: record.memberId,
                        typeId: record.typeId,
                        description: record.description,
                        createdAt: record.createdAt,
                        typeName: type?.name || "기타",
                        typeImageUrl:
                            type?.imageUrl ||
                            "@/public/icons/defaultTypeImage.ico",
                    };
                })
            );
            const totalCount: number =
                await this.notificationRecordRepository.count(filter);
            const startPage =
                Math.floor((currentPage - 1) / pageSize) * pageSize + 1;
            const endPage = Math.ceil(totalCount / pageSize);
            const pages = Array.from(
                { length: 5 },
                (_, i) => i + startPage
            ).filter((pageNumber) => pageNumber <= endPage);

            const recordListDto: NotificationRecordListDto = {
                records: recordDto,
                totalCount,
                currentPage,
                pages,
                endPage,
            };

            return recordListDto;
        } catch (error) {
            console.error("Error retrieving notification records", error);
            throw new Error("Error retrieving notification records");
        }
    }
}

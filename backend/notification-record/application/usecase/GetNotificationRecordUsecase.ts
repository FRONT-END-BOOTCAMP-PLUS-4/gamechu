import { NotificationTypeRepository } from "@/backend/notification-type/domain/repositories/NotificationTypeRepository";
import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";
import { GetNotificationRecordDto } from "./dto/GetNotificationRecordDto";
import { NotificationRecordFilter } from "@/backend/notification-record/domain/repositories/filters/NotificationRecordFilter";
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
        // page setup
        const pageSize: number = 5;
        const currentPage: number = getNotificationRecordDto.currentPage || 1;
        const memberId: string = getNotificationRecordDto.memberId;
        const offset: number = (currentPage - 1) * pageSize;
        const limit: number = pageSize;

        // data query
        const filter = new NotificationRecordFilter(
            memberId,
            null,
            null,
            null,
            "createdAt",
            false,
            offset,
            limit
        );

        const [records, totalCount, allTypes] = await Promise.all([
            this.notificationRecordRepository.findAll(filter),
            this.notificationRecordRepository.count(filter),
            this.notificationTypeRepository.findAll(),
        ]);

        const typeMap = new Map(allTypes.map((t) => [t.id, t]));

        const recordDto: NotificationRecordDto[] = records.map(
            (record) => {
                const type = typeMap.get(record.typeId);
                return new NotificationRecordDto(
                    record.id,
                    record.memberId,
                    record.typeId,
                    record.description,
                    record.isRead,
                    record.createdAt,
                    type?.name ?? "기타",
                    type?.imageUrl ?? "@/public/icons/defaultTypeImage.ico"
                );
            }
        );

        const startPage =
            Math.floor((currentPage - 1) / pageSize) * pageSize + 1;
        const endPage = Math.ceil(totalCount / pageSize);
        const pages = Array.from({ length: 5 }, (_, i) => i + startPage).filter(
            (pageNumber) => pageNumber <= endPage
        );

        return new NotificationRecordListDto(
            recordDto,
            totalCount,
            currentPage,
            pages,
            endPage
        );
    }
}

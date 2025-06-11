import { NotificationTypeRepository } from "../../domain/repositories/NotificationTypeRepository";

export class DeleteArenaUsecase {
    private notificationTypeRepository: NotificationTypeRepository;

    constructor(notificationTypeRepository: NotificationTypeRepository) {
        this.notificationTypeRepository = notificationTypeRepository;
    }

    async execute(id: number): Promise<void> {
        await this.notificationTypeRepository.deleteById(id);
    }
}

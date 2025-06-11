export class UpdateNotificationRecordDto {
    constructor(
        public id: number,
        public memberId?: string,
        public typeId?: number,
        public description?: string,
        public createdAt?: Date
    ) {}
}

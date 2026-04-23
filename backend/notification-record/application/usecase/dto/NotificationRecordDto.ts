export class NotificationRecordDto {
    constructor(
        public id: number,
        public memberId: string,
        public typeId: number,
        public description: string,
        public isRead: boolean,
        public createdAt: Date,
        public typeName: string,
        public typeImageUrl: string
    ) {}
}

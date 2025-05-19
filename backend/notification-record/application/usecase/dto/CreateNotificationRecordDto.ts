export class CreateNotificationRecordDto {
    constructor(
        public memberId: string,
        public typeId: number,
        public description: string
    ) {}
}

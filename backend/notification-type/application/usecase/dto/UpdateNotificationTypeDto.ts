export class UpdateNotificationTypeDto {
    constructor(
        public id: number,
        public name?: string,
        public imageUrl?: string
    ) {}
}

export class CreateArenaDto {
    constructor(
        public creatorId: string,
        public title: string,
        public description: string,
        public startDate: Date
    ) {}
}

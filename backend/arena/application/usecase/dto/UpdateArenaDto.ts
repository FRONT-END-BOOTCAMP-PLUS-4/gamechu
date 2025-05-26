export class UpdateArenaDto {
    constructor(
        public id: number,
        public challengerId: string,
        public title: string,
        public description: string,
        public status: number,
        public startDate: Date
    ) {}
}

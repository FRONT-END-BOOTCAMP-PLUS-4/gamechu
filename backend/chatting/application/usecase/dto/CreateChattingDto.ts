export class CreateChattingDto {
    constructor(
        public arenaId: number,
        public memberId: string,
        public content: string
    ) {}
}

export class ChattingDto {
    constructor(
        public memberId: string,
        public arenaId: number,
        public content: string,
        public createdAt: Date = new Date(), // 기본값 설정
        public id?: number
    ) {}
}

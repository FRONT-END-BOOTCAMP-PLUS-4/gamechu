export class ChattingDto {
    constructor(
        public id: number,
        public memberId: string,
        public arenaId: number,
        public content: string,
        public createdAt: Date = new Date() // 기본값 설정
    ) {}
}

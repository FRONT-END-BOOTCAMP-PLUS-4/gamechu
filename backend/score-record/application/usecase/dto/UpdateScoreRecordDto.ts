export class UpdateScoreRecordDto {
    constructor(
        public id: number,
        public createdAt: string,
        public memberId?: string,
        public policyId?: string,
        public actualScore?: number
    ) {}
}

export class UpdateScoreRecordDto {
    constructor(
        public id: number,
        public createdAt: Date,
        public memberId?: string,
        public policyId?: number,
        public actualScore?: number
    ) {}
}

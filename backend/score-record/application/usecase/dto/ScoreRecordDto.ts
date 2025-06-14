export class ScoreRecordDto {
    constructor(
        public id: number,
        public memberId: string,
        public policyId: number,
        public createdAt: Date,
        public actualScore: number,

        public policyName: string,
        public description: string,
        public score: number,
        public imageUrl: string // policy's imageUrl?
    ) {}
}

export class ScoreRecordDto {
    constructor(
        public readonly id: number,
        public readonly policyName: string,
        public readonly description: string,
        public readonly score: number,
        public readonly imageUrl: string,
        public readonly createdAt: Date
    ) {}
}

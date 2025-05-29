export class CreateScoreRecordDto {
    constructor(
        public readonly memberId: string,
        public readonly policyId: number,
        public readonly actualScore: number
    ) {}
}

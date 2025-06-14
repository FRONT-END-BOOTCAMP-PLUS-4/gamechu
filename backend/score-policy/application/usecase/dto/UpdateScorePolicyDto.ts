export class UpdateScorePolicyDto {
    constructor(
        public id: number,
        public name?: string,
        public description?: string,
        public score?: number,
        public imageUrl?: string
    ) {}
}

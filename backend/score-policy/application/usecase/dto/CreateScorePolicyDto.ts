export class CreateScorePolicyDto {
    constructor(
        public name: string,
        public description: string,
        public score: number,
        public imageUrl: string
    ) {}
}

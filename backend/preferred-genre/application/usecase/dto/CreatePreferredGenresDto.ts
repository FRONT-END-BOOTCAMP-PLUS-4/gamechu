export class CreatePreferredGenresDto {
    constructor(
        public memberId: string,
        public genreIds: number[]
    ) {}
}

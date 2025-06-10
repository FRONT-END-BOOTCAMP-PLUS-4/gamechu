
export class CreatePreferredThemesDto {
    constructor(
        public memberId: string,
        public themeIds: number[]
    ) {}
}
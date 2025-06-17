export class UpdateChattingDto {
    constructor(
        public id: number,
        public content?: string,
        public updatedAt?: Date
    ) {}
}

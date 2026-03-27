export class NicknameCheckResponseDto {
    constructor(
        public readonly isDuplicate: boolean,
        public readonly foundMemberId: string | null,
    ) {}
}

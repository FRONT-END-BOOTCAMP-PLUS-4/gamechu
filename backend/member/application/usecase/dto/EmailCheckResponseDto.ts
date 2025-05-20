// /backend/member/application/usecase/dto/CheckEmailResponseDto.ts
export class EmailCheckResponseDto {
    constructor(public readonly isDuplicate: boolean) {}
}

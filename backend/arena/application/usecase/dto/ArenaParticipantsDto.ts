// application/usecase/dto/ArenaParticipantsDto.ts
export class ArenaParticipantsDto {
    constructor(public creatorId: string, public challengerId: string | null) {}
}

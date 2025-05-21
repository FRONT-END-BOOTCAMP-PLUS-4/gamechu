// application/usecase/GetArenaParticipantsUsecase.ts
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaParticipantsDto } from "./dto/ArenaParticipantsDto";

export class GetArenaParticipantsUsecase {
    constructor(private readonly arenaRepository: ArenaRepository) {}

    async execute(arenaId: number): Promise<ArenaParticipantsDto> {
        return await this.arenaRepository.getParticipants(arenaId);
    }
}

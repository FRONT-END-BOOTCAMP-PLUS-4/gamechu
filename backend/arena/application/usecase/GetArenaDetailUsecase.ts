// application/usecase/ArenaGetByIdUsecase.ts

import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";

export class GetArenaDetailUsecase {
    constructor(private arenaRepository: ArenaRepository) {}

    async execute(arenaId: number): Promise<ArenaDetailDto> {
        return await this.arenaRepository.getArenaById(arenaId);
    }
}

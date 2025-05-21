// backend/arena/application/usecase/UpdateArenaStatusUsecase.ts

import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaStatus } from "@/types/arena-status";

export class UpdateArenaStatusUsecase {
    constructor(private readonly arenaRepository: ArenaRepository) {}

    async execute(arenaId: number, status: ArenaStatus): Promise<void> {
        await this.arenaRepository.updateStatus(arenaId, status);
    }
}

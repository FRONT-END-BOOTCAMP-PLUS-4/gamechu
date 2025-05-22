// backend/arena/application/usecase/UpdateArenaStatusUsecase.ts

import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaStatus } from "@/types/arena-status";

export class UpdateArenaStatusUsecase {
    constructor(private readonly arenaRepository: ArenaRepository) {}

    async execute(
        arenaId: number,
        status: ArenaStatus,
        challengerId?: string
    ): Promise<void> {
        if (status === 2) {
            if (!challengerId) {
                throw new Error("challengerId is required for status 2");
            }
            await this.arenaRepository.updateChallengerAndStatus(
                arenaId,
                challengerId,
                status
            );
        } else {
            await this.arenaRepository.updateStatus(arenaId, status);
        }
    }
}

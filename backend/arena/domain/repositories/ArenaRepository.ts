// domain/repositories/ArenaRepository.ts
import { ArenaDetailDto } from "../../application/usecase/dto/ArenaDetailDto";
import { ArenaStatus } from "@/types/arena-status";

export interface ArenaRepository {
    getArenaById(arenaId: number): Promise<ArenaDetailDto>;
    updateStatus(arenaId: number, status: ArenaStatus): Promise<void>;
    updateChallengerAndStatus(
        arenaId: number,
        challengerId: string,
        status: ArenaStatus
    ): Promise<void>;
}

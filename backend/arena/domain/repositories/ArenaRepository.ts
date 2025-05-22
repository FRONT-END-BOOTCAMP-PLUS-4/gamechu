// domain/repositories/ArenaRepository.ts
import { ArenaParticipantsDto } from "@/backend/arena/application/usecase/dto/ArenaParticipantsDto";
import { ArenaDetailDto } from "../../application/usecase/dto/ArenaDetailDto";
import { ArenaStatus } from "@/types/arena-status";

export interface ArenaRepository {
    getArenaById(arenaId: number): Promise<ArenaDetailDto>;
    getParticipants(arenaId: number): Promise<ArenaParticipantsDto>;
    updateStatus(arenaId: number, status: ArenaStatus): Promise<void>;
    updateChallengerAndStatus(
        arenaId: number,
        challengerId: string,
        status: ArenaStatus
    ): Promise<void>;
}

// domain/repositories/ArenaRepository.ts
import { ArenaDetailDto } from "../../application/usecase/dto/ArenaDetailDto";
import { ArenaStatus } from "@/types/arena-status";
import { ArenaFilter } from "./filters/ArenaFilters";
import { Arena } from "@/prisma/generated";

export interface ArenaRepository {
    count(filter: ArenaFilter): Promise<number>;
    findAll(filter: ArenaFilter): Promise<Arena[]>;
    findById(id: number): Promise<Arena | null>;
    save(arena: Arena): Promise<Arena>;
    update(arena: Arena): Promise<Arena>;
    deleteById(id: number): Promise<void>;

    getArenaById(arenaId: number): Promise<ArenaDetailDto>;
    updateStatus(arenaId: number, status: ArenaStatus): Promise<void>;
    updateChallengerAndStatus(
        arenaId: number,
        challengerId: string,
        status: ArenaStatus
    ): Promise<void>;
    getList(): Promise<ArenaDetailDto[]>;
}

// domain/repositories/ArenaRepository.ts
import { ArenaStatus } from "@/types/arena-status";
import { ArenaFilter } from "./filters/ArenaFilters";
import { Arena } from "@/prisma/generated";
import { UpdateArenaDto } from "../../application/usecase/dto/UpdateArenaDto";

export type CreateArenaInput = Omit<Arena, "id">;
export interface ArenaRepository {
    count(filter: ArenaFilter): Promise<number>;
    findAll(filter: ArenaFilter): Promise<Arena[]>;
    findById(id: number): Promise<Arena | null>;
    save(arena: CreateArenaInput): Promise<Arena>;
    update(updateArenaDto: UpdateArenaDto): Promise<Arena>;
    deleteById(id: number): Promise<void>;

    getArenaById(arenaId: number): Promise<Arena>;
    updateStatus(arenaId: number, status: ArenaStatus): Promise<void>;
    updateChallengerAndStatus(
        arenaId: number,
        challengerId: string,
        status: ArenaStatus
    ): Promise<void>;
    getList(): Promise<Arena[]>;
}

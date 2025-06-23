// domain/repositories/ArenaRepository.ts
import { ArenaStatus } from "@/types/arena-status";
import { ArenaFilter } from "./filters/ArenaFilter";
import { Arena } from "@/prisma/generated";

export type CreateArenaInput = Omit<Arena, "id">;
export interface ArenaRepository {
    count(filter: ArenaFilter): Promise<number>;
    findAll(filter: ArenaFilter): Promise<Arena[]>;
    findById(id: number): Promise<Arena | null>;
    save(arena: CreateArenaInput): Promise<Arena>;
    update(arena: Arena): Promise<Arena>;
    deleteById(id: number): Promise<void>;
    //TODO: 아래 메서드들 위에 메서드 사용하도록 수정하기
    getArenaById(arenaId: number): Promise<Arena>;
    updateStatus(arenaId: number, status: ArenaStatus): Promise<void>;
    updateChallengerAndStatus(
        arenaId: number,
        challengerId: string,
        status: ArenaStatus
    ): Promise<void>;
    getList(): Promise<Arena[]>;
}

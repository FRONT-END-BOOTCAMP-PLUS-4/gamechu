// For example!
import { ArenaRepository } from "../../domain/repositories/ArenaRepository";
import { UpdateArenaDto } from "./dto/UpdateArenaDto";
import { Arena } from "@/prisma/generated";

export class UpdateArenaUsecase {
    private arenaRepository: ArenaRepository;

    constructor(arenaRepository: ArenaRepository) {
        this.arenaRepository = arenaRepository;
    }

    async execute(updateArenaDto: UpdateArenaDto): Promise<Arena> {
        const arena = await this.arenaRepository.findById(updateArenaDto.id);
        if (!arena) {
            throw new Error("Arena not found");
        }

        if (updateArenaDto.status) {
            arena.status = updateArenaDto.status;
        }

        const newArena = await this.arenaRepository.update(arena);
        return newArena;
    }
}

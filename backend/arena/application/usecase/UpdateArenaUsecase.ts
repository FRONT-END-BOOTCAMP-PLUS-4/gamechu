import { ArenaRepository } from "../../domain/repositories/ArenaRepository";
import { UpdateArenaDto } from "./dto/UpdateArenaDto";
import { Arena } from "@/prisma/generated";

export class UpdateArenaUsecase {
    private arenaRepository: ArenaRepository;

    constructor(arenaRepository: ArenaRepository) {
        this.arenaRepository = arenaRepository;
    }

    async execute(updateArenaDto: UpdateArenaDto): Promise<Arena> {
        const newArena = this.arenaRepository.update(updateArenaDto);
        return newArena;
    }
}

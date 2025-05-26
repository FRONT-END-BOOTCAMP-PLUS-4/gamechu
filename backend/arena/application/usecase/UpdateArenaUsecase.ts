import { ArenaRepository } from "../../domain/repositories/ArenaRepository";
import { UpdateArenaDto } from "./dto/UpdateArenaDto";
import { Arena } from "@/prisma/generated";

export class UpdateArenaUsecase {
    private arenaRepository: ArenaRepository;

    constructor(arenaRepository: ArenaRepository) {
        this.arenaRepository = arenaRepository;
    }

    async execute(updateArenaDto: UpdateArenaDto): Promise<Arena> {
        const arena: Arena = {
            id: updateArenaDto.id,
            creatorId: "",
            challengerId: updateArenaDto.challengerId,
            title: updateArenaDto.title,
            description: updateArenaDto.description,
            status: updateArenaDto.status,
            startDate: updateArenaDto.startDate,
        };
        const newArena = this.arenaRepository.update(arena);
        return newArena;
    }
}

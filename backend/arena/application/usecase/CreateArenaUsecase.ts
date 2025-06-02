import { Arena } from "@/prisma/generated";
import {
    ArenaRepository,
    CreateArenaInput,
} from "../../domain/repositories/ArenaRepository";
import { CreateArenaDto } from "./dto/CreateArenaDto";

export class CreateArenaUsecase {
    private arenaRepository: ArenaRepository;

    constructor(arenaRepository: ArenaRepository) {
        this.arenaRepository = arenaRepository;
    }

    async execute(createArenaDto: CreateArenaDto): Promise<Arena> {
        const arena: CreateArenaInput = {
            creatorId: createArenaDto.creatorId,
            challengerId: null,
            title: createArenaDto.title,
            description: createArenaDto.description,
            status: 1,
            startDate: createArenaDto.startDate,
        };

        const newArena = await this.arenaRepository.save(arena);
        return newArena;
    }
}

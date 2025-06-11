import { ArenaRepository } from "../../domain/repositories/ArenaRepository";

export class DeleteArenaUsecase {
    private arenaRepository: ArenaRepository;

    constructor(arenaRepository: ArenaRepository) {
        this.arenaRepository = arenaRepository;
    }

    async execute(id: number): Promise<void> {
        await this.arenaRepository.deleteById(id);
    }
}

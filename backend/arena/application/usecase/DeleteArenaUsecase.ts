import { ArenaRepository } from "../../domain/repositories/ArenaRepository";

export class DeleteArenaUsecase {
    private arenaRepository: ArenaRepository;

    constructor(arenaRepository: ArenaRepository) {
        this.arenaRepository = arenaRepository;
    }

    async execute(id: number): Promise<void> {
        if (!id) {
            throw new Error("id is required");
        }

        await this.arenaRepository.deleteById(id);
    }
}

import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";

import { ArenaDetailDto } from "./dto/ArenaDetailDto";

export class GetArenaListUsecase {
    constructor(private arenaRepo: ArenaRepository) {}

    async execute(): Promise<ArenaDetailDto[]> {
        return await this.arenaRepo.getList();
    }
}

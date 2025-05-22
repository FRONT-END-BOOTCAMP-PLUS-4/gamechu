// application/usecase/ArenaGetByIdUsecase.ts

import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import dayjs from "dayjs";
export class GetArenaDetailUsecase {
    constructor(private arenaRepository: ArenaRepository) {}

    async execute(arenaId: number): Promise<ArenaDetailDto> {
        const ArenaDetail = await this.arenaRepository.getArenaById(arenaId);

        return new ArenaDetailDto(
            ArenaDetail.id,
            ArenaDetail.creatorId,
            ArenaDetail.creatorName,
            ArenaDetail.challengerId,
            ArenaDetail.challengerName,
            ArenaDetail.title,
            ArenaDetail.description,
            dayjs(ArenaDetail.startDate).format("YYYY-MM-DD HH:mm:ss"),
            ArenaDetail.status
        );
    }
}

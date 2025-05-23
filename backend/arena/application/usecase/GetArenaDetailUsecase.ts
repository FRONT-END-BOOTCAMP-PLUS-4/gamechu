// application/usecase/ArenaGetByIdUsecase.ts

import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import dayjs from "dayjs";
export class GetArenaDetailUsecase {
    constructor(private arenaRepository: ArenaRepository) {}

    async execute(arenaId: number): Promise<ArenaDetailDto> {
        const ArenaDetail = await this.arenaRepository.getArenaById(arenaId);
        const startDateObj = dayjs(ArenaDetail.startDate);
        const endChattingObj = startDateObj.add(30, "minute");
        const endVoteObj = endChattingObj.add(24, "hour");

        // 끝 시간도 같은 형식으로 문자열로 만들어
        const endChatting = endChattingObj.format("YYYY-MM-DD HH:mm:ss");
        const endVote = endVoteObj.format("YYYY-MM-DD HH:mm:ss");

        return new ArenaDetailDto(
            ArenaDetail.id,
            ArenaDetail.creatorId,
            ArenaDetail.creatorName,
            ArenaDetail.challengerId,
            ArenaDetail.challengerName,
            ArenaDetail.title,
            ArenaDetail.description,
            dayjs(ArenaDetail.startDate).format("YYYY-MM-DD HH:mm:ss"),
            endChatting,
            endVote,
            ArenaDetail.status
        );
    }
}

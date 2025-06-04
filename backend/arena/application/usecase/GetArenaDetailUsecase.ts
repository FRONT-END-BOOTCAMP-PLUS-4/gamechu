// application/usecase/ArenaGetByIdUsecase.ts

import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { ArenaStatus } from "@/types/arena-status";
export class GetArenaDetailUsecase {
    constructor(
        private arenaRepository: ArenaRepository,
        private memberRepository: MemberRepository
    ) {}

    async execute(arenaId: number): Promise<ArenaDetailDto> {
        const ArenaDetail = await this.arenaRepository.getArenaById(arenaId);
        const creatorName = await this.memberRepository.findById(
            ArenaDetail.creatorId
        );
        const creatorScore = await this.memberRepository.findById(
            ArenaDetail.creatorId
        );
        const challengerName = await this.memberRepository.findById(
            ArenaDetail.challengerId || ""
        );
        const challengerScore = await this.memberRepository.findById(
            ArenaDetail.challengerId || ""
        );
        const startDate = ArenaDetail.startDate;
        const endChatting = new Date(startDate.getTime() + 30 * 60 * 1000);
        const endVote = new Date(endChatting.getTime() + 24 * 60 * 60 * 1000);

        return new ArenaDetailDto(
            ArenaDetail.id,
            ArenaDetail.creatorId,
            creatorName?.nickname || "",
            creatorScore?.score || 0,
            ArenaDetail.challengerId,
            challengerName?.nickname || "",
            challengerScore?.score || 0,
            ArenaDetail.title,
            ArenaDetail.description,
            ArenaDetail.startDate,
            endChatting,
            endVote,
            ArenaDetail.status as ArenaStatus
        );
    }
}

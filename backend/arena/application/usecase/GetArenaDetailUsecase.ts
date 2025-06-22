// application/usecase/ArenaGetByIdUsecase.ts

import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { ArenaStatus } from "@/types/arena-status";
import { VoteFilter } from "@/backend/vote/domain/repositories/filters/VoteFilter";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
export class GetArenaDetailUsecase {
    private arenaRepository: ArenaRepository;
    private memberRepository: MemberRepository;
    private voteRepository: VoteRepository;

    constructor(
        arenaRepository: ArenaRepository,
        memberRepository: MemberRepository,
        voteRepository: VoteRepository
    ) {
        this.arenaRepository = arenaRepository;
        this.memberRepository = memberRepository;
        this.voteRepository = voteRepository;
    }

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

        const totalFilter: VoteFilter = new VoteFilter(arenaId, null, null);
        const voteTotalCount: number = await this.voteRepository.count(
            totalFilter
        );
        const leftFilter: VoteFilter = new VoteFilter(
            arenaId,
            null,
            ArenaDetail.creatorId
        );
        const voteLeftCount: number = await this.voteRepository.count(
            leftFilter
        );
        const voteRightCount: number = voteTotalCount - voteLeftCount;
        const leftPercent: number = (voteLeftCount / voteTotalCount) * 100;
        const rightPercent: number = (voteRightCount / voteTotalCount) * 100;
        console.log("--- ArenaDetailDto 생성 직전 값 확인 ---");
        console.log("voteTotalCount:", voteTotalCount);
        console.log("voteLeftCount:", voteLeftCount);
        console.log("voteRightCount:", voteRightCount);
        console.log("leftPercent:", leftPercent);
        console.log("rightPercent:", rightPercent);
        console.log("-------------------------------------");
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
            ArenaDetail.status as ArenaStatus,
            voteTotalCount,
            voteLeftCount,
            voteRightCount,
            leftPercent,
            rightPercent
        );
    }
}

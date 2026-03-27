import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { ArenaStatus } from "@/types/arena-status";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { GetArenaDetailDto } from "./dto/GetArenaDetailDto";

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

    async execute(
        getArenaDetailDto: GetArenaDetailDto
    ): Promise<ArenaDetailDto> {
        const { arenaId } = getArenaDetailDto;

        const ArenaDetail = await this.arenaRepository.getArenaById(arenaId);

        const creatorName = ArenaDetail.creator?.nickname || "";
        const creatorScore = ArenaDetail.creator?.score || 0;
        const creatorImageUrl = ArenaDetail.creator?.imageUrl || "";
        const challengerName = ArenaDetail.challenger?.nickname || "";
        const challengerScore = ArenaDetail.challenger?.score || null;
        const challengerImageUrl = ArenaDetail.challenger?.imageUrl || null;

        const startDate = ArenaDetail.startDate;
        const endChatting = new Date(startDate.getTime() + 30 * 60 * 1000);
        const endVote = new Date(endChatting.getTime() + 24 * 60 * 60 * 1000);

        const voteStats = await this.voteRepository.countByArenaIds([arenaId]);
        const voteData = voteStats[0] || {
            arenaId,
            totalCount: 0,
            leftCount: 0,
            rightCount: 0,
        };

        const voteTotalCount = voteData.totalCount;
        const voteLeftCount = voteData.leftCount;
        const voteRightCount = voteData.rightCount;

        const leftPercent: number =
            voteTotalCount === 0
                ? 0
                : Math.round((voteLeftCount / voteTotalCount) * 100);
        const rightPercent: number =
            voteTotalCount === 0
                ? 0
                : Math.round((voteRightCount / voteTotalCount) * 100);

        return new ArenaDetailDto(
            ArenaDetail.id,
            ArenaDetail.creatorId,
            creatorName,
            creatorScore,
            creatorImageUrl,
            ArenaDetail.challengerId,
            challengerName,
            challengerScore,
            challengerImageUrl,
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

// application/usecase/ArenaGetByIdUsecase.ts

import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { ArenaStatus } from "@/types/arena-status";
import { VoteFilter } from "@/backend/vote/domain/repositories/filters/VoteFilter";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { GetArenaDetailDto } from "./dto/GetArenaDetailDto";
import { ArenaCacheService } from "@/backend/arena/infra/cache/ArenaCacheService";

export class GetArenaDetailUsecase {
    private arenaRepository: ArenaRepository;
    private memberRepository: MemberRepository;
    private voteRepository: VoteRepository;
    private cacheService: ArenaCacheService;

    constructor(
        arenaRepository: ArenaRepository,
        memberRepository: MemberRepository,
        voteRepository: VoteRepository
    ) {
        this.arenaRepository = arenaRepository;
        this.memberRepository = memberRepository;
        this.voteRepository = voteRepository;
        this.cacheService = new ArenaCacheService();
    }

    async execute(
        getArenaDetailDto: GetArenaDetailDto
    ): Promise<ArenaDetailDto> {
        const { arenaId } = getArenaDetailDto;

        // 캐시에서 조회 시도
        const cachedResult = await this.cacheService.getArenaDetailCache(
            arenaId
        );
        if (cachedResult) {
            return cachedResult;
        }

        //TODO: getArenaById가 아닌 findById를 사용하도록 수정
        const ArenaDetail = await this.arenaRepository.getArenaById(arenaId);

        // creator와 challenger 정보는 이미 ArenaDetail에 포함되어 있음
        const creatorName = ArenaDetail.creator?.nickname || "";
        const creatorScore = ArenaDetail.creator?.score || 0;
        const challengerName = ArenaDetail.challenger?.nickname || "";
        const challengerScore = ArenaDetail.challenger?.score || null;

        const startDate = ArenaDetail.startDate;
        const endChatting = new Date(startDate.getTime() + 30 * 60 * 1000);
        const endVote = new Date(endChatting.getTime() + 24 * 60 * 60 * 1000);

        // Vote count를 한 번에 계산
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

        const result = new ArenaDetailDto(
            ArenaDetail.id,
            ArenaDetail.creatorId,
            creatorName,
            creatorScore,
            ArenaDetail.challengerId,
            challengerName,
            challengerScore,
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

        // 캐시에 저장
        await this.cacheService.setArenaDetailCache(arenaId, result);

        return result;
    }
}

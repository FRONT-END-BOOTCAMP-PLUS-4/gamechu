import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { GetArenaDto } from "./dto/GetArenaDto";
import { ArenaListDto } from "./dto/ArenaListDto";
import { ArenaFilter } from "../../domain/repositories/filters/ArenaFilter";
import { ArenaDto } from "./dto/ArenaDto";
import { GetArenaDates } from "@/utils/GetArenaDates";
import { VoteFilter } from "@/backend/vote/domain/repositories/filters/VoteFilter";
import { ArenaCacheService } from "@/backend/arena/infra/cache/ArenaCacheService";

export class GetArenaUsecase {
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

    async execute(getArenaDto: GetArenaDto): Promise<ArenaListDto> {
        try {
            // page setup
            const pageSize: number = getArenaDto.pageSize;
            const currentPage: number =
                getArenaDto.queryString.currentPage || 1;
            const viewerMemberId: string | null = getArenaDto.memberId;
            const offset: number = (currentPage - 1) * pageSize;
            const limit: number = pageSize;

            /**
             * ✅ 핵심 수정 부분
             *
             * 우선순위:
             * 1. 타 사용자 조회 (targetMemberId)
             * 2. mine === true → 로그인 유저
             * 3. 그 외 → 전체 조회
             */
            const filterMemberId =
                getArenaDto.queryString.targetMemberId ??
                (getArenaDto.queryString.mine ? viewerMemberId : null) ??
                null;

            // 캐시 키 생성
            const cacheParams = {
                currentPage,
                status: getArenaDto.queryString.status,
                targetMemberId: filterMemberId ?? undefined,
                pageSize,
            };

            // 캐시에서 조회 시도
            const cachedResult = await this.cacheService.getArenaListCache(
                cacheParams
            );
            if (cachedResult) {
                return cachedResult;
            }

            // data query
            const filter = new ArenaFilter(
                getArenaDto.queryString.status,
                filterMemberId,
                getArenaDto.sortField,
                getArenaDto.ascending,
                offset,
                limit
            );

            const arenas = await this.arenaRepository.findAll(filter);

            // 모든 arenaIds를 수집하여 한 번에 vote count 조회
            const arenaIds = arenas.map((a) => a.id);
            const voteCounts: Record<
                number,
                {
                    totalCount: number;
                    leftCount: number;
                    rightCount: number;
                }
            > = {};

            if (arenaIds.length > 0) {
                // 각 arena별 vote 수 계산 (RAW QUERY로 성능 향상)
                const voteStats = await this.voteRepository.countByArenaIds(
                    arenaIds
                );
                voteStats.forEach((stat) => {
                    voteCounts[stat.arenaId] = {
                        totalCount: stat.totalCount,
                        leftCount: stat.leftCount,
                        rightCount: stat.rightCount,
                    };
                });
            }

            const arenaDto: ArenaDto[] = arenas.map((arena) => {
                const {
                    debateEndDate,
                    voteEndDate,
                }: { debateEndDate: Date; voteEndDate: Date } =
                    GetArenaDates(arena.startDate);

                const voteData = voteCounts[arena.id] || {
                    totalCount: 0,
                    leftCount: 0,
                    rightCount: 0,
                };

                const creatorNickname = arena.creator?.nickname || "";
                const creatorScore = arena.creator?.score || 0;
                const creatorProfileImageUrl =
                    arena.creator?.imageUrl || "icons/arena2.svg";

                const challengerNickname =
                    arena.challenger?.nickname || null;
                const challengerScore =
                    arena.challenger?.score || null;
                const challengerProfileImageUrl =
                    arena.challenger?.imageUrl || null;

                const leftPercent: number =
                    voteData.totalCount === 0
                        ? 0
                        : Math.round(
                              (voteData.leftCount / voteData.totalCount) * 100
                          );
                const rightPercent: number =
                    voteData.totalCount === 0
                        ? 0
                        : Math.round(
                              (voteData.rightCount / voteData.totalCount) * 100
                          );

                return {
                    id: arena.id,
                    creatorId: arena.creatorId,
                    challengerId: arena.challengerId,
                    title: arena.title,
                    description: arena.description,
                    status: arena.status,
                    startDate: arena.startDate,

                    debateEndDate,
                    voteEndDate,

                    creatorNickname,
                    creatorProfileImageUrl,
                    creatorScore,
                    challengerNickname,
                    challengerProfileImageUrl,
                    challengerScore,

                    voteCount: voteData.totalCount,
                    leftCount: voteData.leftCount,
                    rightCount: voteData.rightCount,
                    leftPercent,
                    rightPercent,
                };
            });

            const totalCount: number = await this.arenaRepository.count(filter);

            const startPage =
                Math.floor((currentPage - 1) / pageSize) * pageSize + 1;
            const endPage = Math.ceil(totalCount / pageSize);
            const pages = Array.from(
                { length: pageSize },
                (_, i) => i + startPage
            ).filter((pageNumber) => pageNumber <= endPage);

            const result: ArenaListDto = {
                arenas: arenaDto,
                totalCount,
                currentPage,
                pages,
                endPage,
            };

            // 캐시에 저장
            await this.cacheService.setArenaListCache(cacheParams, result);

            return result;
        } catch (error) {
            console.error("Error retrieving arenas", error);
            throw new Error("Error retrieving arenas");
        }
    }
}

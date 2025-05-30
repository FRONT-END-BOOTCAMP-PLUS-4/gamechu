import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { GetArenaDto } from "./dto/GetArenaDto";
import { ArenaListDto } from "./dto/ArenaListDto";
import { ArenaFilter } from "../../domain/repositories/filters/ArenaFilters";
import { Arena, Member } from "@/prisma/generated";
import { ArenaDto } from "./dto/ArenaDto";

export class GetArenaUsecase {
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

    async execute(getArenaDto: GetArenaDto): Promise<ArenaListDto> {
        try {
            // page setup
            const pageSize: number = getArenaDto.pageSize;
            const currentPage: number =
                getArenaDto.queryString.currentPage || 1;
            const memberId: string = getArenaDto.memberId || "";
            const offset: number = (currentPage - 1) * pageSize;
            const limit: number = pageSize;

            // data query
            const filter = new ArenaFilter(
                getArenaDto.queryString.status,
                getArenaDto.queryString.mine ? memberId : null,
                getArenaDto.sortField,
                getArenaDto.ascending,
                offset,
                limit
            );

            const arenas: Arena[] = await this.arenaRepository.findAll(filter);
            const arenaDto: ArenaDto[] = await Promise.all(
                arenas.map(async (arena) => {
                    const creator: Member | null =
                        await this.memberRepository.findById(arena.creatorId);
                    const challenger: Member | null =
                        await this.memberRepository.findById(
                            arena.challengerId || ""
                        );
                    const voteTotalCount: number =
                        await this.voteRepository.count({
                            arenaId: arena.id,
                            votedTo: null,
                        });
                    const voteCreatorCount: number =
                        await this.voteRepository.count({
                            arenaId: arena.id,
                            votedTo: "creator",
                        });
                    const leftPercent: number =
                        (voteCreatorCount / voteTotalCount) * 100;

                    return {
                        id: arena.id,
                        creatorId: arena.creatorId,
                        challengerId: arena.challengerId,
                        title: arena.title,
                        description: arena.description,
                        status: arena.status,
                        startDate: arena.startDate,

                        creatorNickname: creator ? creator.nickname : "",
                        creatorProfileImageUrl: creator
                            ? creator.imageUrl
                            : "icons/arena2.svg",
                        creatorScore: creator ? creator.score : 0,
                        challengerNickname: challenger
                            ? challenger.nickname
                            : null,
                        challengerProfileImageUrl: challenger
                            ? challenger.imageUrl
                            : null,
                        challengerScore: challenger ? challenger.score : null,
                        voteCount: voteTotalCount,
                        leftPercent: leftPercent,
                    };
                })
            );
            const totalCount: number = await this.arenaRepository.count(filter);
            const startPage =
                Math.floor((currentPage - 1) / pageSize) * pageSize + 1;
            const endPage = Math.ceil(totalCount / pageSize);
            const pages = Array.from(
                { length: 5 },
                (_, i) => i + startPage
            ).filter((pageNumber) => pageNumber <= endPage);

            const arenaListDto: ArenaListDto = {
                arenas: arenaDto,
                currentPage,
                pages,
                endPage,
            };

            return arenaListDto;
        } catch (error) {
            console.error("Error retrieving arenas", error);
            throw new Error("Error retrieving arenas");
        }
    }
}

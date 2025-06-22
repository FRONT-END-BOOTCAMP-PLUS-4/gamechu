// 탐색 페이지에서 투기장 여러 개 정보 받아올 때 사용
// 이름을 GetArenaUsecase-> GetArenaListUsecase로 변경할 예졍

import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { GetArenaDto } from "./dto/GetArenaDto";
import { ArenaListDto } from "./dto/ArenaListDto";
import { ArenaFilter } from "../../domain/repositories/filters/ArenaFilter";
import { Arena, Member } from "@/prisma/generated";
import { ArenaDto } from "./dto/ArenaDto";
import { GetArenaDates } from "@/utils/GetArenaDates";
import { VoteFilter } from "@/backend/vote/domain/repositories/filters/VoteFilter";

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
                    const {
                        debateEndDate,
                        voteEndDate,
                    }: { debateEndDate: Date; voteEndDate: Date } =
                        GetArenaDates(arena.startDate);

                    const totalFilter: VoteFilter = new VoteFilter(
                        arena.id,
                        null,
                        null
                    );
                    const voteTotalCount: number =
                        await this.voteRepository.count(totalFilter);
                    const leftFilter: VoteFilter = new VoteFilter(
                        arena.id,
                        null,
                        arena.creatorId
                    );
                    const voteLeftCount: number =
                        await this.voteRepository.count(leftFilter);
                    const voteRightCount: number =
                        voteTotalCount - voteLeftCount;
                    const leftPercent: number =
                        (voteLeftCount / voteTotalCount) * 100;
                    const rightPercent: number =
                        (voteRightCount / voteTotalCount) * 100;
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
                        leftCount: voteLeftCount,
                        rightCount: voteRightCount,
                        leftPercent: leftPercent,
                        rightPercent: rightPercent,
                    };
                })
            );
            const totalCount: number = await this.arenaRepository.count(filter);
            const startPage =
                Math.floor((currentPage - 1) / pageSize) * pageSize + 1;
            const endPage = Math.ceil(totalCount / pageSize);
            const pages = Array.from(
                { length: pageSize },
                (_, i) => i + startPage
            ).filter((pageNumber) => pageNumber <= endPage);

            const arenaListDto: ArenaListDto = {
                arenas: arenaDto,
                totalCount,
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

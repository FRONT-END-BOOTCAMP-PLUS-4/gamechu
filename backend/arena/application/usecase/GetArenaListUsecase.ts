// usecase/GetArenaListUsecase.ts
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaDetailDto } from "./dto/ArenaDetailDto";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { ArenaStatus } from "@/types/arena-status";

export class GetArenaListUsecase {
    constructor(
        private arenaRepository: ArenaRepository,
        private memberRepository: MemberRepository
    ) {}

    async execute(): Promise<ArenaDetailDto[]> {
        const rawArenas = await this.arenaRepository.getList();

        // 멤버 정보를 Arena 개수만큼 모두 가져오기
        const arenasWithMembers = await Promise.all(
            rawArenas.map(async (arena) => {
                const creator = await this.memberRepository.findById(
                    arena.creatorId
                );
                const challenger = arena.challengerId
                    ? await this.memberRepository.findById(arena.challengerId)
                    : null;

                const startDate = arena.startDate;
                const endChatting = new Date(
                    startDate.getTime() + 30 * 60 * 1000
                );
                const endVote = new Date(
                    endChatting.getTime() + 24 * 60 * 60 * 1000
                );

                return {
                    id: arena.id,
                    creatorId: arena.creatorId,
                    creatorName: creator?.nickname ?? "",
                    creatorScore: 0,
                    challengerId: arena.challengerId ?? null,
                    challengerName: challenger?.nickname ?? null,
                    challengerScore: 0,
                    title: arena.title,
                    description: arena.description,
                    status: arena.status as ArenaStatus,
                    startDate,
                    endChatting,
                    endVote,
                };
            })
        );

        return arenasWithMembers;
    }
}

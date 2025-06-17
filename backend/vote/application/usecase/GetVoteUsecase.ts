import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { VoteRepository } from "../../domain/repositories/VoteRepository";
import { VoteDto } from "./dto/VoteDto";
import { VoteFilter } from "../../domain/repositories/filters/VoteFilter";

export class GetVoteUsecase {
    constructor(
        private arenaRepository: ArenaRepository,
        private voteRepository: VoteRepository
    ) {}

    async execute(arenaId: number, memberId: string | null): Promise<VoteDto> {
        if (!arenaId || !memberId) {
            throw new Error("잘못된 쿼리입니다.");
        }
        const arena = await this.arenaRepository.findById(arenaId);
        if (!arena) throw new Error("Arena not found");

        const leftVotes = await this.voteRepository.count(
            new VoteFilter(arenaId, null, arena.creatorId)
        );

        const rightVotes = await this.voteRepository.count(
            new VoteFilter(arenaId, null, arena.challengerId)
        );

        const votes = await this.voteRepository.findAll(
            new VoteFilter(arenaId, memberId, null)
        );
        const votedTo = votes[0]?.votedTo ?? null;

        return new VoteDto(arenaId, memberId, leftVotes, rightVotes, votedTo);
    }
}

import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { VoteRepository } from "../../domain/repositories/VoteRepository";
import { VoteFilter } from "../../domain/repositories/filters/VoteFilter";

// TODO: make a DTO instead of using as an interface
export interface CountVoteResult {
    arenaId: number;
    leftVotes: number;
    rightVotes: number;
    total: number;
    leftPercent: number;
    votedTo?: string | null;
}

export class CountVoteUsecase {
    constructor(
        private arenaRepository: ArenaRepository,
        private voteRepository: VoteRepository
    ) {}

    async execute(arenaId: number, memberId: string): Promise<CountVoteResult> {
        const arena = await this.arenaRepository.findById(arenaId);
        if (!arena) throw new Error("Arena not found");

        const leftVotes = await this.voteRepository.count(
            new VoteFilter(arenaId, null, arena.creatorId)
        );

        const rightVotes = await this.voteRepository.count(
            new VoteFilter(arenaId, null, arena.challengerId)
        );

        let votedTo: string | null = null;

        if (memberId) {
            const votes = await this.voteRepository.findAll(
                new VoteFilter(arenaId, memberId, null)
            );
            votedTo = votes[0]?.votedTo ?? null;
        }

        const total = leftVotes + rightVotes;
        const leftPercent =
            total === 0 ? 0 : Math.round((leftVotes / total) * 1000) / 10;

        return {
            arenaId,
            leftVotes,
            rightVotes,
            total,
            leftPercent,
            votedTo,
        };
    }
}

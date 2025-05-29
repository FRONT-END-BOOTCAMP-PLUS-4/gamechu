import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { VoteRepository } from "../../domain/repositories/VoteRepository";
import { VoteFilter } from "../../domain/repositories/filters/VoteFilter";

export interface VoteCountResult {
    arenaId: number;
    leftVotes: number;
    rightVotes: number;
    total: number;
    leftPercent: number;
}

export class VoteCountUsecase {
    constructor(
        private arenaRepository: ArenaRepository,
        private voteRepository: VoteRepository
    ) {}

    async execute(arenaId: number): Promise<VoteCountResult> {
        const arena = await this.arenaRepository.findById(arenaId);
        if (!arena) throw new Error("Arena not found");

        const leftVotes = await this.voteRepository.count(
            new VoteFilter(arenaId, null, arena.creatorId)
        );

        const rightVotes = await this.voteRepository.count(
            new VoteFilter(arenaId, null, arena.challengerId)
        );

        const total = leftVotes + rightVotes;
        const leftPercent =
            total === 0 ? 0 : Math.round((leftVotes / total) * 1000) / 10;

        return {
            arenaId,
            leftVotes,
            rightVotes,
            total,
            leftPercent,
        };
    }
}

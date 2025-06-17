import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { Vote } from "@/prisma/generated";
import { SubmitVoteDto } from "./dto/SubmitVoteDto";

export class UpdateVoteUsecase {
    constructor(private voteRepository: VoteRepository) {}

    async execute(submitVoteDto: SubmitVoteDto): Promise<Vote> {
        const { arenaId, memberId, votedTo } = submitVoteDto;

        const existingVotes = await this.voteRepository.findAll({
            arenaId,
            memberId,
        });

        if (existingVotes.length === 0) {
            throw new Error("투표 내역이 없습니다.");
        }

        const vote = existingVotes[0];
        vote.votedTo = votedTo;

        return await this.voteRepository.update(vote);
    }
}

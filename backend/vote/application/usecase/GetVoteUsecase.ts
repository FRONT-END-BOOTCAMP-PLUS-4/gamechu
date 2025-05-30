import { VoteRepository } from "../../domain/repositories/VoteRepository";

export class GetVoteUsecase {
    constructor(private voteRepository: VoteRepository) {}

    async execute(
        arenaId: number,
        memberId: string | null
    ): Promise<string | null> {
        if (!arenaId || !memberId) {
            throw new Error("잘못된 쿼리입니다.");
        }

        const votes = await this.voteRepository.findAll({
            arenaId,
            memberId,
            votedTo: null,
        });

        return votes.length > 0 ? votes[0].votedTo : null;
    }
}

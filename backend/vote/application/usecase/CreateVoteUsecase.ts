import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { Vote } from "@/prisma/generated";
import { VoteDto } from "./dto/VoteDto";

type VoteWithoutId = Omit<Vote, "id">;

export class CreateVoteUsecase {
    constructor(
        private voteRepository: VoteRepository,
        private arenaRepository: ArenaRepository
    ) {}

    async execute(dto: VoteDto): Promise<Vote> {
        const { arenaId, memberId, votedTo } = dto;

        const arena = await this.arenaRepository.findById(arenaId);
        if (!arena) throw new Error("해당 아레나가 존재하지 않습니다.");
        if (arena.status !== 4) throw new Error("투표 가능한 상태가 아닙니다.");

        if (arena.creatorId === memberId || arena.challengerId === memberId) {
            throw new Error("참여자는 투표할 수 없습니다.");
        }

        const existingVotes = await this.voteRepository.findAll({
            arenaId,
            memberId,
        });

        if (existingVotes.length > 0) {
            throw new Error("이미 투표한 사용자입니다.");
        }

        const newVote: VoteWithoutId = {
            arenaId,
            memberId,
            votedTo,
        };

        return await this.voteRepository.save(newVote);
    }
}

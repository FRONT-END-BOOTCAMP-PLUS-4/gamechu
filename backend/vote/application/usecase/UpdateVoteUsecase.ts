import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { Vote } from "@/prisma/generated";
import { VoteDto } from "./dto/VoteDto";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
type VoteWithoutId = Omit<Vote, "id">;
export class UpdateVoteUsecase {
    constructor(
        private voteRepository: VoteRepository,
        private arenaRepository: ArenaRepository
    ) {}

    async execute(dto: VoteDto): Promise<Vote> {
        const { arenaId, memberId, votedTo } = dto;

        // 1. 아레나 존재 여부 및 상태 확인
        const arena = await this.arenaRepository.findById(arenaId);
        if (!arena) throw new Error("해당 아레나가 존재하지 않습니다.");
        if (arena.status !== 4) throw new Error("투표 가능한 상태가 아닙니다.");

        // 2. creator 또는 challenger인 경우 투표 금지
        if (arena.creatorId === memberId || arena.challengerId === memberId) {
            throw new Error("참여자는 투표할 수 없습니다.");
        }
        // 해당 유저가 이미 이 아레나에 투표했는지 확인
        const existingVotes = await this.voteRepository.findAll({
            arenaId: Number(arenaId),
            memberId,
            votedTo: null, // votedTo는 null로 설정하여 모든 투표를 조회
        });

        if (existingVotes.length > 0) {
            // 이미 투표한 경우 -> 수정
            const existingVote = existingVotes[0];
            existingVote.votedTo = votedTo;
            return await this.voteRepository.update(existingVote);
        }

        // 처음 투표하는 경우 -> 새로 저장
        const newVote: VoteWithoutId = {
            arenaId,
            memberId,
            votedTo,
        };

        return await this.voteRepository.save(newVote);
    }
}

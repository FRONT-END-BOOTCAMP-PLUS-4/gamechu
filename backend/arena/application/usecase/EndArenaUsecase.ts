import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ApplyArenaScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase";
import { VoteFilter } from "@/backend/vote/domain/repositories/filters/VoteFilter";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";

export class EndArenaUsecase {
    constructor(
        private readonly arenaRepository: ArenaRepository,
        private readonly applyArenaScoreUsecase: ApplyArenaScoreUsecase,
        private readonly voteRepository: VoteRepository
    ) {}

    async execute(arenaId: number): Promise<void> {
        // 1. 투기장 정보, 투표수 조회
        const arena = await this.arenaRepository.findById(arenaId);
        const leftVotes = await this.voteRepository.count(
            new VoteFilter(arenaId, null, arena?.creatorId)
        );

        const rightVotes = await this.voteRepository.count(
            new VoteFilter(arenaId, null, arena?.challengerId)
        );
        // 2. 승패/무승부/취소 결정
        let result: "WIN" | "DRAW" | "CANCEL";
        let winnerId: string | null = null;

        if (!arena?.challengerId) {
            result = "CANCEL";
        } else if (leftVotes > rightVotes) {
            result = "WIN";
            winnerId = arena?.creatorId || null;
        } else if (leftVotes < rightVotes) {
            result = "WIN";
            winnerId = arena?.challengerId || null;
        } else {
            result = "DRAW";
        }

        // 3. 점수 정책 적용
        if (result === "CANCEL") {
            // 둘 다 100점 돌려주기
            await this.applyArenaScoreUsecase.execute({
                memberId: arena?.creatorId || "",
                result: "CANCEL",
            });
            await this.applyArenaScoreUsecase.execute({
                memberId: arena?.challengerId || "",
                result: "CANCEL",
            });
        } else if (result === "DRAW") {
            await this.applyArenaScoreUsecase.execute({
                memberId: arena?.creatorId || "",
                result: "DRAW",
            });
            await this.applyArenaScoreUsecase.execute({
                memberId: arena?.challengerId || "",
                result: "DRAW",
            });
        } else if (result === "WIN" && winnerId) {
            // 승자에게 WIN, 패자에게 JOIN(패배)
            const loserId =
                winnerId === arena?.creatorId
                    ? arena.challengerId
                    : arena?.creatorId;
            await this.applyArenaScoreUsecase.execute({
                memberId: winnerId,
                result: "WIN",
            });
        }
    }
}

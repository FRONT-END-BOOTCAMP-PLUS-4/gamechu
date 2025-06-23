// backend/arena/application/usecase/UpdateArenaStatusUsecase.ts

import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ApplyArenaScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase";
import { UpdateArenaDetailDto } from "./dto/UpdateArenaDetailDto";

export class UpdateArenaStatusUsecase {
    constructor(
        private readonly arenaRepository: ArenaRepository,
        private readonly applyArenaScoreUsecase: ApplyArenaScoreUsecase
    ) {}

    async execute(updateArenaDetailDto: UpdateArenaDetailDto): Promise<void> {
        const { arenaId, status, challengerId } = updateArenaDetailDto;
        const arena = await this.arenaRepository.findById(arenaId);
        if (!arena) {
            throw new Error("투기장이 존재하지 않습니다.");
        }

        if (status === 2) {
            if (arena.status !== 1 || arena.challengerId) {
                throw new Error("이미 다른 유저가 참가했습니다.");
            }

            if (!challengerId) {
                throw new Error("challengerId is required for status 2");
            }

            await this.arenaRepository.updateChallengerAndStatus(
                arenaId,
                challengerId,
                status
            );
            await this.applyArenaScoreUsecase.execute({
                memberId: challengerId,
                result: "JOIN",
            });
        } else {
            await this.arenaRepository.updateStatus(arenaId, status);
        }
    }
}

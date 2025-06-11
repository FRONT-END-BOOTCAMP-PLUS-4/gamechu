import { ScorePolicyRepository } from "../../domain/repositories/ScorePolicyRepository";
import { UpdateScorePolicyDto } from "./dto/UpdateScorePolicyDto";
import { ScorePolicy } from "@/prisma/generated";

export class UpdateScorePolicyUsecase {
    private scorePolicyRepository: ScorePolicyRepository;

    constructor(scorePolicyRepository: ScorePolicyRepository) {
        this.scorePolicyRepository = scorePolicyRepository;
    }

    async execute(
        updateScorePolicyDto: UpdateScorePolicyDto
    ): Promise<ScorePolicy> {
        const newScorePolicy =
            this.scorePolicyRepository.update(updateScorePolicyDto);
        return newScorePolicy;
    }
}

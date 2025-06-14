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
        const scorePolicy = await this.scorePolicyRepository.findById(
            updateScorePolicyDto.id
        );

        if (!scorePolicy) {
            throw new Error("Score policy not found");
        }

        if (updateScorePolicyDto.name) {
            scorePolicy.name = updateScorePolicyDto.name;
        }
        if (updateScorePolicyDto.description) {
            scorePolicy.description = updateScorePolicyDto.description;
        }
        if (updateScorePolicyDto.score) {
            scorePolicy.score = updateScorePolicyDto.score;
        }
        if (updateScorePolicyDto.imageUrl) {
            scorePolicy.imageUrl = updateScorePolicyDto.imageUrl;
        }

        const newScorePolicy = this.scorePolicyRepository.update(scorePolicy);
        return newScorePolicy;
    }
}

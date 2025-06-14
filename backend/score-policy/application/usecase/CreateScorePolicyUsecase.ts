import { ScorePolicy } from "@/prisma/generated";
import {
    ScorePolicyRepository,
    CreateScorePolicyInput,
} from "../../domain/repositories/ScorePolicyRepository";
import { CreateScorePolicyDto } from "./dto/CreateScorePolicyDto";

export class CreateScorePolicyUsecase {
    private scorePolicyRepository: ScorePolicyRepository;

    constructor(scorePolicyRepository: ScorePolicyRepository) {
        this.scorePolicyRepository = scorePolicyRepository;
    }

    async execute(
        createScorePolicyDto: CreateScorePolicyDto
    ): Promise<ScorePolicy> {
        const scorePolicy: CreateScorePolicyInput = {
            name: createScorePolicyDto.name,
            description: createScorePolicyDto.description,
            score: createScorePolicyDto.score,
            imageUrl: createScorePolicyDto.imageUrl,
        };

        const newScorePolicy = await this.scorePolicyRepository.save(
            scorePolicy
        );
        return newScorePolicy;
    }
}

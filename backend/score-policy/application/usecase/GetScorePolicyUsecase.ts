import { ScorePolicyRepository } from "../../domain/repositories/ScorePolicyRepository";
import { ScorePolicy } from "@/prisma/generated";

export class GetScorePolicyUsecase {
    private scorePolicyRepository: ScorePolicyRepository;

    constructor(scorePolicyRepository: ScorePolicyRepository) {
        this.scorePolicyRepository = scorePolicyRepository;
    }

    async execute(): Promise<ScorePolicy[]> {
        const scorePolicies: ScorePolicy[] =
            await this.scorePolicyRepository.findAll();

        return scorePolicies;
    }
}

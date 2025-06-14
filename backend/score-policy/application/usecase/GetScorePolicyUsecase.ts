import { ScorePolicyRepository } from "../../domain/repositories/ScorePolicyRepository";
import { ScorePolicy } from "@/prisma/generated";

export class GetScorePolicyUsecase {
    private scorePolicyRepository: ScorePolicyRepository;

    constructor(scorePolicyRepository: ScorePolicyRepository) {
        this.scorePolicyRepository = scorePolicyRepository;
    }

    async execute(): Promise<ScorePolicy[]> {
        try {
            const scorePolicies: ScorePolicy[] =
                await this.scorePolicyRepository.findAll();

            return scorePolicies;
        } catch (error) {
            console.error("Error retrieving score policies", error);
            throw new Error("Error retrieving score policies");
        }
    }
}

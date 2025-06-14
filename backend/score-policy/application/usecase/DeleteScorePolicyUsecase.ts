import { ScorePolicyRepository } from "../../domain/repositories/ScorePolicyRepository";

export class DeleteScorePolicyUsecase {
    private scorePolicyRepository: ScorePolicyRepository;

    constructor(scorePolicyRepository: ScorePolicyRepository) {
        this.scorePolicyRepository = scorePolicyRepository;
    }

    async execute(id: number): Promise<void> {
        await this.scorePolicyRepository.deleteById(id);
    }
}

import { ScoreRecordRepository } from "../../domain/repositories/ScoreRecordRepository";

export class DeleteScoreRecordUsecase {
    private scoreRecordRepository: ScoreRecordRepository;

    constructor(scoreRecordRepository: ScoreRecordRepository) {
        this.scoreRecordRepository = scoreRecordRepository;
    }

    async execute(id: number): Promise<void> {
        await this.scoreRecordRepository.deleteById(id);
    }
}

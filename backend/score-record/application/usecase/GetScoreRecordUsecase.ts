import { ScoreRecordRepository } from "../../domain/repositories/ScoreRecordRepository";
import { ScorePolicyRepository } from "@/backend/score-policy/domain/repositories/ScorePolicyRepository";
import { GetScoreRecordDto } from "./dto/GetScoreRecordDto";
import { ScoreRecordListDto } from "./dto/ScoreRecordListDto";
import { ScoreRecordFilter } from "../../domain/repositories/filters/ScoreRecordFilter";
import { ScorePolicy, ScoreRecord } from "@/prisma/generated";
import { ScoreRecordDto } from "./dto/ScoreRecordDto";

export class GetScoreRecordUsecase {
    private scoreRecordRepository: ScoreRecordRepository;
    private scorePolicyRepository: ScorePolicyRepository;

    constructor(
        scoreRecordRepository: ScoreRecordRepository,
        scorePolicyRepository: ScorePolicyRepository
    ) {
        this.scoreRecordRepository = scoreRecordRepository;
        this.scorePolicyRepository = scorePolicyRepository;
    }

    async execute(
        getScoreRecordDto: GetScoreRecordDto
    ): Promise<ScoreRecordListDto> {
        try {
            // page setup
            const pageSize: number = getScoreRecordDto.pageSize;
            const currentPage: number =
                getScoreRecordDto.queryString.currentPage || 1;
            const offset: number = (currentPage - 1) * pageSize;
            const limit: number = pageSize;

            // data query
            const filter = new ScoreRecordFilter(
                getScoreRecordDto.queryString.policyId,
                getScoreRecordDto.memberId,
                getScoreRecordDto.sortField,
                getScoreRecordDto.ascending,
                offset,
                limit
            );

            const scoreRecords: ScoreRecord[] =
                await this.scoreRecordRepository.findAll(filter);
            const scoreRecordDto: ScoreRecordDto[] = await Promise.all(
                scoreRecords.map(async (scoreRecord) => {
                    const scorePolicy: ScorePolicy | null =
                        await this.scorePolicyRepository.findById(
                            scoreRecord.policyId
                        );

                    return {
                        id: scoreRecord.id,
                        memberId: scoreRecord.memberId,
                        policyId: scoreRecord.policyId,
                        createdAt: scoreRecord.createdAt,
                        actualScore: scoreRecord.actualScore,

                        policyName: scorePolicy ? scorePolicy.name : "",
                        description: scorePolicy ? scorePolicy.description : "",
                        score: scorePolicy ? scorePolicy.score : 0,
                        imageUrl: scorePolicy ? scorePolicy.imageUrl : "",
                    };
                })
            );

            const totalCount: number =
                await this.scoreRecordRepository.count(filter);
            const startPage =
                Math.floor((currentPage - 1) / pageSize) * pageSize + 1;
            const endPage = Math.ceil(totalCount / pageSize);
            const pages = Array.from(
                { length: pageSize },
                (_, i) => i + startPage
            ).filter((pageNumber) => pageNumber <= endPage);

            const scoreRecordListDto: ScoreRecordListDto = {
                records: scoreRecordDto,
                totalCount,
                currentPage,
                pages,
                endPage,
            };
            return scoreRecordListDto;
        } catch (error) {
            console.error("Error retrieving score records", error);
            throw new Error("Error retrieving score records");
        }
    }
}

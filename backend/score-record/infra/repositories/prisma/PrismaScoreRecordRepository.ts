import { PrismaClient } from "@/prisma/generated";
import { ScoreRecordRepository } from "@/backend/score-record/domain/repositories/ScoreRecordRepository";
import { ScoreRecordDto } from "@/backend/score-record/application/usecase/dto/ScoreRecordDto";
import { CreateScoreRecordDto } from "@/backend/score-record/application/usecase/dto/CreateScoreRecordDto";

const prisma = new PrismaClient();

export class PrismaScoreRecordRepository implements ScoreRecordRepository {
    async getScoreRecordsByMemberId(
        memberId: string
    ): Promise<ScoreRecordDto[]> {
        const records = await prisma.scoreRecord.findMany({
            where: { memberId },
            include: {
                policy: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return records.map((record) => {
            const policy = record.policy;
            return new ScoreRecordDto(
                record.id,
                policy.name,
                policy.description,
                policy.score,
                policy.imageUrl,
                record.createdAt
            );
        });
    }

    async createRecord(data: CreateScoreRecordDto): Promise<void> {
        await prisma.scoreRecord.create({
            data: {
                memberId: data.memberId,
                policyId: data.policyId,
            },
        });
    }
}

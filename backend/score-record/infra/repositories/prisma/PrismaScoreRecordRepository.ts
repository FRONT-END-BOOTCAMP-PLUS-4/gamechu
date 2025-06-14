import {
    CreateScoreRecordInput,
    ScoreRecordRepository,
} from "@/backend/score-record/domain/repositories/ScoreRecordRepository";
import { ScoreRecord, Prisma, PrismaClient } from "@/prisma/generated";
import { ScoreRecordFilter } from "@/backend/score-record/domain/repositories/filters/ScoreRecordFilter";

import { ScoreRecordDto } from "@/backend/score-record/application/usecase/dto/ScoreRecordDto";
import { CreateScoreRecordDto } from "@/backend/score-record/application/usecase/dto/CreateScoreRecordDto";

export class PrismaScoreRecordRepository implements ScoreRecordRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    private getWhereClause(
        filter: ScoreRecordFilter
    ): Prisma.ScoreRecordWhereInput {
        const { policyId, memberId } = filter;

        return {
            ...(policyId && {
                policyId,
            }),
            ...(memberId && {
                memberId,
            }),
        };
    }

    async count(filter: ScoreRecordFilter): Promise<number> {
        const count = await this.prisma.scoreRecord.count({
            where: this.getWhereClause(filter),
        });

        return count;
    }
    async findAll(filter: ScoreRecordFilter): Promise<ScoreRecord[]> {
        const { sortField, ascending, offset, limit } = filter;
        const orderBy = sortField
            ? {
                  [sortField]: ascending ? "asc" : "desc",
              }
            : undefined;

        const data = await this.prisma.scoreRecord.findMany({
            where: this.getWhereClause(filter),
            skip: offset,
            take: limit,
            orderBy,
        });

        return data;
    }
    async findById(id: number): Promise<ScoreRecord | null> {
        const data = await this.prisma.scoreRecord.findUnique({
            where: { id },
        });

        return data;
    }
    async save(scoreRecord: CreateScoreRecordInput): Promise<ScoreRecord> {
        const data = await this.prisma.scoreRecord.create({
            data: scoreRecord,
        });

        return data;
    }
    async update(scoreRecord: ScoreRecord): Promise<ScoreRecord> {
        const newData = await this.prisma.scoreRecord.update({
            where: { id: scoreRecord.id },
            data: scoreRecord,
        });

        return newData;
    }
    async deleteById(id: number): Promise<void> {
        await this.prisma.scoreRecord.delete({ where: { id } });
    }

    // TODO: eliminate deprecated function usages
    async getScoreRecordsByMemberId(
        memberId: string
    ): Promise<ScoreRecordDto[]> {
        const records = await this.prisma.scoreRecord.findMany({
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
                memberId,
                policy.id,
                record.createdAt,
                record.actualScore,
                policy.name,
                policy.description,
                policy.score,
                policy.imageUrl
            );
        });
    }

    async createRecord(data: CreateScoreRecordDto): Promise<void> {
        await this.prisma.scoreRecord.create({
            data: {
                memberId: data.memberId,
                policyId: data.policyId,
                actualScore: data.actualScore,
            },
        });
    }
}

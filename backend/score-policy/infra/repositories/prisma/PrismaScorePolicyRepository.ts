// infra/repositories/PrismaArenaRepository.ts
import {
    CreateScorePolicyInput,
    ScorePolicyRepository,
} from "@/backend/score-policy/domain/repositories/ScorePolicyRepository";
import { ScorePolicy, PrismaClient } from "@/prisma/generated";

export class PrismaScorePolicyRepository implements ScorePolicyRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async count(): Promise<number> {
        const count = await this.prisma.scorePolicy.count();

        return count;
    }
    async findAll(): Promise<ScorePolicy[]> {
        const data = await this.prisma.scorePolicy.findMany();

        return data;
    }
    async findById(id: number): Promise<ScorePolicy | null> {
        const data = await this.prisma.scorePolicy.findUnique({
            where: { id },
        });

        return data;
    }
    async save(scorePolicy: CreateScorePolicyInput): Promise<ScorePolicy> {
        const data = await this.prisma.scorePolicy.create({
            data: scorePolicy,
        });

        return data;
    }
    async update(scorePolicy: ScorePolicy): Promise<ScorePolicy> {
        const newData = await this.prisma.scorePolicy.update({
            where: { id: scorePolicy.id },
            data: scorePolicy,
        });

        return newData;
    }
    async deleteById(id: number): Promise<void> {
        await this.prisma.scorePolicy.delete({ where: { id } });
    }
}

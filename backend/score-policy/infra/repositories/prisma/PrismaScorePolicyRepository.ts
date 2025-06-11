// infra/repositories/PrismaArenaRepository.ts
import {
    CreateScorePolicyInput,
    ScorePolicyRepository,
} from "@/backend/score-policy/domain/repositories/ScorePolicyRepository";
import { ScorePolicy, PrismaClient } from "@/prisma/generated";
import { UpdateScorePolicyDto } from "@/backend/score-policy/application/usecase/dto/UpdateScorePolicyDto";

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
    async update(
        updateScorePolicyDto: UpdateScorePolicyDto
    ): Promise<ScorePolicy> {
        const { id, ...fields } = updateScorePolicyDto;

        // undefined가 아닌 값만 추림
        const data: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
            if (value !== undefined) {
                data[key] = value;
            }
        }

        const newData = await this.prisma.scorePolicy.update({
            where: { id },
            data,
        });

        return newData;
    }
    async deleteById(id: number): Promise<void> {
        await this.prisma.scorePolicy.delete({ where: { id } });
    }
}

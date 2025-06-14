import { ScorePolicy } from "@/prisma/generated";

export type CreateScorePolicyInput = Omit<ScorePolicy, "id">;

export interface ScorePolicyRepository {
    count(): Promise<number>;
    findAll(): Promise<ScorePolicy[]>;
    findById(id: number): Promise<ScorePolicy | null>;
    save(scorePolicy: CreateScorePolicyInput): Promise<ScorePolicy>;
    update(scorePolicy: ScorePolicy): Promise<ScorePolicy>;
    deleteById(id: number): Promise<void>;
}

import { ScorePolicy } from "@/prisma/generated";
import { UpdateScorePolicyDto } from "../../application/usecase/dto/UpdateScorePolicyDto";

export type CreateScorePolicyInput = Omit<ScorePolicy, "id">;

export interface ScorePolicyRepository {
    count(): Promise<number>;
    findAll(): Promise<ScorePolicy[]>;
    findById(id: number): Promise<ScorePolicy | null>;
    save(scorePolicy: CreateScorePolicyInput): Promise<ScorePolicy>;
    update(updateScorePolicyDto: UpdateScorePolicyDto): Promise<ScorePolicy>;
    deleteById(id: number): Promise<void>;
}

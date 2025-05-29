import { Vote } from "@/prisma/generated";
import { VoteFilter } from "./filters/VoteFilter";
type VoteWithoutId = Omit<Vote, "id">;
export interface VoteRepository {
    count(filter: VoteFilter): Promise<number>;
    findAll(filter: VoteFilter): Promise<Vote[]>;
    findById(id: number): Promise<Vote | null>;
    save(vote: VoteWithoutId): Promise<Vote>;
    update(vote: Vote): Promise<Vote>;
    deleteById(id: number): Promise<void>;
}

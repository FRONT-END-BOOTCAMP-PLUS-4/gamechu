import { Vote } from "@/prisma/generated";
import { VoteFilter } from "./filters/VoteFilter";

export interface VoteRepository {
    count(filter: VoteFilter): Promise<number>;
    findAll(filter: VoteFilter): Promise<Vote[]>;
    findById(id: number): Promise<Vote | null>;
    save(vote: Vote): Promise<Vote>;
    update(vote: Vote): Promise<Vote>;
    deleteById(id: number): Promise<void>;
}

import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { VoteRepository } from "../../domain/repositories/VoteRepository";
import { VoteDto } from "./dto/VoteDto";
import { VoteFilter } from "../../domain/repositories/filters/VoteFilter";
import { GetVoteDto } from "./dto/GetVoteDto";
import { Vote } from "@/prisma/generated";
import { VoteListDto } from "./dto/VoteListDto";

export class GetVoteUsecase {
    constructor(
        private arenaRepository: ArenaRepository,
        private voteRepository: VoteRepository
    ) {}

    async execute(getVoteDto: GetVoteDto): Promise<VoteListDto> {
        const {
            queryString: { arenaId, votedTo, mine },
            memberId,
        } = getVoteDto;

        if (!arenaId) {
            throw new Error("잘못된 쿼리입니다.");
        }

        const arena = await this.arenaRepository.findById(arenaId);
        if (!arena) throw new Error("Arena not found");

        // mine이 true일 경우에만 memberId를 필터에 넣는다.
        const filter = new VoteFilter(arenaId, mine ? memberId : null, votedTo);

        const votes: Vote[] = await this.voteRepository.findAll(filter);
        const totalCount: number = await this.voteRepository.count(
            new VoteFilter(arenaId, null, votedTo)
        );

        const voteListDto: VoteListDto = {
            votes: votes.map((vote) => vote as VoteDto),
            totalCount,
        };

        return voteListDto;
    }
}

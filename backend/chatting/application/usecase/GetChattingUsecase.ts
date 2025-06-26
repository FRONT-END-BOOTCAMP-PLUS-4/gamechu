import { ChattingRepository } from "../../domain/repositories/ChattingRepository";
import { ChattingFilter } from "../../domain/repositories/filters/ChattingFilter";
import { GetChattingDto } from "./dto/GetChattingDto";
import { GetChattingResultDto } from "./dto/GetChattingResultDto";

// 상수는 유스케이스 내부에서도 정의 가능
const MAX_SEND_COUNT = 5;

export class GetChattingUsecase {
    constructor(private chattingRepo: ChattingRepository) {}

    async execute(
        getChattingDto: GetChattingDto
    ): Promise<GetChattingResultDto> {
        const { arenaId, memberId } = getChattingDto;
        const filterChats = new ChattingFilter(arenaId, null); // 채팅을 filter할 때는 memberId가 null
        const filterCount = new ChattingFilter(arenaId, memberId);
        const chats = await this.chattingRepo.findAll(filterChats);

        let sentCount = 0;
        if (memberId) {
            sentCount = await this.chattingRepo.count(filterCount);
        }

        return {
            chats,
            remainingSends: MAX_SEND_COUNT - sentCount,
        };
    }
}

import { ChattingDto } from "./ChattingDto";

export class GetChattingResultDto {
    constructor(public chats: ChattingDto[], public remainingSends: number) {}
}

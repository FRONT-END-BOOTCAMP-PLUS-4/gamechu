import { VoteDto } from "./VoteDto";

export class VoteListDto {
    constructor(public votes: VoteDto[], public totalCount: number) {}
}

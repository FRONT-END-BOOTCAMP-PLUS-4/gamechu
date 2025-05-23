import { ArenaStatus } from "@/types/arena-status";

export class ArenaDetailDto {
    constructor(
        public id: number,
        public creatorId: string,
        public creatorName: string,
        public challengerId: string | null,
        public challengerName: string | null,
        public title: string,
        public description: string,
        public startDate: string,
        public endChatting: string,
        public endVote: string,
        public status: ArenaStatus
    ) {}
}

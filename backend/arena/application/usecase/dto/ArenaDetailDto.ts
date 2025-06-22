import { ArenaStatus } from "@/types/arena-status";

export class ArenaDetailDto {
    constructor(
        public id: number,
        public creatorId: string,
        public creatorName: string,
        public creatorScore: number,
        public challengerId: string | null,
        public challengerName: string | null,
        public challengerScore: number | null,
        public title: string,
        public description: string,
        public startDate: Date,
        public endChatting: Date,
        public endVote: Date,
        public status: ArenaStatus,
        public voteCount: number,
        public leftCount: number,
        public rightCount: number,
        public leftPercent: number,
        public rightPercent: number
    ) {}
}

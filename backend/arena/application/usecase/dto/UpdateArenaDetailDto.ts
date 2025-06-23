import { ArenaStatus } from "@/types/arena-status";

export class UpdateArenaDetailDto {
    constructor(
        public arenaId: number,
        public status: ArenaStatus,
        public challengerId?: string
    ) {}
}

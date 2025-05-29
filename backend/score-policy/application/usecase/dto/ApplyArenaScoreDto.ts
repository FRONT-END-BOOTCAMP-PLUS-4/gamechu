export type ArenaResult = "WIN" | "DRAW" | "JOIN" | "CANCEL";

export interface ApplyArenaScoreDto {
    memberId: string;
    result: ArenaResult;
}

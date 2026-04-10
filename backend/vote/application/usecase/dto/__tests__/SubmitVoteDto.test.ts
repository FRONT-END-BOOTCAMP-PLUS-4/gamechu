import { describe, it, expect } from "vitest";
import { SubmitVoteSchema } from "../SubmitVoteDto";

describe("SubmitVoteSchema", () => {
    const valid = { arenaId: 1, votedTo: "member-abc" };

    it("유효한 입력 통과", () => {
        expect(SubmitVoteSchema.safeParse(valid).success).toBe(true);
    });

    it("arenaId 0 → 실패", () => {
        expect(
            SubmitVoteSchema.safeParse({ ...valid, arenaId: 0 }).success
        ).toBe(false);
    });

    it("votedTo 빈 문자열 → 실패", () => {
        expect(
            SubmitVoteSchema.safeParse({ ...valid, votedTo: "" }).success
        ).toBe(false);
    });
});

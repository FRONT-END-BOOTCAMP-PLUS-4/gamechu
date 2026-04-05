import { describe, it, expect, vi } from "vitest";
import { CreateArenaUsecase } from "../CreateArenaUsecase";
import { createMockArenaRepository } from "@/tests/mocks/createMockArenaRepository";
import { CreateArenaDto } from "../dto/CreateArenaDto";
import { Arena } from "@/prisma/generated";

const mockArena = {
    id: 1,
    creatorId: "member-1",
    challengerId: null,
    title: "Test Arena",
    description: "Test Description",
    status: 1,
    startDate: new Date("2026-04-01"),
} as unknown as Arena;

describe("CreateArenaUsecase", () => {
    it("saves arena with status 1 and challengerId null", async () => {
        const repo = createMockArenaRepository();
        vi.mocked(repo.save).mockResolvedValue(mockArena);

        const usecase = new CreateArenaUsecase(repo);
        const dto = new CreateArenaDto(
            "member-1",
            "Test Arena",
            "Test Description",
            new Date("2026-04-01")
        );
        const result = await usecase.execute(dto);

        expect(repo.save).toHaveBeenCalledWith(
            expect.objectContaining({
                creatorId: "member-1",
                challengerId: null,
                status: 1,
            })
        );
        expect(result.id).toBe(1);
    });

    it("propagates repository errors", async () => {
        const repo = createMockArenaRepository();
        vi.mocked(repo.save).mockRejectedValue(new Error("DB error"));

        const usecase = new CreateArenaUsecase(repo);
        const dto = new CreateArenaDto(
            "member-1",
            "Test Arena",
            "Test Description",
            new Date("2026-04-01")
        );

        await expect(usecase.execute(dto)).rejects.toThrow("DB error");
    });
});

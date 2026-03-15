import { describe, it, expect, vi } from "vitest";
import { UpdateArenaUsecase } from "../UpdateArenaUsecase";
import { MockArenaRepository } from "@/tests/mocks/MockArenaRepository";
import { Arena } from "@/prisma/generated";

const makeArena = (overrides: Partial<Arena> = {}): Arena => ({
    id: 1,
    creatorId: "creator-1",
    challengerId: null,
    title: "Test Arena",
    description: "desc",
    startDate: new Date("2026-04-01T10:00:00.000Z"),
    status: 1,
    gameId: 100,
    ...overrides,
});

describe("UpdateArenaUsecase", () => {
    it("not found: findById returns null → throws 'Arena not found'", async () => {
        const arenaRepo = MockArenaRepository();
        vi.mocked(arenaRepo.findById).mockResolvedValue(null);

        const usecase = new UpdateArenaUsecase(arenaRepo);
        await expect(usecase.execute({ id: 1 })).rejects.toThrow("Arena not found");
    });

    it("status update: status in dto → arena.status mutated, update called with modified arena", async () => {
        const arenaRepo = MockArenaRepository();
        const arena = makeArena({ status: 1 });
        vi.mocked(arenaRepo.findById).mockResolvedValue(arena);
        vi.mocked(arenaRepo.update).mockResolvedValue({ ...arena, status: 2 });

        const usecase = new UpdateArenaUsecase(arenaRepo);
        await usecase.execute({ id: 1, status: 2 });

        expect(arenaRepo.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 2 })
        );
    });

    it("no status in dto: arena.status unchanged, update still called", async () => {
        const arenaRepo = MockArenaRepository();
        const arena = makeArena({ status: 1 });
        vi.mocked(arenaRepo.findById).mockResolvedValue(arena);
        vi.mocked(arenaRepo.update).mockResolvedValue(arena);

        const usecase = new UpdateArenaUsecase(arenaRepo);
        await usecase.execute({ id: 1, description: "new desc" });

        expect(arenaRepo.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 1 })
        );
    });
});

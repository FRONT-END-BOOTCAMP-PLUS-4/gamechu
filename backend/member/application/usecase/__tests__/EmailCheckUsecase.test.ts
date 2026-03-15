import { describe, it, expect, vi } from "vitest";
import { EmailCheckUsecase } from "../EmailCheckUsecase";
import { MockMemberRepository } from "@/tests/mocks/MockMemberRepository";

describe("EmailCheckUsecase", () => {
    it("available: findByEmail returns null → isDuplicate false", async () => {
        const repo = MockMemberRepository();
        vi.mocked(repo.findByEmail).mockResolvedValue(null);

        const usecase = new EmailCheckUsecase(repo);
        const result = await usecase.execute("available@example.com");

        expect(result.isDuplicate).toBe(false);
    });

    it("taken: findByEmail returns member → isDuplicate true", async () => {
        const repo = MockMemberRepository();
        vi.mocked(repo.findByEmail).mockResolvedValue({
            id: "member-1",
            email: "taken@example.com",
        } as any);

        const usecase = new EmailCheckUsecase(repo);
        const result = await usecase.execute("taken@example.com");

        expect(result.isDuplicate).toBe(true);
    });
});

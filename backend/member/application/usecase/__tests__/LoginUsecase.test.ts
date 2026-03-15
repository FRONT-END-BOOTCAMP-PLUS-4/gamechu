import { describe, it, expect, vi } from "vitest";
import { LoginUsecase } from "../LoginUsecase";
import { MockMemberRepository } from "@/tests/mocks/MockMemberRepository";
import { hash } from "bcryptjs";
import { Member } from "@/prisma/generated";

describe("LoginUsecase", () => {
    it("happy path: valid credentials returns LoginResponseDto", async () => {
        const repo = MockMemberRepository();
        const hashedPassword = await hash("correct-password", 10);
        vi.mocked(repo.findByEmail).mockResolvedValue({
            id: "member-1",
            email: "user@example.com",
            password: hashedPassword,
            nickname: "tester",
            birthDate: new Date("1990-01-01"),
            gender: "M",
            imageUrl: null,
            score: 0,
            lastAttendedDate: null,
            createdAt: new Date(),
        } as unknown as Member);

        const usecase = new LoginUsecase(repo);
        const result = await usecase.execute({
            email: "user@example.com",
            password: "correct-password",
        });

        expect(result).not.toBeNull();
        expect(result?.id).toBe("member-1");
    });

    it("error: invalid password returns null", async () => {
        const repo = MockMemberRepository();
        const hashedPassword = await hash("correct-password", 10);
        vi.mocked(repo.findByEmail).mockResolvedValue({
            id: "member-1",
            email: "user@example.com",
            password: hashedPassword,
            nickname: "tester",
            birthDate: new Date("1990-01-01"),
            gender: "M",
            imageUrl: null,
            score: 0,
            lastAttendedDate: null,
            createdAt: new Date(),
        } as unknown as Member);

        const usecase = new LoginUsecase(repo);
        const result = await usecase.execute({
            email: "user@example.com",
            password: "wrong-password",
        });

        expect(result).toBeNull();
    });

    it("error: member not found returns null", async () => {
        const repo = MockMemberRepository();
        vi.mocked(repo.findByEmail).mockResolvedValue(null);

        const usecase = new LoginUsecase(repo);
        const result = await usecase.execute({
            email: "notfound@example.com",
            password: "any-password",
        });

        expect(result).toBeNull();
    });
});

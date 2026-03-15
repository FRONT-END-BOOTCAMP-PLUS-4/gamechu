import { describe, it, expect, vi } from "vitest";
import { SignUpUsecase } from "../SignUpUsecase";
import { MockMemberRepository } from "@/tests/mocks/MockMemberRepository";
import { Member } from "@/prisma/generated";
import { SignUpRequestDto } from "../dto/SignUpRequestDto";

const mockMember = {
    id: "new-member-id",
    email: "new@example.com",
    nickname: "newuser",
    password: "hashed",
    birthDate: new Date("1990-01-01"),
    gender: "M",
    imageUrl: null,
    score: 0,
    lastAttendedDate: null,
    createdAt: new Date(),
} as unknown as Member;

describe("SignUpUsecase", () => {
    it("happy path: new email creates member", async () => {
        const repo = MockMemberRepository();
        vi.mocked(repo.findByEmail).mockResolvedValue(null);
        vi.mocked(repo.create).mockResolvedValue(mockMember);

        const usecase = new SignUpUsecase(repo);
        const result = await usecase.execute({
            email: "new@example.com",
            nickname: "newuser",
            password: "password123",
            birthDate: "1990-01-01",
            gender: "M",
        } as unknown as SignUpRequestDto);

        expect(repo.create).toHaveBeenCalledOnce();
        expect(result.email).toBe("new@example.com");
    });

    it("error: duplicate email throws", async () => {
        const repo = MockMemberRepository();
        vi.mocked(repo.findByEmail).mockResolvedValue(mockMember);

        const usecase = new SignUpUsecase(repo);
        await expect(
            usecase.execute({
                email: "new@example.com",
                nickname: "newuser",
                password: "password123",
                birthDate: "1990-01-01",
                gender: "M",
            } as unknown as SignUpRequestDto)
        ).rejects.toThrow("이미 존재하는 이메일입니다.");
    });
});

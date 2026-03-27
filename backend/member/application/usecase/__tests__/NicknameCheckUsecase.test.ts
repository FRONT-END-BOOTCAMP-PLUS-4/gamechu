import { describe, it, expect, vi } from "vitest";
import { NicknameCheckUsecase } from "../NicknameCheckUsecase";
import { MockMemberRepository } from "@/tests/mocks/MockMemberRepository";
import { Member } from "@/prisma/generated";

describe("NicknameCheckUsecase", () => {
    it("사용 가능: findByNickname이 null → isDuplicate false, foundMemberId null", async () => {
        const repo = MockMemberRepository();
        vi.mocked(repo.findByNickname).mockResolvedValue(null);

        const usecase = new NicknameCheckUsecase(repo);
        const result = await usecase.execute("newname");

        expect(result.isDuplicate).toBe(false);
        expect(result.foundMemberId).toBeNull();
    });

    it("중복: findByNickname이 member 반환 → isDuplicate true, foundMemberId 포함", async () => {
        const repo = MockMemberRepository();
        vi.mocked(repo.findByNickname).mockResolvedValue({
            id: "member-1",
            nickname: "taken",
        } as unknown as Member);

        const usecase = new NicknameCheckUsecase(repo);
        const result = await usecase.execute("taken");

        expect(result.isDuplicate).toBe(true);
        expect(result.foundMemberId).toBe("member-1");
    });

    it("8자 초과: execute 호출 시 Error throw", async () => {
        const repo = MockMemberRepository();
        const usecase = new NicknameCheckUsecase(repo);

        await expect(usecase.execute("123456789")).rejects.toThrow(
            "닉네임은 8자 이하여야 합니다."
        );
        expect(repo.findByNickname).not.toHaveBeenCalled();
    });
});

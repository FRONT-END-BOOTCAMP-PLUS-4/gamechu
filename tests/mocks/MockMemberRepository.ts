import { vi } from "vitest";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";

export const MockMemberRepository = (): MemberRepository => ({
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    updateProfile: vi.fn(),
    incrementScore: vi.fn(),
    findByNickname: vi.fn(),
    getLastAttendedDate: vi.fn(),
    updateLastAttendedDate: vi.fn(),
});

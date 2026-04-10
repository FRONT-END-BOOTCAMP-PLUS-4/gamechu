// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RecruitingArenaCard from "../RecruitingArenaCard";
import DebatingArenaCard from "../DebatingArenaCard";
import WaitingArenaCard from "../WaitingArenaCard";
import VotingArenaCard from "../VotingArenaCard";
import CompleteArenaCard from "../CompleteArenaCard";

const baseDate = new Date("2026-04-01T10:00:00");

describe("Arena cards render semantic links", () => {
    it("RecruitingArenaCard renders an anchor", () => {
        render(
            <RecruitingArenaCard
                id={1}
                creatorNickname="홍길동"
                creatorProfileImageUrl="/icons/default-profile.svg"
                creatorScore={500}
                title="PS5 vs Xbox 논쟁"
                description="어느 쪽이 더 나은가"
                startDate={baseDate}
            />
        );
        const link = screen.getByRole("link", {
            name: "PS5 vs Xbox 논쟁 아레나",
        });
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("/arenas/1");
    });

    it("DebatingArenaCard renders an anchor", () => {
        render(
            <DebatingArenaCard
                id={2}
                title="롤 vs 발로란트"
                creatorNickname="유저A"
                creatorScore={500}
                challengerNickname="유저B"
                challengerScore={600}
                debateEndDate={baseDate}
            />
        );
        const link = screen.getByRole("link", {
            name: "롤 vs 발로란트 아레나",
        });
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("/arenas/2");
    });

    it("WaitingArenaCard renders an anchor", () => {
        render(
            <WaitingArenaCard
                id={3}
                title="PC vs 콘솔"
                creatorNickname="유저C"
                creatorScore={500}
                challengerNickname="유저D"
                challengerScore={700}
                startDate={baseDate}
            />
        );
        const link = screen.getByRole("link", { name: "PC vs 콘솔 아레나" });
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("/arenas/3");
    });

    it("VotingArenaCard renders an anchor", () => {
        render(
            <VotingArenaCard
                id={4}
                title="젤다 vs 마리오"
                creatorNickname="유저E"
                creatorScore={500}
                challengerNickname="유저F"
                challengerScore={800}
                voteEndDate={baseDate}
                voteCount={10}
            />
        );
        const link = screen.getByRole("link", {
            name: "젤다 vs 마리오 아레나",
        });
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("/arenas/4");
    });

    it("CompleteArenaCard renders an anchor", () => {
        render(
            <CompleteArenaCard
                id={5}
                title="포켓몬 vs 디지몬"
                description="최고의 몬스터 게임"
                creatorNickname="유저G"
                creatorProfileImageUrl="/icons/default-profile.svg"
                creatorScore={500}
                challengerNickname="유저H"
                challengerProfileImageUrl="/icons/default-profile.svg"
                challengerScore={900}
                voteCount={20}
                leftCount={12}
                rightCount={8}
                leftPercent={60}
                rightPercent={40}
            />
        );
        const link = screen.getByRole("link", {
            name: "포켓몬 vs 디지몬 아레나",
        });
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("/arenas/5");
    });
});

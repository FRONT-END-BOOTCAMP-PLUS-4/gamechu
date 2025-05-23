"use client";

import ArenaIntroCard from "./components/ArenaIntroCard";
import VotingArenaSection from "./components/VotingArenaSection";
import WaitingArenaSection from "./components/WaitingArenaSection";
import RecruitingArenaSection from "./components/RecruitingArenaSection";
import DebatingArenaSection from "./components/DebatingArenaSection";
import CompleteArenaSection from "./components/CompleteArenaSection";

export default function ArenaPage() {
    return (
        <div className="min-h-screen bg-background-400 text-font-100 py-12 space-y-10">
            <ArenaIntroCard />
            <VotingArenaSection />
            <WaitingArenaSection />
            <RecruitingArenaSection />
            <DebatingArenaSection />
            <CompleteArenaSection />
        </div>
    );
}

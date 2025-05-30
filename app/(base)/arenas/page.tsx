"use client";

import ArenaIntroCard from "./components/ArenaIntroCard";
import CompleteArenaSection from "./components/CompleteArenaSection";
import DebatingArenaSection from "./components/DebatingArenaSection";
import RecruitingArenaSection from "./components/RecruitingArenaSection";
import VotingArenaSection from "./components/VotingArenaSection";
import WaitingArenaSection from "./components/WaitingArenaSection";

export default function ArenaPage() {
    return (
        <div className="min-h-screen bg-background-400 text-font-100 py-12 space-y-10">
            <ArenaIntroCard />
            <VotingArenaSection />
            <RecruitingArenaSection />
            <DebatingArenaSection />
            <CompleteArenaSection />
            <WaitingArenaSection />
        </div>
    );
}

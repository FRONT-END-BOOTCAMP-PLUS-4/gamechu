"use client";

import { useArenaList } from "@/hooks/useArenaList";
import ArenaIntroCard from "./components/ArenaIntroCard";
import CompleteArenaSection from "./components/CompleteArenaSection";
import DebatingArenaSection from "./components/DebatingArenaSection";
import RecruitingArenaSection from "./components/RecruitingArenaSection";
import VotingArenaSection from "./components/VotingArenaSection";
import WaitingArenaSection from "./components/WaitingArenaSection";
import { useArenaAutoStatus } from "@/hooks/useArenaAutoStatus";

export default function ArenaPage() {
    const { arenaList, setArenaList, loading, error } = useArenaList();
    useArenaAutoStatus({
        arenaList,
        onStatusUpdate: (id, newStatus) => {
            setArenaList((prev) =>
                prev.map((arena) =>
                    arena.id === id ? { ...arena, status: newStatus } : arena
                )
            );
        },
    });
    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>에러 발생: {error.message}</div>;
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

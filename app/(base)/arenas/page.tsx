"use client";

import { useSearchParams } from "next/navigation";
import ArenaPageHeader from "./components/ArenaPageHeader";
import CompleteArenaSection from "./components/CompleteArenaSection";
import DebatingArenaSection from "./components/DebatingArenaSection";
import RecruitingArenaSection from "./components/RecruitingArenaSection";
import VotingArenaSection from "./components/VotingArenaSection";
import WaitingArenaSection from "./components/WaitingArenaSection";
import SelectedArenaSection from "./components/SelectedArenaSection";
import Modals from "@/app/components/Modals";

export default function ArenaPage() {
    const searchParams = useSearchParams();
    const currentPage: number = Number(searchParams.get("currentPage") || "1");
    const status: number | null = Number(searchParams.get("status")) || null;

    return (
        <div className="min-h-screen bg-background-400 text-font-100 py-12 space-y-10">
            <ArenaPageHeader />
            <Modals />
            {(() => {
                switch (status) {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        return (
                            <SelectedArenaSection
                                status={status}
                                currentPage={currentPage}
                            />
                        );
                    default:
                        return (
                            <>
                                <VotingArenaSection />
                                <RecruitingArenaSection />
                                <DebatingArenaSection />
                                <CompleteArenaSection />
                                <WaitingArenaSection />
                            </>
                        );
                }
            })()}
        </div>
    );
}

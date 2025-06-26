"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import ArenaPageHeader from "./components/ArenaPageHeader";
import CompleteArenaSection from "./components/CompleteArenaSection";
import DebatingArenaSection from "./components/DebatingArenaSection";
import RecruitingArenaSection from "./components/RecruitingArenaSection";
import VotingArenaSection from "./components/VotingArenaSection";
import WaitingArenaSection from "./components/WaitingArenaSection";
import SelectedArenaSection from "./components/SelectedArenaSection";
import Modals from "@/app/components/Modals";
import { useLoadingStore } from "@/stores/loadingStore";

export default function ArenaPage() {
    const searchParams = useSearchParams();
    const currentPage: number = Number(searchParams.get("currentPage") || "1");
    const status: number | null = Number(searchParams.get("status")) || null;

    const { setLoading } = useLoadingStore();
    const [doneSections, setDoneSections] = useState(0);

    const totalSections = 5;

    useEffect(() => {
        setLoading(true);
        setDoneSections(0);
    }, [status, currentPage, setLoading]);

    useEffect(() => {
        if (!status && doneSections >= totalSections) {
            setLoading(false);
        }
    }, [doneSections, status, setLoading]);

    const handleSectionLoaded = useCallback(() => {
        setDoneSections((prev) => {
            if (prev >= totalSections) return prev; // 무한루프 방지
            return prev + 1;
        });
    }, [totalSections]);

    const handleSelectedLoaded = useCallback(() => {
        setLoading(false);
    }, [setLoading]);

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
                                onLoaded={handleSelectedLoaded}
                            />
                        );
                    default:
                        return (
                            <>
                                <VotingArenaSection
                                    onLoaded={handleSectionLoaded}
                                />
                                <RecruitingArenaSection
                                    onLoaded={handleSectionLoaded}
                                />
                                <DebatingArenaSection
                                    onLoaded={handleSectionLoaded}
                                />
                                <CompleteArenaSection
                                    onLoaded={handleSectionLoaded}
                                />
                                <WaitingArenaSection
                                    onLoaded={handleSectionLoaded}
                                />
                            </>
                        );
                }
            })()}
        </div>
    );
}

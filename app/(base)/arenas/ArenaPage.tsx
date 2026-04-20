"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Fragment } from "react";
import ArenaPageHeader from "./components/ArenaPageHeader";
import CompleteArenaSection from "./components/CompleteArenaSection";
import DebatingArenaSection from "./components/DebatingArenaSection";
import RecruitingArenaSection from "./components/RecruitingArenaSection";
import VotingArenaSection from "./components/VotingArenaSection";
import WaitingArenaSection from "./components/WaitingArenaSection";
import SelectedArenaSection from "./components/SelectedArenaSection";
import { useLoadingStore } from "@/stores/LoadingStore";

export default function ArenaPage() {
    const searchParams = useSearchParams();
    const currentPage: number = Number(searchParams.get("currentPage") || "1");
    const status: number | null = Number(searchParams.get("status")) || null;

    const { setLoading } = useLoadingStore();
    const [doneSections, setDoneSections] = useState(0);
    const [sectionKey, setSectionKey] = useState(0);

    // default case 섹션 수와 반드시 일치해야 함 (섹션 추가/삭제 시 함께 수정)
    const totalSections = 5;

    useEffect(() => {
        setLoading(true);
        setDoneSections(0);
        setSectionKey((prev) => prev + 1);
    }, [status, currentPage, setLoading]);

    useEffect(() => {
        if (!status && doneSections >= totalSections) {
            setLoading(false);
        }
    }, [doneSections, status, setLoading]);

    // 섹션 onLoaded가 모두 호출되지 않을 경우를 대비한 안전 타임아웃
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 10_000);
        return () => clearTimeout(timer);
    }, [sectionKey, setLoading]);

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
        <div className="min-h-screen space-y-10 bg-background-400 py-6 text-font-100 sm:py-12">
            <ArenaPageHeader />
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
                            <Fragment key={sectionKey}>
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
                            </Fragment>
                        );
                }
            })()}
        </div>
    );
}

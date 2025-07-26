"use client";

import ArenaDetailVote from "./components/ArenaDetailVote";
import ArenaDetailHeader from "./components/ArenaDetailHeader";
import ArenaDetailInfo from "./components/ArenaDetailInfo";
import ArenaDetailContainer from "./components/ArenaDetailContainer";
import React, { useEffect } from "react";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import useArenaStore from "@/stores/useArenaStore";
import { useArenaAutoStatusDetail } from "@/hooks/useArenaAutoStatusDetail";
import { useParams } from "next/navigation";
import { useLoadingStore } from "@/stores/loadingStore"; // ✅ 전역 로딩 스토어 가져오기

export default function ArenaDetailPage() {
    const setGlobalArenaData = useArenaStore((state) => state.setArenaData);
    const clearGlobalArenaData = useArenaStore((state) => state.clearArenaData);
    const { setLoading } = useLoadingStore(); // ✅ 전역 로딩 제어 함수
    const idParams = useParams().id;
    const arenaId = Number(idParams);

    useArenaAutoStatusDetail({
        onStatusUpdate: () => {},
    });

    useEffect(() => {
        const fetchArenaDetail = async () => {
            setLoading(true); // ✅ 로딩 시작
            try {
                const res = await fetch(`/api/arenas/${arenaId}`, {
                    method: "GET",
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch arena detail");
                }

                const data: ArenaDetailDto = await res.json();
                setGlobalArenaData(
                    new ArenaDetailDto(
                        data.id,
                        data.creatorId,
                        data.creatorName,
                        data.creatorScore,
                        data.challengerId,
                        data.challengerName,
                        data.challengerScore,
                        data.title,
                        data.description,
                        new Date(data.startDate),
                        new Date(data.endChatting),
                        new Date(data.endVote),
                        data.status,
                        data.voteCount,
                        data.leftCount,
                        data.rightCount,
                        data.leftPercent,
                        data.rightPercent
                    )
                );
            } catch (error) {
                console.error("Error fetching arena detail:", error);
            } finally {
                setLoading(false); // ✅ 로딩 종료
            }
        };

        fetchArenaDetail();

        return () => {
            clearGlobalArenaData();
        };
    }, [arenaId, setGlobalArenaData, clearGlobalArenaData, setLoading]);

    return (
        <div className="px-4 py-10 sm:px-8 md:px-12 lg:px-16">
            {/* 반응형 레이아웃: 기본 column, 큰 화면에서 row */}
            <div className="flex flex-col gap-8 lg:flex-row">
                {/* 왼쪽: 채팅, 투표 등 */}
                <div className="flex w-full flex-1 flex-col lg:flex-[3]">
                    <ArenaDetailHeader />

                    {/* 모바일일 때는 이 위치에 토론 정보 표시 */}
                    <div className="mt-6 block lg:hidden">
                        <ArenaDetailInfo />
                    </div>

                    <ArenaDetailContainer />
                    <ArenaDetailVote />
                </div>

                {/* 오른쪽: 정보 패널 (큰 화면에서만 보임) */}
                <div className="mt-16 hidden flex-[1] lg:block">
                    <ArenaDetailInfo />
                </div>
            </div>
        </div>
    );
}

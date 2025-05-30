"use client";

import ArenaVote from "./components/ArenaDetailVote";
import ArenaHeader from "./components/ArenaDetailHeader";
import React, { useEffect } from "react";
import ArenaInfo from "./components/ArenaDetailInfo";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import useArenaStore from "@/stores/useArenaStore";
import ArenaDetailContainer from "./components/ArenaDetailContainer";
import { useArenaAutoStatusDetail } from "@/hooks/useArenaAutoStatusDetail";
import { useParams } from "next/navigation";

export default function ArenaDetailPage() {
    const setGlobalArenaData = useArenaStore((state) => state.setArenaData);
    const clearGlobalArenaData = useArenaStore((state) => state.clearArenaData);
    const idParams = useParams().id;
    const arenaId = Number(idParams);
    useArenaAutoStatusDetail({
        onStatusUpdate: () => {},
    });
    useEffect(() => {
        const fetchArenaDetail = async () => {
            try {
                const res = await fetch(`/api/arenas/${arenaId}`, {
                    method: "GET",
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch arena detail");
                }

                const data: ArenaDetailDto = await res.json();
                setGlobalArenaData(data);
            } catch (error) {
                console.error("Error fetching arena detail:", error);
            }
        };

        fetchArenaDetail();
        return () => {
            clearGlobalArenaData();
        };
    }, [arenaId, setGlobalArenaData, clearGlobalArenaData]);
    return (
        <div>
            <div className="flex px-16 py-16 gap-8">
                {/* 왼쪽: 채팅, 투표 등 */}
                <div className="flex flex-col flex-[3]">
                    <ArenaHeader />
                    <ArenaDetailContainer />
                    <ArenaVote />
                </div>

                {/* 오른쪽: 정보 패널 */}
                <div className="flex-[1] mt-16">
                    <ArenaInfo />
                </div>
            </div>
        </div>
    );
}

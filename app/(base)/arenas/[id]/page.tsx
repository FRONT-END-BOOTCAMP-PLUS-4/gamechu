"use client";

import ArenaDetailVote from "./components/ArenaDetailVote";
import ArenaDetailHeader from "./components/ArenaDetailHeader";
import ArenaDetailInfo from "./components/ArenaDetailInfo";
import ArenaDetailContainer from "./components/ArenaDetailContainer";
import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys } from "@/lib/QueryKeys";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import useArenaStore from "@/stores/UseArenaStore";
import { useArenaAutoStatusDetail } from "@/hooks/useArenaAutoStatusDetail";
import { useParams } from "next/navigation";
import { useLoadingStore } from "@/stores/LoadingStore";

export default function ArenaDetailPage() {
    const setGlobalArenaData = useArenaStore((state) => state.setArenaData);
    const clearGlobalArenaData = useArenaStore((state) => state.clearArenaData);
    const { setLoading } = useLoadingStore();
    const idParams = useParams().id;
    const arenaId = Number(idParams);

    useArenaAutoStatusDetail({ onStatusUpdate: () => {} });

    const { data, isLoading, isError } = useQuery<ArenaDetailDto>({
        queryKey: queryKeys.arenaDetail(arenaId),
        queryFn: () => fetcher(`/api/arenas/${arenaId}`),
        enabled: !!arenaId,
    });

    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading, setLoading]);

    const arenaDto = useMemo(
        () =>
            data
                ? new ArenaDetailDto(
                      data.id,
                      data.creatorId,
                      data.creatorName,
                      data.creatorScore,
                      data.creatorImageUrl,
                      data.challengerId,
                      data.challengerName,
                      data.challengerScore,
                      data.challengerImageUrl,
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
                : null,
        [data]
    );

    useEffect(() => {
        if (arenaDto) setGlobalArenaData(arenaDto);
        return () => {
            clearGlobalArenaData();
        };
    }, [arenaDto, setGlobalArenaData, clearGlobalArenaData]);

    if (isError) {
        return (
            <div className="flex h-screen flex-col items-center justify-center overflow-hidden bg-background-400">
                존재하지 않는 투기장입니다.
            </div>
        );
    }

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
                    <div className="sticky top-6">
                        <ArenaDetailInfo />
                    </div>
                </div>
            </div>
        </div>
    );
}

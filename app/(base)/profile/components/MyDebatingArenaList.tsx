"use client";

import { useEffect, useState } from "react";
import useFetchArenas from "@/hooks/useArenas";
import DebatingArenaCard from "../../arenas/components/DebatingArenaCard";
import Pager from "@/app/components/Pager";
import { useLoadingStore } from "@/stores/loadingStore"; // ✅ 전역 로딩 스토어

export default function MyDebatingArenaList() {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const { setLoading } = useLoadingStore(); // ✅ 전역 로딩 제어 가져오기

    const { arenaListDto, loading, error } = useFetchArenas({
        currentPage,
        status: 3, // 토론 중인 투기장
        mine: true,
        pageSize,
    });

    // ✅ 전역 로딩 상태 동기화
    useEffect(() => {
        setLoading(loading);
    }, [loading, setLoading]);

    useEffect(() => {
        if (!loading && arenaListDto?.arenas) {
            console.log("✅ 진행 중 투기장 개수:", arenaListDto.arenas.length);
        }
    }, [loading, arenaListDto]);

    if (loading) {
        return <p className="text-sm text-font-200">로딩 중입니다...</p>;
    }

    if (error) {
        return (
            <p className="text-sm text-red-500">
                투기장 정보를 불러오는 데 실패했습니다.
            </p>
        );
    }

    if (!arenaListDto || arenaListDto.arenas.length === 0) {
        return (
            <p className="text-sm text-font-200">
                진행 중인 투기장이 없습니다.
            </p>
        );
    }

    return (
        <div className="flex w-full flex-col items-center gap-6">
            {/* ✅ 반응형 + 스크롤 */}
            <div className="w-full overflow-x-auto overflow-y-hidden">
                <div className="grid grid-cols-1 gap-6 break-keep px-1 min-[821px]:min-w-[640px] min-[821px]:grid-cols-2">
                    {arenaListDto.arenas.map((arena) => (
                        <DebatingArenaCard
                            key={arena.id}
                            id={arena.id}
                            title={arena.title}
                            creatorNickname={arena.creatorNickname}
                            creatorScore={arena.creatorScore}
                            challengerNickname={arena.challengerNickname}
                            challengerScore={arena.challengerScore}
                            debateEndDate={new Date(arena.debateEndDate)}
                            showBadgeIconOnly={true}
                        />
                    ))}
                </div>
            </div>

            {/* 페이지네이션 */}
            <Pager
                currentPage={arenaListDto.currentPage}
                endPage={arenaListDto.endPage}
                pages={arenaListDto.pages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}

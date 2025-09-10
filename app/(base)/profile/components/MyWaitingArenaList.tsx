"use client";

import { useEffect, useState } from "react";
import useFetchArenas from "@/hooks/useArenas";
import WaitingArenaCard from "../../arenas/components/WaitingArenaCard";
import Pager from "@/app/components/Pager";

export default function MyWaitingArenaList() {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const { arenaListDto, loading, error } = useFetchArenas({
        currentPage,
        status: 2, // 대기 중인 투기장
        mine: true,
        pageSize,
    });

    useEffect(() => {
        if (!loading && arenaListDto?.arenas) {
            console.log("✅ 대기 중 투기장 개수:", arenaListDto.arenas.length);
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
                대기 중인 투기장이 없습니다.
            </p>
        );
    }

    return (
        <div className="flex w-full flex-col items-center gap-6">
            <div className="w-full">
                <div className="grid grid-cols-1 gap-6 px-1 md:grid-cols-2">
                    {arenaListDto.arenas.map((arena) => (
                        <WaitingArenaCard
                            key={arena.id}
                            id={arena.id}
                            title={arena.title}
                            creatorNickname={arena.creatorNickname}
                            creatorScore={arena.creatorScore}
                            challengerNickname={arena.challengerNickname}
                            challengerScore={arena.challengerScore}
                            startDate={new Date(arena.startDate)}
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

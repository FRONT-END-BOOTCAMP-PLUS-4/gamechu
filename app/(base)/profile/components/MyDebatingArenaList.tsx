"use client";

import { useEffect, useState } from "react";
import useFetchArenas from "@/hooks/useArenas";
import DebatingArenaCard from "../../arenas/components/DebatingArenaCard";
import Pager from "@/app/components/Pager";
import { useLoadingStore } from "@/stores/loadingStore"; // ✅ 추가

export default function MyDebatingArenaList() {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const { setLoading } = useLoadingStore(); // ✅ 전역 로딩 제어 가져오기

    const {
        arenaListDto,
        loading,
        error,
    } = useFetchArenas({
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
        return <p className="text-font-200 text-sm">로딩 중입니다...</p>;
    }

    if (error) {
        return (
            <p className="text-red-500 text-sm">
                투기장 정보를 불러오는 데 실패했습니다.
            </p>
        );
    }

    if (!arenaListDto || arenaListDto.arenas.length === 0) {
        return (
            <p className="text-font-200 text-sm">
                진행 중인 투기장이 없습니다.
            </p>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            {/* 투기장 카드 목록 */}
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
                />
            ))}

            {/* 페이지네이션 */}
            <Pager
                currentPage={arenaListDto.currentPage}
                endPage={arenaListDto.endPage}
                pages={arenaListDto.pages}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
}

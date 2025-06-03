"use client";

import { useEffect, useState } from "react";
import useFetchArenas from "@/hooks/useArenas";
import RecruitingArenaCard from "../../arenas/components/RecruitingArenaCard";
import Pager from "@/app/components/Pager";

export default function MyRecruitingArenaList() {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const {
        arenaListDto,
        loading,
        error,
    } = useFetchArenas({
        currentPage,
        status: 1, // 모집 중
        mine: true, // 내가 생성/참여한 것만
        pageSize,
    });

    useEffect(() => {
        if (!loading && arenaListDto?.arenas) {
            console.log("✅ 모집 중 투기장 개수:", arenaListDto.arenas.length);
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
            <p className="text-font-200 text-sm">모집 중인 투기장이 없습니다.</p>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            {/* 모집 중 투기장 카드 리스트 */}
            {arenaListDto.arenas.map((arena) => (
                <RecruitingArenaCard
                    key={arena.id}
                    {...arena}
                    startDate={new Date(arena.startDate)}
                />
            ))}

            {/* 페이저 삽입 */}
            <Pager
                currentPage={arenaListDto.currentPage}
                endPage={arenaListDto.endPage}
                pages={arenaListDto.pages}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
}

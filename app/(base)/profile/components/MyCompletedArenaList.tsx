"use client";

import { useEffect, useState } from "react";
import useArenas from "@/hooks/useArenas";
import CompleteArenaCard from "@/app/(base)/arenas/components/CompleteArenaCard";
import Pager from "@/app/components/Pager";

export default function MyCompletedArenaList() {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const status = 5; // 종료된 투기장

    // ✅ API 호출 (공용 섹션과 동일한 방식)
    const { arenaListDto, loading, error } = useArenas({
        currentPage,
        status,
        mine: true, // 내가 참여/생성한 투기장만
        pageSize,
    });

    useEffect(() => {
        if (!loading && arenaListDto?.arenas) {
            console.log("✅ 완료된 투기장 개수:", arenaListDto.arenas.length);
        }
    }, [loading, arenaListDto]);

    // ✅ 로딩 처리
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
                참여한 종료된 투기장이 없습니다.
            </p>
        );
    }

    // ✅ 출력
    return (
        <div className="flex w-full flex-col items-center gap-6">
            {arenaListDto.arenas.map((arena) => (
                <CompleteArenaCard key={arena.id} {...arena} />
            ))}

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

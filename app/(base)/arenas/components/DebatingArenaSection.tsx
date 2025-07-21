"use client";

import useArenas from "@/hooks/useArenas";
import ArenaSectionHeader from "./ArenaSectionHeader";
import DebatingArenaCard from "./DebatingArenaCard";
import { useArenaAutoStatus } from "@/hooks/useArenaAutoStatus";
import { GetSectionTitle } from "@/utils/GetSectionTitle";
import { useEffect } from "react";

interface Props {
    onLoaded?: () => void; // ✅ 상위로 로딩 완료 알림
}

export default function DebatingArenaSection({ onLoaded }: Props) {
    const status: number = 3;

    const { arenaListDto, loading, error } = useArenas({
        status,
        currentPage: 1,
        mine: false,
        pageSize: 3,
    });

    useArenaAutoStatus({
        arenaList: arenaListDto?.arenas || [],
        onStatusUpdate: (arenaId, newStatus) => {
            console.log(
                `Arena ${arenaId}가 상태 ${newStatus}로 전이되었습니다.`
            );
        },
    });

    // ✅ 로딩이 끝나면 onLoaded 콜백 실행
    useEffect(() => {
        if (!loading) {
            onLoaded?.();
        }
    }, [loading, onLoaded]);

    if (loading) {
        return (
            <div className="col-span-3 text-center text-gray-400">
                로딩중...
            </div>
        );
    }

    if (error) {
        return (
            <div className="col-span-3 text-center text-red-500">
                투기장 정보를 불러오는 데 실패했습니다. 나중에 다시
                시도해주세요.
            </div>
        );
    }

    return (
        <div>
            <ArenaSectionHeader status={3} />
            <div className="mt-4 grid grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
                {arenaListDto?.arenas.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500">
                        현재 {GetSectionTitle(status)}이 없습니다.
                    </div>
                ) : (
                    arenaListDto?.arenas.map((arena) => (
                        <DebatingArenaCard
                            key={arena.id}
                            {...arena}
                            debateEndDate={new Date(arena.debateEndDate)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

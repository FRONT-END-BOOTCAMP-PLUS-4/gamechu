"use client";

import { useArenaAutoStatus } from "@/hooks/useArenaAutoStatus";
import { GetSectionTitle } from "@/utils/GetSectionTitle";
import ArenaSectionHeader from "./ArenaSectionHeader";
import RecruitingArenaCard from "./RecruitingArenaCard";
import useArenas from "@/hooks/useArenas";
import { useEffect } from "react";

interface Props {
    onLoaded?: () => void; // ✅ 로딩 완료 시 호출되는 콜백
}

export default function RecruitingArenaSection({ onLoaded }: Props) {
    const status: number = 1;

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

    // ✅ 로딩이 끝났을 때 onLoaded 호출
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
                투기장 정보를 불러오는 데 실패했습니다. 나중에 다시 시도해주세요.
            </div>
        );
    }

    return (
        <div>
            <ArenaSectionHeader status={status} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 px-6">
                {arenaListDto?.arenas.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500">
                        현재 {GetSectionTitle(status)}이 없습니다.
                    </div>
                ) : (
                    arenaListDto!.arenas.map((arena) => (
                        <RecruitingArenaCard
                            key={arena.id}
                            {...arena}
                            startDate={new Date(arena.startDate)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

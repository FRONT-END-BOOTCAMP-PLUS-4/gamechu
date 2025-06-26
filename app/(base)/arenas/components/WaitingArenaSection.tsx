"use client";

import useArenas from "@/hooks/useArenas";
import ArenaSectionHeader from "./ArenaSectionHeader";
import WaitingArenaCard from "./WaitingArenaCard";
import { useArenaAutoStatus } from "@/hooks/useArenaAutoStatus";
import { GetSectionTitle } from "@/utils/GetSectionTitle";
import { useEffect } from "react";

interface Props {
    onLoaded?: () => void; // ✅ 상위에서 로딩 완료 알림을 받을 콜백
}

export default function WaitingArenaSection({ onLoaded }: Props) {
    const status: number = 2;

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

    // ✅ 데이터 패칭 완료되면 상위에 알림
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
            <ArenaSectionHeader status={2} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 px-6">
                {arenaListDto?.arenas.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500">
                        현재 {GetSectionTitle(status)}이 없습니다.
                    </div>
                ) : (
                    arenaListDto!.arenas.map((arena) => (
                        <WaitingArenaCard
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

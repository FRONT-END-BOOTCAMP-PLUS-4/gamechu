"use client";

import useArenas from "@/hooks/useArenas";
import ArenaSectionHeader from "./ArenaSectionHeader";
import CompleteArenaCard from "./CompleteArenaCard";
import { useEffect } from "react";
import { useArenaAutoStatus } from "@/hooks/useArenaAutoStatus";
import { GetSectionTitle } from "@/utils/GetSectionTitle";

interface Props {
    onLoaded?: () => void; // ✅ 상위 ArenaPage로 로딩 완료 알림
}

export default function CompleteArenaSection({ onLoaded }: Props) {
    const status: number = 5;
    const { arenaListDto, loading, error } = useArenas({
        status,
        currentPage: 1,
        mine: false,
        pageSize: 2,
    });
    useArenaAutoStatus({
        arenaList: arenaListDto?.arenas || [],
        onStatusUpdate: (arenaId, newStatus) => {
            console.log(
                `Arena ${arenaId}가 상태 ${newStatus}로 전이되었습니다.`
            );
        },
    });

    // ✅ 로딩 완료되면 상위로 알림
    useEffect(() => {
        if (!loading) {
            onLoaded?.();
        }
    }, [loading, onLoaded]);

    if (loading) {
        return (
            // TODO: 로딩 컴포넌트 출력으로 변경하기
            <div className="col-span-3 text-center text-gray-400">
                로딩중...
            </div>
        );
    }

    if (error) {
        return (
            // TODO: 에러 컴포넌트 출력으로 변경하기
            <div className="col-span-3 text-center text-red-500">
                투기장 정보를 불러오는 데 실패했습니다. 나중에 다시
                시도해주세요.
            </div>
        );
    }
    return (
        <div>
            <ArenaSectionHeader status={status} />
            <div className="mt-4 grid grid-cols-1 justify-center gap-6 px-4 sm:sm:[grid-template-columns:repeat(auto-fill,minmax(500px,1fr))]">
                {" "}
                {arenaListDto?.arenas.length === 0 ? (
                    <div className="w-full text-left text-gray-500">
                        {GetSectionTitle(status)}이 없습니다.
                    </div>
                ) : (
                    arenaListDto?.arenas.map((arena) => (
                        <CompleteArenaCard key={arena.id} {...arena} />
                    ))
                )}
            </div>
        </div>
    );
}

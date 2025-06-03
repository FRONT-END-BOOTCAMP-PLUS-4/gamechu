"use client";

import useArenas from "@/hooks/useArenas";
import ArenaSectionHeader from "./ArenaSectionHeader";
import CompleteArenaCard from "./CompleteArenaCard";
import useVoteList from "@/hooks/useVoteList";
import { useEffect, useRef, useState } from "react";
import { useArenaAutoStatus } from "@/hooks/useArenaAutoStatus";
import { GetSectionTitle } from "@/utils/GetSectionTitle";

export default function CompleteArenaSection() {
    const status: number = 5;

    const {
        arenaListDto,
        loading: arenaLoading,
        error: arenaError,
    } = useArenas({
        status,
        currentPage: 1,
        mine: false,
        pageSize: 2,
    });

    useArenaAutoStatus({
        arenaList: arenaListDto?.arenas || [],
        onStatusUpdate: (arenaId, newStatus) => {
            // 선택사항: 콘솔 로깅 또는 새로고침 로직 삽입 가능
            console.log(
                `Arena ${arenaId}가 상태 ${newStatus}로 전이되었습니다.`
            );
            // 필요 시 리패칭 로직 넣을 수 있음
        },
    });
    const [arenaIdsToFetch, setArenaIdsToFetch] = useState<number[]>([]);
    const fetchedIdsRef = useRef<string>(""); // API 중복 호출 방지용

    useEffect(() => {
        if (!arenaListDto?.arenas) return;

        const ids = arenaListDto.arenas.map((arena) => arena.id).sort();
        const idsString = ids.join(",");

        if (fetchedIdsRef.current === idsString) return;

        setArenaIdsToFetch(ids); // 필요한 ID 목록 업데이트
        fetchedIdsRef.current = idsString; // 기록 갱신
    }, [arenaListDto?.arenas]);

    const {
        voteResult,
        loading: voteLoading,
        error: voteError,
    } = useVoteList({
        arenaIds: arenaIdsToFetch,
    });

    if (arenaListDto && arenaListDto.arenas) {
        arenaListDto.arenas.forEach((arena) => {
            const vote = voteResult.find((vote) => vote.arenaId === arena.id);
            if (vote) {
                arena.voteCount = vote.total;
                arena.leftPercent = vote.leftPercent;
            } else {
                arena.voteCount = 0;
            }
        });
    }

    // TODO: use Loading Page
    if (arenaLoading || voteLoading) {
        return (
            <div className="col-span-3 text-center text-gray-400">
                로딩중...
            </div>
        );
    }

    // TODO: use Error Page
    if (arenaError || voteError) {
        return (
            <div className="col-span-3 text-center text-red-500">
                투기장 정보를 불러오는 데 실패했습니다. 나중에 다시
                시도해주세요.
            </div>
        );
    }

    return (
        <div>
            <ArenaSectionHeader status={5} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 px-6">
                {arenaListDto?.arenas.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500">
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

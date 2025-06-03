"use client";

import { GetSectionTitle } from "@/utils/GetSectionTitle";
import ArenaSectionHeader from "./ArenaSectionHeader";
import VotingArenaCard from "./VotingArenaCard";
import useArenas from "@/hooks/useArenas";
import RecruitingArenaCard from "./RecruitingArenaCard";
import WaitingArenaCard from "./WaitingArenaCard";
import DebatingArenaCard from "./DebatingArenaCard";
import CompleteArenaCard from "./CompleteArenaCard";
import Pager from "@/app/components/Pager";
import { useRouter } from "next/navigation";
import useVoteList from "@/hooks/useVoteList";
import { useEffect, useRef, useState } from "react";

type SelectedArenaSectionProps = {
    status: number;
    currentPage: number;
};

export default function SelectedArenaSection(props: SelectedArenaSectionProps) {
    const {
        arenaListDto,
        loading: arenaLoading,
        error: arenaError,
    } = useArenas({
        status: props.status,
        currentPage: props.currentPage,
        mine: false,
        pageSize: [1, 5].includes(props.status) ? 6 : 9,
    });
    const pages: number[] = arenaListDto?.pages || [];
    const endPage: number = arenaListDto?.endPage || 1;

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

    const router = useRouter();
    const handleQueryChange = (newPage: number, newStatus: number | null) => {
        router.push(`?currentPage=${newPage}&status=${newStatus}`);
    };

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
            <ArenaSectionHeader status={props.status} />
            <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                    [1, 5].includes(props.status) ? "" : "lg:grid-cols-3"
                } gap-6 mt-4 px-6`}
            >
                {arenaListDto?.arenas.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500">
                        현재 {GetSectionTitle(props.status)}이 없습니다.
                    </div>
                ) : (
                    arenaListDto!.arenas.map((arena) => {
                        switch (props.status) {
                            case 1:
                                return (
                                    <RecruitingArenaCard
                                        key={arena.id}
                                        {...arena}
                                        startDate={new Date(arena.startDate)}
                                    />
                                );
                            case 2:
                                return (
                                    <WaitingArenaCard
                                        key={arena.id}
                                        {...arena}
                                        startDate={new Date(arena.startDate)}
                                    />
                                );
                            case 3:
                                return (
                                    <DebatingArenaCard
                                        key={arena.id}
                                        {...arena}
                                        debateEndDate={
                                            new Date(arena.debateEndDate)
                                        }
                                    />
                                );
                            case 4:
                                return (
                                    <VotingArenaCard
                                        key={arena.id}
                                        {...arena}
                                        voteEndDate={
                                            new Date(arena.voteEndDate)
                                        }
                                    />
                                );
                            case 5:
                                return (
                                    <CompleteArenaCard
                                        key={arena.id}
                                        {...arena}
                                    />
                                );
                            default:
                                return null;
                        }
                    })
                )}
            </div>

            {/* ✅ Pager는 전체 레이아웃 기준으로 중앙 정렬 */}
            {arenaListDto?.arenas.length !== 0 && (
                <div className="w-full flex justify-center mt-12">
                    <Pager
                        currentPage={props.currentPage}
                        pages={pages}
                        endPage={endPage}
                        onPageChange={(newPage: number) => {
                            handleQueryChange(newPage, props.status);
                        }}
                    />
                </div>
            )}
        </div>
    );
}
